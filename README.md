# Impact Events: 11 Years of Impact

A gamified event app for the Impact Analytics 11th anniversary celebration (17 December 2026, Hilton Embassy Tech Village, Bangalore). This is a clickable prototype with sample data. It follows the IA brand guidelines: Impact Blue, Off-White and Black, Spectral Light headlines with Inter Tight body copy, the thin-line grid pattern with grain, and the clarifying glass effect.

## Three surfaces

- **Employee app.** Home, event info, play, ranks and profile, plus overlays for quizzes, games, the Cell Drop, the journey map, check-in, updates and the gallery.
- **Admin console.** Dashboard, employees, point awards, roles and access, QR check-in, live control, announcements, gallery moderation, quizzes, game submissions, leaderboard freeze and reports. Switch "Viewing as" to see each role's access.
- **Live stage.** A 16:9 screen for the main hall: welcome countdown, Impact Grid, live quiz with answer reveal, poll, top 10, department race, winner and celebration. Arrow keys move between screens.

## The game

- **The Impact Grid.** 1,111 shared cells (11 rows by 101 columns). Every 10 points anyone earns lights one cell. Lit cells slowly reveal the message "11 YEARS OF IMPACT".
- **Levels.** Every 300 points unlocks the next year of the company journey, from Year 1 to Year 11.
- **Quizzes.** 40 points per correct answer, up to 20 more for speed, and combo multipliers of 1.25x, 1.5x and 2x.
- **Daily quests, the Cell Drop, streaks, badges, a podium leaderboard and a department race.**

## Files

- `index.html` is the built, self-contained app. Open it in any browser.
- `src/` holds the source: `styles.css`, `data.js` (content), `app.js` (state, grid, points), `employee.js`, `admin.js`, `live.js`, `main.js` (actions and render).
- `assets/` holds the official IA logo files.
- Run `python3 build.py` to rebuild `index.html` and `dist/artifact.html` after editing `src/`.

Build notes beside each screen list the Supabase tables, row level security rules and server-side logic for the production build.

## Deploy to Vercel

The repo is ready for Vercel. `vercel.json` runs `python3 build.py` and serves the `public/` folder. No other setup is needed.

1. In Vercel, choose **Add New > Project** and import `marketing493/Impact11Years`.
2. Leave the settings as they are. Vercel reads them from `vercel.json`.
3. Click **Deploy**.

Every push to the repo redeploys the site. Pushes to the production branch update the live URL. Pushes to other branches get preview URLs.

To deploy from your own machine instead, install the CLI with `npm i -g vercel`, run `vercel` in the repo folder, and then run `vercel --prod`.
