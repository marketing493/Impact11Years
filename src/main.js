/* ---------- quiz timer ---------- */
setInterval(()=>{const r=S.run;if(!r||r.done||r.picked!==null||S.ov?.type!=='quiz'||S.lvlup)return;r.t=Math.max(0,r.t-.1);
 const ring=$('#qring'),sec=$('#qsec'),tm=$('#qtimer');if(ring){const c=2*Math.PI*24;ring.setAttribute('stroke-dashoffset',c*(1-r.t/20))}if(sec)sec.textContent=Math.ceil(r.t);if(tm)tm.classList.toggle('low',r.t<6);
 if(r.t<=0)pickAnswer(-1)},100);
function pickAnswer(i){const r=S.run,q=QZ.find(x=>x.id===r.id),cur=q.qs[r.i];r.picked=i;r.bump=false;
 if(i===cur.a){r.combo++;r.best=Math.max(r.best,r.combo);const bonus=Math.round(r.t/20*20),gain=Math.round((40+bonus)*mult(r.combo));r.bonus+=bonus;r.pts+=gain;r.last=gain;r.ok++;r.steps[r.i]='ok';r.bump=r.combo>=2;pop('+'+gain)}
 else{r.combo=0;r.steps[r.i]='bad'}
 render()}

/* ---------- actions ---------- */
const A={
 mode(a){S.mode=a;S.modal=null;try{history.replaceState(null,'','#'+({emp:'employee',adm:'admin',live:'stage'})[a])}catch(e){}scrollTo({top:0})},
 reset(){S=fresh(S.mode);FLASH=[];try{localStorage.removeItem(STORE)}catch(e){}toast('Demo reset')},
 tab(a){S.tab=a;S.ov=null},
 seg(a){const [ns,v]=a.split(':');if(ns==='annCat')S.annCat=v;else S.seg[ns]=v},
 quick(a){const [k,v]=a.split(':');S.lvlup=null;if(S.mode!=='emp')S.mode='emp';
  if(k==='ov'){if(v==='quiz')return;S.ov={type:v}}else if(['event','play','ranks','me','home'].includes(k)){S.ov=null;S.tab=k;if(v)S.seg[k==='ranks'?'rank':k]=v}},
 go(a){const [k,...rest]=a.split(':');A[k](rest.join(':'))},
 close(){S.ov=null;S.run=null;S.g=null},
 claim(id){const q=QUESTS.find(x=>x[0]===id);S.claimed[id]=1;award(q[2],'Quest: '+q[1]);if(QUESTS.every(x=>S.claimed[x[0]])){setTimeout(()=>{confetti();toast('Every quest done for today','check')},300)}},
 annread(id){if(S.read[id]!==1){S.read[id]=1;S.readTaps++;if(S.readTaps===2)toast('Quest complete. Claim it on Home.','check')}},
 qstart(id){if(S.quizDone[id]){toast('You already played this quiz. One attempt each.');return}S.run={id,i:0,t:20,picked:null,ok:0,combo:0,best:0,pts:0,bonus:0,last:0,steps:[],rank0:rankOf()};S.ov={type:'quiz'};S.mode='emp'},
 pick(a){if(S.run&&S.run.picked===null)pickAnswer(+a)},
 qnext(){const r=S.run,q=QZ.find(x=>x.id===r.id);if(r.i<q.qs.length-1){r.i++;r.t=20;r.picked=null;r.bump=false;return}
  r.done=true;S.quizDone[r.id]={pts:r.pts,ok:r.ok,best:r.best};if(r.id==='daily')S.streak++;award(r.pts,q.n);if(r.ok>=3)setTimeout(()=>confetti(),120)},
 gstart(id){S.ov={type:'game',id};if(ROUNDS[id])S.g={i:0,picked:null,score:0}},
 gpick(a){const G=S.g,rd=ROUNDS[S.ov.id][G.i];if(G.picked!==null)return;G.picked=+a;if(+a===rd.a){G.score+=50;pop('+50')}},
 gnext(){const G=S.g,R=ROUNDS[S.ov.id];if(G.i<R.length-1){G.i++;G.picked=null;return}const g=GAMES.find(x=>x.id===S.ov.id);S.gameDone[S.ov.id]=G.score;if(G.score)award(G.score,g.n);else toast('No points this time. Try another game.')},
 bcell(a){const i=+a;if(i===12)return;S.bingo=S.bingo.includes(i)?S.bingo.filter(x=>x!==i):[...S.bingo,i]},
 bclaim(){S.gameDone.bingo=150;award(150,'Office Bingo');confetti()},
 vote(a){S.vote=+a;S.votes[+a]++;toast('Vote counted. Claim the quest on Home.','check')},
 selfcheck(){S.checked=true;const t=new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false});S.cin.unshift({n:ME().name,t});award(50,'Checked in at the venue');confetti()},
 dpick(a){if(S.drop)return;const r=seeded(Date.now()),v=[...DROP_VALUES];for(let i=v.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[v[i],v[j]]=[v[j],v[i]]}S.drop={pick:+a,vals:v};S.dropAnim=true;award(v[+a],'Cell Drop');if(v[+a]===111)setTimeout(()=>confetti(),500)},
 lvlok(){S.lvlup=null},
 sim(){if(S.freeze)return;const r=Math.random;S.deltas={};const pool=S.emp.filter(e=>e!==ME());for(let k=0;k<4;k++){const e=pool[Math.floor(r()*pool.length)],n=60+Math.floor(r()*8)*20;e.pts+=n;S.deltas[e.name]='+'+n;addCells(n/10)}S.flip=true;setTimeout(()=>{S.deltas=null},50)},
 setpush(){S.push=!S.push;toast(S.push?'Push notifications on':'Push notifications off')},
 toast(m){toast(m)},
 /* admin */
 ap(a){S.ap=a;S.q=''},amode(a){S.mode='adm';S.ap=a},
 modal(a){const [t,i]=a.split(':');S.modal={type:t,i:+i}},mclose(){S.modal=null},mbg(a,el,ev){if(ev.target===el)S.modal=null;else return false},
 pub(a){const [k,i]=a.split(':'),rows=k==='announcements'?S.ann:S.d[k],r=rows[+i];r.status=r.status==='Published'?(k==='gallery'?'Pending':'Draft'):'Published';toast(`${r.status==='Published'?'Published':'Unpublished'}. Written to the audit log.`)},
 sub(a){const [i,st]=a.split(':'),s=S.d.submissions[+i];s.status=st;if(st==='Approved'){const e=S.emp.find(x=>x.name===s.by);if(e)award(50,s.game+' entry approved',e,S.role);toast(`Approved. ${s.by} earned 50 points.`)}else toast('Rejected. The entry stays hidden.')},
 freeze(){S.freeze=!S.freeze;toast(S.freeze?'Leaderboard frozen for employees':'Leaderboard is live again')},
 ascan(){const e=S.emp[+$('#ci-e').value];if(S.cin.some(c=>c.n===e.name)){toast(`${e.name} is already checked in. No new row written.`);return false}const t=new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false});S.cin.unshift({n:e.name,t});if(e===ME())S.checked=true;award(50,'Checked in at the venue',e,'Scan station');toast(`${e.name} checked in. 50 points added.`)},
 live(a){S.live=a;S.reveal=false},lstep(a){const i=SCREENS.findIndex(x=>x[0]===S.live);S.live=SCREENS[(i+ +a+SCREENS.length)%SCREENS.length][0];S.reveal=false},
 reveal(){S.reveal=!S.reveal},lqn(){S.lq++;S.reveal=false},auto(){S.auto=!S.auto}};

