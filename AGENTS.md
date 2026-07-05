# AGENTS.md

This file is the working guide for coding agents in this repository. It should be read before making changes.

## Project Summary

- Product: `exam.one`, an open-source, self-hostable language exam prep platform — a generic, multi-language framework (today: English / Cambridge A2 and German / Goethe A2)
- Current app shape: Nuxt 3, frontend-only MVP (Phase 1) with offline-first core flows; Phase 2 evolves into a self-hostable full-stack app (NestJS + PostgreSQL via Docker Compose)
- Primary features: reading, writing, listening, and speaking practice; mock exam mode; editable demo prompt templates; progress tracking
- AI usage: optional, bring-your-own-key and provider-agnostic enhancement, routed through thin Nuxt server endpoints; degrades gracefully when unavailable

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

- `pnpm dev` - start local development server
- `pnpm build` - production build
- `pnpm preview` - preview production build
- `pnpm generate` - static generation
- `pnpm lint` - ESLint
- `pnpm lint:fix` - ESLint autofix
- `pnpm format` - Prettier
- `pnpm type-check` - Nuxt type checking

## Codebase Shape

- `pages/` contains file-based routes
- `components/` contains feature UI and shared UI
- `composables/` contains reusable feature logic
- `stores/` contains Pinia stores
- `data/` contains bundled typed seed data for offline-first flows
- `server/api/` contains thin server endpoints, mostly for optional AI features
- `utils/` contains shared helpers and types
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

- Seed content belongs in typed modules under `data/`
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
