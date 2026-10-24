# JWT Secret

`JWT_SECRET` must be set, at least 32 characters, and must not be the example placeholder `change-me-in-production`. Nest fails closed at config load.

```ts
JWT_SECRET: requireJwtSecret(process.env['JWT_SECRET'])
```

- Generate with `openssl rand -base64 48`.
- Do not ship a Compose fallback. A missing `.env` value must fail boot.
- Rotating the secret invalidates every access JWT.
