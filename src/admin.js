/* ---------- organizer dashboard ---------- */
const A_=S.admin;
A_.key=(()=>{try{return sessionStorage.getItem('ia11-admin')||''}catch(e){return ''}})();
const adminHeaders=()=>({'Content-Type':'application/json','x-admin-key':A_.key});
async function adminLogin(key){A_.key=key;const r=await fetch('/api/admin',{headers:adminHeaders(),cache:'no-store'}).catch(()=>null);
 if(r&&r.ok){A_.authed=true;A_.stats=await r.json();try{sessionStorage.setItem('ia11-admin',key)}catch(e){}return true}
 A_.authed=false;A_.key='';try{sessionStorage.removeItem('ia11-admin')}catch(e){}return false}
async function saveActs(list,msg){
 if(S.server){const r=await fetch('/api/activities',{method:'PUT',headers:adminHeaders(),body:JSON.stringify({activities:list})}).catch(()=>null);
  const j=r?await r.json().catch(()=>({})):{error:'Network error. Check your connection and try again.'};
  if(!r||!r.ok){toast(j.error||'Could not save.');if(r&&r.status===401){A_.authed=false}render();return false}S.acts=sortActs(j.activities)}
 else{S.acts=sortActs(list);store.set('ia11-acts',S.acts)}
 scheduleLocal();toast(msg);render();return true}
function validAct(a){if(a.title.trim().length<3)return ['f-title','Give the activity a title of at least 3 characters.'];if(!/^\d{4}-\d{2}-\d{2}$/.test(a.date))return ['f-date','Pick a date.'];if(!/^\d{2}:\d{2}$/.test(a.start))return ['f-start','Pick a start time.'];if(!/^\d{2}:\d{2}$/.test(a.end))return ['f-end','Pick an end time.'];if(a.end<=a.start)return ['f-end','The end time must be after the start time.'];return null}

function vAdmin(){
 const canEdit=!S.server||(S.cfg.admin&&A_.authed);
 if(S.server&&!S.cfg.admin)return adminShell(`<div class="banner">${ic('lock',20)}<div><b>Set an organizer password to unlock this page.</b><p class="sm muted" style="margin-top:4px">Add ADMIN_PASSWORD under Settings, Environment Variables in your Vercel project, then redeploy.</p></div></div>`);
 if(S.server&&!A_.authed)return adminShell(`<form class="card col" data-form="login" style="max-width:440px"><h3 style="font-size:30px">Organizer sign in</h3><p class="sm muted">Enter the organizer password to manage activities.</p><div class="field"><label for="l-key">Password</label><input id="l-key" type="password" autocomplete="current-password" required><span class="err" id="l-err"></span></div><button class="btn" type="submit">Sign in</button></form>`);
 const nx=upcoming()[0],st=A_.stats;
 const setup=S.server?`<div class="card"><h3 style="font-size:24px;margin-bottom:12px">Reminder setup</h3><div class="checklist">${[[st?.store,'Database connected'+(st?.storeName?` (${st.storeName})`:'')],[st?.push,'Push keys set (VAPID)'],[st?.cron,'Reminder job secret set (CRON_SECRET)']].map(([ok,l])=>`<span>${ok?`<span style="color:var(--blue-ink)">${ic('check',16,2)}</span>`:`<span style="color:var(--orange-ink)">${ic('x',16,2)}</span>`}${l}</span>`).join('')}</div><p class="xs muted" style="margin-top:10px">A scheduler must call /api/notify every minute. The README explains both options.</p></div>`
  :`<div class="banner">${ic('lock',20)}<div><b>Demo mode.</b><p class="sm muted" style="margin-top:4px">Changes save in this browser only. Deploy to Vercel with the Neon database connected to share them with every employee.</p></div></div>`;
 return adminShell(`<div class="adm-kpis"><div class="card kpi"><span class="s">Activities</span><b class="tn">${S.acts.length}</b><span class="s">${upcoming().length} still to come</span></div>
 <div class="card kpi"><span class="s">Next up</span><b class="tn">${nx?nx.start:'None'}</b><span class="s">${nx?esc(nx.title):'All sessions ended'}</span></div>
 <div class="card kpi"><span class="s">Reminder subscribers</span><b class="tn">${S.server?(st?.subscribers??0):'Demo'}</b><span class="s">Phones with push turned on</span></div>
 <div class="card kpi"><span class="s">Reminder lead time</span><b>10 min</b><span class="s">Before every session</span></div></div>
 ${setup}
 <div class="card" style="padding:0"><div class="row wrapx" style="padding:18px 20px;border-bottom:1px solid var(--line)"><h3 class="grow" style="font-size:28px">Activities and timings</h3>${!S.server?`<button class="btn ghost sm" data-act="aReset">Restore default schedule</button>`:''}<button class="btn sm" data-act="aNew" ${canEdit?'':'disabled'}>${ic('plus',16)} Add activity</button></div>
 <div class="scroll"><table class="tbl"><thead><tr><th>Date</th><th>Time</th><th>Activity</th><th>Location</th><th>Category</th><th></th></tr></thead><tbody>
 ${S.acts.map(a=>`<tr class="${A_.flash===a.id?'flash':''}"><td class="tn">${fmtDayShort(a)}</td><td class="tn">${a.start} to ${a.end}</td><td><b style="font-weight:600">${esc(a.title)}</b>${a.description?`<div class="xs muted">${esc(a.description).slice(0,70)}${a.description.length>70?'…':''}</div>`:''}</td><td>${esc(a.location)}</td><td><span class="pill p-blue">${esc(a.category)}</span></td>
 <td class="acts"><button class="btn ghost sm" data-act="aEdit" data-arg="${esc(a.id)}" aria-label="Edit ${esc(a.title)}">${ic('edit',16)} Edit</button>${A_.del===a.id?`<button class="btn danger sm" data-act="aDel" data-arg="${esc(a.id)}">Confirm delete</button>`:`<button class="btn ghost sm" data-act="aDelAsk" data-arg="${esc(a.id)}" aria-label="Delete ${esc(a.title)}">${ic('trash',16)}</button>`}</td></tr>`).join('')||`<tr><td colspan="6"><div class="empty">No activities yet. Add the first one.</div></td></tr>`}</tbody></table></div></div>
 <div class="card row wrapx"><span class="grow"><b style="font-weight:600">Test a reminder on this device</b><div class="sm muted">Checks that notifications reach this phone or computer.</div></span><button class="btn sec sm" data-act="aTest">${ic('bell',16)} Send test</button></div>${actModal()}`)}
