import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, computeProgress } from '../src/runner/store.js';
import { createRunner } from '../src/runner/runner.js';
import { createPrefs } from '../src/config/prefs.js';
import { LOG_CAPACITY, MSG_LEVEL } from '../src/core/constants.js';
import { abortError, sleep } from '../src/core/utils.js';

function makeMockSolver(handler) {
  return {
    openJob(job) {
      return {
        job,
        solveStage: (item, callbacks) => handler(item, callbacks),
        async dispose() {},
      };
    },
  };
}

function makePrefs(overrides = {}) {
  const prefs = createPrefs();
  prefs.data = { ...prefs.defaults, ...overrides };
  return prefs;
}

test('Store maintains O(1) job map, monotonic revisions, bounded logs, and pub/sub', () => {
  const store = createStore();
  const events = [];
  const off = store.subscribe(ev => events.push(ev));

  store.setJobs([
    { id: 101, name: '作业一', shixun: 's1', total: 2, passed: 0, status: 'pending' },
    { id: 102, name: '作业二', shixun: 's2', total: 1, passed: 0, status: 'pending' },
  ]);
  assert.equal(store.jobOf('101').name, '作业一');
  assert.equal(store.jobName(999), '作业 999');

  const item = { gameId: 'g1', homeworkId: 101, title: '第一关' };
  store.setQueue([item, { gameId: 'g2', homeworkId: 101 }]);
  store.setPhase('running');
  const active = store.shiftQueue();
  store.setCursor(active);
  assert.deepEqual(computeProgress(store.state), { current: item, planned: 3, settled: 0 });

  store.markJobPassed(101);
  store.markJobPassed(101);
  assert.equal(store.jobOf(101).status, 'done');

  store.recordResult('failed', { gameId: 'g2', homeworkId: 101 }, '错误');
  const retried = store.takeFailedForRetry();
  assert.equal(retried.length, 1);
  assert.equal(store.state.results.failed.length, 0);

  for (let i = 0; i < LOG_CAPACITY + 10; i += 1) {
    store.addLog(`log-${i}`, MSG_LEVEL.INFO);
  }
  assert.equal(store.state.logs.length, LOG_CAPACITY);
  assert.equal(store.state.logs[0].message, 'log-10');
  assert.equal(store.state.logs[0].level, MSG_LEVEL.INFO);
  assert.ok(store.state.logs[LOG_CAPACITY - 1].seq > store.state.logs[0].seq);
  assert.ok(events.some(e => e.type === 'change' && e.immediate === false));

  off();
});

test('Runner.build scans chains concurrently while preserving job order', async () => {
  const store = createStore();
  store.setCourse({ id: 'c1', name: '课程' });
  store.setJobs([
    { id: 1, name: 'A', shixun: 's1', total: 1, passed: 0, status: 'pending' },
    { id: 2, name: 'B', shixun: 's2', total: 1, passed: 0, status: 'pending' },
    { id: 3, name: 'C', shixun: 's3', total: 1, passed: 0, status: 'pending' },
    { id: 4, name: 'D', shixun: 's4', total: 1, passed: 0, status: 'pending' },
  ]);

  let active = 0;
  let peak = 0;
  const runner = createRunner({
    store,
    prefs: makePrefs(),
    route: {},
    solver: {},
    scanner: {
      async chain(work) {
        active += 1;
        peak = Math.max(peak, active);
        await sleep(work.id === 1 ? 35 : 5);
        active -= 1;
        return [{ gameId: `g${work.id}`, homeworkId: work.id }];
      },
    },
  });

  const queue = await runner.build(new AbortController().signal);
  assert.ok(peak > 1 && peak <= 3, `expected bounded concurrent scan, peak=${peak}`);
  assert.deepEqual(queue.map(item => item.gameId), ['g1', 'g2', 'g3', 'g4']);
  assert.deepEqual(store.state.scanProgress, { done: 4, total: 4 });
});

test('Runner cancels countdown timer on pause/stop and prevents stale run start', async () => {
  const store = createStore();
  store.setJobs([{ id: 1, name: 'J1', shixun: 's1', total: 1, passed: 0, status: 'pending' }]);
  store.setQueue([{ gameId: 'g1', homeworkId: 1 }]);

  let solveCalls = 0;
  const runner = createRunner({
    store,
    prefs: makePrefs({ delay: 1 }),
    route: {},
    scanner: {},
    solver: makeMockSolver(async () => {
      solveCalls += 1;
      return { status: 'passed', title: 'G1' };
    }),
  });

  await runner.start();
  assert.equal(store.state.phase, 'countdown');
  runner.pause();
  assert.equal(store.state.phase, 'paused');

  await sleep(1100);
  assert.equal(solveCalls, 0, 'paused countdown must not fire solve()');
  assert.equal(store.state.queue.length, 1);
});

