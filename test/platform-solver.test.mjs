import test from 'node:test';
import assert from 'node:assert/strict';
import { Api } from '../src/platform/api.js';
import { Route } from '../src/platform/route.js';
import { Model } from '../src/platform/model.js';
import { createScanner } from '../src/platform/scanner.js';
import { createAnswerSource } from '../src/solver/answer-source.js';
import { createCodeGenerator } from '../src/ai/code-generator.js';
import { AiRequestError } from '../src/ai/errors.js';
import { createEvaluator, createEvalContext } from '../src/solver/evaluator.js';
import { createSolver } from '../src/solver/solver.js';
import { createTemplateCache } from '../src/config/template-cache.js';
import { createPrefs } from '../src/config/prefs.js';
import { isAbortError } from '../src/core/utils.js';

function withBrowserMocks({ location = { origin: 'https://www.educoder.net', pathname: '/', search: '', href: 'https://www.educoder.net/' } }, fn) {
  const prevLoc = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', { value: location, configurable: true, writable: true });
  return Promise.resolve().then(fn).finally(() => {
    if (prevLoc) Object.defineProperty(globalThis, 'location', prevLoc);
    else delete globalThis.location;
  });
}

test('Route extracts courseId, homeworkId, and keyOf', async () => {
  await withBrowserMocks({
    location: {
      origin: 'https://www.educoder.net',
      pathname: '/classrooms/c123/shixun_homework/456/',
      href: 'https://www.educoder.net/classrooms/c123/shixun_homework/456/',
    },
  }, () => {
    assert.equal(Route.path(), '/classrooms/c123/shixun_homework/456');
    assert.equal(Route.courseId(), 'c123');
    assert.equal(Route.homeworkId(), 456);
    assert.equal(Route.isTask('/tasks/c123/456/g789'), true);
    assert.deepEqual(
      Route.keyOf('https://www.educoder.net/tasks/c123/456/g789?homework_common_id=999'),
      { gameId: 'g789', homeworkId: '999', courseId: 'c123' },
    );
    assert.deepEqual(
      Route.keyOf('https://www.educoder.net/tasks/CNQL6VDC/4074857/qmri7ayjt5o9?coursesId=CNQL6VDC'),
      { gameId: 'qmri7ayjt5o9', homeworkId: '4074857', courseId: 'CNQL6VDC' },
    );
    assert.throws(() => Route.keyOf('https://www.educoder.net/classrooms/c123'), /不是关卡地址/);
  });

  // Task URL scopes homeworkId and Scanner.homeworkList identically to its parent shixun_homework detail page
  const sampleWorks = [
    { homework_id: 4074857, name: '目标实训', shixun_identifier: 's1', challenge_count: 1, finished_challenge_count: 0 },
    { homework_id: 4074858, name: '其他实训', shixun_identifier: 's2', challenge_count: 3, finished_challenge_count: 0 },
  ];
  const scanner = createScanner({
    route: Route,
    api: { async homeworks() { return sampleWorks; } },
  });

  await withBrowserMocks({
    location: {
      origin: 'https://www.educoder.net',
      pathname: '/tasks/CNQL6VDC/4074857/qmri7ayjt5o9',
      search: '?coursesId=CNQL6VDC',
      href: 'https://www.educoder.net/tasks/CNQL6VDC/4074857/qmri7ayjt5o9?coursesId=CNQL6VDC',
    },
  }, async () => {
    assert.equal(Route.homeworkId(), 4074857);
    const taskWorks = await scanner.homeworkList('CNQL6VDC');
    assert.deepEqual(taskWorks.map(w => w.homework_id), [4074857]);
  });

  await withBrowserMocks({
    location: {
      origin: 'https://www.educoder.net',
      pathname: '/classrooms/CNQL6VDC/shixun_homework/4074857/detail',
      search: '?tabs=1',
      href: 'https://www.educoder.net/classrooms/CNQL6VDC/shixun_homework/4074857/detail?tabs=1',
    },
  }, async () => {
    assert.equal(Route.homeworkId(), 4074857);
    const parentWorks = await scanner.homeworkList('CNQL6VDC');
    assert.deepEqual(parentWorks.map(w => w.homework_id), [4074857]);
  });

  await withBrowserMocks({
    location: {
      origin: 'https://www.educoder.net',
      pathname: '/classrooms/CNQL6VDC/shixun_homework',
      search: '',
      href: 'https://www.educoder.net/classrooms/CNQL6VDC/shixun_homework',
    },
  }, async () => {
    assert.equal(Route.homeworkId(), 0);
    const allWorks = await scanner.homeworkList('CNQL6VDC');
    assert.deepEqual(allWorks.map(w => w.homework_id), [4074857, 4074858]);
  });
});

