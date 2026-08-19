// =====================================================================
// SETTINGS — shell + Profile · Security · Connected accounts · Data
// Lives inside the Exam.one app shell as the `settings` route.
// =====================================================================

const {
  L,
  useState,
  useEffect,
  useRef,
  Ic,
  useIcons,
  useApp,
  AuthField,
  AuthPasswordField,
  authValidateEmail,
  authValidatePassword,
  authValidateRequired,
  authStrength,
} = window

const SETTINGS_NAV = [
  {
    group: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: 'user' },
      { id: 'plan', label: 'Plan & billing', icon: 'credit-card' },
    ],
  },
  {
    group: 'Studying',
    items: [
      { id: 'learning', label: 'Learning plan', icon: 'target' },
      { id: 'ai', label: 'AI provider', icon: 'sparkles' },
      { id: 'notify', label: 'Notifications', icon: 'bell' },
    ],
  },
  {
    group: 'Workspace',
    items: [
      { id: 'appearance', label: 'Appearance', icon: 'palette' },
      { id: 'data', label: 'Your data', icon: 'database' },
    ],
  },
]

// ---------- primitives ----------
const SetCard = ({ children, className = '' }) => (
  <div className={`rounded-box bg-base-100 border border-base-300 ${className}`}>{children}</div>
)

const SetHead = ({ title, desc, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div>
      <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>
      {desc && (
        <p className="text-sm text-base-content/60 mt-1" style={{ textWrap: 'pretty' }}>
          {desc}
        </p>
      )}
    </div>
    {action}
  </div>
)

const SetRow = ({ icon, iconCls = 'text-base-content/50', title, desc, control, danger }) => (
  <div className={`flex items-start gap-4 py-4 ${danger ? '' : ''}`}>
    {icon && (
      <div
        className={`grid size-10 place-items-center rounded-field shrink-0
        ${danger ? 'bg-error/10 text-error' : 'bg-base-200 ' + iconCls}`}
      >
        <Ic name={icon} size={18} />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <div className="font-medium leading-tight">{title}</div>
      {desc && (
        <div className="text-sm text-base-content/60 mt-1" style={{ textWrap: 'pretty' }}>
          {desc}
        </div>
      )}
    </div>
    {control && <div className="shrink-0 flex items-center gap-2">{control}</div>}
  </div>
)

const SetToggle = ({ checked, onChange, label, desc }) => (
  <label className="flex items-start gap-3 py-2.5 cursor-pointer">
    <input
      type="checkbox"
      className="toggle toggle-sm mt-0.5 shrink-0"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <div className="min-w-0">
      <div className="text-sm font-medium leading-tight">{label}</div>
      {desc && (
        <div className="text-xs text-base-content/60 mt-0.5" style={{ textWrap: 'pretty' }}>
          {desc}
        </div>
      )}
    </div>
  </label>
)

// transient "Saved" confirmation
function useFlash(ms = 2200) {
  const [on, setOn] = useState(false)
  const t = useRef(null)
  const flash = () => {
    setOn(true)
    clearTimeout(t.current)
    t.current = setTimeout(() => setOn(false), ms)
  }
  useEffect(() => () => clearTimeout(t.current), [])
  return [on, flash]
}

function SetSave({ onSave, label = 'Save changes', disabled }) {
  const [saved, flash] = useFlash()
  const [busy, setBusy] = useState(false)
  const click = () => {
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      flash()
      onSave && onSave()
    }, 700)
  }
  return (
    <div className="flex items-center justify-end gap-3 mt-5">
      {saved && (
        <span className="flex items-center gap-1.5 text-sm text-success">
          <Ic name="check-circle-2" size={15} /> Saved
        </span>
      )}
      <button
        onClick={click}
        disabled={disabled || busy}
        className="btn btn-sm btn-primary rounded-field gap-2"
      >
        {busy ? (
          <>
            <span className="loading loading-spinner loading-xs" /> Saving…
          </>
        ) : (
          label
        )}
      </button>
    </div>
  )
}

// =====================================================================
// PROFILE
// =====================================================================
function SettingsProfile() {
  useIcons([])
  const [name, setName] = useState('Lena Bauer')
  const [email, setEmail] = useState('lena.bauer@email.de')
  const [err, setErr] = useState({ name: '', email: '' })

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead
          title="Profile"
          desc="Your account details, sign-in security and connected apps."
        />

        <div className="grid md:grid-cols-2 gap-4">
          <AuthField
            id="set_name"
            label="Full name"
            icon="user"
            value={name}
            onChange={setName}
            error={err.name}
            onBlur={() => setErr(s => ({ ...s, name: authValidateRequired(name, 'Full name') }))}
          />
          <AuthField
            id="set_email"
            label={
              <span className="inline-flex items-center gap-1.5">
                Email <Ic name="badge-check" size={14} cls="text-success" title="Confirmed" />
              </span>
            }
            icon="mail"
            type="email"
            value={email}
            onChange={setEmail}
            error={err.email}
            onBlur={() => setErr(s => ({ ...s, email: authValidateEmail(email) }))}
          />
        </div>

        <SetSave />
      </SetCard>

      <SettingsSecurity />
      <SettingsConnected />
    </div>
  )
}

