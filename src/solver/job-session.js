import { abortError, isAbortError } from '../core/utils.js';
import { createSshSession } from '../ssh/session.js';
import { createEvalContext } from './evaluator.js';

/**
 * Isolated solving session scoped strictly to a single homework/assignment (`job`).
 *
 * Activates each question-type strategy at most once on demand (`setup`), runs stage
 * steps cleanly (`solve`), and unconditionally tears down resources (`dispose`) when
 * the job finishes or is interrupted so no state ever leaks into subsequent jobs.
 */
export function createJobSession(job, {
  deps,
  strategies,
  classify,
  createSsh = createSshSession,
}) {
  const activated = new Map();
  const ssh = createSsh({ api: deps.api, sshClient: deps.sshClient });
  let disposed = false;

  const session = {
    job,
    ssh,

    async ensureStrategy(step, stageCtx) {
      if (disposed) throw new Error('答题会话已释放，无法激活题型策略');
      if (activated.has(step)) return activated.get(step);
      const strategy = strategies[step];
      if (!strategy) return null;

      const state = {};
      if (typeof strategy.setup === 'function') {
        await strategy.setup(stageCtx, { session, state, deps });
      }
      const entry = { strategy, state };
      activated.set(step, entry);
      return entry;
    },

    async solveStage(item, { log = () => {}, signal = null, onTitle = () => {}, onNotice = () => {} } = {}) {
      if (signal?.aborted) throw abortError();
      let detail;
      try {
        detail = await deps.api.detail(item.gameId, item.homeworkId, signal);
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        return { status: 'skipped', reason: `无法读取关卡详情（${error.message}）` };
      }

      const challengeModel = deps.model.read(detail);
      onTitle(challengeModel.title);
      if (challengeModel.passed) return { status: 'passed', title: challengeModel.title };

      const plan = classify(challengeModel);
      if (!plan.steps.length) {
        return { status: 'skipped', title: challengeModel.title, reason: '当前关卡没有可作答的题目' };
      }

      const key = Object.freeze({ gameId: item.gameId, homeworkId: item.homeworkId });
      const evalCtx = createEvalContext();

      for (let i = 0; i < plan.steps.length; i += 1) {
        if (signal?.aborted) throw abortError();
        const step = plan.steps[i];
        const nextStep = plan.steps[i + 1] || null;
        const stageCtx = {
          item,
          key,
          detail,
          model: challengeModel,
          evalCtx,
          hasMoreSteps: nextStep !== null,
          nextStep,
          log,
          onNotice,
          signal,
        };

        const entry = await session.ensureStrategy(step, stageCtx);
        if (!entry) {
          return { status: 'skipped', title: challengeModel.title, reason: `暂不支持的题型（${step}）` };
        }

        const outcome = await entry.strategy.solve(stageCtx, {
          session,
          state: entry.state,
          deps,
        });
        if (!outcome || outcome.status === 'continue') continue;
        return outcome;
      }

      return { status: 'skipped', title: challengeModel.title, reason: '当前关卡没有可作答的题目' };
    },

    async dispose({ log = () => {} } = {}) {
      if (disposed) return;
      disposed = true;
      const entries = [...activated.values()].reverse();
      activated.clear();
      try {
        for (const { strategy, state } of entries) {
          if (typeof strategy.teardown === 'function') {
            try {
              await strategy.teardown({ session, state, deps, log });
            } catch {
              // Best-effort cleanup: never block subsequent jobs or skip closing SSH
            }
          }
        }
      } finally {
        ssh.close();
      }
    },
  };

  return session;
}
