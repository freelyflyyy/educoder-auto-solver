import test from 'node:test';
import assert from 'node:assert/strict';
import { MSG_LEVEL, TIMING } from '../src/core/constants.js';
import { abortError, isAbortError } from '../src/core/utils.js';
import {
  shellQuote,
  encodeBase64,
  createSshSession,
} from '../src/ssh/session.js';

function makeStageModel(overrides = {}) {
  return {
    title: '第 1 关 UML 类图',
    position: 1,
    shixunId: 'ms-1',
    gameDbId: 555,
    env: { tab_type: 3, shixun_environment_id: 88 },
    ...overrides,
  };
}

test('shellQuote and encodeBase64 behave as clean pure helpers', () => {
  assert.equal(shellQuote('/data/workspace/my file.py'), `'/data/workspace/my file.py'`);
  assert.equal(shellQuote(`a'b`), `'a'\\''b'`);
  assert.equal(shellQuote(`$HOME \`id\``), `'$HOME \`id\`'`);

  assert.equal(Buffer.from(encodeBase64('hello\n'), 'base64').toString('utf8'), 'hello\n');
  const utf8Text = '你好，头歌 StarUML 评测！\n第二行';
  assert.equal(Buffer.from(encodeBase64(utf8Text), 'base64').toString('utf8'), utf8Text);

  const raw = new Uint8Array([0, 1, 2, 254, 255]);
  assert.deepEqual(new Uint8Array(Buffer.from(encodeBase64(raw), 'base64')), raw);

  const large = new Uint8Array(42 * 1024);
  for (let i = 0; i < large.length; i += 1) large[i] = i & 0xff;
  assert.deepEqual(new Uint8Array(Buffer.from(encodeBase64(large), 'base64')), large);
});

