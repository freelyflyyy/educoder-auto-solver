<div align="center">

<img src="../assets/logo.svg" width="128" height="128" alt="cf-ssh-exec Logo" />

<h1>cf-ssh-exec</h1>

<h3>Cloudflare Worker 远程 SSH 执行引擎 —— 基于原生 Socket 与 Durable Objects 的安全网关</h3>

[English](README_EN.md) | [简体中文](README.md)

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)]()
[![Deploy Guide](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020.svg?logo=cloudflare&logoColor=white)](#部署指南cloudflare-workers)
[![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers%20%7C%20Durable%20Objects-orange.svg)](https://developers.cloudflare.com/workers/)
[![Protocol](https://img.shields.io/badge/Protocol-Raw%20TCP%20%7C%20SSHv2%20%7C%20RFC%204254-green.svg)](https://www.rfc-editor.org/rfc/rfc4254)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](../LICENSE)

</div>

**cf-ssh-exec** 是一个专为配合浏览器自动化脚本（如 **脚本猫 ScriptCat**、**Tampermonkey** 及 **educoder-auto-solver**）打造的高性能、无服务器化（Serverless）远程 SSH 执行网关。

由于现代浏览器的安全沙箱机制，Web 前端环境完全无法建立原始 TCP 套接字与远程主机进行 SSH 握手。本项目基于 Cloudflare Workers 的原生底层 `cloudflare:sockets` TCP 能力与 **SQLite-backed Durable Objects** 分布式协同机制，实现了一个**动态目标登记、凭据隔离、单机互斥排队、流式防 DoS 截断以及防时序探测**的企业级安全执行代理。

---

## 核心特性

* **原生 TCP 边缘直连（Pure Sockets API）**  
  彻底摆脱第三方外部中间代理服务。完全依托 Cloudflare Workers 原生 `connect()` 套接字与 `@workeryard/undershell` 构建纯正 SSHv2 客户端协议栈。强制比对 Ed25519 主机公钥指纹（Host Key Fingerprint），从根本上防范网络中间人（MITM）凭据嗅探与伪造。
* **动态目标登记与微隔离（Durable Objects Registry）**  
  内置基于 SQLite 的 Durable Objects 状态引擎。由管理端集中完成目标登记，为特定主机签发具有严格生存时间（默认 30 分钟）的临时 `executionToken`。**目标主机 IP 变动、端口迁移或临时容器测试均可即时挂载与撤销，Worker 永久免于重复上线与繁琐部署**。
* **单机并发互斥与自动流控（Mutual-Exclusion & Quota）**  
  针对单个目标主机施加严格的分布式排队锁：同一目标同一时间仅允许一个执行任务运行，避免并发指令冲突打崩服务器；单机登记在 60 秒时间窗口内限制最多 10 次执行，配合边缘层单 IP 120 次/分钟限流，筑牢防刷防打崩屏障。
* **流式防御硬截断（Bounded Streaming & Fail-Fast）**  
  * **请求体 8 KiB 硬上限**：采用 ReadableStream 底层字节流边读边算，超限瞬间主动掐断连接并返回 413，攻击者无法造成边缘节点内存抖动。
  * **严格 UTF-8 校验**：以 `fatal: true` 模式解码入参，遇畸形字符直接拒绝，杜绝格式注入。
  * **输出双缓冲熔断**：`stdout` 与 `stderr` 各自保留最多 32 KiB 文本，合并总输出硬限制 128 KiB，超量即熔断截断并标记 `truncated: true`。
* **全生命周期断连感知（Zero Connection Leaks）**  
  借助 `Promise.race` 将远程执行任务与「客户端断连信号（`AbortSignal`）」及「超时闹钟（`timeoutMs`）」同时置入竞速态。无论前端脚本猫刷新页面、关闭标签页还是命令卡死，`finally` 钩子均会以幂等方式强制关闭底层 TCP Socket，彻底消除端口占用与连接泄漏。
* **双端防时序攻击保护（Timing-Safe Authentication）**  
  管理端凭据 `SSH_TARGET_ADMIN_TOKEN` 与执行端 `executionToken` 均标准化为 64 位十六进制格式，核心校验全部采用 Web Crypto 原生 `crypto.subtle.timingSafeEqual` 恒定时间比对，彻底封死侧信道探测。

---

## 部署指南（Cloudflare Workers）

本项目位于单体仓库的 `cf-ssh-exec` 子目录下。为确保构建容器能正确识别工作目录，推荐采用 **Cloudflare 官方控制台 Git 直连** 或 **Wrangler 本地一键部署**。

### 方式一：Cloudflare 控制台 Git 直连部署（零命令行，全自动 CI/CD）

通过 Cloudflare 网页后台绑定 GitHub 仓库，实现代码推送自动构建上线：

1. **登录仪表盘**：访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ 进入 **Workers & Pages** ➔ 点击 **Create Application**；
2. **连接代码库**：切换到 **Workers** 标签，点击 **Connect to Git** 授权并选择本仓库（`educoder-auto-solver`）；
3. **配置构建参数（核心步骤）**：
   * **生产分支（Production branch）**：选择 `main`（或你当前开发的分支）；
   * **根目录（Root directory）**：**填入 `cf-ssh-exec`**（确保 Cloudflare 自动进入子目录打包，避免报找不到配置文件的错误）；
   * **构建命令（Build command）**：填入 `npm ci`；
   * **部署命令（Deploy command）**：保持默认 `npx wrangler deploy`；
   * **构建监视路径（Build watch paths）**：在「包括路径」中填入 `cf-ssh-exec/**`（仅当该子目录有改动时才触发部署，避免根目录更新浪费构建次数）。
4. **配置运行时密钥（必选）**：
   * 保存部署后，进入该 Worker 的 **Settings（设置）** ➔ **Variables and Secrets（变量和机密）**；
   * 在 **运行时变量和密钥（Runtime variables and secrets）** 区域点击 **+ 添加变量**：
     * **类型**：选择 **密钥（Secret / 加密）**；
     * **名称**：`SSH_TARGET_ADMIN_TOKEN`；
     * **值**：在本地终端运行 `openssl rand -hex 32` 生成的 64 位随机十六进制字符串。
   * 点击保存。后续只要向目标分支 `git push`，云端就会全自动完成持续部署！

---

### 方式二：使用 Wrangler CLI 命令行本地部署

如果你习惯本地终端开发，或需要将服务集成至已有的自动化脚本中：

#### 1. 安装依赖
```sh
cd cf-ssh-exec
npm ci
```

#### 2. 本地开发与联调
运行命令生成 64 位管理员密钥：
```sh
openssl rand -hex 32
```
将生成的值填入本地 `.dev.vars` 文件中（可直接参考 `.dev.vars.example`）：
```ini
SSH_TARGET_ADMIN_TOKEN=填入你的64位十六进制密钥
```
启动本地边缘运行时：
```sh
npm run dev
```

#### 3. 生产环境构建与发布
```sh
# 登录 Cloudflare
npx wrangler login

# 向云端安全存入管理密钥
npx wrangler secret put SSH_TARGET_ADMIN_TOKEN

# 一键部署上线
npm run deploy
```

---

## 脚本猫 / 油猴插件协同指南

本项目内置了自适应深浅色模式的现代化控制台落地宿主页（Landing Page）：

1. **打开控制台**：在浏览器访问部署好的控制台地址（如 `https://cf-ssh-exec.<你的子域>.workers.dev/console`），页面将呈现绿色在线状态指示。
2. **安装用户脚本**：在浏览器安装 **[脚本猫 (ScriptCat)](https://docs.scriptcat.org/)** 或 **[Tampermonkey](https://www.tampermonkey.net/)**，导入 [examples/ssh-exec.user.js](examples/ssh-exec.user.js)。
3. **关联配置**：将脚本头部元数据配置为你部署的真实 Worker 域名：
   ```javascript
   // @match        https://cf-ssh-exec.<你的子域>.workers.dev/console
   // @connect      cf-ssh-exec.<你的子域>.workers.dev
   const endpoint = "https://cf-ssh-exec.<你的子域>.workers.dev/v1/ssh/exec";
   ```
4. **唤起执行**：刷新该控制台页面，点击脚本猫菜单中的 **「执行 SSH 命令」**，即可在弹出的可视化交互面板中输入凭据与指令完成操作。

---

## API 接口参考手册

所有请求与响应均强制使用 `Content-Type: application/json`，且响应头均自动注入 `Cache-Control: no-store`。

### 1. 动态登记目标：`PUT /v1/ssh/targets`

**鉴权要求**：`Authorization: Bearer <SSH_TARGET_ADMIN_TOKEN>`

#### 请求体参数：
```json
{
  "host": "192.0.2.10",
  "port": 2222,
  "username": "ops",
  "hostKeyFingerprint": "SHA256:oza1q9hiGIk5vUzODlS8+gflr3lChqsuJZtePvwQ4bo",
  "ttlSeconds": 1800
}
```
* `host`：目标公网 IPv4 地址（严格校验点分十进制）。
* `port`：SSH 服务端口（`1 ~ 65535`）。
* `username`：登录用户名（不超过 256 字符）。
* `hostKeyFingerprint`：目标主机的公钥 SHA-256 指纹（可在目标服务器终端运行 `ssh-keygen -E sha256 -lf /etc/ssh/ssh_host_ed25519_key.pub` 获取）。
* `ttlSeconds`：有效期（秒），默认 1800 秒（30分钟），可选范围 `1 ~ 1800`。

#### 成功响应（200 OK）：
```json
{
  "executionToken": "4a7f8e...64位十六进制专用令牌...",
  "registrationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "expiresAt": 1732258800000,
  "requestId": "6ecb1c09-2da1-447a-b9c1-cb19d2b21234",
  "durationMs": 14
}
```

---

### 2. 撤销目标登记：`DELETE /v1/ssh/targets`

**鉴权要求**：`Authorization: Bearer <SSH_TARGET_ADMIN_TOKEN>`

#### 请求体参数：
```json
{
  "host": "192.0.2.10",
  "port": 2222,
  "username": "ops",
  "registrationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

#### 成功响应（200 OK）：
```json
{
  "removed": true,
  "requestId": "c1f7b02e-2e4a-4a25-9c88-123456789abc",
  "durationMs": 8
}
```

---

### 3. 执行远程 SSH 命令：`POST /v1/ssh/exec`

**鉴权要求**：`Authorization: Bearer <executionToken>`

#### 请求体参数：
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
* `timeoutMs`：执行超时时间，默认 20000 毫秒（20 秒），范围 `1000 ~ 30000`。

#### 成功响应（200 OK）：
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

### HTTP 状态码对照表

| HTTP 状态 | 错误代码 (`error.code`) | 说明与处置建议 |
| :--- | :--- | :--- |
| **`200`** | - | 命令执行完毕，原样回传 `exitCode`、`stdout` 与 `stderr` |
| **`400`** | `INVALID_FIELDS` / `INVALID_JSON` | 请求体 JSON 损坏、缺失必要字段或参数超出合法取值范围 |
| **`401`** | `UNAUTHORIZED` | 未携带 Token、Token 格式不合规或防时序比对未通过 |
| **`403`** | `TARGET_NOT_ALLOWED` | 目标未登记、Token 与目标主机不匹配，或登记已超期失效 |
| **`413`** | `BODY_TOO_LARGE` | 请求体大小超出 8 KiB 硬上限 |
| **`415`** | `UNSUPPORTED_MEDIA_TYPE` | 媒体类型错误，Content-Type 必须为 `application/json` |
| **`429`** | `TARGET_BUSY` | 同一目标正有其他命令在执行（单机并发互斥锁激活），附带 `Retry-After` |
| **`429`** | `RATE_LIMITED` | 该目标在 60 秒时间窗口内调用已达 10 次上限，附带 `Retry-After` |
| **`429`** | `INGRESS_RATE_LIMITED` | 入口单个客户端 IP 频次超限（>120 次/分钟） |
| **`499`** | `REQUEST_CANCELLED` | 客户端（脚本猫）主动断开连接或关闭了浏览器网页 |
| **`502`** | `SSH_AUTH_FAILED` | SSH 账号或密码认证未通过 |
| **`502`** | `SSH_CONNECTION_FAILED` | 目标网络不通、端口拒绝建联，或主机公钥指纹与登记不符 |
| **`502`** | `OUTPUT_LIMIT_EXCEEDED` | 双流合并输出超过 128 KiB 总限额，附带已捕获的部分输出 |
| **`503`** | `AUTH_NOT_CONFIGURED` | 服务端未配置有效的 64 位十六进制管理员密钥 |
| **`503`** | `RATE_LIMIT_UNAVAILABLE` / `TARGET_REGISTRY_UNAVAILABLE` | Cloudflare 内部 Durable Objects 或限流基础设施异常 |
| **`504`** | `SSH_TIMEOUT` | 执行耗时超出 `timeoutMs` 预算，响应仍保留已采集的截断输出 |

---

## 免费配额与资源规划

本项目经过深度的云原生优化，完美契合 Cloudflare Workers 免费套餐（Free Tier）：

1. **Durable Objects 存储与请求**：
   * 采用免费版包含的 SQLite-backed Durable Objects；
   * 单次命令执行仅消耗 2 次轻量级内部 RPC 调用（`acquire` 抢锁与 `release` 释放锁），单月免费额度足以轻松支撑上万次自动化评测。
2. **CPU 预算安全（10ms Wall-clock 优化）**：
   * Cloudflare 对免费 Worker 施加 10ms 实际 CPU 计算上限；
   * 本项目所有 SSH 网络等待、握手 I/O 均为异步非阻塞执行（不消耗 CPU 时钟），实测平均 CPU 时间稳定在 1~3ms，绝不超标。
3. **内存无泄漏**：
   * 入口限制 8 KiB、单路流限制 32 KiB、总输出限制 128 KiB，边缘运行实例内存占用常年低于 20MB，杜绝 OOM 崩溃。

---

## 免责声明

* 本项目仅用于 **Web 前端逆向协议研究、安全自动化测试与教学实训环境集成**。
* 请遵守所在机构、高校与云平台的使用协议，严禁将本工具用于未授权的网络渗透、扫描或恶意暴力破解。
* 因不当配置或违规使用所引发的任何直接或间接法律责任，均由使用者本人承担，与本项目作者无关。

---

## 许可证

本项目基于 [MIT License](../LICENSE) 开源。
