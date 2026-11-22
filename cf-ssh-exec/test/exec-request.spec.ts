import { expect, it } from 'vitest';
import { parseExecRequest } from '../src/exec-request';
import { execPayload, testFingerprint } from './fixtures.mts';

function request(body: string | ReadableStream<Uint8Array>, contentType = 'application/json; charset=utf-8') {
	return new Request('https://worker.example.test/v1/ssh/exec', {
		method: 'POST',
		headers: { 'Content-Type': contentType },
		body,
	});
}

it('省略 timeoutMs 和 hostKeyFingerprint 时使用默认值并保留命令与密码原样', async () => {
	const payload = { ...execPayload, command: ' uptime ', password: ' test-only ' };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: true,
		value: { ...payload, timeoutMs: 20_000 },
	});
});

it('传入合法的 hostKeyFingerprint 时原样保留', async () => {
	const payload = { ...execPayload, hostKeyFingerprint: testFingerprint };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: true,
		value: { ...payload, timeoutMs: 20_000, hostKeyFingerprint: testFingerprint },
	});
});

it.each(['', 'MD5:1234', 'SHA256:short', 123, null])('拒绝格式无效的 hostKeyFingerprint (%s)', async (hostKeyFingerprint) => {
	const payload = { ...execPayload, hostKeyFingerprint };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: false,
		status: 400,
		code: 'INVALID_HOST_KEY_FINGERPRINT',
	});
});

it.each([1000, 30_000])('接受 timeoutMs 边界值 %s', async (timeoutMs) => {
	const payload = { ...execPayload, timeoutMs };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toMatchObject({
		ok: true,
		value: { timeoutMs },
	});
});

it.each([999, 30_001, 1_500.5, '20000', null])('拒绝无效的 timeoutMs %s', async (timeoutMs) => {
	const payload = { ...execPayload, timeoutMs };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: false,
		status: 400,
		code: 'INVALID_TIMEOUT_MS',
	});
});

it.each([
	{ host: '   ' },
	{ port: 0 },
	{ port: 65536 },
	{ username: '' },
	{ username: 'a'.repeat(257) },
	{ password: '' },
	{ command: '   ' },
])('拒绝缺失或越界的核心字段 (%j)', async (override) => {
	const payload = { ...execPayload, ...override };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: false,
		status: 400,
		code: 'INVALID_FIELDS',
	});
});

it('拒绝非 application/json 的 Content-Type', async () => {
	expect(await parseExecRequest(request(JSON.stringify(execPayload), 'text/plain'))).toEqual({
		ok: false,
		status: 415,
		code: 'UNSUPPORTED_MEDIA_TYPE',
	});
});

it('在没有 Content-Length 的流式请求中限制 8 KiB 请求体大小', async () => {
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(new Uint8Array(8 * 1024));
			controller.enqueue(Uint8Array.of(32));
			controller.close();
		},
	});
	const incoming = request(body);

	expect(incoming.headers.get('Content-Length')).toBeNull();
	expect(await parseExecRequest(incoming)).toEqual({
		ok: false,
		status: 413,
		code: 'BODY_TOO_LARGE',
	});
});
