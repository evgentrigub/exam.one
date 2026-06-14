// Shared data + helpers + primitives for Exam.one redesign

const L = window.React;
const { useState, useEffect, useRef, useMemo, createContext, useContext } = L;

// ---------- Mock data ----------
// Two levels only (A2, B1). 3 exercises per skill per level → 12/level → 24 total.
const EXERCISES = [
  // ---------------- A2 ----------------
  // reading
  { id:'r1', skill:'reading', type:'email',   level:'A2', title:'Einladung von Anna',        subtitle:'Personal email · 120 words', minutes:8, progress:100, best:92, attempts:3, status:'mastered',   words:120 },
  { id:'r2', skill:'reading', type:'notice',  level:'A2', title:'Schwimmbad-Öffnungszeiten',  subtitle:'Notice · 85 words',          minutes:6, progress:60,  best:75, attempts:2, status:'inprogress', words:85  },
  { id:'r3', skill:'reading', type:'article', level:'A2', title:'Mein Lieblingscafé',         subtitle:'Short article · 110 words',  minutes:7, progress:0,   best:0,  attempts:0, status:'new',        words:110 },
  // writing
  { id:'w1', skill:'writing', type:'email',    level:'A2', title:'Antwort an einen Freund',    subtitle:'Informal email · 80–120 words', minutes:25, progress:100, best:4.2, attempts:2, status:'mastered',   words:100 },
  { id:'w2', skill:'writing', type:'postcard', level:'A2', title:'Urlaubsgrüße aus München',   subtitle:'Postcard · 40–60 words',        minutes:15, progress:0,   best:0,   attempts:0, status:'new',        words:50  },
  { id:'w3', skill:'writing', type:'letter',   level:'A2', title:'Anmeldung im Sportverein',   subtitle:'Short form letter · 100–130 words', minutes:20, progress:50, best:3.6, attempts:1, status:'inprogress', words:120, draft:true },
  // listening
  { id:'l1', skill:'listening', type:'dialog',       level:'A2', title:'Am Bahnhof',           subtitle:'Short dialogue · 0:45',  minutes:5, progress:0,   best:0,  attempts:0, status:'new',        duration:'0:45' },
  { id:'l2', skill:'listening', type:'announcement', level:'A2', title:'Lautsprecherdurchsage', subtitle:'Announcement · 0:30',    minutes:4, progress:100, best:80, attempts:2, status:'mastered',   duration:'0:30' },
  { id:'l3', skill:'listening', type:'dialog',       level:'A2', title:'Im Supermarkt',        subtitle:'Dialogue · 1:00',        minutes:5, progress:40,  best:55, attempts:1, status:'inprogress', duration:'1:00' },
  // speaking
  { id:'s1', skill:'speaking', type:'monologue',    level:'A2', title:'Dich selbst vorstellen', subtitle:'30‑second monologue', minutes:5,  progress:100, best:3.9, attempts:3, status:'mastered',   duration:'0:30' },
  { id:'s2', skill:'speaking', type:'dialog',       level:'A2', title:'Einkaufen gehen',        subtitle:'Role‑play · 2 turns', minutes:8,  progress:0,   best:0,   attempts:0, status:'new',        duration:'1:00' },
  { id:'s3', skill:'speaking', type:'presentation', level:'A2', title:'Meine Familie',          subtitle:'Structured talk · 1:30', minutes:10, progress:30, best:3.2, attempts:1, status:'inprogress', duration:'1:30' },

  // ---------------- B1 ----------------
  // reading
  { id:'r4', skill:'reading', type:'article',      level:'B1', title:'Leben in Berlin',                subtitle:'Magazine article · 220 words', minutes:12, progress:0,  best:0,  attempts:0, status:'new',        words:220 },
  { id:'r5', skill:'reading', type:'email',        level:'B1', title:'Beschwerde über eine Bestellung', subtitle:'Formal email · 180 words',     minutes:10, progress:50, best:68, attempts:1, status:'inprogress', words:180 },
  { id:'r6', skill:'reading', type:'instructions', level:'B1', title:'Kaffeemaschine bedienen',         subtitle:'Manual · 140 words',           minutes:7,  progress:100,best:88, attempts:1, status:'mastered',   words:140 },
  // writing
  { id:'w4', skill:'writing', type:'email',  level:'B1', title:'Bewerbung um ein Praktikum', subtitle:'Formal email · 150–180 words',  minutes:30, progress:0,  best:0,   attempts:0, status:'new',        words:160 },
  { id:'w5', skill:'writing', type:'letter', level:'B1', title:'Beschwerde an Vermieter',    subtitle:'Formal complaint · 180–220 words', minutes:40, progress:50, best:3.4, attempts:1, status:'inprogress', words:200, draft:true },
  { id:'w6', skill:'writing', type:'essay',  level:'B1', title:'Pro & Contra: Homeoffice',   subtitle:'Argumentative essay · 200–250 words', minutes:45, progress:0, best:0, attempts:0, status:'new',        words:230 },
  // listening
  { id:'l4', skill:'listening', type:'interview',    level:'B1', title:'Interview: Neue Stadt',       subtitle:'Radio interview · 2:10', minutes:10, progress:40,  best:60, attempts:1, status:'inprogress', duration:'2:10' },
  { id:'l5', skill:'listening', type:'announcement', level:'B1', title:'Durchsage am Flughafen',      subtitle:'Announcement · 1:10',    minutes:6,  progress:0,   best:0,  attempts:0, status:'new',        duration:'1:10' },
  { id:'l6', skill:'listening', type:'lecture',      level:'B1', title:'Vortrag: Gesunde Ernährung',  subtitle:'Lecture · 3:00',         minutes:14, progress:100, best:82, attempts:2, status:'mastered',   duration:'3:00' },
  // speaking
  { id:'s4', skill:'speaking', type:'monologue',    level:'B1', title:'Über Hobbys sprechen',       subtitle:'Monologue · 1:00',      minutes:8,  progress:100, best:3.8, attempts:2, status:'mastered',   duration:'1:00' },
  { id:'s5', skill:'speaking', type:'dialog',       level:'B1', title:'Ein Gespräch planen',        subtitle:'Role‑play · 2 turns',   minutes:10, progress:0,   best:0,   attempts:0, status:'new',        duration:'1:30' },
  { id:'s6', skill:'speaking', type:'presentation', level:'B1', title:'Präsentation: Mein Hobby',   subtitle:'Structured talk · 2:00', minutes:15, progress:30, best:2.8, attempts:1, status:'inprogress', duration:'2:00' },
];

