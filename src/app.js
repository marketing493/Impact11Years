/* ---------- helpers ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-IN');
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const P={home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',calendar:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
play:'M7 8h10a5 5 0 015 5v1a3 3 0 01-5.3 2L15.5 14h-7L7.3 16A3 3 0 012 14v-1a5 5 0 015-5zM8 10.5v3M6.5 12h3M16 11.5h.01M18 13.5h.01',
trophy:'M8 4h8v5a4 4 0 01-8 0zM8 6H4v1a3 3 0 003 3M16 6h4v1a3 3 0 01-3 3M12 13v4M8 20h8M10 17h4',
user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',bell:'M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4',
clock:'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',pin:'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
help:'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 1.9c-.9.6-1.5 1-1.5 2M12 17h.01',
image:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01',qr:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
mega:'M3 11v3l12 5V6zM15 8c3 .5 5 2 5 4s-2 3.5-5 4M7 14.5V19h3v-3.5',check:'M5 12.5l4.5 4.5L19 7.5',
lock:'M6 11h12v9H6zM8 11V8a4 4 0 118 0v3',plus:'M12 5v14M5 12h14',search:'M11 18a7 7 0 100-14 7 7 0 000 14zM16 16l4 4',
edit:'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',back:'M15 5l-7 7 7 7',chev:'M9 5l7 7-7 7',
star:'M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z',upload:'M12 16V4M7 9l5-5 5 5M4 20h16',
users:'M9 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20a7 7 0 0114 0M16 5.5a3.5 3.5 0 010 7M18 20h4a6 6 0 00-4-5.6',
chart:'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8',shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
tv:'M3 5h18v12H3zM8 21h8M12 17v4',bolt:'M13 3L5 14h6l-1 7 8-11h-6z',camera:'M4 8h4l1.5-2h5L16 8h4v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
x:'M6 6l12 12M18 6L6 18',video:'M3 6h13v12H3zM16 10l5-3v10l-5-3z',list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',flag:'M5 21V4M5 4h12l-2 4 2 4H5',down:'M5 9l7 7 7-7',
flame:'M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z',
gift:'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1-3-5-4-5-1.5S10 7 12 7zm0 0c1-3 5-4 5-1.5S14 7 12 7z',
sun:'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
map:'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',prev:'M15 5l-7 7 7 7',next:'M9 5l7 7-7 7',
eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',dl:'M12 4v12M7 11l5 5 5-5M4 20h16'};
const ic=(n,s=20,sw=1.6)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);
const avatar=(n,s=36)=>`<span class="av a${n.length%3}" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.36)}px">${initials(n)}</span>`;
function seeded(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- state ---------- */
const STORE='ia-impact11-v1';
let S;
function fresh(mode){
 const emp=NAMES.map((n,i)=>({id:'IA-'+(1001+i),name:n,dept:DEPTS[i%8],email:n.toLowerCase().replace(' ','.')+'@impactanalytics.co',role:i<5?ROLES[i]:'Employee',status:i%9===8?'Invited':'Active',pts:2840-i*92}));
 return {mode:mode||'emp',tab:'home',ov:null,seg:{event:'about',play:'quiz',rank:'board',gal:'photos',ann:'Announcements'},annCat:'All',
 emp,read:{a3:1,a5:1},readTaps:0,quizDone:{},gameDone:{},claimed:{},drop:null,streak:3,cells:742,myCells:0,checked:false,vote:-1,votes:[124,203,158,97],bingo:[12],
 hist:[{t:'Retail Basics warm-up',d:'12 Nov',p:240},{t:'App onboarding bonus',d:'10 Nov',p:50}],
 ledger:[{who:'Ananya Rao',label:'Retail Basics warm-up',pts:240,when:'12 Nov',by:'System'},{who:'Ananya Rao',label:'App onboarding bonus',pts:50,when:'10 Nov',by:'HR Admin'},{who:'Karthik Iyer',label:'Daily Challenge',pts:310,when:'17 Nov',by:'System'},{who:'Meera Joshi',label:'Guess the Colleague',pts:150,when:'17 Nov',by:'System'}],
 ann:[{id:'a1',title:'Check-in opens at 9:00 AM',cat:'Logistics',body:'Keep your QR code ready. Doors open an hour before the opening session.',date:'17 Nov',status:'Published'},
  {id:'a2',title:'Daily Challenge is live',cat:'Games',body:'Five questions, twenty seconds each. Fast answers and long combos earn bonus points.',date:'16 Nov',status:'Published'},
  {id:'a3',title:'Meet the hosts of the evening show',cat:'Event',body:'Two colleagues step up as hosts. Send them your best questions.',date:'14 Nov',status:'Published'},
  {id:'a4',title:'Feedback survey opens after the event',cat:'People',body:'Tell us what worked and what did not. It takes three minutes.',date:'12 Nov',status:'Draft'},
  {id:'a5',title:'Shuttle schedule from Marathahalli',cat:'Logistics',body:'Shuttles run every 20 minutes from 8:30 AM. Pickup points appear here soon.',date:'11 Nov',status:'Published'}],
 d:{quizzes:[{title:'Daily Challenge: Retail Trivia',type:'Daily',n:5,status:'Published'},{title:'Know the Celebration',type:'Standard',n:5,status:'Published'},{title:'Live quiz: Know Your Impact',type:'Live',n:10,status:'Draft'},{title:'Know Your Teams',type:'Standard',n:8,status:'Draft'}],
  submissions:[{id:1,game:'Meme Challenge',by:'Rohan Gupta',text:'When the sprint ends on a Friday',status:'Pending'},{id:2,game:'Hidden Talent',by:'Kavya Shetty',text:'Classical dance, 90 seconds',status:'Approved'},{id:3,game:'Meme Challenge',by:'Harsh Patel',text:'Me waiting for the lunch queue',status:'Pending'},{id:4,game:'Hidden Talent',by:'Tanvi Desai',text:'Beatboxing and a poem',status:'Pending'},{id:5,game:'Meme Challenge',by:'Faisal Ahmed',text:'Dashboard refresh at 5:59 PM',status:'Rejected'}],
  gallery:[{title:'Team offsite 2024',type:'Photo',by:'Marketing',status:'Published'},{title:'Founders story, 2015',type:'Memory',by:'Marketing',status:'Published'},{title:'Product launch reel',type:'Video',by:'Marketing',status:'Published'},{title:'My desk then and now',type:'Photo',by:'Meera Joshi',status:'Pending'},{title:'Hackathon night',type:'Photo',by:'Vikram Singh',status:'Pending'}]},
 cin:[{n:'Divya Menon',t:'08:52'},{n:'Arjun Reddy',t:'08:49'},{n:'Neha Kapoor',t:'08:44'}],
 feed:['Meera Joshi lit 15 cells','Karthik Iyer lit 31 cells','Engineering passed 6,000 points'],
 ap:'dashboard',role:'Super Admin',q:'',modal:null,freeze:false,live:'welcome',lq:0,reveal:false,auto:false,push:true,seen:['Early Bird','Top 10'],run:null,g:null,lvlup:null};
}
function load(){try{const raw=localStorage.getItem(STORE);if(!raw)return null;const o=JSON.parse(raw);if(!o||!o.emp)return null;return Object.assign(fresh(),o,{run:null,g:null,ov:null,modal:null,lvlup:null})}catch(e){return null}}
function save(){try{const {run,g,ov,modal,lvlup,...rest}=S;localStorage.setItem(STORE,JSON.stringify(rest))}catch(e){}}
S=load()||fresh();
const hashMode={employee:'emp',admin:'adm',stage:'live'};
if(hashMode[location.hash.slice(1)])S.mode=hashMode[location.hash.slice(1)];

