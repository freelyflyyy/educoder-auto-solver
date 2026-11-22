/**
 * @fileoverview Ingress rate limiter helper for client IP bucket checks.
 */

import type { Reply } from './http';

/**
 * Checks ingress rate limits for the calling client IP.
 *
 * @param request Incoming HTTP request.
 * @param limiter Cloudflare Workers RateLimit binding instance.
 * @param reply Standardized response helper.
 * @param bucket Rate limiting bucket partition ('ingress' | 'lease').
 * @returns 429/503 Response if rate limited or unavailable, otherwise undefined.
 */
export async function checkIngress(
	request: Request,
	limiter: RateLimit,
	reply: Reply,
	bucket: 'ingress' | 'lease',
): Promise<Response | undefined> {
	try {
		const clientAddress = request.headers.get('CF-Connecting-IP') ?? 'unknown';
		const { success } = await limiter.limit({ key: `${bucket}:${clientAddress}` });
		if (!success) return reply.error(429, 'INGRESS_RATE_LIMITED', { 'Retry-After': '60' });
	} catch {
		return reply.error(503, 'RATE_LIMIT_UNAVAILABLE');
	}
}
