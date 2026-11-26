import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildUserscript } from '../build.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function createMockDomEnv() {
  const storageMap = new Map();
  const intervals = [];
  const timeouts = [];

  class MockElement {
    constructor(tagName = 'div') {
      this.tagName = String(tagName).toUpperCase();
      this.id = '';
      this.className = '';
      this.hidden = false;
      this.disabled = false;
      this.value = '';
      this.checked = false;
      this.type = '';
      this.name = '';
      this.min = '';
      this.max = 1;
      this.title = '';
      this.tabIndex = 0;
      this.textContent = '';
      this.dataset = {};
      this.style = {};
      this.attributes = new Map();
      this.listeners = new Map();
      this.children = [];
      this.parentNode = null;
      this.shadowRoot = null;
      this.offsetWidth = 320;
      this.offsetHeight = 200;
      this.scrollTop = 0;
      this.scrollHeight = 100;
      this.validity = { badInput: false, rangeUnderflow: false, rangeOverflow: false, stepMismatch: false };
      this.classList = {
        add() {},
        remove() {},
      };
    }
    get isConnected() {
      let cur = this;
      while (cur) {
        if (cur === doc.body) return true;
        cur = cur.parentNode;
      }
      return false;
    }
    get childElementCount() {
      return this.children.length;
    }
    get firstElementChild() {
      return this.children[0] || null;
    }
    get elements() {
      return this._collect(el => Boolean(el.name));
    }
    set innerHTML(html) {
      this._rawHtml = String(html);
      this.children = [];
      const idMatches = [...this._rawHtml.matchAll(/\bid="([^"]+)"/g)];
      this._byId = new Map();
      for (const [, id] of idMatches) {
        const tag = /<([a-z0-9-]+)[^>]*\bid="${id}"/i.exec(this._rawHtml)?.[1] || 'div';
        const el = new MockElement(tag);
        el.id = id;
        if (id === 'panel' || id === 'summary' || id === 'settings' || id === 'scanState' || id === 'toast' || id === 'pane-ai' || id === 'samplingHint') {
          el.hidden = true;
        }
        const nameMatch = new RegExp(`id="${id}"[^>]*name="([^"]+)"`).exec(this._rawHtml);
        if (nameMatch) el.name = nameMatch[1];
        if (new RegExp(`type="checkbox"[^>]*id="${id}"`).test(this._rawHtml)) el.type = 'checkbox';
        if (new RegExp(`type="number"[^>]*id="${id}"`).test(this._rawHtml)) el.type = 'number';
        el.parentNode = this;
        this._byId.set(id, el);
      }
      // Put form inputs inside forms for form.elements
      const general = this._byId.get('generalForm');
      if (general) {
        for (const id of ['delay', 'codeRetries', 'logRows', 'auto', 'titleProgress', 'aiFallback', 'sshBase', 'sshKey']) {
          const child = this._byId.get(id);
          if (child) { child.parentNode = general; general.children.push(child); }
        }
      }
      const ai = this._byId.get('aiForm');
      if (ai) {
        for (const id of ['aiBase', 'aiModel', 'aiKey', 'aiVision', 'aiTokens', 'aiTimeout', 'aiThinking', 'aiThinkLevel', 'aiSampling', 'aiTemperature', 'aiTopP', 'aiFreq', 'aiPres', 'aiJsonMode', 'aiExtra', 'aiPrompt']) {
          const child = this._byId.get(id);
          if (child) { child.parentNode = ai; ai.children.push(child); }
        }
      }
      const dock = new MockElement('div');
      dock.className = 'dock';
      this._dock = dock;
    }
    _collect(pred, acc = []) {
      for (const child of this.children) {
        if (pred(child)) acc.push(child);
        child._collect(pred, acc);
      }
      return acc;
    }
    attachShadow() {
      const shadow = new MockElement('#shadow-root');
      this.shadowRoot = shadow;
      return shadow;
    }
    getElementById(id) {
      return this._byId?.get(id) || null;
    }
    querySelector(selector) {
      if (selector === '.dock') return this._dock || null;
      if (selector === 'tg-answer-assistant') {
        return doc.body.children.find(el => el.tagName === 'TG-ANSWER-ASSISTANT') || null;
      }
      return null;
    }
    querySelectorAll(selector) {
      if (selector === '[role="tab"]') {
        return [this.getElementById('tab-general'), this.getElementById('tab-ai')].filter(Boolean);
      }
      return [];
    }
    append(...nodes) {
      for (const node of nodes) {
        node.parentNode = this;
        this.children.push(node);
      }
    }
    appendChild(node) {
      node.parentNode = this;
      this.children.push(node);
      return node;
    }
    replaceChildren(...nodes) {
      this.children = [];
      for (const node of nodes) this.appendChild(node);
    }
    remove() {
      if (!this.parentNode) return;
      this.parentNode.children = this.parentNode.children.filter(c => c !== this);
      this.parentNode = null;
    }
    setAttribute(k, v) { this.attributes.set(k, String(v)); }
    getAttribute(k) { return this.attributes.get(k) ?? null; }
    addEventListener(type, fn) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(fn);
    }
    removeEventListener() {}
    closest() { return null; }
    focus() {}
    getBoundingClientRect() { return { left: 10, top: 10, right: 110, width: 100, height: 40 }; }
    click() {
      if (this.onclick) this.onclick();
      for (const fn of this.listeners.get('click') || []) fn({ detail: 1 });
    }
  }

  const doc = {
    title: '头歌测试页',
    cookie: '',
    body: new MockElement('body'),
    createElement: tag => new MockElement(tag),
    createDocumentFragment: () => new MockElement('fragment'),
    querySelector: sel => doc.body.querySelector(sel),
    addEventListener() {},
    removeEventListener() {},
  };

  const win = {
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener() {},
    removeEventListener() {},
  };

  const storage = {
    getItem: k => (storageMap.has(k) ? storageMap.get(k) : null),
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: k => storageMap.delete(k),
  };

  return {
    doc,
    win,
    storage,
    intervals,
    timeouts,
    cleanup() {
      for (const id of intervals) clearInterval(id);
      for (const id of timeouts) clearTimeout(id);
    },
  };
}

