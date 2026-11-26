import { readFileSync } from 'node:fs';

/** Shell hook deployed as `/tmp/eval_hook/answerhook.sh` inside Linux containers (inlined by `build.mjs`). */
export const ANSWER_HOOK_SCRIPT = readFileSync(
  new URL('./answerhook.sh', import.meta.url),
  'utf8',
);
