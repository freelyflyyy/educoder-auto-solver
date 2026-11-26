import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

const REGEX_PREV_TOKENS = new Set([
  '', '(', '[', '{', ',', ';', ':', '?', '=', '!', '~', '&', '|', '^', '+', '-', '*', '/', '%', '<', '>', '=>',
  'return', 'throw', 'case', 'delete', 'void', 'typeof', 'in', 'instanceof', 'new', 'await', 'yield', 'else', 'do', 'of',
]);

function normalizeRel(filePath, rootDir) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function moduleVarName(relPath) {
  return 'mod_' + relPath.replace(/^src\//, '').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9]+/g, '_');
}

function escapeTemplateLiteral(text) {
  return String(text)
    .replace(/\r\n/g, '\n')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

export function createDefaultSpecialModules(rootDir = ROOT_DIR) {
  return {
    'src/ui/assets.js': () => {
      const css = escapeTemplateLiteral(readFileSync(path.join(rootDir, 'src/ui/panel.css'), 'utf8'));
      const html = escapeTemplateLiteral(readFileSync(path.join(rootDir, 'src/ui/panel.html'), 'utf8'));
      return {
        deps: [],
        exports: ['PANEL_CSS', 'PANEL_HTML'],
        body: `const PANEL_CSS = \`${css}\`;\nconst PANEL_HTML = \`${html}\`;`,
      };
    },
    'src/script/assets.js': () => {
      const answerhook = readFileSync(path.join(rootDir, 'src/script/answerhook.sh'), 'utf8');
      return {
        deps: [],
        exports: ['ANSWER_HOOK_SCRIPT'],
        body: `const ANSWER_HOOK_SCRIPT = ${JSON.stringify(answerhook)};`,
      };
    },
  };
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '');
}

function parseNamedSpecifiers(raw, isExport) {
  const cleaned = stripComments(raw);
  const entries = [];
  for (const part of cleaned.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = /^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(trimmed);
    if (!match) {
      throw new Error(`Unsupported ${isExport ? 'export' : 'import'} specifier: "${trimmed}"`);
    }
    const local = match[1];
    const exported = match[2] || local;
    if (local === 'default' || exported === 'default') {
      throw new Error(`Unsupported default ${isExport ? 'export' : 'import'}: "${trimmed}"`);
    }
    entries.push(local === exported ? local : (isExport ? `${exported}: ${local}` : `${local}: ${exported}`));
  }
  return entries;
}

function isIdentStart(ch) {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentChar(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

/**
 * Comment-, string-, template-, and regex-aware top-level ESM scanner & rewriter.
 */
export function parseAndTransformModule(code, relPath, resolveImport) {
  const deps = [];
  const exportsList = [];
  const edits = [];

  let i = 0;
  let depth = 0;
  let state = 'code'; // 'code' | 'template'
  const templateBraceStack = [];
  let lastSigToken = '';

  const skipWhitespaceAndComments = pos => {
    let cursor = pos;
    while (cursor < code.length) {
      const ch = code[cursor];
      if (/\s/.test(ch)) {
        cursor += 1;
      } else if (ch === '/' && code[cursor + 1] === '/') {
        cursor += 2;
        while (cursor < code.length && code[cursor] !== '\n') cursor += 1;
      } else if (ch === '/' && code[cursor + 1] === '*') {
        cursor += 2;
        while (cursor < code.length && !(code[cursor] === '*' && code[cursor + 1] === '/')) cursor += 1;
        cursor += 2;
      } else {
        break;
      }
    }
    return cursor;
  };

  const skipQuoted = (start, quote) => {
    let cursor = start + 1;
    while (cursor < code.length) {
      const ch = code[cursor];
      if (ch === '\\') {
        cursor += 2;
      } else if (ch === quote) {
        return cursor + 1;
      } else {
        cursor += 1;
      }
    }
    throw new Error(`Unterminated string literal in ${relPath}`);
  };

  const skipRegex = start => {
    let cursor = start + 1;
    let inCharClass = false;
    while (cursor < code.length) {
      const ch = code[cursor];
      if (ch === '\\') {
        cursor += 2;
      } else if (ch === '[') {
        inCharClass = true;
        cursor += 1;
      } else if (ch === ']' && inCharClass) {
        inCharClass = false;
        cursor += 1;
      } else if (ch === '/' && !inCharClass) {
        cursor += 1;
        while (cursor < code.length && /[a-z]/i.test(code[cursor])) cursor += 1;
        return cursor;
      } else if (ch === '\n' || ch === '\r') {
        return start + 1;
      } else {
        cursor += 1;
      }
    }
    return start + 1;
  };

  const scanStatementEnd = start => {
    let cursor = start;
    let braceDepth = 0;
    while (cursor < code.length) {
      const ch = code[cursor];
      if (ch === '\'' || ch === '"') {
        cursor = skipQuoted(cursor, ch);
        const afterQuote = skipWhitespaceAndComments(cursor);
        if (braceDepth === 0 && code[afterQuote] !== ';' && code[afterQuote] !== '\n') {
          // Continue if more tokens follow on same line, else terminate cleanly
        }
        continue;
      }
      if (ch === '/' && code[cursor + 1] === '/') {
        cursor += 2;
        while (cursor < code.length && code[cursor] !== '\n') cursor += 1;
        continue;
      }
      if (ch === '/' && code[cursor + 1] === '*') {
        cursor += 2;
        while (cursor < code.length && !(code[cursor] === '*' && code[cursor + 1] === '/')) cursor += 1;
        cursor += 2;
        continue;
      }
      if (ch === '{') braceDepth += 1;
      else if (ch === '}' && braceDepth > 0) braceDepth -= 1;
      else if (ch === ';' && braceDepth === 0) return cursor + 1;
      cursor += 1;
    }
    return cursor;
  };

  const handleImport = start => {
    const end = scanStatementEnd(start);
    const stmt = code.slice(start, end);
    const sideEffect = /^import\s+(['"])([^'"]+)\1\s*;?$/.exec(stmt);
    if (sideEffect) {
      resolveImport(sideEffect[2], deps);
      edits.push([start, end, '']);
      return end;
    }
    const nsMatch = /^import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s+(['"])([^'"]+)\2\s*;?$/.exec(stmt);
    if (nsMatch) {
      const modVar = resolveImport(nsMatch[3], deps);
      edits.push([start, end, `const ${nsMatch[1]} = ${modVar};`]);
      return end;
    }
    const namedMatch = /^import\s*\{([\s\S]*?)\}\s*from\s+(['"])([^'"]+)\2\s*;?$/.exec(stmt);
    if (namedMatch) {
      const modVar = resolveImport(namedMatch[3], deps);
      const specifiers = parseNamedSpecifiers(namedMatch[1], false);
      const replacement = specifiers.length
        ? `const { ${specifiers.join(', ')} } = ${modVar};`
        : '';
      edits.push([start, end, replacement]);
      return end;
    }
    throw new Error(`Unsupported import statement in ${relPath}:\n${stmt}`);
  };

  const handleExport = start => {
    const afterKeyword = skipWhitespaceAndComments(start + 6);
    if (code[afterKeyword] === '{') {
      const closeIdx = code.indexOf('}', afterKeyword + 1);
      if (closeIdx < 0) throw new Error(`Unterminated export block in ${relPath}`);
      let end = closeIdx + 1;
      const semiCheck = skipWhitespaceAndComments(end);
      if (code[semiCheck] === ';') end = semiCheck + 1;
      const stmt = code.slice(start, end);
      if (/^\s*export\s*\{[\s\S]*\}\s*from\b/.test(code.slice(start, Math.min(code.length, end + 16)))) {
        throw new Error(`Unsupported re-export statement in ${relPath}: ${stmt}`);
      }
      const entries = parseNamedSpecifiers(code.slice(afterKeyword + 1, closeIdx), true);
      exportsList.push(...entries);
      edits.push([start, end, '']);
      return end;
    }

    const tail = code.slice(afterKeyword, afterKeyword + 120);
    if (/^(?:default|let|var)\b/.test(tail) || tail.startsWith('*')) {
      throw new Error(`Unsupported export form in ${relPath}: "export ${tail.split(/\s+/)[0]}"`);
    }

    const declMatch = /^(?:(async\s+function)|function|class|const)\s+([A-Za-z_$][\w$]*)\b/.exec(tail);
    if (!declMatch) {
      throw new Error(`Unsupported export declaration in ${relPath}: "export ${tail.slice(0, 40)}"`);
    }

    const exportedName = declMatch[2];
    exportsList.push(exportedName);
    edits.push([start, afterKeyword, '']);
    return afterKeyword;
  };

  while (i < code.length) {
    if (state === 'template') {
      const ch = code[i];
      if (ch === '\\') {
        i += 2;
      } else if (ch === '$' && code[i + 1] === '{') {
        templateBraceStack.push(depth);
        depth += 1;
        state = 'code';
        lastSigToken = '${';
        i += 2;
      } else if (ch === '`') {
        state = 'code';
        lastSigToken = 'LITERAL';
        i += 1;
      } else {
        i += 1;
      }
      continue;
    }

    const ch = code[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '/' && code[i + 1] === '/') {
      i += 2;
      while (i < code.length && code[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (ch === '\'' || ch === '"') {
      i = skipQuoted(i, ch);
      lastSigToken = 'LITERAL';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      i += 1;
      continue;
    }
    if (ch === '/' && REGEX_PREV_TOKENS.has(lastSigToken)) {
      i = skipRegex(i);
      lastSigToken = 'LITERAL';
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') {
      depth += 1;
      lastSigToken = ch;
      i += 1;
      continue;
    }
    if (ch === '}' || ch === ')' || ch === ']') {
      depth -= 1;
      if (ch === '}' && templateBraceStack.length && depth === templateBraceStack[templateBraceStack.length - 1]) {
        templateBraceStack.pop();
        state = 'template';
      } else {
        lastSigToken = ch;
      }
      i += 1;
      continue;
    }
    if (isIdentStart(ch)) {
      const start = i;
      i += 1;
      while (i < code.length && isIdentChar(code[i])) i += 1;
      const ident = code.slice(start, i);
      if (depth === 0 && lastSigToken !== '.' && (ident === 'import' || ident === 'export')) {
        const nextChar = code[i] || '';
        if (/\s|\{|\*|'|\"/.test(nextChar)) {
          i = ident === 'import' ? handleImport(start) : handleExport(start);
          lastSigToken = ';';
          continue;
        }
        if (ident === 'import' && nextChar === '(') {
          throw new Error(`Dynamic import() is not supported in ${relPath}`);
        }
      }
      lastSigToken = ident;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      i += 1;
      while (i < code.length && /[0-9a-zA-Z_.]/.test(code[i])) i += 1;
      lastSigToken = 'NUMBER';
      continue;
    }
    if (ch === '=' && code[i + 1] === '>') {
      lastSigToken = '=>';
      i += 2;
      continue;
    }
    lastSigToken = ch;
    i += 1;
  }

  let output = '';
  let cursor = 0;
  for (const [start, end, replacement] of edits) {
    output += code.slice(cursor, start) + replacement;
    cursor = end;
  }
  output += code.slice(cursor);
  output = output.replace(/^\n+/, '').replace(/\n+$/, '');

  return { deps, exports: exportsList, body: output };
}

function indentBlock(text, spaces = 2) {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map(line => (line.length ? pad + line : ''))
    .join('\n');
}

/**
 * Bundles local ESM modules topologically from `entryPath` or `entryPaths`.
 */
export function bundleModules({
  entryPath,
  entryPaths,
  rootDir = ROOT_DIR,
  specialModules = createDefaultSpecialModules(rootDir),
  inlineEntry = Boolean(entryPath && !entryPaths),
} = {}) {
  const entries = (entryPaths || [entryPath]).map(p => path.resolve(rootDir, p));
  const visited = new Set();
  const visiting = new Set();
  const stack = [];
  const ordered = [];
  const moduleVars = new Map();

  function loadModule(absPath) {
    const relPath = normalizeRel(absPath, rootDir);
    if (Object.hasOwn(specialModules, relPath)) {
      return specialModules[relPath](absPath, relPath);
    }
    const source = readFileSync(absPath, 'utf8');
    return parseAndTransformModule(source, relPath, (specifier, deps) => {
      if (!specifier.startsWith('.')) {
        throw new Error(`Unsupported non-relative import "${specifier}" in ${relPath}`);
      }
      const targetAbs = path.resolve(path.dirname(absPath), specifier);
      const targetRel = normalizeRel(targetAbs, rootDir);
      deps.push(targetAbs);
      return moduleVarName(targetRel);
    });
  }

  function visit(absPath) {
    const relPath = normalizeRel(absPath, rootDir);
    if (visited.has(absPath)) return;
    if (visiting.has(absPath)) {
      const cycleStart = stack.indexOf(relPath);
      const cycle = [...stack.slice(cycleStart), relPath].join(' -> ');
      throw new Error(`Circular module dependency detected: ${cycle}`);
    }
    visiting.add(absPath);
    stack.push(relPath);

    const parsed = loadModule(absPath);
    for (const depAbs of parsed.deps) {
      visit(depAbs);
    }

    stack.pop();
    visiting.delete(absPath);
    visited.add(absPath);
    const modVar = moduleVarName(relPath);
    moduleVars.set(relPath, modVar);
    ordered.push({ absPath, relPath, modVar, ...parsed });
  }

  for (const entryAbs of entries) {
    visit(entryAbs);
  }

  const entryAbsSet = inlineEntry ? new Set([entries[0]]) : new Set();
  const chunks = [];
  for (const mod of ordered) {
    if (entryAbsSet.has(mod.absPath)) {
      chunks.push(`  // --- ${mod.relPath} ---\n${indentBlock(mod.body, 2)}`);
      continue;
    }
    const exportsLine = mod.exports.length ? `\n    return { ${mod.exports.join(', ')} };` : '';
    chunks.push(
      `  // --- ${mod.relPath} ---\n  const ${mod.modVar} = (() => {\n${indentBlock(mod.body, 4)}${exportsLine}\n  })();`,
    );
  }

  return {
    code: chunks.join('\n\n'),
    moduleVars,
    modules: ordered,
  };
}

export function buildUserscript(rootDir = ROOT_DIR) {
  const metadata = readFileSync(path.join(rootDir, 'src/metadata.txt'), 'utf8').trimEnd();
  const constantsSource = readFileSync(path.join(rootDir, 'src/core/constants.js'), 'utf8');
  const metaVersion = metadata.match(/^\/\/\s*@version\s+(\S+)$/m)?.[1];
  const codeVersion = constantsSource.match(/^export const VERSION = '([^']+)';$/m)?.[1];
  if (!metaVersion || !codeVersion || metaVersion !== codeVersion) {
    throw new Error(`Version mismatch: metadata="${metaVersion}" vs constants.js="${codeVersion}"`);
  }

  const { code, modules } = bundleModules({
    entryPath: 'src/main.js',
    rootDir,
    inlineEntry: true,
  });

  const output = `${metadata}\n\n(() => {\n  'use strict';\n  if (document.querySelector('tg-answer-assistant')) return;\n\n${code}\n})();\n`;
  new vm.Script(output, { filename: 'educoder-auto-solver.user.js' });
  return { output, moduleCount: modules.length, version: codeVersion };
}

function main() {
  const check = process.argv.includes('--check');
  const outPath = path.join(ROOT_DIR, 'educoder-auto-solver.user.js');
  const { output, moduleCount, version } = buildUserscript(ROOT_DIR);
  if (check) {
    const current = readFileSync(outPath, 'utf8');
    if (current !== output) {
      console.error('Build check failed: educoder-auto-solver.user.js is out of sync with src/. Run `npm run build`.');
      process.exit(1);
    }
    console.log(`Build check passed (${moduleCount} modules, v${version}, ${Buffer.byteLength(output)} bytes).`);
    return;
  }
  writeFileSync(outPath, output, 'utf8');
  console.log(`Built educoder-auto-solver.user.js (${moduleCount} modules, v${version}, ${Buffer.byteLength(output)} bytes).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
