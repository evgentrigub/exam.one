// Shell: sidebar + topbar + routing
const { L, useState, useEffect, useRef, useMemo, createContext, useContext,
  EXERCISES, SKILLS, TYPE_OPTIONS, LEVELS, Ic, useIcons, AppCtx, useApp,
  SkillBadge, LevelPip } = window;

function Sidebar() {
  const { route, go, level, setLevel } = useApp();
  const items = [
    { id:'dashboard', label:'Dashboard', icon:'layout-dashboard' },
    { id:'exercises', label:'Exercises', icon:'layers' },
    { id:'exams',     label:'Mock exams', icon:'file-badge' },
    { id:'progress',  label:'Progress',  icon:'trending-up' },
  ];
  const skills = [
    { id:'reading-list',   label:'Reading',   icon:'book-open' },
    { id:'writing-list',   label:'Writing',   icon:'pen-line' },
    { id:'listening-list', label:'Listening', icon:'headphones' },
    { id:'speaking-list',  label:'Speaking',  icon:'mic' },
  ];
  useIcons([route]);
  return (
    <aside className="w-60 shrink-0 bg-base-100 border-r border-base-300 flex flex-col">
      <div className="h-14 px-4 flex items-center gap-2 border-b border-base-300">
        <div className="w-7 h-7 rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold">E</div>
        <div className="font-display text-lg font-bold leading-none">Examl<span className="text-primary">.one</span></div>
      </div>

      <div className="p-3 space-y-1">
        {items.map(i => (
          <button key={i.id}
            className={`w-full flex items-center gap-3 px-3 h-9 rounded-field text-sm font-medium
              ${route.name===i.id ? 'nav-item-active' : 'text-base-content/70 hover:bg-base-200'}`}
            onClick={()=>go({ name: i.id })}>
            <Ic name={i.icon} size={16}/>{i.label}
          </button>
        ))}
      </div>

      <div className="px-3 pt-2 pb-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-3 mb-1">Practice by skill</div>
        <div className="space-y-1">
          {skills.map(s => (
            <button key={s.id}
              className={`w-full flex items-center justify-between px-3 h-9 rounded-field text-sm
                ${route.name===s.id ? 'nav-item-active font-medium' : 'text-base-content/70 hover:bg-base-200'}`}
              onClick={()=>go({ name:'exercises', filter: s.id.replace('-list','') })}>
              <span className="flex items-center gap-3"><Ic name={s.icon} size={16}/>{s.label}</span>
              <span className="text-xs opacity-50">{EXERCISES.filter(e=>e.skill===s.id.replace('-list','')).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-3 border-t border-base-300">
        <div className="rounded-box bg-base-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-base-content/70">Exam target</div>
            <button className="text-[10px] text-primary font-medium">Change</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-field bg-primary/10 text-primary grid place-items-center">
              <Ic name="flag" size={16}/>
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Goethe {level}</div>
              <div className="text-[11px] text-base-content/60">German · in 42 days</div>
            </div>
          </div>
          <div className="mt-3 flex gap-1">
            {LEVELS.map(l=>(
              <button key={l} onClick={()=>setLevel(l)}
                className={`flex-1 h-7 rounded-selector text-[11px] font-semibold
                  ${level===l ? 'bg-primary text-primary-content' : 'bg-base-100 text-base-content/70 hover:bg-base-300'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { route, go, mode, setMode, theme, setTheme, auditOn, setAuditOn } = useApp();
  useIcons([route, theme, auditOn]);
  const title = (() => {
    switch(route.name) {
      case 'dashboard': return { t:'Welcome back, Lena', s:'Your C1 exam is in 42 days. You’re on track.' };
      case 'exercises': return { t:'Exercises', s:'Filter by exam part and type — all in one place.' };
      case 'reading':   return { t:'Reading practice', s:'' };
      case 'writing':   return { t:'Writing practice', s:'' };
      case 'listening': return { t:'Listening practice', s:'' };
      case 'speaking':  return { t:'Speaking practice', s:'' };
      case 'exams':     return { t:'Mock exams', s:'Full‑length timed exams, exam‑authentic conditions.' };
      case 'progress':  return { t:'Progress', s:'Track your performance across skills.' };
      case 'audit':     return { t:'Current prototype · audit', s:'Issues and opportunities before redesign.' };
      case 'system':    return { t:'Redesign direction', s:'Principles, rules, and implementation priorities.' };
      default: return { t:'Exam.one', s:'' };
    }
  })();

  return (
    <header className="h-14 bg-base-100 border-b border-base-300 flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <div className="font-display text-[17px] font-bold leading-none truncate">{title.t}</div>
        {title.s && <div className="text-xs text-base-content/60 leading-none mt-1 truncate">{title.s}</div>}
      </div>

      <div className="relative">
        <Ic name="search" size={14} cls="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"/>
        <input placeholder="Search exercises, topics…" className="input input-sm input-bordered w-72 pl-8 rounded-field"/>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-base-content/50 kbd-shadow px-1.5 py-0.5 rounded bg-base-200 border border-base-300">⌘K</span>
      </div>

      {/* Mode switcher: Prototype / Audit / Redesign doc */}
      <div className="join">
        {[
          { id:'proto', label:'Prototype' },
          { id:'audit', label:'Audit' },
          { id:'system', label:'Redesign' },
        ].map(m=>(
          <button key={m.id}
            onClick={()=>{
              setMode(m.id);
              if (m.id==='audit') go({ name:'audit' });
              else if (m.id==='system') go({ name:'system' });
              else go({ name:'dashboard' });
            }}
            className={`join-item btn btn-sm ${mode===m.id ? 'btn-primary' : 'btn-ghost'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* theme switcher */}
      <div className="dropdown dropdown-end">
        <button tabIndex="0" className="btn btn-sm btn-ghost btn-circle" aria-label="Theme">
          <Ic name={theme==='dark'?'moon':theme==='cupcake'?'cake':theme==='forest'?'trees':'sun'} size={16}/>
        </button>
        <ul tabIndex="0" className="dropdown-content menu bg-base-100 rounded-box z-30 w-40 p-1 mt-1 border border-base-300 shadow">
          {['light','dark','cupcake','corporate','forest'].map(t=>(
            <li key={t}><a onClick={()=>setTheme(t)} className={theme===t?'active':''}>{t}</a></li>
          ))}
        </ul>
      </div>

      <div className="avatar">
        <div className="w-8 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold text-xs">LB</div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
