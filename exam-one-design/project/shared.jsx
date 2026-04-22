// Shared data + helpers + primitives for Examl.one redesign

const L = window.React;
const { useState, useEffect, useRef, useMemo, createContext, useContext } = L;

// ---------- Mock data ----------
const EXERCISES = [
  // reading
  { id: 'r1', skill:'reading', type:'email',  level:'A2', title:'Einladung von Anna', subtitle:'Personal email · 120 words', minutes: 8, progress: 100, best: 92, attempts: 3, status:'mastered', words: 120 },
  { id: 'r2', skill:'reading', type:'notice', level:'A2', title:'Schwimmbad-Öffnungszeiten', subtitle:'Notice · 85 words', minutes: 6, progress: 60, best: 75, attempts: 2, status:'inprogress', words: 85 },
  { id: 'r3', skill:'reading', type:'article',level:'B1', title:'Leben in Berlin', subtitle:'Magazine article · 220 words', minutes: 12, progress: 0, best: 0, attempts: 0, status:'new', words: 220 },
  { id: 'r4', skill:'reading', type:'ad',     level:'A2', title:'WG sucht Mitbewohner', subtitle:'Classified ad · 95 words', minutes: 5, progress: 0, best: 0, attempts: 0, status:'new', words: 95 },
  { id: 'r5', skill:'reading', type:'instructions', level:'B1', title:'Kaffeemaschine bedienen', subtitle:'Manual · 140 words', minutes: 7, progress: 100, best: 88, attempts: 1, status:'mastered', words: 140 },
  { id: 'r6', skill:'reading', type:'article',level:'C1', title:'Klimaschutz in Städten', subtitle:'Op‑ed · 380 words', minutes: 18, progress: 25, best: 64, attempts: 1, status:'inprogress', words: 380 },
  // writing
  { id: 'w1', skill:'writing', type:'email', level:'A2', title:'Antwort an einen Freund', subtitle:'Informal email · 80–120 words', minutes: 25, progress: 100, best: 4.2, attempts: 2, status:'mastered', words: 100 },
  { id: 'w2', skill:'writing', type:'letter',level:'C1', title:'Beschwerde an Vermieter', subtitle:'Formal complaint · 180–220 words', minutes: 40, progress: 50, best: 3.4, attempts: 1, status:'inprogress', words: 200, draft: true },
  { id: 'w3', skill:'writing', type:'essay', level:'C1', title:'Pro & Contra: Homeoffice', subtitle:'Argumentative essay · 200–250 words', minutes: 45, progress: 0, best: 0, attempts: 0, status:'new', words: 220 },
  { id: 'w4', skill:'writing', type:'postcard',level:'A2', title:'Urlaubsgrüße aus München', subtitle:'Postcard · 40–60 words', minutes: 15, progress: 0, best: 0, attempts: 0, status:'new', words: 50 },
  // listening
  { id: 'l1', skill:'listening', type:'dialog', level:'A2', title:'Am Bahnhof', subtitle:'Short dialogue · 0:45', minutes: 5, progress: 0, best: 0, attempts: 0, status:'new', duration:'0:45' },
  { id: 'l2', skill:'listening', type:'announcement', level:'A2', title:'Lautsprecherdurchsage', subtitle:'Announcement · 0:30', minutes: 4, progress: 100, best: 80, attempts: 2, status:'mastered', duration:'0:30' },
  { id: 'l3', skill:'listening', type:'interview', level:'B1', title:'Interview: Neue Stadt', subtitle:'Radio interview · 2:10', minutes: 10, progress: 40, best: 60, attempts: 1, status:'inprogress', duration:'2:10' },
  { id: 'l4', skill:'listening', type:'lecture',   level:'C1', title:'Vortrag: Energiewende', subtitle:'Lecture · 4:30', minutes: 18, progress: 0, best: 0, attempts: 0, status:'new', duration:'4:30' },
  // speaking
  { id: 's1', skill:'speaking', type:'monologue', level:'A2', title:'Dich selbst vorstellen', subtitle:'30‑second monologue', minutes: 5, progress: 100, best: 3.9, attempts: 3, status:'mastered', duration:'0:30' },
  { id: 's2', skill:'speaking', type:'dialog',  level:'B1', title:'Ein Gespräch planen', subtitle:'Role‑play · 2 turns', minutes: 10, progress: 0, best: 0, attempts: 0, status:'new', duration:'1:30' },
  { id: 's3', skill:'speaking', type:'presentation', level:'C1', title:'Präsentation: Mein Hobby', subtitle:'Structured talk · 2:00', minutes: 15, progress: 30, best: 2.8, attempts: 1, status:'inprogress', duration:'2:00' },
];

const SKILLS = [
  { id:'reading',   label:'Reading',   icon:'book-open',     color:'primary' },
  { id:'writing',   label:'Writing',   icon:'pen-line',      color:'success' },
  { id:'listening', label:'Listening', icon:'headphones',    color:'info' },
  { id:'speaking',  label:'Speaking',  icon:'mic',           color:'warning' },
];

const TYPE_OPTIONS = {
  reading:   ['email','notice','article','ad','instructions'],
  writing:   ['email','letter','essay','postcard','note'],
  listening: ['dialog','announcement','interview','lecture'],
  speaking:  ['monologue','dialog','presentation'],
};

const LEVELS = ['A2','B1','B2','C1'];

// ---------- Icon ----------
const Ic = ({ name, size=16, cls='' }) => (
  <i data-lucide={name} style={{ width:size, height:size }} className={cls}></i>
);

// re-run icon mount
function useIcons(deps=[]) {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, deps);
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
  EXERCISES, SKILLS, TYPE_OPTIONS, LEVELS, Ic, useIcons, AppCtx, useApp,
  SkillBadge, LevelPip, Spark, RingProg, Divider });
