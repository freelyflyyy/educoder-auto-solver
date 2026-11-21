import { SELF, createExecutionContext, env, runInDurableObject, waitOnExecutionContext } from "cloudflare:test";
import { beforeEach, expect, it, vi } from "vitest";
import worker from "../src/index";
import { executeSsh } from "../src/ssh-exec";
import { execPayload, testAdminToken, testTarget } from "./fixtures.mts";

vi.mock("../src/ssh-exec", () => ({ executeSsh: vi.fn() }));

const execUrl = "https://worker.example.test/v1/ssh/exec";
const registryUrl = new URL("/v1/ssh/targets", execUrl);
const address = { host: execPayload.host, port: execPayload.port, username: execPayload.username };

function manage(method: "PUT" | "DELETE", body: Record<string, unknown>, token = testAdminToken) {
	return SELF.fetch(registryUrl, {
		method,
		headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
		body: JSON.stringify(body),
	});
}

function register(overrides: Record<string, unknown> = {}) {
	return manage("PUT", { ...address, hostKeyFingerprint: testTarget.hostKeyFingerprint, ...overrides });
}

type Registration = { registrationId: string; executionToken: string };
let executionToken: string;
const execute = vi.mocked(executeSsh);
const completed = {
	kind: "completed",
	stdout: "ok\n",
	stderr: "warn\n",
	exitCode: 7,
	exitSignal: undefined,
	truncated: false,
} as const;

function post(body = JSON.stringify(execPayload), token = executionToken) {
	return new Request<unknown, IncomingRequestCfProperties>(execUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body,
	});
}

beforeEach(async () => {
	executionToken = (await (await register()).json<Registration>()).executionToken;
	expect(executionToken).toMatch(/^[a-f0-9]{64}$/);
	execute.mockReset();
	execute.mockResolvedValue(completed);
});

