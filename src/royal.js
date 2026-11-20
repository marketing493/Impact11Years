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
const ROYAL_ACT={
 skin(){if(!ROYAL_ONLY)setSkin(S.skin==='royal'?'modern':'royal');return false},
 envelope(){const e=$('.env');if(!e)return false;const open=!e.classList.contains('open');e.classList.toggle('open',open);$('.inv-after')?.classList.toggle('show',open);if(open)toast('You are invited. See you on 17 December.');return false},
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

 <section class="band r-invite" id="invite"><div class="wrap inv-grid">
  <div class="col" style="gap:18px" data-rv><p class="eyebrow gold-eb">Your invitation</p><h2 class="r-h2">A seat at the <em>celebration</em></h2><p class="muted" style="max-width:44ch;font-size:18px">Eleven years, one journey around the world. Break the seal to read your invitation.</p>
   <div class="inv-after"><div class="ctas"><button class="btn" data-act="eventIcs">${ic('ics',18)} Add to calendar</button><a class="btn sec" href="${EVENT.maps}" target="_blank" rel="noopener">${ic('pin',18)} Directions</a></div></div></div>
  <div class="env-wrap" data-rv style="--i:1"><button class="env" data-act="envelope" aria-label="Open the invitation">
   <span class="env-back"></span>
   <span class="env-card"><span class="ec-in"><span class="ec-orn">✦ ✦ ✦</span><span class="ec-k">You are cordially invited to the</span><span class="ec-t">11<sup>th</sup> Anniversary</span><span class="ec-s">Around the World in 11 Years</span><span class="ec-rule"></span><span class="ec-d">Thursday, 17 December 2026</span><span class="ec-d">10:00 AM to 9:00 PM</span><span class="ec-v">${EVENT.venue}<br>${EVENT.area}</span><span class="ec-orn">✦</span></span></span>
   <span class="env-front"></span><span class="env-flap"></span><span class="seal"><b>11</b></span></button><p class="env-hint">Tap the seal</p></div></div></section>

 ${marquee()}

 <section class="r-voyage" id="voyage"><div class="vy-pin"><canvas aria-hidden="true"></canvas><div class="vy-marks" aria-hidden="true"></div><div class="vy-plane" aria-hidden="true"><svg viewBox="0 0 40 40"><use href="#plane"/></svg></div>
  <div class="vy-head"><p class="eyebrow gold-eb">The voyage</p><h2 class="r-h2">Around the World in <em>11 Years</em></h2></div>
  <div class="postcard" aria-live="polite"></div>
  <nav class="vy-stops" aria-label="Voyage stops">${STOPS.map((s,i)=>`<button data-act="voyageGo" data-arg="${i}"><i></i><span>${JOURNEY[i]?JOURNEY[i][0]:''}</span></button>`).join('')}</nav>
  <button class="sound vy-sound" data-sound aria-pressed="false" aria-label="Play the voyage score"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">Play the score</span></button></div></section>

 <section class="band r-dep" id="departures"><div class="wrap"><div class="shead"><div data-rv><p class="eyebrow gold-eb">Departures · 17 December</p><h2 class="r-h2">Now <em>boarding</em></h2></div><div class="dep-clock" data-rv style="--i:1"><span>Bangalore time</span><b class="tn" data-ist>--:--</b></div></div>
  <div class="board" data-rv data-board><div class="brow bh"><span>Time</span><span>Destination</span><span class="bg">Gate</span><span>Remarks</span></div><div class="brows"></div></div>
  <div class="ctas" style="margin-top:22px"><a class="btn" href="#event-schedule">${ic('calendar',18)} Full programme</a><a class="btn sec" href="#reminders">${ic('bell',18)} Boarding call reminders</a></div></div></section>

 <section class="band r-fair" id="fair">${bunting()}<div class="wrap"><div class="shead"><div data-rv><p class="eyebrow gold-eb">The World's Fair</p><h2 class="r-h2">Pavilions of <em>play</em></h2></div><p class="muted" data-rv style="--i:1;max-width:38ch">Every pavilion hides its line-up. Tap a tent to draw back the curtains.</p></div>
  <div class="tents">${CATEGORIES.map(c=>[c,S.acts.filter(a=>a.category===c[0])]).filter(x=>x[1].length).map(([c,l],i)=>`<button class="tent" data-act="tent" data-arg="${i}" aria-expanded="false" data-rv style="--i:${i}"><span class="t-flag"></span><span class="t-roof"></span><span class="t-val"></span><span class="t-sign">${c[0]}</span><span class="t-body"><span class="t-list">${l.map(a=>`<span><b class="tn">${a.start}</b>${esc(a.title)}</span>`).join('')}</span><i class="t-cl"></i><i class="t-cr"></i><span class="t-count">${ic(c[1],18)}<b>${l.length}</b></span></span></button>`).join('')}</div></div></section>

 ${venueBand()}
 ${remindBand()}`}
function bunting(){const n=24;let tri='';for(let i=0;i<n;i++){const t=(i+.5)/n,x=t*1000,y=10+Math.sin(t*Math.PI)*46;tri+=`<path class="pen" style="--i:${i}" d="M${(x-17).toFixed(1)} ${y.toFixed(1)} L${(x+17).toFixed(1)} ${(y+1).toFixed(1)} L${x.toFixed(1)} ${(y+40).toFixed(1)}z" fill="${['#0F2160','url(#gGold)','#F7F1E3','#264CD7'][i%4]}"/>`}
 return `<svg class="bunting" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q500 112 1000 8" fill="none" stroke="#D4AF61" stroke-width="1.5"/>${tri}</svg>`}

/* ---------- controllers ---------- */
let HERO=null,VOYAGE=null,BOARD=null;
function mountRoyal(){HERO&&HERO.stop();HERO=null;VOYAGE&&VOYAGE.stop();VOYAGE=null;BOARD&&BOARD.stop();BOARD=null;
 if(S.skin!=='royal')return;const a=$('#arch');if(a)HERO=new Hero(a);const v=$('#voyage');if(v)VOYAGE=new Voyage(v);const b=$('[data-board]');if(b)BOARD=new Board(b);tickRoyal()}
function tickRoyal(){const d=Math.max(0,TARGET_MS()-Date.now()),v={d:Math.floor(d/864e5),h:Math.floor(d%864e5/36e5),m:Math.floor(d%36e5/6e4),s:Math.floor(d%6e4/1e3)};
 if(typeof DIAL_C!=='undefined'){const frac={d:Math.min(1,v.d/30),h:v.h/24,m:v.m/60,s:v.s/60};
  $$('[data-rdial]').forEach(el=>{const k=el.dataset.rdial,f=frac[k],arc=el.querySelector('.d-arc'),orb=el.querySelector('.d-orb'),prev=+el.dataset.f;
   const wrap=!isNaN(prev)&&f>prev+.5;el.classList.toggle('jump',wrap);arc.style.strokeDashoffset=(DIAL_C*(1-f)).toFixed(2);orb.style.transform=`rotate(${(f*360).toFixed(2)}deg)`;el.dataset.f=f})}
 for(const k in v)$$('[data-rcd="'+k+'"]').forEach(el=>{const t=String(v[k]).padStart(2,'0');if(el.textContent!==t){el.textContent=t;el.classList.remove('tk');el.offsetWidth;el.classList.add('tk')}});
 const ist=new Date().toLocaleTimeString('en-IN',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false});$$('[data-ist]').forEach(e=>e.textContent=ist)}
