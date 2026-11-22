import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';
import { testApiKey } from './test/fixtures.mts';

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: './wrangler.jsonc' },
			miniflare: {
				bindings: { SSH_API_KEY: testApiKey },
				ratelimits: {
					SSH_RATE_LIMITER: {
						namespace_id: '934701',
						simple: { limit: 1000, period: 60 },
					},
				},
			},
		}),
	],
});
