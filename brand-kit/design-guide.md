# 11 Years of Impact: Design Guide

**Theme:** *Around the World in 11 Years*. Impact Analytics' 11th anniversary is treated as one last flight the whole company takes together. Everything borrows from air travel: boarding passes, departure boards, postage stamps, wax-sealed envelopes, airmail postmarks, a globe with a plane on its route, and world landmarks drawn as fine gold line art.

This guide describes the live event site (11yearsofimpact.vercel.app) exactly. Every new asset should look like it came from that site. When in doubt, open the screenshots in `screenshots/` and match them.

---

## 1. Event facts

| | |
|---|---|
| Event | 11 Years of Impact |
| Theme line | Around the World in 11 Years |
| Company | Impact Analytics |
| Date | Thursday, 17 December 2026 |
| Time | 10:00 AM to 10:00 PM IST |
| Venue | Hilton Embassy TechVillage, Bengaluru (Marathahalli) |
| Boarding pass route | **WRK** (Smartworks, Global Tech Park) ✈ **PRTY** (Hilton, Embassy TechVillage) |
| Flight number | IA 011 |
| Boarding time | 10:00 |
| Airport code used for the city | BLR |
| Years | 2015 to 2026 (Roman numerals on the medal: MMXV to MMXXVI) |
| Audience | Every Impact Analytics employee ("Impacters"), about 700 people |
| Website tagline | Every Moment. Every Connection. Every Impact. |

**Schedule (the departures board):**

| Time | Session | Gate (space) | Pavilion |
|---|---|---|---|
| 10:00 | Check In and Boarding | Entrance | Social |
| 11:00 | Keynote: 11 Years of Impact | Main hall | Stage |
| 12:00 | Fireside Chat | Main hall | Stage |
| 13:00 | Lunch | Atrium | Food |
| 14:00 | Games Arena | Arena | Games |
| 15:00 | Hall of Fame | Main hall | Stage |
| 16:30 | Out of Office | Atrium | Social |
| 17:30 | High Tea | Atrium | Food |
| 18:00 | Impact's Got Talent | Main hall | Stage |
| 19:30 | Turn Up the Volume | Main hall | Music |
| 20:30 | Dinner and DJ | Atrium | Food |
| 21:30 | Closure | Main hall | Social |

Short names (for tight spaces such as the flap board on phones): CHECK-IN, KEYNOTE, FIRESIDE CHAT, LUNCH, GAMES ARENA, HALL OF FAME, OOO, HIGH TEA, TALENT SHOW, VOLUME UP, DINNER & DJ, CLOSURE.

---

## 2. Colour

There are only three families: **blue**, **gold** and **paper**. Never introduce other hues (no greens, reds, purples, no flat white backgrounds).

### Blues and ink
| Token | Hex | Use |
|---|---|---|
| Impact Blue | `#264CD7` | The bright end of every background. Big route codes (WRK, PRTY) and stamp line art on paper. |
| Deep blue | `#22388C` | The middle of every background gradient. |
| Ink | `#1C1B1B` | The dark end of every gradient. Envelope body, marquee strip, board. |
| Navy | `#0A1744` | Text on gold buttons. |
| Board black | `#060B22` → `#03071A` | Inside the split-flap departures board. |

### Gold
| Token | Hex | Use |
|---|---|---|
| Brushed gold | see §3 | **Every gold fill**: buttons, seal, logo, the gold word in headings, badges, flags, bars. |
| Gold line | `#F7E3A1` | Line art, icons, dotted routes on blue, small gold text. |
| Gold hi | `#F3DFA2` | Dial numbers, marquee words, gold text on dark. |
| Gold border | `#D4AF61` | 1px borders, hairlines, eyebrow labels, board header. |
| Gold dots on paper | `#C9A24A` | The dotted flight route on the boarding pass. |
| Gold on paper | `#9C7A36` | Gold-coloured text on ivory (flight number, "11" on stamps). |
| Bronze | `#6B4E1A` | The engraved "11" on the wax seal. |

