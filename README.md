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
  深入解析平台接口验证与评分逻辑，借助接口层探针机制精准提取题目标准答案。单选、多选全量覆盖，且当探针占位答案恰好命中时自动省去二次请求，实现 100% 满分秒答。
* **判分依据优先的四级解题引擎（Grading-First 4-Tier Strategy）**  
  平台随关卡一同下发了关键的判分代码与评测依据，脚本并发采集判分情报并优先使用原生数据直通评测，杜绝盲目让大模型瞎猜：
  1. **判分脚本直填（文本填空题）**：自动探测作答文件同目录下的 `evaluate.py` 判分脚本，反向提取 `s == "…"` 断言字面量并填入模板。
  2. **平台参考答案直通**：读取平台下发的教师参考答案源码并校验语言类型，直接提交评测。
  3. **全量用例输入输出匹配**：提取包含隐藏用例在内的全量评测数据，对纯标准输入/输出题自动构造确定性查表代码提交。
  4. **AI 编程兜底（`aiFallback`）**：仅在前三级免 AI 策略无法直通、且开启「启用 AI 编程兜底」时才调用大模型编写代码，最大限度节省 Token。
* **大模型代码引擎与防回退（AI Code Engine & Auto-Heal）**  
  深度集成 DeepSeek（V3 / V4-Pro / R1）及任意标准 OpenAI 兼容接口：
  * **深度推理与并发多模态**：原生支持思考链（Thinking Level）；严格甄别并并发下载 `image/*` 题干配图，自动过滤纯文本数据附件。
  * **判分情报与模板缓存**：统一缓存各关卡初始代码模板，避免跨级重试时重复拉取或污染原始模板；调用模型时自动注入判分脚本、隐藏用例与比对规则。
  * **评测快照复用与已通过用例保护**：利用评测结果指纹精准识别异步评测落地状态，复用最新详情快照消除冗余请求；重试时自动注入编译报错、差异对比及“已通过输入列表”，防止模型重构时破坏已有正确逻辑。
* **全自动队列调度与清爽交互（Pipeline Runner & Smooth UI）**  
  * **双向链表扫描与路由感知**：以入口关卡为基点前后双向（`prev_game` 回溯 + `next_game` 前进）并发收集未完成关卡；单页应用切换课程或作业时自动感知并刷新待机列表。
  * **高可读性卡片视图**：Material Design 3 风格悬浮面板，支持脉冲状态指示、当前作答作业高亮、独立滚动列表与日志自动触底跟随，借助 `requestAnimationFrame` 合并帧刷新杜绝界面抖动。

> **支持范围说明**：  
> ✅ 完美支持：选择题（单选/多选）、文本填空题（带 `evaluate.py`）、代码编程题（C/C++/Python/Java 等）。  
> ⏭️ 自动跳过：StarUML、VNC、Logisim 等图形化虚拟桌面关卡（可在「常规设置」中选填远程 SSH 网关参数）。

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

1. **进入实训**：登录并打开 [头歌实训平台](https://www.educoder.net/) 任意班级作业列表页、作业详情页或具体关卡页面。
2. **唤出面板**：点击页面右下角紫色的 **「头歌自动答题助手」悬浮胶囊** 展开控制面板，脚本会自动扫描当前页面的待办作业与未通关关卡（也可随时点击卡片右上角的 **「重新扫描」** 刷新）。
3. **开始答题**：确认待办作业列表无误后，点击底部的 **「开始答题」**。脚本即刻在后台按队列顺序全自动推进，全程无需跳页或停留等待。

---

## 参数与 AI 模型配置

点击控制面板顶部的 **「设置」** 即可按需调整运行策略：

### 常规设置（设置 ➔ 常规设置）
* **启动缓冲时间 / 代码题自动重试次数 / 日志保留条数**：控制启动前倒计时、AI 代码评测失败后的自动修正次数（0–4 次）及面板日志展示行数。
* **启用 AI 编程兜底 (`aiFallback`)**：建议开启。脚本始终优先使用平台判分脚本、参考答案和全量用例通关；开启此项后，仅在无现成答案可用时才调用 AI 编写代码。
* **远程 SSH 网关地址与密钥（选填）**：仅图形化虚拟桌面关卡使用，普通选择题、填空题与编程题留空即可。

### AI 模型参数（设置 ➔ AI 模型）
| 配置项 | 推荐值 | 说明 |
| :--- | :--- | :--- |
| **接口地址 (Base URL)** | `https://api.deepseek.com/v1` | 兼容任意符合 OpenAI 标准的 API 端点（DeepSeek / 阿里云百炼 / SiliconFlow / OneAPI 等） |
| **接口密钥 (API Key)** | `sk-xxxxxx` | 模型接口密钥（仅保存在本地浏览器 `localStorage` 中） |
| **模型名称 (Model)** | `deepseek-chat` / `deepseek-v4-pro` | 选择响应快且代码能力强的模型；复杂算法题可填推理模型 |
| **启用图片识别 (Vision)** | 按需勾选 | 题干包含重要配图时自动并发下载并传给支持多模态视觉的模型 |
| **高级生成参数** | 保持默认（自动适配） | 支持自定义最大输出 Token、深度思考模式与强度、采样策略及附加指令 |

---

## 配套远程 SSH 网关（`cf-ssh-exec`）

浏览器脚本受沙箱限制无法直接发原始 TCP 连接。针对需要连接公网 SSH 实验机的场景，仓库内置了 [cf-ssh-exec](cf-ssh-exec/README.md) 子项目，配置一个 `SSH_API_KEY` 即可一键部署到 Cloudflare Workers 免费版，供脚本通过 HTTP 接口远程执行 SSH 命令。

详见：**[cf-ssh-exec 部署与使用说明](cf-ssh-exec/README.md)**

---

## 免责声明

* 本项目仅用于 **Web 前端逆向技术研究、API 协议安全分析以及自动化测试交流**。
* 请遵守所在高校、机构及头歌平台的用户守则与学术诚信规范，切勿将本工具用于不正当竞争或违规用途。
* 因不当使用本脚本所产生的一切后果与责任，均由使用者本人承担，与本项目作者无关。

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
