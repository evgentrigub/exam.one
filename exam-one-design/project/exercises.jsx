// Unified Exercises list with dual-axis filters (skill × type)
const { L, useState, useEffect, useMemo, useApp, EXERCISES, SKILLS, TYPE_OPTIONS, LEVELS,
  Ic, useIcons, SkillBadge, LevelPip } = window;

function ExercisesList() {
  const { go, level } = useApp();
  const initialFilter = window.__exercisesInitial || null;
  const [skills, setSkills] = useState(() => initialFilter ? [initialFilter] : ['reading','writing','listening','speaking']);
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState('all'); // all|new|inprogress|mastered
  const [sort, setSort] = useState('recommended');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // grid|list
  useIcons([skills,types,status,sort,view]);

  const toggle = (arr,setArr,v) => setArr(arr.includes(v) ? arr.filter(x=>x!==v) : [...arr,v]);

  const visibleTypes = useMemo(() => {
    const active = skills.length ? skills : SKILLS.map(s=>s.id);
    const set = new Set();
    active.forEach(s => TYPE_OPTIONS[s].forEach(t => set.add(`${s}:${t}`)));
    return [...set];
  }, [skills]);

  const filtered = useMemo(() => {
    let list = EXERCISES.filter(e => e.level === level);
    if (skills.length) list = list.filter(e => skills.includes(e.skill));
    if (types.length) list = list.filter(e => types.includes(`${e.skill}:${e.type}`));
    if (status !== 'all') list = list.filter(e => e.status === status);
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'title') list = [...list].sort((a,b)=>a.title.localeCompare(b.title));
    if (sort === 'shortest') list = [...list].sort((a,b)=>a.minutes-b.minutes);
    if (sort === 'weakest') list = [...list].sort((a,b)=>a.progress-b.progress);
    return list;
  }, [skills,types,status,sort,search,level]);

  const chip = (active,onClick,children,c='primary') => (
    <button onClick={onClick}
      className={`exam-skill-chip inline-flex items-center gap-1.5 px-3 h-8 rounded-selector text-xs font-medium border
        ${active ? `bg-${c} text-${c}-content border-${c}` : 'bg-base-100 border-base-300 hover:border-base-content/30'}`}>{children}</button>
  );

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-4">

      {/* Filter header */}
      <div className="card bg-base-100 border border-base-300 ring-soft p-4 space-y-3">

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1">Exam part</div>
          {SKILLS.map(s => {
            const active = skills.includes(s.id);
            return (
              <button key={s.id} onClick={()=>toggle(skills,setSkills,s.id)}
                className={`exam-skill-chip inline-flex items-center gap-2 h-9 px-3 rounded-field border text-sm font-medium
                  ${active ? `bg-${s.color} text-${s.color}-content border-${s.color}` : 'bg-base-100 border-base-300 hover:border-base-content/30 text-base-content/80'}`}>
                <Ic name={s.icon} size={14}/>
                {s.label}
                <span className={`text-[10px] ${active?'opacity-80':'opacity-50'}`}>{EXERCISES.filter(e=>e.skill===s.id).length}</span>
              </button>
            );
          })}
          <button onClick={()=>setSkills(SKILLS.map(s=>s.id))} className="btn btn-ghost btn-xs">All</button>
          <button onClick={()=>{ setSkills([]); setTypes([]); }} className="btn btn-ghost btn-xs">Clear</button>
        </div>

        <div className="flex items-start gap-2 flex-wrap border-t border-base-300 pt-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1 mt-2">Type</div>
          <div className="flex gap-1.5 flex-wrap">
            {visibleTypes.map(k => {
              const [sk, tp] = k.split(':');
              const sObj = SKILLS.find(s=>s.id===sk);
              const active = types.includes(k);
              return (
                <button key={k} onClick={()=>toggle(types,setTypes,k)}
                  className={`exam-skill-chip inline-flex items-center gap-1.5 h-7 px-2.5 rounded-selector text-xs border
                    ${active ? `bg-${sObj.color}/15 border-${sObj.color} text-${sObj.color}` : 'bg-base-100 border-base-300 hover:border-base-content/30'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-${sObj.color}`}/>
                  {tp}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-base-300 pt-3">
          <div className="join">
            {[
              { id:'all', l:'All' }, { id:'new', l:'Not started' },
              { id:'inprogress', l:'In progress' }, { id:'mastered', l:'Mastered' },
            ].map(o => (
              <button key={o.id} onClick={()=>setStatus(o.id)}
                className={`join-item btn btn-xs ${status===o.id?'btn-primary':'btn-ghost'}`}>{o.l}</button>
            ))}
          </div>
          <div className="relative ml-2">
            <Ic name="search" size={12} cls="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              className="input input-bordered input-xs w-52 pl-7"/>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select className="select select-xs select-bordered" value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="title">A–Z</option>
              <option value="shortest">Shortest first</option>
              <option value="weakest">Weakest first</option>
            </select>
            <div className="join">
              <button onClick={()=>setView('grid')} className={`join-item btn btn-xs ${view==='grid'?'btn-primary':'btn-ghost'}`}><Ic name="layout-grid" size={12}/></button>
              <button onClick={()=>setView('list')} className={`join-item btn btn-xs ${view==='list'?'btn-primary':'btn-ghost'}`}><Ic name="list" size={12}/></button>
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
                <th>Exercise</th><th>Skill</th><th>Type</th><th>Level</th><th>Time</th><th>Best</th><th>Progress</th><th></th>
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
                  <td className="text-xs">{e.type}</td>
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
    </div>
  );
}

function ExerciseCard({ e, onOpen }) {
  const s = SKILLS.find(x=>x.id===e.skill);
  return (
    <button onClick={onOpen} className="text-left card bg-base-100 border border-base-300 ring-soft p-4 card-hov relative">
      {e.status==='mastered' && <div className="absolute top-3 right-3 text-success"><Ic name="check-circle-2" size={16}/></div>}
      {e.draft && <div className="absolute top-3 right-3 text-warning"><Ic name="file-edit" size={16}/></div>}
      <div className="flex items-center gap-2">
        <SkillBadge skill={e.skill} size="xs"/>
        <LevelPip level={e.level}/>
        <span className="text-[10px] text-base-content/50 ml-auto">{e.type}</span>
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
