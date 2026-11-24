import { MSG_LEVEL, TIMING } from '../core/constants.js';
import { abortError, isAbortError, sleep } from '../core/utils.js';
import { Api } from '../platform/api.js';
import { SshClient } from './client.js';

const EVALUATE_SCRIPT_PATH = '/data/protectspace/evaluate.sh';
const WRITE_B64_CHUNK_SIZE = 4096;

function toUtf8Bytes(content) {
  return content instanceof Uint8Array
    ? content
    : new TextEncoder().encode(String(content ?? ''));
}

/** POSIX single-quote escaping for safe embedding into remote shell commands. */
export function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

/** Encodes a UTF-8 string or binary `Uint8Array` to Base64 without stack overflow on large payloads. */
export function encodeBase64(content) {
  const bytes = toUtf8Bytes(content);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function parseBashArrayItems(text, startIndex) {
  const items = [];
  let i = startIndex;

  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i += 1;
    if (i >= text.length) break;

    if (text[i] === '#') {
      while (i < text.length && text[i] !== '\n') i += 1;
      continue;
    }

    if (text[i] === ')') break;

    let value = '';
    while (i < text.length) {
      const ch = text[i];
      if (/\s/.test(ch) || ch === ')') break;

      if (ch === '"') {
        i += 1;
        while (i < text.length && text[i] !== '"') {
          if (text[i] === '\\' && i + 1 < text.length) {
            const next = text[i + 1];
            if (next === '\n') {
              i += 2;
              continue;
            }
            if (next === '"' || next === '\\' || next === '$' || next === '`') {
              value += next;
              i += 2;
              continue;
            }
          }
          value += text[i];
          i += 1;
        }
        if (i < text.length && text[i] === '"') i += 1;
      } else if (ch === "'") {
        i += 1;
        while (i < text.length && text[i] !== "'") {
          value += text[i];
          i += 1;
        }
        if (i < text.length && text[i] === "'") i += 1;
      } else if (ch === '\\' && i + 1 < text.length) {
        if (text[i + 1] !== '\n') value += text[i + 1];
        i += 2;
      } else {
        value += ch;
        i += 1;
      }
    }

    items.push(value);
  }

  return items;
}

/**
 * Checks whether an `evaluate.sh` stage slot (`sourceClassNames[$1 - 1]`) is a placeholder
 * (`""` or `"1"`) indicating the challenge does not use an evaluation script in mixed homeworks.
 */
export function isPlaceholderEvaluateEntry(entry) {
  const normalized = String(entry ?? '').trim();
  return normalized === '' || normalized === '1';
}

/**
 * Parses `/data/protectspace/evaluate.sh` for working directory, execution command,
 * and the per-stage `sourceClassNames` list (preserving empty slots and parentheses inside quotes).
 */
export function parseEvaluateScript(script) {
  const text = String(script || '').replace(/\r\n/g, '\n');

  const cdMatch = /^\s*cd\s+(?:"([^"]+)"|'([^']+)'|(\S+))/m.exec(text);
  const workdir = cdMatch?.[1] || cdMatch?.[2] || cdMatch?.[3] || '/data/workspace/myshixun';

  const cmdMatch = /^\s*executeCommand\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/m.exec(text);
  const executeCommand = cmdMatch?.[1] ?? cmdMatch?.[2] ?? cmdMatch?.[3] ?? '';

  const arrMatch = /^\s*sourceClassNames\s*=\s*\(/m.exec(text);
  const sourceClassNames = arrMatch
    ? parseBashArrayItems(text, arrMatch.index + arrMatch[0].length)
    : [];

  return { workdir, executeCommand, sourceClassNames };
}

/** Resolves the 1-based stage script paths (`scriptRel` / `scriptAbs`) and placeholder flags. */
export function resolveStageTarget(config, position) {
  const stage = Number(position) || 0;
  const list = Array.isArray(config?.sourceClassNames) ? config.sourceClassNames : [];
  const inRange = stage >= 1 && stage <= list.length;
  const rawEntry = inRange ? String(list[stage - 1] ?? '').trim() : '';
  const unused = inRange && isPlaceholderEvaluateEntry(rawEntry);
  const scriptRel = inRange && !unused ? rawEntry : '';
  const workdir = String(config?.workdir || '/data/workspace/myshixun').replace(/\/+$/, '');
  const scriptAbs = scriptRel
    ? (scriptRel.startsWith('/') ? scriptRel : `${workdir}/${scriptRel}`)
    : '';
  return {
    ...config,
    position: stage,
    inRange,
    unused,
    hasScript: Boolean(scriptAbs),
    rawEntry,
    scriptRel,
    scriptAbs,
  };
}

/**
 * Job-scoped SSH container session owning a single pod and its parsed `evaluate.sh` metadata.
 * Disposed at the end of the enclosing `JobSession`, leaving zero cross-homework state.
 */
