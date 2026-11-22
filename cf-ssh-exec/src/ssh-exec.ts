/**
 * @fileoverview Low-level SSHv2 client executor utilizing `cloudflare:sockets` and `@workeryard/undershell`.
 *
 * Handles raw TCP socket dialing, SSH handshake, optional host key fingerprint pinning,
 * password authentication, non-interactive remote command spawning, bounded output stream
 * buffering, and deterministic socket teardown on timeout or client disconnect.
 */

import { AuthenticationError, SshClient } from '@workeryard/undershell';
import { connect } from 'cloudflare:sockets';

/**
 * Target host connection specification.
 */
export type SshTarget = {
	dialHost: string;
	port: number;
	username: string;
	hostKeyFingerprint?: string;
};

type Interrupted = 'timeout' | 'cancelled' | 'output_limit';
export type ExecKind = Interrupted | 'completed' | 'auth_failed' | 'connection_failed' | 'exec_failed';
type OutputName = 'stdout' | 'stderr';

/**
 * Full execution result payload returned by the SSH executor.
 */
export type ExecResult = {
	kind: ExecKind;
	stdout: string;
	stderr: string;
	exitCode: number | null;
	exitSignal?: string;
	truncated: boolean;
};

/** Maximum retained output bytes per stream (32 KiB). */
export const MAX_RETAINED_BYTES = 32 * 1024;
/** Maximum combined output limit across stdout and stderr (128 KiB). */
export const MAX_TOTAL_BYTES = 128 * 1024;

/**
 * In-memory buffer accumulator for stdout and stderr streams with strict ceiling enforcement.
 */
class CommandOutput {
	private readonly buffers = {
		stdout: new Uint8Array(MAX_RETAINED_BYTES),
		stderr: new Uint8Array(MAX_RETAINED_BYTES),
	};
	private readonly lengths = { stdout: 0, stderr: 0 };
	private received = 0;
	private truncated = false;

	/**
	 * Appends incoming stream chunks while respecting per-stream and total size limits.
	 *
	 * @param name Output stream identifier (`'stdout'` | `'stderr'`).
	 * @param bytes Incoming chunk buffer.
	 * @returns `true` if chunk was accepted within total output quota; `false` if total quota breached.
	 */
	append(name: OutputName, bytes: Uint8Array): boolean {
		const accepted = Math.min(bytes.byteLength, MAX_TOTAL_BYTES - this.received);
		const keep = Math.min(accepted, MAX_RETAINED_BYTES - this.lengths[name]);
		this.buffers[name].set(bytes.subarray(0, keep), this.lengths[name]);
		this.lengths[name] += keep;
		this.received += accepted;
		this.truncated ||= keep < bytes.byteLength;
		return accepted === bytes.byteLength;
	}

	/**
	 * Decodes retained byte buffers into UTF-8 text snapshots.
	 */
	snapshot() {
		const decoder = new TextDecoder();
		return {
			stdout: decoder.decode(this.buffers.stdout.subarray(0, this.lengths.stdout)),
			stderr: decoder.decode(this.buffers.stderr.subarray(0, this.lengths.stderr)),
			truncated: this.truncated,
		};
	}
}

/**
 * Executes a remote non-interactive command over SSH against a target host.
 *
 * Employs a multi-way race (`Promise.race`) between command execution, wall-clock timeout,
 * and incoming client abort signals to guarantee timely responses and zero leaked sockets.
 *
 * @param target Destination server configuration including dial host and optional host key fingerprint.
 * @param password SSH password credential.
 * @param command Shell command string to execute.
 * @param timeoutMs Maximum allowed execution duration in milliseconds.
 * @param requestSignal AbortSignal tracking incoming HTTP client disconnects.
 * @returns Result object containing execution status, buffered output streams, and exit codes.
 */
export async function executeSsh(
	target: SshTarget,
	password: string,
	command: string,
	timeoutMs: number,
	requestSignal: AbortSignal,
): Promise<ExecResult> {
	if (requestSignal.aborted) {
		return { kind: 'cancelled', stdout: '', stderr: '', exitCode: null, truncated: false };
	}

	const output = new CommandOutput();
	let exitCode: number | null = null;
	let exitSignal: string | undefined;

	function result(kind: ExecKind): ExecResult {
		return { kind, ...output.snapshot(), exitCode, exitSignal };
	}

	const stopped = Promise.withResolvers<Interrupted>();
	let interruption: Interrupted | undefined;
	let closeSocket: (() => Promise<void>) | undefined;
	let authenticated = false;

	function interrupt(reason: Interrupted) {
		interruption ??= reason;
		stopped.resolve(interruption);
	}

	async function drain(name: OutputName, stream: ReadableStream<Uint8Array>) {
		const reader = stream.getReader();
		try {
			while (!interruption) {
				const { done, value } = await reader.read();
				if (done || interruption) return;

				if (!output.append(name, value)) {
					interrupt('output_limit');
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	const onAbort = () => interrupt('cancelled');
	requestSignal.addEventListener('abort', onAbort, { once: true });
	const timer = setTimeout(() => interrupt('timeout'), timeoutMs);

	try {
		const socket = connect({ hostname: target.dialHost, port: target.port });
		void socket.closed.catch(() => {});

		let closing: Promise<void> | undefined;
		closeSocket = () => (closing ??= socket.close().catch(() => {}));

		const work = (async (): Promise<ExecKind> => {
			await socket.opened;
			if (interruption) return interruption;

			const hostKeyPolicy = target.hostKeyFingerprint
				? { hostKeyFingerprint: target.hostKeyFingerprint }
				: { verifyHostKey: () => true };

			const client = await SshClient.connect({
				socket: { readable: socket.readable, writable: socket.writable, close: closeSocket },
				username: target.username,
				auth: { kind: 'password', password },
				...hostKeyPolicy,
			});
			if (interruption) return interruption;
			authenticated = true;

			const session = await client.spawn(command, { pty: false });
			if (interruption) return interruption;

			const [, , , exit] = await Promise.all([
				drain('stdout', session.stdout),
				drain('stderr', session.stderr),
				session.stdin.close().catch(() => {}),
				session.exit,
			]);
			if (interruption) return interruption;

			exitCode = exit.code;
			exitSignal = exit.signal;
			return 'completed';
		})();

		return result(await Promise.race([work, stopped.promise]));
	} catch (error) {
		if (interruption) return result(interruption);
		if (error instanceof AuthenticationError) return result('auth_failed');
		return result(authenticated ? 'exec_failed' : 'connection_failed');
	} finally {
		clearTimeout(timer);
		requestSignal.removeEventListener('abort', onAbort);
		void closeSocket?.();
	}
}
