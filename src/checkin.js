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
const LOGO_COLOR='__LOGO_COLOR__';
const passLogo=()=>`<span class="bp-logo" aria-hidden="true"><img src="${LOGO_COLOR}" alt="" width="900" height="279"></span>`;
function passQr(){return passLogo()+(S.pass?qrSvg(S.pass.code):`<span class="qr-ph">${qrSvg('IA11 entry pass',{cls:'qr'})}</span>`)}

async function loadPass(force){if(!S.user||!S.server)return;if(!force&&S.pass&&S.pass.email===S.user.email)return;
 try{const r=await fetch('/api/pass',{cache:'no-store',credentials:'same-origin'});if(!r.ok)return;const p=await r.json();
  S.pass=p;store.set('ia11-pass',p);if(typeof applyPassenger==='function')applyPassenger()}catch(e){}}

/* tapping the QR on the opened pass shows it large, with the name and PIN, ready for the door */
addEventListener('click',e=>{const stub=e.target.closest&&e.target.closest('.env.open .bp-stub,.env.open .bp-portrait');if(!stub)return;e.preventDefault();e.stopPropagation();showPass()},true);
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

function logoImage(){return new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=LOGO_COLOR})}
async function passImage(){
 try{await Promise.all(['300 46px Spectral','600 16px "Inter Tight"','500 11px "Inter Tight"'].map(f=>document.fonts.load(f)))}catch(e){}
 /* a wallet-size pass (340 x 566, drawn at 3x = 1020 x 1698 px) in the ivory and gold of the on-screen pass, on a transparent background */
 const S2=3,W=340,H=566,R=14,cv=document.createElement('canvas');cv.width=W*S2;cv.height=H*S2;const c=cv.getContext('2d');c.scale(S2,S2);
 const INTER='"Inter Tight", Inter, system-ui, sans-serif',SERIF='Spectral, Georgia, serif',track=v=>{try{c.letterSpacing=v}catch(e){}};
 const p=S.pass,name=((p&&p.name)||(S.user&&S.user.name)||'Impacter').toUpperCase(),PX=18;
 const label=(t,x,y,align='left')=>{c.fillStyle='rgba(28,27,27,.55)';c.font=`600 9.5px ${INTER}`;track('1.4px');c.textAlign=align;c.fillText(t.toUpperCase(),x+(align==='right'?1.4:0),y);track('0px');c.textAlign='left'};
 /* card: ivory to gold, a thin Impact Blue stripe along the top */
 c.save();c.beginPath();c.roundRect(0,0,W,H,R);c.clip();
 let g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#FFFDF5');g.addColorStop(.6,'#F7F1E3');g.addColorStop(1,'#EFE5CC');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='#264CD7';c.fillRect(0,0,W,5);c.restore();
 /* header: logo and flight */
 const lg=await logoImage();if(lg){const LH=32,LW=LH*lg.width/lg.height;c.drawImage(lg,PX,16,LW,LH)}
 label('Flight',W-PX,26,'right');c.fillStyle='#9C7A36';c.font=`600 15px ${INTER}`;c.textAlign='right';c.fillText('IA 011',W-PX,45);c.textAlign='left';
 /* route: WRK to PRTY, the dotted line and plane through the middle of the capitals */
 label('From',PX,78);label('To',W-PX,78,'right');
 const BASE=124;c.fillStyle='#264CD7';c.font=`300 46px ${SERIF}`;c.fillText('WRK',PX,BASE);const wL=c.measureText('WRK').width;
 c.textAlign='right';c.fillText('PRTY',W-PX,BASE);const wR=c.measureText('PRTY').width;c.textAlign='left';
 const cap=c.measureText('H').actualBoundingBoxAscent||46*.66,LY=BASE-cap/2;
 const L1=PX+wL+10,L2=W-PX-wR-10,MX=(L1+L2)/2;
 c.setLineDash([3,3]);c.strokeStyle='#C9A24A';c.lineWidth=2;c.beginPath();c.moveTo(L1,LY);c.lineTo(MX-14,LY);c.moveTo(MX+14,LY);c.lineTo(L2,LY);c.stroke();c.setLineDash([]);
 c.save();c.translate(MX,LY);c.rotate(Math.PI/2);c.scale(.95,.95);c.translate(-12,-12);c.fillStyle='#C9A24A';c.fill(new Path2D(PLANE_PATH));c.restore();
 c.fillStyle='rgba(28,27,27,.62)';c.font=`500 11px ${INTER}`;
 c.fillText('Smartworks,',PX,148);c.fillText('Global Tech Park',PX,162);c.textAlign='right';c.fillText('Hilton, Embassy',W-PX,148);c.fillText('TechVillage',W-PX,162);c.textAlign='left';
 /* passenger, date, boarding time */
 label('Passenger',PX,196);c.fillStyle='#1C1B1B';c.font=`600 15.5px ${INTER}`;let t=name;while(c.measureText(t).width>W-PX*2&&t.length>4)t=t.slice(0,-2)+'…';c.fillText(t,PX,216);
 label('Date',PX,246);label('Boarding time',W-PX,246,'right');c.fillStyle='#1C1B1B';c.font=`600 15.5px ${INTER}`;c.fillText('17 Dec 2026',PX,266);c.textAlign='right';c.fillText('10:00',W-PX,266);c.textAlign='left';
 /* tear line with notches cut out of the card */
 const TY=292;c.setLineDash([4,3]);c.strokeStyle='rgba(28,27,27,.28)';c.lineWidth=1.2;c.beginPath();c.moveTo(14,TY);c.lineTo(W-14,TY);c.stroke();c.setLineDash([]);
 c.save();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(0,TY,9,0,Math.PI*2);c.arc(W,TY,9,0,Math.PI*2);c.fill();c.restore();
 /* AROUND THE WORLD IN 11 YEARS, centred above the QR */
 c.fillStyle='#9C7A36';c.font=`600 10.5px ${INTER}`;track('2px');c.textAlign='center';c.fillText('AROUND THE WORLD IN 11 YEARS',W/2+1,322);track('0px');
 /* entry QR on white */
 const QB=192,QX=(W-QB)/2,QY=338;c.fillStyle='#FFFFFF';c.beginPath();c.roundRect(QX,QY,QB,QB,10);c.fill();c.strokeStyle='rgba(28,27,27,.08)';c.lineWidth=1;c.stroke();
 if(p&&p.code)drawQr(c,p.code,QX+6,QY+6,QB-12);else{c.fillStyle='#1C1B1B';c.font=`300 64px ${SERIF}`;c.fillText('11',W/2,QY+QB/2+22)}
 c.fillStyle='rgba(28,27,27,.55)';c.font=`600 10.5px ${INTER}`;track('1.7px');c.textAlign='center';c.fillText('SCAN AT THE ENTRANCE',W/2+1,QY+QB+24);track('0px');c.textAlign='left';
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

/* ---------- phones: the portrait pass (the same image as the download) is what comes out of the envelope ---------- */
const PHONE_PASS=matchMedia('(max-width:900px)');let PP_KEY='';
async function mountPortraitPass(){const card=$('.env-card');if(!card)return;
 if(!PHONE_PASS.matches){if(card.classList.contains('portrait')){card.classList.remove('portrait');card.innerHTML=boardingPass()}return}
 const key=(S.pass&&S.pass.code)||'none';if(key===PP_KEY&&card.querySelector('.bp-portrait'))return;PP_KEY=key;
 try{const cv=await passImage();const url=cv.toDataURL('image/png');const c2=$('.env-card');if(!c2)return;
  c2.classList.add('portrait');c2.innerHTML=`<img class="bp-portrait" src="${url}" alt="Your boarding pass" width="340" height="566">`}catch(e){}}
PHONE_PASS.addEventListener('change',()=>{PP_KEY='';mountPortraitPass()});
