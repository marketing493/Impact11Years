/* ---------- helpers ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P={home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',calendar:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',clock:'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
pin:'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',bell:'M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4',check:'M5 12.5l4.5 4.5L19 7.5',
plus:'M12 5v14M5 12h14',edit:'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',chev:'M9 5l7 7-7 7',down:'M5 9l7 7 7-7',
star:'M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z',users:'M9 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20a7 7 0 0114 0M16 5.5a3.5 3.5 0 010 7M18 20h4a6 6 0 00-4-5.6',
mic:'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3',cup:'M4 8h13v5a6 6 0 01-6 6h-1a6 6 0 01-6-6zM17 10h1.5a2.5 2.5 0 010 5H17M8 3v2M12 3v2',
spark:'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',music:'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z',
share:'M12 3v12M7 8l5-5 5 5M5 13v7h14v-7',download:'M12 3v12M7 10l5 5 5-5M5 19h14',logout:'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',addbox:'M4 4h16v16H4zM12 8v8M8 12h8',phone:'M7 2h10v20H7zM11 18h2',map:'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
ripple:'M12 12h.01M8 12a4 4 0 018 0M5 12a7 7 0 0114 0',type:'M4 6V4h16v2M12 4v16M9 20h6',brush:'M4 20c2 0 4-1 4-3a2 2 0 00-4 0M9 15l10-10a1.4 1.4 0 00-2-2L7 13',
lock:'M6 11h12v9H6zM8 11V8a4 4 0 118 0v3',out:'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',arrow:'M5 12h14M13 6l6 6-6 6',ics:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15h6M12 12v6',x:'M6 6l12 12M18 6L6 18',prev2:'M15 5l-7 7 7 7'};
const ic=(n,s=20,sw=1.6)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]||P.star}"/></svg>`;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),3200)}
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* time */
const startMs=a=>Date.parse(`${a.date}T${a.start}:00${OFFSET}`), endMs=a=>Date.parse(`${a.date}T${a.end}:00${OFFSET}`);
const fmtDay=a=>new Date(startMs(a)).toLocaleDateString('en-IN',{timeZone:TZ,weekday:'long',day:'numeric',month:'long'});
const fmtDayShort=a=>new Date(startMs(a)).toLocaleDateString('en-IN',{timeZone:TZ,weekday:'short',day:'numeric',month:'short'});
const mins=a=>Math.round((endMs(a)-startMs(a))/6e4);
const dur=a=>{const m=mins(a);return m>=60?`${Math.floor(m/60)} h${m%60?' '+m%60+' min':''}`:`${m} min`};
function rel(ms){const d=ms-Date.now();if(d<=0)return 'now';const m=Math.round(d/6e4);if(m<60)return `in ${m} min`;const h=Math.floor(m/60);if(h<24)return `in ${h} h ${m%60} min`;const days=Math.round(d/864e5);return `in ${days} ${days===1?'day':'days'}`}
const statusOf=a=>{const n=Date.now();return n>=endMs(a)?'past':n>=startMs(a)?'now':'next'};
const catIcon=c=>(CATEGORIES.find(x=>x[0]===c)||CATEGORIES[5])[1];

/* ---------- state ---------- */
const S={route:'home',sub:'about',acts:[],server:false,cfg:{},zone:'Main hall',gridMode:'countdown',
 admin:{key:'',authed:false,stats:null,modal:null,del:null,flash:null},
 pwa:{prompt:null,standalone:matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,ios:/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),on:store.get('ia11-reminders',false),mode:null}};
const sortActs=l=>[...l].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
const upcoming=()=>S.acts.filter(a=>endMs(a)>Date.now());