const ME=()=>S.emp[6];
const sorted=()=>[...S.emp].sort((a,b)=>b.pts-a.pts);
const rankOf=(e=ME())=>sorted().indexOf(e)+1;
const levelOf=p=>Math.min(11,Math.floor(p/LEVEL_STEP)+1);
const levelProg=p=>{const l=levelOf(p);if(l>=11)return 1;return (p-(l-1)*LEVEL_STEP)/LEVEL_STEP};
const toNext=p=>levelOf(p)>=11?0:levelOf(p)*LEVEL_STEP-p;
const yearOf=l=>JOURNEY[l-1];
const questDone=id=>({daily:!!S.quizDone.daily,vote:S.vote>=0,game:Object.keys(S.gameDone).length>0,read:S.readTaps>=2,drop:S.drop!==null,checkin:S.checked})[id];
const earned=()=>BADGES.filter(b=>b[3]()).map(b=>b[0]);
const deptTotals=()=>{const t={};DEPTS.forEach(d=>t[d]=0);S.emp.forEach(e=>t[e.dept]+=e.pts);return Object.entries(t).sort((a,b)=>b[1]-a[1])};

/* ---------- feedback: toast, point pop, confetti, haptics ---------- */
let LAST={x:innerWidth/2,y:innerHeight/2};
function toast(m,icon){const t=$('#toast');t.innerHTML=(icon?ic(icon,18):'')+`<span>${esc(m)}</span>`;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2800)}
function pop(text){const el=document.createElement('div');el.className='pop';el.textContent=text;el.style.left=LAST.x+'px';el.style.top=(LAST.y-24)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),1300);try{navigator.vibrate&&navigator.vibrate(18)}catch(e){}}
function confetti(n=150){if(RM.matches)return;const cv=document.createElement('canvas');cv.className='confetti';document.body.appendChild(cv);const dpr=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
 const cs=getComputedStyle(document.documentElement),cols=['#264CD7','#264CD7','#B3C9F7',cs.getPropertyValue('--fg').trim()||'#1C1B1B','#FF6F1C'];
 const ox=LAST.x,oy=LAST.y;const ps=Array.from({length:n},()=>({x:ox,y:oy,vx:(Math.random()-.5)*14,vy:-Math.random()*15-4,s:5+Math.random()*7,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[Math.floor(Math.random()*cols.length)]}));
 const t0=performance.now();(function f(t){const k=(t-t0)/1000;c.clearRect(0,0,innerWidth,innerHeight);ps.forEach(p=>{p.vy+=.45;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.globalAlpha=Math.max(0,1-k/2.4);c.fillStyle=p.c;c.fillRect(-p.s/2,-p.s/2,p.s,p.s);c.restore()});if(k<2.4)requestAnimationFrame(f);else cv.remove()})(t0)}

