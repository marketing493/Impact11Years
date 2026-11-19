/* ---------- the Impact Grid: an interactive pixel field ----------
 Modes: countdown (pixel clock to the event), message (11 YEARS OF IMPACT), draw (paint your own cells).
 Every mode reacts to the pointer: a glowing trail follows it and a tap sends a ripple across the grid. */
class ImpactGrid{
 constructor(cv,opts={}){this.cv=cv;this.ctx=cv.getContext('2d');this.mode=opts.mode||'countdown';this.target=opts.target;this.onTick=opts.onTick;
  this.ripples=[];this.ptr=null;this.down=false;this.scroll=0;this.lastSec=-1;this.t0=performance.now();this.alive=true;this.visible=true;
  this.rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.resize();this.bind();for(let i=0;i<this.en.length;i++)this.en[i]=Math.random()*.6;this.frame=this.frame.bind(this);requestAnimationFrame(this.frame)}
 resize(){const W=this.cv.clientWidth||this.cv.parentElement.clientWidth;this.W=W;
  const cs=W>=1000?13:W>=760?11:W>=520?9:7,gap=cs>=11?3:2;this.cs=cs;this.gap=gap;this.cols=Math.max(24,Math.floor((W+gap)/(cs+gap)));
  this.wide=this.cols>=65;this.contentH=this.wide?14:31;this.rows=this.contentH+(this.wide?6:4);
  const n=this.cols*this.rows;this.lit=new Float32Array(n);this.en=new Float32Array(n);this.tg=new Uint8Array(n);this.paint=this.paint&&this.paint.length===n?this.paint:new Uint8Array(n);
  const dpr=Math.min(2,devicePixelRatio||1);this.H=this.rows*(cs+gap)-gap;this.cv.width=Math.round(W*dpr);this.cv.height=Math.round(this.H*dpr);this.cv.style.height=this.H+'px';this.ctx.setTransform(dpr,0,0,dpr,0,0);
  this.lastSec=-1;this.compose(true)}
 bind(){const c=this.cv;
  const cell=e=>{const r=c.getBoundingClientRect();return {x:(e.clientX-r.left)/(this.cs+this.gap),y:(e.clientY-r.top)/(this.cs+this.gap)}};
  this.h={move:e=>{this.ptr=cell(e);if(this.down&&this.mode==='draw')this.dab(this.ptr)},
   down:e=>{this.down=true;this.ptr=cell(e);try{c.setPointerCapture(e.pointerId)}catch(_){}if(this.mode==='draw')this.dab(this.ptr);else this.ripples.push({x:this.ptr.x,y:this.ptr.y,t:performance.now()})},
   up:()=>{this.down=false},leave:()=>{this.ptr=null;this.down=false},
   resize:()=>{if(Math.abs((this.cv.clientWidth||0)-this.W)>2)this.resize()}};
  c.addEventListener('pointermove',this.h.move);c.addEventListener('pointerdown',this.h.down);c.addEventListener('pointerup',this.h.up);c.addEventListener('pointerleave',this.h.leave);c.addEventListener('pointercancel',this.h.leave);
  addEventListener('resize',this.h.resize);
  this.io=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting});this.io.observe(c)}
 destroy(){this.alive=false;const c=this.cv;c.removeEventListener('pointermove',this.h.move);c.removeEventListener('pointerdown',this.h.down);removeEventListener('resize',this.h.resize);this.io.disconnect()}
 setMode(m){this.mode=m;this.scroll=0;this.lastSec=-1;this.compose(true);for(let i=0;i<this.en.length;i++)this.en[i]=Math.max(this.en[i],Math.random()*.5)}
 clear(){this.paint.fill(0);this.ripples.push({x:this.cols/2,y:this.rows/2,t:performance.now()})}
 dab(p){const x=Math.floor(p.x),y=Math.floor(p.y);for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const xx=x+dx-(dx&&0),yy=y+dy;if(xx>=0&&yy>=0&&xx<this.cols&&yy<this.rows){const i=yy*this.cols+xx;if(!this.paint[i]){this.paint[i]=1;this.en[i]=1}}}}
 blit(g,x,y,v=1){for(let r=0;r<g.length;r++)for(let k=0;k<g[r].length;k++)if(g[r][k]==='#'){const xx=x+k,yy=y+r;if(xx>=0&&xx<this.cols&&yy>=0&&yy<this.rows)this.tg[yy*this.cols+xx]=v}}
 word(s,font,x,y,v){for(const ch of s){const g=font[ch];if(!g){x+=2;continue}this.blit(g,x,y,v);x+=g[0].length+1}return x}
 width(s,font){let w=0;for(const ch of s)w+=(font[ch]?font[ch][0].length:1)+1;return w-1}
 compose(force){
  const diff=Math.max(0,this.target-Date.now()),sec=Math.floor(diff/1000);
  if(this.mode==='countdown'&&!force&&sec===this.lastSec)return;this.lastSec=sec;
  const prev=this.tg.slice();this.tg.fill(0);
  const top=Math.floor((this.rows-this.contentH)/2);
  if(this.mode==='countdown'&&diff>0){
   const v=[Math.min(99,Math.floor(diff/864e5)),Math.floor(diff%864e5/36e5),Math.floor(diff%36e5/6e4),Math.floor(diff%6e4/1e3)].map(n=>String(n).padStart(2,'0'));
   const labels=['DAYS','HRS','MIN','SEC'],blink=sec%2===0;
   const group=(s,lab,x,y)=>{this.blit(D5[s[0]],x,y);this.blit(D5[s[1]],x+6,y);const lw=this.width(lab,L3);this.word(lab,L3,x+Math.floor((11-lw)/2),y+9,3)};
   const colon=(x,y)=>{if(blink||this.rm){this.tg[(y+2)*this.cols+x]=2;this.tg[(y+4)*this.cols+x]=2}};
   if(this.wide){let x=Math.floor((this.cols-59)/2);for(let i=0;i<4;i++){group(v[i],labels[i],x,top);x+=11;if(i<3){colon(x+2,top);x+=5}}}
   else{const x=Math.floor((this.cols-27)/2);group(v[0],labels[0],x,top);colon(x+13,top);group(v[1],labels[1],x+16,top);group(v[2],labels[2],x,top+17);colon(x+13,top+17);group(v[3],labels[3],x+16,top+17)}
  }else if(this.mode==='message'||(this.mode==='countdown'&&diff<=0)){
   const msg='11 YEARS OF IMPACT',w=this.width(msg,G7);
   if(w<=this.cols-4){const y=Math.floor((this.rows-7)/2);this.word(msg,G7,Math.floor((this.cols-w)/2),y)}
   else{const lines=['11 YEARS','OF IMPACT'],y0=Math.floor((this.rows-16)/2);lines.forEach((l,i)=>{const lw=this.width(l,G7);if(lw<=this.cols-2)this.word(l,G7,Math.floor((this.cols-lw)/2),y0+i*9);else this.word(l,G7,this.cols-Math.floor(this.scroll)%(lw+this.cols),y0+i*9)})}
  }
  for(let i=0;i<this.tg.length;i++)if(this.tg[i]&&!prev[i])this.en[i]=Math.max(this.en[i],.9);
  this.onTick&&this.onTick(diff)}
 frame(now){if(!this.alive)return;requestAnimationFrame(this.frame);if(!this.visible||document.hidden)return;
  this.compose(false);
  const {cols,rows,cs,gap,ctx,lit,en,tg,paint}=this,t=(now-this.t0)/1000,rm=this.rm;
  /* pointer trail */
  if(this.ptr&&!rm){const px=this.ptr.x,py=this.ptr.y;for(let y=Math.max(0,Math.floor(py-3));y<Math.min(rows,py+3);y++)for(let x=Math.max(0,Math.floor(px-3));x<Math.min(cols,px+3);x++){const d=Math.hypot(x+.5-px,y+.5-py);if(d<3)en[y*cols+x]=Math.max(en[y*cols+x],1-d/3)}}
  /* ripples */
  this.ripples=this.ripples.filter(r=>now-r.t<2200);
  for(const r of this.ripples){const age=(now-r.t)/2200,rad=age*Math.max(cols,rows)*.9,amp=(1-age)*.95;
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const d=Math.abs(Math.hypot(x+.5-r.x,(y+.5-r.y)*1.2)-rad);if(d<1.6)en[y*cols+x]=Math.max(en[y*cols+x],amp*(1-d/1.6))}}
  /* ambient: twinkles and a slow diagonal shimmer */
  if(!rm){for(let k=0;k<3;k++){const i=Math.floor(Math.random()*en.length);en[i]=Math.max(en[i],.35+Math.random()*.3)}
   const p=((t*14)%(cols+rows*1.6+40))-20;for(let y=0;y<rows;y++){const x0=Math.floor(p-y*.6);for(let x=x0-1;x<=x0+1;x++)if(x>=0&&x<cols)en[y*cols+x]=Math.max(en[y*cols+x],.18)}}
  if(this.mode==='message'){const w=this.width('OF IMPACT',G7);if(w>cols-2){this.scroll+=.12;this.compose(true)}}
  ctx.clearRect(0,0,this.W,this.H);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*cols+x,want=paint[i]?1:tg[i]?1:0;
   lit[i]+=(want-lit[i])*(rm?1:.16);en[i]*=rm?.0:.93;
   const l=lit[i],e=en[i],px=x*(cs+gap),py=y*(cs+gap);
   ctx.fillStyle='rgba(255,255,255,.075)';ctx.fillRect(px,py,cs,cs);
   if(e>.02){ctx.fillStyle=`rgba(179,201,247,${Math.min(.55,e*.55)})`;ctx.fillRect(px,py,cs,cs)}
   if(l>.02){const v=tg[i]||1,s=cs*(.55+.45*Math.min(1,l+e*.3)),o=(cs-s)/2;
    ctx.fillStyle=v===2?`rgba(255,111,28,${l})`:v===3?`rgba(255,255,255,${l*.62})`:`rgba(255,255,255,${l})`;ctx.fillRect(px+o,py+o,s,s)}}
 }
}
