import test from 'node:test';
import assert from 'node:assert/strict';
import { TIMING } from '../src/core/constants.js';
import { isAbortError } from '../src/core/utils.js';
import { createPrefs } from '../src/config/prefs.js';
import { createSshClient, SSH_ERROR_TEXT } from '../src/ssh/client.js';

function makeConfiguredPrefs(overrides = {}) {
  const prefs = createPrefs();
  prefs.data = {
    ...prefs.defaults,
    sshBase: 'https://ssh.example.workers.dev',
    sshKey: '0123456789abcdef',
    ...overrides,
  };
  return prefs;
}

const VALID_POD = Object.freeze({
  host: '47.99.123.45',
  port: 22022,
  username: 'root',
  password: 'secret-password',
});

test('createSshClient.endpoint normalizes valid gateway URLs and rejects invalid ones', () => {
  const client = createSshClient({ prefs: makeConfiguredPrefs() });

  assert.equal(client.endpoint('https://ssh.example.workers.dev'), 'https://ssh.example.workers.dev/v1/ssh/exec');
  assert.equal(client.endpoint('https://ssh.example.workers.dev/'), 'https://ssh.example.workers.dev/v1/ssh/exec');
  assert.equal(client.endpoint('https://ssh.example.workers.dev/console'), 'https://ssh.example.workers.dev/v1/ssh/exec');
  assert.equal(client.endpoint('https://ssh.example.workers.dev/console/'), 'https://ssh.example.workers.dev/v1/ssh/exec');
  assert.equal(client.endpoint('https://ssh.example.workers.dev/v1/ssh/exec'), 'https://ssh.example.workers.dev/v1/ssh/exec');
  assert.equal(client.endpoint('https://ssh.example.workers.dev/gw/v1/ssh/exec?a=1#h'), 'https://ssh.example.workers.dev/gw/v1/ssh/exec');
  assert.equal(client.endpoint('https://ssh.example.workers.dev/sub/'), 'https://ssh.example.workers.dev/sub/v1/ssh/exec');

  assert.throws(() => client.endpoint(''), /尚未填写 SSH 网关地址/);
  assert.throws(() => client.endpoint('not-a-url'), /格式无效/);
  assert.throws(() => client.endpoint('ftp://ssh.example.workers.dev'), /仅支持 HTTP 或 HTTPS/);
});