async function loadData(){
 try{const c=await fetch('/api/config',{cache:'no-store'});if(!c.ok)throw 0;S.cfg=await c.json();S.server=true}catch(e){S.server=false;S.cfg={}}
 /* the page may already be on screen: show Google sign-in now that we know whether it is set up */
 if(S.cfg.locked&&!S.user){try{const a=await fetch('/api/auth',{cache:'no-store',credentials:'same-origin'});if(a.ok){const u=await a.json();S.user={name:u.name,email:u.email};store.set('ia11-user',S.user);if(typeof applyPassenger==='function')applyPassenger()}}catch(e){}}
 if(S.user&&typeof loadPass==='function')loadPass();
 if(typeof mountSignin==='function'&&document.getElementById('gsignin'))mountSignin();
 if(S.server){try{const r=await fetch('/api/activities',{cache:'no-store'});const j=await r.json();S.acts=sortActs(j.activities||[])}catch(e){S.acts=sortActs(DEFAULT_ACTIVITIES)}}
 else S.acts=sortActs(store.get('ia11-acts',DEFAULT_ACTIVITIES))}

/* ---------- shared pieces ---------- */
function actRow(a){const st=statusOf(a);return `<div class="act ${st}"><div class="t tn">${a.start}<small>${dur(a)}</small></div>
 <div style="min-width:0"><h4>${esc(a.title)}</h4>${a.description?`<p class="d">${esc(a.description)}</p>`:''}<div class="tags"><span class="pill p-gray">${ic('pin',12)}${esc(a.location)}</span><span class="pill p-blue">${ic(catIcon(a.category),12)}${esc(a.category)}</span>${st==='now'?'<span class="pill p-orange p-live">Happening now</span>':''}</div></div>
 <div class="acts">${st==='past'?'<span class="xs muted">Ended</span>':`<button class="icon-btn" data-act="ics" data-arg="${esc(a.id)}" aria-label="Add ${esc(a.title)} to your calendar" title="Add to calendar">${ic('ics',18)}</button>`}</div></div>`}
function groupByDay(list){const g=[];for(const a of list){const k=a.date;let last=g[g.length-1];if(!last||last.k!==k)g.push(last={k,items:[]});last.items.push(a)}return g}
function actList(list){if(!list.length)return `<div class="empty card">${ic('calendar',28)}<p style="margin-top:8px">No upcoming sessions. Thank you for celebrating with us.</p></div>`;
 return groupByDay(list).map(g=>`<div class="daygroup"><div class="dayhead"><b>${fmtDay(g.items[0])}</b><span class="xs muted">${g.items.length} ${g.items.length===1?'session':'sessions'}, all times IST</span></div>${g.items.map(actRow).join('')}</div>`).join('')}

/* 3D venue plan */
function venueScene(explore){const z=S.zone;
 return `<div class="scene ${explore?'ex':''}" ${explore?'data-explore':'data-scene'}><div class="plane"><div class="floor"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="route draw" d="${ROUTES[z]||''}"/></svg></div>
 ${ZONES.map(zz=>`<button class="zone ${zz.id===z?'on':z?'dim':''}" data-act="zone" data-arg="${esc(zz.id)}" aria-pressed="${zz.id===z}" aria-label="${esc(zz.id)}: ${esc(zz.note)}" style="left:${zz.x}%;top:${zz.y}%;width:${zz.w}%;height:${zz.h}%;--h0:${zz.h0}px;--h:${zz.h0}px;--top:${zz.top}"><span class="s"></span><span class="e"></span><span class="f"><span>${esc(zz.id)}<small>${esc(zz.note)}</small></span></span></button>`).join('')}
 <div class="pin" style="left:13%;top:81%;--pz:22px"><div class="p"><svg width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.3 0 0 6.1 0 13.7 0 24 14 40 14 40s14-16 14-26.3C28 6.1 21.7 0 14 0z" fill="#FF6F1C"/><circle cx="14" cy="13.5" r="5.5" fill="#fff"/></svg></div></div></div></div>`}
