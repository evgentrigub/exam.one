# Exam.one

Open-source, self-hostable language exam prep. The German / Goethe A2 experience is complete and tested across all four skills and mock exam mode.

Practice Reading, Writing, Listening, and Speaking with authentic exam-style content, optional AI feedback, and progress that lives in PostgreSQL after you sign in. The app is **login-gated**: register or sign in on this instance, then practice as before.

Design preview: `npx --yes serve exam-one-design/project -l 5174`

## Current status

Canonical roadmap: [`agent-os/product/roadmap.md`](./agent-os/product/roadmap.md).

| Area                      | Status                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| Phase 1 frontend MVP      | **Complete and tested**                                                                            |
| Reading (Lesen)           | Complete — practice, scoring, explanations, progress, and optional generation                      |
| Writing (Schreiben)       | Complete — drafts, submissions, optional AI grading, and detailed review                           |
| Listening (Hoeren)        | Complete — four exam parts, stable audio, replay rules, and optional Docker TTS                    |
| Speaking (Sprechen)       | Complete — recording, STT/manual transcripts, optional AI grading, and detailed review             |
| Mock exam                 | Complete — offline Set 1, generated local sets, automatic grading, module reviews, and AI overview |
| Phase 2.1 backend         | **Complete** — NestJS, Prisma, health, Compose/Postgres                                            |
| Phase 2.2 auth / accounts | **Complete** — login-gated NestJS session, profile, settings; optional SMTP                        |
| Phase 2.3 practice data   | **Complete** — skill / mock / progress / drafts on NestJS + PostgreSQL after login                 |
| Phase 2.4 AI / speech     | **Complete** — LLM, Kokoro TTS, and Parakeet/Whisper STT proxy on NestJS                           |
| Phase 2.5 Compose stack   | **Complete** — one `compose.yaml`, migrate/seed on boot, durable volumes, core-first `stack:up`    |
| Phase 2.6 self-host docs  | **Complete** — README runbook, env reference, first user, backup/restore                           |

**Phase 2 is complete.** Next is Phase 3 (public open-source release and a dedicated docs site). See the roadmap.

## Features

### Reading Practice

- Exam-style emails, notices, articles, advertisements, and instructions
- Four comprehension questions per text with German explanations
- Instant feedback, filtering, sorting, progress, resume, and deep-linkable sessions

### Writing Practice

- Informal emails and formal correspondence
- Three-card interface: description, instructions, and editor
- Word-count validation, draft saving, structure/vocabulary checks, and optional AI grading

### Listening Practice

- Goethe A2 Teile 1–4 with shared or per-item audio players
- Stable WAV playback from pre-generated Kokoro German voices
- On-demand TTS when Kokoro is up (`pnpm tts:up` + Generate audio)
- Optional AI transcript generation, separate from audio generation

### Speaking Practice

- Structured interview/question and monologue recording with editable transcripts
- Optional STT: local Parakeet (`pnpm stt:up`) or OpenAI Whisper, plus manual-text fallback
- Optional AI review with criteria, strengths, and improvements
- Mock exam integration with automatic grading and persisted detailed review

### Accounts

- Register / sign in on this instance (email + password). No default operator account
- Profile and exam settings (level, target language) persist in PostgreSQL
- SMTP is optional (`EMAIL_PROVIDER=none` by default). Recover a password with `pnpm auth:set-password --email you@example.com`

### Progress Dashboard

- Completion rates, average and best scores, recent activity, and per-skill analytics

### Optional AI Enhancement

- Bring-your-own-key OpenAI or OpenRouter, proxied through NestJS
- Generate exercises and review/grade writing and speaking when keys are configured
- Core practice and bundled mock Set 1 work without any LLM key

## Architecture

After you are signed in, core practice runs against the **local** NestJS API and PostgreSQL. No cloud account is required.

- Reading, writing, listening, and speaking practice
- Goethe A2 mock exam Set 1
- Progress tracking, drafts, and resume
- Full navigation and UI

When LLM API keys are configured (optional):

- AI-powered review, generation, and grading
- Model answers / enhanced feedback

