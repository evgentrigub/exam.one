# Tech Stack

> **Phase 1 (current) is frontend-only**: a Nuxt/Vue app with thin Nuxt server routes proxying user-supplied (bring-your-own-key) LLM providers, and localStorage for all user data — no separate backend or database. The **Backend**, **Database**, and **Deployment** sections below describe the Phase 2 full-stack, Docker Compose self-hostable target (localhost first). Cloud hosting is Phase 4.

## Frontend

- **Nuxt 3** — SSR/SSG framework (Vue 3)
- **Vue 3** — component model with Composition API
- **TypeScript** — strict typing throughout
- **Tailwind CSS 4** — utility-first styling (via `@tailwindcss/vite`)
- **DaisyUI 5** — component library on top of Tailwind
- **lucide-vue-next** — icon set
- **@nuxtjs/i18n + vue-i18n** — internationalisation
- **Pinia** (+ `pinia-plugin-persistedstate`) — state management
- **VueUse** — composable utilities

Vue/Nuxt is retained in part so Phase 2 can reuse existing auth, profile, and account UI patterns (login, register, password reset, verify, profile/settings) from the project's Scalo-derived Vue component library.

## Backend

- **Phase 1 (current):** thin **Nuxt server routes** (`server/api/`) that proxy requests to the configured LLM provider — no standalone backend
- **Phase 2:** **NestJS** — Node.js backend framework (REST and/or GraphQL), single-operator signup model for self-hosted instances (similar to n8n / Postiz)

## Database

- **Phase 1 (current):** none — all user data is stored client-side in localStorage (offline-capable core practice)
- **Phase 2:** **PostgreSQL** — primary relational database (users, exercises, attempts, results, drafts, settings). Exam/user data fully replaces localStorage for those domains. Postgres runs in Docker Compose with a **named volume** so data survives container recreation.

## AI

- **Bring-your-own-key, provider-agnostic architecture** — users supply their own LLM API keys
- **Supported providers (current):** **OpenAI** and **OpenRouter**
- Used for exercise generation, exercise review, and grading student answers
- Prompt templates are bundled as editable demo templates
- AI is an enhancement layer; core practice flows degrade gracefully when AI is unavailable

## Listening audio (Phase 1 — iteration 1 complete)

Listening practice is **done for Phase 1 iteration 1**. Further listening work is polish / mock-exam integration only unless new gaps appear.

- Seed listening exercises use **pre-generated WAV files** (Kokoro German **Martin** male + optional **Victoria** female) under `apps/frontend/public/audio/listening/a2/` (often gitignored; regenerate with `pnpm generate:listening-audio`)
- Dialogue transcripts (Teil 2–4) use `Role:` labels; generation splits turns, assigns martin/victoria by speaker gender, strips labels from spoken audio, and concatenates WAVs
- Playback uses stable files so every replay is identical (not live browser TTS)
- Optional maintainer tooling: `compose.tts.yaml` (`pnpm tts:up` starts Martin + Victoria; `pnpm tts:down` stops both) + `pnpm generate:listening-audio` (see `scripts/tts/README.md`)
- In-app: missing-audio sidebar + **Generate audio** writes `public/audio/listening/generated/` when Kokoro is up; practice controls stay locked until files exist
- AI listening generation still produces transcripts only; audio is generated on demand
- Phase 2 may run TTS as an optional Compose service when generating new exercises

## Speaking (Phase 1 — next)

Speaking is the **next core-skill focus** after Listening. Current stack pieces to build on:

- Pages / session / `MediaRecorder` scaffold for Teil 1–2 (`apps/frontend/pages/speaking/`, `components/speaking/`)
- Seed + generate prompts for Teil 1–2; review prompt for Teil 2 exists but is not wired end-to-end
- Planned: real STT → review, Teil 1 dialogue structure, Teil 3 schedules, optional TTS partner (may reuse Kokoro), pronunciation score — see `roadmap.md` §1.1 Speaking plan and `german-exam-A2.md` Speaking

## Deployment & Infra

- **Phase 2 (primary):** **Docker Compose** on the user's laptop — orchestrates frontend, NestJS backend, and PostgreSQL with a named data volume
- **Phase 2 runbook:** README + env templates for first-user setup and LLM keys (full Docusaurus docs site in Phase 3)
- **Phase 4:** separately hosted cloud copy under paid plans

## Tooling

- **pnpm** — package manager
- **Vite** — bundler (via Nuxt)
- **ESLint + Prettier** — linting and formatting
- **Husky + lint-staged** — pre-commit hooks
- **vue-tsc** — TypeScript checking for Vue SFCs
