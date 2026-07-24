# AGENTS.md

This file is the working guide for coding agents in this repository. It should be read before making changes.

## Project Summary

- Product: `exam.one`, an open-source, self-hostable language exam prep platform — a generic, multi-language framework
- **Phase 1 (current) shipping focus:** German / Goethe A2 (Reading, Writing, Listening, Speaking + mock exam) and Goethe C1 Writing only. English / Cambridge is out of scope for Phase 1.
- Current app shape: pnpm monorepo with a Nuxt 3 offline-first frontend (Phase 1 product surface), plus NestJS / Prisma / Compose scaffold ahead of Phase 2 persistence cutover
- Primary features: reading, writing, listening, and speaking practice; mock exam mode; editable demo prompt templates; progress tracking
- AI usage: optional, bring-your-own-key and provider-agnostic enhancement, routed through thin Nuxt server endpoints; degrades gracefully when unavailable

## Current focus

- **Done (iteration 1):** Reading, Writing, Listening (incl. file-based Kokoro audio)
- **Next:** Speaking (`roadmap.md` §1.1) — harden Teil 1–2 offline practice, then wire AI review + STT; Teil 3 and mock exam follow
- Canonical status: `agent-os/product/roadmap.md` and `agent-os/product/index.md`

## Stack

- Nuxt 3
- Vue 3 with Composition API and `<script setup>`
- TypeScript
- Pinia with persisted state
- Tailwind CSS 4
- DaisyUI 5
- `@nuxtjs/i18n`
- Provider-agnostic, bring-your-own-key LLM access (e.g. OpenAI, Google Gemini, or local models) for optional AI-backed generation, review, and grading

## Package Manager And Commands

Use `pnpm`.

- `pnpm dev:infra` - start the persistent development PostgreSQL container
- `pnpm dev` - start Nuxt and NestJS locally with hot reload
- `pnpm dev:frontend` - start only Nuxt
- `pnpm dev:backend` - start only NestJS
- `pnpm build` - build all workspace projects
- `pnpm lint` - lint all workspace projects
- `pnpm lint:fix` - autofix all workspace projects
- `pnpm format` - run Prettier
- `pnpm type-check` - type-check all workspace projects
- `pnpm test` - test all workspace projects

## Codebase Shape

- `apps/frontend/` contains the Nuxt application, including pages, components, composables, stores, data, frontend utilities, and temporary Nitro AI endpoints
- `apps/backend/` contains the standalone NestJS API
- `libraries/contracts/` contains framework-neutral shared API types
- `libraries/database/` owns the Prisma schema, migrations, and seeds
- `libraries/exam-content/` is the shared exam-content boundary
- `libraries/nestjs-libraries/` is the shared backend infrastructure boundary
- `compose.dev.yaml` runs only PostgreSQL for local development and preserves data in `exam-one-postgres-dev-data`
- `compose.yaml` runs the fully containerized stack
- `agent-os/` contains project-specific product context and implementation standards

## Agent Priorities

1. Preserve offline-first behavior. Core reading, writing, listening, speaking, mock exam, navigation, and progress flows must not require network access.
2. Treat AI as optional and provider-agnostic (bring-your-own-key). If no API key is configured or an AI request fails, the app should degrade gracefully.
3. Keep changes aligned with existing Nuxt, Vue, and DaisyUI patterns instead of introducing a parallel architecture.
4. Prefer small, local changes over broad refactors unless the task explicitly requires structural work.

## Required Standards

The canonical implementation standards live under `agent-os/standards/`. Follow them when touching related areas.

### Global

- Offline-first core: core features must work with zero network
- SSR storage guards: guard `localStorage`, `window`, and `document` access with `import.meta.client` and `try/catch`
- Local storage keys: prefix with `exam-one:`

### Components

- Use `~/` import aliases, not `../` parent imports
- Use DaisyUI semantic tokens such as `base-*`, `primary`, `success`; avoid raw Tailwind palette scales
- Follow existing card layout and state-class helper conventions
- Guard hydration-sensitive client reads with `ClientOnly` or an `isClient` pattern

### Composables

- Use `use*` naming
- Keep composables feature-scoped
- Return structured objects with clear state/method sections where appropriate

### Server

- AI endpoints should return `{ data, error }` envelopes for business-level failures
- Reserve thrown errors for infrastructure/runtime failures

## UI And Styling Rules

- Preserve the established visual language unless the task is explicitly a redesign
- Prefer DaisyUI semantic classes and project theme tokens
- Keep responsive behavior intact on mobile and desktop
- Avoid introducing one-off styling systems when an existing utility/class pattern already exists

## Data And Persistence Rules

- Frontend-owned seed content currently belongs in typed modules under `apps/frontend/data/`; move it to `libraries/exam-content/` only when both applications need it
- Exam-specific implementation details belong in `agent-os/product/` reference docs; read the matching exam reference before changing prompt templates, seed exercises, scoring, grading, or mock exam behavior
- User progress and drafts are local-first
- Do not move core user data to a required backend dependency in MVP work

## AI Integration Rules

- Keep prompts and AI-specific logic isolated from core user flows; ship prompt templates as editable demo templates
- Keep AI provider-agnostic (bring-your-own-key); do not hard-code a single provider into core or endpoint contracts
- Avoid blocking UI completion on AI responses
- Handle missing API keys and upstream failures explicitly

## Before Finishing A Change

When relevant, run:

- `pnpm lint`
- `pnpm type-check`

If you cannot run verification, state that clearly in your handoff.

## Useful Context Files

- `README.md`
- `agent-os/product/index.md`
- `agent-os/product/mission.md`
- `agent-os/product/tech-stack.md`
- `agent-os/product/roadmap.md`
- `agent-os/product/german-exam-A2.md`
- `agent-os/standards/index.yml`

If a task touches a standardized area, read the matching file under `agent-os/standards/` before editing.
