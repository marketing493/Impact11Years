/* ---------- scroll storytelling ----------
 Story: a pinned scene. As you scroll, a few hundred cells fly between chapter shapes
 (2015, HUSTLE, a rising chart, 800+, 11, 17.12) while the chapter copy and background change.
 Journey: a pinned horizontal timeline. Vertical scroll moves through the years. */
const CHAPTERS=[
 {tag:'Chapter one, 2015',title:'It started with an <em>idea</em>',body:'A small team set out to help retailers make better decisions with data.',shape:'2015',acc:'yellow',bg:'#1C1B1B'},
 {tag:'Chapter two',title:'A few people. A lot of <em>hustle</em>.',body:'Long days, bold bets and a belief that retail deserved better tools.',shape:'HUSTLE',acc:'purple',bg:'#1C1B1B'},
 {tag:'Chapter three',title:'Built for retail’s hardest <em>decisions</em>',body:'What to buy, where to stock it and how to price it. AI that turns data into answers.',shape:'#bars',acc:'green',bg:'#264CD7'},
 {tag:'Chapter four',title:'800+ people, one <em>team</em>',body:'Colleagues across cities and time zones, serving retailers around the world.',shape:'800+',acc:'sky',bg:'#264CD7'},
 {tag:'Chapter five',title:'Eleven years of <em>impact</em>',body:'Every moment, every connection and every impact brought us here.',shape:'11',acc:'yellow',bg:'#264CD7'},
 {tag:'Chapter six, 17 December',title:'Now we <em>celebrate</em>',body:'One day in Bangalore for the people who built it.',shape:'17.12',acc:'orange',bg:'#1C1B1B',cta:true}];
const F7=Object.assign({},D5,G7,{H:['#..#','#..#','#..#','####','#..#','#..#','#..#'],U:['#..#','#..#','#..#','#..#','#..#','#..#','.##.'],L:['#...','#...','#...','#...','#...','#...','####'],'+':['.....','..#..','..#..','#####','..#..','..#..','.....'],'.':['.','.','.','.','.','.','#']});
function shapePoints(sh){const pts=[];let w=0,h=7;
 if(sh==='#bars'){const H=[3,5,4,7,6,9,12];H.forEach((v,j)=>{for(let x=0;x<3;x++)for(let y=12-v;y<12;y++)pts.push({c:j*4+x,r:y,o:j===H.length-1})});for(let x=0;x<27;x++)pts.push({c:x,r:13,o:false});return {pts,w:27,h:14}}
 let x=0;for(const ch of sh){const g=F7[ch];for(let r=0;r<7;r++)for(let k=0;k<g[r].length;k++)if(g[r][k]==='#')pts.push({c:x+k,r,o:ch==='.'||ch==='+'});x+=g[0].length+1}
 return {pts,w:x-1,h}}
