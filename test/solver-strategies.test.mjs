import test from 'node:test';
import assert from 'node:assert/strict';
import { MSG_LEVEL } from '../src/core/constants.js';
import { ANY_HOOK_SCRIPT, PY_HOOK_SCRIPT } from '../src/script/assets.js';
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

test('unityStrategy and linuxEnvStrategy operate cleanly with setup/solve/teardown and mixed placeholders', async () => {
  const { ctx: unityCtx, logs: uLogs, notices: uNotices } = makeCtx({
    model: makeModel({ title: 'Unity 仿真', unity: true }),
  });
  const unityRes = unityStrategy.solve(unityCtx);
  assert.equal(unityRes.status, 'skipped');
  assert.equal(uLogs[0][1], MSG_LEVEL.WARN);
  assert.equal(uNotices[0][1], MSG_LEVEL.WARN);

  // 1. Unconfigured SSH: setup records skipReason once and solve returns skipped cleanly across stages
  const prefs = createPrefs();
  prefs.data = { ...prefs.defaults };
  const uncfgState = {};
  const { ctx: lCtx1, logs: lLogs1, notices: lNotices1 } = makeCtx({
    model: makeModel({ title: 'StarUML 建模', linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(lCtx1, { session: { ssh: { isOpen: () => false } }, state: uncfgState, deps: { prefs } });
  assert.equal(lNotices1.length, 1);
  assert.equal(lLogs1[0][1], MSG_LEVEL.WARN);
  const lRes1 = await linuxEnvStrategy.solve(lCtx1, { session: {}, state: uncfgState, deps: {} });
  assert.equal(lRes1.status, 'skipped');
  assert.match(lRes1.reason, /未配置 SSH/);

  // 2. Configured SSH: setup opens pod, probes, loads evaluate, writes scripts & links;
  //    solve triggers evaluator.grade (or skips placeholder); teardown cleans dir & symlinks
  prefs.data = { ...prefs.defaults, sshBase: 'https://ssh.example.workers.dev', sshKey: '0123456789abcdef' };
  const calls = [];
  let isOpen = false;
  const mockSsh = {
    isOpen: () => isOpen,
    async open() {
      isOpen = true;
      calls.push('open');
      return { host: '1.2.3.4', port: 2222 };
    },
    async probe() {
      calls.push('probe');
      return { ok: true, detail: 'hello', durationMs: 25 };
    },
    async loadEvaluate() {
      calls.push('loadEvaluate');
      return { workdir: '/data/workspace/myshixun', executeCommand: 'python3', sourceClassNames: ['', '1', 's3.py'] };
    },
    async writeFile(absPath, content, options) {
      calls.push(`writeFile:${absPath}:${options?.mode}`);
      const expectedContent = absPath === '/tmp/eval_hook/anyhook.py'
        ? ANY_HOOK_SCRIPT
        : PY_HOOK_SCRIPT;
      assert.ok(['/tmp/eval_hook/anyhook.py', '/tmp/eval_hook/pyhook.sh'].includes(absPath));
      assert.equal(content, expectedContent);
      assert.equal(options?.mode, '755');
      return { bytes: Buffer.byteLength(content, 'utf8'), chunks: 1 };
    },
    stageTarget(pos) {
      calls.push(`stageTarget:${pos}`);
      if (pos === 1 || pos === 2) {
        const rawEntry = pos === 1 ? '' : '1';
        return {
          position: pos,
          inRange: true,
          unused: true,
          hasScript: false,
          rawEntry,
          sourceClassNames: ['', '1', 's3.py'],
          scriptRel: '',
          scriptAbs: '',
        };
      }
      if (pos === 3) {
        return {
          position: 3,
          inRange: true,
          unused: false,
          hasScript: true,
          rawEntry: 's3.py',
          sourceClassNames: ['', '1', 's3.py'],
          scriptRel: 's3.py',
          scriptAbs: '/data/workspace/myshixun/s3.py',
        };
      }
      return {
        position: pos,
        inRange: false,
        unused: false,
        hasScript: false,
        rawEntry: '',
        sourceClassNames: ['', '1', 's3.py'],
        scriptRel: '',
        scriptAbs: '',
      };
    },
    async exec(cmd) {
      calls.push(`exec:${cmd}`);
      return { stdout: '', stderr: '', exitCode: 0 };
    },
  };
  let gradeOutcome = true;
  let gradeCalls = 0;
  let failedDetailCalls = 0;
  const mockEvaluator = {
    async grade(_detail, _key, _model, _evalCtx) {
      gradeCalls += 1;
      calls.push('evaluator.grade');
      return gradeOutcome;
    },
    async failedDetail() {
      failedDetailCalls += 1;
      return { count: 2 };
    },
  };

  const cfgState = {};
  const { ctx: lCtx1Placeholder, logs: lLogsPlaceholder } = makeCtx({
    model: makeModel({ title: '第1关', position: 1, shixunId: 'ms1', gameDbId: 98, linuxEnv: true }),
  });
  await linuxEnvStrategy.setup(lCtx1Placeholder, { session: { ssh: mockSsh }, state: cfgState, deps: { prefs } });
  assert.equal(cfgState.hookDir, '/tmp/eval_hook/');
  assert.equal(cfgState.scriptPath, '/tmp/eval_hook/anyhook.py');
  assert.equal(cfgState.pyHookPath, '/tmp/eval_hook/pyhook.sh');
  assert.deepEqual(cfgState.tempPaths, ['/tmp/eval_hook/', '/usr/local/bin/python', '/usr/local/bin/python3']);
  assert.equal(lLogsPlaceholder.length, 2, 'setup logs should stay concise with only key milestones');
  assert.ok(lLogsPlaceholder.some(([m, l]) => m.includes('部署 2 个脚本') && l === MSG_LEVEL.INFO));

  const lResEmpty = await linuxEnvStrategy.solve(lCtx1Placeholder, {
    session: { ssh: mockSsh },
    state: cfgState,
    deps: { evaluator: mockEvaluator },
  });
  assert.equal(lResEmpty.status, 'skipped');
  assert.match(lResEmpty.reason, /未使用评测脚本/);
  assert.equal(gradeCalls, 0);
  assert.ok(lLogsPlaceholder.some(([m, l]) => m.includes('第 1 关无评测脚本（空），跳过') && l === MSG_LEVEL.INFO));

  const { ctx: lCtx2Placeholder, logs: lLogsPlaceholderOne } = makeCtx({
    model: makeModel({ title: '第2关', position: 2, shixunId: 'ms1', gameDbId: 99, linuxEnv: true }),
  });
  const lResOne = await linuxEnvStrategy.solve(lCtx2Placeholder, {
    session: { ssh: mockSsh },
    state: cfgState,
    deps: { evaluator: mockEvaluator },
  });
  assert.equal(lResOne.status, 'skipped');
  assert.match(lResOne.reason, /未使用评测脚本/);
  assert.equal(gradeCalls, 0);
  assert.ok(lLogsPlaceholderOne.some(([m, l]) => m.includes('第 2 关无评测脚本（1），跳过') && l === MSG_LEVEL.INFO));

  // Valid stage passes when evaluator.grade returns true
  const { ctx: lCtx3, logs: lLogs3 } = makeCtx({
    model: makeModel({ title: '第3关', position: 3, shixunId: 'ms1', gameDbId: 100, linuxEnv: true }),
  });
  const lRes3Pass = await linuxEnvStrategy.solve(lCtx3, {
    session: { ssh: mockSsh },
    state: cfgState,
    deps: { evaluator: mockEvaluator },
  });
  assert.deepEqual(lRes3Pass, { status: 'passed', title: '第3关' });
  assert.equal(gradeCalls, 1);
  assert.ok(lLogs3.some(([m, l]) => m.includes('第 3 关提交评测（s3.py）') && l === MSG_LEVEL.INFO));

  // Valid stage fails cleanly with failedDetail count when evaluator.grade returns false
  gradeOutcome = false;
  const { ctx: lCtx3Fail } = makeCtx({
    model: makeModel({ title: '第3关失败', position: 3, shixunId: 'ms1', gameDbId: 100, linuxEnv: true }),
  });
  const lRes3Fail = await linuxEnvStrategy.solve(lCtx3Fail, {
    session: { ssh: mockSsh },
    state: cfgState,
    deps: { evaluator: mockEvaluator },
  });
  assert.equal(lRes3Fail.status, 'failed');
  assert.match(lRes3Fail.reason, /2 组用例未过/);
  assert.equal(failedDetailCalls, 1);

  // Unmatched stage out of array range still returns failed without invoking grade
  const prevGradeCalls = gradeCalls;
  const { ctx: lCtxMiss, logs: lLogsMiss } = makeCtx({
    model: makeModel({ title: '第9关', position: 9, shixunId: 'ms1', gameDbId: 101, linuxEnv: true }),
  });
  const lResMiss = await linuxEnvStrategy.solve(lCtxMiss, {
    session: { ssh: mockSsh },
    state: cfgState,
    deps: { evaluator: mockEvaluator },
  });
  assert.equal(lResMiss.status, 'failed');
  assert.equal(gradeCalls, prevGradeCalls);
  assert.ok(lLogsMiss.some(([m, l]) => m.includes('第 9 关未匹配评测脚本') && l === MSG_LEVEL.WARN));

  // Teardown cleans tracked tempPaths (including /tmp/eval_hook/ and symlinks)
  cfgState.tempPaths.push(`/tmp/a'b.txt`);
  await linuxEnvStrategy.teardown({ session: { ssh: mockSsh }, state: cfgState });
  assert.deepEqual(calls, [
    'open',
    'probe',
    'loadEvaluate',
    'writeFile:/tmp/eval_hook/anyhook.py:755',
    'writeFile:/tmp/eval_hook/pyhook.sh:755',
    `exec:ln -sf -- '/tmp/eval_hook/pyhook.sh' '/usr/local/bin/python' && ln -sf -- '/tmp/eval_hook/pyhook.sh' '/usr/local/bin/python3'`,
    'stageTarget:1',
    'stageTarget:2',
    'stageTarget:3',
    'evaluator.grade',
    'stageTarget:3',
    'evaluator.grade',
    'stageTarget:9',
    `exec:rm -rf -- '/tmp/eval_hook/' '/usr/local/bin/python' '/usr/local/bin/python3' '/tmp/a'\\''b.txt'`,
  ]);

  // Symlink failure throws clearly
  const { ctx: linkErrCtx } = makeCtx({ model: makeModel({ title: '软链失败', linuxEnv: true }) });
  await assert.rejects(
    linuxEnvStrategy.setup(linkErrCtx, {
      session: {
        ssh: {
          async open() { return { host: '1.2.3.4', port: 22 }; },
          async probe() { return { ok: true, detail: 'hello', durationMs: 5 }; },
          async loadEvaluate() { return { workdir: '/data/workspace/myshixun', sourceClassNames: ['s1.py'] }; },
          async writeFile() { return { bytes: 1, chunks: 1 }; },
          async exec() { return { stdout: '', stderr: 'Permission denied', exitCode: 1 }; },
        },
      },
      state: {},
      deps: { prefs },
    }),
    /绑定绕过脚本失败.*Permission denied/,
  );

  // Probe failure in setup throws and logs ERROR
  const { ctx: badCtx, logs: badLogs } = makeCtx({ model: makeModel({ title: '坏容器', linuxEnv: true }) });
  await assert.rejects(
    linuxEnvStrategy.setup(badCtx, {
      session: {
        ssh: {
          async open() { return { host: '1.2.3.4', port: 22 }; },
          async probe() { return { ok: false, detail: 'connection refused', durationMs: 5 }; },
        },
      },
      state: {},
      deps: { prefs },
    }),
    /SSH hello 测试未通过/,
  );
  assert.ok(badLogs.some(([m, l]) => m.includes('SSH 连通测试失败') && l === MSG_LEVEL.ERROR));
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
    // 1. Setup failure does NOT mark strategy activated (teardown skipped) while dispose STILL closes SSH
    let teardownCalled = false;
    let sshClosed = false;
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
      createSsh: () => ({ close() { sshClosed = true; } }),
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
    assert.equal(sshClosed, true);

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