When Kokoro TTS and Parakeet STT are up (optional):

- Generate listening WAVs and transcribe speaking recordings locally

The app degrades gracefully when those services or keys are missing.

```text
Browser  -->  Nuxt :3000  -->  NestJS :3001  -->  PostgreSQL :5432
                                   |-->  Kokoro TTS :8881   (optional)
                                   `-->  Parakeet STT :8882 (optional)
```

Durable storage:

| Store                            | What it holds                                              |
| -------------------------------- | ---------------------------------------------------------- |
| Named volume `postgres_data`     | Users, settings, catalogs, attempts, drafts, mock exams    |
| Named volume `generated_listening_audio` | On-demand listening WAVs written by NestJS          |
| Host dirs `scripts/*/models/`    | TTS and STT model weights (gitignored, reused across runs) |
| Host dir `apps/frontend/public/audio/listening/a2/` | Bundled seed listening WAVs             |

Theme, locale, listening playback volume/speed, and reading bookmarks stay in the browser.

---

## Self-host with Docker Compose

This is the supported way to run exam.one on a laptop. Copy [`.env.example`](./.env.example) to `.env`, start the stack, register the first user, and optionally add LLM keys.

A dedicated documentation site waits for Phase 3. This README is the runbook until then.

### Requirements

| Requirement                         | Notes                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Docker Engine 24+** and Compose v2 | Docker Desktop, or engine + Compose plugin on Linux                                           |
| **Node.js 24+** and **pnpm 10.12.1+** | Required for `pnpm stack:up` (model download, migrate/seed orchestration, password recovery) |
| **RAM**                             | 4 GB minimum for the core app; 6–8 GB when building/running Kokoro and Parakeet                |
| **Disk**                            | ~2 GB for speech weights (about 984 MB Kokoro + 740 MB Parakeet GGUF) plus container images    |
| **OS**                              | macOS (Apple Silicon or Intel), Linux (x86_64 or arm64), Windows 10/11 with WSL2               |

### Quick start

```bash
git clone <your-repo-url>
cd exam-one
pnpm install
cp .env.example .env
```

Set `JWT_SECRET` in `.env` to a long random value before you share the instance:

```bash
# example
openssl rand -base64 48
```

Start everything (recommended):

```bash
pnpm stack:up
pnpm stack:ps
```

`pnpm stack:up` downloads speech models if they are missing, starts PostgreSQL, waits until NestJS has migrated and seeded the catalog and Nuxt is healthy, then starts Kokoro and Parakeet and generates bundled listening WAVs if the seed directory is empty.

The first run downloads about 1.7 GB of weights and builds the TTS image plus the `transcribe.cpp` STT runtime. Later starts reuse `scripts/tts/victoria/models/` and `scripts/stt/parakeet/models/`.

Core app only (no speech sidecars — mock Set 1 and practice still work; Generate audio and local STT do not):

```bash
docker compose up -d --build --wait postgres backend frontend
```

Services:

| Service        | URL                                      |
| -------------- | ---------------------------------------- |
| Frontend       | http://localhost:3000                    |
| Backend        | http://localhost:3001                    |
| API docs       | http://localhost:3001/api/docs           |
| Health         | http://localhost:3001/api/v1/health/ready |
| PostgreSQL     | localhost:5432                           |
| Kokoro TTS     | http://localhost:8881/v1/audio/voices    |
| Parakeet STT   | http://localhost:8882/health             |

Prefer `pnpm stack:up` over a bare `docker compose up --wait` of every service. Speech healthchecks can take several minutes.

### First user

There is **no seeded operator account**. Open http://localhost:3000/auth/register and create the first user.

- With `EMAIL_PROVIDER=none` (default), registration auto-verifies the email. You can sign in immediately.
- With `EMAIL_PROVIDER=smtp`, the instance sends a verification mail. Configure `SMTP_*` before registering.

Forgot-password email links only work when SMTP is configured. Recover a local password from the host while Postgres is up:

```bash
pnpm auth:set-password --email you@example.com
```

The command uses `DATABASE_URL` from `.env` (localhost:5432). It prompts for a new password, marks the email verified, and invalidates refresh tokens.

### Optional: LLM API keys

Core practice and bundled mock Set 1 do not need a key. Generated mock sets, AI review, and AI grading do.

OpenAI:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

OpenRouter:

```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
```

Restart the backend after changing keys (`pnpm stack:up` or `docker compose up -d backend`).

### Optional: speech sidecars

Kokoro (Listening TTS) exposes four German voices on `:8881`: `martin`, `bernd`, `victoria`, `eva`.

Parakeet (Speaking STT) serves Handy's Q8 GGUF on `:8882`. To use OpenAI Whisper instead:

```bash
STT_PROVIDER=openai
OPENAI_API_KEY=sk-...
STT_OPENAI_MODEL=whisper-1
```

Single-service shortcuts (same root `compose.yaml`):

```bash
pnpm tts:up
pnpm stt:up
pnpm tts:down
pnpm stt:down
```

### Backup and restore

`pnpm stack:down` and `docker compose down` **keep** named volumes. Do not pass `-v` / `--volumes` unless you intend to delete PostgreSQL data and generated listening audio.

Default volume names:

| Volume                               | Compose key                  | Contents                         |
| ------------------------------------ | ---------------------------- | -------------------------------- |
| `exam-one-postgres-dev-data`         | `postgres_data` (`POSTGRES_VOLUME_NAME`) | Database                   |
| `exam-one_generated_listening_audio` | `generated_listening_audio`  | On-demand listening WAVs         |

Confirm with `docker volume ls | grep exam-one`.

#### Database

Backup (stack must be running):

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U exam_one -d exam_one --clean --if-exists \
  > "backups/exam-one-postgres-$(date +%Y%m%d).sql"
```

Restore:

```bash
cat backups/exam-one-postgres-YYYYMMDD.sql | docker compose exec -T postgres psql -U exam_one -d exam_one
```

If you changed `POSTGRES_USER` / `POSTGRES_DB` in `.env`, use those names instead of `exam_one`.

#### Generated listening audio

Backup:

```bash
mkdir -p backups
docker run --rm \
  -v exam-one_generated_listening_audio:/source:ro \
  -v "$(pwd)/backups:/backup" \
  alpine tar -czf /backup/listening-audio-$(date +%Y%m%d).tar.gz -C /source .
```

Restore:

```bash
docker run --rm \
  -v exam-one_generated_listening_audio:/target \
  -v "$(pwd)/backups:/backup" \
  alpine tar -xzf /backup/listening-audio-YYYYMMDD.tar.gz -C /target
```

Seed WAVs under `apps/frontend/public/audio/listening/a2/` live on the host bind mount; copy that directory if you regenerated them. Speech model weights in `scripts/tts/victoria/models/` and `scripts/stt/parakeet/models/` can be re-downloaded with `pnpm stack:setup`.

### Stop, wipe, and upgrade

```bash
pnpm stack:down              # stop; keep volumes and model dirs
docker compose down          # same, without the pnpm wrapper
docker compose down -v       # DELETES Postgres and generated-audio volumes
```

Upgrade:

```bash
git pull
pnpm install
pnpm stack:up
```

The backend entrypoint runs `prisma migrate deploy` and upserts bundled catalog seeds on every boot. User-generated rows are not wiped.

### Environment reference

Copy [`.env.example`](./.env.example) and edit. Groups:

| Group                         | Keys                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| App and network               | `FRONTEND_PORT`, `BACKEND_PORT`, `FRONTEND_URL`, `NUXT_PUBLIC_API_URL`, `FRONTEND_LANDING_URL`, `NODE_ENV` |
| Database                      | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_VOLUME_NAME`, `DATABASE_URL` |
| Auth                          | `JWT_SECRET` (required), `AUTH_COOKIE_SECURE`                        |
| Email                         | `EMAIL_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| LLM                           | `LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `LLM_REASONING_EFFORT` |
| STT                           | `STT_PROVIDER`, `STT_BASE_URL`, `STT_PORT`, `STT_CPU_THREADS`, `STT_MODEL`, `STT_OPENAI_MODEL` |
| TTS                           | `TTS_BASE_URL`, `TTS_PORT`, `TTS_CPU_THREADS`, `TTS_CONCURRENCY`, `TTS_SPEED`, `TTS_LANG`, `TTS_VOICE`, `TTS_TURN_PAUSE_MS`, `TTS_PAUSE_DURATION` |
| Optional                      | `GENERATED_LISTENING_AUDIO_DIR`, `STACK_SEED_AUDIO_TIMEOUT_MS`       |

Production notes:

- Replace `JWT_SECRET`. Rotating it signs everyone out.
- Set `AUTH_COOKIE_SECURE=true` only behind HTTPS.
- Change `POSTGRES_PASSWORD` if the instance is reachable beyond localhost.
- Keep `EMAIL_PROVIDER=none` unless you have a working SMTP server.

### Troubleshooting

**Port already in use (3000, 3001, 5432, 8881, 8882)**  
Change the matching `*_PORT` in `.env`, or stop the process bound to that port. `pnpm stack:ps` shows what Compose published.

**Speech models missing / empty mounts**  
Run `pnpm stack:setup` then `pnpm stack:verify-models`. Compose bind-mounts those directories read-only; an empty folder will make Kokoro or Parakeet fail healthchecks.

**Kokoro never becomes healthy**  
First start can take several minutes (PyTorch image + model load). Watch `docker compose logs -f kokoro-voices`. Seed WAV generation can wait up to eight minutes; retry with `pnpm stack:seed-audio` or `pnpm generate:listening-audio`.

**Cannot sign in after restart**  
Confirm Postgres volume is still present (`docker volume ls`). `stack:down` does not delete it; `docker compose down -v` does.

**Forgot password and SMTP is off**  
`pnpm auth:set-password --email you@example.com` against the running Postgres port.

**Cookies not set / immediate sign-out**  
Keep `AUTH_COOKIE_SECURE=false` on `http://localhost`. Set it `true` only when the browser uses HTTPS.

**JWT_SECRET changed**  
Every session is invalid. Sign in again.

**AI buttons fail with a provider error**  
Core practice still works. Check `LLM_PROVIDER` matches the key you set, then restart the backend.

---

## Local development

Use this path when you want hot reload. PostgreSQL still runs in Docker; Nuxt and NestJS run on the host.

```bash
pnpm install
cp .env.example .env
pnpm dev:infra
pnpm dev
```

This starts:

- Nuxt with hot reload at http://localhost:3000 (login-gated; register on first use)
- NestJS with watch mode at http://localhost:3001
- API documentation at http://localhost:3001/api/docs
- PostgreSQL in Docker at localhost:5432

The root `compose.yaml` is the only Compose file. `pnpm dev:infra` selects just its `postgres` service. Data lives in the `exam-one-postgres-dev-data` named volume; `pnpm dev:infra:down` only stops the service.

```bash
pnpm dev:infra          # Start PostgreSQL and wait until healthy
pnpm dev:infra:logs     # Follow PostgreSQL logs
pnpm dev:db:shell       # Open psql in the development database
pnpm dev:infra:down     # Stop PostgreSQL without deleting its volume
pnpm dev:frontend       # Run only Nuxt with hot reload
pnpm dev:backend        # Run only NestJS in watch mode
```

Optional speech while developing:

```bash
pnpm tts:up
pnpm stt:up
```

## Tech stack

- **Nuxt 4** / **Vue 3** / **TypeScript** (strict)
- **Tailwind CSS 4** + **DaisyUI 5**
- **Pinia** + **VueUse** + **@nuxtjs/i18n** (en default, de)
- **NestJS** REST API (`/api/v1`) with JWT httpOnly cookies
- **PostgreSQL 17** via Prisma
- Optional **OpenAI** / **OpenRouter**, **Kokoro TTS**, **Parakeet** / **Whisper STT**

## Project structure

```text
exam-one/
├── apps/
│   ├── frontend/          # Nuxt 4 application
│   └── backend/           # Standalone NestJS API
├── libraries/
│   ├── contracts/         # Framework-neutral shared API contracts
│   ├── database/          # Prisma schema, migrations, and seeds
│   ├── exam-content/      # Shared exam content boundary
│   └── nestjs-libraries/  # Shared backend infrastructure boundary
├── agent-os/              # Product context and implementation standards
├── compose.yaml           # App + PostgreSQL + Kokoro TTS + Parakeet STT
├── pnpm-workspace.yaml
└── package.json           # Workspace orchestration scripts
```

## Commands

```bash
pnpm build               # Build all applications and libraries
pnpm lint                # Lint all workspace packages
pnpm lint:fix            # Autofix all workspace packages
pnpm format              # Format the repository
pnpm type-check          # Type-check all workspace packages
pnpm test                # Run package tests
pnpm test:e2e            # Run the NestJS health endpoint e2e test
pnpm stack:setup         # Download and verify all speech models without starting Compose
pnpm stack:verify-models # Fail if TTS/STT model snapshots are missing
pnpm stack:up            # Download models, start core app, then speech, then seed WAVs if missing
pnpm stack:seed-audio    # Generate bundled listening WAVs if they are not already on disk
pnpm stack:down          # Stop the complete stack without deleting named volumes
pnpm stack:logs          # Follow logs for all Compose services
pnpm stack:ps            # Show service and health status
pnpm tts:setup           # Download and verify only local Kokoro TTS models
pnpm tts:up              # Start only local Kokoro TTS from compose.yaml
pnpm stt:setup           # Download and verify only the local Parakeet GGUF
pnpm stt:up              # Start only local Parakeet STT from compose.yaml
pnpm db:validate         # Validate the shared Prisma schema
pnpm db:migrate          # Create and apply a development migration
pnpm db:migrate:deploy   # Apply committed migrations
pnpm db:seed             # Upsert bundled Goethe A2 exercises and mock Set 1
pnpm auth:set-password   # Recover a local account password (`--email`)
pnpm generate:listening-audio  # Synthesize seed WAVs (requires Kokoro)
```

## Contributing

Contributions are welcome.

### Code style

- TypeScript for all new code
- Composition API with `<script setup>` for Vue components
- DaisyUI semantic tokens for styling (no raw Tailwind palette scales)
- 2-space indentation, single quotes, trailing commas (Prettier)

### Component guidelines

- Keep components under 300 lines (split if larger)
- Extract reusable logic into composables
- Use `~/` import aliases, never `../` parent paths
- Follow existing card layout conventions

### Git workflow

- Branch naming: `feature/<description>`, `fix/<description>`, `chore/<description>`
- Commit format: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Pre-commit hooks: Husky linting and formatting

### Quality checks

- Repository-wide lint and strict TypeScript checks
- Production builds for workspace applications and libraries
- Manual checks of German / Goethe A2 practice and mock-exam flows
- Backend health and auth unit/e2e coverage

## Documentation

Product context and standards live under [`agent-os/`](./agent-os/):

- [`agent-os/product/mission.md`](./agent-os/product/mission.md) — problem, audience, positioning
- [`agent-os/product/roadmap.md`](./agent-os/product/roadmap.md) — phases and skill status
- [`agent-os/product/tech-stack.md`](./agent-os/product/tech-stack.md) — architecture and stack
- [`agent-os/product/german-exam-A2.md`](./agent-os/product/german-exam-A2.md) — Goethe A2 product reference
- [`agent-os/standards/`](./agent-os/standards/) — implementation standards
- [`scripts/README.md`](./scripts/README.md) — TTS/STT operator notes

## Roadmap

Phase 1 (frontend MVP) and Phase 2 (self-hostable Compose stack) are complete. Canonical status: [`agent-os/product/roadmap.md`](./agent-os/product/roadmap.md).

- **Next — Phase 3:** public GitHub release, community workflow, Docusaurus docs site
- **Later — Phase 4:** hosted cloud product

## License

[Your License Here]

## Acknowledgments

- Goethe-Institut for exam format inspiration
- German language learners who need better practice tools
- The Vue and Nuxt communities for excellent tooling

## Contact

[Your contact information or links]

---

Built for German language learners.

_Practice makes perfect — üben macht den Meister!_
