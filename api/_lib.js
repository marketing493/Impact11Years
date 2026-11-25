import crypto from 'node:crypto';
import webpush from 'web-push';
import { neon } from '@neondatabase/serverless';
import DEFAULTS from './_defaults.js';

/* ---------- storage ----------
 Neon Postgres (DATABASE_URL, set by the Vercel Neon integration) is the primary store.
 Upstash Redis (KV_REST_API_URL + KV_REST_API_TOKEN) still works as an alternative. */
const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
let sql = PG_URL ? neon(PG_URL) : null;
export const __useSql = fn => { sql = fn; ready = null; }; // local tests only
export const CATEGORIES = ['Stage', 'Food', 'Games', 'Music', 'Social', 'Other'];
export const TZ_OFFSET = '+05:30'; // all activity times are IST

export const storeName = () => (sql ? 'Neon Postgres' : KV_URL && KV_TOKEN ? 'Upstash Redis' : null);
export const hasStore = () => Boolean(storeName());

async function redis(...command) {
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

/* Tables are created on first use, so there is no migration step. */
let ready = null;
/* Under a rush, many fresh instances run this at once; Postgres can then report the table as already
   created (42P07) or a duplicate catalogue row (23505). Both mean another instance won the race. */
const ddl = async run => { try { await run(); } catch (e) { if (!['42P07', '23505', '42710'].includes(e.code) && !/already exists/i.test(String(e.message))) throw e; } };
function schema() {
  ready ??= (async () => {
    await ddl(() => sql`CREATE TABLE IF NOT EXISTS ia_settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`);
    await ddl(() => sql`CREATE TABLE IF NOT EXISTS ia_push_subs (id text PRIMARY KEY, subscription jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
    await ddl(() => sql`CREATE TABLE IF NOT EXISTS ia_sent_reminders (key text PRIMARY KEY, sent_at timestamptz NOT NULL DEFAULT now())`);
    await ddl(() => sql`CREATE TABLE IF NOT EXISTS ia_passes (email text PRIMARY KEY, name text NOT NULL, pin char(6) NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), checked_in_at timestamptz)`);
  })().catch(e => { ready = null; throw e; });
  return ready;
}

export const db = {
  async getActivities() {
    if (sql) {
      await schema();
      const rows = await sql`SELECT value FROM ia_settings WHERE key = 'activities'`;
      return rows.length ? rows[0].value : DEFAULTS;
    }
    if (hasStore()) { const raw = await redis('GET', 'activities'); return raw ? JSON.parse(raw) : DEFAULTS; }
    return DEFAULTS;
  },
  async setActivities(list) {
    if (sql) {
      await schema();
      const v = JSON.stringify(list);
      await sql`INSERT INTO ia_settings (key, value) VALUES ('activities', ${v}::jsonb)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
      return;
    }
    await redis('SET', 'activities', JSON.stringify(list));
  },
  async addSub(id, sub) {
    if (sql) {
      await schema();
      const v = JSON.stringify(sub);
      await sql`INSERT INTO ia_push_subs (id, subscription) VALUES (${id}, ${v}::jsonb)
                ON CONFLICT (id) DO UPDATE SET subscription = EXCLUDED.subscription`;
      return;
    }
    await redis('HSET', 'subs', id, JSON.stringify(sub));
  },
  async removeSub(id) {
    if (sql) { await schema(); await sql`DELETE FROM ia_push_subs WHERE id = ${id}`; return; }
    await redis('HDEL', 'subs', id);
  },
  async listSubs() {
    if (sql) { await schema(); return (await sql`SELECT id, subscription FROM ia_push_subs`).map(r => ({ id: r.id, sub: r.subscription })); }
    const flat = (await redis('HGETALL', 'subs')) || [];
    const out = [];
    for (let i = 0; i < flat.length; i += 2) out.push({ id: flat[i], sub: JSON.parse(flat[i + 1]) });
    return out;
  },
  async countSubs() {
    if (sql) { await schema(); return Number((await sql`SELECT count(*)::int AS n FROM ia_push_subs`)[0].n); }
    return hasStore() ? redis('HLEN', 'subs') : 0;
  },
  /* ---------- entry passes: one fixed, unique 6-digit PIN per person, and their check-in time ---------- */
  async getOrCreatePass(email, name) {
    email = String(email).toLowerCase();
    if (sql) {
      await schema();
      for (let i = 0; i < 20; i++) {
        try {
          /* one statement: creates the pass with a new PIN, or keeps the existing PIN and refreshes the name */
          const rows = await sql`INSERT INTO ia_passes (email, name, pin) VALUES (${email}, ${name || email}, ${newPin()})
                                 ON CONFLICT (email) DO UPDATE SET name = COALESCE(NULLIF(EXCLUDED.name, ''), ia_passes.name)
                                 RETURNING email, name, pin, checked_in_at`;
          return toPass(rows[0]);
        } catch (e) {
          if (e.code === '23505' && /pin/.test(String(e.constraint || e.message))) continue; // that PIN is taken: draw another
          throw e;
        }
      }
      throw new Error('Could not create a unique PIN.');
    }
    const raw = await redis('HGET', 'passes', email);
    if (raw) { const p = JSON.parse(raw); if (name && p.name !== name) { p.name = name; await redis('HSET', 'passes', email, JSON.stringify(p)); } return p; }
    for (let i = 0; i < 20; i++) {
      const pin = newPin();
      if (await redis('HSETNX', 'pins', pin, email)) {
        const p = { email, name: name || email, pin, checkedInAt: null };
        if (await redis('HSETNX', 'passes', email, JSON.stringify(p))) return p;
        await redis('HDEL', 'pins', pin);
        return JSON.parse(await redis('HGET', 'passes', email));
      }
    }
    throw new Error('Could not create a unique PIN.');
  },
  async findPass({ email, pin }) {
    if (sql) {
      await schema();
      const rows = email ? await sql`SELECT email, name, pin, checked_in_at FROM ia_passes WHERE email = ${String(email).toLowerCase()}`
                         : await sql`SELECT email, name, pin, checked_in_at FROM ia_passes WHERE pin = ${pin}`;
      return rows.length ? toPass(rows[0]) : null;
    }
    const e = email ? String(email).toLowerCase() : await redis('HGET', 'pins', pin);
    const raw = e && await redis('HGET', 'passes', e);
    return raw ? JSON.parse(raw) : null;
  },
  /** Marks a pass as checked in; returns the time of the first check-in (unchanged on repeat scans). */
  async checkIn(email) {
    if (sql) {
      await schema();
      const rows = await sql`UPDATE ia_passes SET checked_in_at = COALESCE(checked_in_at, now()) WHERE email = ${email} RETURNING checked_in_at`;
      return rows.length ? new Date(rows[0].checked_in_at).toISOString() : null;
    }
    const p = JSON.parse(await redis('HGET', 'passes', email));
    p.checkedInAt ||= new Date().toISOString();
    await redis('HSET', 'passes', email, JSON.stringify(p));
    return p.checkedInAt;
  },
  async passStats() {
    if (sql) {
      await schema();
      const r = (await sql`SELECT count(*)::int AS passes, count(checked_in_at)::int AS checked FROM ia_passes`)[0];
      return { passes: r.passes, checkedIn: r.checked };
    }
    if (!hasStore()) return { passes: 0, checkedIn: 0 };
    const all = Object.values(Object.fromEntries(chunk((await redis('HGETALL', 'passes')) || []))).map(v => JSON.parse(v));
    return { passes: all.length, checkedIn: all.filter(p => p.checkedInAt).length };
  },

  /** True only for the first caller, so each reminder goes out once. */
  async claimReminder(key) {
    if (sql) {
      await schema();
      const rows = await sql`INSERT INTO ia_sent_reminders (key) VALUES (${key}) ON CONFLICT (key) DO NOTHING RETURNING key`;
      return rows.length > 0;
    }
    return Boolean(await redis('SET', 'sent:' + key, '1', 'NX', 'EX', 60 * 60 * 24 * 30));
  },
};

const newPin = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const toPass = r => ({ email: r.email, name: r.name, pin: String(r.pin), checkedInAt: r.checked_in_at ? new Date(r.checked_in_at).toISOString() : null });
const chunk = flat => { const out = []; for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]]); return out; };

/** What the entry QR code contains: readable by any phone camera, parsed by the organiser scanner. */
export const passCode = p => `IA11|${p.pin}|${p.email}|${p.name}`;
export function parsePassCode(text) {
  const m = /^IA11\|(\d{6})\|([^|]+)\|(.*)$/s.exec(String(text || '').trim());
  return m ? { pin: m[1], email: m[2].toLowerCase(), name: m[3] } : null;
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
  /* stray spaces or a newline pasted into Vercel's value (or the login box) should not lock organizers out */
  const want = String(process.env.ADMIN_PASSWORD || '').trim().replace(/^(['"])(.*)\1$/, '$2').trim(), got = req.headers['x-admin-key'];
  if (!want || typeof got !== 'string') return false;
  const a = crypto.createHash('sha256').update(want).digest(), b = crypto.createHash('sha256').update(got.trim()).digest();
  return crypto.timingSafeEqual(a, b);
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
