// =====================================================================
// AUTHENTICATION — login · register · forgot · reset · verify
// Split-card layout: learner progress / exam context on the left,
// form on the right. Validation contract mirrors the Scalo
// useFormValidation composable (email regex, password min 8, required).
// =====================================================================

const { L, useState, useEffect, useRef, Ic, useIcons } = window

// ---------- validation ----------
const authValidateEmail = v =>
  !v
    ? 'Email is required'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? 'Please enter a valid email address'
      : ''
const authValidatePassword = v =>
  !v ? 'Password is required' : v.length < 8 ? 'Password must be at least 8 characters' : ''
const authValidateRequired = (v, field = 'This field') =>
  !v || !v.trim() ? `${field} is required` : ''

// password strength → 0..3
function authStrength(v) {
  if (!v) return 0
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/[0-9]|[^A-Za-z0-9]/.test(v)) s++
  return s
}

// ---------- field ----------
function AuthField({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  optional,
  trailing,
  autoComplete,
  maxLength,
  inputMode,
}) {
  return (
    <div className="form-control">
      <label className="label pb-1 flex items-center gap-1.5" htmlFor={id}>
        <span className="label-text text-sm font-medium">{label}</span>
        {optional && <span className="text-xs text-base-content/50">(optional)</span>}
      </label>
      <label
        className={`input input-bordered flex items-center gap-2 w-full rounded-field
        ${error ? 'border-error focus-within:border-error' : ''}`}
      >
        <Ic name={icon} size={18} cls="opacity-60 shrink-0" />
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          inputMode={inputMode}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="grow bg-transparent outline-none min-w-0"
        />
        {trailing}
      </label>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-error">
          <Ic name="alert-circle" size={13} />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

function AuthPasswordField(props) {
  const [show, setShow] = useState(false)
  return (
    <AuthField
      {...props}
      type={show ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="btn btn-xs btn-ghost btn-circle shrink-0"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <Ic name={show ? 'eye-off' : 'eye'} size={15} />
        </button>
      }
    />
  )
}

// ---------- submit button with loading ----------
function AuthSubmit({ loading, disabled, children, icon = 'arrow-right' }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="btn btn-primary w-full rounded-field gap-2"
    >
      {loading ? (
        <>
          <span className="loading loading-spinner loading-sm" /> Just a moment…
        </>
      ) : (
        <>
          {children}
          <Ic name={icon} size={17} />
        </>
      )}
    </button>
  )
}

// ---------- Google button ----------
function AuthGoogle({ label }) {
  return (
    <button type="button" className="btn btn-outline w-full rounded-field gap-2.5 font-medium">
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
        />
        <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
        />
      </svg>
      {label}
    </button>
  )
}

const AuthRule = ({ label }) => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-base-300" />
    <span className="text-xs text-base-content/50">{label}</span>
    <span className="h-px flex-1 bg-base-300" />
  </div>
)

