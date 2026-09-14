/* ---------- NAV ---------- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, {passive:true});
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ---------- HERO SEQUENCE + CANVAS NETWORK ---------- */
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let W,H,DPR;
function resize(){
  DPR = Math.min(window.devicePixelRatio||1, 2);
  W = canvas.offsetWidth; H = canvas.offsetHeight;
  canvas.width = W*DPR; canvas.height = H*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
const NODE_LABELS = ['People','Operations','Finance','Customers','Projects','Data','AI Agents'];
let nodes = [];
function buildNodes(){
  nodes = [];
  const cx = W/2, cy = H/2*0.92;
  const ringR = Math.min(W,H)*0.30;
  nodes.push({x:cx,y:cy,core:true,r:5,label:null});
  for(let i=0;i<NODE_LABELS.length;i++){
    const a = (i/NODE_LABELS.length)*Math.PI*2 - Math.PI/2;
    nodes.push({
      baseAngle:a, dist:ringR, cx, cy,
      x: cx+Math.cos(a)*ringR, y: cy+Math.sin(a)*ringR,
      r:3, label:NODE_LABELS[i], phase:Math.random()*Math.PI*2
    });
  }
  for(let i=0;i<42;i++){
    nodes.push({
      x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+0.4,
      ambient:true, vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.12,
      tw:Math.random()*Math.PI*2
    });
  }
  positionLabels();
}
function positionLabels(){
  const container = document.querySelector('.hero');
  document.querySelectorAll('.hero-node-label').forEach(el=>el.remove());
  nodes.filter(n=>n.label).forEach(n=>{
    const el = document.createElement('div');
    el.className='hero-node-label';
    el.innerHTML = `<span class="nd"></span>${n.label}`;
    if(Math.cos(n.baseAngle) < -0.2) el.style.transform = 'translate(-100%,-50%)';
    else if(Math.cos(n.baseAngle) > 0.2) el.style.transform = 'translate(0,-50%)';
    else el.style.transform = 'translate(-50%,-50%)';
    el.style.left = n.x+'px';
    el.style.top = n.y+'px';
    container.appendChild(el);
    n._el = el;
  });
}
let t=0;
function draw(){
  t+=0.008;
  ctx.clearRect(0,0,W,H);
  const core = nodes[0];
  const ring = nodes.filter(n=>n.label);
  ring.forEach(n=>{
    n.x = n.cx + Math.cos(n.baseAngle+Math.sin(t+n.phase)*0.04)*(n.dist+Math.sin(t*0.7+n.phase)*6);
    n.y = n.cy + Math.sin(n.baseAngle+Math.sin(t+n.phase)*0.04)*(n.dist+Math.sin(t*0.7+n.phase)*6);
    if(n._el){
      n._el.style.left = n.x+'px';
      n._el.style.top = n.y+'px';
    }
  });
  ctx.lineWidth = 1;
  ring.forEach((n)=>{
    const grad = ctx.createLinearGradient(core.x,core.y,n.x,n.y);
    grad.addColorStop(0,'rgba(125,255,78,0.35)');
    grad.addColorStop(1,'rgba(125,255,78,0.04)');
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(core.x,core.y); ctx.lineTo(n.x,n.y); ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(184,192,194,0.08)';
  for(let i=0;i<ring.length;i++){
    const a = ring[i], b = ring[(i+1)%ring.length];
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }
  const pulse = 1+Math.sin(t*2)*0.15;
  const g = ctx.createRadialGradient(core.x,core.y,0,core.x,core.y,26*pulse);
  g.addColorStop(0,'rgba(125,255,78,0.9)');
  g.addColorStop(1,'rgba(125,255,78,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(core.x,core.y,26*pulse,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7DFF4E';
  ctx.beginPath(); ctx.arc(core.x,core.y,4,0,Math.PI*2); ctx.fill();
  ring.forEach(n=>{
    ctx.fillStyle = 'rgba(125,255,78,0.9)';
    ctx.beginPath(); ctx.arc(n.x,n.y,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(125,255,78,0.25)';
    ctx.beginPath(); ctx.arc(n.x,n.y,7,0,Math.PI*2); ctx.stroke();
  });
  nodes.filter(n=>n.ambient).forEach(n=>{
    n.x+=n.vx; n.y+=n.vy;
    if(n.x<0)n.x=W; if(n.x>W)n.x=0; if(n.y<0)n.y=H; if(n.y>H)n.y=0;
    const alpha = 0.15+Math.sin(t*2+n.tw)*0.1;
    ctx.fillStyle = `rgba(184,192,194,${Math.max(alpha,0.04)})`;
    ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
  });
  requestAnimationFrame(draw);
}
function initHero(){ resize(); buildNodes(); draw(); }
window.addEventListener('resize', ()=>{ resize(); buildNodes(); });
initHero();

window.addEventListener('load', ()=>{
  const seq = [
    ['#heroStatus',0],['#hero-canvas',80],['#heroH1',160],
    ['#heroLead',320],['#heroCtas',460],['#heroCue',620],
  ];
  seq.forEach(([sel,delay])=>{
    setTimeout(()=>{
      const el = document.querySelector(sel);
      if(!el) return;
      el.style.transition = 'opacity .9s cubic-bezier(.16,.84,.28,1), transform .9s cubic-bezier(.16,.84,.28,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  });
  document.querySelectorAll('.hero-node-label').forEach((el,i)=>{
    setTimeout(()=>{ el.style.transition='opacity .8s'; el.style.opacity='1'; }, 700+i*80);
  });
});

/* ---------- EVOLUTION SCROLL PROGRESS ---------- */
const evoStages = document.querySelectorAll('[data-evo]');
const evoFill = document.getElementById('evoFill');
const evoTrack = document.getElementById('evoTrack');
function updateEvo(){
  const trackRect = evoTrack.getBoundingClientRect();
  const vh = window.innerHeight;
  evoStages.forEach((s)=>{
    const r = s.getBoundingClientRect();
    const mid = r.top + r.height/2;
    s.classList.toggle('active', mid < vh*0.6 && mid > -r.height);
  });
  const total = evoTrack.scrollHeight;
  const passed = Math.min(Math.max((vh*0.6 - trackRect.top),0), total);
  evoFill.style.height = Math.min((passed/total)*100,100)+'%';
}
window.addEventListener('scroll', updateEvo, {passive:true});
updateEvo();

/* ---------- OS DIAGRAM ---------- */
const osDiagram = document.getElementById('osDiagram');
const osLines = document.getElementById('osLines');
const osDetail = document.getElementById('osDetail');
const OS_FUNCS = [
  {name:'HR', desc:'Hiring, attendance, payroll and employee experience, monitored continuously.'},
  {name:'Finance', desc:'Cash flow, expenses and forecasting reconciled in real time.'},
  {name:'Sales', desc:'Pipeline health and deal risk surfaced before you have to ask.'},
  {name:'Operations', desc:'Workflows coordinated across every team, automatically.'},
  {name:'Projects', desc:'Timelines, resourcing and blockers tracked without status meetings.'},
  {name:'Compliance', desc:'Regulatory changes monitored and flagged before they become risk.'},
  {name:'Customer Experience', desc:'Every interaction understood, every signal actioned.'},
];
function buildOS(){
  osDiagram.querySelectorAll('.os-node').forEach(n=>n.remove());
  const size = osDiagram.clientWidth;
  const cx = size/2, cy = size/2;
  const R = size*0.38;
  osLines.setAttribute('viewBox',`0 0 ${size} ${size}`);
  osLines.innerHTML = '';
  OS_FUNCS.forEach((f,i)=>{
    const a = (i/OS_FUNCS.length)*Math.PI*2 - Math.PI/2;
    const x = cx+Math.cos(a)*R, y = cy+Math.sin(a)*R;
    const node = document.createElement('div');
    node.className='os-node';
    node.style.left = x+'px'; node.style.top = y+'px';
    node.style.transform = 'translate(-50%,-50%)';
    node.innerHTML = `<div class="lbl">${f.name}</div><div class="sub">SYNCED</div>`;
    node.addEventListener('mouseenter', ()=>activateOS(i));
    node.addEventListener('focus', ()=>activateOS(i));
    node.addEventListener('click', ()=>activateOS(i));
    node.tabIndex = 0;
    osDiagram.appendChild(node);
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', `M${cx},${cy} L${x},${y}`);
    path.dataset.i = i;
    osLines.appendChild(path);
  });
}
function activateOS(i){
  document.querySelectorAll('.os-node').forEach((n,idx)=>n.classList.toggle('active', idx===i));
  osLines.querySelectorAll('path').forEach(p=>p.classList.toggle('active', +p.dataset.i===i));
  osDetail.innerHTML = `<b>${OS_FUNCS[i].name}</b> — ${OS_FUNCS[i].desc}`;
}
buildOS();
window.addEventListener('resize', buildOS);

/* ---------- AUTONOMY LOOP ---------- */
const loopNodes = document.querySelectorAll('.loop-node');
const loopProgress = document.getElementById('loopProgress');
const loopPhaseLabel = document.getElementById('loopPhaseLabel');
const PHASES = ['DISCOVER','ANALYZE','DECIDE','EXECUTE','LEARN','IMPROVE','REPEAT'];
function positionLoopNodes(){
  const wrap = document.querySelector('.loop-wrap');
  const size = wrap.clientWidth;
  const R = size*0.435;
  const cx = size/2, cy = size/2;
  loopNodes.forEach(n=>{
    const i = +n.dataset.i;
    const a = (i/7)*Math.PI*2 - Math.PI/2;
    n.style.left = (cx+Math.cos(a)*R)+'px';
    n.style.top = (cy+Math.sin(a)*R)+'px';
  });
}
positionLoopNodes();
window.addEventListener('resize', positionLoopNodes);

const loopSection = document.getElementById('loop');
let loopRunning = false, loopStep = 0, loopInterval;
const CIRC = 2*Math.PI*230;
loopProgress.style.strokeDasharray = CIRC;
function setLoopStep(step){
  loopStep = step % 7;
  loopNodes.forEach((n,idx)=>n.classList.toggle('active', idx===loopStep));
  loopPhaseLabel.style.opacity = 0;
  setTimeout(()=>{ loopPhaseLabel.textContent = PHASES[loopStep]; loopPhaseLabel.style.opacity=1; },200);
  const frac = (loopStep+1)/7;
  loopProgress.style.strokeDashoffset = CIRC*(1-frac);
}
const loopObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting && !loopRunning){
      loopRunning = true;
      setLoopStep(0);
      loopInterval = setInterval(()=>setLoopStep(loopStep+1), 1800);
    } else if(!e.isIntersecting && loopRunning){
      loopRunning = false;
      clearInterval(loopInterval);
    }
  });
},{threshold:0.4});
loopObserver.observe(loopSection);

/* ---------- INDUSTRIES CITY ---------- */
const INDUSTRIES = [
  {name:'Manufacturing', pain:'Unplanned downtime and shop-floor data that never reaches the office.', cap:'Predictive maintenance and production forecasting.', out:'Fewer stoppages, tighter margins.'},
  {name:'Construction', pain:'Budget overruns and site data scattered across sheets and phones.', cap:'Live progress tracking and resource allocation.', out:'Projects that finish on budget.'},
  {name:'Hospitality', pain:'Staffing gaps and an inconsistent guest experience shift to shift.', cap:'Demand forecasting and service orchestration.', out:'Consistent guest experience at lower cost.'},
  {name:'Retail', pain:'Stockouts and inventory that disagrees across every channel.', cap:'Demand sensing and automated replenishment.', out:'Fewer stockouts, less dead stock.'},
  {name:'Healthcare', pain:'Administrative load that pulls time away from patients.', cap:'Scheduling optimization and compliance monitoring.', out:'More time with patients, less paperwork.'},
  {name:'Education', pain:'Manual admin and student data that lives in disconnected systems.', cap:'Enrollment operations and resource planning.', out:'Staff time shifts back to students.'},
];
const buildings = document.querySelectorAll('.building');
const cdTitle=document.getElementById('cdTitle'), cdTag=document.getElementById('cdTag'), cdPain=document.getElementById('cdPain'), cdCap=document.getElementById('cdCap'), cdOut=document.getElementById('cdOut');
function setIndustry(i){
  buildings.forEach((b,idx)=>b.classList.toggle('active', idx===i));
  const d = INDUSTRIES[i];
  const detail = document.getElementById('cityDetail');
  detail.style.opacity = 0;
  setTimeout(()=>{
    cdTitle.textContent = d.name;
    cdTag.textContent = `SECTOR / ${String(i+1).padStart(2,'0')}`;
    cdPain.textContent = d.pain;
    cdCap.textContent = d.cap;
    cdOut.textContent = d.out;
    detail.style.opacity = 1;
  },150);
}
buildings.forEach((b,i)=>b.addEventListener('click', ()=>setIndustry(i)));
setIndustry(0);

/* ---------- FUTURE ROWS ---------- */
const futureRows = document.querySelectorAll('[data-f]');
const futureObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>e.target.classList.toggle('active', e.isIntersecting));
},{threshold:0.55});
futureRows.forEach(r=>futureObserver.observe(r));

/* ---------- COMMAND CENTER COUNTERS ---------- */
const ccValues = document.querySelectorAll('.cc-value');
let ccStarted = false;
function animateCC(){
  ccValues.forEach(el=>{
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix||'';
    const suffix = el.dataset.suffix||'';
    const decimals = (el.dataset.target.split('.')[1]||'').length;
    let start = null;
    const dur = 1400;
    function step(ts){
      if(!start) start = ts;
      const p = Math.min((ts-start)/dur, 1);
      const eased = 1-Math.pow(1-p,3);
      const val = target*eased;
      el.textContent = prefix+val.toFixed(decimals)+suffix;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
const ccObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting && !ccStarted){ ccStarted = true; animateCC(); }
  });
},{threshold:0.4});
ccObserver.observe(document.getElementById('ccGrid'));

