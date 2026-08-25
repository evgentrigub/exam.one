# apiFetch Credentials and Refresh

REST calls go through `apiFetch` with `credentials: 'include'`. Access JWT lasts 15 minutes; the client rotates it via the refresh cookie.

```ts
// 401 on a non-auth path → one in-flight POST /auth/refresh → retry once
```

- Do not send `Authorization` headers. Cookies are the session.
- Concurrent 401s share `refreshInFlight` so two refreshes do not race.
- `SKIP_REFRESH_PATHS`: login, register, refresh, logout, forgot-password, reset-password, verify-email, resend-verification.
- AI routes use `aiFetch` (same cookies, different envelope). Do not mix the two helpers.
- After a failed refresh, treat the user as signed out (middleware sends them to login).
