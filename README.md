# Impact Events: 11 Years of Impact

An installable web app for the Impact Analytics 11th anniversary (17 December 2026, Hilton Embassy Tech Village, Bangalore). It follows the IA brand guidelines.

## What it does

- **Home.** An interactive Impact Grid hero with a pixel countdown to the event. Move across it for a glowing trail, tap it to send a ripple, switch to Message mode or Draw your own cells. Below it: the next session, a list of upcoming sessions, a 3D venue showcase and the reminders setup.
- **The event.** About, Journey, Schedule, Venue, Activities and Frequently Asked Questions.
- **Organizer dashboard** at `/#admin`. Add, edit and delete activities and their timings. Changes reach every employee within a minute.
- **Install and reminders.** People pin the app to their home screen on Android or iOS and turn on reminders. Each phone gets a notification 10 minutes before every session.

## Deploy on Vercel

### 1. Import the repo
In Vercel, choose **Add New > Project**, import this repo and click **Deploy**. `vercel.json` already sets the build. The site works right away in demo mode, but admin changes then stay in one browser and reminders only fire while the app is open.

### 2. Connect storage
In the project, open **Storage**, add **Upstash for Redis** (free tier is enough) and connect it to the project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you.

### 3. Add environment variables
Under **Settings > Environment Variables** add:

| Name | Value |
|------|-------|
| `ADMIN_PASSWORD` | A strong password for organizers |
| `VAPID_PUBLIC_KEY` | From the command below |
| `VAPID_PRIVATE_KEY` | From the command below. Keep it secret. |
| `VAPID_SUBJECT` | `mailto:` followed by an organizer email address |
| `CRON_SECRET` | Any long random string |

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

The organizer dashboard shows a checklist for storage, push keys and the job secret.

## How people install it

- **Android (Chrome):** the app shows an **Add to home screen** button. Then tap **Turn on reminders**.
- **iPhone and iPad (iOS 16.4 or later):** open the site in Safari, tap **Share**, then **Add to Home Screen**. Open the app from the home screen, then tap **Turn on reminders**. Apple only allows web notifications for apps added to the home screen.

## Files

- `src/` front end: `styles.css`, `data.js` (content), `grid.js` (Impact Grid engine), `app.js` (pages and venue), `pwa.js` (install and reminders), `admin.js`, `main.js` (routing).
- `api/` Vercel serverless functions: `activities`, `subscribe`, `notify`, `admin`, `config`. `_defaults.js` holds the starting schedule.
- `static/` service worker and web app manifest. `assets/` logos and app icons.
- `python3 build.py` builds `public/` (what Vercel serves) and `index.html`.

All times are IST. The journey milestones are samples. Replace them in `src/data.js`.
