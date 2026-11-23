/* ---------- Royal entrance: a luminous gold globe ----------
 The globe is drawn from the same Natural Earth dot mask as the voyage map, projected onto a turning sphere,
 with glowing routes between the voyage stops, an orbiting gold plane and a medallion. Gold dust drifts
 through the scene. Drag the globe to spin it. Scrolling lifts the title away and brings the globe forward. */
const FLOURISH='M4 76V26C4 14 14 4 26 4h50M12 76V30c0-10 8-18 18-18h46M4 52c18 0 26-10 26-26M52 4c0 18-10 26-26 26M30 30a5 5 0 1010 0 5 5 0 00-10 0M76 4l6 4-6 4-6-4zM4 76l4 6 4-6-4-6z';
const flourish=c=>`<svg class="rh-fl ${c}" viewBox="0 0 90 90" aria-hidden="true"><path d="${FLOURISH}" fill="none" stroke="url(#gGold)" stroke-width="1.6" stroke-linecap="round"/></svg>`;
/* one astrolabe dial: tick ring, a glowing arc for the time left in that unit, an orbiting star */
const DIAL_R=46,DIAL_C=2*Math.PI*DIAL_R;
const rhUnit=(k,l)=>`<div class="rh-u" data-rdial="${k}"><svg class="dial" viewBox="0 0 120 120" aria-hidden="true">
 <circle cx="60" cy="60" r="57" class="d-out"/><circle cx="60" cy="60" r="40" class="d-disc"/>
 ${Array.from({length:60},(_,i)=>{const a=i*6*Math.PI/180,r1=i%5?52.5:50.5;return `<line x1="${(60+Math.sin(a)*54).toFixed(2)}" y1="${(60-Math.cos(a)*54).toFixed(2)}" x2="${(60+Math.sin(a)*r1).toFixed(2)}" y2="${(60-Math.cos(a)*r1).toFixed(2)}" class="${i%5?'tk':'tk5'}"/>`}).join('')}
 <circle cx="60" cy="60" r="${DIAL_R}" class="d-track"/><circle cx="60" cy="60" r="${DIAL_R}" class="d-arc" stroke-dasharray="${DIAL_C.toFixed(2)}" stroke-dashoffset="${DIAL_C.toFixed(2)}" transform="rotate(-90 60 60)"/>
 <g class="d-orb"><path d="M60 8.5l1.4 4.1 4.1 1.4-4.1 1.4-1.4 4.1-1.4-4.1-4.1-1.4 4.1-1.4z" class="d-star"/></g></svg>
 <b class="tn" data-rcd="${k}">--</b><span>${l}</span></div>`;
function rHero(){return `<section class="r-hero" id="arch"><div class="rh-pin"><canvas class="rh-dust" aria-hidden="true"></canvas><div class="rh-rays" aria-hidden="true"></div>
 ${flourish('tl')}${flourish('tr')}${flourish('bl')}${flourish('br')}
 <div class="rh-grid">
  <div class="rh-copy">
   <p class="rh-eb"><i></i><span>11 Years of Impact</span><i></i></p>
   <h1 class="rh-title" aria-label="Around the World in 11 Years"><span class="t1">Around the</span><span class="t2">World</span><span class="t3">in <em>11</em> Years</span></h1>
   <p class="rh-sub">Thursday, 17 December 2026<span>◆</span>Hilton Embassy Tech Village, Bangalore</p>
   <div class="rh-count" role="timer" aria-label="Countdown to the celebration"><svg class="constel" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M12.5 10 Q25 2 37.5 10 T62.5 10 T87.5 10"/></svg>${rhUnit('d','Days')}${rhUnit('h','Hours')}${rhUnit('m','Minutes')}${rhUnit('s','Seconds')}</div>
   <div class="ctas"><a class="btn" href="#invite">${ic('star',18)} Open your invitation</a><a class="btn sec" href="#voyage">Begin the voyage</a></div>
  </div>
  <div class="rh-orb"><canvas class="globe" aria-label="A turning gold globe tracing the voyage routes. Drag it in any direction to spin it." role="img"></canvas><span class="globe-hit" aria-hidden="true"></span>
   <div class="medal" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="medalPath" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs>
    <circle cx="100" cy="100" r="96" fill="url(#gGold)"/><circle cx="100" cy="100" r="88" fill="#0A1744"/><circle cx="100" cy="100" r="86" fill="none" stroke="#D4AF61" stroke-width="1"/><circle cx="100" cy="100" r="60" fill="none" stroke="#D4AF61" stroke-width="1.2"/>
    <g class="medal-ring"><text font-family="Cinzel,Georgia,serif" font-size="12" font-weight="700" fill="#F3DFA2"><textPath href="#medalPath" textLength="458" lengthAdjust="spacing">IMPACT ANALYTICS ◆ MMXV TO MMXXVI ◆</textPath></text></g>
    <text x="100" y="122" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="700" font-size="62" fill="url(#gGold)">11</text></svg></div>
</div>
 </div>
 <a class="rh-cue" href="#invite"><span></span>Scroll to begin</a></div></section>`}

