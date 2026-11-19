import { hasStore, send } from './_lib.js';

export default function handler(req, res) {
  const pub = process.env.VAPID_PUBLIC_KEY || '';
  send(res, 200, {
    vapidPublicKey: pub,
    push: Boolean(pub && process.env.VAPID_PRIVATE_KEY && hasStore()),
    store: hasStore(),
    admin: Boolean(process.env.ADMIN_PASSWORD),
  });
}
