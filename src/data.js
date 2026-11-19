/* ---------- content ---------- */
const LOGO_H='__LOGO_H__', ICON='__ICON__';
const DEFAULT_ACTIVITIES=__DEFAULTS__;
const EVENT={name:'11 Years of Impact',dateLong:'Thursday, 17 December 2026',time:'10:00 AM to 9:00 PM IST',
 starts:'2026-12-17T10:00:00+05:30',ends:'2026-12-17T21:00:00+05:30',
 venue:'Hilton Embassy Tech Village',area:'Marathahalli, Bangalore',tagline:'Every Moment. Every Connection. Every Impact.',
 maps:'https://www.google.com/maps/search/?api=1&query=Hilton+Embassy+Tech+Village+Marathahalli+Bangalore'};
const TZ='Asia/Kolkata', OFFSET='+05:30', LEAD_MIN=10;
const CATEGORIES=[['Stage','mic'],['Food','cup'],['Games','spark'],['Music','music'],['Social','users'],['Other','star']];
/* Illustrative venue layout, in % of the floor plate. h0 is the block height in px. */
const ZONES=[
 {id:'Entrance',x:2,y:64,w:22,h:34,h0:14,top:'#FFFFFF',note:'Check-in and badges'},
 {id:'Main hall',x:28,y:4,w:44,h:54,h0:46,top:'#FFFFFF',note:'Stage, keynote and the evening show'},
 {id:'Atrium',x:28,y:64,w:44,h:34,h0:20,top:'#B3C9F7',note:'Food, networking and photo walls'},
 {id:'Arena',x:76,y:22,w:22,h:76,h0:30,top:'#F4F4F6',note:'Games and team challenges'}];
const JOURNEY=[['2015','An idea and a lot of hustle','A small team sets out to change how retailers make decisions.'],['2017','First retail clients onboard','The first retailers put the platform to work.'],['2019','One platform, many solutions','Separate tools come together on one core.'],['2021','A team that works from anywhere','Colleagues connect across cities and time zones.'],['2024','Hundreds of people, one mission','The team grows and keeps pulling in one direction.'],['2026','800+ people, eleven years','The whole company celebrates together in Bangalore.']];
const FAQ=[['Who can attend?','Every employee. You check in with your personal QR code at the entrance.'],
 ['Where is the venue?','Hilton Embassy Tech Village, Marathahalli, Bangalore. Open the Venue tab for the layout and directions.'],
 ['What time should I arrive?','Check-in opens at 9:00 AM. The opening session starts at 10:00 AM.'],
 ['What should I wear?','Smart casual works well. Comfortable shoes help in the games arena.'],
 ['How do I get reminders?','Add this app to your home screen and turn on reminders. Your phone alerts you 10 minutes before every session.'],
 ['Does it work on iPhone?','Yes, on iOS 16.4 or later. Open the site in Safari, tap Share, then Add to Home Screen. Open the app from your home screen to turn on reminders.'],
 ['Can I bring a guest?','People Ops will confirm the guest policy before the event.']];

/* pixel faces for the Impact Grid */
const D5={'0':['.###.','#...#','#..##','#.#.#','##..#','#...#','.###.'],'1':['..#..','.##..','..#..','..#..','..#..','..#..','.###.'],'2':['.###.','#...#','....#','...#.','..#..','.#...','#####'],'3':['#####','...#.','..#..','...#.','....#','#...#','.###.'],'4':['...#.','..##.','.#.#.','#..#.','#####','...#.','...#.'],'5':['#####','#....','####.','....#','....#','#...#','.###.'],'6':['..##.','.#...','#....','####.','#...#','#...#','.###.'],'7':['#####','....#','...#.','..#..','.#...','.#...','.#...'],'8':['.###.','#...#','#...#','.###.','#...#','#...#','.###.'],'9':['.###.','#...#','#...#','.####','....#','...#.','.##..']};
const L3={D:['##.','#.#','#.#','#.#','##.'],A:['.#.','#.#','###','#.#','#.#'],Y:['#.#','#.#','.#.','.#.','.#.'],S:['.##','#..','.#.','..#','##.'],H:['#.#','#.#','###','#.#','#.#'],R:['##.','#.#','##.','#.#','#.#'],M:['#.#','###','###','#.#','#.#'],I:['###','.#.','.#.','.#.','###'],N:['###','#.#','#.#','#.#','#.#'],E:['###','#..','##.','#..','###'],C:['###','#..','#..','#..','###']};
const G7={'1':['.#.','##.','.#.','.#.','.#.','.#.','###'],'Y':['#...#','#...#','.#.#.','..#..','..#..','..#..','..#..'],'E':['####','#...','#...','###.','#...','#...','####'],'A':['.##.','#..#','#..#','####','#..#','#..#','#..#'],'R':['###.','#..#','#..#','###.','#.#.','#..#','#..#'],'S':['.###','#...','#...','.##.','...#','...#','###.'],'O':['.##.','#..#','#..#','#..#','#..#','#..#','.##.'],'F':['####','#...','#...','###.','#...','#...','#...'],'I':['###','.#.','.#.','.#.','.#.','.#.','###'],'M':['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],'P':['###.','#..#','#..#','###.','#...','#...','#...'],'C':['.###','#...','#...','#...','#...','#...','.###'],'T':['#####','..#..','..#..','..#..','..#..','..#..','..#..'],' ':['..','..','..','..','..','..','..']};
