import { MSG_LEVEL, TIMING } from '../../core/constants.js';
import { abortError, isAbortError, sleep } from '../../core/utils.js';
import { shellQuote } from '../../ssh/session.js';
import { ANSWER_HOOK_SCRIPT } from '../../script/assets.js';
import { CHALLENGE_TYPE } from '../classifier.js';

const EVAL_HOOK_DIR = '/tmp/eval_hook/';
const ANSWER_HOOK_PATH = EVAL_HOOK_DIR + 'answerhook.sh';
const ANSWER_DIR = '/data/workspace/.evalpass';
const ANSWER_FILE = `${ANSWER_DIR}/answer.txt`;

const HOOK_LINKS = Object.freeze([
  '/usr/local/bin/python',
  '/usr/local/bin/python3',
]);

/** Rebinds `/usr/local/bin/python*` to the answer hook. */
async function linkHook(ssh, hookPath, { log = () => {}, signal = null } = {}) {
  const command = HOOK_LINKS
    .map(link => `ln -sf -- ${shellQuote(hookPath)} ${shellQuote(link)}`)
    .join(' && ');
  const res = await ssh.exec(command, { log, signal });
  if (res.exitCode !== 0) {
    const detail = String(res.stderr || '').trim() || `exitCode=${res.exitCode ?? 'null'}`;
    throw new Error(`绑定答案脚本失败：${detail.slice(0, 120)}`);
  }
}

/** Returns the first non-empty string `output` from an array of test cases, or `null`. */
function pickOutput(sets) {
  if (!Array.isArray(sets)) return null;
  for (const item of sets) {
    if (!item || typeof item.output !== 'string') continue;
    // 有内容就直接可用
    if (item.output.length > 0) return item.output;
    // 空串也可能是正确答案（成功分支不打印），但只有平台真的评过才可信：
    // 未评过时 result / actual_output / compile_success 全是 null，应先空跑回填再读。
    const materialized = (item.result !== null && item.result !== undefined)
      || (item.actual_output !== null && item.actual_output !== undefined)
      || (item.compile_success !== null && item.compile_success !== undefined);
    if (materialized) return item.output;
  }
  return null;
}

/** Writes the expected stdout into the container so the answer hook replays it verbatim. */
async function writeAnswer(ssh, answer, { log = () => {}, signal = null } = {}) {
  await ssh.writeFile(ANSWER_FILE, String(answer ?? ''), { log, signal });
}

/**
 * Reads expected output from visible `detail.test_sets` first, then `check_test_sets.json`
 * (including cases with `input: null` common in Linux container labs), falling back to `answerSource.allCases`.
 */
async function readExpected(detail, ctx, deps) {
  const direct = pickOutput(detail?.test_sets);
  if (direct !== null) return direct;

  if (typeof deps?.api?.checkTestSets === 'function') {
    try {
      const data = await deps.api.checkTestSets(ctx.key.gameId, ctx.key.homeworkId, ctx.signal);
      const hidden = pickOutput(data?.test_sets);
      if (hidden !== null) return hidden;
    } catch (error) {
      if (isAbortError(error) || ctx.signal?.aborted) throw abortError();
      if (error.code === 401) throw error;
    }
  }

  if (typeof deps?.answerSource?.allCases !== 'function') return null;
  return pickOutput(await deps.answerSource.allCases(ctx.key, ctx.model, ctx.signal));
}

/** Re-reads the challenge detail so test sets materialized by an evaluation become visible. */
async function refreshDetail(deps, key, signal) {
  if (typeof deps?.api?.detail !== 'function') return null;
  let last = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const detail = await deps.api.detail(key.gameId, key.homeworkId, signal);
      last = detail;
      // 拿到带测试集的快照就返回，避免读到评测刚落盘的旧数据
      if (Array.isArray(detail?.test_sets) && detail.test_sets.length) return detail;
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) throw abortError();
      if (error.code === 401) throw error;
    }
    if (attempt < 2) await sleep(2000, signal);
  }
  return last;
}

/** Best-effort removal of the injected answer directory (bounded timeout, ignores abort signal). */
async function cleanupAnswerDir(ssh) {
  if (!ssh?.isOpen?.()) return true;
  try {
    const res = await ssh.exec(`rm -rf -- ${shellQuote(ANSWER_DIR)}`, { timeoutMs: 5000 });
    return res?.exitCode === 0;
  } catch {
    return false;
  }
}

/** Releases the remote container pod and clears session state via `destroy()`, falling back to `close()`. */
async function destroySession(ssh, log = () => {}) {
  if (typeof ssh?.destroy === 'function') {
    await ssh.destroy({ log });
  } else {
    ssh?.close?.();
  }
}

/**
 * Ensures the job-scoped Linux container is open, reachable over SSH, and hooked with `answerhook.sh`.
 * Reuses the existing container across stages within the same `JobSession`.
 */
async function ensureContainer(session, ctx, state) {
  const { key, model, log, signal } = ctx;
  if (state.containerReady && session.ssh.isOpen()) {
    return {
      pod: session.ssh.currentPod?.() || state.pod || null,
      reused: true,
    };
  }

  const alreadyOpen = session.ssh.isOpen();
  log(
    alreadyOpen
      ? `→ ${model.title}　重试初始化容器…`
      : `→ ${model.title}　申请容器…`,
    MSG_LEVEL.INFO,
  );
  const pod = await session.ssh.open(model, key, { log, signal });
  const probe = await session.ssh.probe({ log, signal });
  if (!probe.ok) {
    log(`　SSH 连通测试失败：${probe.detail.slice(0, 120)}`, MSG_LEVEL.ERROR);
    throw new Error(`SSH hello 测试未通过（${probe.detail.slice(0, 80)}）`);
  }
  await session.ssh.writeFile(ANSWER_HOOK_PATH, ANSWER_HOOK_SCRIPT, { mode: '755', log, signal });
  await linkHook(session.ssh, ANSWER_HOOK_PATH, { log, signal });
  state.containerReady = true;
  state.pod = pod;
  return { pod, reused: false };
}

