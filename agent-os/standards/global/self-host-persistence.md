# Self-Host Persistence (Phase 2+)

Rules for durable local data when exam.one runs as a Docker Compose full stack on the user's machine. Phase 1 still uses localStorage for exam/user data (see `offline-first-core.md` and `localstorage-keys.md`).

## Stack contract

- **Frontend** — Nuxt/Vue
- **Backend** — NestJS API
- **Database** — PostgreSQL
- **Orchestration** — Docker Compose (localhost first; cloud hosting is a later phase)

Exam and user data (users, exercises, attempts, results, drafts, authoritative settings) live in PostgreSQL and are accessed only through the NestJS API. localStorage must not remain the source of truth for those domains after Phase 2 cutover.

## Named Docker volume

PostgreSQL data must use a **named Docker volume** (for example `postgres_data` in production compose, `exam-one-postgres-dev-data` in dev compose).

- Removing or recreating containers must **not** wipe user data
- Document backup/restore of the named volume in the self-host runbook
- Do not bind-mount ephemeral paths that disappear with the project directory unless explicitly documented as disposable

## Local-first, not cloud-required

Phase 2 core practice must work entirely on the user's laptop:

- No required cloud account or hosted backend
- AI remains bring-your-own-key (OpenAI / OpenRouter) and optional
- Network to `localhost` services is expected; offline browser-only mode is no longer the architecture goal

## Related

- Product phases: `agent-os/product/roadmap.md`
- Stack: `agent-os/product/tech-stack.md`
- Theme may still use client `localStorage` as a UI preference only (`styling/theme-catalog.md`)
