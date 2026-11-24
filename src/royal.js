/* ---------- Royal theme: views and controllers ---------- */
/* The Modern design is switched off for now: Royal is the only design. Set ROYAL_ONLY=false to bring the switch back. */
const ROYAL_ONLY=true;
S.skin=ROYAL_ONLY?'royal':store.get('ia11-skin','modern');
document.body.insertAdjacentHTML('afterbegin',ROYAL_SPRITE);
document.documentElement.dataset.skin=S.skin;

/* curtains close, the theme changes behind them, curtains open */
function setSkin(next){if(next===S.skin)return;const cur=$('.curtain'),root=document.documentElement;
 const swap=()=>{S.skin=next;root.dataset.skin=next;store.set('ia11-skin',next);if(AMB)AMB.accT=next==='royal'?[212,175,97]:[179,201,247];render();scrollTo({top:0,behavior:'auto'})};
 if(RMQ.matches||!cur){swap();return}
 cur.classList.add('closing');setTimeout(()=>{swap();setTimeout(()=>cur.classList.remove('closing'),280)},820)}
/* two versions of the Royal design: Midnight (navy) and Impact Blue (#264CD7) */
S.tone='blue';/* this site is Impact Blue only: the Midnight version lives on its own link */document.documentElement.dataset.tone=S.tone;
function setTone(next){if(next===S.tone)return;const cur=$('.curtain'),root=document.documentElement;
 const swap=()=>{S.tone=next;root.dataset.tone=next;store.set('ia11-tone',next);syncTone()};
 if(RMQ.matches||!cur){swap();return}cur.classList.add('closing');setTimeout(()=>{swap();setTimeout(()=>cur.classList.remove('closing'),280)},820)}