test('Runner pause requeues interrupted item while stop and reset do not', async () => {
  // 1. Pause requeues
  const store1 = createStore();
  store1.setJobs([{ id: 1, name: 'J1', shixun: 's1', total: 2, passed: 0, status: 'pending' }]);
  store1.setQueue([{ gameId: 'g1', homeworkId: 1 }, { gameId: 'g2', homeworkId: 1 }]);

  let solverEnteredResolve;
  const solverEntered = new Promise(r => { solverEnteredResolve = r; });
  const runner1 = createRunner({
    store: store1,
    prefs: makePrefs(),
    route: {},
    scanner: {},
    solver: makeMockSolver(async (_item, { signal }) => {
      solverEnteredResolve();
      await sleep(5000, signal);
      return { status: 'passed' };
    }),
  });

  // Drive via start() paused/resume path so runner tracks runController
  store1.setPhase('paused');
  await runner1.start();
  await solverEntered;
  runner1.pause();
  await sleep(20);
  assert.equal(store1.state.phase, 'paused');
  assert.equal(store1.state.cursor, null);
  assert.deepEqual(store1.state.queue.map(i => i.gameId), ['g1', 'g2']);

  // 2. Stop does NOT requeue
  const store2 = createStore();
  store2.setJobs([{ id: 1, name: 'J1', shixun: 's1', total: 2, passed: 0, status: 'pending' }]);
  store2.setQueue([{ gameId: 'g1', homeworkId: 1 }, { gameId: 'g2', homeworkId: 1 }]);
  let entered2Resolve;
  const entered2 = new Promise(r => { entered2Resolve = r; });
  const runner2 = createRunner({
    store: store2,
    prefs: makePrefs(),
    route: {},
    scanner: {},
    solver: makeMockSolver(async (_item, { signal }) => {
      entered2Resolve();
      await sleep(5000, signal);
      return { status: 'passed' };
    }),
  });
  store2.setPhase('paused');
  await runner2.start();
  await entered2;
  runner2.stop();
  await sleep(20);
  assert.equal(store2.state.phase, 'done');
  assert.deepEqual(store2.state.queue.map(i => i.gameId), ['g2']);

  // 3. Reset during active run leaves empty queue (no stale requeue)
  const store3 = createStore();
  store3.setJobs([{ id: 1, name: 'J1', shixun: 's1', total: 1, passed: 0, status: 'pending' }]);
  store3.setQueue([{ gameId: 'g1', homeworkId: 1 }]);
  let entered3Resolve;
  const entered3 = new Promise(r => { entered3Resolve = r; });
  const runner3 = createRunner({
    store: store3,
    prefs: makePrefs(),
    route: {},
    scanner: {},
    solver: makeMockSolver(async (_item, { signal }) => {
      entered3Resolve();
      await sleep(5000, signal);
      return { status: 'passed' };
    }),
  });
  store3.setPhase('paused');
  await runner3.start();
  await entered3;
  runner3.reset();
  await sleep(20);
  assert.equal(store3.state.phase, 'idle');
  assert.deepEqual(store3.state.queue, []);
});

