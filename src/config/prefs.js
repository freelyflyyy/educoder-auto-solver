import { STORAGE_KEYS } from '../core/constants.js';
import { numericSetting, readStoredObject } from '../core/utils.js';

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
export function createPrefs() {
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

export const Prefs = createPrefs();
