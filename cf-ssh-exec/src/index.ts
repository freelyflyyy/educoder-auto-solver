/**
 * @fileoverview Main gateway router for the Cloudflare Worker SSH execution service.
 *
 * Dispatches incoming HTTP requests to dedicated handlers based on URL pathname
 * and HTTP method. Stateless by design for one-click personal deployment.
 */

import { consolePage } from './console';
import { handleExec } from './exec-handler';
import { createReply, type Reply } from './http';

type Route = {
	methods: readonly string[];
	handle(request: Request, env: Env, reply: Reply): Promise<Response>;
};

const routes = new Map<string, Route>([
	['/v1/ssh/exec', { methods: ['POST'], handle: handleExec }],
]);

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const { pathname } = new URL(request.url);

		if (pathname === '/console' && request.method === 'GET') {
			return consolePage();
		}

		const reply = createReply();
		const route = routes.get(pathname);

		if (!route) {
			return reply.error(404, 'NOT_FOUND');
		}

		if (!route.methods.includes(request.method)) {
			return reply.error(405, 'METHOD_NOT_ALLOWED', { Allow: route.methods.join(', ') });
		}

		return route.handle(request, env, reply);
	},
} satisfies ExportedHandler<Env>;
