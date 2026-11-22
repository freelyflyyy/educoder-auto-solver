/**
 * @fileoverview Orchestration handler for `POST /v1/ssh/exec`.
 *
 * Coordinates mandatory API key verification, per-IP rate limiting, request payload validation,
 * anti-SSRF target policy enforcement, and remote SSH command execution.
 */

import { verifyApiKey } from './auth';
import { parseExecRequest } from './exec-request';
import type { Reply } from './http';
import { checkIngressRateLimit } from './rate-limit';
import { executeSsh, type ExecKind } from './ssh-exec';
import { isAllowedTargetHost } from './target-policy';

export type ExecBindings = {
	SSH_API_KEY?: string;
	SSH_RATE_LIMITER?: RateLimit;
	ALLOWED_HOST_CIDRS?: string;
};

const SSH_ERRORS: Record<Exclude<ExecKind, 'completed'>, readonly [status: number, code: string]> = {
	timeout: [504, 'SSH_TIMEOUT'],
	cancelled: [499, 'REQUEST_CANCELLED'],
	auth_failed: [502, 'SSH_AUTH_FAILED'],
	connection_failed: [502, 'SSH_CONNECTION_FAILED'],
	exec_failed: [502, 'SSH_EXEC_FAILED'],
	output_limit: [502, 'OUTPUT_LIMIT_EXCEEDED'],
};

/**
 * Handles `POST /v1/ssh/exec` requests through a deterministic pipeline:
 * 1. API Key authentication (`SSH_API_KEY`)
 * 2. Edge IP rate limiting (`SSH_RATE_LIMITER`)
 * 3. JSON body & schema validation
 * 4. Anti-SSRF public IPv4 & CIDR allowlist check (`ALLOWED_HOST_CIDRS`)
 * 5. Direct SSH execution over `cloudflare:sockets`
 */
export async function handleExec(request: Request, env: ExecBindings, reply: Reply): Promise<Response> {
	const auth = await verifyApiKey(request, env.SSH_API_KEY);
	if (auth === 'unauthorized') return reply.unauthorized();
	if (auth === 'unconfigured') return reply.error(503, 'AUTH_NOT_CONFIGURED');

	const rateLimit = await checkIngressRateLimit(request, env.SSH_RATE_LIMITER);
	if (!rateLimit.ok) return reply.error(rateLimit.status, rateLimit.code, rateLimit.headers);

	const parsed = await parseExecRequest(request);
	if (!parsed.ok) return reply.error(parsed.status, parsed.code, parsed.headers);

	const { host, port, username, password, command, timeoutMs, hostKeyFingerprint } = parsed.value;
	if (!isAllowedTargetHost(host, env.ALLOWED_HOST_CIDRS)) {
		return reply.error(403, 'TARGET_NOT_ALLOWED');
	}

	const target = hostKeyFingerprint
		? { dialHost: host, port, username, hostKeyFingerprint }
		: { dialHost: host, port, username };

	const { kind, ...output } = await executeSsh(target, password, command, timeoutMs, request.signal);
	if (kind === 'completed') {
		const missingExit = output.exitCode === null && !output.exitSignal;
		return reply.json(200, { ...output, ...(missingExit ? { status: 'exit_status_missing' } : {}) });
	}

	const [status, code] = SSH_ERRORS[kind];
	return reply.json(status, { ...output, error: { code } });
}