function zoneCard(){const z=ZONES.find(x=>x.id===S.zone)||ZONES[1],list=S.acts.filter(a=>a.location===z.id&&endMs(a)>Date.now());
 return `<div class="glass zonecard" aria-live="polite"><p class="eyebrow" style="opacity:.7">${esc(z.note)}</p><h3>${esc(z.id)}</h3>${list.length?`<ul>${list.slice(0,4).map(a=>`<li><b>${a.start}</b><span>${esc(a.title)}</span></li>`).join('')}${list.length>4?`<li><b></b><span style="opacity:.7">and ${list.length-4} more</span></li>`:''}</ul>`:'<p class="sm" style="opacity:.75;margin-top:8px">No upcoming sessions here.</p>'}</div>`}
function mountScenes(){$$('[data-scene]').forEach(sc=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const pl=sc.querySelector('.plane');
 sc.addEventListener('pointermove',e=>{const r=sc.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pl.style.setProperty('--rz',(-38+x*14)+'deg');pl.style.setProperty('--rx',(56-y*10)+'deg')});
 sc.addEventListener('pointerleave',()=>{pl.style.removeProperty('--rz');pl.style.removeProperty('--rx')})})}

/* ---------- home ---------- */
const HERO_FL=[['ftag',46,17,0,.9,'<b>800+</b> people'],['ftag',66,9,0,.6,'<b>11</b> years'],['ftag',78,22,0,1.1,'<b>1</b> day to celebrate'],['glass',60,8,64,.7],['glass',90,34,38,1.2],['glass',4,30,46,.5],['cells',48,84,26,1],['sky',94,80,14,.8],['hot',30,10,10,1.3],['line',22,88,30,.6],['solid',66,90,9,1],['line',52,26,18,.9]];
function ticket(a,i){const st=statusOf(a),lead=i===0;return `<article class="ticket ${lead?'lead bluefield':''}" data-tilt data-rv style="--i:${i}"><div class="row"><span class="pill ${lead?'p-glass':'p-blue'}">${ic(catIcon(a.category),13)} ${esc(a.category)}</span><span class="grow"></span><span class="xs ${lead?'':'muted'}" data-rel="${st==='now'?endMs(a):startMs(a)}">${st==='now'?'Happening now':rel(startMs(a))}</span></div>
 <div class="tt tn">${a.start}<small>${dur(a)}</small></div><h3>${esc(a.title)}</h3>${a.description?`<p class="sm muted">${esc(a.description)}</p>`:''}<div class="perf"></div>
 <div class="foot"><span class="pill p-gray">${ic('pin',12)} ${esc(a.location)}</span><span class="xs ${lead?'':'muted'} grow">${fmtDayShort(a)}</span><button class="icon-btn" data-act="ics" data-arg="${esc(a.id)}" aria-label="Add ${esc(a.title)} to your calendar" title="Add to calendar">${ic('ics',18)}</button></div></article>`}
