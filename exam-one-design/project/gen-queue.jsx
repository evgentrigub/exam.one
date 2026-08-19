// =====================================================================
// GENERATION QUEUE  — visual feedback for AI exercise generation
// A global observable store + a floating tray (bottom-right) + a slim
// top progress bar. Design-only: progress is simulated on a timer.
// =====================================================================

const {
  L,
  useState,
  useEffect,
  useRef,
  useMemo,
  Ic,
  useIcons,
  useApp,
  SKILLS,
  EXAM_STRUCTURE,
  getPart,
} = window
const { createPortal } = window.ReactDOM

// ---------- observable store (framework-agnostic singleton) ----------
const GenQueue = (() => {
  let jobs = [] // { id, title, skill, part, level, status, progress }
  let seq = 0
  let timer = null
  const listeners = new Set()
  const CONCURRENCY = 2 // how many generate at once

  const emit = () => {
    const snap = jobs.slice()
    listeners.forEach(l => l(snap))
  }
  const subscribe = fn => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }
  const getJobs = () => jobs

  const ensureTimer = () => {
    if (timer) return
    timer = setInterval(tick, 260)
  }
  const stopIfIdle = () => {
    const active = jobs.some(j => j.status === 'queued' || j.status === 'generating')
    if (!active && timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const tick = () => {
    let changed = false
    // advance in-flight jobs
    let generating = jobs.filter(j => j.status === 'generating')
    for (const j of generating) {
      // uneven, natural-feeling increments; slight stall near the end
      const step = j.progress > 82 ? 3 + Math.random() * 4 : 6 + Math.random() * 11
      j.progress = Math.min(100, j.progress + step)
      changed = true
      if (j.progress >= 100) {
        j.status = 'done'
        j.doneAt = Date.now()
      }
    }
    // promote queued jobs up to concurrency
    let inFlight = jobs.filter(j => j.status === 'generating').length
    for (const j of jobs) {
      if (inFlight >= CONCURRENCY) break
      if (j.status === 'queued') {
        j.status = 'generating'
        j.progress = 4 + Math.random() * 8
        inFlight++
        changed = true
      }
    }
    if (changed) emit()
    stopIfIdle()
  }

  const enqueue = items => {
    const added = items.map(it => ({
      id: `gj${++seq}`,
      status: 'queued',
      progress: 0,
      title: it.title,
      skill: it.skill,
      part: it.part,
      level: it.level,
      kind: it.kind || 'exercise',
    }))
    jobs = [...jobs, ...added]
    emit()
    ensureTimer()
    tick() // kick immediately so the first job starts without delay
    return added.map(j => j.id)
  }

  const remove = id => {
    jobs = jobs.filter(j => j.id !== id)
    emit()
    stopIfIdle()
  }
  const clearDone = () => {
    jobs = jobs.filter(j => j.status !== 'done' && j.status !== 'error')
    emit()
  }
  const clearAll = () => {
    jobs = []
    emit()
    stopIfIdle()
  }
  const retry = id => {
    const j = jobs.find(x => x.id === id)
    if (j) {
      j.status = 'queued'
      j.progress = 0
      emit()
      ensureTimer()
    }
  }

  return { subscribe, getJobs, enqueue, remove, clearDone, clearAll, retry }
})()

// React hook over the store
function useGenQueue() {
  const [jobs, setJobs] = useState(() => GenQueue.getJobs().slice())
  useEffect(() => GenQueue.subscribe(setJobs), [])
  return jobs
}

// Build a list of generation jobs from a modal's selection.
// Distributes `count` exercises across the chosen skill×part combos.
function buildGenJobs({ level, skills, parts, count }) {
  const skillList = skills && skills.length ? skills : SKILLS.map(s => s.id)
  // expand to concrete skill:part combos
  let combos = []
  if (parts && parts.length) {
    combos = parts.map(p => {
      const [sk, n] = p.split(':')
      return { skill: sk, part: +n }
    })
  } else {
    for (const sk of skillList) {
      const ps = (EXAM_STRUCTURE[sk]?.parts || []).map(p => p.n)
      for (const n of ps) combos.push({ skill: sk, part: n })
    }
  }
  if (!combos.length) return []
  const n = count || combos.length
  const jobs = []
  for (let i = 0; i < n; i++) {
    const c = combos[i % combos.length]
    const p = getPart(c.skill, c.part) || {}
    jobs.push({
      level,
      skill: c.skill,
      part: c.part,
      title: p.title || `${c.skill} Part ${c.part}`,
    })
  }
  return jobs
}

// ---------- job row ----------
function GenJobRow({ j }) {
  const s = SKILLS.find(x => x.id === j.skill) || {
    color: 'primary',
    icon: 'sparkles',
    label: j.skill,
  }
  const done = j.status === 'done'
  const gen = j.status === 'generating'
  const err = j.status === 'error'
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span
        className={`w-7 h-7 rounded-selector grid place-items-center shrink-0 text-${s.color}`}
        style={{ background: `color-mix(in oklab, var(--color-${s.color}) 14%, transparent)` }}
      >
        {done ? (
          <Ic name="check" size={14} />
        ) : err ? (
          <Ic name="alert-triangle" size={14} />
        ) : gen ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <Ic name="clock" size={13} />
        )}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium leading-tight truncate">{j.title}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide text-${s.color}`}>
            {s.label}
          </span>
          <span className="text-[10px] text-base-content/40">
            · Part {j.part} · {j.level}
          </span>
        </div>
        {gen && (
          <progress
            className={`progress progress-${s.color} h-1 mt-1.5 w-full`}
            value={j.progress}
            max="100"
          />
        )}
      </div>

      <div className="shrink-0 w-[52px] text-right">
        {done && (
          <span className="text-[10px] font-semibold text-success flex items-center gap-1 justify-end">
            <Ic name="check-circle-2" size={12} /> Done
          </span>
        )}
        {gen && (
          <span className="text-[11px] font-mono text-base-content/60 tabular-nums">
            {Math.round(j.progress)}%
          </span>
        )}
        {j.status === 'queued' && (
          <span className="text-[10px] font-medium text-base-content/40">Queued</span>
        )}
        {err && (
          <button
            onClick={() => GenQueue.retry(j.id)}
            className="text-[10px] font-semibold text-error hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

// ---------- the tray ----------
function GenQueueTray() {
  useIcons()
  const jobs = useGenQueue()
  const [open, setOpen] = useState(true)
  const { go } = useApp()

  // auto-open the tray whenever new work arrives
  const prevLen = useRef(0)
  useEffect(() => {
    if (jobs.length > prevLen.current) setOpen(true)
    prevLen.current = jobs.length
  }, [jobs.length])

  const total = jobs.length
  const done = jobs.filter(j => j.status === 'done').length
  const running = jobs.filter(j => j.status === 'generating').length
  const queued = jobs.filter(j => j.status === 'queued').length
  const active = running + queued
  const allDone = total > 0 && active === 0
  const overall = total
    ? Math.round(jobs.reduce((a, j) => a + (j.status === 'done' ? 100 : j.progress), 0) / total)
    : 0

  if (total === 0) return null

  // order: generating → queued → done
  const rank = { generating: 0, queued: 1, error: 2, done: 3 }
  const ordered = jobs.slice().sort((a, b) => rank[a.status] - rank[b.status])

  return createPortal(
    <div
      className="fixed bottom-5 right-5 z-[70] w-[360px] max-w-[calc(100vw-2rem)]
                    animate-[slideUp_200ms_cubic-bezier(.2,.7,.3,1)]"
    >
      <div className="bg-base-100 rounded-box border border-base-300 shadow-2xl overflow-hidden">
        {/* header */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-base-200/50 transition-colors"
        >
          <span
            className={`w-8 h-8 rounded-field grid place-items-center shrink-0
            ${allDone ? 'bg-success/12 text-success' : 'bg-primary/12 text-primary'}`}
          >
            {allDone ? (
              <Ic name="check-circle-2" size={17} />
            ) : (
              <span className="loading loading-spinner loading-sm" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold leading-tight">
              {allDone ? `${done} exercise${done !== 1 ? 's' : ''} ready` : `Generating exercises`}
            </div>
            <div className="text-[11px] text-base-content/55 leading-tight mt-0.5">
              {allDone
                ? 'All generations complete'
                : `${done}/${total} done · ${running} generating${queued ? ` · ${queued} queued` : ''}`}
            </div>
          </div>
          <Ic name={open ? 'chevron-down' : 'chevron-up'} size={16} cls="opacity-50" />
        </button>

        {/* overall bar */}
        <div className="px-4 pb-2 -mt-1">
          <progress
            className={`progress ${allDone ? 'progress-success' : 'progress-primary'} h-1.5 w-full`}
            value={overall}
            max="100"
          />
        </div>

        {/* list */}
        {open && (
          <>
            <div className="max-h-[300px] overflow-y-auto divide-y divide-base-300/60 border-t border-base-300/60">
              {ordered.map(j => (
                <GenJobRow key={j.id} j={j} />
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-base-300/60 bg-base-200/40">
              {allDone ? (
                <>
                  <button
                    onClick={() => {
                      GenQueue.clearAll()
                      go({ name: 'exercises' })
                    }}
                    className="btn btn-primary btn-sm rounded-full gap-1.5 flex-1"
                  >
                    <Ic name="layers" size={14} /> View exercises
                  </button>
                  <button
                    onClick={() => GenQueue.clearAll()}
                    className="btn btn-ghost btn-sm rounded-full"
                  >
                    Dismiss
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-base-content/55 flex items-center gap-1.5">
                    <Ic name="info" size={12} /> Keep working — we’ll notify you here.
                  </span>
                  {done > 0 && (
                    <button
                      onClick={() => GenQueue.clearDone()}
                      className="btn btn-ghost btn-xs rounded-full ml-auto"
                    >
                      Clear done
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

// ---------- slim global top progress bar ----------
function GenTopBar() {
  const jobs = useGenQueue()
  const active = jobs.some(j => j.status === 'generating' || j.status === 'queued')
  if (!active) return null
  const total = jobs.length
  const overall = total
    ? jobs.reduce((a, j) => a + (j.status === 'done' ? 100 : j.progress), 0) / total
    : 0
  return createPortal(
    <div className="fixed top-0 left-0 right-0 z-[80] h-[3px] bg-primary/15 pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${overall}%`, boxShadow: '0 0 8px var(--color-primary)' }}
      />
    </div>,
    document.body
  )
}

function GenQueueHost() {
  return (
    <>
      <GenTopBar />
      <GenQueueTray />
    </>
  )
}

Object.assign(window, {
  GenQueue,
  useGenQueue,
  buildGenJobs,
  GenQueueTray,
  GenTopBar,
  GenQueueHost,
  GenJobRow,
})
