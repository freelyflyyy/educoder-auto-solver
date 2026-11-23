import { STORAGE_KEYS } from '../core/constants.js';
import { numericSetting, readStoredObject } from '../core/utils.js';

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
export function createAiSettings() {
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

export const AiSettings = createAiSettings();
