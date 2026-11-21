/**
 * @fileoverview SQLite-backed Durable Object managing dynamic SSH target registrations and concurrency locks.
 *
 * Implements token issuance, time-window rate limiting, mutual-exclusion reservation
 * for active executions, and automatic TTL expiration via Durable Object Alarms.
 */

import { DurableObject } from 'cloudflare:workers';

/**
 * Maximum permissible target registration lifetime: 30 minutes (1800 seconds).
 */
export const MAX_TARGET_TTL_SECONDS = 30 * 60;

type Registration = {
	registrationId: string;
	hostKeyFingerprint: string;
	expiresAt: number;
	tokenDigest: ArrayBuffer;
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
	| { kind: 'busy' | 'rate_limited'; retryAfter: number }
	| { kind: 'allowed'; hostKeyFingerprint: string; reservation: Reservation };

const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 10;
const RESERVATION_GRACE_MS = 5_000;

/**
 * Computes the SHA-256 cryptographic digest of a token string for safe storage and comparison.
 */
function tokenDigest(token: string): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
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
			if (!registration || registration.expiresAt <= now || !crypto.subtle.timingSafeEqual(digest, registration.tokenDigest)) {
				return { kind: 'denied' };
			}

			// Concurrency control: only one concurrent SSH execution is permitted per target
			const active = target?.active;
			if (active && active.expiresAt > now) {
				return { kind: 'busy', retryAfter: retryAfter(active.expiresAt, now) };
			}

			// Rolling window rate-limiting: maximum 10 executions per 60-second window
			if (registration.windowStartedAt + WINDOW_MS <= now) {
				registration.windowStartedAt = now;
				registration.requestCount = 0;
			}
			if (registration.requestCount >= REQUESTS_PER_WINDOW) {
				return { kind: 'rate_limited', retryAfter: retryAfter(registration.windowStartedAt + WINDOW_MS, now) };
			}

			// Allocate execution reservation with a safety grace buffer to accommodate socket shutdown
			const reservation = { id: crypto.randomUUID(), expiresAt: now + timeoutMs + RESERVATION_GRACE_MS };
			registration.requestCount++;
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
	async register(hostKeyFingerprint: string, ttlSeconds: number) {
		const executionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('');
		const digest = await tokenDigest(executionToken);
		const now = Date.now();
		const registration: Registration = {
			registrationId: crypto.randomUUID(),
			hostKeyFingerprint,
			expiresAt: now + ttlSeconds * 1000,
			tokenDigest: digest,
			windowStartedAt: now,
			requestCount: 0,
		};
		await this.ctx.storage.transaction(async (storage) => {
			const target = await storage.get<TargetRecord>('target');
			await this.save(storage, { registration, active: target?.active });
		});
		return { executionToken, registrationId: registration.registrationId, expiresAt: registration.expiresAt };
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