document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const r=el.getBoundingClientRect();LAST={x:r.left+r.width/2,y:r.top+r.height/2};
 const f=A[el.dataset.act];if(!f)return;if(f(el.dataset.arg,el,e)===false)return;render()});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();const id=f.dataset.form;const btn=f.querySelector('[type=submit]');if(btn){const r=btn.getBoundingClientRect();LAST={x:r.left+r.width/2,y:r.top+r.height/2}}
 if(id==='sub'){const v=$('#sub-t').value.trim();if(v.length<3){$('#sub-e').textContent='Write at least three characters.';return}const g=GAMES.find(x=>x.id===S.ov.id);S.d.submissions.unshift({id:Date.now(),game:g.n,by:ME().name,text:v,status:'Pending'});S.gameDone[S.ov.id]='sent';award(50,g.n+' entry')}
 if(id==='award'){const n=$('#p-n').value.trim(),x=Number(n);if(!/^\d+$/.test(n)||x<1||x>500){$('#p-ne').textContent='Enter a whole number from 1 to 500.';return}const emp=S.emp[+$('#p-e').value];award(x,$('#p-r').value,emp,S.role);S.modal=null;toast(`${x} points awarded to ${emp.name}`)}
 if(id==='role'){const emp=S.emp[S.modal.i];emp.role=$('#r-r').value;S.modal=null;toast(`${emp.name} is now ${emp.role}`)}
 if(id==='ann'){const t=$('#n-t').value.trim();if(t.length<4){$('#n-te').textContent='Give the announcement a title of at least four characters.';return}S.ann.unshift({id:'a'+Date.now(),title:t,cat:$('#n-c').value,body:$('#n-b').value.trim()||'More details soon.',date:'Today',status:'Published'});S.modal=null;toast('Published. It now shows in the employee app.')}
 render()});
