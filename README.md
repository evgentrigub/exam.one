# Exam.one 🎓

> Open-source, self-hostable language exam prep. Phase 1 shipping focus: German / Goethe A2 (all skills) + Goethe C1 Writing.

Practice Reading, Writing, Listening, and Speaking with authentic exam-style content, optional AI feedback, and local-first progress tracking.

Design preview: `npx --yes serve exam-one-design/project -l 5174`

## Current status (Phase 1)

Canonical roadmap: [`agent-os/product/roadmap.md`](./agent-os/product/roadmap.md).

| Area | Status |
|------|--------|
| Reading (Lesen) | Done (iteration 1) |
| Writing (Schreiben) | Done (iteration 1) |
| Listening (Hoeren) | Done (iteration 1) — 4 Teile, file-based Kokoro audio, missing-audio lock UX |
| Speaking (Sprechen) | **In progress** — Teil 1–2 recording, STT/manual transcripts, AI review; Teil 3 still open |
| Mock exam | Not started (after Speaking is practice-ready) |
| Phase 2 NestJS / Postgres | Scaffold in repo; product cutover not started |

**Next implementation focus:** Speaking — implement Teil 3 joint planning, then pronunciation and mock-exam integration (see roadmap §1.1).

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

### 🎤 Speaking Practice (in progress)
- **Teil 1–2 practice**: Two-phase interview and monologue recording with editable transcripts
- **Optional STT**: Local Parakeet (`pnpm stt:up`) or OpenAI Whisper, with manual-text fallback
- **Optional AI review**: Direct-point criteria and local attempt persistence; save-without-AI remains available
- **Still open**: Teil 3 joint planning, pronunciation score, and mock-exam integration

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
Phase 1 core flows work without internet (localStorage):
- Reading, writing, and listening practice
- Speaking Teil 1–2 practice with manual transcripts and local attempt saving
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
- **Node.js**: v20.x or higher (LTS recommended)
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
# Start development server at http://localhost:3000
pnpm dev

# The app will hot-reload as you make changes
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
- **Nuxt 3** (v3.17.5) - Meta-framework with auto-imports and file-based routing
- **Vue 3** (v3.5.16) - Composition API with `<script setup>`
- **TypeScript** (v5.8.3) - Strict mode for type safety

### UI & Styling
- **Tailwind CSS** (v4.1.10) - Utility-first CSS framework
- **VueUse** (v13.4.0) - Composition API utilities

### State Management
- **Pinia** (v3.0.3) - Vue store with localStorage persistence
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
│   ├── frontend/          # Nuxt 3 application and temporary Nitro AI endpoints
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

- Nuxt with hot reload at `http://localhost:3000`
- NestJS with watch mode at `http://localhost:3001`
- API documentation at `http://localhost:3001/api/docs`
- PostgreSQL in Docker at `localhost:5432`

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
sets into the gitignored host directories and then starts every service from
`compose.yaml`.

```bash
cp .env.example .env
pnpm stack:setup       # Download and verify TTS and STT models only
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

After the models exist, `docker compose up -d --build --wait` is also sufficient.
The services are exposed at:

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

PostgreSQL and generated listening audio use named volumes. Do not pass
`--volumes` to `docker compose down` unless both should be deleted.

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
pnpm stack:up           # Download speech models and start the complete Compose stack
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
pnpm db:seed            # Seed the development database
```

## 📊 Project Status

Track phase/skill progress in [`agent-os/product/roadmap.md`](./agent-os/product/roadmap.md) (source of truth). Summary:

### Phase 1 — Frontend MVP (current)

- ✅ Reading / Writing practice (iteration 1)
- ✅ Listening practice (iteration 1) + Kokoro TTS tooling
- 🔄 **Speaking** — Teil 1–2 practice, STT, and AI review done; Teil 3 is next
- ⏳ Mock exam mode (after Speaking is usable)
- ⏳ Goethe C1 Writing (partial scope)
- ✅ BYOK AI generate/review for shipped skills; DaisyUI shell / i18n / progress foundations

### Later phases

- Phase 2: NestJS + PostgreSQL persistence cutover + Docker Compose self-host
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

### Testing (Coming in Stage 18)
- Unit tests for composables and utilities (Vitest)
- Component tests for key user flows (Vue Test Utils)
- E2E tests for critical journeys (Playwright)

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
Project is in **post-MVP planning phase**. Core reading and writing features are complete and polished.

### Next Steps (In Priority Order)
1. **Testing Infrastructure** - Set up Vitest for automated testing
2. **PWA Enhancement** - Add service worker for better offline experience
3. **Content Expansion** - Create B1 and B2 level materials
4. **Advanced Analytics** - Add performance trends and visualizations

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

*Practice makes perfect—üben macht den Meister!*
