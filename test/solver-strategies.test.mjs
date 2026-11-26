import test from 'node:test';
import assert from 'node:assert/strict';
import { MSG_LEVEL, TIMING } from '../src/core/constants.js';
import { ANSWER_HOOK_SCRIPT } from '../src/script/assets.js';
import { CHALLENGE_TYPE, classifyChallenge } from '../src/solver/classifier.js';
import { unityStrategy } from '../src/solver/strategies/unity.js';
import { linuxEnvStrategy } from '../src/solver/strategies/linux-env.js';
import { probeChoices, submitChoices, choiceStrategy } from '../src/solver/strategies/choice.js';
import { codeStrategy } from '../src/solver/strategies/code.js';
import { createJobSession } from '../src/solver/job-session.js';
import { createSolver } from '../src/solver/solver.js';
import { createEvalContext } from '../src/solver/evaluator.js';
import { createPrefs } from '../src/config/prefs.js';
import { Model } from '../src/platform/model.js';

function makeModel(overrides = {}) {
  return {
    title: '测试关卡',
    position: 0,
    shixunId: '',
    gameDbId: 0,
    body: '',
    passed: false,
    questions: [],
    images: [],
    cases: [],
    paths: [],
    linuxEnv: false,
    unity: false,
    env: { tab_type: 1 },
    rules: { matchRule: 'full', ignoreSpace: false },
    ...overrides,
  };
}

function makeCtx(overrides = {}) {
  const logs = [];
  const notices = [];
  return {
    ctx: {
      item: { gameId: 'g1', homeworkId: 1 },
      key: Object.freeze({ gameId: 'g1', homeworkId: 1 }),
      detail: { challenge: { id: 10 }, chooses: [] },
      model: makeModel(),
      evalCtx: createEvalContext(),
      hasMoreSteps: false,
      nextStep: null,
      log: (msg, level) => logs.push([msg, level]),
      onNotice: (msg, level) => notices.push([msg, level]),
      signal: null,
      ...overrides,
    },
    logs,
    notices,
  };
}

test('classifyChallenge classifies every challenge type and hybrid combination deterministically', () => {
  assert.deepEqual(
    classifyChallenge(makeModel({ unity: true, questions: [{}], paths: ['a.py'], linuxEnv: true })),
    { kind: CHALLENGE_TYPE.UNITY, steps: [CHALLENGE_TYPE.UNITY] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel({ linuxEnv: true, paths: ['a.mdj'] })),
    { kind: CHALLENGE_TYPE.LINUX_ENV, steps: [CHALLENGE_TYPE.LINUX_ENV] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel({ linuxEnv: true, paths: [] })),
    { kind: CHALLENGE_TYPE.LINUX_ENV, steps: [CHALLENGE_TYPE.LINUX_ENV] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel({ questions: [{ position: 1 }] })),
    { kind: CHALLENGE_TYPE.CHOICE, steps: [CHALLENGE_TYPE.CHOICE] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel({ paths: ['main.py'] })),
    { kind: CHALLENGE_TYPE.CODE, steps: [CHALLENGE_TYPE.CODE] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel({ questions: [{ position: 1 }], paths: ['main.py'] })),
    { kind: CHALLENGE_TYPE.HYBRID, steps: [CHALLENGE_TYPE.CHOICE, CHALLENGE_TYPE.CODE] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel({ questions: [{ position: 1 }], linuxEnv: true })),
    { kind: CHALLENGE_TYPE.HYBRID, steps: [CHALLENGE_TYPE.CHOICE, CHALLENGE_TYPE.LINUX_ENV] },
  );
  assert.deepEqual(
    classifyChallenge(makeModel()),
    { kind: CHALLENGE_TYPE.EMPTY, steps: [] },
  );
});

