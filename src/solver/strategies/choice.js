import { MSG_LEVEL, TIMING } from '../../core/constants.js';
import { abortError } from '../../core/utils.js';
import { CHALLENGE_TYPE } from '../classifier.js';

/** Builds the request body expected by `POST /tasks/{gameId}/choose_build.json`. */
function choicePayload(challengeId, answer) {
  return {
    answer,
    challenge_id: challengeId,
    subject_id: null,
    question_id: null,
    competition_entry_id: null,
    smart_plan_page_item_bank_id: null,
  };
}

/** Submits a placeholder choice payload to extract standard answers from the response. */
export async function probeChoices(detail, key, count, api, signal = null) {
  const probeResult = await api.choose(
    key.gameId,
    choicePayload(detail.challenge.id, Array(count).fill('A')),
    signal,
  );
  const served = new Map((probeResult.test_sets || [])
    .map(item => [Number(item.position), item.standard_answer]));
  const answers = (detail.chooses || [])
    .slice()
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map(item => served.get(Number(item.position)));
  if (answers.length !== count || answers.some(answer => typeof answer !== 'string' || !/^[A-Z]+$/.test(answer))) {
    throw new Error('未能从平台响应中提取到完整的选择题答案');
  }
  return { answers, probeResult };
}

/** Submits extracted standard choice answers, skipping re-submission if the probe already matched. */
export async function submitChoices(detail, key, count, api, signal = null) {
  const { answers, probeResult } = await probeChoices(detail, key, count, api, signal);
  if (answers.every(answer => answer === 'A')) {
    return { answers, result: probeResult };
  }
  const result = await api.choose(
    key.gameId,
    choicePayload(detail.challenge.id, answers),
    signal,
  );
  return { answers, result };
}

/**
 * Strategy for single-choice and multiple-choice questions.
 *
 * Returns `{ status: 'continue' }` on hybrid challenges when choice submission succeeds
 * but subsequent steps (code / linux_env) are still needed to pass the stage.
 */
export const choiceStrategy = {
  name: CHALLENGE_TYPE.CHOICE,

  /** Probes and submits choice answers, then waits for pass status or chains to the next step on hybrid stages. */
  async solve(ctx, { deps }) {
    const { api, evaluator } = deps;
    const { detail, key, model, evalCtx, hasMoreSteps, nextStep, log, signal } = ctx;
    const count = model.questions.length;
    const multi = model.questions.filter(question => question.multi).length;

    log(`→ ${model.title}　选择题（共 ${count} 题${multi ? `，含多选 ${multi} 题` : ''}）`, MSG_LEVEL.INFO);
    const { result } = await submitChoices(detail, key, count, api, signal);
    const correct = result?.choose_correct_num;
    const total = result?.challenge_chooses_count;
    log(`　已提取标准答案并提交（答对 ${correct ?? '?'}/${total ?? count} 题）`);
    if (signal?.aborted) throw abortError();

    const passed = await evaluator.waitPassed(key, evalCtx, {
      timeout: TIMING.passTimeout,
      log: message => log(message, MSG_LEVEL.INFO),
      base: evaluator.baseline(detail),
      signal,
    });
    if (passed) {
      return { status: 'passed', title: model.title };
    }

    if (!hasMoreSteps) {
      const failed = await evaluator.failedDetail(key, evalCtx, signal);
      return {
        status: 'failed',
        title: model.title,
        reason: `选择题评测未通过（答对 ${correct ?? '?'}/${total ?? count} 题${failed.count ? `，${failed.count} 组用例未过` : ''}）`,
      };
    }

    log(
      nextStep === CHALLENGE_TYPE.LINUX_ENV
        ? '　选择题已提交，继续处理同关卡 Linux 环境题…'
        : '　选择题已提交，继续处理同关卡编程题…',
      MSG_LEVEL.WARN,
    );
    return { status: 'continue' };
  },
};
