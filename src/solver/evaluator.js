import { TIMING } from '../core/constants.js';
import { abortError, isAbortError, sleep } from '../core/utils.js';
import { Api } from '../platform/api.js';
import { AnswerSource } from './answer-source.js';

/** Creates an isolated per-challenge evaluation state snapshot container. */
export function createEvalContext() {
  return { lastDetail: null, gradedOnce: false };
}

/**
 * Handles file submission, asynchronous grading invocation, fingerprint-based polling,
 * and failed test case diff extraction.
 */
export function createEvaluator({ api = Api, answerSource = AnswerSource } = {}) {
  return {
    /** Computes a hash fingerprint over `test_sets` results, actual outputs, and execution durations. */
    signature(detail) {
      const sets = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
      if (!sets.length) return '';
      let hash = 0;
      for (const item of sets) {
        const text = `${item.result}|${item.actual_output || ''}|${item.ts_time ?? ''}`;
        for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0;
      }
      return `${sets.length}:${hash}`;
    },

    /** Captures a pre-submission evaluation baseline snapshot. */
    baseline(detail) {
      return { sig: this.signature(detail) };
    },

    /**
     * Commits modified repository files, waits for propagation, triggers a grading build,
     * and polls until evaluation completes.
     */
    async writeAndGrade(detail, key, model, files, evalCtx, { log = () => {}, signal = null } = {}) {
      const shixun = detail.myshixun || {};
      const game = detail.game || {};
      const env = model.env || {};
      const tabType = env.tab_type ?? 1;
      if (tabType === 3) throw new Error('Linux 实验环境关卡不支持直接通过网页接口写入代码文件');
      const extras = api.gradeExtras(detail, key);

      const untouched = model.paths.filter(path => files[path] === undefined);
      const originals = untouched.length ? await answerSource.readTemplates(key, untouched, signal) : {};

      let commit = '';
      for (const path of model.paths) {
        if (signal?.aborted) throw abortError();
        const content = files[path] !== undefined ? files[path] : (originals[path] || '');
        const saved = await api.saveFile(shixun.identifier, {
          path,
          evaluate: 0,
          content,
          game_id: game.id,
          tab_type: tabType,
          homework_common_id: key.homeworkId,
          extras,
        }, signal);
        commit = saved?.content?.commitID || commit;
      }
      if (!commit) throw new Error('代码文件保存失败（未获取到提交版本号）');

      await sleep(TIMING.commitSettle, signal);
      log('　代码已保存，正在提交平台评测…');

      return this.grade(detail, key, model, evalCtx, { commitId: commit, log, signal });
    },

    /** Triggers platform grading (`game_build.json`) and polls until evaluation settles. */
    async grade(
      detail,
      key,
      model,
      evalCtx,
      { commitId = '', timeout = TIMING.codeGradeTimeout, log = () => {}, signal = null } = {},
    ) {
      const env = model.env || {};
      const tabType = env.tab_type ?? 1;

      let snapshot = evalCtx.lastDetail || detail;
      if (evalCtx.gradedOnce && !evalCtx.lastDetail) {
        snapshot = await api.detail(key.gameId, key.homeworkId, signal).catch(error => {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          return detail;
        });
      }
      evalCtx.gradedOnce = true;
      evalCtx.lastDetail = null;

      const accepted = await api.gradeWithRetry(key.gameId, api.gradePayload(detail, key, {
        env,
        tabType,
        commitId,
      }), { log, signal });
      if (!accepted) {
        const error = new Error('平台评测队列繁忙，本次评测请求未被受理');
        error.code = 'BUSY';
        throw error;
      }
      return this.waitPassed(key, evalCtx, {
        timeout,
        log,
        base: this.baseline(snapshot),
        signal,
      });
    },

    /**
     * Polls task detail until the asynchronous evaluation settles:
     * 1. `game.status === 2` indicates the challenge passed.
     * 2. A changed result fingerprint indicates new evaluation results have landed and failed.
     * 3. An unchanged fingerprint after `TIMING.minEvalMs` indicates the new run produced identical failure outputs.
     */
    async waitPassed(key, evalCtx, { timeout = TIMING.passTimeout, log = null, base = null, signal = null } = {}) {
      const startedAt = Date.now();
      const end = startedAt + timeout;
      let tick = 0;
      while (Date.now() < end) {
        await sleep(TIMING.poll, signal);
        if (signal?.aborted) throw abortError();
        tick += 1;
        if (log && tick % 5 === 0) {
          log(`　正在等待平台返回评测结果（已耗时 ${Math.round((Date.now() - startedAt) / 1000)} 秒）…`);
        }
        try {
          const detail = await api.detail(key.gameId, key.homeworkId, signal);
          evalCtx.lastDetail = detail;
          if (detail?.game?.status === 2) return true;
          const tests = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
          const rated = tests.filter(item => item.result !== null && item.result !== undefined);
          const settled = tests.length > 0 && rated.length === tests.length;
          if (!settled) continue;

          if (!base) return false;
          if (this.signature(detail) !== base.sig) return false;
          if (Date.now() - startedAt >= TIMING.minEvalMs) return false;
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          if (error.code === 401) throw error;
        }
      }
      return false;
    },

    /** Extracts failed test case diffs, compiler output, and passing inputs from the latest detail snapshot. */
    async failedDetail(key, evalCtx, signal = null) {
      try {
        const detail = evalCtx.lastDetail || await api.detail(key.gameId, key.homeworkId, signal);
        const tests = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
        const failed = tests.filter(item => item.result === false);
        const passed = tests.filter(item => item.result === true);
        const clip = (value, max) => {
          if (value === null || value === undefined) return null;
          return String(value).slice(0, max);
        };
        const ordered = [...failed].sort((a, b) => (b.actual_output ? 1 : 0) - (a.actual_output ? 1 : 0));
        const lines = ordered.slice(0, 5).map(item => {
          const position = item.position ?? '?';
          const input = clip(item.input, 400);
          const expected = clip(item.output, 800);
          const actual = clip(item.actual_output, 1200);
          return [
            `用例 ${position}:`,
            `  输入: ${input ?? '(隐藏用例，平台未公开)'}`,
            `  期望: ${expected ?? '(隐藏用例，平台未公开)'}`,
            `  实际: ${actual ?? '(无任何输出)'}`,
          ].join('\n');
        });
        return {
          count: failed.length,
          sample: lines.join('\n---\n'),
          compile: clip(detail.last_compile_output, 800) || '',
          passedInputs: passed.slice(0, 8).map(item => clip(item.input, 120)).filter(Boolean),
        };
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        return { count: 0, sample: '', compile: '', passedInputs: [] };
      }
    },
    
    /** Formats failed case diagnostics into anti-regression prompt feedback. */
    buildFailureFeedback(failed) {
      return [
        `上一次提交评测未通过${failed.count ? `（${failed.count} 组用例失败）` : ''}。`,
        '请逐条对照下面的输入/期望/实际，定位差异后修正，不要只改细节顺序。',
        failed.compile ? `平台编译/运行输出：${failed.compile}` : '',
        failed.sample || '',
        failed.passedInputs.length
          ? `以下输入的输出已经正确，修正时不要破坏它们：${failed.passedInputs.join(' ｜ ')}`
          : '',
      ].filter(Boolean).join('\n');
    },
  };
}

export const Evaluator = createEvaluator();