// Full‑length mock exams — 2 per level → 4 total.
const MOCK_EXAMS = [
  { id:'m-a2-1', level:'A2', set:'Set 1', title:'Goethe Zertifikat A2 · Set 1', status:'done',   score:78, time:'2h 30m',
    sections:[['Reading',30],['Listening',25],['Writing',30],['Speaking',15]] },
  { id:'m-a2-2', level:'A2', set:'Set 2', title:'Goethe Zertifikat A2 · Set 2', status:'next',   score:null, time:'2h 30m',
    sections:[['Reading',30],['Listening',25],['Writing',30],['Speaking',15]] },
  { id:'m-b1-1', level:'B1', set:'Set 1', title:'Goethe Zertifikat B1 · Set 1', status:'next',   score:null, time:'2h 50m',
    sections:[['Reading',50],['Listening',30],['Writing',60],['Speaking',15]] },
  { id:'m-b1-2', level:'B1', set:'Set 2', title:'Goethe Zertifikat B1 · Set 2', status:'locked', score:null, time:'2h 50m',
    sections:[['Reading',50],['Listening',30],['Writing',60],['Speaking',15]] },
];

// Subscription plans (no functional difference in the prototype UI).
const PLANS = [
  { id:'free', name:'Free', price:'€0', period:'forever',
    blurb:'Get started with the core exercises.',
    features:['All practice exercises','Self‑checked feedback','Basic progress tracking','1 mock exam per level'] },
  { id:'pro', name:'Pro', price:'€9.90', period:'per month',
    blurb:'Everything, with unlimited AI review.',
    features:['Everything in Free','Unlimited AI writing & speaking review','Full mock‑exam library','Weak‑spot drills & insights'] },
];