test('Built educoder-auto-solver.user.js matches buildUserscript() output and metadata', () => {
  const built = buildUserscript(ROOT_DIR);
  const disk = readFileSync(path.join(ROOT_DIR, 'educoder-auto-solver.user.js'), 'utf8');
  assert.equal(disk, built.output, 'educoder-auto-solver.user.js must match build.mjs output');

  const meta = readFileSync(path.join(ROOT_DIR, 'src/metadata.txt'), 'utf8');
  assert.ok(disk.startsWith(meta), 'metadata header must match src/metadata.txt verbatim');
  assert.ok(disk.includes('// @version      1.2.0'));
  assert.ok(disk.includes('// @grant        GM_xmlhttpRequest'));
  assert.ok(!disk.includes('node:fs'));
  assert.ok(!disk.includes('readFileSync'));

  new vm.Script(disk, { filename: 'educoder-auto-solver.user.js' });

  for (const requiredId of [
    'pill', 'pillCount', 'panel', 'status', 'gear', 'hide', 'work', 'summary', 'settings',
    'course', 'current', 'metric', 'bar', 'rescan', 'scanState', 'rows', 'logs', 'start', 'stop',
    'again', 'retry', 'generalForm', 'aiForm', 'toast',
  ]) {
    assert.ok(disk.includes(`id="${requiredId}"`), `missing UI id="${requiredId}"`);
  }
});

test('Bundled userscript boots cleanly inside a mock browser VM context', async () => {
  const disk = readFileSync(path.join(ROOT_DIR, 'educoder-auto-solver.user.js'), 'utf8');
  const env = createMockDomEnv();

  const context = {
    document: env.doc,
    window: env.win,
    location: {
      origin: 'https://www.educoder.net',
      pathname: '/classrooms/c1',
      search: '',
      href: 'https://www.educoder.net/classrooms/c1',
    },
    localStorage: env.storage,
    sessionStorage: env.storage,
    GM_xmlhttpRequest: opts => {
      queueMicrotask(() => {
        if (opts.url.includes('/courses.json')) {
          opts.onload({ status: 200, response: { status: 0, courses: [{ identifier: 'c1', name: '数据结构' }] } });
        } else if (opts.url.includes('homework_commons.json')) {
          opts.onload({ status: 200, response: { status: 0, homeworks: [] } });
        } else {
          opts.onload({ status: 200, response: { status: 0 } });
        }
      });
      return { abort() {} };
    },
    setTimeout: (fn, ms) => {
      const id = setTimeout(fn, ms);
      env.timeouts.push(id);
      return id;
    },
    clearTimeout,
    setInterval: (fn, ms) => {
      const id = setInterval(fn, ms);
      env.intervals.push(id);
      return id;
    },
    clearInterval,
    URL,
    URLSearchParams,
    TextDecoder,
    Uint8Array,
    DataView,
    AbortController,
    btoa: str => Buffer.from(str, 'binary').toString('base64'),
    atob: str => Buffer.from(str, 'base64').toString('binary'),
    console,
  };

  try {
    vm.runInNewContext(disk, context, { filename: 'educoder-auto-solver.user.js' });
    const host = env.doc.querySelector('tg-answer-assistant');
    assert.ok(host, 'boot() should mount <tg-answer-assistant> host element');
    assert.ok(host.shadowRoot, 'boot() should attach open shadowRoot');
    assert.equal(host.shadowRoot.getElementById('status').textContent, '准备就绪');
    assert.equal(host.shadowRoot.getElementById('pillCount').textContent, '0/0');

    // Open panel via pill -> triggers scan -> updates course & logs
    host.shadowRoot.getElementById('pill').click();
    assert.equal(host.shadowRoot.getElementById('panel').hidden, false);
    await new Promise(r => setTimeout(r, 40));
    assert.equal(host.shadowRoot.getElementById('course').textContent, '数据结构');
    assert.ok(host.shadowRoot.getElementById('logs').children.length >= 1);

    // Open settings and close back without errors
    host.shadowRoot.getElementById('gear').click();
    assert.equal(host.shadowRoot.getElementById('settings').hidden, false);
    host.shadowRoot.getElementById('gear').click();
    assert.equal(host.shadowRoot.getElementById('work').hidden, false);

    // Trigger summary view via stop button
    host.shadowRoot.getElementById('stop').click();
    assert.equal(host.shadowRoot.getElementById('summary').hidden, false);
    assert.equal(host.shadowRoot.getElementById('status').textContent, '已完成');
  } finally {
    env.cleanup();
  }
});
