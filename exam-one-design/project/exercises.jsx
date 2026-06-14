// Unified Exercises list — filter by exam part (with hover info) × status
const { L, useState, useEffect, useMemo, useRef, useApp, EXERCISES, SKILLS, TYPE_OPTIONS, LEVELS,
  EXAM_STRUCTURE, getPart, Ic, useIcons, SkillBadge, LevelPip } = window;
const { createPortal } = window.ReactDOM;

// ---- Hover info popover for a part chip (portaled so card overflow never clips it) ----
function PartInfoCard({ sk, n, x, y }) {
  const p = getPart(sk, n);
  const sObj = SKILLS.find(s => s.id === sk);
  if (!p) return null;
  return createPortal(
    <div style={{ position:'fixed', left:x, top:y, transform:'translateX(-50%)', zIndex:80 }}
      className="w-72 pointer-events-none animate-[fadeIn_120ms_ease-out]">
      <div className="bg-base-100 rounded-box border border-base-300 shadow-xl overflow-hidden">
        <div className={`flex items-center gap-2 px-3 py-2 border-b border-base-300 bg-${sObj.color}/10`}>
          <span className={`w-6 h-6 rounded-field grid place-items-center font-display font-bold text-[12px] bg-${sObj.color} text-${sObj.color}-content`}>{n}</span>
          <span className={`text-[11px] font-semibold uppercase tracking-wider text-${sObj.color}`}>{sObj.label} · Part {n}</span>
        </div>
        <div className="p-3">
          <div className="font-display font-bold text-[15px] leading-tight">{p.title}</div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-base-content/70 bg-base-200 rounded-selector px-2 py-0.5">
            <Ic name="list-checks" size={11}/> {p.format}
          </div>
          <p className="text-[12.5px] text-base-content/75 leading-snug mt-2 text-pretty">{p.short}</p>
        </div>
      </div>
    </div>, document.body);
}