function syncTone(){$$('[data-act="tone"]').forEach(b=>{const blue=S.tone==='blue';b.setAttribute('aria-pressed',blue);b.setAttribute('aria-label',blue?'Switch to the Midnight version':'Switch to the Impact Blue version')});
 const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',S.tone==='blue'?'#264CD7':'#070F30')}
const ROYAL_ACT={
 tone(){setTone(S.tone==='blue'?'midnight':'blue');return false},
 skin(){if(!ROYAL_ONLY)setSkin(S.skin==='royal'?'modern':'royal');return false},
 envelope(){const e=$('.env');if(!e)return false;const open=!e.classList.contains('open');e.classList.toggle('open',open);$('.inv-after')?.classList.toggle('show',open);if(open)toast('Boarding pass collected. See you on 17 December.');return false},
 tent(i){$$('.tent').forEach((t,k)=>{const on=k===+i&&!t.classList.contains('open');t.classList.toggle('open',on);t.setAttribute('aria-expanded',on)});return false},
 eventIcs(){const a={id:'event',title:'11 Years of Impact: Around the World in 11 Years',date:'2026-12-17',start:'10:00',end:'21:00',location:'Main hall',description:'The 11th anniversary celebration of Impact Analytics.'};S.acts.some(x=>x.id==='event')||S.acts.push(a);ics('event');S.acts=S.acts.filter(x=>x.id!=='event');return false},
 voyageGo(i){VOYAGE&&VOYAGE.goTo(+i);return false}};

/* ---------- pieces ---------- */
const royalDrapes=(chand=true)=>`<div class="drape l" aria-hidden="true"></div><div class="drape r" aria-hidden="true"></div>${chand?'<svg class="chand" viewBox="0 0 200 140" aria-hidden="true"><use href="#chandelier"/></svg>':''}`;
const flipUnit=(k,l)=>`<div class="rflip"><b class="tn" data-rcd="${k}">--</b><span>${l}</span></div>`;

/* ---------- royal home ---------- */
function vRoyalHome(){const up=upcoming();
 return `
 ${rHero()}

 <section class="band r-invite" id="invite">${invDeco()}<div class="wrap inv-grid">
  <div class="col" style="gap:18px" data-rv><p class="eyebrow gold-eb">Your invitation</p><h2 class="r-h2">A seat at the <em>celebration</em></h2><p class="muted" style="max-width:44ch;font-size:18px">Eleven years, one journey around the world. Tap the seal to view the invite.</p>
   <div id="gsignin" class="gsignin" hidden></div>
   <div class="inv-after"><div class="ctas"><button class="btn" data-act="eventIcs">${ic('ics',18)} Add to calendar</button><a class="btn sec" href="${EVENT.maps}" target="_blank" rel="noopener">${ic('pin',18)} Directions</a></div></div></div>
  <div class="env-wrap" data-rv style="--i:1"><button class="env" data-act="envelope" aria-label="Tap the seal to view the invite">
   <span class="env-back"></span><span class="env-air" aria-hidden="true"></span>
   <span class="env-pocket"><span class="env-card">${boardingPass()}</span></span>
   <span class="env-front"></span><span class="env-flap"></span><span class="seal"><b>11</b></span></button><p class="env-hint">Tap the seal</p></div></div></section>

 ${marquee()}

 <section class="r-voyage" id="voyage"><div class="vy-pin"><canvas aria-hidden="true"></canvas><div class="vy-vig" aria-hidden="true"></div><div class="vy-marks" aria-hidden="true"></div><div class="vy-plane" aria-hidden="true"><svg viewBox="0 0 40 40"><use href="#plane"/></svg></div>
  <div class="vy-head"><p class="eyebrow gold-eb">The voyage</p><h2 class="r-h2">Around the World in <em>11 Years</em></h2></div>
  <div class="postcard" aria-live="polite"></div>
  <nav class="vy-stops" aria-label="Voyage stops">${STOPS.map((s,i)=>`<button data-act="voyageGo" data-arg="${i}"><i></i><span>${JOURNEY[i]?JOURNEY[i][0]:''}</span></button>`).join('')}</nav>
  <button class="sound vy-sound" data-sound aria-pressed="false" aria-label="Play the voyage score"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">Play the score</span></button></div></section>

 <section class="band r-dep" id="departures"><div class="wrap"><div class="shead"><div data-rv><p class="eyebrow gold-eb">Departures, 17 December</p><h2 class="r-h2">Now <em>boarding</em></h2></div><div class="dep-clock" data-rv style="--i:1"><span>Bangalore time</span><b class="tn" data-ist>--:--</b></div></div>
  <div class="board" data-rv data-board><div class="brow bh"><span>Time</span><span>Destination</span><span class="bg">Gate</span><span>Remarks</span></div><div class="brows"></div></div>
  <div class="ctas" style="margin-top:22px"><a class="btn sec" href="#reminders">${ic('bell',18)} Boarding call reminders</a></div></div></section>

 <section class="band r-fair" id="fair">${bunting()}<div class="wrap"><div class="shead"><div data-rv><p class="eyebrow gold-eb">The World's Fair</p><h2 class="r-h2">Pavilions of <em>play</em></h2></div><p class="muted" data-rv style="--i:1;max-width:38ch">Every pavilion hides its line-up. Tap a tent to draw back the curtains.</p></div>
  <div class="tents">${CATEGORIES.map(c=>[c,S.acts.filter(a=>a.category===c[0])]).filter(x=>x[1].length).map(([c,l],i)=>`<button class="tent" data-act="tent" data-arg="${i}" aria-expanded="false" data-rv style="--i:${i}"><span class="t-flag"></span><span class="t-roof"></span><span class="t-val"></span><span class="t-sign">${c[0]}</span><span class="t-body"><span class="t-list">${l.map(a=>`<span><b class="tn">${a.start}</b><span class="tt">${esc(a.title)}</span></span>`).join('')}</span><i class="t-cl"></i><i class="t-cr"></i><span class="t-count">${ic(c[1],18)}<b>${l.length}</b></span></span></button>`).join('')}</div></div></section>

 ${venueBand()}
 ${remindBand()}`}
function bunting(){const n=24;let tri='';for(let i=0;i<n;i++){const t=(i+.5)/n,x=t*1000,y=10+Math.sin(t*Math.PI)*46;tri+=`<path class="pen" style="--i:${i}" d="M${(x-17).toFixed(1)} ${y.toFixed(1)} L${(x+17).toFixed(1)} ${(y+1).toFixed(1)} L${x.toFixed(1)} ${(y+40).toFixed(1)}z" fill="${['#0F2160','url(#gGold)','#F7F1E3','#264CD7'][i%4]}"/>`}
 return `<svg class="bunting" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q500 112 1000 8" fill="none" stroke="#D4AF61" stroke-width="1.5"/>${tri}</svg>`}

/* ---------- controllers ---------- */

/* ---------- venue curtains: velvet drawn on a canvas, folds gathered at the tie-back, swaying softly ---------- */
class Curtain{
 constructor(el){this.el=el;this.right=el.classList.contains('r');this.cv=document.createElement('canvas');this.cv.className='drape-cv';this.cv.setAttribute('aria-hidden','true');el.prepend(this.cv);el.classList.add('has-cv');
  this.c=this.cv.getContext('2d');this.alive=true;this.vis=false;this.seed=this.right?2.3:0;this.resize();
  this.onResize=()=>{if(this.el.clientWidth===this.W&&Math.abs(this.el.clientHeight-this.H)<4)return;this.resize();this.draw(performance.now())};addEventListener('resize',this.onResize);
  this.loop=this.loop.bind(this);this.io=new IntersectionObserver(es=>{this.vis=es[0].isIntersecting;if(this.vis)this.kick()},{rootMargin:'80px 0px'});this.io.observe(el);
  this.onWake=()=>this.kick();addEventListener('ia-wake',this.onWake);this.draw(0)}
 kick(d){if(this.raf||this.tmo)return;if(d>0)this.tmo=setTimeout(()=>{this.tmo=0;this.kick()},d);else this.raf=requestAnimationFrame(this.loop)}
 stop(){this.alive=false;this.io.disconnect();removeEventListener('resize',this.onResize);removeEventListener('ia-wake',this.onWake)}
 resize(){const d=1;this.W=this.el.clientWidth;this.H=this.el.clientHeight;this.cv.width=Math.max(1,Math.round(this.W*d));this.cv.height=Math.max(1,Math.round(this.H*d));this.c.setTransform(d,0,0,d,0,0)}
 loop(t){this.raf=0;if(!this.alive||!this.vis||document.hidden)return;this.draw(t);if(!RMQ.matches)this.kick(this.W<80?66:34)}
 /* inner edge of the curtain (fraction of its width) at a height (fraction of its height): swept to the tie-back, then flared to the floor */
 edge(y){if(y<=.52){const s=y/.52;return .30+.70*(1-s)*(1-s)}return .30+.17*Math.sin((y-.52)/.48*Math.PI/2)}
 /* how freely the fabric moves: held by the rail and the tie-back, free at the hem */
 free(y){return y<=.52?.3*Math.sin(Math.PI*y/.52):Math.pow((y-.52)/.48,1.25)}
 draw(t){const c=this.c,W=this.W,H=this.H;if(!W||!H)return;const T=t/1000,still=RMQ.matches;c.clearRect(0,0,W,H);
  const N=W<80?8:Math.max(14,Math.round(W/4)),ROWS=W<80?16:24,folds=Math.max(3.5,W/30),A=Math.min(14,W*.085),sd=this.seed;
  const X=(u,y)=>{const sw=still?0:A*this.free(y)*(Math.sin(T*.62+y*2.4+u*1.6+sd)+.45*Math.sin(T*1.07+y*4.3+sd*1.7));const x=u*this.edge(y)*W+sw*u;return this.right?W-x:x};
  const ys=[];for(let j=0;j<=ROWS;j++)ys.push(j/ROWS);
  for(let k=0;k<N;k++){const u0=k/N,u1=(k+1)/N,um=(u0+u1)/2;
   c.beginPath();for(let j=0;j<=ROWS;j++){const x=X(u0,ys[j]);j?c.lineTo(x,ys[j]*H):c.moveTo(x,0)}for(let j=ROWS;j>=0;j--)c.lineTo(X(u1,ys[j])+(this.right?-.6:.6),ys[j]*H);c.closePath();
   const g=c.createLinearGradient(0,0,0,H);
   for(let j=0;j<=ROWS;j+=3){const y=ys[j],w=this.edge(y);
    const ph=um*folds*6.283+.9*Math.sin(um*7.3+sd)+.45*Math.sin(um*folds*2.3*6.283+sd*2)+(still?0:.4*Math.sin(T*.9+um*5.5+y*3.1+sd))+(1-w)*1.6;
    let L=.18+.82*Math.pow(.5+.5*Math.sin(ph),1.15);
    L*=.62+.38*Math.sqrt(w);
    L*=.7+.3*Math.min(1,(1-um)*3.5);
    const fl=Math.max(0,(y-.62)/.38);L*=1-.5*fl*fl+.06*(1-y);
    if(y<.035)L*=.72;
    const r=Math.round(14+L*92),gg=Math.round(30+L*118),b=Math.min(255,Math.round(98+L*150));
    g.addColorStop(y,`rgb(${r},${gg},${b})`)}
   c.fillStyle=g;c.fill()}
  c.globalCompositeOperation='source-atop';const e=c.createLinearGradient(this.right?W:0,0,this.right?0:W,0);e.addColorStop(0,'rgba(0,0,0,0)');e.addColorStop(.55,'rgba(0,0,0,0)');e.addColorStop(1,'rgba(4,8,34,.35)');c.fillStyle=e;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}
}

/* each section fades to the shared horizontal gradient at its edges, so angled gradients meet seamlessly */
const EDGES=[['.r-sky','hero','blue'],['#invite','hero','blue'],['#voyage .vy-pin','hero','hero'],['#departures','hero','mid'],['#fair','mid','mid'],['#venue','mid','hero'],['#reminders','hero','mid']];
function mountEdges(){if(document.documentElement.dataset.tone!=='blue')return;for(const [sel,top,bot] of EDGES){const el=$(sel);if(!el||el.querySelector(':scope>.bg-edge'))continue;
 el.insertAdjacentHTML('afterbegin',`<i class="bg-edge t" aria-hidden="true" style="--g:var(--e-${top})"></i><i class="bg-edge b" aria-hidden="true" style="--g:var(--e-${bot})"></i>`)}}
let HERO=null,VOYAGE=null,BOARD=null,CURTAINS=[];
function mountRoyal(){syncTone();mountSkyline();HERO&&HERO.stop();HERO=null;VOYAGE&&VOYAGE.stop();VOYAGE=null;BOARD&&BOARD.stop();BOARD=null;CURTAINS.forEach(c=>c.stop());CURTAINS=[];
 if(S.skin!=='royal')return;const a=$('#arch');if(a)HERO=new Hero(a);const v=$('#voyage');if(v)VOYAGE=new Voyage(v);const b=$('[data-board]');if(b)BOARD=new Board(b);CURTAINS=$$('.venue .drape').map(e=>new Curtain(e));mountEdges();mountSignin();tickRoyal()}
function tickRoyal(){const d=Math.max(0,TARGET_MS()-Date.now()),v={d:Math.floor(d/864e5),h:Math.floor(d%864e5/36e5),m:Math.floor(d%36e5/6e4),s:Math.floor(d%6e4/1e3)};
 if(typeof DIAL_C!=='undefined'){const frac={d:Math.min(1,v.d/30),h:v.h/24,m:v.m/60,s:v.s/60};
  $$('[data-rdial]').forEach(el=>{const k=el.dataset.rdial,f=frac[k],arc=el.querySelector('.d-arc'),orb=el.querySelector('.d-orb'),prev=+el.dataset.f;
   const wrap=!isNaN(prev)&&f>prev+.5;el.classList.toggle('jump',wrap);arc.style.strokeDashoffset=(DIAL_C*(1-f)).toFixed(2);orb.style.transform=`rotate(${(f*360).toFixed(2)}deg)`;el.dataset.f=f})}
 for(const k in v)$$('[data-rcd="'+k+'"]').forEach(el=>{const t=String(v[k]).padStart(2,'0');if(el.textContent!==t){el.textContent=t;el.classList.remove('tk');el.offsetWidth;el.classList.add('tk')}});
 const ist=new Date().toLocaleTimeString('en-IN',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false});$$('[data-ist]').forEach(e=>e.textContent=ist)}
