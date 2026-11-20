/* ---------- interactive event pages: The event (About), Schedule, Venue ---------- */
Object.assign(P,{sun:'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',help:'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 1.9c-.9.6-1.5 1-1.5 2M12 17h.01',
 route:'M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM6 15V9a4 4 0 014-4h2M18 9v6a4 4 0 01-4 4h-2',
 rotate:'M20 12a8 8 0 11-2.3-5.6M20 4v5h-5',cube:'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',top:'M4 4h16v16H4zM4 12h16M12 4v16',
 copy:'M9 9h11v11H9zM5 15H4V4h11v1',heart:'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',link:'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
 bus:'M5 16V6a3 3 0 013-3h8a3 3 0 013 3v10M5 11h14M7 16v3M17 16v3M5 16h14M8 13.5h.01M16 13.5h.01',qr:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',flag:'M5 21V4M5 4h12l-2 4 2 4H5'});
const SUB_IC={about:'star',journey:'map',schedule:'clock',venue:'pin',activities:'spark',faqs:'help'};
const toMin=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const fmtMin=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const istNowMin=()=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return +p.find(x=>x.type==='hour').value*60+ +p.find(x=>x.type==='minute').value};
const istToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ}).format(new Date());
S.plan=new Set(store.get('ia11-plan',[]));S.schedCat='All';S.openAct=null;S.view={rx:56,rz:-38};S.spin=false;
const inPlan=id=>S.plan.has(id);

/* sliding pill under the section tabs */
function subnav(s){return `<nav class="subnav" aria-label="Event sections"><span class="ind" aria-hidden="true"></span>${SUBS.map(x=>`<a class="sn" href="#event-${x[0]}" ${x[0]===s?'aria-current="page"':''}>${ic(SUB_IC[x[0]],16)}<span>${x[1]}</span></a>`).join('')}</nav>`}
let SUB_PREV=null;
function mountSubnav(){const nav=$('.subnav');if(!nav)return;const a=nav.querySelector('[aria-current]'),ind=nav.querySelector('.ind');if(!a)return;
 const to={l:a.offsetLeft,w:a.offsetWidth};
 if(SUB_PREV&&!RMQ.matches){ind.style.transition='none';ind.style.left=SUB_PREV.l+'px';ind.style.width=SUB_PREV.w+'px';ind.offsetWidth;ind.style.transition=''}
 ind.style.left=to.l+'px';ind.style.width=to.w+'px';SUB_PREV=to;
 if(nav.scrollWidth>nav.clientWidth)nav.scrollTo({left:a.offsetLeft-nav.clientWidth/2+a.offsetWidth/2,behavior:RMQ.matches?'auto':'smooth'})}

/* day at a glance: every session placed on a time axis, in lanes when they overlap */
function ribbon(list,opts={}){const d0=(list.find(a=>endMs(a)>Date.now())||list[0]);if(!d0)return '';const day=list.filter(a=>a.date===d0.date);
 const s=Math.floor(Math.min(...day.map(a=>toMin(a.start)))/60)*60,e=Math.ceil(Math.max(...day.map(a=>toMin(a.end)))/60)*60,span=e-s;
 const lanes=[];const placed=[...day].sort((a,b)=>toMin(a.start)-toMin(b.start)).map(a=>{let l=lanes.findIndex(end=>end<=toMin(a.start));if(l<0){l=lanes.length;lanes.push(0)}lanes[l]=toMin(a.end);return [a,l]});
 const pct=m=>((m-s)/span*100).toFixed(3);
 const hours=[];for(let m=s;m<=e;m+=60)hours.push(`<span style="left:${pct(m)}%">${fmtMin(m)}</span>`);
 return `<div class="ribbon" data-ribbon data-start="${s}" data-span="${span}" data-date="${d0.date}" style="--lanes:${lanes.length}">
 <div class="rb-track">${placed.map(([a,l])=>{const st=statusOf(a);return `<button class="rb-b ${st} ${inPlan(a.id)?'star':''} ${opts.sel===a.id?'sel':''}" style="left:${pct(toMin(a.start))}%;width:calc(${pct(toMin(a.end))}% - ${pct(toMin(a.start))}% - 3px);--lane:${l}" data-act="openAct" data-arg="${esc(a.id)}" aria-label="${a.start} ${esc(a.title)}, ${esc(a.location)}"><span class="rb-ic">${ic(catIcon(a.category),14)}</span><span class="rb-t">${esc(a.title)}</span><span class="rb-tip"><b>${a.start} to ${a.end}</b>${esc(a.title)}<em>${esc(a.location)}</em></span></button>`}).join('')}<i class="rb-now" hidden><b>Now</b></i></div>
 <div class="rb-hours">${hours.join('')}</div></div>`}
