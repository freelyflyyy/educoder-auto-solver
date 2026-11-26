import { MSG_LEVEL, TIMING } from '../core/constants.js';
import { abortError, isAbortError, sleep } from '../core/utils.js';
import { Api } from '../platform/api.js';
import { SshClient } from './client.js';

const WRITE_B64_CHUNK_SIZE = 4096;
// Educoder start.json returns status -1 for transient pod-quota exhaustion or container recycling,
// so keep -1 retryable and only fail fast on hard auth/permission/parameter/signature rejections.
const NON_RETRYABLE_START_CODES = new Set([403, 404, -102]);

/** Normalizes text or binary content into UTF-8 `Uint8Array` bytes. */
function toUtf8Bytes(content) {
  return content instanceof Uint8Array
    ? content
    : new TextEncoder().encode(String(content ?? ''));
}

/** Extracts and validates the container lease descriptor required by `start.json` and `exit_delete_pod.json`. */
function extractLease(model, key) {
  const shixunId = model?.shixunId;
  const envId = model?.env?.shixun_environment_id;
  const gameDbId = model?.gameDbId;
  if (!shixunId || !envId || !gameDbId) {
    throw new Error('关卡缺少实训环境参数，无法初始化容器');
  }
  return {
    shixunId,
    envId,
    gameDbId,
    tabType: model.env?.tab_type ?? 3,
    homeworkId: key?.homeworkId,
  };
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

/**
 * Job-scoped SSH container session owning a single pod for one homework.
 * Disposed at the end of the enclosing `JobSession`, leaving zero cross-homework state.
 */
export function createSshSession({ api = Api, sshClient = SshClient } = {}) {
  let pod = null;
  let lease = null;

  /**
   * Best-effort remote container teardown (`exit_delete_pod.json`).
   * Intentionally omits `AbortSignal` so pausing or aborting still releases platform slots.
   */
  async function deleteRemotePod(targetLease, { log = () => {}, silent = false } = {}) {
    if (!targetLease || typeof api?.exitDeletePod !== 'function') return false;
    try {
      await api.exitDeletePod(targetLease.shixunId, {
        envId: targetLease.envId,
        gameDbId: targetLease.gameDbId,
        tabType: targetLease.tabType,
        homeworkId: targetLease.homeworkId,
      });
      return true;
    } catch (error) {
      if (!silent) log(`　释放容器失败：${error.message}`, MSG_LEVEL.WARN);
      return false;
    }
  }

  return {
    /** Returns `true` when this session currently holds an open SSH pod. */
    isOpen() {
      return pod !== null;
    },

    /** Returns the active pod connection descriptor, or `null` if closed. */
    currentPod() {
      return pod;
    },

    /**
     * Starts the training container via `start.json` with linear backoff retries on transient
     * platform congestion or cold-start delays (idempotent within the current job session).
     */
    async open(model, key, { log = () => {}, signal = null } = {}) {
      if (pod) return pod;
      if (signal?.aborted) throw abortError();

      const nextLease = extractLease(model, key);
      const total = TIMING.envStartAttempts;
      let lastReason = '';
      let sawStatusZeroWithoutSsh = false;

      for (let attempt = 1; attempt <= total; attempt += 1) {
        if (signal?.aborted) throw abortError();
        try {
          const resp = await api.startEnv(nextLease.shixunId, {
            envId: nextLease.envId,
            gameDbId: nextLease.gameDbId,
            tabType: nextLease.tabType,
            homeworkId: nextLease.homeworkId,
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
            lease = nextLease;
            return pod;
          }
          if (resp?.status === 0) {
            sawStatusZeroWithoutSsh = true;
            lastReason = String(resp?.message || '容器已响应，但未获取到 SSH 地址（可能仅开放 VNC）');
          } else {
            lastReason = String(resp?.message || '平台未返回有效容器信息');
          }
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          if (error.code === 401) throw error;
          lastReason = error.message || '未知错误';
          if (NON_RETRYABLE_START_CODES.has(error.code)) break;
        }

        if (attempt < total) {
          const waitMs = attempt * TIMING.envStartBackoff;
          log(
            `　容器申请未就绪（${lastReason.slice(0, 80)}），${Math.round(waitMs / 1000)} 秒后重试（第 ${attempt}/${total} 次）…`,
            MSG_LEVEL.WARN,
          );
          await sleep(waitMs, signal);
        }
      }

      if (sawStatusZeroWithoutSsh) {
        await deleteRemotePod(nextLease, { silent: true });
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

    /**
     * Clears local pod state and destroys the remote container instance (`exit_delete_pod.json`)
     * in a single idempotent step.
     */
    async destroy({ log = () => {} } = {}) {
      const activeLease = lease;
      pod = null;
      lease = null;
      if (!activeLease) return false;
      const released = await deleteRemotePod(activeLease, { log });
      if (released) log('　已释放容器实例', MSG_LEVEL.INFO);
      return released;
    },

    /** Clears in-memory references held for this session without calling remote teardown APIs. */
    close() {
      pod = null;
      lease = null;
    },
  };
}
