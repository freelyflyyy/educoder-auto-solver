import { STORAGE_KEYS } from './constants.js';

function parseAuthCookies() {
  let session = null;
  let autologin = null;
  const raw = typeof document !== 'undefined' ? document.cookie : '';
  for (const chunk of String(raw || '').split(';')) {
    const entry = chunk.trim();
    const eq = entry.indexOf('=');
    if (eq <= 0) continue;
    const name = entry.slice(0, eq);
    if (session === null && name === '_educoder_session') {
      session = entry.slice(eq + 1);
      if (autologin !== null) break;
    } else if (autologin === null && name === 'autologin_trustie') {
      autologin = entry.slice(eq + 1);
      if (session !== null) break;
    }
  }
  return { session: session || '', autologin: autologin || '' };
}

/**
 * Session credential reader for Educoder cookies and tenant identifiers (`zzud`).
 */
export const Session = {
  /** Single-pass read returning both session token and serialized Cookie header for `Http.once`. */
  authSnapshot() {
    const { session, autologin } = parseAuthCookies();
    const parts = [];
    if (autologin) parts.push(`autologin_trustie=${autologin}`);
    if (session) parts.push(`_educoder_session=${session}`);
    return { session, cookie: parts.join('; ') };
  },
  zzud() {
    return new URLSearchParams(location.search).get('zzud')
      || sessionStorage.getItem(STORAGE_KEYS.zzud)
      || localStorage.getItem(STORAGE_KEYS.zzud)
      || '';
  },
};
