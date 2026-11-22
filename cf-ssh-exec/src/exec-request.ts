/**
 * @fileoverview Request schema parser and validator for `POST /v1/ssh/exec`.
 *
 * Extracts and strictly validates target connection parameters, SSH password,
 * command string, execution timeout bounds, and optional host key fingerprint.
 */

import { readJsonObject, type RequestResult } from './http';

export const DEFAULT_TIMEOUT_MS = 20_000;
export const MIN_TIMEOUT_MS = 1_000;
export const MAX_TIMEOUT_MS = 30_000;
export const MAX_USERNAME_LENGTH = 256;

/** OpenSSH SHA-256 host key fingerprint pattern (e.g. `SHA256:base64...`). */
export const HOST_KEY_FINGERPRINT_PATTERN = /^SHA256:[A-Za-z0-9+/]{43}$/;

/**
 * Validated SSH execution request payload structure.
 */
export type ExecRequest = {
	host: string;
	port: number;
	username: string;
	password: string;
	command: string;
	timeoutMs: number;
	hostKeyFingerprint?: string;
};

function isNonBlankString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Parses and validates an incoming `POST /v1/ssh/exec` JSON request.
 *
 * @param request Incoming HTTP request.
 * @returns Validated `ExecRequest` payload or structured validation error.
 */
export async function parseExecRequest(request: Pick<Request, 'body' | 'headers'>): Promise<RequestResult<ExecRequest>> {
	const body = await readJsonObject(request);
	if (!body.ok) return body;

	const { host, port, username, password, command, timeoutMs = DEFAULT_TIMEOUT_MS, hostKeyFingerprint } = body.value;

	if (
		!isNonBlankString(host) ||
		typeof port !== 'number' ||
		!Number.isInteger(port) ||
		port < 1 ||
		port > 65_535 ||
		!isNonBlankString(username) ||
		username.length > MAX_USERNAME_LENGTH ||
		typeof password !== 'string' ||
		password.length === 0 ||
		!isNonBlankString(command)
	) {
		return { ok: false, status: 400, code: 'INVALID_FIELDS' };
	}

	if (
		typeof timeoutMs !== 'number' ||
		!Number.isInteger(timeoutMs) ||
		timeoutMs < MIN_TIMEOUT_MS ||
		timeoutMs > MAX_TIMEOUT_MS
	) {
		return { ok: false, status: 400, code: 'INVALID_TIMEOUT_MS' };
	}

	if (hostKeyFingerprint !== undefined) {
		if (typeof hostKeyFingerprint !== 'string' || !HOST_KEY_FINGERPRINT_PATTERN.test(hostKeyFingerprint)) {
			return { ok: false, status: 400, code: 'INVALID_HOST_KEY_FINGERPRINT' };
		}
		return {
			ok: true,
			value: { host, port, username, password, command, timeoutMs, hostKeyFingerprint },
		};
	}

	return {
		ok: true,
		value: { host, port, username, password, command, timeoutMs },
	};
}
