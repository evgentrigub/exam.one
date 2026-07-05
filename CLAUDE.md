# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server at http://localhost:3000
pnpm build        # production build
pnpm preview      # preview production build
pnpm generate     # static site generation
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with autofix
pnpm format       # Prettier
pnpm type-check   # Nuxt type checking (vue-tsc)
```

Pre-commit hooks (via Husky + lint-staged) run ESLint and Prettier automatically on changed files.

Before finishing any change, run `pnpm lint` and `pnpm type-check`.

## Architecture Overview

**exam.one** is an open-source, self-hostable language exam prep platform. The current build (Phase 1) is a **frontend-only, offline-first** Nuxt 3 app — no required backend. Core flows (reading, writing, listening, speaking, mock exam, progress) work without network access. AI is an optional bring-your-own-key enhancement routed through thin Nuxt server routes at `server/api/`.

Supported exams: English / Cambridge A2, German / Goethe A2.

### Key directories

| Path | Purpose |
|------|---------|
| `pages/` | File-based routes. Skill index pages + dynamic exercise routes (`[exerciseId]`, `[quizId]`, `[topicId]`) |
| `components/{skill}/` | Feature components scoped per skill (reading, writing, listening, speaking) |
| `composables/` | Feature-scoped reactive logic (`use*` prefix). Own localStorage reads/writes. |
| `data/{skill}/` | Typed TS modules with bundled seed exercises and editable AI prompt templates |
| `stores/` | Pinia stores with persisted state |
| `server/api/` | Thin AI proxy endpoints (`review`, `generate-*`) |
| `utils/` | Shared types (`types.ts`), label maps (`labels.ts`), text analysis, uuid |
| `agent-os/` | Product context and canonical implementation standards — read before touching exam behavior or a standardized area |
| `assets/styles/main.css` | Global CSS; Tailwind v4 + daisyUI v5 single-pipeline entry |

### Data lifecycle (seed + merge)

1. On first client load, if localStorage is empty, seed from `data/{skill}/` defaults and persist
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
- Theme source of truth: `composables/useTheme.ts`

### Components

- Use `~/` import aliases, never `../` relative parent paths (ESLint-enforced)
- Card structure: `card bg-base-100 shadow h-full flex flex-col` with `card-body flex-1 overflow-y-auto min-h-0`; see `agent-os/standards/components/card-layout.md`
- Use `<ClientOnly>` or an `isClient` ref to guard hydration-sensitive renders

### Server / AI endpoints

Endpoints return `{ data: T | null, error: string | null }` with HTTP 200 for business failures. Use `throw createError(...)` only for infrastructure failures.

## AI Integration

- AI is **optional and provider-agnostic** (bring-your-own-key). `OPENAI_API_KEY` in `.env` enables AI features; missing key or upstream failure must degrade gracefully.
- Never import a provider SDK or call `/api/*` from core flows directly — route through composables that handle missing-key / error cases.
- Prompt templates live as typed seed data under `data/{skill}/a2/` and are user-editable.

## Design Reference

Run `npx --yes serve exam-one-design/project -l 5174` to preview the design locally.
