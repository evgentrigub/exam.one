# Seeds vs Prompt Templates

Today:

- Types + seed arrays: `@exam-one/exam-content`
- Frontend catalog files (`data/{skill}/exercise*.ts`) re-export those seeds only
- Generate/review prompt modules: `apps/frontend/data/{skill}/{level}/`

```
libraries/exam-content/src/seeds/reading.ts
apps/frontend/data/reading/exerciseReading.ts     # re-export
apps/frontend/data/reading/a2/exerciseGeneratorReadingA2.ts  # prompt (current home)
```

- Do not duplicate seed arrays in the Nuxt app. Do not put catalog rows in Nest.
- Do not seed prompt templates into Postgres.
- Intended home for prompts is a shared library (not Nuxt, not Nest). Do not move prompts into `apps/backend` while that refactor is pending.
