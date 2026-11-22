/**
 * @fileoverview Main gateway router for the Cloudflare Worker SSH execution service.
 *
 * Dispatches incoming HTTP requests to dedicated handlers based on URL pathname
 * and HTTP method. Exports the Durable Object class binding for stateful target registry.
 */

import { consolePage } from './console';
import { handleExec } from './exec-handler';
import { createReply, type Reply } from './http';
import { handleLease } from './lease-handler';
import { handleTargetAdmin } from './target-admin';

export { SshTargetRegistry } from './target-registry';

type Route = {
	methods: readonly string[];
	handle(request: Request, env: Env, reply: Reply, ctx: ExecutionContext): Promise<Response>;
};

const routes = new Map<string, Route>([
	['/v1/ssh/exec', { methods: ['POST'], handle: handleExec }],
	['/v1/ssh/lease', { methods: ['POST'], handle: handleLease }],
	['/v1/ssh/targets', { methods: ['PUT', 'DELETE'], handle: handleTargetAdmin }],
]);

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { pathname } = new URL(request.url);

		// Interactive web console host landing page for UserScripts (ScriptCat / Tampermonkey)
		if (pathname === '/console' && request.method === 'GET') {
			return consolePage();
		}

		const reply = createReply();
		const route = routes.get(pathname);

		// Guard: reject unregistered endpoints
		if (!route) {
			return reply.error(404, 'NOT_FOUND');
		}

		// Guard: enforce allowed HTTP methods per endpoint specification
		if (!route.methods.includes(request.method)) {
			return reply.error(405, 'METHOD_NOT_ALLOWED', { Allow: route.methods.join(', ') });
		}

		return route.handle(request, env, reply, ctx);
	},
} satisfies ExportedHandler<Env>;
