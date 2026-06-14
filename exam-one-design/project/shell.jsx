// Shell: sidebar + topbar + routing
const { L, useState, useEffect, useRef, useMemo, createContext, useContext,
  EXERCISES, SKILLS, TYPE_OPTIONS, LEVELS, Ic, useIcons, AppCtx, useApp,
  SkillBadge, LevelPip } = window;

function Sidebar() {
  const { route, go, level, setLevel } = useApp();
  const items = [
    { id:'dashboard', label:'Dashboard', icon:'layout-dashboard' },
    { id:'exercises', label:'Exercises', icon:'layers' },
    { id:'structure', label:'Exam format', icon:'list-tree' },
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
        <div className="font-display text-lg font-bold leading-none">Exam<span className="text-primary">.one</span></div>
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
          {skills.map(s => {
            const sid = s.id.replace('-list','');
            const count = EXERCISES.filter(e=>e.skill===sid && e.level===level).length;
            return (
              <button key={s.id}
                className={`w-full flex items-center justify-between px-3 h-9 rounded-field text-sm
                  ${route.name==='exercises' && route.filter===sid ? 'nav-item-active font-medium' : 'text-base-content/70 hover:bg-base-200'}`}
                onClick={()=>go({ name:'exercises', filter: sid })}>
                <span className="flex items-center gap-3"><Ic name={s.icon} size={16}/>{s.label}</span>
                <span className="text-xs opacity-50">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-3 border-t border-base-300">
        <div className="rounded-box bg-base-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-base-content/70">Exam target</div>
            <button onClick={()=>go({ name:'exercises' })} className="text-[10px] text-primary font-medium hover:underline">View exercises</button>
          </div>
          <button onClick={()=>go({ name:'exercises' })}
            className="w-full flex items-center gap-2 rounded-field p-1 -m-1 hover:bg-base-300/60 transition-colors text-left">
            <div className="w-9 h-9 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0">
              <Ic name="flag" size={16}/>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Goethe {level}</div>
              <div className="text-[11px] text-base-content/60">German · in 42 days</div>
            </div>
          </button>
          <div className="mt-3 flex gap-1.5">
            {LEVELS.map(l=>(
              <button key={l} onClick={()=>{ setLevel(l); go({ name:'exercises' }); }}
                className={`flex-1 h-8 rounded-selector text-xs font-semibold transition-colors
                  ${level===l ? 'bg-primary text-primary-content' : 'bg-base-100 text-base-content/70 hover:bg-base-300'}`}>{l}</button>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-base-content/50 text-center">Tap a level to filter exercises</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { route, go, theme, setTheme, level, plan, lang, setLang } = useApp();
  useIcons([route, theme, plan, lang]);
  const title = (() => {
    switch(route.name) {
      case 'dashboard': return { t:'Welcome back, Lena', s:`Your ${level} exam is in 42 days. You’re on track.` };
      case 'exercises': return { t:'Exercises', s:'Filter by exam part — all in one place.' };
      case 'structure': return { t:'Exam format', s:'Every part of the exam, what it asks, and what it tests.' };
      case 'reading':   return { t:'Reading practice', s:'' };
      case 'writing':   return { t:'Writing practice', s:'' };
      case 'listening': return { t:'Listening practice', s:'' };
      case 'speaking':  return { t:'Speaking practice', s:'' };
      case 'exams':     return { t:'Mock exams', s:'Full‑length timed exams, exam‑authentic conditions.' };
      case 'progress':  return { t:'Progress', s:'Track your performance across skills.' };
      case 'account':   return { t:'Account', s:'Profile and subscription.' };
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

      {/* interface language switcher */}
      <div className="dropdown dropdown-end">
        <button tabIndex="0" className="btn btn-sm btn-ghost gap-1.5" aria-label="Interface language">
          <Ic name="globe" size={16}/>
          <span className="text-xs font-semibold uppercase">{lang}</span>
          <Ic name="chevron-down" size={12} cls="opacity-50"/>
        </button>
        <ul tabIndex="0" className="dropdown-content menu bg-base-100 rounded-box z-30 w-48 p-1 mt-1 border border-base-300 shadow">
          <li className="menu-title text-[10px] uppercase tracking-wider">Interface language</li>
          {[{c:'en',l:'English'},{c:'de',l:'Deutsch'},{c:'ru',l:'Русский'}].map(o=>(
            <li key={o.c}>
              <a onClick={()=>setLang(o.c)} className={lang===o.c?'active':''}>
                <span className="font-mono text-[10px] font-semibold w-5">{o.c.toUpperCase()}</span>
                {o.l}
                <span className="ml-auto text-primary font-bold w-3 text-center">{lang===o.c ? '✓' : ''}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* theme switcher */}
      <div className="dropdown dropdown-end">
        <button tabIndex="0" className="btn btn-sm btn-ghost btn-circle" aria-label="Theme">
          <Ic name={theme==='cupcake'?'cake':'sun'} size={16}/>
        </button>
        <ul tabIndex="0" className="dropdown-content menu bg-base-100 rounded-box z-30 w-40 p-1 mt-1 border border-base-300 shadow">
          {['light','cupcake'].map(t=>(
            <li key={t}><a onClick={()=>setTheme(t)} className={theme===t?'active':''}>{t}</a></li>
          ))}
        </ul>
      </div>

      <div className="dropdown dropdown-end">
        <button tabIndex="0" className="flex items-center gap-2 rounded-full pl-1 pr-2 h-9 hover:bg-base-200" aria-label="Account">
          <span className="w-8 h-8 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold text-xs">LB</span>
          <Ic name="chevron-down" size={14} cls="opacity-50"/>
        </button>
        <div tabIndex="0" className="dropdown-content bg-base-100 rounded-box z-30 w-60 p-1.5 mt-1 border border-base-300 shadow">
          <div className="px-3 py-2 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold text-xs">LB</span>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Lena Bauer</div>
              <div className="text-[11px] text-base-content/60 truncate">lena.bauer@email.de</div>
            </div>
          </div>
          <div className="px-3 pb-2">
            <span className={`badge badge-sm ${plan==='pro'?'badge-primary':'badge-ghost'}`}>{plan==='pro'?'Pro plan':'Free plan'}</span>
          </div>
          <div className="h-px bg-base-300 my-1"/>
          <button onClick={()=>go({ name:'account' })} className="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm hover:bg-base-200">
            <Ic name="user" size={15}/> Account & subscription
          </button>
          <button onClick={()=>go({ name:'progress' })} className="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm hover:bg-base-200">
            <Ic name="trending-up" size={15}/> My progress
          </button>
          <div className="h-px bg-base-300 my-1"/>
          <button className="w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm text-base-content/70 hover:bg-base-200">
            <Ic name="log-out" size={15}/> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
