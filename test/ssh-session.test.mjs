import test from 'node:test';
import assert from 'node:assert/strict';
import { MSG_LEVEL, TIMING } from '../src/core/constants.js';
import { abortError, isAbortError } from '../src/core/utils.js';
import {
  shellQuote,
  encodeBase64,
  isPlaceholderEvaluateEntry,
  parseEvaluateScript,
  resolveStageTarget,
  createSshSession,
} from '../src/ssh/session.js';

const SAMPLE_EVALUATE_SH = `#!/bin/bash

cd /data/workspace/myshixun

# 待执行的评测文件
sourceClassNames=("secret/evaluate/evaluate_detail_1.py" "secret/evaluate/evaluate_detail_2.py" "secret/evaluate/evaluate_detail_3.py" "secret/evaluate/evaluate_detail_4.py" "secret/evaluate/evaluate_detail_5.py")

# 执行命令
executeCommand="python3"

execute $1
`;

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

test('shellQuote, encodeBase64, parseEvaluateScript, and resolveStageTarget behave as clean pure helpers', () => {
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

  const parsed = parseEvaluateScript(SAMPLE_EVALUATE_SH);
  assert.deepEqual(parsed, {
    workdir: '/data/workspace/myshixun',
    executeCommand: 'python3',
    sourceClassNames: [
      'secret/evaluate/evaluate_detail_1.py',
      'secret/evaluate/evaluate_detail_2.py',
      'secret/evaluate/evaluate_detail_3.py',
      'secret/evaluate/evaluate_detail_4.py',
      'secret/evaluate/evaluate_detail_5.py',
    ],
  });

  const multiline = [
    '#!/bin/bash\r\n',
    'cd "/data/workspace/custom dir/"\r\n',
    'executeCommand=\'bash -e\'\r\n',
    'sourceClassNames=(\r\n',
    '  \'stage 1.py\' # first stage comment\r\n',
    '  # full comment line\r\n',
    '  "dir/stage#2.py"\r\n',
    '  bare_stage_3.sh\r\n',
    ')\r\n',
  ].join('');
  assert.deepEqual(parseEvaluateScript(multiline), {
    workdir: '/data/workspace/custom dir/',
    executeCommand: 'bash -e',
    sourceClassNames: [
      'stage 1.py',
      'dir/stage#2.py',
      'bare_stage_3.sh',
    ],
  });

  assert.deepEqual(parseEvaluateScript('#!/bin/bash\necho noop\n'), {
    workdir: '/data/workspace/myshixun',
    executeCommand: '',
    sourceClassNames: [],
  });

  assert.deepEqual(resolveStageTarget(parsed, 1), {
    ...parsed,
    position: 1,
    inRange: true,
    unused: false,
    hasScript: true,
    rawEntry: 'secret/evaluate/evaluate_detail_1.py',
    scriptRel: 'secret/evaluate/evaluate_detail_1.py',
    scriptAbs: '/data/workspace/myshixun/secret/evaluate/evaluate_detail_1.py',
  });
  assert.deepEqual(resolveStageTarget(parsed, 0), {
    ...parsed,
    position: 0,
    inRange: false,
    unused: false,
    hasScript: false,
    rawEntry: '',
    scriptRel: '',
    scriptAbs: '',
  });
  assert.deepEqual(resolveStageTarget(parsed, 6), {
    ...parsed,
    position: 6,
    inRange: false,
    unused: false,
    hasScript: false,
    rawEntry: '',
    scriptRel: '',
    scriptAbs: '',
  });
  assert.equal(resolveStageTarget({
    workdir: '/data/workspace/sub/',
    executeCommand: 'python3',
    sourceClassNames: ['/opt/eval/s1.py', 'rel/s2.py'],
  }, 1).scriptAbs, '/opt/eval/s1.py');
});

