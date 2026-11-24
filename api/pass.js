import { db, hasStore, passCode, send } from './_lib.js';
import { readSession } from './_session.js';

/** GET: the signed-in person's entry pass (name, email, fixed 6-digit PIN and the text for their QR code). */
export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Use GET.' });
  const s = await readSession(req.headers && req.headers.cookie, process.env.SESSION_SECRET);
  if (!s) return send(res, 401, { error: 'Sign in to get your entry pass.' });
  if (!hasStore()) return send(res, 503, { error: 'Entry passes need the database.' });
  try {
    const p = await db.getOrCreatePass(s.email, s.name);
    return send(res, 200, { name: p.name, email: p.email, pin: p.pin, code: passCode(p), checkedIn: Boolean(p.checkedInAt) });
  } catch (e) {
    return send(res, 500, { error: 'Could not load your pass. Please try again.' });
  }
}