const TARGET_MS=()=>Date.parse(EVENT.starts);
setInterval(()=>{if(S.skin==='royal'&&!document.hidden)tickRoyal()},1000);


/* ---------- invitation desk: airmail stamps, a postmark, a flight path and a boarding pass ---------- */
const PLANE_SVG=(s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>`;
function invStamp(lm,label,val,cls){return `<span class="istamp ${cls}"><span class="is-in">${lmSvg(lm,44,1.5)}<b>${label}</b><i>${val}</i></span></span>`}
function invDeco(){return `<div class="inv-deco" aria-hidden="true">
 <svg class="inv-route" viewBox="0 0 1000 400" preserveAspectRatio="none"><path d="M0 210 C 240 -50, 600 -40, 800 110 S 950 330, 980 380" vector-effect="non-scaling-stroke"/></svg>
 <span class="inv-plane">${PLANE_SVG(26)}</span>
 <svg class="inv-pm" viewBox="0 0 220 220"><defs><path id="invPmPath" d="M110 110 m-84 0 a84 84 0 1 1 168 0 a84 84 0 1 1 -168 0"/></defs>
  <circle cx="110" cy="110" r="104"/><circle cx="110" cy="110" r="100" stroke-dasharray="2 5"/><circle cx="110" cy="110" r="68"/>
  <text class="pm-ring"><textPath href="#invPmPath">PAR AVION ✦ AIR MAIL ✦ IMPACT ANALYTICS ✦ 2015 TO 2026 ✦</textPath></text>
  <text class="pm-big" x="110" y="106" text-anchor="middle">BLR</text><text class="pm-sm" x="110" y="132" text-anchor="middle">17 · XII · 2026</text></svg>
 <svg class="inv-waves" viewBox="0 0 300 90" preserveAspectRatio="none"><path d="M0 15 q 18.75 -12 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0M0 45 q 18.75 -12 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0M0 75 q 18.75 -12 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0 t 37.5 0"/></svg>
 <span class="ifl k1">✦</span><span class="ifl k2">✦</span><span class="ifl k3">✦</span><span class="ifl k4">✦</span><span class="ifl d1"></span><span class="ifl d2"></span><span class="ifl d3"></span><span class="ifl d4"></span><span class="ifl c1"></span><span class="ifl c2"></span><span class="ifl p1">${PLANE_SVG(16)}</span><span class="ifl p2">${PLANE_SVG(12)}</span>
 ${invStamp('taj','India','11','s1')}${invStamp('liberty','New York','11','s2')}${invStamp('opera','Sydney','11','s3')}${invStamp('bigben','London','11','s4')}${invStamp('eiffel','Paris','11','s5')}
</div>`}
/* ---------- Google sign-in, Impact Analytics accounts only: puts the person's name on their boarding pass ---------- */
S.user=store.get('ia11-user',null);
const passengerName=()=>S.user&&S.user.name?S.user.name:'Impacter';
const GDOMAIN=()=>(S.cfg&&S.cfg.googleDomain)||'impactanalytics.co';
let GIS_P=null;
function loadGis(){return GIS_P||(GIS_P=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=ok;s.onerror=()=>{GIS_P=null;no()};document.head.append(s)}))}
async function mountSignin(){const box=$('#gsignin');if(!box)return;
 if(S.user){box.hidden=false;box.innerHTML=`<span class="gs-hi">${ic('check',16,2)} Signed in as <b>${esc(S.user.name||S.user.email)}</b></span><button class="gs-out" data-act="signout">Sign out</button>`;return}
 const id=S.cfg&&S.cfg.googleClientId;if(!id){box.hidden=true;return}
 box.hidden=false;box.innerHTML=`<p class="gs-k">Sign in with your <b>@${esc(GDOMAIN())}</b> Google account to put your name on your boarding pass.</p><div class="gs-btn"></div>`;
 try{await loadGis()}catch(e){const b=box.querySelector('.gs-btn');if(b)b.textContent='Google sign-in could not load. Check your connection and refresh the page.';return}
 const slot=box.querySelector('.gs-btn');if(!slot||!window.google||!google.accounts)return;
 google.accounts.id.initialize({client_id:id,hd:GDOMAIN(),callback:onGoogle,ux_mode:'popup',auto_select:false,itp_support:true,use_fedcm_for_prompt:true});
 google.accounts.id.renderButton(slot,{theme:'filled_black',size:'large',shape:'pill',text:'signin_with',logo_alignment:'left'})}
async function onGoogle(r){try{const res=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:r.credential})});const j=await res.json().catch(()=>({}));
  if(!res.ok){toast(j.error||'Sign-in failed. Please try again.');return}
  S.user={name:j.name,given:j.given,email:j.email};store.set('ia11-user',S.user);applyPassenger();mountSignin();loadPass();toast(`Welcome, ${j.given||j.name}. Your boarding pass is ready.`)}
 catch(e){toast('Sign-in failed. Please try again.')}}
async function signOut(){S.user=null;S.pass=null;try{localStorage.removeItem('ia11-user');localStorage.removeItem('ia11-pass')}catch(e){}try{window.google&&google.accounts&&google.accounts.id.disableAutoSelect()}catch(e){}
 try{await fetch('/api/auth',{method:'DELETE',credentials:'same-origin'})}catch(e){}
 if(S.cfg&&S.cfg.locked){location.replace('/');return}applyPassenger();mountSignin();toast('Signed out.')}
function applyPassenger(){const c=$('.env-card');if(c)c.innerHTML=boardingPass()}
function boardingPass(){return `<span class="bpass" role="img" aria-label="Boarding pass: Impact Analytics flight IA 011, passenger ${esc(passengerName())}, from Work, 11 Years of Hustle, to Gala, 11 Years of Impact, ${EVENT.dateLong}, boards 10:00 AM, gate ${EVENT.venue}. Tap the QR code to enlarge your entry pass.">
 <span class="bp-main">
  <span class="bp-top"><span class="bp-air">${PLANE_SVG(14)} Impact Analytics</span><span class="bp-cls">Flight IA 011</span></span>
  <span class="bp-route"><span><b>WORK</b><small>11 Years of Hustle</small></span><span class="bp-line"><span>${PLANE_SVG(18)}</span></span><span class="r"><b>GALA</b><small>11 Years of Impact</small></span></span>
  <span class="bp-grid"><span class="bp-pax"><small>Passenger</small><b>${esc(passengerName())}</b></span><span><small>Date</small><b>17 Dec</b></span><span><small>Boards</small><b>10:00</b></span><span><small>Gate</small><b>Hilton ETV</b></span></span>
 </span>
 <span class="bp-stub bp-qrstub" title="Tap to enlarge your entry pass">${passQr()}</span>
</span>`}


/* departures board names: short names on phones, lightly shortened titles on desktop (other places keep the full title) */
const BOARD_SHORT={'check-in and breakfast':'CHECK-IN','welcome and opening':'WELCOME','keynote: eleven years of impact':'KEYNOTE','teams showcase':'SHOWCASE','lunch and networking':'LUNCH','live quiz: know your impact':'LIVE QUIZ','games arena':'GAMES ARENA','awards and recognition':'AWARDS','high tea and photo walls':'HIGH TEA','evening entertainment':'EVENING SHOW','closing and celebration':'CELEBRATION'};
const BOARD_DESK={'keynote: eleven years of impact':'Keynote: 11 Years of Impact','live quiz: know your impact':'Quiz: Know Your Impact'};
function boardName(a,narrow,w){const k=a.title.trim().toLowerCase();if(!narrow)return BOARD_DESK[k]||a.title;if(BOARD_SHORT[k])return BOARD_SHORT[k];
 /* a session added later: as many whole words as fit */let out='';for(const word of a.title.split(/\s+/)){const n=out?out+' '+word:word;if(n.length>w)break;out=n}return out||a.title.slice(0,w)}
/* the voyage map: a gold plane flies the route as you scroll, the camera follows it */
class Voyage{
 constructor(sec){this.sec=sec;this.pin=sec.querySelector('.vy-pin');this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.marks=sec.querySelector('.vy-marks');this.planeEl=sec.querySelector('.vy-plane');this.card=sec.querySelector('.postcard');this.btns=[...sec.querySelectorAll('.vy-stops button')];
  this.n=STOPS.length;this.s=0;this.target=0;this.cam=null;this.alive=true;this.stop_=-1;
  const G=this.G=(typeof WORLD_HD!=='undefined'?WORLD_HD:WORLD),bits=G.rows.map(row=>{const a=new Uint8Array(G.W);for(let i=0;i<row.length;i++){const v=parseInt(row[i],16);for(let b=0;b<4;b++)if(v&(8>>b))a[i*4+b]=1}return a});
  this.land=[];for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(bits[y][x]){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=(x+dx+G.W)%G.W;if(yy>=0&&yy<G.H&&bits[yy][xx])n++}this.land.push([x,y,n<9])}
  this.marks.innerHTML=STOPS.map((s,i)=>`<span class="vm" data-i="${i}"><span class="vm-lm">${lmSvg(s.lm,i===this.n-1?54:44,1.5)}</span><i></i><b class="tn">${JOURNEY[i]?JOURNEY[i][0]:''}</b></span>`).join('');this.mk=[...this.marks.children];
  sec.style.height=(this.n*80+100)+'vh';this.resize();this.onResize=()=>{if(this.pin.clientWidth===this.W&&Math.abs(this.pin.clientHeight-this.H)<180)return;this.resize();this.update()};addEventListener('resize',this.onResize);this.onScroll=()=>this.update();addEventListener('scroll',this.onScroll,{passive:true});
  /* draw the map layer while the browser is idle, so the first scroll into the voyage does not stutter */
  (window.requestIdleCallback||(f=>setTimeout(f,400)))(()=>{if(this.alive&&!this.layer)this.buildLayer()});
  this.sbtn=sec.querySelector('[data-sound]');if(this.sbtn){if(!SCORE.supported)this.sbtn.hidden=true;const paint=(on,blocked)=>{this.sbtn.setAttribute('aria-pressed',on);this.sbtn.querySelector('.lbl').textContent=on?(blocked?'Tap for sound':'Sound on'):'Play the score';this.sbtn.classList.toggle('wait',!!(on&&blocked))};paint(SCORE.on,SCORE.blocked);this.unsub=SCORE.onChange(paint);this.sbtn.addEventListener('click',e=>{e.stopPropagation();SCORE.toggle()})}
  this.loop=this.loop.bind(this);this.onWake=()=>this.kick();addEventListener('ia-wake',this.onWake);this.update()}
 kick(d){if(this.raf||this.tmo)return;if(d>0)this.tmo=setTimeout(()=>{this.tmo=0;this.kick()},d);else this.raf=requestAnimationFrame(this.loop)}
 stop(){this.alive=false;removeEventListener('ia-wake',this.onWake);removeEventListener('resize',this.onResize);removeEventListener('scroll',this.onScroll);this.unsub&&this.unsub();SCORE.setVisible(false)}
 resize(){const d=DPR(),W=this.pin.clientWidth,H=this.pin.clientHeight;this.W=W;this.H=H;this.cv.width=W*d;this.cv.height=H*d;this.ctx.setTransform(d,0,0,d,0,0);
  this.phone=W<820;this.mapW=this.phone?W*2.5:Math.max(W*1.9,H*2.4);this.mapH=this.mapW*this.G.H/this.G.W;this.cell=this.mapW/this.G.W;this.layer=null;this.settled=0;
  this.pts=STOPS.map(s=>this.proj(s.lon,s.lat));
  this.legs=[];for(let i=0;i<this.n-1;i++){const a=this.pts[i],b=this.pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),lift=Math.min(L*.28,this.mapH*.22);this.legs.push({a,b,c:[(a[0]+b[0])/2,(a[1]+b[1])/2-lift]})}}
 proj(lon,lat){const G=this.G;return [(lon+180)/360*this.mapW,(G.lat0-lat)/(G.lat0-G.lat1)*this.mapH]}
 /* the land is drawn once into an offscreen layer: a soft gold glow, gold dots, brighter coastlines */
 buildLayer(){const blue=document.documentElement.dataset.tone==='blue',k=Math.min(DPR(),4096/this.mapW),cv=document.createElement('canvas');
  cv.width=Math.round(this.mapW*k);cv.height=Math.round(this.mapH*k);const c=cv.getContext('2d');c.scale(k,k);const cs=this.cell;
  const sheen=c.createLinearGradient(0,0,this.mapW,this.mapH);(blue?[[0,'#C9A24A'],[.25,'#E9CD86'],[.5,'#D4AF61'],[.7,'#F3DFA2'],[1,'#C9A24A']]:[[0,'#B8944A'],[.22,'#F3DFA2'],[.45,'#D4AF61'],[.66,'#FFF1C1'],[.85,'#C9A24A'],[1,'#E9CD86']]).forEach(s=>sheen.addColorStop(s[0],s[1]));
  /* glow: paint the land once at grid resolution, then blur that single image (one filter pass, not one per dot) */
  const gl=document.createElement('canvas');gl.width=this.G.W;gl.height=this.G.H;const gc=gl.getContext('2d');gc.fillStyle='#D4AF61';for(const [x,y] of this.land)gc.fillRect(x,y,1,1);
  c.save();c.filter='blur('+(cs*1.4).toFixed(1)+'px)';c.globalAlpha=blue?.08:.42;c.imageSmoothingEnabled=true;c.drawImage(gl,0,0,this.mapW,this.mapH);c.restore();
  c.fillStyle=sheen;c.globalAlpha=blue?.36:.78;c.beginPath();for(const [x,y,coast] of this.land){if(coast)continue;const r=cs*.3;c.moveTo((x+.5)*cs+r,(y+.5)*cs);c.arc((x+.5)*cs,(y+.5)*cs,r,0,6.283)}c.fill();
  c.globalAlpha=blue?.46:1;c.fillStyle=blue?'#E9CD86':'#FFF1C1';c.beginPath();for(const [x,y,coast] of this.land){if(!coast)continue;const r=cs*.26;c.moveTo((x+.5)*cs+r,(y+.5)*cs);c.arc((x+.5)*cs,(y+.5)*cs,r,0,6.283)}c.fill();
  c.globalAlpha=1;this.layer=cv;this.layerTone=blue}
 bez(L,t){const u=1-t;return [u*u*L.a[0]+2*u*t*L.c[0]+t*t*L.b[0],u*u*L.a[1]+2*u*t*L.c[1]+t*t*L.b[1]]}
 update(){const r=this.sec.getBoundingClientRect(),span=this.sec.offsetHeight-innerHeight,p=clamp(-r.top/Math.max(1,span));this.target=p*(this.n-1);this.vis=r.bottom>0&&r.top<innerHeight;SCORE.setVisible(r.bottom>innerHeight*.35&&r.top<innerHeight*.65);if(this.vis){this.settled=0;this.kick()}}
 goTo(i){const span=this.sec.offsetHeight-innerHeight,top=this.sec.getBoundingClientRect().top+scrollY;scrollTo({top:top+i/(this.n-1)*span+2,behavior:RMQ.matches?'auto':'smooth'})}
 where(s){const k=Math.min(this.n-2,Math.floor(s)),f=s-k,t=f<.18?0:f>.82?1:ease((f-.18)/.64);return {k,t,pos:this.bez(this.legs[k],t),tan:this.bez(this.legs[k],Math.min(1,t+.01)),prev:this.bez(this.legs[k],Math.max(0,t-.01))}}
 loop(time){this.raf=0;if(!this.alive||!this.vis||document.hidden)return;this.lastT=time;
  const ds=this.target-this.s;if(LITE&&this.cam&&this.layer&&Math.abs(ds)<.0004&&this.settled>3)return;this.kick(MOTION_MS-16);this.settled=Math.abs(ds)<.0004?(this.settled||0)+1:0;this.s+=ds*(RMQ.matches?1:.08);const W=this.W,H=this.H,c=this.ctx,w=this.where(this.s),P=w.pos;
  /* camera follows the plane */
  const want=[Math.max(Math.min(P[0]-W*(this.phone?.5:.6),this.mapW-W),0),this.mapH<H?(this.mapH-H)/2-H*.06:Math.max(Math.min(P[1]-H*.56,this.mapH-H),0)];
  if(!this.cam)this.cam=want;this.cam=[this.cam[0]+(want[0]-this.cam[0])*.08,this.cam[1]+(want[1]-this.cam[1])*.08];const cx=this.cam[0],cy=this.cam[1];
  c.clearRect(0,0,W,H);
  const blue=document.documentElement.dataset.tone==='blue';if(!this.layer||this.layerTone!==blue)this.buildLayer();const G=this.G,cs=this.cell,still=RMQ.matches||LITE,px=P[0]-cx,py=P[1]-cy;
  /* ocean: fine graticule with gold tick marks */
  c.lineWidth=1;c.strokeStyle=blue?'rgba(244,244,246,.10)':'rgba(212,175,97,.09)';c.setLineDash([2,6]);c.beginPath();
  for(let lon=-180;lon<=180;lon+=15){const x=(lon+180)/360*this.mapW-cx;if(x<-2||x>W+2)continue;c.moveTo(x,0);c.lineTo(x,H)}
  for(let lat=-60;lat<=75;lat+=15){const y=(G.lat0-lat)/(G.lat0-G.lat1)*this.mapH-cy;if(y<-2||y>H+2)continue;c.moveTo(0,y);c.lineTo(W,y)}c.stroke();c.setLineDash([]);
  const eq=(G.lat0)/(G.lat0-G.lat1)*this.mapH-cy;c.strokeStyle=blue?'rgba(243,223,162,.28)':'rgba(212,175,97,.22)';c.beginPath();c.moveTo(0,eq);c.lineTo(W,eq);c.stroke();
  /* land, evenly lit: no spotlight and no shimmer */
  c.drawImage(this.layer,-cx,-cy,this.mapW,this.mapH);
  /* route: the whole voyage as marching gold dashes */
  c.setLineDash([2,7]);c.lineDashOffset=still?0:-(time/60)%9;c.lineCap='round';c.strokeStyle=blue?'rgba(255,241,193,.55)':'rgba(212,175,97,.5)';c.lineWidth=1.6;c.beginPath();for(const L of this.legs){c.moveTo(L.a[0]-cx,L.a[1]-cy);c.quadraticCurveTo(L.c[0]-cx,L.c[1]-cy,L.b[0]-cx,L.b[1]-cy)}c.stroke();c.setLineDash([]);
  /* travelled path: a wide soft glow under a crisp gold line */
  const trace=()=>{c.beginPath();for(let k=0;k<=w.k;k++){const L=this.legs[k],tt=k<w.k?1:w.t,steps=48;c.moveTo(L.a[0]-cx,L.a[1]-cy);for(let i=1;i<=steps*tt;i++){const q=this.bez(L,i/steps);c.lineTo(q[0]-cx,q[1]-cy)}if(k===w.k)c.lineTo(px,py)}};
  c.strokeStyle='rgba(243,223,162,.18)';c.lineWidth=10;trace();c.stroke();
  const grad=c.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#D4AF61');grad.addColorStop(.5,'#FFF1C1');grad.addColorStop(1,'#E9CD86');
  c.strokeStyle='rgba(255,241,193,.3)';c.lineWidth=5;trace();c.stroke();c.strokeStyle=grad;c.lineWidth=2.4;trace();c.stroke();
  /* sparkling trail behind the plane */
  if(w.t>0&&w.t<1&&!still){const L=this.legs[w.k];for(let i=1;i<=14;i++){const tt=Math.max(0,w.t-i*.012),q=this.bez(L,tt),a=1-i/14,j=Math.sin(time/120+i*1.7)*1.6;c.globalAlpha=a*.9;c.fillStyle='#FFF1C1';c.beginPath();c.arc(q[0]-cx+j,q[1]-cy-j,.6+a*2.2,0,6.283);c.fill()}c.globalAlpha=1}
  /* markers, plane, postcard */
  const reached=Math.round(this.s);this.mk.forEach((m,i)=>{const q=this.pts[i];m.style.transform=`translate(${(q[0]-cx).toFixed(1)}px,${(q[1]-cy).toFixed(1)}px)`;m.classList.toggle('on',i<=Math.floor(this.s+.2));m.classList.toggle('cur',i===reached)});
  const ang=Math.atan2(w.tan[1]-w.prev[1],w.tan[0]-w.prev[0])*180/Math.PI+90;this.planeEl.style.transform=`translate(${(P[0]-cx).toFixed(1)}px,${(P[1]-cy).toFixed(1)}px) rotate(${(w.t>0&&w.t<1?ang:this.lastAng||90).toFixed(1)}deg)`;if(w.t>0&&w.t<1)this.lastAng=ang;
  if(reached!==this.stop_){this.stop_=reached;this.showCard(reached);SCORE.setChapter(Math.min(5,reached));this.btns.forEach((b,i)=>b.classList.toggle('on',i===reached))}
  this.pin.style.setProperty('--vp',(this.s/(this.n-1)).toFixed(4))}
 showCard(i){const s=STOPS[i],j=JOURNEY[i]||['','',''],last=i===this.n-1;this.card.classList.remove('in');this.card.offsetWidth;
  this.card.innerHTML=`<div class="pc-stamp">${lmSvg(s.lm,40,1.4)}<span>${j[0]}</span></div><div class="pc-mark"><span>IMPACT</span><b>${j[0]}</b><span>${String(i+1).padStart(2,'0')} / ${String(this.n).padStart(2,'0')}</span></div>
  <p class="pc-eb">Stop ${i+1} of ${this.n}, ${esc(s.place)}</p><div class="pc-year tn">${j[0]}</div><h3>${esc(j[1])}</h3><p>${esc(j[2])}</p>${last?``:''}<p class="pc-note">Sample milestones. The team adds the official story.</p>`;
  this.card.classList.add('in')}
}

/* split-flap departures board */
const FLAP=' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-.&';
class Board{constructor(el){this.el=el;this.rows=el.querySelector('.brows');this.alive=true;this.timers=[];this.build(true);
  /* hovering a row re-flips its letters, left to right, like a split-flap row updating (mouse only, at most once a second per row) */
  if(matchMedia('(hover: hover) and (pointer: fine)').matches&&!RMQ.matches)this.rows.addEventListener('mouseover',e=>{const row=e.target.closest('.brow');if(!row||row.contains(e.relatedTarget)||!this.played)return;const now=Date.now();if(now-(+row.dataset.fl||0)<1100)return;row.dataset.fl=now;
   [...row.querySelectorAll('.fc')].forEach((c,i)=>this.flip(c,i*16))});
  this.io=new IntersectionObserver(es=>{if(es[0].isIntersecting&&!this.played){this.played=true;this.flipAll()}},{threshold:.3});this.io.observe(el);
  this.iv=setInterval(()=>{if(!document.hidden)this.build(false)},30000)}
 stop(){this.alive=false;this.io.disconnect();clearInterval(this.iv);this.timers.forEach(clearTimeout);this.raf&&cancelAnimationFrame(this.raf)}
 cols(){const narrow=innerWidth<700;return {narrow,dest:innerWidth<400?12:narrow?14:27,gate:narrow?0:10,rem:narrow?8:9}}
 status(a){const n=Date.now(),s=startMs(a),e=endMs(a);if(n>=e)return ['DEPARTED','gone'];if(n>=s)return ['NOW','now'];if(s-n<=10*6e4)return ['BOARDING','board'];return ['ON TIME','ok']}
 build(first){const C=this.cols(),list=S.acts.filter(a=>endMs(a)>Date.now()-30*6e4);
  const cell=(txt,w)=>{const t=txt.toUpperCase().replace(/[^A-Z0-9:\-.& ]/g,' ').padEnd(w).slice(0,w);return [...t].map(ch=>`<span class="fc" data-c="${ch}">${first&&!this.played?' ':ch}</span>`).join('')};
  const html=list.map(a=>{const [st,cls]=this.status(a);return `<div class="brow ${cls}"><span>${cell(a.start,5)}</span><span>${cell(boardName(a,C.narrow,C.dest),C.dest)}</span>${C.gate?`<span class="bg">${cell(a.location,C.gate)}</span>`:''}<span class="rem">${cell(st,C.rem)}</span></div>`}).join('')||`<div class="empty">All flights have departed. Thank you for travelling with us.</div>`;
  if(first||!this.played){this.rows.innerHTML=html;return}
  /* later refreshes: only flip cells that changed */
  const tmp=document.createElement('div');tmp.innerHTML=html;const old=[...this.rows.querySelectorAll('.fc')],nu=[...tmp.querySelectorAll('.fc')];
  if(old.length!==nu.length){this.rows.innerHTML=html;return}nu.forEach((n,i)=>{if(old[i].dataset.c!==n.dataset.c){old[i].dataset.c=n.dataset.c;this.flip(old[i],0)}});
  [...tmp.querySelectorAll('.brow')].forEach((r,i)=>{const o=this.rows.children[i];if(o)o.className=r.className})}
 /* all tiles flip from one frame loop: no timer per tile, no forced layout, two alternating animation classes */
 flipAll(){[...this.rows.querySelectorAll('.brow')].forEach((row,ri)=>[...row.querySelectorAll('.fc')].forEach((c,ci)=>this.flip(c,ri*90+ci*18)))}
 flip(c,delay){const target=c.dataset.c;if(RMQ.matches){c.textContent=target;return}
  (this.q||(this.q=[])).push({c,target,at:performance.now()+delay,n:target===' '?1:(LITE?3:5)+Math.floor(Math.random()*(LITE?3:6))});
  if(!this.raf){const tick=now=>{if(!this.alive){this.raf=0;return}this.raf=requestAnimationFrame(tick);if(now-(this.lastTick||0)<55)return;this.lastTick=now;
   let left=0;for(const f of this.q){if(f.n<0)continue;left++;if(now<f.at)continue;const el=f.c;el.classList.toggle('f',!el.classList.contains('f'));el.classList.toggle('g',!el.classList.contains('f'));
    if(--f.n<0){el.textContent=f.target;el.classList.remove('f','g')}else el.textContent=FLAP[Math.floor(Math.random()*FLAP.length)]}
   if(!left){cancelAnimationFrame(this.raf);this.raf=0;this.q=[]}};this.raf=requestAnimationFrame(tick)}}
}
