const HTML_ENTITIES = Object.freeze({
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
});

/** Creates a standardized cancellation error for aborting active polling loops. */
export function abortError() {
  const error = new Error('已中断');
  error.code = 'ABORTED';
  return error;
}

export function isAbortError(error) {
  return Boolean(error && (error.code === 'ABORTED' || error.name === 'AbortError'));
}

/** Cooperative cancellable sleep supporting optional `AbortSignal`. */
export function sleep(ms, signal = null) {
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

export const raf = typeof requestAnimationFrame === 'function'
  ? callback => requestAnimationFrame(callback)
  : callback => setTimeout(callback, 16);

export const norm = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();

export const splitPaths = raw => String(raw ?? '').split(/[；;]/).map(part => part.trim()).filter(Boolean);

/** Resolves the output comparison rule declared by test sets or challenge metadata. */
export function normalizeMatchRule(sets, challenge) {
  const hit = (sets || []).map(item => String(item.matchRule || '').trim()).find(Boolean);
  if (hit) return hit;
  return Number(challenge?.ignore_space) === 1 ? 'full 且忽略空格' : 'full';
}

/** Converts Educoder HTML problem descriptions into plain text. */
export function decodeHtmlToText(html) {
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
export function readStoredObject(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

export function numericSetting(value, min, max, fallback, integer = false) {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max && (!integer || Number.isInteger(number))
    ? number
    : fallback;
}

/** Executes an async mapper over `items` with bounded concurrency while preserving output order. */
export async function mapWithConcurrency(items, limit, worker, signal = null) {
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
