import { Prefs } from './config/prefs.js';
import { AiSettings } from './config/ai-settings.js';
import { TemplateCache } from './config/template-cache.js';
import { Route } from './platform/route.js';
import { Scanner } from './platform/scanner.js';
import { AiClient } from './ai/client.js';
import { Solver } from './solver/solver.js';
import { createStore } from './runner/store.js';
import { createRunner } from './runner/runner.js';
import { createView } from './ui/view.js';

/**
 * Initializes preferences, mounts the Shadow DOM assistant dock, and starts the SPA route watcher.
 */
function boot() {
  Prefs.load();
  AiSettings.load();
  const store = createStore();
  const runner = createRunner({
    store,
    prefs: Prefs,
    route: Route,
    scanner: Scanner,
    solver: Solver,
  });
  const view = createView({
    store,
    runner,
    prefs: Prefs,
    aiSettings: AiSettings,
    aiClient: AiClient,
    templateCache: TemplateCache,
    route: Route,
  });
  view.build();
  view.startWatcher();
}

if (document.body) boot();
else document.addEventListener('DOMContentLoaded', boot, { once: true });
