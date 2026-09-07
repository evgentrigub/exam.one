# Seeds vs Prompt Templates

Today:

- Types + seed arrays: `@exam-one/exam-content`
- Frontend catalog files (`apps/frontend/data/{skill}/exercise*.ts`) re-export those seeds only
- Generate / answer / review prompts: `@exam-one/exam-packs` under `data/src/packs/{packId}/`

```
libraries/exam-content/src/seeds/reading.ts
apps/frontend/data/reading/exerciseReading.ts     # re-export
data/src/packs/goethe-de-a2/prompts/reading.ts    # PromptSpec slots
```

- Do not duplicate seed arrays in the Nuxt app. Do not put catalog rows in Nest.
- Do not seed prompt templates into Postgres.
- Do not put prompt bodies in Nest. App code looks up `pack.prompt` via `findPrompt` / `assemble`.
