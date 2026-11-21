/**
 * @fileoverview HTTP communication helpers and request body parsing primitives.
 *
 * Provides structured JSON response creation with distributed tracing metadata,
 * stream-level payload size enforcement to mitigate DoS attacks, and bearer token extraction.
 */

// Maximum permissible request body size (8 KiB) to prevent memory exhaustion DoS attacks
const MAX_BODY_BYTES = 8 * 1024;

/**
 * Result pattern representation for request processing operations without throwing exceptions.
 */
export type RequestResult<T> = { ok: true; value: T } | { ok: false; status: number; code: string };

/**
 * Standardized response builder instance.
 */
export type Reply = ReturnType<typeof createReply>;

/**
 * Factory for creating standardized, non-cacheable JSON HTTP responses with request tracking metrics.
 */
export function createReply() {
	const startedAt = performance.now();

	function json(status: number, body: Record<string, unknown>, headers?: Record<string, string>): Response {
		return Response.json(
			{ ...body, requestId: crypto.randomUUID(), durationMs: Math.round(performance.now() - startedAt) },
			{ status, headers: { 'Cache-Control': 'no-store', ...headers } },
		);
	}

	function error(status: number, code: string, headers?: Record<string, string>): Response {
		return json(status, { error: { code } }, headers);
	}

	return {
		json,
		error,
		unauthorized: () => error(401, 'UNAUTHORIZED', { 'WWW-Authenticate': 'Bearer' }),
	};
}

/**
 * Extracts a 64-character hexadecimal Bearer token from the Authorization header.
 *
 * @param request Incoming HTTP request.
 * @returns Parsed hex token string or undefined if absent or malformed.
 */
export function bearerToken(request: Request): string | undefined {
	return /^Bearer +([0-9a-f]{64})$/i.exec(request.headers.get('Authorization') ?? '')?.[1];
}

/**
 * Reads and validates an incoming JSON object with an 8 KiB stream ceiling and strict UTF-8 decoding.
 *
 * @param request Incoming HTTP request.
 * @returns Parsed JSON object or error status and error code.
 */
export async function readJsonObject(request: Request): Promise<RequestResult<Record<string, unknown>>> {
	const mediaType = request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase();
	if (mediaType !== 'application/json') {
		return { ok: false, status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' };
	}

	const reader = request.body?.getReader();
	const invalidJson = { ok: false, status: 400, code: 'INVALID_JSON' } as const;
	if (!reader) return invalidJson;

	const bytes = new Uint8Array(MAX_BODY_BYTES);
	let size = 0;
	let payload: unknown;

	try {
		// Stream-read request body with an 8 KiB hard ceiling to mitigate DoS attacks
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// Abort stream and reject immediately when payload exceeds maximum size
			if (size + value.byteLength > bytes.length) {
				void reader.cancel().catch(() => {});
				return { ok: false, status: 413, code: 'BODY_TOO_LARGE' };
			}

			bytes.set(value, size);
			size += value.byteLength;
		}

		// Decode UTF-8 bytes in fatal mode: fail fast on malformed byte sequences instead of replacing them
		const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false });
		payload = JSON.parse(decoder.decode(bytes.subarray(0, size)));
	} catch {
		return invalidJson;
	} finally {
		reader.releaseLock();
	}

	// Reject payloads that are not top-level plain objects (e.g. primitives, arrays, null)
	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
		return { ok: false, status: 400, code: 'INVALID_FIELDS' };
	}

	return { ok: true, value: payload as Record<string, unknown> };
}