const marquee=()=>{const w=['Every Moment','Every Connection','Every Impact','Eleven Years','One Team'];const run=w.map(x=>`<span>${x}</span>`).join('');return `<div class="marquee" aria-hidden="true"><div class="track">${run}${run}</div></div>`};
function vHome(){const nx=upcoming()[0],st=nx&&statusOf(nx),modeBtn=(m,label,i)=>`<button class="chip" data-act="gmode" data-arg="${m}" aria-pressed="${S.gridMode===m}">${ic(i,14)} ${label}</button>`,up=upcoming();
 const words=['11','Years','<br>','of','<em>Impact</em>'];let wi=0;
 return `<section class="hero bluefield" data-spot data-acc style="--acc:${ACC.yellow}"><span class="big11" aria-hidden="true">11</span><div class="spot"></div>${floaters(HERO_FL)}${sprinkle(11,16,[2,98,4,96])}<div class="wrap">
 <div class="meta"><span class="eyebrow">${EVENT.dateLong}</span><span class="pill p-glass">${ic('pin',13)}${EVENT.area}</span></div>
 <div class="hero-split"><h1 aria-label="11 Years of Impact">${words.map(w=>w==='<br>'?'<br>':`<span class="sw" style="--i:${wi++}">${w}</span> `).join('')}</h1><p class="tag sw" style="--i:5">${EVENT.tagline}</p></div>
 <div class="stage glass ${S.gridMode==='draw'?'draw':''} sw" style="--i:6"><canvas id="igrid" aria-hidden="true"></canvas><p class="vh" id="cd-sr" aria-live="off"></p></div>
 <div class="stagebar"><div class="chips on-blue" role="group" aria-label="Grid mode">${modeBtn('countdown','Countdown','clock')}${modeBtn('message','Message','type')}${modeBtn('draw','Draw','brush')}${S.gridMode==='draw'?`<button class="chip" data-act="gclear">${ic('x',14)} Clear</button>`:''}</div>
 <p class="hint">${ic('ripple',16)}<span>${S.gridMode==='draw'?'Drag across the grid to light your own cells.':'Move across the grid. Tap it to send a ripple.'}</span></p></div>
 <div class="row wrapx" style="justify-content:space-between;gap:18px"><div class="ctas"><a class="btn glassy" href="#reminders" data-magnet>${ic('bell',18)} Get reminders</a></div><a class="scrollcue" href="#story" style="color:#fff;text-decoration:none"><span></span>Our story</a></div>
 </div></section>
 ${nx?`<div class="wrap nextup"><div class="card" data-rv><div class="when tn">${nx.start}</div><div style="min-width:0"><p class="eyebrow muted">${st==='now'?'Happening now':'Next up'}, ${fmtDayShort(nx)}</p><h3>${esc(nx.title)}</h3><p class="sm muted" style="margin-top:4px">${ic('pin',13)} ${esc(nx.location)}, ${EVENT.venue}</p></div><div class="in"><span class="xs muted">${st==='now'?'Ends':'Starts'}</span><b data-rel="${st==='now'?endMs(nx):startMs(nx)}">${rel(st==='now'?endMs(nx):startMs(nx))}</b></div></div></div>`:''}
 <div style="margin-top:56px">${marquee()}</div>
 ${storySection()}
 <section class="band" data-acc style="--acc:${ACC.green}">${sprinkle(23,14)}<div class="wrap"><div class="shead"><div data-rv><p class="eyebrow muted">The programme</p><h2>Coming <em>up</em></h2></div><div class="row" data-rv style="--i:1"><p class="muted grow" style="max-width:38ch">Eleven hours of stage moments, food, games and music. Drag to explore, tap the calendar icon to save a session.</p><div class="tnav"><button class="icon-btn" data-act="tscroll" data-arg="-1" aria-label="Scroll back">${ic('prev2',18)}</button><button class="icon-btn" data-act="tscroll" data-arg="1" aria-label="Scroll forward">${ic('chev',18)}</button></div></div></div>
 ${up.length?`<div class="tickets" data-drag id="tickets">${up.slice(0,8).map(ticket).join('')}</div>`:actList([])}</div></section>
 ${venueBand()}
 ${remindBand()}`}

function venueBand(){return `<section class="band inkfield venue" id="venue" data-acc style="--acc:${ACC.yellow}">${S.skin==='royal'?royalDrapes():''}${sprinkle(37,14)}${floaters([['line',6,10,40,.6],['sky',46,6,10,1],['glass',92,12,52,.8],['cells',40,92,22,1.1],['hot',96,70,8,1.2]])}<div class="wrap venue-grid" style="position:relative;z-index:2">
 <div class="col" style="gap:20px" data-rv><p class="eyebrow" style="opacity:.7">The venue</p><h2>Hilton Embassy <em>TechVillage</em></h2> <div class="facts"><div class="glass"><span>Date</span><b>17 Dec</b></div><div class="glass"><span>Doors open</span><b class="tn">10:00 AM</b></div><div class="glass"><span>First session</span><b class="tn">11:00 AM</b></div><div class="glass"><span>Shuttles</span><b>Every 20 min</b></div></div>
 <div class="ctas"><a class="btn" href="${EVENT.maps}" target="_blank" rel="noopener">${ic('pin',18)} Get directions</a></div></div>
 <div class="col" style="gap:14px" data-rv style="--i:1">${venueScene()}${S.skin==='royal'?'':zoneCard()}<p class="xs" style="opacity:.55">Illustrative layout. Follow the signs on the day.</p></div></div></section>`}