function tickRibbons(){$$('[data-ribbon]').forEach(r=>{const now=r.querySelector('.rb-now');if(!now)return;const m=istNowMin(),s=+r.dataset.start,sp=+r.dataset.span;
 const on=istToday()===r.dataset.date&&m>=s&&m<=s+sp;now.hidden=!on;if(on)now.style.left=((m-s)/sp*100)+'%'})}

/* number that counts up when it scrolls into view */
const counter=(n,suffix='')=>`<b class="tn" data-count="${n}" data-suffix="${suffix}">${n}${suffix}</b>`;
function mountCounters(){const els=$$('[data-count]');if(!els.length||RMQ.matches||!('IntersectionObserver' in window))return;
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target,n=+el.dataset.count,suf=el.dataset.suffix||'',t0=performance.now();
  const f=t=>{const q=Math.min(1,(t-t0)/1300),v=Math.round(n*(1-Math.pow(1-q,3)));el.textContent=v+suf;if(q<1)requestAnimationFrame(f)};el.textContent='0'+suf;requestAnimationFrame(f)}),{threshold:.6});
 els.forEach(el=>io.observe(el))}

/* ================= The event (About) ================= */
const VALUES=[['Moment','Every <em>Moment</em>','Stage moments, awards and the stories behind eleven years.','mic','bluefield'],['Connection','Every <em>Connection</em>','Lunch, high tea and time with colleagues from every city.','users','inkfield'],['Impact','Every <em>Impact</em>','Recognising the people and teams who made the year count.','star','bluefield alt']];
function eAbout(){const words='Eleven years ago, Impact Analytics started with an idea and a lot of hustle. Today a team of 800+ serves retailers around the world. On 17 December we celebrate the journey, the people and the impact we make together.'.split(' ');
 const cats=CATEGORIES.map(c=>[c,S.acts.filter(a=>a.category===c[0])]).filter(x=>x[1].length);
 return `<section class="band" data-acc style="--acc:${ACC.purple}">${sprinkle(61,12)}<div class="wrap">
 <p class="eyebrow muted" data-rv>Why we gather</p>
 <p class="scrub" data-scrub style="--n:${words.length}">${words.map((w,i)=>`<span style="--k:${i}">${/800\+|Impact|idea|celebrate/.test(w)?`<em>${w}</em>`:w}</span>`).join(' ')}</p>
 <div class="bignums">${[[17,'','December 2026','calendar'],[11,'','hours together','clock'],[S.acts.length,'','sessions','spark'],[4,'','spaces to explore','map']].map((x,i)=>`<div class="bn" data-rv style="--i:${i}"><span class="bn-ic">${ic(x[3],18)}</span>${counter(x[0],x[1])}<span>${x[2]}</span></div>`).join('')}</div></div></section>
 <section class="band tight" data-acc style="--acc:${ACC.yellow}"><div class="wrap"><div class="values" role="list">${VALUES.map((v,i)=>`<button class="val ${v[4]} ${i===0?'open':''}" role="listitem" data-act="val" data-arg="${i}" aria-expanded="${i===0}"><span class="val-n tn">0${i+1}</span><span class="val-ic">${ic(v[3],22)}</span><h3>${v[1]}</h3><p>${v[2]}</p></button>`).join('')}</div></div></section>
 <section class="band" data-acc style="--acc:${ACC.green}">${sprinkle(63,10)}<div class="wrap"><div class="shead"><div data-rv><p class="eyebrow muted">The day at a glance</p><h2>One day, <em>${S.acts.length}</em> moments</h2></div><p class="muted" data-rv style="--i:1;max-width:40ch">Hover a block to preview it. Tap it to open the session in the schedule.</p></div>
 <div data-rv style="--i:2">${ribbon(S.acts)}</div>
 <div class="bento">${cats.map(([c,l],i)=>{const nx=l.find(a=>endMs(a)>Date.now()),slots=cats.length+1,rem=slots%4,span=i===cats.length-1&&rem?4-rem+1:0;return `<button class="bt ${i===0?'wide':''} ${span?'fill':''}" data-tilt data-rv style="--i:${i};${span?`grid-column:span ${span}`:''}" data-act="goCat" data-arg="${c[0]}"><span class="bt-ic">${ic(c[1],22)}</span><span class="bt-n tn">${l.length}</span><h3>${c[0]}</h3><p class="sm muted">${nx?`Next: ${esc(nx.title)} at ${nx.start}`:'All done for today'}</p><span class="bt-go">${ic('arrow',16)}</span></button>`}).join('')}</div>
 <div class="ctas" style="margin-top:28px"><a class="btn" href="#event-schedule" data-magnet>${ic('calendar',18)} Open the schedule</a><a class="btn sec" href="#event-venue" data-magnet>${ic('pin',18)} Explore the venue</a></div></div></section>`}