test('createSshSession.open validates params, is idempotent per session, requests the environment once, and honors close()', async () => {
  const key = { gameId: 'g1', homeworkId: 1 };

  const missingSession = createSshSession({ api: {}, sshClient: {} });
  assert.equal(missingSession.isOpen(), false);
  await assert.rejects(missingSession.open(makeStageModel({ shixunId: '' }), key), /无法初始化容器/);
  await assert.rejects(missingSession.exec('echo hi'), /实验容器尚未初始化/);
  await assert.rejects(missingSession.writeFile('/tmp/a.txt', 'hi'), /实验容器尚未初始化/);

  // Idempotent open within one session, and close() resets cleanly for a new open()
  let envCalls = 0;
  let receivedArgs = null;
  const session = createSshSession({
    api: {
      async startEnv(shixunId, params, signal) {
        envCalls += 1;
        receivedArgs = { shixunId, params, signal };
        return {
          status: 0,
          data: {
            ssh_address: `47.99.1.${envCalls}`,
            port: 22022,
            username: 'root',
            password: 'secret',
            remaining_time: 600000,
          },
        };
      },
    },
    sshClient: {},
  });
  const pod1 = await session.open(makeStageModel(), key);
  const pod2 = await session.open(makeStageModel({ position: 2, gameDbId: 556 }), key);
  assert.equal(session.isOpen(), true);
  assert.equal(session.currentPod(), pod1);
  assert.equal(pod1, pod2);
  assert.equal(envCalls, 1);
  assert.deepEqual(receivedArgs, {
    shixunId: 'ms-1',
    params: { envId: 88, gameDbId: 555, tabType: 3, homeworkId: 1 },
    signal: null,
  });

  session.close();
  assert.equal(session.isOpen(), false);
  assert.equal(session.currentPod(), null);
  const pod3 = await session.open(makeStageModel(), key);
  assert.equal(envCalls, 2);
  assert.equal(pod3.host, '47.99.1.2');

  // Linear backoff retries on congestion/cold-start, recovery on retry, and VNC-only reclamation
  const origSetTimeout = globalThis.setTimeout;
  const sleepDurations = [];
  globalThis.setTimeout = (fn, ms, ...args) => {
    sleepDurations.push(ms);
    return origSetTimeout(fn, Math.min(ms, 5), ...args);
  };
  try {
    // 1. Exhausting retryable congestion (-2) attempts retries with 4s/8s/12s linear backoff and WARN logs
    let attempts = 0;
    const retryLogs = [];
    const busySession = createSshSession({
      api: {
        async startEnv() {
          attempts += 1;
          const err = new Error('当前平台资源紧张，请稍后重试');
          err.code = -2;
          throw err;
        },
      },
      sshClient: {},
    });
    await assert.rejects(
      busySession.open(makeStageModel(), key, { log: (m, l) => retryLogs.push([m, l]) }),
      /容器启动失败：当前平台资源紧张/,
    );
    assert.equal(attempts, TIMING.envStartAttempts);
    assert.deepEqual(
      sleepDurations,
      Array.from({ length: TIMING.envStartAttempts - 1 }, (_, i) => (i + 1) * TIMING.envStartBackoff),
    );
    assert.equal(
      retryLogs.filter(([m, l]) => m.includes('容器申请未就绪') && l === MSG_LEVEL.WARN).length,
      TIMING.envStartAttempts - 1,
    );

    // 2. Recovering on retry succeeds and stops further retries
    sleepDurations.length = 0;
    let recoverCalls = 0;
    const recoverSession = createSshSession({
      api: {
        async startEnv() {
          recoverCalls += 1;
          if (recoverCalls === 1) {
            const err = new Error('网络超时');
            err.code = 'TIMEOUT';
            throw err;
          }
          return { status: 0, data: { ssh_address: '8.8.8.8', port: 22, username: 'u', password: 'p' } };
        },
      },
      sshClient: {},
    });
    const recoveredPod = await recoverSession.open(makeStageModel(), key);
    assert.equal(recoveredPod.host, '8.8.8.8');
    assert.equal(recoverCalls, 2);
    assert.deepEqual(sleepDurations, [TIMING.envStartBackoff]);

    // 3. VNC-only response (status 0 without SSH host) retries and reclaims once after attempts exhaust
    sleepDurations.length = 0;
    let vncAttempts = 0;
    const vncDeletes = [];
    const vncSession = createSshSession({
      api: {
        async startEnv() {
          vncAttempts += 1;
          return { status: 0, data: {} };
        },
        async exitDeletePod(shixunId, params, signal) {
          vncDeletes.push({ shixunId, params, signal });
        },
      },
      sshClient: {},
    });
    await assert.rejects(vncSession.open(makeStageModel(), key), /容器启动失败/);
    assert.equal(vncAttempts, TIMING.envStartAttempts);
    assert.equal(vncDeletes.length, 1);
    assert.deepEqual(vncDeletes[0], {
      shixunId: 'ms-1',
      params: { envId: 88, gameDbId: 555, tabType: 3, homeworkId: 1 },
      signal: undefined,
    });

    // 4. Status -1 (Educoder pod-quota/start error) retries with linear backoff and can recover;
    // hard errors 403 / -102 fail immediately without sleeping
    sleepDurations.length = 0;
    let quotaCalls = 0;
    const quotaSession = createSshSession({
      api: {
        async startEnv() {
          quotaCalls += 1;
          if (quotaCalls <= 2) {
            const err = new Error('当前实训环境资源紧张或容器已满');
            err.code = -1;
            throw err;
          }
          return { status: 0, data: { ssh_address: '9.9.9.9', port: 22, username: 'u', password: 'p' } };
        },
      },
      sshClient: {},
    });
    const quotaPod = await quotaSession.open(makeStageModel(), key);
    assert.equal(quotaPod.host, '9.9.9.9');
    assert.equal(quotaCalls, 3);
    assert.deepEqual(sleepDurations, [TIMING.envStartBackoff, 2 * TIMING.envStartBackoff]);

    sleepDurations.length = 0;
    let forbiddenCalls = 0;
    const errSession = createSshSession({
      api: {
        async startEnv() {
          forbiddenCalls += 1;
          const err = new Error('无权访问');
          err.code = 403;
          throw err;
        },
      },
      sshClient: {},
    });
    await assert.rejects(errSession.open(makeStageModel(), key), /容器启动失败：无权访问/);
    assert.equal(forbiddenCalls, 1);
    assert.equal(sleepDurations.length, 0);

    let sigErrCalls = 0;
    const badSigSession = createSshSession({
      api: {
        async startEnv() {
          sigErrCalls += 1;
          const err = new Error('接口签名校验未通过');
          err.code = -102;
          throw err;
        },
      },
      sshClient: {},
    });
    await assert.rejects(badSigSession.open(makeStageModel(), key), /容器启动失败：接口签名校验未通过/);
    assert.equal(sigErrCalls, 1);
    assert.equal(sleepDurations.length, 0);
  } finally {
    globalThis.setTimeout = origSetTimeout;
  }

  // 5. 401 auth passthrough does not retry
  let authCalls = 0;
  const authSession = createSshSession({
    api: {
      async startEnv() {
        authCalls += 1;
        const err = new Error('登录状态已过期');
        err.code = 401;
        throw err;
      },
    },
    sshClient: {},
  });
  await assert.rejects(authSession.open(makeStageModel(), key), err => err.code === 401);
  assert.equal(authCalls, 1);

  // 6. Pre-aborted AbortSignal skips startEnv and mid-backoff abort cancels promptly
  const preAborted = new AbortController();
  let abortedStartCalls = 0;
  const abortSession = createSshSession({
    api: {
      async startEnv() {
        abortedStartCalls += 1;
        const err = new Error('网络错误');
        err.code = 'NETWORK';
        throw err;
      },
    },
    sshClient: {},
  });
  preAborted.abort();
  await assert.rejects(
    abortSession.open(makeStageModel(), key, { signal: preAborted.signal }),
    err => isAbortError(err),
  );
  assert.equal(abortedStartCalls, 0);

  const midAbort = new AbortController();
  const startedAt = Date.now();
  setTimeout(() => midAbort.abort(), 15);
  await assert.rejects(
    abortSession.open(makeStageModel(), key, { signal: midAbort.signal }),
    err => isAbortError(err),
  );
  assert.ok(Date.now() - startedAt < 500, 'abort during retry sleep must cancel promptly');
});

