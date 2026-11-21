import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";
import { testAdminToken } from "./test/fixtures.mts";

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.jsonc" },
			miniflare: {
				bindings: { SSH_TARGET_ADMIN_TOKEN: testAdminToken },
				ratelimits: {
					SSH_RATE_LIMITER: {
						namespace_id: "934701",
						simple: { limit: 1000, period: 60 },
					},
				},
			},
		}),
	],
});