function PartChip({ sk, n, active, onToggle, compact=false }) {
  const sObj = SKILLS.find(s => s.id === sk);
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x:0, y:0 });
  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left + r.width/2, y: r.bottom + 8 });
    setHover(true);
  };
  return (
    <>
      <button ref={ref} onClick={onToggle}
        onMouseEnter={open} onMouseLeave={()=>setHover(false)} onFocus={open} onBlur={()=>setHover(false)}
        className={`exam-skill-chip inline-flex items-center gap-1.5 h-7 px-2.5 rounded-selector text-xs border whitespace-nowrap
          ${active ? `bg-${sObj.color}/15 border-${sObj.color} text-${sObj.color} font-semibold`
                   : 'bg-base-100 border-base-300 hover:border-base-content/30'}`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-${sObj.color}`}/>
        {compact ? n : `Part ${n}`}
        <Ic name="info" size={11} cls="opacity-40"/>
      </button>
      {hover && <PartInfoCard sk={sk} n={n} x={pos.x} y={pos.y}/>}
    </>
  );
}

// Modal: choose what to generate (design-only — closes on confirm, no real generation)
function GenerateExercisesModal({ level, onClose, onGenerate }) {
  const [lvl, setLvl] = useState(level);
  const [skills, setSkills] = useState(() => SKILLS.map(s => s.id));
  const [parts, setParts] = useState([]);
  const [count, setCount] = useState(6);
  const [diff, setDiff] = useState('balanced');
  useIcons([lvl, skills, parts, count, diff]);

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x=>x!==v) : [...arr, v]);
  const activeSkills = skills.length ? skills : SKILLS.map(s=>s.id);
  const canGen = skills.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-base-content/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[90vh] flex flex-col bg-base-100 rounded-box border border-base-300 shadow-xl overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-base-300/70 flex items-start gap-3 shrink-0">
          <span className="w-10 h-10 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"><Ic name="sparkles" size={18}/></span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold leading-tight">Generate exercises</h2>
            <p className="text-sm text-base-content/60 mt-0.5">Pick the parts you want — we’ll create fresh exercises for you.</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><Ic name="x" size={16}/></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Level</div>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={()=>setLvl(l)}
                  className={`flex-1 h-10 rounded-field text-sm font-semibold border transition-colors
                    ${lvl===l ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300 hover:border-base-content/30'}`}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Exam modules</div>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map(s => {
                const on = skills.includes(s.id);
                return (
                  <button key={s.id} onClick={()=>toggle(skills, setSkills, s.id)}
                    className={`flex items-center gap-2.5 px-3 h-12 rounded-box border text-left transition-colors
                      ${on ? `border-${s.color} bg-${s.color}/5` : 'border-base-300 hover:border-base-content/30'}`}>
                    <span className={`w-7 h-7 rounded-field grid place-items-center shrink-0 ${on ? `bg-${s.color}/15 text-${s.color}` : 'bg-base-200 text-base-content/50'}`}><Ic name={s.icon} size={14}/></span>
                    <span className="text-sm font-medium flex-1">{s.label}</span>
                    <span className={`w-5 h-5 rounded-md border grid place-items-center ${on ? `bg-${s.color} border-${s.color} text-${s.color}-content` : 'border-base-300'}`}>{on && <Ic name="check" size={12}/>}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Parts <span className="normal-case font-normal text-base-content/40">· optional, leave empty for a mix</span></div>
            <div className="space-y-2">
              {activeSkills.map(sk => {
                const s = SKILLS.find(x=>x.id===sk);
                return (
                  <div key={sk} className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-base-content/55 w-16 shrink-0">{s.label}</span>
                    {EXAM_STRUCTURE[sk].parts.map(p => (
                      <PartChip key={`${sk}:${p.n}`} sk={sk} n={p.n}
                        active={parts.includes(`${sk}:${p.n}`)}
                        onToggle={()=>toggle(parts, setParts, `${sk}:${p.n}`)}/>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">How many</div>
              <div className="text-xs text-base-content/55">Exercises to generate</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setCount(Math.max(1, count-1))} className="w-9 h-9 rounded-field border border-base-300 grid place-items-center hover:bg-base-200"><Ic name="minus" size={14}/></button>
              <div className="w-12 text-center font-display text-2xl font-bold tabular-nums">{count}</div>
              <button onClick={()=>setCount(Math.min(20, count+1))} className="w-9 h-9 rounded-field border border-base-300 grid place-items-center hover:bg-base-200"><Ic name="plus" size={14}/></button>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Difficulty</div>
            <div className="flex gap-2">
              {[['easier','Gentle'],['balanced','Mixed'],['harder','Challenging']].map(([id,l]) => (
                <button key={id} onClick={()=>setDiff(id)}
                  className={`flex-1 h-9 rounded-full text-xs font-medium border transition-colors
                    ${diff===id ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30'}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-base-300/70 flex items-center gap-3 bg-base-200/40 shrink-0">
          <div className="text-xs text-base-content/55 flex items-center gap-1.5"><Ic name="layers" size={13}/> {count} · {skills.length} module{skills.length!==1?'s':''}</div>
          <button onClick={onClose} className="btn btn-ghost btn-sm ml-auto">Cancel</button>
          <button onClick={onGenerate} disabled={!canGen}
            className="btn btn-primary btn-sm rounded-full gap-2"><Ic name="sparkles" size={14}/> Generate exercises</button>
        </div>
      </div>
    </div>
  );
}

function ExercisesList() {
  const { go, level, route } = useApp();
  const initialFilter = window.__exercisesInitial || (route && route.filter) || null;
  const [skills, setSkills] = useState(() => initialFilter ? [initialFilter] : ['reading','writing','listening','speaking']);
  const [parts, setParts] = useState(() => (route && route.filter && route.part) ? [`${route.filter}:${route.part}`] : []);
  const [status, setStatus] = useState('all'); // all|new|inprogress|mastered
  const [sort, setSort] = useState('recommended');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // grid|list
  const [genOpen, setGenOpen] = useState(false);
  useIcons([skills,parts,status,sort,view,genOpen]);

  // Re-apply the skill/part filter whenever the user re-navigates here
  useEffect(() => {
    if (route && route.name === 'exercises') {
      setSkills(route.filter ? [route.filter] : ['reading','writing','listening','speaking']);
      setParts(route.filter && route.part ? [`${route.filter}:${route.part}`] : []);
    }
  }, [route]);

  const toggle = (arr,setArr,v) => setArr(arr.includes(v) ? arr.filter(x=>x!==v) : [...arr,v]);

  const activeSkills = useMemo(() => skills.length ? SKILLS.filter(s=>skills.includes(s.id)).map(s=>s.id)
                                                    : SKILLS.map(s=>s.id), [skills]);

  const filtered = useMemo(() => {
    let list = EXERCISES.filter(e => e.level === level);
    if (skills.length) list = list.filter(e => skills.includes(e.skill));
    if (parts.length) list = list.filter(e => parts.includes(`${e.skill}:${e.part}`));
    if (status !== 'all') list = list.filter(e => e.status === status);
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'title') list = [...list].sort((a,b)=>a.title.localeCompare(b.title));
    if (sort === 'shortest') list = [...list].sort((a,b)=>a.minutes-b.minutes);
    if (sort === 'weakest') list = [...list].sort((a,b)=>a.progress-b.progress);
    if (sort === 'recommended') list = [...list].sort((a,b)=> a.skill===b.skill ? a.part-b.part : 0);
    return list;
  }, [skills,parts,status,sort,search,level]);

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-4">

      {/* Filter header */}
      <div className="card bg-base-100 border border-base-300 ring-soft p-4 space-y-3 overflow-visible">

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1">Module</div>
          {SKILLS.map(s => {
            const active = skills.includes(s.id);
            return (
              <button key={s.id} onClick={()=>{ toggle(skills,setSkills,s.id); setParts([]); }}
                className={`exam-skill-chip inline-flex items-center gap-2 h-9 px-3 rounded-field border text-sm font-medium
                  ${active ? `bg-${s.color} text-${s.color}-content border-${s.color}` : 'bg-base-100 border-base-300 hover:border-base-content/30 text-base-content/80'}`}>
                <Ic name={s.icon} size={14}/>
                {s.label}
                <span className={`text-[10px] ${active?'opacity-80':'opacity-50'}`}>{EXERCISES.filter(e=>e.skill===s.id && e.level===level).length}</span>
              </button>
            );
          })}
          <button onClick={()=>{ setSkills(SKILLS.map(s=>s.id)); setParts([]); }} className="btn btn-ghost btn-xs">All</button>
          <button onClick={()=>{ setSkills([]); setParts([]); }} className="btn btn-ghost btn-xs">Clear</button>
          <button onClick={()=>setGenOpen(true)} className="btn btn-primary btn-sm rounded-full gap-1.5 ml-auto">
            <Ic name="sparkles" size={14}/> Generate exercises
          </button>
        </div>

        {/* PART filter — chips per active module, hover for what each part is */}
        <div className="flex items-start gap-2 flex-wrap border-t border-base-300 pt-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1 mt-2 flex items-center gap-1">
            Part <span className="tooltip tooltip-right normal-case" data-tip="Hover a part to see what it tests"><Ic name="info" size={12} cls="opacity-50"/></span>
          </div>
          <div className="flex flex-col gap-2">
            {activeSkills.map(sk => {
              const s = SKILLS.find(x=>x.id===sk);
              return (
                <div key={sk} className="flex items-center gap-1.5 flex-wrap">
                  {activeSkills.length > 1 && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-base-content/55 w-[68px] shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${s.color}`}/>{s.label}
                    </span>
                  )}
                  {EXAM_STRUCTURE[sk].parts.map(p => (
                    <PartChip key={`${sk}:${p.n}`} sk={sk} n={p.n}
                      active={parts.includes(`${sk}:${p.n}`)}
                      onToggle={()=>toggle(parts,setParts,`${sk}:${p.n}`)}/>
                  ))}
                </div>
              );
            })}
            {activeSkills.length === 0 && <span className="text-xs text-base-content/40 mt-1.5">Select a module to filter by part.</span>}
          </div>
          {parts.length>0 && <button onClick={()=>setParts([])} className="btn btn-ghost btn-xs ml-1 mt-1">Clear parts</button>}
        </div>

        <div className="flex items-center gap-x-3 gap-y-2 flex-wrap border-t border-base-300 pt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id:'all', l:'All' }, { id:'new', l:'Not started' },
              { id:'inprogress', l:'In progress' }, { id:'mastered', l:'Mastered' },
            ].map(o => (
              <button key={o.id} onClick={()=>setStatus(o.id)}
                className={`h-8 px-3 rounded-full text-xs font-medium border whitespace-nowrap transition-colors
                  ${status===o.id
                    ? 'bg-primary text-primary-content border-primary'
                    : 'bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30'}`}>{o.l}</button>
            ))}
          </div>
          <div className="relative">
            <Ic name="search" size={12} cls="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              className="input input-bordered input-sm w-52 pl-7 rounded-full"/>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Sort</span>
              <select className="select select-sm select-bordered w-40 rounded-full" value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="recommended">Exam order</option>
                <option value="title">A–Z</option>
                <option value="shortest">Shortest first</option>
                <option value="weakest">Weakest first</option>
              </select>
            </label>
            <div className="flex items-center gap-1.5">
              <button onClick={()=>setView('grid')} aria-label="Grid view"
                className={`w-9 h-9 grid place-items-center rounded-field border transition-colors
                  ${view==='grid' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300 text-base-content/60 hover:border-base-content/30'}`}>
                <Ic name="layout-grid" size={14}/>
              </button>
              <button onClick={()=>setView('list')} aria-label="List view"
                className={`w-9 h-9 grid place-items-center rounded-field border transition-colors
                  ${view==='list' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300 text-base-content/60 hover:border-base-content/30'}`}>
                <Ic name="list" size={14}/>
              </button>
            </div>
          </div>
        </div>
        <div className="text-xs text-base-content/60">
          Showing <b>{filtered.length}</b> exercises · {level} level
        </div>
      </div>

      {/* Grid / List */}
      {view==='grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(e => <ExerciseCard key={e.id} e={e} onOpen={()=>go({name:e.skill, id:e.id})}/>)}
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
          <table className="table table-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-base-content/60">
                <th>Exercise</th><th>Module</th><th>Part</th><th>Level</th><th>Time</th><th>Best</th><th>Progress</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="hover">
                  <td>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-base-content/60">{e.subtitle}</div>
                  </td>
                  <td><SkillBadge skill={e.skill} size="xs"/></td>
                  <td className="text-xs font-mono">Part {e.part}</td>
                  <td><LevelPip level={e.level}/></td>
                  <td className="text-xs">{e.minutes} min</td>
                  <td className="text-xs font-mono">{e.best || '—'}</td>
                  <td className="w-32">
                    <div className="flex items-center gap-2">
                      <progress className="progress progress-primary flex-1 h-1.5" value={e.progress} max="100"/>
                      <span className="text-[10px] font-mono w-6 text-right">{e.progress}%</span>
                    </div>
                  </td>
                  <td><button onClick={()=>go({name:e.skill, id:e.id})} className="btn btn-xs btn-primary">Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length===0 && (
        <div className="text-center py-14 border-2 border-dashed border-base-300 rounded-box">
          <Ic name="search-x" size={28} cls="mx-auto opacity-40"/>
          <div className="mt-3 font-semibold">No exercises match your filters</div>
          <div className="text-sm text-base-content/60">Try clearing filters or changing your exam level.</div>
        </div>
      )}

      {genOpen && <GenerateExercisesModal level={level} onClose={()=>setGenOpen(false)}
        onGenerate={()=>setGenOpen(false)}/>}
    </div>
  );
}

function ExerciseCard({ e, onOpen }) {
  const s = SKILLS.find(x=>x.id===e.skill);
  return (
    <button onClick={onOpen} className="text-left card bg-base-100 border border-base-300 ring-soft p-4 card-hov relative">
      <div className="flex items-center gap-2">
        <SkillBadge skill={e.skill} size="xs"/>
        <LevelPip level={e.level}/>
        <span className="ml-auto flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-${s.color}/12 text-${s.color}`}>Part {e.part}</span>
          {e.status==='mastered' && (
            <span className="tooltip tooltip-left text-success" data-tip="Mastered"><Ic name="check-circle-2" size={15}/></span>
          )}
          {e.draft && (
            <span className="tooltip tooltip-left text-warning" data-tip="Draft saved"><Ic name="file-edit" size={15}/></span>
          )}
        </span>
      </div>
      <div className="font-display font-bold text-lg mt-2 leading-tight">{e.title}</div>
      <div className="text-xs text-base-content/60 mt-0.5">{e.subtitle}</div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-base-content/60">
        <span className="flex items-center gap-1"><Ic name="clock" size={11}/> {e.minutes} min</span>
        {e.duration && <span className="flex items-center gap-1"><Ic name={e.skill==='speaking'?'mic':'headphones'} size={11}/> {e.duration}</span>}
        {e.attempts>0 && <span className="flex items-center gap-1"><Ic name="repeat" size={11}/> {e.attempts}×</span>}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <progress className={`progress progress-${s.color} flex-1 h-1.5`} value={e.progress} max="100"/>
        <span className="text-[10px] font-mono text-base-content/60 w-6 text-right">{e.progress}%</span>
      </div>
    </button>
  );
}

Object.assign(window, { ExercisesList });
