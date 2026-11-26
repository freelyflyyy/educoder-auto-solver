import { API, ERROR_TEXT, TIMING } from './constants.js';
import { abortError, isAbortError, sleep } from './utils.js';
import { Crypto } from './crypto.js';
import { Session } from './session.js';

/**
 * Unified `GM_xmlhttpRequest` transport wrapper with single-settlement guards,
 * fallback guard timers, and `AbortSignal` propagation.
 */
export function gmRequest(options, signal = null) {
  if (signal?.aborted) return Promise.reject(abortError());
  const {
    method = 'GET',
    url,
    headers,
    data,
    timeout,
    guardMs = timeout,
    responseType,
    anonymous,
    redirect,
    networkMessage = '网络错误',
    timeoutMessage = '请求超时',
    guardMessage = timeoutMessage,
    abortMessage = '已中断',
  } = options;

  return new Promise((resolve, reject) => {
    let settled = false;
    let handle = null;
    let guard = 0;

    const cleanup = () => {
      clearTimeout(guard);
      signal?.removeEventListener('abort', onAbort);
    };

    const finish = (settle, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      settle(value);
    };

    const fail = (message, code) => {
      const error = new Error(message);
      if (code !== undefined) error.code = code;
      finish(reject, error);
    };

    const onAbort = () => {
      try { handle?.abort?.(); } catch { /* Ignore abort errors from userscript host */ }
      finish(reject, abortError());
    };

    if (guardMs > 0) {
      guard = setTimeout(() => {
        try { handle?.abort?.(); } catch { /* Ignore */ }
        fail(guardMessage, 'TIMEOUT');
      }, guardMs);
    }

    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const config = {
        method,
        url,
        headers,
        timeout,
        onerror: () => fail(networkMessage, 'NETWORK'),
        ontimeout: () => fail(timeoutMessage, 'TIMEOUT'),
        onabort: () => {
          if (signal?.aborted) {
            finish(reject, abortError());
          } else {
            fail(abortMessage, 'ABORTED');
          }
        },
        onload: response => finish(resolve, response),
      };
      if (data !== undefined) config.data = data;
      if (responseType !== undefined) config.responseType = responseType;
      if (anonymous !== undefined) config.anonymous = anonymous;
      if (redirect !== undefined) config.redirect = redirect;
      handle = GM_xmlhttpRequest(config);
      if (signal?.aborted && !settled) onAbort();
    } catch {
      fail(networkMessage, 'NETWORK');
    }
  });
}

/**
 * Signed HTTP transport wrapper over `GM_xmlhttpRequest` with timeout guards and GET retries.
 */
export const Http = {
  /** Executes an HTTP request with automatic retry on transient network or timeout failures for GET calls. */
  async call(method, path, body, signal = null) {
    const attempts = method === 'GET' ? 2 : 1;
    let last;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      if (signal?.aborted) throw abortError();
      try {
        return await this.once(method, path, body, signal);
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        last = error;
        const retryable = error.code === 'TIMEOUT' || error.code === 'NETWORK';
        if (!retryable || attempt >= attempts) break;
        await sleep(TIMING.httpRetryBackoff * attempt, signal);
      }
    }
    throw last;
  },
  async once(method, path, body, signal = null) {
    const [time, signature] = Crypto.sign(method);
    const { session, cookie } = Session.authSnapshot();
    const headers = {
      'X-EDU-Type': 'pc',
      'X-EDU-Timestamp': String(time),
      'X-EDU-Signature': signature,
      'Pc-Authorization': session || 'null',
      'Accept': 'application/json',
    };
    if (cookie) headers.Cookie = cookie;
    let data;
    if (body !== undefined) {
      data = JSON.stringify(body);
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    const LIMIT = TIMING.httpTimeout;
    const res = await gmRequest({
      method,
      url: API + path,
      headers,
      data,
      timeout: LIMIT,
      guardMs: LIMIT + 5000,
      responseType: 'json',
      networkMessage: '网络错误',
      timeoutMessage: '请求超时',
      guardMessage: '请求超时（无响应）',
    }, signal);

    const payload = res.response;
    if (res.status !== 200 || !payload || typeof payload !== 'object') {
      throw new Error(`请求失败 HTTP ${res.status}`);
    }
    const code = payload.status;
    if (ERROR_TEXT[code] !== undefined) {
      const serverMessage = code === -1 && typeof payload.message === 'string' && payload.message.trim();
      const error = new Error(serverMessage || ERROR_TEXT[code]);
      error.code = code;
      throw error;
    }
    return payload;
  },
  get(path, signal = null) { return this.call('GET', path, undefined, signal); },
  post(path, body, signal = null) { return this.call('POST', path, body, signal); },
};
