import { MSG_LEVEL, TIMING } from '../../core/constants.js';
import { abortError, isAbortError, sleep } from '../../core/utils.js';
import { AiRequestError } from '../../ai/errors.js';
import { CHALLENGE_TYPE } from '../classifier.js';

const CODE_EXT = /\.(py|java|c|cpp|h|hpp|js|mjs|ts|go|rb|php|sh|sql|cs|m|kt|swift|rs)$/i;

async function submitSource(ctx, evaluator, { content, path, label, attempts = TIMING.sourceAttempts }) {
  const { detail, key, model, evalCtx, log, signal } = ctx;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (signal?.aborted) throw abortError();
    if (attempt > 1) {
      log(`　${label}第 ${attempt} 次重新写入并提交评测…`, MSG_LEVEL.WARN);
      await sleep(TIMING.retryGap, signal);
    }
    try {
      const passed = await evaluator.writeAndGrade(
        detail,
        key,
        model,
        { [path]: content },
        evalCtx,
        { log: message => log(message, MSG_LEVEL.INFO), signal },
      );
      if (passed) return true;
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) throw abortError();
      if (error.code === 401) throw error;
      log(error.code === 'BUSY'
        ? `　${label}提交时平台队列繁忙，稍后自动重试`
        : `　${label}提交异常：${error.message}`, MSG_LEVEL.WARN);
    }
  }
  return false;
}

/** Tier 1: Direct literal extraction from co-located evaluation script. */
async function tryCheckerTier(ctx, brief, { answerSource, evaluator }) {
  const { key, model, log, signal } = ctx;
  const checker = await answerSource.checkerPlan(key, model, brief.checker, signal);
  if (!checker) return false;
  if (signal?.aborted) throw abortError();
  log(`→ ${model.title}　已从判分脚本提取 ${checker.count} 处标准答案并自动填入`, MSG_LEVEL.INFO);
  if (await submitSource(ctx, evaluator, {
    content: checker.content,
    path: checker.path,
    label: '判分脚本答案',
  })) {
    return true;
  }
  if (signal?.aborted) throw abortError();
  log('　判分脚本答案未直接通过，尝试使用平台参考答案…', MSG_LEVEL.WARN);
  return false;
}

/** Tier 2: Official reference solution with lazy target resolution. */
async function tryReferenceTier(ctx, brief, getLookupPath, { answerSource, evaluator }) {
  const { model, log, signal } = ctx;
  if (!brief.reference) return false;
  const pyFiles = model.paths.filter(path => /\.py$/i.test(path));
  const needsLookupForRef = pyFiles.length === 1 && pyFiles[0] !== model.paths[0];
  const codeTarget = (needsLookupForRef ? await getLookupPath() : '') || model.paths[0] || '';
  if (!codeTarget || !answerSource.acceptReference(brief.reference.code, codeTarget)) return false;

  log(`→ ${model.title}　已获取平台${brief.reference.name}，正在直接提交…`, MSG_LEVEL.INFO);
  if (await submitSource(ctx, evaluator, {
    content: brief.reference.code,
    path: codeTarget,
    label: '参考答案',
  })) {
    return true;
  }
  if (signal?.aborted) throw abortError();
  log('　参考答案未直接通过，尝试使用测试用例匹配…', MSG_LEVEL.WARN);
  return false;
}

/** Tier 3: Deterministic stdin/stdout lookup table synthesized from full test sets. */
async function tryLookupTier(ctx, brief, getLookupPath, { answerSource, evaluator }) {
  const { model, log, signal } = ctx;
  const cases = brief.cases || [];
  const lookupPath = cases.length ? await getLookupPath() : '';
  const usable = cases.length && lookupPath ? answerSource.casesUsable(cases) : { ok: false, why: '' };
  if (!usable.ok) {
    if (usable.why) log(`　跳过用例直接匹配（${usable.why}）`, MSG_LEVEL.WARN);
    return false;
  }

  log(`→ ${model.title}　已提取全部 ${cases.length} 组评测用例，生成匹配代码提交…`, MSG_LEVEL.INFO);
  if (await submitSource(ctx, evaluator, {
    content: answerSource.buildLookup(cases),
    path: lookupPath,
    label: '用例匹配代码',
    attempts: 1,
  })) {
    return true;
  }
  if (signal?.aborted) throw abortError();
  log('　用例匹配代码未通过，切换为 AI 模型编写代码…', MSG_LEVEL.WARN);
  return false;
}

