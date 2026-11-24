/* ---------- Royal theme: "Around the World in 11 Years" ----------
 Artwork drawn as SVG symbols, plus the voyage stops. The world map is a dot mask generated
 from Natural Earth land data (world-atlas, 50m) and injected at build time. */
const WORLD=__WORLD__;
const WORLD_HD=__WORLD_HD__;
const GOLD='#D4AF61',GOLD_HI='#F3DFA2',GOLD_LO='#9C7A36',NAVY='#0A1744',IVORY='#F7F1E3';

/* line-art landmarks, 64x64, drawn with a gold stroke */
const LANDMARKS={
 taj:'M14 58h36M20 58V36h24v22M24 36c0-10 8-13 8-20 0 7 8 10 8 20M32 16v-5M28 58v-8a4 4 0 018 0v8M12 58V30M52 58V30M10.5 30h3M50.5 30h3M12 28v-3M52 28v-3M23 36h18',
 bigben:'M25 60V18h14v42M23 18h18M27 18l5-11 5 11M32 7V2M28 23h8v8h-8zM32 27l2.5-2M25 37h14M25 47h14M22 60h20',
 eiffel:'M32 3v7M28 10h8M29 10l-5 22h16l-5-22M24 32l-7 27M40 32l7 27M15 59h34M25 45h14M21 46c4-7 18-7 22 0M27.5 21h9',
 colosseum:'M7 50h50M7 50V31c9-7 41-7 50 0v19M7 39h50M13 50v-7M21 50v-7M29 50v-7M37 50v-7M45 50v-7M53 50v-7M13 36v-4M21 35v-5M29 34v-5M37 34v-5M45 35v-5M53 36v-4M5 56h54',
 liberty:'M22 60h20M24 60V49h16v11M26 49l2-4h8l2 4M29 45l-1-15c0-3 1.5-4.5 4-4.5s4 1.5 4 4.5l-1 15M29.5 21.5a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0M28.6 19.4l-2.4-3M32 18.6v-4M35.4 19.4l2.4-3M35.6 27.5L39.5 13M37.6 13h3.8l-1.9 3.4zM39.5 12.6c-1.4-1.8-.4-4.2 1-5.4.2 2 1.2 3.2-1 5.4M28.6 31.5l-3.4 4.5 2.4 3.4',
 pagoda:'M32 3v7M20 14h24l-4-4H24zM18 14l-4 4h36l-4-4M22 18v8M42 18v8M16 30h32l-4-4H20zM20 30v8M44 30v8M12 42h40l-4-4H16zM18 42v16M46 42v16M10 58h44M28 58V48h8v10',
 opera:'M5 50h54M10 50c2-14 10-22 18-24-2 8-2 18 0 24M24 50c2-14 10-22 20-24-4 8-4 18-2 24M40 50c2-10 8-16 16-18-2 6-2 12 0 18M3 56h58',
 crown:'M10 46l-4-24 14 12 12-20 12 20 14-12-4 24zM10 52h44M32 14v-4M6 22v-2M58 22v-2'};
const lmSvg=(k,s=48,sw=1.6)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${LANDMARKS[k]}"/></svg>`;

/* the voyage: one stop per milestone (sample copy, replaced by the official story) */
const STOPS=[
 {lm:'taj',lon:78.0,lat:27.2,place:'Where it began'},
 {lm:'bigben',lon:-0.13,lat:51.5,place:'Across the sea'},
 {lm:'eiffel',lon:2.35,lat:48.86,place:'New horizons'},
 {lm:'colosseum',lon:12.49,lat:41.9,place:'Built to last'},
 {lm:'liberty',lon:-74.04,lat:40.69,place:'Bigger dreams'},
 {lm:'crown',lon:77.59,lat:12.97,place:'Home to celebrate'}];

