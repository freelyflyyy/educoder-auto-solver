import { HOST_TAG, MSG_LEVEL, PHASE_LABEL, TIMING } from '../core/constants.js';
import { isAbortError, raf } from '../core/utils.js';
import { Prefs } from '../config/prefs.js';
import { Route } from '../platform/route.js';
import { buildPanelTemplate } from './template.js';
import { createDock } from './dock.js';
import { createSettingsPanel } from './settings-panel.js';

const VIEW_NAMES = ['work', 'summary', 'settings'];
const cancelRaf = typeof cancelAnimationFrame === 'function'
  ? id => cancelAnimationFrame(id)
  : id => clearTimeout(id);

/**
 * Primary UI view renderer with `requestAnimationFrame` update batching,
 * dirty-checked targeted DOM updates, and SPA route watching.
 */
export function createView({
  store,
  runner,
  prefs = Prefs,
  aiSettings,
  aiClient,
  templateCache,
  route = Route,
}) {
  const dock = createDock();
  const settingsPanel = createSettingsPanel({ prefs, aiSettings, templateCache, aiClient });

  const view = {
    host: null,
    ui: null,
    els: null,
    dock,
    settingsPanel,
    panelView: 'work',
    originalTitle: null,
    renderedTitle: null,
    finishedAt: null,
    pending: 0,
    toastTimer: 0,
    watchTimer: 0,
    onPopState: null,
    unsubscribe: null,
    lastPath: '',
    seen: '',
    cache: {
      panelView: '',
      phase: '',
      jobsRev: -1,
      activeJobId: undefined,
      scanning: null,
      logsRev: -1,
      logRows: -1,
      lastLogSeq: 0,
      logsEmpty: true,
      summaryRev: -1,
      pillText: '',
      courseText: '',
      currentText: '',
      metricText: '',
      barMax: -1,
      barVal: -1,
    },
    build() {
      const host = document.createElement(HOST_TAG);
      const ui = host.attachShadow({ mode: 'open' });
      ui.innerHTML = buildPanelTemplate();
      document.body.append(host);
      this.host = host;
      this.ui = ui;
      const $ = id => ui.getElementById(id);
      this.els = {
        panel: $('panel'),
        pill: $('pill'),
        pillCount: $('pillCount'),
        status: $('status'),
        work: $('work'),
        summary: $('summary'),
        settings: $('settings'),
        gear: $('gear'),
        toast: $('toast'),
        course: $('course'),
        current: $('current'),
        metric: $('metric'),
        bar: $('bar'),
        rescan: $('rescan'),
        scanState: $('scanState'),
        scanTitle: $('scanTitle'),
        scanFill: $('scanFill'),
        scanBar: $('scanBar'),
        scanCount: $('scanCount'),
        rows: $('rows'),
        logs: $('logs'),
        start: $('start'),
        stop: $('stop'),
        again: $('again'),
        retry: $('retry'),
        passedCount: $('passedCount'),
        skippedCount: $('skippedCount'),
        failedCount: $('failedCount'),
        resultBar: $('resultBar'),
        rate: $('rate'),
        passedList: $('passedList'),
        skippedList: $('skippedList'),
        failedList: $('failedList'),
        ended: $('ended'),
      };

      dock.mount(ui, () => this.openPanel());
      this.bindRunControls();
      settingsPanel.mount(ui, (message, level) => this.toast(message, level), () => this.toggleSettings());
      this.els.gear.onclick = () => this.toggleSettings();

      this.unsubscribe = store.subscribe(event => {
        if (event.type === 'change') {
          if (event.immediate) this.render();
          else this.schedule();
        } else if (event.type === 'view') {
          this.setView(event.view);
        } else if (event.type === 'notice') {
          this.toast(event.message, event.level);
        }
      });
    },
    setView(name) {
      if (!VIEW_NAMES.includes(name) || this.panelView === name) return;
      this.panelView = name;
      this.render();
    },
    openPanel() {
      dock.open();
      this.render();
      if (store.state.phase === 'idle' && !store.state.jobs.length) {
        runner.scan().catch(error => {
          if (!isAbortError(error)) runner.log(`扫描未完成：${error.message}`, MSG_LEVEL.WARN);
        });
      }
    },
    toast(message, level = MSG_LEVEL.INFO) {
      const notice = this.els.toast;
      notice.textContent = message;
      notice.className = 'toast ' + level;
      notice.hidden = false;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { notice.hidden = true; }, 2400);
    },
    /** Batches multiple state updates within the same animation frame into a single DOM render pass. */
    schedule() {
      if (this.pending) return;
      this.pending = raf(() => {
        this.pending = 0;
        this.render();
      });
    },
    render() {
      const { els, cache } = this;
      const phase = store.state.phase;
      const active = runner.active();
      const { passed } = store.state.results;
      const { current, planned, settled } = store.progress();

      const pillText = `${passed.length}/${planned}`;
      if (cache.pillText !== pillText) {
        cache.pillText = pillText;
        els.pillCount.textContent = pillText;
      }

      if (cache.phase !== phase) {
        cache.phase = phase;
        els.status.dataset.phase = phase;
        els.status.textContent = PHASE_LABEL[phase] || '';
      }

      const viewChanged = cache.panelView !== this.panelView;
      if (viewChanged) {
        cache.panelView = this.panelView;
        for (const name of VIEW_NAMES) {
          els[name].hidden = name !== this.panelView;
        }
        const inSettings = this.panelView === 'settings';
        els.gear.textContent = inSettings ? '返回' : '设置';
        els.gear.setAttribute('aria-expanded', String(inSettings));
      }

      settingsPanel.sync(active);

      if (phase === 'done') this.finishedAt ??= new Date().toLocaleTimeString('zh-CN', { hour12: false });
      else this.finishedAt = null;

      if (!els.panel.hidden) {
        if (this.panelView === 'work') this.renderWork(planned, active, current);
        if (this.panelView === 'summary' && phase === 'done' && (viewChanged || cache.summaryRev !== store.rev.summary)) {
          cache.summaryRev = store.rev.summary;
          this.renderSummary(settled);
        }
      }

      this.renderTitle(active && prefs.data.titleProgress, passed.length, planned);
      if (viewChanged) dock.align();
    },
    renderWork(planned, active, current) {
      const { els, cache } = this;
      const { phase, course, jobs, logs, results } = store.state;
      const scanning = phase === 'scanning';

      const courseText = course.name || '请先进入课程作业或实训关卡页';
      if (cache.courseText !== courseText) {
        cache.courseText = courseText;
        els.course.textContent = courseText;
      }

      // Keep #current permanently visible at a fixed single-line height to prevent layout shifts between tasks
      const activeItem = current || (phase === 'running' || phase === 'paused' ? store.state.cursor : null);
      const currentText = activeItem
        ? `${phase === 'paused' ? '已暂停于' : '正在作答'}：${this.currentLabel(activeItem)}`
        : phase === 'countdown'
          ? '即将开始自动答题…'
          : scanning
            ? '正在扫描课程作业与关卡…'
            : jobs.length
              ? '已就绪，点击下方「开始答题」启动'
              : '等待扫描课程作业…';
      if (cache.currentText !== currentText) {
        cache.currentText = currentText;
        els.current.textContent = currentText;
        els.current.title = currentText;
      }

      const metricText = `已通过 ${results.passed.length} / 共 ${planned} 关`
        + (results.skipped.length ? ` · 跳过 ${results.skipped.length}` : '')
        + (results.failed.length ? ` · 未通过 ${results.failed.length}` : '');
      if (cache.metricText !== metricText) {
        cache.metricText = metricText;
        els.metric.textContent = metricText;
      }

      const barMax = Math.max(1, planned);
      const barVal = results.passed.length;
      if (cache.barMax !== barMax) {
        cache.barMax = barMax;
        els.bar.max = barMax;
      }
      if (cache.barVal !== barVal) {
        cache.barVal = barVal;
        els.bar.value = barVal;
      }

      els.rescan.hidden = runner.busy();
      els.rescan.disabled = scanning;

      if (cache.scanning !== scanning) {
        els.scanState.hidden = !scanning;
        els.rows.hidden = scanning;
      }

      if (scanning) {
        cache.scanning = true;
        this.renderScanState();
      } else {
        const activeJobId = activeItem ? String(activeItem.homeworkId) : '';
        if (cache.scanning !== false || cache.jobsRev !== store.rev.jobs || cache.activeJobId !== activeJobId) {
          cache.scanning = false;
          cache.jobsRev = store.rev.jobs;
          cache.activeJobId = activeJobId;
          els.rows.replaceChildren(...(jobs.length
            ? jobs.map(job => this.jobRow(job, activeItem))
            : [this.field('当前没有待完成的作业', 'empty')]));
        }
      }

      this.renderLogs(logs);

      els.start.textContent = phase === 'paused' ? '继续答题'
        : scanning ? '正在扫描…'
        : active ? '暂停答题' : '开始答题';
      els.start.disabled = scanning;
      els.stop.hidden = !runner.busy();
    },
    renderLogs(logs) {
      const { els, cache } = this;
      const limit = prefs.data.logRows;
      if (cache.logsRev === store.rev.logs && cache.logRows === limit) return;

      const visibleLogs = logs.slice(-limit);
      const logsEl = els.logs;
      if (!visibleLogs.length) {
        if (!cache.logsEmpty || !logsEl.firstElementChild) {
          logsEl.replaceChildren(this.field('点击下方「开始答题」后将在此显示实时进度', 'empty'));
        }
        cache.logsEmpty = true;
        cache.lastLogSeq = 0;
        cache.logRows = limit;
        cache.logsRev = store.rev.logs;
        return;
      }

      const canAppend = !cache.logsEmpty && cache.logRows === limit && cache.lastLogSeq > 0;
      const newEntries = canAppend ? visibleLogs.filter(entry => entry.seq > cache.lastLogSeq) : null;

      if (canAppend && newEntries.length > 0 && newEntries.length < visibleLogs.length) {
        const fragment = document.createDocumentFragment();
        for (const entry of newEntries) fragment.appendChild(this.logRow(entry));
        logsEl.appendChild(fragment);
        while (logsEl.childElementCount > limit) logsEl.firstElementChild.remove();
      } else if (!canAppend || newEntries.length > 0) {
        const fragment = document.createDocumentFragment();
        for (const entry of visibleLogs) fragment.appendChild(this.logRow(entry));
        logsEl.replaceChildren(fragment);
      }

      cache.logsEmpty = false;
      cache.logsRev = store.rev.logs;
      cache.logRows = limit;
      const newestSeq = visibleLogs[visibleLogs.length - 1].seq;
      if (newestSeq !== cache.lastLogSeq) {
        cache.lastLogSeq = newestSeq;
        logsEl.scrollTop = logsEl.scrollHeight;
      }
    },
    logRow(entry) {
      const row = document.createElement('div');
      row.className = 'log';
      const timestamp = document.createElement('time');
      timestamp.textContent = entry.time;
      row.append(timestamp, this.field(entry.message, entry.level));
      return row;
    },
    renderScanState() {
      const { els } = this;
      const { done, total } = store.state.scanProgress;
      const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
      els.scanTitle.textContent = total ? '正在扫描待完成关卡…' : '正在读取课程作业列表…';
      els.scanCount.textContent = total ? `已扫描 ${done} / ${total} 份作业` : '请稍候…';
      els.scanFill.style.width = `${percent}%`;
      els.scanBar.setAttribute('aria-valuenow', String(percent));
    },
    renderSummary(settled) {
      const { els } = this;
      const { passed, skipped, failed } = store.state.results;
      els.passedCount.textContent = passed.length;
      els.skippedCount.textContent = skipped.length;
      els.failedCount.textContent = failed.length;
      els.resultBar.max = Math.max(1, settled);
      els.resultBar.value = passed.length;
      els.rate.textContent = settled
        ? `本次共处理 ${settled} 关，通过率 ${(passed.length / settled * 100).toFixed(1)}%`
        : '暂无统计数据';
      els.passedList.textContent = passed.map(item => this.titleOf(item)).join('、') || '暂无记录';
      els.skippedList.textContent = this.grouped(skipped);
      els.failedList.textContent = this.grouped(failed);
      els.ended.textContent = `完成时间：${this.finishedAt}`;
      els.retry.disabled = !failed.length;
    },
    renderTitle(active, passed, total) {
      const title = document.title;
      if (active) {
        if (title !== this.renderedTitle) this.originalTitle = title;
        this.renderedTitle = `[${passed}/${total}] ${this.originalTitle}`;
        if (title !== this.renderedTitle) document.title = this.renderedTitle;
      } else if (this.renderedTitle !== null) {
        if (title === this.renderedTitle) document.title = this.originalTitle;
        this.renderedTitle = null;
        this.originalTitle = null;
      }
    },
    field(text, className = '') {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      return span;
    },
    jobRow(job, cursor) {
      const row = document.createElement('div');
      const current = cursor && String(cursor.homeworkId) === String(job.id);
      row.className = current ? 'row is-active' : 'row';
      const done = job.status === 'done';
      const status = done ? '已完成' : current ? '答题中' : '待答题';
      const level = done ? MSG_LEVEL.SUCCESS : current ? MSG_LEVEL.INFO : 'muted';
      row.append(
        this.field(job.name, current ? MSG_LEVEL.INFO : ''),
        this.field(`${job.passed}/${job.total} 关`, 'numeric'),
        this.field(status, `job-status ${level}`),
      );
      return row;
    },
    currentLabel(item) {
      const job = store.jobName(item.homeworkId);
      return item.title ? `${job} · ${item.title}` : job;
    },
    titleOf(item) {
      return item.title || store.jobName(item.homeworkId);
    },
    grouped(items) {
      if (!items.length) return '暂无记录';
      const groups = new Map();
      for (const item of items) {
        const reason = item.reason || '其他原因';
        if (!groups.has(reason)) groups.set(reason, []);
        groups.get(reason).push(this.titleOf(item));
      }
      return [...groups].map(([reason, names]) =>
        `• ${reason}（${names.length} 关）：${names.slice(0, 4).join('、')}${names.length > 4 ? ' 等' : ''}`,
      ).join('\n');
    },
    bindRunControls() {
      const { els } = this;
      els.start.onclick = () => {
        if (store.state.phase === 'scanning') return;
        if (runner.active()) { runner.pause(); return; }
        runner.start().catch(error => {
          if (!isAbortError(error)) runner.log(error.message, MSG_LEVEL.WARN);
        });
      };
      els.stop.onclick = () => runner.stop();
      els.rescan.onclick = () => {
        if (store.state.phase === 'scanning' || runner.busy()) return;
        runner.scan().catch(error => {
          if (!isAbortError(error)) runner.log(`扫描未完成：${error.message}`, MSG_LEVEL.WARN);
        });
      };
      els.again.onclick = () => {
        runner.reset();
        this.setView('work');
        runner.scan().catch(error => {
          if (!isAbortError(error)) runner.log(`扫描未完成：${error.message}`, MSG_LEVEL.WARN);
        });
      };
      els.retry.onclick = () => runner.retryFailed();
    },
    toggleSettings() {
      if (this.panelView === 'settings') {
        this.setView(store.state.phase === 'done' ? 'summary' : 'work');
      } else {
        this.setView('settings');
      }
    },
    /** Polls SPA route transitions to refresh idle state or trigger auto-start when enabled. */
    tick() {
      const path = route.path();
      if (path !== this.lastPath) {
        this.lastPath = path;
        runner.onRouteChange({
          panelOpen: !this.els.panel.hidden,
          inWorkView: this.panelView === 'work',
        });
        this.render();
      }
      if (store.state.phase !== 'idle' || !prefs.data.auto) return;
      if (this.seen === path) return;
      const usable = route.isTask(path) || Boolean(route.courseId());
      if (!usable || !this.els.settings.hidden) return;
      this.seen = path;
      runner.start().catch(error => {
        if (!isAbortError(error)) runner.log(error.message, MSG_LEVEL.WARN);
      });
    },
    startWatcher() {
      this.lastPath = route.path();
      this.render();
      this.tick();
      this.onPopState = () => this.tick();
      window.addEventListener('popstate', this.onPopState);
      this.watchTimer = setInterval(() => {
        if (!this.host?.isConnected) {
          this.destroy();
          return;
        }
        this.tick();
      }, TIMING.uiTick);
    },
    destroy() {
      clearInterval(this.watchTimer);
      this.watchTimer = 0;
      clearTimeout(this.toastTimer);
      this.toastTimer = 0;
      if (this.pending) {
        cancelRaf(this.pending);
        this.pending = 0;
      }
      if (this.onPopState) {
        window.removeEventListener('popstate', this.onPopState);
        this.onPopState = null;
      }
      dock.destroy();
      this.unsubscribe?.();
      this.unsubscribe = null;
    },
  };

  return view;
}