const FEED_LINES = [
  'AI Core · reconciled 312 finance records',
  'Compliance Agent · flagged 1 policy update',
  'Operations Agent · rerouted 4 blocked tasks',
  'HR Agent · processed weekly payroll run',
  'Executive Agent · daily brief generated',
];
const ccFeed = document.getElementById('ccFeed');
let feedI = 0;
function rotateFeed(){
  ccFeed.querySelectorAll('.cf-line').forEach(l=>l.classList.remove('on'));
  const line = document.createElement('div');
  line.className='cf-line';
  line.textContent = '› '+FEED_LINES[feedI % FEED_LINES.length];
  ccFeed.appendChild(line);
  requestAnimationFrame(()=>line.classList.add('on'));
  while(ccFeed.children.length>2) ccFeed.removeChild(ccFeed.firstChild);
  feedI++;
}
rotateFeed();
setInterval(rotateFeed, 3200);

/* ---------- AI COPILOT ---------- */
const copilotFab = document.getElementById('copilotFab');
const copilotPanel = document.getElementById('copilotPanel');
const cpClose = document.getElementById('cpClose');
const cpBody = document.getElementById('cpBody');
const cpForm = document.getElementById('cpForm');
const cpInput = document.getElementById('cpInput');
copilotFab.addEventListener('click', ()=>copilotPanel.classList.add('open'));
cpClose.addEventListener('click', ()=>copilotPanel.classList.remove('open'));

