import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrefs } from '../src/config/prefs.js';
import { createAiSettings } from '../src/config/ai-settings.js';
import { createTemplateCache } from '../src/config/template-cache.js';

function createMemoryStorage() {
  const data = new Map();
  let getCount = 0;
  let setCount = 0;
  return {
    get getCount() { return getCount; },
    get setCount() { return setCount; },
    resetCounters() { getCount = 0; setCount = 0; },
    getItem(key) {
      getCount += 1;
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      setCount += 1;
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}

function withStorage(storage, fn) {
  const prev = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true });
  return Promise.resolve().then(fn).finally(() => {
    if (prev) Object.defineProperty(globalThis, 'localStorage', prev);
    else delete globalThis.localStorage;
  });
}

test('Prefs normalizes, persists, and validates SSH readiness', async () => {
  const storage = createMemoryStorage();
  await withStorage(storage, () => {
    const prefs = createPrefs();
    const initial = prefs.load();
    assert.deepEqual(initial, prefs.defaults);
    assert.equal(prefs.sshReady(), false);

    const saved = prefs.save({
      delay: 7,
      auto: true,
      codeRetries: 9,
      logRows: 24,
      titleProgress: false,
      aiFallback: true,
      sshBase: ' https://ssh.example.workers.dev ',
      sshKey: ' 1234567890abcdef ',
    });
    assert.deepEqual(saved, {
      delay: 1,
      auto: true,
      codeRetries: 2,
      logRows: 24,
      titleProgress: false,
      aiFallback: true,
      sshBase: 'https://ssh.example.workers.dev',
      sshKey: '1234567890abcdef',
    });
    assert.equal(prefs.sshReady(), true);

    const reloaded = createPrefs().load();
    assert.deepEqual(reloaded, saved);
  });
});

test('AiSettings caches reads, isolates copies, and validates endpoints & extraParams', async () => {
  const storage = createMemoryStorage();
  await withStorage(storage, () => {
    const ai = createAiSettings();
    const first = ai.load();
    first.topP = 0.5; // Mutating caller copy must not pollute internal cache
    assert.equal(ai.load().topP, ai.defaults.topP);
    assert.equal(storage.getCount, 1, 'subsequent load() hits memory cache without re-reading storage');
    assert.equal(ai.ready(), false);

    assert.throws(() => ai.endpoint('ftp://bad.host'), /HTTP 或 HTTPS/);
    assert.throws(() => ai.endpoint('https://user:pass@api.example.com/v1'), /HTTP 或 HTTPS/);
    assert.equal(ai.endpoint('https://api.example.com/v1/').pathname, '/v1/chat/completions');
    assert.equal(ai.endpoint('https://api.example.com/v1/chat/completions').pathname, '/v1/chat/completions');

    assert.throws(() => ai.extraParams('[]'), /有效的 JSON 对象/);
    assert.throws(() => ai.extraParams('{"model":"x"}'), /"model" 字段已由脚本自动管理/);
    assert.deepEqual(ai.extraParams('{"top_k":40}'), { top_k: 40 });

    const saved = ai.save({
      base: 'https://api.deepseek.com/v1',
      key: 'sk-test-123',
      model: 'deepseek-v4-flash',
      thinking: 'auto',
    });
    assert.equal(ai.ready(), true);
    assert.deepEqual(ai.modelOptions(saved, true), {
      deepSeek: true,
      flash: true,
      nativeThinking: true,
      thinking: true,
      chooseSampler: false,
      sampler: 'topP',
      penalties: false,
    });
  });
});

test('TemplateCache performs O(1) memory hits, LRU eviction, and batched setMany writes', async () => {
  const storage = createMemoryStorage();
  storage.setItem('tg.tpl.v1', JSON.stringify({ 'g0:a.py': 'old0' }));
  storage.resetCounters();

  await withStorage(storage, () => {
    const cache = createTemplateCache(3);
    assert.equal(cache.get('g0', 'a.py'), 'old0');
    assert.equal(cache.get('g0', 'a.py'), 'old0');
    assert.equal(storage.getCount, 1, 'repeated get() must not re-parse localStorage');
    assert.equal(storage.setCount, 0);

    // Identical write should not trigger storage.setItem
    cache.set('g0', 'a.py', 'old0');
    assert.equal(storage.setCount, 0);

    // Batched write of 3 new entries evicts oldest ('g0:a.py') with only 1 storage.setItem
    cache.setMany([
      ['g1', 'b.py', 'b'],
      ['g2', 'c.py', 'c'],
      ['g3', 'd.py', 'd'],
    ]);
    assert.equal(storage.setCount, 1);
    assert.equal(cache.get('g0', 'a.py'), null);
    assert.equal(cache.get('g1', 'b.py'), 'b');

    // Touching 'g1:b.py' makes 'g2:c.py' the oldest before next eviction
    cache.set('g4', 'e.py', 'e');
    assert.equal(cache.get('g2', 'c.py'), null);
    assert.equal(cache.get('g1', 'b.py'), 'b');

    cache.clear();
    assert.equal(cache.get('g1', 'b.py'), null);
    assert.equal(storage.getItem('tg.tpl.v1'), null);
  });
});
