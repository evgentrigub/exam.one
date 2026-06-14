// App entry — routing + top-level composition
const { L, useState, useEffect, AppCtx, Sidebar, Topbar, Dashboard, ExercisesList,
  ReadingExercise, WritingExercise, ListeningExercise, SpeakingExercise, Exams, MockExam, Progress, Account } = window;

function App() {
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('exam:route')) || { name:'dashboard' }; } catch { return { name:'dashboard' }; }
  });
  const [level, setLevel] = useState(() => {
    const v = localStorage.getItem('exam:level');
    return (v === 'A2' || v === 'B1') ? v : 'A2';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('exam:theme') || 'light');
  const [plan, setPlan] = useState(() => localStorage.getItem('exam:plan') || 'pro');
  const [lang, setLang] = useState(() => localStorage.getItem('exam:lang') || 'en');

  useEffect(()=>{ localStorage.setItem('exam:route', JSON.stringify(route)); }, [route]);
  useEffect(()=>{ localStorage.setItem('exam:level', level); }, [level]);
  useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('exam:theme', theme); }, [theme]);
  useEffect(()=>{ localStorage.setItem('exam:plan', plan); }, [plan]);
  useEffect(()=>{ localStorage.setItem('exam:lang', lang); }, [lang]);

  const go = (r) => {
    // carry initial filter into ExercisesList via window (one-shot)
    window.__exercisesInitial = r.filter || null;
    setRoute(r);
  };

  // after any route change, remount icons
  useEffect(()=>{ if (window.lucide) setTimeout(()=>window.lucide.createIcons(), 30); }, [route, theme, plan, lang]);

  const ctx = { route, go, level, setLevel, theme, setTheme, plan, setPlan, lang, setLang };

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
      case 'mock':           return <MockExam key={route.id || 'm'}/>;
      case 'progress':       return <Progress/>;
      case 'account':        return <Account/>;
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
              <span>Exam.one · interactive prototype</span>
              <span>German exam prep · Goethe · telc · ÖSD</span>
            </footer>
          </main>
        </div>
      </div>
    </AppCtx.Provider>
  );
}

const root = window.ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
