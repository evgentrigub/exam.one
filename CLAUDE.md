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
```

Before finishing any change, run `pnpm lint` and `pnpm type-check`.

## Architecture Overview

**exam.one** is an open-source, self-hostable language exam prep platform organized as a pnpm monorepo. The offline-first Nuxt 3 frontend remains usable without the standalone NestJS backend. The backend, shared libraries, Prisma boundary, and Docker Compose infrastructure establish the Phase 2 architecture while AI requests still use temporary Nuxt server routes.

**Phase 1 (current):** frontend-only MVP for German / Goethe A2 (all skills) + Goethe C1 Writing. Reading / Writing / Listening iteration 1 are done; **Speaking is the next skill** (see `agent-os/product/roadmap.md`). NestJS/Postgres exist as scaffold only until Phase 2 cutover. English / Cambridge is out of scope for Phase 1.

### Key directories

| Path | Purpose |
|------|---------|
| `apps/frontend/` | Nuxt application: pages, components, composables, stores, data, utilities, and temporary Nitro AI endpoints |
| `apps/backend/` | Standalone NestJS API; local default port is 3001 |
| `libraries/contracts/` | Framework-neutral shared API contracts |
| `libraries/database/` | Prisma schema, migrations, and seed ownership |
| `libraries/exam-content/` | Shared exam-content boundary |
| `libraries/nestjs-libraries/` | Shared NestJS infrastructure boundary |
| `compose.dev.yaml` | PostgreSQL-only development infrastructure with a persistent named volume |
| `compose.yaml` | Fully containerized frontend/backend/database stack |
| `agent-os/` | Product context and canonical implementation standards |

### Data lifecycle (seed + merge)

1. On first client load, if localStorage is empty, seed from `apps/frontend/data/{skill}/` defaults and persist
2. On subsequent loads, merge: `items = defaults ∪ stored.filter(x => !isDefault(x.id))`
3. Only non-default (user/AI-generated) items are persisted to localStorage

This ensures app updates can ship new seed content without wiping user data.

## Standards (read `agent-os/standards/` before editing)

### Storage guards

Every `localStorage`/`window`/`document` access must be inside a function guarded by `import.meta.client` (early-return on server) and wrapped in `try/catch`. Never read storage at module top level.

```ts
if (!import.meta.client) return []
try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
```

### localStorage keys

Prefix all keys with `exam-one:` in kebab-case. Define as a `const KEY = 'exam-one:...'` at the top of the owning file.

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

- AI is **optional and provider-agnostic** (bring-your-own-key). `OPENAI_API_KEY` in `.env` enables AI features; missing key or upstream failure must degrade gracefully.
- Never import a provider SDK or call `/api/*` from core flows directly — route through composables that handle missing-key / error cases.
- Prompt templates currently live as typed seed data under `apps/frontend/data/{skill}/a2/` and are user-editable.

## Design Reference

Run `npx --yes serve exam-one-design/project -l 5174` to preview the design locally.
