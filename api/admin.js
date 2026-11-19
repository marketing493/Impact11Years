import { db, hasStore, isAdmin, pushReady, send, storeName, webpush } from './_lib.js';

/** GET: organizer stats (also used to check the password). POST: send a test notification to one device. */
export default async function handler(req, res) {
  if (!isAdmin(req)) return send(res, 401, { error: 'Wrong organizer password.' });
  try {
    if (req.method === 'GET') {
      const subscribers = hasStore() ? await db.countSubs() : 0;
      return send(res, 200, { subscribers, store: hasStore(), storeName: storeName(), push: pushReady(), cron: Boolean(process.env.CRON_SECRET) });
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
