import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { AK, ERROR_TEXT, SK } from '../src/core/constants.js';
import { md5Ascii, Crypto } from '../src/core/crypto.js';
import {
  abortError,
  decodeHtmlToText,
  isAbortError,
  mapWithConcurrency,
  norm,
  normalizeMatchRule,
  numericSetting,
  sleep,
  splitPaths,
} from '../src/core/utils.js';
import { Session } from '../src/core/session.js';
import { gmRequest, Http } from '../src/core/transport.js';

function withGlobals(overrides, fn) {
  const saved = new Map();
  for (const [key, value] of Object.entries(overrides)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  return Promise.resolve().then(fn).finally(() => {
    for (const [key, desc] of saved.entries()) {
      if (desc) Object.defineProperty(globalThis, key, desc);
      else delete globalThis[key];
    }
  });
}

test('Crypto.md5Ascii matches Node crypto MD5 across block sizes', () => {
  const samples = [
    '',
    'a',
    'abc',
    'message digest',
    'a'.repeat(55),
    'a'.repeat(56),
    'a'.repeat(64),
    'a'.repeat(130),
    `method=GET&ak=${AK}&sk=${SK}&time=1730000000000`,
  ];
  for (const input of samples) {
    const expected = createHash('md5').update(input, 'ascii').digest('hex');
    assert.equal(md5Ascii(input), expected, `MD5 mismatch for len=${input.length}`);
  }
});

test('Crypto.sign builds valid timestamp and MD5(base64(payload)) signature', () => {
  const [ts, sig] = Crypto.sign('POST');
  assert.equal(typeof ts, 'number');
  const payload = `method=POST&ak=${AK}&sk=${SK}&time=${ts}`;
  const expected = createHash('md5').update(Buffer.from(payload, 'ascii').toString('base64'), 'ascii').digest('hex');
  assert.equal(sig, expected);
});

test('sleep resolves normally and aborts promptly on AbortSignal', async () => {
  await sleep(10);

  const already = new AbortController();
  already.abort();
  await assert.rejects(sleep(5000, already.signal), err => isAbortError(err) && err.code === 'ABORTED');

  const controller = new AbortController();
  const started = Date.now();
  setTimeout(() => controller.abort(), 15);
  await assert.rejects(sleep(5000, controller.signal), err => isAbortError(err));
  assert.ok(Date.now() - started < 200, 'sleep should reject promptly on abort');
});

test('mapWithConcurrency caps concurrency, preserves order, and honors abort', async () => {
  assert.deepEqual(await mapWithConcurrency([], 3, async x => x), []);

  let active = 0;
  let peak = 0;
  const delays = [40, 5, 25, 10, 15];
  const results = await mapWithConcurrency(delays, 2, async (ms, idx) => {
    active += 1;
    peak = Math.max(peak, active);
    await sleep(ms);
    active -= 1;
    return `${idx}:${ms}`;
  });
  assert.ok(peak <= 2, `peak concurrency was ${peak}`);
  assert.deepEqual(results, ['0:40', '1:5', '2:25', '3:10', '4:15']);

  const ac = new AbortController();
  await assert.rejects(
    mapWithConcurrency([1, 2, 3, 4], 2, async item => {
      if (item === 2) ac.abort();
      await sleep(20);
      return item;
    }, ac.signal),
    err => isAbortError(err),
  );
});

test('utils helpers normalize text, paths, rules, numbers, and HTML entities', () => {
  assert.equal(norm('  ａｂｃ \n\t 123  '), 'abc 123');
  assert.deepEqual(splitPaths('a/b.py； c/d.py ; '), ['a/b.py', 'c/d.py']);
  assert.equal(normalizeMatchRule([{ matchRule: '  regex ' }], {}), 'regex');
  assert.equal(normalizeMatchRule([], { ignore_space: 1 }), 'full 且忽略空格');
  assert.equal(normalizeMatchRule([], { ignore_space: 0 }), 'full');
  assert.equal(numericSetting('12', 1, 20, 5, true), 12);
  assert.equal(numericSetting('12.5', 1, 20, 5, true), 5);
  assert.equal(numericSetting('', 1, 20, 5), 5);
  assert.equal(numericSetting(99, 1, 20, 5), 5);
  assert.equal(
    decodeHtmlToText('<p>Hello &amp; &#65; &#x42; &nbsp;world</p><div>next</div>'),
    'Hello & A B  world\nnext',
  );
  assert.equal(isAbortError(abortError()), true);
});

test('Session parses auth cookies in single pass preserving first match and equals signs', async () => {
  await withGlobals({
    document: {
      cookie: 'other=1; _educoder_session=tok==1; autologin_trustie=auto-xyz; _educoder_session=ignored',
    },
    location: { search: '?zzud=tenant-9' },
    sessionStorage: { getItem: () => null },
    localStorage: { getItem: () => null },
  }, () => {
    assert.deepEqual(Session.authSnapshot(), {
      session: 'tok==1',
      cookie: 'autologin_trustie=auto-xyz; _educoder_session=tok==1',
    });
    assert.equal(Session.zzud(), 'tenant-9');
  });
});

test('gmRequest aborts underlying request on timeout and AbortSignal', async () => {
  let abortCalled = 0;
  await withGlobals({
    GM_xmlhttpRequest: () => ({
      abort() { abortCalled += 1; },
    }),
  }, async () => {
    await assert.rejects(
      gmRequest({ url: 'https://example.test', timeout: 500, guardMs: 20, guardMessage: '超时测试' }),
      err => err.code === 'TIMEOUT' && err.message === '超时测试',
    );
    assert.equal(abortCalled, 1);

    const ac = new AbortController();
    setTimeout(() => ac.abort(), 15);
    await assert.rejects(
      gmRequest({ url: 'https://example.test', timeout: 500, guardMs: 500 }, ac.signal),
      err => isAbortError(err),
    );
    assert.equal(abortCalled, 2);
  });
});

test('Http retries GET once on timeout/network, never retries POST or ABORTED, and maps ERROR_TEXT', async () => {
  const calls = [];
  await withGlobals({
    document: { cookie: '_educoder_session=sess1' },
    location: { search: '' },
    sessionStorage: { getItem: () => null },
    localStorage: { getItem: () => null },
    GM_xmlhttpRequest: opts => {
      calls.push(opts.method);
      if (calls.length === 1) {
        queueMicrotask(() => opts.ontimeout());
      } else {
        queueMicrotask(() => opts.onload({ status: 200, response: { status: 0, ok: true } }));
      }
      return { abort() {} };
    },
  }, async () => {
    // Speed up retry backoff by verifying retry occurs on GET timeout -> success
    // Wait: TIMING.httpRetryBackoff is 1500ms; test fast failure on POST & ERROR_TEXT too
    const origSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn, ms, ...args) => origSetTimeout(fn, Math.min(ms, 5), ...args);
    try {
      const res = await Http.get('/ping');
      assert.deepEqual(res, { status: 0, ok: true });
      assert.deepEqual(calls, ['GET', 'GET']);
    } finally {
      globalThis.setTimeout = origSetTimeout;
    }
  });

  // POST should not retry on timeout
  const postCalls = [];
  await withGlobals({
    document: { cookie: '' },
    location: { search: '' },
    sessionStorage: { getItem: () => null },
    localStorage: { getItem: () => null },
    GM_xmlhttpRequest: opts => {
      postCalls.push(opts.method);
      queueMicrotask(() => opts.ontimeout());
      return { abort() {} };
    },
  }, async () => {
    await assert.rejects(Http.post('/submit', { a: 1 }), err => err.code === 'TIMEOUT');
    assert.equal(postCalls.length, 1);
  });

  // ERROR_TEXT mapping
  await withGlobals({
    document: { cookie: '' },
    location: { search: '' },
    sessionStorage: { getItem: () => null },
    localStorage: { getItem: () => null },
    GM_xmlhttpRequest: opts => {
      queueMicrotask(() => opts.onload({ status: 200, response: { status: 401 } }));
      return { abort() {} };
    },
  }, async () => {
    await assert.rejects(Http.get('/tasks/1.json'), err => err.code === 401 && err.message === ERROR_TEXT[401]);
  });

  // Abort does not retry GET
  const abortCalls = [];
  const ac = new AbortController();
  await withGlobals({
    document: { cookie: '' },
    location: { search: '' },
    sessionStorage: { getItem: () => null },
    localStorage: { getItem: () => null },
    GM_xmlhttpRequest: opts => {
      abortCalls.push(opts.method);
      queueMicrotask(() => ac.abort());
      return { abort() {} };
    },
  }, async () => {
    await assert.rejects(Http.get('/slow', ac.signal), err => isAbortError(err));
    assert.equal(abortCalls.length, 1);
  });
});
