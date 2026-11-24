/* =====================================================================
   Entry passes: each signed-in person's QR (name + email + fixed 6-digit PIN), drawn in the site's style,
   and the organiser check-in scanner (camera + typed PIN fallback).
   ===================================================================== */

/* the person's pass, kept on the device so it still shows with weak venue Wi-Fi */
S.pass=(()=>{const p=store.get('ia11-pass',null);return p&&S.user&&p.email===S.user.email?p:null})();

/** A QR code as SVG: rounded dots, rounded eyes and the gold "11" badge (error correction H covers the badge). */
function qrSvg(text,{badge=true,cls='qr'}={}){
 qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];
 const q=qrcode(0,'H');q.addData(text,'Byte');q.make();
 const n=q.getModuleCount(),Q=4,N=n+Q*2,k=Math.max(5,Math.round(n*.22))|1,s=(n-k)>>1;
 const finder=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7),hole=(r,c)=>badge&&r>=s&&r<s+k&&c>=s&&c<s+k;
 let dots='';for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!q.isDark(r,c)||finder(r,c)||hole(r,c))continue;dots+=`<rect x="${c+Q+.06}" y="${r+Q+.06}" width=".88" height=".88" rx=".38"/>`}
 /* gentle rounding on the eyes keeps every eye module solid, so strict scanners read them too */
 const eye=(r,c)=>`<rect x="${c+Q}" y="${r+Q}" width="7" height="7" rx="1"/><rect x="${c+Q+1}" y="${r+Q+1}" width="5" height="5" rx=".55" fill="#fff"/><rect x="${c+Q+2}" y="${r+Q+2}" width="3" height="3" rx=".6"/>`;
 const cx=Q+s+k/2,R=k/2-.4;
 const b=badge?`<circle cx="${cx}" cy="${cx}" r="${R}" fill="#D4AF61"/><circle cx="${cx}" cy="${cx}" r="${(R*.84).toFixed(2)}" fill="#1C1B1B"/><text x="${cx}" y="${(cx+R*.37).toFixed(2)}" text-anchor="middle" font-family="Spectral,Georgia,serif" font-size="${(R*1.05).toFixed(2)}" fill="#D4AF61">11</text>`:'';
 return `<svg class="${cls}" viewBox="0 0 ${N} ${N}" role="img" aria-label="Entry QR code" shape-rendering="geometricPrecision"><rect width="${N}" height="${N}" rx="2" fill="#fff"/><g fill="#1C1B1B">${dots}${eye(0,0)}${eye(0,n-7)}${eye(n-7,0)}</g>${b}</svg>`}

/** The boarding-pass stub: the person's QR, or a faded sample until their pass has loaded. */
function passQr(){return S.pass?qrSvg(S.pass.code):`<span class="qr-ph">${qrSvg('IA11 entry pass',{cls:'qr'})}</span>`}

async function loadPass(force){if(!S.user||!S.server)return;if(!force&&S.pass&&S.pass.email===S.user.email)return;
 try{const r=await fetch('/api/pass',{cache:'no-store',credentials:'same-origin'});if(!r.ok)return;const p=await r.json();
  S.pass=p;store.set('ia11-pass',p);if(typeof applyPassenger==='function')applyPassenger()}catch(e){}}

/* tapping the QR on the opened pass shows it large, with the name and PIN, ready for the door */
addEventListener('click',e=>{const stub=e.target.closest&&e.target.closest('.env.open .bp-stub');if(!stub)return;e.preventDefault();e.stopPropagation();showPass()},true);
function showPass(){if(!S.pass){toast(S.user?'Your entry pass is loading. Try again in a moment.':'Sign in to get your entry pass.');return}
 const p=S.pass,w=document.createElement('div');w.className='modal-w how-w pass-w';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Your entry pass');
 w.innerHTML=`<div class="modal how pass-big"><div class="how-h"><h3>Your entry pass</h3><button class="icon-btn how-x" aria-label="Close">${ic('x',18)}</button></div>
  <div class="pb-qr">${qrSvg(p.code)}</div>
  <div class="pb-who"><b>${esc(p.name)}</b><span>${esc(p.email)}</span></div>
  <div class="pb-pin"><small>PIN</small><b class="tn">${p.pin.slice(0,3)} ${p.pin.slice(3)}</b></div>
  <p class="pb-note">Show this at the entrance on 17 December. Turn your screen brightness up.</p></div>`;
 const close=()=>{w.remove();document.removeEventListener('keydown',k)},k=e=>{if(e.key==='Escape')close()};
 w.addEventListener('click',e=>{if(e.target===w||e.target.closest('.how-x'))close()});document.addEventListener('keydown',k);document.body.append(w)}

