import { readFileSync } from 'node:fs';

export const ANY_HOOK_SCRIPT = readFileSync(
  new URL('./anyhook.py', import.meta.url),
  'utf8',
);

export const PY_HOOK_SCRIPT = readFileSync(
  new URL('./pyhook.sh', import.meta.url),
  'utf8',
);