document.addEventListener('input',e=>{if(e.target.id==='asearch'){S.q=e.target.value;S.refocus=true;render()}});
document.addEventListener('change',e=>{if(e.target.id==='arole'){S.role=e.target.value;if(!can(S.ap))S.ap='dashboard';toast('Viewing as '+S.role);render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.modal){S.modal=null;render();return}
 if(S.mode==='live'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){A.lstep(e.key==='ArrowRight'?1:-1);render()}});
addEventListener('hashchange',()=>{const m=hashMode[location.hash.slice(1)];if(m&&m!==S.mode){S.mode=m;render()}});

/* ---------- render ---------- */
function render(){
 const sc=$('.scr'),key=sc&&sc.dataset.key,top=sc?sc.scrollTop:0;
 let rects=null;if(S.flip){rects={};$$('[data-flip]').forEach(el=>rects[el.dataset.flip]=el.getBoundingClientRect().top)}
 $('#app').innerHTML=S.mode==='emp'?vEmp():S.mode==='adm'?vAdmin():vLive();
 $$('.bar .seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.arg===S.mode));
 const n=$('.scr');if(n&&n.dataset.key===key)n.scrollTop=top;
 if(S.refocus){S.refocus=false;const s=$('#asearch');if(s){s.focus();s.setSelectionRange(s.value.length,s.value.length)}}
 if(rects&&!RM.matches){$$('[data-flip]').forEach(el=>{const o=rects[el.dataset.flip],now=el.getBoundingClientRect().top;el.animate(o===undefined?[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}]:[{transform:`translateY(${o-now}px)`,background:'var(--orange-tint)'},{transform:'none'}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)'})})}
 S.flip=false;
 if(S.dropAnim){S.dropAnim=false;const d=S.drop;$$('.dcell').forEach(el=>{el.classList.remove('flip','ghost')});requestAnimationFrame(()=>requestAnimationFrame(()=>{const mine=$(`.dcell[data-i="${d.pick}"]`);mine&&mine.classList.add('flip');setTimeout(()=>$$('.dcell').forEach(el=>{if(+el.dataset.i!==d.pick)el.classList.add('flip','ghost')}),900)}))}
 const got=earned(),nb=got.filter(b=>!S.seen.includes(b));if(nb.length){S.seen=[...S.seen,...nb];setTimeout(()=>toast("Badge unlocked: "+nb.join(', '),'star'),S.lvlup?600:900)}
 if(S.lvlup&&!S.lvlShown){S.lvlShown=S.lvlup;setTimeout(()=>{const p=$('.phone');if(p){const r=p.getBoundingClientRect();LAST={x:r.left+r.width/2,y:r.top+r.height*.35}}confetti(180)},150)}
 if(!S.lvlup)S.lvlShown=null;
 tickCd();paintGrids();save()}
render();