const lerpHex=(a,b,t)=>{const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),A=p(a),B=p(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

let STORY_I=null,JOURNEY_I=null;
function storySection(){return `<section class="story" id="story" style="height:${CHAPTERS.length*85+100}vh"><div class="story-pin" data-acc style="background:${CHAPTERS[0].bg};--acc:${ACC[CHAPTERS[0].acc]}"><canvas aria-hidden="true"></canvas>${sprinkle(83,18)}
 <div class="chaps">${CHAPTERS.map((c,i)=>`<div class="chap" style="opacity:${i?0:1};--acc:${ACC[c.acc]}"><p class="num">${c.tag}</p><h2>${c.title}</h2><p>${c.body}</p>${c.cta?`<div class="ctas"><a class="btn white" href="#event-schedule" data-magnet>${ic('calendar',18)} See the schedule</a><a class="btn glassy" href="#event-journey" data-magnet>Walk the journey ${ic('arrow',16)}</a></div>`:''}</div>`).join('')}</div>
 <nav class="rail-p" aria-label="Story chapters">${CHAPTERS.map((c,i)=>`<button data-chap="${i}" class="${i?'':'on'}"><span>${['2015','Hustle','Retail','800+','Eleven','Now'][i]}</span><i></i></button>`).join('')}</nav><div class="story-dots" aria-hidden="true">${CHAPTERS.map((c,i)=>`<i data-sdot="${i}" class="${i?'':'on'}"></i>`).join('')}<span class="story-hint">Swipe up</span></div><button class="sound" data-sound aria-pressed="false" aria-label="Play the story score"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">Play the score</span></button><div class="story-bar"></div></div></section>`}

class Story{
 constructor(sec){this.sec=sec;this.pin=sec.querySelector('.story-pin');this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');
  this.chaps=[...sec.querySelectorAll('.chap')];this.btns=[...sec.querySelectorAll('[data-chap]')];this.dots=[...sec.querySelectorAll('[data-sdot]')];
  this.n=CHAPTERS.length;this.cs=0;this.target=0;this.idx=0;this.tw=null;this.ptr=null;this.alive=true;
  /* Phones get a stepped story: one screen, one chapter per swipe, a timed transition, and the page never moves. */
  this.phone=matchMedia('(pointer: coarse)').matches||innerWidth<=820;
  if(this.phone){sec.style.height='';sec.classList.add('stepped')}
  this.resize();
  this.btns.forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.chap;scrollTo({top:this.absTop()+(i/(this.n-1))*(this.sec.offsetHeight-innerHeight)+2,behavior:'smooth'})}));
  this.pin.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'){this.ptr=null;return}const r=this.cv.getBoundingClientRect();this.ptr={x:e.clientX-r.left,y:e.clientY-r.top}});this.pin.addEventListener('pointerleave',()=>this.ptr=null);
  /* the score: a tap starts it, it follows the chapters and fades out when the story leaves the screen */
  this.sbtn=sec.querySelector('[data-sound]');
  if(this.sbtn){if(!SCORE.supported)this.sbtn.hidden=true;const paint=on=>{this.sbtn.setAttribute('aria-pressed',on);this.sbtn.querySelector('.lbl').textContent=on?'Sound on':'Play the score';this.sbtn.setAttribute('aria-label',on?'Mute the story score':'Play the story score')};
   paint(SCORE.on);this.unsub=SCORE.onChange(paint);this.sbtn.addEventListener('click',e=>{e.stopPropagation();SCORE.setChapter(this.idx||Math.round(this.cs));SCORE.toggle()})}
  this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);this.update();if(this.phone)this.setupSteps()}
 absTop(){return this.sec.getBoundingClientRect().top+scrollY}
 destroy(){this.alive=false;SCORE.setVisible(false);this.unsub&&this.unsub();this.ac&&this.ac.abort();document.documentElement.classList.remove('story-locked')}
 /* timed move to a chapter, starting from wherever the animation is right now */
 show(i){i=Math.max(0,Math.min(this.n-1,i));if(i===this.idx&&!this.tw)return;this.idx=i;this.tw={from:this.cs,to:i,t0:performance.now(),d:RMQ.matches?1:Math.min(1400,820+Math.abs(i-this.cs)*180)}}
 setupSteps(){
  this.ac=new AbortController();const sig={signal:this.ac.signal},n=this.n,root=document.documentElement;
  this.locked=false;this.busy=false;this.lastY=scrollY;
  const glide=(y,ms)=>{this.busy=true;scrollTo({top:y,behavior:RMQ.matches?'auto':'smooth'});clearTimeout(this.bt);this.bt=setTimeout(()=>{this.busy=false;this.hold&&this.hold();this.lastY=scrollY},ms)};
  const lock=from=>{this.locked=true;this.pin.dataset.locked='1';root.classList.add('story-locked');if(from!==undefined&&from!==this.idx){this.idx=from;this.cs=from;this.tw=null}glide(this.absTop(),650)};
  const release=y=>{this.locked=false;delete this.pin.dataset.locked;root.classList.remove('story-locked');glide(y,1000)};
  /* lock when the story arrives on screen: from above start at chapter 1, from below at the last one */
  /* while locked, hold the story exactly at the top: catches leftover momentum and address bar shifts */
  const hold=()=>{if(!this.locked)return;const top=this.sec.getBoundingClientRect().top;if(Math.abs(top)>1)scrollTo({top:this.absTop(),behavior:'auto'})};
  this.hold=hold;
  addEventListener('scroll',()=>{const y=scrollY,down=y>this.lastY;this.lastY=y;if(this.locked&&!this.busy){hold();this.lastY=scrollY;return}if(this.locked||this.busy)return;
   const top=this.sec.getBoundingClientRect().top,H=innerHeight;
   if(down&&top<H*.28&&top>-H*.5)lock(this.idx===n-1&&top<0?undefined:0);
   else if(!down&&top>-H*.28&&top<H*.5)lock(this.idx===0&&top>0?undefined:n-1)},{passive:true,...sig});
  let y0=null,t0=0;
  addEventListener('touchstart',e=>{y0=e.touches[0].clientY;t0=performance.now()},{passive:true,...sig});
  addEventListener('touchmove',e=>{if(this.locked)e.preventDefault()},{passive:false,...sig});
  addEventListener('touchend',e=>{if(!this.locked||y0===null)return;const dy=y0-e.changedTouches[0].clientY;y0=null;if(Math.abs(dy)<30||performance.now()-(this.stepAt||0)<380)return;
   this.stepAt=performance.now();const next=this.idx+(dy>0?1:-1);
   if(next<0)release(this.absTop()-innerHeight*.8);
   else if(next>n-1)release(this.absTop()+this.sec.offsetHeight);
   else this.show(next)},{passive:true,...sig});
  addEventListener('wheel',e=>{if(this.locked)e.preventDefault()},{passive:false,...sig});
  this.dots.forEach(d=>d.addEventListener('click',()=>this.show(+d.dataset.sdot),sig))}
 resize(){const d=Math.min(2,devicePixelRatio||1),W=this.pin.clientWidth,H=this.pin.clientHeight;
  /* ignore the small height changes from the phone's address bar so shapes never jump */
  if(this.phone&&this.W===W&&Math.abs(H-this.H)<160&&this.T)return;
  this.W=W;this.H=H;this.cv.width=W*d;this.cv.height=H*d;this.ctx.setTransform(d,0,0,d,0,0);
  const wide=W>820,railX=W-Math.max(24,(W-1200)/2)-150,ax=wide?W*.49:W*.07,aw=wide?Math.max(260,railX-W*.49-24):W*.86,ay=wide?H*.18:H*.2,ah=wide?H*.64:H*.29,maxCell=wide?30:22;
  const shapes=CHAPTERS.map(c=>shapePoints(c.shape)),N=Math.max(...shapes.map(s=>s.pts.length))+(wide?90:50),r=seededRand(5);this.N=N;
  const amb=Array.from({length:N},()=>[r()*W,r()*H]),swing=wide?160:56;
  this.swirl=Array.from({length:N},()=>(r()-.5)*swing);this.stag=Array.from({length:N},(_,i)=>(i*7%41)/41*(wide?.32:.2));
  this.T=shapes.map((s,k)=>{const cell=Math.floor(Math.min(maxCell,aw/s.w,ah/s.h)),ox=Math.round(ax+(aw-s.w*cell)/2),oy=Math.round(ay+(ah-s.h*cell)/2),order=[...s.pts];const rk=seededRand(31+k);
   /* phones: sort cells left to right so they travel in tidy columns; desktop keeps the scatter */
   if(wide){for(let i=order.length-1;i>0;i--){const j=Math.floor(rk()*(i+1));[order[i],order[j]]=[order[j],order[i]]}}else order.sort((p,q)=>p.c-q.c||p.r-q.r);
   const pos=new Float32Array(N*2),sz=new Float32Array(N),al=new Float32Array(N),hot=new Uint8Array(N);
   for(let i=0;i<N;i++){if(i<order.length){const p=order[i];pos[i*2]=ox+p.c*cell;pos[i*2+1]=oy+p.r*cell;sz[i]=Math.round(cell*.8);al[i]=1;hot[i]=p.o||(i%13===5)?1:0}
    else{pos[i*2]=amb[i][0]+Math.sin(k+i)*30;pos[i*2+1]=amb[i][1]+Math.cos(k*1.7+i)*30;sz[i]=2+(i%3);al[i]=.24;hot[i]=0}}
   return {pos,sz,al,hot}})}
 update(){const r=this.sec.getBoundingClientRect();this.visible=r.bottom>0&&r.top<innerHeight;SCORE.setVisible(r.bottom>innerHeight*.35&&r.top<innerHeight*.65);if(this.phone)return;
  const span=this.sec.offsetHeight-innerHeight,p=clamp(-r.top/span);this.target=p*(this.n-1);this.pin.style.setProperty('--p',p.toFixed(4))}
 loop(t){if(!this.alive)return;requestAnimationFrame(this.loop);if(!this.visible||document.hidden)return;
  if(this.tw){const q=clamp((t-this.tw.t0)/this.tw.d);this.cs=this.tw.from+(this.tw.to-this.tw.from)*q;if(q>=1){this.cs=this.tw.to;this.tw=null}}
  else if(!this.phone)this.cs+=(this.target-this.cs)*(RMQ.matches?1:.09);
  const cs=this.cs,k=Math.min(this.n-2,Math.floor(cs)),f=clamp(cs-k),settled=this.phone&&!this.tw;
  if(this.phone)this.pin.style.setProperty('--p',(cs/(this.n-1)).toFixed(4));
  /* background + copy */
  const kb=Math.min(this.n-1,Math.floor(cs)),fb=clamp(cs-kb);this.pin.style.background=lerpHex(CHAPTERS[kb].bg,CHAPTERS[Math.min(this.n-1,kb+1)].bg,ease(fb));
  const wide=this.W>820;this.chaps.forEach((el,i)=>{const d=cs-i,o=clamp(1-Math.abs(d)*(this.phone?2.4:1.9));el.style.opacity=o.toFixed(3);el.style.transform=`translateY(${wide?'calc(-50% + ':'calc('}${(-d*(this.phone?36:70)).toFixed(1)}px))`;el.style.pointerEvents=o>.6?'auto':'none'});
  const act=Math.round(cs);this.btns.forEach((b,i)=>b.classList.toggle('on',i===act));if(act!==this.lastAct){this.lastAct=act;SCORE.setChapter(act);this.pin.style.setProperty('--acc',ACC[CHAPTERS[act].acc]);this.dots.forEach((d,i)=>d.classList.toggle('on',i===act));this.pin.dataset.ch=act}
  /* particles */
  const accA=ACC[CHAPTERS[k].acc],accB=ACC[CHAPTERS[k+1].acc],accN=ACC[CHAPTERS[Math.round(cs)].acc],c=this.ctx,A=this.T[k],B=this.T[k+1],N=this.N,ptr=this.ptr,still=RMQ.matches,span=this.phone?.8:.68;c.clearRect(0,0,this.W,this.H);
  for(let i=0;i<N;i++){const e=ease(clamp((f-this.stag[i])/span)),inShape=(e<.5?A:B).al[i]>.6;
   let x=A.pos[i*2]+(B.pos[i*2]-A.pos[i*2])*e,y=A.pos[i*2+1]+(B.pos[i*2+1]-A.pos[i*2+1])*e;
   const sw=Math.sin(e*Math.PI)*this.swirl[i],dx=B.pos[i*2]-A.pos[i*2],dy=B.pos[i*2+1]-A.pos[i*2+1],len=Math.hypot(dx,dy)||1;x+=-dy/len*sw;y+=dx/len*sw;
   /* cells in a finished shape sit perfectly still on phones; loose cells keep drifting */
   if(!still&&!(settled&&inShape)){x+=Math.sin(t*.0011+i)*1.4;y+=Math.cos(t*.0013+i*1.3)*1.4}
   if(ptr&&!still){const px=x-ptr.x,py=y-ptr.y,dd=Math.hypot(px,py);if(dd<110){const m=(110-dd)/110*34;x+=px/(dd||1)*m;y+=py/(dd||1)*m}}
   const s=A.sz[i]+(B.sz[i]-A.sz[i])*e,a=A.al[i]+(B.al[i]-A.al[i])*e,hot=e<.5?A.hot[i]:B.hot[i];
   c.globalAlpha=a;c.fillStyle=hot?(e<.5?accA:accB):a>.6?'#FFFFFF':accN;
   if(settled&&inShape)c.fillRect(Math.round(x),Math.round(y),s,s);else c.fillRect(x,y,s,s)}
  c.globalAlpha=1}
}

