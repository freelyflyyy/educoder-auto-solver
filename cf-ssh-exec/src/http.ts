/**
 * @fileoverview Pure HTTP protocol primitives for JSON responses and bounded request parsing.
 *
 * Provides standardized non-cacheable JSON response builders with distributed tracing metadata
 * and stream-level payload size enforcement (8 KiB ceiling) to mitigate memory exhaustion DoS.
 */

/** Maximum permissible request body size (8 KiB). */
export const MAX_BODY_BYTES = 8 * 1024;

/**
 * Discriminated union representing a non-throwing validation or execution outcome.
 */
export type RequestResult<T> =
	| { ok: true; value: T }
	| { ok: false; status: number; code: string; headers?: Record<string, string> };

/**
 * Standardized HTTP JSON response builder instance.
 */
export type Reply = ReturnType<typeof createReply>;

/**
 * Creates a request-scoped response builder that attaches `requestId`, `durationMs`,
 * and `Cache-Control: no-store` to every JSON payload.
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
 * Streams and parses a JSON object request body with an 8 KiB hard ceiling and strict UTF-8 decoding.
 *
 * @param request Incoming HTTP request.
 * @returns Validated plain JSON object or structured error status and code.
 */
export async function readJsonObject(request: Pick<Request, 'body' | 'headers'>): Promise<RequestResult<Record<string, unknown>>> {
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
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			if (size + value.byteLength > bytes.length) {
				void reader.cancel().catch(() => {});
				return { ok: false, status: 413, code: 'BODY_TOO_LARGE' };
			}

			bytes.set(value, size);
			size += value.byteLength;
		}

		// Decode UTF-8 bytes in fatal mode: fail fast on malformed byte sequences
		const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false });
		payload = JSON.parse(decoder.decode(bytes.subarray(0, size)));
	} catch {
		return invalidJson;
	} finally {
		reader.releaseLock();
	}

	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
		return { ok: false, status: 400, code: 'INVALID_FIELDS' };
	}

	return { ok: true, value: payload as Record<string, unknown> };
}
