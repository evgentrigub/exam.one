# exam.one

A self-hostable platform for English, German, Spanish, and Polish language exam preparation, organized by [CEFR level](https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions).

Practise Reading, Writing, Listening, and Speaking, take mock exams, and review your progress. Each **exam pack** provides an exam's task formats, scoring rules, bundled exercises, and prompts for optional AI generation and feedback.

Run the application locally with Docker Compose. Accounts and practice records are stored in your PostgreSQL database. Optional AI features send the content needed for generation or review to the provider you configure with your own API key.

## Supported exam packs

All ten packs include the four skills, bundled practice, and a bundled mock exam (Set 1). **Yes** means a pack is available in exam.one; **No** means that board and level are not currently supported in the app.

| Exam board / language         | A1  | A2  | B1  | B2  | C1  |
| ----------------------------- | --- | --- | --- | --- | --- |
| Goethe-Institut · German      | Yes | Yes | Yes | No  | Yes |
| TELC · German                 | No  | No  | No  | No  | No  |
| Cambridge English · English   | No  | Yes | Yes | No  | No  |
| Certyfikat Polski · Polish    | No  | Yes | Yes | No  | No  |
| Instituto Cervantes · Spanish | No  | Yes | Yes | No  | No  |

Select an exam in **Settings → Learning plan**. New accounts start on Cambridge English A2 Key. The interface is available in English, German, Spanish, Polish, and Russian; interface language and exam language are separate choices.

## What you can do

| Area       | Features                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| Reading    | Choice, matching, true/false, and gap-fill tasks with automatic scoring                    |
| Writing    | Messages, longer responses, and forms; saved drafts, model answers, and optional AI review |
| Listening  | Audio playback with exam-specific replay rules and on-demand audio generation              |
| Speaking   | Recording tasks, editable or manual transcripts, optional transcription, and AI feedback   |
| Mock exams | Bundled and generated sets, timers, saved attempts, and module reviews                     |
| Progress   | Recorded scores, completion, recent activity, and past attempts                            |

Bundled exercises and objective scoring work without an AI key. Generating new exercises or mock sets, model answers, and writing/speaking feedback requires a configured language model (LLM). New mock sets also require text-to-speech (TTS) for listening audio. Listening tasks need existing audio files or TTS to create them; speaking transcripts can be entered manually without speech-to-text (STT).

Mock results are practice estimates. Solo speaking and transcript-based feedback do not assess every aspect of a live oral exam, and progress scores do not predict certification results. Bundled exercises are original practice material; exam-board names identify the formats being practised and do not imply endorsement.

## Self-host with Docker Compose

### Requirements

