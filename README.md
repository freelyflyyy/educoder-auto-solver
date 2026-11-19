<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="头歌自动答题助手 Logo" />

<h1>educoder-auto-solver</h1>

<h3>头歌自动答题助手 —— 纯接口协议驱动的头歌实训全自动答题方案</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Platform](https://img.shields.io/badge/Platform-ScriptCat%20%7C%20Tampermonkey-green.svg)](https://docs.scriptcat.org/)
[![Target](https://img.shields.io/badge/Target-Educoder-blue.svg)](https://www.educoder.net)
[![Architecture](https://img.shields.io/badge/Arch-Pure%20API%20%7C%20Zero%20DOM%20Jumps-critical.svg)]()
[![AI-Engine](https://img.shields.io/badge/AI-DeepSeek%20%7C%20OpenAI-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

</div>

**educoder-auto-solver（头歌自动答题助手）** 是一个专为头歌（Educoder）实训平台打造的高性能纯接口自动化答题脚本。通过逆向底层数据接口与协议流，实现 **自动扫描 → 任务排队 → 智能作答 → 评测提交** 的全链路流水线作业。

如果你厌倦了头歌繁琐的单步跳转与漫长的页面加载，受够了依赖脆弱 DOM 模拟点击的低效插件，或者你急需一个能真正自动化遍历班级作业、秒解选择题、并调用顶尖大模型直破编程关卡的终极方案 —— **头歌自动答题助手将是你的最终选择。**

---

## 核心特性

* **纯接口协议驱动（Zero DOM Jumps）**  
  彻底摒弃模拟浏览器点击、频繁重载页面和等待前端渲染的脆弱实现。底层完整实现平台专用 MD5 请求签名体系与会话管理，直接与 Educoder 后端 API 握手，全程无感、不跳页、不中断。
* **选择题精准透传（Instant Choice Probe）**  
  深入解析平台接口验证与评分逻辑，借助接口层探针机制精准解析题目标准答案。单选、多选全量覆盖，告别传统题库检索的滞后与错漏，实现 100% 满分秒答。
* **用例自适应硬编码（Testcase Bypass）**  
  对于公开所有测试用例的编程题，脚本自动解析输入与期望输出，动态生成最优映射表结构代码。无需经过大模型推理，零 Token 消耗、零延迟直通评测。
* **大模型代码引擎（AI Code Engine）**  
  深度集成 DeepSeek 及任何标准 OpenAI 兼容接口：
  * **深度推理支持**：原生适配 DeepSeek-R1 / V4-Pro 等推理模型，具备可调思考预算（Thinking Level）。
  * **视觉题目解析（Vision）**：自动抓取带登录态的题干公式、图表截图并编码传输，攻克多模态编程难题。
  * **失败自愈循环（Auto-Heal）**：评测未通过时，基于原始模板与失败日志自动发起多轮修正重试，直到全部用例绿灯。
* **全自动任务调度器（Smart Pipeline Runner）**  
  内置健壮的状态机调度体系。从班级作业列表或单项实训自动反向追溯构建关卡链，支持随时暂停、继续、步进以及实时跳过非代码类（StarUML / VNC / Logisim 等）图形化环境。

---

## 快速上手

### 1. 安装脚本管理器
推荐优先使用对现代脚本特性支持更好的 **[脚本猫 (ScriptCat)](https://docs.scriptcat.org/)**，亦可使用 **[Tampermonkey](https://www.tampermonkey.net/)**。

### 2. 安装脚本
1. 打开 [educoder-auto-solver.user.js](educoder-auto-solver.user.js) 并复制源码。
2. 在脚本管理器面板中新建脚本，粘贴源码并保存。

### 3. 打开头歌并使用
1. 登录并打开 [头歌实训平台](https://www.educoder.net/) 任意班级作业页或关卡页。
2. 点击页面右下角紫色的 **悬浮图标** 展开控制面板。
3. 点击 **「扫描关卡」**，脚本将自动拉取当前作业链条；确认后点击 **「开始答题」**，即可静待完成。

---

## AI 模型配置

脚本内置针对大语言模型代码生成的优化提示词与重试控制，在控制面板的 **「AI 配置」** 选项卡中进行设定：

| 配置项 | 推荐值 | 说明 |
| :--- | :--- | :--- |
| **接口地址 (Base URL)** | `https://api.deepseek.com/v1` | 兼容任意符合 OpenAI 标准的 API 端点（OneAPI / 阿里云百炼等） |
| **API Key** | `sk-xxxxxx` | 你的模型接口密钥（密钥仅持久化在本地浏览器 `localStorage`） |
| **模型名称 (Model)** | `deepseek-chat` / `deepseek-v4-pro` | 选择日常速度最快且代码能力出色的模型；需要深度推理可填 `deepseek-reasoner` |
| **思考深度 (Thinking)** | `auto` / `high` | 针对支持思考链的模型自动注入思考参数 |
| **多模态 (Vision)** | 根据需求勾选 | 当题干包含重要图片时自动上传供视觉模型理解 |

---

## 免责声明

* 本项目仅用于 **Web 前端逆向技术研究、API 协议安全分析以及自动化测试交流**。
* 请遵守所在高校、机构及头歌平台的用户守则与学术诚信规范，切勿将本工具用于不正当竞争或违规用途。
* 因不当使用本脚本所产生的一切后果与责任，均由使用者本人承担，与本项目作者无关。

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
