# AGENTS.md

This file is the working guide for coding agents in this repository. It should be read before making changes.

## Project Summary

- Product: `exam.one`, an open-source, self-hostable language exam prep platform — a generic, multi-language framework
- **Phase 1 is complete and tested:** German / Goethe A2 Reading, Writing, Listening, Speaking, and mock exam mode are shipped end-to-end
- Current app shape: pnpm monorepo with a completed Nuxt 3 frontend, NestJS auth/accounts on PostgreSQL (2.2), and Compose foundations. Practice data is still localStorage until 2.3.
- Primary features: all four core skill practices; offline and generated mock exam sets; automatic scoring and AI grading; detailed result reviews; editable prompt templates; progress tracking
- AI usage: optional, bring-your-own-key and provider-agnostic enhancement, routed through thin Nuxt server endpoints; degrades gracefully when unavailable

## Current Focus

- **Done:** German / Goethe A2 core practice across Reading, Writing, Listening, and Speaking
- **Done:** Mock exam offline Set 1, generated immutable sets, resumable AI/TTS pipeline, automatic grading, module reviews, and aggregate AI overview
- **Done:** Auth and account UI (2.2) — login-gated NestJS session, profile, settings; optional SMTP; `pnpm auth:set-password`
- **Current:** Phase 2.3 persistence cutover — move skill, mock exam, progress, and draft data to NestJS/PostgreSQL while preserving completed practice behavior
- Canonical status: `agent-os/product/roadmap.md` and `agent-os/product/index.md`

## Stack

- Nuxt 3
- Vue 3 with Composition API and `<script setup>`
- TypeScript
- Pinia with persisted state
- Tailwind CSS 4
- DaisyUI 5
- `@nuxtjs/i18n`
- Provider-agnostic, bring-your-own-key LLM access through OpenAI or OpenRouter for optional AI-backed generation, review, and grading

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
- `pnpm stack:up` - prepare speech models and start the complete Docker Compose stack
- `pnpm stack:down` - stop the complete stack without deleting named volumes
- `pnpm tts:up` - prepare and start only Kokoro TTS
- `pnpm stt:up` - prepare and start only Parakeet STT
- `pnpm auth:set-password` - set or recover a local account password (`--email you@example.com`)

## Codebase Shape

- `apps/frontend/` contains the Nuxt application, including pages, components, composables, stores, data, frontend utilities, and temporary Nitro AI endpoints
- `apps/backend/` contains the standalone NestJS API
- `libraries/contracts/` contains framework-neutral shared API types
- `libraries/database/` owns the Prisma schema, migrations, and seeds
- `libraries/exam-content/` is the shared exam-content boundary
- `libraries/nestjs-libraries/` is the shared backend infrastructure boundary
- `compose.yaml` is the only Compose file; it defines frontend, backend, PostgreSQL, Kokoro TTS, and Parakeet STT
- `pnpm dev:infra` selects only PostgreSQL for local development; `pnpm stack:up` starts the complete stack after ensuring host-persisted speech models are present
- `agent-os/` contains project-specific product context and implementation standards

## Agent Priorities

1. Preserve completed product behavior. Unmigrated practice domains remain localStorage after login; accounts require the local API/PostgreSQL stack and must not require cloud infrastructure.
2. Treat AI as optional and provider-agnostic (bring-your-own-key). If no API key is configured or an AI request fails, the app should degrade gracefully.
3. Keep changes aligned with existing Nuxt, Vue, and DaisyUI patterns instead of introducing a parallel architecture.
4. Prefer small, local changes over broad refactors unless the task explicitly requires structural work.
5. During Phase 2, preserve compatibility with completed local-first flows and migrate persistence one domain at a time without maintaining two authoritative sources.

## Required Standards

The canonical implementation standards live under `agent-os/standards/`. Follow them when touching related areas.

### Global

- Phase-aware core: the shell is login-gated (2.2). Practice domains stay localStorage until 2.3; migrated domains may use the local self-hosted API/database
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
- Existing user progress, drafts, attempts, generated sets, and reviews remain local-first until their Phase 2 domain is explicitly migrated
- Phase 2 persistence work should move an entire domain behind shared contracts and NestJS/PostgreSQL ownership, with a deliberate compatibility or migration path
- Bundled mock-exam Set 1 must remain usable without an LLM key or speech service (after the user is signed in)

## AI Integration Rules

- Keep prompts and AI-specific logic isolated from core user flows; ship prompt templates as editable demo templates
- Keep AI provider-agnostic (bring-your-own-key); do not hard-code a single provider into core or endpoint contracts
- Avoid blocking UI completion on AI responses
- Handle missing API keys and upstream failures explicitly
- Generated mock sets require LLM configuration/connection and Docker TTS preflight checks; preserve completed artifacts and resumable pipeline state on failure
- Writing and Speaking mock grading starts automatically and persists the full validated review alongside the score
- Aggregate mock-exam AI review is optional and must never invalidate or block completed exam results

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