- [ ] Install [Node.js 24 or newer](https://nodejs.org/en/download).
- [ ] Install pnpm 10 using npm: `npm install -g pnpm@10.12.1`
- [ ] Install [Docker Desktop or Docker Engine with Compose](https://docs.docker.com/get-docker/), including Compose's `--wait` support.
- [ ] Bash (included on macOS and most Linux systems; use WSL on Windows).
- [ ] Several GB of disk space for images, speech models, and audio. Allow around 4 GB RAM for the core stack, with more for builds and speech services.

### Quick start

1. From the `exam-one` repository root, run the installer. It works before pnpm or project dependencies are installed and reports any missing prerequisites with installation instructions:

```bash
bash scripts/stack-install.sh
```

The installer checks Node, npm availability, the pinned pnpm version, Docker Compose's health-wait support, and access to the running Docker engine. Missing prerequisites stop installation; install or fix the reported tools and rerun the same command. npm is optional when pnpm already works. No tools are installed globally by the script.

After checks pass, it creates `.env` from the template if needed, generates missing secrets using Node's crypto module, runs `pnpm install --frozen-lockfile`, and starts the existing stack workflow. Existing nonempty secrets and settings are preserved; invalid secrets must be corrected before installation continues. No host Python or OpenSSL is required for this workflow.

With pnpm available, the equivalent command is `pnpm stack:install`. To check prerequisites without changing files or starting services:

```bash
bash scripts/stack-install.sh --check
```

Initial setup can take 10–15 minutes to build images, download speech models, and prepare bundled listening audio. Rerun the installer after a failure to retry; existing secrets and stored data are retained. For an existing installation, keep your `.env` and follow [Upgrades](#upgrades).

2. Open the frontend URL printed by the installer (default [http://localhost:3000](http://localhost:3000)) and register an account with any email. In the top right navbar click question mark icon to open `Quick Start` guide.
3. By default, the app is configured to use the `Cambridge English A2` exam. Choose your exam in **Settings → Learning plan**.
4. Set AI provider credentials in **Settings → AI providers** to enable AI features to generate exercise, exercise feedback, and mock exams.
5. For other exams, download voices in **Settings → Generated files → Voice models**, then generate the pack's listening audio in the app. Transcription models are managed under **Settings → Generated files → Speech models**.

Startup applies database migrations and seeds bundled content. It starts the core application first, then downloads speech models, starts TTS/STT, and prepares listening audio. The first run can take several minutes; the app becomes usable while speech setup continues.

### Run without speech services

For a first installation without speech services, use:

```bash
bash scripts/stack-install.sh --core
```

For subsequent starts of an already configured core stack, use:

```bash
pnpm stack:up:core
```

Accounts, text-based practice, history, and saved mock attempts work with the core stack. Listening needs previously prepared audio; manual speaking transcripts remain available. To add speech later, run `pnpm stack:up:speech`.

### Inspect and stop

```bash
docker compose ps       # Show service status
docker compose logs -f  # Follow logs; Ctrl+C stops following
pnpm stack:down         # Stop the stack while preserving data
```

The API defaults to [http://localhost:3001](http://localhost:3001), with readiness at [/api/v1/health/ready](http://localhost:3001/api/v1/health/ready). API documentation at [/api/docs](http://localhost:3001/api/docs) is enabled in local development; Compose requires `SWAGGER_ENABLED=true`.

## Optional providers

### AI generation and feedback

In **Settings → AI provider**, choose OpenAI, OpenRouter, Google Gemini, Anthropic, or xAI, enter your API key, and select a model. Each user configures their own key. Keys are validated before saving, encrypted with `SECRETS_ENCRYPTION_KEY`, and never returned to the browser. Provider usage may incur charges; generation and review follow the selected provider's data policies.

Existing bundled content and objective scoring remain usable without a key. Background generation jobs can be inspected and retried in **Activity**.

### Speech

TTS generates listening audio locally: German, British English, and Spanish use Kokoro; Polish uses Piper. Existing audio plays without a running TTS service.

STT transcribes recordings locally using Phonon 2 for English and Parakeet Q4 for German, Polish, and Spanish. Models, voices, and STT language preferences are shared across the instance. Speaking recordings are temporary; transcripts and reviews are persisted.

See the [TTS guide](scripts/tts/README.md) and [STT guide](scripts/stt/README.md) for language setup, model downloads, storage, and upgrades.

### Email

Email is disabled by default (`EMAIL_PROVIDER=none`), so registration auto-verifies accounts. Configure SMTP in `.env` for verification and password-reset email. Without SMTP, an instance operator can reset a local password with:

```bash
pnpm auth:set-password --email you@example.com
```

## Configuration

Use [.env.example](.env.example) for the complete list of settings, defaults, and setup notes. It covers ports, database/Redis connections, authentication, email, speech languages, and media paths. LLM API keys are configured per user in Settings.

For local HTTP, keep `AUTH_COOKIE_SECURE=false`; enable secure cookies when serving over HTTPS. The supplied Compose configuration targets local use and uses localhost browser URLs. PostgreSQL, Redis, and speech ports bind to localhost by default.

Keep `.env` with your backups: changing `JWT_SECRET` signs users out, and losing or changing `SECRETS_ENCRYPTION_KEY` makes saved AI keys unreadable.

## Backup, restore, and upgrades

Stopping the stack preserves data. **`docker compose down -v` deletes the PostgreSQL and Redis volumes.** Audio and model files are stored separately on the host.

### Database

With PostgreSQL running, create a backup:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U exam_one -d exam_one --clean --if-exists \
  > "backups/exam-one-postgres-$(date +%Y%m%d).sql"
```

Restore into the intended instance with backend writes stopped:

```bash
docker compose stop backend
docker compose exec -T postgres psql -U exam_one -d exam_one \
  < backups/exam-one-postgres-YYYYMMDD.sql
docker compose start backend
```

Replace the backup filename and use your configured database/user names if they differ.

### Queue, audio, and models

Back up these resources alongside the database:

- Redis's named volume, with backend workers and Redis stopped, to preserve queued work consistently with the database snapshot.
- `apps/frontend/public/audio/listening/`, including `generated/`, for bundled and generated audio.
- `scripts/stt/models/`, including `preferences.json`, for STT models and instance language choices.
- `scripts/tts/victoria/models/` for TTS models and voices.
- `.env`, including the encryption key needed to read saved AI keys.

Default volume names are `exam-one-postgres-dev-data` and `exam-one-redis-dev-data`; `.env` can override them. Stop speech services before copying model state. Model weights can also be downloaded again using the [speech guides](scripts/README.md#speech-services).

### Upgrades

Back up the instance, then update the checkout:

```bash
git pull
pnpm install
pnpm stack:up
```

Backend startup applies committed migrations and upserts bundled content while preserving user-generated records.

## Troubleshooting

| Symptom                        | Check                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| API will not start             | Both required secrets in `.env`, PostgreSQL/Redis health, and `docker compose logs -f backend`                                    |
| Port conflict                  | Adjust the relevant `*_PORT` in `.env` or stop the conflicting process                                                            |
| Cannot sign in over local HTTP | Keep `AUTH_COOKIE_SECURE=false` and check the database is available                                                               |
| Missing listening audio        | Install voices for the exam language and generate its audio in Settings; see the [TTS guide](scripts/tts/README.md#bundled-audio) |
| Transcription unavailable      | Install/select a model for the exam language in Settings; manual transcripts remain available                                     |
| AI unavailable                 | Check the provider, key, and model in **Settings → AI provider**                                                                  |
| Generation interrupted         | Inspect **Activity** and retry the failed job; completed checkpoints are retained                                                 |

See the [stack and speech tools](scripts/README.md) for advanced setup and diagnostics.

## Local development

Install dependencies with `pnpm install`. If `.env` does not exist, copy `.env.example` to `.env` and set both required secrets. For manual setup, `openssl rand -base64 48` generates a JWT secret and `openssl rand -base64 32` generates the encryption key; keep existing secrets when updating an installation. Then run Nuxt and NestJS on the host with PostgreSQL and Redis in Docker:

```bash
pnpm dev:infra
pnpm --filter @exam-one/exam-packs build
pnpm --filter @exam-one/database db:generate
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

The frontend defaults to port 3000 and the backend to 3001. `pnpm dev` builds backend workspace dependencies and starts both apps with hot reload. Host development requires explicit migration/seeding because it does not use the Docker entrypoint.

Database CLI commands do not automatically load `.env`; they use an exported `DATABASE_URL` or the default localhost development URL. Export it explicitly for a custom database. See the [database guide](libraries/database/README.md). Stop host development with Ctrl+C and its database/Redis containers with `pnpm dev:infra:down`.

## Architecture

Nuxt 4 / Vue 3 provides the UI, NestJS handles authentication and application APIs, PostgreSQL/Prisma stores accounts and practice records, and Redis/BullMQ runs background jobs. PostgreSQL and Redis are required; AI, speech, and SMTP are optional.

Practice records are scoped by user and exam pack. Saved attempts retain content and grading snapshots. Browser storage holds interface preferences such as theme, locale, and playback settings.

### How the framework works

Exam packs own their task structure, content, prompts, and scoring rules. Shared screens and APIs serve every pack; see the [pack authoring guide](data/README.md) for supported task formats and registration in [the registry](data/src/registry.ts).

## Project structure

| Path                          | Purpose / guide                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend/`              | Nuxt screens, interactions, and audio serving                                                                       |
| `apps/backend/`               | NestJS API, workers, authentication, and provider integration; [Postman collection](apps/backend/postman/README.md) |
| `data/`                       | Exam definitions, prompts, content, and scoring; [pack authoring guide](data/README.md)                             |
| `libraries/contracts/`        | [Shared API types](libraries/contracts/README.md)                                                                   |
| `libraries/database/`         | [Prisma schema, migrations, and seeding](libraries/database/README.md)                                              |
| `libraries/nestjs-libraries/` | [Shared backend infrastructure](libraries/nestjs-libraries/README.md)                                               |
| `scripts/`                    | [Stack, speech, and content tools](scripts/README.md)                                                               |
| `compose.yaml`                | Docker Compose services and persistent storage                                                                      |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, pull requests, content provenance, and contribution licensing. Participation in project spaces follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately using the [Security Policy](SECURITY.md).

Start with [AGENTS.md](AGENTS.md) and the [implementation standards](agent-os/standards/). Keep shared practice flows independent of language and exam board; place exam-specific content and rules in the owning pack.

For application changes, run `pnpm lint`, `pnpm type-check`, and the relevant tests, and verify affected practice/mock flows. `pnpm test` includes backend tests, schema validation, and STT catalog tests; the latter require host Python 3.10+.

## License and attribution

Copyright (c) 2026 exam.one contributors.

Except where a file or third-party notice states otherwise, exam.one's original code, documentation, and bundled practice content are licensed under the **GNU Affero General Public License v3.0 only (`AGPL-3.0-only`)**. See [LICENSE](LICENSE) for the full terms. This declaration does not license user records, API keys, or third-party material as project source.

Commercial use and paid hosting are permitted under the license. If you modify the program and let users interact with it over a network, AGPLv3 section 13 requires a prominent offer of the corresponding source of that modified version to those users. The license does not reserve commercial hosting to the project maintainers.

Speech engines, models, voices, and other dependencies retain their own licenses. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the [TTS](scripts/tts/README.md) and [STT](scripts/stt/README.md) guides. Exam-board names identify the formats being practised and do not imply endorsement or affiliation.

See [CHANGELOG.md](CHANGELOG.md) and the [v1.0.0 release](https://github.com/evgentrigub/exam.one/releases/tag/v1.0.0) for the first release.
