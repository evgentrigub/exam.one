// Mock exam flow — overview → part → exercise → result, with sequential locking & reset
const { L, useState, useEffect, useApp, MOCK_EXAMS, Ic, useIcons,
  ReadingExercise, ListeningExercise, WritingExercise, SpeakingExercise } = window;

// which standard exercise interface to open for each part
const EX_COMPONENT = {
  reading: ReadingExercise, listening: ListeningExercise,
  writing: WritingExercise, speaking: SpeakingExercise,
};

// Part definition: required exercise counts per skill
const PART_DEFS = [
  { id:'reading',   label:'Reading',   icon:'book-open',  color:'primary', count:4,
    pool:['Kurze E‑Mail','Anzeige lesen','Zeitungsartikel','Hinweisschild lesen'] },
  { id:'listening', label:'Listening', icon:'headphones', color:'info',    count:4,
    pool:['Telefongespräch','Lautsprecherdurchsage','Radiointerview','Kurzdialog'] },
  { id:'writing',   label:'Writing',   icon:'pen-line',   color:'success', count:2,
    pool:['Persönliche E‑Mail','Kurze Mitteilung'] },
  { id:'speaking',  label:'Speaking',  icon:'mic',        color:'warning', count:3,
    pool:['Sich vorstellen','Ein Bild beschreiben','Etwas gemeinsam planen'] },
];
const TOTAL_EX = PART_DEFS.reduce((s,p)=>s+p.count,0);

function blankState() {
  const done = {}, completed = {};
  PART_DEFS.forEach(p => { done[p.id] = Array(p.count).fill(false); completed[p.id] = false; });
  return { done, completed, scores:{}, finished:false };
}

