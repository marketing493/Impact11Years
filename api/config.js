import { hasStore } from './_lib.js';
import { gateOn } from './_session.js';

export default function handler(req, res) {
  const pub = process.env.VAPID_PUBLIC_KEY || '';
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.status(200).json({
    vapidPublicKey: pub,
    push: Boolean(pub && process.env.VAPID_PRIVATE_KEY && hasStore()),
    store: hasStore(),
    admin: Boolean(process.env.ADMIN_PASSWORD),
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleDomain: (process.env.GOOGLE_ALLOWED_DOMAIN || 'impactanalytics.co').trim().toLowerCase(),
    locked: gateOn(process.env),
  });
}
