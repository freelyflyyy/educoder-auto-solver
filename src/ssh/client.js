import { TIMING } from '../core/constants.js';
import { abortError, isAbortError } from '../core/utils.js';
import { gmRequest } from '../core/transport.js';
import { Prefs } from '../config/prefs.js';

export const SSH_ERROR_TEXT = Object.freeze({
  UNAUTHORIZED: 'SSH 网关密钥验证失败（401）',
  AUTH_NOT_CONFIGURED: 'SSH 网关服务端未配置密钥',
  RATE_LIMITED: 'SSH 网关请求过于频繁，请稍后重试',
  INVALID_FIELDS: 'SSH 请求参数格式有误',
  INVALID_TIMEOUT_MS: 'SSH 命令超时参数超出范围',
  INVALID_HOST_KEY_FINGERPRINT: 'SSH 主机指纹格式有误',
  TARGET_NOT_ALLOWED: 'SSH 目标主机不在网关允许范围内',
  SSH_TIMEOUT: '远程 SSH 命令执行超时',
  REQUEST_CANCELLED: 'SSH 请求已被网关取消',
  SSH_AUTH_FAILED: '容器 SSH 用户名或密码认证失败',
  SSH_CONNECTION_FAILED: '无法连接到容器 SSH 端口',
  SSH_EXEC_FAILED: '远程 SSH 命令启动或执行失败',
  OUTPUT_LIMIT_EXCEEDED: '远程 SSH 输出超出网关大小限制',
  BODY_TOO_LARGE: 'SSH 请求体超出网关 8 KiB 大小限制',
});

function nonBlankString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function clampExecTimeout(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return TIMING.sshExecTimeout;
  return Math.min(30000, Math.max(1000, Math.round(raw)));
}

/**
 * HTTP-to-SSH gateway client for `cf-ssh-exec` (`POST /v1/ssh/exec`).
 */
export function createSshClient({ prefs = Prefs, transport = gmRequest } = {}) {
  return {
    /** Normalizes a configured gateway URL into the `POST /v1/ssh/exec` endpoint. */
    endpoint(base = prefs.data?.sshBase) {
      const raw = String(base || '').trim();
      if (!raw) throw new Error('尚未填写 SSH 网关地址');
      let url;
      try {
        url = new URL(raw);
      } catch {
        throw new Error('SSH 网关地址格式无效');
      }
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('SSH 网关地址仅支持 HTTP 或 HTTPS 协议');
      }
      url.search = '';
      url.hash = '';
      let pathname = url.pathname.replace(/\/+$/, '');
      if (!pathname.endsWith('/v1/ssh/exec')) {
        pathname = pathname.replace(/\/console$/, '');
        pathname = `${pathname}/v1/ssh/exec`;
      }
      url.pathname = pathname;
      return url.href;
    },

    /** Executes a non-interactive shell command on an acquired SSH pod via `cf-ssh-exec`. */
    async exec(pod, command, { timeoutMs = TIMING.sshExecTimeout, hostKeyFingerprint, signal = null } = {}) {
      if (signal?.aborted) throw abortError();

      const cfg = prefs.data || {};
      if (!prefs.sshReady(cfg)) {
        throw new Error('尚未配置有效的远程 SSH 网关');
      }

      const host = String(pod?.host || '').trim();
      const port = Number(pod?.port);
      const username = String(pod?.username || '').trim();
      const password = pod?.password;
      if (
        !nonBlankString(host)
        || !Number.isInteger(port)
        || port < 1
        || port > 65535
        || !nonBlankString(username)
        || typeof password !== 'string'
        || password.length === 0
        || !nonBlankString(command)
      ) {
        throw new Error('SSH 连接参数或命令不完整');
      }

      const clampedTimeout = clampExecTimeout(timeoutMs);
      const payload = {
        host,
        port,
        username,
        password,
        command,
        timeoutMs: clampedTimeout,
      };
      if (nonBlankString(hostKeyFingerprint)) {
        payload.hostKeyFingerprint = String(hostKeyFingerprint).trim();
      }

      const url = this.endpoint(cfg.sshBase);
      let res;
      try {
        res = await transport({
          method: 'POST',
          url,
          headers: {
            Authorization: `Bearer ${cfg.sshKey}`,
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(payload),
          timeout: clampedTimeout + TIMING.sshGatewayPadding,
          guardMs: clampedTimeout + TIMING.sshGatewayPadding + 3000,
          responseType: 'text',
          anonymous: true,
          redirect: 'error',
          networkMessage: 'SSH 网关连接失败',
          timeoutMessage: 'SSH 网关响应超时',
          guardMessage: 'SSH 网关响应超时（无响应）',
          abortMessage: 'SSH 命令已中断',
        }, signal);
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        throw error;
      }

      const text = typeof res?.responseText === 'string'
        ? res.responseText
        : (typeof res?.response === 'string' ? res.response : '');

      let body;
      try {
        body = JSON.parse(text);
      } catch {
        const edgeMatch = text.match(/\b(1102|1027)\b/);
        const edgeNote = edgeMatch ? `（Cloudflare ${edgeMatch[1]}）` : '';
        const err = new Error(`SSH 网关返回了非 JSON 响应（HTTP ${res?.status ?? '未知'}）${edgeNote}`);
        err.code = 'INVALID_RESPONSE';
        err.status = res?.status;
        throw err;
      }

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        const err = new Error(`SSH 网关响应格式异常（HTTP ${res?.status ?? '未知'}）`);
        err.code = 'INVALID_RESPONSE';
        err.status = res?.status;
        throw err;
      }

      const errorCode = typeof body.error?.code === 'string' ? body.error.code : '';
      if (res.status !== 200 || errorCode) {
        const mapped = errorCode && SSH_ERROR_TEXT[errorCode];
        const fallback = errorCode
          ? `SSH 网关错误（${errorCode}，HTTP ${res.status}）`
          : `SSH 网关请求失败（HTTP ${res.status}）`;
        const err = new Error(mapped || fallback);
        // Must remain a string (never numeric 401) so Runner treats gateway auth failures distinctly from EduCoder login expiry.
        err.code = errorCode || `HTTP_${res.status}`;
        err.status = res.status;
        if (typeof body.stdout === 'string') err.stdout = body.stdout;
        if (typeof body.stderr === 'string') err.stderr = body.stderr;
        if (body.exitCode === null || typeof body.exitCode === 'number') err.exitCode = body.exitCode;
        if (typeof body.requestId === 'string') err.requestId = body.requestId;
        throw err;
      }

      return {
        stdout: typeof body.stdout === 'string' ? body.stdout : '',
        stderr: typeof body.stderr === 'string' ? body.stderr : '',
        exitCode: body.exitCode === null || typeof body.exitCode === 'number' ? body.exitCode : null,
        exitSignal: typeof body.exitSignal === 'string' ? body.exitSignal : undefined,
        truncated: body.truncated === true,
        status: typeof body.status === 'string' ? body.status : undefined,
        durationMs: typeof body.durationMs === 'number' ? body.durationMs : 0,
        requestId: typeof body.requestId === 'string' ? body.requestId : '',
      };
    },
  };
}

export const SshClient = createSshClient();
