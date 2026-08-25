# Optional Email Verification

SMTP is optional (`EMAIL_PROVIDER=none` | `smtp`). Local/self-host must work without mail.

- Email configured: register sets `emailVerified: false`, sends a 6-digit code (15m), session.requiresEmailVerification = true.
- Email off: `emailVerified: true` at register. Skip verify UI.
- Unverified users still get cookies. JwtAuthGuard does not check `emailVerified`. Frontend sends them to `/auth/verify`.
- Do not 403 practice APIs for unverified email.
- forgot-password / resend-verification always return a generic success message.
