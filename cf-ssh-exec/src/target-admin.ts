/**
 * @fileoverview Administrative handler for dynamic SSH target registration and revocation.
 *
 * Exposes PUT /v1/ssh/targets to register temporary SSH target records and issue execution tokens,
 * and DELETE /v1/ssh/targets to immediately invalidate active target registrations.
 */

import { bearerToken, readJsonObject, type Reply } from './http';
import { readTargetAddress, targetKey } from './target-address';
import { MAX_TARGET_TTL_SECONDS } from './target-registry';

type AdminBindings = Pick<Env, 'SSH_TARGET_ADMIN_TOKEN' | 'SSH_TARGET_REGISTRY'>;
const encoder = new TextEncoder();

/**
 * Handles administrative requests for registering and revoking SSH targets.
 *
 * @param request Incoming HTTP request.
 * @param env Environment bindings including administrative secret and target registry.
 * @param reply Standardized response helper.
 * @returns JSON response with registration credentials or operation status.
 */
export async function handleTargetAdmin(request: Request, env: AdminBindings, reply: Reply): Promise<Response> {
	const token = bearerToken(request);
	if (!token) return reply.unauthorized();

	// Verify server-side administrator token configuration
	const adminToken = env.SSH_TARGET_ADMIN_TOKEN;
	if (typeof adminToken !== 'string' || !/^[0-9a-f]{64}$/.test(adminToken)) {
		return reply.error(503, 'AUTH_NOT_CONFIGURED');
	}

	// Constant-time comparison to prevent side-channel timing attacks against the admin token
	if (!crypto.subtle.timingSafeEqual(encoder.encode(token), encoder.encode(adminToken))) {
		return reply.unauthorized();
	}

	const body = await readJsonObject(request);
	if (!body.ok) return reply.error(body.status, body.code);

	const address = readTargetAddress(body.value);
	const key = address && targetKey(address);
	if (!key) return reply.error(400, 'INVALID_TARGET');

	try {
		// DELETE /v1/ssh/targets: revoke target registration by registrationId
		if (request.method === 'DELETE') {
			const { registrationId } = body.value;
			if (typeof registrationId !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(registrationId)) {
				return reply.error(400, 'INVALID_REGISTRATION_ID');
			}
			const removed = await env.SSH_TARGET_REGISTRY.getByName(key).revoke(registrationId);
			return reply.json(200, { removed });
		}

		// PUT /v1/ssh/targets: register target with host key fingerprint and TTL
		const { hostKeyFingerprint, ttlSeconds = MAX_TARGET_TTL_SECONDS } = body.value;
		if (typeof hostKeyFingerprint !== 'string' || !/^SHA256:[A-Za-z0-9+/]{43}$/.test(hostKeyFingerprint)) {
			return reply.error(400, 'INVALID_HOST_KEY_FINGERPRINT');
		}
		if (typeof ttlSeconds !== 'number' || !Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > MAX_TARGET_TTL_SECONDS) {
			return reply.error(400, 'INVALID_TARGET_TTL');
		}

		const { executionToken, registrationId, expiresAt } = await env.SSH_TARGET_REGISTRY.getByName(key).register(hostKeyFingerprint, ttlSeconds);
		return reply.json(200, { executionToken, registrationId, expiresAt });
	} catch {
		return reply.error(503, 'TARGET_REGISTRY_UNAVAILABLE');
	}
}
