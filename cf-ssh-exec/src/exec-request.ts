/**
 * @fileoverview Request parser and validator for the SSH command execution endpoint.
 *
 * Extracts and strictly validates target connection details, SSH password, command string,
 * and execution timeout parameters from incoming JSON request payloads.
 */

import { readJsonObject, type RequestResult } from './http';
import { nonBlank, readTargetAddress, type TargetAddress } from './target-address';

const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Validated SSH execution request payload structure.
 */
export type ExecRequest = TargetAddress & {
	password: string;
	command: string;
	timeoutMs: number;
};

/**
 * Parses and validates an incoming POST /v1/ssh/exec request.
 *
 * @param request Incoming HTTP request.
 * @returns Parsed ExecRequest payload or validation failure details.
 */
export async function parseExecRequest(request: Request): Promise<RequestResult<ExecRequest>> {
	const body = await readJsonObject(request);
	if (!body.ok) return body;

	const address = readTargetAddress(body.value);
	const { password, command, timeoutMs = DEFAULT_TIMEOUT_MS } = body.value;

	// Verify required authentication credential and non-blank command string
	if (!address || typeof password !== 'string' || password.length === 0 || !nonBlank(command)) {
		return { ok: false, status: 400, code: 'INVALID_FIELDS' };
	}

	// Constrain execution timeout within the acceptable runtime window (1s to 30s)
	if (typeof timeoutMs !== 'number' || !Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 30_000) {
		return { ok: false, status: 400, code: 'INVALID_TIMEOUT_MS' };
	}

	return { ok: true, value: { ...address, password, command, timeoutMs } };
}