test('parseEvaluateScript & resolveStageTarget handle mixed empty/"1" placeholders and parentheses in quoted filenames', () => {
  const mixedScript = [
    '#!/bin/bash',
    'cd /data/workspace/myshixun',
    'sourceClassNames=("" "1" "" "newtest3/test3(1).py" "1" "step6/run.py" "step7/run.py" "step8/run.py" "step9/run.py" "step10/run.py" "step11/run.py" "1" "newtest7/test7.py" "")',
    'executeCommand="python3"',
  ].join('\n');

  const parsed = parseEvaluateScript(mixedScript);
  assert.deepEqual(parsed.sourceClassNames, [
    '',
    '1',
    '',
    'newtest3/test3(1).py',
    '1',
    'step6/run.py',
    'step7/run.py',
    'step8/run.py',
    'step9/run.py',
    'step10/run.py',
    'step11/run.py',
    '1',
    'newtest7/test7.py',
    '',
  ]);
  assert.equal(parsed.sourceClassNames.length, 14);
  assert.equal(parsed.executeCommand, 'python3');

  assert.equal(isPlaceholderEvaluateEntry(''), true);
  assert.equal(isPlaceholderEvaluateEntry('  '), true);
  assert.equal(isPlaceholderEvaluateEntry('1'), true);
  assert.equal(isPlaceholderEvaluateEntry('step6/run.py'), false);

  for (const [pos, expectedRaw] of [[1, ''], [2, '1'], [3, ''], [5, '1'], [12, '1'], [14, '']]) {
    const stage = resolveStageTarget(parsed, pos);
    assert.equal(stage.inRange, true);
    assert.equal(stage.unused, true);
    assert.equal(stage.hasScript, false);
    assert.equal(stage.rawEntry, expectedRaw);
    assert.equal(stage.scriptRel, '');
    assert.equal(stage.scriptAbs, '');
  }

  const stage4 = resolveStageTarget(parsed, 4);
  assert.equal(stage4.inRange, true);
  assert.equal(stage4.unused, false);
  assert.equal(stage4.hasScript, true);
  assert.equal(stage4.scriptRel, 'newtest3/test3(1).py');
  assert.equal(stage4.scriptAbs, '/data/workspace/myshixun/newtest3/test3(1).py');

  const stage6 = resolveStageTarget(parsed, 6);
  assert.equal(stage6.scriptRel, 'step6/run.py');
  assert.equal(stage6.scriptAbs, '/data/workspace/myshixun/step6/run.py');

  const stage13 = resolveStageTarget(parsed, 13);
  assert.equal(stage13.scriptRel, 'newtest7/test7.py');
  assert.equal(stage13.scriptAbs, '/data/workspace/myshixun/newtest7/test7.py');

  const stage15 = resolveStageTarget(parsed, 15);
  assert.equal(stage15.inRange, false);
  assert.equal(stage15.unused, false);
  assert.equal(stage15.hasScript, false);
});

