"""Bundle src/ into one page and assemble the deployable site.
Outputs:
  public/            what Vercel serves (index.html, sw.js, manifest, icons)
  index.html         the same page at the repo root, handy to open locally
  dist/artifact.html fragment for a claude.ai Artifact preview
"""
import base64, datetime, json, os, pathlib, re, shutil, subprocess
R = pathlib.Path(__file__).parent
b64 = lambda p: 'data:image/png;base64,' + base64.b64encode((R / p).read_bytes()).decode()

def git_sha():
    sha = os.environ.get('VERCEL_GIT_COMMIT_SHA', '')
    if not sha:
        try: sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=R, text=True).strip()
        except Exception: sha = 'local'
    return sha[:7]
BUILD = {'commit': git_sha(), 'branch': os.environ.get('VERCEL_GIT_COMMIT_REF', ''), 'built': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}

defaults = (R / 'api/_defaults.js').read_text()
defaults = json.loads(re.sub(r'^\s*export default\s*', '', defaults).rstrip().rstrip(';'))
css = (R / 'src/styles.css').read_text() + (R / 'src/royal.css').read_text()
js = '\n'.join((R / f'src/{n}.js').read_text() for n in ['vendor-qrcode', 'data', 'grid', 'fx', 'audio', 'story', 'app', 'pages', 'royal-data', 'royal', 'royal-hero', 'pwa', 'admin', 'checkin', 'main'])
js = (js.replace('__LOGO_H__', b64('assets/Logo.png'))
        .replace('__ICON__', b64('assets/icons/icon-192.png'))
        .replace('__LOGO_COLOR__', b64('assets/logo-11-years-color.png'))
        .replace('__DEFAULTS__', json.dumps(defaults, ensure_ascii=False))
        .replace('__WORLD__', (R / 'assets/world-dots.json').read_text().strip())
        .replace('__WORLD_HD__', ((R / 'assets/world-dots-hd.json') if (R / 'assets/world-dots-hd.json').exists() else (R / 'assets/world-dots.json')).read_text().strip()))

nav = [('home', 'Home', 'home'), ('event-about', 'The event', 'calendar'), ('event-schedule', 'Schedule', 'clock'), ('event-venue', 'Venue', 'pin')]
ICONS = {'home': 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10', 'calendar': 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
         'clock': 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2', 'pin': 'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
         'bell': 'M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4'}
svg = lambda n, s=22: f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{ICONS[n]}"/></svg>'

head = f'''<title>Impact Events</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Countdown, schedule, venue and reminders for 11 Years of Impact, 17 December 2026 in Bangalore.">
<meta name="theme-color" content="#264CD7">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Impact Events">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" href="/icons/favicon-64.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter+Tight:wght@400;500;600&family=Spectral:ital,wght@0,300;1,300&display=swap" rel="stylesheet">
<style>
{css}</style>'''
LOGO11 = (R / 'assets/logo-11-years.svg').read_text().replace('<svg ', '<svg class="logo11" width="200" height="65" ', 1).strip()
CROWN = '<svg width="14" height="14" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" aria-hidden="true"><path d="M10 46l-4-24 14 12 12-20 12 20 14-12-4 24z"/></svg>'
body = f'''<header class="top"><div class="wrap">
 <a href="#home" aria-label="Impact Events home">{LOGO11}</a>
 <a class="btn sec sm bell" href="#reminders">{svg('bell', 18)}<span class="reminder-label">Reminders</span><span class="dot"></span></a>
 <div id="gsignin" class="gsignin" hidden></div>
</div></header>
<canvas id="ambient" aria-hidden="true"></canvas>
<main id="app"></main>
<footer><div class="wrap">{LOGO11}<p class="sm muted ft-copy">© 2026 Impact Analytics. All rights reserved.</p></div></footer>
<button class="totop" id="totop" aria-label="Back to the top" hidden><svg class="tt-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" class="tt-track"/><circle cx="24" cy="24" r="21" class="tt-prog" pathLength="1" transform="rotate(-90 24 24)"/></svg><svg class="tt-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
<div id="toast" role="status" aria-live="polite"></div>
<div class="curtain" aria-hidden="true"><i class="cl"></i><i class="cr"></i><span class="c-val"></span><span class="c-seal">11</span></div>
<script>
{js}
</script>'''

page = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n'
pub = R / 'public'
if pub.exists(): shutil.rmtree(pub)
(pub / 'icons').mkdir(parents=True)
(pub / 'index.html').write_text(page)
(R / 'index.html').write_text(page)
for f in (R / 'static').iterdir(): shutil.copy(f, pub / f.name)
for f in (R / 'assets/icons').iterdir(): shutil.copy(f, pub / 'icons' / f.name)
(pub / 'version.json').write_text(json.dumps(BUILD))
exec((R / 'build_gate.py').read_text())
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist/artifact.html').write_text(head + '\n' + body + '\n')
print('built', len(page) // 1024, 'KB ->', ', '.join(sorted(p.name for p in pub.rglob('*') if p.is_file())))