test('createSshSession.destroy releases leased pod idempotently and ignores remote teardown failures', async () => {
  const key = { gameId: 'g1', homeworkId: 9 };

  // 1. No-op when no pod has ever been opened
  let idleDeleteCalls = 0;
  const idleSession = createSshSession({
    api: {
      async exitDeletePod() { idleDeleteCalls += 1; },
    },
    sshClient: {},
  });
  assert.equal(await idleSession.destroy(), false);
  assert.equal(idleDeleteCalls, 0);

  // 2. Destroying an open session clears state, calls exitDeletePod once without signal, and is idempotent
  const deleteCalls = [];
  const logs = [];
  const session = createSshSession({
    api: {
      async startEnv() {
        return {
          status: 0,
          data: { ssh_address: '47.99.1.9', port: 22022, username: 'root', password: 'pw' },
        };
      },
      async exitDeletePod(shixunId, params, signal) {
        deleteCalls.push({ shixunId, params, signal });
        return { status: 0 };
      },
    },
    sshClient: {},
  });
  await session.open(makeStageModel(), key);
  assert.equal(session.isOpen(), true);
  assert.equal(await session.destroy({ log: (m, l) => logs.push([m, l]) }), true);
  assert.equal(session.isOpen(), false);
  assert.equal(session.currentPod(), null);
  assert.deepEqual(deleteCalls, [{
    shixunId: 'ms-1',
    params: { envId: 88, gameDbId: 555, tabType: 3, homeworkId: 9 },
    signal: undefined,
  }]);
  assert.ok(logs.some(([m, l]) => m.includes('已释放容器实例') && l === MSG_LEVEL.INFO));
  assert.equal(await session.destroy({ log: (m, l) => logs.push([m, l]) }), false);
  assert.equal(deleteCalls.length, 1);

  // 3. Remote exitDeletePod errors degrade to a WARN log without throwing or retaining stale state
  const warnLogs = [];
  const failingSession = createSshSession({
    api: {
      async startEnv() {
        return {
          status: 0,
          data: { ssh_address: '47.99.1.10', port: 22022, username: 'root', password: 'pw' },
        };
      },
      async exitDeletePod() {
        throw new Error('pod already recycled');
      },
    },
    sshClient: {},
  });
  await failingSession.open(makeStageModel(), key);
  assert.equal(await failingSession.destroy({ log: (m, l) => warnLogs.push([m, l]) }), false);
  assert.equal(failingSession.isOpen(), false);
  assert.ok(warnLogs.some(([m, l]) => m.includes('释放容器失败：pod already recycled') && l === MSG_LEVEL.WARN));
});

