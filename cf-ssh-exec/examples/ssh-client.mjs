/**
 * @fileoverview Lightweight ScriptCat / Tampermonkey client SDK for `cf-ssh-exec`.
 *
 * Wraps `GM_xmlhttpRequest` with strict timeout validation, Bearer `SSH_API_KEY` authentication,
 * and reusable target session bindings for seamless integration into browser userscripts.
 */

const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;
const DEFAULT_TIMEOUT_MS = 20_000;
const NETWORK_GRACE_MS = 5_000;

function resolveClientTimeout(timeoutMs) {
	if (
		timeoutMs !== undefined &&
		(!Number.isInteger(timeoutMs) || timeoutMs < MIN_TIMEOUT_MS || timeoutMs > MAX_TIMEOUT_MS)
	) {
		throw new Error(`timeoutMs 必须是 ${MIN_TIMEOUT_MS} 至 ${MAX_TIMEOUT_MS} 之间的整数`);
	}
	return (timeoutMs ?? DEFAULT_TIMEOUT_MS) + NETWORK_GRACE_MS;
}

function normalizeEndpoint(workerUrl) {
	const parsed = new URL(workerUrl);
	if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || parsed.username || parsed.password) {
		throw new Error('网关地址必须是有效的 HTTP/HTTPS URL 且不能包含凭据');
	}
	return `${parsed.origin}/v1/ssh/exec`;
}

function postJson(gmRequest, url, apiKey, payload, timeout) {
	return new Promise((resolve, reject) => {
		gmRequest({
			method: 'POST',
			url,
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(payload),
			timeout,
			anonymous: true,
			redirect: 'error',
			responseType: 'text',
			onload(response) {
				let body;
				try {
					body = JSON.parse(response.responseText ?? response.response);
				} catch {
					reject(new Error(`网关返回了非 JSON 响应（HTTP ${response.status}）`));
					return;
				}
				resolve({ status: response.status, body });
			},
			onerror: () => reject(new Error('网络请求失败或被拦截，执行结果未知')),
			ontimeout: () => reject(new Error('客户端等待超时，执行结果未知')),
			onabort: () => reject(new Error('请求已中断，执行结果未知')),
		});
	});
}

/**
 * Creates a reusable SSH gateway client bound to a Worker endpoint and `SSH_API_KEY`.
 *
 * @param {Function} gmRequest `GM_xmlhttpRequest` provided by ScriptCat / Tampermonkey.
 * @param {{ workerUrl: string, apiKey: string }} config Gateway URL and `SSH_API_KEY`.
 */
export function createSshGateway(gmRequest, { workerUrl, apiKey }) {
	if (typeof apiKey !== 'string' || !/^[\x21-\x7e]{16,512}$/.test(apiKey)) {
		throw new Error('SSH_API_KEY 格式无效（需为 16~512 位非空白可见字符）');
	}
	const endpoint = normalizeEndpoint(workerUrl);

	async function exec(target, command, timeoutMs) {
		const clientTimeout = resolveClientTimeout(timeoutMs);
		const { host, port = 22, username, password, hostKeyFingerprint } = target;
		const payload = {
			host,
			port,
			username,
			password,
			command,
			...(timeoutMs !== undefined ? { timeoutMs } : {}),
			...(hostKeyFingerprint ? { hostKeyFingerprint } : {}),
		};
		return postJson(gmRequest, endpoint, apiKey, payload, clientTimeout);
	}

	function session(target) {
		return {
			exec: (command, timeoutMs) => exec(target, command, timeoutMs),
		};
	}

	return { endpoint, exec, session };
}

/**
 * Convenience helper to execute a single SSH command against a target host.
 */
export async function executeRemoteSsh(gmRequest, { workerUrl, apiKey, ...target }, command, timeoutMs) {
	const gateway = createSshGateway(gmRequest, { workerUrl, apiKey });
	return gateway.exec(target, command, timeoutMs);
}
