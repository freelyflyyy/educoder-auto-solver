import { AK, SK } from './constants.js';

const MD5_K = new Uint32Array(64);
for (let i = 0; i < 64; i += 1) {
  MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
}

const SHIFT_TABLE = [
  [7, 12, 17, 22],
  [5, 9, 14, 20],
  [4, 11, 16, 23],
  [6, 10, 15, 21],
];
const MD5_SHIFTS = new Uint8Array(64);
for (let i = 0; i < 64; i += 1) {
  MD5_SHIFTS[i] = SHIFT_TABLE[i >>> 4][i & 3];
}

const HEX_BYTE = Array.from({ length: 256 }, (_, value) => value.toString(16).padStart(2, '0'));

/** Computes the lowercase hex MD5 digest of an ASCII string. */
export function md5Ascii(text) {
  const bytes = new Uint8Array(Math.ceil((text.length + 9) / 64) * 64);
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i);
  bytes[text.length] = 128;
  const view = new DataView(bytes.buffer);
  view.setUint32(bytes.length - 8, text.length * 8, true);

  let s0 = 0x67452301;
  let s1 = 0xefcdab89;
  let s2 = 0x98badcfe;
  let s3 = 0x10325476;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    let a = s0;
    let b = s1;
    let c = s2;
    let d = s3;
    for (let i = 0; i < 64; i += 1) {
      let f;
      let word;
      if (i < 16) {
        f = (b & c) | (~b & d);
        word = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        word = (5 * i + 1) & 15;
      } else if (i < 48) {
        f = b ^ c ^ d;
        word = (3 * i + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        word = (7 * i) & 15;
      }
      const sum = (a + f + MD5_K[i] + view.getUint32(offset + word * 4, true)) | 0;
      const shift = MD5_SHIFTS[i];
      const nextB = (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0;
      a = d;
      d = c;
      c = b;
      b = nextB;
    }
    s0 = (s0 + a) | 0;
    s1 = (s1 + b) | 0;
    s2 = (s2 + c) | 0;
    s3 = (s3 + d) | 0;
  }

  return HEX_BYTE[s0 & 255] + HEX_BYTE[(s0 >>> 8) & 255] + HEX_BYTE[(s0 >>> 16) & 255] + HEX_BYTE[(s0 >>> 24) & 255]
    + HEX_BYTE[s1 & 255] + HEX_BYTE[(s1 >>> 8) & 255] + HEX_BYTE[(s1 >>> 16) & 255] + HEX_BYTE[(s1 >>> 24) & 255]
    + HEX_BYTE[s2 & 255] + HEX_BYTE[(s2 >>> 8) & 255] + HEX_BYTE[(s2 >>> 16) & 255] + HEX_BYTE[(s2 >>> 24) & 255]
    + HEX_BYTE[s3 & 255] + HEX_BYTE[(s3 >>> 8) & 255] + HEX_BYTE[(s3 >>> 16) & 255] + HEX_BYTE[(s3 >>> 24) & 255];
}

/** MD5 request signature generator for Educoder's PC API authentication scheme. */
export const Crypto = Object.freeze({
  sign(method) {
    const time = Date.now();
    const payload = `method=${method}&ak=${AK}&sk=${SK}&time=${time}`;
    return [time, md5Ascii(btoa(payload))];
  },
});
