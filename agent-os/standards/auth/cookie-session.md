# Cookie Session

Session is two HttpOnly cookies, not localStorage and not `Authorization` headers.

```
exam_one_access    JWT `{ sub: userId }`   15 minutes
exam_one_refresh   opaque hex, sha256 in AuthToken   30 days
```

- Flags: `httpOnly`, `sameSite: 'lax'`, `path: '/'`, `secure` from `AUTH_COOKIE_SECURE`.
- Store refresh/verify/reset secrets as hashes (`sha256`). Never persist the raw refresh token.
- CORS must use `credentials: true` and a concrete `FRONTEND_URL` origin.
- Do not rename these cookies (Swagger cookie auth + tests).
- Do not add a Bearer/localStorage session alongside this.
