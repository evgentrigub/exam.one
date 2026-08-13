// Dashboard
const {
  L,
  useState,
  useEffect,
  useMemo,
  useApp,
  EXERCISES,
  MOCK_EXAMS,
  SKILLS,
  Ic,
  useIcons,
  SkillBadge,
  LevelPip,
  Spark,
  RingProg,
} = window

function Dashboard() {
  const { go, level } = useApp()
  useIcons([level])

  const pct = { reading: 68, writing: 42, listening: 30, speaking: 35 }
  const streak = 12
  const weekMinutes = 147
  const goal = 210

  const continueItems = EXERCISES.filter(e => e.status === 'inprogress' && e.level === level).slice(
    0,
    3
  )
  const recommended = EXERCISES.filter(e => e.status === 'new' && e.level === level).slice(0, 4)

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-6">
      {/* HERO: exam countdown + readiness */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 card bg-base-100 border border-base-300 ring-soft overflow-hidden">
          <div className="p-5 flex items-start gap-5">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-box bg-primary text-primary-content grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-3xl font-bold leading-none">42</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-90 mt-1">
                    days left
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <Ic name="flag" size={12} /> Goethe Zertifikat {level} · Berlin · 31 May 2026
              </div>
              <h2 className="font-display text-2xl font-bold mt-1">You’re 64% exam‑ready</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Target is 85% by exam day. Listening and Speaking are your weakest skills right now.
              </p>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {SKILLS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => go({ name: 'exercises', filter: s.id })}
                    className="text-left p-3 rounded-field border border-base-300 hover:border-base-content/20 bg-base-100 card-hov"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-${s.color} flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider`}
                      >
                        <Ic name={s.icon} size={12} />
                        {s.label}
                      </span>
                      <Ic name="arrow-right" size={12} cls="opacity-40" />
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                      <div className="font-display text-2xl font-bold">{pct[s.id]}%</div>
                      <div className={`text-${s.color}`}>
                        <Spark values={[2, 3, 4, 3, 5, 4, 6, 7, 5, 6]} />
                      </div>
                    </div>
                    <progress
                      className={`progress progress-${s.color} w-full h-1.5 mt-1`}
                      value={pct[s.id]}
                      max="100"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-base-300 bg-base-200/50">
            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={() => go({ name: 'exercises' })}
            >
              <Ic name="play" size={14} /> Start today’s plan · 30 min
            </button>
            <button className="btn btn-ghost btn-sm gap-2" onClick={() => go({ name: 'exams' })}>
              <Ic name="file-badge" size={14} /> Take a mock exam
            </button>
            <div className="ml-auto text-xs text-base-content/60 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Ic name="flame" size={12} cls="text-warning" /> {streak}‑day streak
              </span>
              <span className="flex items-center gap-1">
                <Ic name="clock" size={12} /> {weekMinutes}/{goal} min this week
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Your exercises (continue) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold">Continue practicing</h3>
          <button onClick={() => go({ name: 'exercises' })} className="btn btn-ghost btn-sm">
            See all <Ic name="arrow-right" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {continueItems.map(e => (
            <button
              key={e.id}
              onClick={() => go({ name: e.skill, id: e.id })}
              className="text-left card bg-base-100 border border-base-300 ring-soft p-4 card-hov"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkillBadge skill={e.skill} size="xs" />
                  <LevelPip level={e.level} />
                </div>
                <span className="text-[10px] text-base-content/50">{e.minutes} min</span>
              </div>
              <div className="font-display font-bold mt-2 truncate">{e.title}</div>
              <div className="text-xs text-base-content/60 truncate">{e.subtitle}</div>
              <div className="mt-3 flex items-center gap-2">
                <progress
                  className="progress progress-primary flex-1 h-1.5"
                  value={e.progress}
                  max="100"
                />
                <span className="text-[11px] font-mono text-base-content/60 w-8 text-right">
                  {e.progress}%
                </span>
              </div>
              {e.draft && (
                <div className="mt-2 text-[11px] text-warning flex items-center gap-1">
                  <Ic name="file-edit" size={11} /> Draft saved
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Your exams */}
      <section className="card bg-base-100 border border-base-300 ring-soft overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Your mock exams · {level}</h3>
            <p className="text-xs text-base-content/60">
              Full‑length timed tests · unlocked after 40% readiness in each skill.
            </p>
          </div>
          <button className="btn btn-primary btn-sm gap-1" onClick={() => go({ name: 'exams' })}>
            Go to mock exams <Ic name="arrow-right" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-12 gap-0 border-t border-base-300">
          {MOCK_EXAMS.filter(m => m.level === level).map((x, i) => (
            <div
              key={x.id}
              className="col-span-12 md:col-span-6 p-5 border-r last:border-r-0 border-base-300"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                {x.title}
              </div>
              <div className="font-display text-lg font-bold mt-1">
                {x.status === 'done'
                  ? 'Completed'
                  : x.status === 'next'
                    ? 'Recommended next'
                    : 'Locked'}
              </div>
              <div className="text-xs text-base-content/60 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Ic name="clock" size={11} /> {x.time}
                </span>
                <span className="flex items-center gap-1">
                  <Ic name="layers" size={11} /> 4 skills
                </span>
              </div>
              <div className="mt-3">
                {x.status === 'done' && (
                  <div className="flex items-center gap-3">
                    <div
                      className="ring-prog"
                      style={{ '--p': x.score, '--c': 'var(--color-success)' }}
                    >
                      <span>{x.score}%</span>
                    </div>
                    <div className="text-xs text-base-content/60">Passed · review available</div>
                  </div>
                )}
                {x.status === 'next' && (
                  <button
                    onClick={() => go({ name: 'mock', id: x.id })}
                    className="btn btn-primary btn-sm w-full gap-1"
                  >
                    Start now <Ic name="play" size={12} />
                  </button>
                )}
                {x.status === 'locked' && (
                  <button
                    disabled
                    className="btn btn-sm w-full gap-1 bg-base-200 text-base-content/40 border border-base-300 hover:bg-base-200"
                  >
                    <Ic name="lock" size={12} /> Locked
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weak-spots + recommended */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 card bg-base-100 border border-base-300 ring-soft p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Weak spots</h3>
            <span className="badge badge-ghost">Auto‑detected</span>
          </div>
          <ul className="mt-3 space-y-3">
            {[
              { k: 'Listening · numbers and times', v: 58, c: 'info' },
              { k: 'Writing · formal closings', v: 62, c: 'success' },
              { k: 'Speaking · fillers & pacing', v: 49, c: 'warning' },
            ].map((x, i) => (
              <li key={i}>
                <div className="flex items-center justify-between text-sm">
                  <span>{x.k}</span>
                  <span className="font-mono text-xs text-base-content/60">{x.v}%</span>
                </div>
                <progress
                  className={`progress progress-${x.c} w-full h-1.5 mt-1`}
                  value={x.v}
                  max="100"
                />
              </li>
            ))}
          </ul>
          <button className="btn btn-outline btn-sm mt-4 w-full">
            Build a 15‑min drill from my weak spots
          </button>
        </div>

        <div className="col-span-12 lg:col-span-7 card bg-base-100 border border-base-300 ring-soft p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Recommended for you</h3>
            <button className="btn btn-ghost btn-sm">Refresh</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {recommended.map(e => (
              <button
                key={e.id}
                onClick={() => go({ name: e.skill, id: e.id })}
                className="text-left p-3 rounded-field border border-base-300 hover:border-base-content/20 card-hov"
              >
                <div className="flex items-center gap-2">
                  <SkillBadge skill={e.skill} size="xs" />
                  <LevelPip level={e.level} />
                  <span className="text-[10px] text-base-content/50 ml-auto">{e.minutes} min</span>
                </div>
                <div className="font-semibold mt-1 text-sm truncate">{e.title}</div>
                <div className="text-xs text-base-content/60 truncate">{e.subtitle}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

Object.assign(window, { Dashboard })