// ---------- left panel: exam context, not a testimonial ----------
function AuthAside() {
  useIcons([])
  const skills = [
    { label: 'Reading', pct: 74, cls: 'bg-primary' },
    { label: 'Listening', pct: 61, cls: 'bg-info' },
    { label: 'Writing', pct: 48, cls: 'bg-success' },
    { label: 'Speaking', pct: 39, cls: 'bg-warning' },
  ]
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-10 bg-base-200 dot-pattern overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-info/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-2">
        <div className="w-8 h-8 rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold">
          E
        </div>
        <div className="font-display text-lg font-bold leading-none">
          Exam<span className="text-primary">.one</span>
        </div>
      </div>

      <div className="relative">
        <p
          className="font-display text-3xl font-bold leading-tight max-w-sm"
          style={{ textWrap: 'pretty' }}
        >
          Every exercise is one step closer to the certificate.
        </p>
        <p className="mt-3 text-base-content/65 max-w-sm" style={{ textWrap: 'pretty' }}>
          Practise the real Goethe format — reading, listening, writing and speaking — with feedback
          after every attempt.
        </p>

        <div className="mt-7 rounded-box bg-base-100 border border-base-300 p-5 shadow-sm max-w-sm">
          <div className="flex items-center gap-4">
            <div
              className="ring-prog"
              style={{ '--p': 68, '--c': 'var(--color-primary)', width: '56px', height: '56px' }}
            >
              <span>68%</span>
            </div>
            <div className="min-w-0">
              <div className="font-semibold leading-tight">Goethe A2</div>
              <div className="text-xs text-base-content/60 mt-0.5">
                Exam in 42 days · 12-day streak
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1 text-warning shrink-0">
              <Ic name="flame" size={16} />
              <span className="font-mono text-sm font-semibold">12</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {skills.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-base-content/70 w-16 shrink-0">{s.label}</span>
                <span className="h-1.5 flex-1 rounded-full bg-base-300 overflow-hidden">
                  <span
                    className={`block h-full rounded-full ${s.cls}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </span>
                <span className="font-mono text-[11px] text-base-content/55 w-8 text-right">
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="relative text-[11px] text-base-content/45 leading-relaxed max-w-sm">
        Prototype — any email works. Use password{' '}
        <code className="font-mono text-base-content/70">wrongpass</code> to see the failed sign-in
        and rate-limit states.
      </p>
    </div>
  )
}

// ---------- shell ----------
function AuthShell({ title, subtitle, children, footer, back }) {
  useIcons([title])
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 lg:p-8">
      <div className="card bg-base-100 shadow-xl w-full max-w-5xl overflow-hidden border border-base-300">
        <div className="grid lg:grid-cols-2 min-h-[640px]">
          <AuthAside />
          <div className="flex flex-col p-7 sm:p-10">
            <div className="flex items-center justify-between gap-3 lg:hidden mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold text-sm">
                  E
                </div>
                <div className="font-display font-bold leading-none">
                  Exam<span className="text-primary">.one</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">
                {back && (
                  <button
                    onClick={back.onClick}
                    className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary mb-5"
                  >
                    <Ic name="arrow-left" size={15} /> {back.label}
                  </button>
                )}
                <div className="mb-6">
                  <h1 className="font-display text-3xl font-bold leading-tight">{title}</h1>
                  {subtitle && (
                    <p className="text-base-content/60 mt-1.5" style={{ textWrap: 'pretty' }}>
                      {subtitle}
                    </p>
                  )}
                </div>
                {children}
              </div>
            </div>
            {footer && (
              <div className="pt-6 text-center text-sm text-base-content/60">{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const AuthLink = ({ children, onClick }) => (
  <button type="button" onClick={onClick} className="font-semibold text-primary hover:underline">
    {children}
  </button>
)

// =====================================================================
// SCREENS
// =====================================================================

function AuthLogin({ go, onSignedIn, prefill }) {
  const [email, setEmail] = useState(prefill || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState({ email: '', password: '' })
  const [formErr, setFormErr] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockFor, setLockFor] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lockFor <= 0) return
    const t = setTimeout(() => setLockFor(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [lockFor])

  const locked = lockFor > 0

  const submit = e => {
    e.preventDefault()
    const ee = authValidateEmail(email)
    const pe = authValidatePassword(password)
    setErr({ email: ee, password: pe })
    if (ee || pe || locked) return
    setFormErr('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (password.toLowerCase().startsWith('wrong')) {
        const n = attempts + 1
        setAttempts(n)
        if (n >= 3) {
          setLockFor(30)
          setFormErr('')
        } else
          setFormErr(
            'That email and password don’t match. ' +
              (3 - n) +
              ' attempt' +
              (3 - n === 1 ? '' : 's') +
              ' left before a short pause.'
          )
        return
      }
      onSignedIn()
    }, 900)
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off — your streak is still going."
      footer={
        <>
          New to Exam.one? <AuthLink onClick={() => go('register')}>Create an account</AuthLink>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        {locked && (
          <div className="alert border border-warning/25 bg-warning/10 rounded-box">
            <Ic name="clock" size={17} cls="text-warning shrink-0" />
            <span className="text-sm">
              Too many attempts. Try again in{' '}
              <span className="font-mono font-semibold">{lockFor}s</span>.
            </span>
          </div>
        )}
        {formErr && !locked && (
          <div className="alert border border-error/25 bg-error/10 rounded-box">
            <Ic name="alert-triangle" size={17} cls="text-error shrink-0" />
            <span className="text-sm">{formErr}</span>
          </div>
        )}

        <AuthField
          id="login_email"
          label="Email"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="you@email.de"
          value={email}
          onChange={setEmail}
          error={err.email}
          onBlur={() => setErr(s => ({ ...s, email: authValidateEmail(email) }))}
        />

        <div>
          <AuthPasswordField
            id="login_password"
            label="Password"
            icon="key-round"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={setPassword}
            error={err.password}
            onBlur={() => setErr(s => ({ ...s, password: authValidatePassword(password) }))}
          />
          <div className="flex items-center justify-between mt-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span className="text-sm text-base-content/70">Keep me signed in</span>
            </label>
            <button
              type="button"
              onClick={() => go('forgot')}
              className="text-sm text-base-content/60 hover:text-primary"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <AuthSubmit loading={loading} disabled={locked}>
          Sign in
        </AuthSubmit>
        <AuthRule label="or" />
        <AuthGoogle label="Continue with Google" />
      </form>
    </AuthShell>
  )
}

function AuthRegister({ go, onRegistered }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [err, setErr] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const s = authStrength(password)
  const strengthLabel = ['Too short', 'Weak', 'Good', 'Strong'][s]
  const strengthCls = ['bg-base-300', 'bg-error', 'bg-warning', 'bg-success'][s]

  const valid = name && email && password && agree && !err.name && !err.email && !err.password

  const submit = e => {
    e.preventDefault()
    const ne = authValidateRequired(name, 'Your name')
    const ee = authValidateEmail(email)
    const pe = authValidatePassword(password)
    setErr({ name: ne, email: ee, password: pe })
    if (ne || ee || pe || !agree) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onRegistered(email)
    }, 950)
  }

  return (
    <AuthShell
      title="Start preparing"
      subtitle="Free to begin. No card, no commitment — just the exam format."
      footer={
        <>
          Already have an account? <AuthLink onClick={() => go('login')}>Sign in</AuthLink>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <AuthField
          id="reg_name"
          label="Your name"
          icon="user"
          autoComplete="name"
          placeholder="Lena Bauer"
          value={name}
          onChange={setName}
          error={err.name}
          onBlur={() => setErr(s => ({ ...s, name: authValidateRequired(name, 'Your name') }))}
        />

        <AuthField
          id="reg_email"
          label="Email"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="you@email.de"
          value={email}
          onChange={setEmail}
          error={err.email}
          onBlur={() => setErr(s => ({ ...s, email: authValidateEmail(email) }))}
        />

        <div>
          <AuthPasswordField
            id="reg_password"
            label="Password"
            icon="key-round"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            error={err.password}
            onBlur={() => setErr(s => ({ ...s, password: authValidatePassword(password) }))}
          />
          {password && !err.password && (
            <div className="flex items-center gap-2.5 mt-2">
              <span className="flex gap-1 flex-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < s ? strengthCls : 'bg-base-300'}`}
                  />
                ))}
              </span>
              <span className="text-xs text-base-content/60 w-14 text-right">{strengthLabel}</span>
            </div>
          )}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary mt-0.5"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
          />
          <span className="text-sm text-base-content/70" style={{ textWrap: 'pretty' }}>
            I agree to the{' '}
            <a href="#terms" className="font-medium text-primary">
              Terms
            </a>{' '}
            and{' '}
            <a href="#privacy" className="font-medium text-primary">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <AuthSubmit loading={loading} disabled={!valid}>
          Create account
        </AuthSubmit>
        <AuthRule label="or" />
        <AuthGoogle label="Sign up with Google" />
      </form>
    </AuthShell>
  )
}

