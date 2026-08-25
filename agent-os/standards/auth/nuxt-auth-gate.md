# Nuxt Auth Gate

`middleware/auth.global.ts` runs on the **client**. Session cookies live on the API host, so Nuxt SSR cannot know the user.

```
/auth/**     ssr: true
/**          ssr: false   // login-gated app
```

- Unauthenticated app routes → `/auth/login?redirect=<fullPath>`.
- `redirect` must be an in-app path (`safeAppPath`). Reject `//`, `/auth`, and non-`/` values.
- Signed-in users hitting `/auth/*` (except `/auth/verify`, `/auth/reset`, and `/auth/welcome`) go to `redirect` or `/dashboard`.
- Unsigned users hitting `/auth/welcome` go to `/auth/login`.
- Do not add a Nuxt server middleware that assumes it can read `exam_one_access`.
- Session-derived layout UI still needs `<ClientOnly>` — see `components/ssr-hydration-guard.md`.