const SKILLS = [
  { id:'reading',   label:'Reading',   icon:'book-open',     color:'primary' },
  { id:'writing',   label:'Writing',   icon:'pen-line',      color:'success' },
  { id:'listening', label:'Listening', icon:'headphones',    color:'info' },
  { id:'speaking',  label:'Speaking',  icon:'mic',           color:'warning' },
];

const TYPE_OPTIONS = {
  reading:   ['email','notice','article','instructions'],
  writing:   ['email','letter','postcard','essay'],
  listening: ['dialog','announcement','interview','lecture'],
  speaking:  ['monologue','dialog','presentation'],
};

const LEVELS = ['A2','B1'];

// ---------- Icon ----------
// Robust against conditional mount/unmount: React owns only the <span>; lucide
// swaps an <i> we create imperatively INSIDE it, so React never reconciles the
// lucide-generated <svg> (which previously caused removeChild crashes).
const Ic = ({ name, size=16, cls='' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    i.style.width = size + 'px';
    i.style.height = size + 'px';
    host.appendChild(i);
    if (window.lucide) { try { window.lucide.createIcons(); } catch (e) {} }
  }, [name, size]);
  return (
    <span ref={ref} aria-hidden="true"
      className={`inline-flex items-center justify-center align-middle ${cls}`}
      style={{ width: size, height: size, lineHeight: 0 }}/>
  );
};

// Kept for compatibility; with the self-contained Ic above this is now a no-op‑ish
// safety net that converts any stray <i data-lucide> placeholders.
function useIcons(deps=[]) {
  useEffect(() => { if (window.lucide) { try { window.lucide.createIcons(); } catch (e) {} } }, deps);
}

// ---------- App context ----------
const AppCtx = createContext(null);

function useApp() { return useContext(AppCtx); }

// ---------- Small primitives ----------
const SkillBadge = ({ skill, size='sm' }) => {
  const s = SKILLS.find(x => x.id === skill);
  const cls = {
    reading:   'bg-reading-soft text-reading',
    writing:   'bg-writing-soft text-writing',
    listening: 'bg-listening-soft text-listening',
    speaking:  'bg-speaking-soft text-speaking',
  }[skill];
  const sizing = size === 'xs' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5';
  return (
    <span className={`inline-flex items-center rounded-selector font-medium ${cls} ${sizing}`}>
      <Ic name={s.icon} size={size==='xs'?10:12}/>
      {s.label}
    </span>
  );
};

const LevelPip = ({ level }) => (
  <span className="level-pip">{level}</span>
);

const Spark = ({ values, color='currentColor' }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="spark" style={{ color }}>
      {values.map((v,i)=>(
        <span key={i} style={{ height: `${(v/max)*100}%`, opacity: 0.4 + 0.6*(v/max) }}/>
      ))}
    </div>
  );
};

const RingProg = ({ value, color='var(--color-primary)', label }) => (
  <div className="ring-prog" style={{ '--p': value, '--c': color }}>
    <span>{label ?? `${value}%`}</span>
  </div>
);

const Divider = ({ label }) => (
  <div className="flex items-center gap-3 text-xs font-medium text-base-content/50 uppercase tracking-wider my-2">
    <span className="h-px flex-1 bg-base-content/10"/>
    {label}
    <span className="h-px flex-1 bg-base-content/10"/>
  </div>
);

Object.assign(window, { L, useState, useEffect, useRef, useMemo, createContext, useContext,
  EXERCISES, MOCK_EXAMS, PLANS, SKILLS, TYPE_OPTIONS, LEVELS, Ic, useIcons, AppCtx, useApp,
  SkillBadge, LevelPip, Spark, RingProg, Divider });
