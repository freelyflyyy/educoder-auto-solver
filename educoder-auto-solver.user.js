// ==UserScript==
// @name         头歌自动答题助手
// @namespace    edu-helper.local
// @version      1.2.0
// @author       如风
// @description  头歌实训纯接口自动化：扫描 → 队列 → 逐关答题，全程不跳页
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABGUUKwAAAF1ElEQVR4Ae1beWwVRRj/bVuOnjyttbVSaa1QNB4ttB6ExiIRPLBpQtJCNHj9Y62CGAxRhECIQv9orFVoSI1KTEzB9DAC1gOkEYjWatE2toVXS6X0ooXeJG1f1/kWd7Pv9R27723f233lSzYzu/N9M9/vtzOzM7MzwA2Z2QxwauDX1vKz5kdgNQKwihmmMttEdpk4DrPV5KOVLs9jjOXVz64WHqjFJL5vH8R3qancuNIyFBHQWsebQsLwBjjkMbC3KM3cF3qMlF7w2Dc6jMKEFI7IcSouCegy8zlMqYgBv9VpTjpLZET0sFqxMeYu7pAz1wIcJR4+zAd2t/D7AziUGg08YSKfyXfCQFgc4bRbA8jg0aU4xBLXOjI00nNWE8qqf0dOdjZnsfXbLgHEGkvItVU28j0joTg6kXvVFsMUAqjNU9WxVfSH+0ke62z7BCsChN4+HM1GbPNKXhB1jKNDSJJ/Haw6QfrU+St4IoiwCZ9zGVtSDaBBTpwJHUxJ1995me9uRWmccLEfseJgSaoBNMLzJvihwRGUfFiOo2U/uwXEXSPCKIxm/89AIoCGt+5m6o7d0OAoPimqRPmXJ9wx98xGhlUigLUFGtt7XTov9Xq9TDlWiQDmBU1svC59lwfQar7k7XIlrHICTN72Qizv43ynw3VRTctQwioRwDoHn0xpCdWpE2fx7qZ96Osd0BKkw7zkWCUCHGp7KeGHI78iK/1N7NpyAHU1TV4qFQjyWkkKChobG8exitPCFZ8Yi5znH0dmTgaCghxO5hTk6lxFNzXA1s0LLR3I33EQzz61DXW/Ndsma3avWwJEhERE3nN7UVn6k/hI09DnTSAyah6S05IwMnwNPV1X0NbSCYtl0gqkZcKCPds+Q2SUCekrU6zSPL3xOQEJC2/H+x+9JuEYH5tAw1kzjh+rQdXXZ0AjRlF2by1BxckChIYFi488DnXXBGbNDkLKg4uxZecGVFQXYMMraxDAFihIBq4O46svfvQYtDwD3REgdy48IhR5b2Wj6OBWhIWHCElVlaflKh7HdU2AiC5t2T3YXZjL5vMcGzZ3oLvzipjkcWgIAgjlsowHkLFqqQD4fGObx8DFDAxDADn89Np0we/L3S7/d4j4XIaGImDBnTECoNGRay6BKVUwFAFzg+cIuMRQKUhneoYigAZLJDdHRjjDpCrNUAR0tl9fPUq6N14VSGfKhiKg+e82xMRGInZ+lDNMqtIMRQAtnKzOfEQVQFfKhiHA3HwRTQ2tyFq/whUmVemGIaC3px8v5GZqWv2JKZ/PBpW+rofT7wNdWothaoDWwMX8pr0G0ErvL9V/obHhAq72DSIkdC7uSIjB/UsWij74NJw2AqjNHvigDEfLT4FWdPQq00LAmZN/Yidb3qYFDL2L5gQc/7YG2zftn7Kup1ciNO0Ezzf9ix2bi1WBDwycvjV/JaRrSkD+9s8xMa6uvUdFS7/plPiruY5mBPxzrh31f5hVO7jkobtV22hpoBkBjfWtqv2ifwIrn0xTbaelgUQA2ztDG4/dloGBEdW27+x5GVoubih1QI5VIoAZe7TQFrcgWmn5gt7b772I5SuSVdloqCxhlRPQ4kkBNE6Pi3dNwrybwlBQshlZ67Sd1an0XcIqEcC2ktaqzMRKnf7oFH66BYsdrNYEh8zB+peeQGnVXix/TNv/e1aOKLiRY73+z4kZdZ3j1wQE4hsF9i5V6uvMoE5xZGgUEaYwNva/Dcmpi0Ak6UEmLXgmZhF3hHyRCJjxGyWFnZPspIUe3tC0+sAwirtEqRypD6AbOmZCG4op7o9C2AijHJsVAbSLmnUQG+UK/hQnbPKd4oTNigB6QPvpmWIxxf1JCJPtWQHCN4UAesiOl7zODMoo7g9CWAiTPSx2CaCzNXTGxh9qAmFwdF6ICJE+g/bYoWcz9ticSAi1Gzpmwk9iF+tFvb+1W3REYUg+kq/ks702b5uNyxogN/DHo7NyfDfiM5GB/wCnrr/cYlI1tAAAAABJRU5ErkJggg==
// @match        https://www.educoder.net/*
// @match        https://educoder.net/*
// @run-at       document-idle
// @noframes
// @grant        GM_xmlhttpRequest
// @connect      data.educoder.net
// @connect      *
// 说明：@connect * 允许用户填写任意 OpenAI 兼容端点，不绑定具体服务商
// ==/UserScript==