// =====================================================================
// SECURITY — password
// =====================================================================
function SettingsSecurity() {
  useIcons([])
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState({ cur: '', next: '', confirm: '' })
  const [saved, flash] = useFlash()
  const [busy, setBusy] = useState(false)
  const s = authStrength(next)

  const change = () => {
    const ce = !cur ? 'Enter your current password' : ''
    const ne = authValidatePassword(next)
    const fe = !confirm
      ? 'Confirm your new password'
      : confirm !== next
        ? 'Passwords don’t match'
        : ''
    setErr({ cur: ce, next: ne, confirm: fe })
    if (ce || ne || fe) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      flash()
      setCur('')
      setNext('')
      setConfirm('')
    }, 800)
  }

  return (
    <L.Fragment>
      <SetCard className="p-6">
        <SetHead
          title="Password"
          desc="Use at least 8 characters. A longer phrase beats a complicated word."
        />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <AuthPasswordField
              id="sec_cur"
              label="Current password"
              icon="key-round"
              autoComplete="current-password"
              placeholder="Your current password"
              value={cur}
              onChange={setCur}
              error={err.cur}
            />
          </div>
          <div>
            <AuthPasswordField
              id="sec_new"
              label="New password"
              icon="key-round"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={next}
              onChange={setNext}
              error={err.next}
              onBlur={() => setErr(x => ({ ...x, next: authValidatePassword(next) }))}
            />
            {next && !err.next && (
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < s ? ['bg-base-300', 'bg-error', 'bg-warning', 'bg-success'][s] : 'bg-base-300'}`}
                  />
                ))}
              </div>
            )}
          </div>
          <AuthPasswordField
            id="sec_conf"
            label="Confirm new password"
            icon="key-round"
            autoComplete="new-password"
            placeholder="Repeat new password"
            value={confirm}
            onChange={setConfirm}
            error={err.confirm}
          />
        </div>
        <div className="flex items-center justify-end gap-3 mt-5">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <Ic name="check-circle-2" size={15} /> Password updated
            </span>
          )}
          <button
            onClick={change}
            disabled={busy}
            className="btn btn-sm btn-primary rounded-field gap-2"
          >
            {busy ? (
              <>
                <span className="loading loading-spinner loading-xs" /> Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </div>
      </SetCard>
    </L.Fragment>
  )
}

// =====================================================================
// CONNECTED ACCOUNTS
// =====================================================================
function SettingsConnected() {
  useIcons([])
  const [google, setGoogle] = useState(true)
  return (
    <SetCard className="p-6">
      <SetHead title="Connected apps" desc="Sign in faster and keep your account recoverable." />
      <div className="divide-y divide-base-300">
        <div className="flex items-start gap-4 py-4">
          <div className="grid size-10 place-items-center rounded-field bg-base-200 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium leading-tight">Google</div>
            <div className="text-sm text-base-content/60 mt-1">
              {google ? 'Connected as lena.bauer@gmail.com' : 'Not connected'}
            </div>
          </div>
          <button
            onClick={() => setGoogle(g => !g)}
            className={`btn btn-sm rounded-field shrink-0 ${google ? 'btn-ghost text-error' : 'btn-primary'}`}
          >
            {google ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
      {google && (
        <div className="mt-4 flex items-start gap-2.5 rounded-field bg-base-200 p-3.5 text-sm text-base-content/70">
          <Ic name="info" size={15} cls="mt-0.5 shrink-0 opacity-60" />
          <span style={{ textWrap: 'pretty' }}>
            You have a password set, so disconnecting Google won’t lock you out.
          </span>
        </div>
      )}
    </SetCard>
  )
}

// =====================================================================
// DATA — export · import · delete
// =====================================================================
function SettingsData() {
  useIcons([])
  const [confirmText, setConfirmText] = useState('')
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [done, flash] = useFlash(3000)

  const doExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      flash()
    }, 1100)
  }

  return (
    <div className="flex flex-col gap-5">
      <SetCard className="p-6">
        <SetHead
          title="Your data"
          desc="Everything you’ve written, recorded and scored belongs to you."
        />
        <div className="divide-y divide-base-300">
          <SetRow
            icon="download"
            title="Export everything"
            desc="Attempts, drafts, scores and settings as a single JSON file."
            control={
              <button
                onClick={doExport}
                disabled={exporting}
                className="btn btn-sm btn-outline rounded-field gap-1.5"
              >
                {exporting ? (
                  <>
                    <span className="loading loading-spinner loading-xs" /> Preparing…
                  </>
                ) : done ? (
                  <>
                    <Ic name="check" size={14} /> Ready
                  </>
                ) : (
                  'Export'
                )}
              </button>
            }
          />
          <SetRow
            icon="upload"
            title="Import a backup"
            desc="Restore from a previous export. Existing progress is kept."
            control={<button className="btn btn-sm btn-outline rounded-field">Choose file</button>}
          />
        </div>
      </SetCard>

      <SetCard className="p-6 border-error/25">
        <SetHead
          title={<span className="text-error">Danger zone</span>}
          desc="These actions affect your whole account."
        />
        <div className="divide-y divide-base-300">
          <SetRow
            icon="pause-circle"
            danger
            title="Pause my account"
            desc="Hide your streak and pause all reminders. Come back whenever."
            control={<button className="btn btn-sm btn-outline rounded-field">Pause</button>}
          />
          <SetRow
            icon="trash-2"
            danger
            title="Delete my account"
            desc="Removes every attempt, recording and score. This cannot be undone."
            control={
              <button
                onClick={() => setOpen(o => !o)}
                className="btn btn-sm btn-error rounded-field"
              >
                Delete
              </button>
            }
          />
        </div>

        {open && (
          <div className="mt-5 rounded-box border border-error/30 bg-error/5 p-5">
            <p className="text-sm font-medium">
              Type <span className="font-mono text-error">DELETE</span> to confirm.
            </p>
            <p className="text-sm text-base-content/65 mt-1.5" style={{ textWrap: 'pretty' }}>
              You’ll lose 47 attempts, 6 drafts and a 12-day streak. Export first if you might come
              back.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                aria-label="Type DELETE to confirm"
                className="input input-bordered input-sm rounded-field font-mono w-40"
              />
              <button
                disabled={confirmText !== 'DELETE'}
                className="btn btn-sm btn-error rounded-field"
              >
                Permanently delete
              </button>
              <button
                onClick={() => {
                  setOpen(false)
                  setConfirmText('')
                }}
                className="btn btn-sm btn-ghost rounded-field"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SetCard>
    </div>
  )
}

// =====================================================================
// SHELL
// =====================================================================
function Settings() {
  const { route, go } = useApp()
  const section = route.section || 'profile'
  useIcons([section])

  const Body = (() => {
    switch (section) {
      case 'security':
        return <SettingsProfile />
      case 'connected':
        return <SettingsProfile />
      case 'learning':
        return <window.SettingsLearning />
      case 'ai':
        return <window.SettingsAI />
      case 'notify':
        return <window.SettingsNotify />
      case 'appearance':
        return <window.SettingsAppearance />
      case 'plan':
        return <window.SettingsPlan />
      case 'data':
        return <SettingsData />
      default:
        return <SettingsProfile />
    }
  })()

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <nav className="w-full lg:w-56 shrink-0 lg:sticky lg:top-6">
          {SETTINGS_NAV.map(g => (
            <div key={g.group} className="mb-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-3 mb-1.5">
                {g.group}
              </div>
              <div className="flex flex-col gap-0.5">
                {g.items.map(i => (
                  <button
                    key={i.id}
                    onClick={() => go({ name: 'settings', section: i.id })}
                    className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-field text-sm text-left transition-colors
                      ${section === i.id ? 'nav-item-active font-medium' : 'text-base-content/70 hover:bg-base-200'}`}
                  >
                    <Ic name={i.icon} size={15} />
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex-1 min-w-0 w-full">{Body}</div>
      </div>
    </div>
  )
}

Object.assign(window, {
  Settings,
  SETTINGS_NAV,
  SetCard,
  SetHead,
  SetRow,
  SetToggle,
  SetSave,
  useFlash,
  SettingsProfile,
  SettingsSecurity,
  SettingsConnected,
  SettingsData,
})
