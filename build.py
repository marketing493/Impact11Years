"""Bundle src/ into a single self-contained page.
Writes index.html (standalone, open it in any browser) and dist/artifact.html (fragment for claude.ai Artifacts)."""
import base64, pathlib
R = pathlib.Path(__file__).parent
b64 = lambda p: 'data:image/png;base64,' + base64.b64encode((R / p).read_bytes()).decode()
css = (R / 'src/styles.css').read_text()
js = '\n'.join((R / f'src/{n}.js').read_text() for n in ['data', 'app', 'employee', 'admin', 'live', 'main'])
js = js.replace('__LOGO_H__', b64('assets/Logo.png')).replace('__LOGO_M__', b64('assets/Logo-Square.png'))
head = f'''<title>Impact Events</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="icon" href="{b64('assets/Logo-Square.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Spectral:ital,wght@0,300;1,300&display=swap" rel="stylesheet">
<style>
{css}</style>'''
body = f'''<header class="bar">
 <div class="brandmark"><img src="{b64('assets/Logo-Square.png')}" alt="" width="30" height="30"><b>Impact <em>Events</em></b><span class="proto">Prototype, sample data</span></div>
 <div class="seg" role="group" aria-label="Switch interface">
  <button data-act="mode" data-arg="emp">Employee app</button>
  <button data-act="mode" data-arg="adm">Admin console</button>
  <button data-act="mode" data-arg="live">Live stage</button>
 </div>
 <button class="btn sec sm" data-act="reset">Reset demo</button>
</header>
<div id="app"></div>
<div id="toast" role="status" aria-live="polite"></div>
<script>
{js}
</script>'''
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist/artifact.html').write_text(head + '\n' + body + '\n')
(R / 'index.html').write_text('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
print('built', len((R / 'index.html').read_text()) // 1024, 'KB')
