import { MSG_LEVEL, TIMING } from '../core/constants.js';
import { abortError, isAbortError, mapWithConcurrency, norm, sleep } from '../core/utils.js';
import { Prefs } from '../config/prefs.js';
import { Route } from '../platform/route.js';
import { Scanner } from '../platform/scanner.js';
import { Solver } from '../solver/solver.js';

/**
 * Queue state machine coordinating challenge scanning, bounded concurrent chain loading,
 * cooperative cancellation (`AbortController`), and pause/resume/retry transitions.
 */
export function createRunner({
  store,
  prefs = Prefs,
  route = Route,
  scanner = Scanner,
  solver = Solver,
}) {
  let scanning = false;
  let scanPromise = null;
  let scanController = null;
  let runController = null;
  let countdownTimer = 0;

  function cancelRun() {
    if (countdownTimer) {
      clearTimeout(countdownTimer);
      countdownTimer = 0;
    }
    if (runController) {
      runController.abort();
      runController = null;
    }
  }

  function cancelScan() {
    if (scanController) {
      scanController.abort();
      scanController = null;
    }
  }

  async function doScan(signal) {
    const courseId = route.courseId() || (route.isTask() ? route.keyOf().courseId : '');
    const cachedCourseName = store.state.course.id === courseId
      && store.state.course.name
      && store.state.course.name !== courseId
      ? store.state.course.name
      : '';
    const [courseName, rawWorks] = await Promise.all([
      cachedCourseName || scanner.courseName(courseId, signal),
      scanner.homeworkList(courseId, signal),
    ]);
    if (signal.aborted) throw abortError();
    store.setCourse({ id: courseId, name: courseName });

    const pinned = route.homeworkId();
    const jobs = rawWorks.map(work => ({
      id: work.homework_id,
      name: norm(work.name),
      shixun: work.shixun_identifier,
      total: pinned
        ? Number(work.challenge_count) || 0
        : Number(work.challenge_count) - Number(work.finished_challenge_count),
      passed: 0,
      status: 'pending',
    }));
    store.setJobs(jobs);

    if (!jobs.length) {
      store.addLog('当前没有待完成的作业', MSG_LEVEL.WARN);
      store.setQueue([]);
      return store.state.jobs;
    }

    store.addLog(`扫描到 ${jobs.length} 份待办作业，正在解析关卡链…`, MSG_LEVEL.INFO);
    const queue = await buildQueue(signal);
    if (signal.aborted) throw abortError();
    store.setQueue(queue);
    const total = queue.length;
    store.addLog(
      total ? `扫描完成，共 ${total} 个关卡待答题` : '所有关卡均已通关，无需重复作答',
      total ? MSG_LEVEL.SUCCESS : MSG_LEVEL.WARN,
    );
    return store.state.jobs;
  }

  async function buildQueue(signal) {
    const jobs = store.state.jobs;
    let done = 0;
    store.setScanProgress(0, jobs.length);

    const perJob = await mapWithConcurrency(jobs, TIMING.scanConcurrency, async job => {
      if (signal.aborted) throw abortError();
      let items = [];
      try {
        items = await scanner.chain(
          { ...job, homework_id: job.id, shixun_identifier: job.shixun },
          store.state.course.id,
          signal,
        );
        const estimated = job.total;
        store.updateJob(job.id, target => {
          target.total = items.length;
          if (!items.length) target.status = 'done';
        });
        const note = estimated && estimated !== items.length
          ? `（已过滤已通过关卡，共 ${estimated} 关）`
          : '';
        store.addLog(`· ${job.name}：待完成 ${items.length} 关${note}`);
      } catch (error) {
        if (isAbortError(error) || signal.aborted) throw abortError();
        store.addLog(`· ${job.name} 关卡读取失败：${error.message}`, MSG_LEVEL.WARN);
      } finally {
        done += 1;
        store.setScanProgress(done, jobs.length);
      }
      return items;
    }, signal);

    return perJob.flat();
  }

  function recordOutcome(item, outcome) {
    const label = outcome.title || item.title || item.gameId;
    if (outcome.status === 'passed') {
      store.markJobPassed(item.homeworkId);
      store.recordResult('passed', item);
      store.addLog(`✓ ${label}　评测通过`, MSG_LEVEL.SUCCESS);
    } else if (outcome.status === 'skipped') {
      store.recordResult('skipped', item, outcome.reason);
      store.addLog(`⏭ ${label}　已跳过：${outcome.reason}`, MSG_LEVEL.WARN);
    } else {
      store.recordResult('failed', item, outcome.reason);
      store.addLog(`✕ ${label}　${outcome.reason}`, MSG_LEVEL.ERROR);
    }
  }

  async function waitStepGap(signal) {
    try {
      await sleep(TIMING.stepGap, signal);
      return true;
    } catch (error) {
      if (isAbortError(error)) {
        store.setCursor(null);
        return false;
      }
      throw error;
    }
  }

  /** Executes one queued challenge inside its enclosing homework session. */
  async function executeItem(session, item, signal) {
    store.setCursor(item);
    let outcome;
    try {
      outcome = await session.solveStage(item, {
        log: (message, level) => store.addLog(message, level),
        signal,
        onTitle: title => store.setCursorTitle(item, title),
        onNotice: (message, level) => store.notify(message, level),
      });
    } catch (error) {
      if (isAbortError(error) || signal.aborted) {
        if (store.state.phase === 'paused') store.requeueFront(item);
        store.setCursor(null);
        return false;
      }
      if (error.code === 401) {
        store.requeueFront(item);
        store.setCursor(null);
        store.setPhase('paused');
        store.addLog(error.message, MSG_LEVEL.WARN);
        return false;
      }
      outcome = { status: 'failed', reason: error.message };
    }

    if (signal.aborted) {
      if (store.state.phase === 'paused') store.requeueFront(item);
      store.setCursor(null);
      return false;
    }

    recordOutcome(item, outcome);
    return true;
  }

  return {
    active() { return store.isActive(); },
    busy() { return store.isBusy(); },
    log(message, level = MSG_LEVEL.INFO) { store.addLog(message, level); },
    async scan() {
      if (scanning) return scanPromise || store.state.jobs;
      const previous = store.state.phase;
      scanning = true;
      const controller = new AbortController();
      scanController = controller;
      store.setPhase('scanning');
      store.setScanProgress(0, 0);
      scanPromise = doScan(controller.signal);
      try {
        return await scanPromise;
      } finally {
        scanning = false;
        scanPromise = null;
        if (scanController === controller) scanController = null;
        if (store.state.phase === 'scanning') {
          store.setPhase(previous === 'scanning' ? 'idle' : previous);
        }
      }
    },
    build(signal) {
      return buildQueue(signal);
    },
    async start() {
      if (store.state.phase === 'scanning' || this.active()) return;
      if (store.state.phase === 'paused') {
        cancelRun();
        const controller = new AbortController();
        runController = controller;
        store.setPhase('running');
        this.log('已恢复队列，继续自动答题');
        this.run(controller.signal);
        return;
      }

      try {
        if (!store.state.jobs.length || !store.state.queue.length) {
          await this.scan();
          if (store.state.phase !== 'idle') return;
          if (!store.state.jobs.length) {
            store.setPhase('idle');
            return;
          }
        }
      } catch (error) {
        if (isAbortError(error)) return;
        store.setPhase('idle');
        store.setQueue([]);
        this.log(`无法启动：${error.message}`, MSG_LEVEL.WARN);
        return;
      }

      if (!store.state.queue.length) {
        store.setPhase('idle');
        this.log('当前没有需要作答的关卡', MSG_LEVEL.WARN);
        return;
      }

      this.log(`准备就绪，即将按队列顺序自动作答（共 ${store.state.queue.length} 关）`, MSG_LEVEL.SUCCESS);
      store.setPhase('countdown');
      store.requestView('work');

      cancelRun();
      const controller = new AbortController();
      runController = controller;
      const delayMs = Math.max(1, prefs.data.delay) * 1000;
      countdownTimer = setTimeout(() => {
        countdownTimer = 0;
        if (controller.signal.aborted) return;
        store.setPhase('running');
        this.run(controller.signal);
      }, delayMs);
    },
    /** Processes queued challenges grouped by homework session, disposing cleanly between jobs. */
    async run(signal) {
      while (store.state.queue.length) {
        if (signal.aborted) return;
        const homeworkId = store.state.queue[0].homeworkId;
        const job = store.jobOf(homeworkId) || { id: homeworkId, name: store.jobName(homeworkId), shixun: '' };
        const session = solver.openJob(job);
        let abortedOrPaused = false;
        try {
          while (store.state.queue.length && store.state.queue[0].homeworkId === homeworkId) {
            if (signal.aborted) {
              abortedOrPaused = true;
              return;
            }
            const item = store.shiftQueue();
            if (!await executeItem(session, item, signal)) {
              abortedOrPaused = true;
              return;
            }
            if (store.state.queue.length && store.state.queue[0].homeworkId === homeworkId) {
              if (!await waitStepGap(signal)) {
                abortedOrPaused = true;
                return;
              }
            }
          }
        } finally {
          await session.dispose({ log: (message, level) => store.addLog(message, level) });
        }
        if (abortedOrPaused) return;
        if (store.state.queue.length) {
          if (!await waitStepGap(signal)) return;
        }
      }

      if (signal.aborted) return;
      store.setPhase('done');
      store.setCursor(null);
      this.log('队列中的所有关卡已处理完毕', MSG_LEVEL.SUCCESS);
      store.requestView('summary');
    },
    pause() {
      if (!this.active()) return;
      store.setPhase('paused');
      cancelRun();
      this.log('已暂停自动答题，可随时点击「继续答题」恢复', MSG_LEVEL.WARN);
    },
    stop() {
      if (store.state.phase === 'done') return;
      store.setPhase('done');
      store.setCursor(null);
      cancelRun();
      cancelScan();
      this.log('已手动结束本次答题队列', MSG_LEVEL.WARN);
      store.requestView('summary');
    },
    reset() {
      cancelRun();
      cancelScan();
      store.resetAll();
    },
    retryFailed() {
      const items = store.takeFailedForRetry();
      if (!items.length) {
        store.notify('当前没有需要重试的未通过关卡', MSG_LEVEL.WARN);
        return;
      }
      cancelRun();
      const controller = new AbortController();
      runController = controller;
      store.setQueue(items);
      store.setPhase('running');
      store.requestView('work');
      this.run(controller.signal);
    },
    onRouteChange({ panelOpen, inWorkView }) {
      if (store.state.phase !== 'idle') return;
      store.clearIdleQueue();
      if (panelOpen && inWorkView) {
        this.scan().catch(() => {});
      }
    },
  };
}