function AuthForgot({ go, onSent }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = e => {
    e.preventDefault()
    const ee = authValidateEmail(email)
    setError(ee)
    if (ee) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSent(email)
    }, 900)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Tell us your email and we’ll send a link to set a new one."
      back={{ label: 'Back to sign in', onClick: () => go('login') }}
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <AuthField
          id="fp_email"
          label="Email"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="you@email.de"
          value={email}
          onChange={setEmail}
          error={error}
          onBlur={() => setError(authValidateEmail(email))}
        />
        <AuthSubmit loading={loading}>Send reset link</AuthSubmit>
      </form>
    </AuthShell>
  )
}

function AuthSent({ go, email, onOpenLink }) {
  useIcons([])
  return (
    <AuthShell
      title="Check your inbox"
      subtitle={
        <>
          We sent a reset link to <span className="font-medium text-base-content">{email}</span>. It
          expires in 30 minutes.
        </>
      }
      back={{ label: 'Back to sign in', onClick: () => go('login') }}
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-box bg-base-200 border border-base-300 p-5 flex items-start gap-3.5">
          <div className="grid size-10 place-items-center rounded-field bg-primary/10 text-primary shrink-0">
            <Ic name="mail-check" size={19} />
          </div>
          <div className="text-sm text-base-content/70" style={{ textWrap: 'pretty' }}>
            Nothing after a minute? Check spam, or make sure the address is right.
          </div>
        </div>
        <button onClick={onOpenLink} className="btn btn-primary w-full rounded-field gap-2">
          Open the reset link <Ic name="external-link" size={16} />
        </button>
        <p className="text-center text-sm text-base-content/60">
          Wrong address? <AuthLink onClick={() => go('forgot')}>Try another</AuthLink>
        </p>
      </div>
    </AuthShell>
  )
}

