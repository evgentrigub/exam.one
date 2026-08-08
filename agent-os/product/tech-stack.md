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

- Seed listening exercises use **pre-generated WAV files** (Kokoro German **four-voice** roster: `martin` / `bernd` male, `victoria` / `eva` female) under `apps/frontend/public/audio/listening/a2/` (often gitignored; regenerate with `pnpm generate:listening-audio`; use `FORCE=1` after voice-roster changes)
- Dialogue transcripts (Teil 2–4) use `Role:` labels; generation splits turns, assigns voices by gender + order of appearance, strips labels from spoken audio, and concatenates WAVs (parallel via `TTS_CONCURRENCY`)
- Playback uses stable files so every replay is identical (not live browser TTS)
- Optional maintainer tooling: the root `compose.yaml` owns the four-voice PyTorch Kokoro service on `:8881`; `pnpm tts:up` / `pnpm tts:down` select only that service, and `pnpm generate:listening-audio` generates seed WAVs (see `scripts/tts/README.md`)
- In-app: missing-audio sidebar + **Generate audio** writes `public/audio/listening/generated/` when Kokoro is up; practice controls stay locked until files exist
- AI listening generation still produces transcripts only; audio is generated on demand
- Phase 2 may run TTS as an optional Compose service when generating new exercises

## Speaking (Phase 1 — Teil 1–2 iteration complete)

Speaking Teil 1–2 is **done for this iteration**. The next product stage is Teil 3 joint planning, followed by pronunciation and mock-exam integration.

- Teil 1 uses two recordings: answers to four explicit practice questions, then
  four questions spoken aloud. Teil 2 uses one monologue recording.
- Recordings can be transcribed through a provider-neutral Nuxt STT adapter:
  local Parakeet (`STT_PROVIDER=local`) or OpenAI Whisper
  (`STT_PROVIDER=openai`). The transcript is always editable and can be entered
  manually when STT is unavailable.
- Optional local STT runs as the `parakeet` service in the root `compose.yaml` on `:8882`.
  `pnpm stt:up` downloads `nvidia/parakeet-tdt-0.6b-v3` to the host project at
  `scripts/stt/parakeet/models/` and mounts the snapshot read-only;
  `pnpm stt:down` stops the service without deleting the model.
- Optional LLM review is wired for Teil 1 (4 points) and Teil 2 (8 points).
  Attempts and successful criteria reviews are saved locally even though audio
  blobs are not retained.
- Teil 3, pronunciation scoring, a TTS partner, and mock-exam speaking remain
  later work. Teil 3 is visible in exam format but unavailable in practice and
  generation.

## Deployment & Infra

- A single root `compose.yaml` defines frontend, backend, PostgreSQL, Kokoro TTS,
  and Parakeet STT. `pnpm stack:up` downloads host-persisted speech models and
  starts the complete stack; per-service pnpm commands select from the same file.
- **Phase 2 (primary):** **Docker Compose** on the user's laptop — orchestrates frontend, NestJS backend, and PostgreSQL with a named data volume
- **Phase 2 runbook:** README + env templates for first-user setup and LLM keys (full Docusaurus docs site in Phase 3)
- **Phase 4:** separately hosted cloud copy under paid plans

## Tooling

- **pnpm** — package manager
- **Vite** — bundler (via Nuxt)
- **ESLint + Prettier** — linting and formatting
- **Husky + lint-staged** — pre-commit hooks
- **vue-tsc** — TypeScript checking for Vue SFCs