### Paper
| Token | Hex | Use |
|---|---|---|
| Ivory | `#F7F1E3` | Stamps, boarding pass, the medal centre. |
| Paper light → shade | `#FFFDF5` → `#F7F1E3` → `#EFE5CC` | Boarding pass surface: `radial-gradient(120% 90% at 0 0, #FFFDF5, #F7F1E3 60%, #EFE5CC)`. |
| Text on paper | `#1C1B1B` (labels at 55% opacity) | |

### Text on blue
Headings `#F7F1E3`. Body `rgba(244,244,246,.86)`. Gold accents as above.

---

## 3. Gradients

### 3.1 The one gold: brushed metal
Used for **every** gold surface and gold text. Fine vertical streaks over a near-vertical fade:

```css
background:
  repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 1px, transparent 1px 3px),
  linear-gradient(170deg, #FFFBEA 0%, #F7E3A1 40%, #EBC96B 75%, #F7E3A1 100%);
```

Gold text uses the same background with `background-clip: text; color: transparent`.
Where streaks cannot be layered (SVG fills, canvas, PowerPoint, Figma), use the plain fade: `170°, #FFFBEA 0%, #F7E3A1 40%, #EBC96B 75%, #F7E3A1 100%`.

**Never** use the old darker golds (`#B8944A`, `#9C7A36` as a fill, bronze-to-gold diagonals), yellow, or a flat gold.

### 3.2 Backgrounds: Impact Blue → deep blue → ink
Every background runs from Impact Blue on the left, through deep blue, to near-black on the right. Sections change only the **angle** and stop positions, so consecutive panels feel related but not identical.

| Surface | CSS |
|---|---|
| Hero (with a soft blue glow behind the title) | `radial-gradient(60% 80% at 28% 45%, #264CD7 0%, rgba(38,76,215,.7) 35%, transparent 75%), linear-gradient(100deg, #264CD7 0%, #22388C 59%, #1C1B1B 100%)` |
| Header / default | `linear-gradient(90deg, #264CD7 0%, #22388C 60%, #1C1B1B 100%)` |
| Invitation | `linear-gradient(76deg, #264CD7 0%, #264CD7 34%, #22388C 85%, #1C1B1B 100%)` |
| Schedule, pavilions, footer | `linear-gradient(90deg, #264CD7 0%, #264CD7 22%, #22388C 86%, #1C1B1B 100%)` |
| Venue | `linear-gradient(80deg, #264CD7 0%, #22388C 59%, #1C1B1B 100%)` |
| Reminders | `linear-gradient(99deg, #264CD7 0%, #264CD7 24%, #22388C 83%, #1C1B1B 100%)` |

For portrait formats (phone stories, posters) keep the same idea: bright Impact Blue where the main text sits, fading to ink towards one edge or corner.

### 3.3 Gold hairline
A 1px rule that fades out at both ends, used under the header, above the footer and as dividers:
`linear-gradient(90deg, rgba(235,201,107,0), #EBC96B 18%, #FFF6D6 50%, #EBC96B 82%, rgba(235,201,107,0))`

---

## 4. Typography

Fonts are free on Google Fonts:
`https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter+Tight:wght@400;500;600&family=Spectral:ital,wght@0,300;0,400;1,300&display=swap`

| Role | Font | Settings |
|---|---|---|
| Display headings | **Spectral Light (300)** | Tight tracking (−0.01em), line-height ~1.05, colour `#F7F1E3`. One key word in brushed gold (not italic). |
| Hero word ("World") | Spectral Regular (400) | Very large, tracking −0.035em, brushed gold, soft drop shadow. |
| Big numbers (countdown, "11") | Spectral Light | Gold hi `#F3DFA2`. |
| Marquee words | Spectral Light | ~41px, gold hi. |
| Eyebrows / labels | **Inter Tight Medium (500)** | Uppercase, letter-spacing 0.2–0.26em, 12–15px, gold. |
| Body | Inter Tight Regular (400) | 18px / 1.5, white at 86%. |
| Buttons | Inter Tight SemiBold (600) | 15px. |
| Board letters, pass data | Inter Tight SemiBold (600) | Uppercase. |
| Route codes on the pass | Spectral Light | Impact Blue `#264CD7`, large. |
| Ceremonial (rare) | Cinzel | Only for engraved or formal touches. |