/* ---------- the Impact Grid ---------- */
const MASK=(()=>{const m=new Uint8Array(GRID.total),ch=[...GRID.msg];const w=ch.reduce((s,c)=>s+GLYPH[c][0].length,0)+ch.length-1;let x=Math.floor((GRID.cols-w)/2);
 for(const c of ch){const g=GLYPH[c];for(let r=0;r<7;r++)for(let k=0;k<g[r].length;k++)if(g[r][k]==='#')m[(r+2)*GRID.cols+x+k]=1;x+=g[0].length+1}return m})();
const RANK=(()=>{const r=seeded(11),a=[...Array(GRID.total).keys()];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}const pos=new Uint16Array(GRID.total);a.forEach((c,i)=>pos[c]=i);return pos})();
let FLASH=[];/* {from,to,t} */
function addCells(k){const from=S.cells;S.cells=Math.min(GRID.total,S.cells+k);if(S.cells>from){FLASH.push({from,to:S.cells,t:performance.now()});animateGrids()}}
function drawGrid(cv){
 const W=cv.clientWidth;if(!W)return;const tone=cv.dataset.tone,dpr=Math.min(2,devicePixelRatio||1);
 const gap=W>700?2:1,cell=(W-gap*(GRID.cols-1))/GRID.cols,H=cell*GRID.rows+gap*(GRID.rows-1);
 if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}cv.style.height=H+'px';
 const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const cs=getComputedStyle(document.documentElement);
 const off=tone==='blue'?'rgba(255,255,255,.13)':cs.getPropertyValue('--cell-off').trim(),fill=tone==='blue'?'rgba(255,255,255,.42)':cs.getPropertyValue('--cell-fill').trim(),msg=tone==='blue'?'#FFFFFF':cs.getPropertyValue('--cell-msg').trim();
 const now=performance.now();
 for(let i=0;i<GRID.total;i++){const x=(i%GRID.cols)*(cell+gap),y=Math.floor(i/GRID.cols)*(cell+gap),p=RANK[i],lit=p<S.cells;
  c.fillStyle=lit?(MASK[i]?msg:fill):off;c.fillRect(x,y,cell,cell);
  if(lit)for(const f of FLASH)if(p>=f.from&&p<f.to){const a=1-(now-f.t)/1600;if(a>0){c.globalAlpha=a;c.fillStyle='#FF6F1C';c.fillRect(x-cell*.15*a,y-cell*.15*a,cell*(1+.3*a),cell*(1+.3*a));c.globalAlpha=1}}}
}
function paintGrids(){$$('canvas[data-grid]').forEach(drawGrid);const pct=Math.round(S.cells/GRID.total*100);
 $$('[data-g="count"]').forEach(e=>e.textContent=fmt(S.cells));$$('[data-g="pct"]').forEach(e=>e.textContent=pct+'%');$$('[data-g="bar"]').forEach(e=>e.style.width=pct+'%');
 $$('[data-g="mine"]').forEach(e=>e.textContent=fmt(S.myCells));$$('[data-g="left"]').forEach(e=>e.textContent=fmt(GRID.total-S.cells));$$('[data-g="ticker"]').forEach(e=>e.textContent=S.feed[0])}
