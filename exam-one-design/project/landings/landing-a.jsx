// Direction A — Open-source / self-host, developer-led
const { R: RA, useIcons: useIconsA, useReveal: useRevealA, Ic: IcA, Wordmark: WordmarkA,
  GhStars: GhStarsA, SKILLS: SKILLS_A, TerminalMock: TerminalMockA, ReadinessPanel: ReadinessPanelA,
  LandingFooter: LandingFooterA } = window;

function LandingA() {
  useIconsA([]); useRevealA();

  const NavA = () => (
    <nav className="sticky top-0 z-40 bg-[#0f1117]/85 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <WordmarkA light />
        <div className="hidden md:flex items-center gap-6 ml-4 text-sm text-white/65">
          {['Features', 'Self-host', 'Pricing', 'Docs'].map(x => <a key={x} className="hover:text-white cursor-pointer">{x}</a>)}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <GhStarsA light />
          <a className="btn btn-sm btn-primary rounded-field whitespace-nowrap">Get started</a>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="bg-base-100">
      <NavA />

      {/* HERO */}
      <header className="bg-[#0f1117] text-white hero-noise relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Open-source · self-hostable · MIT
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.03] mt-5 tracking-tight">
              Practice any language exam.<br /><span className="text-primary">Until you know you'll pass.</span>
            </h1>
            <p className="text-lg text-white/65 mt-5 max-w-xl leading-relaxed">
              Self-host an exam-realistic trainer for Reading, Writing, Listening and Speaking. Plug in your own LLM key and run unlimited graded attempts — on your machine, at your cost.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <a className="btn btn-primary rounded-field gap-2"><IcA name="terminal" size={16} /> docker compose up</a>
              <a className="btn btn-outline border-white/25 text-white hover:bg-white hover:text-base-content rounded-field gap-2"><IcA name="star" size={16} /> Star on GitHub</a>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-white/55">
              <span className="flex items-center gap-2"><IcA name="wifi-off" size={15} /> Offline-first core</span>
              <span className="flex items-center gap-2"><IcA name="key-round" size={15} /> Bring your own key</span>
              <span className="flex items-center gap-2"><IcA name="infinity" size={15} /> Unlimited attempts</span>
            </div>
          </div>
          <div className="space-y-4">
            <TerminalMockA light />
            <div className="opacity-95"><ReadinessPanelA compact /></div>
          </div>
        </div>
        {/* logos / trust */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-white/45 text-sm">
            <span className="text-white/35 uppercase text-xs tracking-wider">Works with your own keys</span>
            {['OpenAI', 'Google Gemini', 'Anthropic', 'Ollama (local)', 'Mistral'].map(p => (
              <span key={p} className="font-mono text-xs">{p}</span>
            ))}
          </div>
        </div>
      </header>

      {/* WHO IT'S FOR */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto reveal">
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">Who it's for</div>
          <h2 className="font-display text-3xl font-bold mt-2">Built to be owned, not rented</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            ['Self-learners', 'user', 'Run it locally like n8n. Your drafts, attempts and results never leave your machine.'],
            ['Tinkerers & devs', 'code-2', 'Fork it, edit the prompt templates, add a new exam level. Typed seed data, no lock-in.'],
            ['Schools & tutors', 'graduation-cap', 'Host one instance for your cohort and swap in the certification you actually teach.'],
          ].map(([t, i, d], idx) => (
            <div key={t} className="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-6" style={{ transitionDelay: `${idx * 80}ms` }}>
              <div className="w-11 h-11 rounded-field bg-primary/10 text-primary grid place-items-center"><IcA name={i} size={20} /></div>
              <div className="font-semibold text-lg mt-4">{t}</div>
              <p className="text-sm text-base-content/65 mt-1.5 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUR SKILLS */}
      <section className="bg-base-200/60 border-y border-base-300">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl reveal">
            <div className="text-xs uppercase tracking-wider font-semibold text-primary">Every part of the exam</div>
            <h2 className="font-display text-3xl font-bold mt-2">All four skills, one consistent workflow</h2>
            <p className="text-base-content/65 mt-3">Brief → do → review. The same rhythm and the same keyboard flow whether you're reading, writing, listening or speaking.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {SKILLS_A.map((s, idx) => (
              <div key={s.id} className={`reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-5`} style={{ transitionDelay: `${idx * 70}ms` }}>
                <div className={`w-11 h-11 rounded-field bg-${s.tint}-soft text-${s.tint} grid place-items-center`}><IcA name={s.icon} size={20} /></div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="font-semibold text-lg">{s.label}</div>
                  <span className="ml-auto font-mono text-xs text-base-content/45">{s.minutes}m</span>
                </div>
                <p className="text-sm text-base-content/65 mt-1.5 leading-relaxed">{s.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW SELF-HOST WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div className="reveal">
            <div className="text-xs uppercase tracking-wider font-semibold text-primary">Up and running in minutes</div>
            <h2 className="font-display text-3xl font-bold mt-2">Three steps to your own exam trainer</h2>
            <div className="mt-8 space-y-5">
              {[
                ['Clone & compose', 'One command spins up the Nuxt frontend. No database, no backend to wire up for the MVP.', 'git-branch'],
                ['Add your LLM key', 'Paste a key from any provider — or point it at a local model. AI stays an optional enhancement.', 'key-round'],
                ['Practice offline', 'Core reading, writing, listening and speaking flows work with zero network. Your data lives in your browser.', 'wifi-off'],
              ].map(([t, d, i], idx) => (
                <div key={t} className="flex gap-4">
                  <div className="w-9 h-9 shrink-0 rounded-field bg-primary text-primary-content grid place-items-center font-mono font-bold text-sm">{idx + 1}</div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">{t} <IcA name={i} size={14} cls="text-base-content/40" /></div>
                    <p className="text-sm text-base-content/65 mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal space-y-4">
            <TerminalMockA light={false} />
            <div className="bg-base-100 rounded-box border border-base-300 ring-soft p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"><IcA name="key-round" size={18} /></div>
              <div>
                <div className="font-semibold text-sm">Bring your own key</div>
                <p className="text-xs text-base-content/65 mt-1 leading-relaxed">Provider-agnostic. Generation, review and grading all run on <i>your</i> account — so unlimited realistic attempts cost only what your provider charges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPEN SOURCE BANNER */}
      <section className="bg-[#0f1117] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80"><IcA name="git-branch" size={13} /> 100% open source</div>
            <h2 className="font-display text-3xl font-bold mt-4 leading-tight">Transparent structure for exercises, review and grading — fork it, audit it, extend it.</h2>
            <p className="text-white/60 mt-3 max-w-lg">Prompt templates ship as editable demo files. The framework is exam-agnostic by design, so adding a new language or level is seed data, not a rewrite.</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a className="btn btn-primary rounded-field gap-2"><IcA name="git-branch" size={16} /> View the repo</a>
              <a className="btn btn-outline border-white/25 text-white hover:bg-white hover:text-base-content rounded-field gap-2"><IcA name="book-open" size={16} /> Read the docs</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 reveal">
            {[['21.4k', 'GitHub stars', 'star'], ['MIT', 'License', 'scale'], ['2', 'Exams in MVP', 'file-badge'], ['∞', 'Attempts', 'infinity']].map(([n, l, i]) => (
              <div key={l} className="rounded-box border border-white/10 bg-white/5 p-4">
                <IcA name={i} size={16} cls="text-primary" />
                <div className="font-mono text-2xl font-bold mt-2">{n}</div>
                <div className="text-xs text-white/55">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto reveal">
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">Pricing</div>
          <h2 className="font-display text-3xl font-bold mt-2">Free forever if you host it yourself</h2>
          <p className="text-base-content/65 mt-3">Or let us run the same project in the cloud when you'd rather not.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <div className="reveal card-hov bg-base-100 rounded-box border-2 border-primary ring-soft p-7 relative">
            <span className="absolute top-5 right-5 badge badge-primary badge-sm">Recommended</span>
            <div className="text-sm font-semibold text-primary">Self-hosted</div>
            <div className="font-display text-4xl font-bold mt-2">€0<span className="text-base font-normal text-base-content/50"> / forever</span></div>
            <p className="text-sm text-base-content/60 mt-2">Run it on your own machine with your own keys.</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {['All four skills + mock exam mode', 'Bring-your-own-key AI review', 'Editable prompt templates', 'Offline-first, data stays local', 'Community support'].map(f => (
                <li key={f} className="flex gap-2.5"><IcA name="check" size={16} cls="text-success shrink-0 mt-0.5" /> {f}</li>
              ))}
            </ul>
            <a className="btn btn-primary rounded-field w-full mt-6 gap-2"><IcA name="terminal" size={15} /> Get the install command</a>
          </div>
          <div className="reveal card-hov bg-base-100 rounded-box border border-base-300 ring-soft p-7">
            <div className="text-sm font-semibold">Hosted cloud</div>
            <div className="font-display text-4xl font-bold mt-2">€9.90<span className="text-base font-normal text-base-content/50"> / month</span></div>
            <p className="text-sm text-base-content/60 mt-2">We host it, you just practice. Includes managed AI.</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {['Everything in self-hosted', 'No setup — sign in and go', 'Managed AI review included', 'Cloud sync across devices', 'Full mock-exam library'].map(f => (
                <li key={f} className="flex gap-2.5"><IcA name="check" size={16} cls="text-success shrink-0 mt-0.5" /> {f}</li>
              ))}
            </ul>
            <a className="btn btn-outline border-base-300 rounded-field w-full mt-6">Start free trial</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-base-200/60 border-t border-base-300">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-center reveal">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            {[
              ['Do I need an LLM key to use it?', 'No. Core practice for all four skills works fully offline. AI review and exercise generation are optional enhancements that use your own provider key.'],
              ['Which exams are supported?', 'The MVP ships with German Goethe A2 and English Cambridge A2. The framework is exam-agnostic — more levels and languages come as typed seed data.'],
              ['Where is my data stored?', 'Everything — drafts, attempts, results — lives client-side in your browser. Nothing is sent anywhere except your chosen LLM provider when you opt into AI.'],
              ['What does the mock exam mode do?', 'A true single-attempt simulation: exam-authentic timers, no pauses, and no feedback until you submit — the same constraints as the real test.'],
            ].map(([q, a], i) => (
              <div key={i} className="reveal collapse collapse-arrow bg-base-100 rounded-box border border-base-300">
                <input type="checkbox" defaultChecked={i === 0} />
                <div className="collapse-title font-semibold text-base">{q}</div>
                <div className="collapse-content text-sm text-base-content/70 leading-relaxed"><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="reveal rounded-box bg-[#0f1117] text-white hero-noise p-10 md:p-14 text-center relative overflow-hidden">
          <h2 className="font-display text-4xl font-bold leading-tight">Be ready before exam day.</h2>
          <p className="text-white/65 mt-3 max-w-xl mx-auto">Clone the repo, add a key, and start your first graded attempt in minutes.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <a className="btn btn-primary rounded-field gap-2"><IcA name="terminal" size={16} /> docker compose up</a>
            <a className="btn btn-outline border-white/25 text-white hover:bg-white hover:text-base-content rounded-field gap-2"><IcA name="star" size={16} /> Star on GitHub</a>
          </div>
        </div>
      </section>

      <LandingFooterA light />
    </div>
  );
}

window.LandingA = LandingA;
