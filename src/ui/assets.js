import { readFileSync } from 'node:fs';

export const PANEL_CSS = readFileSync(new URL('./panel.css', import.meta.url), 'utf8').trim();
export const PANEL_HTML = readFileSync(new URL('./panel.html', import.meta.url), 'utf8').trim();

export function createDefaultSpecialModules(rootDir = ROOT_DIR) {
  return {
    'src/ui/assets.js': () => {
      const css = escapeTemplateLiteral(readFileSync(path.join(rootDir, 'src/ui/panel.css'), 'utf8'));
      const html = escapeTemplateLiteral(readFileSync(path.join(rootDir, 'src/ui/panel.html'), 'utf8'));
      return {
        deps: [],
        exports: ['PANEL_CSS', 'PANEL_HTML'],
        body: `const PANEL_CSS = \`${css}\`;\nconst PANEL_HTML = \`${html}\`;`,
      };
    },
    'src/script/assets.js': () => {
      const script = readFileSync(path.join(rootDir, 'src/script/anyhook.py'), 'utf8');
      return {
        deps: [],
        exports: ['ANY_HOOK_SCRIPT'],
        body: `const ANY_HOOK_SCRIPT = ${JSON.stringify(script)};`,
      };
    },
  };
}