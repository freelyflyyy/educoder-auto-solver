/**
 * @fileoverview Main execution handler orchestrating rate-limiting, admission, and SSH execution.
 *
 * Implements ingress rate limiting per client IP, acquires concurrency reservations
 * from the target registry Durable Object, executes SSH commands, maps domain errors to HTTP statuses,
 * and asynchronously releases reservations via execution context waitUntil.
 */

import { parseExecRequest } from './exec-request';
import { bearerToken, type Reply } from './http';
import { checkIngress } from './ingress';
import { executeSsh } from './ssh-exec';
import { targetKey } from './target-address';

type ExecBindings = Pick<Env, 'SSH_RATE_LIMITER' | 'SSH_TARGET_REGISTRY'>;

const SSH_ERRORS = {
	timeout: [504, 'SSH_TIMEOUT'],
	cancelled: [499, 'REQUEST_CANCELLED'],
	auth_failed: [502, 'SSH_AUTH_FAILED'],
	connection_failed: [502, 'SSH_CONNECTION_FAILED'],
	exec_failed: [502, 'SSH_EXEC_FAILED'],
	output_limit: [502, 'OUTPUT_LIMIT_EXCEEDED'],
} as const;

/**
 * Handles incoming POST /v1/ssh/exec requests.
 *
 * @param request Incoming HTTP request.
 * @param env Environment bindings including rate-limiter and Durable Object registry.
 * @param reply Standardized response helper.
 * @param ctx ExecutionContext for scheduling asynchronous background tasks.
 * @returns JSON response with command output, execution metrics, or mapped error.
 */
export async function handleExec(request: Request, env: ExecBindings, reply: Reply, ctx: ExecutionContext): Promise<Response> {
	const token = bearerToken(request);
	if (!token) return reply.unauthorized();

	const rejected = await checkIngress(request, env.SSH_RATE_LIMITER, reply, 'ingress');
	if (rejected) return rejected;

	const parsed = await parseExecRequest(request);
	if (!parsed.ok) return reply.error(parsed.status, parsed.code);
	const key = targetKey(parsed.value);
	if (!key) return reply.error(403, 'TARGET_NOT_ALLOWED');

	const { host, port, username, password, command, timeoutMs } = parsed.value;
	let registry;
	let admission;

	// Acquire concurrency reservation and verify execution token from the target's Durable Object
	try {
		registry = env.SSH_TARGET_REGISTRY.getByName(key);
		admission = await registry.acquire(token, timeoutMs);
	} catch {
		return reply.error(503, 'TARGET_REGISTRY_UNAVAILABLE');
	}

	if (admission.kind === 'denied') return reply.error(403, 'TARGET_NOT_ALLOWED');
	if (admission.kind === 'token_exhausted') return reply.error(429, 'TOKEN_QUOTA_EXHAUSTED');
	if (admission.kind !== 'allowed') {
		const code = admission.kind === 'busy' ? 'TARGET_BUSY' : 'RATE_LIMITED';
		return reply.error(429, code, { 'Retry-After': String(admission.retryAfter) });
	}

	const { hostKeyFingerprint, reservation } = admission;
	try {
		// Calculate remaining time against reservation expiration window
		const remaining = Math.min(timeoutMs, reservation.expiresAt - Date.now());
		if (remaining <= 0) return reply.error(504, 'SSH_TIMEOUT');

		const target = { dialHost: host, port, username, hostKeyFingerprint };
		const { kind, ...output } = await executeSsh(target, password, command, remaining, request.signal);

		if (kind === 'completed') {
			const missingExit = output.exitCode === null && !output.exitSignal;
			return reply.json(200, { ...output, ...(missingExit ? { status: 'exit_status_missing' } : {}) });
		}

		const [status, code] = SSH_ERRORS[kind];
		return reply.json(status, { ...output, error: { code } });
	} finally {
		// Non-blocking asynchronous reservation release in background execution context
		ctx.waitUntil(registry.release(reservation.id).catch(() => {}));
	}
}
