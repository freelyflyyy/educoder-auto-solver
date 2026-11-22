<div align="center">

<img src="../assets/logo.svg" width="128" height="128" alt="cf-ssh-exec Logo" />

<h1>cf-ssh-exec</h1>

<h3>Cloudflare Worker Remote SSH Execution Engine — A Secure Gateway Built on Raw Sockets and Durable Objects</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)]()
[![Deploy Guide](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020.svg?logo=cloudflare&logoColor=white)](#deployment-guide-cloudflare-workers)
[![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers%20%7C%20Durable%20Objects-orange.svg)](https://developers.cloudflare.com/workers/)
[![Protocol](https://img.shields.io/badge/Protocol-Raw%20TCP%20%7C%20SSHv2%20%7C%20RFC%204254-green.svg)](https://www.rfc-editor.org/rfc/rfc4254)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](../LICENSE)

</div>

**cf-ssh-exec** is a high-performance, serverless SSH remote command execution gateway engineered specifically for browser-based automation tools, including **ScriptCat**, **Tampermonkey**, and **educoder-auto-solver**.

Due to web browser security sandboxing (cross-origin restrictions and absence of raw TCP socket capabilities), frontend userscripts cannot directly initiate TCP handshakes with remote hosts to establish SSH connections. Leveraging Cloudflare Workers' low-level `cloudflare:sockets` TCP capabilities alongside **SQLite-backed Durable Objects** for distributed state coordination, this project delivers an enterprise-grade execution proxy with **dynamic target registration, credential micro-segmentation, per-target mutual exclusion, bounded streaming DoS mitigation, and constant-time side-channel protection**.

---

## Highlights

* **Edge-Native TCP Direct Dialing (Pure Sockets API)**  
  Completely eliminates reliance on third-party relay proxies. Directly implements a pure SSHv2 protocol stack via Cloudflare Workers' native `connect()` API and `@workeryard/undershell`. Strictly verifies Ed25519 host key fingerprints to permanently eliminate network man-in-the-middle (MITM) credential interception.
* **Dynamic Target Registration & Micro-Segmentation (Durable Objects Registry)**  
  Powered by an in-memory SQLite Durable Object state engine. The management plane dynamically registers target instances, issuing temporary `executionToken`s with strict time-to-live bounds (default 30 minutes). **Target IP migrations, port changes, or ephemeral container recycling can be mounted and revoked in milliseconds without redeploying the Worker**.
* **Per-Target Mutual Exclusion & Rate Limiting**  
  Applies strict distributed concurrency locks to individual target hosts: only one active execution request is permitted per target at any given moment, preventing concurrent commands from overwhelming the remote server. Target invocations are limited to a maximum of 10 requests per 60-second window, bolstered by edge ingress rate-limiting (120 req/min per IP).
* **Defensive Bounded Streaming (Fail-Fast DoS Protection)**  
  * **8 KiB Request Body Ceiling**: Employs low-level `ReadableStream` chunk counting to abort requests immediately upon exceeding 8 KiB, returning HTTP 413 without memory exhaustion.
  * **Strict UTF-8 Decoding**: Decodes inputs in `fatal: true` mode, immediately rejecting malformed byte sequences to prevent format injection.
  * **Dual-Stream Buffer Cap**: Buffers up to 32 KiB of text each for `stdout` and `stderr`, with a combined hard ceiling of 128 KiB, cutting off streams and flagging `truncated: true` when exceeded.
* **Lifecycle Disconnect Detection (Zero Socket Leaks)**  
  Utilizes `Promise.race` to pit the remote execution task against incoming client abort signals (`AbortSignal`) and the wall-clock timeout (`timeoutMs`). When a user reloads the page, closes the browser tab, or encounters a stalled command, the `finally` block deterministically and idempotently tears down the underlying TCP socket.
* **Constant-Time Side-Channel Immunity (Timing-Safe Authentication)**  
  Both the management secret (`SSH_TARGET_ADMIN_TOKEN`) and the client-facing `executionToken` are standardized as 64-character hexadecimal hashes, verified via Web Crypto `crypto.subtle.timingSafeEqual` to eliminate timing attacks.

---

## Deployment Guide (Cloudflare Workers)

This project resides in the `cf-ssh-exec` subdirectory of the monorepo. To ensure Cloudflare's build container identifies the project root correctly, use **Cloudflare Console Git Integration** or **Wrangler CLI local deployment**.

### Method 1: Cloudflare Dashboard Git Integration (Zero CLI, Continuous CI/CD)

Connect your repository directly through the Cloudflare web dashboard for automatic build and deploy on every push:

1. **Open Dashboard**: Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create Application**;
2. **Connect Repository**: Select **Workers** tab, click **Connect to Git**, and choose this repository (`educoder-auto-solver`);
3. **Configure Build Settings (Crucial Steps)**:
   * **Production branch**: Select `main` (or your active deployment branch);
   * **Root directory**: **Enter `cf-ssh-exec`** (ensures Cloudflare builds in the subdirectory rather than failing at the root);
   * **Build command**: Enter `npm ci`;
   * **Deploy command**: Keep default `npx wrangler deploy`;
   * **Build watch paths**: Under "Include paths", enter `cf-ssh-exec/**` (ensures changes outside the directory do not consume build quota).
4. **Configure Runtime Secret (Mandatory)**:
   * After saving deployment, navigate to your Worker's **Settings** ➔ **Variables and Secrets**;
   * Under **Runtime variables and secrets**, click **+ Add variable**:
     * **Type**: Select **Secret (Encrypted)**;
     * **Name**: `SSH_TARGET_ADMIN_TOKEN`;
     * **Value**: A 64-character random hexadecimal string generated via `openssl rand -hex 32` in your local terminal.
   * Save. Future pushes to the branch will trigger end-to-end automated builds!

---

### Method 2: Local Deployment via Wrangler CLI

If you prefer terminal workflows or intend to integrate this project into your CI/CD delivery pipeline:

#### 1. Install Dependencies
```sh
cd cf-ssh-exec
npm ci
```

#### 2. Local Development & Testing
Generate a 64-character administrative token:
```sh
openssl rand -hex 32
```
Save the value into a local `.dev.vars` file (see `.dev.vars.example`):
```ini
SSH_TARGET_ADMIN_TOKEN=your_64_character_hex_secret_here
```
Start the local Worker runtime:
```sh
npm run dev
```

#### 3. Production Deployment
```sh
# Authenticate with Cloudflare
npx wrangler login

# Store secret in Cloudflare's encrypted vault
npx wrangler secret put SSH_TARGET_ADMIN_TOKEN

# Deploy to production
npm run deploy
```

---

## Integration with ScriptCat / Tampermonkey

The project includes a built-in, responsive landing console page:

1. **Access Console**: Navigate to your deployed Worker console address (e.g., `https://cf-ssh-exec.<your-subdomain>.workers.dev/console`). A green status indicator confirms online availability.
2. **Install Userscript**: Install **[ScriptCat](https://docs.scriptcat.org/)** or **[Tampermonkey](https://www.tampermonkey.net/)**, and import [examples/ssh-exec.user.js](examples/ssh-exec.user.js).
3. **Configure Endpoint**: Update the userscript header metadata with your Worker's hostname:
   ```javascript
   // @match        https://cf-ssh-exec.<your-subdomain>.workers.dev/console
   // @connect      cf-ssh-exec.<your-subdomain>.workers.dev
   const endpoint = "https://cf-ssh-exec.<your-subdomain>.workers.dev/v1/ssh/exec";
   ```
4. **Execute Commands**: Refresh the console page and click **"Execute SSH Command"** in the ScriptCat extension menu to reveal the execution modal.

---

## API Reference

All endpoints strictly enforce `Content-Type: application/json` and attach `Cache-Control: no-store` headers.

### 1. Dynamic Target Registration: `PUT /v1/ssh/targets`

**Authentication**: `Authorization: Bearer <SSH_TARGET_ADMIN_TOKEN>`

#### Request Payload:
```json
{
  "host": "192.0.2.10",
  "port": 2222,
  "username": "ops",
  "hostKeyFingerprint": "SHA256:oza1q9hiGIk5vUzODlS8+gflr3lChqsuJZtePvwQ4bo",
  "ttlSeconds": 1800
}
```
* `host`: Target public IPv4 address (strictly dotted-decimal format).
* `port`: SSH service port (`1 ~ 65535`).
* `username`: Remote login user (max 256 characters).
* `hostKeyFingerprint`: Target host key SHA-256 fingerprint (retrieve on the target server via `ssh-keygen -E sha256 -lf /etc/ssh/ssh_host_ed25519_key.pub`).
* `ttlSeconds`: Lifetime in seconds, defaults to 1800s (30 minutes), range `1 ~ 1800`.

#### Response (200 OK):
```json
{
  "executionToken": "4a7f8e...64-char-hex-token...",
  "registrationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "expiresAt": 1732258800000,
  "requestId": "6ecb1c09-2da1-447a-b9c1-cb19d2b21234",
  "durationMs": 14
}
```

---

### 2. Revoke Target Registration: `DELETE /v1/ssh/targets`

**Authentication**: `Authorization: Bearer <SSH_TARGET_ADMIN_TOKEN>`

#### Request Payload:
```json
{
  "host": "192.0.2.10",
  "port": 2222,
  "username": "ops",
  "registrationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

#### Response (200 OK):
```json
{
  "removed": true,
  "requestId": "c1f7b02e-2e4a-4a25-9c88-123456789abc",
  "durationMs": 8
}
```

---

### 3. Remote Command Execution: `POST /v1/ssh/exec`

**Authentication**: `Authorization: Bearer <executionToken>`

#### Request Payload:
```json
{
  "host": "192.0.2.10",
  "port": 2222,
  "username": "ops",
  "password": "your-password",
  "command": "uname -a && uptime",
  "timeoutMs": 15000
}
```
* `timeoutMs`: Execution budget in milliseconds, defaults to 20000 ms (20 seconds), range `1000 ~ 30000`.

#### Response (200 OK):
```json
{
  "stdout": "Linux debian 6.1.0-28-amd64 #1 SMP PREEMPT_DYNAMIC ...\n 06:30:15 up 12 days ...\n",
  "stderr": "",
  "exitCode": 0,
  "truncated": false,
  "requestId": "e4468f78-3a9a-4c28-bb83-8a9d16a56e01",
  "durationMs": 420
}
```

---

### HTTP Status Code Reference

| Status | Error Code (`error.code`) | Description & Recommended Action |
| :--- | :--- | :--- |
| **`200`** | - | Command execution completed; returns `exitCode`, `stdout`, and `stderr` |
| **`400`** | `INVALID_FIELDS` / `INVALID_JSON` | Malformed JSON payload, missing mandatory fields, or out-of-range bounds |
| **`401`** | `UNAUTHORIZED` | Missing token, malformed format, or failed constant-time comparison |
| **`403`** | `TARGET_NOT_ALLOWED` | Unregistered target, token mismatch, or registration expired |
| **`413`** | `BODY_TOO_LARGE` | Incoming request payload exceeds the 8 KiB hard limit |
| **`415`** | `UNSUPPORTED_MEDIA_TYPE` | Content-Type header must be `application/json` |
| **`429`** | `TARGET_BUSY` | Target is currently processing another command (concurrency lock active); check `Retry-After` |
| **`429`** | `RATE_LIMITED` | Target exceeded the 10 requests per 60-second window limit; check `Retry-After` |
| **`429`** | `INGRESS_RATE_LIMITED` | Ingress client IP exceeded rate limit (>120 requests/minute) |
| **`499`** | `REQUEST_CANCELLED` | Client (ScriptCat / browser) disconnected or cancelled the request |
| **`502`** | `SSH_AUTH_FAILED` | SSH username or password authentication rejected by the target |
| **`502`** | `SSH_CONNECTION_FAILED` | Target unreachable, port refused connection, or host key fingerprint mismatch |
| **`502`** | `OUTPUT_LIMIT_EXCEEDED` | Combined stdout and stderr exceeded 128 KiB limit; returns captured prefix |
| **`503`** | `AUTH_NOT_CONFIGURED` | Server lacks a valid 64-character hex `SSH_TARGET_ADMIN_TOKEN` secret |
| **`503`** | `RATE_LIMIT_UNAVAILABLE` / `TARGET_REGISTRY_UNAVAILABLE` | Cloudflare internal Durable Objects or Rate Limiter error |
| **`504`** | `SSH_TIMEOUT` | Execution duration exceeded `timeoutMs` budget; returns buffered partial output |

---

## Free Tier Budget & Capacity Planning

Architected specifically to maximize Cloudflare Workers Free Tier utility:

1. **Durable Objects RPC Efficiency**:
   * Uses standard SQLite-backed Durable Objects included in the free tier.
   * A single command execution consumes only 2 lightweight internal RPC calls (`acquire` and `release`). The free monthly allowance comfortably handles tens of thousands of automated task runs.
2. **CPU Budget Optimization (10ms Wall-Clock Cap)**:
   * Free-tier Workers are subject to a 10ms CPU execution cap.
   * All SSH network waits and I/O handshakes run asynchronously without consuming CPU cycles. Measured average CPU consumption is strictly between 1ms and 3ms.
3. **Zero Memory Leaks**:
   * With 8 KiB ingress limits, 32 KiB stream buffers, and 128 KiB total output limits, instance memory remains under 20MB, completely preventing OOM crashes.

---

## Disclaimer

* This project is developed strictly for **academic research, protocol analysis, and educational automated testing integration**.
* Users must comply with applicable terms of service and acceptable use policies. Never use this tool for unauthorized access, penetration testing, or brute-force scanning.
* The author assumes no liability for any direct or indirect consequences resulting from improper configuration or misuse.

---

## License

This project is licensed under the [MIT License](../LICENSE).
