// App entry — routing + top-level composition
const { L, useState, useEffect, AppCtx, Sidebar, Topbar, Dashboard, ExercisesList,
  ReadingExercise, WritingExercise, ListeningExercise, SpeakingExercise, Exams, Progress,
  AuditView, Redesign } = window;

function App() {
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('examl:route')) || { name:'system' }; } catch { return { name:'system' }; }
  });
  const [mode, setMode] = useState(() => localStorage.getItem('examl:mode') || 'system');
  const [level, setLevel] = useState(() => localStorage.getItem('examl:level') || 'A2');
  const [theme, setTheme] = useState(() => localStorage.getItem('examl:theme') || 'light');
  const [auditOn] = useState(false);

  useEffect(()=>{ localStorage.setItem('examl:route', JSON.stringify(route)); }, [route]);
  useEffect(()=>{ localStorage.setItem('examl:mode', mode); }, [mode]);
  useEffect(()=>{ localStorage.setItem('examl:level', level); }, [level]);
  useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('examl:theme', theme); }, [theme]);

  const go = (r) => {
    // carry initial filter into ExercisesList via window (one-shot)
    window.__exercisesInitial = r.filter || null;
    setRoute(r);
  };

  // after any route change, remount icons
  useEffect(()=>{ if (window.lucide) setTimeout(()=>window.lucide.createIcons(), 30); }, [route, mode, theme]);

  const ctx = { route, go, mode, setMode, level, setLevel, theme, setTheme, auditOn };

  const Screen = (() => {
    switch(route.name) {
      case 'dashboard':      return <Dashboard/>;
      case 'exercises':      return <ExercisesList/>;
      case 'reading-list':   return <ExercisesList/>;
      case 'writing-list':   return <ExercisesList/>;
      case 'listening-list': return <ExercisesList/>;
      case 'speaking-list':  return <ExercisesList/>;
      case 'reading':        return <ReadingExercise/>;
      case 'writing':        return <WritingExercise/>;
      case 'listening':      return <ListeningExercise/>;
      case 'speaking':       return <SpeakingExercise/>;
      case 'exams':          return <Exams/>;
      case 'progress':       return <Progress/>;
      case 'audit':          return <AuditView/>;
      case 'system':         return <Redesign/>;
      default:               return <Dashboard/>;
    }
  })();

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app-shell flex bg-base-200">
        <Sidebar/>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar/>
          <main className="flex-1 overflow-auto">
            {Screen}
            <footer className="max-w-[1240px] mx-auto px-6 py-6 text-[11px] text-base-content/50 flex items-center justify-between">
              <span>Exam.one · redesign prototype · uses daisyUI design system</span>
              <span>Toggle <b>Redesign ↔ Audit ↔ Prototype</b> in the top bar.</span>
            </footer>
          </main>
        </div>
      </div>
    </AppCtx.Provider>
  );
}

const root = window.ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
