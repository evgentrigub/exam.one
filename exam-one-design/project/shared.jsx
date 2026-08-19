// Shared data + helpers + primitives for Exam.one redesign

const L = window.React
const { useState, useEffect, useRef, useMemo, createContext, useContext } = L

// ---------- Exam structure (Goethe / telc A2 format) ----------
// Drives both the "Exam format" page and the part filters on the Exercises list.
const EXAM_STRUCTURE = {
  reading: {
    id: 'reading',
    label: 'Reading',
    icon: 'book-open',
    color: 'primary',
    minutes: 30,
    summary:
      'Four short texts of increasing difficulty. You read for gist, for detail, and you match offers to people.',
    parts: [
      {
        n: 1,
        title: 'Article or newspaper text',
        format: '5 × multiple choice (a · b · c)',
        short: 'Read a short article or newspaper text and answer 5 a/b/c questions.',
        goal: 'Understand the main points and key details of an informational text.',
        skill: 'Detailed reading of authentic everyday texts.',
      },
      {
        n: 2,
        title: 'Display board / schedule',
        format: '5 scenarios · choose the floor or place (a · b · c)',
        short:
          'Find information on a display board or timetable — pick the right floor or location.',
        goal: 'Locate one specific piece of information quickly in everyday signage.',
        skill: 'Selective / scanning reading.',
      },
      {
        n: 3,
        title: 'Personal letter or email',
        format: '5 × multiple choice (a · b · c)',
        short: 'Read a personal letter or email and answer 5 a/b/c questions.',
        goal: 'Grasp intentions, feelings and details in personal correspondence.',
        skill: 'Reading private correspondence.',
      },
      {
        n: 4,
        title: 'Matching advertisements',
        format: 'Match ads a–f to 5 people (one answer is always “x”)',
        short: 'Match the right advertisement to each person — one always has no match (x).',
        goal: 'Connect each person’s needs to a suitable offer.',
        skill: 'Matching & inference under time pressure.',
      },
    ],
  },
  listening: {
    id: 'listening',
    label: 'Listening',
    icon: 'headphones',
    color: 'info',
    minutes: 25,
    summary:
      'Four recordings — announcements, a long matching dialogue, short exchanges and an interview.',
    parts: [
      {
        n: 1,
        title: 'Announcements & voicemails',
        format: '5 × multiple choice (a · b · c) · played twice',
        short:
          'Short radio announcements and voicemail messages — 5 questions, audio played twice.',
        goal: 'Catch key information in short, spoken messages.',
        skill: 'Detailed listening to short audio.',
      },
      {
        n: 2,
        title: 'One long matching dialogue',
        format: 'Match from 9 images / words · played once',
        short:
          'One long dialogue — match people to options (e.g. how they travel), 9 choices, played once.',
        goal: 'Follow a longer conversation and assign the right detail to each person.',
        skill: 'Matching while listening.',
      },
      {
        n: 3,
        title: 'Everyday dialogues',
        format: '5 × multiple choice (a · b · c) · played once',
        short: 'Short everyday conversations — 5 multiple-choice questions, played once.',
        goal: 'Understand short exchanges in daily situations.',
        skill: 'Gist & detail in conversation.',
      },
      {
        n: 4,
        title: 'Radio interview',
        format: '5 × Yes / No · played twice',
        short:
          'A radio interview — decide whether 5 statements are correct (Yes / No), played twice.',
        goal: 'Understand opinions and statements in a longer interview.',
        skill: 'True / false judgement.',
      },
    ],
  },
  writing: {
    id: 'writing',
    label: 'Writing',
    icon: 'pen-line',
    color: 'success',
    minutes: 30,
    summary: 'Two short texts: a casual message to a friend, and a polite formal email.',
    parts: [
      {
        n: 1,
        title: 'Informal message / SMS',
        format: 'Informal “du” · 20–30 words',
        short: 'Write a short, informal message to a friend using “du” (20–30 words).',
        goal: 'Communicate simple personal information in a casual register.',
        skill: 'Informal everyday writing.',
      },
      {
        n: 2,
        title: 'Semi-formal / formal email',
        format: 'Formal “Sie” · 30–40 words',
        short: 'Write a semi-formal or formal email using “Sie” (30–40 words).',
        goal: 'Make a polite request or reply in a formal register.',
        skill: 'Formal correspondence.',
      },
    ],
  },
  speaking: {
    id: 'speaking',
    label: 'Speaking',
    icon: 'mic',
    color: 'warning',
    minutes: 15,
    summary:
      'A paired exam in three stages: a short interview, a monologue about yourself, and planning something together.',
    parts: [
      {
        n: 1,
        title: 'Interview',
        format: 'Ask & answer 4 questions from prompt cards',
        short: 'Ask your partner 4 questions from prompt cards and answer theirs.',
        goal: 'Exchange personal information in a simple interview.',
        skill: 'Asking & answering questions.',
      },
      {
        n: 2,
        title: 'Monologue',
        format: 'Talk on a topic using 4 keywords + follow-up questions',
        short:
          'Talk about yourself on a topic using 4 keywords, then answer the examiner’s questions.',
        goal: 'Speak coherently about familiar, personal topics.',
        skill: 'Connected, structured speech.',
      },
      {
        n: 3,
        title: 'Dialogue & planning',
        format: 'Plan together using a personal schedule with busy slots',
        short: 'Plan a shared activity together using a personal calendar that has busy slots.',
        goal: 'Negotiate and agree on an arrangement with a partner.',
        skill: 'Interactive negotiation.',
      },
    ],
  },
}