function adminShell(body){return `<section class="ehead bluefield small"><div class="wrap" style="padding-bottom:26px"><p class="eyebrow" style="opacity:.85">Organizer</p><div class="row wrapx" style="align-items:flex-end"><h1 class="grow" style="margin-top:10px">Run the <em>day</em></h1>${A_.authed?`<button class="btn glassy sm" data-act="aOut">${ic('out',16)} Sign out</button>`:''}</div></div></section><section class="band tight"><div class="wrap col" style="gap:16px">${body}</div></section>`}
function actModal(){const m=A_.modal;if(!m)return '';const a=m.a,locs=[...ZONES.map(z=>z.id),'Other'],isOther=a.location&&!ZONES.some(z=>z.id===a.location);
 return `<div class="modal-w" data-act="aBg"><form class="modal" data-form="act" role="dialog" aria-modal="true" aria-label="${m.id?'Edit activity':'Add activity'}"><h3>${m.id?'Edit activity':'Add activity'}</h3>
 <div class="field"><label for="f-title">Title</label><input id="f-title" maxlength="80" value="${esc(a.title)}" placeholder="For example, Awards and recognition"><span class="err" data-for="f-title"></span></div>
 <div class="grid2"><div class="field"><label for="f-date">Date</label><input id="f-date" type="date" value="${esc(a.date)}"><span class="err" data-for="f-date"></span></div><div class="field"><label for="f-cat">Category</label><select id="f-cat">${CATEGORIES.map(c=>`<option ${c[0]===a.category?'selected':''}>${c[0]}</option>`).join('')}</select></div></div>
 <div class="grid2"><div class="field"><label for="f-start">Starts (IST)</label><input id="f-start" type="time" value="${esc(a.start)}"><span class="err" data-for="f-start"></span></div><div class="field"><label for="f-end">Ends (IST)</label><input id="f-end" type="time" value="${esc(a.end)}"><span class="err" data-for="f-end"></span></div></div>
 <div class="grid2"><div class="field"><label for="f-loc">Location</label><select id="f-loc">${locs.map(l=>`<option ${(l===a.location||(l==='Other'&&isOther))?'selected':''}>${l}</option>`).join('')}</select></div><div class="field"><label for="f-loc2">Other location</label><input id="f-loc2" maxlength="40" value="${isOther?esc(a.location):''}" placeholder="Only if you chose Other"></div></div>
 <div class="field"><label for="f-desc">Description</label><textarea id="f-desc" rows="3" maxlength="280" placeholder="One or two short sentences">${esc(a.description)}</textarea></div>
 <p class="xs muted">${ic('bell',12)} Everyone with reminders on gets an alert 10 minutes before this starts.</p>
 <div class="row" style="justify-content:flex-end"><button type="button" class="btn sec" data-act="aClose">Cancel</button><button class="btn" type="submit">${m.id?'Save changes':'Add activity'}</button></div></form></div>`}
async function adminTest(){
 if(S.server&&S.cfg.push&&'serviceWorker' in navigator){const reg=SW||await navigator.serviceWorker.getRegistration();const sub=reg&&await reg.pushManager.getSubscription();
  if(sub){const r=await fetch('/api/admin',{method:'POST',headers:adminHeaders(),body:JSON.stringify({subscription:sub})});const j=await r.json().catch(()=>({}));toast(r.ok?'Test sent through the push server.':(j.error||'Could not send the test.'));return}}
 if(notifyStatus()!=='ok'){toast(NOTIFY_HELP[notifyStatus()]);return}
 if(Notification.permission!=='granted'){const p=await Notification.requestPermission();if(p!=='granted'){toast('Allow notifications to run the test.');return}}
 await showLocal('Test reminder','Notifications work on this device.','test');toast('Test shown on this device.')}
