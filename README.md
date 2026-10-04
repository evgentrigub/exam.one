# Exam.one

Open-source, self-hostable language exam prep. The German / Goethe A2 experience is complete and tested across all four skills and mock exam mode; Goethe A1 · Start Deutsch 1 covers all four skills and mock exams too. Cambridge English A2 Key covers all four skills and mock exams, reported on the Cambridge English Scale, with typed gap-fill tasks and British English audio. Certyfikat Polski A2, the Polish state certificate exam, covers all four skills and mock exams, passed per part (written and oral) as in the real exam, with Polish audio. DELE A2, the Instituto Cervantes diploma of Spanish, covers all four skills and mock exams, passed per group as in the real exam, with Spanish audio.

Practice Reading, Writing, Listening, and Speaking with authentic exam-style content, optional AI feedback, and progress that lives in PostgreSQL after you sign in. The app is **login-gated**: register or sign in on this instance, then practice as before.

## What's included

| Area              | What's available                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Reading (Lesen)   | Practice, scoring, explanations, progress, and optional generation                                 |
| Writing (Schreiben) | Drafts, submissions, optional AI grading, and detailed review                                    |
| Listening (Hoeren) | Four exam parts, stable audio, replay rules, and optional Docker TTS                              |
| Speaking (Sprechen) | Recording, STT/manual transcripts, optional AI grading, and detailed review                      |
| Mock exam         | Bundled Set 1 per pack (Goethe A2, A1), generated local sets, automatic grading, reviews, AI overview |
| Accounts          | Login-gated NestJS session, profile, and settings; optional SMTP                                   |
| Persistence       | Skill / mock / progress / drafts on NestJS + PostgreSQL after login                                |
| AI / speech       | Optional LLM, Kokoro TTS, and Parakeet/Whisper STT proxy on NestJS                                 |
| Self-host         | One `compose.yaml`, migrate/seed on boot, durable volumes, README runbook                          |

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
- Stable WAV playback from pre-generated voices (German, British English and Spanish on Kokoro, Polish on Piper)
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
- Goethe A2, Goethe A1, DELE A2 and Cambridge A2 Key mock exam Set 1
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
| Host dirs `apps/frontend/public/audio/listening/a2/`, `a1/`, `dele-es-a2/`, `cambridge-en-a2/` | Bundled seed listening WAVs (A2 seeds, A1, DELE A2 and Cambridge mock Set 1) |

Theme, locale, listening playback volume/speed, and reading bookmarks stay in the browser.

### Exam packs

Exam definitions, LLM prompts, runtime rules, grading criteria, payload adapters, and optional bundled seeds live in [`data/`](data/README.md) (`@exam-one/exam-packs`). Add a pack by creating `data/src/packs/{packId}/` and registering it in `data/src/registry.ts`; it can use the five exercise formats and the form-fill, word-card and request-card screens. 
Five packs are live: 
**Goethe A1 · Start Deutsch 1** (practice and mock exams). 
**Goethe A2** (practice and mock exams). 
**Cambridge English A2 Key** (practice and mock exams). 
**Certyfikat Polski A2** (practice and mock exams). 
**DELE A2** (practice and mock exams). 

Select one under **Settings → Learning plan**. See the [verification and migration rollout guide](data/VERIFICATION.md).

---

## Self-host with Docker Compose

This is the supported way to run exam.one on a laptop. Copy [`.env.example`](./.env.example) to `.env`, start the stack, register the first user, and optionally add LLM keys. This README is the operator runbook.

### Requirements

| Requirement                         | Notes                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Docker Engine 24+** and Compose v2 | Docker Desktop, or engine + Compose plugin on Linux                                           |
| **Node.js 24+** and **pnpm 10.12.1+** | Required for `pnpm stack:up` (model download, migrate/seed orchestration, password recovery) |
| **RAM**                             | 4 GB minimum for the core app; 6–8 GB when building/running Kokoro and Parakeet                |
| **Disk**                            | ~2.4 GB for speech weights (about 1.3 GB Kokoro German + English, 740 MB Parakeet GGUF) plus container images |
| **OS**                              | macOS (Apple Silicon or Intel), Linux (x86_64 or arm64), Windows 10/11 with WSL2               |

### Quick start

```bash
git clone <your-repo-url>
cd exam-one
pnpm install
cp .env.example .env
```

Set `JWT_SECRET` in `.env` **before the first boot**. NestJS refuses to start if it is missing, shorter than 32 characters, or still the example placeholder:

```bash
# example
openssl rand -base64 48
```

Start everything (recommended):

```bash
pnpm stack:up
pnpm stack:ps
```