/* ---------- journey ---------- */
const JACC=[ACC.yellow,ACC.yellow,ACC.green,ACC.purple,ACC.sky,ACC.yellow,ACC.orange];
function journeySection(){const decoFor=(k,last)=>{const r=seededRand(100+k);return Array.from({length:8},(_,i)=>{const s=8+r()*64,kind=last&&i===0?'#FF6F1C':['rgba(255,255,255,.14)',JACC[k%JACC.length],'#FFFFFF','transparent'][i%4];return `<i style="left:${(r()*90).toFixed(1)}%;top:${(8+r()*80).toFixed(1)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;background:${kind};${kind==='transparent'?'border:1.5px solid rgba(255,255,255,.5);':''}${kind.startsWith('rgba')?'border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);':''}--d:${(.3+r()*1.2).toFixed(2)};opacity:${(.35+r()*.6).toFixed(2)}"></i>`}).join('')};
 return `<section class="hjourney" id="journey"><div class="hj-pin" style="background-color:#1C1B1B"><div class="hj-track">
 <div class="hj-panel intro"><div class="hj-deco">${decoFor(0)}</div><p class="tagn">The journey</p><h3 style="font-size:clamp(48px,6.4vw,104px);max-width:12ch">Eleven years in six <em>moments</em></h3><p>Keep scrolling to travel through time.</p><div class="scrollcue" style="margin-top:28px"><span></span>Scroll</div></div>
 ${JOURNEY.map((j,i)=>{const last=i===JOURNEY.length-1;return `<article class="hj-panel ${last?'last':''}" data-year="${j[0]}" style="--acc:${JACC[(i+1)%JACC.length]}"><div class="hj-deco">${decoFor(i+1,last)}</div>${sprinkle(90+i,9)}<p class="tagn">Moment ${i+1} of ${JOURNEY.length}</p><div class="hj-year tn" aria-hidden="true"><span class="o">${j[0]}</span><span class="f">${j[0]}</span></div><h3>${j[1]}</h3><p>${j[2]}</p>${last?`<div class="ctas" style="margin-top:26px"><a class="btn white" href="#event-schedule" data-magnet>${ic('calendar',18)} See the schedule</a><a class="btn glassy" href="#reminders" data-magnet>${ic('bell',18)} Get reminders</a></div>`:''}</article>`}).join('')}
 <div style="flex:none;width:12vw"></div></div>
 <div class="hj-ui"><span class="hj-count tn">2015</span><div class="hj-line"><b></b>${JOURNEY.map((j,i)=>`<span style="left:${((i+1)/JOURNEY.length*100-100/JOURNEY.length/2).toFixed(1)}%">${j[0]}</span>`).join('')}</div></div></div></section>`}
