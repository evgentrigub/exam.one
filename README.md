# Exam.one 🎓

> Open-source, self-hostable language exam prep. The German / Goethe A2 experience is complete and tested across all four skills and mock exam mode.

Practice Reading, Writing, Listening, and Speaking with authentic exam-style content, optional AI feedback, and local-first progress tracking. The app is **login-gated**: register or sign in on this instance, then practice as before.

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

**Current implementation focus:** Phase 2.6 self-host runbook. See the roadmap.

## ✨ Features

### 📚 Reading Practice

- **Different Text Topics**: Email, notice, article, advertisement, and instructions
- **Comprehension Questions**: 4 per text with detailed German explanations
- **Instant Feedback**: Green checkmarks for correct answers, red X's with explanations
- **Smart Filtering**: By text type (email, article, etc.) and completion status
- **Flexible Sorting**: By title, type, difficulty, score, or word count
- **Progress Tracking**: Completion indicators, best scores, attempt counts
- **Resume Functionality**: Pick up where you left off
- **Deep-Linkable**: Share or bookmark specific quiz sessions

### ✍️ Writing Practice

- **Writing Topics**: informal emails and formal correspondence
- **Three-Card Interface**: Description, instructions, and editor clearly separated
- **Real-Time Validation**: Word count with color-coded feedback (red: under/over, green: perfect)
- **Draft Saving**: Automatic save to continue later
- **Text Analysis**: Instant feedback on structure, vocabulary, and completeness
  - Sentence and paragraph counting
  - Greeting/closing detection
  - Vocabulary diversity metrics
  - Formality level assessment
  - German-specific suggestions
- **Progress Tracking**: Track submissions, completion rates, and improvement

### 🎧 Listening Practice

- **Goethe A2 Teile 1–4**: MCQ sessions with shared or per-item audio players
- **Stable WAV playback**: Pre-generated Kokoro German voices (identical on every replay)
- **On-demand TTS**: Generate missing audio when Kokoro is up (`pnpm tts:up` + Generate audio)
- **Optional AI**: Transcript generation separate from audio generation

### 🎤 Speaking Practice

- **Exam-oriented speaking sessions**: Structured interview/question and monologue recording with editable transcripts
- **Optional STT**: Local Parakeet (`pnpm stt:up`) or OpenAI Whisper, with manual-text fallback
- **Optional AI review**: Direct-point criteria, explanations, strengths, improvements, and local attempt persistence
- **Mock exam integration**: Automatic grading and persisted detailed review on completed attempts

### Accounts (Phase 2.2)

- Register / sign in on this instance (email + password). No default operator account.
- Profile and exam settings (level, target language) persist in PostgreSQL.
- SMTP is optional (`EMAIL_PROVIDER=none` by default). Recover a password with `pnpm auth:set-password --email you@example.com`.

### 📊 Progress Dashboard

- **Comprehensive Statistics**: Completion rates, average scores, best scores
- **Recent Activity**: Time-based formatting (Today, Yesterday, X days ago)
- **Per-skill analytics**: Reading, writing, listening, and speaking progress foundations
- **Visual Indicators**: Completion badges, progress bars, trend displays

### 🤖 Optional AI Enhancement

- **Bring-your-own-key**: OpenAI / OpenRouter via thin Nuxt server routes
- **Generate & review**: Exercises and feedback when keys are configured
- **Graceful degrade**: Core practice works without AI

## 🏗️ Architecture

### Offline-First Core ✅

The completed Phase 1 core flows work without a cloud AI provider **after you are signed in** (local API/PostgreSQL):

- Reading, writing, listening, and speaking practice
- Goethe A2 mock exam Set 1
- Progress tracking and statistics
- Draft saving and resume functionality
- Full navigation and UI

### Optional Online Enhancement 🌐

When LLM API keys are configured (optional):

- Advanced AI-powered review and generation
- Model answers / enhanced feedback

