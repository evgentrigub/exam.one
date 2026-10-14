# exam.one

An open-source and self-hostable platform for language certification exam preparation.
Prepare for English, German, Spanish, Polish exams.

exam.one brings Reading, Writing, Listening, Speaking, and mock exams into one reusable application.
Each **exam pack** defines

- a language
- exam board
- CEFR level
- task structure
- prompts
- scoring rules
- and bundled content.

Learners choose a pack; contributors extend the catalog through the same framework.

The project focuses on repeatable, exam-style practice across languages and levels. Shared accounts, practice flows, history, AI integration, and speech services support every pack. Exam-specific content and rules live with the pack that owns them.

Run the application on your own machine with Docker Compose. Practice data stays in your PostgreSQL database, and optional AI features use the instance's configured OpenAI or OpenRouter key. The roadmap includes an open-source release and a later hosted cloud offering.

## What you can do

| Area       | Available behavior                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Reading    | Choice, matching, true/false, and typed gap-fill tasks; scoring and explanations                      |
| Writing    | Messages, longer responses, and forms; saved drafts, model answers, and optional AI review            |
| Listening  | Shared or per-item WAV playback, pack-defined replay rules, and on-demand audio generation            |
| Speaking   | Structured recording tasks, editable or manual transcripts, optional STT, and AI feedback             |
| Mock exams | Bundled Set 1 for each live pack, generated sets, timers, saved attempts, and detailed module reviews |
| Progress   | Completion, recorded scores, recent activity, and review of past attempts                             |
| Activity   | Server-side generation jobs with progress, cancellation, retry, and completion notifications          |
| Media      | Listening audio inventory, playback/deletion, voice downloads, and a default voice per language       |
| Accounts   | Email/password registration, cookie sessions, profile/settings, and optional SMTP                     |

AI generation, model answers, and rubric feedback require a configured LLM. Objective tasks are scored without an LLM. Listening requires existing WAVs or a working TTS service to create them. Speaking transcripts can be entered manually when recording or STT is unavailable.

Practice adaptations are defined by each pack. Solo speaking and transcript-based feedback do not assess every aspect of a live oral exam; mock results are practice estimates. The progress dashboard combines scores and completion indicators rather than predicting a certification result.

## Supported exam packs

All ten live packs provide Reading, Writing, Listening, Speaking, bundled practice content and mock exams. Each includes bundled Set 1 and supports generating additional sets with configured AI and TTS providers:

| Exam                     | Language | Level | Pack ID           |
| ------------------------ | -------- | ----- | ----------------- |
| Goethe · Start Deutsch 1 | German   | A1    | `goethe-de-a1`    |
| Goethe-Zertifikat A2     | German   | A2    | `goethe-de-a2`    |
| Goethe-Zertifikat B1     | German   | B1    | `goethe-de-b1`    |
| Goethe-Zertifikat C1     | German   | C1    | `goethe-de-c1`    |
| Cambridge A2 Key         | English  | A2    | `cambridge-en-a2` |
| Cambridge B1 Preliminary | English  | B1    | `cambridge-en-b1` |
| Certyfikat Polski A2     | Polish   | A2    | `certpol-pl-a2`   |
| Certyfikat Polski B1     | Polish   | B1    | `certpol-pl-b1`   |
| DELE A2                  | Spanish  | A2    | `dele-es-a2`      |
| DELE B1                  | Spanish  | B1    | `dele-es-b1`      |

Select an exam in **Settings → Learning plan**. New accounts start on Cambridge English A2 Key. German, English, Spanish, Polish, and Russian are available as interface languages; interface locale and the language being studied are separate choices.

All four B1 packs include fresh mock-exam tasks, saved attempts, paper timers and detailed reviews. Their bundled Set 1 tasks are separate from the individual practice catalog:

