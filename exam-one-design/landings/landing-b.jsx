// Direction B — Learner outcome, product-led, warm & friendly
const { useIcons: useIconsB, useReveal: useRevealB, Ic: IcB, Wordmark: WordmarkB,
  SKILLS: SKILLS_B, ReadinessPanel: ReadinessPanelB, WritingFeedbackMock: WritingFeedbackMockB,
  SpeakingMock: SpeakingMockB, MockExamStrip: MockExamStripB, LandingFooter: LandingFooterB,
  ThemeToggle: ThemeToggleB, GhStars: GhStarsB, TerminalMock: TerminalMockB } = window;

function LandingB() {
  useIconsB([]); useRevealB();

  const NavB = () => (
    <nav className="sticky top-0 z-40 bg-base-100/85 backdrop-blur border-b border-base-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <WordmarkB />
        <div className="hidden md:flex items-center gap-6 ml-4 text-sm text-base-content/65">
          {[['How it works', '#how'], ['Skills', '#skills'], ['Pricing', '#pricing'], ['FAQ', '#faq'], ['Docs', '#faq']].map(([x, href]) => <a key={x} href={href} className="hover:text-primary cursor-pointer">{x}</a>)}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleB />
          <GhStarsB />
          <a className="btn btn-sm btn-ghost rounded-field hidden sm:inline-flex whitespace-nowrap">Sign in</a>
          <a className="btn btn-sm btn-primary rounded-field gap-1.5 whitespace-nowrap">Start free <IcB name="arrow-right" size={14} /></a>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="bg-base-100">
      <NavB />

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-60" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-medium text-base-content/70">
              <span className="flex -space-x-1">
                {SKILLS_B.map(s => <span key={s.id} className={`w-4 h-4 rounded-full border-2 border-base-100 bg-${s.tint}-soft`} />)}
              </span>
              Reading · Writing · Listening · Speaking
            </div>
            <h1 className="font-display text-5xl lg:text-[3.7rem] font-bold leading-[1.04] mt-5 tracking-tight">
              Start exam<br />already knowing<br /><span className="text-primary">you'll pass.</span>
            </h1>
            <p className="text-lg text-base-content/65 mt-5 max-w-lg leading-relaxed">
              Unlimited, exam-realistic practice across every skill — with instant AI feedback that tells you exactly what to fix before the real test.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <a className="btn btn-primary btn-lg rounded-field gap-2">Start practising free <IcB name="arrow-right" size={17} /></a>
              <a className="btn btn-ghost btn-lg rounded-field gap-2"><IcB name="play-circle" size={18} /> See how it works</a>
            </div>
            <div className="flex items-center gap-2 mt-6 text-sm text-base-content/55">
              <IcB name="check-circle-2" size={16} cls="text-success" /> No card needed
              <span className="mx-1">·</span>
              <IcB name="check-circle-2" size={16} cls="text-success" /> Free forever plan
            </div>
          </div>
          <div className="relative reveal in">
            <ReadinessPanelB compact />
          </div>
        </div>
      </header>

      {/* OUTCOME STATS */}
      <section className="border-y border-base-300 bg-base-200/50">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['∞', 'Unlimited attempts'], ['4', 'Skills covered'], ['AI', 'Detailed feedback'], ['Per-skill', 'Progress tracking']].map(([n, l]) => (
            <div key={l} className="reveal">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary">{n}</div>
              <div className="text-sm text-base-content/60 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto reveal">
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">How it works</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">A loop that actually makes you ready</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            ['Practise the real format', 'layers', 'Every exercise mirrors the actual exam parts, timings and question types — no surprises on the day.'],
            ['Get feedback that teaches', 'message-square-quote', 'AI marks your writing and speaking against the real rubric and names the exact thing to fix.'],
            ['Watch your readiness rise', 'trending-up', 'A single readiness score per skill shows where you stand today and what to drill tomorrow.'],
          ].map(([t, i, d], idx) => (
            <div key={t} className="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-6" style={{ transitionDelay: `${idx * 80}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-field bg-primary/10 text-primary grid place-items-center"><IcB name={i} size={19} /></div>
                <span className="font-mono text-xs text-base-content/40">0{idx + 1}</span>
              </div>
              <div className="font-semibold text-lg mt-4">{t}</div>
              <p className="text-sm text-base-content/65 mt-1.5 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SKILL SHOWCASE — alternating */}
      <section id="skills" className="bg-base-200/50 border-y border-base-300 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20 space-y-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="reveal">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-writing uppercase tracking-wide"><IcB name="pen-line" size={13} /> Writing</span>
              <h3 className="font-display text-3xl font-bold mt-3 leading-tight">An AI review of every draft you submit</h3>
              <p className="text-base-content/65 mt-3 leading-relaxed max-w-md">Write your answer in the exam format, submit it, and get a scored review against the rubric — with the grammar, vocabulary and structure breakdown behind the number.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {['CEFR-aligned score out of 100', 'Grammar, vocabulary and structure sub-scores', 'Ideal answer to compare against'].map(f => (
                  <li key={f} className="flex gap-2.5"><IcB name="check" size={16} cls="text-success shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
            </div>
            <div className="reveal"><WritingFeedbackMockB /></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="reveal lg:order-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-speaking uppercase tracking-wide"><IcB name="mic" size={13} /> Speaking</span>
              <h3 className="font-display text-3xl font-bold mt-3 leading-tight">Record your answer under exam timing</h3>
              <p className="text-base-content/65 mt-3 leading-relaxed max-w-md">Read the prompt card, take your preparation time, then record out loud against the clock — and get a scored review on fluency, pronunciation, grammar and vocabulary.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {['Exam-timed preparation and recording', 'Fluency, pronunciation & accuracy scores', 'Interview, monologue & planning tasks'].map(f => (
                  <li key={f} className="flex gap-2.5"><IcB name="check" size={16} cls="text-success shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
            </div>
            <div className="reveal lg:order-1"><SpeakingMockB /></div>
          </div>
        </div>
      </section>

      {/* FOUR SKILLS GRID */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto reveal">
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">Complete coverage</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Train every part the exam tests</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {SKILLS_B.map((s, idx) => (
            <div key={s.id} className="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-5" style={{ transitionDelay: `${idx * 70}ms` }}>
              <div className={`w-12 h-12 rounded-box bg-${s.tint}-soft text-${s.tint} grid place-items-center`}><IcB name={s.icon} size={22} /></div>
              <div className="font-semibold text-lg mt-4">{s.label}</div>
              <p className="text-sm text-base-content/65 mt-1.5 leading-relaxed">{s.blurb}</p>
              <div className="mt-3 font-mono text-xs text-base-content/45">{s.minutes} min section</div>
            </div>
          ))}
        </div>
      </section>

      {/* MOCK EXAM */}
      <section id="mock" className="bg-base-200/50 border-y border-base-300 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div className="reveal">
            <div className="text-xs uppercase tracking-wider font-semibold text-primary">Mock exam mode</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight">Rehearse the real thing — pressure and all</h2>
            <p className="text-base-content/65 mt-3 leading-relaxed max-w-md">A single timed attempt with exam-authentic rules: no pauses, no peeking at feedback until you submit. The closest thing to exam day, as many times as you need.</p>
            <a className="btn btn-primary rounded-field gap-2 mt-6">Try a mock exam <IcB name="arrow-right" size={16} /></a>
          </div>
          <div className="reveal"><MockExamStripB /></div>
        </div>
      </section>

      {/* SUPPORTED EXAMS + TESTIMONIAL */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10">
        <div className="reveal">
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">Supported today</div>
          <h2 className="font-display text-3xl font-bold mt-2">Two exams now, any exam soon</h2>
          <p className="text-base-content/65 mt-3 max-w-md">A generic framework that adapts to any certification with light configuration — more levels and languages are on the way.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {[['🇩🇪', 'Goethe', 'German · A2'], ['🇬🇧', 'Cambridge', 'English · A2'], ['🇩🇪', 'Goethe', 'German · B1 · soon'], ['➕', 'Your exam', 'Configure it']].map(([f, n, l], i) => (
              <div key={i} className={`rounded-box border border-base-300 p-4 flex items-center gap-3 ${i > 1 ? 'opacity-60 border-dashed' : 'bg-base-100 ring-soft'}`}>
                <span className="text-2xl">{f}</span>
                <div><div className="font-semibold text-sm">{n}</div><div className="text-xs text-base-content/55">{l}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal flex">
          <div className="bg-primary text-primary-content rounded-box p-8 flex flex-col justify-between w-full">
            <IcB name="quote" size={28} cls="opacity-40" />
            <p className="font-display text-2xl font-semibold leading-snug mt-4">"I took the same mock six times. By the real exam, nothing surprised me — I passed Goethe A2 first try."</p>
            <div className="flex items-center gap-3 mt-6">
              <span className="w-10 h-10 rounded-full bg-primary-content/20 grid place-items-center font-semibold text-sm">LB</span>
              <div><div className="font-semibold text-sm">Lena Bauer</div><div className="text-xs opacity-70">Self-learner · Munich</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-base-200/50 border-t border-base-300 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto reveal">
            <div className="text-xs uppercase tracking-wider font-semibold text-primary">Pricing</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Start free. Upgrade when you're serious.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-7">
              <div className="text-sm font-semibold flex items-center gap-2">Free <span className="level-pip">Open source</span></div>
              <div className="font-display text-4xl font-bold mt-2">€0<span className="text-base font-normal text-base-content/50"> / forever</span></div>
              <p className="text-sm text-base-content/60 mt-2">Free because Exam.one is open source — host it yourself and it stays free.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {['All practice exercises, all four skills', 'Use your own LLM key for AI review', 'Self-hosted open-source text-to-speech for listening', 'Self-hosted open-source speech-to-text for speaking', 'Progress tracking across skills', 'Unlimited mock exams'].map(f => (
                  <li key={f} className="flex gap-2.5"><IcB name="check" size={16} cls="text-success shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <a className="btn btn-outline border-base-300 rounded-field w-full mt-6">Get started</a>
            </div>
            <div className="reveal card-hov bg-base-100 rounded-box border-2 border-primary ring-soft p-7 relative">
              <span className="absolute top-5 right-5 badge badge-primary badge-sm">Most popular</span>
              <div className="text-sm font-semibold text-primary">Cloud</div>
              <div className="font-display text-4xl font-bold mt-2">€9.90<span className="text-base font-normal text-base-content/50"> / month</span></div>
              <p className="text-sm text-base-content/60 mt-2">Hosted, with speech tools and AI review credits included — no keys to set up.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {['Everything in Free, nothing to install', 'Text-to-speech built in for listening', 'Speech-to-text built in for speaking', '500 AI review credits per month', 'Full mock-exam library'].map(f => (
                  <li key={f} className="flex gap-2.5"><IcB name="check" size={16} cls="text-success shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <p className="text-xs text-base-content/55 mt-4 flex gap-2"><IcB name="coins" size={14} cls="text-primary shrink-0 mt-0.5" /> One credit per AI-reviewed writing or speaking answer. Run out early? Top up any time.</p>
              <a className="btn btn-primary rounded-field w-full mt-6 gap-2">Start free trial <IcB name="arrow-right" size={15} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* SELF-HOST */}
      <section id="selfhost" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto reveal">
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">Prefer to self-host? Exam.one is open source — run it free on your own machine.</div>
          <h2 className="font-display text-3xl font-bold mt-2">Three steps to your own exam trainer</h2>
        </div>
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center mt-12">
          <div className="reveal">
            <div className="space-y-5">
              {[
                ['Clone & compose', 'One command spins up the Nuxt frontend. No database, no backend to wire up for the MVP.', 'git-branch'],
                ['Add your LLM key', 'Paste a key from any provider — or point it at a local model. AI stays an optional enhancement.', 'key-round'],
                ['Practice offline', 'Core reading, writing, listening and speaking flows work with zero network. Your data lives in your browser.', 'wifi-off'],
              ].map(([t, d, i], idx) => (
                <div key={t} className="flex gap-4">
                  <div className="w-9 h-9 shrink-0 rounded-field bg-primary text-primary-content grid place-items-center font-mono font-bold text-sm">{idx + 1}</div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">{t} <IcB name={i} size={14} cls="text-base-content/40" /></div>
                    <p className="text-sm text-base-content/65 mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal space-y-4">
            <TerminalMockB light={false} />
            <div className="bg-base-100 rounded-box border border-base-300 ring-soft p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"><IcB name="key-round" size={18} /></div>
              <div>
                <div className="font-semibold text-sm">Bring your own key</div>
                <p className="text-xs text-base-content/65 mt-1 leading-relaxed">Provider-agnostic. Generation, review and grading all run on <i>your</i> account — so unlimited realistic attempts cost only what your provider charges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 scroll-mt-16">
        <h2 className="font-display text-3xl font-bold text-center reveal">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {[
            ['Do I need to pay to start?', 'No. The self-hosted version is free forever, and the cloud plan starts with a free trial — no card needed.'],
            ['Which exams can I practise?', 'Goethe A2 (German) and Cambridge A2 (English) today. The framework is exam-agnostic, so more levels and languages arrive as seed data.'],
            ['What is an AI review credit?', 'One credit covers one AI-reviewed writing or speaking answer on the cloud plan. If you run out before the month ends, you can top up.'],
            ['Do I need my own LLM key?', 'Only if you self-host. The cloud plan includes AI review, text-to-speech and speech-to-text with nothing to configure.'],
            ['Where is my data stored?', 'Self-hosted, everything stays in your browser on your machine. On the cloud plan your progress syncs to your account across devices.'],
          ].map(([q, a], i) => (
            <div key={i} className="reveal collapse collapse-arrow bg-base-100 rounded-box border border-base-300">
              <input type="checkbox" defaultChecked={i === 0} />
              <div className="collapse-title font-semibold text-base">{q}</div>
              <div className="collapse-content text-sm text-base-content/70 leading-relaxed"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="reveal rounded-box border border-base-300 ring-soft bg-base-100 dot-pattern p-10 md:p-14 text-center relative overflow-hidden">
          <h2 className="font-display text-4xl font-bold leading-tight">Be ready before exam day</h2>
          <p className="text-base-content/65 mt-3 max-w-xl mx-auto">Start your first realistic attempt today — free, no card, all four skills.</p>
          <a className="btn btn-primary btn-lg rounded-field gap-2 mt-7">Start practising free <IcB name="arrow-right" size={17} /></a>
        </div>
      </section>

      <LandingFooterB />
    </div>
  );
}

window.LandingB = LandingB;
