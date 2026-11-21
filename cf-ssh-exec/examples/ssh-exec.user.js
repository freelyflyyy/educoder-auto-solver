// ==UserScript==
// @name         Worker SSH 执行
// @namespace    cf-ssh-exec
// @version      1.0.0
// @description  从脚本猫菜单向自己的 Worker 提交一次 SSH 执行请求
// @match        https://ssh-api.example.com/console
// @connect      ssh-api.example.com
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @inject-into  content
// @noframes
// ==/UserScript==

(() => {
	'use strict';

	// 修改这里的 Worker 地址，以及上面的 @match、@connect。
	const endpoint = new URL('https://ssh-api.example.com/v1/ssh/exec');
	const defaultTimeoutMs = 20_000;
	if (
		endpoint.protocol !== 'https:' ||
		location.origin !== endpoint.origin ||
		location.pathname !== '/console'
	) return;

	let currentDialog;
	GM_registerMenuCommand('执行 SSH 命令', () => {
		if (currentDialog) return;
		currentDialog = showDialog();
	});

	function addInput(form, title, properties) {
		const label = document.createElement('label');
		label.textContent = title;
		label.style.cssText = 'display:grid;gap:.2rem';
		const field = document.createElement('input');
		Object.assign(field, { required: true, autocomplete: 'off', spellcheck: false }, properties);
		label.append(field);
		form.append(label);
		return field;
	}

	function showDialog() {
		const dialog = document.createElement('dialog');
		dialog.style.cssText = 'width:min(32rem,calc(100vw - 4rem));max-height:85vh;overflow:auto';
		dialog.setAttribute('aria-labelledby', 'cf-ssh-exec-title');

		const heading = document.createElement('h2');
		heading.id = 'cf-ssh-exec-title';
		heading.textContent = '执行 SSH 命令';
		const form = document.createElement('form');
		form.style.cssText = 'display:grid;gap:.65rem';
		form.autocomplete = 'off';

		const token = addInput(form, '本次目标的执行 Token', { type: 'password', pattern: '[a-f0-9]{64}' });
		const host = addInput(form, 'SSH 目标 IPv4', { type: 'text' });
		const port = addInput(form, '端口', { type: 'number', min: '1', max: '65535', value: '22' });
		const username = addInput(form, 'SSH 用户名', { type: 'text' });
		const password = addInput(form, 'SSH 密码', { type: 'password' });
		const command = addInput(form, '命令', { type: 'text', value: 'uptime' });
		const timeout = addInput(form, '超时（毫秒）', {
			type: 'number', required: false, min: '1000', max: '30000', placeholder: '20000',
		});

		const actions = document.createElement('div');
		actions.style.cssText = 'display:flex;gap:.5rem';
		const run = document.createElement('button');
		run.type = 'submit';
		run.textContent = '执行';
		const close = document.createElement('button');
		close.type = 'button';
		close.textContent = '关闭';
		actions.append(run, close);
		form.append(actions);

		const report = document.createElement('pre');
		report.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere';
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
			if (timeout.value !== '') input.timeoutMs = timeout.valueAsNumber;
			if (!input.host || !input.username || !input.command.trim()) {
				report.textContent = '目标 IPv4、用户名和命令均需填写。';
				return;
			}

			const authorization = `Bearer ${token.value}`;
			token.value = '';
			password.value = '';
			running = true;
			run.disabled = true;
			report.textContent = '等待执行结果…';

			try {
				request = GM_xmlhttpRequest({
					method: 'POST',
					url: endpoint.href,
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
				finish('脚本猫无法发起请求，请检查脚本的 @connect 和 Worker 地址。');
			}
		});

		close.addEventListener('click', () => dialog.close());
		dialog.addEventListener('close', () => {
			running = false;
			request?.abort();
			request = undefined;
			token.value = '';
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