/* ================= Schedule ================= */
function schedList(){const cat=S.schedCat;let list=S.acts;if(cat==='Plan')list=list.filter(a=>inPlan(a.id));else if(cat!=='All')list=list.filter(a=>a.category===cat);
 if(!list.length)return `<div class="empty card">${cat==='Plan'?`${ic('star',28)}<p style="margin-top:8px">Your plan is empty. Tap the star on any session to add it here.</p>`:'Nothing in this category yet.'}</div>`;
 return groupByDay(list).map(g=>`<div class="daygroup"><div class="dayhead"><b>${fmtDay(g.items[0])}</b><span class="xs muted">${g.items.length} ${g.items.length===1?'session':'sessions'}</span></div>${g.items.map((a,i)=>{const st=statusOf(a),open=S.openAct===a.id;
  return `<article class="sx ${st} ${open?'open':''}" id="act-${esc(a.id)}" style="--i:${i}"><div class="sx-time"><b class="tn">${a.start}</b><span class="tn">${a.end}</span></div><div class="sx-rail"><i></i></div>
  <div class="sx-card"><button class="sx-head" data-act="openAct" data-arg="${esc(a.id)}" aria-expanded="${open}"><span class="sx-ic">${ic(catIcon(a.category),20)}</span><span class="grow"><h3>${esc(a.title)}</h3><span class="sx-meta">${ic('pin',13)} ${esc(a.location)} · ${esc(a.category)} · ${dur(a)}${st==='now'?' · <b class="live">Live now</b>':''}</span></span><span class="sx-chev">${ic('down',18)}</span></button>
  <button class="sx-star" data-act="star" data-arg="${esc(a.id)}" aria-pressed="${inPlan(a.id)}" aria-label="${inPlan(a.id)?'Remove from':'Add to'} my plan">${ic('star',18)}</button>
  <div class="sx-body"><div><p>${esc(a.description||'Details coming soon.')}</p><div class="row wrapx" style="gap:8px;margin-top:14px"><button class="btn sec sm" data-act="mapZone" data-arg="${esc(a.location)}">${ic('route',16)} View on map</button>${st==='past'?'':`<button class="btn sec sm" data-act="ics" data-arg="${esc(a.id)}">${ic('ics',16)} Add to calendar</button>`}<span class="xs muted" style="margin-left:auto" ${st==='past'?'':`data-rel="${st==='now'?endMs(a):startMs(a)}"`}>${st==='past'?'Ended':st==='now'?'Ends '+rel(endMs(a)):rel(startMs(a))}</span></div></div></div></div></article>`}).join('')}</div>`).join('')}
function schedChips(){const counts={All:S.acts.length,Plan:S.acts.filter(a=>inPlan(a.id)).length};CATEGORIES.forEach(c=>counts[c[0]]=S.acts.filter(a=>a.category===c[0]).length);
 return ['All',...CATEGORIES.map(c=>c[0]).filter(c=>counts[c]),'Plan'].map(c=>`<button class="fchip ${c==='Plan'?'plan':''}" data-act="schedCat" data-arg="${c}" aria-pressed="${S.schedCat===c}">${c==='Plan'?ic('star',14)+' My plan':c==='All'?'Everything':ic(catIcon(c),14)+' '+c}<span class="tn">${counts[c]}</span></button>`).join('')}