// part count per skill (handy for loops)
const PART_COUNT = Object.fromEntries(
  Object.values(EXAM_STRUCTURE).map(s => [s.id, s.parts.length])
)
// lookup: getPart('reading', 2) → part object
const getPart = (skill, n) => EXAM_STRUCTURE[skill]?.parts.find(p => p.n === n)

// ---------- Mock data ----------
// One exercise per exam part, per level → Reading 4 · Listening 4 · Writing 2 · Speaking 3 = 13/level.
const EXERCISES = [
  // ---------------- A2 ----------------
  // reading (4 parts)
  {
    id: 'r1',
    skill: 'reading',
    part: 1,
    type: 'article',
    level: 'A2',
    title: 'Stadtmagazin: Mein Wochenende',
    subtitle: 'Article · 5 a/b/c questions',
    minutes: 8,
    progress: 100,
    best: 92,
    attempts: 3,
    status: 'mastered',
    words: 120,
  },
  {
    id: 'r2',
    skill: 'reading',
    part: 2,
    type: 'notice',
    level: 'A2',
    title: 'Wegweiser im Kaufhaus',
    subtitle: 'Display board · find the floor',
    minutes: 6,
    progress: 60,
    best: 75,
    attempts: 2,
    status: 'inprogress',
    words: 60,
  },
  {
    id: 'r3',
    skill: 'reading',
    part: 3,
    type: 'email',
    level: 'A2',
    title: 'Einladung von Anna',
    subtitle: 'Personal email · 5 a/b/c questions',
    minutes: 7,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    words: 110,
  },
  {
    id: 'r4',
    skill: 'reading',
    part: 4,
    type: 'matching',
    level: 'A2',
    title: 'Die richtige Anzeige finden',
    subtitle: 'Match ads a–f to 5 people',
    minutes: 9,
    progress: 40,
    best: 58,
    attempts: 1,
    status: 'inprogress',
    words: 140,
  },
  // listening (4 parts)
  {
    id: 'l1',
    skill: 'listening',
    part: 1,
    type: 'announcement',
    level: 'A2',
    title: 'Ansagen & Nachrichten',
    subtitle: '5 a/b/c · played twice',
    minutes: 6,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    duration: '2:00',
  },
  {
    id: 'l2',
    skill: 'listening',
    part: 2,
    type: 'matching',
    level: 'A2',
    title: 'Wie kommen sie zur Arbeit?',
    subtitle: 'Match 9 options · once',
    minutes: 7,
    progress: 100,
    best: 85,
    attempts: 2,
    status: 'mastered',
    duration: '2:30',
  },
  {
    id: 'l3',
    skill: 'listening',
    part: 3,
    type: 'dialog',
    level: 'A2',
    title: 'Gespräche im Alltag',
    subtitle: '5 a/b/c · played once',
    minutes: 5,
    progress: 40,
    best: 55,
    attempts: 1,
    status: 'inprogress',
    duration: '1:30',
  },
  {
    id: 'l4',
    skill: 'listening',
    part: 4,
    type: 'interview',
    level: 'A2',
    title: 'Radio-Interview: Im Verein',
    subtitle: '5 Yes/No · played twice',
    minutes: 8,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    duration: '2:40',
  },
  // writing (2 parts)
  {
    id: 'w1',
    skill: 'writing',
    part: 1,
    type: 'sms',
    level: 'A2',
    title: 'Nachricht an Lisa',
    subtitle: 'Informal “du” · 20–30 words',
    minutes: 12,
    progress: 100,
    best: 4.4,
    attempts: 2,
    status: 'mastered',
    words: 30,
  },
  {
    id: 'w2',
    skill: 'writing',
    part: 2,
    type: 'email',
    level: 'A2',
    title: 'E-Mail an die Sprachschule',
    subtitle: 'Formal “Sie” · 30–40 words',
    minutes: 18,
    progress: 50,
    best: 3.6,
    attempts: 1,
    status: 'inprogress',
    words: 40,
    draft: true,
  },
  // speaking (3 parts)
  {
    id: 's1',
    skill: 'speaking',
    part: 1,
    type: 'interview',
    level: 'A2',
    title: 'Fragen zum Thema Urlaub',
    subtitle: 'Ask & answer 4 questions',
    minutes: 6,
    progress: 100,
    best: 3.9,
    attempts: 3,
    status: 'mastered',
    duration: '1:00',
  },
  {
    id: 's2',
    skill: 'speaking',
    part: 2,
    type: 'monologue',
    level: 'A2',
    title: 'Über dich erzählen',
    subtitle: 'Monologue · 4 keywords',
    minutes: 7,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    duration: '1:30',
  },
  {
    id: 's3',
    skill: 'speaking',
    part: 3,
    type: 'planning',
    level: 'A2',
    title: 'Einen Termin planen',
    subtitle: 'Plan together · schedule',
    minutes: 9,
    progress: 30,
    best: 3.2,
    attempts: 1,
    status: 'inprogress',
    duration: '2:00',
  },

  // ---------------- B1 ----------------
  // reading (4 parts)
  {
    id: 'r5',
    skill: 'reading',
    part: 1,
    type: 'article',
    level: 'B1',
    title: 'Magazin: Leben in Berlin',
    subtitle: 'Article · 5 a/b/c questions',
    minutes: 12,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    words: 220,
  },
  {
    id: 'r6',
    skill: 'reading',
    part: 2,
    type: 'notice',
    level: 'B1',
    title: 'Hinweistafel im Bahnhof',
    subtitle: 'Display board · find the place',
    minutes: 8,
    progress: 50,
    best: 68,
    attempts: 1,
    status: 'inprogress',
    words: 90,
  },
  {
    id: 'r7',
    skill: 'reading',
    part: 3,
    type: 'email',
    level: 'B1',
    title: 'E-Mail von einem Kollegen',
    subtitle: 'Personal email · 5 a/b/c questions',
    minutes: 10,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    words: 180,
  },
  {
    id: 'r8',
    skill: 'reading',
    part: 4,
    type: 'matching',
    level: 'B1',
    title: 'Passende Kurse finden',
    subtitle: 'Match ads a–f to 5 people',
    minutes: 11,
    progress: 100,
    best: 88,
    attempts: 1,
    status: 'mastered',
    words: 200,
  },
  // listening (4 parts)
  {
    id: 'l5',
    skill: 'listening',
    part: 1,
    type: 'announcement',
    level: 'B1',
    title: 'Durchsage am Flughafen',
    subtitle: '5 a/b/c · played twice',
    minutes: 7,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    duration: '2:20',
  },
  {
    id: 'l6',
    skill: 'listening',
    part: 2,
    type: 'matching',
    level: 'B1',
    title: 'Was schenken sie?',
    subtitle: 'Match 9 options · once',
    minutes: 8,
    progress: 40,
    best: 60,
    attempts: 1,
    status: 'inprogress',
    duration: '3:00',
  },
  {
    id: 'l7',
    skill: 'listening',
    part: 3,
    type: 'dialog',
    level: 'B1',
    title: 'Kurze Alltagsdialoge',
    subtitle: '5 a/b/c · played once',
    minutes: 6,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    duration: '1:50',
  },
  {
    id: 'l8',
    skill: 'listening',
    part: 4,
    type: 'interview',
    level: 'B1',
    title: 'Radio-Interview: Neue Stadt',
    subtitle: '5 Yes/No · played twice',
    minutes: 10,
    progress: 100,
    best: 82,
    attempts: 2,
    status: 'mastered',
    duration: '3:20',
  },
  // writing (2 parts)
  {
    id: 'w3',
    skill: 'writing',
    part: 1,
    type: 'sms',
    level: 'B1',
    title: 'Nachricht an einen Freund',
    subtitle: 'Informal “du” · 20–30 words',
    minutes: 14,
    progress: 50,
    best: 3.4,
    attempts: 1,
    status: 'inprogress',
    words: 30,
    draft: true,
  },
  {
    id: 'w4',
    skill: 'writing',
    part: 2,
    type: 'email',
    level: 'B1',
    title: 'Formelle E-Mail an die Firma',
    subtitle: 'Formal “Sie” · 30–40 words',
    minutes: 22,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    words: 40,
  },
  // speaking (3 parts)
  {
    id: 's4',
    skill: 'speaking',
    part: 1,
    type: 'interview',
    level: 'B1',
    title: 'Fragen zum Thema Reisen',
    subtitle: 'Ask & answer 4 questions',
    minutes: 8,
    progress: 100,
    best: 3.8,
    attempts: 2,
    status: 'mastered',
    duration: '1:10',
  },
  {
    id: 's5',
    skill: 'speaking',
    part: 2,
    type: 'monologue',
    level: 'B1',
    title: 'Über dein Hobby sprechen',
    subtitle: 'Monologue · 4 keywords',
    minutes: 10,
    progress: 30,
    best: 2.8,
    attempts: 1,
    status: 'inprogress',
    duration: '1:50',
  },
  {
    id: 's6',
    skill: 'speaking',
    part: 3,
    type: 'planning',
    level: 'B1',
    title: 'Ein Treffen planen',
    subtitle: 'Plan together · schedule',
    minutes: 12,
    progress: 0,
    best: 0,
    attempts: 0,
    status: 'new',
    duration: '2:30',
  },
]

