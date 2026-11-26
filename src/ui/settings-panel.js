import { MSG_LEVEL } from '../core/constants.js';
import { Prefs } from '../config/prefs.js';
import { AiSettings } from '../config/ai-settings.js';
import { TemplateCache } from '../config/template-cache.js';
import { AiClient } from '../ai/client.js';

/**
 * Settings form controller handling validation, persistence, tab navigation, and live AI connectivity tests.
 */
export function createSettingsPanel({
  prefs = Prefs,
  aiSettings = AiSettings,
  templateCache = TemplateCache,
  aiClient = AiClient,
} = {}) {
  return {
    ui: null,
    notify: null,
    els: null,
    general: null,
    ai: null,
    locked: false,
    testing: false,
    lastSyncLocked: null,
    lastSyncTesting: null,
    mount(ui, notify, returnToWork) {
      this.ui = ui;
      this.notify = notify;
      const $ = id => ui.getElementById(id);
      this.els = {
        generalForm: $('generalForm'),
        aiForm: $('aiForm'),
        aiBase: $('aiBase'),
        aiModel: $('aiModel'),
        aiThinking: $('aiThinking'),
        aiSampling: $('aiSampling'),
        aiExtra: $('aiExtra'),
        aiState: $('aiState'),
        samplingFields: $('samplingFields'),
        samplingChoice: $('samplingChoice'),
        temperatureField: $('temperatureField'),
        topPField: $('topPField'),
        aiTopP: $('aiTopP'),
        penaltyFields: $('penaltyFields'),
        samplingHint: $('samplingHint'),
        resetGeneral: $('resetGeneral'),
        resetAi: $('resetAi'),
        testAi: $('testAi'),
        clearTpl: $('clearTpl'),
        save: $('save'),
        saveAi: $('saveAi'),
      };
      this.general = this.els.generalForm;
      this.ai = this.els.aiForm;

      for (const el of [this.els.aiBase, this.els.aiModel, this.els.aiThinking, this.els.aiSampling]) {
        el.addEventListener('input', () => this.renderSampling());
      }

      this.general.onsubmit = event => {
        event.preventDefault();
        if (this.locked) return;
        try {
          prefs.save(this.read(this.general));
          this.write(this.general, prefs.data);
          returnToWork();
          notify('常规设置已保存', MSG_LEVEL.SUCCESS);
        } catch (error) {
          notify(`保存失败：${error.message}`, MSG_LEVEL.ERROR);
        }
      };

      this.ai.onsubmit = event => {
        event.preventDefault();
        if (this.locked || this.testing || !this.validateAi()) return;
        try {
          const saved = aiSettings.save(this.read(this.ai));
          this.write(this.ai, saved);
          this.renderSampling();
          this.renderAiState();
          const ready = aiSettings.ready(saved);
          notify(ready ? 'AI 模型配置已保存' : '配置已保存（尚未填写完整的 API Key）', ready ? MSG_LEVEL.SUCCESS : MSG_LEVEL.WARN);
        } catch (error) {
          if (error.message.includes('自定义请求参数')) this.revealField(this.els.aiExtra);
          notify(`保存失败：${error.message}`, MSG_LEVEL.ERROR);
        }
      };

      this.els.resetGeneral.onclick = () => this.restore(this.general, prefs.defaults);
      this.els.resetAi.onclick = () => {
        this.restore(this.ai, aiSettings.defaults);
        this.renderSampling();
      };
      this.els.testAi.onclick = () => this.testAi();
      this.els.clearTpl.onclick = () => {
        templateCache.clear();
        notify('本地代码模板缓存已清空', MSG_LEVEL.SUCCESS);
      };
      this.bindTabs(ui);
      this.load();
    },
    load() {
      this.write(this.general, prefs.data);
      const config = aiSettings.load();
      const { flash, thinking } = aiSettings.modelOptions(config);
      if (flash && thinking) config.topP = Math.max(0.95, config.topP);
      this.write(this.ai, config);
      this.renderSampling();
      this.renderAiState();
    },
    renderSampling() {
      const { els } = this;
      const cfg = aiSettings.normalize(this.read(this.ai));
      const { deepSeek, flash, thinking, chooseSampler, sampler, penalties } = aiSettings.modelOptions(cfg);
      els.samplingFields.hidden = sampler === null;
      els.samplingChoice.hidden = !chooseSampler;
      els.temperatureField.hidden = sampler !== 'temperature';
      els.topPField.hidden = sampler !== 'topP';
      els.aiTopP.min = flash ? '0.95' : '0.01';
      els.penaltyFields.hidden = !penalties;
      const notes = [];
      if (flash) notes.push(thinking ? 'Flash 思考模式下 top_p 有效范围为 0.95–1.00。' : 'Flash 非思考模式由服务端固定采样参数。');
      else if (thinking) notes.push('深度思考模式下由模型自动控制采样参数。');
      if (deepSeek) notes.push('DeepSeek 官方接口无需设置频率与存在惩罚。');
      else if (penalties) notes.push('代码生成场景建议将两项惩罚保持为 0。');
      els.samplingHint.textContent = notes.join(' ');
      els.samplingHint.hidden = !notes.length;
    },
    read(form) {
      return Object.fromEntries([...form.elements].filter(field => field.name).map(field =>
        [field.name, field.type === 'checkbox' ? field.checked : field.value],
      ));
    },
    write(form, values) {
      for (const field of form.elements) {
        if (!field.name || !Object.hasOwn(values, field.name)) continue;
        if (field.type === 'checkbox') field.checked = values[field.name];
        else field.value = values[field.name];
      }
    },
    revealField(field) {
      if (field.closest('[hidden]')) return;
      const advanced = field.closest('details');
      if (advanced) advanced.open = true;
      field.focus();
    },
    validateAi() {
      const invalid = [...this.ai.elements].find(field => {
        if (field.type !== 'number' || field.closest('[hidden]')) return false;
        const { badInput, rangeUnderflow, rangeOverflow, stepMismatch } = field.validity;
        return badInput || rangeUnderflow || rangeOverflow || (field.step === '1' && stepMismatch);
      });
      if (!invalid) return true;
      this.revealField(invalid);
      invalid.reportValidity();
      return false;
    },
    restore(form, defaults) {
      this.write(form, defaults);
      this.notify('已恢复为默认参数，点击保存后生效');
    },
    sync(locked) {
      const testing = Boolean(this.testing);
      if (this.lastSyncLocked === locked && this.lastSyncTesting === testing) return;
      this.lastSyncLocked = locked;
      this.lastSyncTesting = testing;
      this.locked = locked;
      const { els } = this;
      els.save.disabled = locked;
      els.resetGeneral.disabled = locked;
      els.clearTpl.disabled = locked;
      els.saveAi.disabled = locked || testing;
      els.resetAi.disabled = locked || testing;
      els.testAi.disabled = locked;
      els.testAi.setAttribute('aria-disabled', String(testing));
    },
    renderAiState() {
      const indicator = this.els.aiState;
      const ready = aiSettings.ready();
      indicator.textContent = this.testing
        ? '正在测试模型接口连通性…'
        : ready
          ? '✓ AI 模型已就绪，需要时可随时调用'
          : '尚未填写 API Key，当前仅使用免 AI 模式答题';
      indicator.className = this.testing ? MSG_LEVEL.INFO : ready ? MSG_LEVEL.SUCCESS : MSG_LEVEL.WARN;
    },
    async testAi() {
      if (this.locked || this.testing || !this.validateAi()) return;
      const config = aiSettings.normalize(this.read(this.ai));
      if (!aiSettings.ready(config)) {
        this.notify('请先填写接口地址、API Key 和模型名称', MSG_LEVEL.WARN);
        return;
      }
      this.testing = true;
      this.sync(this.locked);
      this.renderAiState();
      try {
        const reply = await aiClient.test(config);
        this.notify(`连接成功（模型回复：${reply.trim().slice(0, 16)}）`, MSG_LEVEL.SUCCESS);
      } catch (error) {
        if (error.message.includes('自定义请求参数')) this.revealField(this.els.aiExtra);
        this.notify(`连接失败：${error.message}`, MSG_LEVEL.ERROR);
      } finally {
        this.testing = false;
        this.sync(this.locked);
        this.renderAiState();
      }
    },
    bindTabs(ui) {
      const tabs = [...ui.querySelectorAll('[role="tab"]')];
      const select = selected => {
        for (const tab of tabs) {
          const active = tab === selected;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          ui.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
        }
      };
      for (const [index, tab] of tabs.entries()) {
        tab.onclick = () => select(tab);
        tab.onkeydown = event => {
          const nextIndex = {
            ArrowLeft: (index - 1 + tabs.length) % tabs.length,
            ArrowRight: (index + 1) % tabs.length,
            Home: 0,
            End: tabs.length - 1,
          }[event.key];
          if (nextIndex === undefined) return;
          event.preventDefault();
          const next = tabs[nextIndex];
          select(next);
          next.focus();
        };
      }
    },
  };
}
