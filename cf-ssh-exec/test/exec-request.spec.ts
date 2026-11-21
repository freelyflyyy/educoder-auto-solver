import { expect, it } from "vitest";
import { parseExecRequest } from "../src/exec-request";
import { execPayload } from "./fixtures.mts";

function request(body: string | ReadableStream<Uint8Array>) {
	return new Request("https://worker.example.test/v1/ssh/exec", {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body,
	});
}

it("省略 timeoutMs 时使用默认值，保留命令与密码原样", async () => {
	const payload = { ...execPayload, command: " uptime ", password: " test-only " };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: true,
		value: { ...payload, timeoutMs: 20_000 },
	});
});

it.each([1000, 30_000])("接受 timeoutMs 边界值 %s", async (timeoutMs) => {
	const payload = { ...execPayload, timeoutMs };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toMatchObject({
		ok: true,
		value: { timeoutMs },
	});
});

it.each([999, 30_001, 1_500.5, "20000", null])("拒绝无效的 timeoutMs %s", async (timeoutMs) => {
	const payload = { ...execPayload, timeoutMs };

	expect(await parseExecRequest(request(JSON.stringify(payload)))).toEqual({
		ok: false,
		status: 400,
		code: "INVALID_TIMEOUT_MS",
	});
});

it("在没有 Content-Length 的流式请求中限制请求体大小", async () => {
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(new Uint8Array(8 * 1024));
			controller.enqueue(Uint8Array.of(32));
			controller.close();
		},
	});
	const incoming = request(body);

	expect(incoming.headers.get("Content-Length")).toBeNull();
	expect(await parseExecRequest(incoming)).toEqual({
		ok: false,
		status: 413,
		code: "BODY_TOO_LARGE",
	});
});
