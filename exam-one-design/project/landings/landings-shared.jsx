// Shared primitives + product mocks + footer for Exam.one landing directions
const R = window.React;
const { useState, useEffect, useRef } = R;

// ---------- Icon (self-contained, reconcile-safe) ----------
const Ic = ({ name, size = 16, cls = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current; if (!host) return;
    host.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    i.style.width = size + 'px'; i.style.height = size + 'px';
    host.appendChild(i);
    if (window.lucide) { try { window.lucide.createIcons(); } catch (e) {} }
  }, [name, size]);
  return <span ref={ref} aria-hidden="true" className={`inline-flex items-center justify-center align-middle ${cls}`} style={{ width: size, height: size, lineHeight: 0 }} />;
};
function useIcons(deps = []) {
  useEffect(() => { if (window.lucide) { try { window.lucide.createIcons(); } catch (e) {} } }, deps);
}

// reveal-on-scroll hook
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  });
}

// ---------- Brand data ----------
const SKILLS = [
  { id: 'reading',   label: 'Reading',   icon: 'book-open',  color: 'primary', tint: 'reading',
    blurb: 'Four short authentic texts — read for gist, detail, and to match offers to people.', minutes: 30 },
  { id: 'writing',   label: 'Writing',   icon: 'pen-line',   color: 'success', tint: 'writing',
    blurb: 'A casual message and a polite formal email, scored against the real rubric.', minutes: 30 },
  { id: 'listening', label: 'Listening', icon: 'headphones', color: 'info',    tint: 'listening',
    blurb: 'Announcements, a long matching dialogue, short exchanges and an interview.', minutes: 25 },
  { id: 'speaking',  label: 'Speaking',  icon: 'mic',        color: 'warning', tint: 'speaking',
    blurb: 'Interview, monologue and a planning task — recorded and evaluated like the exam.', minutes: 15 },
];

const READINESS = [
  { id: 'reading', label: 'Reading', value: 68, color: 'var(--color-primary)' },
  { id: 'writing', label: 'Writing', value: 42, color: 'var(--color-success)' },
  { id: 'listening', label: 'Listening', value: 30, color: 'var(--color-info)' },
  { id: 'speaking', label: 'Speaking', value: 35, color: 'var(--color-warning)' },
];

// ---------- Small primitives ----------
const Wordmark = ({ light = false, size = 'lg' }) => (
  <div className="flex items-center gap-2">
    <div className={`${size === 'sm' ? 'w-6 h-6 text-sm' : 'w-7 h-7'} rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold`}>E</div>
    <div className={`font-display ${size === 'sm' ? 'text-base' : 'text-lg'} font-bold leading-none ${light ? 'text-white' : ''}`}>
      Exam<span className="text-primary">.one</span>
    </div>
  </div>
);

const Spark = ({ values, color = 'currentColor' }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="spark" style={{ color }}>
      {values.map((v, i) => <span key={i} style={{ height: `${(v / max) * 100}%`, opacity: 0.4 + 0.6 * (v / max) }} />)}
    </div>
  );
};

const RingProg = ({ value, color = 'var(--color-primary)', label }) => (
  <div className="ring-prog" style={{ '--p': value, '--c': color }}><span>{label ?? `${value}%`}</span></div>
);

