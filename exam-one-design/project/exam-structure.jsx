// Exam format / structure reference page
const { L, useApp, EXAM_STRUCTURE, SKILLS, Ic, useIcons } = window;

function StructureStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-field bg-base-200 grid place-items-center text-base-content/60 shrink-0"><Ic name={icon} size={15}/></span>
      <div className="leading-tight">
        <div className="font-display font-bold text-base tabular-nums">{value}</div>
        <div className="text-[11px] text-base-content/55">{label}</div>
      </div>
    </div>
  );
}

function SkillStructure({ skill, go }) {
  const s = EXAM_STRUCTURE[skill];
  useIcons([skill]);
  return (
    <section className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
      {/* skill header */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-base-300 bg-base-200/40">
        <span className={`w-11 h-11 rounded-box grid place-items-center shrink-0 bg-${s.color}/12 text-${s.color}`}>
          <Ic name={s.icon} size={20}/>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold leading-none">{s.label}</h2>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap bg-${s.color}/12 text-${s.color}`}>{s.parts.length} parts</span>
          </div>
          <p className="text-sm text-base-content/60 mt-1 max-w-2xl text-pretty">{s.summary}</p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <StructureStat icon="clock" label="Exam time" value={`${s.minutes} min`}/>
          <StructureStat icon="layers" label="Parts" value={s.parts.length}/>
        </div>
      </div>

      {/* parts */}
      <div className="divide-y divide-base-300">
        {s.parts.map(p => (
          <div key={p.n} className="flex flex-col md:flex-row gap-4 px-5 py-4 hover:bg-base-200/30 transition-colors">
            <div className="flex md:flex-col items-center md:items-start gap-2 md:w-32 shrink-0">
              <span className={`w-9 h-9 rounded-field grid place-items-center font-display font-bold bg-${s.color} text-${s.color}-content`}>{p.n}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/45 md:mt-1">Part {p.n}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[17px] leading-tight">{p.title}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono text-base-content/70 bg-base-200 rounded-selector px-2 py-1">
                <Ic name="list-checks" size={12}/> {p.format}
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex gap-2">
                  <Ic name="target" size={14} cls={`text-${s.color} mt-0.5 shrink-0`}/>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-base-content/45">Goal</div>
                    <div className="text-[13px] text-base-content/80 leading-snug text-pretty">{p.goal}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Ic name="check-circle-2" size={14} cls={`text-${s.color} mt-0.5 shrink-0`}/>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-base-content/45">Skill tested</div>
                    <div className="text-[13px] text-base-content/80 leading-snug text-pretty">{p.skill}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 md:self-center">
              <button onClick={()=>go({ name:'exercises', filter: skill, part: p.n })}
                className="btn btn-sm btn-ghost gap-1.5 rounded-full hover:bg-base-200">
                Practice <Ic name="arrow-right" size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExamStructure() {
  const { go, level } = useApp();
  useIcons([level]);
  const order = ['reading','listening','writing','speaking'];
  const totalParts = order.reduce((a,k)=>a+EXAM_STRUCTURE[k].parts.length,0);

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-4">

      {/* overview banner */}
      <div className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
        <div className="grid md:grid-cols-[1.4fr_1fr]">
          <div className="p-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
              <Ic name="flag" size={13}/> Goethe / telc · {level}
            </div>
            <h1 className="font-display text-2xl font-bold mt-2 leading-tight">How the exam is built</h1>
            <p className="text-sm text-base-content/65 mt-2 max-w-xl text-pretty">
              The exam has four modules — Reading, Listening, Writing and Speaking — broken into {totalParts} parts in total.
              Each part checks a different language skill. Use this as your map, then jump straight into matching practice.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {order.map(k=>{
                const s = EXAM_STRUCTURE[k];
                return (
                  <button key={k} onClick={()=>go({ name:'exercises', filter: k })}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap border border-base-300 hover:border-base-content/30 transition-colors`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-${s.color}`}/>
                    {s.label} <span className="opacity-50">· {s.parts.length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 border-t md:border-t-0 md:border-l border-base-300">
            {order.map((k,i)=>{
              const s = EXAM_STRUCTURE[k];
              return (
                <div key={k} className={`p-5 ${i%2===0?'border-r':''} ${i<2?'border-b':''} border-base-300`}>
                  <span className={`w-9 h-9 rounded-field grid place-items-center bg-${s.color}/12 text-${s.color}`}><Ic name={s.icon} size={16}/></span>
                  <div className="font-display font-bold mt-2 leading-none">{s.label}</div>
                  <div className="text-[11px] text-base-content/55 mt-1">{s.parts.length} parts · {s.minutes} min</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* per-skill structure */}
      {order.map(k => <SkillStructure key={k} skill={k} go={go}/>)}
    </div>
  );
}

Object.assign(window, { ExamStructure });