test('unityStrategy and linuxEnvStrategy reuse one container across stages and destroy it on teardown', async () => {
  const { ctx: unityCtx, logs: uLogs, notices: uNotices } = makeCtx({
    model: makeModel({ title: 'Unity 仿真', unity: true }),
  });
  const unityRes = unityStrategy.solve(unityCtx);
  assert.equal(unityRes.status, 'skipped');
  assert.equal(uLogs[0][1], MSG_LEVEL.WARN);
  assert.equal(uNotices[0][1], MSG_LEVEL.WARN);

  // 1. Unconfigured SSH: setup records skipReason and solve skips cleanly
  const prefs = createPrefs();
  prefs.data = { ...prefs.defaults };
  const uncfgState = {};
  const { ctx: lCtx1, logs: lLogs1, notices: lNotices1 } = makeCtx({
    model: makeModel({ title: 'StarUML 建模', linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(lCtx1, { state: uncfgState, deps: { prefs } });
  assert.equal(lNotices1.length, 1);
  assert.equal(lLogs1[0][1], MSG_LEVEL.WARN);
  const lRes1 = await linuxEnvStrategy.solve(lCtx1, { session: {}, state: uncfgState, deps: {} });
  assert.equal(lRes1.status, 'skipped');
  assert.match(lRes1.reason, /未配置 SSH/);

  // 2. Shared mock tracking job-scoped container reuse across multiple stages
  prefs.data = { ...prefs.defaults, sshBase: 'https://ssh.example.workers.dev', sshKey: '0123456789abcdef' };
  const calls = [];
  const writes = new Map();
  let isOpen = false;
  let pod = null;
  let destroyCount = 0;
  let openShouldThrow = false;
  const mockSsh = {
    isOpen: () => isOpen,
    currentPod: () => pod,
    async open() {
      calls.push('open');
      if (openShouldThrow) throw new Error('容器启动失败：当前无可用实例');
      isOpen = true;
      pod = { host: '1.2.3.4', port: 2222 };
      return pod;
    },
    async probe() { calls.push('probe'); return { ok: true, detail: 'hello', durationMs: 25 }; },
    async writeFile(absPath, content, options) {
      calls.push(`writeFile:${absPath}:${options?.mode ?? ''}`);
      writes.set(absPath, content);
      if (absPath === '/tmp/eval_hook/answerhook.sh') assert.equal(content, ANSWER_HOOK_SCRIPT);
      return { bytes: Buffer.byteLength(content, 'utf8'), chunks: 1 };
    },
    async exec(cmd, opts) {
      calls.push({ cmd, timeoutMs: opts?.timeoutMs });
      return { stdout: '', stderr: '', exitCode: 0 };
    },
    async destroy() {
      const hadPod = isOpen;
      isOpen = false;
      pod = null;
      calls.push(`destroy:${hadPod}`);
      if (hadPod) destroyCount += 1;
      return hadPod;
    },
    close() { isOpen = false; pod = null; calls.push('close'); },
  };
  let allCasesResult = [];
  let gradeOutcome = true;
  let gradeTimeoutArg = null;
  let postGradeSets = null;
  const mockDeps = {
    prefs,
    answerSource: {
      async allCases() { calls.push('answerSource.allCases'); return allCasesResult; },
    },
    evaluator: {
      async grade(_d, _k, _m, evalCtx, opts) {
        calls.push('evaluator.grade');
        gradeTimeoutArg = opts?.timeout;
        assert.equal(opts?.requireChange, true, 'Linux container evaluation must require fingerprint change');
        if (postGradeSets) {
          evalCtx.lastDetail = { test_sets: postGradeSets };
        }
        return gradeOutcome;
      },
    },
  };

  // 2a. Missing test sets: run one probe evaluation to backfill; skip if still empty after backfill
  const sharedState = {};
  const { ctx: noSetCtx, logs: noSetLogs } = makeCtx({
    detail: { challenge: { id: 1 }, test_sets: [] },
    model: makeModel({ title: '无测试集关卡', shixunId: 'ms0', gameDbId: 9, linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(noSetCtx, { state: sharedState, deps: mockDeps });
  gradeOutcome = false;
  postGradeSets = null;
  const noSetRes = await linuxEnvStrategy.solve(noSetCtx, { session: { ssh: mockSsh }, state: sharedState, deps: mockDeps });
  assert.equal(noSetRes.status, 'skipped');
  assert.match(noSetRes.reason, /未下发测试集/);
  assert.ok(noSetLogs.some(([m]) => m.includes('先空跑评测回填')));
  assert.ok(noSetLogs.some(([m, l]) => m.includes('空跑后仍没有测试集') && l === MSG_LEVEL.WARN));
  assert.equal(calls.filter(c => c === 'evaluator.grade').length, 1, 'must run only one probe evaluation');
  assert.equal(calls.filter(c => c === 'open').length, 1, 'probe evaluation requires an open container');
  assert.equal(destroyCount, 0, 'must retain container for subsequent stages in the job');

  // 2a-extra. Backfill paths: evalCtx.lastDetail backfill without redundant detail(), passing probe, 401/abort passthrough, checkTestSets with input:null, empty-string filtering
  mockSsh.close();
  calls.length = 0; writes.clear(); destroyCount = 0;
  let backfillApiDetailCalls = 0;
  let backfillGradeCount = 0;
  const backfillState = {};
  const backfillDeps = {
    prefs,
    api: {
      async detail() { backfillApiDetailCalls += 1; return { test_sets: [{ output: 'from-refresh' }] }; },
      async checkTestSets() { return { test_sets: [{ input: null, output: '' }] }; },
    },
    evaluator: {
      async grade(_d, _k, _m, evalCtx) {
        backfillGradeCount += 1;
        if (backfillGradeCount === 1) {
          evalCtx.lastDetail = { test_sets: [{ output: '' }, { output: 'backfilled-answer' }] };
          return false;
        }
        return true;
      },
    },
  };
  const { ctx: backfillCtx, logs: backfillLogs } = makeCtx({
    detail: { challenge: { id: 19 }, test_sets: [{ output: '' }] },
    model: makeModel({ title: '空跑回填关', shixunId: 'ms-bf', gameDbId: 19, linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(backfillCtx, { state: backfillState, deps: backfillDeps });
  const backfillRes = await linuxEnvStrategy.solve(backfillCtx, { session: { ssh: mockSsh }, state: backfillState, deps: backfillDeps });
  assert.deepEqual(backfillRes, { status: 'passed', title: '空跑回填关' });
  assert.equal(backfillGradeCount, 2);
  assert.equal(backfillApiDetailCalls, 0, 'must reuse evalCtx.lastDetail without calling api.detail again');
  assert.equal(writes.get('/data/workspace/.evalpass/answer.txt'), 'backfilled-answer');
  assert.equal(
    backfillLogs.some(([m]) => m.includes('复用容器')),
    false,
    'must log ensureContainer once rather than logging container reuse mid-stage',
  );

  // If the probe evaluation itself passes, return passed immediately without a second evaluation
  let probePassGradeCount = 0;
  const probePassRes = await linuxEnvStrategy.solve(
    makeCtx({
      detail: { challenge: { id: 20 }, test_sets: [] },
      model: makeModel({ title: '空跑直过', shixunId: 'ms-bf', gameDbId: 20, linuxEnv: true }),
    }).ctx,
    {
      session: { ssh: mockSsh },
      state: backfillState,
      deps: {
        prefs,
        evaluator: {
          async grade() { probePassGradeCount += 1; return true; },
        },
      },
    },
  );
  assert.deepEqual(probePassRes, { status: 'passed', title: '空跑直过' });
  assert.equal(probePassGradeCount, 1);

  // refreshDetail must propagate 401 auth errors instead of swallowing them
  await assert.rejects(
    linuxEnvStrategy.solve(
      makeCtx({
        detail: { challenge: { id: 21 }, test_sets: [] },
        model: makeModel({ title: '鉴权失效', shixunId: 'ms-bf', gameDbId: 21, linuxEnv: true }),
      }).ctx,
      {
        session: { ssh: mockSsh },
        state: backfillState,
        deps: {
          prefs,
          api: {
            async detail() {
              const err = new Error('登录状态已过期');
              err.code = 401;
              throw err;
            },
          },
          evaluator: { async grade() { return false; } },
        },
      },
    ),
    err => err.code === 401,
  );

  // api.checkTestSets with input:null and valid output avoids dry evaluation altogether
  let hiddenNullInputGradeCount = 0;
  writes.clear();
  const hiddenNullRes = await linuxEnvStrategy.solve(
    makeCtx({
      detail: { challenge: { id: 22 }, test_sets: [] },
      model: makeModel({ title: '无输入隐藏集', shixunId: 'ms-bf', gameDbId: 22, linuxEnv: true }),
    }).ctx,
    {
      session: { ssh: mockSsh },
      state: backfillState,
      deps: {
        prefs,
        api: {
          async checkTestSets() { return { test_sets: [{ input: null, output: 'hidden-null-input-output' }] }; },
        },
        evaluator: {
          async grade() { hiddenNullInputGradeCount += 1; return true; },
        },
      },
    },
  );
  assert.deepEqual(hiddenNullRes, { status: 'passed', title: '无输入隐藏集' });
  assert.equal(hiddenNullInputGradeCount, 1);
  assert.equal(writes.get('/data/workspace/.evalpass/answer.txt'), 'hidden-null-input-output');

  // 2b. Stage 1 (hidden sets): initial open -> upload hook & symlink -> stage answer -> grade -> clean answer dir
  mockSsh.close(); // Reset mock container to simulate a fresh homework session
  calls.length = 0; writes.clear(); destroyCount = 0; gradeOutcome = true; postGradeSets = null;
  const stageState = {};
  const { ctx: hiddenCtx, logs: hiddenLogs } = makeCtx({
    detail: { challenge: { id: 10 }, test_sets: [] },
    model: makeModel({ title: '第1关（隐藏集）', position: 1, shixunId: 'ms1', gameDbId: 10, linuxEnv: true }),
  });
  hiddenCtx.model.env = { tab_type: 3, shixun_environment_id: 55 };
  allCasesResult = [{ input: 'in', output: '顾客实体\n网上商城系统' }];
  const hiddenRes = await linuxEnvStrategy.solve(hiddenCtx, { session: { ssh: mockSsh }, state: stageState, deps: mockDeps });
  assert.deepEqual(hiddenRes, { status: 'passed', title: '第1关（隐藏集）' });
  assert.equal(writes.get('/data/workspace/.evalpass/answer.txt'), '顾客实体\n网上商城系统');
  assert.equal(gradeTimeoutArg, TIMING.linuxGradeTimeout);
  assert.equal(calls.filter(c => c === 'open').length, 1);
  assert.equal(calls.filter(c => c === 'probe').length, 1);
  assert.equal(calls.filter(c => c === 'writeFile:/tmp/eval_hook/answerhook.sh:755').length, 1);
  assert.equal(
    calls.filter(c => typeof c === 'object' && c.cmd.includes('ln -sf --')).length,
    1,
    'must bind python symlinks on initial setup',
  );
  assert.equal(
    calls.some(c => typeof c === 'object' && c.cmd.includes('mkdir -p')),
    false,
    'writeFile already handles mkdir -p without a separate SSH call',
  );
  assert.ok(
    calls.some(c => typeof c === 'object' && c.cmd === `rm -rf -- '/data/workspace/.evalpass'` && c.timeoutMs === 5000),
    'must clean up staged answer directory with bounded timeout',
  );
  assert.equal(destroyCount, 0, 'must NOT destroy container between stages of the same job');
  assert.ok(hiddenLogs.some(([m]) => m.includes('申请容器')));

  // 2c. Stage 2 (direct test_sets + failure): reuses container without re-open/re-probe/re-hook, reads evalCtx.lastDetail
  calls.length = 0; writes.clear();
  gradeOutcome = false;
  postGradeSets = [{ result: false }, { result: true }, { result: false }];
  const { ctx: failCtx, logs: failLogs } = makeCtx({
    detail: { challenge: { id: 11 }, test_sets: [{ output: '第二关输出', result: null }] },
    model: makeModel({ title: '第2关（失败）', position: 2, shixunId: 'ms1', gameDbId: 11, linuxEnv: true }),
  });
  failCtx.model.env = { tab_type: 3, shixun_environment_id: 55 };
  const failRes = await linuxEnvStrategy.solve(failCtx, { session: { ssh: mockSsh }, state: stageState, deps: mockDeps });
  assert.equal(failRes.status, 'failed');
  assert.match(failRes.reason, /2 组用例未过/);
  assert.equal(writes.get('/data/workspace/.evalpass/answer.txt'), '第二关输出');
  assert.equal(calls.filter(c => c === 'open').length, 0, 'stage 2 must reuse open container');
  assert.equal(calls.filter(c => c === 'probe').length, 0, 'stage 2 must not re-probe container');
  assert.equal(
    calls.filter(c => typeof c === 'string' && c.startsWith('writeFile:/tmp/eval_hook/')).length,
    0,
    'stage 2 must not re-upload answerhook.sh',
  );
  assert.equal(
    calls.filter(c => typeof c === 'object' && c.cmd.includes('ln -sf --')).length,
    0,
    'stage 2 must not re-link python symlinks',
  );
  assert.ok(
    calls.some(c => typeof c === 'object' && c.cmd === `rm -rf -- '/data/workspace/.evalpass'` && c.timeoutMs === 5000),
  );
  assert.equal(destroyCount, 0, 'must still keep container until teardown at job end');
  assert.ok(failLogs.some(([m]) => m.includes('复用容器（1.2.3.4:2222）')));

  // 2d. Job teardown releases the shared container exactly once
  await linuxEnvStrategy.teardown({ session: { ssh: mockSsh }, state: stageState, log: () => {} });
  assert.equal(destroyCount, 1);
  assert.equal(stageState.containerReady, false);

  // 2e. open() failure leaves container unopened; teardown does not trigger remote delete
  calls.length = 0; destroyCount = 0; postGradeSets = null; openShouldThrow = true;
  const openFailState = {};
  const { ctx: openFailCtx } = makeCtx({
    detail: { challenge: { id: 12 }, test_sets: [{ output: 'x' }] },
    model: makeModel({ title: '开容器失败', shixunId: 'ms-fail', gameDbId: 12, linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(openFailCtx, { state: openFailState, deps: mockDeps });
  await assert.rejects(
    linuxEnvStrategy.solve(openFailCtx, { session: { ssh: mockSsh }, state: openFailState, deps: mockDeps }),
    /容器启动失败/,
  );
  await linuxEnvStrategy.teardown({ session: { ssh: mockSsh }, state: openFailState, log: () => {} });
  assert.equal(destroyCount, 0);
  openShouldThrow = false;

  // 3. Hook symlink failure happens during ensureContainer before answer write: skips rm -rf, teardown destroys container
  let linkDestroyCalls = 0;
  const linkExecCalls = [];
  const linkErrState = {};
  const linkErrSsh = {
    isOpen: () => true,
    async open() { return { host: '1.2.3.4', port: 22 }; },
    async probe() { return { ok: true, detail: 'hello', durationMs: 5 }; },
    async writeFile() { return { bytes: 1, chunks: 1 }; },
    async exec(cmd, opts) {
      linkExecCalls.push({ cmd, timeoutMs: opts?.timeoutMs });
      return { stdout: '', stderr: 'Permission denied', exitCode: 1 };
    },
    async destroy() { linkDestroyCalls += 1; return true; },
  };
  const { ctx: linkErrCtx } = makeCtx({
    detail: { challenge: { id: 1 }, test_sets: [{ output: '旅客' }] },
    model: makeModel({ title: '软链失败', shixunId: 'ms3', gameDbId: 12, linuxEnv: true }),
  });
  linkErrCtx.model.env = { tab_type: 3, shixun_environment_id: 77 };
  await linuxEnvStrategy.setup(linkErrCtx, { state: linkErrState, deps: mockDeps });
  await assert.rejects(
    linuxEnvStrategy.solve(linkErrCtx, { session: { ssh: linkErrSsh }, state: linkErrState, deps: mockDeps }),
    /绑定答案脚本失败.*Permission denied/,
  );
  assert.equal(linkExecCalls.length, 1, 'must not run rm -rf when answer was not written yet');
  assert.equal(linkDestroyCalls, 0, 'solve must not destroy container before teardown');
  await linuxEnvStrategy.teardown({ session: { ssh: linkErrSsh }, state: linkErrState, log: () => {} });
  assert.equal(linkDestroyCalls, 1, 'teardown must destroy opened container even if linkHook failed');

  // 4. Probe failure throws, logs ERROR, skips rm -rf, and teardown destroys opened container
  let badExecCalls = 0;
  let badDestroyCalls = 0;
  const badState = {};
  const badSsh = {
    isOpen: () => true,
    async open() { return { host: '1.2.3.4', port: 22 }; },
    async probe() { return { ok: false, detail: 'connection refused', durationMs: 5 }; },
    async exec() { badExecCalls += 1; return { stdout: '', stderr: '', exitCode: 0 }; },
    async destroy() { badDestroyCalls += 1; return true; },
  };
  const { ctx: badCtx, logs: badLogs } = makeCtx({
    detail: { challenge: { id: 2 }, test_sets: [{ output: 'x' }] },
    model: makeModel({ title: '坏容器', shixunId: 'ms4', gameDbId: 13, linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(badCtx, { state: badState, deps: mockDeps });
  await assert.rejects(
    linuxEnvStrategy.solve(badCtx, { session: { ssh: badSsh }, state: badState, deps: mockDeps }),
    /SSH hello 测试未通过/,
  );
  assert.ok(badLogs.some(([m, l]) => m.includes('SSH 连通测试失败') && l === MSG_LEVEL.ERROR));
  assert.equal(badExecCalls, 0, 'must not run rm -rf when answer was never written');
  assert.equal(badDestroyCalls, 0);
  await linuxEnvStrategy.teardown({ session: { ssh: badSsh }, state: badState, log: () => {} });
  assert.equal(badDestroyCalls, 1, 'teardown must destroy container when probe fails after open');
});

test('choiceStrategy and codeStrategy execute cleanly through strategy interface', async () => {
  const chooseBodies = [];
  const api = {
    async choose(_gameId, body) {
      chooseBodies.push(body.answer);
      return {
        test_sets: [{ position: 1, standard_answer: 'B' }, { position: 2, standard_answer: 'AC' }],
        choose_correct_num: body.answer[0] === 'B' ? 2 : 0,
        challenge_chooses_count: 2,
      };
    },
  };
  const detail = { challenge: { id: 10 }, chooses: [{ position: 2 }, { position: 1 }] };
  const key = { gameId: 'g1', homeworkId: 1 };

  const probed = await probeChoices(detail, key, 2, api);
  assert.deepEqual(probed.answers, ['B', 'AC']);
  chooseBodies.length = 0;

  await submitChoices(detail, key, 2, api);
  assert.deepEqual(chooseBodies, [['A', 'A'], ['B', 'AC']]);

  let failedDetailCalls = 0;
  const { ctx: hybridCtx, logs: hybridLogs } = makeCtx({
    detail,
    model: makeModel({
      title: '混合关',
      questions: [{ position: 1, multi: false }, { position: 2, multi: true }],
      paths: ['main.py'],
    }),
    hasMoreSteps: true,
    nextStep: CHALLENGE_TYPE.CODE,
  });
  const hybridRes = await choiceStrategy.solve(hybridCtx, {
    deps: {
      api,
      evaluator: {
        baseline: () => ({ sig: '', stamp: '' }),
        async waitPassed() { return false; },
        async failedDetail() { failedDetailCalls += 1; return { count: 1 }; },
      },
    },
  });
  assert.deepEqual(hybridRes, { status: 'continue' });
  assert.equal(failedDetailCalls, 0);
  assert.ok(hybridLogs.some(([msg, level]) => msg.includes('继续处理同关卡编程题') && level === MSG_LEVEL.WARN));

  let written = null;
  const { ctx: t1Ctx } = makeCtx({ model: makeModel({ title: '填空关', paths: ['step1/ans.txt'] }) });
  const t1Res = await codeStrategy.solve(t1Ctx, {
    deps: {
      answerSource: {
        async brief() { return { checker: { template: 'step1/ans.txt' }, reference: null, cases: [] }; },
        async checkerPlan() { return { path: 'step1/ans.txt', content: 'filled', count: 3 }; },
      },
      evaluator: {
        async writeAndGrade(_d, _k, _m, files) { written = files; return true; },
      },
      codeGenerator: {},
      prefs: createPrefs(),
      aiSettings: { ready: () => false },
    },
  });
  assert.deepEqual(t1Res, { status: 'passed', title: '填空关' });
  assert.deepEqual(written, { 'step1/ans.txt': 'filled' });
});

test('createJobSession isolates setup/solve/teardown per job with zero cross-job leakage', async () => {
  const prevLoc = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', {
    value: { origin: 'https://www.educoder.net' },
    configurable: true,
    writable: true,
  });

  try {
    const events = [];
    let sshInstances = 0;
    const closedIds = [];

    const solver = createSolver({
      api: {
        async detail(gameId) {
          return {
            challenge: { id: 1, subject: gameId, position: gameId === 'g1' ? 1 : 2, task_pass: '' },
            game: { id: 10, status: 0 },
            shixun_environments: [{ tab_type: 3 }],
            mirror_name: 'StarUML',
          };
        },
      },
      model: Model,
      createSsh() {
        const id = ++sshInstances;
        events.push(`ssh-create:${id}`);
        return {
          close() {
            closedIds.push(id);
            events.push(`ssh-close:${id}`);
          },
        };
      },
      strategies: {
        [CHALLENGE_TYPE.LINUX_ENV]: {
          name: CHALLENGE_TYPE.LINUX_ENV,
          async setup(ctx, { session, state }) {
            state.runCount = (state.runCount || 0) + 1;
            state.jobTag = `${session.job.id}:${ctx.item.gameId}`;
            events.push(`setup:${state.jobTag}`);
          },
          async solve(ctx, { state }) {
            state.solved = (state.solved || 0) + 1;
            events.push(`solve:${state.jobTag}:${ctx.item.gameId}:count=${state.solved}`);
            return { status: 'passed', title: ctx.model.title };
          },
          async teardown({ state }) {
            events.push(`teardown:${state.jobTag}:total=${state.solved}`);
          },
        },
      },
    });

    // Job 1 runs two linux_env stages: setup runs ONCE, solve shares state across stages, dispose runs teardown + close
    const sessionA = solver.openJob({ id: 101 });
    await sessionA.solveStage({ gameId: 'g1', homeworkId: 101 });
    await sessionA.solveStage({ gameId: 'g2', homeworkId: 101 });
    await sessionA.dispose();
    await sessionA.dispose(); // idempotent

    // Job 2 gets a completely fresh JobSession + SSH session + strategy state
    const sessionB = solver.openJob({ id: 102 });
    await sessionB.solveStage({ gameId: 'g3', homeworkId: 102 });
    await sessionB.dispose();

    assert.deepEqual(events, [
      'ssh-create:1',
      'setup:101:g1',
      'solve:101:g1:g1:count=1',
      'solve:101:g1:g2:count=2',
      'teardown:101:g1:total=2',
      'ssh-close:1',
      'ssh-create:2',
      'setup:102:g3',
      'solve:102:g3:g3:count=1',
      'teardown:102:g3:total=1',
      'ssh-close:2',
    ]);
    assert.deepEqual(closedIds, [1, 2]);
  } finally {
    if (prevLoc) Object.defineProperty(globalThis, 'location', prevLoc);
    else delete globalThis.location;
  }
});

test('createJobSession closes ssh if setup fails and createSolver supports hybrid strategies and single-stage solve()', async () => {
  const prevLoc = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', {
    value: { origin: 'https://www.educoder.net' },
    configurable: true,
    writable: true,
  });

  try {
    // 1. Setup failure does NOT mark strategy activated (teardown skipped) while dispose STILL destroys SSH
    let teardownCalled = false;
    let sshDestroyed = false;
    const failSession = createJobSession({ id: 1 }, {
      deps: {
        api: {
          async detail() {
            return { challenge: { subject: '坏关', task_pass: '' }, game: { status: 0 }, shixun_environments: [{ tab_type: 3 }] };
          },
        },
        model: Model,
      },
      classify: () => ({ kind: CHALLENGE_TYPE.LINUX_ENV, steps: [CHALLENGE_TYPE.LINUX_ENV] }),
      createSsh: () => ({ async destroy() { sshDestroyed = true; } }),
      strategies: {
        [CHALLENGE_TYPE.LINUX_ENV]: {
          name: CHALLENGE_TYPE.LINUX_ENV,
          async setup() { throw new Error('setup boom'); },
          async solve() { throw new Error('should not run'); },
          async teardown() { teardownCalled = true; },
        },
      },
    });
    await assert.rejects(failSession.solveStage({ gameId: 'g1', homeworkId: 1 }), /setup boom/);
    await failSession.dispose();
    assert.equal(teardownCalled, false);
    assert.equal(sshDestroyed, true);

    // 2. Hybrid choice -> code via solver.solve() executes both strategies and disposes automatically
    const order = [];
    let hybridDisposed = false;
    const hybridSolver = createSolver({
      api: {
        async detail() {
          return {
            challenge: { id: 60, subject: '综合关', path: 'main.py', task_pass: '' },
            game: { status: 0 },
            shixun_environments: [{ tab_type: 1 }],
            chooses: [{ position: 1, subject: 'Q1', category: 1, challenge_question: [{ position: 1, option_name: 'A' }] }],
          };
        },
      },
      model: Model,
      createSsh: () => ({ close() { hybridDisposed = true; } }),
      strategies: {
        [CHALLENGE_TYPE.CHOICE]: {
          async solve(ctx) {
            order.push(['choice', ctx.hasMoreSteps, ctx.nextStep]);
            return { status: 'continue' };
          },
        },
        [CHALLENGE_TYPE.CODE]: {
          async solve(ctx) {
            order.push(['code', ctx.hasMoreSteps, ctx.nextStep]);
            return { status: 'passed', title: ctx.model.title };
          },
        },
      },
    });
    const hybridOutcome = await hybridSolver.solve({ gameId: 'g60', homeworkId: 1 });
    assert.deepEqual(hybridOutcome, { status: 'passed', title: '综合关' });
    assert.deepEqual(order, [
      ['choice', true, 'code'],
      ['code', false, null],
    ]);
    assert.equal(hybridDisposed, true);
  } finally {
    if (prevLoc) Object.defineProperty(globalThis, 'location', prevLoc);
    else delete globalThis.location;
  }
});

test('JobSession opens container once for multi-stage Linux homework and destroys once on dispose', async () => {
  const prevLoc = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', {
    value: { origin: 'https://www.educoder.net' },
    configurable: true,
    writable: true,
  });

  try {
    const prefs = createPrefs();
    prefs.data = { ...prefs.defaults, sshBase: 'https://ssh.example.workers.dev', sshKey: '0123456789abcdef' };
    let startEnvCalls = 0;
    let deletePodCalls = 0;
    let gradeCalls = 0;
    const solver = createSolver({
      api: {
        async detail(gameId) {
          return {
            challenge: { id: gameId === 'g1' ? 1 : 2, subject: `关卡-${gameId}`, position: gameId === 'g1' ? 1 : 2, task_pass: '' },
            myshixun: { identifier: 'ms-shared' },
            game: { id: gameId === 'g1' ? 101 : 102, status: 0 },
            shixun_environments: [{ tab_type: 3, shixun_environment_id: 99 }],
            mirror_name: 'StarUML',
            test_sets: [{ output: `expected-${gameId}`, result: null }],
          };
        },
        async startEnv() {
          startEnvCalls += 1;
          return { status: 0, data: { ssh_address: '47.99.211.146', port: 50174, username: 'root', password: 'pw' } };
        },
        async exitDeletePod() {
          deletePodCalls += 1;
          return { status: 0 };
        },
      },
      sshClient: {
        async exec(_pod, command) {
          if (command === 'echo hello') return { stdout: 'hello\n', stderr: '', exitCode: 0 };
          return { stdout: '', stderr: '', exitCode: 0 };
        },
      },
      evaluator: {
        async grade(_d, _k, _m, evalCtx) {
          gradeCalls += 1;
          if (gradeCalls === 2) evalCtx.lastDetail = { test_sets: [{ result: false }] };
          return gradeCalls === 1;
        },
      },
      model: Model,
      prefs,
    });

    const jobSession = solver.openJob({ id: 4074857 });
    const res1 = await jobSession.solveStage({ gameId: 'g1', homeworkId: 4074857 });
    assert.deepEqual(res1, { status: 'passed', title: '关卡-g1' });
    assert.equal(startEnvCalls, 1);
    assert.equal(deletePodCalls, 0);

    const res2 = await jobSession.solveStage({ gameId: 'g2', homeworkId: 4074857 });
    assert.equal(res2.status, 'failed');
    assert.match(res2.reason, /1 组用例未过/);
    assert.equal(startEnvCalls, 1, 'stage 2 must reuse the same container instance');
    assert.equal(deletePodCalls, 0, 'must not destroy container until jobSession.dispose()');

    await jobSession.dispose();
    assert.equal(deletePodCalls, 1, 'jobSession.dispose() must destroy the container once after all stages settle');
  } finally {
    if (prevLoc) Object.defineProperty(globalThis, 'location', prevLoc);
    else delete globalThis.location;
  }
});

test('pickOutput 只在平台评过之后才把空串当作有效期望值', async () => {
  const { linuxEnvStrategy } = await import('../src/solver/strategies/linux-env.js');
  const prefs = createPrefs();
  prefs.data = { ...prefs.defaults, sshBase: 'https://ssh.example.dev', sshKey: '0123456789abcdef' };

  const makeHarness = () => {
    const writes = new Map();
    const calls = [];
    let open = false;
    let pod = null;
    const ssh = {
      isOpen: () => open,
      async open() { open = true; pod = { host: 'h', port: 22 }; calls.push('open'); return pod; },
      currentPod: () => pod,
      async probe() { return { ok: true, detail: 'hello', durationMs: 3 }; },
      async writeFile(path, content) { writes.set(path, content); calls.push(`write:${path}`); },
      async exec() { return { stdout: '', stderr: '', exitCode: 0 }; },
      async destroy() { open = false; pod = null; calls.push('destroy'); return true; },
      close() { open = false; pod = null; },
    };
    const deps = {
      prefs,
      evaluator: {
        async grade() { calls.push('grade'); return false; },
        async failedDetail() { return { count: 0 }; },
      },
      api: {
        async detail() {
          calls.push('detail');
          // 空跑后平台回填：output 仍是空串，但 result/compile_success 有值
          return { game: { status: 0 }, test_sets: [{ output: '', result: false, actual_output: '', compile_success: 1 }] };
        },
      },
    };
    return { ssh, deps, writes, calls };
  };

  // 情形 A：期望值是空串且「未评过」→ 先空跑，回填后按空串作答
  {
    const h = makeHarness();
    const state = {};
    const { ctx, logs } = makeCtx({
      detail: { challenge: { id: 1 }, test_sets: [{ output: '', result: null, actual_output: null, compile_success: null }] },
      model: makeModel({ title: '请画出数据库信息处理流程', shixunId: 'ms', gameDbId: 1, linuxEnv: true }),
    });
    ctx.model.env = { tab_type: 3, shixun_environment_id: 11 };
    await linuxEnvStrategy.setup(ctx, { state, deps: h.deps });
    const res = await linuxEnvStrategy.solve(ctx, { session: { ssh: h.ssh }, state, deps: h.deps });
    assert.ok(logs.some(([m]) => m.includes('先空跑评测回填')), '未评过的空串要先空跑');
    assert.equal(h.writes.get('/data/workspace/.evalpass/answer.txt'), '', '回填后按空串作答');
    assert.equal(res.status, 'failed', '评测没通过就如实返回 failed');
  }

  // 情形 B：期望值是空串且「已评过」→ 不空跑，直接按空串作答
  {
    const h = makeHarness();
    const state = {};
    const { ctx, logs } = makeCtx({
      detail: { challenge: { id: 2 }, test_sets: [{ output: '', result: true, actual_output: '', compile_success: 1 }] },
      model: makeModel({ title: '请画出文件信息处理流程', shixunId: 'ms', gameDbId: 2, linuxEnv: true }),
    });
    ctx.model.env = { tab_type: 3, shixun_environment_id: 12 };
    await linuxEnvStrategy.setup(ctx, { state, deps: h.deps });
    await linuxEnvStrategy.solve(ctx, { session: { ssh: h.ssh }, state, deps: h.deps });
    assert.ok(!logs.some(([m]) => m.includes('先空跑评测回填')), '已评过就不该再空跑');
    assert.equal(h.writes.get('/data/workspace/.evalpass/answer.txt'), '');
    assert.equal(h.calls.filter(c => c === 'grade').length, 1, '只评一次');
  }

  // 情形 C：期望值有内容 → 直接作答，不空跑
  {
    const h = makeHarness();
    const state = {};
    const { ctx } = makeCtx({
      detail: { challenge: { id: 3 }, test_sets: [{ output: '1', result: null }] },
      model: makeModel({ title: '形成初步需求列表', shixunId: 'ms', gameDbId: 3, linuxEnv: true }),
    });
    ctx.model.env = { tab_type: 3, shixun_environment_id: 13 };
    await linuxEnvStrategy.setup(ctx, { state, deps: h.deps });
    await linuxEnvStrategy.solve(ctx, { session: { ssh: h.ssh }, state, deps: h.deps });
    assert.equal(h.writes.get('/data/workspace/.evalpass/answer.txt'), '1');
    assert.equal(h.calls.filter(c => c === 'grade').length, 1);
  }
});
