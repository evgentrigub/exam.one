// Redesign direction + principles + priorities
const { L, useApp, Ic, useIcons } = window;

function Redesign() {
  const { go } = useApp(); useIcons([]);

  const P = ({ n, t, d }) => (
    <div className="p-4 rounded-box border border-base-300 bg-base-100">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-base-content/50">P{n}</span>
        <div className="font-semibold text-sm">{t}</div>
      </div>
      <p className="text-xs text-base-content/70 mt-1 leading-relaxed">{d}</p>
    </div>
  );

  const Rule = ({ ok, t, d }) => (
    <div className="flex items-start gap-3 p-3 rounded-field bg-base-100 border border-base-300">
      <div className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${ok?'bg-success/15 text-success':'bg-error/15 text-error'}`}>
        <Ic name={ok?'check':'x'} size={14}/>
      </div>
      <div>
        <div className="text-sm font-medium">{t}</div>
        <div className="text-xs text-base-content/60">{d}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-6">

      {/* Direction */}
      <section className="card bg-base-100 border border-base-300 ring-soft p-6 dot-pattern">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-primary">Redesign direction</div>
          <h2 className="font-display text-3xl font-bold mt-1 leading-tight">Turn Examl.one from a grid of exercises into a <span className="text-primary">coach that has a plan for today</span>.</h2>
          <p className="text-base-content/70 mt-3">We preserve the product (reading, writing, dashboard, soon listening & speaking), preserve the design system (daisyUI + Tailwind tokens, semantic colors, rounded‑box/field/selector, system fonts), and sharpen execution. The redesign leads with the learner’s exam date, surfaces readiness per skill, collapses the reading/writing pages into one Exercises view, and adds the two missing modules with a consistent audio‑first and mic‑first vocabulary.</p>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-6 max-w-3xl">
          {[
            ['Exam date is the anchor','calendar','primary'],
            ['Skills are first‑class nouns','layers','accent'],
            ['Every screen has a next action','arrow-right','success'],
            ['Feedback is always in view','message-square-quote','warning'],
          ].map(([t,i,c])=>(
            <div key={t} className={`p-3 rounded-box border border-base-300 bg-${c}/5`}>
              <div className={`w-8 h-8 rounded-field bg-${c}/15 text-${c} grid place-items-center`}><Ic name={i} size={14}/></div>
              <div className="font-semibold text-sm mt-2">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="card bg-base-100 border border-base-300 ring-soft p-6">
        <h3 className="font-display text-lg font-bold">UX principles</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <P n="1" t="One page per decision" d="Don’t make users choose part → type → exercise across three pages. One filterable Exercises page does it."/>
          <P n="2" t="Status, not statistics" d="Lead with status (‘you’re 64% ready’) before metrics (‘72% average, 88% best’)."/>
          <P n="3" t="Session has a shape" d="Every exercise follows the same rhythm: brief → do → review. Same buttons in the same places."/>
          <P n="4" t="Progress that teaches" d="Show where you stood yesterday, where you stand today, and what to do tomorrow. Weak spots are named, not hidden in averages."/>
          <P n="5" t="Writing & speaking need evidence" d="Always show the learner’s own output next to feedback: highlighted text for writing, transcript for speaking."/>
          <P n="6" t="Respect exam conditions" d="Mock exams use exam‑authentic timers, no tabs switching, no transcript until submit."/>
        </div>
      </section>

      {/* UI rules */}
      <section className="card bg-base-100 border border-base-300 ring-soft p-6">
        <h3 className="font-display text-lg font-bold">UI consistency rules</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          <Rule ok t="One radius scale" d="Cards: rounded-box · inputs/buttons: rounded-field · chips/badges: rounded-selector. Never mix in Tailwind rounded-lg / rounded-xl."/>
          <Rule ok t="Semantic color per skill" d="Reading=primary, Writing=success, Listening=info, Speaking=warning. Used only for skill affordances — error/success keep their state meaning."/>
          <Rule ok t="Lucide icons, 2px stroke, currentColor" d="Swap every emoji (📚✍️📊🎓) for the matching Lucide glyph. Emoji remains allowed in content, not in chrome."/>
          <Rule ok t="Display / body / mono split" d="Fraunces for page titles and hero numerals. Inter for body. JetBrains Mono for numeric tokens (42 days, 2/3, 0:28, 72%)."/>
          <Rule ok t="Cards have one border, no gradient" d="bg-base-100 · border border-base-300 · ring-soft. No shadow‑on‑hover; use translate‑y‑[‑1px] for affordance."/>
          <Rule ok t="One English UI, multiple content languages" d="All chrome copy is English. German (or other target) lives inside exercise content. No mixing."/>
          <Rule ok={false} t="Don’t spawn pages for filters" d="Reading/Writing no longer have their own list pages. They’re skill filters on /exercises."/>
          <Rule ok={false} t="Don’t leak metric soup onto the dashboard" d="Replace ‘Completion · Average · Best · Attempts’ stat rows with skill buttons that expose the same numbers on hover / drilldown."/>
        </div>
      </section>

      {/* Per-screen moves */}
      <section className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
        <div className="p-5"><h3 className="font-display text-lg font-bold">How each screen should improve</h3></div>
        <table className="table table-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-base-content/60">
              <th>Screen</th><th>Keep</th><th>Change</th><th>Add</th><th>Reuse from system</th>
            </tr>
          </thead>
          <tbody className="[&_td]:align-top [&_td]:py-3">
            <tr>
              <td><b>Home</b></td>
              <td>Feature triad, hero CTA</td>
              <td>Replace marketing tone with a signed‑in shortcut to Dashboard when a session exists.</td>
              <td>Exam badge + countdown in hero.</td>
              <td><code>card</code> · <code>btn-primary</code> · <code>hero</code></td>
            </tr>
            <tr>
              <td><b>Dashboard</b></td>
              <td>Progress concept, resume session, recent activity</td>
              <td>Collapse 4‑stat rows into 4 skill buttons. Move copy to one language.</td>
              <td>Exam countdown, subscription, upcoming plan, weak spots, mock‑exam strip.</td>
              <td><code>stats</code> → <code>card</code> grid · <code>progress</code> · <code>alert</code></td>
            </tr>
            <tr>
              <td><b>Exercises (new)</b></td>
              <td>Per‑item card anatomy; filters by type, status, sort</td>
              <td>Merge /reading and /writing into /exercises with multi‑select skill chips.</td>
              <td>Listening & Speaking types; chips for active filters; list/grid toggle.</td>
              <td><code>btn-sm</code> join · <code>badge</code> · <code>input</code> · <code>table</code></td>
            </tr>
            <tr>
              <td><b>Reading exercise</b></td>
              <td>Text + questions, explanations, quiz session</td>
              <td>Split into left text (60%), right question panel (40%). Inline explanations after submit.</td>
              <td>Text toolbar (TTS, font size, translate). Keyboard flow 1–4.</td>
              <td><code>card</code> · <code>prose</code> · <code>btn-ghost</code> join</td>
            </tr>
            <tr>
              <td><b>Writing exercise</b></td>
              <td>3‑card layout (description, instructions, editor), draft save</td>
              <td>Turn editor into a single canvas with sidebar of content points + model answer.</td>
              <td>Inline AI feedback with highlighted suggestions in the same textarea.</td>
              <td><code>textarea</code> · <code>alert</code> · <code>progress</code></td>
            </tr>
            <tr>
              <td><b>Listening (new)</b></td>
              <td>—</td>
              <td>—</td>
              <td>Start page (rules + play budget), player (waveform + transcript lock), results.</td>
              <td>Reuse exercise‑card anatomy; audio player is the only new atom.</td>
            </tr>
            <tr>
              <td><b>Speaking (new)</b></td>
              <td>—</td>
              <td>—</td>
              <td>Start (prompt + phrases), record (teleprompter + timer), results (waveform + transcript + rubric).</td>
              <td>Mirror Listening; recorder button is the only new atom.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* New components to add */}
      <section className="card bg-base-100 border border-base-300 ring-soft p-6">
        <h3 className="font-display text-lg font-bold">New design‑system atoms (minimum viable)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {[
            { t:'AudioPlayer', d:'Waveform + timer + playback budget + transcript lock state.', i:'audio-waveform' },
            { t:'MicRecorder', d:'Primary record button, live waveform, 0:00/target timer, re‑record.', i:'mic' },
            { t:'SkillChip',   d:'Multi‑select chip with skill color + count (used on /exercises).', i:'filter' },
            { t:'ReadinessRing', d:'Conic‑gradient ring keyed to skill semantic color, for dashboard and results.', i:'circle-dashed' },
          ].map(x=>(
            <div key={x.t} className="p-4 rounded-box border border-base-300">
              <div className="w-8 h-8 rounded-field bg-primary/10 text-primary grid place-items-center"><Ic name={x.i} size={14}/></div>
              <div className="font-semibold mt-2">{x.t}</div>
              <div className="text-xs text-base-content/70 mt-1">{x.d}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-base-content/60 mt-4">Everything else (buttons, cards, alerts, inputs, progress, badges, tabs, modals, menus) is already in daisyUI — no additions required.</div>
      </section>

      {/* Priority list */}
      <section className="card bg-base-100 border border-base-300 ring-soft p-6">
        <h3 className="font-display text-lg font-bold">Priority list for implementation</h3>
        <ol className="mt-4 space-y-2">
          {[
            ['P0','Unify shell: sidebar + topbar + breadcrumbs; kill emoji‑as‑icon.', 'chrome'],
            ['P0','Collapse /reading + /writing lists into /exercises with multi‑skill chips.', 'ia'],
            ['P0','Redesign Dashboard with countdown + skill readiness + continue + upcoming.', 'home'],
            ['P1','Add Listening module (start / play / result) using the existing card vocabulary.', 'listening'],
            ['P1','Add Speaking module with mic permission, teleprompter, transcript feedback.', 'speaking'],
            ['P1','Writing: move model answer and feedback inline with the editor; track content‑points.', 'writing'],
            ['P2','Mock exams: timed, cross‑skill, locked until 40% readiness.', 'exams'],
            ['P2','Progress page with cross‑skill trend chart and weak‑spot taxonomy.', 'progress'],
            ['P3','Subscription + plan surface on dashboard and in Settings.', 'billing'],
            ['P3','Internationalization polish: single UI language per session; German strictly for content.', 'i18n'],
          ].map(([p,t,tag],i)=>(
            <li key={i} className="flex items-start gap-3 p-3 rounded-field bg-base-100 border border-base-300">
              <span className={`font-mono text-[11px] font-bold rounded px-1.5 py-0.5 ${p==='P0'?'bg-error text-error-content':p==='P1'?'bg-warning text-warning-content':p==='P2'?'bg-info text-info-content':'bg-base-200'}`}>{p}</span>
              <div className="flex-1 text-sm">{t}</div>
              <span className="text-[10px] font-mono text-base-content/50 uppercase">{tag}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Implementation-ready */}
      <section className="card bg-base-100 border border-base-300 ring-soft p-6">
        <h3 className="font-display text-lg font-bold">Implementation‑ready guidance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
          <div className="p-4 rounded-box bg-base-200 border border-base-300">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/60 mb-2">Reuse from the repo</div>
            <ul className="text-sm space-y-1.5 list-disc pl-5 marker:text-base-content/40">
              <li><code>components/reading/TextCard.vue</code> → becomes <code>ExerciseCard.vue</code>, generalized with a <code>skill</code> prop.</li>
              <li><code>components/reading/QuestionCard.vue</code> → reused for listening multi‑choice.</li>
              <li><code>components/writing/TextEditorCard.vue</code> + <code>WritingFeedback.vue</code> → merge into a single <code>WritingCanvas.vue</code>.</li>
              <li><code>composables/useProgress.ts</code> → extend with <code>listening</code> and <code>speaking</code> keys; no rewrite.</li>
              <li><code>pages/reading/index.vue</code> + <code>pages/writing/index.vue</code> → deprecate; redirect to <code>/exercises?skill=reading</code> etc.</li>
            </ul>
          </div>
          <div className="p-4 rounded-box bg-base-200 border border-base-300">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/60 mb-2">Minimal new files</div>
            <ul className="text-sm space-y-1.5 font-mono list-disc pl-5 marker:text-base-content/40">
              <li>components/AudioPlayer.vue</li>
              <li>components/MicRecorder.vue</li>
              <li>components/SkillChip.vue</li>
              <li>components/ReadinessRing.vue</li>
              <li>pages/exercises/index.vue</li>
              <li>pages/listening/[id].vue · pages/speaking/[id].vue</li>
              <li>pages/exams/index.vue · pages/exams/[id].vue</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="flex gap-2 justify-center py-4">
        <button onClick={()=>go({name:'dashboard'})} className="btn btn-primary gap-2"><Ic name="play" size={14}/> Try the redesigned prototype</button>
        <button onClick={()=>go({name:'audit'})} className="btn btn-ghost gap-2"><Ic name="clipboard-list" size={14}/> Revisit the audit</button>
      </div>
    </div>
  );
}

Object.assign(window, { Redesign });
