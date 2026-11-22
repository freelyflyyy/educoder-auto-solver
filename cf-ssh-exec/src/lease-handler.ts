/**
 * @fileoverview Handles POST /v1/ssh/lease requests to claim execution tokens using a claim code.
 */

import { bearerToken, readJsonObject, type Reply } from './http';
import { checkIngress } from './ingress';
import { readTargetAddress, targetKey } from './target-address';

type LeaseBindings = Pick<Env, 'SSH_RATE_LIMITER' | 'SSH_TARGET_REGISTRY'>;

/**
 * Handles incoming lease claims for targets using a one-time or shared claim code.
 */
export async function handleLease(request: Request, env: LeaseBindings, reply: Reply): Promise<Response> {
	const claimCode = bearerToken(request);
	if (!claimCode) return reply.unauthorized();

	const rejected = await checkIngress(request, env.SSH_RATE_LIMITER, reply, 'lease');
	if (rejected) return rejected;

	const body = await readJsonObject(request);
	if (!body.ok) return reply.error(body.status, body.code);
	const address = readTargetAddress(body.value);
	const key = address && targetKey(address);
	if (!key) return reply.error(400, 'INVALID_TARGET');

	try {
		const lease = await env.SSH_TARGET_REGISTRY.getByName(key).claim(claimCode);
		if (!lease) return reply.error(403, 'LEASE_NOT_ALLOWED');
		return reply.json(200, { executionToken: lease.executionToken, expiresAt: lease.expiresAt });
	} catch {
		return reply.error(503, 'TARGET_REGISTRY_UNAVAILABLE');
	}
}