export function createSshSession({ api = Api, sshClient = SshClient } = {}) {
  let pod = null;
  let evaluate = null;

  return {
    isOpen() {
      return pod !== null;
    },

    currentPod() {
      return pod;
    },

    evaluateConfig() {
      return evaluate;
    },

    /** Starts the training container via `start.json` (idempotent within the current job session). */
    async open(model, key, { log = () => {}, signal = null } = {}) {
      if (pod) return pod;

      const shixunId = model?.shixunId;
      const envId = model?.env?.shixun_environment_id;
      const gameDbId = model?.gameDbId;

      if (!shixunId || !envId || !gameDbId) {
        throw new Error('关卡缺少实训环境参数，无法初始化容器');
      }

      let lastReason = '';
      for (let attempt = 1; attempt <= TIMING.envStartAttempts; attempt += 1) {
        if (signal?.aborted) throw abortError();
        try {
          const resp = await api.startEnv(shixunId, {
            envId,
            gameDbId,
            tabType: model.env?.tab_type ?? 3,
            homeworkId: key.homeworkId,
          }, signal);

          const data = resp?.data || {};
          if (resp?.status === 0 && data.ssh_address && data.port && data.username && data.password) {
            pod = {
              host: String(data.ssh_address),
              port: Number(data.port),
              username: String(data.username),
              password: String(data.password),
              remainingTime: Number(data.remaining_time) || 0,
            };
            return pod;
          }
          lastReason = String(resp?.message || '容器已响应，但未获取到 SSH 地址（可能仅开放 VNC）');
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          if (error.code === 401) throw error;
          lastReason = error.message;
          const retryable = error.code === -2 || error.code === 'TIMEOUT' || error.code === 'NETWORK';
          if (!retryable) break;
        }

        if (attempt < TIMING.envStartAttempts) {
          log(
            `　实验环境未就绪（${lastReason.slice(0, 40)}），${Math.round(TIMING.envStartRetryGap / 1000)} 秒后重试（${attempt}/${TIMING.envStartAttempts - 1}）…`,
            MSG_LEVEL.WARN,
          );
          await sleep(TIMING.envStartRetryGap, signal);
        }
      }
      throw new Error(`容器启动失败：${lastReason.slice(0, 120)}`);
    },

    /** Executes a shell command against the open session pod. */
    async exec(command, { log = () => {}, signal = null, retryConnect = false, timeoutMs } = {}) {
      if (!pod) throw new Error('实验容器尚未初始化');
      const maxAttempts = retryConnect ? TIMING.sshConnectAttempts : 1;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (signal?.aborted) throw abortError();
        try {
          return await sshClient.exec(pod, command, { signal, timeoutMs });
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          if (error.code === 'SSH_CONNECTION_FAILED' && attempt < maxAttempts) {
            log(
              `　容器 SSH 端口尚未就绪，${Math.round(TIMING.sshConnectRetryGap / 1000)} 秒后重试…`,
              MSG_LEVEL.WARN,
            );
            await sleep(TIMING.sshConnectRetryGap, signal);
            continue;
          }
          throw error;
        }
      }
    },

    /** Verifies SSH connectivity using `echo hello` with cold-start retry. */
    async probe({ log = () => {}, signal = null } = {}) {
      const res = await this.exec('echo hello', { log, signal, retryConnect: true });
      const output = String(res.stdout || '').trim();
      const ok = res.exitCode === 0 && output.split(/\r?\n/).some(line => line.trim() === 'hello');
      if (!ok) {
        const detail = String(res.stderr || '').trim() || output || `exitCode=${res.exitCode ?? 'null'}`;
        return { ok: false, detail, durationMs: res.durationMs };
      }
      return { ok: true, detail: 'hello', durationMs: res.durationMs };
    },

    /** Reads a text file inside the open container while enforcing exit code 0 and non-truncated output. */
    async readFile(absPath, { log = () => {}, signal = null, retryConnect = false } = {}) {
      const res = await this.exec(`cat -- ${shellQuote(absPath)}`, { log, signal, retryConnect });
      if (res.exitCode !== 0) {
        const detail = String(res.stderr || '').trim() || `exitCode=${res.exitCode ?? 'null'}`;
        throw new Error(`读取容器文件失败（${absPath}）：${detail.slice(0, 120)}`);
      }
      if (res.truncated) {
        throw new Error(`容器文件内容超出网关输出上限，已被截断（${absPath}）`);
      }
      return res.stdout;
    },

    /**
     * Writes a UTF-8 string or binary `Uint8Array` into the open container via Base64 encoding,
     * automatic 4 KiB gateway chunking, atomic `mktemp` + `mv -f`, and optional octal `chmod`.
     */
    async writeFile(absPath, content, { mode = '', log = () => {}, signal = null, retryConnect = false } = {}) {
      if (!pod) throw new Error('实验容器尚未初始化');

      const target = String(absPath || '').trim();
      if (!target.startsWith('/') || target.endsWith('/')) {
        throw new Error(`容器写入路径必须为有效绝对文件路径：${target}`);
      }

      const hasMode = mode !== undefined && mode !== null && mode !== '';
      const normalizedMode = hasMode ? (typeof mode === 'string' ? mode.trim() : '') : '';
      if (hasMode && !/^[0-7]{3,4}$/.test(normalizedMode)) {
        throw new Error(`无效的文件权限值：${String(mode)}`);
      }

      const bytes = toUtf8Bytes(content);
      const b64 = encodeBase64(bytes);
      const quotedTarget = shellQuote(target);
      const chmodLine = normalizedMode ? `chmod ${normalizedMode} -- "$tmp"` : '';

      if (b64.length <= WRITE_B64_CHUNK_SIZE) {
        const cmd = [
          'set -e',
          `dir=$(dirname -- ${quotedTarget})`,
          'mkdir -p -- "$dir"',
          'tmp=$(mktemp "$dir/.tg_write.XXXXXX")',
          'trap \'rm -f -- "$tmp"\' EXIT',
          `printf '%s' '${b64}' | base64 -d > "$tmp"`,
          chmodLine,
          `mv -f -- "$tmp" ${quotedTarget}`,
          'trap - EXIT',
        ].filter(Boolean).join('\n');

        const res = await this.exec(cmd, { log, signal, retryConnect });
        if (res.exitCode !== 0) {
          const detail = String(res.stderr || '').trim() || `exitCode=${res.exitCode ?? 'null'}`;
          throw new Error(`写入容器文件失败（${target}）：${detail.slice(0, 120)}`);
        }
        return { bytes: bytes.byteLength, chunks: 1 };
      }

      const dirPath = target.slice(0, target.lastIndexOf('/')) || '/';
      const dirPrefix = dirPath === '/' ? '' : dirPath;
      const nonce = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const b64Tmp = `${dirPrefix}/.tg_b64_${nonce}`;
      const quotedB64 = shellQuote(b64Tmp);

      const chunks = [];
      for (let i = 0; i < b64.length; i += WRITE_B64_CHUNK_SIZE) {
        chunks.push(b64.slice(i, i + WRITE_B64_CHUNK_SIZE));
      }

      try {
        for (let i = 0; i < chunks.length; i += 1) {
          const cmd = i === 0
            ? `set -e\nmkdir -p -- ${shellQuote(dirPath)}\nprintf '%s' '${chunks[i]}' > ${quotedB64}`
            : `set -e\nprintf '%s' '${chunks[i]}' >> ${quotedB64}`;
          const res = await this.exec(cmd, { log, signal, retryConnect: retryConnect && i === 0 });
          if (res.exitCode !== 0) {
            const detail = String(res.stderr || '').trim() || `exitCode=${res.exitCode ?? 'null'}`;
            throw new Error(`分片上传失败（${i + 1}/${chunks.length}）：${detail.slice(0, 120)}`);
          }
        }

        const finalizeCmd = [
          'set -e',
          `b64=${quotedB64}`,
          `tmp=$(mktemp ${shellQuote(`${dirPrefix}/.tg_write.XXXXXX`)})`,
          'trap \'rm -f -- "$tmp" "$b64"\' EXIT',
          'base64 -d < "$b64" > "$tmp"',
          chmodLine,
          `mv -f -- "$tmp" ${quotedTarget}`,
          'rm -f -- "$b64"',
          'trap - EXIT',
        ].filter(Boolean).join('\n');

        const res = await this.exec(finalizeCmd, { log, signal });
        if (res.exitCode !== 0) {
          const detail = String(res.stderr || '').trim() || `exitCode=${res.exitCode ?? 'null'}`;
          throw new Error(`解码写入文件失败（${target}）：${detail.slice(0, 120)}`);
        }
      } catch (error) {
        if (!signal?.aborted) {
          await this.exec(`rm -f -- ${quotedB64}`).catch(() => {});
        }
        throw error;
      }

      return { bytes: bytes.byteLength, chunks: chunks.length };
    },

    /** Reads and caches `/data/protectspace/evaluate.sh` for the duration of the job session. */
    async loadEvaluate({ log = () => {}, signal = null } = {}) {
      if (evaluate) return evaluate;
      const script = await this.readFile(EVALUATE_SCRIPT_PATH, { log, signal });
      const parsed = parseEvaluateScript(script);
      if (!parsed.sourceClassNames.length) {
        throw new Error('未在 evaluate.sh 中解析到 sourceClassNames');
      }
      evaluate = parsed;
      return evaluate;
    },

    /** Resolves the evaluation target (`scriptRel` / `scriptAbs`) for a 1-based stage position. */
    stageTarget(position) {
      if (!evaluate) throw new Error('尚未加载 evaluate.sh 评测配置');
      return resolveStageTarget(evaluate, position);
    },

    /** Releases references held for this session so the next job starts completely clean. */
    close() {
      pod = null;
      evaluate = null;
    },
  };
}
