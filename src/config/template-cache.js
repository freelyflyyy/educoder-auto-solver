import { STORAGE_KEYS } from '../core/constants.js';
import { readStoredObject } from '../core/utils.js';

/**
 * Bounded LRU cache backed by an in-memory `Map` and synchronized to `localStorage`.
 */
export function createTemplateCache(limit = 300) {
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

export const TemplateCache = createTemplateCache();