class Journey{
 constructor(sec){this.sec=sec;this.pin=sec.querySelector('.hj-pin');this.track=sec.querySelector('.hj-track');this.panels=[...sec.querySelectorAll('.hj-panel')];this.ticks=[...sec.querySelectorAll('.hj-line span')];this.count=sec.querySelector('.hj-count');this.resize();this.update()}
 destroy(){}
 resize(){this.vw=this.pin.clientWidth;this.tw=this.track.scrollWidth;this.dist=Math.max(1,this.tw-this.vw);this.sec.style.height=(this.dist+innerHeight)+'px'}
 update(){const r=this.sec.getBoundingClientRect(),p=clamp(-r.top/this.dist),x=-p*this.dist,vw=this.vw;
  this.track.style.transform=`translate3d(${x.toFixed(1)}px,0,0)`;this.pin.style.setProperty('--hx',x+'px');this.pin.style.setProperty('--p',p.toFixed(4));
  let act=0,best=1e9;
  this.panels.forEach((pn,i)=>{const left=pn.offsetLeft+x,w=pn.offsetWidth,center=left+w/2;
   pn.style.setProperty('--fill',(clamp((vw*.9-left)/(w*.75))*100).toFixed(1)+'%');
   pn.querySelector('.hj-deco')?.style.setProperty('--px',((center-vw/2)*-.35).toFixed(1));
   const dd=Math.abs(center-vw/2);if(dd<best){best=dd;act=i}});
  this.pin.style.backgroundColor=act===this.panels.length-1?'#264CD7':act%2?'#1C1B1B':'#264CD7';if(act===0)this.pin.style.backgroundColor='#1C1B1B';
  const yi=Math.max(0,act-1);this.ticks.forEach((t,i)=>t.classList.toggle('on',i<=yi&&act>0));if(this.count)this.count.textContent=JOURNEY[yi][0]}
}
function mountStory(){STORY_I&&STORY_I.destroy();STORY_I=null;JOURNEY_I=null;const s=$('#story');if(s)STORY_I=new Story(s);const j=$('#journey');if(j)JOURNEY_I=new Journey(j)}
addEventListener('resize',()=>{STORY_I&&STORY_I.resize();JOURNEY_I&&(JOURNEY_I.resize(),JOURNEY_I.update())});
