# Core Practice & Exam Framework

Phase-aware rules for exam practice flows, seed content, and AI. Filename kept as `offline-first-core.md` for existing links; treat this as the **core practice** standard.

The product is a **generic, multi-language / multi-level exam framework** (Phase 1 shipping focus: German / Goethe A2 full skills + Goethe C1 Writing only; designed to extend to any language exam and any difficulty level). Keep core logic language-agnostic — never hard-code one language or provider into a core flow.

AI is an enhancement layer (exercise generation, review, grading), never a hard dependency of the core practice UI.

## Phase boundaries

### Phase 1 (complete) — frontend product

Every core practice flow works without a cloud AI provider once the user is in the app: reading, writing, listening, and speaking practice, mock exam mode, progress, drafts, and navigation. Phase 1 stored practice data in localStorage.

**Goethe A2 skill progress:** Reading, Writing, Listening, Speaking, and mock exam mode are complete and tested (see `agent-os/product/roadmap.md`).

### Phase 2 (current) — local self-hosted stack

**2.2 done:** the app is login-gated. Accounts, session, profile, and exam settings require the **local NestJS + PostgreSQL** stack.

**2.3 done:** skill catalogs, attempts, drafts, generation jobs, and mock exams are NestJS/PostgreSQL-backed after login. Theme, locale, listening playback volume/speed, and reading bookmarks may still use client storage (see `theme-catalog.md` and `localstorage-keys.md`).

AI remains optional and bring-your-own-key. Core practice still must not require a cloud SaaS or an LLM key. Bundled mock Set 1 remains usable without LLM/TTS.

## Exam references

Before changing exam-specific seed data, prompt templates, scoring, grading, or mock exam behavior, read the matching product reference:

- German / Goethe A2: `agent-os/product/german-exam-A2.md`
- German / Goethe C1 (Writing only in Phase 1): `agent-os/product/german-exam-C1.md`

Keep the shared data model and UI flow exam-agnostic, then express exam-specific behavior through typed metadata, task definitions, prompt templates, and review rules.

## Static seed data

Exercise payloads and mock Set 1 live in `@exam-one/exam-content` (`libraries/exam-content/`). Prisma `db:seed` upserts shared rows (`source=seed`, `userId` null). Frontend `apps/frontend/data/{skill}/` re-exports those seeds; **prompt templates** stay as typed modules under `apps/frontend/data/` until they are persisted.

```
libraries/exam-content/src/
  seeds/reading.ts
  seeds/writing.ts
  seeds/listening.ts
  seeds/speaking.ts
  seeds/mock-exam.ts
apps/frontend/data/
  reading/a2/exerciseGeneratorReadingA2.ts    # editable demo prompt template
  writing/a2/exerciseGeneratorWritingA2.ts
  writing/a2/reviewWritingA2.ts
  ...
```

- Seed modules export typed arrays / functions (never untyped JSON)
- Defaults are an **immutable seed**. Never mutate the default array at runtime
- Practice lists overlay user-generated rows on seeds by `externalId` and hide `examOnly` / `EXAM_ONLY` items
- The bundled prompt templates that generate / review / grade exercises are **editable demo templates**

## Seed + API hydrate (after 2.3)

Composables that own list data hydrate from NestJS after login:

1. Catalogs call `GET /api/v1/exercises?skill=...` (no client merge with bundled arrays)
2. Progress, drafts, generation jobs, and mock sets use the matching `/api/v1` endpoints
3. Writes go to the API only — do not keep a second localStorage source of truth

Why: app updates can ship new seed content via `db:seed` without wiping user-generated rows, and two accounts on one browser no longer share practice data.

## Rules

- **Phase 1:** a feature does not "require" the network if turning off AI still lets the user read, write, listen, speak, run a mock exam, and track progress
- **Phase 2+:** core flows may require the local API/DB; they must not require a cloud SaaS or external AI provider
- Do not import a provider SDK (e.g. `openai`) or call AI endpoints from core flows directly — route through a composable that degrades gracefully (see `server/ai-response-envelope.md`)
- AI is **bring-your-own-key**; supported providers today are **OpenAI** and **OpenRouter**. Core UI must render fine when every AI endpoint returns `{ data: null, error: ... }`
- New exam skills add typed seed modules in `@exam-one/exam-content` and a `db:seed` upsert; do not ship unseeded empty states