function glanceStats(){const l=S.acts,first=l[0],last=l[l.length-1],mine=l.filter(a=>inPlan(a.id)).length,live=l.filter(a=>statusOf(a)==='now').length;
 return `<div class="gstats">${[[l.length,'sessions','spark'],[mine,'in your plan','star'],[first?first.start:'--','first session','sun'],[last?last.end:'--','last call','flag']].map(x=>`<div><span class="gs-ic">${ic(x[2],16)}</span><b class="tn">${x[0]}</b><span>${x[1]}</span></div>`).join('')}${live?`<div class="gs-live"><b class="tn">${live}</b><span>live now</span></div>`:''}</div>`}
function eSchedule(){const up=upcoming(),nx=up[0],st=nx&&statusOf(nx);
 return `<section class="band" data-acc style="--acc:${ACC.green}">${sprinkle(67,12)}<div class="wrap">
 <div class="sched-top">${nx?`<div class="upnext bluefield" data-rv><p class="eyebrow" style="opacity:.85">${st==='now'?'Happening now':'Up next'}</p><div class="un-time tn">${nx.start}</div><h3>${esc(nx.title)}</h3><p class="sm" style="opacity:.85">${ic('pin',13)} ${esc(nx.location)} · ${fmtDayShort(nx)}</p>
  <div class="un-rel"><span class="xs" style="opacity:.8">${st==='now'?'Ends':'Starts'}</span><b data-rel="${st==='now'?endMs(nx):startMs(nx)}">${rel(st==='now'?endMs(nx):startMs(nx))}</b></div><div class="row wrapx" style="gap:8px"><button class="btn white sm" data-act="openAct" data-arg="${esc(nx.id)}">Details</button><a class="btn glassy sm" href="#reminders">${ic('bell',14)} Remind me</a></div></div>`:''}
 <div class="glance card" data-rv style="--i:1"><div class="row"><p class="eyebrow muted grow">The day at a glance</p><span class="xs muted">IST</span></div>${ribbon(S.acts,{sel:S.openAct})}<p class="xs muted">Starred sessions glow. The orange line shows the time on event day.</p>${glanceStats()}</div></div>
 <div class="fbar" role="group" aria-label="Filter sessions">${schedChips()}</div>
 <div id="sched-list">${schedList()}</div></div></section>`}
function refreshSchedule(scrollTo){const l=$('#sched-list');if(!l)return;l.innerHTML=schedList();const f=$('.fbar');if(f)f.innerHTML=schedChips();const g=$('.gstats');if(g)g.outerHTML=glanceStats();
 $$('.glance [data-ribbon]').forEach(r=>r.outerHTML=ribbon(S.acts,{sel:S.openAct}));tickRibbons();
 if(scrollTo){const el=document.getElementById('act-'+scrollTo);el&&el.scrollIntoView({behavior:RMQ.matches?'auto':'smooth',block:'center'})}}