async function submitAiCode(ctx, { brief, feedback }, { answerSource, codeGenerator, evaluator }) {
  const { detail, key, model, evalCtx, log, signal } = ctx;
  const originals = await answerSource.readTemplates(key, model.paths, signal);
  const codePaths = model.paths.filter(path => CODE_EXT.test(path));
  const targets = codePaths.length ? codePaths : model.paths;
  const keepAsIs = model.paths.filter(path => !targets.includes(path) && (originals[path] || '').trim());
  if (keepAsIs.length) log(`　保持原始数据文件不变：${keepAsIs.join('、')}`, MSG_LEVEL.INFO);
  log(`　正在请求 AI 生成代码（共 ${targets.length} 个文件）…`, MSG_LEVEL.INFO);
  const generated = await codeGenerator.solve(model, originals, targets, {
    brief,
    feedback,
    log: message => log(message, MSG_LEVEL.INFO),
    signal,
  });
  return evaluator.writeAndGrade(
    detail,
    key,
    model,
    { ...originals, ...generated },
    evalCtx,
    { log: message => log(message, MSG_LEVEL.INFO), signal },
  );
}

/** Tier 4: AI code generation fallback with anti-regression retry feedback. */
async function solveWithAi(ctx, brief, { answerSource, codeGenerator, evaluator, prefs, aiSettings }) {
  const { key, model, evalCtx, log, signal } = ctx;
  if (!prefs.data.aiFallback) {
    return {
      status: 'skipped',
      title: model.title,
      reason: '无现成参考答案或可用用例，且未开启「AI 编程兜底」',
    };
  }
  if (!aiSettings.ready()) {
    return {
      status: 'skipped',
      title: model.title,
      reason: '需要 AI 编写代码，但尚未配置 API Key（设置 → AI 模型）',
    };
  }
  log(`→ ${model.title}　使用 AI 编写代码（共 ${model.paths.length} 个文件）`, MSG_LEVEL.INFO);

  let reason = '代码评测未通过';
  let feedback = '';
  const maxAttempts = 1 + prefs.data.codeRetries;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (signal?.aborted) throw abortError();
    try {
      if (attempt > 1) {
        log(`　第 ${attempt - 1}/${maxAttempts - 1} 次自动重试（结合平台报错修正代码）…`, MSG_LEVEL.WARN);
      }
      const passed = await submitAiCode(ctx, { brief, feedback }, { answerSource, codeGenerator, evaluator });
      if (signal?.aborted) throw abortError();
      if (passed) return { status: 'passed', title: model.title };
      const failed = await evaluator.failedDetail(key, evalCtx, signal);
      reason = failed.count ? `代码评测未通过（${failed.count} 组用例失败）` : '代码评测未通过';
      feedback = evaluator.buildFailureFeedback(failed);
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) throw abortError();
      reason = error.message;
      feedback = `上一次失败：${error.message}。`
        + '请只输出一个 JSON 对象，键必须是下面列出的完整文件路径。';
      const fatal = error.code === 401 || (error instanceof AiRequestError && !error.retryable);
      if (fatal) break;
    }
  }
  return { status: 'failed', title: model.title, reason };
}

/**
 * Strategy for programming and text fill-in-the-blank challenges via the 4-tier hierarchy:
 * 1. Evaluation script literal extraction
 * 2. Official reference solution
 * 3. Full testcase lookup table
 * 4. AI code generation with anti-regression retry feedback
 */
export const codeStrategy = {
  name: CHALLENGE_TYPE.CODE,

  async solve(ctx, { deps }) {
    const { key, model, signal } = ctx;
    const { answerSource } = deps;

    const brief = await answerSource.brief(key, model, signal);
    if (signal?.aborted) throw abortError();

    if (await tryCheckerTier(ctx, brief, deps)) {
      return { status: 'passed', title: model.title };
    }

    let lookupPathPromise = null;
    const getLookupPath = () => {
      if (!lookupPathPromise) lookupPathPromise = answerSource.lookupTarget(model, key, signal);
      return lookupPathPromise;
    };

    if (await tryReferenceTier(ctx, brief, getLookupPath, deps)) {
      return { status: 'passed', title: model.title };
    }

    if (await tryLookupTier(ctx, brief, getLookupPath, deps)) {
      return { status: 'passed', title: model.title };
    }

    return solveWithAi(ctx, brief, deps);
  },
};
