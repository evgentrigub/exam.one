// =====================================================================
// AI PROMPT SETTINGS  (Account / Profile page)
// Lets the user edit the prompts used to generate / answer / review
// exercises — separate per exam level, skill, part and prompt kind.
// =====================================================================

// Which prompt kinds exist per skill, and how many parts each skill has.
//   reading / listening  → exercise generator only           (1 kind  × parts)
//   writing / speaking   → generator + answer + review        (3 kinds × parts)
const PROMPT_MATRIX = {
  reading:   { parts:[1,2,3,4], kinds:['generator'] },
  listening: { parts:[1,2,3,4], kinds:['generator'] },
  writing:   { parts:[1,2],     kinds:['generator','answer','review'] },
  speaking:  { parts:[1,2,3],   kinds:['generator','answer','review'] },
};

const PROMPT_KINDS = {
  generator: { label:'Exercise generator', icon:'sparkles',        desc:'Builds the exercise content for this part.' },
  answer:    { label:'Answer generator',   icon:'key-round',       desc:'Produces the model answer / solution key.' },
  review:    { label:'Review generator',   icon:'clipboard-check', desc:'Reviews & scores the learner’s response.' },
};

const PROMPT_TODAY = '2026-06-24';

function pmtFmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function pmtDefaultText(level, skill, part, kind) {
  const p = (window.getPart && getPart(skill, part)) || {};
  const title = p.title || '';
  const map = {
    generator: `Mock prompt — generate a ${skill} Part ${part} exercise ("${title}") at level ${level}. Keep it exam-authentic, level-appropriate and concise. Return the task, the stimulus text and the items.`,
    answer:    `Mock prompt — produce the model answer / solution key for ${skill} Part ${part} ("${title}") at level ${level}. Be precise and consistent with the exam rubric.`,
    review:    `Mock prompt — review and score the learner's ${skill} Part ${part} response ("${title}") at level ${level}. Give a band score plus short, encouraging, actionable feedback.`,
  };
  return map[kind];
}

// Build the initial store. Keyed by `${level}.${skill}.${part}.${kind}`.
function pmtSeedStore() {
  const store = {};
  const datesByLevel = { A2:['2026-06-10','2026-05-20','2026-04-15'], B1:['2026-05-02','2026-03-18'] };
  for (const level of LEVELS) {
    for (const skill of Object.keys(PROMPT_MATRIX)) {
      const { parts, kinds } = PROMPT_MATRIX[skill];
      for (const part of parts) {
        for (const kind of kinds) {
          const key  = `${level}.${skill}.${part}.${kind}`;
          const base = pmtDefaultText(level, skill, part, kind);
          const ds   = datesByLevel[level];
          const history = ds.slice(1).map((d, i) => ({
            date: d,
            text: base.replace('Mock prompt —', `Mock prompt (older draft ${ds.length - 1 - i}) —`),
          }));
          store[key] = { current: base, updated: ds[0], history };
        }
      }
    }
  }
  return store;
}

const PROMPT_STORE_KEY = 'examone.prompts.v1';

function pmtLoadStore() {
  const seed = pmtSeedStore();
  try {
    const raw = localStorage.getItem(PROMPT_STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // overlay saved entries onto the seed so new keys still appear
      for (const k of Object.keys(seed)) if (saved[k]) seed[k] = saved[k];
    }
  } catch (e) {}
  return seed;
}

function pmtSaveStore(store) {
  try { localStorage.setItem(PROMPT_STORE_KEY, JSON.stringify(store)); } catch (e) {}
}

