// =====================================================================
// SETTINGS (cont.) — Learning · AI provider · Notifications ·
//                    Appearance · Plan & billing
// =====================================================================

const {
  L,
  useState,
  useEffect,
  Ic,
  useIcons,
  useApp,
  LEVELS,
  PLANS,
  SKILLS,
  AuthField,
  SetCard,
  SetHead,
  SetRow,
  SetToggle,
  SetSave,
  useFlash,
} = window

// ---------- shared: segmented choice ----------
function SetChoice({ options, value, onChange, cols }) {
  return (
    <div className={`grid gap-2 ${cols || 'grid-cols-2 sm:grid-cols-3'}`}>
      {options.map(o => {
        const active = value === o.id
        const off = o.disabled
        return (
          <button
            key={o.id}
            onClick={() => !off && onChange(o.id)}
            disabled={off}
            title={off ? 'Available soon' : undefined}
            className={`rounded-field border px-3 py-3 text-left transition-colors
              ${
                off
                  ? 'border-base-300 bg-base-200/40 cursor-not-allowed'
                  : active
                    ? 'border-primary bg-primary/5'
                    : 'border-base-300 hover:bg-base-200'
              }`}
          >
            <div className="flex items-center gap-2">
              {o.icon && (
                <Ic
                  name={o.icon}
                  size={15}
                  cls={off ? 'opacity-30' : active ? 'text-primary' : 'opacity-55'}
                />
              )}
              <span
                className={`text-sm font-medium ${off ? 'text-base-content/40' : active ? 'text-primary' : ''}`}
              >
                {o.label}
              </span>
              {active && !off && <Ic name="check" size={14} cls="ml-auto text-primary" />}
            </div>
            {(off || o.desc) && (
              <div
                className={`text-xs mt-1 ${off ? 'text-base-content/40' : 'text-base-content/55'}`}
              >
                {off ? 'Available soon' : o.desc}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

const SetLabel = ({ children, htmlFor }) => (
  <label className="label pb-1.5 block" htmlFor={htmlFor}>
    <span className="label-text text-sm font-medium">{children}</span>
  </label>
)

// =====================================================================
// LEARNING PLAN
// =====================================================================
function SettingsLearning() {
  const { level, setLevel } = useApp()
  useIcons([level])
  const [exam, setExam] = useState('goethe')
  const [date, setDate] = useState('2026-09-12')
  const daysLeft = (() => {
    const ms = new Date(date + 'T00:00:00') - new Date('2026-07-24T00:00:00')
    return Math.max(0, Math.round(ms / 86400000))
  })()

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead title="Your exam" desc="We shape your daily plan around this." />
        <div className="flex flex-col gap-5">
          <div>
            <SetLabel>Exam board</SetLabel>
            <SetChoice
              value={exam}
              onChange={setExam}
              options={[
                { id: 'goethe', label: 'Goethe-Institut', desc: 'Most widely recognised' },
                { id: 'cambridge', label: 'Cambridge', disabled: true },
                { id: 'ielts', label: 'IELTS', disabled: true },
              ]}
            />
          </div>
          <div>
            <SetLabel>Target level</SetLabel>
            <SetChoice
              cols="grid-cols-2 sm:grid-cols-4 max-w-xl"
              value={level}
              onChange={setLevel}
              options={[
                { id: 'A2', label: 'A2', desc: 'Elementary' },
                { id: 'B1', label: 'B1', disabled: true },
                { id: 'B2', label: 'B2', disabled: true },
                { id: 'C1', label: 'C1', disabled: true },
              ]}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <SetLabel htmlFor="exam_date">Exam date</SetLabel>
              <label className="input input-bordered flex items-center gap-2 w-full rounded-field">
                <Ic name="calendar" size={17} cls="opacity-60 shrink-0" />
                <input
                  id="exam_date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="grow bg-transparent outline-none min-w-0"
                />
              </label>
            </div>
            <div>
              <SetLabel>Time remaining</SetLabel>
              <div className="input input-bordered flex items-center gap-2 w-full rounded-field bg-primary/5 border-primary/20">
                <Ic name="hourglass" size={17} cls="text-primary shrink-0" />
                <span className="grow font-semibold text-primary">{daysLeft} days</span>
              </div>
            </div>
          </div>
        </div>
        <SetSave />
      </SetCard>
    </div>
  )
}

// =====================================================================
// AI PROVIDER — bring your own key
// =====================================================================
const AI_PROVIDERS = [
  {
    id: 'openai',
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
    hint: 'platform.openai.com',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    models: [
      'openai/gpt-4o-mini',
      'anthropic/claude-sonnet-4',
      'google/gemini-2.5-flash',
      'meta-llama/llama-3.1-70b',
    ],
    hint: 'openrouter.ai/keys',
  },
]

function SettingsAI() {
  const { go } = useApp()
  useIcons([])
  const [provider, setProvider] = useState('openai')
  const [key, setKey] = useState('sk-proj-••••••••••••••••••••3f9a')
  const [model, setModel] = useState('gpt-4o-mini')
  const [test, setTest] = useState('idle')
  const current = AI_PROVIDERS.find(p => p.id === provider)

  useEffect(() => {
    setModel(current.models[0])
    setTest('idle')
  }, [provider])

  const runTest = () => {
    setTest('busy')
    setTimeout(() => setTest(key.trim() ? 'ok' : 'fail'), 1000)
  }

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead
          title="AI provider"
          desc="Exam.one uses your own API key. Nothing is sent anywhere else, and you only pay your provider."
        />

        <div className="flex flex-col gap-5">
          <div>
            <SetLabel>Provider</SetLabel>
            <SetChoice
              cols="grid-cols-2 max-w-sm"
              value={provider}
              onChange={setProvider}
              options={AI_PROVIDERS.map(p => ({ id: p.id, label: p.label }))}
            />
          </div>

          <div>
            <SetLabel htmlFor="ai_key">API key</SetLabel>
            <label className="input input-bordered flex items-center gap-2 w-full rounded-field">
              <Ic name="key-round" size={17} cls="opacity-60 shrink-0" />
              <input
                id="ai_key"
                type="password"
                value={key}
                onChange={e => {
                  setKey(e.target.value)
                  setTest('idle')
                }}
                placeholder="Paste your key"
                className="grow bg-transparent outline-none min-w-0 font-mono text-sm"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <button
                onClick={runTest}
                disabled={test === 'busy'}
                className="btn btn-xs btn-outline rounded-field gap-1.5"
              >
                {test === 'busy' ? (
                  <>
                    <span className="loading loading-spinner loading-xs" /> Testing…
                  </>
                ) : (
                  'Test connection'
                )}
              </button>
              {test === 'ok' && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <Ic name="check-circle-2" size={14} /> Connected · responded in 620 ms
                </span>
              )}
              {test === 'fail' && (
                <span className="flex items-center gap-1.5 text-sm text-error">
                  <Ic name="alert-circle" size={14} /> No key provided
                </span>
              )}
              <span className="text-xs text-base-content/50 ml-auto">Key from {current.hint}</span>
            </div>
          </div>

          <div>
            <SetLabel htmlFor="ai_model">Model</SetLabel>
            <select
              id="ai_model"
              value={model}
              onChange={e => setModel(e.target.value)}
              className="select select-bordered rounded-field w-full max-w-sm"
            >
              {current.models.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <p className="text-xs text-base-content/55 mt-2">
              Used for generating exercises and reviewing your writing and speaking.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-field bg-base-200 p-3.5 text-sm text-base-content/70">
            <Ic name="file-text" size={15} cls="mt-0.5 shrink-0 opacity-60" />
            <span style={{ textWrap: 'pretty' }}>
              AI prompts can be found and edited in the root folder under the directory{' '}
              <code className="font-mono text-xs text-base-content/85">data/prompts/german/…</code>
            </span>
          </div>
        </div>
        <SetSave label="Save provider" />
      </SetCard>
    </div>
  )
}

// =====================================================================
// NOTIFICATIONS
// =====================================================================
function SettingsNotify() {
  useIcons([])
  const [email, setEmail] = useState({
    reminders: true,
    weekly: true,
    results: true,
    product: false,
  })
  const [push, setPush] = useState({ daily: true, streak: true, mock: false })
  const [time, setTime] = useState('19:00')
  const [quiet, setQuiet] = useState('22:00 – 07:00')
  const set = (fn, k) => v => fn(s => ({ ...s, [k]: v }))

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead
          title="Study reminders"
          desc="A nudge at the right time is the difference between a streak and a gap."
        />
        <div className="flex flex-col gap-1 divide-y divide-base-300">
          <SetToggle
            checked={push.daily}
            onChange={set(setPush, 'daily')}
            label="Daily practice reminder"
            desc="One notification on your study days."
          />
          <SetToggle
            checked={push.streak}
            onChange={set(setPush, 'streak')}
            label="Streak about to break"
            desc="Only if you haven’t practised by the evening."
          />
          <SetToggle
            checked={push.mock}
            onChange={set(setPush, 'mock')}
            label="Mock exam suggestions"
            desc="When you’re ready for a full-length attempt."
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-base-300">
          <div>
            <SetLabel htmlFor="rem_time">Reminder time</SetLabel>
            <label className="input input-bordered flex items-center gap-2 w-full rounded-field">
              <Ic name="clock" size={17} cls="opacity-60 shrink-0" />
              <input
                id="rem_time"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="grow bg-transparent outline-none min-w-0"
              />
            </label>
          </div>
          <div>
            <SetLabel htmlFor="quiet">Quiet hours</SetLabel>
            <select
              id="quiet"
              value={quiet}
              onChange={e => setQuiet(e.target.value)}
              className="select select-bordered rounded-field w-full"
            >
              <option>None</option>
              <option>22:00 – 07:00</option>
              <option>23:00 – 08:00</option>
              <option>21:00 – 09:00</option>
            </select>
          </div>
        </div>
        <SetSave label="Save reminders" />
      </SetCard>

      <SetCard className="p-6">
        <SetHead title="Email" desc="Sent to lena.bauer@email.de." />
        <div className="flex flex-col gap-1 divide-y divide-base-300">
          <SetToggle
            checked={email.results}
            onChange={set(setEmail, 'results')}
            label="Exercise reviews"
            desc="When AI feedback on a writing or speaking attempt is ready."
          />
          <SetToggle
            checked={email.weekly}
            onChange={set(setEmail, 'weekly')}
            label="Weekly progress summary"
            desc="What improved, and what to work on next."
          />
          <SetToggle
            checked={email.reminders}
            onChange={set(setEmail, 'reminders')}
            label="Exam countdown"
            desc="At 30, 14 and 3 days before your exam date."
          />
          <SetToggle
            checked={email.product}
            onChange={set(setEmail, 'product')}
            label="Product news"
            desc="New exercise types and features. Rare."
          />
        </div>
        <SetSave label="Save email settings" />
      </SetCard>
    </div>
  )
}

// =====================================================================
// APPEARANCE
// =====================================================================
function SettingsAppearance() {
  const { theme, setTheme, lang, setLang } = useApp()
  useIcons([theme, lang])

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead title="Appearance" desc="Applies straight away — no saving needed." />
        <div className="flex flex-col gap-5">
          <div>
            <SetLabel>Theme</SetLabel>
            <SetChoice
              cols="grid-cols-2 max-w-sm"
              value={theme}
              onChange={setTheme}
              options={[
                { id: 'light', label: 'Light', icon: 'sun', desc: 'Default' },
                { id: 'cupcake', label: 'Cupcake', icon: 'cake', desc: 'Warmer, softer' },
              ]}
            />
          </div>
        </div>
      </SetCard>

      <SetCard className="p-6">
        <SetHead title="Language" desc="The interface language. Exercises stay in German." />
        <SetChoice
          cols="grid-cols-1 sm:grid-cols-3"
          value={lang}
          onChange={setLang}
          options={[
            { id: 'en', label: 'English', desc: 'Interface language' },
            { id: 'de', label: 'Deutsch', desc: 'Immersive' },
            { id: 'ru', label: 'Русский', desc: 'Interface language' },
          ]}
        />
        <div className="mt-4 flex items-start gap-2.5 rounded-field bg-base-200 p-3.5 text-sm text-base-content/70">
          <Ic name="languages" size={15} cls="mt-0.5 shrink-0 opacity-60" />
          <span style={{ textWrap: 'pretty' }}>
            Task instructions inside exercises always stay in German, the way they appear in the
            real exam.
          </span>
        </div>
      </SetCard>
    </div>
  )
}

// =====================================================================
// PLAN & BILLING (light — current plan, usage, link out)
// =====================================================================
function SettingsPlan() {
  const { plan, setPlan } = useApp()
  useIcons([plan])
  const current = PLANS.find(p => p.id === plan) || PLANS[0]
  const isPro = plan === 'pro'

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead title="Your plan" />
        <div className="rounded-box bg-base-200 border border-base-300 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-display text-2xl font-bold">{current.name}</span>
                <span className={`badge badge-sm ${isPro ? 'badge-primary' : 'badge-ghost'}`}>
                  Active
                </span>
              </div>
              <p className="text-sm text-base-content/65 mt-1">{current.blurb}</p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold leading-none">{current.price}</div>
              <div className="text-xs text-base-content/55 mt-1">{current.period}</div>
            </div>
          </div>
          {isPro && (
            <p className="text-sm text-base-content/60 mt-4 pt-4 border-t border-base-300">
              Renews on 12 August 2026 · Visa ending 4242
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          {[
            ['AI reviews this month', isPro ? '38' : '4 / 5'],
            ['Mock exams', isPro ? 'Unlimited' : '1 per level'],
            ['Member since', 'January 2026'],
          ].map(([l, v]) => (
            <div key={l} className="rounded-field bg-base-100 border border-base-300 p-3.5">
              <div className="text-[11px] uppercase tracking-wider text-base-content/50">{l}</div>
              <div className="font-semibold text-sm mt-1">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-base-300">
          {isPro ? (
            <>
              <button className="btn btn-sm btn-outline rounded-field gap-1.5">
                Manage billing <Ic name="external-link" size={14} />
              </button>
              <button
                onClick={() => setPlan('free')}
                className="btn btn-sm btn-ghost rounded-field text-base-content/60"
              >
                Cancel subscription
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPlan('pro')}
                className="btn btn-sm btn-primary rounded-field gap-1.5"
              >
                <Ic name="arrow-up-circle" size={14} /> Upgrade to Pro
              </button>
              <span className="text-sm text-base-content/60">
                Unlimited AI review and the full mock-exam library.
              </span>
            </>
          )}
        </div>
      </SetCard>

      {isPro && (
        <SetCard className="p-6">
          <SetHead
            title="Invoices"
            action={
              <button className="btn btn-xs btn-ghost rounded-field gap-1.5">
                All invoices <Ic name="external-link" size={13} />
              </button>
            }
          />
          <div className="divide-y divide-base-300">
            {[
              ['12 Jul 2026', '€9.90'],
              ['12 Jun 2026', '€9.90'],
              ['12 May 2026', '€9.90'],
            ].map(([d, a]) => (
              <div key={d} className="flex items-center gap-3 py-3 text-sm">
                <Ic name="receipt" size={15} cls="text-base-content/40" />
                <span className="flex-1">Pro · monthly</span>
                <span className="text-base-content/55">{d}</span>
                <span className="font-mono w-16 text-right">{a}</span>
                <button
                  className="btn btn-xs btn-ghost rounded-field"
                  aria-label={`Download invoice ${d}`}
                >
                  <Ic name="download" size={13} />
                </button>
              </div>
            ))}
          </div>
        </SetCard>
      )}
    </div>
  )
}

Object.assign(window, {
  SettingsLearning,
  SettingsAI,
  SettingsNotify,
  SettingsAppearance,
  SettingsPlan,
  SetChoice,
  SetLabel,
  AI_PROVIDERS,
})