| B1 exam                  | Practice tasks | Set 1 tasks | Mock result rules                                                                                |
| ------------------------ | -------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Cambridge B1 Preliminary | 16             | 16          | Estimated Cambridge English Scale; pass threshold 140                                            |
| Goethe-Zertifikat B1     | 15             | 15          | Four independent modules; at least 60/100 in each after whole-point rounding                     |
| Certyfikat Polski B1     | 23             | 23          | Five independent papers: Listening, Reading, Grammar, Writing and Speaking; at least 50% in each |
| DELE B1                  | 16             | 16          | Each paper normalized to /25; at least 30/50 in both Reading + Writing and Listening + Speaking  |

English B1 uses solo speaking cues, written scene descriptions and assigned article/story tasks. See the [brief](data/src/packs/cambridge-en-b1/brief.md) and [verification](data/src/packs/cambridge-en-b1/verification.md).

Polish B1 places clearly labelled grammar tasks under Reading for individual practice, while mocks keep Reading and Grammar as separate papers. Written papers are /30 and Speaking is normalized to /40; fractional results below a pass threshold stay below it. See the [brief](data/src/packs/certpol-pl-b1/brief.md) and [verification](data/src/packs/certpol-pl-b1/verification.md).

Spanish B1 retains five reading, five listening, two writing and four solo speaking tasks, including the 100–120 and 130–150-word writing ranges. Mock pass groups use exact scores without rounding a failed group up to 30/50. See the [brief](data/src/packs/dele-es-b1/brief.md) and [verification](data/src/packs/dele-es-b1/verification.md).

German B1 retains all three writing tasks and their /40, /40 and /20 rubrics. Speaking uses fixed partner cues and transcript-based feedback. See the [brief](data/src/packs/goethe-de-b1/brief.md) and [verification](data/src/packs/goethe-de-b1/verification.md).

