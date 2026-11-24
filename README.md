# Impact Events: 11 Years of Impact

An installable web app for the Impact Analytics 11th anniversary (17 December 2026, Hilton Embassy Tech Village, Bangalore). It follows the IA brand guidelines.

## What it does

A single home page for the celebration: the gold globe entrance with a countdown, the monuments skyline, a wax-sealed invitation, the voyage around the world, a departures board with every session, the World's Fair pavilions, the venue and reminders. The organizer dashboard at `/#admin` edits the activities and timings. The earlier separate event pages (About, Journey, Schedule, Venue, Activities, FAQs) are retired; old links to them open the home page.

## Design

The app runs the **Royal** design, built on the event theme "11th Anniversary · Around the World in 11 Years". The earlier **Modern** design (IA brand system) is switched off for now but kept in the code. Set `ROYAL_ONLY = false` in `src/royal.js` to bring back the header switch between the two.

Royal uses royal navy, gilded gold and ivory with Cinzel capitals. Its home page has:

- **The entrance:** a luminous gold globe drawn from Natural Earth land data, with glowing routes between the voyage stops, an orbiting plane and a medallion. Around it: engraved gold title lettering, a countdown of four gold astrolabe dials with glowing arcs and orbiting stars, gilded corner flourishes, gold dust and a faint damask. Drag the globe to spin it.
- **A wax-sealed invitation** that opens on tap.
- **The voyage:** a gold plane flies a dotted world map (Natural Earth land data) and stops at a postcard for each milestone.
- **A split-flap departures board** for the programme.
- **World's Fair pavilion tents** whose curtains open on each category.
- **The venue as a grand ballroom.**

Every other page is restyled in the Royal theme too. The music starts by itself when the voyage, the story or the Journey page comes on screen, once the visitor has tapped or clicked anywhere on the page. Muting is remembered.

## Deploy on Vercel

### 1. Import the repo
In Vercel, choose **Add New > Project**, import this repo and click **Deploy**. `vercel.json` already sets the build. Until the database and keys below are set, the site runs in demo mode: admin changes stay in one browser and reminders only fire while the app is open.

### 2. Connect the database
Connect a **Neon** Postgres database under the project's **Storage** tab. Vercel adds `DATABASE_URL` for you. The app creates its three tables on first use, so there is nothing to run:

- `ia_settings` holds the activity schedule.
- `ia_push_subs` holds one row per phone with reminders turned on.
- `ia_sent_reminders` records each reminder sent, so none goes out twice.

Upstash Redis still works as an alternative if `DATABASE_URL` is not set.

### 3. Add environment variables
Under **Settings > Environment Variables** add:

| Name | Value |
|------|-------|
| `ADMIN_PASSWORD` | A strong password for organizers |
| `VAPID_PUBLIC_KEY` | From the command below |
| `VAPID_PRIVATE_KEY` | From the command below. Keep it secret. |
| `VAPID_SUBJECT` | `mailto:` followed by an organizer email address |
| `CRON_SECRET` | Any long random string |
| `GOOGLE_CLIENT_ID` | OAuth client ID for "Sign in with Google" (see below). Leave unset to hide sign-in. |
| `GOOGLE_ALLOWED_DOMAIN` | Optional. Google Workspace domain allowed to sign in. Default `impactanalytics.co`. |
| `SESSION_SECRET` | A long random string (for example `openssl rand -hex 32`). With `GOOGLE_CLIENT_ID`, it locks the site. |

**Google sign-in** locks the whole site and puts each person's name on their boarding pass. Only verified
accounts on the allowed domain are accepted (checked on the server in `api/auth.js`). Signing in sets a
signed, HTTP-only session cookie for 30 days; `middleware.js` checks it on every request and shows the
sign-in page (`login.html`, which contains no event details) to everyone else, and the API answers 401.
The lock only turns on when both `GOOGLE_CLIENT_ID` and `SESSION_SECRET` are set, so the site cannot lock
everyone out before sign-in is set up. The reminders cron (`/api/notify`) is not affected.

To get the client ID:
1. In Google Cloud Console, open **APIs & Services > OAuth consent screen**, choose **Internal** (only your
   Workspace users), and fill in the app name and support email.
2. Open **Credentials > Create credentials > OAuth client ID**, type **Web application**.
3. Under **Authorized JavaScript origins** add the site's address, for example `https://11yearsofimpact.vercel.app`.
   Under **Authorized redirect URIs** add the sign-in endpoint, for example
   `https://11yearsofimpact.vercel.app/api/auth` (used by the home-screen app, where pop-ups are unreliable).
4. Copy the client ID into `GOOGLE_CLIENT_ID`, add `SESSION_SECRET`, and redeploy.

Generate the push keys once on your computer:

```bash
npx web-push generate-vapid-keys
```

Redeploy after adding the variables.

### 4. Run the reminder job every minute
`/api/notify` sends the reminders. Something has to call it every minute.

- **Vercel Pro:** add this to `vercel.json` and redeploy. Vercel sends the `CRON_SECRET` automatically.
  ```json
  "crons": [{ "path": "/api/notify", "schedule": "* * * * *" }]
  ```
- **Vercel Hobby (free):** Hobby cron jobs run at most once a day. Use a free scheduler such as cron-job.org instead. Point it at `https://YOUR-SITE.vercel.app/api/notify` every minute, with the header `Authorization: Bearer YOUR_CRON_SECRET`.

The organizer dashboard shows a checklist for the database, push keys and the job secret.

## How people install it

- **Android (Chrome):** the app shows an **Add to home screen** button. Then tap **Turn on reminders**.
- **iPhone and iPad (iOS 16.4 or later):** open the site in Safari, tap **Share**, then **Add to Home Screen**. Open the app from the home screen, then tap **Turn on reminders**. Apple only allows web notifications for apps added to the home screen.

## Files

- `src/` front end: `styles.css`, `data.js` (content), `grid.js` (Impact Grid engine), `app.js` (pages and venue), `pwa.js` (install and reminders), `admin.js`, `main.js` (routing).
- `api/` Vercel serverless functions: `activities`, `subscribe`, `notify`, `admin`, `config`. `_lib.js` holds the Neon storage layer. `_defaults.js` holds the starting schedule, used until an organizer saves changes.
- `static/` service worker and web app manifest. `assets/` logos and app icons.
- `python3 build.py` builds `public/` (what Vercel serves) and `index.html`.

All times are IST. The journey milestones are samples. Replace them in `src/data.js`.
