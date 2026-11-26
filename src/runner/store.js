import { LOG_CAPACITY, MSG_LEVEL } from '../core/constants.js';

/** Computes progress counters (`current`, `planned`, `settled`) from runtime state. */
export function computeProgress(state) {
  const { phase, cursor, queue, jobs, results } = state;
  const { passed, skipped, failed } = results;
  const settled = passed.length + skipped.length + failed.length;
  const recorded = candidate => candidate === cursor
    || (cursor.gameId != null && candidate.gameId === cursor.gameId && candidate.homeworkId === cursor.homeworkId);
  const current = phase === 'running' && cursor
    && ![passed, skipped, failed].some(items => items.some(recorded))
    ? cursor
    : null;
  const scheduled = jobs.reduce((sum, job) => sum + (Number(job.total) || 0), 0);
  const planned = Math.max(scheduled, queue.length + settled + Number(current !== null));
  return { current, planned, settled };
}

/**
 * Reactive runtime state container with O(1) job lookup, revision tracking, and event pub/sub.
 */
export function createStore() {
  const state = {
    phase: 'idle',
    course: { id: '', name: '' },
    jobs: [],
    queue: [],
    cursor: null,
    scanProgress: { done: 0, total: 0 },
    results: { passed: [], skipped: [], failed: [] },
    logs: [],
  };

  const rev = { state: 0, jobs: 0, logs: 0, summary: 0 };
  const listeners = new Set();
  let jobMap = new Map();
  let logSeq = 0;

  function emit(event) {
    for (const listener of [...listeners]) {
      listener(event, state, rev);
    }
  }

  return {
    state,
    rev,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isActive() {
      return state.phase === 'countdown' || state.phase === 'running';
    },
    isBusy() {
      return state.phase === 'countdown' || state.phase === 'running' || state.phase === 'paused';
    },
    jobOf(homeworkId) {
      return jobMap.get(String(homeworkId)) || null;
    },
    jobName(homeworkId) {
      const job = this.jobOf(homeworkId);
      return job ? job.name : `作业 ${homeworkId}`;
    },
    progress() {
      return computeProgress(state);
    },
    setPhase(phase, immediate = true) {
      state.phase = phase;
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    setCourse(course, immediate = true) {
      state.course = course;
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    setJobs(jobs, immediate = true) {
      state.jobs = jobs;
      jobMap = new Map(jobs.map(job => [String(job.id), job]));
      rev.jobs += 1;
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    updateJob(homeworkId, updater, immediate = true) {
      const job = jobMap.get(String(homeworkId));
      if (!job) return;
      updater(job);
      rev.jobs += 1;
      emit({ type: 'change', immediate });
    },
    markJobPassed(homeworkId, immediate = true) {
      const job = jobMap.get(String(homeworkId));
      if (!job) return;
      job.passed = Math.min(job.total, job.passed + 1);
      if (job.passed >= job.total) job.status = 'done';
      rev.jobs += 1;
      emit({ type: 'change', immediate });
    },
    setQueue(queue, immediate = true) {
      state.queue = queue;
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    shiftQueue() {
      return state.queue.shift() || null;
    },
    requeueFront(item) {
      if (!item) return;
      state.queue.unshift(item);
      rev.state += 1;
    },
    setCursor(item, immediate = true) {
      state.cursor = item;
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    setCursorTitle(item, title, immediate = true) {
      if (state.cursor !== item) return;
      item.title = title;
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    setScanProgress(done, total, immediate = true) {
      state.scanProgress = { done, total };
      rev.state += 1;
      emit({ type: 'change', immediate });
    },
    recordResult(status, item, reason) {
      if (status === 'passed') {
        state.results.passed.push(item);
      } else if (status === 'skipped') {
        state.results.skipped.push({ ...item, reason });
      } else {
        state.results.failed.push({ ...item, reason });
      }
      rev.summary += 1;
      rev.state += 1;
      emit({ type: 'change', immediate: true });
    },
    takeFailedForRetry() {
      const items = state.results.failed.map(item => ({ ...item }));
      state.results.failed = [];
      rev.summary += 1;
      rev.state += 1;
      return items;
    },
    addLog(message, level = MSG_LEVEL.INFO) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      state.logs.push({ seq: ++logSeq, time, message, level });
      if (state.logs.length > LOG_CAPACITY) state.logs = state.logs.slice(-LOG_CAPACITY);
      rev.logs += 1;
      emit({ type: 'change', immediate: false });
    },
    clearIdleQueue() {
      state.jobs = [];
      jobMap = new Map();
      state.queue = [];
      rev.jobs += 1;
      rev.state += 1;
      emit({ type: 'change', immediate: true });
    },
    resetAll() {
      state.phase = 'idle';
      state.jobs = [];
      jobMap = new Map();
      state.queue = [];
      state.cursor = null;
      state.scanProgress = { done: 0, total: 0 };
      state.results = { passed: [], skipped: [], failed: [] };
      rev.jobs += 1;
      rev.summary += 1;
      rev.state += 1;
      emit({ type: 'change', immediate: true });
    },
    requestView(view) {
      emit({ type: 'view', view });
    },
    notify(message, level = MSG_LEVEL.INFO) {
      emit({ type: 'notice', message, level });
    },
  };
}