**Heading pattern:** plain words in ivory plus one gold word at the end. Examples from the site:
- Your seat is ***waiting***
- Around the World in ***11 Years***
- Now ***boarding***
- Pavilions of ***play***
- Hilton Embassy ***TechVillage***
- Your phone ***taps*** you on the shoulder

**Eyebrow pattern:** a small uppercase gold label above the heading, flanked by thin gold rules tipped with tiny diamonds: `◆── 11 YEARS OF IMPACT ──◆`.

---

## 5. Graphic elements

Everything is **fine gold line art** (stroke 1.4–1.6px at icon size, round caps and joins) or **ivory paper** objects. Nothing is cartoonish, flat-filled or emoji-like.

| Element | Description | Files |
|---|---|---|
| Logo | "11 Years of Impact" brush lettering with the Impact "i" mark, brushed gold on blue. A colour version (blue on light) is used on paper. | `svg/logo-11-years-of-impact.svg`, `png/logo-11-years-color.png` |
| Globe | Dotted-continent globe in Impact Blue with a gold rim glow, faint gold graticule, glowing gold city dots and a plane flying a gold dotted route. Shows India centred, both hemispheres. | `png/globe-transparent.png` |
| Postage stamps | Ivory, perforated edge, thin gold + blue inner frames, Impact Blue line-art landmark, city name in small spaced capitals, gold "11" top right, tilted −11° to +11°, soft drop shadow. Cities: Bengaluru, New York, Sydney, London, Paris. | `png/stamp-*.png`, CSS in `tokens.css` (`.ia-stamp`) |
| Landmarks (line icons) | Vidhana Soudha (Bengaluru), Statue of Liberty, Sydney Opera House, Big Ben, Eiffel Tower, Colosseum, pagoda, Taj Mahal, crown. | `svg/landmark-*.svg` |
| Wax seal | Brushed gold disc with an engraved bronze "11"; glows and dims slowly. | `png/wax-seal-11.png`, `.ia-seal` |
| Envelope | Near-black envelope with thin gold fold lines and a glowing brushed-gold outline; the seal sits at the point of the flap. | `png/envelope-closed.png`, `png/envelope-open-with-pass.png` |
| Boarding pass | Ivory ticket: "✈ IMPACT ANALYTICS" and "FLIGHT IA 011" top row; WRK ✈ PRTY in big Spectral Impact Blue with a gold dotted route; Passenger / Date / Boarding time; a stub with the colour logo and a QR code. Wallet (portrait) version too. | `png/boarding-pass-ticket.png`, `png/boarding-pass-wallet.png` |
| Departures board | Split-flap tiles (Inter Tight caps) on near-black, gold-bordered panel; times and status in gold, destinations in ivory; status "ON TIME". | `png/departures-board.png` |
| Airmail postmark | Circular "PAR AVION ✦ AIR MAIL ✦ IMPACT ANALYTICS ✦ 2015 TO 2026" with "BLR / 17 · XII · 2026" inside, gold at low opacity, plus wavy cancellation lines. | `svg/postmark-blr.svg`, `svg/airmail-waves.svg` |
| Medal | Black disc with a gold ring and "IMPACT ANALYTICS ◆ MMXV TO MMXXVI ◆" around a gold "11". | `svg/medal-11.svg` |
| Corner flourish | Art-deco gold corner ornament, used in all four corners of hero-style compositions. | `svg/corner-flourish.svg` |
| Countdown dial | Gold ring with tick marks, a gold progress arc and a deep-blue centre disc. | `svg/countdown-dial.svg`, `png/countdown-dials.png` |
| Plane | Small solid gold plane, always heading along a dotted gold route. | `svg/plane.svg` |
| Marquee | Black strip with thin gold top/bottom rules; Spectral words separated by small gold diamonds: Every Moment ◆ Every Connection ◆ Every Impact ◆ Eleven Years ◆ One Team. | `png/marquee-strip.png` |
| Pavilion tent | Striped blue/ivory circus tent with a gold flag, gold sign plate and blue curtains. | `png/pavilion-tent.png` |
| Chandelier, bunting | Gold chandelier (venue); bunting in black / gold / ivory / blue triangles (pavilions). | `svg/chandelier.svg`, `svg/bunting.svg` |
| Sparkles | Tiny four-point gold stars and dots scattered sparingly in empty space. | (draw as simple ✦ shapes) |

