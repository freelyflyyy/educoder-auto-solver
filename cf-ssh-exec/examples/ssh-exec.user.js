// ==UserScript==
// @name         Worker SSH 远程执行助手
// @namespace    cf-ssh-exec
// @version      1.1.0
// @description  通过个人 Cloudflare Worker 网关 (SSH_API_KEY) 在脚本猫中直接执行远程 SSH 命令
// @match        https://*.workers.dev/console
// @connect      *.workers.dev
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @inject-into  content
// @noframes
// ==/UserScript==

(() => {
	'use strict';

	if (location.protocol !== 'https:' || location.pathname !== '/console') return;

	const endpoint = `${location.origin}/v1/ssh/exec`;
	const defaultTimeoutMs = 20_000;

	let currentDialog;
	GM_registerMenuCommand('执行 SSH 命令', () => {
		if (currentDialog) return;
		currentDialog = showDialog();
	});

	function addInput(form, title, properties) {
		const label = document.createElement('label');
		label.textContent = title;
		label.style.cssText = 'display:grid;gap:.2rem;font-size:.9rem';
		const field = document.createElement('input');
		Object.assign(field, { required: true, autocomplete: 'off', spellcheck: false }, properties);
		label.append(field);
		form.append(label);
		return field;
	}

	function showDialog() {
		const dialog = document.createElement('dialog');
		dialog.style.cssText = 'width:min(32rem,calc(100vw - 4rem));max-height:85vh;overflow:auto;padding:1.25rem;border-radius:10px';
		dialog.setAttribute('aria-labelledby', 'cf-ssh-exec-title');

		const heading = document.createElement('h2');
		heading.id = 'cf-ssh-exec-title';
		heading.textContent = '执行远程 SSH 命令';
		heading.style.cssText = 'margin:0 0 .75rem 0;font-size:1.15rem';

		const form = document.createElement('form');
		form.style.cssText = 'display:grid;gap:.65rem';
		form.autocomplete = 'off';

		const apiKey = addInput(form, '网关密钥 (SSH_API_KEY)', {
			type: 'password',
			minLength: 16,
			maxLength: 512,
			placeholder: '16~512 位密钥',
		});
		const host = addInput(form, 'SSH 目标公网 IPv4', { type: 'text', placeholder: '例如 47.99.123.45' });
		const port = addInput(form, '端口', { type: 'number', min: '1', max: '65535', value: '22' });
		const username = addInput(form, 'SSH 用户名', { type: 'text', value: 'root' });
		const password = addInput(form, 'SSH 密码', { type: 'password' });
		const command = addInput(form, '执行命令', { type: 'text', value: 'uname -a && uptime' });
		const fingerprint = addInput(form, '主机公钥指纹（可选，留空直接连接）', {
			type: 'text',
			required: false,
			placeholder: 'SHA256:...',
		});
		const timeout = addInput(form, '超时（毫秒，1000~30000）', {
			type: 'number',
			required: false,
			min: '1000',
			max: '30000',
			placeholder: '20000',
		});

		const actions = document.createElement('div');
		actions.style.cssText = 'display:flex;gap:.5rem;margin-top:.25rem';
		const run = document.createElement('button');
		run.type = 'submit';
		run.textContent = '执行';
		const close = document.createElement('button');
		close.type = 'button';
		close.textContent = '关闭';
		actions.append(run, close);
		form.append(actions);

		const report = document.createElement('pre');
		report.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;margin-top:.75rem;font-size:.85rem';
		report.setAttribute('aria-live', 'polite');
		dialog.append(heading, form, report);

		let running = false;
		let request;

		function finish(message) {
			if (!running) return;
			running = false;
			request = undefined;
			run.disabled = false;
			report.textContent = message;
		}

		form.addEventListener('submit', (event) => {
			event.preventDefault();
			if (running || !form.reportValidity()) return;

			const input = {
				host: host.value.trim(),
				port: port.valueAsNumber,
				username: username.value.trim(),
				password: password.value,
				command: command.value,
			};
			if (fingerprint.value.trim() !== '') input.hostKeyFingerprint = fingerprint.value.trim();
			if (timeout.value !== '') input.timeoutMs = timeout.valueAsNumber;

			if (!input.host || !input.username || !input.command.trim()) {
				report.textContent = '目标 IPv4、用户名和命令均需填写。';
				return;
			}

			const authorization = `Bearer ${apiKey.value.trim()}`;
			password.value = '';
			running = true;
			run.disabled = true;
			report.textContent = '正在通过 Worker 建立 SSH 连接并执行…';

			try {
				request = GM_xmlhttpRequest({
					method: 'POST',
					url: endpoint,
					headers: { Authorization: authorization, 'Content-Type': 'application/json' },
					data: JSON.stringify(input),
					timeout: (input.timeoutMs ?? defaultTimeoutMs) + 5_000,
					responseType: 'text',
					anonymous: true,
					redirect: 'error',
					onload: (response) => finish(formatResponse(response)),
					onerror: () => finish('请求失败或发生重定向，执行结果未知。'),
					ontimeout: () => finish('客户端等待超时，执行结果未知。'),
					onabort: () => finish('请求已中断，执行结果未知。'),
				});
			} catch {
				finish('脚本猫无法发起请求，请检查脚本的 @connect 权限。');
			}
		});

		close.addEventListener('click', () => dialog.close());
		dialog.addEventListener('close', () => {
			running = false;
			request?.abort();
			request = undefined;
			apiKey.value = '';
			password.value = '';
			dialog.remove();
			currentDialog = undefined;
		}, { once: true });

		document.body.append(dialog);
		dialog.showModal();
		return dialog;
	}

	function formatResponse(response) {
		const status = `HTTP ${response.status ?? '未知'}`;
		const text = response.responseText ?? response.response;
		let body;
		try {
			body = JSON.parse(text);
		} catch {
			const edgeError = typeof text === 'string' && text.match(/\b(1102|1027)\b/);
			return `${status} · 非 JSON 响应${edgeError ? ` · Cloudflare ${edgeError[1]}` : ''}\n执行结果未知。`;
		}
		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			return `${status} · 响应格式异常\n执行结果未知。`;
		}

		const lines = [status];
		if (typeof body.requestId === 'string') lines.push(`请求 ID ${body.requestId}`);
		if (typeof body.durationMs === 'number') lines.push(`用时 ${body.durationMs} ms`);
		if (typeof body.error?.code === 'string') lines.push(`错误 ${body.error.code}`);
		if (typeof body.exitCode === 'number') lines.push(`退出码 ${body.exitCode}`);
		else if (body.exitCode === null) lines.push('退出码未知');
		if (typeof body.exitSignal === 'string') lines.push(`退出信号 ${body.exitSignal}`);
		if (body.truncated === true) lines.push('输出已截断');
		if (typeof body.stdout === 'string') lines.push('', 'stdout', body.stdout);
		if (typeof body.stderr === 'string') lines.push('', 'stderr', body.stderr);
		return lines.join('\n');
	}
})();
