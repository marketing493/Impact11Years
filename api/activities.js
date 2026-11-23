import { db, hasStore, isAdmin, send, validateActivities } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      /* public, cached at the edge for 20 s and served stale while refreshing: one database read per region, not one per visitor */
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=20, stale-while-revalidate=120');
      return res.status(200).json({ activities: await db.getActivities(), store: hasStore() });
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'Wrong organizer password.' });
      if (!hasStore()) return send(res, 503, { error: 'The database is not connected yet. Connect Neon to the Vercel project.' });
      const { list, error } = validateActivities(req.body?.activities);
      if (error) return send(res, 400, { error });
      await db.setActivities(list);
      return send(res, 200, { activities: list });
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return send(res, 500, { error: 'Server error: ' + e.message });
  }
}
