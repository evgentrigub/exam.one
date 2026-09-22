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
pnpm stack:verify-models # fail if TTS/STT snapshots are missing
pnpm stack:seed-audio    # generate bundled listening WAVs if missing
pnpm stack:down   # stop the complete stack without deleting named volumes
pnpm tts:up       # prepare and start only Kokoro TTS
pnpm stt:up       # prepare and start only Parakeet STT
pnpm auth:set-password --email you@example.com  # recover a local account password
```

Before finishing any change, run `pnpm lint` and `pnpm type-check`.

## Architecture Overview

**exam.one** is an open-source, self-hostable language exam prep platform organized as a pnpm monorepo. The app is **login-gated**. After sign-in, practice data plus optional AI/TTS/STT are API-backed: Nuxt talks to NestJS for accounts, session, profile, settings, skill catalogs, attempts, drafts, generation jobs, mock exams, LLM generation/review, Kokoro TTS, and Parakeet/Whisper STT. Theme, locale, and playback prefs stay in the browser.

German / Goethe A2 Reading, Writing, Listening, Speaking, and mock exam mode work end-to-end with optional AI enhancements. The mock exam includes bundled Set 1, generated immutable sets, resumable AI/TTS generation, automatic grading, detailed module reviews, and an optional aggregate AI overview.

### Key directories

| Path                          | Purpose                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/frontend/`              | Nuxt application: pages, components, composables, stores, data, and utilities                                |
| `apps/backend/`               | Standalone NestJS API; local default port is 3001                                                            |
| `libraries/contracts/`        | Framework-neutral shared API contracts                                                                       |
| `libraries/database/`         | Prisma schema, migrations, and seed ownership                                                                |
| `data/`                       | `@exam-one/exam-packs`: exam structure, PromptSpecs, and optional bundled seeds (`src/packs/{packId}/`)       |
| `libraries/nestjs-libraries/` | Shared NestJS infrastructure boundary                                                                        |
| `compose.yaml`                | Unified frontend, backend, PostgreSQL, Kokoro TTS, and Parakeet STT stack with persistent data/model storage |
| `agent-os/standards/`         | Canonical implementation standards                                                                           |

### Frontend data lifecycle

1. Catalogs, progress, drafts, generation jobs, and mock sets hydrate from NestJS (`GET /api/v1/...`)
2. Shared Goethe A2 seeds are upserted by Prisma `db:seed` from `@exam-one/exam-packs` (`source=seed`, `userId` null, `packId` set). User-generated rows overlay seeds by `(packId, externalId)`

Theme, locale cookie, listening volume/speed, and reading bookmarks stay in the browser. Do not treat localStorage as the source of truth for practice data.

Prompt templates remain typed `PromptSpec` modules under `data/src/packs/{packId}/`.

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

Endpoints return `{ data: T | null, error: string | null }` with HTTP 200 for business failures. Invalid body is HTTP 400; missing session is HTTP 401.

## AI Integration

- AI is **optional and provider-agnostic** (bring-your-own-key). Set `LLM_PROVIDER=openai` with `OPENAI_API_KEY`, or `LLM_PROVIDER=openrouter` with `OPENROUTER_API_KEY`; missing keys and upstream failures must degrade gracefully.
- Keep provider SDK/configuration logic behind NestJS adapters (`apps/backend/src/ai`, `speech`). Frontend AI requests use `aiFetch` to `/api/v1/llm|tts|stt` and feature-scoped orchestration, preferably through composables when the behavior is shared.
- Prompt templates currently live as typed `PromptSpec` modules under `data/src/packs/{packId}/`. Generation always uses pack defaults (prompt overrides are unmounted).
- Generated mock sets require successful LLM configuration/connection and Docker TTS preflight checks; bundled Set 1 must remain available without them.
- Writing and Speaking mock grading starts automatically. Persist full successful reviews with scores, and do not block completed results when optional aggregate AI review fails.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
