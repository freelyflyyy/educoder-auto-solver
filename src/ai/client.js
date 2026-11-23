import { abortError, isAbortError, numericSetting, sleep } from '../core/utils.js';
import { gmRequest } from '../core/transport.js';
import { AiSettings } from '../config/ai-settings.js';
import { AiConnectionError, AiRequestError } from './errors.js';

const ENDED_REASONS = Object.freeze({
  content_filter: '模型内容被服务商过滤',
  tool_calls: '模型返回了工具调用',
  insufficient_system_resource: '模型服务资源不足',
  aborted: '模型服务中断了生成',
});

function toDataUrl(blob, maxBytes) {
  return new Promise(resolve => {
    if (!blob || !String(blob.type).startsWith('image/') || blob.size > maxBytes) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });
}

/**
 * OpenAI-compatible Chat Completions transport client with `fetch` / `GM_xmlhttpRequest` fallback
 * and authenticated problem image downloading.
 */
export function createAiClient({ aiSettings = AiSettings } = {}) {
  return {
    gmUrl: null,
    async post(url, headers, body, timeoutMs, signal = null) {
      if (signal?.aborted) throw abortError();
      if (this.gmUrl === url) return this.viaGM(url, headers, body, timeoutMs, signal);

      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
      const onAbort = () => controller.abort();
      signal?.addEventListener('abort', onAbort, { once: true });

      let receivedHeaders = false;
      try {
        const response = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
        receivedHeaders = true;
        return {
          status: response.status,
          text: await response.text(),
          retryAfter: response.headers.get('Retry-After'),
        };
      } catch (error) {
        if (signal?.aborted) throw abortError();
        if (timedOut || controller.signal.aborted) throw new AiRequestError('模型请求超时');
        if (receivedHeaders || error?.name !== 'TypeError') {
          throw new AiRequestError('模型连接中断');
        }
        if (typeof GM_xmlhttpRequest !== 'function') throw new AiConnectionError('模型连接失败');
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
      }

      const result = await this.viaGM(url, headers, body, timeoutMs, signal);
      this.gmUrl = url;
      return result;
    },
    async viaGM(url, headers, body, timeoutMs, signal = null) {
      try {
        const response = await gmRequest({
          method: 'POST',
          url,
          headers,
          data: body,
          timeout: timeoutMs,
          guardMs: timeoutMs,
          networkMessage: '模型连接失败',
          timeoutMessage: '模型请求超时',
          guardMessage: '模型请求超时',
          abortMessage: '模型请求已中断',
        }, signal);
        return {
          status: response.status,
          text: response.responseText || '',
          retryAfter: response.responseHeaders?.match(/^retry-after:\s*([^\r\n]+)/im)?.[1],
        };
      } catch (error) {
        if (isAbortError(error) && signal?.aborted) throw abortError();
        throw new AiRequestError(error.message);
      }
    },
    retryDelay(status, retryAfter) {
      if (![429, 500, 502, 503, 504].includes(status)) return null;
      if (!retryAfter) return 800 + Math.random() * 400;
      const seconds = Number(retryAfter);
      const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
      return Number.isFinite(delay) ? Math.max(0, delay) : 1000;
    },
    /** Concurrently downloads up to 4 problem images and encodes them as base64 data URLs. */
    async loadImages(urls, signal = null) {
      if (signal?.aborted) throw abortError();
      const maxBytes = 3 * 1024 * 1024;
      const validUrls = [];
      for (const raw of urls.slice(0, 4)) {
        if (typeof raw !== 'string' || !raw) continue;
        try {
          const url = new URL(raw, location.origin);
          if (['http:', 'https:'].includes(url.protocol)) validUrls.push(url.href);
        } catch { /* Skip malformed URLs */ }
      }
      const loaded = await Promise.all(validUrls.map(href => this.fetchImage(href, maxBytes, signal)));
      if (signal?.aborted) throw abortError();
      return loaded.filter(Boolean);
    },
    /**
     * Fetches a single image via `GM_xmlhttpRequest` (to bypass OSS cross-origin redirects)
     * and converts it into a `data:image/...;base64,...` URL.
     */
    async fetchImage(url, maxBytes, signal = null) {
      if (signal?.aborted) throw abortError();
      if (typeof GM_xmlhttpRequest === 'function') {
        try {
          const res = await gmRequest({
            method: 'GET',
            url,
            timeout: 20000,
            guardMs: 25000,
            responseType: 'arraybuffer',
          }, signal);
          if (res.status !== 200 || !res.response) return '';
          const match = /content-type:\s*([^\r\n;]+)/i.exec(String(res.responseHeaders || ''));
          const type = (match?.[1] || 'image/png').trim();
          return await toDataUrl(new Blob([res.response], { type }), maxBytes);
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          return '';
        }
      }

      try {
        const res = await fetch(url, { credentials: 'include', signal });
        if (!res.ok) return '';
        return await toDataUrl(await res.blob(), maxBytes);
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        return '';
      }
    },
    buildRequest(cfg, system, prompt, forCode, images = []) {
      if (!aiSettings.ready(cfg)) throw new AiRequestError('AI 配置不完整', false);
      let url;
      let extra;
      try {
        url = aiSettings.endpoint(cfg.base);
        extra = aiSettings.extraParams(cfg.extraBody);
      } catch (error) {
        throw new AiRequestError(error.message, false);
      }
      const { deepSeek, flash, nativeThinking, thinking, sampler, penalties } = aiSettings.modelOptions(cfg, forCode);
      const tokens = forCode ? cfg.maxTokens : Math.min(cfg.maxTokens, thinking ? 4096 : 1024);
      const userContent = images.length
        ? [
          { type: 'text', text: prompt },
          ...images.map(imageUrl => ({ type: 'image_url', image_url: { url: imageUrl } })),
        ]
        : prompt;
      const payload = {
        model: cfg.model,
        max_tokens: tokens,
        messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
      };
      if (sampler === 'temperature') payload.temperature = cfg.temperature;
      if (sampler === 'topP') payload.top_p = cfg.topP;
      if (penalties) {
        if (cfg.frequencyPenalty) payload.frequency_penalty = cfg.frequencyPenalty;
        if (cfg.presencePenalty) payload.presence_penalty = cfg.presencePenalty;
      }
      if (thinking) payload.reasoning_effort = nativeThinking && cfg.thinkLevel === 'medium' ? 'high' : cfg.thinkLevel;
      if (nativeThinking) payload.thinking = { type: thinking ? 'enabled' : 'disabled' };
      if (forCode && (cfg.jsonMode === 'on' || (deepSeek && cfg.jsonMode === 'auto'))) {
        payload.response_format = { type: 'json_object' };
      }
      const timeout = (forCode ? cfg.timeout : Math.min(cfg.timeout, 45)) * 1000;
      const body = { ...payload, ...extra };
      if (sampler === 'temperature' || (deepSeek && !sampler)) delete body.top_p;
      if (sampler === 'topP' || (deepSeek && !sampler)) delete body.temperature;
      if (flash && sampler === 'topP') {
        body.top_p = Math.max(0.95, numericSetting(body.top_p, 0.01, 1, cfg.topP));
      }
      if (deepSeek) {
        delete body.frequency_penalty;
        delete body.presence_penalty;
      }
      return { url: url.href, payload: body, timeout };
    },
    async request(cfg, system, prompt, forCode = false, images = [], signal = null) {
      const { url, payload, timeout } = this.buildRequest(cfg, system, prompt, forCode, images);
      const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key };
      const body = JSON.stringify(payload);
      let response;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        if (signal?.aborted) throw abortError();
        let delay;
        try {
          response = await this.post(url, headers, body, timeout, signal);
          delay = this.retryDelay(response.status, response.retryAfter);
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          if (attempt || !(error instanceof AiConnectionError)) throw error;
          delay = 2000;
        }
        if (attempt || delay === null || delay > 10000) break;
        await sleep(delay, signal);
      }

      const { status, text } = response;
      let data;
      try { data = JSON.parse(text); } catch { /* Non-JSON gateway error payload */ }
      if (status < 200 || status >= 300 || data?.error) {
        const message = data?.error?.message;
        const detail = typeof message === 'string' ? message.replaceAll(cfg.key, '[已隐藏]').slice(0, 180) : '';
        const retryable = status === 429 || status === 408 || status >= 500;
        throw new AiRequestError(`模型请求失败（HTTP ${status}）${detail ? `：${detail}` : ''}`, retryable);
      }
      if (!data) throw new AiRequestError('模型接口返回了非 JSON 响应');
      const choice = data.choices?.[0];
      const reason = choice?.finish_reason;
      const content = choice?.message?.content;
      if (Object.hasOwn(ENDED_REASONS, reason)) {
        throw new AiRequestError(
          ENDED_REASONS[reason],
          reason === 'insufficient_system_resource' || reason === 'aborted',
        );
      }
      return { content: typeof content === 'string' ? content : '', truncated: reason === 'length' };
    },
    async test(cfg, signal = null) {
      const { content, truncated } = await this.request(
        cfg,
        '你是连通性测试助手。',
        '只回复两个字：正常',
        false,
        [],
        signal,
      );
      if (!content.trim()) throw new AiRequestError(truncated ? '模型输出达到 Token 上限' : '模型没有返回内容');
      return content;
    },
  };
}

export const AiClient = createAiClient();
