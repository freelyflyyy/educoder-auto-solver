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
  Bypasses traditional question bank matching entirely. By exploiting protocol-level validation probes, the script dynamically extracts standard answers directly from the server response with 100% precision for both single and multiple-choice questions — and skips the second submission altogether when the probe placeholder already matches.
* **Grading-First 4-Tier Solving Strategy**  
  Educoder delivers evaluation assets alongside tasks. The script concurrently gathers grading intelligence and prioritizes native data before resorting to LLM generation:
  1. **Evaluation Script Literal Extraction (Fill-in-the-blanks)**: Reads `evaluate.py` directly from the task directory, extracting `s == "…"` literal assertions to achieve instant passes.
  2. **Reference Answer Direct Submission**: Extracts official reference solutions (`get_answer_info.json`), verifies target language compatibility, and submits directly.
  3. **Full Testcase Lookup Table**: Fetches all test cases (`check_test_sets.json`, including hidden cases) and synthesizes a deterministic stdin/stdout lookup table for pure I/O tasks.
  4. **AI Code Fallback (`aiFallback`)**: Invokes the LLM code engine only when none of the above native sources can pass the challenge and the **Enable AI Coding Fallback** toggle is turned on.
* **AI Code Engine & Anti-Regression (Auto-Heal)**  
  Deeply integrated with DeepSeek (V3 / V4-Pro / R1) and standard OpenAI-compatible endpoints:
  * **Reasoning Models & Concurrent Multimodal**: Native compatibility with thinking models. Strictly filters `image/*` attachments and downloads problem images concurrently for vision models while ignoring raw text data files.
  * **Unified Template Cache & Prompt Context Injection**: Caches original starter templates across tiers and retries; packages evaluation scripts (`evaluate.py`), hidden test cases, and comparison rules directly into the prompt.
  * **Snapshot Reuse & Anti-Regression Retries**: Uses evaluation result fingerprints to detect asynchronous grading completion and reuses the latest detail snapshot to eliminate redundant requests. Failed retries inject compiler logs, diffs, and an explicit list of "already passing inputs" to prevent regressions.
* **Smart Pipeline Runner & Smooth UI**  
  * **Bidirectional Chain Scanning & Route Awareness**: Traverses challenges both backward (`prev_game`) and forward (`next_game`) while automatically refreshing idle state when navigating across SPA routes.
  * **Refined Material Design 3 Dock**: Features pulsing phase indicators, active homework highlighting, bounded scrollable lists with auto-following logs, and `requestAnimationFrame` batched rendering.

> **Supported Challenge Types**:  
> ✅ Supported: Multiple-choice questions (single & multiple), text fill-in-the-blanks (with `evaluate.py`), programming tasks (C/C++, Python, Java, etc.).  
> ⏭️ Automatically Skipped: Graphical virtual desktop environments (StarUML, VNC, Logisim; optional remote SSH gateway parameters can be configured in General Settings).

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

1. **Navigate to Educoder**: Log in and visit any course assignment list, assignment detail page, or challenge page on [Educoder](https://www.educoder.net/).
2. **Open Panel**: Click the floating purple **assistant pill** in the bottom-right corner to expand the control panel. The script automatically scans pending assignments and challenges (or click **Rescan** at the top-right of the assignment card anytime).
3. **Start Solving**: Click **Start Solving** at the bottom of the panel. The automated solver will silently progress through the entire queue in the background without page redirects.

---

## Settings & AI Configuration

Open **Settings** at the top of the panel to customize execution parameters:

### General Settings (Settings ➔ General Settings)
* **Startup Delay / Code Auto-Retries / Log History Rows**: Customize the countdown before queue execution, AI auto-retry count on failed evaluations (0–4), and visible log lines.
* **Enable AI Coding Fallback (`aiFallback`)**: Recommended on. The script always prioritizes native evaluation scripts, reference answers, and full test suites; when enabled, it falls back to the AI code generator only when native answers are unavailable.
* **Remote SSH Gateway URL & Key (Optional)**: Used only for graphical virtual desktop challenges; leave blank for normal choice, fill-in-the-blank, and coding challenges.

### AI Model Settings (Settings ➔ AI Model)
| Parameter | Recommended | Description |
| :--- | :--- | :--- |
| **Base URL** | `https://api.deepseek.com/v1` | Compatible with any OpenAI-compatible endpoint (DeepSeek, Bailian, SiliconFlow, OneAPI, etc.) |
| **API Key** | `sk-xxxxxx` | Your API secret key (persisted locally in `localStorage`) |
| **Model** | `deepseek-chat` / `deepseek-v4-pro` | Fast, high-accuracy coding model; use reasoning models for complex algorithms |
| **Enable Vision** | Toggle as needed | Concurrently downloads and attaches problem images for vision-capable models |
| **Advanced Parameters** | Default (Auto-adapt) | Fine-tune Max Tokens, Thinking Mode & Level, Sampling / Penalties, JSON Mode, and custom instructions |

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