// Full‑length mock exams — 2 per level → 4 total.
const MOCK_EXAMS = [
  {
    id: 'm-a2-1',
    level: 'A2',
    set: 'Set 1',
    title: 'Goethe Zertifikat A2 · Set 1',
    status: 'done',
    score: 78,
    time: '2h 30m',
    sections: [
      ['Reading', 30],
      ['Listening', 25],
      ['Writing', 30],
      ['Speaking', 15],
    ],
  },
  {
    id: 'm-a2-2',
    level: 'A2',
    set: 'Set 2',
    title: 'Goethe Zertifikat A2 · Set 2',
    status: 'next',
    score: null,
    time: '2h 30m',
    sections: [
      ['Reading', 30],
      ['Listening', 25],
      ['Writing', 30],
      ['Speaking', 15],
    ],
  },
  {
    id: 'm-b1-1',
    level: 'B1',
    set: 'Set 1',
    title: 'Goethe Zertifikat B1 · Set 1',
    status: 'next',
    score: null,
    time: '2h 50m',
    sections: [
      ['Reading', 50],
      ['Listening', 30],
      ['Writing', 60],
      ['Speaking', 15],
    ],
  },
  {
    id: 'm-b1-2',
    level: 'B1',
    set: 'Set 2',
    title: 'Goethe Zertifikat B1 · Set 2',
    status: 'locked',
    score: null,
    time: '2h 50m',
    sections: [
      ['Reading', 50],
      ['Listening', 30],
      ['Writing', 60],
      ['Speaking', 15],
    ],
  },
]

