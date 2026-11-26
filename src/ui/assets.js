import { readFileSync } from 'node:fs';

export const PANEL_CSS = readFileSync(new URL('./panel.css', import.meta.url), 'utf8').trim();
export const PANEL_HTML = readFileSync(new URL('./panel.html', import.meta.url), 'utf8').trim();