test('createSshSession.exec, probe, and readFile operate scoped to one session', async () => {
  const key = { gameId: 'g1', homeworkId: 1 };
  const okApi = {
    async startEnv() {
      return {
        status: 0,
        data: { ssh_address: '47.99.1.2', port: 22022, username: 'root', password: 'secret' },
      };
    },
  };

  // 1. probe retries once on SSH_CONNECTION_FAILED when retryConnect=true
  const origSetTimeout = globalThis.setTimeout;
  const sleepDurations = [];
  globalThis.setTimeout = (fn, ms, ...args) => {
    sleepDurations.push(ms);
    return origSetTimeout(fn, Math.min(ms, 5), ...args);
  };
  try {
    let probeCalls = 0;
    const retryLogs = [];
    const probeSession = createSshSession({
      api: okApi,
      sshClient: {
        async exec(_pod, cmd) {
          probeCalls += 1;
          assert.equal(cmd, 'echo hello');
          if (probeCalls === 1) {
            const err = new Error('无法连接到容器 SSH 端口');
            err.code = 'SSH_CONNECTION_FAILED';
            throw err;
          }
          return { stdout: 'hello\n', stderr: '', exitCode: 0, truncated: false, durationMs: 40, requestId: 'r1' };
        },
      },
    });
    await probeSession.open(makeStageModel(), key);
    const probeRes = await probeSession.probe({ log: (m, l) => retryLogs.push([m, l]) });
    assert.deepEqual(probeRes, { ok: true, detail: 'hello', durationMs: 40 });
    assert.equal(probeCalls, 2);
    assert.ok(sleepDurations.includes(TIMING.sshConnectRetryGap));
    assert.ok(retryLogs.some(([msg, lvl]) => msg.includes('端口尚未就绪') && lvl === MSG_LEVEL.WARN));
  } finally {
    globalThis.setTimeout = origSetTimeout;
  }

  let noRetryCalls = 0;
  const failExecSession = createSshSession({
    api: okApi,
    sshClient: {
      async exec() {
        noRetryCalls += 1;
        const err = new Error('无法连接到容器 SSH 端口');
        err.code = 'SSH_CONNECTION_FAILED';
        throw err;
      },
    },
  });
  await failExecSession.open(makeStageModel(), key);
  await assert.rejects(
    failExecSession.exec('cat /data/protectspace/evaluate.sh'),
    err => err.code === 'SSH_CONNECTION_FAILED',
  );
  assert.equal(noRetryCalls, 1);

  const badProbeSession = createSshSession({
    api: okApi,
    sshClient: {
      async exec() {
        return { stdout: '', stderr: 'echo: denied', exitCode: 1, truncated: false, durationMs: 12 };
      },
    },
  });
  await badProbeSession.open(makeStageModel(), key);
  assert.deepEqual(await badProbeSession.probe(), {
    ok: false,
    detail: 'echo: denied',
    durationMs: 12,
  });

  // 2. readFile quotes paths, checks errors/truncation, and close() resets open state
  const commands = [];
  const session = createSshSession({
    api: okApi,
    sshClient: {
      async exec(_pod, command) {
        commands.push(command);
        if (command.includes('missing.py')) {
          return { stdout: '', stderr: 'No such file', exitCode: 1, truncated: false };
        }
        if (command.includes('huge.py')) {
          return { stdout: 'partial...', stderr: '', exitCode: 0, truncated: true };
        }
        return { stdout: 'ok', stderr: '', exitCode: 0, truncated: false };
      },
    },
  });
  await session.open(makeStageModel(), key);

  assert.equal(await session.readFile(`/tmp/a'b.txt`), 'ok');
  assert.equal(commands.at(-1), `cat -- '/tmp/a'\\''b.txt'`);
  await assert.rejects(session.readFile('/tmp/missing.py'), /No such file/);
  await assert.rejects(session.readFile('/tmp/huge.py'), /已被截断/);

  session.close();
  assert.equal(session.isOpen(), false);
  await assert.rejects(session.readFile('/tmp/a.txt'), /实验容器尚未初始化/);
});

