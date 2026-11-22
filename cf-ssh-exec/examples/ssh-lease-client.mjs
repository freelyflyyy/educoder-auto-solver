function postJson(gmRequest, url, bearer, payload, timeout) {
	return new Promise((resolve, reject) => {
		gmRequest({
			method: 'POST',
			url,
			headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
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
					reject(new Error(`Worker 返回了非 JSON 响应（HTTP ${response.status}）`));
					return;
				}
				resolve({ status: response.status, body });
			},
			onerror: () => reject(new Error('请求失败，结果未知')),
			ontimeout: () => reject(new Error('客户端等待超时，结果未知')),
			onabort: () => reject(new Error('请求已中断，结果未知')),
		});
	});
}

function executionTimeout(timeoutMs) {
	if (timeoutMs !== undefined && (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 30000)) {
		throw new Error('timeoutMs 必须是 1000 至 30000 的整数');
	}
	return (timeoutMs ?? 20000) + 5000;
}

// The authenticated provisioning service must provide the assignment.
export async function openAssignedSsh(gmRequest, workerUrl, assignment) {
	const worker = new URL(workerUrl);
	if (worker.protocol !== 'https:' || worker.username || worker.password) throw new Error('Worker 必须使用 HTTPS');
	const { host, port, username, password, claimCode } = assignment;
	if (typeof claimCode !== 'string' || !/^[a-f0-9]{64}$/.test(claimCode)) throw new Error('本次分配缺少有效的领取凭证');
	const address = { host, port, username };
	const lease = await postJson(gmRequest, worker.origin + '/v1/ssh/lease', claimCode, address, 5000);
	const token = lease.body?.executionToken;
	const expiresAt = lease.body?.expiresAt;
	if (lease.status !== 200 || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || !Number.isSafeInteger(expiresAt)) {
		throw new Error(`本次实例租约无法领取（HTTP ${lease.status}）`);
	}

	return {
		expiresAt,
		async exec(command, timeoutMs) {
			if (Date.now() >= expiresAt) throw new Error('本次实例租约已过期');
			return postJson(gmRequest, worker.origin + '/v1/ssh/exec', token,
				{ ...address, password, command, timeoutMs }, executionTimeout(timeoutMs));
		},
	};
}

export async function executeAssignedSsh(gmRequest, workerUrl, assignment, command, timeoutMs) {
	executionTimeout(timeoutMs);
	const session = await openAssignedSsh(gmRequest, workerUrl, assignment);
	return session.exec(command, timeoutMs);
}
