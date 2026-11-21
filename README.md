<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="头歌自动答题助手 Logo" />

<h1>educoder-auto-solver</h1>

<h3>头歌自动答题助手 —— 纯接口协议驱动的头歌实训全自动答题方案</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Version](https://img.shields.io/badge/Version-1.1.0-blue.svg)]()
[![ScriptCat](https://img.shields.io/badge/ScriptCat-一键安装-orange.svg)](https://scriptcat.org/zh-CN/script-show-page/9163)
[![Platform](https://img.shields.io/badge/Platform-ScriptCat%20%7C%20Tampermonkey-green.svg)](https://docs.scriptcat.org/)
[![Target](https://img.shields.io/badge/Target-Educoder-blue.svg)](https://www.educoder.net)
[![Architecture](https://img.shields.io/badge/Arch-Pure%20API%20%7C%20Zero%20DOM%20Jumps-critical.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

</div>

**educoder-auto-solver（头歌自动答题助手）** 是一个专为头歌（Educoder）实训平台打造的高性能纯接口自动化答题脚本。通过逆向底层数据接口与评测协议流，实现 **自动扫描 → 任务排队 → 智能作答 → 评测提交** 的全链路流水线作业。

如果你厌倦了头歌繁琐的单步跳转与漫长的页面加载，受够了依赖脆弱 DOM 模拟点击的低效插件，或者你急需一个能真正自动化遍历班级作业、秒解选择题、并调用顶尖大模型直破编程关卡的终极方案 —— **头歌自动答题助手将是你的最终选择。**

---

## 核心特性

* **纯接口协议驱动（Zero DOM Jumps）**  
  彻底摒弃模拟浏览器点击、频繁重载页面和等待前端渲染的脆弱实现。底层完整实现平台专用 MD5 请求签名体系与会话管理，直接与 Educoder 后端 API 握手，全程无感、不跳页、不中断。
* **选择题精准透传（Instant Choice Probe）**  
  深入解析平台接口验证与评分逻辑，借助接口层探针机制精准解析题目标准答案。单选、多选全量覆盖，告别传统题库检索的滞后与错漏，实现 100% 满分秒答。
* **判分依据直读策略（Grading-First Strategy）**  
  平台随关卡一同下发了关键的判分代码与评测依据，脚本优先照抄原生数据，杜绝盲目让大模型瞎猜：
  * **文本填空题**：自动读取作答文件同目录下的 `evaluate.py` 判分脚本，反向提取 `s == "…"` 断言字面量秒填。
  * **编程关三级阶梯**：**参考答案 ➔ 全量用例查表映射 ➔ 大模型智能兜底**。
  * **按需兜底（aiFallback）**：默认优先使用平台原生答案与用例；仅在两者皆无且开启「模型兜底」时才调用 AI，最大限度为你节省 Token。
* **大模型代码引擎与防回退（AI Code Engine & Auto-Heal）**  
  深度集成 DeepSeek（V3 / V4-Pro / R1）及任意标准 OpenAI 兼容接口：
  * **深度推理与全模态**：原生支持思考链（Thinking Level）；智能甄别并仅下载 `image/*` 附件，过滤纯文本数据文件，保障多模态 Vision 识别精准度。
  * **判分情报注入**：调用模型时，将平台评测脚本（`evaluate.py`）、隐藏测试用例与比对规则作为上下文一并喂给模型。
  * **已通过用例保护**：重试时自动注入编译日志、错误差异，并高亮“已通过的输入列表”，防止模型重构时破坏已有正确用例。
* **全自动任务调度与丝滑交互（Pipeline Runner & Smooth UI）**  
  * **双向链条检索**：以当前关卡为基点，前后双向（`prev_game` 回溯 + `next_game` 前进）完整收集作业关卡，杜绝未解锁题目遗漏。
  * **实时队列动画**：作业卡片内置居中加载动画、进度条与实时计数（X/Y 份作业）。
  * **渲染优化与生命周期管理**：借助 `requestAnimationFrame` 合并帧刷新，杜绝界面抖动；单页应用离开时自动销毁轮询定时器。

> **支持范围说明**：  
> ✅ 完美支持：选择题（单选/多选）、文本填空题（带 `evaluate.py`）、代码编程题（C/C++/Python/Java 等）。  
> ⏭️ 自动跳过：StarUML、VNC、Logisim 等虚拟桌面与图形化建模关卡。

---

## 快速安装

### 方式一：脚本猫官方源一键安装（强烈推荐）
如果你使用的是 **[脚本猫 (ScriptCat)](https://docs.scriptcat.org/)**，可直接点击下方链接进行一键安装，并享受后续官方源自动更新推送：

👉 **[前往脚本猫安装：头歌自动答题助手](https://scriptcat.org/zh-CN/script-show-page/9163)**

---

### 方式二：手动导入安装（Tampermonkey / 脚本猫）
1. 确保浏览器已安装扩展：**[脚本猫 (ScriptCat)](https://docs.scriptcat.org/)**（推荐）或 **[Tampermonkey](https://www.tampermonkey.net/)**。
2. 打开本项目源码文件 [educoder-auto-solver.user.js](educoder-auto-solver.user.js)，全选并复制源码。
3. 打开用户脚本管理器后台，点击「新建脚本」，将复制的代码全选粘贴并保存。

---

## 使用说明

1. **进入实训**：登录并打开 [头歌实训平台](https://www.educoder.net/) 任意班级作业列表页或具体关卡页面。
2. **唤出面板**：点击页面右下角紫色的 **悬浮图标** 展开控制面板。
3. **开始运行**：
   - 点击 **「扫描关卡」**：脚本将自动双向爬取当前作业链条，并在卡片中展示进度条。
   - 确认无误后点击 **「开始答题」**：脚本即刻全自动推进，全程在后台静默执行，无需停留在当前页面等待跳转。

---

## AI 模型与兜底配置

点击控制面板顶部的 **「设置」** 即可微调运行参数：

### 基础常规配置
* **参考答案/用例缺失时允许模型兜底 (`aiFallback`)**：建议开启。当关卡既未泄漏参考答案、也未完全公开测试用例时，才会唤起 AI 代码引擎编写代码。

### AI 接口参数（设置 ➔ AI）
| 配置项 | 推荐值 | 说明 |
| :--- | :--- | :--- |
| **接口地址 (Base URL)** | `https://api.deepseek.com/v1` | 兼容任意符合 OpenAI 标准的 API 端点（OneAPI / 阿里云百炼 / SiliconFlow 等） |
| **API Key** | `sk-xxxxxx` | 你的模型接口密钥（密钥仅持久化在本地浏览器 `localStorage`） |
| **模型名称 (Model)** | `deepseek-chat` / `deepseek-v4-pro` | 选择速度快且代码能力出色的模型；需要深度推理可填 `deepseek-reasoner` |
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