test('createSshSession.writeFile handles small/large chunked uploads, chmod 577, special paths, validation, and errors', async () => {
  const key = { gameId: 'g1', homeworkId: 1 };
  const okApi = {
    async startEnv() {
      return {
        status: 0,
        data: { ssh_address: '47.99.1.2', port: 22022, username: 'root', password: 'secret' },
      };
    },
  };

  // 1. Validation rejections
  const emptySession = createSshSession({ api: okApi, sshClient: {} });
  await emptySession.open(makeStageModel(), key);
  await assert.rejects(emptySession.writeFile('relative/a.py', 'x'), /有效绝对文件路径/);
  await assert.rejects(emptySession.writeFile('/tmp/dir/', 'x'), /有效绝对文件路径/);
  await assert.rejects(emptySession.writeFile('/tmp/a.py', 'x', { mode: '999' }), /无效的文件权限值/);
  await assert.rejects(emptySession.writeFile('/tmp/a.py', 'x', { mode: 577 }), /无效的文件权限值/);
  await assert.rejects(emptySession.writeFile('/tmp/a.py', 'x', { mode: '577; id' }), /无效的文件权限值/);

  // 2. Small UTF-8 write with mode '577', small write without mode, and special path escaping
  const smallCmds = [];
  const smallSession = createSshSession({
    api: okApi,
    sshClient: {
      async exec(_pod, command) {
        smallCmds.push(command);
        return { stdout: '', stderr: '', exitCode: 0, truncated: false };
      },
    },
  });
  await smallSession.open(makeStageModel(), key);

  const textPayload = '#!/usr/bin/env python3\nprint("你好世界")\n';
  const rSmall = await smallSession.writeFile('/data/workspace/myshixun/run.py', textPayload, { mode: '577' });
  assert.deepEqual(rSmall, { bytes: Buffer.byteLength(textPayload, 'utf8'), chunks: 1 });
  assert.equal(smallCmds.length, 1);
  assert.match(smallCmds[0], /mkdir -p -- "\$dir"/);
  assert.match(smallCmds[0], /base64 -d > "\$tmp"/);
  assert.match(smallCmds[0], /chmod 577 -- "\$tmp"/);
  assert.match(smallCmds[0], /mv -f -- "\$tmp" '\/data\/workspace\/myshixun\/run\.py'/);
  const b64Hit = /printf '%s' '([^']*)' \| base64 -d/.exec(smallCmds[0]);
  assert.ok(b64Hit);
  assert.equal(Buffer.from(b64Hit[1], 'base64').toString('utf8'), textPayload);

  await smallSession.writeFile(`/tmp/a'b/run me.sh`, 'echo hi');
  assert.equal(smallCmds.length, 2);
  assert.doesNotMatch(smallCmds[1], /\bchmod\b/);
  assert.match(smallCmds[1], /mv -f -- "\$tmp" '\/tmp\/a'\\''b\/run me\.sh'/);
  assert.match(smallCmds[1], /trap 'rm -f -- "\$tmp"' EXIT/);

  // 3. Large binary payload (> 4096 Base64 chars) triggers multi-chunk upload & safe finalize
  const bigBytes = new Uint8Array(7500);
  for (let i = 0; i < bigBytes.length; i += 1) bigBytes[i] = (i * 13) & 0xff;
  const bigCmds = [];
  const bigSession = createSshSession({
    api: okApi,
    sshClient: {
      async exec(_pod, command) {
        bigCmds.push(command);
        return { stdout: '', stderr: '', exitCode: 0, truncated: false };
      },
    },
  });
  await bigSession.open(makeStageModel(), key);
  const rBig = await bigSession.writeFile(`/tmp/a'b/model.mdj`, bigBytes, { mode: '577' });
  assert.equal(rBig.bytes, 7500);
  assert.equal(rBig.chunks, 3);
  assert.equal(bigCmds.length, 4);
  for (const cmd of bigCmds) {
    assert.ok(Buffer.byteLength(cmd, 'utf8') < 8192, 'each SSH command must stay well within 8 KiB gateway limit');
  }
  const uploadedChunks = bigCmds.slice(0, 3).map(cmd => /printf '%s' '([^']*)'/.exec(cmd)[1]).join('');
  assert.deepEqual(new Uint8Array(Buffer.from(uploadedChunks, 'base64')), bigBytes);
  assert.match(bigCmds[3], /trap 'rm -f -- "\$tmp" "\$b64"' EXIT/);
  assert.match(bigCmds[3], /chmod 577 -- "\$tmp"/);

  // 4. Error handling: mid-chunk failure invokes rm -f cleanup, abort skips cleanup
  const failBigCmds = [];
  let failCall = 0;
  const failSession = createSshSession({
    api: okApi,
    sshClient: {
      async exec(_pod, command) {
        failCall += 1;
        failBigCmds.push(command);
        if (failCall === 2) return { stdout: '', stderr: 'io error', exitCode: 1 };
        return { stdout: '', stderr: '', exitCode: 0 };
      },
    },
  });
  await failSession.open(makeStageModel(), key);
  await assert.rejects(
    failSession.writeFile('/tmp/big.bin', bigBytes),
    /分片上传失败（2\/3）：io error/,
  );
  assert.equal(failBigCmds.length, 3);
  assert.match(failBigCmds[2], /^rm -f -- '\/tmp\/\.tg_b64_/);

  const ac = new AbortController();
  const abortCmds = [];
  const abortSession = createSshSession({
    api: okApi,
    sshClient: {
      async exec(_pod, command) {
        abortCmds.push(command);
        ac.abort();
        throw abortError();
      },
    },
  });
  await abortSession.open(makeStageModel(), key);
  await assert.rejects(
    abortSession.writeFile('/tmp/big.bin', bigBytes, { signal: ac.signal }),
    err => isAbortError(err),
  );
  assert.equal(abortCmds.length, 1, 'aborted upload must not invoke cleanup rm command');
});
