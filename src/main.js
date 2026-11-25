/* ---------- routing + render ---------- */
let GRID_I=null;
function parseHash(){const h=location.hash.slice(1);
 /* the event pages are retired: old links land on the home page */
 if(h.startsWith('event-')){S.route='home';try{history.replaceState(null,'','#')}catch(e){}return null}
 if(h==='admin'){S.route='admin';return null}
 S.route='home';return h||null}
function render(){
 if(GRID_I){GRID_I.destroy();GRID_I=null}
 $('#app').innerHTML=S.route==='event'?vEvent():S.route==='admin'?vAdmin():S.skin==='royal'?vRoyalHome():vHome();
 const nav=S.route==='home'?'home':S.route==='admin'?'admin':'event-'+S.sub;
 $$('[data-nav]').forEach(a=>{const k=a.dataset.nav;a.toggleAttribute('aria-current',false);if(k===nav||(k==='event-about'&&S.route==='event'&&!['schedule','venue'].includes(S.sub)))a.setAttribute('aria-current','page')});
 $$('.bell .dot').forEach(d=>d.hidden=S.pwa.on&&('Notification' in window)&&Notification.permission==='granted');
 const cv=$('#igrid');if(cv)GRID_I=new ImpactGrid(cv,{mode:S.gridMode,target:Date.parse(EVENT.starts),onTick:srCountdown});
 mountScenes();mountStory();mountFx();mountOffscreen();mountSubnav();mountCounters();mountExplore();mountRoyal();ticks();
 $$('[data-act="skin"]').forEach(b=>{b.setAttribute('aria-pressed',S.skin==='royal');b.setAttribute('aria-label',S.skin==='royal'?'Switch to the Modern theme':'Switch to the Royal theme')});
 if(S.pendingScroll){const id=S.pendingScroll;S.pendingScroll=null;setTimeout(()=>{const el=document.getElementById('act-'+id);el&&el.scrollIntoView({behavior:'smooth',block:'center'})},120)}}
function srCountdown(diff){const el=$('#cd-sr');if(!el)return;const d=Math.floor(diff/864e5),h=Math.floor(diff%864e5/36e5),m=Math.floor(diff%36e5/6e4);el.textContent=diff>0?`${d} days, ${h} hours and ${m} minutes until ${EVENT.name}`:`${EVENT.name} is here`}
/* sections off screen pause their CSS animations, so the phone only works on what is visible */
let OFF_IO=null;
function mountOffscreen(){OFF_IO&&OFF_IO.disconnect();if(!('IntersectionObserver' in window))return;
 OFF_IO=new IntersectionObserver(es=>es.forEach(e=>e.target.toggleAttribute('data-off',!e.isIntersecting)),{rootMargin:'0px'});
 $$('#app>section:not(.r-voyage),#app>.marquee,#app>div,footer,.vy-pin').forEach(el=>OFF_IO.observe(el))}
function ticks(){$$('[data-rel]').forEach(el=>el.textContent=rel(+el.dataset.rel));tickRibbons()}
setInterval(ticks,30000);

const actsSig=l=>l.map(a=>[a.id,a.date,a.start,a.end,a.title,a.location,a.category,a.description].join('|')).join('\n');
/* update only what shows the schedule, keeping the visitor's place and anything they opened */
function softRefresh(full){if(S.route!=='home'||S.skin!=='royal'){render();return}
 BOARD&&BOARD.build(false);$$('.zonecard').forEach(c=>c.outerHTML=zoneCard());
 if(full){const t=$('.tents');if(t){const tmp=document.createElement('div');tmp.innerHTML=vRoyalHome();const nt=tmp.querySelector('.tents');if(nt)t.replaceWith(nt)}}
 refreshReminders();ticks()}
/* refresh: pick up organizer edits and roll sessions from next to now to past */
let lastKey='';
setInterval(async()=>{if(document.hidden||A_.modal)return;const sig0=actsSig(S.acts),before=sig0+S.acts.map(statusOf).join();
 if(S.server){try{const r=await fetch('/api/activities',{cache:'no-store'});const j=await r.json();S.acts=sortActs(j.activities||[])}catch(e){}}
 const sig1=actsSig(S.acts),after=sig1+S.acts.map(statusOf).join();if(S.server)store.set('ia11-acts-cache',S.acts);if(after!==before&&S.route!=='admin'){softRefresh(sig1!==sig0);scheduleLocal()}},60000+Math.round(Math.random()*20000));