/* ================= Venue ================= */
const ROUTES={'Main hall':'M13 81 C 20 64, 34 46, 50 31','Atrium':'M13 81 C 24 90, 38 88, 50 81','Arena':'M13 81 C 34 99, 72 98, 87 60','Entrance':''};
const VIEWS={'3d':{rx:56,rz:-38},top:{rx:0,rz:0},low:{rx:68,rz:-14}};
function eVenue(){const up=upcoming();
 return `<section class="band inkfield venue explore" id="venue" data-acc style="--acc:${ACC.yellow}">${sprinkle(81,14)}<div class="wrap ex-grid" style="position:relative;z-index:2">
 <div class="col ex-side" style="gap:18px" data-rv><p class="eyebrow" style="opacity:.7">Explore the venue</p><h2>Four spaces, <em>one</em> day</h2><p style="opacity:.8">Drag the plan to turn it. Tap a space to see what happens there, or pick a session and follow the route from the entrance.</p>
  <div class="viewbar" role="group" aria-label="View">${[['3d','3D','cube'],['top','Top','top'],['low','Low','eye']].map(v=>`<button data-act="vview" data-arg="${v[0]}">${ic(v[2],16)} ${v[1]}</button>`).join('')}<button data-act="vspin" aria-pressed="${S.spin}">${ic('rotate',16)} Spin</button></div>
  <div class="zlist">${ZONES.map(z=>{const n=S.acts.filter(a=>a.location===z.id).length,now=S.acts.find(a=>a.location===z.id&&statusOf(a)==='now');return `<button class="zrow" data-act="zone" data-arg="${esc(z.id)}" aria-pressed="${S.zone===z.id}"><i style="background:${z.top}"></i><span class="grow"><b>${esc(z.id)}</b><span>${esc(z.note)}</span></span>${now?'<em class="live">Live</em>':`<em>${n}</em>`}</button>`}).join('')}</div>
  <div class="field wayf"><label for="wayfind">${ic('route',14)} Find your way to a session</label><select id="wayfind"><option value="">Choose a session</option>${up.map(a=>`<option value="${esc(a.id)}">${a.start} · ${esc(a.title)}</option>`).join('')}</select></div></div>
 <div class="col" style="gap:14px;--i:1" data-rv><div class="ex-stage">${venueScene(true)}<p class="ex-hint">${ic('rotate',14)} Drag to turn</p></div>${zoneCard()}</div></div></section>
 <section class="band" data-acc style="--acc:${ACC.green}">${sprinkle(85,10)}<div class="wrap"><div class="shead"><div data-rv><p class="eyebrow muted">Getting there</p><h2>Your <em>morning</em>, step by step</h2></div></div>
 <ol class="journey-steps">${[['08:30','Shuttles start','Every 20 minutes from Marathahalli.','bus'],['09:00','Doors and check-in','Scan your QR code at the Entrance and pick up your badge.','qr'],['10:00','Welcome and opening','Find a seat in the Main hall. The day begins.','mic'],['21:00','Closing','One last toast, then shuttles back.','flag']].map((s,i)=>`<li data-rv style="--i:${i}"><span class="js-dot">${ic(s[3],20)}</span><b class="tn">${s[0]}</b><h3>${s[1]}</h3><p class="sm muted">${s[2]}</p></li>`).join('')}</ol>
 <div class="addr card" data-rv><div class="grow"><p class="eyebrow muted">Address</p><h3>${EVENT.venue}</h3><p class="muted">${EVENT.area}</p></div><div class="row wrapx" style="gap:8px"><a class="btn" href="${EVENT.maps}" target="_blank" rel="noopener" data-magnet>${ic('pin',18)} Open in Maps</a><button class="btn sec" data-act="copyAddr">${ic('copy',18)} Copy address</button></div></div></div></section>`}

/* drag to turn, view presets, slow spin */
let EXPLORE=null;
function mountExplore(){EXPLORE&&EXPLORE.stop();EXPLORE=null;const sc=$('[data-explore]');if(!sc)return;const pl=sc.querySelector('.plane');let drag=null,raf=0,alive=true;
 const apply=(anim=true)=>{pl.style.transition=anim?'':'none';pl.style.setProperty('--rx',S.view.rx+'deg');pl.style.setProperty('--rz',S.view.rz+'deg')};apply(false);
 sc.addEventListener('pointerdown',e=>{if(e.target.closest('.zone'))return;drag={x:e.clientX,y:e.clientY,rx:S.view.rx,rz:S.view.rz};sc.setPointerCapture(e.pointerId);sc.classList.add('dragging');S.spin=false;syncSpin()});
 sc.addEventListener('pointermove',e=>{if(!drag)return;S.view.rz=drag.rz+(e.clientX-drag.x)*.35;S.view.rx=Math.max(0,Math.min(72,drag.rx-(e.clientY-drag.y)*.25));apply(false)});
 const end=()=>{drag=null;sc.classList.remove('dragging')};sc.addEventListener('pointerup',end);sc.addEventListener('pointercancel',end);
 const spin=()=>{if(!alive)return;if(S.spin&&!drag){S.view.rz+=.18;apply(false)}raf=requestAnimationFrame(spin)};raf=requestAnimationFrame(spin);
 EXPLORE={stop(){alive=false;cancelAnimationFrame(raf)},apply}}
function syncSpin(){$$('[data-act="vspin"]').forEach(b=>b.setAttribute('aria-pressed',S.spin))}
function drawRoute(z){$$('.route').forEach(p=>{p.setAttribute('d',ROUTES[z]||'');p.classList.remove('draw');p.getBoundingClientRect();p.classList.add('draw')})}
