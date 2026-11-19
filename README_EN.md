<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="educoder-auto-solver Logo" />

<h1>educoder-auto-solver</h1>

<h3>A High-Performance, Pure API-Driven Automation Script for Educoder</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Platform](https://img.shields.io/badge/Platform-ScriptCat%20%7C%20Tampermonkey-green.svg)](https://docs.scriptcat.org/)
[![Target](https://img.shields.io/badge/Target-Educoder-blue.svg)](https://www.educoder.net)
[![Architecture](https://img.shields.io/badge/Arch-Pure%20API%20%7C%20Zero%20DOM%20Jumps-critical.svg)]()
[![AI-Engine](https://img.shields.io/badge/AI-DeepSeek%20%7C%20OpenAI-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

</div>

**educoder-auto-solver** is an advanced, pure API-driven automated solving userscript engineered for the Educoder platform. By interacting directly with underlying endpoints and protocol flows, it executes an end-to-end automated pipeline: **Scan → Queue → Solve → Grade & Submit**, entirely in the background.

If you are frustrated with Educoder's sluggish page transitions and endless manual reloads, tired of fragile plugins relying on DOM-clicking hacks, or looking for a definitive solution to autonomously scan assignments, crack choice questions instantly, and leverage cutting-edge LLMs to conquer complex programming challenges — **educoder-auto-solver is your ultimate choice.**

---

## Highlights

* **Pure API Protocol Architecture (Zero DOM Jumps)**  
  Completely eliminates flaky DOM manipulation, simulated clicking, and frequent page reloads. With a native MD5 signature generator and complete session management, the script communicates directly with Educoder's backend REST APIs without ever leaving or reloading the page.
* **Instant Choice Probe**  
  Bypasses traditional question bank matching entirely. By exploiting protocol-level validation probes, the script dynamically extracts standard answers directly from the server response with 100% precision for both single and multiple-choice questions.
* **Testcase Bypass & Auto-Mapping**  
  For programming tasks with fully visible test suites, the script dynamically constructs an optimal input-to-output mapping structure on the fly — bypassing LLM inference entirely for zero latency, zero token consumption, and a guaranteed pass.
* **AI Code Engine & Auto-Healing**  
  Deeply integrated with DeepSeek and standard OpenAI-compatible endpoints:
  * **Reasoning Models**: Native compatibility with DeepSeek-R1 / V4-Pro with customizable thinking depth.
  * **Multimodal Vision**: Automatically captures and encodes authenticated problem screenshots and diagrams for vision-capable models.
  * **Auto-Healing Loop**: If a test case fails, the engine analyzes compilation errors and grading logs against the original template, automatically refining the code until all tests pass.
* **Smart Pipeline Runner**  
  Equipped with a robust state machine. It traces and resolves challenge dependency chains across courses or individual assignments, with support for pause, resume, single-stepping, and automatic skipping of graphical/VNC-based tasks.

---

## Quick Start

### 1. Install a Userscript Manager
We recommend **[ScriptCat](https://docs.scriptcat.org/)** for optimal compatibility with modern userscript standards, or **[Tampermonkey](https://www.tampermonkey.net/)**.

### 2. Install the Script
1. Open [educoder-auto-solver.user.js](educoder-auto-solver.user.js) and copy the source code.
2. Create a new userscript in your userscript manager dashboard, paste the code, and save.

### 3. Open Educoder & Launch
1. Navigate to any assignment or challenge page on [Educoder](https://www.educoder.net/).
2. Click the floating purple **Auto Solver** icon in the bottom-right corner to open the control panel.
3. Click **Scan Challenges** to build the task queue, then click **Start Solving** to let the pipeline run automatically.

---

## AI Configuration

Fine-tune LLM code generation and retry policies in the **AI Settings** tab of the control panel:

| Option | Recommended | Description |
| :--- | :--- | :--- |
| **Base URL** | `https://api.deepseek.com/v1` | Compatible with any OpenAI-compatible endpoint (OneAPI, Bailian, etc.) |
| **API Key** | `sk-xxxxxx` | Your API key (stored securely in local `localStorage`) |
| **Model** | `deepseek-chat` / `deepseek-v4-pro` | High-speed, high-accuracy coding models; use `deepseek-reasoner` for complex algorithms |
| **Thinking** | `auto` / `high` | Automatically adjusts thinking budget for reasoning-enabled models |
| **Vision** | Toggle on/off | Uploads rendered problem images when visual context is required |

---

## Disclaimer

* This project is developed strictly for **academic research, protocol analysis, and automated testing education**.
* Please adhere to the academic integrity policies and terms of service of your respective educational institutions and platform.
* The author assumes no responsibility for any misuse, academic penalties, or account restrictions resulting from the use of this software.

---

## License

This project is licensed under the [MIT License](LICENSE).
