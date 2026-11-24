import { send } from './_lib.js';

/**
 * Google sign-in for Impact Analytics accounts only.
 * The browser sends the ID token it got from Google; Google's tokeninfo endpoint checks its signature,
 * then this handler checks it was issued for this site (GOOGLE_CLIENT_ID), is unexpired, has a verified
 * email and belongs to the allowed Google Workspace domain. Returns only the name and email.
 */
const DOMAIN = (process.env.GOOGLE_ALLOWED_DOMAIN || 'impactanalytics.co').trim().toLowerCase();

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return send(res, 503, { error: 'Google sign-in is not set up yet.' });

  const credential = req.body && req.body.credential;
  if (typeof credential !== 'string' || !credential || credential.length > 4096) {
    return send(res, 400, { error: 'Missing sign-in token.' });
  }

  let t;
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
    if (!r.ok) return send(res, 401, { error: 'Google could not verify this sign-in. Please try again.' });
    t = await r.json();
  } catch (e) {
    return send(res, 502, { error: 'Could not reach Google. Please try again.' });
  }

  const issuerOk = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
  const fresh = Number(t.exp) * 1000 > Date.now();
  if (t.aud !== clientId || !issuerOk || !fresh) {
    return send(res, 401, { error: 'This sign-in is not valid for this site. Please try again.' });
  }
  const email = String(t.email || '').toLowerCase();
  const verified = t.email_verified === true || t.email_verified === 'true';
  if (!verified || String(t.hd || '').toLowerCase() !== DOMAIN || !email.endsWith('@' + DOMAIN)) {
    return send(res, 403, { error: `Please sign in with your @${DOMAIN} Google account.` });
  }

  return send(res, 200, {
    name: String(t.name || '').slice(0, 80),
    given: String(t.given_name || '').slice(0, 40),
    email,
  });
}
