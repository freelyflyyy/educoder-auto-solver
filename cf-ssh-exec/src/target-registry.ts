/**
 * @fileoverview SQLite-backed Durable Object managing dynamic SSH target registrations and concurrency locks.
 *
 * Implements token issuance, time-window rate limiting, mutual-exclusion reservation
 * for active executions, and automatic TTL expiration via Durable Object Alarms.
 */

import { DurableObject } from 'cloudflare:workers';
import { MAX_EXECUTIONS_PER_TOKEN, MAX_EXECUTIONS_PER_WINDOW, RESERVATION_GRACE_MS, TARGET_WINDOW_MS } from './access-policy';

type Registration = {
	registrationId: string;
	hostKeyFingerprint: string;
	expiresAt: number;
	tokenDigest?: ArrayBuffer;
	claimDigest?: ArrayBuffer;
	executionCount?: number;
	windowStartedAt: number;
	requestCount: number;
};

type Reservation = { id: string; expiresAt: number };
type TargetRecord = { registration?: Registration; active?: Reservation };

/**
 * Admission decision returned by the target registry.
 */
export type Admission =
	| { kind: 'denied' }
	| { kind: 'token_exhausted' }
	| { kind: 'busy' | 'rate_limited'; retryAfter: number }
	| { kind: 'allowed'; hostKeyFingerprint: string; reservation: Reservation };

/**
 * Computes the SHA-256 cryptographic digest of a token string for safe storage and comparison.
 */
function tokenDigest(token: string): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
}

function randomToken(): string {
	return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculates remaining seconds until a deadline for Retry-After HTTP headers.
 */
function retryAfter(until: number, now: number): number {
	return Math.max(1, Math.ceil((until - now) / 1000));
}

/**
 * Durable Object maintaining registration state, quota, and execution concurrency for a specific target.
 */
export class SshTargetRegistry extends DurableObject {
	/**
	 * Evaluates execution admission for an incoming request against token validity, quota, and concurrency locks.
	 */
	async acquire(token: string, timeoutMs: number): Promise<Admission> {
		const digest = await tokenDigest(token);
		return this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			const registration = target?.registration;
			const now = Date.now();

			// Verify registration existence, expiry, and execution token hash match
			if (!registration?.tokenDigest || registration.expiresAt <= now || !crypto.subtle.timingSafeEqual(digest, registration.tokenDigest)) {
				return { kind: 'denied' };
			}
			// Earlier issued tokens have no reliable lifetime usage count.
			if (registration.executionCount === undefined) return { kind: 'denied' };
			if (registration.executionCount >= MAX_EXECUTIONS_PER_TOKEN) return { kind: 'token_exhausted' };

			// Concurrency control: only one concurrent SSH execution is permitted per target
			const active = target?.active;
			if (active && active.expiresAt > now) {
				return { kind: 'busy', retryAfter: retryAfter(active.expiresAt, now) };
			}

			if (registration.windowStartedAt + TARGET_WINDOW_MS <= now) {
				registration.windowStartedAt = now;
				registration.requestCount = 0;
			}
			if (registration.requestCount >= MAX_EXECUTIONS_PER_WINDOW) {
				return { kind: 'rate_limited', retryAfter: retryAfter(registration.windowStartedAt + TARGET_WINDOW_MS, now) };
			}

			// Allocate execution reservation with a safety grace buffer to accommodate socket shutdown
			const reservation = { id: crypto.randomUUID(), expiresAt: now + timeoutMs + RESERVATION_GRACE_MS };
			registration.requestCount++;
			registration.executionCount++;
			await storage.put('target', { registration, active: reservation });
			return { kind: 'allowed', hostKeyFingerprint: registration.hostKeyFingerprint, reservation };
		});
	}

	/**
	 * Releases an active execution reservation when the SSH session terminates.
	 */
	async release(reservationId: string): Promise<void> {
		await this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			if (target?.active?.id !== reservationId) return;
			await this.save(storage, { registration: target.registration });
		});
	}

	/**
	 * Dynamically registers or replaces an SSH target with an issued execution token and host key fingerprint.
	 */
	async register(hostKeyFingerprint: string, ttlSeconds: number, delivery: 'direct' | 'claim' = 'direct') {
		const credential = randomToken();
		const digest = await tokenDigest(credential);
		const now = Date.now();
		const registration: Registration = {
			registrationId: crypto.randomUUID(),
			hostKeyFingerprint,
			expiresAt: now + ttlSeconds * 1000,
			...(delivery === 'claim' ? { claimDigest: digest } : { tokenDigest: digest, executionCount: 0 }),
			windowStartedAt: now,
			requestCount: 0,
		};
		await this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			await this.save(storage, { registration, active: target?.active });
		});
		return { credential, registrationId: registration.registrationId, expiresAt: registration.expiresAt };
	}

	/** Exchanges a provisioned claim once, without changing the registration's expiry or fingerprint. */
	async claim(claimCode: string) {
		const claimDigest = await tokenDigest(claimCode);
		const executionToken = randomToken();
		const digest = await tokenDigest(executionToken);

		return this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			const registration = target?.registration;
			if (!registration?.claimDigest || registration.expiresAt <= Date.now() ||
				!crypto.subtle.timingSafeEqual(claimDigest, registration.claimDigest)) {
				return null;
			}

			delete registration.claimDigest;
			registration.tokenDigest = digest;
			registration.executionCount = 0;
			await storage.put('target', { registration, active: target?.active });
			return { executionToken, expiresAt: registration.expiresAt };
		});
	}

	/**
	 * Revokes an existing target registration by matching its unique registrationId.
	 */
	async revoke(registrationId: string): Promise<boolean> {
		return this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			if (target?.registration?.registrationId !== registrationId) return false;
			await this.save(storage, { active: target.active });
			return true;
		});
	}

	/**
	 * Scheduled alarm callback executed by the Durable Objects runtime to purge expired state.
	 */
	async alarm(): Promise<void> {
		await this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			if (target) await this.save(storage, target);
		});
	}

	/**
	 * Persists target records and adjusts the next scheduled alarm based on earliest expiration.
	 */
	private async save(storage: DurableObjectTransaction, target: TargetRecord) {
		const now = Date.now();
		const registration = target.registration && target.registration.expiresAt > now ? target.registration : undefined;
		const active = target.active && target.active.expiresAt > now ? target.active : undefined;
		const expiry = registration?.expiresAt ?? active?.expiresAt;

		if (expiry === undefined) {
			await storage.delete('target');
			await storage.deleteAlarm();
			return;
		}

		await storage.put('target', { registration, active });
		if (await storage.getAlarm() !== expiry) {
			await storage.setAlarm(expiry);
		}
	}
}