/* ---------- organiser check-in scanner ---------- */
let CK=null;
function loadJsQR(){return window.jsQR?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='/jsqr.js';s.onload=ok;s.onerror=no;document.head.append(s)})}
async function openCheckin(){if(CK)return;
 const w=document.createElement('div');w.className='ck-w';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Entrance check-in');
 w.innerHTML=`<div class="ck"><div class="ck-h"><h3>Entrance check-in</h3><span class="ck-count tn"></span><button class="icon-btn ck-x" aria-label="Close scanner">${ic('x',18)}</button></div>
  <div class="ck-cam"><video playsinline muted></video><span class="ck-aim" aria-hidden="true"></span><p class="ck-msg">Starting the camera…</p></div>
  <div class="ck-res" role="status" aria-live="assertive"></div>
  <form class="ck-pin"><label for="ck-pin">Or type their 6-digit PIN</label><div class="row"><input id="ck-pin" inputmode="numeric" autocomplete="off" maxlength="7" placeholder="123 456"><button class="btn" type="submit">Check in</button></div></form></div>`;
 document.body.append(w);
 const video=w.querySelector('video'),msg=w.querySelector('.ck-msg'),res=w.querySelector('.ck-res'),count=w.querySelector('.ck-count');
 CK={w,stream:null,timer:0,last:'',lastAt:0,busy:false};
 const show=(kind,title,sub)=>{res.className='ck-res '+kind;res.innerHTML=`<b>${esc(title)}</b>${sub?`<span>${esc(sub)}</span>`:''}`;if(navigator.vibrate)navigator.vibrate(kind==='ok'?60:[40,60,40])};
 const tally=j=>{if(j&&typeof j.passes==='number')count.textContent=`${j.checkedIn} of ${j.passes} checked in`};
 async function check(body){if(CK.busy)return;CK.busy=true;
  try{const r=await fetch('/api/admin',{method:'POST',headers:adminHeaders(),body:JSON.stringify({action:'checkin',...body})});const j=await r.json().catch(()=>({}));
   if(r.status===401&&!j.reason){show('bad','Organizer sign-in expired','Close the scanner and sign in again.');return}
   if(j.ok&&!j.already)show('ok','Welcome, '+j.name,j.email);
   else if(j.ok)show('warn','Already checked in · '+j.name,'First scanned at '+new Date(j.at).toLocaleTimeString('en-IN',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}));
   else show('bad',j.error||'Not a valid pass','');tally(j)}
  catch(e){show('bad','No connection','Check the Wi-Fi and scan again.')}
  finally{setTimeout(()=>{if(CK)CK.busy=false},1200)}}
 w.querySelector('.ck-pin').addEventListener('submit',e=>{e.preventDefault();const i=w.querySelector('#ck-pin'),pin=i.value.replace(/\D/g,'');if(pin.length!==6){show('bad','A PIN has 6 digits','');return}i.value='';CK.busy=false;check({pin})});
 const close=()=>{if(!CK)return;clearTimeout(CK.timer);CK.stream&&CK.stream.getTracks().forEach(t=>t.stop());w.remove();CK=null};
 w.querySelector('.ck-x').addEventListener('click',close);
 fetch('/api/admin',{headers:adminHeaders(),cache:'no-store'}).then(r=>r.json()).then(tally).catch(()=>{});
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg.textContent='This browser cannot use the camera here. Type the PIN instead.';return}
 try{CK.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}},audio:false});video.srcObject=CK.stream;await video.play();msg.textContent='Point the camera at the QR code'}
 catch(e){msg.textContent='Camera blocked. Allow camera access for this site, or type the PIN.';return}
 let detector=null;try{if('BarcodeDetector' in window&&(await BarcodeDetector.getSupportedFormats()).includes('qr_code'))detector=new BarcodeDetector({formats:['qr_code']})}catch(e){}
 if(!detector){try{await loadJsQR()}catch(e){msg.textContent='The scanner could not load. Type the PIN instead.';return}}
 const cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});
 const tick=async()=>{if(!CK)return;
  if(!CK.busy&&video.readyState>=2){let text='';
   try{if(detector){const r=await detector.detect(video);text=r[0]&&r[0].rawValue||''}
    else{const W=Math.min(800,video.videoWidth),H=Math.round(video.videoHeight*W/video.videoWidth);cv.width=W;cv.height=H;cx.drawImage(video,0,0,W,H);const r=jsQR(cx.getImageData(0,0,W,H).data,W,H,{inversionAttempts:'dontInvert'});text=r&&r.data||''}}catch(e){}
   /* the same code is checked again only after it has been out of view for 3 seconds (no repeat results while it is held up) */
   const now=Date.now();if(text){const fresh=!(text===CK.last&&now-CK.lastAt<3000);CK.last=text;CK.lastAt=now;if(fresh)check({code:text})}}
  CK&&(CK.timer=setTimeout(tick,160))};
 tick()}