/* ---------- actions ---------- */
const ACT={
 gmode(m){S.gridMode=m},
 gclear(){GRID_I&&GRID_I.clear();return false},
 tscroll(d){const el=$('#tickets');if(el)el.scrollBy({left:+d*el.clientWidth*.8,behavior:'smooth'});return false},
 zone(z){S.zone=z;
  /* update every scene in place so the 3D tilt is not reset */
  $$('.zone').forEach(b=>{const on=b.dataset.arg===z;b.classList.toggle('on',on);b.classList.toggle('dim',!on);b.setAttribute('aria-pressed',on)});
  $$('.zones button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.arg===z));
  $$('.zonecard').forEach(c=>c.outerHTML=zoneCard());$$('.zrow').forEach(b=>b.setAttribute('aria-pressed',b.dataset.arg===z));drawRoute(z);return false},
 /* event pages */
 val(i){$$('.val').forEach((v,k)=>{const on=k===+i;v.classList.toggle('open',on);v.setAttribute('aria-expanded',on)});return false},
 goCat(c){S.schedCat=c;S.openAct=null;location.hash='#event-schedule';return false},
 schedCat(c){S.schedCat=c;refreshSchedule();return false},
 openAct(id){if(!(S.route==='event'&&S.sub==='schedule')){S.openAct=id;S.schedCat='All';S.pendingScroll=id;location.hash='#event-schedule';return false}
  const open=S.openAct!==id;S.openAct=open?id:null;
  if(!$('#act-'+id)){S.schedCat='All';refreshSchedule(id);return false}
  $$('.sx').forEach(el=>{const on=open&&el.id==='act-'+id;el.classList.toggle('open',on);el.querySelector('.sx-head').setAttribute('aria-expanded',on)});
  $$('.rb-b').forEach(b=>b.classList.toggle('sel',open&&b.dataset.arg===id));
  if(open)$('#act-'+id).scrollIntoView({behavior:RMQ.matches?'auto':'smooth',block:'center'});return false},
 star(id){const on=!S.plan.has(id);if(on)S.plan.add(id);else S.plan.delete(id);store.set('ia11-plan',[...S.plan]);
  toast(on?'Added to your plan.':'Removed from your plan.');
  if(S.schedCat==='Plan'){refreshSchedule();return false}
  $$(`.sx-star[data-arg="${CSS.escape(id)}"]`).forEach(b=>{b.setAttribute('aria-pressed',on);b.classList.remove('pop');b.offsetWidth;b.classList.add('pop')});
  $$(`.rb-b[data-arg="${CSS.escape(id)}"]`).forEach(b=>b.classList.toggle('star',on));const f=$('.fbar');if(f)f.innerHTML=schedChips();const g=$('.gstats');if(g)g.outerHTML=glanceStats();return false},
 mapZone(z){S.zone=ZONES.some(x=>x.id===z)?z:S.zone;location.hash='#event-venue';return false},
 vview(v){S.view={...VIEWS[v]};S.spin=false;syncSpin();EXPLORE&&EXPLORE.apply(true);return false},
 vspin(){S.spin=!S.spin;syncSpin();return false},
 copyAddr(){const t=`${EVENT.venue}, ${EVENT.area}`;const ok=()=>toast('Address copied.');try{navigator.clipboard.writeText(t).then(ok,()=>toast(t))}catch(e){toast(t)}return false},
 ics(id){ics(id);return false},
 install(){doInstall();return false},howInstall(){howSheet('install');return false},howRemind(){howSheet('remind');return false},remon(){remindersOn();return false},remoff(){remindersOff();return false},testnotif(){testNotif();return false},
 aNew(){const last=S.acts[S.acts.length-1];A_.modal={id:null,a:{title:'',date:last?last.date:'2026-12-17',start:last?last.end:'10:00',end:last?shift(last.end,30):'10:30',location:'Main hall',category:'Stage',description:''}}},
 aEdit(id){const a=S.acts.find(x=>x.id===id);if(a)A_.modal={id,a:{...a}}},
 aClose(){A_.modal=null},aBg(_,el,ev){if(ev.target===el)A_.modal=null;else return false},
 aDelAsk(id){A_.del=id;clearTimeout(ACT.delT);ACT.delT=setTimeout(()=>{if(A_.del===id){A_.del=null;render()}},4000)},
 async aDel(id){const a=S.acts.find(x=>x.id===id);A_.del=null;await saveActs(S.acts.filter(x=>x.id!==id),`Deleted ${a?a.title:'the activity'}.`);return false},
 async aReset(){await saveActs(DEFAULT_ACTIVITIES.map(a=>({...a})),'Default schedule restored.');return false},
 aTest(){adminTest();return false},ckOpen(){openCheckin();return false},downloadPass(){downloadPass();return false},
 aOut(){A_.authed=false;A_.key='';try{sessionStorage.removeItem('ia11-admin')}catch(e){}toast('Signed out.')}};
Object.assign(ACT,ROYAL_ACT);
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const f=ACT[el.dataset.act];if(!f)return;const r=f(el.dataset.arg,el,e);if(r===false||r instanceof Promise)return;render()});
document.addEventListener('submit',async e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
 if(f.dataset.form==='login'){const k=$('#l-key').value;const ok=await adminLogin(k);if(!ok){$('#l-err').textContent=A_.err||'That password did not work. Try again.';return}toast('Signed in.');render()}
 if(f.dataset.form==='act'){const m=A_.modal,loc=$('#f-loc').value;
  const a={id:m.id||'a'+Date.now().toString(36),title:$('#f-title').value.trim(),date:$('#f-date').value,start:$('#f-start').value,end:$('#f-end').value,category:$('#f-cat').value,location:loc==='Other'?($('#f-loc2').value.trim()||'Other'):loc,description:$('#f-desc').value.trim()};
  $$('.modal .err').forEach(x=>x.textContent='');const bad=validAct(a);if(bad){const el=$(`.err[data-for="${bad[0]}"]`);if(el)el.textContent=bad[1];$('#'+bad[0]).focus();return}
  const list=m.id?S.acts.map(x=>x.id===m.id?a:x):[...S.acts,a];A_.modal=null;A_.flash=a.id;
  await saveActs(list,m.id?`Saved ${a.title}.`:`Added ${a.title} at ${a.start}.`);setTimeout(()=>{A_.flash=null},1700)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&A_.modal){A_.modal=null;render()}});