/**
 * Strategy for challenges served by a Linux experiment container (`tab_type === 3`).
 *
 * Educoder limits each user to at most 5 concurrent container instances, so one container is
 * shared across all stages of a single homework (`JobSession`) and destroyed once the whole
 * homework finishes, fails, or aborts:
 * - `setup`: Validates SSH gateway settings without allocating a container.
 * - `solve`: Ensures the job container is ready (once per job) -> backfills missing test sets by one probe evaluation -> stages expected output -> grades -> cleans stage output dir.
 * - `teardown`: Destroys the shared container instance (`exit_delete_pod.json`) when the `JobSession` disposes.
 */
export const linuxEnvStrategy = {
  name: CHALLENGE_TYPE.LINUX_ENV,

  /** Verifies that the remote SSH gateway is configured before solving any Linux environment stages. */
  async setup(ctx, { state, deps }) {
    const { log, onNotice } = ctx;
    if (!deps.prefs.sshReady()) {
      state.skipReason = 'Linux 环境题（未配置 SSH 远程地址/密钥）';
      onNotice('Linux 环境题需先在「设置 → 通用」填写 SSH 远程地址和密钥', MSG_LEVEL.WARN);
      log('　Linux 环境题：未配置 SSH 网关，已跳过', MSG_LEVEL.WARN);
    }
  },

  /**
   * Reuses or initializes the job container, probes once to materialize missing test sets when
   * needed, writes the stage's expected output, triggers evaluation, and cleans up the staged
   * answer directory without releasing the shared container.
   */
  async solve(ctx, { session, state, deps }) {
    const { key, model, log, signal } = ctx;

    if (state.skipReason) {
      return { status: 'skipped', title: model.title, reason: state.skipReason };
    }

    const gradeOptions = {
      timeout: TIMING.linuxGradeTimeout,
      requireChange: true,
      log: message => log(message, MSG_LEVEL.INFO),
      signal,
    };

    let detail = ctx.detail;
    let expected = await readExpected(detail, ctx, deps);

    const { pod, reused } = await ensureContainer(session, ctx, state);
    const podLabel = pod?.host ? `${pod.host}:${pod.port}` : '已连接';

    // Educoder only populates test_sets for some Linux labs after the stage has been graded once
    // (whether locked or unlocked), so run a single dry evaluation to materialize them when absent.
    if (expected === null) {
      log(
        reused
          ? `→ ${model.title}　复用容器（${podLabel}），暂无测试集，先空跑评测回填…`
          : `　容器就绪（${podLabel}），暂无测试集，先空跑评测回填…`,
        MSG_LEVEL.WARN,
      );
      if (state.dirtyAnswerDir) {
        state.dirtyAnswerDir = !(await cleanupAnswerDir(session.ssh));
      }

      const passedAlready = await deps.evaluator.grade(detail, key, model, ctx.evalCtx, gradeOptions);
      if (passedAlready) return { status: 'passed', title: model.title };

      if (ctx.evalCtx?.lastDetail) detail = ctx.evalCtx.lastDetail;
      expected = await readExpected(detail, ctx, deps);
      if (expected === null) {
        const fresh = await refreshDetail(deps, key, signal);
        if (fresh) {
          detail = fresh;
          expected = await readExpected(detail, ctx, deps);
        }
      }
      if (expected === null) {
        log('　空跑后仍没有测试集，跳过', MSG_LEVEL.WARN);
        return { status: 'skipped', title: model.title, reason: '平台未下发测试集（test_sets 为空）' };
      }
      log(`　已回填测试集（${expected.length} 字），写入答案并重新评测…`, MSG_LEVEL.INFO);
    } else {
      log(
        reused
          ? `→ ${model.title}　复用容器（${podLabel}），用平台测试集作答（${expected.length} 字）`
          : `　容器就绪（${podLabel}），用平台测试集作答（${expected.length} 字）`,
        MSG_LEVEL.INFO,
      );
    }

    let answerWritten = false;
    try {
      state.dirtyAnswerDir = true;
      await writeAnswer(session.ssh, expected, { log, signal });
      answerWritten = true;

      const passed = await deps.evaluator.grade(detail, key, model, ctx.evalCtx, gradeOptions);
      if (passed) return { status: 'passed', title: model.title };

      const latest = ctx.evalCtx?.lastDetail || detail;
      const sets = Array.isArray(latest?.test_sets) ? latest.test_sets : [];
      const failedCount = sets.filter(item => item.result === false).length;
      return {
        status: 'failed',
        title: model.title,
        reason: failedCount ? `评测未通过（${failedCount} 组用例未过）` : '评测未通过',
      };
    } finally {
      if (answerWritten) {
        state.dirtyAnswerDir = !(await cleanupAnswerDir(session.ssh));
      }
    }
  },

  /** Destroys the job-scoped container instance once all stages of the homework have finished or aborted. */
  async teardown({ session, state, log = () => {} }) {
    if (state) {
      state.containerReady = false;
      state.pod = null;
      state.dirtyAnswerDir = false;
    }
    await destroySession(session.ssh, log);
  },
};
