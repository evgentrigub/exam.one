# Exam.one 🎓

> A polished language exam preparation platform. The primary availabe language is German exma by Goethe Institut (A2-C1 levels)

Practice reading comprehension and writing exercises with authentic exam-style content, instant feedback, and comprehensive progress tracking—all in a beautiful, accessible interface.

use npx --yes serve exam-one-design/project -l 5174 to run desidn locally

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

### 📊 Progress Dashboard
- **Comprehensive Statistics**: Completion rates, average scores, best scores
- **Recent Activity**: Time-based formatting (Today, Yesterday, X days ago)
- **Separate Analytics**: Independent tracking for reading and writing
- **Visual Indicators**: Completion badges, progress bars, trend displays

### 🤖 Optional AI Enhancement
- **Advanced Review**: AI-powered detailed feedback using OpenAI
- **Model Answers**: Generate example responses for writing topics

## 🏗️ Architecture

### Offline-First Core ✅
All essential features work without internet connection:
- Reading practice with instant feedback
- Writing practice with text analysis
- Progress tracking and statistics
- Draft saving and resume functionality
- Full navigation and UI

### Optional Online Enhancement 🌐
When `OPENAI_API_KEY` is configured (optional):
- Advanced AI-powered writing review
- Model answer generation
- Enhanced feedback with detailed suggestions

**Note**: The app gracefully degrades when offline or without API key. Core functionality remains 100% available.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.x or higher (LTS recommended)
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
├── compose.dev.yaml       # Development PostgreSQL only
├── compose.yaml           # Fully containerized stack
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

`compose.dev.yaml` runs only PostgreSQL. Its data is stored in the named Docker volume `exam-one-postgres-dev-data`, so removing or recreating the container does not remove the database. `pnpm dev:infra:down` stops and removes the container while preserving the volume. Data is deleted only if that Docker volume is explicitly removed.

```bash
pnpm dev:infra          # Start PostgreSQL and wait until healthy
pnpm dev:infra:logs     # Follow PostgreSQL logs
pnpm dev:db:shell       # Open psql in the development database
pnpm dev:infra:down     # Stop PostgreSQL without deleting its volume
pnpm dev:frontend       # Run only Nuxt with hot reload
pnpm dev:backend        # Run only NestJS in watch mode
```

## 🐳 Fully Containerized Stack

Use the production-style Compose stack when testing deployment rather than editing application code:

```bash
docker compose up --build -d
docker compose logs -f
docker compose down
```

The production-style PostgreSQL data is stored in a separate named volume. Do not pass `--volumes` to `docker compose down` unless the database should be deleted.

## 🧪 Available Commands

```bash
pnpm build              # Build all applications and libraries
pnpm lint               # Lint all workspace packages
pnpm lint:fix           # Autofix all workspace packages
pnpm format             # Format the repository
pnpm type-check         # Type-check all workspace packages
pnpm test               # Run package tests
pnpm test:e2e           # Run the NestJS health endpoint e2e test
pnpm db:validate        # Validate the shared Prisma schema
pnpm db:migrate         # Create and apply a development migration
pnpm db:migrate:deploy  # Apply committed migrations
pnpm db:seed            # Seed the development database
```

## 📊 Project Status

### Completed (12/18 deliverables - 67%) ✅

- ✅ **Reading Practice** (8/8 stages) - Fully functional with 5 texts, 20 questions
- ✅ **Writing Practice** (4/4 stages) - Complete 3-card interface with text analysis
- ✅ **Progress Dashboard** - Comprehensive statistics and activity tracking
- ✅ **Navigation & Layout** - Consistent navbar, responsive design
- ✅ **Performance Optimization** - ~600 KB gzipped, < 2s load time

### In Planning (Post-MVP) 🎯

- ⏳ **Enhanced Analytics** (Stage 13) - Performance trends, charts, weak area identification
- ⏳ **Content Expansion** (Stage 14) - B1 and B2 level texts and topics
- ⏳ **PWA Enhancement** (Stage 15) - Service worker, offline caching, install prompt
- ⏳ **Gamification** (Stage 16) - Streaks, badges, daily goals
- ⏳ **Advanced Writing** (Stage 17) - Spell check, grammar suggestions, templates
- ⏳ **Testing & QA** (Stage 18) - Automated tests with Vitest and Playwright

See [`README_PRD.txt`](./README_PRD.txt) for detailed progress tracking.

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
