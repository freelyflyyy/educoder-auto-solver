<div align="center">

<img src="assets/logo.svg" width="128" height="128" alt="educoder-auto-solver Logo" />

<h1>educoder-auto-solver</h1>

<h3>A High-Performance, Pure API-Driven Automation Script for Educoder</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Version](https://img.shields.io/badge/Version-1.1.0-blue.svg)]()
[![ScriptCat](https://img.shields.io/badge/ScriptCat-Install-orange.svg)](https://scriptcat.org/zh-CN/script-show-page/9163)
[![Platform](https://img.shields.io/badge/Platform-ScriptCat%20%7C%20Tampermonkey-green.svg)](https://docs.scriptcat.org/)
[![Target](https://img.shields.io/badge/Target-Educoder-blue.svg)](https://www.educoder.net)
[![Architecture](https://img.shields.io/badge/Arch-Pure%20API%20%7C%20Zero%20DOM%20Jumps-critical.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

</div>

**educoder-auto-solver** is an advanced, pure API-driven automated solving userscript engineered for the Educoder platform. By interacting directly with underlying REST endpoints and grading protocols, it executes an end-to-end automated pipeline: **Scan → Queue → Solve → Grade & Submit**, entirely in the background without refreshing or redirecting the browser.

If you are frustrated with Educoder's sluggish page transitions and endless manual reloads, tired of fragile plugins relying on DOM-clicking hacks, or looking for a definitive solution to autonomously scan assignments, crack choice questions instantly, and leverage cutting-edge LLMs to conquer complex programming challenges — **educoder-auto-solver is your ultimate choice.**

---

## Highlights

* **Pure API Protocol Architecture (Zero DOM Jumps)**  
  Completely eliminates flaky DOM manipulation, simulated clicking, and frequent page reloads. With a native MD5 request signature generator and complete session management, the script communicates directly with Educoder's backend REST APIs without ever leaving or reloading the page.
* **Instant Choice Probe**  
  Bypasses traditional question bank matching entirely. By exploiting protocol-level validation probes, the script dynamically extracts standard answers directly from the server response with 100% precision for both single and multiple-choice questions.
* **Grading-First Solving Strategy**  
  Educoder delivers actual evaluation scripts alongside tasks. The script extracts native data before resorting to LLM generation:
  * **Fill-in-the-blanks**: Reads `evaluate.py` directly from the task repository, extracting `s == "…"` literal assertions to achieve instant 100% passes.
  * **Three-Tier Hierarchy for Code Tasks**: **Reference Answers ➔ Testcase Table Mapping ➔ AI Fallback Generation**.
  * **Token Preservation (`aiFallback`)**: Native answers and visible test suites take precedence. AI models are only invoked when no answers or public testcases are available and the `aiFallback` toggle is enabled.
* **AI Code Engine & Anti-Regression (Auto-Heal)**  
  Deeply integrated with DeepSeek (V3 / V4-Pro / R1) and standard OpenAI-compatible endpoints:
  * **Reasoning Models & Multimodal**: Native compatibility with thinking models. Features strict `image/*` MIME filtering to ignore raw text data files and only feed valid screenshots to vision models.
  * **Prompt Context Injection**: Evaluation code (`evaluate.py`), hidden test case structures, and string comparison rules are packaged directly into the prompt.
  * **Anti-Regression Retries**: During failed retries, compiler logs, error diffs, and an explicit list of "passed test cases" are injected to stop the model from breaking already passing inputs.
* **Smart Pipeline Runner & Smooth UI**  
  * **Bidirectional Chain Scanning**: Traces challenges both backward (`prev_game`) and forward (`next_game`) to guarantee zero missed challenges even if post-entry tasks remain locked.
  * **Animated Scan Progress**: The queue panel renders a centered loading spinner, progress bar, and real-time counter (X/Y homeworks).
  * **Flicker-Free Rendering**: Uses `requestAnimationFrame` to batch UI updates and automatically clears poll timers when leaving the single-page application.

> **Supported Challenge Types**:  
> ✅ Supported: Multiple-choice questions (single & multiple), text fill-in-the-blanks (with `evaluate.py`), programming tasks (C/C++, Python, Java, etc.).  
> ⏭️ Automatically Skipped: Graphical virtual desktop environments (StarUML, VNC, Logisim).

---

## Installation

### Method 1: One-Click Install via ScriptCat (Recommended)
If you use **[ScriptCat](https://docs.scriptcat.org/)**, install directly from the official script page to receive automatic update notifications:

👉 **[Install from ScriptCat: educoder-auto-solver](https://scriptcat.org/zh-CN/script-show-page/9163)**

---

### Method 2: Manual Install (Tampermonkey / ScriptCat)
1. Ensure you have installed a userscript manager extension: **[ScriptCat](https://docs.scriptcat.org/)** (recommended) or **[Tampermonkey](https://www.tampermonkey.net/)**.
2. Open the source file [educoder-auto-solver.user.js](educoder-auto-solver.user.js) and copy the entire code.
3. In your userscript manager dashboard, create a new script, paste the code, and click Save.

---

## Usage

1. **Navigate to Educoder**: Log in and visit any course assignment list or challenge page on [Educoder](https://www.educoder.net/).
2. **Open Panel**: Click the floating purple **assistant icon** in the bottom-right corner to expand the control dock.
3. **Run Pipeline**:
   - Click **Scan Challenges**: The script traverses the assignment chain in both directions with an animated progress bar.
   - Click **Start Solving**: The automated solver will silently progress through the entire queue in the background.

---

## AI Configuration

Open **Settings** at the top of the panel to customize execution parameters:

### General Settings
* **Allow AI fallback when reference/cases are missing (`aiFallback`)**: Recommended on. The script only calls the AI code engine if the platform neither provides reference code nor full public test suites.

### AI Endpoint Settings (Settings ➔ AI)
| Parameter | Recommended | Description |
| :--- | :--- | :--- |
| **Base URL** | `https://api.deepseek.com/v1` | Compatible with any OpenAI-compatible endpoint (OneAPI, Bailian, SiliconFlow, etc.) |
| **API Key** | `sk-xxxxxx` | Your API secret key (stored locally inside `localStorage`) |
| **Model** | `deepseek-chat` / `deepseek-v4-pro` | High-speed, high-accuracy coding model; use `deepseek-reasoner` for complex algorithms |
| **Thinking** | `auto` / `high` | Automatically manages thinking budget for reasoning-enabled models |
| **Vision** | Toggle as needed | Uploads problem images for vision-capable models |

---

## Companion Remote SSH Gateway (`cf-ssh-exec`)

Because browser scripts cannot open raw TCP sockets directly, this repository includes [cf-ssh-exec](cf-ssh-exec/README_EN.md) for challenges that require connecting to public SSH lab instances. Set an `SSH_API_KEY` to deploy it on the Cloudflare Workers Free plan and execute SSH commands over HTTP.

See the **[cf-ssh-exec Documentation](cf-ssh-exec/README_EN.md)** for deployment and usage details.

---

## Disclaimer

* This project is developed strictly for **academic research, protocol analysis, and automated testing education**.
* Please adhere to the academic integrity policies and terms of service of your respective educational institutions and platform.
* The author assumes no responsibility for any misuse, academic penalties, or account restrictions resulting from the use of this software.

---

## License

This project is licensed under the [MIT License](LICENSE).