/* SVG sprite: defined once, used everywhere with <use href="#..."> */
const ROYAL_SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFBEA"/><stop offset=".3" stop-color="#F7E3A1"/><stop offset=".6" stop-color="#EBC96B"/><stop offset=".8" stop-color="#F7E3A1"/><stop offset="1" stop-color="#FFF6D6"/></linearGradient>
<linearGradient id="gNavy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B3592"/><stop offset="1" stop-color="#0A1744"/></linearGradient>
<radialGradient id="heroDisc" cx="50%" cy="50%" r="50%" fx="44%" fy="42%"><stop offset="0" stop-color="#3358DE"/><stop offset=".45" stop-color="#264CD7"/><stop offset=".7" stop-color="#264CD7"/><stop offset=".87" stop-color="#22388C"/><stop offset="1" stop-color="#1C1B1B"/></radialGradient><radialGradient id="dialDisc" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#1E3FAE" stop-opacity=".55"/><stop offset=".7" stop-color="#0A1744" stop-opacity=".85"/><stop offset="1" stop-color="#050B26"/></radialGradient>
<radialGradient id="gGlow"><stop offset="0" stop-color="#FFF1C1" stop-opacity=".9"/><stop offset="1" stop-color="#FFF1C1" stop-opacity="0"/></radialGradient>
<clipPath id="balloonClip"><path d="M50 4C24 4 6 24 6 48c0 22 18 36 30 50h28c12-14 30-28 30-50C94 24 76 4 50 4z"/></clipPath>
</defs>
<symbol id="balloon" viewBox="0 0 100 140"><g clip-path="url(#balloonClip)"><rect width="100" height="100" fill="#0F2160"/>${[0,1,2,3,4,5].map(i=>`<rect x="${6+i*15}" width="${i%2?9:6}" height="100" fill="${i%2?'#F7F1E3':'#264CD7'}" opacity=".95"/>`).join('')}<rect y="44" width="100" height="6" fill="url(#gGold)"/><rect y="84" width="100" height="16" fill="url(#gGold)"/></g>
<path d="M50 4C24 4 6 24 6 48c0 22 18 36 30 50h28c12-14 30-28 30-50C94 24 76 4 50 4z" fill="none" stroke="url(#gGold)" stroke-width="2"/>
<path d="M37 98l5 16M63 98l-5 16M46 98v16M54 98v16" stroke="#D4AF61" stroke-width="1.2"/><rect x="40" y="113" width="20" height="14" rx="2" fill="#7A5A2A" stroke="url(#gGold)" stroke-width="1.5"/></symbol>
<symbol id="compass" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#0A1744" stroke="url(#gGold)" stroke-width="3"/><circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF61" stroke-width=".8" stroke-dasharray="1.5 2.6"/><circle cx="50" cy="50" r="34" fill="none" stroke="#D4AF61" stroke-width=".8"/>
${Array.from({length:16},(_,i)=>{const a=i*Math.PI/8,r1=40,r2=i%2?36:33;return `<line x1="${(50+Math.sin(a)*r1).toFixed(1)}" y1="${(50-Math.cos(a)*r1).toFixed(1)}" x2="${(50+Math.sin(a)*r2).toFixed(1)}" y2="${(50-Math.cos(a)*r2).toFixed(1)}" stroke="#D4AF61" stroke-width="1"/>`}).join('')}
<g><polygon points="50,14 55,45 50,50 45,45" fill="url(#gGold)"/><polygon points="50,86 55,55 50,50 45,55" fill="#F7F1E3"/><polygon points="86,50 55,55 50,50 55,45" fill="url(#gGold)"/><polygon points="14,50 45,55 50,50 45,45" fill="#F7F1E3"/>
<polygon points="72,28 54,47 50,50 53,46" fill="#D4AF61" opacity=".8"/><polygon points="28,72 46,53 50,50 47,54" fill="#D4AF61" opacity=".8"/><polygon points="72,72 53,54 50,50 54,53" fill="#F7F1E3" opacity=".7"/><polygon points="28,28 47,46 50,50 46,47" fill="#F7F1E3" opacity=".7"/></g>
<circle cx="50" cy="50" r="4" fill="#0A1744" stroke="url(#gGold)" stroke-width="1.5"/>
<g fill="#F3DFA2" font-family="Cinzel,Georgia,serif" font-size="8" text-anchor="middle" font-weight="700"><text x="50" y="11">N</text><text x="50" y="96">S</text><text x="93" y="53">E</text><text x="7" y="53">W</text></g></symbol>
<symbol id="chandelier" viewBox="0 0 200 140"><path d="M100 0v22" stroke="url(#gGold)" stroke-width="2"/><ellipse cx="100" cy="30" rx="10" ry="8" fill="url(#gGold)"/>
${[-80,-50,-22,22,50,80].map((x,i)=>`<path d="M100 34 Q ${100+x*.55} ${58+Math.abs(x)*.12} ${100+x} ${64}" fill="none" stroke="url(#gGold)" stroke-width="2"/><path d="M${100+x-6} 64h12" stroke="url(#gGold)" stroke-width="3" stroke-linecap="round"/><circle class="flame" cx="${100+x}" cy="58" r="3.4" fill="#FFF1C1"/>${[0,1,2].map(k=>`<path d="M${100+x+(k-1)*5} 66l-2 ${10+k*6}l2 4l2-4z" fill="#F7F1E3" opacity=".75"/>`).join('')}`).join('')}
<path d="M64 64 Q100 98 136 64" fill="none" stroke="url(#gGold)" stroke-width="1.6"/>${Array.from({length:9},(_,i)=>`<path d="M${68+i*8} ${66+Math.sin(i/8*Math.PI)*24}l-2 10 2 4 2-4z" fill="#F7F1E3" opacity=".85"/>`).join('')}
<path d="M100 98l-4 18 4 8 4-8z" fill="url(#gGold)"/></symbol>
<symbol id="stanchion" viewBox="0 0 20 100"><circle cx="10" cy="6" r="5" fill="url(#gGold)"/><rect x="8" y="10" width="4" height="78" rx="2" fill="url(#gGold)"/><ellipse cx="10" cy="94" rx="9" ry="4" fill="url(#gGold)"/></symbol>
<symbol id="plane" viewBox="0 0 40 40"><path d="M20 2c1.6 0 2.4 2 2.4 4v10l14 8v4l-14-4v8l4 3v3l-6.4-2-6.4 2v-3l4-3v-8l-14 4v-4l14-8V6c0-2 .8-4 2.4-4z" fill="url(#gGold)" stroke="#0A1744" stroke-width=".8"/></symbol>
</svg>`;