const GhStars = ({ light = false }) => (
  <a className={`btn btn-sm gap-2 ${light ? 'btn-outline border-white/25 text-white hover:bg-white hover:text-base-content' : 'btn-outline border-base-300'} rounded-field`}>
    <Ic name="star" size={15} /> Star
    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${light ? 'bg-white/15' : 'bg-base-200'}`}>21.4k</span>
  </a>
);

// ---------- Product mock: skill readiness panel ----------
const ReadinessPanel = ({ compact = false }) => (
  <div className="bg-base-100 rounded-box border border-base-300 ring-soft p-5 text-left">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-field bg-primary text-primary-content grid place-items-center font-mono text-sm font-bold">42</div>
        <div>
          <div className="font-display text-base font-bold leading-none">You're 64% exam-ready</div>
          <div className="text-[11px] text-base-content/60 mt-1">Goethe A2 · German · in 42 days</div>
        </div>
      </div>
      <span className="level-pip">A2</span>
    </div>
    <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} gap-2.5`}>
      {READINESS.map(s => (
        <div key={s.id} className="rounded-field border border-base-200 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Ic name={SKILLS.find(k => k.id === s.id).icon} size={12} cls={`text-${s.id}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-base-content/60">{s.label}</span>
          </div>
          <div className="flex items-end justify-between gap-1">
            <div className="font-mono text-xl font-bold leading-none" style={{ color: s.color }}>{s.value}%</div>
            <Spark values={[3, 5, 4, 7, 6, 9].map(v => v * (0.5 + s.value / 140))} color={s.color} />
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-base-200 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center gap-2">
      <button className="btn btn-primary btn-sm rounded-field gap-1.5 flex-1"><Ic name="play" size={13} /> Start today's plan · 30 min</button>
      <button className="btn btn-ghost btn-sm rounded-field gap-1.5"><Ic name="file-badge" size={13} /> Mock exam</button>
    </div>
  </div>
);

// ---------- Product mock: AI writing feedback ----------
const WritingFeedbackMock = () => (
  <div className="bg-base-100 rounded-box border border-base-300 ring-soft overflow-hidden text-left">
    <div className="px-4 h-11 flex items-center gap-2 border-b border-base-300">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-writing"><Ic name="pen-line" size={13} /> Writing · Formal email</span>
      <span className="ml-auto level-pip">Sie · 30–40 words</span>
    </div>
    <div className="p-4 text-sm leading-relaxed text-base-content/85">
      Sehr geehrte Damen und Herren, <mark className="fb-good">ich möchte einen Termin</mark> für nächste Woche <mark className="fb-bad">vereinbahren</mark>. Können Sie mir <mark className="fb-good">am Dienstag</mark> einen Platz <mark className="fb-bad">gében</mark>? Mit freundlichen Grüßen, Lena.
    </div>
    <div className="mx-4 mb-4 rounded-field bg-base-200/70 border border-base-300 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Ic name="sparkles" size={14} cls="text-primary" />
        <span className="text-xs font-semibold">AI review · CEFR rubric</span>
        <span className="ml-auto font-mono text-sm font-bold text-success">4.4<span className="text-base-content/40">/5</span></span>
      </div>
      <ul className="text-xs text-base-content/70 space-y-1.5">
        <li className="flex gap-2"><Ic name="check" size={13} cls="text-success shrink-0 mt-0.5" /> Register and greeting fit a formal email.</li>
        <li className="flex gap-2"><Ic name="x" size={13} cls="text-error shrink-0 mt-0.5" /> Spelling: <i>vereinbahren → vereinbaren</i>, <i>gében → geben</i>.</li>
      </ul>
    </div>
  </div>
);

// ---------- Product mock: speaking ----------
const SpeakingMock = () => {
  const bars = [4, 9, 6, 13, 8, 15, 7, 11, 5, 14, 9, 6, 12, 8, 4, 10, 6, 13, 7, 5];
  return (
    <div className="bg-base-100 rounded-box border border-base-300 ring-soft overflow-hidden text-left">
      <div className="px-4 h-11 flex items-center gap-2 border-b border-base-300">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-speaking"><Ic name="mic" size={13} /> Speaking · Monologue</span>
        <span className="ml-auto font-mono text-xs text-base-content/50">0:48 / 1:30</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <button className="btn btn-circle btn-sm bg-warning text-warning-content border-0"><Ic name="pause" size={15} /></button>
          <div className="flex items-end gap-[3px] h-8 text-warning flex-1">
            {bars.map((h, i) => <span key={i} className="wave-bar" style={{ height: `${h * 5}%`, opacity: i < 11 ? 1 : .35 }} />)}
          </div>
        </div>
        <div className="rounded-field bg-base-200/70 border border-base-300 p-3">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-base-content/50 mb-1">Live transcript</div>
          <p className="text-sm text-base-content/85 leading-relaxed">„Ich heiße Lena und ich komme aus München. In meiner Freizeit <span className="text-base-content/40">…</span>"</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="badge badge-sm badge-warning badge-soft gap-1"><Ic name="gauge" size={11} /> Fluency 3.9</span>
            <span className="badge badge-sm badge-ghost gap-1"><Ic name="spell-check" size={11} /> 2 corrections</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Product mock: mock-exam strip ----------
const MockExamStrip = () => (
  <div className="bg-base-100 rounded-box border border-base-300 ring-soft p-4 text-left">
    <div className="flex items-center gap-2 mb-3">
      <Ic name="file-badge" size={15} cls="text-primary" />
      <span className="text-sm font-semibold">Mock exam · exam-authentic</span>
      <span className="ml-auto font-mono text-xs px-2 py-0.5 rounded bg-error/10 text-error font-semibold">● 02:30:00</span>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[['Reading', 30, 'reading'], ['Listening', 25, 'listening'], ['Writing', 30, 'writing'], ['Speaking', 15, 'speaking']].map(([l, m, t], i) => (
        <div key={l} className={`rounded-field border border-base-200 p-2.5 ${i === 0 ? 'ring-2 ring-primary/40' : ''}`}>
          <Ic name={SKILLS.find(s => s.id === t).icon} size={13} cls={`text-${t}`} />
          <div className="text-xs font-semibold mt-1">{l}</div>
          <div className="font-mono text-[11px] text-base-content/50">{m} min</div>
        </div>
      ))}
    </div>
    <div className="mt-3 text-[11px] text-base-content/55 flex items-center gap-1.5">
      <Ic name="lock" size={12} /> No pauses · no transcript until submit · single attempt
    </div>
  </div>
);

// ---------- Terminal / install mock ----------
const TerminalMock = ({ light = true }) => (
  <div className={`rounded-box overflow-hidden border ${light ? 'border-white/10 bg-[#0f1117]' : 'border-base-300 bg-base-300/40'} font-mono text-[13px] text-left`}>
    <div className={`h-9 px-3 flex items-center gap-1.5 border-b ${light ? 'border-white/10' : 'border-base-300'}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-error/80" /><span className="w-2.5 h-2.5 rounded-full bg-warning/80" /><span className="w-2.5 h-2.5 rounded-full bg-success/80" />
      <span className={`ml-2 text-[11px] ${light ? 'text-white/40' : 'text-base-content/50'}`}>~/exam.one</span>
    </div>
    <div className={`p-4 space-y-1.5 ${light ? 'text-white/85' : 'text-base-content/85'}`}>
      <div><span className="text-success">$</span> git clone github.com/exam-one/exam.one</div>
      <div><span className="text-success">$</span> docker compose up</div>
      <div className={light ? 'text-white/40' : 'text-base-content/40'}>→ exam.one running on <span className="text-info">localhost:3000</span></div>
      <div className={light ? 'text-white/40' : 'text-base-content/40'}>→ bring your own LLM key · practice offline</div>
    </div>
  </div>
);

// ---------- Footer ----------
const LandingFooter = ({ light = false }) => {
  const cols = [
    ['Product', ['Features', 'Mock exams', 'Supported exams', 'Pricing']],
    ['Open source', ['GitHub', 'Self-host guide', 'Prompt templates', 'Roadmap']],
    ['Resources', ['Docs', 'Bring your own key', 'Community', 'Changelog']],
  ];
  return (
    <footer className={`${light ? 'bg-[#0f1117] text-white/70' : 'bg-base-100 border-t border-base-300'} px-6 py-12`}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8">
        <div>
          <Wordmark light={light} />
          <p className={`text-sm mt-3 max-w-xs ${light ? 'text-white/55' : 'text-base-content/60'}`}>
            Open-source, self-hostable practice for every part of a language exam — with bring-your-own-key AI feedback.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <a className={`btn btn-sm btn-circle ${light ? 'btn-ghost text-white' : 'btn-ghost'}`}><Ic name="git-branch" size={16} /></a>
            <a className={`btn btn-sm btn-circle ${light ? 'btn-ghost text-white' : 'btn-ghost'}`}><Ic name="message-circle" size={16} /></a>
            <a className={`btn btn-sm btn-circle ${light ? 'btn-ghost text-white' : 'btn-ghost'}`}><Ic name="book-open" size={16} /></a>
          </div>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${light ? 'text-white/45' : 'text-base-content/45'}`}>{h}</div>
            <ul className="space-y-2">
              {items.map(it => <li key={it}><a className={`text-sm hover:text-primary cursor-pointer ${light ? 'text-white/70' : 'text-base-content/70'}`}>{it}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className={`max-w-6xl mx-auto mt-10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs ${light ? 'border-t border-white/10 text-white/45' : 'border-t border-base-300 text-base-content/45'}`}>
        <span>© Exam.one 2026 · MIT licensed</span>
        <span className="flex items-center gap-1.5">Proudly open-source <Ic name="heart" size={12} cls="text-error" /></span>
      </div>
    </footer>
  );
};

Object.assign(window, {
  R, useState, useEffect, useRef, Ic, useIcons, useReveal,
  SKILLS, READINESS, Wordmark, Spark, RingProg, GhStars,
  ReadinessPanel, WritingFeedbackMock, SpeakingMock, MockExamStrip, TerminalMock, LandingFooter,
});
