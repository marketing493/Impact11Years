import { db, hasStore, pushReady, send, startMs, webpush } from './_lib.js';

const LEAD_MS = 10 * 60 * 1000;

/**
 * Sends a reminder to every subscriber for each activity that starts within the next 10 minutes.
 * Call it every minute: Vercel Cron (Pro) or any external scheduler with
 *   Authorization: Bearer <CRON_SECRET>   (or ?key=<CRON_SECRET>)
 * Each activity is announced once, guarded by a row in ia_sent_reminders.
 */
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return send(res, 500, { error: 'Set CRON_SECRET in the Vercel project.' });
  const ok = req.headers.authorization === `Bearer ${secret}` || req.query?.key === secret;
  if (!ok) return send(res, 401, { error: 'Unauthorized' });
  if (!hasStore() || !pushReady()) return send(res, 503, { error: 'Push keys or storage are not configured.' });

  try {
    const now = Date.now();
    const due = (await db.getActivities()).filter(a => { const d = startMs(a) - now; return d > 0 && d <= LEAD_MS; });
    let sent = 0, removed = 0;
    for (const a of due) {
      if (!(await db.claimReminder(`${a.id}:${a.date}T${a.start}`))) continue;
      const subs = await db.listSubs();
      const mins = Math.max(1, Math.round((startMs(a) - now) / 60000));
      const payload = JSON.stringify({
        title: `Starting in ${mins} ${mins === 1 ? 'minute' : 'minutes'}`,
        body: `${a.title}, ${a.location} at ${a.start}`,
        tag: `act-${a.id}`, url: '/#event-schedule',
      });
      const jobs = [];
      for (const { id, sub } of subs) {
        jobs.push(webpush.sendNotification(sub, payload, { TTL: 600, urgency: 'high' })
          .then(() => { sent++; })
          .catch(async e => { if (e.statusCode === 404 || e.statusCode === 410) { removed++; await db.removeSub(id); } }));
      }
      await Promise.allSettled(jobs);
    }
    return send(res, 200, { ok: true, due: due.map(a => a.title), sent, removed });
  } catch (e) {
    return send(res, 500, { error: 'Server error: ' + e.message });
  }
}
