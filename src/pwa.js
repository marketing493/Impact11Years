/* ---------- install + reminders ----------
 Push mode: the server sends a Web Push 10 minutes before each session, even when the app is closed.
 Local mode (no server configured): the open app schedules the notifications itself. */
const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();
let SW=null;
async function registerSW(){if(!('serviceWorker' in navigator)||!isSecureContext||inFrame)return null;try{SW=await navigator.serviceWorker.register('/sw.js');return SW}catch(e){return null}}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.pwa.prompt=e;if(S.route==='home')render()});
addEventListener('appinstalled',()=>{S.pwa.prompt=null;toast('Added to your home screen.');render()});
async function doInstall(){const p=S.pwa.prompt;if(!p)return;p.prompt();const r=await p.userChoice.catch(()=>null);S.pwa.prompt=null;if(r&&r.outcome==='accepted')toast('Installing the app.');render()}
const b64u=s=>{const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};

async function remindersOn(){
 if(!('Notification' in window)){toast('This browser does not support notifications.');return}
 const perm=await Notification.requestPermission();
 if(perm!=='granted'){toast('Notifications stay off. You can allow them later in settings.');render();return}
 const reg=SW||await registerSW();
 if(S.server&&S.cfg.push&&reg&&'PushManager' in window){
  try{await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(S.cfg.vapidPublicKey)});
   const r=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:sub})});if(!r.ok)throw new Error((await r.json()).error);S.pwa.mode='push'}
  catch(e){S.pwa.mode='local';toast('Push is not available, so reminders work while the app is open.')}}
 else S.pwa.mode='local';
 S.pwa.on=true;store.set('ia11-reminders',true);scheduleLocal();
 if(S.pwa.mode==='push')toast('Reminders are on. You get an alert 10 minutes before each session.');
 else if(S.server)toast('Reminders are on while the app is open. Ask the organizers to finish push setup for closed-app alerts.');
 else toast('Reminders are on while the app is open.');
 render()}
async function remindersOff(){S.pwa.on=false;store.set('ia11-reminders',false);clearLocal();
 try{const reg=SW||await navigator.serviceWorker?.getRegistration();const sub=reg&&await reg.pushManager.getSubscription();if(sub){await fetch('/api/subscribe',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:sub})}).catch(()=>{});await sub.unsubscribe()}}catch(e){}
 toast('Reminders are off.');render()}
async function showLocal(title,body,tag){try{const reg=SW||await navigator.serviceWorker?.getRegistration();if(reg){await reg.showNotification(title,{body,tag,icon:'/icons/icon-192.png',badge:'/icons/badge-96.png',data:{url:'/#event-schedule'}});return true}}catch(e){}
 try{new Notification(title,{body,tag,icon:'/icons/icon-192.png'});return true}catch(e){return false}}
async function testNotif(){if(Notification.permission!=='granted'){toast('Turn on reminders first.');return}const ok=await showLocal('Starting in 10 minutes','This is how your reminders look.','test');if(!ok)toast('This browser blocked the test notification.')}

let TIMERS=[];
function clearLocal(){TIMERS.forEach(clearTimeout);TIMERS=[]}
/* Local fallback: while the app is open, fire each reminder ourselves. Skipped when server push is active. */
async function scheduleLocal(){clearLocal();if(!S.pwa.on||!('Notification' in window)||Notification.permission!=='granted')return;
 if(S.pwa.mode===null){try{const reg=SW||await navigator.serviceWorker?.getRegistration();const sub=reg&&await reg.pushManager.getSubscription();S.pwa.mode=sub&&S.cfg.push?'push':'local'}catch(e){S.pwa.mode='local'}}
 if(S.pwa.mode==='push')return;
 const now=Date.now(),fired=store.get('ia11-fired',{});
 for(const a of S.acts){const at=startMs(a)-LEAD_MIN*6e4,key=a.id+a.date+a.start;if(fired[key])continue;const wait=at-now;
  if(wait<=0&&startMs(a)>now){fired[key]=1;store.set('ia11-fired',fired);showLocal(`Starting in ${Math.max(1,Math.round((startMs(a)-now)/6e4))} minutes`,`${a.title}, ${a.location} at ${a.start}`,'act-'+a.id)}
  else if(wait>0&&wait<864e5)TIMERS.push(setTimeout(()=>{const f=store.get('ia11-fired',{});if(f[key])return;f[key]=1;store.set('ia11-fired',f);showLocal(`Starting in ${LEAD_MIN} minutes`,`${a.title}, ${a.location} at ${a.start}`,'act-'+a.id)},wait))}}
