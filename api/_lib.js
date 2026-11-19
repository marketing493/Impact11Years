import crypto from 'node:crypto';
import webpush from 'web-push';
import DEFAULTS from './_defaults.js';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const CATEGORIES = ['Stage', 'Food', 'Games', 'Music', 'Social', 'Other'];
export const TZ_OFFSET = '+05:30'; // all activity times are IST

export const hasStore = () => Boolean(KV_URL && KV_TOKEN);

/** Run one Redis command through the Upstash REST API. */
export async function redis(...command) {
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export function pushReady() {
  const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject || 'mailto:events@impactanalytics.co', pub, priv);
  return true;
}
export { webpush };

/** Constant-time password check against ADMIN_PASSWORD. */
export function isAdmin(req) {
  const want = process.env.ADMIN_PASSWORD, got = req.headers['x-admin-key'];
  if (!want || typeof got !== 'string') return false;
  const a = crypto.createHash('sha256').update(want).digest(), b = crypto.createHash('sha256').update(got).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function getActivities() {
  if (!hasStore()) return DEFAULTS;
  const raw = await redis('GET', 'activities');
  return raw ? JSON.parse(raw) : DEFAULTS;
}

export const startMs = a => Date.parse(`${a.date}T${a.start}:00${TZ_OFFSET}`);
export const subKey = endpoint => crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 32);

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/, DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (v, max) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

/** Validate and normalise a list of activities. Returns { list } or { error }. */
export function validateActivities(input) {
  if (!Array.isArray(input) || input.length > 200) return { error: 'Send a list of up to 200 activities.' };
  const list = [];
  for (const [i, a] of input.entries()) {
    const item = {
      id: clean(a.id, 24) || 'a' + crypto.randomBytes(5).toString('hex'),
      title: clean(a.title, 80), date: clean(a.date, 10), start: clean(a.start, 5), end: clean(a.end, 5),
      location: clean(a.location, 40) || 'Main hall', category: CATEGORIES.includes(a.category) ? a.category : 'Other',
      description: clean(a.description, 280),
    };
    const n = `Activity ${i + 1}`;
    if (item.title.length < 3) return { error: `${n} needs a title of at least 3 characters.` };
    if (!DATE.test(item.date) || Number.isNaN(Date.parse(item.date))) return { error: `${n} needs a date like 2026-12-17.` };
    if (!HHMM.test(item.start) || !HHMM.test(item.end)) return { error: `${n} needs start and end times like 14:30.` };
    if (item.end <= item.start) return { error: `${n} must end after it starts.` };
    list.push(item);
  }
  list.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  return { list };
}

export function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