function remindBand(){const p=S.pwa,ns=notifyStatus(),canNotify=ns==='ok',perm=canNotify?Notification.permission:'unsupported',on=p.on&&perm==='granted';
 const s1done=p.standalone;
 let s1=s1done?`<span class="pill p-blue">${ic('check',13)} Added to your home screen</span>`:p.prompt?`<button class="btn" data-act="install">${ic('addbox',18)} Add to home screen</button>`:`<button class="btn" data-act="howInstall">${ic('addbox',18)} Add to home screen</button>`;
 let s2;if(on)s2=`<div class="row wrapx"><span class="pill p-blue">${ic('check',13)} Reminders are on</span><button class="btn ghost sm" data-act="testnotif">Send a test</button><button class="btn ghost sm" data-act="remoff">Turn off</button></div>`;
 else if(ns==='ios-install')s2=`<button class="btn" data-act="howRemind">${ic('bell',18)} Turn on reminders</button>`;
 else if(ns==='ios-update')s2=`<p class="sm muted">${NOTIFY_HELP['ios-update']}</p>`;
 else if(!canNotify)s2=`<p class="sm muted">${NOTIFY_HELP.unsupported}</p>`;
 else if(perm==='denied')s2=`<p class="sm muted">Notifications are blocked for this site. Allow them in your browser or phone settings, then come back.</p>`;
 else s2=`<button class="btn" data-act="remon">${ic('bell',18)} Turn on reminders</button>`;
 const nx=upcoming().find(a=>statusOf(a)==='next');
 return `<section class="band" id="reminders" data-acc style="--acc:${ACC.purple}">${sprinkle(41,14)}<div class="wrap remind">
 <div class="lock" data-rv data-tilt><div class="scr bluefield"><div class="clock tn">${nx?shift(nx.start,-LEAD_MIN):'10:20'}</div><div class="date">${nx?fmtDay(nx):EVENT.dateLong}</div><div style="flex:1"></div>
 <div class="notif glass"><img src="${ICON}" alt=""><div><div class="app"><span>IMPACT EVENTS</span><span>now</span></div><b>Starting in 10 minutes</b><p>${esc(nx?nx.title:'Keynote: 11 Years of Impact')}, ${esc(nx?nx.location:'Main hall')} at ${nx?nx.start:'11:00'}</p></div></div></div></div>
 <div class="col" style="gap:22px"><div><p class="eyebrow muted">Never miss a session</p><h2 style="font-size:clamp(38px,5vw,60px);line-height:1">Your phone <em>taps</em> you on the shoulder</h2><p class="muted" style="margin-top:12px;max-width:48ch">Pin the app to your home screen and turn on reminders. You get a notification 10 minutes before every session starts.</p></div>
 <div class="steps" data-rv style="--i:1"><div class="step ${s1done?'done':''}"><span class="n">${s1done?ic('check',20,2):'1'}</span><div><h3>Pin the app</h3><p>It opens full screen, like any other app.</p>${s1}</div></div>
 <div class="step ${on?'done':''}"><span class="n">${on?ic('check',20,2):'2'}</span><div><h3>Turn on reminders</h3><p>One alert, 10 minutes before each session. Nothing else.</p>${s2}</div></div></div></div></div></section>`}
