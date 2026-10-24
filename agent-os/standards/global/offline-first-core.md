# Core Practice & Exam Framework

Rules for exam practice flows, seed content, and AI. Filename kept as `offline-first-core.md` for existing links; treat this as the **core practice** standard.

The product is a **generic, multi-language / multi-level exam framework**. Live practice content is German / Goethe A2 across all four skills (the `goethe-de-a2` pack). Keep core logic language-agnostic — never hard-code one language or provider into a core flow.

AI is an enhancement layer (exercise generation, review, grading), never a hard dependency of the core practice UI.

## Current architecture

Every core practice flow works without a cloud AI provider once the user is in the app: reading, writing, listening, and speaking practice, mock exam mode, progress, drafts, and navigation.

The app is login-gated. Accounts, session, profile, and exam settings require the **local NestJS + PostgreSQL** stack.

Skill catalogs, attempts, drafts, generation jobs, and mock exams are NestJS/PostgreSQL-backed after login. Theme, locale, listening playback volume/speed, and reading bookmarks may still use client storage (see `theme-catalog.md` and `localstorage-keys.md`).

Optional per-user BYOK LLM, Kokoro TTS, and Parakeet STT proxy through NestJS. Core practice still must not require a cloud SaaS or an LLM key. Bundled mock Set 1 remains usable without LLM/TTS.

One root Docker Compose file packages frontend, backend, Postgres, Kokoro, and Parakeet. `pnpm stack:up` migrates and seeds Postgres in the backend image.

Root README + `.env.example` document first-user setup, optional LLM keys, speech sidecars, and named-volume backup/restore.

## Exam-specific behavior

Keep the shared data model and UI flow exam-agnostic, then express exam-specific behavior through typed metadata, task definitions, prompt templates, and review rules in `@exam-one/exam-packs` (`data/src/packs/`).

## Static seed data

Exercise payloads and mock Set 1 live in the owning pack under `@exam-one/exam-packs` (`data/src/packs/{packId}/content/`). Prisma `db:seed` upserts shared rows (`source=seed`, `userId` null, `packId` set). Frontend `apps/frontend/data/{skill}/` re-exports those seeds; **prompt templates** live as `PromptSpec` modules under `data/src/packs/{packId}/`.

```
data/src/packs/goethe-de-a2/
  pack.ts
  content/seeds/reading.ts
  content/seeds/writing.ts
  content/seeds/listening.ts
  content/seeds/speaking.ts
  content/seeds/mock-exam.ts
  prompts/reading.ts
  prompts/writing.ts
  ...
```

- Seed modules export typed arrays / functions (never untyped JSON)
- Defaults are an **immutable seed**. Never mutate the default array at runtime
- Practice lists overlay user-generated rows on seeds by `externalId` and hide `examOnly` / `EXAM_ONLY` items
- The bundled prompt templates that generate / review / grade exercises live as pack `PromptSpec`s under `data/src/packs/`

## Seed + API hydrate

Composables that own list data hydrate from NestJS after login:

1. Catalogs call `GET /api/v1/exercises?skill=...` (no client merge with bundled arrays)
2. Progress, drafts, generation jobs, and mock sets use the matching `/api/v1` endpoints
3. Writes go to the API only — do not keep a second localStorage source of truth

Why: app updates can ship new seed content via `db:seed` without wiping user-generated rows, and two accounts on one browser no longer share practice data.

## Rules

- Core practice may require the local API/DB after login; it must not require a cloud SaaS or external AI provider
- Turning off AI must still let the user read, write, listen, speak, run a mock exam, and track progress
- Do not import a provider SDK (e.g. `openai`) or call AI endpoints from core flows directly — route through a composable that degrades gracefully (see `server/ai-response-envelope.md`)
- AI is **bring-your-own-key**; supported providers today are **OpenAI** and **OpenRouter**. Core UI must render fine when every AI endpoint returns `{ data: null, error: ... }`
- New exam skills add typed seed modules under that pack's `content/` folder and a `db:seed` upsert; do not ship unseeded empty states
