// Audit view — annotated "before" screenshots showing the current prototype's issues
const { L, useApp, Ic, useIcons } = window;

function AuditView() {
  const { go } = useApp();
  useIcons([]);

  const Issue = ({ n, t, where, severity='warning' }) => (
    <div className="flex items-start gap-3">
      <div className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-mono font-bold shrink-0 bg-${severity}/15 text-${severity}`}>{n}</div>
      <div>
        <div className="text-sm font-medium">{t}</div>
        <div className="text-[11px] text-base-content/50">{where}</div>
      </div>
    </div>
  );

  const Annot = ({ top, left, right, n }) => (
    <span className="audit-pill" style={{ top, left, right }}>{n}</span>
  );

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-6">

      {/* Heuristic summary */}
      <div className="card bg-base-100 border border-base-300 ring-soft p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-field bg-warning/10 text-warning grid place-items-center">
            <Ic name="clipboard-check" size={18}/>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">UX/UI audit of the current prototype</h2>
            <div className="text-xs text-base-content/60">Based on the Nuxt 3 + Tailwind + daisyUI codebase you attached. Logic & IA preserved; execution flagged.</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-5">
          <div className="col-span-12 lg:col-span-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/50 mb-2">Severity distribution</div>
            <div className="space-y-2">
              {[
                ['Critical UX', 'error', 4],
                ['Consistency', 'warning', 11],
                ['Polish', 'info', 9],
                ['Accessibility', 'primary', 5],
              ].map(([l,c,n])=>(
                <div key={l} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-${c}`}/>
                  <div className="text-sm flex-1">{l}</div>
                  <div className="font-mono text-xs text-base-content/60">{n}</div>
                  <progress className={`progress progress-${c} w-24 h-1.5`} value={n} max="12"/>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/50 mb-2">Top findings</div>
            <ol className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm list-decimal pl-5 marker:text-base-content/40 marker:font-mono">
              <li>No product shell — pages don’t share a consistent navigation chrome.</li>
              <li>Selecting an exercise takes 2–3 navigations (skill → type → exercise).</li>
              <li>Dashboard is <em>all numbers, no decisions</em>: no clear next step, no exam date, no weak spots.</li>
              <li>Emoji used as functional icons (📚✍️📊) — inconsistent scale, color, accessibility.</li>
              <li>Title sizes, paddings, shadows, and radii vary across pages — no shared layout primitives.</li>
              <li>Reading quiz + text share a single flow; no clear “questions panel” rhythm, no keyboard flow.</li>
              <li>Writing editor: word counter is nested, feedback & model-answer are disconnected from editor.</li>
              <li>German and English copy mixed in UI ("Häufigster Tipp" next to "Best Score").</li>
              <li>Filters & sort bar on list pages is desktop‑only; no active‑filter chips; no empty‑state guidance.</li>
              <li>No explicit account/subscription/plan surface, no upcoming schedule, no exam countdown.</li>
              <li>Listening & Speaking are missing entirely — there is no visual language to fall back on.</li>
              <li>Progress is split between dashboard and lists; no single place that tells the learner “where am I?”.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ANNOTATED SCREEN: Dashboard */}
      <div className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/50">Screen 1 · Before</div>
            <h3 className="font-display text-lg font-bold">Current <code className="font-mono text-primary">/dashboard</code></h3>
          </div>
          <button onClick={()=>go({ name:'dashboard' })} className="btn btn-ghost btn-sm gap-1">Jump to redesign <Ic name="arrow-right" size={12}/></button>
        </div>
        <div className="grid grid-cols-12 gap-0 border-t border-base-300">
          {/* mock of current */}
          <div className="col-span-12 lg:col-span-7 relative p-6 bg-gradient-to-br from-base-200 to-base-100 min-h-[520px]">
            <Annot n="1" top="20px" left="16px"/>
            <div className="text-2xl font-bold">📊 Dashboard</div>
            <div className="text-sm opacity-70">Track your progress and performance.</div>

            <Annot n="2" top="110px" left="16px"/>
            <div className="mt-6 bg-base-100 rounded p-4 shadow-sm border">
              <div className="flex justify-between text-sm mb-1"><span>📚 Reading Progress</span><span className="opacity-70">3/6 texts completed</span></div>
              <progress className="progress progress-primary w-full h-3" value="50" max="100"/>
            </div>
            <div className="mt-4 bg-base-100 rounded p-4 shadow-sm border">
              <div className="flex justify-between text-sm mb-1"><span>✍️ Writing Progress</span><span className="opacity-70">1/8 topics completed</span></div>
              <progress className="progress progress-success w-full h-3" value="12" max="100"/>
            </div>

            <Annot n="3" top="300px" left="16px"/>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {['50%','72%','88%','12'].map((v,i)=>(
                <div key={i} className="bg-base-100 border rounded p-3 text-center">
                  <div className="text-xs opacity-60">Metric {i+1}</div>
                  <div className="text-xl font-bold">{v}</div>
                </div>
              ))}
            </div>

            <Annot n="4" top="430px" left="16px"/>
            <div className="mt-4 p-3 bg-base-100 border rounded flex items-center gap-2 text-sm">
              <span>💡</span>
              <span className="opacity-70">Häufigster Tipp: Vervollständige deine ersten Schreibaufgaben…</span>
            </div>
          </div>
          {/* findings */}
          <div className="col-span-12 lg:col-span-5 border-l border-base-300 p-5 bg-base-200/40 space-y-4">
            <Issue n="1" severity="error" t="Page says 'Dashboard' but answers no question." where="There is no exam date, no next action, no weak‑spot callout."/>
            <Issue n="2" severity="warning" t="Two parallel progress bars, no hierarchy." where="Reading and Writing stacked identically — nothing signals which matters right now."/>
            <Issue n="3" severity="warning" t="Four metrics in a row with no context." where="Completion %, average %, best %, attempts # — learner can’t tell good from bad."/>
            <Issue n="4" severity="info" t="German copy inside an English UI." where="'Häufigster Tipp', 'Ø Qualitätsbewertung' leak from content into chrome."/>
            <Issue n="5" severity="primary" t="No navigation shell." where="Top bar is a Navbar component; page scrolls independently; there’s no sidebar or global search."/>
            <div className="mt-3 p-3 rounded-box bg-base-100 border border-base-300 text-xs leading-relaxed">
              <div className="font-semibold mb-1">Redesign move →</div>
              Lead with the <b>exam countdown + readiness</b>. Turn the four stat cards into <b>skill buttons</b>. Add <b>continue practicing</b>, <b>subscription</b>, and <b>upcoming sessions</b> as explicit sections.
            </div>
          </div>
        </div>
      </div>

      {/* ANNOTATED: Exercises list */}
      <div className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/50">Screen 2 · Before</div>
            <h3 className="font-display text-lg font-bold">Current <code className="font-mono text-primary">/reading</code> and <code className="font-mono text-primary">/writing</code></h3>
          </div>
          <button onClick={()=>go({ name:'exercises' })} className="btn btn-ghost btn-sm gap-1">Jump to redesign <Ic name="arrow-right" size={12}/></button>
        </div>
        <div className="grid grid-cols-12 gap-0 border-t border-base-300">
          <div className="col-span-12 lg:col-span-7 p-6 bg-base-200 min-h-[520px] relative">
            <Annot n="1" top="20px" left="16px"/>
            <div className="text-2xl font-bold">📚 Reading Practice</div>
            <div className="text-sm opacity-70">Practice German reading comprehension</div>

            <Annot n="2" top="100px" left="16px"/>
            <div className="mt-5 bg-base-100 rounded p-3 border">
              <div className="flex gap-2 items-center text-xs flex-wrap">
                <span>Type:</span><select className="select select-bordered select-xs"><option>All Types</option></select>
                <span className="ml-4">Status:</span><select className="select select-bordered select-xs"><option>All Topics</option></select>
                <span className="ml-auto">Sort by:</span><select className="select select-bordered select-xs"><option>Title</option></select>
              </div>
            </div>

            <Annot n="3" top="210px" left="16px"/>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i=>(
                <div key={i} className="bg-base-100 rounded p-4 border">
                  <div className="text-xs opacity-60">email · A2</div>
                  <div className="font-bold mt-1">Sample Text {i}</div>
                  <div className="text-xs opacity-60 mt-1">120 words · 5 min</div>
                </div>
              ))}
            </div>

            <Annot n="4" top="490px" left="16px"/>
            <div className="text-[10px] opacity-60 absolute bottom-3 left-6">Separate page for Writing looks nearly identical but lives at /writing.</div>
          </div>
          <div className="col-span-12 lg:col-span-5 border-l border-base-300 p-5 bg-base-200/40 space-y-4">
            <Issue n="1" severity="warning" t="Title + subtitle repeat the sidebar label." where="Breadcrumbs would do the same job in 20% of the height."/>
            <Issue n="2" severity="error" t="Filter bar is 3 dropdowns, no chips." where="Selecting 'email + A2 + completed' takes 3 clicks and a scan; active filters aren’t visible."/>
            <Issue n="3" severity="warning" t="Cards are flat — nothing distinguishes a new exercise from a finished one at a glance." where="No status indicator, no progress ring, no best score."/>
            <Issue n="4" severity="error" t="Users must first pick the exam part (Reading or Writing), then the type." where="Requested change: let them filter by part AND type in one view."/>
            <div className="mt-3 p-3 rounded-box bg-base-100 border border-base-300 text-xs leading-relaxed">
              <div className="font-semibold mb-1">Redesign move →</div>
              One <b>Exercises</b> page with <b>multi‑select part chips</b> (Reading / Writing / Listening / Speaking) and <b>dependent type chips</b>. Every card shows level, status, time, best score, and a progress bar.
            </div>
          </div>
        </div>
      </div>

      {/* Missing sections */}
      <div className="card bg-base-100 border border-base-300 ring-soft p-5">
        <h3 className="font-display text-lg font-bold">What’s missing today</h3>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {[
            { t:'Listening module', d:'Audio player, replay budget, timed questions, transcript reveal.', i:'headphones', c:'info' },
            { t:'Speaking module', d:'Preparation, teleprompter, timed recording, transcript-based feedback.', i:'mic', c:'warning' },
            { t:'Mock exams', d:'Full‑length timed exams combining all 4 skills in order.', i:'file-badge', c:'primary' },
            { t:'Subscription', d:'Plan surface, AI credit budget, renewal date, upgrade path.', i:'credit-card', c:'success' },
          ].map((x,i)=>(
            <div key={i} className={`p-3 rounded-box border border-base-300 bg-${x.c}/5`}>
              <div className={`w-9 h-9 rounded-field bg-${x.c}/15 text-${x.c} grid place-items-center`}><Ic name={x.i} size={16}/></div>
              <div className="font-semibold mt-2">{x.t}</div>
              <div className="text-xs text-base-content/70">{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuditView });
