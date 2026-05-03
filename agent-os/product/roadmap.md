# Product Roadmap

## Phase 1: MVP (current) — Frontend

Frontend-only, offline-first web app. All user data lives in localStorage; AI calls go directly from the browser to the AI provider via Nuxt server routes. No accounts, no database.

- **Reading practice** — timed reading comprehension exercises (A2 & C1) ✓
- **Writing practice** — writing tasks with AI review and model answers (A2 & C1) ✓
- **Listening practice** — audio-based comprehension exercises (A2 & C1)
- **Speaking practice** — prompt-driven speaking tasks with AI evaluation (A2 & C1)
- **Mock Exam mode** — full timed exam simulation covering all four skills

Open-source core: the app, UI, and exercise runner. The AI prompts (exercise generators, graders) are the proprietary layer.

## Phase 2: Full-Stack SaaS

Rebuild as a proper high-load web SaaS with backend, database, and user accounts:

- **Backend** — NestJS REST/GraphQL API, PostgreSQL database
- **Authentication** — user accounts, sessions, OAuth
- **Cloud persistence** — sync progress, drafts, and results across devices
- **AI integration** — server-side orchestration via Google Gemini and/or OpenAI (ChatGPT)
- **Progress tracking** — performance history per skill, readiness score over time, streak tracking
- **Adaptive practice** — surface exercises targeting the learner's weakest areas relative to exam date
- **Business model** — decide on freemium vs. subscription vs. one-time purchase for the AI-powered layer (TBD)

## Phase 3: Scale

- **More exam levels** — extend beyond A2/C1 to B1/B2 and potentially other Goethe formats
- **Multi-language support** — other certification exams (DELF, CEFR-aligned tests)
- **Teacher/classroom mode** — assign exercises, track student cohorts