test('Runner handles 401 by requeueing & pausing, and supports retryFailed & route changes', async () => {
  const store = createStore();
  store.setJobs([{ id: 1, name: 'J1', shixun: 's1', total: 1, passed: 0, status: 'pending' }]);
  store.setQueue([{ gameId: 'g1', homeworkId: 1 }]);

  let fail401 = true;
  const runner = createRunner({
    store,
    prefs: makePrefs(),
    route: {
      courseId: () => 'c1',
      homeworkId: () => 0,
      isTask: () => false,
    },
    scanner: {
      async courseName() { return '测试课'; },
      async homeworkList() { return []; },
    },
    solver: makeMockSolver(async item => {
      if (fail401) {
        const err = new Error('登录状态已过期');
        err.code = 401;
        throw err;
      }
      return { status: 'passed', title: item.gameId };
    }),
  });

  store.setPhase('paused');
  await runner.start();
  await sleep(20);
  assert.equal(store.state.phase, 'paused');
  assert.deepEqual(store.state.queue.map(i => i.gameId), ['g1']);

  const waitDone = () => new Promise((resolve, reject) => {
    if (store.state.phase === 'done') { resolve(); return; }
    const timer = setTimeout(() => { off(); reject(new Error(`Timed out in phase ${store.state.phase}`)); }, 2000);
    const off = store.subscribe(() => {
      if (store.state.phase === 'done') {
        clearTimeout(timer);
        off();
        resolve();
      }
    });
  });

  fail401 = false;
  await runner.start();
  await waitDone();
  assert.equal(store.state.phase, 'done');
  assert.equal(store.state.results.passed.length, 1);

  // retryFailed with empty failed list emits notice
  const notices = [];
  store.subscribe(ev => { if (ev.type === 'notice') notices.push(ev.message); });
  runner.retryFailed();
  assert.equal(notices.length, 1);

  // retryFailed with failed items moves them back to queue and runs
  store.recordResult('failed', { gameId: 'g9', homeworkId: 1 }, 'boom');
  runner.retryFailed();
  await waitDone();
  assert.equal(store.state.phase, 'done');
  assert.equal(store.state.results.passed.length, 2);

  // onRouteChange clears idle queue & triggers scan when panel open in work view
  runner.reset();
  store.setJobs([{ id: 2, name: 'Old', shixun: 's2', total: 1, passed: 0, status: 'pending' }]);
  runner.onRouteChange({ panelOpen: true, inWorkView: true });
  await sleep(20);
  assert.equal(store.state.course.name, '测试课');
  assert.equal(store.state.jobs.length, 0);
  void abortError;
});

test('Runner scopes JobSession strictly per homework and always disposes on completion or pause', async () => {
  const origSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn, ms, ...args) => origSetTimeout(fn, ms === 300 ? 1 : ms, ...args);
  try {
    const store = createStore();
    store.setJobs([
      { id: 101, name: '实训A', shixun: 'sA', total: 2, passed: 0, status: 'pending' },
      { id: 102, name: '实训B', shixun: 'sB', total: 1, passed: 0, status: 'pending' },
    ]);
    store.setQueue([
      { gameId: 'g1', homeworkId: 101 },
      { gameId: 'g2', homeworkId: 101 },
      { gameId: 'g3', homeworkId: 102 },
    ]);

    const timeline = [];
    const runner = createRunner({
      store,
      prefs: makePrefs(),
      route: {},
      scanner: {},
      solver: {
        openJob(job) {
          timeline.push(`open:${job.id}`);
          return {
            async solveStage(item) {
              timeline.push(`solve:${job.id}:${item.gameId}`);
              return { status: 'passed', title: item.gameId };
            },
            async dispose() {
              timeline.push(`dispose:${job.id}`);
            },
          };
        },
      },
    });

    await runner.run(new AbortController().signal);
    assert.equal(store.state.phase, 'done');
    assert.deepEqual(timeline, [
      'open:101',
      'solve:101:g1',
      'solve:101:g2',
      'dispose:101',
      'open:102',
      'solve:102:g3',
      'dispose:102',
    ]);

    // Pause / abort still runs session.dispose() in finally
    const store2 = createStore();
    store2.setJobs([{ id: 201, name: '实训C', shixun: 'sC', total: 1, passed: 0, status: 'pending' }]);
    store2.setQueue([{ gameId: 'g9', homeworkId: 201 }]);
    const pauseEvents = [];
    let enteredResolve;
    const entered = new Promise(r => { enteredResolve = r; });
    const runner2 = createRunner({
      store: store2,
      prefs: makePrefs(),
      route: {},
      scanner: {},
      solver: {
        openJob(job) {
          pauseEvents.push(`open:${job.id}`);
          return {
            async solveStage(_item, { signal }) {
              enteredResolve();
              await sleep(5000, signal);
              return { status: 'passed' };
            },
            async dispose() {
              pauseEvents.push(`dispose:${job.id}`);
            },
          };
        },
      },
    });
    store2.setPhase('paused');
    await runner2.start();
    await entered;
    runner2.pause();
    await sleep(20);
    assert.deepEqual(pauseEvents, ['open:201', 'dispose:201']);
  } finally {
    globalThis.setTimeout = origSetTimeout;
  }
});