const CP_RESPONSES = [
  {k:['manual','reduce'], a:"Start by mapping where your teams re-enter the same data more than once — that's usually where an agent can take over the work entirely, not just assist with it."},
  {k:['what is business ai os','business ai os'], a:'Business AI OS is the intelligence layer underneath your existing tools — it connects HR, finance, sales, operations and more so AI agents can discover, decide and act across all of them.'},
  {k:['improve operations','operations'], a:"AI improves operations by closing the loop between signal and action — instead of a dashboard telling you something is wrong, an agent already responded to it."},
  {k:['autonomous organization','autonomous'], a:'An autonomous organization sets direction and guardrails, then lets AI agents run the day-to-day — people step in by exception, not by default.'},
];
function respondTo(q){
  const lower = q.toLowerCase();
  const match = CP_RESPONSES.find(r=>r.k.some(k=>lower.includes(k)));
  return match ? match.a : "That's worth a real conversation — book a Discovery Session and we'll map it against your operations directly.";
}
function addMsg(text, who){
  const el = document.createElement('div');
  el.className = 'cp-msg '+(who==='user'?'cp-msg-user':'cp-msg-bot');
  el.textContent = text;
  cpBody.appendChild(el);
  cpBody.scrollTop = cpBody.scrollHeight;
}
document.getElementById('cpPrompts').addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const q = btn.dataset.q;
  addMsg(q,'user');
  setTimeout(()=>addMsg(respondTo(q),'bot'), 500);
});
cpForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = cpInput.value.trim();
  if(!q) return;
  addMsg(q,'user');
  cpInput.value='';
  setTimeout(()=>addMsg(respondTo(q),'bot'), 500);
});