test('Model.read normalizes choices, strict image/* filtering, unity, and linuxEnv flags', async () => {
  await withBrowserMocks({
    location: { origin: 'https://www.educoder.net' },
  }, () => {
    const model = Model.read({
      challenge: {
        subject: '第一关　示例',
        position: 3,
        path: 'src/a.py；src/b.txt',
        ignore_space: 1,
        task_pass: [
          '<img src="/api/attachments/10?type=image/png&foo=1">',
          '<img src="/api/attachments/11?type=text/plain">',
          '<img src="/api/attachments/12?type=%E0%A4%A">',
          '<img src="/api/attachments/13?type=image%2Fjpeg">',
        ].join(''),
      },
      myshixun: { identifier: 'ms-xyz' },
      game: { id: 808, status: 0 },
      shixun_environments: [{ tab_type: 1 }],
      chooses: [{
        position: 1,
        subject: '选 A 还是 B',
        category: 2,
        challenge_question: [
          { position: 2, option_name: '第二项' },
          { position: 1, option_name: '第一项' },
        ],
      }],
      test_sets: [
        { input: '1', output: '2', is_invisible: false },
        { input: 'hidden', output: 'h', is_invisible: true },
      ],
    });
    assert.equal(model.title, '第一关 示例');
    assert.equal(model.position, 3);
    assert.equal(model.shixunId, 'ms-xyz');
    assert.equal(model.gameDbId, 808);
    assert.deepEqual(model.paths, ['src/a.py', 'src/b.txt']);
    assert.deepEqual(model.images, [
      'https://www.educoder.net/api/attachments/10?type=image/png',
      'https://www.educoder.net/api/attachments/13?type=image/jpeg',
    ]);
    assert.equal(model.questions[0].position, 1);
    assert.equal(model.questions[0].multi, true);
    assert.equal(model.cases.length, 1);
    assert.equal(model.linuxEnv, false);
    assert.equal(model.rules.matchRule, 'full 且忽略空格');
  });
});

test('Scanner.chain walks prev_game and next_game concurrently preserving exact order', async () => {
  await withBrowserMocks({
    location: { origin: 'https://www.educoder.net' },
  }, async () => {
    const nodes = {
      g1: { prev_game: null, next_game: 'g2', game: { status: 0 } },
      g2: { prev_game: 'g1', next_game: 'g3', game: { status: 2 } },
      g3: { prev_game: 'g2', next_game: 'g4', game: { status: 0 } },
      g4: { prev_game: 'g3', next_game: null, game: { status: 0 } },
    };
    const scanner = createScanner({
      route: Route,
      api: {
        async entryGame() { return 'g3'; },
        async detail(gameId) {
          await new Promise(r => setTimeout(r, gameId === 'g1' ? 15 : 5));
          return nodes[gameId];
        },
      },
    });
    const result = await scanner.chain({ shixun_identifier: 's1', homework_id: 42 }, 'c1');
    assert.deepEqual(result.map(x => x.gameId), ['g1', 'g3', 'g4']);

    const ac = new AbortController();
    ac.abort();
    await assert.rejects(
      scanner.chain({ shixun_identifier: 's1', homework_id: 42 }, 'c1', ac.signal),
      err => isAbortError(err),
    );
  });
});

