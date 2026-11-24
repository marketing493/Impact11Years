import { db, hasStore, isAdmin, parsePassCode, pushReady, send, storeName, webpush } from './_lib.js';

/** GET: organizer stats (also used to check the password).
 * POST {action:'checkin', code | pin}: check a person in from their entry QR (or their 6-digit PIN).
 * POST {subscription}: send a test notification to one device. */
export default async function handler(req, res) {
  if (!isAdmin(req)) return send(res, 401, { error: 'Wrong organizer password.' });
  try {
    if (req.method === 'GET') {
      const subscribers = hasStore() ? await db.countSubs() : 0;
      const passes = hasStore() ? await db.passStats() : { passes: 0, checkedIn: 0 };
      return send(res, 200, { subscribers, ...passes, store: hasStore(), storeName: storeName(), push: pushReady(), cron: Boolean(process.env.CRON_SECRET) });
    }
    if (req.method === 'POST' && req.body?.action === 'checkin') {
      if (!hasStore()) return send(res, 503, { error: 'Check-in needs the database.' });
      const fromQr = parsePassCode(req.body.code);
      const pin = fromQr ? fromQr.pin : String(req.body.pin || '').replace(/\D/g, '');
      if (!/^\d{6}$/.test(pin)) return send(res, 400, { ok: false, reason: 'invalid', error: 'That is not an 11 Years of Impact entry pass.' });
      const p = await db.findPass(fromQr ? { email: fromQr.email } : { pin });
      if (!p || p.pin !== pin) return send(res, 404, { ok: false, reason: 'unknown', error: 'No pass matches this code. Ask them to open their pass on the site.' });
      const already = Boolean(p.checkedInAt);
      const at = await db.checkIn(p.email);
      const stats = await db.passStats();
      return send(res, 200, { ok: true, already, at, name: p.name, email: p.email, ...stats });
    }
    if (req.method === 'POST') {
      if (!pushReady()) return send(res, 503, { error: 'Push keys are not configured.' });
      const sub = req.body?.subscription;
      if (!sub?.endpoint) return send(res, 400, { error: 'Turn on reminders on this device first.' });
      await webpush.sendNotification(sub, JSON.stringify({ title: 'Test reminder', body: 'Reminders work on this device.', tag: 'test', url: '/#admin' }));
      return send(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return send(res, 500, { error: 'Could not send: ' + e.message });
  }
}