class Hero{constructor(sec){this.sec=sec;this.pin=sec.querySelector('.rh-pin');this.dust=sec.querySelector('.rh-dust');this.gcv=sec.querySelector('.globe');this.alive=true;
  /* land points as lon/lat, sampled from the dot mask */
  this.land=[];WORLD.rows.forEach((row,y)=>{for(let i=0;i<row.length;i++){const v=parseInt(row[i],16);for(let b=0;b<4;b++)if(v&(8>>b)){const gx=i*4+b;this.land.push([(-180+(gx+.5)*360/WORLD.W)*Math.PI/180,(WORLD.lat0-(y+.5)*(WORLD.lat0-WORLD.lat1)/WORLD.H)*Math.PI/180])}}});
  this.stops=STOPS.map(s=>[s.lon*Math.PI/180,s.lat*Math.PI/180]);
  this.rot=-1.25;this.vel=0;this.tvel=0;this.drag=null;this.tilt=-.38;this.idle=0;this.hit=sec.querySelector('.globe-hit');
  this.resize();this.onResize=()=>{if(this.pin.clientWidth===this.W&&Math.abs(this.pin.clientHeight-this.H)<180)return;this.resize()};addEventListener('resize',this.onResize);this.onScroll=()=>this.update();addEventListener('scroll',this.onScroll,{passive:true});
  /* drag in any direction: sideways spins the globe, up and down tips it over the poles */
  const H_=this.hit;
  H_.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,y:e.clientY,r:this.rot,t:this.tilt};try{H_.setPointerCapture(e.pointerId)}catch(_){}H_.classList.add('dragging');e.preventDefault()});
  H_.addEventListener('pointermove',e=>{if(!this.drag)return;const nr=this.drag.r+(e.clientX-this.drag.x)*.008,nt=this.drag.t-(e.clientY-this.drag.y)*.008;this.vel=nr-this.rot;this.tvel=nt-this.tilt;this.rot=nr;this.tilt=nt});
  const end=()=>{if(!this.drag)return;this.drag=null;this.idle=performance.now();H_.classList.remove('dragging')};H_.addEventListener('pointerup',end);H_.addEventListener('pointercancel',end);
  this.loop=this.loop.bind(this);this.onWake=()=>this.kick();addEventListener('ia-wake',this.onWake);this.update()}
 kick(d){if(this.raf||this.tmo)return;if(d>0)this.tmo=setTimeout(()=>{this.tmo=0;this.kick()},d);else this.raf=requestAnimationFrame(this.loop)}
 stop(){this.alive=false;removeEventListener('ia-wake',this.onWake);removeEventListener('resize',this.onResize);removeEventListener('scroll',this.onScroll)}
 resize(){this.dustDone=false;const d=DPR();
  this.W=this.pin.clientWidth;this.H=this.pin.clientHeight;this.dust.width=this.W*d;this.dust.height=this.H*d;this.dc=this.dust.getContext('2d');this.dc.setTransform(d,0,0,d,0,0);
  const gw=this.gcv.clientWidth,gh=this.gcv.clientHeight;this.GW=gw;this.GH=gh;this.gcv.width=gw*d;this.gcv.height=gh*d;this.gc=this.gcv.getContext('2d');this.gc.setTransform(d,0,0,d,0,0);
  const r=seededRand(23);this.motes=Array.from({length:Math.round(this.W*this.H/9000)},()=>({x:r()*this.W,y:r()*this.H,z:.3+r()*.7,ph:r()*6.28,v:.15+r()*.45,g:r()<.12,b:r()<.05}))}
 update(){const r=this.sec.getBoundingClientRect(),span=this.sec.offsetHeight-innerHeight,p=clamp(-r.top/Math.max(1,span));this.p=p;this.vis=r.bottom>0&&r.top<innerHeight;
  this.pin.style.setProperty('--p',RMQ.matches?0:p.toFixed(4));if(this.vis)this.kick()}
 proj(lon,lat,R,cx,cy,lift=1){const l=lon+this.rot,x=Math.cos(lat)*Math.sin(l),y=Math.sin(lat),z=Math.cos(lat)*Math.cos(l),ct=Math.cos(this.tilt),st=Math.sin(this.tilt);
  return [cx+x*R*lift,cy-(y*ct-z*st)*R*lift,y*st+z*ct]}
 loop(t){this.raf=0;if(!this.alive||!this.vis||document.hidden)return;this.lastT=t;this.kick(HERO_MS-16);const still=RMQ.matches;
  if(!this.drag){this.vel*=.94;this.tvel*=.92;this.rot+=still?0:.0016+this.vel;this.tilt+=this.tvel;
   /* after a few seconds of rest the globe settles back to its usual angle */
   if(!still&&performance.now()-this.idle>2500)this.tilt+=((-.38)-this.tilt)*.015}
  /* gold dust and bokeh */
  if(!(LITE&&this.dustDone)){this.dustDone=true;const c=this.dc,W=this.W,H=this.H;c.clearRect(0,0,W,H);
  for(const m of this.motes){const y=still?m.y:((m.y-t*.012*m.v*m.z)%H+H)%H,x=m.x+(still?0:Math.sin(t/2600*m.v+m.ph)*14*m.z),tw=.35+.65*Math.abs(Math.sin(t/1400*m.v+m.ph));
   if(m.b){const rr=18+m.z*34;if(!this.bokeh){const bk=document.createElement('canvas');bk.width=bk.height=64;const bc=bk.getContext('2d'),bg=bc.createRadialGradient(32,32,0,32,32,32);bg.addColorStop(0,'rgba(243,223,162,1)');bg.addColorStop(1,'rgba(243,223,162,0)');bc.fillStyle=bg;bc.fillRect(0,0,64,64);this.bokeh=bk}c.globalAlpha=.07*tw;c.drawImage(this.bokeh,x-rr,y-rr,rr*2,rr*2);c.globalAlpha=1;continue}
   c.globalAlpha=tw*(.35+m.z*.55);c.fillStyle=m.g?'#FFF1C1':'#D4AF61';const s=.5+m.z*1.4;c.beginPath();c.arc(x,y,s,0,6.283);c.fill();
   if(m.g){c.globalAlpha=tw*.7;c.fillRect(x-s*4,y-.35,s*8,.7);c.fillRect(x-.35,y-s*4,.7,s*8)}}
  c.globalAlpha=1;
}
  /* the globe */
  const g=this.gc,GW=this.GW,GH=this.GH,cx=GW/2,cy=GH/2,R=Math.min(GW*.44,GH*.43);if(this.hit&&this.hitR!==R){this.hitR=R;/* on touch screens the outer ring of the globe still scrolls the page */const k=matchMedia('(pointer: coarse)').matches?1.5:2.1;this.hit.style.width=this.hit.style.height=(R*k)+'px'}g.clearRect(0,0,GW,GH);
  /* halo, solid body and outer rings never change: drawn once into a cached layer, then copied each frame */
  const tone=document.documentElement.dataset.tone;if(!this.gStatic||this.gStaticKey!==GW+'x'+GH+tone){this.gStaticKey=GW+'x'+GH+tone;const d=DPR(),sv=document.createElement('canvas');sv.width=Math.round(GW*d);sv.height=Math.round(GH*d);const sg=sv.getContext('2d');sg.scale(d,d);
   const HR=Math.min(R*1.55,cx,cy,GW-cx,GH-cy),halo=sg.createRadialGradient(cx,cy,R*.6,cx,cy,HR);if(tone==='blue'){halo.addColorStop(0,'rgba(38,76,215,.95)');halo.addColorStop(.5,'rgba(38,76,215,.45)');halo.addColorStop(1,'rgba(38,76,215,0)')}else{halo.addColorStop(0,'rgba(243,223,162,.16)');halo.addColorStop(.45,'rgba(212,175,97,.07)');halo.addColorStop(1,'rgba(212,175,97,0)')}sg.fillStyle=halo;sg.beginPath();sg.arc(cx,cy,HR,0,6.283);sg.fill();
   if(tone==='blue'){sg.fillStyle='#22388C'}else{const body=sg.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);body.addColorStop(0,'#1E3FAE');body.addColorStop(.7,'#0B1A52');body.addColorStop(1,'#060D2C');sg.fillStyle=body}sg.beginPath();sg.arc(cx,cy,R,0,6.283);sg.fill();
   if(tone!=='blue'){const rim=sg.createRadialGradient(cx,cy,R*.86,cx,cy,R*1.02);rim.addColorStop(0,'rgba(243,223,162,0)');rim.addColorStop(1,'rgba(243,223,162,.45)');sg.fillStyle=rim;sg.beginPath();sg.arc(cx,cy,R*1.02,0,6.283);sg.fill()}
   sg.strokeStyle='rgba(212,175,97,.75)';sg.lineWidth=1.2;sg.beginPath();sg.arc(cx,cy,R*1.1,0,6.283);sg.stroke();
   sg.setLineDash([2,6]);sg.strokeStyle='rgba(212,175,97,.45)';sg.beginPath();sg.arc(cx,cy,R*1.18,0,6.283);sg.stroke();this.gStatic=sv}
  g.drawImage(this.gStatic,0,0,GW,GH);
  /* graticule */
  g.lineWidth=.8;
  for(let lo=0;lo<180;lo+=30){g.beginPath();let pen=false;for(let la=-90;la<=90;la+=6){const q=this.proj(lo*Math.PI/180,la*Math.PI/180,R,cx,cy);if(q[2]>0){pen?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);pen=true}else pen=false}g.strokeStyle='rgba(212,175,97,.22)';g.stroke();
   g.beginPath();pen=false;for(let la=-90;la<=90;la+=6){const q=this.proj((lo+180)*Math.PI/180,la*Math.PI/180,R,cx,cy);if(q[2]>0){pen?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);pen=true}else pen=false}g.stroke()}
  for(let la=-60;la<=60;la+=30){g.beginPath();let pen=false;for(let lo=0;lo<=360;lo+=5){const q=this.proj(lo*Math.PI/180,la*Math.PI/180,R,cx,cy);if(q[2]>0){pen?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);pen=true}else pen=false}g.strokeStyle=la===0?'rgba(243,223,162,.4)':'rgba(212,175,97,.2)';g.stroke()}
  /* land, lit gold on the near side */
  {const B=8,paths=[];for(let i=0;i<B;i++)paths.push(new Path2D());
   for(const [lo,la] of this.land){const q=this.proj(lo,la,R,cx,cy);if(q[2]<=0)continue;const z=q[2],sz=1.4+z*.9;paths[Math.min(B-1,Math.floor(z*B))].rect(q[0]-.9,q[1]-.9,sz,sz)}
   for(let i=0;i<B;i++){const z=(i+.5)/B;g.globalAlpha=.25+z*.75;g.fillStyle=z>.55?'#F3DFA2':'#C9A24A';g.fill(paths[i])}}
  g.globalAlpha=1;
  /* routes between the voyage stops, lifted off the surface */
  {const routes=new Path2D();for(let i=0;i<this.stops.length-1;i++){const a=this.stops[i],b=this.stops[i+1];let pen=false;
   for(let k=0;k<=36;k++){const u=k/36,lo=a[0]+(((b[0]-a[0]+Math.PI*3)%(Math.PI*2))-Math.PI)*u,la=a[1]+(b[1]-a[1])*u,q=this.proj(lo,la,R,cx,cy,1+Math.sin(u*Math.PI)*.12);if(q[2]>-.05){pen?routes.lineTo(q[0],q[1]):routes.moveTo(q[0],q[1]);pen=true}else pen=false}}
   g.lineCap='round';g.strokeStyle='rgba(255,241,193,.22)';g.lineWidth=6;g.stroke(routes);g.strokeStyle='rgba(255,241,193,.35)';g.lineWidth=3.2;g.stroke(routes);g.strokeStyle='#FFF1C1';g.lineWidth=1.6;g.stroke(routes)}
  for(const [lo,la] of this.stops){const q=this.proj(lo,la,R,cx,cy);if(q[2]<=0)continue;const pulse=still?0:(t/1600)%1;g.fillStyle='#FFF1C1';g.beginPath();g.arc(q[0],q[1],2.6,0,6.283);g.fill();
   g.strokeStyle=`rgba(255,241,193,${(1-pulse)*.8})`;g.lineWidth=1;g.beginPath();g.arc(q[0],q[1],3+pulse*10,0,6.283);g.stroke()}
  /* orbit ring and the gold plane */
  const tiltO=-.32,ox=R*1.42,oy=R*.34,ang=still?.8:t/2600;const ring=a=>{const x=Math.cos(a)*ox,y=Math.sin(a)*oy;return [cx+x*Math.cos(tiltO)-y*Math.sin(tiltO),cy+x*Math.sin(tiltO)+y*Math.cos(tiltO),Math.sin(a)]};
  {const fr=new Path2D(),bk=new Path2D();for(let k=0;k<120;k++){const a0=k/120*6.283,a1=(k+1)/120*6.283,p0=ring(a0),p1=ring(a1);if(p0[2]<0&&Math.hypot(p0[0]-cx,p0[1]-cy)<R)continue;const pp=p0[2]>0?fr:bk;pp.moveTo(p0[0],p0[1]);pp.lineTo(p1[0],p1[1])}
   g.lineWidth=1;g.strokeStyle='rgba(212,175,97,.55)';g.stroke(fr);g.strokeStyle='rgba(212,175,97,.22)';g.stroke(bk)}
  for(let k=0;k<26;k++){const a=ang-k*.04,q=ring(a);if(q[2]<0&&Math.hypot(q[0]-cx,q[1]-cy)<R)continue;g.globalAlpha=(1-k/26)*.9;g.fillStyle='#FFF1C1';g.beginPath();g.arc(q[0],q[1],2.2*(1-k/26)+.4,0,6.283);g.fill()}
  g.globalAlpha=1;const P=ring(ang);if(!(P[2]<0&&Math.hypot(P[0]-cx,P[1]-cy)<R)){const N=ring(ang+.02),dir=Math.atan2(N[1]-P[1],N[0]-P[0]);g.save();g.translate(P[0],P[1]);g.rotate(dir+Math.PI/2);g.globalAlpha=.28;g.fillStyle='#FFF1C1';g.beginPath();g.arc(0,1,12,0,6.283);g.fill();g.globalAlpha=1;g.fillStyle='#F3DFA2';
   g.beginPath();g.moveTo(0,-9);g.lineTo(1.6,-3);g.lineTo(9,2);g.lineTo(9,4);g.lineTo(1.6,2);g.lineTo(1.4,7);g.lineTo(4,9);g.lineTo(4,10.5);g.lineTo(0,9.5);g.lineTo(-4,10.5);g.lineTo(-4,9);g.lineTo(-1.4,7);g.lineTo(-1.6,2);g.lineTo(-9,4);g.lineTo(-9,2);g.lineTo(-1.6,-3);g.closePath();g.fill();g.restore()}}
}