test('AnswerSource & CodeGenerator handle templates, checkers, lookups, and prompts without mutating model', async () => {
  const tplCache = createTemplateCache(10);
  tplCache.clear();
  const source = createAnswerSource({
    templateCache: tplCache,
    api: {
      async readFile(_g, _h, path) {
        if (path === 'step1/evaluate.py') {
          return '# 序号 1\nif s == "answerOne": ok()\n# 方框 2\nif s == \'answerTwo\': ok()';
        }
        if (path === 'step1/ans.txt') {
          return '序号1：(  )\n序号2：(old)';
        }
        return '';
      },
      async answerInfo() { return { message: [{ answer_name: '标答', answer_contents: '```python\nprint(1)\n```' }] }; },
      async checkTestSets() { return { test_sets: [{ input: '1', output: '2' }, { input: null, output: '11 13 ... 97 ' }] }; },
    },
  });

  const model = {
    title: '填空题',
    body: '<p>输入</p>',
    cases: [],
    images: [],
    paths: ['step1/ans.txt'],
    rules: { matchRule: 'full', ignoreSpace: false },
  };
  const key = { gameId: 'g1', homeworkId: 1 };
  const brief = await source.brief(key, model);
  assert.equal(Object.hasOwn(model, '__brief'), false, 'brief() must not mutate model.__brief');
  assert.equal(brief.cases.length, 2, 'allCases must preserve output-only cases with input:null');
  const plan = await source.checkerPlan(key, model, brief.checker);
  assert.equal(plan.count, 2);
  assert.equal(plan.content, '序号1：(answerOne)\n序号2：(answerTwo)');

  const gen = createCodeGenerator({
    aiSettings: {},
    aiClient: {},
  });
  assert.deepEqual(gen.readFileMap('```json\n{"a.py":"x"}\n```', false), { 'a.py': 'x' });
  assert.deepEqual({ ...gen.readFileMap('{"a.py":"ok","b.py":"trun', true) }, { 'a.py': 'ok' });
  const prompt = gen.buildPrompt(model, ['step1/ans.txt'], { 'step1/ans.txt': 'tmpl' }, {
    brief: { ...brief, reference: { code: 'ref_code()', name: '参考答案' } },
    previousFiles: { 'step1/ans.txt': 'prev_code()' },
  });
  assert.ok(prompt.includes('## 本关判分脚本源码'));
  assert.ok(prompt.includes('## 判分用例'));
  assert.ok(prompt.includes('## 平台参考答案') && prompt.includes('ref_code()'));
  assert.ok(prompt.includes('## 上一次提交的代码') && prompt.includes('prev_code()'));
});

test('Evaluator computes signatures, failure feedback with fallbackCases whitespace visibility, and keeps EvalContext isolated', async () => {
  const evaluator = createEvaluator({ api: {}, answerSource: {} });
  const d1 = { test_sets: [{ result: false, actual_output: 'a', ts_time: 1 }] };
  const d2 = { test_sets: [{ result: false, actual_output: 'b', ts_time: 1 }] };
  assert.notEqual(evaluator.signature(d1), evaluator.signature(d2));
  assert.equal(evaluator.baseline(d1).sig, evaluator.signature(d1));

  const ctx1 = createEvalContext();
  const ctx2 = createEvalContext();
  ctx1.gradedOnce = true;
  assert.equal(ctx2.gradedOnce, false);

  const failed = await evaluator.failedDetail(
    { gameId: 'g1', homeworkId: 1 },
    { lastDetail: { test_sets: [{ position: 1, result: false, input: null, output: null, actual_output: '2 3 97 \n' }] } },
    null,
    [{ position: 1, input: null, output: '11 13 97 ' }],
  );
  assert.equal(failed.count, 1);
  assert.ok(failed.sample.includes('"11 13 97 "'));
  assert.ok(failed.sample.includes('"2 3 97 \\n"'));

  const fb = evaluator.buildFailureFeedback({
    count: 1,
    compile: 'SyntaxError',
    sample: '用例 1: diff',
    passedInputs: ['10'],
  });
  assert.ok(fb.includes('SyntaxError'));
  assert.ok(fb.includes('10'));
});

test('Evaluator.grade triggers game_build.json without saving files and surfaces BUSY errors', async () => {
  let saveCalls = 0;
  let gradePayloadArgs = null;
  let gradeAccepted = true;
  const evaluator = createEvaluator({
    api: {
      gradePayload(detail, key, opts) {
        gradePayloadArgs = { detail, key, opts };
        return { tab_type: opts.tabType, commitID: opts.commitId };
      },
      async gradeWithRetry() { return gradeAccepted; },
      async detail() { return { game: { status: 2 } }; },
      async saveFile() { saveCalls += 1; },
    },
    answerSource: {},
  });

  const detail = { game: { id: 9, status: 0 }, test_sets: [] };
  const key = { gameId: 'g-linux', homeworkId: 42 };
  const model = { env: { tab_type: 3, shixun_environment_id: 77 } };
  const evalCtx = createEvalContext();

  const origSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn, ms, ...args) => origSetTimeout(fn, ms > 10 ? 5 : ms, ...args);
  try {
    const passed = await evaluator.grade(detail, key, model, evalCtx);
    assert.equal(passed, true);
    assert.equal(saveCalls, 0);
    assert.deepEqual(gradePayloadArgs.opts, {
      env: { tab_type: 3, shixun_environment_id: 77 },
      commitId: '',
      tabType: 3,
    });
    assert.equal(evalCtx.gradedOnce, true);

    gradeAccepted = false;
    await assert.rejects(
      evaluator.grade(detail, key, model, evalCtx),
      err => err.code === 'BUSY' && /繁忙/.test(err.message),
    );
  } finally {
    globalThis.setTimeout = origSetTimeout;
  }
});

