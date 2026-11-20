/* ---------- motion layer ----------
 Ambient: a fixed canvas of drifting cells at three depths, with scroll and pointer parallax.
 Plus: pointer and scroll CSS variables, scroll reveals, 3D tilt, magnetic buttons, drag-to-scroll. */
const RMQ=matchMedia('(prefers-reduced-motion: reduce)');
/* Brand accents. Rule from the brand guide: one solution colour per composition, so every section,
   chapter and journey moment declares a single accent with data-acc and everything inside it follows. */
const ACC={yellow:'#E3F576',purple:'#BEA8EF',green:'#3DD499',sky:'#B3C9F7',orange:'#FF6F1C'};
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
/* little elements: tiny brand shapes scattered through a section, all in that section's accent */
function sprinkle(seed,n=10,zone){const r=seededRand(seed),kinds=['plus','plus','dot','diamond','ring','dash','quad','spark','acc'],z=zone||[0,100,0,100];
 return floaters(Array.from({length:n},()=>{const k=kinds[Math.floor(r()*kinds.length)],x=z[0]+r()*(z[1]-z[0]),y=z[2]+r()*(z[3]-z[2]);return [k,+x.toFixed(1),+y.toFixed(1),Math.round((k==='plus'||k==='spark'?12:9)+r()*14),+(.4+r()*1.2).toFixed(2)]}),'sprinkles')}
const root=document.documentElement;

