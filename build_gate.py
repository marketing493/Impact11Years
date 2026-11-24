# Sign-in page, served instead of the site until someone signs in (see middleware.js).
# Run by build.py with its variables (head, LOGO11, svg, pub) in scope. It contains no event data.
import random

_rnd = random.Random(11)
_stars = ''.join(
    (f'<i class="gt-st" style="left:{_rnd.uniform(2, 98):.1f}%;top:{_rnd.uniform(4, 96):.1f}%;--d:{_rnd.uniform(0, 6):.1f}s"></i>' if k % 4 else
     f'<i class="gt-sp" style="left:{_rnd.uniform(4, 96):.1f}%;top:{_rnd.uniform(6, 94):.1f}%;--d:{_rnd.uniform(0, 6):.1f}s;--s:{_rnd.uniform(9, 15):.0f}px"></i>')
    for k in range(44))
_FL = 'M4 76V26C4 14 14 4 26 4h50M12 76V30c0-10 8-18 18-18h46M4 52c18 0 26-10 26-26M52 4c0 18-10 26-26 26M30 30a5 5 0 1010 0 5 5 0 00-10 0M76 4l6 4-6 4-6-4zM4 76l4 6 4-6-4-6z'
_fl = lambda c: f'<svg class="rh-fl {c}" viewBox="0 0 90 90" aria-hidden="true"><path d="{_FL}" fill="none" stroke="url(#gtGold)" stroke-width="1.6" stroke-linecap="round"/></svg>'

_GATE_JS = r"""(async()=>{const box=document.getElementById('gt-btn'),msg=document.getElementById('gt-msg');const say=t=>{msg.textContent=t};
 let cfg={};try{const r=await fetch('/api/config',{cache:'no-store'});cfg=await r.json()}catch(e){}
 document.querySelector('.bell').addEventListener('click',e=>{e.preventDefault();say('Sign in first, then you can turn on reminders.')});
 const err=new URLSearchParams(location.search).get('e');if(err)say(err);
 if(!cfg.googleClientId){say('Sign-in is not available right now. Please try again in a moment.');return}
 /* home-screen apps (iPhone especially) cannot rely on popups: use Google's full-page redirect there */
 const app=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 async function go(r){say('Signing you in…');try{const res=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({credential:r.credential})});const j=await res.json().catch(()=>({}));
   if(!res.ok){say(j.error||'Sign-in failed. Please try again.');return}
   try{localStorage.setItem('ia11-user',JSON.stringify({name:j.name,given:j.given,email:j.email}));if(j.pass)localStorage.setItem('ia11-pass',JSON.stringify(j.pass))}catch(e){}
   location.replace('/'+(location.pathname==='/login.html'?'':location.hash))}catch(e){say('Sign-in failed. Please try again.')}}
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
 s.onerror=()=>say('Google sign-in could not load. Check your connection and refresh the page.');
 s.onload=()=>{google.accounts.id.initialize(app?{client_id:cfg.googleClientId,hd:cfg.googleDomain,ux_mode:'redirect',login_uri:location.origin+'/api/auth',auto_select:true}:{client_id:cfg.googleClientId,hd:cfg.googleDomain,callback:go,ux_mode:'popup',auto_select:true,itp_support:true,use_fedcm_for_prompt:true});
  google.accounts.id.renderButton(box,{theme:'outline',size:'large',shape:'pill',text:'signin_with',logo_alignment:'left',width:Math.min(300,box.clientWidth||300)})};
 document.head.append(s)})();"""

_gate_body = (
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="gtGold" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#9C7A36"/><stop offset=".25" stop-color="#F3DFA2"/><stop offset=".5" stop-color="#D4AF61"/>'
    '<stop offset=".68" stop-color="#FFF1C1"/><stop offset=".85" stop-color="#B58C3F"/><stop offset="1" stop-color="#E9CD86"/></linearGradient></defs></svg>\n'
    '<header class="top"><div class="wrap">\n'
    f' <a href="/" aria-label="Impact Events">{LOGO11}</a>\n'
    f' <a class="btn sec sm bell" href="#">{svg("bell", 18)}<span class="reminder-label">Reminders</span></a>\n'
    '</div></header>\n'
    '<main class="gate" id="main">\n'
    f' <div class="gt-frame">{_fl("tl")}{_fl("tr")}{_fl("bl")}{_fl("br")}<div class="gt-sky" aria-hidden="true">{_stars}</div>\n'
    '  <div class="gt-card">\n'
    '   <p class="rh-eb"><i></i><span>11 Years of Impact</span><i></i></p>\n'
    '   <h1 class="gt-title"><span>Around the</span><b>World</b></h1>\n'
    '   <span class="gt-rule" aria-hidden="true"></span>\n'
    '   <p class="gt-k">Your invitation is waiting.</p>\n'
    '   <p class="gt-sub">Sign in with your <b>@impactanalytics.co</b> Google account to continue.</p>\n'
    '   <div class="gt-btn" id="gt-btn"></div>\n'
    '   <p class="gt-msg" id="gt-msg" role="status" aria-live="polite"></p>\n'
    '  </div>\n'
    ' </div>\n'
    '</main>\n'
    '<script>\n' + _GATE_JS + '\n</script>')

import re as _re
_gate_head = _re.sub(r'<meta name="description"[^>]*>', '<meta name="description" content="Sign in with your Impact Analytics Google account.">', head).replace('<title>Impact Events</title>', '<title>Sign in · Impact Events</title>\n<meta name="robots" content="noindex">')
(pub / 'login.html').write_text(
    '<!doctype html>\n<html lang="en" data-skin="royal" data-tone="blue">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + _gate_head +
    '\n</head>\n<body class="gate-body">\n' + _gate_body + '\n</body>\n</html>\n')