function MockExam() {
  const { route, go, level } = useApp();
  const exam = MOCK_EXAMS.find(m => m.id === route.id) || MOCK_EXAMS.find(m => m.level === level) || MOCK_EXAMS[0];
  const storeKey = `exam:mock:${exam.id}`;

  const [state, setState] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(storeKey)); if (s && s.done) return s; } catch {}
    return blankState();
  });
  const [view, setView] = useState(() => state.finished ? 'result' : 'overview');
  const [activePart, setActivePart] = useState(null);
  const [activeEx, setActiveEx] = useState(null);
  useIcons([view, activePart, activeEx, JSON.stringify(state)]);

  useEffect(() => { localStorage.setItem(storeKey, JSON.stringify(state)); }, [state]);

  // ---- derived ----
  const completedCount = PART_DEFS.filter(p => state.completed[p.id]).length;
  const allCompleted = completedCount === PART_DEFS.length;
  const doneTotal = PART_DEFS.reduce((s,p)=> s + state.done[p.id].filter(Boolean).length, 0);

  // ---- actions ----
  const openPart = (pid) => { if (state.completed[pid] || state.finished) return; setActivePart(pid); setView('part'); };
  const openEx = (pid, idx) => {
    if (state.completed[pid] || state.done[pid][idx]) return; // locked
    setActivePart(pid); setActiveEx(idx); setView('exercise');
  };
  const completeEx = (pid, idx) => {
    setState(s => {
      const arr = s.done[pid].slice(); arr[idx] = true;
      return { ...s, done:{ ...s.done, [pid]: arr } };
    });
    setActiveEx(null); setView('part');
  };
  const completePart = (pid) => setState(s => {
    const ratio = s.done[pid].filter(Boolean).length / s.done[pid].length;
    const score = Math.round(45 + 55*ratio); // deterministic mock score
    return { ...s, completed:{ ...s.completed, [pid]:true }, scores:{ ...s.scores, [pid]:score } };
  });
  const resetExam = () => { setState(blankState()); setActivePart(null); setActiveEx(null); setView('overview'); };
  const finishExam = () => setState(s => ({ ...s, finished:true }));

  // ===================================================================
  if (view === 'result') return <ResultView exam={exam} state={state} onRestart={resetExam} onBack={()=>go({name:'exams'})}/>;

  // open a single exercise inside the exam, in “exam mode”
  if (view === 'exercise' && activePart && activeEx != null) {
    const def = PART_DEFS.find(p => p.id === activePart);
    const Comp = EX_COMPONENT[activePart];
    return <Comp exam={{
      partLabel: `${def.label} part`,
      exNo: activeEx + 1,
      exTotal: def.count,
      exTitle: def.pool[activeEx],
      onBack: () => { setActiveEx(null); setView('part'); },
      onComplete: () => completeEx(activePart, activeEx),
    }}/>;
  }

  if (view === 'part' && activePart) {
    const def = PART_DEFS.find(p => p.id === activePart);
    return <PartView def={def} done={state.done[activePart]} onOpenEx={(i)=>openEx(activePart,i)}
                     onComplete={()=>{ completePart(activePart); setActivePart(null); setView('overview'); }}
                     onBack={()=>{ setActivePart(null); setView('overview'); }}/>;
  }

  // ---- OVERVIEW ----
  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <button onClick={()=>go({name:'exams'})} className="btn btn-ghost btn-sm gap-1"><Ic name="arrow-left" size={14}/> Mock exams</button>
        <button onClick={resetExam} className="btn btn-ghost btn-sm gap-1.5 text-error hover:bg-error/10">
          <Ic name="rotate-ccw" size={13}/> Reset exam
        </button>
      </div>

      <div className="card bg-base-100 border border-base-300 ring-soft p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <Ic name="file-badge" size={12}/> Full mock exam · {exam.level}
            </div>
            <h1 className="font-display text-3xl font-bold mt-2">{exam.title}</h1>
            <p className="text-sm text-base-content/70 mt-1">
              Complete each part separately. Once you mark a part as completed, it locks — just like the real exam.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-2xl font-bold tabular-nums">{completedCount}/{PART_DEFS.length}</div>
            <div className="text-[11px] text-base-content/60 uppercase tracking-wider">parts done</div>
          </div>
        </div>

        {/* overall progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-base-content/60 mb-1">
            <span>Exam progress</span>
            <span className="font-mono">{doneTotal}/{TOTAL_EX} tasks</span>
          </div>
          <progress className="progress progress-primary w-full h-2" value={completedCount} max={PART_DEFS.length}/>
        </div>

        {/* parts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {PART_DEFS.map((p, i) => {
            const isDone = state.completed[p.id];
            const exDone = state.done[p.id].filter(Boolean).length;
            return (
              <div key={p.id}
                className={`rounded-box border p-5 transition-colors
                  ${isDone ? 'border-success/40 bg-success/5' : 'border-base-300 bg-base-100 hover:border-base-content/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-field grid place-items-center bg-${p.color}/10 text-${p.color}`}>
                    <Ic name={p.icon} size={20}/>
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-lg leading-tight">{p.label}</div>
                    <div className="text-xs text-base-content/60">{p.count} exercises · Part {i+1}</div>
                  </div>
                  {isDone
                    ? <span className="flex items-center gap-1 text-success text-xs font-semibold"><Ic name="lock" size={12}/> Locked</span>
                    : <span className="text-xs text-base-content/50">{exDone}/{p.count} done</span>}
                </div>

                <div className="mt-4">
                  {isDone ? (
                    <div className="flex items-center gap-2">
                      <div className="ring-prog" style={{'--p':state.scores[p.id], '--c':'var(--color-success)'}}><span>{state.scores[p.id]}%</span></div>
                      <div className="text-xs text-base-content/60">Completed · you can’t reopen this part.</div>
                    </div>
                  ) : (
                    <button onClick={()=>openPart(p.id)} className={`btn btn-sm w-full gap-1.5 bg-${p.color} text-${p.color}-content border-${p.color} hover:opacity-90`}>
                      <Ic name="play" size={13}/> {exDone>0 ? 'Continue part' : 'Start part'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* finish */}
        <div className="mt-6 pt-5 border-t border-base-300 flex items-center gap-3">
          <div className="text-sm text-base-content/60">
            {allCompleted ? 'All parts completed — view your results.' : `Finish all ${PART_DEFS.length} parts to see your overall result.`}
          </div>
          <button onClick={()=>{ finishExam(); setView('result'); }} disabled={!allCompleted}
            className={`btn btn-sm ml-auto gap-1.5 ${allCompleted ? 'btn-primary' : 'bg-base-200 text-base-content/40 border border-base-300 hover:bg-base-200'}`}>
            View results <Ic name="arrow-right" size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Part view ----