class Ambient{
 constructor(cv){this.cv=cv;this.ctx=cv.getContext('2d');this.acc=[179,201,247];this.accT=[179,201,247];this.mx=0;this.my=0;this.tx=0;this.ty=0;this.resize();
  addEventListener('resize',()=>this.resize());this.loop=this.loop.bind(this);requestAnimationFrame(this.loop)}
 resize(){const d=Math.min(2,devicePixelRatio||1);this.w=innerWidth;this.h=innerHeight;this.cv.width=this.w*d;this.cv.height=this.h*d;this.ctx.setTransform(d,0,0,d,0,0);
  const n=Math.round(Math.min(46,Math.max(18,this.w*this.h/42000))),r=seededRand(17);
  const kinds=['glass','glass','glass','blue','sky','sky','outline','outline','cells','blue','plus','plus','acc','acc'];
  this.items=Array.from({length:n},(_,i)=>{const z=.25+r()*.85;return {x:r()*this.w,y:r()*this.h*1.4,z,s:(6+r()*46)*z,k:i%23===0?'hot':kinds[Math.floor(r()*kinds.length)],ph:r()*6.28,sp:.15+r()*.35,rot:r()*.6-.3,vr:(r()-.5)*.0016}})}
 loop(t){requestAnimationFrame(this.loop);if(document.hidden)return;
  this.mx+=((this.tx||0)-this.mx)*.05;this.my+=((this.ty||0)-this.my)*.05;
  const c=this.ctx,sy=scrollY,dark=matchMedia('(prefers-color-scheme: dark)').matches&&root.dataset.theme!=='light'||root.dataset.theme==='dark';
  const royal=root.dataset.skin==='royal';if(royal)this.accT=[212,175,97];
  for(let i=0;i<3;i++)this.acc[i]+=(this.accT[i]-this.acc[i])*.04;const A=this.acc.map(Math.round).join(',');
  c.clearRect(0,0,this.w,this.h);
  for(const o of this.items){
   const drift=RMQ.matches?0:Math.sin(t/1000*o.sp+o.ph)*14*o.z;
   const M=this.h*1.4;let y=(((o.y-sy*o.z*.35+drift)%M)+M)%M;
   const x=o.x+this.mx*-30*o.z+(RMQ.matches?0:Math.cos(t/1300*o.sp+o.ph)*10*o.z);
   const s=o.s,rot=o.rot+(RMQ.matches?0:t*o.vr*.06);
   c.save();c.translate(x,y-40);c.rotate(rot);c.globalAlpha=.25+o.z*.55;
   if(o.k==='glass'){c.fillStyle=royal?'rgba(243,223,162,.05)':dark?'rgba(179,201,247,.06)':'rgba(255,255,255,.7)';c.strokeStyle=royal?'rgba(212,175,97,.4)':dark?'rgba(179,201,247,.28)':'rgba(38,76,215,.22)';c.lineWidth=1;rr(c,-s/2,-s/2,s,s,3);c.fill();c.stroke()}
   else if(o.k==='outline'){c.strokeStyle=royal?'rgba(212,175,97,.45)':dark?'rgba(179,201,247,.35)':'rgba(38,76,215,.35)';c.lineWidth=1.2;rr(c,-s/2,-s/2,s,s,2);c.stroke()}
   else if(o.k==='plus'){const q=Math.max(7,s*.5),w=q*.3;c.fillStyle=`rgb(${A})`;c.fillRect(-q/2,-w/2,q,w);c.fillRect(-w/2,-q/2,w,q)}
   else if(o.k==='acc'){const q=Math.max(5,s*.35);c.fillStyle=`rgb(${A})`;rr(c,-q/2,-q/2,q,q,2);c.fill()}
   else if(o.k==='cells'){const g=s*.44;c.fillStyle=`rgba(${A},.9)`;c.fillRect(-s/2,-s/2,g,g);c.fillRect(s/2-g,-s/2,g,g);c.fillRect(-s/2,s/2-g,g,g);c.globalAlpha*=.4;c.fillRect(s/2-g,s/2-g,g,g)}
   else{c.fillStyle=o.k==='hot'?(royal?'#FFF1C1':'#FF6F1C'):o.k==='blue'?(royal?'#2B4FD9':dark?'#3A5BE0':'#264CD7'):`rgba(${A},${dark?.55:1})`;const q=o.k==='hot'?Math.min(s,10):s*.55;rr(c,-q/2,-q/2,q,q,2);c.fill()}
   c.restore()}}
}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function seededRand(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* floating element markup. items: [kind, x%, y%, size px, depth, extra] */
function floaters(items,extra=''){return `<div class="floaters ${extra}" aria-hidden="true">${items.map(([k,x,y,s,d,txt],i)=>`<span class="fl ${k}" style="--x:${x}%;--y:${y}%;--s:${s}px;--d:${d};--t:${7+(i%5)*1.7}s;--dl:${-(i*1.3)}s;--r0:${(i%2?-1:1)*(4+i%7)}deg">${k==='ftag'?`<i>${txt}</i>`:'<i></i>'}</span>`).join('')}</div>`}

/* pointer and scroll variables, one rAF */
let fxTick=false,ptr={x:innerWidth/2,y:innerHeight/2};
function fxFrame(){fxTick=false;root.style.setProperty('--scroll',scrollY.toFixed(0));root.style.setProperty('--mx',((ptr.x/innerWidth)*2-1).toFixed(3));root.style.setProperty('--my',((ptr.y/innerHeight)*2-1).toFixed(3));
 if(window.AMB){AMB.tx=(ptr.x/innerWidth)*2-1;AMB.ty=(ptr.y/innerHeight)*2-1;
  const el=document.elementFromPoint(innerWidth/2,innerHeight/2),sec=el&&el.closest('[data-acc]');if(sec&&root.dataset.skin!=='royal'){const h=getComputedStyle(sec).getPropertyValue('--acc').trim();if(/^#[0-9a-f]{6}$/i.test(h))AMB.accT=hexRgb(h)}}
 STORY_I&&STORY_I.update();JOURNEY_I&&JOURNEY_I.update();
 $$('[data-scrub]').forEach(el=>{const r=el.getBoundingClientRect(),p=clamp((innerHeight*.88-r.top)/(r.height+innerHeight*.35));el.style.setProperty('--sp',p.toFixed(3))})}
const fxQueue=()=>{if(!fxTick){fxTick=true;requestAnimationFrame(fxFrame)}};
addEventListener('scroll',fxQueue,{passive:true});addEventListener('resize',fxQueue);
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;ptr={x:e.clientX,y:e.clientY};fxQueue()},{passive:true});

/* per-render mounts */
let RV_IO=null;
function mountFx(){
 /* reveals */
 RV_IO&&RV_IO.disconnect();
 if(!RMQ.matches&&'IntersectionObserver' in window){root.classList.add('rv-on');RV_IO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');RV_IO.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  $$('[data-rv]').forEach(el=>RV_IO.observe(el));setTimeout(()=>$$('[data-rv]').forEach(el=>el.classList.add('in')),4000)}
 if(RMQ.matches||matchMedia('(hover: none)').matches)return;
 /* tilt */
 $$('[data-tilt]').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.classList.add('tilting');el.style.transform=`perspective(900px) rotateX(${(.5-y)*9}deg) rotateY(${(x-.5)*11}deg) translateZ(0)`;el.style.setProperty('--gx',x*100+'%');el.style.setProperty('--gy',y*100+'%')});
  el.addEventListener('pointerleave',()=>{el.classList.remove('tilting');el.style.transform=''})});
 /* magnetic */
 $$('[data-magnet]').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
 /* hero spotlight */
 $$('[data-spot]').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),s=el.querySelector('.spot');if(s){s.style.setProperty('--spx',(e.clientX-r.left)+'px');s.style.setProperty('--spy',(e.clientY-r.top)+'px')}}));
 /* drag to scroll */
 $$('[data-drag]').forEach(el=>{let down=false,sx=0,sl=0,moved=0;
  el.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=0;sx=e.clientX;sl=el.scrollLeft});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>4)el.classList.add('drag');el.scrollLeft=sl-dx});
  addEventListener('pointerup',()=>{if(!down)return;down=false;el.classList.remove('drag')});
  el.addEventListener('click',e=>{if(moved>6){e.preventDefault();e.stopPropagation()}},true)})}
let AMB=null;
function startAmbient(){const cv=$('#ambient');if(cv&&!AMB)AMB=window.AMB=new Ambient(cv)}