/* links to a section on the current page glide there; nothing is re-rendered */
function glideTo(id){const el=document.getElementById(id);if(!el)return false;const how=RMQ.matches?'auto':'smooth';
 /* the invitation: bring the whole envelope into view with some space below it (never past the top of the section) */
 const env=id==='invite'&&el.querySelector('.env');
 if(env){const hdr=(document.querySelector('.top')||{}).offsetHeight||0,r=env.getBoundingClientRect(),sec=el.getBoundingClientRect(),gap=Math.min(60,innerHeight*.08);
  let y=scrollY+r.bottom+gap-innerHeight;const envTop=scrollY+r.top-hdr-24;if(y>envTop)y=envTop;y=Math.max(y,scrollY+sec.top-hdr);scrollTo({top:Math.max(0,y),behavior:how});return true}
 el.scrollIntoView({behavior:how,block:'start'});return true}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented)return;const id=a.getAttribute('href').slice(1);
 if(!id||id==='admin'||S.route!=='home'||!document.getElementById(id))return;e.preventDefault();glideTo(id);try{history.replaceState(null,'','#'+id)}catch(_){}},true);
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(S.route==='home'&&id&&id!=='admin'&&!id.startsWith('event-')&&glideTo(id))return;const jump=parseHash();render();if(jump){requestAnimationFrame(()=>document.getElementById(jump)?.scrollIntoView({behavior:'smooth'}))}else scrollTo({top:0})});
document.addEventListener('change',e=>{if(e.target.id==='wayfind'&&e.target.value){const a=S.acts.find(x=>x.id===e.target.value);if(a){ACT.zone(a.location);toast(`Follow the orange path to the ${a.location} for ${a.title}.`);$('.ex-stage')?.scrollIntoView({behavior:'smooth',block:'center'})}}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){ticks();scheduleLocal()}});

/* ---------- boot ---------- */
(async()=>{startAmbient();const jump=parseHash();S.acts=sortActs(store.get('ia11-acts-cache',null)||store.get('ia11-acts',DEFAULT_ACTIVITIES));const bootSig=actsSig(S.acts);render();
 await Promise.all([loadData(),registerSW()]);
 if(S.server&&S.cfg.admin&&A_.key)await adminLogin(A_.key);
 if(S.server)store.set('ia11-acts-cache',S.acts);
 if(S.route==='home'&&S.skin==='royal')softRefresh(actsSig(S.acts)!==bootSig);else render();scheduleLocal();
 if(jump&&jump!=='admin')setTimeout(()=>glideTo(jump),60)})();
