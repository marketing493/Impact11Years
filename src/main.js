/* ---------- routing + render ---------- */
let GRID_I=null;
function parseHash(){const h=location.hash.slice(1);
 if(h.startsWith('event-')&&SUBS.some(s=>s[0]===h.slice(6))){S.route='event';S.sub=h.slice(6);return null}
 if(h==='admin'){S.route='admin';return null}
 if(h==='reminders'||h==='venue'){S.route='home';return h}
 S.route='home';return null}
function render(){
 if(GRID_I){GRID_I.destroy();GRID_I=null}
 $('#app').innerHTML=S.route==='event'?vEvent():S.route==='admin'?vAdmin():vHome();
 const nav=S.route==='home'?'home':S.route==='admin'?'admin':'event-'+S.sub;
 $$('[data-nav]').forEach(a=>{const k=a.dataset.nav;a.toggleAttribute('aria-current',false);if(k===nav||(k==='event-about'&&S.route==='event'&&!['schedule','venue'].includes(S.sub)))a.setAttribute('aria-current','page')});
 $$('.bell .dot').forEach(d=>d.hidden=S.pwa.on&&('Notification' in window)&&Notification.permission==='granted');
 const cv=$('#igrid');if(cv)GRID_I=new ImpactGrid(cv,{mode:S.gridMode,target:Date.parse(EVENT.starts),onTick:srCountdown});
 mountScenes();mountStory();mountFx();ticks()}
function srCountdown(diff){const el=$('#cd-sr');if(!el)return;const d=Math.floor(diff/864e5),h=Math.floor(diff%864e5/36e5),m=Math.floor(diff%36e5/6e4);el.textContent=diff>0?`${d} days, ${h} hours and ${m} minutes until ${EVENT.name}`:`${EVENT.name} is here`}
function ticks(){$$('[data-rel]').forEach(el=>el.textContent=rel(+el.dataset.rel))}
setInterval(ticks,30000);

/* refresh: pick up organizer edits and roll sessions from next to now to past */
let lastKey='';
setInterval(async()=>{if(document.hidden||A_.modal)return;const before=JSON.stringify(S.acts)+S.acts.map(statusOf).join();
 if(S.server){try{const r=await fetch('/api/activities',{cache:'no-store'});const j=await r.json();S.acts=sortActs(j.activities||[])}catch(e){}}
 const after=JSON.stringify(S.acts)+S.acts.map(statusOf).join();if(after!==before&&S.route!=='admin'){render();scheduleLocal()}},60000);

/* ---------- actions ---------- */
const ACT={
 gmode(m){S.gridMode=m},
 gclear(){GRID_I&&GRID_I.clear();return false},
 tscroll(d){const el=$('#tickets');if(el)el.scrollBy({left:+d*el.clientWidth*.8,behavior:'smooth'});return false},
 zone(z){S.zone=z;
  /* update every scene in place so the 3D tilt is not reset */
  $$('.zone').forEach(b=>{const on=b.dataset.arg===z;b.classList.toggle('on',on);b.classList.toggle('dim',!on);b.setAttribute('aria-pressed',on)});
  $$('.zones button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.arg===z));
  $$('.zonecard').forEach(c=>c.outerHTML=zoneCard());
  if(S.route==='event'&&S.sub==='venue')document.getElementById('venue')?.scrollIntoView({behavior:'smooth',block:'start'});return false},
 ics(id){ics(id);return false},
 install(){doInstall();return false},remon(){remindersOn();return false},remoff(){remindersOff();return false},testnotif(){testNotif();return false},
 aNew(){const last=S.acts[S.acts.length-1];A_.modal={id:null,a:{title:'',date:last?last.date:'2026-12-17',start:last?last.end:'10:00',end:last?shift(last.end,30):'10:30',location:'Main hall',category:'Stage',description:''}}},
 aEdit(id){const a=S.acts.find(x=>x.id===id);if(a)A_.modal={id,a:{...a}}},
 aClose(){A_.modal=null},aBg(_,el,ev){if(ev.target===el)A_.modal=null;else return false},
 aDelAsk(id){A_.del=id;clearTimeout(ACT.delT);ACT.delT=setTimeout(()=>{if(A_.del===id){A_.del=null;render()}},4000)},
 async aDel(id){const a=S.acts.find(x=>x.id===id);A_.del=null;await saveActs(S.acts.filter(x=>x.id!==id),`Deleted ${a?a.title:'the activity'}.`);return false},
 async aReset(){await saveActs(DEFAULT_ACTIVITIES.map(a=>({...a})),'Default schedule restored.');return false},
 aTest(){adminTest();return false},
 aOut(){A_.authed=false;A_.key='';try{sessionStorage.removeItem('ia11-admin')}catch(e){}toast('Signed out.')}};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const f=ACT[el.dataset.act];if(!f)return;const r=f(el.dataset.arg,el,e);if(r===false||r instanceof Promise)return;render()});
document.addEventListener('submit',async e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
 if(f.dataset.form==='login'){const k=$('#l-key').value;const ok=await adminLogin(k);if(!ok){$('#l-err').textContent='That password did not work. Try again.';return}toast('Signed in.');render()}
 if(f.dataset.form==='act'){const m=A_.modal,loc=$('#f-loc').value;
  const a={id:m.id||'a'+Date.now().toString(36),title:$('#f-title').value.trim(),date:$('#f-date').value,start:$('#f-start').value,end:$('#f-end').value,category:$('#f-cat').value,location:loc==='Other'?($('#f-loc2').value.trim()||'Other'):loc,description:$('#f-desc').value.trim()};
  $$('.modal .err').forEach(x=>x.textContent='');const bad=validAct(a);if(bad){const el=$(`.err[data-for="${bad[0]}"]`);if(el)el.textContent=bad[1];$('#'+bad[0]).focus();return}
  const list=m.id?S.acts.map(x=>x.id===m.id?a:x):[...S.acts,a];A_.modal=null;A_.flash=a.id;
  await saveActs(list,m.id?`Saved ${a.title}.`:`Added ${a.title} at ${a.start}.`);setTimeout(()=>{A_.flash=null},1700)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&A_.modal){A_.modal=null;render()}});
addEventListener('hashchange',()=>{const jump=parseHash();render();if(jump){requestAnimationFrame(()=>document.getElementById(jump)?.scrollIntoView({behavior:'smooth'}))}else scrollTo({top:0})});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){ticks();scheduleLocal()}});

/* ---------- boot ---------- */
(async()=>{startAmbient();const jump=parseHash();S.acts=sortActs(store.get('ia11-acts',DEFAULT_ACTIVITIES));render();
 await Promise.all([loadData(),registerSW()]);
 if(S.server&&S.cfg.admin&&A_.key)await adminLogin(A_.key);
 render();scheduleLocal();
 if(jump)setTimeout(()=>document.getElementById(jump)?.scrollIntoView({behavior:'smooth'}),60)})();
