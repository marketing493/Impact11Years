import { db, hasStore, passCode, send } from './_lib.js';

/**
 * Demo: GET returns this device's guest entry pass (fixed 6-digit PIN, QR text), keyed by the random guest id
 * the page keeps on the device. There is no sign-in on the demo site.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Use GET.' });
  const id = String((req.headers && req.headers['x-guest-id']) || '');
  if (!/^[a-z0-9]{12}$/.test(id)) return send(res, 400, { error: 'Missing guest id.' });
  if (!hasStore()) return send(res, 503, { error: 'Entry passes need the database.' });
  try {
    const p = await db.getOrCreatePass(`guest-${id}@demo.impactanalytics.co`, 'Impacter');
    return send(res, 200, { name: p.name, email: p.email, pin: p.pin, code: passCode(p), checkedIn: Boolean(p.checkedInAt) });
  } catch (e) {
    return send(res, 500, { error: 'Could not load your pass. Please try again.' });
  }
}
