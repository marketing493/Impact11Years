/**
 * Signed session cookie shared by the API (Node) and the middleware (Edge).
 * Value: base64url(JSON {e: email, n: name, x: expiry ms}) + "." + base64url(HMAC-SHA256(SESSION_SECRET, payload)).
 * Uses Web Crypto only, so the same code runs in both runtimes.
 */
export const COOKIE = 'ia11_session';
export const MAX_AGE_S = 30 * 24 * 3600; // 30 days

const enc = new TextEncoder();
const b64u = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), c => c.charCodeAt(0));

const keys = new Map();
function key(secret) {
  if (!keys.has(secret)) keys.set(secret, crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']));
  return keys.get(secret);
}

/** True when the whole site is locked behind Google sign-in. */
export const gateOn = env => Boolean(env.GOOGLE_CLIENT_ID && env.SESSION_SECRET);

export async function makeSession(secret, { email, name }) {
  const payload = b64u(enc.encode(JSON.stringify({ e: email, n: name, x: Date.now() + MAX_AGE_S * 1000 })));
  const sig = b64u(await crypto.subtle.sign('HMAC', await key(secret), enc.encode(payload)));
  return `${payload}.${sig}`;
}

export async function readSession(cookieHeader, secret) {
  if (!cookieHeader || !secret) return null;
  const m = cookieHeader.split(/;\s*/).find(c => c.startsWith(COOKIE + '='));
  if (!m) return null;
  const [payload, sig] = m.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(secret), unb64u(sig), enc.encode(payload));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(unb64u(payload)));
    if (!s || typeof s.x !== 'number' || s.x < Date.now()) return null;
    return { email: s.e, name: s.n };
  } catch (e) {
    return null;
  }
}

export function sessionCookie(value, maxAge = MAX_AGE_S) {
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
