// Switcher shell — flips between the three landing directions
const { useState: useStateApp, useEffect: useEffectApp, Ic: IcApp,
  LandingA: LandingAComp, LandingB: LandingBComp, LandingC: LandingCComp } = window;

const DIRECTIONS = [
  { id: 'a', label: 'Open Source', sub: 'Developer-led · self-host', Comp: LandingAComp },
  { id: 'b', label: 'Product',     sub: 'Learner outcome · SaaS',   Comp: LandingBComp }
];

function SwitchBar({ active, onPick }) {
  return (
    <div className="switch-bar">
      <div className="bg-base-100/95 backdrop-blur border border-base-300 rounded-box shadow-xl p-1.5 flex items-center gap-1">
        <div className="px-3 hidden sm:flex flex-col leading-none">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-base-content/45">Landing</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-base-content/45">direction</span>
        </div>
        {DIRECTIONS.map((d, i) => (
          <button key={d.id} onClick={() => onPick(d.id)}
            className={`px-3 py-2 rounded-field text-left transition-colors ${active === d.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/80'}`}>
            <div className="flex items-center gap-1.5">
              <span className={`font-mono text-[11px] font-bold ${active === d.id ? '' : 'text-base-content/40'}`}>{String.fromCharCode(65 + i)}</span>
              <span className="text-sm font-semibold leading-none">{d.label}</span>
            </div>
            <div className={`text-[10px] mt-0.5 hidden md:block ${active === d.id ? 'text-primary-content/75' : 'text-base-content/45'}`}>{d.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useStateApp(() => {
    try { return localStorage.getItem('examone.landing') || 'a'; } catch (e) { return 'a'; }
  });
  const pick = (id) => {
    setActive(id);
    try { localStorage.setItem('examone.landing', id); } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const Current = (DIRECTIONS.find(d => d.id === active) || DIRECTIONS[0]).Comp;
  return (
    <div className="pb-28">
      <div key={active}><Current /></div>
      <SwitchBar active={active} onPick={pick} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
