/**
 * @fileoverview Edge ingress rate limiting by client IP address.
 *
 * Protects the Worker against brute-force credential probing and request flooding
 * using Cloudflare's native Rate Limiting binding.
 */

import type { RequestResult } from './http';

/**
 * Evaluates per-IP ingress rate limits for an incoming request.
 *
 * @param request Incoming HTTP request.
 * @param limiter Optional Cloudflare RateLimit binding (`SSH_RATE_LIMITER`).
 * @returns `{ ok: true, value: undefined }` when allowed, or error status/code when throttled or unavailable.
 */
export async function checkIngressRateLimit(
	request: Pick<Request, 'headers'>,
	limiter?: RateLimit,
): Promise<RequestResult<void>> {
	if (!limiter) return { ok: true, value: undefined };

	try {
		const clientAddress = request.headers.get('CF-Connecting-IP') ?? 'unknown';
		const { success } = await limiter.limit({ key: `ingress:${clientAddress}` });
		if (!success) {
			return {
				ok: false,
				status: 429,
				code: 'INGRESS_RATE_LIMITED',
				headers: { 'Retry-After': '60' },
			};
		}
		return { ok: true, value: undefined };
	} catch {
		return { ok: false, status: 503, code: 'RATE_LIMIT_UNAVAILABLE' };
	}
}
