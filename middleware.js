/**
 * Locks the whole site behind Google sign-in (Impact Analytics accounts only).
 * Runs on Vercel's edge before every request except the sign-in page, its assets, the sign-in API,
 * the site config and the reminders cron. Without a valid session: pages show the sign-in page and
 * the API answers 401. The lock is only on when GOOGLE_CLIENT_ID and SESSION_SECRET are both set,
 * so the site cannot lock everyone out before sign-in is configured.
 */
import { gateOn, readSession } from './api/_session.js';

export const config = {
  matcher: ['/((?!api/auth|api/config|api/notify|login\\.html|icons/|manifest\\.webmanifest|sw\\.js|robots\\.txt).*)'],
};

const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

export default async function middleware(request) {
  const env = process.env;
  if (!gateOn(env)) return pass();
  if (await readSession(request.headers.get('cookie'), env.SESSION_SECRET)) return pass();
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Please sign in with your Impact Analytics Google account.' }), {
      status: 401, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(null, {
    headers: { 'x-middleware-rewrite': new URL('/login.html', url).toString(), 'Cache-Control': 'private, no-store' },
  });
}