`pnpm stack:up` downloads speech models if they are missing, starts PostgreSQL and Redis, waits until NestJS has migrated and seeded the catalog and Nuxt is healthy, then starts Kokoro and Parakeet and generates bundled listening WAVs if the seed directory is empty. Redis is required at API startup; its outage also makes the core app unavailable until Redis returns.

The first run downloads about 1.7 GB of weights and builds the TTS image plus the `transcribe.cpp` STT runtime. Later starts reuse `scripts/tts/victoria/models/` and `scripts/stt/parakeet/models/`.

Core app only (no speech sidecars — mock Set 1 and practice still work; Generate audio and local STT do not):

```bash
docker compose up -d --build --wait postgres redis backend frontend
```

Services:

| Service        | URL                                      |
| -------------- | ---------------------------------------- |
| Frontend       | http://localhost:3000                    |
| Backend        | http://localhost:3001                    |
| API docs       | http://localhost:3001/api/docs (local `pnpm dev`; Compose production needs `SWAGGER_ENABLED=true`) |
| Health         | http://localhost:3001/api/v1/health/ready |
| PostgreSQL     | 127.0.0.1:5432                           |
| Redis          | 127.0.0.1:6379 (host-only)               |
| Kokoro TTS     | http://127.0.0.1:8881/v1/audio/voices    |
| Parakeet STT   | http://127.0.0.1:8882/health             |

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
OPENAI_MODEL=gpt-6-sol
```

OpenRouter:

```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
```

Restart the backend after changing keys (`pnpm stack:up` or `docker compose up -d backend`).

### Optional: speech sidecars

The Listening TTS service serves the languages in `KOKORO_LANGS` (default `de,en,pl,es`) on `:8881`: German `martin`, `bernd`, `victoria`, `eva`, British English `bf_emma`, `bf_isabella`, `bm_george`, `bm_fable` and Spanish `ef_dora`, `em_alex`, `em_santa` on Kokoro, and Polish `pl_gosia`, `pl_darkman`, `pl_bass` on Piper. The base model English and Spanish share adds about 320 MB of download and 0.5 GiB of memory, the Polish voices about 240 MB and 0.3 GiB; leave a language out of `KOKORO_LANGS` to skip it. See [scripts/tts/README.md](scripts/tts/README.md).

Parakeet (Speaking STT) serves Handy's Q8 GGUF on `:8882` and detects German, English, Polish and Spanish (`STT_LANGUAGES`, default `de,en,pl,es`). To use OpenAI Whisper instead:

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

`pnpm stack:down` and `docker compose down` **keep** named volumes. Do not pass `-v` / `--volumes` unless you intend to delete PostgreSQL data, Redis job state and generated listening audio.

Default volume names:

| Volume                               | Compose key                  | Contents                         |
| ------------------------------------ | ---------------------------- | -------------------------------- |
| `exam-one-postgres-dev-data`         | `postgres_data` (`POSTGRES_VOLUME_NAME`) | Database                   |
| `exam-one-redis-dev-data`            | `redis_data` (`REDIS_VOLUME_NAME`) | Queued work and job state  |
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

#### Redis job queue

Back up `redis_data` alongside PostgreSQL and generated audio. Stop enqueueing jobs and use `docker compose stop redis` before archiving its AOF volume; restore PostgreSQL and Redis from matching snapshots so pending queue records and job rows agree. The backend reconciles stale queued and interrupted records after restart.

To inspect queues, set `BULL_BOARD_USER` and `BULL_BOARD_PASSWORD` in `.env` and open http://localhost:3001/api/admin/queues (HTTP basic auth). Without both variables the dashboard answers 404. Each BullMQ job id is `<BackgroundJob.id>-<attempt>`, so a queue entry maps straight to its database row.

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

Seed WAVs under `apps/frontend/public/audio/listening/a2/`, `a1/`, `dele-es-a2/` and `cambridge-en-a2/` live on host bind mounts; copy that directory if you regenerated them. Speech model weights in `scripts/tts/victoria/models/` and `scripts/stt/parakeet/models/` can be re-downloaded with `pnpm stack:setup`.

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
| Auth                          | `JWT_SECRET` (required, ≥32 chars, not the placeholder), `AUTH_COOKIE_SECURE`, `SWAGGER_ENABLED` |
| Email                         | `EMAIL_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| LLM                           | `LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `LLM_REASONING_EFFORT` |
| STT                           | `STT_PROVIDER`, `STT_BASE_URL`, `STT_PORT`, `STT_CPU_THREADS`, `STT_MODEL`, `STT_LANGUAGES`, `STT_OPENAI_MODEL` |
| TTS                           | `TTS_BASE_URL`, `TTS_PORT`, `TTS_CPU_THREADS`, `TTS_CONCURRENCY`, `TTS_SPEED`, `KOKORO_LANGS`, `TTS_LANGUAGES`, `TTS_LANG`, `TTS_VOICES`, `TTS_VOICE`, `TTS_TURN_PAUSE_MS`, `TTS_PAUSE_DURATION` |
| Optional                      | `GENERATED_LISTENING_AUDIO_DIR`, `STACK_SEED_AUDIO_TIMEOUT_MS`       |

Production notes:

- Set `JWT_SECRET` to at least 32 random characters (`openssl rand -base64 48`). The backend will not start with an empty or placeholder value. Rotating it signs everyone out.
- Set `AUTH_COOKIE_SECURE=true` only behind HTTPS.
- Change `POSTGRES_PASSWORD` if the instance is reachable beyond localhost.
- Postgres, Kokoro, and Parakeet are bound to `127.0.0.1`. To share them on a LAN, change those Compose `ports` binds to `0.0.0.0`.
- Swagger is off in the Compose stack (`NODE_ENV=production`) unless `SWAGGER_ENABLED=true`.
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

**JWT_SECRET missing or rejected**  
NestJS will not boot if `JWT_SECRET` is empty, shorter than 32 characters, or still `change-me-in-production`. Generate one with `openssl rand -base64 48`.

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
openssl rand -base64 48   # paste into JWT_SECRET
pnpm dev:infra
pnpm dev
```

