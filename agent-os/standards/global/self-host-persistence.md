# Self-Host Persistence (Phase 2+)

Rules for durable local data when exam.one runs as a Docker Compose full stack on the user's machine.

**Cutover status:** accounts, session, profile, exam settings, skill catalogs, attempts, drafts, generation jobs, mock exams, and the LLM/TTS/STT proxy are NestJS (roadmap 2.2–2.4). Compose packaging (2.5) boots that stack with migrate/seed on backend start. The self-host runbook (2.6) lives in the root README and `.env.example`. Theme, locale, listening playback, and reading bookmarks may stay client-side (see `offline-first-core.md` and `localstorage-keys.md`).

## Stack contract

- **Frontend** — Nuxt/Vue
- **Backend** — NestJS API
- **Database** — PostgreSQL
- **Orchestration** — Docker Compose (localhost first; cloud hosting is a later phase)

Exam and user data that have been cut over live in PostgreSQL and are accessed only through the NestJS API. localStorage must not remain the source of truth for those domains.

Shared Goethe A2 seeds (and mock Set 1) are upserted by Prisma `db:seed` from `@exam-one/exam-content`. User-generated exercises overlay seeds by `externalId` and are scoped by `userId`.

## Named Docker volume

PostgreSQL data must use a **named Docker volume** (for example `postgres_data` in production compose, `exam-one-postgres-dev-data` in dev compose).

- Removing or recreating containers must **not** wipe user data
- Backup/restore of the named Postgres volume and generated-audio volume is documented in the root README
- Do not bind-mount ephemeral paths that disappear with the project directory unless explicitly documented as disposable

Listening WAV bytes stay on the filesystem (`apps/frontend/public/audio/` or the Compose named volume `generated_listening_audio`). NestJS writes on-demand generated WAVs; Nuxt serves them at `/audio/listening/generated/`. Postgres stores **paths** only. Speaking recordings stay in-memory blobs; persist transcripts and reviews, not audio.

## Local-first, not cloud-required

Phase 2 core practice after login must work entirely on the user's laptop:

- No required cloud account or hosted backend
- AI remains bring-your-own-key (OpenAI / OpenRouter) and optional
- Network to `localhost` services is expected; offline browser-only mode is no longer the architecture goal

## Related

- Product phases: `agent-os/product/roadmap.md`
- Stack: `agent-os/product/tech-stack.md`
- Theme may still use client `localStorage` as a UI preference only (`styling/theme-catalog.md`)
