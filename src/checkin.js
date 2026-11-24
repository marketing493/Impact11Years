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

/* ---------- download the boarding pass as a high-resolution image (3000 x 1300 px) ---------- */
const PLANE_PATH='M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z';
/** The entry QR drawn straight onto a canvas, in the same style as on screen. */
function drawQr(c,text,x,y,size){
 qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];const q=qrcode(0,'H');q.addData(text,'Byte');q.make();
 const n=q.getModuleCount(),Q=3,N=n+Q*2,u=size/N,k=Math.max(5,Math.round(n*.22))|1,s=(n-k)>>1;
 const finder=(r,cc)=>(r<7&&cc<7)||(r<7&&cc>=n-7)||(r>=n-7&&cc<7),hole=(r,cc)=>r>=s&&r<s+k&&cc>=s&&cc<s+k;
 const rr=(X,Y,W,H,R,fill)=>{c.beginPath();c.roundRect(X,Y,W,H,R);c.fillStyle=fill;c.fill()};
 rr(x,y,size,size,u*1.5,'#FFFFFF');
 for(let r=0;r<n;r++)for(let cc=0;cc<n;cc++){if(!q.isDark(r,cc)||finder(r,cc)||hole(r,cc))continue;rr(x+(cc+Q+.06)*u,y+(r+Q+.06)*u,u*.88,u*.88,u*.38,'#1C1B1B')}
 for(const [r,cc] of [[0,0],[0,n-7],[n-7,0]]){const X=x+(cc+Q)*u,Y=y+(r+Q)*u;rr(X,Y,7*u,7*u,u,'#1C1B1B');rr(X+u,Y+u,5*u,5*u,u*.55,'#FFFFFF');rr(X+2*u,Y+2*u,3*u,3*u,u*.6,'#1C1B1B')}
 const cx=x+(Q+s+k/2)*u,cy=y+(Q+s+k/2)*u,R=(k/2-.4)*u;
 c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.fillStyle='#D4AF61';c.fill();c.beginPath();c.arc(cx,cy,R*.84,0,Math.PI*2);c.fillStyle='#1C1B1B';c.fill();
 c.fillStyle='#D4AF61';c.font=`400 ${R*1.05}px Spectral, Georgia, serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('11',cx,cy+R*.04);c.textAlign='left';c.textBaseline='alphabetic'}

async function passImage(){
 try{await Promise.all(['300 120px Spectral','400 120px Spectral','600 40px "Inter Tight"','500 40px "Inter Tight"'].map(f=>document.fonts.load(f)))}catch(e){}
 const S2=2,W=1500,H=650,cv=document.createElement('canvas');cv.width=W*S2;cv.height=H*S2;const c=cv.getContext('2d');c.scale(S2,S2);
 const INTER='"Inter Tight", Inter, system-ui, sans-serif',SERIF='Spectral, Georgia, serif',track=v=>{try{c.letterSpacing=v}catch(e){}};
 /* backdrop: the site's blue-to-ink gradient with a soft Impact Blue glow */
 let g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#264CD7');g.addColorStop(.6,'#22388C');g.addColorStop(1,'#1C1B1B');c.fillStyle=g;c.fillRect(0,0,W,H);
 g=c.createRadialGradient(W*.3,H*.45,0,W*.3,H*.45,W*.6);g.addColorStop(0,'rgba(38,76,215,.9)');g.addColorStop(1,'rgba(38,76,215,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.strokeStyle='rgba(212,175,97,.8)';c.lineWidth=1.5;c.beginPath();c.roundRect(18,18,W-36,H-36,18);c.stroke();
 /* ticket */
 const X=110,Y=110,TW=1280,TH=430,SX=X+TW-300,NR=18;
 c.save();c.shadowColor='rgba(8,14,48,.55)';c.shadowBlur=40;c.shadowOffsetY=18;
 const shape=()=>{c.beginPath();c.moveTo(X+24,Y);c.lineTo(SX-NR,Y);c.arc(SX,Y,NR,Math.PI,0,true);c.lineTo(X+TW-24,Y);c.arcTo(X+TW,Y,X+TW,Y+24,24);c.lineTo(X+TW,Y+TH-24);c.arcTo(X+TW,Y+TH,X+TW-24,Y+TH,24);
  c.lineTo(SX+NR,Y+TH);c.arc(SX,Y+TH,NR,0,Math.PI,true);c.lineTo(X+24,Y+TH);c.arcTo(X,Y+TH,X,Y+TH-24,24);c.lineTo(X,Y+24);c.arcTo(X,Y,X+24,Y,24);c.closePath()};
 g=c.createLinearGradient(X,Y,X+TW,Y+TH);g.addColorStop(0,'#FFFDF5');g.addColorStop(.6,'#F7F1E3');g.addColorStop(1,'#EFE5CC');shape();c.fillStyle=g;c.fill();c.restore();
 c.save();shape();c.clip();c.fillStyle='#264CD7';c.fillRect(X,Y,TW,7);c.restore();
 c.setLineDash([7,7]);c.strokeStyle='rgba(28,27,27,.3)';c.lineWidth=2;c.beginPath();c.moveTo(SX,Y+NR+6);c.lineTo(SX,Y+TH-NR-6);c.stroke();c.setLineDash([]);
 const p=S.pass,name=(p&&p.name)||(S.user&&S.user.name)||'Impacter';
 /* header row */
 c.save();c.translate(X+46,Y+44);c.rotate(Math.PI/2);c.scale(1.1,1.1);c.translate(-12,-12);c.fillStyle='#264CD7';c.fill(new Path2D(PLANE_PATH));c.restore();
 c.font=`600 21px ${INTER}`;track('3px');c.fillStyle='#264CD7';c.fillText('IMPACT ANALYTICS',X+70,Y+52);
 c.fillStyle='#9C7A36';c.textAlign='right';c.fillText('FLIGHT IA 011',SX-40,Y+52);c.textAlign='left';track('0px');
 /* route */
 c.fillStyle='#264CD7';c.font=`300 92px ${SERIF}`;c.fillText('WORK',X+40,Y+160);c.textAlign='right';c.fillText('GALA',SX-40,Y+160);c.textAlign='left';
 c.fillStyle='rgba(28,27,27,.62)';c.font=`500 20px ${INTER}`;c.fillText('11 Years of Hustle',X+42,Y+196);c.textAlign='right';c.fillText('11 Years of Impact',SX-42,Y+196);c.textAlign='left';
 const L1=X+340,L2=SX-320,LY=Y+128;const MX=(L1+L2)/2;c.setLineDash([10,11]);c.strokeStyle='#C9A24A';c.lineWidth=3;c.beginPath();c.moveTo(L1,LY);c.lineTo(MX-38,LY);c.moveTo(MX+38,LY);c.lineTo(L2,LY);c.stroke();c.setLineDash([]);
 c.save();c.translate((L1+L2)/2,LY);c.rotate(Math.PI/2);c.scale(1.9,1.9);c.translate(-12,-12);c.fillStyle='#C9A24A';c.fill(new Path2D(PLANE_PATH));c.restore();
 c.strokeStyle='rgba(28,27,27,.12)';c.lineWidth=1.5;c.beginPath();c.moveTo(X+40,Y+240);c.lineTo(SX-40,Y+240);c.stroke();
 /* details */
 const cols=[[X+42,'PASSENGER',name.toUpperCase()],[X+520,'DATE','17 Dec 2026'],[X+700,'BOARDS','10:00'],[X+840,'GATE','Hilton ETV']];
 for(const [cx,k,v] of cols){c.fillStyle='rgba(28,27,27,.55)';c.font=`600 15px ${INTER}`;track('2.5px');c.fillText(k,cx,Y+292);track('0px');c.fillStyle='#1C1B1B';c.font=`600 ${k==='PASSENGER'?27:25}px ${INTER}`;
  let t=v;if(k==='PASSENGER'){while(c.measureText(t).width>440&&t.length>4)t=t.slice(0,-2)+'…'}c.fillText(t,cx,Y+332)}
 c.fillStyle='rgba(28,27,27,.5)';c.font=`500 16px ${INTER}`;c.fillText(EVENT.venue+', '+EVENT.area,X+42,Y+392);
 /* stub: the entry QR */
 const QS=236;if(p&&p.code)drawQr(c,p.code,SX+(300-QS)/2,Y+(TH-QS)/2-14,QS);
 else{c.fillStyle='#1C1B1B';c.font=`300 120px ${SERIF}`;c.textAlign='center';c.fillText('11',SX+150,Y+TH/2+30);c.textAlign='left'}
 c.fillStyle='rgba(28,27,27,.55)';c.font=`600 14px ${INTER}`;track('2.5px');c.textAlign='center';c.fillText(p&&p.pin?'PIN '+p.pin.slice(0,3)+' '+p.pin.slice(3):'ENTRY PASS',SX+150,Y+TH-30);c.textAlign='left';track('0px');
 /* footer line */
 c.fillStyle='#F7E3A1';c.font=`600 19px ${INTER}`;track('4px');c.textAlign='center';c.fillText('11 YEARS OF IMPACT  ·  AROUND THE WORLD  ·  17 DECEMBER 2026',W/2,H-62);c.textAlign='left';track('0px');
 return cv}

async function downloadPass(){
 const btn=$('[data-act="downloadPass"]');btn&&btn.setAttribute('aria-busy','true');
 try{const cv=await passImage();const blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob)throw 0;
  const who=((S.pass&&S.pass.name)||(S.user&&S.user.name)||'impacter').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const name=`11-years-of-impact-boarding-pass-${who}.png`,file=new File([blob],name,{type:'image/png'});
  /* phones: the share sheet (Save Image on iPhone); computers: a normal download */
  if(matchMedia('(pointer: coarse)').matches&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'My boarding pass'});return}catch(e){if(e&&e.name==='AbortError')return}}
  const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('Boarding pass downloaded.')}
 catch(e){toast('Could not create the image. Please try again.')}
 finally{btn&&btn.removeAttribute('aria-busy')}}