let gridRAF=0;
function animateGrids(){if(gridRAF)return;const step=()=>{const now=performance.now();FLASH=FLASH.filter(f=>now-f.t<1600);paintGrids();gridRAF=FLASH.length?requestAnimationFrame(step):0};gridRAF=requestAnimationFrame(step)}
addEventListener('resize',()=>paintGrids());

/* ---------- points ---------- */
function award(pts,label,who=ME(),by='System'){
 if(pts<=0)return;const isMe=who===ME(),lv0=levelOf(who.pts);who.pts+=pts;
 S.ledger.unshift({who:who.name,label,pts,when:'Just now',by});
 const k=Math.max(1,Math.floor(pts/10));addCells(k);
 if(isMe){S.myCells+=k;S.hist.unshift({t:label,d:'Just now',p:pts});pop('+'+pts);if(levelOf(who.pts)>lv0)S.lvlup=levelOf(who.pts)}
 S.feed.unshift(`${who.name} lit ${k} ${k>1?'cells':'cell'}`);S.feed.length=Math.min(S.feed.length,12)}

/* ambient activity from colleagues */
setInterval(()=>{if(S.freeze||document.hidden)return;const r=Math.random;const e=S.emp[Math.floor(r()*S.emp.length)];if(e===ME())return;const n=10+Math.floor(r()*5)*10;e.pts+=n;const k=n/10;addCells(k);S.feed.unshift(`${e.name} lit ${k} ${k>1?'cells':'cell'}`);S.feed.length=12;paintGrids()},4200);

/* ---------- countdown ---------- */
const TARGET=new Date(EVENT.starts).getTime();
function tickCd(){const d=Math.max(0,TARGET-Date.now()),v={d:Math.floor(d/864e5),h:Math.floor(d%864e5/36e5),m:Math.floor(d%36e5/6e4),s:Math.floor(d%6e4/1e3)};for(const k in v)$$('[data-cd="'+k+'"]').forEach(el=>el.textContent=String(v[k]).padStart(2,'0'))}
setInterval(tickCd,1000);
const cdHTML=cls=>`<div class="${cls}" role="timer" aria-label="Countdown to the event">${[['d','Days'],['h','Hours'],['m','Min'],['s','Sec']].map(a=>`<div class="glass"><b class="tn" data-cd="${a[0]}">--</b><span>${a[1]}</span></div>`).join('')}</div>`;

function qr(seed){const r=seeded(seed);let o='';
 for(let y=0;y<25;y++)for(let x=0;x<25;x++){if((x<8&&y<8)||(x>16&&y<8)||(x<8&&y>16))continue;if(r()>.52)o+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}
 const f=(x,y)=>`<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3"/>`;
 return `<svg viewBox="0 0 25 25" fill="#1C1B1B" shape-rendering="crispEdges" role="img" aria-label="Sample QR code">${o}${f(0,0)}${f(18,0)}${f(0,18)}</svg>`}
const ring=(p,size=76,sw=6)=>{const r=(size-sw)/2,c=2*Math.PI*r;return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--blue)" stroke-width="${sw}" stroke-linecap="butt" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p)}"/></svg>`};