test('Solver handles choice probe shortcut, Unity/linuxEnv skips, Tier 2 skipping lookupTarget readFile, and Tier 4 AI', async () => {
  // 1. Choice probe all-A shortcut (only 1 choose call)
  let chooseCalls = 0;
  const choiceSolver = createSolver({
    api: {
      async detail() {
        return {
          challenge: { id: 10, subject: '选择', task_pass: '' },
          game: { status: 0 },
          chooses: [{ position: 1, subject: 'Q1', category: 1, challenge_question: [{ position: 1, option_name: 'opt' }] }],
        };
      },
      async choose() {
        chooseCalls += 1;
        return { test_sets: [{ position: 1, standard_answer: 'A' }], choose_correct_num: 1, challenge_chooses_count: 1 };
      },
    },
    evaluator: {
      baseline: () => ({ sig: '', stamp: '' }),
      waitPassed: async () => true,
    },
    model: Model,
    answerSource: {},
    codeGenerator: {},
    prefs: {},
    aiSettings: {},
  });
  await withBrowserMocks({ location: { origin: 'https://www.educoder.net' } }, async () => {
    const res = await choiceSolver.solve({ gameId: 'g1', homeworkId: 1 });
    assert.deepEqual(res, { status: 'passed', title: '选择' });
    assert.equal(chooseCalls, 1);
  });

  // 2. Single-file Python Tier 2 reference passes WITHOUT calling lookupTarget (no template readFile)
  let readTemplateCalls = 0;
  let savedPayload = null;
  const tier2Solver = createSolver({
    api: {
      gradeExtras: () => ({}),
      gradePayload: () => ({}),
      async detail() {
        return {
          challenge: { id: 20, subject: '编程', path: 'src/main.py', task_pass: '' },
          game: { id: 9, status: 0 },
          myshixun: { identifier: 'ms1' },
          shixun_environments: [{ tab_type: 1, shixun_environment_id: 1 }],
        };
      },
      async saveFile(_id, payload) {
        savedPayload = payload;
        return { content: { commitID: 'c1' } };
      },
      async gradeWithRetry() { return true; },
    },
    model: Model,
    answerSource: {
      async brief() { return { checker: null, reference: { code: 'print(42)', name: '参考答案' }, cases: [{ input: '1', output: '42' }] }; },
      async checkerPlan() { return null; },
      async lookupTarget() { readTemplateCalls += 1; return 'src/main.py'; },
      acceptReference: () => true,
    },
    evaluator: {
      baseline: () => ({ sig: '', stamp: '' }),
      async writeAndGrade(_d, _k, _m, files) {
        savedPayload = files;
        return true;
      },
    },
    codeGenerator: {},
    prefs: createPrefs(),
    aiSettings: { ready: () => false },
  });
  await withBrowserMocks({ location: { origin: 'https://www.educoder.net' } }, async () => {
    const res = await tier2Solver.solve({ gameId: 'g2', homeworkId: 1 });
    assert.deepEqual(res, { status: 'passed', title: '编程' });
    assert.equal(readTemplateCalls, 0, 'Tier 2 single-file Python should not call lookupTarget when reference succeeds');
    assert.deepEqual(savedPayload, { 'src/main.py': 'print(42)' });
  });

  // 3. Tier 4 AI stops on non-retryable AiRequestError
  const prefs = createPrefs();
  prefs.data = { ...prefs.defaults, aiFallback: true, codeRetries: 3 };
  let aiCalls = 0;
  const aiSolver = createSolver({
    api: {
      async detail() {
        return {
          challenge: { id: 30, subject: 'AI关', path: 'main.py', task_pass: '' },
          game: { id: 9, status: 0 },
          shixun_environments: [{ tab_type: 1 }],
        };
      },
    },
    model: Model,
    answerSource: {
      async brief() { return { checker: null, reference: null, cases: [] }; },
      async checkerPlan() { return null; },
      async lookupTarget() { return ''; },
      async readTemplates() { return { 'main.py': '' }; },
    },
    evaluator: {},
    codeGenerator: {
      async solve() {
        aiCalls += 1;
        throw new AiRequestError('API Key 无效', false);
      },
    },
    prefs,
    aiSettings: { ready: () => true },
  });
  await withBrowserMocks({ location: { origin: 'https://www.educoder.net' } }, async () => {
    const res = await aiSolver.solve({ gameId: 'g3', homeworkId: 1 });
    assert.equal(res.status, 'failed');
    assert.equal(res.reason, 'API Key 无效');
    assert.equal(aiCalls, 1, 'fatal non-retryable AiRequestError should stop retry loop');
  });
});

