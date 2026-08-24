# Tech Stack

> **Phase 1 is complete** as a Nuxt/Vue product with thin Nuxt server routes proxying user-supplied LLM providers. **Phase 2.1–2.6 are complete:** accounts, practice data, the AI/TTS/STT proxy, Compose packaging, and the self-host runbook are NestJS-backed. **Current is 2.7–2.14** (auth/settings UI fidelity, security, design comparison, exam-pack framework, then Goethe A1 / Cambridge English A2 / DELE Spanish A2 packs). Cloud hosting remains Phase 4.

## Frontend

- **Nuxt 4** — SSR/SSG framework (Vue 3)
- **Vue 3** — component model with Composition API
- **TypeScript** — strict typing throughout
- **Tailwind CSS 4** — utility-first styling (via `@tailwindcss/vite`)
- **DaisyUI 5** — component library on top of Tailwind
- **lucide-vue-next** — icon set
- **@nuxtjs/i18n + vue-i18n** — internationalisation
- **Pinia** (+ `pinia-plugin-persistedstate`) — state management
- **VueUse** — composable utilities

Vue/Nuxt reuses Scalo-derived auth, profile, and account UI (login, register, password reset, verify, profile/settings). Those screens are wired to NestJS (roadmap 2.2). Design-faithful auth and settings surfaces are 2.7–2.8. `/auth/**` is SSR'd; the login-gated app is client-only (`ssr: false`) because session cookies live on the API host.

## Backend

- **Completed Phase 1:** thin **Nuxt server routes** (`server/api/`) proxy requests to the configured LLM provider
- **Completed Phase 2.2–2.4:** **NestJS** REST API (`/api/v1`). Auth is JWT httpOnly cookies, bcrypt passwords, optional SMTP (`EMAIL_PROVIDER=none|smtp`). Multi-user registration; no default operator account. Recover a local password with `pnpm auth:set-password`. LLM, Kokoro TTS, and Parakeet/Whisper STT proxies live on NestJS (2.4).

## Database

- **Completed Phase 1:** skill practice, mock exams, progress, and drafts used localStorage
- **Completed Phase 2 (2.2–2.3):** **PostgreSQL** stores users, auth tokens, settings, exercises, attempts, results, drafts, generation jobs, and mock exams. Theme, locale, and playback prefs stay client-side. Postgres runs in Docker Compose with a **named volume** so data survives container recreation.

## AI

- **Bring-your-own-key, provider-agnostic architecture** — users supply their own LLM API keys
- **Supported providers (current):** **OpenAI** and **OpenRouter**
- Used for exercise generation, exercise review, and grading student answers
- Prompt templates are bundled as editable demo templates under `apps/frontend/data/{skill}/` today; the typed exam-pack contract is roadmap 2.11; practice-ready packs for Goethe A1, Cambridge English A2, and DELE Spanish A2 are 2.12–2.14
- AI is an enhancement layer; core practice flows degrade gracefully when AI is unavailable

## Listening audio (complete and tested)

Listening practice and mock-exam integration are complete and tested for the German / Goethe A2 product.

- Seed listening exercises use **pre-generated WAV files** (Kokoro German **four-voice** roster: `martin` / `bernd` male, `victoria` / `eva` female) under `apps/frontend/public/audio/listening/a2/` (often gitignored; regenerate with `pnpm generate:listening-audio`; use `FORCE=1` after voice-roster changes)
- Dialogue transcripts (Teil 2–4) use `Role:` labels; generation splits turns, assigns voices by gender + order of appearance, strips labels from spoken audio, and concatenates WAVs (parallel via `TTS_CONCURRENCY`)
- Playback uses stable files so every replay is identical (not live browser TTS)
- Optional maintainer tooling: the root `compose.yaml` owns the four-voice PyTorch Kokoro service on `:8881`; `pnpm tts:up` / `pnpm tts:down` select only that service, and `pnpm generate:listening-audio` generates seed WAVs (see `scripts/tts/README.md`)
- In-app: missing-audio sidebar + **Generate audio** writes `public/audio/listening/generated/` when Kokoro is up; practice controls stay locked until files exist
- AI listening generation still produces transcripts only; audio is generated on demand
- Phase 2 may run TTS as an optional Compose service when generating new exercises

## Speaking (complete and tested)

The core Speaking practice and mock-exam experience is complete and tested for the German / Goethe A2 product.

- Teil 1 uses two recordings: answers to four explicit practice questions, then
  four questions spoken aloud. Teil 2 uses one monologue recording.
- Recordings can be transcribed through a provider-neutral Nuxt STT adapter:
  local Parakeet (`STT_PROVIDER=local`) or OpenAI Whisper
  (`STT_PROVIDER=openai`). The transcript is always editable and can be entered
  manually when STT is unavailable.
- Optional local STT runs as the `parakeet` service in the root `compose.yaml` on `:8882`.
  `pnpm stt:up` downloads Handy's Q8 GGUF conversion of
  `nvidia/parakeet-tdt-0.6b-v3` (about 740 MB), verifies its fixed checksum,
  and runs it with pinned `transcribe.cpp`. The host project model directory at
  `scripts/stt/parakeet/models/` is mounted read-only;
  `pnpm stt:down` stops the service without deleting the model.
- Optional LLM review returns direct criteria points, explanations, strengths,
  and improvements. Attempts and successful criteria reviews are saved locally
  even though audio blobs are not retained.
- Mock-exam Speaking grading starts automatically, persists its full review,
  and feeds the completed module review and aggregate exam overview.

## Deployment & Infra

- A single root `compose.yaml` defines frontend, backend, PostgreSQL, Kokoro TTS,
  and Parakeet STT. `pnpm stack:up` downloads host-persisted speech models, waits
  on the core app after Nest migrate/seed, then starts speech sidecars.
- **Phase 2.1–2.6 (complete):** **Docker Compose** on the user's laptop — orchestrates frontend, NestJS backend, and PostgreSQL with a named data volume
- **Phase 2 runbook:** README + `.env.example` for first-user setup, LLM keys, and named-volume backup/restore (full Docusaurus docs site in Phase 3; exam-pack contributor guide is 2.11, published in 3.3)
- **Phase 2.7–2.14 (current):** auth/settings UI fidelity, security pass, design comparison, exam-pack framework, then Goethe A1 / Cambridge English A2 / DELE Spanish A2 packs
- **Phase 4:** separately hosted cloud copy under paid plans

## Tooling

- **pnpm** — package manager
- **Vite** — bundler (via Nuxt)
- **ESLint + Prettier** — linting and formatting
- **Husky + lint-staged** — pre-commit hooks
- **vue-tsc** — TypeScript checking for Vue SFCs
