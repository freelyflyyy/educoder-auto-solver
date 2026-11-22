<div align="center">

<img src="../assets/logo.svg" width="128" height="128" alt="cf-ssh-exec Logo" />

<h1>cf-ssh-exec</h1>

<h3>Cloudflare Worker 远程 SSH 执行网关</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Version](https://img.shields.io/badge/Version-1.1.0-blue.svg)]()
[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020.svg?logo=cloudflare&logoColor=white)](https://deploy.workers.cloudflare.com/?url=https://github.com/freelyflyyy/educoder-auto-solver/tree/main/cf-ssh-exec)
[![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)](https://developers.cloudflare.com/workers/)
[![Protocol](https://img.shields.io/badge/Protocol-Raw%20TCP%20%7C%20SSHv2%20%7C%20RFC%204254-green.svg)](https://www.rfc-editor.org/rfc/rfc4254)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](../LICENSE)

</div>

受浏览器安全沙箱限制，前端脚本无法直接发起原始 TCP 连接去连 SSH。**cf-ssh-exec** 利用 Cloudflare Workers 的 `cloudflare:sockets` 能力，将 SSH 命令执行封装成简单的 HTTP 接口，供 **脚本猫 (ScriptCat)**、**Tampermonkey** 及 **educoder-auto-solver** 调用。

项目采用无状态设计，不需要绑定数据库或 Durable Objects，配置一个 `SSH_API_KEY` 就能直接跑在 Cloudflare Workers 免费额度上。

---

## 功能特点

* **免费额度即开即用**  
  不依赖 Durable Objects 或外部核验服务，部署后配好 `SSH_API_KEY` 即可使用。Cloudflare 免费版每天 10 万次请求额度足够个人日常使用。
* **强制 API Key 鉴权**  
  接口强制校验 `Authorization: Bearer <SSH_API_KEY>`，支持 `16 ~ 512` 位自定义密钥（如 `sk-...` 或 `openssl rand -hex 32` 生成的随机串），内部使用 SHA-256 + `timingSafeEqual` 比对。
* **适配动态实训主机**  
  基于 `cloudflare:sockets` 与 `@workeryard/undershell` 建立 SSHv2 连接。默认无需预填主机公钥指纹，可直接连接头歌等动态分配的实验机；也支持按需传入 `hostKeyFingerprint`（`SHA256:...`）校验主机指纹。
* **防 SSRF 与网段白名单**  
  仅允许连接合法公网 IPv4，默认拦截内网（RFC 1918）、本地回环、云元数据（`169.254.169.254`）等保留地址；可通过 `ALLOWED_HOST_CIDRS` 限制仅允许连接指定机房网段。
* **超时与输出限流**  
  自带单 IP 120 次/分钟入口限流；请求体限制 8 KiB，`stdout` 与 `stderr` 单路最多保留 32 KiB（总输出上限 128 KiB）；超时或客户端断开连接时自动关闭底层 Socket。

---

## 快速部署（Cloudflare Workers）

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/freelyflyyy/educoder-auto-solver/tree/main/cf-ssh-exec)

### 方式一：一键部署 / Git 自动构建

1. 点击上方 **Deploy to Cloudflare** 按钮（或在 Cloudflare 控制台 **Workers & Pages** 中绑定本仓库，将 **Root directory** 设为 `cf-ssh-exec`）。
2. 在部署配置或 Worker 的 **Settings ➔ Variables and Secrets** 中添加 **`SSH_API_KEY`** 密钥（见下表）。

### 方式二：Wrangler CLI 本地部署

```sh
cd cf-ssh-exec
npm ci

# 登录并设置网关密钥（16~512 位字符串，可用 openssl rand -hex 32 生成）
npx wrangler login
npx wrangler secret put SSH_API_KEY

# 发布上线
npm run deploy
```

> 本地调试可将 `.dev.vars.example` 复制为 `.dev.vars` 并填入 `SSH_API_KEY`，运行 `npm run dev` 启动本地服务。

### 环境变量与密钥

| 变量名称 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| **`SSH_API_KEY`** | Secret | **必填** | `16 ~ 512` 位非空白可见 ASCII 密钥（如 `openssl rand -hex 32` 或自定义 `sk-...`），请求时作为 `Bearer` Token 传入 |
| **`ALLOWED_HOST_CIDRS`** | Variable | 可选 | 允许连接的目标公网 IPv4 网段白名单（逗号分隔，如 `47.99.0.0/16,120.55.0.0/16`）；留空则允许所有公网 IPv4 |

---

## 脚本猫 / 油猴插件接入

### 1. 在用户脚本中调用

在脚本头部声明 `@connect *.workers.dev`，引入 [examples/ssh-client.mjs](examples/ssh-client.mjs)，传入 Worker 地址和 `SSH_API_KEY` 即可执行命令：

```javascript
import { createSshGateway } from './examples/ssh-client.mjs';

const gateway = createSshGateway(GM_xmlhttpRequest, {
  workerUrl: 'https://cf-ssh-exec.<你的子域>.workers.dev',
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

### 2. 控制台页面手动测试

1. 浏览器打开 `https://cf-ssh-exec.<你的子域>.workers.dev/console` 确认服务在线。
2. 在 **[脚本猫 (ScriptCat)](https://docs.scriptcat.org/)** 或 **[Tampermonkey](https://www.tampermonkey.net/)** 中导入 [examples/ssh-exec.user.js](examples/ssh-exec.user.js)。
3. 刷新 `/console` 页面，点击扩展菜单中的 **「执行 SSH 命令」**，填入 `SSH_API_KEY` 和目标机器信息即可弹窗测试。

---

## API 接口说明

### 执行远程 SSH 命令：`POST /v1/ssh/exec`

* **请求头**：
  * `Authorization: Bearer <SSH_API_KEY>`
  * `Content-Type: application/json`
* **请求体**：
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
  * `timeoutMs`（可选）：超时毫秒数，默认 `20000`（20 秒），范围 `1000 ~ 30000`。
  * `hostKeyFingerprint`（可选）：目标主机公钥 SHA-256 指纹（格式 `SHA256:<43位Base64>`）。传入时校验主机指纹，不传则直接连接。
* **成功响应（200 OK）**：
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

### HTTP 状态码

| HTTP 状态 | 错误代码 (`error.code`) | 说明 |
| :--- | :--- | :--- |
| **`200`** | - | 执行成功，返回 `exitCode`、`stdout` 与 `stderr` |
| **`400`** | `INVALID_FIELDS` / `INVALID_JSON` | JSON 格式错误、缺少必填字段或参数越界 |
| **`400`** | `INVALID_TIMEOUT_MS` | `timeoutMs` 非整数或不在 `1000 ~ 30000` 范围内 |
| **`400`** | `INVALID_HOST_KEY_FINGERPRINT` | `hostKeyFingerprint` 格式不符合 `SHA256:<43位Base64>` |
| **`401`** | `UNAUTHORIZED` | 未携带 `Bearer` 凭证、格式无效或 `SSH_API_KEY` 不匹配 |
| **`403`** | `TARGET_NOT_ALLOWED` | 目标不是公网 IPv4（如私网/回环/域名）或不在 `ALLOWED_HOST_CIDRS` 白名单内 |
| **`404`** | `NOT_FOUND` | 路径不存在 |
| **`405`** | `METHOD_NOT_ALLOWED` | HTTP 方法不允许 |
| **`413`** | `BODY_TOO_LARGE` | 请求体超过 8 KiB 上限 |
| **`415`** | `UNSUPPORTED_MEDIA_TYPE` | `Content-Type` 不是 `application/json` |
| **`429`** | `INGRESS_RATE_LIMITED` | 单 IP 请求超过 120 次/分钟（含 `Retry-After: 60`） |
| **`499`** | `REQUEST_CANCELLED` | 客户端主动断开请求 |
| **`502`** | `SSH_AUTH_FAILED` / `SSH_CONNECTION_FAILED` / `SSH_EXEC_FAILED` | SSH 密码错误、连接/指纹校验失败或执行通道异常 |
| **`502`** | `OUTPUT_LIMIT_EXCEEDED` | `stdout` 与 `stderr` 总输出超过 128 KiB（附带已截断输出） |
| **`503`** | `AUTH_NOT_CONFIGURED` / `RATE_LIMIT_UNAVAILABLE` | 服务端未配置有效的 `SSH_API_KEY`（需 16~512 位）或限流服务异常 |
| **`504`** | `SSH_TIMEOUT` | 命令执行超时（附带已收集的部分输出） |

---

## 免责声明与许可证

* 本项目仅用于 **Web 前端协议研究、自动化测试与教学实训环境集成**，请遵守所在机构与云平台的使用规范，严禁用于未授权的网络扫描或渗透测试。
* 基于 [MIT License](../LICENSE) 开源。