// Subscription plans (no functional difference in the prototype UI).
const PLANS = [
  {
    id: 'free',
    name: 'Open Source',
    price: '€0',
    period: 'forever',
    blurb: 'Use your AI provider and local environment to practice',
    features: [
      'All practice exercises',
      'Self‑checked feedback',
      'Basic progress tracking',
      '1 mock exam per level',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€9.90',
    period: 'per month',
    blurb: 'Cloud option with AI credits',
    features: [
      'Everything in Open Source',
      'Unlimited AI writing & speaking review',
      'Full mock‑exam library',
      'Weak‑spot drills & insights',
    ],
  },
]

const SKILLS = [
  { id: 'reading', label: 'Reading', icon: 'book-open', color: 'primary' },
  { id: 'writing', label: 'Writing', icon: 'pen-line', color: 'success' },
  { id: 'listening', label: 'Listening', icon: 'headphones', color: 'info' },
  { id: 'speaking', label: 'Speaking', icon: 'mic', color: 'warning' },
]

// Kept for backward compatibility — content-type labels per skill.
const TYPE_OPTIONS = {
  reading: ['article', 'notice', 'email', 'matching'],
  writing: ['sms', 'email'],
  listening: ['announcement', 'matching', 'dialog', 'interview'],
  speaking: ['interview', 'monologue', 'planning'],
}

const LEVELS = ['A2', 'B1']

// ---------- Icon ----------
// Robust against conditional mount/unmount: React owns only the <span>; lucide
// swaps an <i> we create imperatively INSIDE it, so React never reconciles the
// lucide-generated <svg> (which previously caused removeChild crashes).
const Ic = ({ name, size = 16, cls = '' }) => {
  const ref = useRef(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    host.innerHTML = ''
    const i = document.createElement('i')
    i.setAttribute('data-lucide', name)
    i.style.width = size + 'px'
    i.style.height = size + 'px'
    host.appendChild(i)
    if (window.lucide) {
      try {
        window.lucide.createIcons()
      } catch (e) {}
    }
  }, [name, size])
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`inline-flex items-center justify-center align-middle ${cls}`}
      style={{ width: size, height: size, lineHeight: 0 }}
    />
  )
}