const shift=(hhmm,m)=>{const [h,mm]=hhmm.split(':').map(Number),t=h*60+mm+m;return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`};

/* ---------- event pages ---------- */
const SUBS=[['about','About'],['journey','Journey'],['schedule','Schedule'],['venue','Venue'],['activities','Activities'],['faqs','FAQs']];
function vEvent(){const s=S.sub,body={about:eAbout,journey:eJourney,schedule:eSchedule,venue:eVenue,activities:eActivities,faqs:eFaq}[s]();
 const title={about:'Eleven years, <em>one</em> team',journey:'The <em>journey</em>',schedule:'The <em>schedule</em>',venue:'The <em>venue</em>',activities:'The <em>activities</em>',faqs:'Frequently Asked Questions'}[s];
 const acc=ACC[{about:'yellow',journey:'purple',schedule:'green',venue:'yellow',activities:'purple',faqs:'green'}[s]];
 return `<section class="ehead bluefield ${s==='faqs'?'small':''}" data-acc style="--acc:${acc}">${S.skin==='royal'?royalDrapes(false):''}${sprinkle(50+s.length,12)}${floaters([['glass',78,18,70,.8],['line',90,64,34,1.1],['sky',66,70,12,1.3],['cells',58,22,24,.9],['hot',96,30,9,1.4]])}<div class="wrap"><p class="eyebrow" style="opacity:.85">${EVENT.name}, ${EVENT.dateLong}</p><h1 style="margin-top:10px">${title}</h1>
 ${subnav(s)}</div></section>${body}`}
function eJourney(){return journeySection()+`<section class="band tight"><div class="wrap row wrapx"><p class="muted grow" style="max-width:60ch">Sample milestones for this version. The team replaces them with the official story.</p></div></section>`}
function eActivities(){const by=CATEGORIES.map(c=>[c,S.acts.filter(a=>a.category===c[0])]).filter(x=>x[1].length);
 return `<section class="band" data-acc style="--acc:${ACC.purple}">${sprinkle(73,12)}<div class="wrap">${by.map(([c,l])=>`<div style="margin-bottom:36px"><div class="row" style="margin-bottom:14px"><span class="pill p-blue">${ic(c[1],14)} ${c[0]}</span><span class="xs muted">${l.length} ${l.length===1?'activity':'activities'}</span></div><div class="cats">${l.map((a,i)=>`<article class="acard" data-tilt data-rv style="--i:${i}"><div class="row"><span class="ic">${ic(c[1],20)}</span><span class="grow"></span>${statusOf(a)==='now'?'<span class="pill p-orange p-live">Now</span>':statusOf(a)==='past'?'<span class="pill p-gray">Ended</span>':''}</div><span class="when tn">${a.start} to ${a.end}</span><h3>${esc(a.title)}</h3><p class="sm muted">${esc(a.description)}</p><span class="xs muted">${ic('pin',12)} ${esc(a.location)}, ${fmtDayShort(a)}</span></article>`).join('')}</div></div>`).join('')||'<div class="empty card">Activities are coming soon.</div>'}</div></section>`}
function eFaq(){return `<section class="band" data-acc style="--acc:${ACC.green}">${sprinkle(71,10)}<div class="wrap"><div class="faq">${FAQ.map((f,i)=>`<details ${i===0?'open':''} data-rv style="--i:${i}"><summary>${f[0]}${ic('plus',20)}</summary><p>${f[1]}</p></details>`).join('')}</div></div></section>`}

/* ---------- calendar file ---------- */
function ics(id){const a=S.acts.find(x=>x.id===id);if(!a)return;const z=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const txt=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//11 Years of Impact//EN','BEGIN:VEVENT',`UID:${a.id}-${a.date}@impact-events`,`DTSTAMP:${z(Date.now())}`,`DTSTART:${z(startMs(a))}`,`DTEND:${z(endMs(a))}`,`SUMMARY:${a.title.replace(/[,;]/g,' ')}`,`LOCATION:${a.location}, ${EVENT.venue}, ${EVENT.area}`.replace(/;/g,' '),`DESCRIPTION:${(a.description||'').replace(/[,;\n]/g,' ')}`,'BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:Starting in 10 minutes','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const url=URL.createObjectURL(new Blob([txt],{type:'text/calendar'})),el=document.createElement('a');el.href=url;el.download=a.title.replace(/[^\w]+/g,'-').toLowerCase()+'.ics';document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Calendar file ready. Open it to add the session.')}
