/**
 * @fileoverview Serves the minimal web console landing page.
 *
 * Provides a clean browser context for ScriptCat / Tampermonkey userscripts to mount
 * interactive menus and test remote SSH command execution.
 */

const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cloudflare Worker SSH Console</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --accent: #38bdf8;
      --success: #22c55e;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --card-bg: #ffffff;
        --text: #0f172a;
        --text-muted: #64748b;
        --border: #e2e8f0;
        --accent: #0284c7;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      background: rgba(34, 197, 94, 0.15);
      color: var(--success);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    p {
      color: var(--text-muted);
      font-size: 0.9375rem;
      line-height: 1.6;
      margin-top: 0.5rem;
    }
    .instructions {
      margin-top: 1.25rem;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.2);
      font-size: 0.875rem;
      color: var(--text);
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="header">
      <span class="badge"><span class="dot"></span> Online</span>
      <h1>Worker SSH 控制台</h1>
    </div>
    <p>当前 Cloudflare Worker SSH 网关运行正常，可直接在脚本猫 / 油猴插件中配置网关地址与 <code>SSH_API_KEY</code> 调用，或将此页作为调试宿主页面。</p>
    <div class="instructions">
      💡 <strong>调试提示：</strong>点击浏览器右上角脚本猫扩展图标，在菜单中选择<strong>「执行 SSH 命令」</strong>即可弹出交互面板测试连接。
    </div>
  </main>
</body>
</html>`;

/**
 * Returns the interactive console HTML page with strict security headers.
 */
export function consolePage(): Response {
	return new Response(page, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
			'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; form-action 'none'",
		},
	});
}