/* ---------- BOOKING MODAL ---------- */
const bookingOverlay = document.getElementById('bookingOverlay');
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const bookingSuccessText = document.getElementById('bookingSuccessText');
const bookingClose = document.getElementById('bookingClose');

function openBooking(e){
  if(e) e.preventDefault();
  bookingOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  bookingForm.style.display = '';
  bookingSuccess.classList.remove('show');
}
function closeBooking(){
  bookingOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
['openBookingNav','openBookingFooter','openBookingContact'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('click', openBooking);
});
bookingClose.addEventListener('click', closeBooking);
bookingOverlay.addEventListener('click', (e)=>{ if(e.target===bookingOverlay) closeBooking(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeBooking(); });

// in-memory fallback store, used if localStorage is unavailable
let bookingMemoryStore = [];
function saveBooking(entry){
  try{
    const existing = JSON.parse(localStorage.getItem('da_bookings') || '[]');
    existing.push(entry);
    localStorage.setItem('da_bookings', JSON.stringify(existing));
    return true;
  }catch(err){
    bookingMemoryStore.push(entry);
    return false;
  }
}

bookingForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const entry = {
    name: document.getElementById('bkName').value.trim(),
    email: document.getElementById('bkEmail').value.trim(),
    company: document.getElementById('bkCompany').value.trim(),
    teamSize: document.getElementById('bkSize').value,
    message: document.getElementById('bkMessage').value.trim(),
    submittedAt: new Date().toISOString(),
  };
  const persisted = saveBooking(entry);
  bookingForm.style.display = 'none';
  bookingSuccessText.textContent = `We'll reach out to ${entry.email} shortly to confirm a time.`;
  bookingSuccess.classList.add('show');
  bookingForm.reset();
  if(!persisted){
    // storage was blocked in this environment — request is still captured for this session
    console.warn('Booking stored in memory only (localStorage unavailable):', entry);
  }
});