test('Api.startEnv and Api.exitDeletePod build canonical payloads and respect AbortSignal', async () => {
  const saved = new Map();
  const overrides = {
    document: { cookie: '_educoder_session=sess1' },
    location: { origin: 'https://www.educoder.net', search: '?zzud=u1' },
    sessionStorage: { getItem: () => null },
    localStorage: { getItem: () => null },
    GM_xmlhttpRequest: null,
  };
  let requested = null;
  let mockResponse = {
    status: 0,
    data: { ssh_address: '1.2.3.4', port: 2222, username: 'root', password: 'pw' },
  };
  overrides.GM_xmlhttpRequest = opts => {
    requested = opts;
    queueMicrotask(() => opts.onload({
      status: 200,
      response: mockResponse,
    }));
    return { abort() {} };
  };
  for (const [k, v] of Object.entries(overrides)) {
    saved.set(k, Object.getOwnPropertyDescriptor(globalThis, k));
    Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  }

  try {
    const resp = await Api.startEnv('shixun-abc', {
      envId: 88,
      gameDbId: 999,
      tabType: 3,
      homeworkId: 4074857,
    });
    assert.equal(resp.status, 0);
    assert.equal(resp.data.ssh_address, '1.2.3.4');
    assert.equal(requested.method, 'GET');
    const parsed = new URL(requested.url);
    assert.equal(parsed.pathname, '/api/myshixuns/shixun-abc/start.json');
    assert.equal(parsed.searchParams.get('shixun_environment_id'), '88');
    assert.equal(parsed.searchParams.get('game_id'), '999');
    assert.equal(parsed.searchParams.get('tab_type'), '3');
    assert.equal(parsed.searchParams.get('homework_common_id'), '4074857');
    assert.equal(parsed.searchParams.get('zzud'), 'u1');
    assert.equal(parsed.searchParams.has('courseId'), false);
    assert.equal(parsed.searchParams.has('homeworkId'), false);
    assert.equal(parsed.searchParams.has('taskId'), false);

    mockResponse = { status: 0 };
    const delResp = await Api.exitDeletePod('shixun-abc', {
      envId: 88,
      gameDbId: 999,
      tabType: 3,
      homeworkId: 4074857,
    });
    assert.equal(delResp.status, 0);
    assert.equal(requested.method, 'POST');
    const delUrl = new URL(requested.url);
    assert.equal(delUrl.pathname, '/api/myshixuns/shixun-abc/exit_delete_pod.json');
    assert.equal(delUrl.searchParams.get('zzud'), 'u1');
    assert.deepEqual(JSON.parse(requested.data), {
      shixun_environment_id: 88,
      game_id: 999,
      tab_type: 3,
      homework_common_id: 4074857,
    });

    const ac = new AbortController();
    ac.abort();
    await assert.rejects(
      Api.startEnv('shixun-abc', { envId: 88, gameDbId: 999, homeworkId: 4074857 }, ac.signal),
      err => isAbortError(err),
    );
    await assert.rejects(
      Api.exitDeletePod('shixun-abc', { envId: 88, gameDbId: 999, homeworkId: 4074857 }, ac.signal),
      err => isAbortError(err),
    );
  } finally {
    for (const [k, desc] of saved.entries()) {
      if (desc) Object.defineProperty(globalThis, k, desc);
      else delete globalThis[k];
    }
  }
});