const TARGET_MS=()=>Date.parse(EVENT.starts);
setInterval(()=>{if(S.skin==='royal'&&!document.hidden)tickRoyal()},1000);

/* the voyage map: a gold plane flies the route as you scroll, the camera follows it */
class Voyage{
 constructor(sec){this.sec=sec;this.pin=sec.querySelector('.vy-pin');this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.marks=sec.querySelector('.vy-marks');this.planeEl=sec.querySelector('.vy-plane');this.card=sec.querySelector('.postcard');this.btns=[...sec.querySelectorAll('.vy-stops button')];
  this.n=STOPS.length;this.s=0;this.target=0;this.cam=null;this.alive=true;this.stop_=-1;
  this.land=[];WORLD.rows.forEach((row,y)=>{for(let i=0;i<row.length;i++){const v=parseInt(row[i],16);for(let b=0;b<4;b++)if(v&(8>>b))this.land.push([i*4+b,y])}});
  this.marks.innerHTML=STOPS.map((s,i)=>`<span class="vm" data-i="${i}"><span class="vm-lm">${lmSvg(s.lm,i===this.n-1?54:44,1.5)}</span><i></i><b class="tn">${JOURNEY[i]?JOURNEY[i][0]:''}</b></span>`).join('');this.mk=[...this.marks.children];
  sec.style.height=(this.n*80+100)+'vh';this.resize();this.onResize=()=>this.resize();addEventListener('resize',this.onResize);this.onScroll=()=>this.update();addEventListener('scroll',this.onScroll,{passive:true});
  this.sbtn=sec.querySelector('[data-sound]');if(this.sbtn){if(!SCORE.supported)this.sbtn.hidden=true;const paint=(on,blocked)=>{this.sbtn.setAttribute('aria-pressed',on);this.sbtn.querySelector('.lbl').textContent=on?(blocked?'Tap for sound':'Sound on'):'Play the score';this.sbtn.classList.toggle('wait',!!(on&&blocked))};paint(SCORE.on,SCORE.blocked);this.unsub=SCORE.onChange(paint);this.sbtn.addEventListener('click',e=>{e.stopPropagation();SCORE.toggle()})}
  this.update();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop)}
 stop(){this.alive=false;removeEventListener('resize',this.onResize);removeEventListener('scroll',this.onScroll);this.unsub&&this.unsub();SCORE.setVisible(false)}
 resize(){const d=Math.min(2,devicePixelRatio||1),W=this.pin.clientWidth,H=this.pin.clientHeight;this.W=W;this.H=H;this.cv.width=W*d;this.cv.height=H*d;this.ctx.setTransform(d,0,0,d,0,0);
  this.phone=W<820;this.mapW=this.phone?W*2.5:Math.max(W*1.9,H*2.4);this.mapH=this.mapW*WORLD.H/WORLD.W;this.cell=this.mapW/WORLD.W;
  this.pts=STOPS.map(s=>this.proj(s.lon,s.lat));
  this.legs=[];for(let i=0;i<this.n-1;i++){const a=this.pts[i],b=this.pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),lift=Math.min(L*.28,this.mapH*.22);this.legs.push({a,b,c:[(a[0]+b[0])/2,(a[1]+b[1])/2-lift]})}}
 proj(lon,lat){return [(lon+180)/360*this.mapW,(WORLD.lat0-lat)/(WORLD.lat0-WORLD.lat1)*this.mapH]}
 bez(L,t){const u=1-t;return [u*u*L.a[0]+2*u*t*L.c[0]+t*t*L.b[0],u*u*L.a[1]+2*u*t*L.c[1]+t*t*L.b[1]]}
 update(){const r=this.sec.getBoundingClientRect(),span=this.sec.offsetHeight-innerHeight,p=clamp(-r.top/Math.max(1,span));this.target=p*(this.n-1);this.vis=r.bottom>0&&r.top<innerHeight;SCORE.setVisible(r.bottom>innerHeight*.35&&r.top<innerHeight*.65)}
 goTo(i){const span=this.sec.offsetHeight-innerHeight,top=this.sec.getBoundingClientRect().top+scrollY;scrollTo({top:top+i/(this.n-1)*span+2,behavior:RMQ.matches?'auto':'smooth'})}
 where(s){const k=Math.min(this.n-2,Math.floor(s)),f=s-k,t=f<.18?0:f>.82?1:ease((f-.18)/.64);return {k,t,pos:this.bez(this.legs[k],t),tan:this.bez(this.legs[k],Math.min(1,t+.01)),prev:this.bez(this.legs[k],Math.max(0,t-.01))}}
 loop(time){if(!this.alive)return;requestAnimationFrame(this.loop);if(!this.vis||document.hidden)return;
  this.s+=(this.target-this.s)*(RMQ.matches?1:.08);const W=this.W,H=this.H,c=this.ctx,w=this.where(this.s),P=w.pos;
  /* camera follows the plane */
  const want=[Math.max(Math.min(P[0]-W*(this.phone?.5:.6),this.mapW-W),0),this.mapH<H?(this.mapH-H)/2-H*.06:Math.max(Math.min(P[1]-H*.56,this.mapH-H),0)];
  if(!this.cam)this.cam=want;this.cam=[this.cam[0]+(want[0]-this.cam[0])*.08,this.cam[1]+(want[1]-this.cam[1])*.08];const cx=this.cam[0],cy=this.cam[1];
  c.clearRect(0,0,W,H);
  /* graticule */
  c.strokeStyle='rgba(212,175,97,.07)';c.lineWidth=1;c.beginPath();for(let lon=-180;lon<=180;lon+=30){const x=(lon+180)/360*this.mapW-cx;c.moveTo(x,-cy*0-this.mapH);c.lineTo(x,this.mapH*2)}for(let lat=-60;lat<=80;lat+=20){const y=(WORLD.lat0-lat)/(WORLD.lat0-WORLD.lat1)*this.mapH-cy;c.moveTo(0,y);c.lineTo(W,y)}c.stroke();
  /* land as gold dots, brighter around the plane */
  const cs=this.cell,rr=cs*.26;for(const [gx,gy] of this.land){const x=(gx+.5)*cs-cx,y=(gy+.5)*cs-cy;if(x<-cs||x>W+cs||y<-cs||y>H+cs)continue;const d=Math.hypot(x-(P[0]-cx),y-(P[1]-cy)),glow=Math.max(0,1-d/(cs*14));
   c.globalAlpha=.32+glow*.6;c.fillStyle=glow>.15?'#F3DFA2':'#B8944A';c.beginPath();c.arc(x,y,rr*(1+glow*.5),0,6.283);c.fill()}c.globalAlpha=1;
  /* route: whole path faint and dashed, travelled path bright with a glow */
  c.setLineDash([4,6]);c.strokeStyle='rgba(212,175,97,.45)';c.lineWidth=1.5;c.beginPath();for(const L of this.legs){c.moveTo(L.a[0]-cx,L.a[1]-cy);c.quadraticCurveTo(L.c[0]-cx,L.c[1]-cy,L.b[0]-cx,L.b[1]-cy)}c.stroke();c.setLineDash([]);
  c.strokeStyle='#F3DFA2';c.lineWidth=2.6;c.shadowColor='rgba(243,223,162,.9)';c.shadowBlur=12;c.beginPath();
  for(let k=0;k<=w.k;k++){const L=this.legs[k],tt=k<w.k?1:w.t,steps=40;c.moveTo(L.a[0]-cx,L.a[1]-cy);for(let i=1;i<=steps*tt;i++){const q=this.bez(L,i/steps);c.lineTo(q[0]-cx,q[1]-cy)}if(k===w.k){c.lineTo(P[0]-cx,P[1]-cy)}}c.stroke();c.shadowBlur=0;
  /* markers, plane, postcard */
  const reached=Math.round(this.s);this.mk.forEach((m,i)=>{const q=this.pts[i];m.style.transform=`translate(${(q[0]-cx).toFixed(1)}px,${(q[1]-cy).toFixed(1)}px)`;m.classList.toggle('on',i<=Math.floor(this.s+.2));m.classList.toggle('cur',i===reached)});
  const ang=Math.atan2(w.tan[1]-w.prev[1],w.tan[0]-w.prev[0])*180/Math.PI+90;this.planeEl.style.transform=`translate(${(P[0]-cx).toFixed(1)}px,${(P[1]-cy).toFixed(1)}px) rotate(${(w.t>0&&w.t<1?ang:this.lastAng||90).toFixed(1)}deg)`;if(w.t>0&&w.t<1)this.lastAng=ang;
  if(reached!==this.stop_){this.stop_=reached;this.showCard(reached);SCORE.setChapter(Math.min(5,reached));this.btns.forEach((b,i)=>b.classList.toggle('on',i===reached))}
  this.pin.style.setProperty('--vp',(this.s/(this.n-1)).toFixed(4))}
 showCard(i){const s=STOPS[i],j=JOURNEY[i]||['','',''],last=i===this.n-1;this.card.classList.remove('in');this.card.offsetWidth;
  this.card.innerHTML=`<div class="pc-stamp">${lmSvg(s.lm,40,1.4)}<span>${j[0]}</span></div><div class="pc-mark"><span>IMPACT</span><b>${j[0]}</b><span>${String(i+1).padStart(2,'0')} / ${String(this.n).padStart(2,'0')}</span></div>
  <p class="pc-eb">Stop ${i+1} of ${this.n} · ${esc(s.place)}</p><div class="pc-year tn">${j[0]}</div><h3>${esc(j[1])}</h3><p>${esc(j[2])}</p>${last?`<a class="btn" href="#event-schedule">${ic('calendar',16)} See the programme</a>`:''}<p class="pc-note">Sample milestones. The team adds the official story.</p>`;
  this.card.classList.add('in')}
}

