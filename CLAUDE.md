# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev:infra    # start persistent PostgreSQL in Docker
pnpm dev          # start Nuxt :3000 and NestJS :3001 with hot reload
pnpm dev:frontend # start only Nuxt
pnpm dev:backend  # start only NestJS
pnpm build        # build all workspace projects
pnpm lint         # lint all workspace projects
pnpm lint:fix     # autofix all workspace projects
pnpm format       # Prettier
pnpm type-check   # type-check all workspace projects
pnpm test         # test all workspace projects
pnpm stack:up     # prepare speech models and start the complete Docker Compose stack
pnpm stack:down   # stop the complete stack without deleting named volumes
pnpm tts:up       # prepare and start only Kokoro TTS
pnpm stt:up       # prepare and start only Parakeet STT
pnpm auth:set-password --email you@example.com  # recover a local account password
```

Before finishing any change, run `pnpm lint` and `pnpm type-check`.

## Architecture Overview

**exam.one** is an open-source, self-hostable language exam prep platform organized as a pnpm monorepo. After Phase 2.3 the app is **login-gated** and practice data is API-backed: Nuxt talks to NestJS for accounts, session, profile, settings, skill catalogs, attempts, drafts, generation jobs, and mock exams. Theme, locale, and playback prefs stay in the browser. AI requests still use temporary Nuxt server routes until 2.4.

**Phase 1 is complete and tested:** German / Goethe A2 Reading, Writing, Listening, Speaking, and mock exam mode work end-to-end with optional AI enhancements. The mock exam includes bundled Set 1, generated immutable sets, resumable AI/TTS generation, automatic grading, detailed module reviews, and an optional aggregate AI overview.

**Phase 2 is current:** 2.1–2.3 are done (backend, auth, practice persistence). Next is 2.4 AI-to-Nest. Canonical status lives in `agent-os/product/roadmap.md` and `agent-os/product/index.md`.

### Key directories

| Path                          | Purpose                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/frontend/`              | Nuxt application: pages, components, composables, stores, data, utilities, and temporary Nitro AI endpoints  |
| `apps/backend/`               | Standalone NestJS API; local default port is 3001                                                            |
| `libraries/contracts/`        | Framework-neutral shared API contracts                                                                       |
| `libraries/database/`         | Prisma schema, migrations, and seed ownership                                                                |
| `libraries/exam-content/`     | Shared exam-content boundary                                                                                 |
| `libraries/nestjs-libraries/` | Shared NestJS infrastructure boundary                                                                        |
| `compose.yaml`                | Unified frontend, backend, PostgreSQL, Kokoro TTS, and Parakeet STT stack with persistent data/model storage |
| `agent-os/`                   | Product context and canonical implementation standards                                                       |

### Frontend data lifecycle (after 2.3)

1. Catalogs, progress, drafts, generation jobs, and mock sets hydrate from NestJS (`GET /api/v1/...`)
2. Shared Goethe A2 seeds are upserted by Prisma `db:seed` from `@exam-one/exam-content` (`source=seed`, `userId` null). User-generated rows overlay seeds by `externalId`

Theme, locale cookie, listening volume/speed, and reading bookmarks stay in the browser. Do not treat localStorage as the source of truth for practice data.

Prompt templates remain typed modules under `apps/frontend/data/{skill}/` until a later phase.

## Standards (read `agent-os/standards/` before editing)

### Storage guards

Every `localStorage`/`window`/`document` access must be inside a function guarded by `import.meta.client` (early-return on server) and wrapped in `try/catch`. Never read storage at module top level.

```ts
if (!import.meta.client) return []
try {
  return JSON.parse(localStorage.getItem(KEY) ?? '[]')
} catch {
  return []
}
```

### localStorage keys

Prefix remaining client keys with `exam-one:` in kebab-case. Practice catalogs, progress, drafts, and mock exams are API-backed. Allowed client keys: `exam-one:theme`, locale cookie `exam-one:locale`, listening playback volume/speed, reading saved-text bookmarks. Define as a `const KEY = 'exam-one:...'` at the top of the owning file.

### Styling

- Use **daisyUI semantic tokens only** (`bg-base-100`, `text-base-content`, `badge-primary`, etc.)
- **Never** use raw Tailwind color scales (`bg-blue-500`, `text-gray-700`)
- Themes switch via `useTheme().setTheme(...)` which writes `data-theme` on `<html>` — never toggle theme classes directly
- Theme source of truth: `apps/frontend/composables/useTheme.ts`

### Components

- Use `~/` import aliases, never `../` relative parent paths (ESLint-enforced)
- Card structure: `card bg-base-100 shadow h-full flex flex-col` with `card-body flex-1 overflow-y-auto min-h-0`; see `agent-os/standards/components/card-layout.md`
- Use `<ClientOnly>` or an `isClient` ref to guard hydration-sensitive renders

### Server / AI endpoints

Endpoints return `{ data: T | null, error: string | null }` with HTTP 200 for business failures. Use `throw createError(...)` only for infrastructure failures.

## AI Integration

- AI is **optional and provider-agnostic** (bring-your-own-key). Set `LLM_PROVIDER=openai` with `OPENAI_API_KEY`, or `LLM_PROVIDER=openrouter` with `OPENROUTER_API_KEY`; missing keys and upstream failures must degrade gracefully.
- Keep provider SDK/configuration logic behind server adapters. Frontend AI requests use the thin `/api/*` endpoints and feature-scoped orchestration, preferably through composables when the behavior is shared.
- Prompt templates currently live as typed seed data under `apps/frontend/data/{skill}/a2/` and are user-editable.
- Generated mock sets require successful LLM configuration/connection and Docker TTS preflight checks; bundled Set 1 must remain available without them.
- Writing and Speaking mock grading starts automatically. Persist full successful reviews with scores, and do not block completed results when optional aggregate AI review fails.

## Design Reference

Run `npx --yes serve exam-one-design/project -l 5174` to preview the design locally.