test('createSshSession.open validates params, is idempotent per session, retries startEnv, and honors close()', async () => {
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
  assert.equal(session.evaluateConfig(), null);
  const pod3 = await session.open(makeStageModel(), key);
  assert.equal(envCalls, 2);
  assert.equal(pod3.host, '47.99.1.2');

  // Retryable errors (-2, TIMEOUT, NETWORK) retry and VNC-only exhausts attempts
  const origSetTimeout = globalThis.setTimeout;
  const sleepDurations = [];
  globalThis.setTimeout = (fn, ms, ...args) => {
    sleepDurations.push(ms);
    return origSetTimeout(fn, Math.min(ms, 5), ...args);
  };
  try {
    let attempts = 0;
    const retryLogs = [];
    const retrySession = createSshSession({
      api: {
        async startEnv() {
          attempts += 1;
          if (attempts === 1) {
            const err = new Error('平台评测队列繁忙');
            err.code = -2;
            throw err;
          }
          if (attempts === 2) {
            const err = new Error('请求超时');
            err.code = 'TIMEOUT';
            throw err;
          }
          return {
            status: 0,
            data: { ssh_address: '8.8.8.8', port: 22, username: 'u', password: 'p' },
          };
        },
      },
      sshClient: {},
    });
    const okPod = await retrySession.open(makeStageModel(), key, {
      log: (m, l) => retryLogs.push([m, l]),
    });
    assert.equal(attempts, 3);
    assert.equal(okPod.host, '8.8.8.8');
    assert.ok(retryLogs.some(([msg, lvl]) => msg.includes('（1/3）') && lvl === MSG_LEVEL.WARN));
    assert.ok(retryLogs.some(([msg, lvl]) => msg.includes('（2/3）') && lvl === MSG_LEVEL.WARN));

    sleepDurations.length = 0;
    let vncAttempts = 0;
    const vncSession = createSshSession({
      api: {
        async startEnv() {
          vncAttempts += 1;
          return { status: 0, data: {} };
        },
      },
      sshClient: {},
    });
    await assert.rejects(vncSession.open(makeStageModel(), key), /容器启动失败/);
    assert.equal(vncAttempts, TIMING.envStartAttempts);
    assert.equal(
      sleepDurations.filter(ms => ms === TIMING.envStartRetryGap).length,
      TIMING.envStartAttempts - 1,
    );
  } finally {
    globalThis.setTimeout = origSetTimeout;
  }

  // Non-retryable 403 and 401 auth passthrough
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

  const authSession = createSshSession({
    api: {
      async startEnv() {
        const err = new Error('登录状态已过期');
        err.code = 401;
        throw err;
      },
    },
    sshClient: {},
  });
  await assert.rejects(authSession.open(makeStageModel(), key), err => err.code === 401);

  // AbortSignal cancels retry sleep promptly
  const ac = new AbortController();
  const abortSession = createSshSession({
    api: {
      async startEnv() {
        const err = new Error('网络错误');
        err.code = 'NETWORK';
        throw err;
      },
    },
    sshClient: {},
  });
  const startedAt = Date.now();
  setTimeout(() => ac.abort(), 20);
  await assert.rejects(
    abortSession.open(makeStageModel(), key, { signal: ac.signal }),
    err => isAbortError(err),
  );
  assert.ok(Date.now() - startedAt < 250, 'abort during env retry sleep must reject promptly');
});

test('createSshSession.exec, probe, readFile, loadEvaluate, and stageTarget operate scoped to one session', async () => {
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

  // 2. readFile quotes paths, checks errors/truncation, and loadEvaluate + stageTarget reuse within session
  const commands = [];
  let evalReads = 0;
  const session = createSshSession({
    api: okApi,
    sshClient: {
      async exec(_pod, command) {
        commands.push(command);
        if (command.includes('/data/protectspace/evaluate.sh')) {
          evalReads += 1;
          return { stdout: SAMPLE_EVALUATE_SH, stderr: '', exitCode: 0, truncated: false };
        }
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
  assert.throws(() => session.stageTarget(1), /尚未加载 evaluate\.sh/);

  await session.loadEvaluate();
  await session.loadEvaluate();
  assert.equal(evalReads, 1, 'loadEvaluate should read evaluate.sh once per session');
  assert.equal(commands[0], `cat -- '/data/protectspace/evaluate.sh'`);

  const stage1 = session.stageTarget(1);
  const stage3 = session.stageTarget(3);
  assert.equal(stage1.scriptRel, 'secret/evaluate/evaluate_detail_1.py');
  assert.equal(stage1.scriptAbs, '/data/workspace/myshixun/secret/evaluate/evaluate_detail_1.py');
  assert.equal(stage3.scriptRel, 'secret/evaluate/evaluate_detail_3.py');
  assert.equal(stage3.scriptAbs, '/data/workspace/myshixun/secret/evaluate/evaluate_detail_3.py');

  assert.equal(await session.readFile(`/tmp/a'b.txt`), 'ok');
  assert.equal(commands.at(-1), `cat -- '/tmp/a'\\''b.txt'`);
  await assert.rejects(session.readFile('/tmp/missing.py'), /No such file/);
  await assert.rejects(session.readFile('/tmp/huge.py'), /已被截断/);

  session.close();
  assert.equal(session.evaluateConfig(), null);
  assert.throws(() => session.stageTarget(1), /尚未加载 evaluate\.sh/);
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