function AuthReset({ go, onReset }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const s = authStrength(password)

  const submit = e => {
    e.preventDefault()
    const pe = authValidatePassword(password)
    const ce = !confirm
      ? 'Please confirm your password'
      : confirm !== password
        ? 'Passwords don’t match'
        : ''
    setErr({ password: pe, confirm: ce })
    if (pe || ce) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onReset()
    }, 900)
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something you’ll remember — at least 8 characters."
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <div>
          <AuthPasswordField
            id="rp_new"
            label="New password"
            icon="key-round"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            error={err.password}
            onBlur={() => setErr(x => ({ ...x, password: authValidatePassword(password) }))}
          />
          {password && !err.password && (
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
          id="rp_confirm"
          label="Confirm new password"
          icon="key-round"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={setConfirm}
          error={err.confirm}
          onBlur={() =>
            setErr(x => ({
              ...x,
              confirm: !confirm
                ? 'Please confirm your password'
                : confirm !== password
                  ? 'Passwords don’t match'
                  : '',
            }))
          }
        />
        <AuthSubmit loading={loading} icon="check">
          Update password
        </AuthSubmit>
        <p className="text-center text-sm text-base-content/60">
          <AuthLink onClick={() => go('login')}>Back to sign in</AuthLink>
        </p>
      </form>
    </AuthShell>
  )
}

function AuthDone({ go, title, body, cta }) {
  useIcons([])
  return (
    <AuthShell title={title} subtitle={body}>
      <div className="flex flex-col gap-6">
        <div className="grid size-14 place-items-center rounded-box bg-success/10 text-success">
          <Ic name="check" size={26} />
        </div>
        <button onClick={cta.onClick} className="btn btn-primary w-full rounded-field gap-2">
          {cta.label}
          <Ic name="arrow-right" size={16} />
        </button>
      </div>
    </AuthShell>
  )
}

