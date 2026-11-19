import { getActivities, hasStore, isAdmin, redis, send, validateActivities } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return send(res, 200, { activities: await getActivities(), store: hasStore() });
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'Wrong organizer password.' });
      if (!hasStore()) return send(res, 503, { error: 'Storage is not connected yet. Add Upstash Redis to the Vercel project.' });
      const { list, error } = validateActivities(req.body?.activities);
      if (error) return send(res, 400, { error });
      await redis('SET', 'activities', JSON.stringify(list));
      return send(res, 200, { activities: list });
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return send(res, 500, { error: 'Server error: ' + e.message });
  }
}