**Note**: The app gracefully degrades when offline or without API keys. Core functionality remains available.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v24.x or higher (LTS recommended)
- **pnpm**: v10.12.1+ (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd exame-one

# Install dependencies with pnpm (recommended)
pnpm install

# Or with npm
npm install
```

### Development

```bash
# Start PostgreSQL, then Nuxt :3000 and NestJS :3001
pnpm dev:infra
pnpm dev

# First visit: register at http://localhost:3000/auth/register
# Requires JWT_SECRET in the root `.env` (see `.env.example`)
```

### Optional: Enable AI Features

AI-powered review and model answers require an OpenAI API key (optional):

```bash
# Create .env file in project root
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env

# Or set environment variable
export OPENAI_API_KEY=sk-your-api-key-here
```

**Note**: Without this key, the app still works perfectly—you just won't have advanced AI feedback.

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Generate static site (for static hosting)
pnpm generate
```

## 🛠️ Tech Stack

### Core Framework

- **Nuxt 4** (v4.5.2) - Meta-framework with auto-imports and file-based routing
- **Vue 3** (v3.5.41) - Composition API with `<script setup>`
- **TypeScript** (v6.0.3) - Strict mode for type safety

### UI & Styling

- **Tailwind CSS** (v4.3.3) - Utility-first CSS framework
- **VueUse** (v14.4.0) - Composition API utilities

### State Management

- **Pinia** (v4.0.3) - Vue store with localStorage persistence
- **Composables** - Feature-specific reactive state management

### Internationalization

- **@nuxtjs/i18n** (v9.5.5) - English UI, German content
- Locales: `en` (default), `de`

### Development Tools

- **ESLint** - Code linting with Vue and TypeScript rules
- **Prettier** - Code formatting (2-space, single quotes)
- **Husky** - Git hooks for pre-commit linting
- **vue-tsc** - TypeScript type checking

## 📁 Project Structure

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
└── package.json            # Workspace orchestration scripts
```

## 🧪 Local Development

Use pnpm for Node.js dependencies and local application processes. Do not use npm or create package-local lockfiles.

```bash
pnpm install
cp .env.example .env
pnpm dev:infra
pnpm dev
```

This starts:

- Nuxt with hot reload at `http://localhost:3000` (login-gated; register on first use)
- NestJS with watch mode at `http://localhost:3001`
- API documentation at `http://localhost:3001/api/docs`
- PostgreSQL in Docker at `localhost:5432`

Copy `.env.example` to `.env` and set `JWT_SECRET`. SMTP is off by default. To reset a local password:

```bash
pnpm auth:set-password --email you@example.com
```

The root `compose.yaml` is the repository's only Compose file. `pnpm dev:infra`
selects just its `postgres` service for local hot-reload development. PostgreSQL
data lives in the `exam-one-postgres-dev-data` named volume; `pnpm dev:infra:down`
only stops the service and does not delete its data.

```bash
pnpm dev:infra          # Start PostgreSQL and wait until healthy
pnpm dev:infra:logs     # Follow PostgreSQL logs
pnpm dev:db:shell       # Open psql in the development database
pnpm dev:infra:down     # Stop PostgreSQL without deleting its volume
pnpm dev:frontend       # Run only Nuxt with hot reload
pnpm dev:backend        # Run only NestJS in watch mode
```

## 🐳 Unified Docker Compose Stack

The root stack includes Nuxt, NestJS, PostgreSQL, four-voice Kokoro TTS, and
Parakeet STT. Use the pnpm wrapper on first start: it downloads both speech-model
sets into the gitignored host directories, waits until Postgres, Nest (migrate +
catalog seed), and Nuxt are healthy, then starts the speech sidecars and generates
seed listening WAVs if they are missing.

```bash
cp .env.example .env
pnpm stack:setup       # Download and verify TTS and STT models only
pnpm stack:verify-models
pnpm stack:up
pnpm stack:ps
pnpm stack:logs
pnpm stack:down
```

The first run downloads about 1.7 GB of speech weights: roughly 984 MB for the
four-voice PyTorch TTS stack and 740 MB for the Handy Parakeet Q8 GGUF. It also
builds the TTS image and the lightweight `transcribe.cpp` STT runtime, so it can
take a while. Later starts reuse the host model folders:

- TTS models: `scripts/tts/victoria/models/`
- STT model: `scripts/stt/parakeet/models/`
- Seed listening WAVs: `apps/frontend/public/audio/listening/a2/`

`pnpm stack:up` starts the core app with `--wait`, then Kokoro and Parakeet
without blocking login. Prefer that wrapper over a bare
`docker compose up --wait` of every service (speech healthchecks can take several
minutes). The services are exposed at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Kokoro TTS: `http://localhost:8881/v1/audio/voices`
- Parakeet STT: `http://localhost:8882/health`

For a single speech service, the existing shortcuts now select that service from
the same root Compose file:

```bash
pnpm tts:setup  # download/verify only Kokoro models
pnpm tts:up     # download/start only Kokoro
pnpm tts:down   # stop only Kokoro
pnpm stt:setup  # download/verify only the Parakeet model
pnpm stt:up     # download/start only Parakeet
pnpm stt:down   # stop only Parakeet
```

PostgreSQL and generated listening audio use named volumes. Seed listening WAVs
bind-mount from the host project directory. Do not pass
`--volumes` to `docker compose down` unless Postgres and generated audio should
both be deleted.

## 🧪 Available Commands

```bash
pnpm build              # Build all applications and libraries
pnpm lint               # Lint all workspace packages
pnpm lint:fix           # Autofix all workspace packages
pnpm format             # Format the repository
pnpm type-check         # Type-check all workspace packages
pnpm test               # Run package tests
pnpm test:e2e           # Run the NestJS health endpoint e2e test
pnpm stack:setup        # Download and verify all speech models without starting Compose
pnpm stack:verify-models # Fail if TTS/STT model snapshots are missing
pnpm stack:up           # Download models, start core app, then speech, then seed WAVs if missing
pnpm stack:seed-audio   # Generate bundled listening WAVs if they are not already on disk
pnpm stack:down         # Stop the complete stack without deleting named volumes
pnpm stack:logs         # Follow logs for all Compose services
pnpm stack:ps           # Show service and health status
pnpm tts:setup          # Download and verify only local Kokoro TTS models
pnpm tts:up             # Start only local Kokoro TTS from compose.yaml
pnpm stt:setup          # Download and verify only the local Parakeet GGUF
pnpm stt:up             # Start only local Parakeet STT from compose.yaml
pnpm db:validate        # Validate the shared Prisma schema
pnpm db:migrate         # Create and apply a development migration
pnpm db:migrate:deploy  # Apply committed migrations
pnpm db:seed            # Upsert bundled Goethe A2 exercises and mock Set 1
pnpm auth:set-password  # Recover a local account password (`--email`)
```

## 📊 Project Status

Track phase/skill progress in [`agent-os/product/roadmap.md`](./agent-os/product/roadmap.md) (source of truth). Summary:

### Phase 1 — Frontend MVP (complete)

- ✅ German / Goethe A2 Reading, Writing, Listening, and Speaking practice
- ✅ Offline-first progress, drafts, attempts, scoring, and local persistence
- ✅ Optional BYOK AI generation, grading, and detailed exercise reviews
- ✅ Goethe A2 mock exam mode with offline Set 1 and locally generated sets
- ✅ Persisted generation pipeline, automatic grading, per-module reviews, and aggregate AI overview
- ✅ English/German UI, responsive layouts, and graceful offline/AI-unavailable behavior

### Later phases

- **Current — Phase 2:** 2.1–2.5 done (backend, auth, practice persistence, NestJS AI/TTS/STT, Compose packaging). Next is the self-host runbook (2.6)
- Phase 3: Public open-source release + docs site
- Phase 4: Hosted cloud product

## 🎨 Design Philosophy

### User Experience Principles

- **Delightful**: Smooth animations, encouraging feedback, celebration of progress
- **Clear**: Intuitive navigation, obvious next actions, no jargon
- **Fast**: < 2s load time, 60fps interactions, instant feedback
- **Accessible**: WCAG 2.2 AA compliance, keyboard navigation, screen reader support

### Technical Principles

- **Offline-First**: Core features work without internet
- **Type-Safe**: TypeScript strict mode throughout
- **Component-Based**: Atomic design with clear boundaries
- **Performance-Conscious**: Bundle size monitoring, lazy loading, optimized builds

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Code Style

- **TypeScript** for all new code
- **Composition API** with `<script setup>` for Vue components
- **Tailwind utilities** for styling (avoid custom CSS)
- **2-space indentation**, single quotes, trailing commas (enforced by Prettier)

### Component Guidelines

- Keep components under 300 lines (split if larger)
- Extract reusable logic into composables
- Use TypeScript interfaces from `utils/types.ts`
- Follow atomic design: atoms → molecules → organisms

### Git Workflow

- **Branch naming**: `feature/<description>`, `fix/<description>`, `chore/<description>`
- **Commit format**: Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Pre-commit hooks**: Automatic linting and formatting via Husky

### Quality Checks

- Repository-wide lint and strict TypeScript checks
- Production builds for all workspace applications and libraries
- Manual end-to-end checks of the completed German / Goethe A2 practice and mock-exam flows
- Backend health and auth unit/e2e coverage for the Phase 2 API

## 📚 Documentation

Comprehensive project documentation is maintained in the `memory-bank/` directory:

- **[projectbrief.md](./memory-bank/projectbrief.md)** - Vision, goals, and constraints
- **[productContext.md](./memory-bank/productContext.md)** - Problems solved and UX goals
- **[systemPatterns.md](./memory-bank/systemPatterns.md)** - Architecture and design patterns
- **[techContext.md](./memory-bank/techContext.md)** - Tech stack and setup details
- **[progress.md](./memory-bank/progress.md)** - Detailed implementation status
- **[activeContext.md](./memory-bank/activeContext.md)** - Current focus and next steps

## 🎯 Roadmap

### Current Focus

Phase 1 is complete. **2.1–2.5 are complete** (NestJS foundation, login-gated accounts, practice persistence, the NestJS AI/TTS/STT proxy, and Compose packaging). The current focus is **2.6 self-host runbook** while preserving German / Goethe A2 practice behavior.

### Next Steps (In Priority Order)

1. **Self-host runbook (2.6)** — First user, API keys, backup/restore of named volumes

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

- Goethe Institut for exam format inspiration
- German language learners who need better practice tools
- The Vue and Nuxt communities for excellent tooling

## 📧 Contact

[Your contact information or links]

---

**Built with ❤️ for German language learners**

_Practice makes perfect—üben macht den Meister!_