test('createSshClient.exec sends canonical GM_xmlhttpRequest payload, clamps timeouts, and parses output', async () => {
  const prevGm = Object.getOwnPropertyDescriptor(globalThis, 'GM_xmlhttpRequest');
  const captured = [];

  globalThis.GM_xmlhttpRequest = config => {
    captured.push(config);
    queueMicrotask(() => {
      config.onload({
        status: 200,
        responseText: JSON.stringify({
          stdout: 'hello\n',
          stderr: '',
          exitCode: 0,
          truncated: false,
          requestId: 'req-123',
          durationMs: 42,
        }),
      });
    });
    return { abort() {} };
  };

  try {
    const client = createSshClient({
      prefs: makeConfiguredPrefs({ sshBase: 'https://ssh.example.workers.dev/console/' }),
    });

    const result = await client.exec(VALID_POD, 'echo hello');
    assert.deepEqual(result, {
      stdout: 'hello\n',
      stderr: '',
      exitCode: 0,
      exitSignal: undefined,
      truncated: false,
      status: undefined,
      durationMs: 42,
      requestId: 'req-123',
    });

    assert.equal(captured.length, 1);
    const req = captured[0];
    assert.equal(req.method, 'POST');
    assert.equal(req.url, 'https://ssh.example.workers.dev/v1/ssh/exec');
    assert.deepEqual(req.headers, {
      Authorization: 'Bearer 0123456789abcdef',
      'Content-Type': 'application/json',
    });
    assert.equal(req.anonymous, true);
    assert.equal(req.redirect, 'error');
    assert.equal(req.responseType, 'text');
    assert.equal(req.timeout, TIMING.sshExecTimeout + TIMING.sshGatewayPadding);
    assert.deepEqual(JSON.parse(req.data), {
      host: '47.99.123.45',
      port: 22022,
      username: 'root',
      password: 'secret-password',
      command: 'echo hello',
      timeoutMs: TIMING.sshExecTimeout,
    });

    // Timeout clamping (500 -> 1000, 99999 -> 30000) and optional hostKeyFingerprint
    await client.exec(VALID_POD, 'id', {
      timeoutMs: 500,
      hostKeyFingerprint: 'SHA256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    await client.exec(VALID_POD, 'id', { timeoutMs: 99999 });

    assert.equal(captured[1].timeout, 1000 + TIMING.sshGatewayPadding);
    assert.deepEqual(JSON.parse(captured[1].data), {
      host: '47.99.123.45',
      port: 22022,
      username: 'root',
      password: 'secret-password',
      command: 'id',
      timeoutMs: 1000,
      hostKeyFingerprint: 'SHA256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    assert.equal(captured[2].timeout, 30000 + TIMING.sshGatewayPadding);
    assert.equal(JSON.parse(captured[2].data).timeoutMs, 30000);
  } finally {
    if (prevGm) Object.defineProperty(globalThis, 'GM_xmlhttpRequest', prevGm);
    else delete globalThis.GM_xmlhttpRequest;
  }
});

test('createSshClient.exec maps gateway errors distinctly and preserves AbortSignal cancellation', async () => {
  const cases = [
    [401, 'UNAUTHORIZED', SSH_ERROR_TEXT.UNAUTHORIZED],
    [403, 'TARGET_NOT_ALLOWED', SSH_ERROR_TEXT.TARGET_NOT_ALLOWED],
    [502, 'SSH_AUTH_FAILED', SSH_ERROR_TEXT.SSH_AUTH_FAILED],
    [502, 'SSH_CONNECTION_FAILED', SSH_ERROR_TEXT.SSH_CONNECTION_FAILED],
    [504, 'SSH_TIMEOUT', SSH_ERROR_TEXT.SSH_TIMEOUT],
    [413, 'BODY_TOO_LARGE', SSH_ERROR_TEXT.BODY_TOO_LARGE],
  ];

  for (const [status, code, expectedMessage] of cases) {
    const client = createSshClient({
      prefs: makeConfiguredPrefs(),
      transport: async () => ({
        status,
        responseText: JSON.stringify({
          requestId: 'req-err',
          durationMs: 12,
          error: { code },
        }),
      }),
    });

    await assert.rejects(
      client.exec(VALID_POD, 'echo hello'),
      err => err.code === code
        && typeof err.code === 'string'
        && err.code !== 401
        && err.status === status
        && err.requestId === 'req-err'
        && err.message === expectedMessage,
    );
  }

  // Non-JSON Cloudflare 1102 HTML error response
  const htmlClient = createSshClient({
    prefs: makeConfiguredPrefs(),
    transport: async () => ({
      status: 500,
      responseText: '<html><body>Error 1102 Worker exceeded limits</body></html>',
    }),
  });
  await assert.rejects(
    htmlClient.exec(VALID_POD, 'echo hello'),
    err => err.code === 'INVALID_RESPONSE' && err.status === 500 && err.message.includes('Cloudflare 1102'),
  );

  // Unconfigured prefs & incomplete pod/command validation
  const unconfigured = createSshClient({ prefs: createPrefs() });
  await assert.rejects(unconfigured.exec(VALID_POD, 'echo hello'), /尚未配置有效的远程 SSH 网关/);

  const validClient = createSshClient({ prefs: makeConfiguredPrefs() });
  await assert.rejects(validClient.exec({ host: '', port: 22, username: 'root', password: 'pw' }, 'echo'), /不完整/);
  await assert.rejects(validClient.exec(VALID_POD, '   '), /不完整/);

  // AbortSignal cancellation rejects promptly with AbortError
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(validClient.exec(VALID_POD, 'echo hello', { signal: ac.signal }), err => isAbortError(err));
});
