import { AuthenticationError, SshClient } from '@workeryard/undershell';
import { connect } from 'cloudflare:sockets';
import { beforeEach, expect, it, vi } from 'vitest';
import { executeSsh, type SshTarget } from '../src/ssh-exec';
import { execPayload, testFingerprint, testTarget } from './fixtures.mts';

vi.mock('cloudflare:sockets', () => ({ connect: vi.fn() }));
vi.mock('@workeryard/undershell', () => ({
	AuthenticationError: class AuthenticationError extends Error {},
	SshClient: { connect: vi.fn() },
}));

const KiB = 1024;
const encode = (text: string) => new TextEncoder().encode(text);

function stream(chunks: Uint8Array[], leaveOpen = false) {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			for (const chunk of chunks) controller.enqueue(chunk);
			if (!leaveOpen) controller.close();
		},
	});
}

function mockSocket() {
	const close = vi.fn(async () => {});
	vi.mocked(connect).mockReturnValueOnce({
		readable: new ReadableStream(),
		writable: new WritableStream(),
		closed: Promise.resolve(),
		opened: Promise.resolve({}),
		close,
	} as unknown as Socket);
	return close;
}

function mockSession({
	stdout = [encode('ok\n')],
	stderr = [encode('warn\n')],
	exit = { code: 7 },
	leaveOpen = false,
}: {
	stdout?: Uint8Array[];
	stderr?: Uint8Array[];
	exit?: { code: number | null; signal?: string };
	leaveOpen?: boolean;
} = {}) {
	const close = mockSocket();
	const closeStdin = vi.fn();
	const spawn = vi.fn(async () => ({
		stdout: stream(stdout, leaveOpen),
		stderr: stream(stderr),
		exit: leaveOpen ? new Promise(() => {}) : Promise.resolve(exit),
		stdin: new WritableStream({ close: closeStdin }),
	}));
	vi.mocked(SshClient.connect).mockResolvedValueOnce({ spawn } as unknown as SshClient);
	return { close, closeStdin, spawn };
}

function execute(target: SshTarget = testTarget, timeoutMs = 1000, signal = new AbortController().signal) {
	return executeSsh(target, execPayload.password, execPayload.command, timeoutMs, signal);
}

beforeEach(() => {
	vi.resetAllMocks();
});

it('未指定主机指纹时默认允许连接（动态容器直连），执行一次并关闭 stdin 与 socket', async () => {
	const { spawn, close, closeStdin } = mockSession();

	expect(await execute()).toMatchObject({
		kind: 'completed',
		stdout: 'ok\n',
		stderr: 'warn\n',
		exitCode: 7,
		truncated: false,
	});
	expect(connect).toHaveBeenCalledExactlyOnceWith({
		hostname: testTarget.dialHost,
		port: testTarget.port,
	});
	const connectArgs = vi.mocked(SshClient.connect).mock.calls[0][0];
	expect(connectArgs).toMatchObject({
		username: testTarget.username,
		auth: { kind: 'password', password: execPayload.password },
	});
	expect(connectArgs.hostKeyFingerprint).toBeUndefined();
	expect(connectArgs.verifyHostKey?.({} as never)).toBe(true);
	expect(spawn).toHaveBeenCalledExactlyOnceWith(execPayload.command, { pty: false });
	expect(closeStdin).toHaveBeenCalledOnce();
	expect(close).toHaveBeenCalledOnce();
});

it('提供主机指纹时严格透传 hostKeyFingerprint 进行钉扎校验', async () => {
	mockSession();

	expect(await execute({ ...testTarget, hostKeyFingerprint: testFingerprint })).toMatchObject({
		kind: 'completed',
		exitCode: 7,
	});
	expect(SshClient.connect).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({
			username: testTarget.username,
			hostKeyFingerprint: testFingerprint,
			auth: { kind: 'password', password: execPayload.password },
		}),
	);
});

it('区分认证失败、连接失败与命令执行异常', async () => {
	mockSocket();
	vi.mocked(SshClient.connect).mockRejectedValueOnce(new AuthenticationError('bad password', ['password']));
	expect(await execute()).toMatchObject({ kind: 'auth_failed', exitCode: null });

	mockSocket();
	vi.mocked(SshClient.connect).mockRejectedValueOnce(new Error('handshake failed'));
	expect(await execute()).toMatchObject({ kind: 'connection_failed', exitCode: null });

	mockSocket();
	vi.mocked(SshClient.connect).mockResolvedValueOnce({
		spawn: vi.fn(async () => {
			throw new Error('channel open failed');
		}),
	} as unknown as SshClient);
	expect(await execute()).toMatchObject({ kind: 'exec_failed', exitCode: null });
});

it('保留分块的 UTF-8 文本和远端退出信号', async () => {
	const text = encode('输出');
	mockSession({
		stdout: [text.subarray(0, 2), text.subarray(2)],
		exit: { code: null, signal: 'TERM' },
	});

	expect(await execute()).toMatchObject({
		kind: 'completed',
		stdout: '输出',
		exitCode: null,
		exitSignal: 'TERM',
	});
});

it('每路恰好 32 KiB 时未发生截断', async () => {
	mockSession({ stdout: [encode('x'.repeat(32 * KiB))], stderr: [] });

	expect(await execute()).toMatchObject({ kind: 'completed', truncated: false });
});

it('两路累计 128 KiB 时保留退出码并各截断到 32 KiB', async () => {
	mockSession({
		stdout: [encode('x'.repeat(64 * KiB))],
		stderr: [encode('y'.repeat(64 * KiB))],
		exit: { code: 9 },
	});

	const result = await execute();

	expect(result).toMatchObject({
		kind: 'completed',
		stdout: 'x'.repeat(32 * KiB),
		stderr: 'y'.repeat(32 * KiB),
		exitCode: 9,
		truncated: true,
	});
});

it('两路累计超过 128 KiB 时中止并关闭连接', async () => {
	const { close } = mockSession({
		stdout: [encode('x'.repeat(64 * KiB))],
		stderr: [encode('y'.repeat(64 * KiB + 1))],
	});

	expect(await execute()).toMatchObject({
		kind: 'output_limit',
		exitCode: null,
		truncated: true,
	});
	expect(close).toHaveBeenCalledOnce();
});

it('命令超时时返回部分输出并关闭连接', async () => {
	const { close } = mockSession({ stdout: [encode('before')], leaveOpen: true });

	expect(await execute(testTarget, 50)).toMatchObject({
		kind: 'timeout',
		stdout: 'before',
		exitCode: null,
	});
	expect(close).toHaveBeenCalledOnce();
});

it('断开后即使认证返回也不执行命令', async () => {
	const close = mockSocket();
	const connection = Promise.withResolvers<SshClient>();
	const connecting = Promise.withResolvers<void>();
	vi.mocked(SshClient.connect).mockImplementationOnce(() => {
		connecting.resolve();
		return connection.promise;
	});
	const abort = new AbortController();
	const spawn = vi.fn();

	const result = execute(testTarget, 1000, abort.signal);
	await connecting.promise;
	abort.abort();
	expect(await result).toMatchObject({ kind: 'cancelled', exitCode: null });
	connection.resolve({ spawn } as unknown as SshClient);
	await connection.promise;
	expect(spawn).not.toHaveBeenCalled();
	expect(close).toHaveBeenCalledOnce();
});