function AuthVerify({ email, onVerified, onSkip }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(0)
  const refs = useRef([])
  const code = digits.join('')

  useEffect(() => {
    if (resent <= 0) return
    const t = setTimeout(() => setResent(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resent])

  const setAt = (i, v) => {
    const clean = v.replace(/\D/g, '')
    if (!clean) {
      setDigits(d => d.map((x, ix) => (ix === i ? '' : x)))
      return
    }
    setError('')
    const chars = clean.split('')
    setDigits(d => {
      const next = [...d]
      for (let k = 0; k < chars.length && i + k < 6; k++) next[i + k] = chars[k]
      return next
    })
    const target = Math.min(i + chars.length, 5)
    refs.current[target]?.focus()
  }

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  const submit = e => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Enter all six digits')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (code === '000000') {
        setError('That code isn’t right. Check the latest email.')
        return
      }
      onVerified()
    }, 900)
  }

  return (
    <AuthShell
      title="Confirm your email"
      subtitle={
        <>
          We sent a six-digit code to <span className="font-medium text-base-content">{email}</span>
          .
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <div>
          <div className="flex gap-2 justify-between">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => (refs.current[i] = el)}
                value={d}
                inputMode="numeric"
                maxLength={6}
                onChange={e => setAt(i, e.target.value)}
                onKeyDown={e => onKey(i, e)}
                aria-label={`Digit ${i + 1}`}
                className={`w-full h-14 text-center font-mono text-xl font-semibold rounded-field bg-base-100
                  border outline-none transition-colors
                  ${error ? 'border-error' : 'border-base-300 focus:border-primary'}`}
              />
            ))}
          </div>
          {error && (
            <div className="flex items-center gap-1.5 mt-2 text-error">
              <Ic name="alert-circle" size={13} />
              <span className="text-xs">{error}</span>
            </div>
          )}
          <p className="text-xs text-base-content/50 mt-2">
            Prototype — any six digits work, except <code className="font-mono">000000</code>.
          </p>
        </div>

        <AuthSubmit loading={loading} disabled={code.length !== 6} icon="check">
          Confirm email
        </AuthSubmit>

        <div className="text-center text-sm text-base-content/60">
          {resent > 0 ? (
            <>
              Code sent. You can ask again in <span className="font-mono">{resent}s</span>.
            </>
          ) : (
            <>
              Didn’t get it? <AuthLink onClick={() => setResent(30)}>Send a new code</AuthLink>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-base-content/50 hover:text-base-content"
        >
          I’ll confirm later
        </button>
      </form>
    </AuthShell>
  )
}

// =====================================================================
// ROOT — owns the auth screen state
// =====================================================================
function AuthRoot({ onAuthed }) {
  const [screen, setScreen] = useState('login')
  const [email, setEmail] = useState('')
  const go = s => setScreen(s)

  switch (screen) {
    case 'register':
      return (
        <AuthRegister
          go={go}
          onRegistered={e => {
            setEmail(e)
            setScreen('verify')
          }}
        />
      )
    case 'verify':
      return (
        <AuthVerify
          email={email || 'you@email.de'}
          onVerified={() => setScreen('welcome')}
          onSkip={() => onAuthed()}
        />
      )
    case 'welcome':
      return (
        <AuthDone
          title="You’re all set"
          body="Your email is confirmed. Let’s find out where you stand and build a plan around your exam date."
          cta={{ label: 'Go to my dashboard', onClick: () => onAuthed() }}
        />
      )
    case 'forgot':
      return (
        <AuthForgot
          go={go}
          onSent={e => {
            setEmail(e)
            setScreen('sent')
          }}
        />
      )
    case 'sent':
      return <AuthSent go={go} email={email} onOpenLink={() => setScreen('reset')} />
    case 'reset':
      return <AuthReset go={go} onReset={() => setScreen('resetdone')} />
    case 'resetdone':
      return (
        <AuthDone
          title="Password updated"
          body="You can sign in with your new password now."
          cta={{
            label: 'Sign in',
            onClick: () => {
              setScreen('login')
            },
          }}
        />
      )
    default:
      return <AuthLogin go={go} prefill={email} onSignedIn={() => onAuthed()} />
  }
}

Object.assign(window, {
  AuthRoot,
  AuthShell,
  AuthField,
  AuthPasswordField,
  AuthSubmit,
  AuthGoogle,
  AuthRule,
  AuthLink,
  authValidateEmail,
  authValidatePassword,
  authValidateRequired,
  authStrength,
})
