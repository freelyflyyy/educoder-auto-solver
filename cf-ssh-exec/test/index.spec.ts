import { SELF, createExecutionContext, env } from 'cloudflare:test';
import { beforeEach, expect, it, vi } from 'vitest';
import worker from '../src/index';
import { executeSsh } from '../src/ssh-exec';
import { execPayload, testApiKey, testFingerprint, testTarget } from './fixtures.mts';

vi.mock('../src/ssh-exec', () => ({ executeSsh: vi.fn() }));

const execUrl = 'https://worker.example.test/v1/ssh/exec';
const execute = vi.mocked(executeSsh);
const completed = {
	kind: 'completed',
	stdout: 'ok\n',
	stderr: 'warn\n',
	exitCode: 7,
	exitSignal: undefined,
	truncated: false,
} as const;

function post(body = JSON.stringify(execPayload), token = testApiKey) {
	return new Request<unknown, IncomingRequestCfProperties>(execUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: 'Bearer ' + token } : {}),
		},
		body,
	});
}

beforeEach(() => {
	execute.mockReset();
	execute.mockResolvedValue(completed);
});

it('携带有效 SSH_API_KEY 时直接执行并返回两路输出与退出状态', async () => {
	const response = await SELF.fetch(post());

	expect(response.status).toBe(200);
	expect(response.headers.get('Cache-Control')).toBe('no-store');
	expect(await response.json()).toMatchObject({
		requestId: expect.any(String),
		durationMs: expect.any(Number),
		stdout: 'ok\n',
		stderr: 'warn\n',
		exitCode: 7,
		truncated: false,
	});
	expect(execute).toHaveBeenCalledExactlyOnceWith(
		testTarget,
		execPayload.password,
		execPayload.command,
		20_000,
		expect.any(AbortSignal),
	);
});

it('支持透传可选的 hostKeyFingerprint 进行主机公钥钉扎', async () => {
	const payload = { ...execPayload, hostKeyFingerprint: testFingerprint };
	const response = await SELF.fetch(post(JSON.stringify(payload)));

	expect(response.status).toBe(200);
	expect(execute).toHaveBeenCalledExactlyOnceWith(
		{ ...testTarget, hostKeyFingerprint: testFingerprint },
		execPayload.password,
		execPayload.command,
		20_000,
		expect.any(AbortSignal),
	);
});

it('支持用户自定义的 sk- 风格高强度 API Key', async () => {
	const customKey = 'sk-personal-ssh-worker-key-2026';
	const response = await worker.fetch(
		post(JSON.stringify(execPayload), customKey),
		{ ...env, SSH_API_KEY: customKey },
		createExecutionContext(),
	);

	expect(response.status).toBe(200);
	expect(execute).toHaveBeenCalledOnce();
});

it('在鉴权前拒绝错误方法和未知路径，并移除旧的 /lease 与 /targets 端点', async () => {
	const badMethod = await SELF.fetch(execUrl);
	expect(badMethod.status).toBe(405);
	expect(badMethod.headers.get('Allow')).toBe('POST');

	expect((await SELF.fetch('https://worker.example.test/')).status).toBe(404);
	expect((await SELF.fetch('https://worker.example.test/v1/ssh/lease', { method: 'POST' })).status).toBe(404);
	expect((await SELF.fetch('https://worker.example.test/v1/ssh/targets', { method: 'PUT' })).status).toBe(404);
	expect(execute).not.toHaveBeenCalled();
});

it('提供独立的脚本猫调试控制台页面', async () => {
	const response = await SELF.fetch('https://worker.example.test/console');

	expect(response.status).toBe(200);
	expect(response.headers.get('Content-Type')).toContain('text/html');
	expect(await response.text()).toContain('执行 SSH 命令');
	expect(execute).not.toHaveBeenCalled();
});

it.each(['', 'short', 'wrong-api-key-that-does-not-match'])('先鉴权再读取请求体，拒绝缺失、过短或错误的 API Key (%s)', async (token) => {
	const response = await SELF.fetch(post('{', token));

	expect(response.status).toBe(401);
	expect(response.headers.get('WWW-Authenticate')).toBe('Bearer');
	expect(await response.json()).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
	expect(execute).not.toHaveBeenCalled();
});