Prepare the B1 listening WAVs using the [bundled-audio instructions](scripts/tts/README.md#bundled-audio). Set 1 attempts and objective scores work without an LLM; writing/speaking grades and AI reviews require a configured LLM. All mock results remain practice estimates.

Goethe C1 includes 12 original practice tasks, 20 prompt slots and 12 separate Set 1 tasks in the current modular format. Reading, Listening, Writing and Speaking use 65/40/75/20-minute timers. Speaking adds saved 20-minute preparation, a choice of two presentation topics and notes. Writing uses the recovered C1 prompts with corrected A–E rubrics; Speaking uses fixed partner cues and a provisional transcript score. See its [brief](data/src/packs/goethe-de-c1/brief.md) and [verification](data/src/packs/goethe-de-c1/verification.md).

Before activating a replacement C1 catalog on an existing installation, run the one-time `pnpm db:prune --pack goethe-de-c1`, then `pnpm db:seed`. This removes C1 practice, mocks, jobs and obsolete prompt overrides while preserving accounts, sessions, settings and other packs. Running jobs must acknowledge cancellation before deletion. Normal startup and seeding never prune. Prepare its 14 listening WAVs with `TTS_CONCURRENCY=1 pnpm generate:listening-audio --packs goethe-de-c1`; later runs reuse transcript hashes.

The [registry](data/src/registry.ts) determines availability. Additional levels and boards can be introduced as packs; a new task interaction may also require a shared application component.

## How the framework works

A pack owns:

- Exam identity, language, level, modules, parts, timing, and practice instructions.
- Generation, model-answer, and review `PromptSpec`s.
- Payload adapters, validation, objective answers, rubrics, and scoring rules.
- Optional bundled exercises, listening audio maps, and mock definitions.
- Speech language and voice metadata.

Six formats are supported: `selection`, `matching`, `true-false`, `gap-fill`, `freeform`, and `recording`. Dedicated layouts support form filling, word cards, and request cards. Packs using existing interactions can be added under `data/src/packs/` and registered in `data/src/registry.ts`.

Practice screens consume established payload shapes. The shared runtime projects those payloads into views for validation, scoring, speech, and historical review. A new interaction extends the shared framework once and can then be reused by other packs.

See the [exam-pack authoring guide](data/README.md) for contracts, examples, and verification.

## Architecture

| Component                          | Responsibility                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Nuxt 4 / Vue 3 frontend            | Practice screens, account UI, Activity center, and audio serving                        |
| NestJS API                         | Authentication, persistence, pack context, AI/speech integration, and job orchestration |
| PostgreSQL / Prisma                | Accounts, settings, exercises, attempts, drafts, reviews, mock state, and job records   |
| Redis / BullMQ                     | Work queues and live job-event delivery                                                 |
| Local TTS (text-to-speech) service | German, British English, and Spanish on Kokoro; Polish on Piper                         |
| Local STT (speech-to-text) service | Parakeet transcription                                                                  |

The browser loads the Nuxt UI and calls the NestJS API. Requests carry the selected pack identity; practice records are scoped by user and pack. Saved attempt snapshots preserve the content and grading rules used at submission.

PostgreSQL and Redis are required for the core application.
LLM, TTS, STT, and SMTP are **optional** integrations.
The default worker runs inside the backend process; generation continues independently of the browser tab.

### Storage

| Store                                   | Contents                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| PostgreSQL named volume                 | Accounts, settings, catalogs, attempts, drafts, reviews, mock sets, and background job records |
| Redis named volume                      | Queue state and pending work                                                                   |
| `apps/frontend/public/audio/listening/` | Bundled listening WAVs and user/pack-scoped audio under `generated/`                           |
| `scripts/tts/victoria/models/`          | Installed TTS model and voice files                                                            |
| `scripts/stt/parakeet/models/`          | Local STT model                                                                                |
| Browser preferences                     | Theme, locale, playback preferences, and reading bookmarks                                     |

Practice data is API-backed after login. Speaking audio blobs are temporary; transcripts and reviews are persisted. **Settings → Generated files** manages audio and voices. Bundled audio and installed models are shared instance resources; generated audio is organized by user and pack.

## Self-host with Docker Compose

Run these commands from the application repository checkout.

### Requirements

- Node.js 24 or newer and pnpm 10 (the repository pins pnpm 10.12.1).
- Docker Engine and Docker Compose v2 with healthcheck support.
- Several GB of free disk space for images, speech weights, and generated audio.
- Around 4 GB RAM for the core stack; allow more for image builds and local speech services.

### Quick start

```bash
pnpm install
cp .env.example .env
openssl rand -base64 48
```

Paste the generated value into `JWT_SECRET` in `.env`. The backend rejects an empty value, values shorter than 32 characters, and the example placeholder.

```bash
pnpm stack:up
pnpm stack:ps
```

Open [http://localhost:3000](http://localhost:3000) and register an account. There is no seeded operator account.

`stack:up` downloads missing speech models, starts PostgreSQL and Redis, waits for the API and frontend, starts the speech sidecars, and prepares bundled listening audio. The backend container applies committed migrations and upserts bundled content on boot, preserving user-generated rows.

First-run TTS setup installs English voices, and seed-audio preparation selects Cambridge A2 Key. Download other languages in **Settings → Generated files → Voice models**, or prepare them before startup:

```bash
KOKORO_LANGS=en,de,pl,es pnpm tts:setup
pnpm stack:seed-audio --packs all
```

The seed command requires TTS to be running with voices for the selected packs. Existing downloads and audio are reused.

### Core stack without speech

```bash
docker compose up -d --build --wait postgres redis backend frontend
```

Accounts, text-based practice, saved history, and mock state work without speech sidecars. Listening playback requires WAVs prepared earlier; missing audio must be generated before those tasks can be completed. Manual speaking transcripts remain available.

### Services

| Service       | Default address                           |
| ------------- | ----------------------------------------- |
| Frontend      | http://localhost:3000                     |
| Backend       | http://localhost:3001                     |
| API readiness | http://localhost:3001/api/v1/health/ready |
| Swagger       | http://localhost:3001/api/docs            |
| PostgreSQL    | 127.0.0.1:5432                            |
| Redis         | 127.0.0.1:6379                            |
| TTS           | http://127.0.0.1:8881                     |
| STT           | http://127.0.0.1:8882                     |

Swagger is enabled in local development and disabled in Compose production unless `SWAGGER_ENABLED=true`. Database, Redis, and speech ports bind to localhost by default. Compose application ports are configured through `.env`.

## Optional providers

### LLM

Each user brings their own key. In **Settings → AI provider** a user picks OpenAI, OpenRouter, Google Gemini, Anthropic or xAI, pastes an API key, chooses a model from the provider's live list, and optionally sets a reasoning effort (default `medium`) and up to three fallback models. Keys are checked with the provider before they are saved, stored encrypted with `SECRETS_ENCRYPTION_KEY`, and never sent back to the browser. There are no LLM environment variables.

OpenRouter's `:free` models cost nothing but are rate-limited and may use prompts for training; the settings screen warns about this.

Existing exercises and objective scoring work with empty keys. Generation, model answers, writing/speaking review, and aggregate mock feedback report their availability explicitly.

### Speech

```bash
pnpm tts:up
pnpm stt:up
```

TTS checks the selected pack's language and available voices. Installed voice files are reused and runtime downloads load without a restart. Stable WAV playback needs no live synthesis once files exist.

STT uses local Parakeet. Manual transcripts are available when it is unavailable.

Details: [TTS guide](scripts/tts/README.md), [STT guide](scripts/stt/README.md).

### Email

`EMAIL_PROVIDER=none` is the default. SMTP enables verification/reset mail and optional mock-ready notifications. Without SMTP, recover an existing local account with:

```bash
pnpm auth:set-password --email you@example.com
```

## Backup, restore, and upgrades

Stopping containers preserves named volumes and host files:

```bash
pnpm stack:down
docker compose down
```

`docker compose down -v` deletes this Compose project's named PostgreSQL and Redis volumes. Host audio/model folders remain on disk.

Default volume names are `exam-one-postgres-dev-data` and `exam-one-redis-dev-data`, configurable with `POSTGRES_VOLUME_NAME` and `REDIS_VOLUME_NAME`.

### Database

With PostgreSQL running:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U exam_one -d exam_one --clean --if-exists \
  > "backups/exam-one-postgres-$(date +%Y%m%d).sql"
```

Restore the chosen backup into the intended instance:

```bash
docker compose exec -T postgres psql -U exam_one -d exam_one \
  < backups/exam-one-postgres-YYYYMMDD.sql
```

Use your configured database/user names if they differ. Stop backend writes while restoring.

### Queue and media

Back up Redis's AOF volume with writes stopped, alongside a matching database snapshot. Stop the backend workers and Redis before archiving the queue volume. The backend reconciles interrupted work after restart.

Back up listening audio from the host:

```bash
mkdir -p backups
tar -czf "backups/listening-audio-$(date +%Y%m%d).tar.gz" \
  -C apps/frontend/public/audio listening
```

Model folders can be backed up or downloaded again with `pnpm stack:setup`. Older installations may retain the `exam-one_generated_listening_audio` volume; copy its contents into the host `generated/` folder and verify playback before removing that old volume. There is no current `stack:migrate-generated-audio` command.

### Upgrade

Back up the instance, then update the checkout:

```bash
git pull
pnpm install
pnpm stack:up
```

Committed migrations and bundled-content upserts run during backend container startup.

## Configuration

[.env.example](.env.example) is the complete configuration template.

| Area            | Main variables                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| App/network     | `FRONTEND_PORT`, `BACKEND_PORT`, `FRONTEND_URL`, `NUXT_PUBLIC_API_URL`, `FRONTEND_LANDING_URL`                     |
| Database        | `POSTGRES_*`, `DATABASE_URL`                                                                                       |
| Jobs            | `REDIS_URL`, `REDIS_PORT`, `REDIS_VOLUME_NAME`, `JOBS_WORKER_ENABLED`                                              |
| Queue dashboard | `BULL_BOARD_USER`, `BULL_BOARD_PASSWORD`                                                                           |
| Auth            | `JWT_SECRET`, `SECRETS_ENCRYPTION_KEY`, `AUTH_COOKIE_SECURE`, `SWAGGER_ENABLED`                                    |
| Email           | `EMAIL_PROVIDER`, `SMTP_*`                                                                                         |
| TTS             | `TTS_BASE_URL`, `TTS_PORT`, `KOKORO_LANGS`, `TTS_LANGUAGES`, `TTS_VOICES`, `TTS_SPEED`, `TTS_CONCURRENCY`          |
| STT             | `STT_BASE_URL`, `STT_PORT`, `STT_LANGUAGES`, `STT_MODEL`, `STT_CPU_THREADS`                                        |
| Media           | `SEED_LISTENING_AUDIO_DIR`, `GENERATED_LISTENING_AUDIO_DIR`, `AUDIO_HOST_DISPLAY_ROOT`, `STACK_SEED_PACKS`         |

Redis must be reachable at API startup and participates in readiness checks. Bull Board is available at `/api/admin/queues` with HTTP basic authentication when both dashboard credentials are set; otherwise it returns 404.

For HTTP localhost, keep `AUTH_COOKIE_SECURE=false`. Enable secure cookies when serving over HTTPS. Rotating `JWT_SECRET` invalidates sessions. Rotating `SECRETS_ENCRYPTION_KEY` makes saved LLM keys unreadable, so users paste them again. The current deployment defaults target a local self-hosted instance; managed cloud hosting is separate roadmap work.

## Troubleshooting

| Symptom                      | Check                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Port conflict                | Change the Compose `*_PORT` variable or stop the conflicting process; inspect `pnpm stack:ps`                      |
| API will not start           | Check `JWT_SECRET`, database connectivity, Redis, and backend logs                                                 |
| Readiness is degraded        | Check both PostgreSQL and Redis health                                                                             |
| Cannot sign in on HTTP       | Keep secure cookies off on localhost; check the database volume still exists                                       |
| Forgot password without SMTP | Run `pnpm auth:set-password --email you@example.com`                                                               |
| Missing speech models        | Run `pnpm stack:setup` and `pnpm stack:verify-models`                                                              |
| Missing listening audio      | Install voices for that language, start TTS, then generate audio in-app or run `stack:seed-audio --packs <packId>` |
| TTS reports unsupported      | Check the pack's language/voices against installed models and `TTS_LANGUAGES` / `TTS_VOICES`                       |
| AI unavailable               | Check the selected provider, key, model, and connection; restart after env changes                                 |
| Generation interrupted       | Inspect Activity and retry the failed job; saved checkpoints retain completed work                                 |

Speech builds and model startup can take several minutes. Follow `pnpm stack:logs` or the individual service logs to see progress.

## Local development

Run Nuxt and NestJS on the host with PostgreSQL and Redis in Docker:

```bash
pnpm install
cp .env.example .env
# Set JWT_SECRET in .env before starting the API.
pnpm dev:infra
pnpm --filter @exam-one/exam-packs build
pnpm --filter @exam-one/database db:generate
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

Database CLI commands use an exported `DATABASE_URL`, with a default localhost development URL when absent. Export it explicitly for a custom database; Nest's loading of `.env` does not configure separate CLI processes.

`pnpm dev` builds backend workspace dependencies and starts both apps with watch/hot reload. Host development does not use the container entrypoint, so migrate/seed explicitly. The frontend runs on port 3000 and the backend defaults to 3001. Optional speech services use the same root Compose file.

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm dev:infra:logs
pnpm dev:db:shell
pnpm dev:infra:down
```

`dev:infra:down` stops PostgreSQL and Redis without deleting their volumes.

## Project structure

```text
exam-one/
├── apps/frontend/          # Nuxt UI and audio serving
├── apps/backend/           # NestJS API, workers, AI/speech and media
│   └── postman/            # Manual API collection
├── data/                  # Exam-pack definitions and shared runtime
│   └── src/packs/         # Per-exam structure, prompts, rules and content
├── libraries/contracts/   # Framework-neutral API types
├── libraries/database/    # Prisma schema, migrations, client and seeder
├── libraries/nestjs-libraries/ # Shared NestJS database infrastructure
├── agent-os/standards/    # Implementation standards
├── scripts/               # Stack, speech, locale and prompt-evaluation tools
├── compose.yaml
└── pnpm-workspace.yaml
```

Internal packages are consumed by the apps; they do not run separate servers. Edit source files rather than generated `dist/` or Prisma Client output.

| Change                                                    | Owner / guide                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| Exam content, prompts, timing, scoring, seeds             | [Exam packs](data/README.md)                                  |
| Shared API shapes                                         | [Contracts](libraries/contracts/README.md)                    |
| Schema, migrations, seed persistence                      | [Database](libraries/database/README.md)                      |
| NestJS database lifecycle                                 | [Shared infrastructure](libraries/nestjs-libraries/README.md) |
| Screens and interactions                                  | `apps/frontend/`                                              |
| Endpoints, authorization, jobs and provider orchestration | `apps/backend/`                                               |
| Manual API exploration                                    | [Postman](apps/backend/postman/README.md)                     |
| Stack and speech utilities                                | [Scripts](scripts/README.md)                                  |

The wider workspace has sibling repositories for [product/design docs](../exam-one-docs/README.md), [landing](../exam-one-landing/README.md), and [stack/browser tests](../exam-one-e2e/README.md). Those sibling links require the corresponding checkout.

## Commands and verification

```bash
pnpm build                 # Build the workspace
pnpm lint                  # Lint workspace source
pnpm type-check            # Type-check workspace packages
pnpm test                  # Backend/shared unit tests and Prisma validation
pnpm test:e2e              # Backend auth/health HTTP tests against a real database
pnpm i18n:check             # Check interface locale key parity
pnpm stack:setup            # Download configured speech models
pnpm stack:verify-models    # Check model snapshots
pnpm stack:seed-audio       # Prepare bundled audio for the default/selected packs
pnpm stack:up              # Start core, speech and bundled-audio preparation
pnpm stack:down            # Stop the stack; preserve named volumes
pnpm stack:logs
pnpm stack:ps
pnpm db:validate
pnpm db:migrate             # Create/apply a development migration
pnpm db:migrate:deploy      # Apply committed migrations
pnpm db:seed                # Upsert registered packs' bundled content
```

Frontend and exam-pack package `test` scripts are placeholders; pack/runtime tests live in backend Jest. Browser smoke, auth, and pack-switching tests are being developed in the sibling E2E repository. See its README for current scope and isolated-stack setup.

## Contributing

Start with [AGENTS.md](AGENTS.md) and [implementation standards](agent-os/standards/). Keep shared flows independent of exam board and language, and place exam-specific rules in the owning pack.

For pack work, use the [authoring guide](data/README.md) and project-local [exam-pack-author skill](.agents/skills/exam-pack-author/SKILL.md). For application changes, follow existing TypeScript, Vue Composition API, DaisyUI semantic-token, and NestJS patterns. Run the relevant checks above and verify affected practice/mock behavior for the packs involved.

## Project direction

The current implementation focuses on the generic self-hosted platform and its live pack catalog. Planned work includes more levels/boards, broader automated end-to-end coverage, public release documentation, and learning features informed by recorded attempts. Hosted accounts, paid plans, and classroom/cohort features belong to later phases.

## License and attribution

A project license has not yet been added to this checkout. Speech engines, models, and other dependencies retain their own licenses; see the speech guides for attribution.

Bundled exercises are original practice material. Exam-board names identify the formats being practised and do not imply endorsement. Thanks to the contributors, language learners, and open-source communities building the application and its dependencies.
