import { send } from './_lib.js';
import { gateOn, makeSession, readSession, sessionCookie } from './_session.js';

/**
 * Google sign-in for Impact Analytics accounts only.
 *   POST   {credential}  verify a Google ID token; on success set the session cookie and return the name
 *   GET                  who is signed in (from the session cookie), 401 if nobody
 *   DELETE               sign out: clear the session cookie
 * In Google's redirect mode (used in home-screen apps) the POST is a form with g_csrf_token, which must match
 * the g_csrf_token cookie Google set (double-submit check); the answer is then a redirect instead of JSON.
 * The token is verified by Google's tokeninfo endpoint, then accepted only if it was issued for this site
 * (GOOGLE_CLIENT_ID), is unexpired, has a verified email and belongs to the allowed Workspace domain.
 */
const DOMAIN = (process.env.GOOGLE_ALLOWED_DOMAIN || 'impactanalytics.co').trim().toLowerCase();

export default async function handler(req, res) {
  const secret = process.env.SESSION_SECRET;

  if (req.method === 'GET') {
    const s = await readSession(req.headers && req.headers.cookie, secret);
    return s ? send(res, 200, { name: s.name, email: s.email }) : send(res, 401, { error: 'Not signed in.' });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie('', 0));
    return send(res, 200, { ok: true });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });

  const form = String((req.headers && req.headers['content-type']) || '').includes('application/x-www-form-urlencoded');
  const reply = (status, body) => {
    if (!form) return send(res, status, body);
    const to = status === 200 ? '/' : '/login.html?e=' + encodeURIComponent(body.error || 'Sign-in failed.');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 303; res.setHeader('Location', to); return res.end();
  };
  if (form) {
    const fromCookie = ((req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith('g_csrf_token=')) || '').slice(13);
    if (!fromCookie || !req.body || req.body.g_csrf_token !== fromCookie) return reply(400, { error: 'Sign-in check failed. Please try again.' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return reply(503, { error: 'Google sign-in is not set up yet.' });

  const credential = req.body && req.body.credential;
  if (typeof credential !== 'string' || !credential || credential.length > 4096) {
    return reply(400, { error: 'Missing sign-in token.' });
  }

  let t;
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
    if (!r.ok) return reply(401, { error: 'Google could not verify this sign-in. Please try again.' });
    t = await r.json();
  } catch (e) {
    return reply(502, { error: 'Could not reach Google. Please try again.' });
  }

  const issuerOk = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
  const fresh = Number(t.exp) * 1000 > Date.now();
  if (t.aud !== clientId || !issuerOk || !fresh) {
    return reply(401, { error: 'This sign-in is not valid for this site. Please try again.' });
  }
  const email = String(t.email || '').toLowerCase();
  const verified = t.email_verified === true || t.email_verified === 'true';
  if (!verified || String(t.hd || '').toLowerCase() !== DOMAIN || !email.endsWith('@' + DOMAIN)) {
    return reply(403, { error: `Please sign in with your @${DOMAIN} Google account.` });
  }

  const user = { name: String(t.name || '').slice(0, 80), given: String(t.given_name || '').slice(0, 40), email };
  if (gateOn(process.env)) res.setHeader('Set-Cookie', sessionCookie(await makeSession(secret, user)));
  return reply(200, user);
}