it.each([undefined, '', 'too-short', 'invalid key with spaces 123456'])('服务端未配置合法 SSH_API_KEY 时返回 503 AUTH_NOT_CONFIGURED (%s)', async (configuredKey) => {
	const response = await worker.fetch(post(), { ...env, SSH_API_KEY: configuredKey as string }, createExecutionContext());

	expect(response.status).toBe(503);
	expect(await response.json()).toMatchObject({ error: { code: 'AUTH_NOT_CONFIGURED' } });
	expect(execute).not.toHaveBeenCalled();
});

it('入口限流基于客户端 IP，并在解析请求体与发起 SSH 之前生效', async () => {
	const checkLimit = vi.fn(async () => ({ success: false }));
	const request = post();
	request.headers.set('CF-Connecting-IP', '192.0.2.200');
	const response = await worker.fetch(request, { ...env, SSH_RATE_LIMITER: { limit: checkLimit } }, createExecutionContext());

	expect(response.status).toBe(429);
	expect(response.headers.get('Retry-After')).toBe('60');
	expect(await response.json()).toMatchObject({ error: { code: 'INGRESS_RATE_LIMITED' } });
	expect(checkLimit).toHaveBeenCalledExactlyOnceWith({ key: 'ingress:192.0.2.200' });
	expect(execute).not.toHaveBeenCalled();
});

it.each([
	'127.0.0.1',
	'10.0.0.1',
	'100.64.0.1',
	'192.168.1.1',
	'169.254.169.254',
	'0.0.0.0',
	'172.16.0.1',
	'224.0.0.1',
	'192.000.2.10',
	'example.com',
])('防 SSRF：拒绝内网、保留网段、畸形 IPv4 或域名目标 (%s)', async (host) => {
	const response = await SELF.fetch(post(JSON.stringify({ ...execPayload, host })));

	expect(response.status).toBe(403);
	expect(await response.json()).toMatchObject({ error: { code: 'TARGET_NOT_ALLOWED' } });
	expect(execute).not.toHaveBeenCalled();
});

it('配置 ALLOWED_HOST_CIDRS 时仅放行白名单网段内的公网 IPv4', async () => {
	const customEnv = { ...env, ALLOWED_HOST_CIDRS: '192.0.2.0/24, 198.51.100.8' };

	const allowedSubnet = await worker.fetch(
		post(JSON.stringify({ ...execPayload, host: '192.0.2.99' })),
		customEnv,
		createExecutionContext(),
	);
	expect(allowedSubnet.status).toBe(200);

	const allowedExact = await worker.fetch(
		post(JSON.stringify({ ...execPayload, host: '198.51.100.8' })),
		customEnv,
		createExecutionContext(),
	);
	expect(allowedExact.status).toBe(200);

	const denied = await worker.fetch(
		post(JSON.stringify({ ...execPayload, host: '203.0.113.10' })),
		customEnv,
		createExecutionContext(),
	);
	expect(denied.status).toBe(403);
	expect(await denied.json()).toMatchObject({ error: { code: 'TARGET_NOT_ALLOWED' } });
});

it.each([
	{ kind: 'timeout', status: 504, code: 'SSH_TIMEOUT', truncated: false },
	{ kind: 'cancelled', status: 499, code: 'REQUEST_CANCELLED', truncated: false },
	{ kind: 'auth_failed', status: 502, code: 'SSH_AUTH_FAILED', truncated: false },
	{ kind: 'connection_failed', status: 502, code: 'SSH_CONNECTION_FAILED', truncated: false },
	{ kind: 'exec_failed', status: 502, code: 'SSH_EXEC_FAILED', truncated: false },
	{ kind: 'output_limit', status: 502, code: 'OUTPUT_LIMIT_EXCEEDED', truncated: true },
] as const)('正确映射 SSH 执行错误状态与已收集输出 ($kind -> $status $code)', async ({ kind, status, code, truncated }) => {
	execute.mockResolvedValueOnce({ ...completed, kind, exitCode: null, truncated });

	const response = await SELF.fetch(post());

	expect(response.status).toBe(status);
	expect(await response.json()).toMatchObject({
		error: { code },
		stdout: 'ok\n',
		stderr: 'warn\n',
		exitCode: null,
		truncated,
		durationMs: expect.any(Number),
	});
});

it('缺失退出状态时保留 null 并标记 exit_status_missing', async () => {
	execute.mockResolvedValueOnce({ ...completed, exitCode: null });

	const response = await SELF.fetch(post());

	expect(response.status).toBe(200);
	expect(await response.json()).toMatchObject({ exitCode: null, status: 'exit_status_missing' });
});
