/**
 * Verifies a Google ID token locally, the way Google recommends for production: the RS256 signature is
 * checked against Google's public keys, which are fetched once and cached for as long as Google allows,
 * so a rush of sign-ins makes no extra calls to Google. Falls back to Google's tokeninfo endpoint only
 * if the keys cannot be fetched at all.
 */
const CERTS = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
let jwks = null, jwksExp = 0, jwksLoading = null;
const keyCache = new Map();

const b64uBytes = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), c => c.charCodeAt(0));
const b64uJson = s => JSON.parse(new TextDecoder().decode(b64uBytes(s)));

async function loadKeys(force) {
  if (!force && jwks && Date.now() < jwksExp) return jwks;
  jwksLoading ??= (async () => {
    const r = await fetch(CERTS);
    if (!r.ok) throw new Error('certs ' + r.status);
    const body = await r.json();
    const maxAge = Number((/max-age=(\d+)/.exec(r.headers.get('cache-control') || '') || [])[1]) || 3600;
    jwks = Object.fromEntries((body.keys || []).map(k => [k.kid, k]));
    jwksExp = Date.now() + Math.min(maxAge, 6 * 3600) * 1000;
    keyCache.clear();
    return jwks;
  })().finally(() => { jwksLoading = null; });
  return jwksLoading;
}

async function publicKey(kid) {
  if (keyCache.has(kid)) return keyCache.get(kid);
  let keys = await loadKeys(false);
  if (!keys[kid]) keys = await loadKeys(true); // Google rotated its keys
  const jwk = keys[kid];
  if (!jwk) return null;
  const k = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  keyCache.set(kid, k);
  return k;
}

/** Returns the token's claims if it is a valid Google ID token for clientId, otherwise null. */
export async function verifyGoogleIdToken(token, clientId) {
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  let header, claims;
  try { header = b64uJson(parts[0]); claims = b64uJson(parts[1]); } catch (e) { return null; }
  if (header.alg !== 'RS256' || !header.kid) return null;

  let signatureOk;
  try {
    const key = await publicKey(header.kid);
    if (!key) return null;
    signatureOk = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  } catch (e) {
    return tokeninfo(token, clientId); // Google's keys unreachable: ask Google directly
  }
  if (!signatureOk) return null;

  const now = Date.now() / 1000;
  if (!ISSUERS.has(claims.iss) || claims.aud !== clientId) return null;
  if (!(Number(claims.exp) > now - 60) || (claims.iat && Number(claims.iat) > now + 300)) return null;
  return claims;
}

async function tokeninfo(token, clientId) {
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token));
    if (!r.ok) return null;
    const t = await r.json();
    if (!ISSUERS.has(t.iss) || t.aud !== clientId || !(Number(t.exp) * 1000 > Date.now())) return null;
    return t;
  } catch (e) {
    return null;
  }
}

export const __resetGoogleKeys = () => { jwks = null; jwksExp = 0; keyCache.clear(); }; // tests only
