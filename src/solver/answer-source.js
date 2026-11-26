import { abortError, isAbortError } from '../core/utils.js';
import { Api } from '../platform/api.js';
import { TemplateCache } from '../config/template-cache.js';

/**
 * Grading-first intelligence collector for extracting native answers before invoking AI models.
 *
 * Inspects three platform-provided data sources per challenge:
 * 1. Co-located `evaluate.py` grading scripts (literal assertions for text fill-in-the-blank tasks)
 * 2. Official reference solutions (`GET /tasks/{game}/get_answer_info.json`)
 * 3. Full evaluation test sets (`GET /tasks/{game}/check_test_sets.json`, including hidden cases)
 */
export function createAnswerSource({ api = Api, templateCache = TemplateCache } = {}) {
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

export const AnswerSource = createAnswerSource();
