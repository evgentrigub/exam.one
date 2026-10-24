# Security Headers

Nest applies Helmet on the API without a browser CSP. CORS stays a concrete `FRONTEND_URL` origin with credentials.

```ts
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  })
)
```

- Keep CORP `cross-origin`: the Nuxt origin is a different port than the API.
- Swagger is off when `NODE_ENV=production` unless `SWAGGER_ENABLED=true`.
- Nuxt CSP includes `frame-ancestors 'self'`. `'unsafe-inline'` for script/style stays as Vue/Nuxt residual.