**Details that make it look right:**
- Small diamonds (◆) as separators, never bullets or dashes.
- Dotted routes: gold dots/dashes in an arc, with a plane at the end.
- Generous empty space; decorations sit at edges and corners, never behind text.
- Soft, deep shadows (`0 12px 18px rgba(10,16,60,.45)`) on paper objects so they float on the blue.
- Gold is precious: one gold heading word, one gold button, gold line art. Never large gold areas of flat colour.

---

## 6. Components (CSS recipes)

All in `tokens.css`; see `components.html` and `png/components-reference.jpg`.

- **Gold button:** brushed gold, navy text, 1px `#D4AF61` border, 6px radius, `12px 18px` padding, shadow `0 8px 22px -12px rgba(212,175,97,.8)`.
- **Outline button:** `rgba(28,27,27,.22)` fill, 1px `rgba(212,175,97,.7)` border, gold-hi text.
- **Stamp:** `.ia-stamp` (perforated edge via a repeating radial gradient).
- **Seal:** `.ia-seal`.
- **Flap tile:** `.ia-flap` (1.12em × 1.6em, split shading, 3px radius).

---

## 7. Voice and copy

Warm, inclusive, a little playful; uses travel metaphors without overdoing them. Short sentences. Talks to everyone at once ("every one of us").

Real lines from the site:
- "Every one of us has a seat on this flight. The people who were here on day one, the ones who joined last month, and everyone in between."
- "Eleven years in, this is the trip we take together."
- "Your boarding pass is waiting." / "Tap to reveal" / "Get your boarding pass" / "Begin the voyage"
- "Every Moment. Every Connection. Every Impact."
- "Every pavilion hides its line-up. Tap a tent to draw back the curtains."
- "All flights have departed. Thank you for travelling with us."

Rules: sentence case for headings (with the gold word), UPPERCASE only for eyebrows, labels and board text. Write "Bengaluru" in prose (BLR as the code). Write "Hilton Embassy TechVillage" exactly. Use "11" in headlines and "Eleven" at the start of a sentence.

---

## 8. Layout

- Desktop compositions: copy on the left (over the brightest blue), the hero object (globe, envelope, board) on the right towards the darker side.
- Phones / portrait: stacked, centred or left-aligned copy on top, object below.
- Margins: at least 6% of the width on each side; 16px minimum on phones.
- Corner flourishes inset ~20px from each corner on hero-style pieces.
- Header bar (when used): logo left, a gold hairline along the bottom.

---

## 9. Formats that work well

| Asset | Size | Notes |
|---|---|---|
| Instagram / LinkedIn square | 1080 × 1080 | Eyebrow + heading with gold word + one object (stamp, globe, seal). |
| Story / reel cover | 1080 × 1920 | Portrait gradient, object in the lower half, corner flourishes. |
| LinkedIn / email banner | 1584 × 396 / 1200 × 400 | Copy left, globe or postmark right. |
| Email header | 600 px wide | Keep text live (HTML) where possible; Inter Tight falls back to Arial. |
| Slide (16:9) | 1920 × 1080 | Same backgrounds; board style for agendas. |
| Event signage / standee | A-series or 2 × 6 ft | Departures-board style for schedules; landmark stamps for directions. |
| Name badge / lanyard | 3.5 × 5.5 in | Boarding-pass styling: ivory paper, route WRK ✈ PRTY, name as Passenger. |
| Table tents, menu cards | | Ivory paper with gold hairlines and a stamp. |
