# 11 Years of Impact: Brand Kit

Everything needed to make new assets that match the event website exactly, packaged for a **Claude Project**.

## Set up the Claude Project (about 5 minutes)

1. Go to **claude.ai → Projects → Create project**. Name it **11 Years of Impact – Design Studio** and describe it as "Makes on-brand assets for the Around the World in 11 Years celebration."
2. Open **Set project instructions** (or **Instructions**) and paste the whole of `project-instructions.md`.
3. In **Project knowledge**, click **+ Add content → Upload from device** and upload:
   - `design-guide.md`
   - `tokens.css`
   - `components.html`
   - `png/components-reference.jpg`
   - everything in `svg/`
   - the most useful renders from `png/`: `globe-transparent.png`, `boarding-pass-wallet.png`, `boarding-pass-ticket.png`, `envelope-closed.png`, `stamp-bengaluru.png`, `wax-seal-11.png`, `departures-board.png`, `marquee-strip.png`
   - the worked example: `examples/instagram-fireside-chat-1080.html` and `.png`
   - a few screenshots from `screenshots/`: `desktop-01-hero.jpg`, `desktop-02-invitation.jpg`, `desktop-06-departures.jpg`, `mobile-01-hero.jpg`

   If the project says it is near its knowledge limit, drop screenshots first; the guide, tokens and SVGs matter most.
4. Start a chat in the project and try: *"Make a 1080×1080 Instagram post announcing the Fireside Chat at 12:00."*

## What's in the kit

| Path | What it is |
|---|---|
| `project-instructions.md` | Paste into the project's instructions. |
| `design-guide.md` | The full spec: facts, schedule, colours, gradients, type, graphics, voice, layout, formats. |
| `tokens.css` | Exact CSS variables and ready-made classes (gold button, stamp, seal, flap tile, eyebrow, headings). |
| `components.html` | A reference page using the tokens; open it in a browser (keep it next to `svg/` and `png/`). |
| `svg/` | Vector graphics taken from the site: logo, 9 landmark icons, postmark, waves, medal, corner flourish, dial, plane, chandelier, bunting. |
| `png/` | High-resolution renders: globe (transparent), stamps, seal, envelope (closed and open), boarding pass (ticket and wallet), board, dials, buttons, tent, venue floor plan, marquee, colour logo, and the components sheet. |
| `examples/` | A finished 1080×1080 post built only from this kit, as a model for new work. |
| `screenshots/` | Every section of the site on desktop, plus key phone views and the login page. |
| `11-years-of-impact-brand-kit.zip` | All of the above in one file. |

## Notes
- Fonts (Spectral, Inter Tight, Cinzel) are free from Google Fonts. Install them locally if you design in Figma, Canva or PowerPoint.
- In tools that can't layer gradients (PowerPoint, Canva), use the plain gold fade `170°: #FFFBEA 0%, #F7E3A1 40%, #EBC96B 75%, #F7E3A1 100%`, or place `png/` renders.
- The boarding-pass renders show a sample passenger (Garvit Sindhwani) and a sample QR code; don't use those QR codes on real passes.