This starts:

- Nuxt with hot reload at http://localhost:3000 (login-gated; register on first use)
- NestJS with watch mode at http://localhost:3001
- API documentation at http://localhost:3001/api/docs (`pnpm dev` only; Compose needs `SWAGGER_ENABLED=true`)
- PostgreSQL in Docker at 127.0.0.1:5432

The root `compose.yaml` is the only Compose file. `pnpm dev:infra` selects just its `postgres` and `redis` services. Data lives in the `exam-one-postgres-dev-data` named volume; `pnpm dev:infra:down` only stops the service.

```bash
pnpm dev:infra          # Start PostgreSQL and Redis and wait until healthy
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
│       └── postman/       # Importable API collection and usage guide
├── data/                  # @exam-one/exam-packs: exam definitions and shared runtime
│   └── src/
│       ├── packs/         # Pack structure, prompts, rules, adapters, and optional seeds
│       ├── testing/       # Synthetic fixtures; excluded from production registration
│       ├── registry.ts    # Registered packs and live availability
│       └── runtime.ts     # Five formats, view adapters and grading contracts
├── libraries/
│   ├── contracts/         # Request/response types shared by Nuxt and NestJS
│   ├── database/          # Prisma schema, migrations, client exports and seed upserts
│   └── nestjs-libraries/  # PrismaModule/PrismaService for NestJS injection and lifecycle
├── agent-os/              # Implementation standards
├── scripts/               # Stack/speech utilities and pack migration/acceptance checks
├── compose.yaml           # App + PostgreSQL + Redis + Kokoro TTS + Parakeet STT
├── pnpm-workspace.yaml
└── package.json           # Workspace orchestration scripts
```

`data/` and `libraries/*` are internal pnpm workspace packages consumed by the applications; they do not run as separate servers. Edit `src/` and Prisma schema/migration files. `dist/` is generated build output, and `node_modules/` contains installed dependencies and workspace links.

| Change you want to make | Owning directory |
| --- | --- |
| Add a supported exam, change prompts, timing, replay, grading rules, or bundled passages | `data/` |
| Change the API's request/response shapes | [libraries/contracts](libraries/contracts/README.md) |
| Change tables, indexes, migrations or seed persistence | [libraries/database](libraries/database/README.md) |
| Change NestJS database connection/injection behavior | [libraries/nestjs-libraries](libraries/nestjs-libraries/README.md) |
| Change screens and browser interactions | `apps/frontend/` |
| Change endpoints, authorization or server orchestration | `apps/backend/` |

For manual API exploration, import the [Postman collection](apps/backend/postman/exam-one-backend.postman_collection.json) and follow its [usage guide](apps/backend/postman/README.md). Pack-scoped requests send `x-exam-pack: {{packId}}`; omitting that header uses the user's active pack. Historical attempt reads resolve the saved record's identity and snapshot.

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
pnpm db:seed             # Upsert every pack's bundled exercises and mock Set 1
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

- [`agent-os/standards/`](./agent-os/standards/) — implementation standards
- [`scripts/README.md`](./scripts/README.md) — TTS/STT operator notes

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
