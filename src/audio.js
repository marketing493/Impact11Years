/* ---------- the story score ----------
 An original ambient piece generated live with Web Audio. No audio files.
 Warm detuned pad, a soft sub, a plucked arpeggio through a dotted-eighth echo, and a chime on every chapter change.
 Each chapter has its own chord; the arpeggio gets busier as the story builds to the final, brightest chord.
 Browsers only allow sound after a tap, so it starts from the "Play the score" button. */
const CHORDS=[
 [50,57,62,64,66,69],      /* D add9: an idea */
 [47,54,59,61,62,66],      /* B minor 9: hustle */
 [43,50,55,59,61,66],      /* G major 7 #11: decisions */
 [45,52,57,59,61,64],      /* A sus: one team */
 [42,49,54,57,61,64],      /* F# minor 7: eleven years */
 [38,50,57,62,64,66,71]];  /* D 6/9: celebrate */
const DENSITY=[.45,.6,.75,.85,.9,1];
const mtof=m=>440*Math.pow(2,(m-69)/12);

class StoryScore{
 constructor(){this.on=false;this.ctx=null;this.ch=0;this.visible=false;this.voices=[];this.listeners=new Set();this.blocked=false;
  this.muted=(()=>{try{return localStorage.getItem('ia11-muted')==='1'}catch(e){return false}})();
  this.unlockOnFirstGesture()}
 /* Browsers (Safari especially) only let a page make sound if its audio was started inside a tap, click or key press.
    So the very first gesture anywhere on the page (the boarding-pass button, the seal, a link...) quietly creates and
    unlocks the audio. Then, when the visitor later scrolls into a story section, the score can start on its own. */
 unlockOnFirstGesture(){const ev=['pointerdown','pointerup','touchend','mousedown','keydown','click'];
  const unlock=()=>{if(this.muted||!this.supported)return done();if(!this.ctx&&!this.init())return done();const c=this.ctx;
   try{const b=c.createBuffer(1,1,22050),src=c.createBufferSource();src.buffer=b;src.connect(c.destination);src.start(0)}catch(e){}
   c.resume().then(()=>{if(c.state!=='running')return;done();
    if(this.visible&&!this.on&&!this.muted&&!document.hidden)this.start();else if(!this.on||!this.visible)setTimeout(()=>{if(!(this.on&&this.visible))c.suspend()},400)}).catch(()=>{})};
  const done=()=>ev.forEach(e=>removeEventListener(e,unlock,true));
  ev.forEach(e=>addEventListener(e,unlock,{capture:true,passive:true}))}
 /* Browsers allow sound only after the visitor has tapped, clicked or pressed a key on the page.
    If that has not happened yet, wait for the first such gesture and start then. */
 start(){if(!this.ctx&&!this.init())return;this.on=true;const c=this.ctx;
  const go=()=>{if(c.state!=='running')c.resume().catch(()=>{});};go();this.setChord(this.ch,true);this.fade();
  setTimeout(()=>{this.blocked=c.state!=='running';if(this.blocked)this.arm();this.emit()},120);this.emit()}
 arm(){if(this.armed)return;this.armed=true;const kick=()=>{this.armed=false;['pointerdown','pointerup','touchend','mousedown','keydown','click'].forEach(e=>removeEventListener(e,kick,true));
   if(!this.on||!this.ctx)return;this.ctx.resume().then(()=>{this.blocked=false;this.fade();this.emit()}).catch(()=>{})};
  ['pointerdown','pointerup','touchend','mousedown','keydown','click'].forEach(e=>addEventListener(e,kick,true))}
 emit(){this.listeners.forEach(f=>f(this.on,this.blocked))}
 get supported(){return Boolean(window.AudioContext||window.webkitAudioContext)}
 init(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  const c=this.ctx=new AC();
  this.master=c.createGain();this.master.gain.value=0;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;comp.attack.value=.02;comp.release.value=.3;
  this.master.connect(comp);comp.connect(c.destination);
  /* space */
  this.verb=c.createConvolver();this.verb.buffer=this.impulse(3.4);const vg=c.createGain();vg.gain.value=.5;this.verb.connect(vg);vg.connect(this.master);
  this.dry=c.createGain();this.dry.gain.value=.75;this.dry.connect(this.master);
  /* echo for the plucks */
  this.echo=c.createDelay(1.5);this.echo.delayTime.value=(60/80)*.75;const fb=c.createGain();fb.gain.value=.34;const tone=c.createBiquadFilter();tone.type='lowpass';tone.frequency.value=2400;
  this.echo.connect(tone);tone.connect(fb);fb.connect(this.echo);const eg=c.createGain();eg.gain.value=.32;tone.connect(eg);eg.connect(this.master);tone.connect(this.verb);
  /* pad bus: low-pass that breathes slowly */
  this.padF=c.createBiquadFilter();this.padF.type='lowpass';this.padF.frequency.value=950;this.padF.Q.value=.5;
  const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.06;lg.gain.value=420;lfo.connect(lg);lg.connect(this.padF.frequency);lfo.start();
  this.padG=c.createGain();this.padG.gain.value=.13;this.padF.connect(this.padG);this.padG.connect(this.dry);this.padG.connect(this.verb);
  this.noise=this.noiseBuf();this.step=0;this.next=c.currentTime+.15;this.setChord(this.ch,true);
  this.timer=setInterval(()=>this.schedule(),30);
  document.addEventListener('visibilitychange',()=>this.fade());
  return true}
 impulse(sec){const c=this.ctx,len=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,len,c.sampleRate);for(let k=0;k<2;k++){const d=b.getChannelData(k);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8)}return b}
 noiseBuf(){const c=this.ctx,len=c.sampleRate,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;return b}
 setChord(i,first){const c=this.ctx,now=c.currentTime,notes=CHORDS[i];
  for(const v of this.voices){v.g.gain.cancelScheduledValues(now);v.g.gain.setValueAtTime(v.g.gain.value,now);v.g.gain.linearRampToValueAtTime(0,now+2.6);v.o.forEach(o=>o.stop(now+2.8))}
  this.voices=[];
  notes.forEach((m,j)=>{const g=c.createGain();g.gain.value=0;g.connect(j===0?this.dry:this.padF);
   const level=j===0?.11:.06;
   const osc=j===0?[this.osc('sine',mtof(m),0,g)]:[this.osc('sawtooth',mtof(m),-7,g),this.osc('triangle',mtof(m),6,g)];
   g.gain.linearRampToValueAtTime(level,now+(first?3:2.4));this.voices.push({g,o:osc})})}
 osc(type,f,cents,dest){const o=this.ctx.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=cents;o.connect(dest);o.start();return o}
 pluck(t,m,vel){const c=this.ctx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain();o.type='triangle';o2.type='sine';o.frequency.value=mtof(m);o2.frequency.value=mtof(m)*2;
  const g2=c.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09*vel,t+.006);g.gain.exponentialRampToValueAtTime(.0005,t+1.1);
  g.connect(this.dry);g.connect(this.echo);g.connect(this.verb);o.start(t);o2.start(t);o.stop(t+1.2);o2.stop(t+1.2)}
 schedule(){if(!this.ctx||this.ctx.state!=='running')return;const eighth=60/80/2,c=this.ctx;
  while(this.next<c.currentTime+.15){const n=CHORDS[this.ch],up=n.slice(2),pat=[0,2,1,3,2,1,3,0],k=this.step%8;
   if(Math.random()<DENSITY[this.ch]||k===0){const oct=this.ch>=4&&k%4===3?12:0;this.pluck(this.next,up[pat[k]%up.length]+12+oct,k===0?1:.55+Math.random()*.35)}
   this.next+=eighth;this.step++}}
 chime(){const c=this.ctx,t=c.currentTime+.02,top=CHORDS[this.ch][CHORDS[this.ch].length-1]+12;
  [[1,.07],[2.01,.03],[3,.018]].forEach(([mul,lv])=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=mtof(top)*mul;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lv,t+.01);g.gain.exponentialRampToValueAtTime(.0003,t+2.6);o.connect(g);g.connect(this.verb);g.connect(this.dry);o.start(t);o.stop(t+2.7)});
  /* soft whoosh */
  const s=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;bp.type='bandpass';bp.Q.value=1.4;bp.frequency.setValueAtTime(300,t);bp.frequency.exponentialRampToValueAtTime(3200,t+.7);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.25);g.gain.linearRampToValueAtTime(0,t+.8);s.connect(bp);bp.connect(g);g.connect(this.verb);s.start(t);s.stop(t+.9)}
 setChapter(i){if(i===this.ch)return;this.ch=i;if(this.ctx&&this.on){this.setChord(i);this.chime()}}
 setVisible(v){if(v===this.visible)return;this.visible=v;if(v&&!this.on&&!this.muted&&!document.hidden){this.start();return}this.fade()}
 fade(){if(!this.ctx)return;const want=this.on&&this.visible&&!document.hidden,c=this.ctx;
  clearTimeout(this.st);
  if(want){if(c.state!=='running')c.resume().catch(()=>{});this.master.gain.setTargetAtTime(.6,c.currentTime,.7)}
  else{this.master.gain.setTargetAtTime(0,c.currentTime,.35);this.st=setTimeout(()=>{if(!(this.on&&this.visible&&!document.hidden))c.suspend()},1800)}}
 /* must run inside a tap or click */
 toggle(){const turnOn=!this.on||this.blocked;try{localStorage.setItem('ia11-muted',turnOn?'0':'1')}catch(e){}this.muted=!turnOn;
  if(turnOn){if(!this.ctx&&!this.init())return false;this.on=true;this.ctx.resume().then(()=>{this.blocked=false;this.emit()}).catch(()=>{});this.blocked=false;this.setChord(this.ch,true);this.fade()}
  else{this.on=false;this.fade()}this.emit();return this.on}
 onChange(f){this.listeners.add(f);return()=>this.listeners.delete(f)}
}
const SCORE=new StoryScore();
