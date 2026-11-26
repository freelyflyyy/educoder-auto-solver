import { MARK, VERSION } from '../core/constants.js';
import { PANEL_CSS, PANEL_HTML } from './assets.js';

/** Builds the complete Shadow DOM stylesheet and HTML template string. */
export function buildPanelTemplate(mark = MARK, version = VERSION) {
  return `<style>\n${PANEL_CSS}\n</style>\n${PANEL_HTML.replaceAll('{{MARK}}', mark).replaceAll('{{VERSION}}', version)}`;
}
