# AGENTS.md

This file is the working guide for coding agents in this repository. It should be read before making changes.

## Project Summary

- Product: `exam.one`, an open-source, self-hostable language exam prep platform — a generic, multi-language framework
- German / Goethe A2 Reading, Writing, Listening, Speaking, and mock exam mode are shipped end-to-end
- App shape: pnpm monorepo with a Nuxt 4 frontend, NestJS auth/accounts, practice persistence, AI/TTS/STT proxy on PostgreSQL, a packaged Docker Compose stack, and a self-host README runbook. Theme, locale, and playback prefs stay in the browser.
- Primary features: all four core skill practices; bundled and generated mock exam sets; automatic scoring and AI grading; detailed result reviews; editable prompt templates; progress tracking
- AI usage: optional, bring-your-own-key and provider-agnostic enhancement, routed through NestJS; degrades gracefully when unavailable

## What Ships Today

- German / Goethe A2 core practice across Reading, Writing, Listening, and Speaking
- Goethe A1 / Start Deutsch 1 practice across all four modules, with the same mock exam flow as A2
- Mock exam bundled Set 1 (per pack), generated immutable sets, resumable AI/TTS pipeline, automatic grading, module reviews, and aggregate AI overview
- Auth and account UI — login-gated NestJS session, profile, settings; optional SMTP; `pnpm auth:set-password`
- Skill practice, mock exams, progress, and drafts are NestJS/PostgreSQL-backed after login
- Per-user BYOK LLM (OpenAI, OpenRouter, Gemini, Anthropic, xAI), Kokoro, and language-aware Phonon/Parakeet on NestJS with the `{ data, error }` envelope
- Docker Compose packaging — one root `compose.yaml`, migrate/seed on backend boot, durable volumes, core-first `pnpm stack:up`
- Self-host runbook — README, `.env.example`, first user, API keys, named-volume backup/restore

## Stack

- Nuxt 4
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
- `pnpm stack:up` - start the core app, then prepare speech models and start speech (`stack:up:core` + `stack:up:speech`)
- `pnpm stack:verify-models` - fail if TTS/STT model snapshots are missing
- `pnpm stack:seed-audio` - generate bundled listening WAVs if they are missing
- `pnpm stack:down` - stop the complete stack without deleting named volumes
- `pnpm tts:up` - prepare and start only Kokoro TTS
- `pnpm stt:up` - prepare selected models and start the language-aware STT service
- `pnpm auth:set-password` - set or recover a local account password (`--email you@example.com`)

## Codebase Shape

- `apps/frontend/` contains the Nuxt application, including pages, components, composables, stores, data, and frontend utilities
- `apps/backend/` contains the standalone NestJS API
- `libraries/contracts/` contains framework-neutral shared API types
- `libraries/database/` owns the Prisma schema, migrations, and seeds
- `data/` (`@exam-one/exam-packs`) holds exam structure, PromptSpecs, and optional bundled seeds under `src/packs/{packId}/`
- `libraries/nestjs-libraries/` is the shared backend infrastructure boundary
- `compose.yaml` is the only Compose file; it defines frontend, backend, PostgreSQL, Kokoro TTS, and Parakeet STT
- `pnpm dev:infra` selects only PostgreSQL for local development; `pnpm stack:up` starts the core app after migrate/seed (`stack:up:core`), then ensures host-persisted speech models are present and starts the speech sidecars (`stack:up:speech`)
- `agent-os/standards/` contains canonical implementation standards

## Agent Priorities

1. Preserve completed product behavior. Practice domains are API-backed after login. Accounts require the local API/PostgreSQL stack and must not require cloud infrastructure.
2. Treat AI as optional and provider-agnostic (bring-your-own-key). If no API key is configured or an AI request fails, the app should degrade gracefully.
3. Keep changes aligned with existing Nuxt, Vue, and DaisyUI patterns instead of introducing a parallel architecture.
4. Prefer small, local changes over broad refactors unless the task explicitly requires structural work.
5. Do not reintroduce localStorage as an authoritative source for skill, mock exam, progress, or draft data. UI prefs (theme, locale, playback) may stay client-side.

## Required Standards

The canonical implementation standards live under `agent-os/standards/`. Follow them when touching related areas.

### Global

- The shell is login-gated. Practice data is NestJS/PostgreSQL. AI/TTS/STT is NestJS. Theme and playback prefs stay client-side
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

- AI endpoints should return `{ data, error }` envelopes for business-level failures via NestJS `/api/v1`
- Reserve thrown errors for infrastructure/runtime failures

## UI And Styling Rules

- Preserve the established visual language unless the task is explicitly a redesign
- Prefer DaisyUI semantic classes and project theme tokens
- Keep responsive behavior intact on mobile and desktop
- Avoid introducing one-off styling systems when an existing utility/class pattern already exists

## Data And Persistence Rules

- Exercise seed payloads live in the owning pack under `data/src/packs/{packId}/content/` (`@exam-one/exam-packs`) and are upserted by Prisma `db:seed`. Prompt templates live in the same pack folder
- Exam-specific seeds, scoring, and mock payloads live with that pack under `data/src/packs/`. Keep shared models and UI flows exam-agnostic
- Skill catalogs, attempts, drafts, reviews, generation jobs, and mock exams are owned by NestJS/PostgreSQL after login. Do not add new authoritative practice keys to localStorage
- Every pack's bundled mock-exam Set 1 must remain usable without an LLM key or speech service (after the user is signed in); its listening WAVs come from `pnpm stack:seed-audio`

## AI Integration Rules

- Keep prompts and AI-specific logic isolated from core user flows; pack `PromptSpec`s live under `data/src/packs/`
- Keep AI provider-agnostic (bring-your-own-key); do not hard-code a single provider into core or endpoint contracts
- Avoid blocking UI completion on AI responses
- Handle missing API keys and upstream failures explicitly
- Generated mock sets require LLM configuration/connection and Docker TTS preflight checks; preserve completed artifacts and resumable pipeline state on failure
- Writing and Speaking mock grading starts automatically and persists the full validated review alongside the score
- Aggregate mock-exam AI review is optional and must never invalidate or block completed exam results

## Speech setup

Self-host setup/verification must not require host Python or pip packages. Bash launchers run Python in temporary Compose speech containers and reuse the runtime mounts/language settings. Contributor catalog tests may use host Python’s standard library.

## Speech model ownership

`scripts/stt/model-manifest.json` owns STT model assets, checksums and language defaults. English defaults to Phonon 2; German/Polish/Spanish use shared Parakeet Q4. Q8 is retired completely from the catalog/UI/runtime: migrate only known retired IDs/aliases in saved preferences to current language defaults, preserving old files without copying or deleting them. Settings offers Phonon for English and Q4 for German/Polish/Spanish. Public documentation and E2E catalog fixtures derive from this manifest. STT models and language preferences are instance-wide; never auto-download a fallback after a transcription failure.

## Before Finishing A Change

When relevant, run:

- `pnpm lint`
- `pnpm type-check`

If you cannot run verification, state that clearly in your handoff.

## Useful Context Files

- `README.md`
- `agent-os/standards/index.yml`

If a task touches a standardized area, read the matching file under `agent-os/standards/` before editing.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, follow the graphify skill before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