it("返回独立的两路输出和非零退出状态，并使用登记的连接信息", async () => {
	const response = await SELF.fetch(post());

	expect(response.status).toBe(200);
	expect(response.headers.get("Cache-Control")).toBe("no-store");
	expect(await response.json()).toMatchObject({
		requestId: expect.any(String),
		durationMs: expect.any(Number),
		stdout: "ok\n",
		stderr: "warn\n",
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

it("在鉴权前拒绝错误方法和未知路径", async () => {
	const response = await SELF.fetch(execUrl);
	expect(response.status).toBe(405);
	expect(response.headers.get("Allow")).toBe("POST");
	expect((await SELF.fetch("https://worker.example.test/")).status).toBe(404);
	expect(execute).not.toHaveBeenCalled();
});

it("提供独立的脚本猫控制台页面", async () => {
	const response = await SELF.fetch("https://worker.example.test/console");

	expect(response.status).toBe(200);
	expect(response.headers.get("Content-Type")).toContain("text/html");
	expect(await response.text()).toContain("执行 SSH 命令");
	expect(execute).not.toHaveBeenCalled();
});

it("先鉴权再读取请求体", async () => {
	const response = await SELF.fetch(post("{", "malformed"));

	expect(response.status).toBe(401);
	expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
	expect(execute).not.toHaveBeenCalled();
});

it.each([
	{ host: "192.0.2.11" },
	{ port: 2222 },
	{ username: "unknown" },
])("拒绝只匹配部分字段的 SSH 目标 (%j)", async (target) => {
	const response = await SELF.fetch(post(JSON.stringify({ ...execPayload, ...target })));

	expect(response.status).toBe(403);
	expect(await response.json()).toMatchObject({ error: { code: "TARGET_NOT_ALLOWED" } });
	expect(execute).not.toHaveBeenCalled();
});

it("同一 Worker 无需重部署即可登记新地址", async () => {
	const other = { host: "192.0.2.11", port: 46800, username: "ephemeral" };
	const body = JSON.stringify({ ...execPayload, ...other });
	expect((await SELF.fetch(post(body))).status).toBe(403);
	const { executionToken: otherToken } = await (await register(other)).json<Registration>();
	expect((await SELF.fetch(post(body))).status).toBe(403);
	expect((await SELF.fetch(post(body, otherToken))).status).toBe(200);
	expect(execute).toHaveBeenCalledExactlyOnceWith(
		{ ...testTarget, dialHost: other.host, port: other.port, username: other.username },
		execPayload.password, execPayload.command, 20_000, expect.any(AbortSignal),
	);
});

it("执行 Token 无法登记目标，管理 Token 无法直接执行命令", async () => {
	expect((await manage("PUT", { ...address, hostKeyFingerprint: testTarget.hostKeyFingerprint }, executionToken)).status).toBe(401);
	expect((await SELF.fetch(post(JSON.stringify(execPayload), testAdminToken))).status).toBe(403);
	expect(execute).not.toHaveBeenCalled();
});

it.each([
	[{ host: "192.000.2.10" }, "INVALID_TARGET"],
	[{ hostKeyFingerprint: null }, "INVALID_HOST_KEY_FINGERPRINT"],
	[{ ttlSeconds: 1801 }, "INVALID_TARGET_TTL"],
] as const)("拒绝无效登记 (%j)", async (input, code) => {
	const response = await register(input);
	expect(response.status).toBe(400);
	expect(await response.json()).toMatchObject({ error: { code } });
	expect(execute).not.toHaveBeenCalled();
});

it.each([undefined, 1800, 30])("按登记时指定或默认的 TTL 计算过期时间 (%s)", async (ttlSeconds) => {
	const expectedMs = (ttlSeconds ?? 1800) * 1000;
	const before = Date.now();
	const response = await register({ ttlSeconds });
	expect(response.status).toBe(200);
	const { expiresAt } = await response.json<{ expiresAt: number }>();
	expect(expiresAt).toBeGreaterThanOrEqual(before + expectedMs);
	expect(expiresAt).toBeLessThanOrEqual(Date.now() + expectedMs);
});

it("撤销最新登记后立即拒绝执行，旧登记 ID 不会撤销新记录", async () => {
	const first = await register();
	const next = await register();
	const stale = await first.json<Registration>();
	const current = await next.json<Registration>();
	expect(stale.registrationId).not.toBe(current.registrationId);
	const ignored = await manage("DELETE", { ...address, registrationId: stale.registrationId });
	expect(await ignored.json()).toMatchObject({ removed: false });
	expect((await SELF.fetch(post(undefined, stale.executionToken))).status).toBe(403);
	expect((await SELF.fetch(post(undefined, current.executionToken))).status).toBe(200);
	execute.mockClear();
	const removed = await manage("DELETE", { ...address, registrationId: current.registrationId });
	expect(await removed.json()).toMatchObject({ removed: true });
	expect((await SELF.fetch(post(undefined, current.executionToken))).status).toBe(403);
	expect(execute).not.toHaveBeenCalled();
});

it("过期记录即使尚未由定时清理删除也无法拨号", async () => {
	const name = JSON.stringify([address.host, address.port, address.username]);
	await runInDurableObject(env.SSH_TARGET_REGISTRY.getByName(name), async (_instance, state) => {
		const existing = await state.storage.get<{ registration: { expiresAt: number } }>("target");
		if (!existing) throw new Error("missing registration fixture");
		existing.registration.expiresAt = Date.now() - 1000;
		await state.storage.put("target", existing);
	});
	expect((await SELF.fetch(post())).status).toBe(403);
	expect(execute).not.toHaveBeenCalled();
});

it("入口限流基于客户端地址，并在登记表和 SSH 之前生效", async () => {
	const checkLimit = vi.fn(async () => ({ success: false }));
	const context = createExecutionContext();
	const request = post();
	request.headers.set("CF-Connecting-IP", "192.0.2.200");
	const response = await worker.fetch(request, { ...env, SSH_RATE_LIMITER: { limit: checkLimit } }, context);

	expect(response.status).toBe(429);
	expect(await response.json()).toMatchObject({ error: { code: "INGRESS_RATE_LIMITED" } });
	expect(checkLimit).toHaveBeenCalledExactlyOnceWith({ key: "ingress:192.0.2.200" });
	expect(execute).not.toHaveBeenCalled();
});

it("同一目标并发请求被拒绝，另一目标可并行", async () => {
	const other = { host: "192.0.2.12", port: 46800, username: "ephemeral" };
	const { executionToken: otherToken } = await (await register(other)).json<Registration>();
	const entered = Promise.withResolvers<void>();
	const running = Promise.withResolvers<typeof completed>();
	execute.mockImplementationOnce(() => {
		entered.resolve();
		return running.promise;
	});

	const context = createExecutionContext();
	const first = worker.fetch(post(), env, context);
	try {
		await entered.promise;
		const blocked = await SELF.fetch(post());
		expect(blocked.status).toBe(429);
		expect(await blocked.json()).toMatchObject({ error: { code: "TARGET_BUSY" } });
		expect((await SELF.fetch(post(JSON.stringify({ ...execPayload, ...other }), otherToken))).status).toBe(200);
		expect(execute).toHaveBeenCalledTimes(2);
	} finally {
		running.resolve(completed);
		await first;
		await waitOnExecutionContext(context);
	}
	expect((await SELF.fetch(post())).status).toBe(200);
});

it("每个目标登记单独计算执行配额", async () => {
	for (let attempt = 0; attempt < 10; attempt++) {
		const context = createExecutionContext();
		expect((await worker.fetch(post(), env, context)).status).toBe(200);
		await waitOnExecutionContext(context);
	}

	const blocked = await SELF.fetch(post());
	expect(blocked.status).toBe(429);
	expect(await blocked.json()).toMatchObject({ error: { code: "RATE_LIMITED" } });

	const other = { host: "192.0.2.13", port: 46800, username: "ephemeral" };
	const { executionToken: otherToken } = await (await register(other)).json<Registration>();
	expect((await SELF.fetch(post(JSON.stringify({ ...execPayload, ...other }), otherToken))).status).toBe(200);
	expect(execute).toHaveBeenCalledTimes(11);
});

it("重新登记保留正在执行的名额，旧请求迟到释放时不会清除新名额", async () => {
	const name = JSON.stringify([address.host, address.port, address.username]);
	const registry = env.SSH_TARGET_REGISTRY.getByName(name);
	const first = await registry.acquire(executionToken, 20_000);
	if (first.kind !== "allowed") throw new Error("failed to reserve slot");

	const { executionToken: replacement } = await (await register()).json<Registration>();
	expect(await registry.acquire(executionToken, 20_000)).toMatchObject({ kind: "denied" });
	expect(await registry.acquire(replacement, 20_000)).toMatchObject({ kind: "busy" });

	await runInDurableObject(registry, async (_instance, state) => {
		const target = await state.storage.get<{ active: { expiresAt: number } }>("target");
		if (!target) throw new Error("missing reservation fixture");
		target.active.expiresAt = Date.now() - 1000;
		await state.storage.put("target", target);
	});
	const second = await registry.acquire(replacement, 20_000);
	if (second.kind !== "allowed") throw new Error("expired reservation was not cleared");
	await registry.release(first.reservation.id);
	expect(await registry.acquire(replacement, 20_000)).toMatchObject({ kind: "busy" });
	await registry.release(second.reservation.id);
});

it.each([
	{ kind: "timeout", status: 504, code: "SSH_TIMEOUT", truncated: false },
	{ kind: "output_limit", status: 502, code: "OUTPUT_LIMIT_EXCEEDED", truncated: true },
] as const)("执行中断时返回已收集的输出 ($kind)", async ({ kind, status, code, truncated }) => {
	execute.mockResolvedValueOnce({ ...completed, kind, exitCode: null, truncated });

	const response = await SELF.fetch(post());

	expect(response.status).toBe(status);
	expect(await response.json()).toMatchObject({
		error: { code },
		stdout: "ok\n",
		stderr: "warn\n",
		exitCode: null,
		truncated,
		durationMs: expect.any(Number),
	});
});

it("缺失退出状态时保留 null", async () => {
	execute.mockResolvedValueOnce({ ...completed, exitCode: null });

	const response = await SELF.fetch(post());

	expect(response.status).toBe(200);
	expect(await response.json()).toMatchObject({ exitCode: null, status: "exit_status_missing" });
});
