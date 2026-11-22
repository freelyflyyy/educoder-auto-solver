/**
 * @fileoverview API key authentication and constant-time credential verification.
 *
 * Enforces mandatory `Authorization: Bearer <SSH_API_KEY>` authentication on incoming requests.
 * Compares SHA-256 digests via `crypto.subtle.timingSafeEqual` to support arbitrary high-entropy
 * keys (16–512 printable ASCII characters) without leaking secret length through timing side channels.
 */

export const MIN_API_KEY_LENGTH = 16;
export const MAX_API_KEY_LENGTH = 512;

/** Printable non-whitespace ASCII token pattern (16 to 512 chars). */
const API_KEY_PATTERN = /^[\x21-\x7e]{16,512}$/;
const BEARER_HEADER_PATTERN = /^Bearer +([\x21-\x7e]{16,512})$/i;

const encoder = new TextEncoder();

export type AuthOutcome = 'ok' | 'unauthorized' | 'unconfigured';

/**
 * Checks whether a configured secret string meets the minimum security and format requirements.
 */
export function isValidApiKeyFormat(value: unknown): value is string {
	return typeof value === 'string' && API_KEY_PATTERN.test(value);
}

/**
 * Extracts a well-formed Bearer token from the request `Authorization` header.
 */
export function extractBearerToken(request: Pick<Request, 'headers'>): string | undefined {
	return BEARER_HEADER_PATTERN.exec(request.headers.get('Authorization') ?? '')?.[1];
}

/**
 * Computes a fixed-length 32-byte SHA-256 digest for constant-time token comparison.
 */
function sha256Digest(value: string): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', encoder.encode(value));
}

/**
 * Verifies the request's Bearer token against the server's configured `SSH_API_KEY`.
 *
 * @param request Incoming HTTP request.
 * @param configuredKey Server-side `SSH_API_KEY` binding.
 * @returns `'ok'` when authenticated, `'unauthorized'` on missing/invalid/mismatched token,
 *          or `'unconfigured'` if the server secret is missing or invalid.
 */
export async function verifyApiKey(request: Pick<Request, 'headers'>, configuredKey?: string): Promise<AuthOutcome> {
	const candidate = extractBearerToken(request);
	if (!candidate) return 'unauthorized';

	if (!isValidApiKeyFormat(configuredKey)) {
		return 'unconfigured';
	}

	const [candidateDigest, expectedDigest] = await Promise.all([sha256Digest(candidate), sha256Digest(configuredKey)]);
	return crypto.subtle.timingSafeEqual(candidateDigest, expectedDigest) ? 'ok' : 'unauthorized';
}