function PartView({ def, done, onOpenEx, onComplete, onBack }) {
  useIcons([JSON.stringify(done)]);
  const doneCount = done.filter(Boolean).length;
  const allDone = doneCount === def.count;
  return (
    <div className="max-w-[860px] mx-auto px-6 py-8">
      <button onClick={onBack} className="btn btn-ghost btn-sm gap-1 mb-5"><Ic name="arrow-left" size={14}/> Exam overview</button>

      <div className="card bg-base-100 border border-base-300 ring-soft p-7">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-field grid place-items-center bg-${def.color}/10 text-${def.color}`}>
            <Ic name={def.icon} size={22}/>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">{def.label} part</h1>
            <div className="text-sm text-base-content/60">{def.count} exercises · {doneCount}/{def.count} done</div>
          </div>
        </div>

        <div className="alert bg-warning/10 border border-warning/30 mt-5 text-sm">
          <Ic name="alert-triangle" size={15} cls="text-warning"/>
          <span>Open each exercise to complete it. Once you finish an exercise it locks — you can’t return to it.</span>
        </div>

        <div className="mt-5 space-y-2">
          {def.pool.slice(0, def.count).map((title, idx) => {
            const isDone = done[idx];
            return (
              <button key={idx} onClick={()=>!isDone && onOpenEx(idx)} disabled={isDone}
                className={`w-full flex items-center gap-3 p-4 rounded-box border text-left transition-colors
                  ${isDone ? 'border-success/40 bg-success/5 cursor-default' : 'border-base-300 hover:border-primary/50 hover:bg-primary/5'}`}>
                <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 border
                  ${isDone ? 'bg-success text-success-content border-success' : 'border-base-300 text-base-content/50'}`}>
                  {isDone ? <Ic name="check" size={14}/> : <span className="text-xs font-mono">{idx+1}</span>}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-base-content/55">{def.label} task {idx+1}</div>
                </div>
                {isDone
                  ? <span className="flex items-center gap-1 text-success text-xs font-semibold"><Ic name="lock" size={12}/> Completed</span>
                  : <span className="flex items-center gap-1 text-primary text-xs font-medium">Open <Ic name="arrow-right" size={12}/></span>}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-base-300 flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm">Leave (keep progress)</button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-base-content/55">{doneCount}/{def.count} exercises completed</span>
            <button onClick={onComplete} disabled={!allDone}
              className={`btn btn-sm gap-1.5 ${allDone ? 'btn-primary' : 'bg-base-200 text-base-content/40 border border-base-300 hover:bg-base-200'}`}>
              <Ic name="lock" size={13}/> Finish & lock part
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Result view ----
function ResultView({ exam, state, onRestart, onBack }) {
  useIcons([]);
  const parts = PART_DEFS.map(p => ({
    ...p,
    done: state.done[p.id].filter(Boolean).length,
    score: state.scores[p.id] ?? 0,
  }));
  const doneTotal = parts.reduce((s,p)=>s+p.done,0);
  const completion = Math.round((doneTotal / TOTAL_EX) * 100);
  const overall = Math.round(parts.reduce((s,p)=>s+p.score,0) / parts.length);
  const passed = overall >= 60;

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      <button onClick={onBack} className="btn btn-ghost btn-sm gap-1 mb-5"><Ic name="arrow-left" size={14}/> Mock exams</button>

      <div className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
        {/* header banner */}
        <div className={`p-7 ${passed ? 'bg-success/10' : 'bg-warning/10'} border-b border-base-300`}>
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 rounded-full grid place-items-center ${passed ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              <Ic name={passed ? 'party-popper' : 'target'} size={34}/>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/60">{exam.title} · Result</div>
              <h1 className="font-display text-3xl font-bold mt-1">{passed ? 'Passed' : 'Almost there'}</h1>
              <p className="text-sm text-base-content/70">{passed ? 'Great work — you’re above the 60% pass mark.' : 'Keep practicing your weaker parts and try again.'}</p>
            </div>
          </div>
        </div>

        {/* big numbers */}
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-base-300 border-b border-base-300">
          <div className="p-6 text-center">
            <div className="font-display text-4xl font-bold tabular-nums">{overall}%</div>
            <div className="text-xs text-base-content/60 uppercase tracking-wider mt-1">Overall score</div>
          </div>
          <div className="p-6 text-center">
            <div className="font-display text-4xl font-bold tabular-nums">{completion}%</div>
            <div className="text-xs text-base-content/60 uppercase tracking-wider mt-1">Tasks completed</div>
          </div>
          <div className="p-6 text-center col-span-2 md:col-span-1">
            <div className="font-display text-4xl font-bold tabular-nums">{doneTotal}/{TOTAL_EX}</div>
            <div className="text-xs text-base-content/60 uppercase tracking-wider mt-1">Exercises</div>
          </div>
        </div>

        {/* per-part breakdown */}
        <div className="p-7">
          <h2 className="font-display text-lg font-bold mb-4">By part</h2>
          <div className="space-y-4">
            {parts.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-field grid place-items-center bg-${p.color}/10 text-${p.color} shrink-0`}>
                  <Ic name={p.icon} size={16}/>
                </div>
                <div className="w-24 shrink-0">
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-[11px] text-base-content/55">{p.done}/{p.count} tasks</div>
                </div>
                <progress className={`progress progress-${p.color} flex-1 h-2`} value={p.score} max="100"/>
                <div className="w-12 text-right font-mono text-sm font-semibold">{p.score}%</div>
              </div>
            ))}
          </div>

          <div className="mt-7 pt-5 border-t border-base-300 flex items-center gap-3">
            <button onClick={onBack} className="btn btn-ghost btn-sm">Back to exams</button>
            <button onClick={onRestart} className="btn btn-primary btn-sm ml-auto gap-1.5">
              <Ic name="rotate-ccw" size={13}/> Start again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MockExam });
