/* ---------- static content (sample data for the prototype) ---------- */
const LOGO_H='__LOGO_H__', LOGO_M='__LOGO_M__';
const EVENT={name:'11 Years of Impact',date:'Thursday, 17 December 2026',time:'10:00 AM to 9:00 PM IST',venue:'Hilton Embassy Tech Village',area:'Marathahalli, Bangalore',tagline:'Every Moment. Every Connection. Every Impact.',starts:'2026-12-17T10:00:00+05:30'};

const NAMES=['Karthik Iyer','Meera Joshi','Rohan Gupta','Sneha Kulkarni','Vikram Singh','Divya Menon','Ananya Rao','Arjun Reddy','Neha Kapoor','Imran Sheikh','Pooja Nambiar','Siddharth Das','Kavya Shetty','Aditya Verma','Lakshmi Pillai','Manish Tiwari','Ishita Bose','Harsh Patel','Deepa Krishnan','Rahul Bhatt','Tanvi Desai','Faisal Ahmed','Swati Menon','Nikhil Joshi'];
const DEPTS=['Data Science','Engineering','Customer Success','Product','People Ops','Marketing','Finance','Design'];
const ROLES=['Super Admin','HR Admin','Marketing Admin','Quiz Admin','Event Coordinator','Employee'];

/* The Impact Grid: 11 rows x 101 columns = 1,111 cells. Hidden message in a 7-row pixel face. */
const GRID={cols:101,rows:11,total:1111,goal:'Light up all 1,111 cells before the doors open.',msg:'11 YEARS OF IMPACT'};
const GLYPH={
 '1':['.#.','##.','.#.','.#.','.#.','.#.','###'],
 'Y':['#...#','#...#','.#.#.','..#..','..#..','..#..','..#..'],
 'E':['####','#...','#...','###.','#...','#...','####'],
 'A':['.##.','#..#','#..#','####','#..#','#..#','#..#'],
 'R':['###.','#..#','#..#','###.','#.#.','#..#','#..#'],
 'S':['.###','#...','#...','.##.','...#','...#','###.'],
 'O':['.##.','#..#','#..#','#..#','#..#','#..#','.##.'],
 'F':['####','#...','#...','###.','#...','#...','#...'],
 'I':['###','.#.','.#.','.#.','.#.','.#.','###'],
 'M':['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],
 'P':['###.','#..#','#..#','###.','#...','#...','#...'],
 'C':['.###','#...','#...','#...','#...','#...','.###'],
 'T':['#####','..#..','..#..','..#..','..#..','..#..','..#..'],
 ' ':['..','..','..','..','..','..','..']};

/* Levels: each level is one year of the journey. 300 points per level. */
const LEVEL_STEP=300;
const JOURNEY=[
 [2016,'Year one','An idea and a lot of hustle.'],
 [2017,'First clients','The first retailers come on board.'],
 [2018,'Finding the rhythm','The team learns to ship fast and listen hard.'],
 [2019,'One platform','Many solutions start to share one core.'],
 [2020,'Built for change','The team adapts and keeps every client running.'],
 [2021,'Work from anywhere','Colleagues connect across cities and time zones.'],
 [2022,'Going further','New markets and new solutions join the platform.'],
 [2023,'Scale','More people, more clients and more data.'],
 [2024,'One mission','Hundreds of people pull in the same direction.'],
 [2025,'Momentum','The platform grows smarter every release.'],
 [2026,'Eleven','800+ people celebrate together in Bangalore.']];

const QZ=[
 {id:'daily',n:'Daily Challenge: Retail Trivia',tag:'Daily',min:'2 min',qs:[
  {q:'What does SKU stand for?',o:['Stock Keeping Unit','Store Keeping Update','Standard Key Unit','Sales Kit Upload'],a:0},
  {q:'Which metric shows the share of received stock that has sold in a period?',o:['Basket size','Sell-through rate','Footfall','Churn'],a:1},
  {q:'In merchandising, what does OTB stand for?',o:['Over The Budget','Out Of The Box','Open To Buy','On The Block'],a:2},
  {q:'What is a markdown?',o:['A price increase','A permanent price reduction','A loyalty offer','A stock transfer'],a:1},
  {q:'Which term describes having too little stock to meet demand?',o:['Overstock','Stockout','Shrink','Backorder'],a:1}]},
 {id:'event',n:'Know the Celebration',tag:'Featured',min:'2 min',qs:[
  {q:'How many years is Impact Analytics celebrating?',o:['9','10','11','12'],a:2},
  {q:'Which city hosts the event?',o:['Mumbai','Bangalore','Pune','Delhi'],a:1},
  {q:'What is the event date?',o:['10 December 2026','17 December 2026','24 December 2026','2 January 2027'],a:1},
  {q:'Which venue hosts the celebration?',o:['Hilton Embassy Tech Village','Taj Westend','ITC Gardenia','Leela Palace'],a:0},
  {q:'How does the tagline start?',o:['Every Moment.','Every Day.','One Team.','Eleven Years.'],a:0}]}];
const LIVEQ=[
 {q:'How many cells make up the Impact Grid?',o:['111','1,011','1,111','11,111'],a:2,votes:[38,61,412,96]},
 {q:'Which metric tracks the share of stock sold in a period?',o:['Sell-through rate','Footfall','Basket size','Churn'],a:0,votes:[388,41,77,22]}];

const GAMES=[
 {id:'guess',n:'Guess the Colleague',d:'Read the clue. Name the person.',pts:'Up to 150 pts',i:'users'},
 {id:'ttl',n:'Two Truths and One Lie',d:'Spot the lie in each round.',pts:'Up to 100 pts',i:'help'},
 {id:'bingo',n:'Office Bingo',d:'Find colleagues who match each square.',pts:'150 pts for a line',i:'grid'},
 {id:'meme',n:'Meme Challenge',d:'Caption the photo. The crowd votes.',pts:'50 pts to enter',i:'image'},
 {id:'talent',n:'Hidden Talent',d:'Show us something nobody knows.',pts:'50 pts to enter',i:'star'}];
const ROUNDS={
 guess:[{p:'Always carries a spare charger and has strong views on filter coffee.',o:['Karthik Iyer','Meera Joshi','Rohan Gupta','Sneha Kulkarni'],a:1},
  {p:'Has run three half marathons and never misses a stand-up.',o:['Vikram Singh','Divya Menon','Arjun Reddy','Neha Kapoor'],a:0},
  {p:'Knows every spreadsheet shortcut, including the secret ones.',o:['Imran Sheikh','Pooja Nambiar','Siddharth Das','Kavya Shetty'],a:3}],
 ttl:[{p:'Aditya says three things. Which one is the lie?',o:['I have visited 14 countries.','I once met a famous cricketer.','I have never tasted coffee.'],a:2},
  {p:'Lakshmi says three things. Which one is the lie?',o:['I can solve a Rubik cube in a minute.','I was born in a lighthouse.','I play the veena.'],a:1}]};
const BING=['Has a pet','Speaks 3 languages','Joined in 2015','Plays an instrument','Loves trivia','Runs on weekends','Has been to Bali','Bakes cakes','Cycles to work','Collects coins','Plays cricket','Reads sci-fi','FREE','Has twins','Is left-handed','Sings in the shower','Can juggle','Plays chess','Does yoga','Loves board games','Has run a marathon','Plays guitar','Is a night owl','Has a black belt','Knows every cafeteria menu'];
const DROP_VALUES=[11,22,11,33,22,55,11,22,111,33,22,11];

const SCHED=[['10:00','Welcome and opening','Main hall'],['10:30','Keynote: Eleven Years of Impact','Main hall'],['11:30','Teams showcase','Main hall'],['12:30','Lunch and networking','Atrium'],['14:00','Live quiz: Know Your Impact','Main hall'],['15:00','Games arena','Arena'],['16:30','Awards and recognition','Main hall'],['18:00','High tea and photo walls','Atrium'],['19:00','Evening entertainment','Main hall'],['20:30','Closing and celebration','Main hall']];
const FAQ=[['Who can attend?','Every employee. You check in with your personal QR code at the entrance.'],['Where is the venue?','Hilton Embassy Tech Village, Marathahalli, Bangalore. Open the Venue tab for directions.'],['What should I wear?','Smart casual works well. Comfortable shoes help during the games arena.'],['How do points work?','Quizzes, games, quests and polls award points. Every 10 points you earn lights one cell of the Impact Grid.'],['Can I bring a guest?','People Ops will confirm the guest policy before the event.']];
const ACT=[['Photo walls','Capture the day with your team.','camera'],['Live quiz arena','Compete on the big screen.','tv'],['Games arena','Bingo, trivia and more.','grid'],['Talent showcase','Hidden Talent finalists on stage.','star'],['Music and DJ','Evening entertainment.','bolt']];

/* quests: id, label, points, how to complete (act:arg) */
const QUESTS=[
 ['daily','Finish the Daily Challenge',100,'qstart:daily'],
 ['vote','Vote in the session poll',20,'quick:play:live'],
 ['game','Play any game',40,'quick:play:games'],
 ['read','Read two announcements',20,'quick:ov:ann'],
 ['drop','Open your Cell Drop',10,'quick:ov:drop'],
 ['checkin','Check in at the venue',50,'quick:ov:checkin']];

const BADGES=[
 ['Early Bird','Opened the app in week one','sun',()=>true],
 ['Quiz Starter','Complete a quiz','help',()=>Object.keys(S.quizDone).length>=1],
 ['Quiz Master','Complete both open quizzes','trophy',()=>Object.keys(S.quizDone).length>=2],
 ['Perfect Run','Score 5 of 5 in a quiz','bolt',()=>Object.values(S.quizDone).some(q=>q.ok===5)],
 ['Day One','Check in at the venue','qr',()=>S.checked],
 ['Game On','Finish a game','play',()=>Object.keys(S.gameDone).length>=1],
 ['Cell Hunter','Open your Cell Drop','grid',()=>S.drop!==null],
 ['Top 10','Reach the top 10','star',()=>rankOf()<=10],
 ['Questline','Complete every quest','check',()=>QUESTS.every(q=>questDone(q[0]))]];

/* build notes per screen: tables, row level security, server side */
const NOTES={
 home:['events, announcements, quests, points_ledger, grid_cells (view)','Employees read published rows of their own event only.','Countdown reads events.starts_at and renders in Asia/Kolkata. Grid count is a SQL view over points_ledger (floor(sum/10)).'],
 event:['events, schedules','Published rows only. Edits limited to Event Coordinator and Super Admin.','Schedule times stored in UTC, shown in Asia/Kolkata.'],
 quiz:['quizzes, quiz_questions, quiz_options, quiz_attempts, quiz_answers','quiz_options.is_correct is never selectable by employees.','submit_answer RPC scores in a transaction, including speed bonus and combo. Unique (user_id, quiz_id) blocks a second attempt.'],
 games:['games, game_submissions, points_ledger','Employees insert and read their own submissions only.','Entries stay Pending until a Quiz Admin or Marketing Admin approves them.'],
 live:['schedules, polls, poll_options, poll_votes, checkins','poll_votes unique (poll_id, user_id). checkins unique (event_id, user_id).','Realtime channel pushes agenda, poll and leaderboard changes.'],
 scores:['points_ledger (summed view), departments','Leaderboard view exposes name, department and points only.','Realtime subscription on points_ledger refreshes the top 10 and the department race.'],
 profile:['profiles, user_badges, points_ledger','Employees edit their own picture only. Department comes from the HR import.','Level is derived: floor(points / 300) + 1, capped at 11.'],
 journey:['journey_milestones, points_ledger','Read for all employees. Admins edit milestone copy.','Unlock state is derived from the level, so nothing extra is stored.'],
 drop:['cell_drops','Unique (user_id, drop_date). Employees read their own rows.','open_cell_drop RPC picks the reward on the server. The client only animates the result.'],
 ann:['announcements, notifications','Employees read published announcements. Read state lives in notifications.read_at.','Web Push sends through a server function after an admin publishes.'],
 gallery:['gallery, storage bucket gallery','Public read for approved items. Employees upload to a pending folder.','Marketing Admin moderates items before they appear.'],
 checkin:['checkins, profiles','Employees read their own check-in row.','QR holds a signed token. The server verifies it and rejects duplicates.']};

const PERM={'Super Admin':'*','HR Admin':['dashboard','employees','points','checkin','reports','roles'],'Marketing Admin':['dashboard','announcements','gallery','submissions','live'],'Quiz Admin':['dashboard','quizzes','submissions','leaderboard','points','reports'],'Event Coordinator':['dashboard','announcements','checkin','live'],'Employee':[]};
const NAV=[
 ['Overview',[['dashboard','Dashboard','home'],['reports','Reports','chart']]],
 ['People',[['employees','Employees','users'],['points','Award points','star'],['roles','Roles and access','shield']]],
 ['Event',[['checkin','QR check-in','qr'],['live','Live control','tv']]],
 ['Content',[['announcements','Announcements','mega'],['gallery','Gallery','image']]],
 ['Play',[['quizzes','Quizzes','help'],['submissions','Game submissions','flag'],['leaderboard','Leaderboard','trophy']]]];
const ADM_NOTES={
 dashboard:['audit_logs, quiz_attempts, points_ledger, checkins','Admin roles only. Employee role is blocked at the route and at RLS.','Counts come from SQL views, not client math.'],
 employees:['profiles, user_roles, event_members','HR Admin and Super Admin only. No public registration.','CSV import runs in a server action with email domain validation.'],
 points:['points_ledger, audit_logs','HR Admin, Quiz Admin, Super Admin.','Ledger is append-only. Every award checks range and reason on the server.'],
 roles:['user_roles','HR Admin views. Super Admin assigns.','Role changes write audit_logs. Policies use a has_role() helper.'],
 checkin:['checkins','HR Admin, Event Coordinator, Super Admin.','Duplicate scans return a clear error and write no row.'],
 live:['events.live_state','Event Coordinator, Marketing Admin, Super Admin.','The stage subscribes to live_state and swaps screens instantly.'],
 announcements:['announcements','Marketing Admin, Event Coordinator, Super Admin.','Publish writes audit_logs and can trigger Web Push.'],
 gallery:['gallery','Marketing Admin and Super Admin.','Approve moves a file from the pending folder to the public folder.'],
 quizzes:['quizzes, quiz_questions, quiz_options','Quiz Admin and Super Admin.','Publishing locks questions that already have attempts.'],
 submissions:['game_submissions','Quiz Admin and Marketing Admin.','Approval writes points_ledger in the same transaction.'],
 leaderboard:['points_ledger, events.leaderboard_frozen','Read for all admins. Freeze limited to Quiz Admin and Super Admin.','Freeze stops Realtime updates for employees.'],
 reports:['SQL views over quiz_attempts, points_ledger, checkins','HR Admin, Quiz Admin, Super Admin.','CSV export is generated server side.']};
const SCREENS=[['welcome','Welcome'],['grid','Impact Grid'],['quiz','Live quiz'],['poll','Poll'],['board','Top 10'],['race','Department race'],['winner','Winner'],['party','Celebration']];