// ---------- A single editable prompt ----------
function PromptEditor({ storeKey, entry, kind, accent, onCommit }) {
  const k = PROMPT_KINDS[kind];
  const [text, setText]         = useState(entry.current);   // re-inits via key= remount
  const [showHist, setShowHist] = useState(false);
  const dirty = text !== entry.current;

  const save = () => { if (dirty) onCommit(storeKey, text); };
  const revert = () => setText(entry.current);
  const restore = (v) => { onCommit(storeKey, v.text); setText(v.text); setShowHist(false); };

  return (
    <div className="rounded-box border border-base-300/70 bg-base-100 overflow-hidden">
      {/* head */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300/60 bg-base-200/40">
        <span className={`w-7 h-7 rounded-selector grid place-items-center text-${accent}`}
              style={{ background:`color-mix(in oklab, var(--color-${accent}) 14%, transparent)` }}>
          <Ic name={k.icon} size={14}/>
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">{k.label}</div>
          <div className="text-[11px] text-base-content/55 leading-tight">{k.desc}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-base-content/45">Last changed</div>
          <div className="font-mono text-[11px] text-base-content/70 flex items-center gap-1 justify-end">
            <Ic name="clock" size={11}/> {pmtFmtDate(entry.updated)}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[120px] resize-y rounded-box border border-base-300 bg-base-100
                     p-3 font-mono text-[12.5px] leading-relaxed text-base-content/85
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={save} disabled={!dirty}
            className={`btn btn-sm rounded-full gap-1.5 ${dirty ? `btn-${accent}` : 'btn-disabled'}`}>
            <Ic name="save" size={13}/> Save changes
          </button>
          {dirty && (
            <button onClick={revert} className="btn btn-ghost btn-sm rounded-full gap-1.5">
              <Ic name="undo-2" size={13}/> Discard
            </button>
          )}
          {dirty
            ? <span className="text-[11px] text-warning flex items-center gap-1"><Ic name="dot" size={14}/> Unsaved edits</span>
            : <span className="text-[11px] text-success flex items-center gap-1"><Ic name="check" size={12}/> Saved</span>}

          <button
            onClick={() => setShowHist(s => !s)}
            className="btn btn-ghost btn-sm rounded-full gap-1.5 ml-auto">
            <Ic name="history" size={13}/> History
            <span className="badge badge-ghost badge-sm font-mono">{entry.history.length}</span>
            <Ic name={showHist ? 'chevron-up' : 'chevron-down'} size={13}/>
          </button>
        </div>

        {/* version history */}
        {showHist && (
          <div className="mt-3 rounded-box border border-base-300/70 bg-base-200/30 divide-y divide-base-300/60">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-base-content/45">
              Previous versions · most recent first
            </div>
            {entry.history.length === 0 && (
              <div className="px-3 py-3 text-xs text-base-content/50">No earlier versions yet.</div>
            )}
            {entry.history.map((v, i) => (
              <div key={i} className="px-3 py-2.5 flex items-start gap-3">
                <span className="font-mono text-[10px] mt-0.5 px-1.5 py-0.5 rounded bg-base-300/60 text-base-content/60">
                  v{entry.history.length - i}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[11px] text-base-content/45 mb-0.5">{pmtFmtDate(v.date)}</div>
                  <div className="text-[11.5px] text-base-content/70 line-clamp-2">{v.text}</div>
                </div>
                <button
                  onClick={() => restore(v)}
                  className="btn btn-outline btn-xs rounded-full gap-1 shrink-0">
                  <Ic name="rotate-ccw" size={11}/> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- The settings section ----------
function PromptSettings({ defaultLevel = 'A2' }) {
  useIcons();
  const [store, setStore] = useState(() => pmtLoadStore());
  const [level, setLevel] = useState(LEVELS.includes(defaultLevel) ? defaultLevel : 'A2');
  const [skill, setSkill] = useState('reading');
  const [part,  setPart]  = useState(1);

  useEffect(() => { pmtSaveStore(store); }, [store]);

  const cfg = PROMPT_MATRIX[skill];
  // keep the selected part valid when the skill changes
  useEffect(() => { if (!cfg.parts.includes(part)) setPart(cfg.parts[0]); }, [skill]);

  const accent = (SKILLS.find(s => s.id === skill) || {}).color || 'primary';
  const partObj = (window.getPart && getPart(skill, part)) || {};

  const commit = (key, newText) => setStore(prev => {
    const e = prev[key];
    if (e.current === newText) return prev;
    const history = [{ text: e.current, date: e.updated }, ...e.history].slice(0, 5);
    return { ...prev, [key]: { current: newText, updated: PROMPT_TODAY, history } };
  });

  const activePart = cfg.parts.includes(part) ? part : cfg.parts[0];

  return (
    <CalmCard className="p-7">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-box bg-primary/10 grid place-items-center text-primary shrink-0">
          <Ic name="terminal" size={17}/>
        </span>
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold leading-tight">AI prompt settings</h3>
          <p className="text-sm text-base-content/60 mt-0.5">
            Edit the prompts that generate, answer and review exercises. Prompts are stored separately
            for every level, skill and exam part. Pick what to edit below.
          </p>
        </div>
      </div>

      {/* selectors */}
      <div className="mt-6 space-y-4">
        {/* level */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-base-content/45 w-16 shrink-0">Level</span>
          <div className="join">
            {LEVELS.map(lv => (
              <button key={lv} onClick={() => setLevel(lv)}
                className={`join-item btn btn-sm ${level === lv ? 'btn-primary' : 'btn-ghost bg-base-200/60'}`}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        {/* skill */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-base-content/45 w-16 shrink-0">Skill</span>
          <div className="join">
            {SKILLS.map(s => {
              const on = s.id === skill;
              return (
                <button key={s.id} onClick={() => setSkill(s.id)}
                  className={`join-item btn btn-sm gap-1.5 ${on ? `btn-${s.color}` : 'btn-ghost bg-base-200/60'}`}>
                  <Ic name={s.icon} size={13}/> {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* part */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-base-content/45 w-16 shrink-0">Part</span>
          <div className="join">
            {cfg.parts.map(n => (
              <button key={n} onClick={() => setPart(n)}
                className={`join-item btn btn-sm ${activePart === n ? `btn-${accent}` : 'btn-ghost bg-base-200/60'}`}>
                Part {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* context line */}
      <div className="mt-5 flex items-center gap-2 text-sm">
        <LevelPip level={level}/>
        <SkillBadge skill={skill} size="xs"/>
        <span className="text-base-content/40">·</span>
        <span className="font-medium">Part {activePart}</span>
        {partObj.title && <span className="text-base-content/55">— {partObj.title}</span>}
      </div>

      {/* editors */}
      <div className="mt-4 space-y-4">
        {cfg.kinds.map(kind => {
          const key = `${level}.${skill}.${activePart}.${kind}`;
          return (
            <PromptEditor
              key={key} storeKey={key} entry={store[key]}
              kind={kind} accent={accent} onCommit={commit}
            />
          );
        })}
      </div>

      <div className="mt-4 text-xs text-base-content/50 flex items-center gap-1.5">
        <Ic name="info" size={12}/> Demo only — prompt text is mock content. Edits are saved in your browser and keep the last 5 versions per prompt.
      </div>
    </CalmCard>
  );
}

Object.assign(window, { PROMPT_MATRIX, PROMPT_KINDS, PromptSettings, PromptEditor });