/* ---------- the monuments frieze: the stage backdrop's skyline in gold line art ---------- */
const SKYLINE=[['eiffel',95,3.1],['taj',265,2.3],['liberty',420,2.7],['colosseum',590,2.2],['bigben',760,3.1],['pagoda',925,2.5],['opera',1100,2.4]];
function skyline(){const GY=210;
 const mon=(k,x,s,i)=>`<g class="mon" style="--i:${i}" transform="translate(${(x-32*s).toFixed(1)} ${(GY-60*s).toFixed(1)}) scale(${s})"><path d="${LANDMARKS[k]}" pathLength="1" stroke-width="${(1.5/s).toFixed(3)}"/></g>`;
 const art=SKYLINE.map((m,i)=>mon(m[0],m[1],m[2],i)).join('');
 return `<section class="r-sky" aria-label="Paris, Agra, New York, Rome, London, Asia and Sydney in gold line art"><svg viewBox="0 0 1200 290" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
 <defs><linearGradient id="skyLine" x1="0" x2="1"><stop offset="0" stop-color="#D4AF61" stop-opacity="0"/><stop offset=".15" stop-color="#F3DFA2"/><stop offset=".85" stop-color="#F3DFA2"/><stop offset="1" stop-color="#D4AF61" stop-opacity="0"/></linearGradient>
 <radialGradient id="skyGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F3DFA2" stop-opacity=".22"/><stop offset="1" stop-color="#F3DFA2" stop-opacity="0"/></radialGradient>
 <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="skyMask"><rect x="0" y="${GY}" width="1200" height="80" fill="url(#skyFade)"/></mask>
 <filter id="skyBloom" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
 <ellipse cx="600" cy="${GY}" rx="560" ry="46" fill="url(#skyGlow)"/>
 <g class="mons" filter="url(#skyBloom)">${art}</g>
 <g mask="url(#skyMask)"><g transform="translate(0 ${GY*2}) scale(1 -1)" class="mons refl">${art}</g></g>
 <line x1="0" y1="${GY}" x2="1200" y2="${GY}" stroke="url(#skyLine)" stroke-width="1.4"/>
 <path d="M592 ${GY}l8-6 8 6-8 6z" fill="#D4AF61"/></svg></section>`}
function mountSkyline(){const s=$('.r-sky');if(!s)return;if(RMQ.matches||!('IntersectionObserver' in window)){s.classList.add('drawn');return}
 const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){s.classList.add('drawn');io.disconnect()}},{threshold:.35});io.observe(s)}
