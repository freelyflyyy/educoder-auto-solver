import { abortError, decodeHtmlToText } from '../core/utils.js';
import { AiSettings } from '../config/ai-settings.js';
import { AiRequestError } from './errors.js';
import { AiClient } from './client.js';

export const CODE_SYSTEM_PROMPT = [
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
export function createCodeGenerator({ aiSettings = AiSettings, aiClient = AiClient } = {}) {
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

export const CodeGenerator = createCodeGenerator();