// Kept for compatibility; with the self-contained Ic above this is now a no-op‑ish
// safety net that converts any stray <i data-lucide> placeholders.
function useIcons(deps = []) {
  useEffect(() => {
    if (window.lucide) {
      try {
        window.lucide.createIcons()
      } catch (e) {}
    }
  }, deps)
}

// ---------- App context ----------
const AppCtx = createContext(null)

function useApp() {
  return useContext(AppCtx)
}

// ---------- Small primitives ----------
const SkillBadge = ({ skill, size = 'sm' }) => {
  const s = SKILLS.find(x => x.id === skill)
  const cls = {
    reading: 'bg-reading-soft text-reading',
    writing: 'bg-writing-soft text-writing',
    listening: 'bg-listening-soft text-listening',
    speaking: 'bg-speaking-soft text-speaking',
  }[skill]
  const sizing = size === 'xs' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5'
  return (
    <span className={`inline-flex items-center rounded-selector font-medium ${cls} ${sizing}`}>
      <Ic name={s.icon} size={size === 'xs' ? 10 : 12} />
      {s.label}
    </span>
  )
}

const LevelPip = ({ level }) => <span className="level-pip">{level}</span>

const Spark = ({ values, color = 'currentColor' }) => {
  const max = Math.max(...values, 1)
  return (
    <div className="spark" style={{ color }}>
      {values.map((v, i) => (
        <span key={i} style={{ height: `${(v / max) * 100}%`, opacity: 0.4 + 0.6 * (v / max) }} />
      ))}
    </div>
  )
}

const RingProg = ({ value, color = 'var(--color-primary)', label }) => (
  <div className="ring-prog" style={{ '--p': value, '--c': color }}>
    <span>{label ?? `${value}%`}</span>
  </div>
)

const Divider = ({ label }) => (
  <div className="flex items-center gap-3 text-xs font-medium text-base-content/50 uppercase tracking-wider my-2">
    <span className="h-px flex-1 bg-base-content/10" />
    {label}
    <span className="h-px flex-1 bg-base-content/10" />
  </div>
)

Object.assign(window, {
  L,
  useState,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext,
  EXERCISES,
  MOCK_EXAMS,
  PLANS,
  SKILLS,
  TYPE_OPTIONS,
  LEVELS,
  EXAM_STRUCTURE,
  PART_COUNT,
  getPart,
  Ic,
  useIcons,
  AppCtx,
  useApp,
  SkillBadge,
  LevelPip,
  Spark,
  RingProg,
  Divider,
})
