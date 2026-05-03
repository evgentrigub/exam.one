# Tech Stack

> **Note:** The current codebase is the MVP (Phase 1) — frontend-only. The planned full-stack architecture (Phase 2) is documented below under "Planned."

## Frontend (current)

- **Nuxt 3** — SSR/SSG framework (Vue 3)
- **Vue 3** — component model with Composition API
- **TypeScript** — strict typing throughout
- **Tailwind CSS 4** — utility-first styling (via `@tailwindcss/vite`)
- **DaisyUI 5** — component library on top of Tailwind
- **lucide-vue-next** — icon set
- **@nuxtjs/i18n + vue-i18n** — internationalisation

## State & Persistence (current — MVP)

- **Pinia** — reactive state management
- **pinia-plugin-persistedstate** — automatic localStorage persistence
- **VueUse** — composable utilities (`@vueuse/core`, `@vueuse/nuxt`)
- **Offline-first**: all seed data is bundled as typed TS modules in `data/`; user data lives in localStorage; network is never required for core flows

## AI (current — MVP)

- **OpenAI API** (`openai` npm package) — writing review, exercise topic generation, model answer generation; routed through Nuxt server routes as a thin proxy
- Prompts live in `data/writing/*Prompt.ts`; the prompt layer is the proprietary/paid component
- AI responses are always optional enhancements — core UI degrades gracefully when AI is unavailable

## Backend (current — MVP)

- Nuxt server routes (`server/api/`) — thin proxy layer to OpenAI only; no persistent server-side database

## Database (current — MVP)

- N/A — all user data is stored client-side in localStorage

---

## Planned: Full-Stack SaaS (Phase 2)

### Backend
- **NestJS** — Node.js backend framework (REST and/or GraphQL)
- **PostgreSQL** — primary relational database
- Authentication, user accounts, cloud sync

### AI (Phase 2)
- **Google Gemini** and/or **OpenAI (ChatGPT)** — server-side AI orchestration for exercise generation and grading; provider decision TBD

### Frontend changes (Phase 2)
- Nuxt 3 remains the frontend; localStorage persistence replaced by API-backed state
- Pinia stores will call backend APIs instead of reading/writing localStorage directly

---

## Tooling

- **pnpm** — package manager
- **Vite** — bundler (via Nuxt)
- **ESLint + Prettier** — linting and formatting
- **Husky + lint-staged** — pre-commit hooks
- **vue-tsc** — TypeScript checking for Vue SFCs
