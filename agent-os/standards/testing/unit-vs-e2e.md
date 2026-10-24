# Unit vs E2E

`pnpm test` runs Jest unit specs. They must not need Postgres.

```
pnpm test              # *.spec.ts, mocked Prisma
pnpm --filter exam-one-backend test:e2e   # test/*.e2e-spec.ts, real DB
```

- E2E uses `configureApp`, supertest `request.agent` (cookies), and a real `DATABASE_URL`.
- Clean up rows created in e2e (`deleteMany` by test email).
- E2E today covers auth + health. Add more only for cross-layer HTTP/cookie contracts — do not convert every service spec to e2e.
- Override optional providers (LLM) in e2e so missing keys do not fail the suite.