/* split-flap departures board */
const FLAP=' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-.&';
class Board{constructor(el){this.el=el;this.rows=el.querySelector('.brows');this.alive=true;this.timers=[];this.build(true);
  this.io=new IntersectionObserver(es=>{if(es[0].isIntersecting&&!this.played){this.played=true;this.flipAll()}},{threshold:.3});this.io.observe(el);
  this.iv=setInterval(()=>{if(!document.hidden)this.build(false)},30000)}
 stop(){this.alive=false;this.io.disconnect();clearInterval(this.iv);this.timers.forEach(clearTimeout)}
 cols(){const narrow=innerWidth<700;return {dest:narrow?14:26,gate:narrow?0:10,rem:narrow?8:9}}
 status(a){const n=Date.now(),s=startMs(a),e=endMs(a);if(n>=e)return ['DEPARTED','gone'];if(n>=s)return ['NOW','now'];if(s-n<=10*6e4)return ['BOARDING','board'];return ['ON TIME','ok']}
 build(first){const C=this.cols(),list=S.acts.filter(a=>endMs(a)>Date.now()-30*6e4).slice(0,8);
  const cell=(txt,w)=>{const t=txt.toUpperCase().replace(/[^A-Z0-9:\-.& ]/g,' ').padEnd(w).slice(0,w);return [...t].map(ch=>`<span class="fc" data-c="${ch}">${first&&!this.played?' ':ch}</span>`).join('')};
  const html=list.map(a=>{const [st,cls]=this.status(a);return `<a class="brow ${cls}" href="#event-schedule" data-act="openAct" data-arg="${esc(a.id)}"><span>${cell(a.start,5)}</span><span>${cell(a.title,C.dest)}</span>${C.gate?`<span class="bg">${cell(a.location,C.gate)}</span>`:''}<span class="rem">${cell(st,C.rem)}</span></a>`}).join('')||`<div class="empty">All flights have departed. Thank you for travelling with us.</div>`;
  if(first||!this.played){this.rows.innerHTML=html;return}
  /* later refreshes: only flip cells that changed */
  const tmp=document.createElement('div');tmp.innerHTML=html;const old=[...this.rows.querySelectorAll('.fc')],nu=[...tmp.querySelectorAll('.fc')];
  if(old.length!==nu.length){this.rows.innerHTML=html;return}nu.forEach((n,i)=>{if(old[i].dataset.c!==n.dataset.c){old[i].dataset.c=n.dataset.c;this.flip(old[i],0)}});
  [...tmp.querySelectorAll('.brow')].forEach((r,i)=>{const o=this.rows.children[i];if(o)o.className=r.className})}
 flipAll(){[...this.rows.querySelectorAll('.brow')].forEach((row,ri)=>[...row.querySelectorAll('.fc')].forEach((c,ci)=>this.flip(c,ri*90+ci*18)))}
 flip(c,delay){const target=c.dataset.c;if(RMQ.matches){c.textContent=target;return}let n=target===' '?2:5+Math.floor(Math.random()*7);
  const step=()=>{if(!this.alive)return;c.classList.remove('f');c.offsetWidth;c.classList.add('f');if(--n<=0){c.textContent=target;return}c.textContent=FLAP[Math.floor(Math.random()*FLAP.length)];this.timers.push(setTimeout(step,55))};
  this.timers.push(setTimeout(step,delay))}}
