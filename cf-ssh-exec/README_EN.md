<div align="center">

<img src="../assets/logo.svg" width="128" height="128" alt="cf-ssh-exec Logo" />

<h1>cf-ssh-exec</h1>

<h3>Cloudflare Worker Remote SSH Execution Gateway</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Version](https://img.shields.io/badge/Version-1.1.0-blue.svg)]()
[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020.svg?logo=cloudflare&logoColor=white)](https://deploy.workers.cloudflare.com/?url=https://github.com/freelyflyyy/educoder-auto-solver/tree/main/cf-ssh-exec)
[![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)](https://developers.cloudflare.com/workers/)
[![Protocol](https://img.shields.io/badge/Protocol-Raw%20TCP%20%7C%20SSHv2%20%7C%20RFC%204254-green.svg)](https://www.rfc-editor.org/rfc/rfc4254)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](../LICENSE)

</div>

Browser security sandboxes prevent frontend scripts from opening raw TCP connections for SSH. **cf-ssh-exec** uses Cloudflare Workers' `cloudflare:sockets` API to wrap SSH command execution into a simple HTTP endpoint for **ScriptCat**, **Tampermonkey**, and **educoder-auto-solver**.

It is completely stateless—no database or Durable Objects required. Set a single `SSH_API_KEY` secret and run it directly on the Cloudflare Workers Free plan.

---

## Features

* **Runs on the Free Plan**  
  No Durable Objects or external auth servers needed. Set `SSH_API_KEY` and deploy. The Cloudflare Free tier (100,000 requests/day) is more than enough for personal use.
* **API Key Authentication**  
  All requests require `Authorization: Bearer <SSH_API_KEY>`. Supports any `16 ~ 512` character secret (e.g., `sk-...` or a hex key from `openssl rand -hex 32`), verified with SHA-256 + `timingSafeEqual`.
* **Works with Dynamic Lab Containers**  
  Uses `cloudflare:sockets` and `@workeryard/undershell` for SSHv2 connections. Connects directly when `hostKeyFingerprint` is omitted (ideal for dynamically assigned lab VMs/containers), or verifies the host key when `hostKeyFingerprint` (`SHA256:...`) is provided.
* **Anti-SSRF & CIDR Allowlist**  
  Only allows public IPv4 targets. Blocks private networks (RFC 1918), loopback, and cloud metadata (`169.254.169.254`) by default. Supports `ALLOWED_HOST_CIDRS` to restrict connections to specific subnets.
* **Timeouts & Output Limits**  
  Includes 120 req/min per-IP rate limiting, an 8 KiB request body limit, and 32 KiB per stream (`stdout` / `stderr`, 128 KiB total cap). Automatically closes the underlying TCP socket on timeout or client disconnect.

---

## Quick Deployment (Cloudflare Workers)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/freelyflyyy/educoder-auto-solver/tree/main/cf-ssh-exec)

### Option 1: One-Click Deploy / Git Build

1. Click the **Deploy to Cloudflare** button above (or connect this repository in the Cloudflare Dashboard under **Workers & Pages** with **Root directory** set to `cf-ssh-exec`).
2. Add your **`SSH_API_KEY`** secret under **Settings ➔ Variables and Secrets**.

### Option 2: Wrangler CLI

```sh
cd cf-ssh-exec
npm ci

# Log in and set your API key (16~512 chars; e.g. openssl rand -hex 32)
npx wrangler login
npx wrangler secret put SSH_API_KEY

# Deploy
npm run deploy
```

> For local development, copy `.dev.vars.example` to `.dev.vars`, set `SSH_API_KEY`, and run `npm run dev`.

### Environment Variables & Secrets

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`SSH_API_KEY`** | Secret | **Required** | `16 ~ 512` printable non-whitespace ASCII secret (e.g., `openssl rand -hex 32` or custom `sk-...`), passed as the `Bearer` token |
| **`ALLOWED_HOST_CIDRS`** | Variable | Optional | Comma-separated public IPv4 CIDR allowlist (e.g., `47.99.0.0/16,120.55.0.0/16`); allows all public IPv4 addresses if omitted |

---

## ScriptCat / Tampermonkey Integration

### 1. Calling from a Userscript

Add `@connect *.workers.dev` to your userscript metadata and use [examples/ssh-client.mjs](examples/ssh-client.mjs):

```javascript
import { createSshGateway } from './examples/ssh-client.mjs';

const gateway = createSshGateway(GM_xmlhttpRequest, {
  workerUrl: 'https://cf-ssh-exec.<your-subdomain>.workers.dev',
  apiKey: 'your-ssh-api-key',
});

const ssh = gateway.session({
  host: '47.99.123.45',
  port: 22022,
  username: 'root',
  password: 'instance-password',
});

const result = await ssh.exec('uname -a && uptime', 15000);
console.log(result.status, result.body);
```

### 2. Manual Testing via Web Console

1. Open `https://cf-ssh-exec.<your-subdomain>.workers.dev/console` in your browser to check that the Worker is running.
2. Import [examples/ssh-exec.user.js](examples/ssh-exec.user.js) into **[ScriptCat](https://docs.scriptcat.org/)** or **[Tampermonkey](https://www.tampermonkey.net/)**.
3. Refresh `/console`, click **"执行 SSH 命令"** in the extension menu, and enter your `SSH_API_KEY` and target host details to test.

---

## API Reference

### Execute Remote SSH Command: `POST /v1/ssh/exec`

* **Headers**:
  * `Authorization: Bearer <SSH_API_KEY>`
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "host": "192.0.2.10",
    "port": 22,
    "username": "root",
    "password": "your-password",
    "command": "uname -a && uptime",
    "timeoutMs": 15000,
    "hostKeyFingerprint": "SHA256:oza1q9hiGIk5vUzODlS8+gflr3lChqsuJZtePvwQ4bo"
  }
  ```
  * `timeoutMs` (optional): Timeout in milliseconds; defaults to `20000` (20s), range `1000 ~ 30000`.
  * `hostKeyFingerprint` (optional): Target host public key SHA-256 fingerprint (`SHA256:<43-char Base64>`). Verifies host key if provided; connects directly if omitted.
* **Success Response (`200 OK`)**:
  ```json
  {
    "stdout": "Linux debian 6.1.0-28-amd64 #1 SMP PREEMPT_DYNAMIC ...\n",
    "stderr": "",
    "exitCode": 0,
    "truncated": false,
    "requestId": "e4468f78-3a9a-4c28-bb83-8a9d16a56e01",
    "durationMs": 420
  }
  ```

---

### HTTP Status Codes

| HTTP Status | Error Code (`error.code`) | Description |
| :--- | :--- | :--- |
| **`200`** | - | Command executed; returns `exitCode`, `stdout`, and `stderr` |
| **`400`** | `INVALID_FIELDS` / `INVALID_JSON` | Invalid JSON, missing required fields, or out-of-range parameters |
| **`400`** | `INVALID_TIMEOUT_MS` | `timeoutMs` is not an integer between `1000` and `30000` |
| **`400`** | `INVALID_HOST_KEY_FINGERPRINT` | `hostKeyFingerprint` does not match `SHA256:<43-char Base64>` |
| **`401`** | `UNAUTHORIZED` | Missing `Bearer` header, invalid format, or mismatched `SSH_API_KEY` |
| **`403`** | `TARGET_NOT_ALLOWED` | Target is not a public IPv4 address (e.g., private/loopback/domain) or outside `ALLOWED_HOST_CIDRS` |
| **`404`** | `NOT_FOUND` | Unknown endpoint path |
| **`405`** | `METHOD_NOT_ALLOWED` | HTTP method not allowed |
| **`413`** | `BODY_TOO_LARGE` | Request body exceeds 8 KiB |
| **`415`** | `UNSUPPORTED_MEDIA_TYPE` | `Content-Type` must be `application/json` |
| **`429`** | `INGRESS_RATE_LIMITED` | Client IP exceeded 120 requests/minute (includes `Retry-After: 60`) |
| **`499`** | `REQUEST_CANCELLED` | Client disconnected or aborted the request |
| **`502`** | `SSH_AUTH_FAILED` / `SSH_CONNECTION_FAILED` / `SSH_EXEC_FAILED` | SSH password rejected, connection/host-key check failed, or channel error |
| **`502`** | `OUTPUT_LIMIT_EXCEEDED` | Combined `stdout` and `stderr` exceeded 128 KiB (includes truncated output) |
| **`503`** | `AUTH_NOT_CONFIGURED` / `RATE_LIMIT_UNAVAILABLE` | Server `SSH_API_KEY` is missing/invalid (requires 16~512 chars) or rate limiter error |
| **`504`** | `SSH_TIMEOUT` | Command timed out (includes partial output collected so far) |

---

## Disclaimer & License

* This project is intended strictly for **web protocol research, automated testing, and educational lab integration**. Please follow your institution's and cloud provider's terms of service. Unauthorized network scanning or penetration testing is prohibited.
* Released under the [MIT License](../LICENSE).