(() => {
  'use strict';
  if (document.querySelector('tg-answer-assistant')) return;

  // --- src/core/constants.js ---
  const mod_core_constants = (() => {
    const VERSION = '1.2.0';
    const API = 'https://data.educoder.net/api';
    const AK = 'e9dd5b4322f9f7d83d009de9bfa100c3';
    const SK = '2e3da06ae26ba9f76a5d8d355746f2fe';

    /** Centralized polling, retry, and timeout thresholds (in milliseconds). */
    const TIMING = Object.freeze({
      poll: 1500,
      passTimeout: 25000,
      stepGap: 300,
      codeGradeTimeout: 120000,
      linuxGradeTimeout: 150000,
      commitSettle: 4000,
      sourceAttempts: 2,
      retryGap: 3000,
      gradeBackoff: 6000,
      gradeAttempts: 8,
      httpRetryBackoff: 1500,
      httpTimeout: 30000,
      uiTick: 900,
      minEvalMs: 10000,
      scanConcurrency: 3,
      sshExecTimeout: 20000,
      sshGatewayPadding: 5000,
      sshConnectAttempts: 2,
      sshConnectRetryGap: 2000,
      envStartAttempts: 5,
      envStartBackoff: 3000,
    });

    const STORAGE_KEYS = Object.freeze({
      prefs: 'tg.prefs.v6',
      ai: 'tg.ai.v7',
      templates: 'tg.tpl.v1',
      dock: 'tg.pos.v7',
      zzud: 'tg.zzud',
    });

    const MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true">'
      + '<rect class="mark-surface" x="2" y="2" width="60" height="60" rx="15"/>'
      + '<path class="mark-symbol" d="M32.74 12.50 Q32.74 14.67 33.28 15.84 Q33.82 17.00 34.70 17.53 '
      + 'Q35.58 18.06 37.27 18.66 Q42.00 20.29 43.74 23.05 Q45.47 25.80 45.47 29.71 '
      + 'Q45.47 33.26 43.45 36.83 L42.39 36.39 Q43.92 33.82 43.92 30.05 Q43.92 26.68 40.75 24.65 '
      + 'Q37.58 22.62 32.74 22.62 L32.74 43.50 Q32.74 46.58 29.85 49.04 Q26.97 51.50 23.52 51.50 '
      + 'Q21.17 51.50 19.85 50.39 Q18.53 49.27 18.53 47.31 Q18.53 44.23 21.42 41.77 '
      + 'Q24.30 39.31 27.77 39.31 Q29.63 39.31 30.87 40.06 L30.87 12.50 Z"/></svg>';

    const ERROR_TEXT = Object.freeze({
      401: '登录状态已过期，请刷新网页重新登录',
      '-102': '接口签名校验未通过，请刷新页面重试',
      '-2': '平台评测队列繁忙',
      '-1': '接口请求参数有误',
      404: '未找到该关卡或题目已下线',
      403: '无权访问该关卡（作业可能已截止或已关闭）',
    });

    const PHASE_LABEL = Object.freeze({
      idle: '准备就绪',
      scanning: '正在扫描',
      countdown: '即将开始',
      running: '答题中',
      paused: '已暂停',
      done: '已完成',
    });

    const MSG_LEVEL = Object.freeze({
      INFO: 'info',
      SUCCESS: 'success',
      WARN: 'warn',
      ERROR: 'error',
    });

    const HOST_TAG = 'tg-answer-assistant';
    const DOCK_EDGE = 10;
    const LOG_CAPACITY = 40;
    return { VERSION, API, AK, SK, TIMING, STORAGE_KEYS, MARK, ERROR_TEXT, PHASE_LABEL, MSG_LEVEL, HOST_TAG, DOCK_EDGE, LOG_CAPACITY };
  })();

  // --- src/core/utils.js ---
  const mod_core_utils = (() => {
    const HTML_ENTITIES = Object.freeze({
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      nbsp: ' ',
    });

    /** Creates a standardized cancellation error for aborting active polling loops. */
    function abortError() {
      const error = new Error('已中断');
      error.code = 'ABORTED';
      return error;
    }

    function isAbortError(error) {
      return Boolean(error && (error.code === 'ABORTED' || error.name === 'AbortError'));
    }

    /** Cooperative cancellable sleep supporting optional `AbortSignal`. */
    function sleep(ms, signal = null) {
      if (signal?.aborted) return Promise.reject(abortError());
      return new Promise((resolve, reject) => {
        const onAbort = () => {
          clearTimeout(timer);
          reject(abortError());
        };
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        }, ms);
        signal?.addEventListener('abort', onAbort, { once: true });
      });
    }

    const raf = typeof requestAnimationFrame === 'function'
      ? callback => requestAnimationFrame(callback)
      : callback => setTimeout(callback, 16);

    const norm = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();

    const splitPaths = raw => String(raw ?? '').split(/[；;]/).map(part => part.trim()).filter(Boolean);

    /** Resolves the output comparison rule declared by test sets or challenge metadata. */
    function normalizeMatchRule(sets, challenge) {
      const hit = (sets || []).map(item => String(item.matchRule || '').trim()).find(Boolean);
      if (hit) return hit;
      return Number(challenge?.ignore_space) === 1 ? 'full 且忽略空格' : 'full';
    }

    /** Converts Educoder HTML problem descriptions into plain text. */
    function decodeHtmlToText(html) {
      return String(html || '')
        .replace(/<br\s*\/?>|<\/(?:p|div|li|pre|tr|h[1-6])>/gi, '\n')
        .replace(/<\/?[a-z][\w-]*(?:\s+[^<>]*)?\/?\s*>/gi, '')
        .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (raw, entity) => {
          if (entity[0] !== '#') {
            const name = entity.toLowerCase();
            return Object.hasOwn(HTML_ENTITIES, name) ? HTML_ENTITIES[name] : raw;
          }
          const code = entity[1].toLowerCase() === 'x'
            ? Number.parseInt(entity.slice(2), 16)
            : Number(entity.slice(1));
          return Number.isInteger(code) && code >= 0 && code <= 0x10ffff
            ? String.fromCodePoint(code)
            : raw;
        })
        .trim();
    }

    /** Safely parses a JSON object from `localStorage`, returning an empty object on corruption. */
    function readStoredObject(key) {
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
      } catch {
        return {};
      }
    }

    function numericSetting(value, min, max, fallback, integer = false) {
      if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') return fallback;
      const number = Number(value);
      return Number.isFinite(number) && number >= min && number <= max && (!integer || Number.isInteger(number))
        ? number
        : fallback;
    }

    /** Executes an async mapper over `items` with bounded concurrency while preserving output order. */
    async function mapWithConcurrency(items, limit, worker, signal = null) {
      if (!items.length) return [];
      if (signal?.aborted) throw abortError();
      const results = new Array(items.length);
      let nextIndex = 0;

      async function runWorker() {
        while (true) {
          if (signal?.aborted) throw abortError();
          const index = nextIndex;
          if (index >= items.length) return;
          nextIndex += 1;
          results[index] = await worker(items[index], index);
        }
      }

      const workerCount = Math.min(Math.max(1, limit), items.length);
      await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
      if (signal?.aborted) throw abortError();
      return results;
    }
    return { abortError, isAbortError, sleep, raf, norm, splitPaths, normalizeMatchRule, decodeHtmlToText, readStoredObject, numericSetting, mapWithConcurrency };
  })();

  // --- src/config/prefs.js ---
  const mod_config_prefs = (() => {
    const { STORAGE_KEYS } = mod_core_constants;
    const { numericSetting, readStoredObject } = mod_core_utils;

    const PREF_DEFAULTS = Object.freeze({
      delay: 1,
      auto: false,
      codeRetries: 2,
      logRows: 6,
      titleProgress: true,
      aiFallback: false,
      sshBase: '',
      sshKey: '',
    });

    /**
     * Creates a persistent user preferences store for execution behavior, AI fallback, and remote SSH gateway parameters.
     */
    function createPrefs() {
      return {
        KEY: STORAGE_KEYS.prefs,
        defaults: PREF_DEFAULTS,
        data: null,
        normalize(values) {
          const defaults = this.defaults;
          const delay = Number(values.delay);
          const logRows = Number(values.logRows);
          return {
            delay: [1, 3, 5, 10].includes(delay) ? delay : defaults.delay,
            auto: values.auto === true,
            codeRetries: numericSetting(values.codeRetries, 0, 4, defaults.codeRetries, true),
            logRows: [6, 12, 24, 40].includes(logRows) ? logRows : defaults.logRows,
            titleProgress: values.titleProgress !== false,
            aiFallback: values.aiFallback === true,
            sshBase: typeof values.sshBase === 'string' ? values.sshBase.trim() : '',
            sshKey: typeof values.sshKey === 'string' ? values.sshKey.trim() : '',
          };
        },
        load() {
          this.data = this.normalize(readStoredObject(this.KEY));
          return this.data;
        },
        save(values) {
          const data = this.normalize(values);
          localStorage.setItem(this.KEY, JSON.stringify(data));
          this.data = data;
          return data;
        },
        /** Checks whether a valid HTTP(S) SSH gateway endpoint and >=16-char API key are configured. */
        sshReady(cfg = this.data) {
          const { sshBase, sshKey } = cfg || {};
          return /^https?:\/\/[^\s/]+/i.test(String(sshBase || ''))
            && String(sshKey || '').length >= 16;
        },
      };
    }

    const Prefs = createPrefs();
    return { createPrefs, Prefs };
  })();

  // --- src/config/ai-settings.js ---
  const mod_config_ai_settings = (() => {
    const { STORAGE_KEYS } = mod_core_constants;
    const { numericSetting, readStoredObject } = mod_core_utils;

    const AI_DEFAULTS = Object.freeze({
      base: 'https://api.deepseek.com/v1',
      key: '',
      model: 'deepseek-v4-pro',
      maxTokens: 16384,
      timeout: 150,
      sampling: 'temperature',
      temperature: 0.15,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      thinking: 'auto',
      thinkLevel: 'high',
      jsonMode: 'auto',
      extraBody: '',
      extraPrompt: '',
      vision: false,
    });

    const MANAGED_AI_FIELDS = ['model', 'messages', 'stream', 'stream_options', 'max_tokens', 'max_completion_tokens', 'response_format', 'n'];

    /**
     * Creates a persistent AI configuration store with in-memory caching and capability negotiation.
     */
    function createAiSettings() {
      let cached = null;

      return {
        KEY: STORAGE_KEYS.ai,
        defaults: AI_DEFAULTS,
        normalize(values) {
          const defaults = this.defaults;
          const topP = numericSetting(values.topP, 0.01, 1, defaults.topP);
          const string = key => typeof values[key] === 'string' ? values[key].trim() : defaults[key];
          return {
            base: string('base'),
            key: string('key'),
            model: string('model'),
            maxTokens: numericSetting(values.maxTokens, 1, 393216, defaults.maxTokens, true),
            timeout: numericSetting(values.timeout, 15, 600, defaults.timeout, true),
            sampling: ['temperature', 'topP'].includes(values.sampling) ? values.sampling : defaults.sampling,
            temperature: numericSetting(values.temperature, 0, 2, defaults.temperature),
            topP,
            frequencyPenalty: numericSetting(values.frequencyPenalty, -2, 2, defaults.frequencyPenalty),
            presencePenalty: numericSetting(values.presencePenalty, -2, 2, defaults.presencePenalty),
            thinking: ['auto', 'on', 'off'].includes(values.thinking) ? values.thinking : defaults.thinking,
            thinkLevel: ['low', 'medium', 'high'].includes(values.thinkLevel) ? values.thinkLevel : defaults.thinkLevel,
            jsonMode: ['auto', 'on', 'off'].includes(values.jsonMode) ? values.jsonMode : defaults.jsonMode,
            extraBody: string('extraBody'),
            extraPrompt: string('extraPrompt'),
            vision: values.vision === true,
          };
        },
        peek() {
          if (!cached) cached = this.normalize(readStoredObject(this.KEY));
          return cached;
        },
        load() {
          return { ...this.peek() };
        },
        save(values) {
          const cfg = this.normalize(values);
          if (cfg.base) this.endpoint(cfg.base);
          this.extraParams(cfg.extraBody);
          localStorage.setItem(this.KEY, JSON.stringify(cfg));
          cached = cfg;
          return { ...cfg };
        },
        ready(cfg = null) {
          const target = cfg || this.peek();
          return Boolean(target.base && target.key && target.model);
        },
        modelOptions(cfg, forCode = true) {
          let deepSeek = false;
          try { deepSeek = new URL(cfg.base).hostname === 'api.deepseek.com'; } catch { /* Fall back to generic OpenAI mode */ }
          const flash = deepSeek && /^deepseek-(?:flash|v4-flash(?:-vision-exp)?)$/.test(cfg.model);
          const nativeThinking = flash || (deepSeek && cfg.model === 'deepseek-v4-pro');
          const thinking = nativeThinking ? forCode && cfg.thinking !== 'off' : cfg.thinking === 'on';
          const chooseSampler = !thinking && !flash;
          return {
            deepSeek,
            flash,
            nativeThinking,
            thinking,
            chooseSampler,
            sampler: chooseSampler ? cfg.sampling : flash && thinking ? 'topP' : null,
            penalties: !deepSeek && !thinking,
          };
        },
        endpoint(base) {
          let url;
          try { url = new URL(base); } catch { /* Handled below */ }
          if (!url || !['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
            throw new Error('请填写有效的 HTTP 或 HTTPS 接口基础地址');
          }
          const path = url.pathname.replace(/\/+$/, '');
          url.pathname = path.endsWith('/chat/completions') ? path : path + '/chat/completions';
          return url;
        },
        extraParams(value) {
          if (!value) return {};
          let data;
          try { data = JSON.parse(value); } catch { /* Handled below */ }
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('自定义请求参数必须是有效的 JSON 对象');
          }
          const conflict = MANAGED_AI_FIELDS.find(field => Object.hasOwn(data, field));
          if (conflict) throw new Error(`自定义请求参数中的 "${conflict}" 字段已由脚本自动管理，请移除`);
          return data;
        },
      };
    }

    const AiSettings = createAiSettings();
    return { createAiSettings, AiSettings };
  })();

  // --- src/config/template-cache.js ---
  const mod_config_template_cache = (() => {
    const { STORAGE_KEYS } = mod_core_constants;
    const { readStoredObject } = mod_core_utils;

    /**
     * Bounded LRU cache backed by an in-memory `Map` and synchronized to `localStorage`.
     */
    function createTemplateCache(limit = 300) {
      let map = null;

      function ensureLoaded() {
        if (map) return map;
        map = new Map();
        const raw = readStoredObject(STORAGE_KEYS.templates);
        for (const [key, value] of Object.entries(raw)) {
          if (typeof value === 'string') map.set(key, value);
        }
        while (map.size > limit) {
          map.delete(map.keys().next().value);
        }
        return map;
      }

      function persist() {
        if (!map) return;
        try {
          localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(Object.fromEntries(map)));
        } catch { /* Ignore quota errors */ }
      }

      function touch(cache, entryKey, content) {
        if (cache.has(entryKey)) cache.delete(entryKey);
        cache.set(entryKey, content);
        while (cache.size > limit) {
          cache.delete(cache.keys().next().value);
        }
      }

      return {
        KEY: STORAGE_KEYS.templates,
        limit,
        get(gameId, path) {
          const cache = ensureLoaded();
          const entryKey = `${gameId}:${path}`;
          if (!cache.has(entryKey)) return null;
          const value = cache.get(entryKey);
          cache.delete(entryKey);
          cache.set(entryKey, value);
          return value;
        },
        set(gameId, path, content) {
          const cache = ensureLoaded();
          const entryKey = `${gameId}:${path}`;
          if (cache.get(entryKey) === content) {
            touch(cache, entryKey, content);
            return;
          }
          touch(cache, entryKey, content);
          persist();
        },
        /** Persists multiple `[gameId, path, content]` entries with a single storage write. */
        setMany(entries) {
          if (!entries.length) return;
          const cache = ensureLoaded();
          let dirty = false;
          for (const [gameId, path, content] of entries) {
            const entryKey = `${gameId}:${path}`;
            if (cache.get(entryKey) !== content) dirty = true;
            touch(cache, entryKey, content);
          }
          if (dirty) persist();
        },
        clear() {
          map = new Map();
          try { localStorage.removeItem(STORAGE_KEYS.templates); } catch { /* Ignore */ }
        },
      };
    }

    const TemplateCache = createTemplateCache();
    return { createTemplateCache, TemplateCache };
  })();

  // --- src/platform/route.js ---
  const mod_platform_route = (() => {
    /**
     * URL route parser for extracting course, homework, and challenge identifiers.
     */
    const Route = {
      path() { return location.pathname.replace(/\/$/, ''); },
      courseId() {
        const hit = location.pathname.match(/^\/classrooms\/([^/]+)/);
        return hit ? hit[1] : '';
      },
      isTask(path = this.path()) { return /^\/tasks\/[^/]+\/[^/]+\/[^/]+\/?$/.test(path); },
      homeworkId() {
        const hit = location.pathname.match(/\/shixun_homework\/(\d+)/);
        if (hit) return Number(hit[1]);
        if (this.isTask()) {
          const id = Number(this.keyOf().homeworkId);
          return Number.isFinite(id) && id > 0 ? id : 0;
        }
        const queryId = Number(new URLSearchParams(location.search || '').get('homework_common_id'));
        return Number.isFinite(queryId) && queryId > 0 ? queryId : 0;
      },
      keyOf(url = location.href) {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts[0] !== 'tasks' || parts.length < 3) throw new Error('不是关卡地址');
        const homeworkId = parsed.searchParams.get('homework_common_id') || (parts.length >= 4 ? parts[2] : '');
        return { gameId: parts[3] || parts[parts.length - 1], homeworkId, courseId: parts[1] };
      },
    };
    return { Route };
  })();

  // --- src/core/session.js ---
  const mod_core_session = (() => {
    const { STORAGE_KEYS } = mod_core_constants;

    function parseAuthCookies() {
      let session = null;
      let autologin = null;
      const raw = typeof document !== 'undefined' ? document.cookie : '';
      for (const chunk of String(raw || '').split(';')) {
        const entry = chunk.trim();
        const eq = entry.indexOf('=');
        if (eq <= 0) continue;
        const name = entry.slice(0, eq);
        if (session === null && name === '_educoder_session') {
          session = entry.slice(eq + 1);
          if (autologin !== null) break;
        } else if (autologin === null && name === 'autologin_trustie') {
          autologin = entry.slice(eq + 1);
          if (session !== null) break;
        }
      }
      return { session: session || '', autologin: autologin || '' };
    }

    /**
     * Session credential reader for Educoder cookies and tenant identifiers (`zzud`).
     */
    const Session = {
      /** Single-pass read returning both session token and serialized Cookie header for `Http.once`. */
      authSnapshot() {
        const { session, autologin } = parseAuthCookies();
        const parts = [];
        if (autologin) parts.push(`autologin_trustie=${autologin}`);
        if (session) parts.push(`_educoder_session=${session}`);
        return { session, cookie: parts.join('; ') };
      },
      zzud() {
        return new URLSearchParams(location.search).get('zzud')
          || sessionStorage.getItem(STORAGE_KEYS.zzud)
          || localStorage.getItem(STORAGE_KEYS.zzud)
          || '';
      },
    };
    return { Session };
  })();

  // --- src/core/crypto.js ---
  const mod_core_crypto = (() => {
    const { AK, SK } = mod_core_constants;

    const MD5_K = new Uint32Array(64);
    for (let i = 0; i < 64; i += 1) {
      MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
    }

    const SHIFT_TABLE = [
      [7, 12, 17, 22],
      [5, 9, 14, 20],
      [4, 11, 16, 23],
      [6, 10, 15, 21],
    ];
    const MD5_SHIFTS = new Uint8Array(64);
    for (let i = 0; i < 64; i += 1) {
      MD5_SHIFTS[i] = SHIFT_TABLE[i >>> 4][i & 3];
    }

    const HEX_BYTE = Array.from({ length: 256 }, (_, value) => value.toString(16).padStart(2, '0'));

    /** Computes the lowercase hex MD5 digest of an ASCII string. */
    function md5Ascii(text) {
      const bytes = new Uint8Array(Math.ceil((text.length + 9) / 64) * 64);
      for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i);
      bytes[text.length] = 128;
      const view = new DataView(bytes.buffer);
      view.setUint32(bytes.length - 8, text.length * 8, true);

      let s0 = 0x67452301;
      let s1 = 0xefcdab89;
      let s2 = 0x98badcfe;
      let s3 = 0x10325476;

      for (let offset = 0; offset < bytes.length; offset += 64) {
        let a = s0;
        let b = s1;
        let c = s2;
        let d = s3;
        for (let i = 0; i < 64; i += 1) {
          let f;
          let word;
          if (i < 16) {
            f = (b & c) | (~b & d);
            word = i;
          } else if (i < 32) {
            f = (d & b) | (~d & c);
            word = (5 * i + 1) & 15;
          } else if (i < 48) {
            f = b ^ c ^ d;
            word = (3 * i + 5) & 15;
          } else {
            f = c ^ (b | ~d);
            word = (7 * i) & 15;
          }
          const sum = (a + f + MD5_K[i] + view.getUint32(offset + word * 4, true)) | 0;
          const shift = MD5_SHIFTS[i];
          const nextB = (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0;
          a = d;
          d = c;
          c = b;
          b = nextB;
        }
        s0 = (s0 + a) | 0;
        s1 = (s1 + b) | 0;
        s2 = (s2 + c) | 0;
        s3 = (s3 + d) | 0;
      }

      return HEX_BYTE[s0 & 255] + HEX_BYTE[(s0 >>> 8) & 255] + HEX_BYTE[(s0 >>> 16) & 255] + HEX_BYTE[(s0 >>> 24) & 255]
        + HEX_BYTE[s1 & 255] + HEX_BYTE[(s1 >>> 8) & 255] + HEX_BYTE[(s1 >>> 16) & 255] + HEX_BYTE[(s1 >>> 24) & 255]
        + HEX_BYTE[s2 & 255] + HEX_BYTE[(s2 >>> 8) & 255] + HEX_BYTE[(s2 >>> 16) & 255] + HEX_BYTE[(s2 >>> 24) & 255]
        + HEX_BYTE[s3 & 255] + HEX_BYTE[(s3 >>> 8) & 255] + HEX_BYTE[(s3 >>> 16) & 255] + HEX_BYTE[(s3 >>> 24) & 255];
    }

    /** MD5 request signature generator for Educoder's PC API authentication scheme. */
    const Crypto = Object.freeze({
      sign(method) {
        const time = Date.now();
        const payload = `method=${method}&ak=${AK}&sk=${SK}&time=${time}`;
        return [time, md5Ascii(btoa(payload))];
      },
    });
    return { md5Ascii, Crypto };
  })();

  // --- src/core/transport.js ---
  const mod_core_transport = (() => {
    const { API, ERROR_TEXT, TIMING } = mod_core_constants;
    const { abortError, isAbortError, sleep } = mod_core_utils;
    const { Crypto } = mod_core_crypto;
    const { Session } = mod_core_session;

    /**
     * Unified `GM_xmlhttpRequest` transport wrapper with single-settlement guards,
     * fallback guard timers, and `AbortSignal` propagation.
     */
    function gmRequest(options, signal = null) {
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
    const Http = {
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
    return { gmRequest, Http };
  })();

  // --- src/platform/api.js ---
  const mod_platform_api = (() => {
    const { TIMING } = mod_core_constants;
    const { abortError, isAbortError, sleep } = mod_core_utils;
    const { Session } = mod_core_session;
    const { Http } = mod_core_transport;

    const UTF8_DECODER = new TextDecoder();

    /** Appends URL-encoded query parameters and the current `zzud` session token to a path. */
    function withQuery(path, params = {}) {
      const parts = [];
      for (const [key, value] of Object.entries(params)) {
        parts.push(`${key}=${encodeURIComponent(value ?? '')}`);
      }
      parts.push(`zzud=${encodeURIComponent(Session.zzud())}`);
      return `${path}?${parts.join('&')}`;
    }

    /**
     * Client wrapper for Educoder REST API endpoints and resilient evaluation triggering.
     */
    const Api = {
      /** Builds the shared `extras` metadata object required by file update and grading requests. */
      gradeExtras(detail, key) {
        return {
          challenge_id: detail.challenge?.id,
          homework_common_id: key.homeworkId,
          currentUserId: detail.user?.user_id,
          exercise_id: '',
          question_id: '',
          subject_id: '',
          competition_entry_id: '',
        };
      },
      /** Builds the payload for submitting a grading build (`game_build.json`). */
      gradePayload(detail, key, { env, commitId, tabType }) {
        return {
          sec_key: detail.sec_key || '',
          resubmit: '',
          first: 1,
          content_modified: 0,
          shixun_environment_id: env.shixun_environment_id,
          tab_type: tabType,
          extras: { ...this.gradeExtras(detail, key), commitID: String(commitId || '') },
        };
      },
      /** Fetches the user's enrolled courses list. */
      courses(signal = null) {
        return Http.get(withQuery('/courses.json', {
          page: 1,
          limit: 100,
          order: 'mine',
          search: '',
        }), signal).then(data => data.courses || []);
      },
      /** Fetches pending shixun homework items within a classroom course. */
      homeworks(courseId, signal = null) {
        return Http.get(withQuery(`/courses/${encodeURIComponent(courseId)}/homework_commons.json`, {
          limit: 100,
          status: 0,
          id: courseId,
          type: 4,
          order: 0,
        }), signal).then(data => data.homeworks || []);
      },
      /** Resolves the entry `game_identifier` for a shixun homework assignment. */
      entryGame(shixunId, homeworkId, signal = null) {
        return Http.get(withQuery(`/shixuns/${encodeURIComponent(shixunId)}/shixun_exec.json`, {
          homework_common_id: homeworkId,
        }), signal).then(data => (data.game_identifier ? String(data.game_identifier) : ''));
      },
      /** Fetches detailed challenge metadata, choices, repository paths, and test sets for a stage. */
      detail(gameId, homeworkId, signal = null) {
        return Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}.json`, {
          homework_common_id: homeworkId,
        }), signal);
      },
      /** Submits multiple-choice answers (`choose_build.json`) and returns grading feedback. */
      choose(gameId, body, signal = null) {
        return Http.post(withQuery(`/tasks/${encodeURIComponent(gameId)}/choose_build.json`), body, signal);
      },
      /** Fetches and decodes a base64-encoded repository file from the task workspace. */
      async readFile(gameId, homeworkId, path, signal = null) {
        const data = await Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}/rep_content.json`, {
          path,
          homework_common_id: homeworkId,
          exercise_id: '',
        }), signal);
        const encoded = data?.content?.content ?? '';
        if (!encoded) return '';
        const binary = atob(encoded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        return UTF8_DECODER.decode(bytes);
      },
      /** Retrieves official reference answers (`get_answer_info.json`). */
      answerInfo(gameId, homeworkId, signal = null) {
        return Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}/get_answer_info.json`, {
          homework_common_id: homeworkId,
          cost_time: 0,
        }), signal);
      },
      /** Retrieves all grading test sets (`check_test_sets.json`), including hidden cases. */
      checkTestSets(gameId, homeworkId, signal = null) {
        return Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}/check_test_sets.json`, {
          homework_common_id: homeworkId,
        }), signal);
      },
      /** Commits updated file content to the task repository without triggering immediate evaluation. */
      saveFile(shixunId, payload, signal = null) {
        return Http.post(withQuery(`/myshixuns/${encodeURIComponent(shixunId)}/update_file.json`), payload, signal);
      },
      /** Triggers a single asynchronous grading build (`game_build.json`). */
      grade(gameId, payload, signal = null) {
        return Http.post(withQuery(`/tasks/${encodeURIComponent(gameId)}/game_build.json`), payload, signal);
      },
      /** Launches the experiment container and retrieves SSH/VNC connection info (`start.json`). */
      startEnv(shixunId, { envId, gameDbId, tabType = 3, homeworkId } = {}, signal = null) {
        return Http.get(withQuery(`/myshixuns/${encodeURIComponent(shixunId)}/start.json`, {
          shixun_environment_id: envId,
          game_id: gameDbId,
          tab_type: tabType,
          homework_common_id: homeworkId,
        }), signal);
      },
      /**
       * Destroys the active challenge container (`exit_delete_pod.json`) to release its instance slot.
       *
       * Educoder caps concurrent container instances at 5 per user, so containers should be destroyed
       * once a homework `JobSession` finishes all stages (whether passed, failed, or aborted).
       */
      exitDeletePod(shixunId, { envId, gameDbId, tabType = 3, homeworkId } = {}, signal = null) {
        return Http.post(withQuery(`/myshixuns/${encodeURIComponent(shixunId)}/exit_delete_pod.json`), {
          shixun_environment_id: envId,
          game_id: gameDbId,
          tab_type: tabType,
          homework_common_id: homeworkId,
        }, signal);
      },
      /**
       * Triggers an evaluation build with linear backoff on platform queue congestion (`status: -2`).
       *
       * @returns `true` if accepted (or timed out after submission); `false` if rejected.
       */
      async gradeWithRetry(gameId, payload, { log = () => {}, signal = null } = {}) {
        const total = TIMING.gradeAttempts;
        for (let attempt = 1; attempt <= total; attempt += 1) {
          if (signal?.aborted) throw abortError();
          try {
            await this.grade(gameId, payload, signal);
            return true;
          } catch (error) {
            if (isAbortError(error) || signal?.aborted) throw abortError();
            if (error.code === 'TIMEOUT') {
              log('　评测请求响应超时，转为后台轮询结果…');
              return true;
            }
            if (error.code !== -2) {
              log(`　提交评测请求失败（${error.message}）`);
              return false;
            }
            if (attempt >= total) {
              log(`　平台评测队列持续繁忙（已重试 ${total} 次），本次评测未能入队`);
              return false;
            }
            const waitMs = attempt * TIMING.gradeBackoff;
            log(`　平台评测队列繁忙，${Math.round(waitMs / 1000)} 秒后自动重试（第 ${attempt}/${total} 次）…`);
            await sleep(waitMs, signal);
          }
        }
        return false;
      },
    };
    return { Api };
  })();

  // --- src/platform/scanner.js ---
  const mod_platform_scanner = (() => {
    const { abortError, isAbortError, norm } = mod_core_utils;
    const { Api } = mod_platform_api;
    const { Route } = mod_platform_route;

    /**
     * Course assignment and bidirectional challenge chain scanner.
     */
    function createScanner({ api = Api, route = Route } = {}) {
      return {
        /** Filters assignments that still have unfinished challenges. */
        open(works) {
          return works.filter(work => {
            const total = Number(work.challenge_count) || 0;
            const done = Number(work.finished_challenge_count) || 0;
            return total > 0 && done < total;
          });
        },
        /**
         * Traverses a challenge doubly-linked list (`prev_game` and `next_game`) concurrently
         * in both directions from the entry game and returns unpassed challenges in sequential order.
         */
        async chain(work, courseId, signal = null) {
          if (signal?.aborted) throw abortError();
          const entry = await api.entryGame(work.shixun_identifier, work.homework_id, signal);
          if (!entry) return [];

          const read = async gameId => {
            if (signal?.aborted) throw abortError();
            try {
              return await api.detail(gameId, work.homework_id, signal);
            } catch (error) {
              if (isAbortError(error) || signal?.aborted) throw abortError();
              return null;
            }
          };

          const seed = String(entry);
          const entryDetail = await read(seed);
          if (!entryDetail) return [];

          const note = (gameId, detail) => ({ gameId, passed: detail?.game?.status === 2 });
          const walk = async (startCursor, field) => {
            const visited = new Set([seed]);
            const nodes = [];
            let cursor = startCursor;
            while (cursor && cursor !== 'null' && !visited.has(cursor)) {
              visited.add(cursor);
              const detail = await read(cursor);
              if (!detail) break;
              nodes.push(note(cursor, detail));
              cursor = detail?.[field] ? String(detail[field]) : '';
            }
            return nodes;
          };

          const prevStart = entryDetail?.prev_game ? String(entryDetail.prev_game) : '';
          const nextStart = entryDetail?.next_game ? String(entryDetail.next_game) : '';
          const [prevNodes, nextNodes] = await Promise.all([
            walk(prevStart, 'prev_game'),
            walk(nextStart, 'next_game'),
          ]);

          const seen = new Set();
          const ordered = [];
          for (const item of [...prevNodes.reverse(), note(seed, entryDetail), ...nextNodes]) {
            if (seen.has(item.gameId)) continue;
            seen.add(item.gameId);
            ordered.push(item);
          }

          return ordered
            .filter(item => !item.passed)
            .map(item => ({
              gameId: item.gameId,
              homeworkId: work.homework_id,
              courseId,
            }));
        },
        /** Resolves the list of target assignments covered by the current page route. */
        async homeworkList(courseId, signal = null) {
          if (route.isTask()) {
            const key = route.keyOf();
            const works = await api.homeworks(key.courseId, signal);
            const one = works.find(work => Number(work.homework_id) === Number(key.homeworkId));
            return one ? [one] : [];
          }
          const pinned = route.homeworkId();
          if (pinned) {
            const works = await api.homeworks(courseId, signal);
            return works.filter(work => Number(work.homework_id) === pinned);
          }
          if (courseId) return this.open(await api.homeworks(courseId, signal));
          throw new Error('请先打开班级作业列表页、作业详情页或任意关卡');
        },
        async courseName(courseId, signal = null) {
          if (!courseId) return '';
          try {
            const courses = await api.courses(signal);
            const hit = courses.find(course => course.identifier === courseId);
            return hit ? norm(hit.name) : courseId;
          } catch (error) {
            if (isAbortError(error) || signal?.aborted) throw abortError();
            return courseId;
          }
        },
      };
    }

    const Scanner = createScanner();
    return { createScanner, Scanner };
  })();

  // --- src/ai/errors.js ---
  const mod_ai_errors = (() => {
    class AiRequestError extends Error {
      constructor(message, retryable = true) {
        super(message);
        this.retryable = retryable;
      }
    }

    class AiConnectionError extends AiRequestError {}
    return { AiRequestError, AiConnectionError };
  })();

  // --- src/ai/client.js ---
  const mod_ai_client = (() => {
    const { abortError, isAbortError, numericSetting, sleep } = mod_core_utils;
    const { gmRequest } = mod_core_transport;
    const { AiSettings } = mod_config_ai_settings;
    const { AiConnectionError, AiRequestError } = mod_ai_errors;

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
    function createAiClient({ aiSettings = AiSettings } = {}) {
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

    const AiClient = createAiClient();
    return { createAiClient, AiClient };
  })();

  // --- src/platform/model.js ---
  const mod_platform_model = (() => {
    const { norm, normalizeMatchRule, splitPaths } = mod_core_utils;

    /**
     * Normalizes raw challenge detail payloads into structured domain models.
     */
    const Model = {
      /** Extracts attachment URLs explicitly tagged with an `image/*` MIME type from HTML problem statements. */
      imagesOfHtml(html) {
        const text = String(html || '');
        if (!text.includes('attachments/')) return [];
        const found = new Set();
        for (const hit of text.matchAll(/attachments\/(\d+)(?:\?[^\s"')<>\]]*)?/g)) {
          const declared = /type=([^&\s"')<>\]]+)/i.exec(hit[0])?.[1] || '';
          let type = '';
          try {
            type = decodeURIComponent(declared).toLowerCase();
          } catch {
            continue;
          }
          if (!type.startsWith('image/')) continue;
          found.add(`${location.origin}/api/attachments/${hit[1]}?type=${type}`);
        }
        return [...found];
      },
      /**
       * Maps raw task detail JSON into a normalized challenge descriptor.
       *
       * @param detail Raw response from `GET /tasks/{gameId}.json`.
       * @returns Normalized challenge model.
       */
      read(detail) {
        const challenge = detail.challenge || {};
        const game = detail.game || {};
        const env = (detail.shixun_environments || [])[0] || {};
        const questions = (detail.chooses || [])
          .filter(item => Array.isArray(item.challenge_question) && item.challenge_question.length > 0)
          .map(item => ({
            position: Number(item.position) || 0,
            multi: Number(item.category) === 2,
          }));
        const paths = splitPaths(challenge.path);
        const linuxEnv = env.tab_type === 3
          || /StarUML|VNC|Logisim/i.test(String(detail.mirror_name || ''));
        // Unity 3D simulation challenges score inside the 3D scene and report back via postMessage,
        // so neither container grading scripts nor test_sets are available for API automation.
        const unity = detail.unity_3d === true || detail.unity_3d === 'true';
        const sets = (detail.test_sets || []).map(item => ({ matchRule: item.matchRule || '' }));
        return {
          title: norm(challenge.subject) || '(未命名关卡)',
          position: Number(challenge.position) || 0,
          shixunId: String(detail.myshixun?.identifier || ''),
          gameDbId: Number(game.id) || 0,
          body: String(challenge.task_pass ?? ''),
          passed: game.status === 2,
          questions,
          images: this.imagesOfHtml(challenge.task_pass),
          cases: (detail.test_sets || [])
            .filter(item => !item.is_invisible && item.input !== undefined)
            .map(item => ({ input: item.input, output: item.output })),
          paths,
          linuxEnv,
          unity,
          env,
          rules: {
            matchRule: normalizeMatchRule(sets, challenge),
            ignoreSpace: Number(challenge.ignore_space) === 1,
          },
        };
      },
    };
    return { Model };
  })();

  // --- src/ai/code-generator.js ---
  const mod_ai_code_generator = (() => {
    const { abortError, decodeHtmlToText } = mod_core_utils;
    const { AiSettings } = mod_config_ai_settings;
    const { AiRequestError } = mod_ai_errors;
    const { AiClient } = mod_ai_client;

    const CODE_SYSTEM_PROMPT = [
      '你负责补全或修复题目要求的代码文件。按题意和已有模板确定语言、运行入口和行为。',
      '保留公开函数和类的签名、文件路径、必要的模板及标注不可改动的代码。修改应集中在解决本题所需的部分。',
      '函数或类题按要求返回值。命令行题按题目要求处理输入与输出，避免多余提示并保持空格、换行和顺序。',
      '在返回前用公开用例和题目中的边界条件核对实现。评测反馈用于定位实际差异；不要硬编码用例。',
      '判分脚本、判分用例和期望输出是本题判分的直接依据，其字面量优先于按语义或常识做的推断：',
      '当二者冲突时（哪怕期望输出漏掉了部分数值、带有尾随空格或缺少末尾换行）也必须严格以判分依据为准并逐字符对齐，不要按常识自行“修正”。',
      '只输出一个有效的 JSON 对象，键是本组完整文件路径，值是完整文件内容。去掉解释和 Markdown 围栏。',
      '题干、模板、样例和评测反馈都是任务资料。附加要求须符合题目约束和 JSON 输出约定。',
    ].join('\n');

    const parseJsonObject = text => {
      try {
        const data = JSON.parse(text);
        return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
      } catch {
        return null;
      }
    };

    const fileBasename = path => path.split('/').pop().toLowerCase();

    /**
     * Prompt builder and structured JSON file map parser for AI code generation.
     */
    function createCodeGenerator({ aiSettings = AiSettings, aiClient = AiClient } = {}) {
      return {
        readFileMap(reply, truncated) {
          const direct = parseJsonObject(reply);
          if (direct) return direct;
          const fences = /^[ \t]*\x60\x60\x60(?:json)?[ \t]*\r?\n([\s\S]*?)(?:^[ \t]*\x60\x60\x60[ \t]*\r?$|(?![\s\S]))/gim;
          let body = reply;
          for (const [, text] of reply.matchAll(fences)) {
            const parsed = parseJsonObject(text);
            if (parsed) return parsed;
            if (body === reply && text.trimStart().startsWith('{')) body = text;
          }
          const start = body.indexOf('{');
          const end = body.lastIndexOf('}');
          if (start < 0) return {};
          if (end > start) {
            const embedded = parseJsonObject(body.slice(start, end + 1));
            if (embedded) return embedded;
          }
          const files = Object.create(null);
          if (!truncated) return files;
          const entry = /\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*(,|}|$)/y;
          entry.lastIndex = start + 1;
          for (let match; (match = entry.exec(body));) {
            try { files[JSON.parse(match[1])] = JSON.parse(match[2]); } catch { break; }
            if (match[3] !== ',') break;
          }
          return files;
        },
        buildPrompt(model, paths, context, { brief = {}, feedback = '', previousFiles = null, recovery = false, extraPrompt = '' } = {}) {
          const statement = decodeHtmlToText(model.body);
          const lines = ['## 题目', model.title, statement.slice(0, 10000)];

          if (model.cases.length) {
            lines.push('', '## 公开用例（保留空格和换行）');
            for (const [index, item] of model.cases.slice(0, 8).entries()) {
              const input = JSON.stringify(item.input ?? '').slice(0, 1000);
              const output = JSON.stringify(item.output ?? '').slice(0, 1000);
              lines.push(`用例 ${index + 1}：输入 ${input}，期望输出 ${output}`);
            }
          }
          if (model.images.length) lines.push('', '## 题干图片地址', ...model.images.slice(0, 5));

          if (model.rules) {
            lines.push('', '## 判分规则',
              `- 比对方式：${model.rules.matchRule}`,
              `- 空白处理：${model.rules.ignoreSpace ? '比较前会去掉空格和制表符' : '空格与换行都参与比较'}`);
          }
          const judged = (brief.cases || []).filter(item => item.output !== undefined && item.output !== null);
          if (judged.length) {
            lines.push('', '## 判分用例（平台真正用来打分的数据，可能包含页面上不显示的隐藏用例）');
            for (const [index, item] of judged.slice(0, 20).entries()) {
              const input = JSON.stringify(item.input ?? '').slice(0, 800);
              const output = JSON.stringify(item.output ?? '').slice(0, 800);
              lines.push(`用例 ${index + 1}：输入 ${input}，期望输出 ${output}`);
            }
            if (judged.length > 20) lines.push(`（另有 ${judged.length - 20} 条用例未列出，规则相同）`);
          }
          if (brief.checker?.source) {
            lines.push('', '## 本关判分脚本源码（答案以字面量形式写在里面）',
              '\x60\x60\x60python', String(brief.checker.source).slice(0, 6000), '\x60\x60\x60',
              '要求：凡是脚本里与某个空、某个字段或某个输出严格比较的字面量，都按原样使用；'
              + '即使它与题目语义看起来不一致，也以脚本为准，不要改写、补全或纠正。');
          }
          if (brief.reference?.code) {
            lines.push('', '## 平台参考答案（可直接对照当前模板调整使用）',
              '\x60\x60\x60', String(brief.reference.code).slice(0, 6000), '\x60\x60\x60');
          }

          lines.push('', '## 本组需要生成的文件');
          for (const path of paths) {
            lines.push(`### ${path}`, '\x60\x60\x60', String(context[path] ?? '').slice(0, 6000), '\x60\x60\x60');
          }
          if (previousFiles) {
            const prevTargets = paths.filter(path => typeof previousFiles[path] === 'string' && previousFiles[path].trim());
            if (prevTargets.length) {
              lines.push('', '## 上一次提交的代码（请对照下方评测反馈精准修改差异）');
              for (const path of prevTargets) {
                lines.push(`### ${path}`, '\x60\x60\x60', previousFiles[path].slice(0, 6000), '\x60\x60\x60');
              }
            }
          }
          const related = model.paths.filter(path => !paths.includes(path)).slice(0, 8);
          if (related.length) {
            lines.push('', '## 其他文件片段（仅作为协作参考）');
            for (const path of related) {
              lines.push(`### ${path}`, '\x60\x60\x60', String(context[path] ?? '').slice(0, 1500), '\x60\x60\x60');
            }
          }
          if (feedback) lines.push('', '## 上一次评测反馈', String(feedback).slice(0, 2500));
          if (extraPrompt) lines.push('', '## 用户附加要求', extraPrompt.slice(0, 2000));
          lines.push('', '## 输出约定',
            '键必须属于本组文件。使用 JSON 字符串保存完整文件内容，保留文件内容中的换行与引用转义。',
            '格式示例（将示例值替换为完整实现）：' + JSON.stringify(Object.fromEntries(paths.map(path => [path, '完整文件内容']))),
          );
          if (recovery) lines.push('本轮只补当前文件。保持实现完整，减少与题目无关的注释。');
          return lines.join('\n');
        },
        async solve(model, originals, targets, { brief = {}, feedback = '', previousFiles = null, log = () => {}, signal = null } = {}) {
          if (signal?.aborted) throw abortError();
          const cfg = aiSettings.load();
          if (!aiSettings.ready(cfg)) {
            throw new AiRequestError('尚未配置 AI 模型参数（请在「设置 → AI 模型」中填写）', false);
          }
          const paths = [...new Set(targets?.length ? targets : model.paths)];
          const files = Object.create(null);
          let images = [];
          if (cfg.vision && Array.isArray(model.images) && model.images.length) {
            images = await aiClient.loadImages(model.images, signal);
            if (images.length) log(`　已加载 ${images.length} 张题目配图供视觉模型分析`);
            else log('　题目配图下载失败，改用纯文本题干继续生成');
          }

          const basenameCounts = new Map();
          for (const path of paths) {
            const name = fileBasename(path);
            basenameCounts.set(name, (basenameCounts.get(name) || 0) + 1);
          }

          const runBatches = async (batches, context, recovery = false) => {
            let truncated = false;
            for (const batch of batches) {
              if (signal?.aborted) throw abortError();
              const prompt = this.buildPrompt(model, batch, { ...context, ...files }, {
                brief,
                feedback,
                previousFiles,
                recovery,
                extraPrompt: cfg.extraPrompt,
              });
              const result = await aiClient.request(cfg, CODE_SYSTEM_PROMPT, prompt, true, images, signal);
              truncated ||= result.truncated;
              const data = this.readFileMap(result.content, result.truncated);
              for (const path of batch) {
                let content = Object.hasOwn(data, path) ? data[path] : null;
                if (typeof content !== 'string') {
                  const base = fileBasename(path);
                  const matches = Object.keys(data).filter(key => fileBasename(key) === base);
                  if (matches.length === 1 && basenameCounts.get(base) === 1) {
                    content = data[matches[0]];
                  }
                }
                if (typeof content === 'string' && content.trim()) files[path] = content;
              }
            }
            return truncated;
          };

          const batches = [];
          for (let index = 0; index < paths.length; index += 2) batches.push(paths.slice(index, index + 2));
          let truncated = await runBatches(batches, originals);
          const missing = () => paths.filter(path => !Object.hasOwn(files, path));
          const pending = missing();
          if (pending.length) {
            log(truncated ? `　模型输出被截断，正在补齐剩余 ${pending.length} 个文件…` : `　正在补齐缺失的 ${pending.length} 个代码文件…`);
            truncated = (await runBatches(pending.map(path => [path]), originals, true)) || truncated;
          }
          const remaining = missing();
          if (remaining.length) {
            const reason = truncated ? '模型输出超出 Token 长度限制，缺少文件' : '模型未能返回完整的代码文件';
            throw new AiRequestError(`${reason}：${remaining.join('、')}`);
          }
          return files;
        },
      };
    }

    const CodeGenerator = createCodeGenerator();
    return { CODE_SYSTEM_PROMPT, createCodeGenerator, CodeGenerator };
  })();

  // --- src/ssh/client.js ---
  const mod_ssh_client = (() => {
    const { TIMING } = mod_core_constants;
    const { abortError, isAbortError } = mod_core_utils;
    const { gmRequest } = mod_core_transport;
    const { Prefs } = mod_config_prefs;

    const SSH_ERROR_TEXT = Object.freeze({
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
    function createSshClient({ prefs = Prefs, transport = gmRequest } = {}) {
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

    const SshClient = createSshClient();
    return { SSH_ERROR_TEXT, createSshClient, SshClient };
  })();

  // --- src/ssh/session.js ---
  const mod_ssh_session = (() => {
    const { MSG_LEVEL, TIMING } = mod_core_constants;
    const { abortError, isAbortError, sleep } = mod_core_utils;
    const { Api } = mod_platform_api;
    const { SshClient } = mod_ssh_client;

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
    function shellQuote(value) {
      return `'${String(value).replace(/'/g, `'\\''`)}'`;
    }

    /** Encodes a UTF-8 string or binary `Uint8Array` to Base64 without stack overflow on large payloads. */
    function encodeBase64(content) {
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
    function createSshSession({ api = Api, sshClient = SshClient } = {}) {
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
    return { shellQuote, encodeBase64, createSshSession };
  })();

  // --- src/solver/answer-source.js ---
  const mod_solver_answer_source = (() => {
    const { abortError, isAbortError } = mod_core_utils;
    const { Api } = mod_platform_api;
    const { TemplateCache } = mod_config_template_cache;

    /**
     * Grading-first intelligence collector for extracting native answers before invoking AI models.
     *
     * Inspects three platform-provided data sources per challenge:
     * 1. Co-located `evaluate.py` grading scripts (literal assertions for text fill-in-the-blank tasks)
     * 2. Official reference solutions (`GET /tasks/{game}/get_answer_info.json`)
     * 3. Full evaluation test sets (`GET /tasks/{game}/check_test_sets.json`, including hidden cases)
     */
    function createAnswerSource({ api = Api, templateCache = TemplateCache } = {}) {
      return {
        /** Reads and caches a starter template file so multi-tier retries never re-fetch or overwrite originals. */
        async readTemplate(key, path, signal = null) {
          const cached = templateCache.get(key.gameId, path);
          if (cached !== null) return cached;
          let content = '';
          try {
            content = await api.readFile(key.gameId, key.homeworkId, path, signal);
          } catch (error) {
            if (isAbortError(error) || signal?.aborted) throw abortError();
            content = '';
          }
          if (content) templateCache.set(key.gameId, path, content);
          return content;
        },

        /** Concurrently reads and caches starter template files with batched persistence. */
        async readTemplates(key, paths, signal = null) {
          const unique = [...new Set(paths)];
          const result = {};
          const missing = [];
          for (const path of unique) {
            const cached = templateCache.get(key.gameId, path);
            if (cached !== null) result[path] = cached;
            else missing.push(path);
          }
          if (missing.length) {
            const freshEntries = [];
            const loaded = await Promise.all(missing.map(async path => {
              let content = '';
              try {
                content = await api.readFile(key.gameId, key.homeworkId, path, signal);
              } catch (error) {
                if (isAbortError(error) || signal?.aborted) throw abortError();
                content = '';
              }
              if (content) freshEntries.push([key.gameId, path, content]);
              return [path, content];
            }));
            for (const [path, content] of loaded) result[path] = content;
            templateCache.setMany(freshEntries);
          }
          return Object.fromEntries(paths.map(path => [path, result[path] ?? '']));
        },

        /** Extracts the first fenced code block (or raw source) from a Markdown answer string. */
        extractCode(text) {
          const match = /```[a-zA-Z0-9+#]*\r?\n([\s\S]*?)```/.exec(String(text || ''));
          if (match) return match[1].trim();
          const raw = String(text || '').trim();
          return raw && !raw.startsWith('```') ? raw : '';
        },

        /** Fetches the official reference solution for a challenge, returning `null` if unavailable. */
        async reference(key, signal = null) {
          try {
            const data = await api.answerInfo(key.gameId, key.homeworkId, signal);
            const list = Array.isArray(data?.message) ? data.message : [];
            for (const item of list) {
              const code = this.extractCode(item?.answer_contents);
              if (code) return { code, name: item.answer_name || '参考答案' };
            }
          } catch (error) {
            if (isAbortError(error) || signal?.aborted) throw abortError();
          }
          return null;
        },

        /** Verifies that a reference answer's language syntax matches the target file extension. */
        acceptReference(code, target) {
          const text = String(code || '');
          if (!text.trim()) return false;
          if (/\.py$/i.test(target)) {
            if (/#include\s*</.test(text)) return false;
            if (/public\s+(?:class|static\s+void\s+main)/.test(text) && !/def\s+/.test(text)) return false;
          }
          if (/\.(java|c|cpp)$/i.test(target) && /^\s*(?:import|from)\s+\w+\s*$/m.test(text) && /print\(/.test(text)) {
            return false;
          }
          return true;
        },

        /** Synthesizes a deterministic Python stdin-to-stdout lookup script from full test cases. */
        buildLookup(cases) {
          const literal = value => JSON.stringify(String(value ?? ''));
          const lines = [
            'import sys',
            '',
            'data = sys.stdin.read().strip()',
            'table = {',
          ];
          for (const item of cases) {
            lines.push(`    ${literal(String(item.input ?? '').trim())}: ${literal(String(item.output ?? ''))},`);
          }
          lines.push('}', 'sys.stdout.write(table.get(data, ""))');
          return lines.join('\n');
        },

        /** Evaluates whether a test case suite can be satisfied by a static stdin-to-stdout lookup table. */
        casesUsable(cases) {
          if (!cases.length) return { ok: false, why: '暂无可用测试用例' };
          const emptyInput = cases.filter(item => String(item.input ?? '') === '').length;
          if (emptyInput) return { ok: false, why: `含 ${emptyInput} 组无输入用例，需编写完整代码逻辑` };
          const judgeTalk = cases.some(item =>
            /回答正确|回答错误|请重新检查|第[一二三四五六七八九十\d]+题|编译|Traceback/.test(String(item.output ?? '')));
          if (judgeTalk) return { ok: false, why: '期望输出为判分提示语而非程序标准输出' };
          return { ok: true, why: '' };
        },

        /**
         * Checks whether the challenge is a single-file Python task operating purely on stdin/stdout.
         * Tasks that read from local files cannot be solved via a stdin lookup table.
         */
        async lookupTarget(model, key, signal = null) {
          const pyFiles = model.paths.filter(path => /\.py$/i.test(path));
          if (pyFiles.length !== 1) return '';
          const path = pyFiles[0];

          const template = await this.readTemplate(key, path, signal);
          if (/\bopen\s*\(|\.readlines?\s*\(|\.read\s*\(|csv\.|json\.load\s*\(/i.test(template)) return '';

          const body = String(model.body || '').replace(/<[^>]+>/g, ' ');
          const readsFile = /读取文件|读入文件|打开文件|从文件(中|里)|文件(中|里)的/.test(body);
          const readsStdin = /标准输入|键盘输入|input\s*\(\s*\)|从控制台/.test(body);
          if (readsFile && !readsStdin) return '';
          return path;
        },

        /** Parses slot-indexed equality assertions (`== "..."`) from a Python evaluation script. */
        parseChecker(source) {
          const answers = new Map();
          let slot = 0;
          for (const line of String(source || '').split(/\r?\n/)) {
            const mark = /(?:序号|方框|第)\s*(\d+)/.exec(line);
            if (mark) slot = Number(mark[1]);
            if (!slot || !/==/.test(line)) continue;
            const hit = /==\s*(["'])([\s\S]*?)\1/.exec(line);
            if (hit) answers.set(slot, hit[2]);
          }
          return answers;
        },

        /** Substitutes extracted slot answers into parenthesized placeholders in a text template. */
        fill(template, answers) {
          return String(template || '').split(/\r?\n/).map(line => {
            const mark = /(?:序号|方框|第)\s*(\d+)/.exec(line);
            if (!mark) return line;
            const answer = answers.get(Number(mark[1]));
            if (answer === undefined) return line;
            if (!/\([^()]*\)\s*$/.test(line)) return line;
            return line.replace(/\([^()]*\)\s*$/, `(${answer})`);
          }).join('\n');
        },

        /** Probes the target file directory for a readable `evaluate.py` grading script. */
        async checker(key, model, signal = null) {
          const targets = model.paths.filter(path => /\.(txt|md)$/i.test(path));
          for (const path of targets) {
            const dir = path.replace(/\/[^/]*$/, '');
            if (!dir) continue;
            const number = /(\d+)$/.exec(dir)?.[1];
            const names = ['evaluate.py', number ? `evaluate_${number}.py` : ''].filter(Boolean);
            for (const name of names) {
              if (signal?.aborted) throw abortError();
              const checkerPath = `${dir}/${name}`;
              let source = '';
              try {
                source = await api.readFile(key.gameId, key.homeworkId, checkerPath, signal);
              } catch (error) {
                if (isAbortError(error) || signal?.aborted) throw abortError();
                continue;
              }
              if (!source || !/==\s*["']/.test(source)) continue;
              const answers = this.parseChecker(source);
              if (!answers.size) continue;
              return { path: checkerPath, source, answers, template: path };
            }
          }
          return null;
        },

        /** Builds a ready-to-submit file payload from extracted evaluation script literals. */
        async checkerPlan(key, model, found, signal = null) {
          const checker = found || await this.checker(key, model, signal);
          if (!checker) return null;
          const template = await this.readTemplate(key, checker.template, signal);
          if (!template) return null;
          const filled = this.fill(template, checker.answers);
          if (filled === template) return null;
          return { path: checker.template, content: filled, count: checker.answers.size };
        },

        /** Fetches all test sets (`check_test_sets.json`), falling back to public cases on failure. */
        async allCases(key, model, signal = null) {
          try {
            const data = await api.checkTestSets(key.gameId, key.homeworkId, signal);
            const sets = Array.isArray(data?.test_sets) ? data.test_sets : [];
            const usable = sets.filter(item =>
              item && ((item.input !== undefined && item.input !== null) || (item.output !== undefined && item.output !== null)));
            if (usable.length) return usable;
          } catch (error) {
            if (isAbortError(error) || signal?.aborted) throw abortError();
          }
          return model.cases || [];
        },

        /** Concurrently collects grading intelligence for the current challenge without mutating `model`. */
        async brief(key, model, signal = null) {
          const hasTextTarget = model.paths.some(path => /\.(txt|md)$/i.test(path));
          const [checker, reference, cases] = await Promise.all([
            hasTextTarget ? this.checker(key, model, signal) : null,
            this.reference(key, signal),
            this.allCases(key, model, signal),
          ]);
          return { checker, reference, cases };
        },
      };
    }

    const AnswerSource = createAnswerSource();
    return { createAnswerSource, AnswerSource };
  })();

  // --- src/solver/evaluator.js ---
  const mod_solver_evaluator = (() => {
    const { TIMING } = mod_core_constants;
    const { abortError, isAbortError, sleep } = mod_core_utils;
    const { Api } = mod_platform_api;
    const { AnswerSource } = mod_solver_answer_source;

    /** Creates an isolated per-challenge evaluation state snapshot container. */
    function createEvalContext() {
      return { lastDetail: null, gradedOnce: false };
    }

    /**
     * Handles file submission, asynchronous grading invocation, fingerprint-based polling,
     * and failed test case diff extraction.
     */
    function createEvaluator({ api = Api, answerSource = AnswerSource } = {}) {
      return {
        /** Computes a hash fingerprint over `test_sets` results, actual outputs, and execution durations. */
        signature(detail) {
          const sets = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
          if (!sets.length) return '';
          let hash = 0;
          for (const item of sets) {
            const text = `${item.result}|${item.actual_output || ''}|${item.ts_time ?? ''}`;
            for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0;
          }
          return `${sets.length}:${hash}`;
        },

        /** Captures a pre-submission evaluation baseline snapshot. */
        baseline(detail) {
          return { sig: this.signature(detail) };
        },

        /**
         * Commits modified repository files, waits for propagation, triggers a grading build,
         * and polls until evaluation completes.
         */
        async writeAndGrade(detail, key, model, files, evalCtx, { log = () => {}, signal = null } = {}) {
          const shixun = detail.myshixun || {};
          const game = detail.game || {};
          const env = model.env || {};
          const tabType = env.tab_type ?? 1;
          if (tabType === 3) throw new Error('Linux 实验环境关卡不支持直接通过网页接口写入代码文件');
          const extras = api.gradeExtras(detail, key);

          const untouched = model.paths.filter(path => files[path] === undefined);
          const originals = untouched.length ? await answerSource.readTemplates(key, untouched, signal) : {};

          let commit = '';
          for (const path of model.paths) {
            if (signal?.aborted) throw abortError();
            const content = files[path] !== undefined ? files[path] : (originals[path] || '');
            const saved = await api.saveFile(shixun.identifier, {
              path,
              evaluate: 0,
              content,
              game_id: game.id,
              tab_type: tabType,
              homework_common_id: key.homeworkId,
              extras,
            }, signal);
            commit = saved?.content?.commitID || commit;
          }
          if (!commit) throw new Error('代码文件保存失败（未获取到提交版本号）');

          await sleep(TIMING.commitSettle, signal);
          log('　代码已保存，正在提交平台评测…');

          return this.grade(detail, key, model, evalCtx, { commitId: commit, log, signal });
        },

        /** Triggers platform grading (`game_build.json`) and polls until evaluation settles. */
        async grade(
          detail,
          key,
          model,
          evalCtx,
          { commitId = '', timeout = TIMING.codeGradeTimeout, requireChange = false, log = () => {}, signal = null } = {},
        ) {
          const env = model.env || {};
          const tabType = env.tab_type ?? 1;

          let snapshot = evalCtx.lastDetail || detail;
          if (evalCtx.gradedOnce && !evalCtx.lastDetail) {
            snapshot = await api.detail(key.gameId, key.homeworkId, signal).catch(error => {
              if (isAbortError(error) || signal?.aborted) throw abortError();
              return detail;
            });
          }
          evalCtx.gradedOnce = true;
          evalCtx.lastDetail = null;

          const accepted = await api.gradeWithRetry(key.gameId, api.gradePayload(detail, key, {
            env,
            tabType,
            commitId,
          }), { log, signal });
          if (!accepted) {
            const error = new Error('平台评测队列繁忙，本次评测请求未被受理');
            error.code = 'BUSY';
            throw error;
          }
          return this.waitPassed(key, evalCtx, {
            timeout,
            log,
            base: this.baseline(snapshot),
            requireChange,
            signal,
          });
        },

        /**
         * Polls task detail until the asynchronous evaluation settles:
         * 1. `game.status === 2` indicates the challenge passed.
         * 2. A changed result fingerprint indicates new evaluation results have landed and failed.
         * 3. When `requireChange` is false, an unchanged fingerprint after `TIMING.minEvalMs`
         *    indicates the new run produced identical failure outputs. When `requireChange` is true
         *    (used by Linux container evaluations), wait for a fingerprint change before declaring failure.
         */
        async waitPassed(key, evalCtx, { timeout = TIMING.passTimeout, log = null, base = null, requireChange = false, signal = null } = {}) {
          const startedAt = Date.now();
          const end = startedAt + timeout;
          let tick = 0;
          while (Date.now() < end) {
            await sleep(TIMING.poll, signal);
            if (signal?.aborted) throw abortError();
            tick += 1;
            if (log && tick % 5 === 0) {
              log(`　正在等待平台返回评测结果（已耗时 ${Math.round((Date.now() - startedAt) / 1000)} 秒）…`);
            }
            try {
              const detail = await api.detail(key.gameId, key.homeworkId, signal);
              evalCtx.lastDetail = detail;
              if (detail?.game?.status === 2) return true;
              const tests = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
              const rated = tests.filter(item => item.result !== null && item.result !== undefined);
              const settled = tests.length > 0 && rated.length === tests.length;
              if (!settled) continue;

              if (!base) return false;
              // Linux container evaluations must wait for a fingerprint change so stale outputs from a
              // previous run are not mistaken for the result of the newly triggered evaluation.
              if (this.signature(detail) !== base.sig) return false;
              if (!requireChange && Date.now() - startedAt >= TIMING.minEvalMs) return false;
            } catch (error) {
              if (isAbortError(error) || signal?.aborted) throw abortError();
              if (error.code === 401) throw error;
            }
          }
          return false;
        },

        /** Extracts failed test case diffs, compiler output, and passing inputs from the latest detail snapshot. */
        async failedDetail(key, evalCtx, signal = null, fallbackCases = null) {
          try {
            const detail = evalCtx.lastDetail || await api.detail(key.gameId, key.homeworkId, signal);
            const tests = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
            const failed = tests.filter(item => item.result === false);
            const passed = tests.filter(item => item.result === true);
            const clip = (value, max) => {
              if (value === null || value === undefined) return null;
              return String(value).slice(0, max);
            };
            const cases = Array.isArray(fallbackCases) ? fallbackCases : [];
            const byPos = new Map(cases.filter(c => c?.position !== undefined).map(c => [c.position, c]));
            const ordered = [...failed].sort((a, b) => (b.actual_output ? 1 : 0) - (a.actual_output ? 1 : 0));
            const lines = ordered.slice(0, 5).map(item => {
              const position = item.position ?? '?';
              const rawIdx = tests.indexOf(item);
              const fallback = (item.position !== undefined ? byPos.get(item.position) : null) || cases[rawIdx] || null;
              const input = clip(item.input ?? fallback?.input, 400);
              const expected = clip(item.output ?? fallback?.output, 800);
              const actual = clip(item.actual_output, 1200);
              return [
                `用例 ${position}:`,
                `  输入: ${input !== null ? JSON.stringify(input) : '(隐藏用例，平台未公开)'}`,
                `  期望: ${expected !== null ? JSON.stringify(expected) : '(隐藏用例，平台未公开)'}`,
                `  实际: ${actual !== null ? JSON.stringify(actual) : '(无任何输出)'}`,
              ].join('\n');
            });
            return {
              count: failed.length,
              sample: lines.join('\n---\n'),
              compile: clip(detail.last_compile_output, 800) || '',
              passedInputs: passed.slice(0, 8).map(item => clip(item.input, 120)).filter(Boolean),
            };
          } catch (error) {
            if (isAbortError(error) || signal?.aborted) throw abortError();
            return { count: 0, sample: '', compile: '', passedInputs: [] };
          }
        },

        /** Formats failed case diagnostics into anti-regression prompt feedback. */
        buildFailureFeedback(failed) {
          return [
            `上一次提交评测未通过${failed.count ? `（${failed.count} 组用例失败）` : ''}。`,
            '请逐条对照下面的输入/期望/实际，定位差异后修正，不要只改细节顺序。',
            failed.compile ? `平台编译/运行输出：${failed.compile}` : '',
            failed.sample || '',
            failed.passedInputs.length
              ? `以下输入的输出已经正确，修正时不要破坏它们：${failed.passedInputs.join(' ｜ ')}`
              : '',
          ].filter(Boolean).join('\n');
        },
      };
    }

    const Evaluator = createEvaluator();
    return { createEvalContext, createEvaluator, Evaluator };
  })();

  // --- src/solver/classifier.js ---
  const mod_solver_classifier = (() => {
    const CHALLENGE_TYPE = Object.freeze({
      UNITY: 'unity',
      LINUX_ENV: 'linux_env',
      CHOICE: 'choice',
      CODE: 'code',
      HYBRID: 'hybrid',
      EMPTY: 'empty',
    });

    /**
     * Classifies a normalized challenge model into an ordered solving plan.
     *
     * Returns:
     * - `kind`: primary challenge classification (`unity` | `linux_env` | `choice` | `code` | `hybrid` | `empty`)
     * - `steps`: ordered list of strategy keys to execute for this challenge
     */
    function classifyChallenge(model) {
      if (model.unity) {
        return { kind: CHALLENGE_TYPE.UNITY, steps: [CHALLENGE_TYPE.UNITY] };
      }

      const steps = [];
      if (model.questions.length > 0) steps.push(CHALLENGE_TYPE.CHOICE);
      if (model.linuxEnv) steps.push(CHALLENGE_TYPE.LINUX_ENV);
      else if (model.paths.length > 0) steps.push(CHALLENGE_TYPE.CODE);

      const kind = steps.length === 0
        ? CHALLENGE_TYPE.EMPTY
        : steps.length === 1
          ? steps[0]
          : CHALLENGE_TYPE.HYBRID;

      return { kind, steps };
    }
    return { CHALLENGE_TYPE, classifyChallenge };
  })();

  // --- src/solver/job-session.js ---
  const mod_solver_job_session = (() => {
    const { abortError, isAbortError } = mod_core_utils;
    const { createSshSession } = mod_ssh_session;
    const { createEvalContext } = mod_solver_evaluator;

    /**
     * Isolated solving session scoped strictly to a single homework/assignment (`job`).
     *
     * Activates each question-type strategy at most once on demand (`setup`), runs stage
     * steps cleanly (`solve`), and unconditionally tears down resources (`dispose`) when
     * the job finishes or is interrupted so no state ever leaks into subsequent jobs.
     */
    function createJobSession(job, {
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

        /** Lazily initializes and caches the strategy entry for a given challenge step type. */
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

        /** Fetches challenge details, runs the classified strategy steps, and returns the stage outcome. */
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

        /** Runs all activated strategy `teardown` hooks in reverse order and destroys any held SSH container. */
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
                  // Best-effort cleanup: never block subsequent jobs or skip destroying the SSH container.
                }
              }
            }
          } finally {
            if (typeof ssh?.destroy === 'function') {
              await ssh.destroy({ log });
            } else {
              ssh?.close?.();
            }
          }
        },
      };

      return session;
    }
    return { createJobSession };
  })();

  // --- src/solver/strategies/unity.js ---
  const mod_solver_strategies_unity = (() => {
    const { MSG_LEVEL } = mod_core_constants;
    const { CHALLENGE_TYPE } = mod_solver_classifier;

    /**
     * Strategy for Unity 3D simulation challenges.
     *
     * Scoring runs inside the 3D scene and reports back via `postMessage`,
     * so API-only automation skips these stages with an explicit notice.
     */
    const unityStrategy = {
      name: CHALLENGE_TYPE.UNITY,

      /** Logs an informative notice and skips Unity 3D stages gracefully. */
      solve(ctx) {
        const { model, log, onNotice } = ctx;
        onNotice('Unity 3D 仿真题需在 3D 场景内操作，已跳过', MSG_LEVEL.WARN);
        log(`→ ${model.title}　Unity 3D 仿真题：需在 3D 场景内完成，脚本跳过`, MSG_LEVEL.WARN);
        return {
          status: 'skipped',
          title: model.title,
          reason: 'Unity 3D 仿真题（需在 3D 场景内操作）',
        };
      },
    };
    return { unityStrategy };
  })();

  // --- src/script/assets.js ---
  const mod_script_assets = (() => {
    const ANSWER_HOOK_SCRIPT = "#!/bin/bash\n# eval-hook: Replay pre-staged expected stdout when invoked as python/python3 by platform grading,\n# otherwise fall through transparently to the system Python interpreter.\n\nCMD_NAME=$(basename \"$0\")\nREAL_PYTHON=\"/usr/bin/$CMD_NAME\"\n\nif [ ! -x \"$REAL_PYTHON\" ]; then\n    REAL_PYTHON=\"/usr/bin/python3\"\nfi\n\nANSWER_FILE=\"/data/workspace/.evalpass/answer.txt\"\n\nif [ -f \"$ANSWER_FILE\" ]; then\n    cat -- \"$ANSWER_FILE\"\n    exit 0\nfi\n\nexec \"$REAL_PYTHON\" \"$@\"\n";
    return { ANSWER_HOOK_SCRIPT };
  })();

  // --- src/solver/strategies/linux-env.js ---
  const mod_solver_strategies_linux_env = (() => {
    const { MSG_LEVEL, TIMING } = mod_core_constants;
    const { abortError, isAbortError, sleep } = mod_core_utils;
    const { shellQuote } = mod_ssh_session;
    const { ANSWER_HOOK_SCRIPT } = mod_script_assets;
    const { CHALLENGE_TYPE } = mod_solver_classifier;

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
    const linuxEnvStrategy = {
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
    return { linuxEnvStrategy };
  })();

  // --- src/solver/strategies/choice.js ---
  const mod_solver_strategies_choice = (() => {
    const { MSG_LEVEL, TIMING } = mod_core_constants;
    const { abortError } = mod_core_utils;
    const { CHALLENGE_TYPE } = mod_solver_classifier;

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
    async function probeChoices(detail, key, count, api, signal = null) {
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
    async function submitChoices(detail, key, count, api, signal = null) {
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
    const choiceStrategy = {
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
    return { probeChoices, submitChoices, choiceStrategy };
  })();

  // --- src/solver/strategies/code.js ---
  const mod_solver_strategies_code = (() => {
    const { MSG_LEVEL, TIMING } = mod_core_constants;
    const { abortError, isAbortError, sleep } = mod_core_utils;
    const { AiRequestError } = mod_ai_errors;
    const { CHALLENGE_TYPE } = mod_solver_classifier;

    const CODE_EXT = /\.(py|java|c|cpp|h|hpp|js|mjs|ts|go|rb|php|sh|sql|cs|m|kt|swift|rs)$/i;

    /** Writes and grades a candidate file payload with bounded retries for non-fatal platform errors. */
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

    /** Loads workspace templates, requests AI code generation for editable code files, and submits for grading. */
    async function submitAiCode(ctx, { brief, feedback, previousFiles }, { answerSource, codeGenerator, evaluator }) {
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
        previousFiles,
        log: message => log(message, MSG_LEVEL.INFO),
        signal,
      });
      const passed = await evaluator.writeAndGrade(
        detail,
        key,
        model,
        { ...originals, ...generated },
        evalCtx,
        { log: message => log(message, MSG_LEVEL.INFO), signal },
      );
      return { passed, generated };
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
      let previousFiles = null;
      const maxAttempts = 1 + prefs.data.codeRetries;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (signal?.aborted) throw abortError();
        try {
          if (attempt > 1) {
            log(`　第 ${attempt - 1}/${maxAttempts - 1} 次自动重试（结合平台报错修正代码）…`, MSG_LEVEL.WARN);
          }
          const { passed, generated } = await submitAiCode(ctx, { brief, feedback, previousFiles }, { answerSource, codeGenerator, evaluator });
          if (signal?.aborted) throw abortError();
          if (passed) return { status: 'passed', title: model.title };
          previousFiles = generated;
          const failed = await evaluator.failedDetail(key, evalCtx, signal, brief.cases);
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
    const codeStrategy = {
      name: CHALLENGE_TYPE.CODE,

      /** Executes the 4-tier solving cascade (checker -> reference -> lookup -> AI) for a programming stage. */
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
    return { codeStrategy };
  })();

  // --- src/solver/solver.js ---
  const mod_solver_solver = (() => {
    const { Prefs } = mod_config_prefs;
    const { AiSettings } = mod_config_ai_settings;
    const { Api } = mod_platform_api;
    const { Model } = mod_platform_model;
    const { CodeGenerator } = mod_ai_code_generator;
    const { SshClient } = mod_ssh_client;
    const { createSshSession } = mod_ssh_session;
    const { AnswerSource } = mod_solver_answer_source;
    const { Evaluator } = mod_solver_evaluator;
    const { CHALLENGE_TYPE, classifyChallenge } = mod_solver_classifier;
    const { createJobSession } = mod_solver_job_session;
    const { unityStrategy } = mod_solver_strategies_unity;
    const { linuxEnvStrategy } = mod_solver_strategies_linux_env;
    const { choiceStrategy } = mod_solver_strategies_choice;
    const { codeStrategy } = mod_solver_strategies_code;

    /** Builds the default challenge-type strategy registry. */
    function createDefaultStrategies() {
      return {
        [CHALLENGE_TYPE.UNITY]: unityStrategy,
        [CHALLENGE_TYPE.LINUX_ENV]: linuxEnvStrategy,
        [CHALLENGE_TYPE.CHOICE]: choiceStrategy,
        [CHALLENGE_TYPE.CODE]: codeStrategy,
      };
    }

    /**
     * Challenge solver factory providing job-scoped isolated sessions (`openJob`)
     * as well as a self-disposing single-stage helper (`solve`).
     */
    function createSolver({
      api = Api,
      model = Model,
      answerSource = AnswerSource,
      evaluator = Evaluator,
      codeGenerator = CodeGenerator,
      sshClient = SshClient,
      prefs = Prefs,
      aiSettings = AiSettings,
      classify = classifyChallenge,
      strategies = null,
      createSsh = createSshSession,
    } = {}) {
      const deps = { api, model, answerSource, evaluator, codeGenerator, sshClient, prefs, aiSettings };
      const registry = strategies
        ? { ...createDefaultStrategies(), ...strategies }
        : createDefaultStrategies();

      return {
        /** Opens a completely fresh, isolated solving session for a single homework/assignment. */
        openJob(job = null) {
          return createJobSession(job, {
            deps,
            strategies: registry,
            classify,
            createSsh,
          });
        },

        /** Convenience one-shot entrypoint that solves a single stage inside a freshly disposed session. */
        async solve(item, callbacks = {}) {
          const session = this.openJob(item ? { id: item.homeworkId } : null);
          try {
            return await session.solveStage(item, callbacks);
          } finally {
            await session.dispose({ log: callbacks.log });
          }
        },
      };
    }

    const Solver = createSolver();
    return { createDefaultStrategies, createSolver, Solver };
  })();

  // --- src/runner/store.js ---
  const mod_runner_store = (() => {
    const { LOG_CAPACITY, MSG_LEVEL } = mod_core_constants;

    /** Computes progress counters (`current`, `planned`, `settled`) from runtime state. */
    function computeProgress(state) {
      const { phase, cursor, queue, jobs, results } = state;
      const { passed, skipped, failed } = results;
      const settled = passed.length + skipped.length + failed.length;
      const recorded = candidate => candidate === cursor
        || (cursor.gameId != null && candidate.gameId === cursor.gameId && candidate.homeworkId === cursor.homeworkId);
      const current = phase === 'running' && cursor
        && ![passed, skipped, failed].some(items => items.some(recorded))
        ? cursor
        : null;
      const scheduled = jobs.reduce((sum, job) => sum + (Number(job.total) || 0), 0);
      const planned = Math.max(scheduled, queue.length + settled + Number(current !== null));
      return { current, planned, settled };
    }

    /**
     * Reactive runtime state container with O(1) job lookup, revision tracking, and event pub/sub.
     */
    function createStore() {
      const state = {
        phase: 'idle',
        course: { id: '', name: '' },
        jobs: [],
        queue: [],
        cursor: null,
        scanProgress: { done: 0, total: 0 },
        results: { passed: [], skipped: [], failed: [] },
        logs: [],
      };

      const rev = { state: 0, jobs: 0, logs: 0, summary: 0 };
      const listeners = new Set();
      let jobMap = new Map();
      let logSeq = 0;

      function emit(event) {
        for (const listener of [...listeners]) {
          listener(event, state, rev);
        }
      }

      return {
        state,
        rev,
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        isActive() {
          return state.phase === 'countdown' || state.phase === 'running';
        },
        isBusy() {
          return state.phase === 'countdown' || state.phase === 'running' || state.phase === 'paused';
        },
        jobOf(homeworkId) {
          return jobMap.get(String(homeworkId)) || null;
        },
        jobName(homeworkId) {
          const job = this.jobOf(homeworkId);
          return job ? job.name : `作业 ${homeworkId}`;
        },
        progress() {
          return computeProgress(state);
        },
        setPhase(phase, immediate = true) {
          state.phase = phase;
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        setCourse(course, immediate = true) {
          state.course = course;
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        setJobs(jobs, immediate = true) {
          state.jobs = jobs;
          jobMap = new Map(jobs.map(job => [String(job.id), job]));
          rev.jobs += 1;
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        updateJob(homeworkId, updater, immediate = true) {
          const job = jobMap.get(String(homeworkId));
          if (!job) return;
          updater(job);
          rev.jobs += 1;
          emit({ type: 'change', immediate });
        },
        markJobPassed(homeworkId, immediate = true) {
          const job = jobMap.get(String(homeworkId));
          if (!job) return;
          job.passed = Math.min(job.total, job.passed + 1);
          if (job.passed >= job.total) job.status = 'done';
          rev.jobs += 1;
          emit({ type: 'change', immediate });
        },
        setQueue(queue, immediate = true) {
          state.queue = queue;
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        shiftQueue() {
          return state.queue.shift() || null;
        },
        requeueFront(item) {
          if (!item) return;
          state.queue.unshift(item);
          rev.state += 1;
        },
        setCursor(item, immediate = true) {
          state.cursor = item;
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        setCursorTitle(item, title, immediate = true) {
          if (state.cursor !== item) return;
          item.title = title;
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        setScanProgress(done, total, immediate = true) {
          state.scanProgress = { done, total };
          rev.state += 1;
          emit({ type: 'change', immediate });
        },
        recordResult(status, item, reason) {
          if (status === 'passed') {
            state.results.passed.push(item);
          } else if (status === 'skipped') {
            state.results.skipped.push({ ...item, reason });
          } else {
            state.results.failed.push({ ...item, reason });
          }
          rev.summary += 1;
          rev.state += 1;
          emit({ type: 'change', immediate: true });
        },
        takeFailedForRetry() {
          const items = state.results.failed.map(item => ({ ...item }));
          state.results.failed = [];
          rev.summary += 1;
          rev.state += 1;
          return items;
        },
        addLog(message, level = MSG_LEVEL.INFO) {
          const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
          state.logs.push({ seq: ++logSeq, time, message, level });
          if (state.logs.length > LOG_CAPACITY) state.logs = state.logs.slice(-LOG_CAPACITY);
          rev.logs += 1;
          emit({ type: 'change', immediate: false });
        },
        clearIdleQueue() {
          state.jobs = [];
          jobMap = new Map();
          state.queue = [];
          rev.jobs += 1;
          rev.state += 1;
          emit({ type: 'change', immediate: true });
        },
        resetAll() {
          state.phase = 'idle';
          state.jobs = [];
          jobMap = new Map();
          state.queue = [];
          state.cursor = null;
          state.scanProgress = { done: 0, total: 0 };
          state.results = { passed: [], skipped: [], failed: [] };
          rev.jobs += 1;
          rev.summary += 1;
          rev.state += 1;
          emit({ type: 'change', immediate: true });
        },
        requestView(view) {
          emit({ type: 'view', view });
        },
        notify(message, level = MSG_LEVEL.INFO) {
          emit({ type: 'notice', message, level });
        },
      };
    }
    return { computeProgress, createStore };
  })();

  // --- src/runner/runner.js ---
  const mod_runner_runner = (() => {
    const { MSG_LEVEL, TIMING } = mod_core_constants;
    const { abortError, isAbortError, mapWithConcurrency, norm, sleep } = mod_core_utils;
    const { Prefs } = mod_config_prefs;
    const { Route } = mod_platform_route;
    const { Scanner } = mod_platform_scanner;
    const { Solver } = mod_solver_solver;

    /**
     * Queue state machine coordinating challenge scanning, bounded concurrent chain loading,
     * cooperative cancellation (`AbortController`), and pause/resume/retry transitions.
     */
    function createRunner({
      store,
      prefs = Prefs,
      route = Route,
      scanner = Scanner,
      solver = Solver,
    }) {
      let scanning = false;
      let scanPromise = null;
      let scanController = null;
      let runController = null;
      let countdownTimer = 0;

      function cancelRun() {
        if (countdownTimer) {
          clearTimeout(countdownTimer);
          countdownTimer = 0;
        }
        if (runController) {
          runController.abort();
          runController = null;
        }
      }

      function cancelScan() {
        if (scanController) {
          scanController.abort();
          scanController = null;
        }
      }

      async function doScan(signal) {
        const courseId = route.courseId() || (route.isTask() ? route.keyOf().courseId : '');
        const cachedCourseName = store.state.course.id === courseId
          && store.state.course.name
          && store.state.course.name !== courseId
          ? store.state.course.name
          : '';
        const [courseName, rawWorks] = await Promise.all([
          cachedCourseName || scanner.courseName(courseId, signal),
          scanner.homeworkList(courseId, signal),
        ]);
        if (signal.aborted) throw abortError();
        store.setCourse({ id: courseId, name: courseName });

        const pinned = route.homeworkId();
        const jobs = rawWorks.map(work => ({
          id: work.homework_id,
          name: norm(work.name),
          shixun: work.shixun_identifier,
          total: pinned
            ? Number(work.challenge_count) || 0
            : Number(work.challenge_count) - Number(work.finished_challenge_count),
          passed: 0,
          status: 'pending',
        }));
        store.setJobs(jobs);

        if (!jobs.length) {
          store.addLog('当前没有待完成的作业', MSG_LEVEL.WARN);
          store.setQueue([]);
          return store.state.jobs;
        }

        store.addLog(`扫描到 ${jobs.length} 份待办作业，正在解析关卡链…`, MSG_LEVEL.INFO);
        const queue = await buildQueue(signal);
        if (signal.aborted) throw abortError();
        store.setQueue(queue);
        const total = queue.length;
        store.addLog(
          total ? `扫描完成，共 ${total} 个关卡待答题` : '所有关卡均已通关，无需重复作答',
          total ? MSG_LEVEL.SUCCESS : MSG_LEVEL.WARN,
        );
        return store.state.jobs;
      }

      async function buildQueue(signal) {
        const jobs = store.state.jobs;
        let done = 0;
        store.setScanProgress(0, jobs.length);

        const perJob = await mapWithConcurrency(jobs, TIMING.scanConcurrency, async job => {
          if (signal.aborted) throw abortError();
          let items = [];
          try {
            items = await scanner.chain(
              { ...job, homework_id: job.id, shixun_identifier: job.shixun },
              store.state.course.id,
              signal,
            );
            const estimated = job.total;
            store.updateJob(job.id, target => {
              target.total = items.length;
              if (!items.length) target.status = 'done';
            });
            const note = estimated && estimated !== items.length
              ? `（已过滤已通过关卡，共 ${estimated} 关）`
              : '';
            store.addLog(`· ${job.name}：待完成 ${items.length} 关${note}`);
          } catch (error) {
            if (isAbortError(error) || signal.aborted) throw abortError();
            store.addLog(`· ${job.name} 关卡读取失败：${error.message}`, MSG_LEVEL.WARN);
          } finally {
            done += 1;
            store.setScanProgress(done, jobs.length);
          }
          return items;
        }, signal);

        return perJob.flat();
      }

      function recordOutcome(item, outcome) {
        const label = outcome.title || item.title || item.gameId;
        if (outcome.status === 'passed') {
          store.markJobPassed(item.homeworkId);
          store.recordResult('passed', item);
          store.addLog(`✓ ${label}　评测通过`, MSG_LEVEL.SUCCESS);
        } else if (outcome.status === 'skipped') {
          store.recordResult('skipped', item, outcome.reason);
          store.addLog(`⏭ ${label}　已跳过：${outcome.reason}`, MSG_LEVEL.WARN);
        } else {
          store.recordResult('failed', item, outcome.reason);
          store.addLog(`✕ ${label}　${outcome.reason}`, MSG_LEVEL.ERROR);
        }
      }

      async function waitStepGap(signal) {
        try {
          await sleep(TIMING.stepGap, signal);
          return true;
        } catch (error) {
          if (isAbortError(error)) {
            store.setCursor(null);
            return false;
          }
          throw error;
        }
      }

      /** Executes one queued challenge inside its enclosing homework session. */
      async function executeItem(session, item, signal) {
        store.setCursor(item);
        let outcome;
        try {
          outcome = await session.solveStage(item, {
            log: (message, level) => store.addLog(message, level),
            signal,
            onTitle: title => store.setCursorTitle(item, title),
            onNotice: (message, level) => store.notify(message, level),
          });
        } catch (error) {
          if (isAbortError(error) || signal.aborted) {
            if (store.state.phase === 'paused') store.requeueFront(item);
            store.setCursor(null);
            return false;
          }
          if (error.code === 401) {
            store.requeueFront(item);
            store.setCursor(null);
            store.setPhase('paused');
            store.addLog(error.message, MSG_LEVEL.WARN);
            return false;
          }
          outcome = { status: 'failed', reason: error.message };
        }

        if (signal.aborted) {
          if (store.state.phase === 'paused') store.requeueFront(item);
          store.setCursor(null);
          return false;
        }

        recordOutcome(item, outcome);
        return true;
      }

      return {
        active() { return store.isActive(); },
        busy() { return store.isBusy(); },
        log(message, level = MSG_LEVEL.INFO) { store.addLog(message, level); },
        async scan() {
          if (scanning) return scanPromise || store.state.jobs;
          const previous = store.state.phase;
          scanning = true;
          const controller = new AbortController();
          scanController = controller;
          store.setPhase('scanning');
          store.setScanProgress(0, 0);
          scanPromise = doScan(controller.signal);
          try {
            return await scanPromise;
          } finally {
            scanning = false;
            scanPromise = null;
            if (scanController === controller) scanController = null;
            if (store.state.phase === 'scanning') {
              store.setPhase(previous === 'scanning' ? 'idle' : previous);
            }
          }
        },
        build(signal) {
          return buildQueue(signal);
        },
        async start() {
          if (store.state.phase === 'scanning' || this.active()) return;
          if (store.state.phase === 'paused') {
            cancelRun();
            const controller = new AbortController();
            runController = controller;
            store.setPhase('running');
            this.log('已恢复队列，继续自动答题');
            this.run(controller.signal);
            return;
          }

          try {
            if (!store.state.jobs.length || !store.state.queue.length) {
              await this.scan();
              if (store.state.phase !== 'idle') return;
              if (!store.state.jobs.length) {
                store.setPhase('idle');
                return;
              }
            }
          } catch (error) {
            if (isAbortError(error)) return;
            store.setPhase('idle');
            store.setQueue([]);
            this.log(`无法启动：${error.message}`, MSG_LEVEL.WARN);
            return;
          }

          if (!store.state.queue.length) {
            store.setPhase('idle');
            this.log('当前没有需要作答的关卡', MSG_LEVEL.WARN);
            return;
          }

          this.log(`准备就绪，即将按队列顺序自动作答（共 ${store.state.queue.length} 关）`, MSG_LEVEL.SUCCESS);
          store.setPhase('countdown');
          store.requestView('work');

          cancelRun();
          const controller = new AbortController();
          runController = controller;
          const delayMs = Math.max(1, prefs.data.delay) * 1000;
          countdownTimer = setTimeout(() => {
            countdownTimer = 0;
            if (controller.signal.aborted) return;
            store.setPhase('running');
            this.run(controller.signal);
          }, delayMs);
        },
        /** Processes queued challenges grouped by homework session, disposing cleanly between jobs. */
        async run(signal) {
          while (store.state.queue.length) {
            if (signal.aborted) return;
            const homeworkId = store.state.queue[0].homeworkId;
            const job = store.jobOf(homeworkId) || { id: homeworkId, name: store.jobName(homeworkId), shixun: '' };
            const session = solver.openJob(job);
            let abortedOrPaused = false;
            try {
              while (store.state.queue.length && store.state.queue[0].homeworkId === homeworkId) {
                if (signal.aborted) {
                  abortedOrPaused = true;
                  return;
                }
                const item = store.shiftQueue();
                if (!await executeItem(session, item, signal)) {
                  abortedOrPaused = true;
                  return;
                }
                if (store.state.queue.length && store.state.queue[0].homeworkId === homeworkId) {
                  if (!await waitStepGap(signal)) {
                    abortedOrPaused = true;
                    return;
                  }
                }
              }
            } finally {
              await session.dispose({ log: (message, level) => store.addLog(message, level) });
            }
            if (abortedOrPaused) return;
            if (store.state.queue.length) {
              if (!await waitStepGap(signal)) return;
            }
          }

          if (signal.aborted) return;
          store.setPhase('done');
          store.setCursor(null);
          this.log('队列中的所有关卡已处理完毕', MSG_LEVEL.SUCCESS);
          store.requestView('summary');
        },
        pause() {
          if (!this.active()) return;
          store.setPhase('paused');
          cancelRun();
          this.log('已暂停自动答题，可随时点击「继续答题」恢复', MSG_LEVEL.WARN);
        },
        stop() {
          if (store.state.phase === 'done') return;
          store.setPhase('done');
          store.setCursor(null);
          cancelRun();
          cancelScan();
          this.log('已手动结束本次答题队列', MSG_LEVEL.WARN);
          store.requestView('summary');
        },
        reset() {
          cancelRun();
          cancelScan();
          store.resetAll();
        },
        retryFailed() {
          const items = store.takeFailedForRetry();
          if (!items.length) {
            store.notify('当前没有需要重试的未通过关卡', MSG_LEVEL.WARN);
            return;
          }
          cancelRun();
          const controller = new AbortController();
          runController = controller;
          store.setQueue(items);
          store.setPhase('running');
          store.requestView('work');
          this.run(controller.signal);
        },
        onRouteChange({ panelOpen, inWorkView }) {
          if (store.state.phase !== 'idle') return;
          store.clearIdleQueue();
          if (panelOpen && inWorkView) {
            this.scan().catch(() => {});
          }
        },
      };
    }
    return { createRunner };
  })();

  // --- src/ui/assets.js ---
  const mod_ui_assets = (() => {
    const PANEL_CSS = `:host {
      all: initial;
      color-scheme: light;
      --md-sys-color-primary: #6750a4;
      --md-sys-color-on-primary: #fff;
      --md-sys-color-primary-container: #eaddff;
      --md-sys-color-on-primary-container: #21005d;
      --md-sys-color-secondary: #625b71;
      --md-sys-color-secondary-container: #e8def8;
      --md-sys-color-on-secondary-container: #1d192b;
      --md-sys-color-tertiary: #7d5260;
      --md-sys-color-tertiary-container: #ffd8e4;
      --md-sys-color-on-tertiary-container: #31111d;
      --md-sys-color-error: #b3261e;
      --md-sys-color-error-container: #f9dedc;
      --md-sys-color-on-error-container: #410e0b;
      --md-sys-color-surface: #fef7ff;
      --md-sys-color-surface-container: #f3edf7;
      --md-sys-color-surface-container-highest: #e6e0e9;
      --md-sys-color-on-surface: #1d1b20;
      --md-sys-color-on-surface-variant: #49454f;
      --md-sys-color-outline: #79747e;
      --md-sys-color-outline-variant: #cac4d0;
      --shadow: 0 12px 36px #0002, 0 2px 6px #0002;
      --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      color: var(--md-sys-color-on-surface);
      font: 14px/1.5 system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        color-scheme: dark;
        --md-sys-color-primary: #d0bcff;
        --md-sys-color-on-primary: #381e72;
        --md-sys-color-primary-container: #4f378b;
        --md-sys-color-on-primary-container: #eaddff;
        --md-sys-color-secondary: #ccc2dc;
        --md-sys-color-secondary-container: #4a4458;
        --md-sys-color-on-secondary-container: #e8def8;
        --md-sys-color-tertiary: #efb8c8;
        --md-sys-color-tertiary-container: #633b48;
        --md-sys-color-on-tertiary-container: #ffd8e4;
        --md-sys-color-error: #f2b8b5;
        --md-sys-color-error-container: #8c1d18;
        --md-sys-color-on-error-container: #f9dedc;
        --md-sys-color-surface: #141218;
        --md-sys-color-surface-container: #211f26;
        --md-sys-color-surface-container-highest: #36343b;
        --md-sys-color-on-surface: #e6e0e9;
        --md-sys-color-on-surface-variant: #cac4d0;
        --md-sys-color-outline: #938f99;
        --md-sys-color-outline-variant: #49454f;
        --shadow: 0 12px 36px #0008, 0 2px 6px #0006;
        --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
      }
    }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }
    h2, h3, p, dl, dd { margin: 0; }
    button, input, select { font: inherit; }
    button {
      min-height: 36px;
      padding: 6px 13px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
    }
    button:enabled:not(.main, [aria-disabled="true"]):hover { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, var(--md-sys-color-surface)); }
    button:disabled, button[aria-disabled="true"] { background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface-variant); opacity: 0.72; cursor: default; }
    :focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; }
    .main {
      border-color: var(--md-sys-color-primary);
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      font-weight: 650;
    }
    .main:enabled:hover { background: color-mix(in srgb, var(--md-sys-color-on-primary) 10%, var(--md-sys-color-primary)); }
    .main:disabled { border-color: var(--md-sys-color-outline-variant); }
    .ghost-btn {
      min-height: 24px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 12px;
      color: var(--md-sys-color-primary);
      border-color: color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
      background: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
    }
    .ghost-btn:enabled:hover {
      background: color-mix(in srgb, var(--md-sys-color-primary) 14%, transparent) !important;
    }
    .muted { color: var(--md-sys-color-on-surface-variant); }
    .success { color: var(--md-sys-color-primary); }
    .info { color: var(--md-sys-color-secondary); }
    .warn { color: var(--md-sys-color-tertiary); }
    .error { color: var(--md-sys-color-error); }
    .numeric, time { font-variant-numeric: tabular-nums; }

    .dock { position: fixed; right: 16px; bottom: 16px; z-index: 2147483646; }
    .pill, .panel, .toast {
      border: 1px solid var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-surface);
      box-shadow: var(--shadow);
    }
    .pill {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 44px;
      padding: 8px 13px;
      border-radius: 999px;
      white-space: nowrap;
      font-weight: 650;
      touch-action: none;
      user-select: none;
    }
    .pill[aria-expanded="true"] { visibility: hidden; pointer-events: none; }
    .pill .numeric {
      min-width: 3.1em;
      padding: 1px 8px;
      border-radius: 999px;
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      text-align: center;
      font-size: 12px;
    }
    .mark { display: block; flex: none; width: 24px; height: 24px; }
    .mark-surface { fill: var(--md-sys-color-primary-container); }
    .mark-symbol { fill: var(--md-sys-color-on-primary-container); }
    .panel {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: min(440px, calc(100vw - 20px));
      max-height: calc(100vh - 20px);
      max-height: calc(100dvh - 20px);
      overflow: hidden;
      border-radius: 16px;
    }
    .panel:focus-visible { outline-offset: -3px; }
    .heading {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 11px 14px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      cursor: grab;
      user-select: none;
      touch-action: none;
    }
    .is-dragging, .is-dragging .heading { cursor: grabbing; }
    .brand, .header-actions, .brand-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .brand .mark { width: 32px; height: 32px; }
    .brand-title { flex-wrap: wrap; column-gap: 6px; row-gap: 0; }
    .brand h2 { min-width: 0; font-size: 15px; line-height: 1.3; overflow-wrap: anywhere; }
    .version { color: var(--md-sys-color-on-surface-variant); font-size: 11px; }
    .phase {
      --phase-color: var(--md-sys-color-on-surface-variant);
      --phase-bg: var(--md-sys-color-surface-container-highest);
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 999px;
      background: var(--phase-bg);
      color: var(--phase-color);
      font-size: 11px;
      font-weight: 650;
    }
    .phase::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    @keyframes phase-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(0.85); }
    }
    .phase[data-phase="running"]::before, .phase[data-phase="scanning"]::before {
      animation: phase-pulse 1.4s ease-in-out infinite;
    }
    .phase[data-phase="running"], .phase[data-phase="done"] {
      --phase-color: var(--md-sys-color-on-primary-container);
      --phase-bg: var(--md-sys-color-primary-container);
    }
    .phase[data-phase="scanning"], .phase[data-phase="countdown"] {
      --phase-color: var(--md-sys-color-on-secondary-container);
      --phase-bg: var(--md-sys-color-secondary-container);
    }
    .phase[data-phase="paused"] {
      --phase-color: var(--md-sys-color-on-tertiary-container);
      --phase-bg: var(--md-sys-color-tertiary-container);
    }
    .header-actions { flex: none; gap: 4px; }
    .header-actions button { min-height: 32px; padding: 4px 8px; border-color: transparent; font-size: 12px; }
    .header-actions .collapse { width: 32px; padding: 0; font-size: 19px; line-height: 1; }

    .screen { display: flex; flex-direction: column; min-height: 0; background: var(--md-sys-color-surface-container); }
    .screen-body {
      display: grid;
      align-content: start;
      gap: 10px;
      overflow: auto;
      overscroll-behavior: contain;
      padding: 12px;
    }
    .card {
      min-width: 0;
      padding: 12px 14px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      background: var(--md-sys-color-surface);
      box-shadow: var(--card-shadow);
    }
    .card h3 { font-size: 13px; font-weight: 650; }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .course {
      display: block;
      margin-top: 3px;
      font-size: 16px;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .current {
      margin-top: 6px;
      padding: 4px 9px;
      height: 28px;
      line-height: 20px;
      border-radius: 6px;
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface-variant);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meter { display: grid; gap: 6px; margin-top: 10px; }
    .meter-label { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; font-size: 12px; }
    progress {
      display: block;
      width: 100%;
      height: 8px;
      appearance: none;
      border: 0;
      border-radius: 999px;
      background: var(--md-sys-color-surface-container-highest);
      accent-color: var(--md-sys-color-primary);
      overflow: hidden;
    }
    progress::-webkit-progress-bar { border-radius: 999px; background: var(--md-sys-color-surface-container-highest); }
    progress::-webkit-progress-value { border-radius: 999px; background: var(--md-sys-color-primary); transition: width 0.25s ease; }
    progress::-moz-progress-bar { border-radius: 999px; background: var(--md-sys-color-primary); transition: width 0.25s ease; }
    .entries {
      margin-top: 8px;
      max-height: 184px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    #logs {
      height: 144px;
      max-height: 144px;
    }
    .scan-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 26px 12px 30px;
    }
    .scan-spinner {
      width: 30px; height: 30px; border-radius: 50%;
      border: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
      border-top-color: var(--md-sys-color-primary);
      animation: scan-spin 0.9s linear infinite;
    }
    @keyframes scan-spin { to { transform: rotate(360deg); } }
    .scan-title { margin: 0; font-size: 13px; font-weight: 600; }
    .scan-progress {
      width: min(240px, 80%); height: 6px; border-radius: 999px;
      background: color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent);
      overflow: hidden;
    }
    .scan-progress-fill {
      height: 100%; width: 0; border-radius: 999px;
      background: var(--md-sys-color-primary);
      transition: width 0.25s ease;
    }
    .scan-count { margin: 0; font-size: 12px; color: var(--md-sys-color-on-surface-variant); }
    .row, .log { display: grid; align-items: baseline; column-gap: 9px; }
    .row {
      grid-template-columns: minmax(0, 1fr) auto auto;
      padding: 7px 6px;
      border-radius: 6px;
      font-size: 13px;
    }
    .row.is-active {
      background: color-mix(in srgb, var(--md-sys-color-secondary-container) 45%, transparent);
      font-weight: 550;
    }
    .row + .row { border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 55%, transparent); }
    .row span, .log span { overflow-wrap: anywhere; }
    .row .numeric { color: var(--md-sys-color-on-surface-variant); font-size: 12px; }
    .job-status { padding: 1px 7px; border-radius: 999px; background: var(--md-sys-color-surface-container); font-size: 11px; font-weight: 550; }
    .job-status.success { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
    .job-status.info { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
    .log { grid-template-columns: 7.5ch minmax(0, 1fr); padding: 3px 2px; font-size: 12px; line-height: 1.45; }
    .log + .log { border-top: 1px dashed color-mix(in srgb, var(--md-sys-color-outline-variant) 35%, transparent); }
    .log time { color: var(--md-sys-color-on-surface-variant); font-size: 11.5px; opacity: 0.85; }
    .empty { display: block; padding: 6px 0; color: var(--md-sys-color-on-surface-variant); font-size: 12px; }
    footer {
      display: flex;
      flex: none;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-surface);
    }
    .result-totals { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .result-totals div { padding: 10px 8px; border-radius: 10px; background: var(--md-sys-color-surface-container); text-align: center; }
    .result-totals .success { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
    .result-totals .warn { background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); }
    .result-totals .error { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
    .result-totals dt { font-size: 12px; font-weight: 550; opacity: 0.9; }
    .result-totals dd { margin-top: 2px; font-size: 22px; font-weight: 700; line-height: 1.25; }
    .result-details { display: grid; gap: 10px; }
    .result-detail + .result-detail { padding-top: 10px; border-top: 1px solid var(--md-sys-color-outline-variant); }
    .result-detail p { margin-top: 4px; white-space: pre-line; overflow-wrap: anywhere; color: var(--md-sys-color-on-surface-variant); font-size: 12px; line-height: 1.55; }
    .ended { padding: 0 2px; color: var(--md-sys-color-on-surface-variant); font-size: 12px; text-align: right; }

    .tabs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px;
      padding: 4px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 10px;
      background: var(--md-sys-color-surface-container-highest);
    }
    .tab { border-color: transparent; background: transparent; color: var(--md-sys-color-on-surface-variant); }
    .tab[aria-selected="true"] {
      border-color: var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-weight: 650;
    }
    .pane { display: grid; gap: 14px; }
    .setting-section {
      display: grid;
      gap: 10px;
    }
    .setting-section + .setting-section {
      padding-top: 12px;
      border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 65%, transparent);
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0.02em;
      color: var(--md-sys-color-primary);
    }
    .doc-link {
      color: var(--md-sys-color-primary);
      font-size: 12px;
      font-weight: 550;
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .doc-link:hover {
      opacity: 0.82;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .check-list {
      display: grid;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 9px;
      background: color-mix(in srgb, var(--md-sys-color-surface-container) 40%, transparent);
      overflow: hidden;
    }
    .check-card {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 9px 11px;
      cursor: pointer;
    }
    .check-card + .check-card {
      border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 55%, transparent);
    }
    .check-card input {
      width: 16px;
      height: 16px;
      margin: 2px 0 0;
      accent-color: var(--md-sys-color-primary);
      flex: none;
    }
    .check-body {
      display: grid;
      gap: 2px;
      min-width: 0;
    }
    .check-title {
      font-size: 13px;
      font-weight: 550;
      line-height: 1.35;
    }
    .setting-hint { color: var(--md-sys-color-on-surface-variant); font-size: 11.5px; font-weight: 400; line-height: 1.45; }
    .label-row { display: flex; align-items: center; gap: 6px; }
    .help-tip {
      display: inline-flex; align-items: center; justify-content: center;
      width: 15px; height: 15px; border-radius: 50%; flex: none;
      border: 1px solid currentColor; font-size: 10px; font-weight: 700; line-height: 1;
      cursor: help; opacity: .65; position: relative;
    }
    .help-tip:hover, .help-tip:focus-visible { opacity: 1; }
    .help-tip::after {
      content: attr(data-tip);
      position: absolute; left: -6px; bottom: calc(100% + 8px);
      width: 248px; max-width: calc(100vw - 48px); padding: 9px 11px; border-radius: 8px;
      background: #202124; color: #fff; font-size: 12px; font-weight: 400; line-height: 1.55;
      text-align: left; white-space: normal; word-break: break-word;
      opacity: 0; pointer-events: none; transition: opacity .15s ease; z-index: 40;
      box-shadow: 0 6px 18px rgba(0, 0, 0, .3);
    }
    .help-tip:hover::after, .help-tip:focus-visible::after { opacity: 1; }
    .pane label:not(.check-card) { display: grid; gap: 4px; font-size: 12.5px; font-weight: 550; }
    .pane textarea {
      width: 100%;
      min-height: 56px;
      padding: 6px 9px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 7px;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font: inherit;
      font-size: 12.5px;
      font-weight: 400;
      resize: vertical;
    }
    .pane select, .pane input:not([type="checkbox"]) {
      width: 100%;
      min-height: 34px;
      padding: 5px 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 7px;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      font-size: 13px;
      font-weight: 400;
    }
    .pane select:focus, .pane input:not([type="checkbox"]):focus, .pane textarea:focus {
      border-color: var(--md-sys-color-primary);
    }
    .form-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 65%, transparent);
    }
    .advanced {
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 9px;
      background: color-mix(in srgb, var(--md-sys-color-surface-container) 40%, transparent);
    }
    .advanced summary { padding: 8px 11px; cursor: pointer; font-weight: 650; font-size: 12.5px; }
    .advanced-content { display: grid; gap: 10px; padding: 4px 11px 11px; }
    .sample-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 10px; }
    .sampling-settings {
      display: grid;
      min-width: 0;
      gap: 8px;
      margin: 0;
      padding: 8px 10px 10px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
    }
    .sampling-settings legend { padding: 0 4px; font-size: 12px; font-weight: 650; }
    #aiState {
      padding: 6px 10px;
      border-radius: 7px;
      background: var(--md-sys-color-surface-container);
      font-size: 12px;
      font-weight: 550;
    }
    .toast {
      position: fixed;
      bottom: max(16px, 8vh);
      left: 50%;
      z-index: 2147483647;
      transform: translateX(-50%);
      width: max-content;
      max-width: calc(100vw - 24px);
      padding: 9px 14px;
      border-inline-start: 3.5px solid currentColor;
      border-radius: 10px;
      font-weight: 550;
      pointer-events: none;
      overflow-wrap: anywhere;
    }
    @media (max-width: 359px) {
      .heading { padding-inline: 9px; gap: 5px; }
      .brand { gap: 5px; }
      .brand .mark { width: 25px; height: 25px; }
      .header-actions { gap: 0; }
      .header-actions button { padding-inline: 5px; }
      .grid-3 { grid-template-columns: 1fr; }
    }`;
    const PANEL_HTML = `<div class="dock">
      <button type="button" class="pill" id="pill" aria-controls="panel" aria-expanded="false">
        {{MARK}}<span>头歌自动答题助手</span><span id="pillCount" class="numeric"></span>
      </button>
      <section class="panel" id="panel" aria-labelledby="panelTitle" tabindex="-1" hidden>
        <header class="heading" id="handle">
          <div class="brand">
            {{MARK}}<div class="brand-title"><h2 id="panelTitle">头歌自动答题助手</h2><span class="version">v{{VERSION}}</span></div>
          </div>
          <span class="phase" id="status" role="status"></span>
          <div class="header-actions">
            <button type="button" id="gear" aria-controls="settings" aria-expanded="false">设置</button>
            <button type="button" class="collapse" id="hide" aria-label="收起面板" title="收起面板">−</button>
          </div>
        </header>

        <div class="screen" id="work">
          <div class="screen-body">
            <section class="card">
              <h3 class="muted">当前课程</h3>
              <strong class="course" id="course"></strong>
              <p class="current" id="current"></p>
              <div class="meter">
                <div class="meter-label"><span>答题进度</span><span class="numeric muted" id="metric"></span></div>
                <progress id="bar" aria-label="答题进度"></progress>
              </div>
            </section>
            <section class="card">
              <div class="card-head">
                <h3>待办作业</h3>
                <button type="button" class="ghost-btn" id="rescan" title="重新扫描当前页面的作业与关卡">重新扫描</button>
              </div>
              <div class="scan-state" id="scanState" hidden>
                <div class="scan-spinner" role="status" aria-label="正在扫描关卡列表"></div>
                <p class="scan-title" id="scanTitle">正在扫描关卡列表…</p>
                <div class="scan-progress" id="scanBar" role="progressbar"
                     aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                  <div class="scan-progress-fill" id="scanFill"></div>
                </div>
                <p class="scan-count" id="scanCount">正在读取…</p>
              </div>
              <div class="entries" id="rows"></div>
            </section>
            <section class="card">
              <h3 id="logTitle">运行日志</h3>
              <div class="entries" id="logs" role="log" aria-labelledby="logTitle" aria-live="off"></div>
            </section>
          </div>
          <footer>
            <button type="button" id="stop">结束答题</button>
            <button type="button" class="main" id="start">开始答题</button>
          </footer>
        </div>

        <div class="screen" id="summary" hidden>
          <div class="screen-body">
            <section class="card" aria-label="答题统计">
              <dl class="result-totals numeric">
                <div class="success"><dt>已通过</dt><dd id="passedCount"></dd></div>
                <div class="warn"><dt>已跳过</dt><dd id="skippedCount"></dd></div>
                <div class="error"><dt>未通过</dt><dd id="failedCount"></dd></div>
              </dl>
              <div class="meter">
                <div class="meter-label"><span id="rate"></span></div>
                <progress id="resultBar" aria-label="通过率"></progress>
              </div>
            </section>
            <section class="card result-details" aria-label="关卡明细">
              <div class="result-detail"><h3 class="success">已通过关卡</h3><p id="passedList"></p></div>
              <div class="result-detail"><h3 class="warn">已跳过关卡</h3><p id="skippedList"></p></div>
              <div class="result-detail"><h3 class="error">未通过关卡</h3><p id="failedList"></p></div>
            </section>
            <p class="ended" id="ended"></p>
          </div>
          <footer>
            <button type="button" id="again">返回列表</button>
            <button type="button" class="main" id="retry">重试未通过关卡</button>
          </footer>
        </div>

        <div class="screen" id="settings" hidden>
          <div class="screen-body">
            <div class="tabs" role="tablist" aria-label="设置分类">
              <button type="button" class="tab" id="tab-general" role="tab" aria-controls="pane-general" aria-selected="true">常规设置</button>
              <button type="button" class="tab" id="tab-ai" role="tab" aria-controls="pane-ai" aria-selected="false" tabindex="-1">AI 模型</button>
            </div>
            <div id="pane-general" role="tabpanel" aria-labelledby="tab-general">
              <form class="card pane" id="generalForm" novalidate>
                <div class="setting-section">
                  <div class="section-head"><span class="section-title">运行与显示</span></div>
                  <div class="grid-3">
                    <label>启动缓冲
                      <select id="delay" name="delay">
                        <option value="1">1 秒</option><option value="3">3 秒</option>
                        <option value="5">5 秒</option><option value="10">10 秒</option>
                      </select>
                    </label>
                    <label>失败重试
                      <select id="codeRetries" name="codeRetries" aria-describedby="retryHint">
                        <option value="0">不重试</option><option value="1">1 次</option>
                        <option value="2">2 次</option><option value="3">3 次</option><option value="4">4 次</option>
                      </select>
                    </label>
                    <label>日志行数
                      <select id="logRows" name="logRows">
                        <option value="6">6 条</option><option value="12">12 条</option>
                        <option value="24">24 条</option><option value="40">40 条</option>
                      </select>
                    </label>
                  </div>
                  <span class="setting-hint" id="retryHint">失败重试：代码首次评测未过时，结合报错让 AI 自动修正的次数。</span>
                  <div class="check-list">
                    <label class="check-card">
                      <input type="checkbox" id="auto" name="auto">
                      <span class="check-body"><span class="check-title">进入作业或关卡页时自动开始答题</span></span>
                    </label>
                    <label class="check-card">
                      <input type="checkbox" id="titleProgress" name="titleProgress">
                      <span class="check-body"><span class="check-title">在浏览器标签页标题上实时显示进度</span></span>
                    </label>
                    <label class="check-card">
                      <input type="checkbox" id="aiFallback" name="aiFallback">
                      <span class="check-body">
                        <span class="check-title">启用 AI 编程兜底</span>
                        <span class="setting-hint">优先提取判分脚本、参考答案与用例通关；均无时才调用 AI 写代码。</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-section">
                  <div class="section-head">
                    <span class="label-row">
                      <span class="section-title">远程 SSH 网关（Linux 环境题选填）</span>
                      <span class="help-tip" tabindex="0" role="note" aria-label="为什么需要远程 SSH 网关" data-tip="需要启动 Linux 实验环境完成评测的关卡（如部分 StarUML、VNC 或容器实训）没有网页直接提交接口，需借助配套的 cf-ssh-exec 网关连入实验容器。普通选择题、填空题与常规编程题无需配置，留空即可。">?</span>
                    </span>
                    <a class="doc-link" href="https://github.com/freelyflyyy/educoder-auto-solver/tree/main/cf-ssh-exec#readme" target="_blank" rel="noopener noreferrer">如何获取？</a>
                  </div>
                  <div class="sample-grid">
                    <label>网关地址
                      <input id="sshBase" name="sshBase" inputmode="url" autocomplete="off" placeholder="https://cf-ssh-exec.example.workers.dev">
                    </label>
                    <label>网关密钥
                      <input id="sshKey" name="sshKey" type="password" autocomplete="off" placeholder="填写 SSH_API_KEY">
                    </label>
                  </div>
                  <p class="setting-hint">仅需要启动 Linux 实验环境的关卡使用；留空时自动跳过此类关卡，不影响常规题目。</p>
                </div>

                <div class="form-actions">
                  <button type="button" id="resetGeneral">恢复默认</button>
                  <button type="submit" class="main" id="save">保存设置</button>
                </div>
              </form>
            </div>
            <div id="pane-ai" role="tabpanel" aria-labelledby="tab-ai" hidden>
              <form class="card pane" id="aiForm" novalidate>
                <div class="setting-section">
                  <div class="section-head"><span class="section-title">模型接口连接</span></div>
                  <p id="aiState" class="muted" role="status"></p>
                  <label>接口地址 (Base URL)<input id="aiBase" name="base" inputmode="url" placeholder="https://api.deepseek.com/v1"></label>
                  <div class="sample-grid">
                    <label>模型名称 (Model)<input id="aiModel" name="model" placeholder="deepseek-v4-pro"></label>
                    <label>接口密钥 (API Key)<input id="aiKey" name="key" type="password" autocomplete="off" placeholder="sk-..."></label>
                  </div>
                  <div class="check-list">
                    <label class="check-card">
                      <input type="checkbox" id="aiVision" name="vision">
                      <span class="check-body">
                        <span class="check-title">启用图片识别（多模态视觉）</span>
                        <span class="setting-hint">自动下载题干配图传给模型，需模型支持视觉（如 gpt-4o、qwen-vl-max）。</span>
                      </span>
                    </label>
                  </div>
                </div>

                <details class="advanced" id="aiAdvanced">
                  <summary>高级生成参数（通常保持默认即可）</summary>
                  <div class="advanced-content">
                    <div class="sample-grid">
                      <label>最大输出 Token<input id="aiTokens" name="maxTokens" type="number" min="1" max="393216" step="1"></label>
                      <label>请求超时（秒）<input id="aiTimeout" name="timeout" type="number" min="15" max="600" step="1"></label>
                      <label>深度思考模式
                        <select id="aiThinking" name="thinking">
                          <option value="auto">自动适配</option><option value="on">强制开启</option><option value="off">强制关闭</option>
                        </select>
                      </label>
                      <label>思考强度
                        <select id="aiThinkLevel" name="thinkLevel">
                          <option value="low">低</option><option value="medium">中</option><option value="high">高</option>
                        </select>
                      </label>
                    </div>
                    <fieldset class="sampling-settings" aria-describedby="samplingHint">
                      <legend>采样与惩罚控制</legend>
                      <p id="samplingHint" class="setting-hint" hidden></p>
                      <div class="sample-grid" id="samplingFields">
                        <label id="samplingChoice">采样方式
                          <select id="aiSampling" name="sampling">
                            <option value="temperature">温度 (Temperature)</option><option value="topP">核采样 (top_p)</option>
                          </select>
                        </label>
                        <label id="temperatureField">温度 (0–2)<input id="aiTemperature" name="temperature" type="number" min="0" max="2" step="0.01"></label>
                        <label id="topPField">top_p (0.01–1)<input id="aiTopP" name="topP" type="number" min="0.01" max="1" step="0.01"></label>
                      </div>
                      <div class="sample-grid" id="penaltyFields">
                        <label>频率惩罚<input id="aiFreq" name="frequencyPenalty" type="number" min="-2" max="2" step="0.1"></label>
                        <label>存在惩罚<input id="aiPres" name="presencePenalty" type="number" min="-2" max="2" step="0.1"></label>
                      </div>
                    </fieldset>
                    <label>强制 JSON 格式输出
                      <select id="aiJsonMode" name="jsonMode">
                        <option value="auto">自动适配</option><option value="on">强制开启</option><option value="off">强制关闭</option>
                      </select>
                    </label>
                    <label>自定义请求参数（JSON，选填）
                      <textarea id="aiExtra" name="extraBody" spellcheck="false" placeholder='例如：{"top_k": 40}'></textarea>
                    </label>
                    <label>自定义附加指令（选填）
                      <textarea id="aiPrompt" name="extraPrompt" placeholder="例如：优先使用简洁的标准库写法，不添加多余注释"></textarea>
                    </label>
                    <div class="form-actions"><button type="button" id="clearTpl">清空本地代码模板缓存</button></div>
                  </div>
                </details>
                <div class="form-actions">
                  <button type="button" id="resetAi">恢复默认</button>
                  <button type="button" id="testAi">测试连接</button>
                  <button type="submit" class="main" id="saveAi">保存配置</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div id="toast" class="toast" role="status" hidden></div>`;
    return { PANEL_CSS, PANEL_HTML };
  })();

  // --- src/ui/template.js ---
  const mod_ui_template = (() => {
    const { MARK, VERSION } = mod_core_constants;
    const { PANEL_CSS, PANEL_HTML } = mod_ui_assets;

    /** Builds the complete Shadow DOM stylesheet and HTML template string. */
    function buildPanelTemplate(mark = MARK, version = VERSION) {
      return `<style>\n${PANEL_CSS}\n</style>\n${PANEL_HTML.replaceAll('{{MARK}}', mark).replaceAll('{{VERSION}}', version)}`;
    }
    return { buildPanelTemplate };
  })();

  // --- src/ui/dock.js ---
  const mod_ui_dock = (() => {
    const { DOCK_EDGE, STORAGE_KEYS } = mod_core_constants;

    function fitAxis(position, viewportSize, size) {
      return Math.min(Math.max(DOCK_EDGE, position), Math.max(DOCK_EDGE, viewportSize - size - DOCK_EDGE));
    }

    /**
     * Floating dock controller managing viewport-bounded positioning, pointer dragging, and edge snapping.
     */
    function createDock() {
      return {
        root: null,
        pill: null,
        panel: null,
        position: null,
        dragging: false,
        observer: null,
        onResize: null,
        mount(ui, onOpen) {
          this.root = ui.querySelector('.dock');
          this.pill = ui.getElementById('pill');
          this.panel = ui.getElementById('panel');
          this.position = this.readPosition();
          this.bindDrag(this.pill, this.root);
          this.bindDrag(ui.getElementById('handle'), this.panel);
          this.pill.addEventListener('click', onOpen);
          ui.getElementById('hide').addEventListener('click', () => this.close());
          this.panel.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            event.stopPropagation();
            this.close();
          });
          this.onResize = () => this.align();
          window.addEventListener('resize', this.onResize);
          if (typeof ResizeObserver === 'function') {
            this.observer = new ResizeObserver(() => this.align());
            this.observer.observe(this.pill);
            this.observer.observe(this.panel);
          }
          this.align();
        },
        destroy() {
          if (this.onResize) {
            window.removeEventListener('resize', this.onResize);
            this.onResize = null;
          }
          this.observer?.disconnect();
          this.observer = null;
        },
        readPosition() {
          try {
            const position = JSON.parse(localStorage.getItem(STORAGE_KEYS.dock) || 'null');
            if (Number.isFinite(position?.x) && Number.isFinite(position?.y)) return position;
          } catch { /* Fall back to default bottom-right position */ }
          return null;
        },
        place(element, x, y) {
          const left = fitAxis(x, window.innerWidth, element.offsetWidth);
          const top = fitAxis(y, window.innerHeight, element.offsetHeight);
          element.style.left = `${Math.round(left)}px`;
          element.style.top = `${Math.round(top)}px`;
          element.style.right = 'auto';
          element.style.bottom = 'auto';
        },
        isOnLeft(rect) {
          return rect.left + rect.width / 2 < window.innerWidth / 2;
        },
        align() {
          if (this.dragging || !this.root) return;
          if (this.position) this.place(this.root, this.position.x, this.position.y);
          if (this.panel.hidden) return;
          const anchor = this.pill.getBoundingClientRect();
          const left = this.isOnLeft(anchor) ? anchor.left : anchor.right - this.panel.offsetWidth;
          this.place(this.panel, left, anchor.top);
        },
        open() {
          this.pill.setAttribute('aria-expanded', 'true');
          this.panel.hidden = false;
          this.align();
          this.panel.focus({ preventScroll: true });
        },
        close() {
          this.panel.hidden = true;
          this.pill.setAttribute('aria-expanded', 'false');
          this.align();
          this.pill.focus({ preventScroll: true });
        },
        snap(element) {
          const rect = element.getBoundingClientRect();
          const x = this.isOnLeft(rect) ? DOCK_EDGE : window.innerWidth - this.pill.offsetWidth - DOCK_EDGE;
          this.position = { x: Math.max(DOCK_EDGE, x), y: rect.top };
          this.align();
          try {
            localStorage.setItem(STORAGE_KEYS.dock, JSON.stringify(this.position));
          } catch { /* Keep in-memory coordinates */ }
        },
        bindDrag(handle, element) {
          let drag;
          let suppressClick = false;
          const fromPill = handle === this.pill;

          const move = event => {
            if (event.pointerId !== drag?.id) return;
            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;
            if (!drag.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
            drag.moved = true;
            this.dragging = true;
            element.classList.add('is-dragging');
            this.place(element, drag.left + dx, drag.top + dy);
          };

          const finish = event => {
            if (event.pointerId !== drag?.id) return;
            document.removeEventListener('pointermove', move, true);
            document.removeEventListener('pointerup', finish, true);
            document.removeEventListener('pointercancel', finish, true);
            const moved = drag.moved;
            drag = null;
            if (!moved) return;
            element.classList.remove('is-dragging');
            this.dragging = false;
            suppressClick = fromPill;
            this.snap(element);
          };

          handle.addEventListener('pointerdown', event => {
            if (drag || this.dragging || !event.isPrimary || event.button !== 0) return;
            if (!fromPill && event.target.closest('button')) return;
            const rect = element.getBoundingClientRect();
            suppressClick = false;
            drag = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              left: rect.left,
              top: rect.top,
              moved: false,
            };
            document.addEventListener('pointermove', move, true);
            document.addEventListener('pointerup', finish, true);
            document.addEventListener('pointercancel', finish, true);
          });

          if (fromPill) {
            handle.addEventListener('click', event => {
              if (suppressClick && event.detail > 0) event.stopImmediatePropagation();
              suppressClick = false;
            }, true);
          }
        },
      };
    }
    return { createDock };
  })();

  // --- src/ui/settings-panel.js ---
  const mod_ui_settings_panel = (() => {
    const { MSG_LEVEL } = mod_core_constants;
    const { Prefs } = mod_config_prefs;
    const { AiSettings } = mod_config_ai_settings;
    const { TemplateCache } = mod_config_template_cache;
    const { AiClient } = mod_ai_client;

    /**
     * Settings form controller handling validation, persistence, tab navigation, and live AI connectivity tests.
     */
    function createSettingsPanel({
      prefs = Prefs,
      aiSettings = AiSettings,
      templateCache = TemplateCache,
      aiClient = AiClient,
    } = {}) {
      return {
        ui: null,
        notify: null,
        els: null,
        general: null,
        ai: null,
        locked: false,
        testing: false,
        lastSyncLocked: null,
        lastSyncTesting: null,
        mount(ui, notify, returnToWork) {
          this.ui = ui;
          this.notify = notify;
          const $ = id => ui.getElementById(id);
          this.els = {
            generalForm: $('generalForm'),
            aiForm: $('aiForm'),
            aiBase: $('aiBase'),
            aiModel: $('aiModel'),
            aiThinking: $('aiThinking'),
            aiSampling: $('aiSampling'),
            aiExtra: $('aiExtra'),
            aiState: $('aiState'),
            samplingFields: $('samplingFields'),
            samplingChoice: $('samplingChoice'),
            temperatureField: $('temperatureField'),
            topPField: $('topPField'),
            aiTopP: $('aiTopP'),
            penaltyFields: $('penaltyFields'),
            samplingHint: $('samplingHint'),
            resetGeneral: $('resetGeneral'),
            resetAi: $('resetAi'),
            testAi: $('testAi'),
            clearTpl: $('clearTpl'),
            save: $('save'),
            saveAi: $('saveAi'),
          };
          this.general = this.els.generalForm;
          this.ai = this.els.aiForm;

          for (const el of [this.els.aiBase, this.els.aiModel, this.els.aiThinking, this.els.aiSampling]) {
            el.addEventListener('input', () => this.renderSampling());
          }

          this.general.onsubmit = event => {
            event.preventDefault();
            if (this.locked) return;
            try {
              prefs.save(this.read(this.general));
              this.write(this.general, prefs.data);
              returnToWork();
              notify('常规设置已保存', MSG_LEVEL.SUCCESS);
            } catch (error) {
              notify(`保存失败：${error.message}`, MSG_LEVEL.ERROR);
            }
          };

          this.ai.onsubmit = event => {
            event.preventDefault();
            if (this.locked || this.testing || !this.validateAi()) return;
            try {
              const saved = aiSettings.save(this.read(this.ai));
              this.write(this.ai, saved);
              this.renderSampling();
              this.renderAiState();
              const ready = aiSettings.ready(saved);
              notify(ready ? 'AI 模型配置已保存' : '配置已保存（尚未填写完整的 API Key）', ready ? MSG_LEVEL.SUCCESS : MSG_LEVEL.WARN);
            } catch (error) {
              if (error.message.includes('自定义请求参数')) this.revealField(this.els.aiExtra);
              notify(`保存失败：${error.message}`, MSG_LEVEL.ERROR);
            }
          };

          this.els.resetGeneral.onclick = () => this.restore(this.general, prefs.defaults);
          this.els.resetAi.onclick = () => {
            this.restore(this.ai, aiSettings.defaults);
            this.renderSampling();
          };
          this.els.testAi.onclick = () => this.testAi();
          this.els.clearTpl.onclick = () => {
            templateCache.clear();
            notify('本地代码模板缓存已清空', MSG_LEVEL.SUCCESS);
          };
          this.bindTabs(ui);
          this.load();
        },
        load() {
          this.write(this.general, prefs.data);
          const config = aiSettings.load();
          const { flash, thinking } = aiSettings.modelOptions(config);
          if (flash && thinking) config.topP = Math.max(0.95, config.topP);
          this.write(this.ai, config);
          this.renderSampling();
          this.renderAiState();
        },
        renderSampling() {
          const { els } = this;
          const cfg = aiSettings.normalize(this.read(this.ai));
          const { deepSeek, flash, thinking, chooseSampler, sampler, penalties } = aiSettings.modelOptions(cfg);
          els.samplingFields.hidden = sampler === null;
          els.samplingChoice.hidden = !chooseSampler;
          els.temperatureField.hidden = sampler !== 'temperature';
          els.topPField.hidden = sampler !== 'topP';
          els.aiTopP.min = flash ? '0.95' : '0.01';
          els.penaltyFields.hidden = !penalties;
          const notes = [];
          if (flash) notes.push(thinking ? 'Flash 思考模式下 top_p 有效范围为 0.95–1.00。' : 'Flash 非思考模式由服务端固定采样参数。');
          else if (thinking) notes.push('深度思考模式下由模型自动控制采样参数。');
          if (deepSeek) notes.push('DeepSeek 官方接口无需设置频率与存在惩罚。');
          else if (penalties) notes.push('代码生成场景建议将两项惩罚保持为 0。');
          els.samplingHint.textContent = notes.join(' ');
          els.samplingHint.hidden = !notes.length;
        },
        read(form) {
          return Object.fromEntries([...form.elements].filter(field => field.name).map(field =>
            [field.name, field.type === 'checkbox' ? field.checked : field.value],
          ));
        },
        write(form, values) {
          for (const field of form.elements) {
            if (!field.name || !Object.hasOwn(values, field.name)) continue;
            if (field.type === 'checkbox') field.checked = values[field.name];
            else field.value = values[field.name];
          }
        },
        revealField(field) {
          if (field.closest('[hidden]')) return;
          const advanced = field.closest('details');
          if (advanced) advanced.open = true;
          field.focus();
        },
        validateAi() {
          const invalid = [...this.ai.elements].find(field => {
            if (field.type !== 'number' || field.closest('[hidden]')) return false;
            const { badInput, rangeUnderflow, rangeOverflow, stepMismatch } = field.validity;
            return badInput || rangeUnderflow || rangeOverflow || (field.step === '1' && stepMismatch);
          });
          if (!invalid) return true;
          this.revealField(invalid);
          invalid.reportValidity();
          return false;
        },
        restore(form, defaults) {
          this.write(form, defaults);
          this.notify('已恢复为默认参数，点击保存后生效');
        },
        sync(locked) {
          const testing = Boolean(this.testing);
          if (this.lastSyncLocked === locked && this.lastSyncTesting === testing) return;
          this.lastSyncLocked = locked;
          this.lastSyncTesting = testing;
          this.locked = locked;
          const { els } = this;
          els.save.disabled = locked;
          els.resetGeneral.disabled = locked;
          els.clearTpl.disabled = locked;
          els.saveAi.disabled = locked || testing;
          els.resetAi.disabled = locked || testing;
          els.testAi.disabled = locked;
          els.testAi.setAttribute('aria-disabled', String(testing));
        },
        renderAiState() {
          const indicator = this.els.aiState;
          const ready = aiSettings.ready();
          indicator.textContent = this.testing
            ? '正在测试模型接口连通性…'
            : ready
              ? '✓ AI 模型已就绪，需要时可随时调用'
              : '尚未填写 API Key，当前仅使用免 AI 模式答题';
          indicator.className = this.testing ? MSG_LEVEL.INFO : ready ? MSG_LEVEL.SUCCESS : MSG_LEVEL.WARN;
        },
        async testAi() {
          if (this.locked || this.testing || !this.validateAi()) return;
          const config = aiSettings.normalize(this.read(this.ai));
          if (!aiSettings.ready(config)) {
            this.notify('请先填写接口地址、API Key 和模型名称', MSG_LEVEL.WARN);
            return;
          }
          this.testing = true;
          this.sync(this.locked);
          this.renderAiState();
          try {
            const reply = await aiClient.test(config);
            this.notify(`连接成功（模型回复：${reply.trim().slice(0, 16)}）`, MSG_LEVEL.SUCCESS);
          } catch (error) {
            if (error.message.includes('自定义请求参数')) this.revealField(this.els.aiExtra);
            this.notify(`连接失败：${error.message}`, MSG_LEVEL.ERROR);
          } finally {
            this.testing = false;
            this.sync(this.locked);
            this.renderAiState();
          }
        },
        bindTabs(ui) {
          const tabs = [...ui.querySelectorAll('[role="tab"]')];
          const select = selected => {
            for (const tab of tabs) {
              const active = tab === selected;
              tab.setAttribute('aria-selected', String(active));
              tab.tabIndex = active ? 0 : -1;
              ui.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
            }
          };
          for (const [index, tab] of tabs.entries()) {
            tab.onclick = () => select(tab);
            tab.onkeydown = event => {
              const nextIndex = {
                ArrowLeft: (index - 1 + tabs.length) % tabs.length,
                ArrowRight: (index + 1) % tabs.length,
                Home: 0,
                End: tabs.length - 1,
              }[event.key];
              if (nextIndex === undefined) return;
              event.preventDefault();
              const next = tabs[nextIndex];
              select(next);
              next.focus();
            };
          }
        },
      };
    }
    return { createSettingsPanel };
  })();

  // --- src/ui/view.js ---
  const mod_ui_view = (() => {
    const { HOST_TAG, MSG_LEVEL, PHASE_LABEL, TIMING } = mod_core_constants;
    const { isAbortError, raf } = mod_core_utils;
    const { Prefs } = mod_config_prefs;
    const { Route } = mod_platform_route;
    const { buildPanelTemplate } = mod_ui_template;
    const { createDock } = mod_ui_dock;
    const { createSettingsPanel } = mod_ui_settings_panel;

    const VIEW_NAMES = ['work', 'summary', 'settings'];
    const cancelRaf = typeof cancelAnimationFrame === 'function'
      ? id => cancelAnimationFrame(id)
      : id => clearTimeout(id);

    /**
     * Primary UI view renderer with `requestAnimationFrame` update batching,
     * dirty-checked targeted DOM updates, and SPA route watching.
     */
    function createView({
      store,
      runner,
      prefs = Prefs,
      aiSettings,
      aiClient,
      templateCache,
      route = Route,
    }) {
      const dock = createDock();
      const settingsPanel = createSettingsPanel({ prefs, aiSettings, templateCache, aiClient });

      const view = {
        host: null,
        ui: null,
        els: null,
        dock,
        settingsPanel,
        panelView: 'work',
        originalTitle: null,
        renderedTitle: null,
        finishedAt: null,
        pending: 0,
        toastTimer: 0,
        watchTimer: 0,
        onPopState: null,
        unsubscribe: null,
        lastPath: '',
        seen: '',
        cache: {
          panelView: '',
          phase: '',
          jobsRev: -1,
          activeJobId: undefined,
          scanning: null,
          logsRev: -1,
          logRows: -1,
          lastLogSeq: 0,
          logsEmpty: true,
          summaryRev: -1,
          pillText: '',
          courseText: '',
          currentText: '',
          metricText: '',
          barMax: -1,
          barVal: -1,
        },
        build() {
          const host = document.createElement(HOST_TAG);
          const ui = host.attachShadow({ mode: 'open' });
          ui.innerHTML = buildPanelTemplate();
          document.body.append(host);
          this.host = host;
          this.ui = ui;
          const $ = id => ui.getElementById(id);
          this.els = {
            panel: $('panel'),
            pill: $('pill'),
            pillCount: $('pillCount'),
            status: $('status'),
            work: $('work'),
            summary: $('summary'),
            settings: $('settings'),
            gear: $('gear'),
            toast: $('toast'),
            course: $('course'),
            current: $('current'),
            metric: $('metric'),
            bar: $('bar'),
            rescan: $('rescan'),
            scanState: $('scanState'),
            scanTitle: $('scanTitle'),
            scanFill: $('scanFill'),
            scanBar: $('scanBar'),
            scanCount: $('scanCount'),
            rows: $('rows'),
            logs: $('logs'),
            start: $('start'),
            stop: $('stop'),
            again: $('again'),
            retry: $('retry'),
            passedCount: $('passedCount'),
            skippedCount: $('skippedCount'),
            failedCount: $('failedCount'),
            resultBar: $('resultBar'),
            rate: $('rate'),
            passedList: $('passedList'),
            skippedList: $('skippedList'),
            failedList: $('failedList'),
            ended: $('ended'),
          };

          dock.mount(ui, () => this.openPanel());
          this.bindRunControls();
          settingsPanel.mount(ui, (message, level) => this.toast(message, level), () => this.toggleSettings());
          this.els.gear.onclick = () => this.toggleSettings();

          this.unsubscribe = store.subscribe(event => {
            if (event.type === 'change') {
              if (event.immediate) this.render();
              else this.schedule();
            } else if (event.type === 'view') {
              this.setView(event.view);
            } else if (event.type === 'notice') {
              this.toast(event.message, event.level);
            }
          });
        },
        setView(name) {
          if (!VIEW_NAMES.includes(name) || this.panelView === name) return;
          this.panelView = name;
          this.render();
        },
        openPanel() {
          dock.open();
          this.render();
          if (store.state.phase === 'idle' && !store.state.jobs.length) {
            runner.scan().catch(error => {
              if (!isAbortError(error)) runner.log(`扫描未完成：${error.message}`, MSG_LEVEL.WARN);
            });
          }
        },
        toast(message, level = MSG_LEVEL.INFO) {
          const notice = this.els.toast;
          notice.textContent = message;
          notice.className = 'toast ' + level;
          notice.hidden = false;
          clearTimeout(this.toastTimer);
          this.toastTimer = setTimeout(() => { notice.hidden = true; }, 2400);
        },
        /** Batches multiple state updates within the same animation frame into a single DOM render pass. */
        schedule() {
          if (this.pending) return;
          this.pending = raf(() => {
            this.pending = 0;
            this.render();
          });
        },
        render() {
          const { els, cache } = this;
          const phase = store.state.phase;
          const active = runner.active();
          const { passed } = store.state.results;
          const { current, planned, settled } = store.progress();

          const pillText = `${passed.length}/${planned}`;
          if (cache.pillText !== pillText) {
            cache.pillText = pillText;
            els.pillCount.textContent = pillText;
          }

          if (cache.phase !== phase) {
            cache.phase = phase;
            els.status.dataset.phase = phase;
            els.status.textContent = PHASE_LABEL[phase] || '';
          }

          const viewChanged = cache.panelView !== this.panelView;
          if (viewChanged) {
            cache.panelView = this.panelView;
            for (const name of VIEW_NAMES) {
              els[name].hidden = name !== this.panelView;
            }
            const inSettings = this.panelView === 'settings';
            els.gear.textContent = inSettings ? '返回' : '设置';
            els.gear.setAttribute('aria-expanded', String(inSettings));
          }

          settingsPanel.sync(active);

          if (phase === 'done') this.finishedAt ??= new Date().toLocaleTimeString('zh-CN', { hour12: false });
          else this.finishedAt = null;

          if (!els.panel.hidden) {
            if (this.panelView === 'work') this.renderWork(planned, active, current);
            if (this.panelView === 'summary' && phase === 'done' && (viewChanged || cache.summaryRev !== store.rev.summary)) {
              cache.summaryRev = store.rev.summary;
              this.renderSummary(settled);
            }
          }

          this.renderTitle(active && prefs.data.titleProgress, passed.length, planned);
          if (viewChanged) dock.align();
        },
        renderWork(planned, active, current) {
          const { els, cache } = this;
          const { phase, course, jobs, logs, results } = store.state;
          const scanning = phase === 'scanning';

          const courseText = course.name || '请先进入课程作业或实训关卡页';
          if (cache.courseText !== courseText) {
            cache.courseText = courseText;
            els.course.textContent = courseText;
          }

          // Keep #current permanently visible at a fixed single-line height to prevent layout shifts between tasks
          const activeItem = current || (phase === 'running' || phase === 'paused' ? store.state.cursor : null);
          const currentText = activeItem
            ? `${phase === 'paused' ? '已暂停于' : '正在作答'}：${this.currentLabel(activeItem)}`
            : phase === 'countdown'
              ? '即将开始自动答题…'
              : scanning
                ? '正在扫描课程作业与关卡…'
                : jobs.length
                  ? '已就绪，点击下方「开始答题」启动'
                  : '等待扫描课程作业…';
          if (cache.currentText !== currentText) {
            cache.currentText = currentText;
            els.current.textContent = currentText;
            els.current.title = currentText;
          }

          const metricText = `已通过 ${results.passed.length} / 共 ${planned} 关`
            + (results.skipped.length ? ` · 跳过 ${results.skipped.length}` : '')
            + (results.failed.length ? ` · 未通过 ${results.failed.length}` : '');
          if (cache.metricText !== metricText) {
            cache.metricText = metricText;
            els.metric.textContent = metricText;
          }

          const barMax = Math.max(1, planned);
          const barVal = results.passed.length;
          if (cache.barMax !== barMax) {
            cache.barMax = barMax;
            els.bar.max = barMax;
          }
          if (cache.barVal !== barVal) {
            cache.barVal = barVal;
            els.bar.value = barVal;
          }

          els.rescan.hidden = runner.busy();
          els.rescan.disabled = scanning;

          if (cache.scanning !== scanning) {
            els.scanState.hidden = !scanning;
            els.rows.hidden = scanning;
          }

          if (scanning) {
            cache.scanning = true;
            this.renderScanState();
          } else {
            const activeJobId = activeItem ? String(activeItem.homeworkId) : '';
            if (cache.scanning !== false || cache.jobsRev !== store.rev.jobs || cache.activeJobId !== activeJobId) {
              cache.scanning = false;
              cache.jobsRev = store.rev.jobs;
              cache.activeJobId = activeJobId;
              els.rows.replaceChildren(...(jobs.length
                ? jobs.map(job => this.jobRow(job, activeItem))
                : [this.field('当前没有待完成的作业', 'empty')]));
            }
          }

          this.renderLogs(logs);

          els.start.textContent = phase === 'paused' ? '继续答题'
            : scanning ? '正在扫描…'
            : active ? '暂停答题' : '开始答题';
          els.start.disabled = scanning;
          els.stop.hidden = !runner.busy();
        },
        renderLogs(logs) {
          const { els, cache } = this;
          const limit = prefs.data.logRows;
          if (cache.logsRev === store.rev.logs && cache.logRows === limit) return;

          const visibleLogs = logs.slice(-limit);
          const logsEl = els.logs;
          if (!visibleLogs.length) {
            if (!cache.logsEmpty || !logsEl.firstElementChild) {
              logsEl.replaceChildren(this.field('点击下方「开始答题」后将在此显示实时进度', 'empty'));
            }
            cache.logsEmpty = true;
            cache.lastLogSeq = 0;
            cache.logRows = limit;
            cache.logsRev = store.rev.logs;
            return;
          }

          const canAppend = !cache.logsEmpty && cache.logRows === limit && cache.lastLogSeq > 0;
          const newEntries = canAppend ? visibleLogs.filter(entry => entry.seq > cache.lastLogSeq) : null;

          if (canAppend && newEntries.length > 0 && newEntries.length < visibleLogs.length) {
            const fragment = document.createDocumentFragment();
            for (const entry of newEntries) fragment.appendChild(this.logRow(entry));
            logsEl.appendChild(fragment);
            while (logsEl.childElementCount > limit) logsEl.firstElementChild.remove();
          } else if (!canAppend || newEntries.length > 0) {
            const fragment = document.createDocumentFragment();
            for (const entry of visibleLogs) fragment.appendChild(this.logRow(entry));
            logsEl.replaceChildren(fragment);
          }

          cache.logsEmpty = false;
          cache.logsRev = store.rev.logs;
          cache.logRows = limit;
          const newestSeq = visibleLogs[visibleLogs.length - 1].seq;
          if (newestSeq !== cache.lastLogSeq) {
            cache.lastLogSeq = newestSeq;
            logsEl.scrollTop = logsEl.scrollHeight;
          }
        },
        logRow(entry) {
          const row = document.createElement('div');
          row.className = 'log';
          const timestamp = document.createElement('time');
          timestamp.textContent = entry.time;
          row.append(timestamp, this.field(entry.message, entry.level));
          return row;
        },
        renderScanState() {
          const { els } = this;
          const { done, total } = store.state.scanProgress;
          const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
          els.scanTitle.textContent = total ? '正在扫描待完成关卡…' : '正在读取课程作业列表…';
          els.scanCount.textContent = total ? `已扫描 ${done} / ${total} 份作业` : '请稍候…';
          els.scanFill.style.width = `${percent}%`;
          els.scanBar.setAttribute('aria-valuenow', String(percent));
        },
        renderSummary(settled) {
          const { els } = this;
          const { passed, skipped, failed } = store.state.results;
          els.passedCount.textContent = passed.length;
          els.skippedCount.textContent = skipped.length;
          els.failedCount.textContent = failed.length;
          els.resultBar.max = Math.max(1, settled);
          els.resultBar.value = passed.length;
          els.rate.textContent = settled
            ? `本次共处理 ${settled} 关，通过率 ${(passed.length / settled * 100).toFixed(1)}%`
            : '暂无统计数据';
          els.passedList.textContent = passed.map(item => this.titleOf(item)).join('、') || '暂无记录';
          els.skippedList.textContent = this.grouped(skipped);
          els.failedList.textContent = this.grouped(failed);
          els.ended.textContent = `完成时间：${this.finishedAt}`;
          els.retry.disabled = !failed.length;
        },
        renderTitle(active, passed, total) {
          const title = document.title;
          if (active) {
            if (title !== this.renderedTitle) this.originalTitle = title;
            this.renderedTitle = `[${passed}/${total}] ${this.originalTitle}`;
            if (title !== this.renderedTitle) document.title = this.renderedTitle;
          } else if (this.renderedTitle !== null) {
            if (title === this.renderedTitle) document.title = this.originalTitle;
            this.renderedTitle = null;
            this.originalTitle = null;
          }
        },
        field(text, className = '') {
          const span = document.createElement('span');
          span.className = className;
          span.textContent = text;
          return span;
        },
        jobRow(job, cursor) {
          const row = document.createElement('div');
          const current = cursor && String(cursor.homeworkId) === String(job.id);
          row.className = current ? 'row is-active' : 'row';
          const done = job.status === 'done';
          const status = done ? '已完成' : current ? '答题中' : '待答题';
          const level = done ? MSG_LEVEL.SUCCESS : current ? MSG_LEVEL.INFO : 'muted';
          row.append(
            this.field(job.name, current ? MSG_LEVEL.INFO : ''),
            this.field(`${job.passed}/${job.total} 关`, 'numeric'),
            this.field(status, `job-status ${level}`),
          );
          return row;
        },
        currentLabel(item) {
          const job = store.jobName(item.homeworkId);
          return item.title ? `${job} · ${item.title}` : job;
        },
        titleOf(item) {
          return item.title || store.jobName(item.homeworkId);
        },
        grouped(items) {
          if (!items.length) return '暂无记录';
          const groups = new Map();
          for (const item of items) {
            const reason = item.reason || '其他原因';
            if (!groups.has(reason)) groups.set(reason, []);
            groups.get(reason).push(this.titleOf(item));
          }
          return [...groups].map(([reason, names]) =>
            `• ${reason}（${names.length} 关）：${names.slice(0, 4).join('、')}${names.length > 4 ? ' 等' : ''}`,
          ).join('\n');
        },
        bindRunControls() {
          const { els } = this;
          els.start.onclick = () => {
            if (store.state.phase === 'scanning') return;
            if (runner.active()) { runner.pause(); return; }
            runner.start().catch(error => {
              if (!isAbortError(error)) runner.log(error.message, MSG_LEVEL.WARN);
            });
          };
          els.stop.onclick = () => runner.stop();
          els.rescan.onclick = () => {
            if (store.state.phase === 'scanning' || runner.busy()) return;
            runner.scan().catch(error => {
              if (!isAbortError(error)) runner.log(`扫描未完成：${error.message}`, MSG_LEVEL.WARN);
            });
          };
          els.again.onclick = () => {
            runner.reset();
            this.setView('work');
            runner.scan().catch(error => {
              if (!isAbortError(error)) runner.log(`扫描未完成：${error.message}`, MSG_LEVEL.WARN);
            });
          };
          els.retry.onclick = () => runner.retryFailed();
        },
        toggleSettings() {
          if (this.panelView === 'settings') {
            this.setView(store.state.phase === 'done' ? 'summary' : 'work');
          } else {
            this.setView('settings');
          }
        },
        /** Polls SPA route transitions to refresh idle state or trigger auto-start when enabled. */
        tick() {
          const path = route.path();
          if (path !== this.lastPath) {
            this.lastPath = path;
            runner.onRouteChange({
              panelOpen: !this.els.panel.hidden,
              inWorkView: this.panelView === 'work',
            });
            this.render();
          }
          if (store.state.phase !== 'idle' || !prefs.data.auto) return;
          if (this.seen === path) return;
          const usable = route.isTask(path) || Boolean(route.courseId());
          if (!usable || !this.els.settings.hidden) return;
          this.seen = path;
          runner.start().catch(error => {
            if (!isAbortError(error)) runner.log(error.message, MSG_LEVEL.WARN);
          });
        },
        startWatcher() {
          this.lastPath = route.path();
          this.render();
          this.tick();
          this.onPopState = () => this.tick();
          window.addEventListener('popstate', this.onPopState);
          this.watchTimer = setInterval(() => {
            if (!this.host?.isConnected) {
              this.destroy();
              return;
            }
            this.tick();
          }, TIMING.uiTick);
        },
        destroy() {
          clearInterval(this.watchTimer);
          this.watchTimer = 0;
          clearTimeout(this.toastTimer);
          this.toastTimer = 0;
          if (this.pending) {
            cancelRaf(this.pending);
            this.pending = 0;
          }
          if (this.onPopState) {
            window.removeEventListener('popstate', this.onPopState);
            this.onPopState = null;
          }
          dock.destroy();
          this.unsubscribe?.();
          this.unsubscribe = null;
        },
      };

      return view;
    }
    return { createView };
  })();

  // --- src/main.js ---
  const { Prefs } = mod_config_prefs;
  const { AiSettings } = mod_config_ai_settings;
  const { TemplateCache } = mod_config_template_cache;
  const { Route } = mod_platform_route;
  const { Scanner } = mod_platform_scanner;
  const { AiClient } = mod_ai_client;
  const { Solver } = mod_solver_solver;
  const { createStore } = mod_runner_store;
  const { createRunner } = mod_runner_runner;
  const { createView } = mod_ui_view;

  /**
   * Initializes preferences, mounts the Shadow DOM assistant dock, and starts the SPA route watcher.
   */
  function boot() {
    Prefs.load();
    AiSettings.load();
    const store = createStore();
    const runner = createRunner({
      store,
      prefs: Prefs,
      route: Route,
      scanner: Scanner,
      solver: Solver,
    });
    const view = createView({
      store,
      runner,
      prefs: Prefs,
      aiSettings: AiSettings,
      aiClient: AiClient,
      templateCache: TemplateCache,
      route: Route,
    });
    view.build();
    view.startWatcher();
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
