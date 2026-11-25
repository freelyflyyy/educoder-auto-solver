import { MSG_LEVEL } from '../../core/constants.js';
import { shellQuote } from '../../ssh/session.js';
import { ANY_HOOK_SCRIPT, PY_HOOK_SCRIPT } from '../../script/assets.js';
import { CHALLENGE_TYPE } from '../classifier.js';

const EVAL_HOOK_DIR = '/tmp/eval_hook/';
const ANY_EVAL_HOOK_SCRIPT = EVAL_HOOK_DIR + 'anyhook.py';
const PY_EVAL_HOOK_SCRIPT = EVAL_HOOK_DIR + 'pyhook.sh';

const HOOK_FILES = Object.freeze([
  { path: ANY_EVAL_HOOK_SCRIPT, content: ANY_HOOK_SCRIPT, mode: '755' },
  { path: PY_EVAL_HOOK_SCRIPT, content: PY_HOOK_SCRIPT, mode: '755' },
]);

const HOOK_LINKS = Object.freeze([
  '/usr/local/bin/python',
  '/usr/local/bin/python3',
]);

/**
 * Strategy for challenges requiring an initialized Linux experiment container (`tab_type === 3` or SSH-backed stages).
 *
 * - `setup`: initializes the job-scoped SSH container once, verifies SSH connectivity,
 *   loads `/data/protectspace/evaluate.sh`, deploys hook scripts, and binds Python symlinks.
 * - `solve`: resolves the current stage evaluation script path (handling mixed-homework placeholders)
 *   and triggers platform evaluation.
 * - `teardown`: cleans up uploaded hook directories and symlinks when the homework finishes.
 */
export const linuxEnvStrategy = {
  name: CHALLENGE_TYPE.LINUX_ENV,

  async setup(ctx, { session, state, deps }) {
    const { key, model, log, onNotice, signal } = ctx;
    if (!deps.prefs.sshReady()) {
      state.skipReason = 'Linux 环境题（未配置 SSH 远程地址/密钥）';
      onNotice('Linux 环境题需先在「设置 → 通用」填写 SSH 远程地址和密钥', MSG_LEVEL.WARN);
      log('　Linux 环境题：未配置 SSH 网关，已跳过', MSG_LEVEL.WARN);
      return;
    }

    log(`→ ${model.title}　初始化 Linux 容器…`, MSG_LEVEL.INFO);
    const pod = await session.ssh.open(model, key, { log, signal });

    const probe = await session.ssh.probe({ log, signal });
    if (!probe.ok) {
      log(`　SSH 连通测试失败：${probe.detail.slice(0, 120)}`, MSG_LEVEL.ERROR);
      throw new Error(`SSH hello 测试未通过（${probe.detail.slice(0, 80)}）`);
    }

    state.evaluate = await session.ssh.loadEvaluate({ log, signal });
    state.hookDir = EVAL_HOOK_DIR;
    state.scriptPath = ANY_EVAL_HOOK_SCRIPT;
    state.pyHookPath = PY_EVAL_HOOK_SCRIPT;
    state.tempPaths = [EVAL_HOOK_DIR];

    for (const file of HOOK_FILES) {
      await session.ssh.writeFile(file.path, file.content, {
        mode: file.mode,
        log,
        signal,
      });
      if (!file.path.startsWith(EVAL_HOOK_DIR)) {
        state.tempPaths.push(file.path);
      }
    }

    const linkCmd = HOOK_LINKS
      .map(link => `ln -sf -- ${shellQuote(PY_EVAL_HOOK_SCRIPT)} ${shellQuote(link)}`)
      .join(' && ');
    const linkRes = await session.ssh.exec(linkCmd, { log, signal });
    if (linkRes.exitCode !== 0) {
      const detail = String(linkRes.stderr || '').trim() || `exitCode=${linkRes.exitCode ?? 'null'}`;
      throw new Error(`绑定绕过脚本失败：${detail.slice(0, 120)}`);
    }
    state.tempPaths.push(...HOOK_LINKS);

    const duration = probe.durationMs > 0 ? `，${probe.durationMs}ms` : '';
    log(
      `　容器就绪（${pod.host}:${pod.port}${duration}），已加载 ${state.evaluate.sourceClassNames.length} 关配置并部署 ${HOOK_FILES.length} 个脚本`,
      MSG_LEVEL.INFO,
    );
  },

  async solve(ctx, { session, state, deps }) {
    const { detail, key, model, evalCtx, log, signal } = ctx;

    if (state.skipReason) {
      return {
        status: 'skipped',
        title: model.title,
        reason: state.skipReason,
      };
    }

    const { evaluator } = deps;

    const stage = session.ssh.stageTarget(model.position);
    if (stage.unused) {
      log(`　第 ${stage.position} 关无评测脚本（${stage.rawEntry || '空'}），跳过`, MSG_LEVEL.INFO);
      return {
        status: 'skipped',
        title: model.title,
        reason: '该关卡未使用评测脚本（混合题目占位）',
      };
    }

    if (!stage.hasScript) {
      log(
        `　第 ${stage.position || '?'} 关未匹配评测脚本（共 ${stage.sourceClassNames.length} 槽位）`,
        MSG_LEVEL.WARN,
      );
      return {
        status: 'failed',
        title: model.title,
        reason: `未匹配到第 ${stage.position || '?'} 关的评测脚本`,
      };
    }

    log(`　第 ${stage.position} 关提交评测（${stage.scriptRel}）…`, MSG_LEVEL.INFO);
    const passed = await evaluator.grade(detail, key, model, evalCtx, {
      log: message => log(message, MSG_LEVEL.INFO),
      signal,
    });
    if (passed) {
      return { status: 'passed', title: model.title };
    }

    const failed = await evaluator.failedDetail(key, evalCtx, signal);
    return {
      status: 'failed',
      title: model.title,
      reason: failed.count
        ? `Linux 环境评测未通过（${failed.count} 组用例未过）`
        : 'Linux 环境评测未通过',
    };
  },

  async teardown({ session, state }) {
    if (!session.ssh.isOpen()) return;
    if (!Array.isArray(state.tempPaths) || !state.tempPaths.length) return;
    const args = state.tempPaths.map(shellQuote).join(' ');
    await session.ssh.exec(`rm -rf -- ${args}`).catch(() => {});
  },
};
