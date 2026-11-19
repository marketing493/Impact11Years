import { hasStore, redis, send, subKey } from './_lib.js';

/** POST saves a push subscription, DELETE removes it. */
export default async function handler(req, res) {
  if (!hasStore()) return send(res, 503, { error: 'Storage is not connected.' });
  const sub = req.body?.subscription;
  const endpoint = sub?.endpoint;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || endpoint.length > 1000)
    return send(res, 400, { error: 'Invalid subscription.' });
  try {
    if (req.method === 'POST') {
      if (!sub.keys?.p256dh || !sub.keys?.auth) return send(res, 400, { error: 'Invalid subscription keys.' });
      const clean = { endpoint, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } };
      await redis('HSET', 'subs', subKey(endpoint), JSON.stringify(clean));
      return send(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      await redis('HDEL', 'subs', subKey(endpoint));
      return send(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'POST, DELETE');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return send(res, 500, { error: 'Server error: ' + e.message });
  }
}
