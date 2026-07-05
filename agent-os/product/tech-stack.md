# Tech Stack

> **Phase 1 (current) is frontend-only**: a Nuxt/Vue app with thin Nuxt server routes proxying user-supplied (bring-your-own-key) LLM providers, and localStorage for all user data — no separate backend or database. The **Backend** and **Database** sections below describe the Phase 2 full-stack, Docker Compose self-hostable target.

## Frontend

- **Nuxt 3** — SSR/SSG framework (Vue 3)
- **Vue 3** — component model with Composition API
- **TypeScript** — strict typing throughout
- **Tailwind CSS 4** — utility-first styling (via `@tailwindcss/vite`)
- **DaisyUI 5** — component library on top of Tailwind
- **lucide-vue-next** — icon set
- **@nuxtjs/i18n + vue-i18n** — internationalisation
- **Pinia** (+ `pinia-plugin-persistedstate`) — state management
- **VueUse** — composable utilities

## Backend

- **Phase 1 (current):** thin **Nuxt server routes** (`server/api/`) that proxy requests to the configured LLM provider — no standalone backend
- **Phase 2:** **NestJS** — Node.js backend framework (REST and/or GraphQL), single-user signup model for self-hosted instances (similar to n8n)

## Database

- **Phase 1 (current):** none — all user data is stored client-side in localStorage (offline-first)
- **Phase 2:** **PostgreSQL** — primary relational database (users, exercises, attempts, results, drafts)

## AI

- **Bring-your-own-key, provider-agnostic** — users supply their own LLM API keys (e.g. OpenAI, Google Gemini, or local models)
- Used for exercise generation, exercise review, and grading student answers
- Prompt templates are bundled as editable demo templates
- AI is an enhancement layer; core practice flows degrade gracefully when AI is unavailable

## Deployment & Infra

- **Docker Compose** — orchestrates backend, frontend, and PostgreSQL for local self-hosting
- A separately hosted cloud copy (paid plans) is planned post-MVP

## Tooling

- **pnpm** — package manager
- **Vite** — bundler (via Nuxt)
- **ESLint + Prettier** — linting and formatting
- **Husky + lint-staged** — pre-commit hooks
- **vue-tsc** — TypeScript checking for Vue SFCs
