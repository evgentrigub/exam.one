# Product Roadmap

## Phase 1: Frontend-Only MVP

The first usable, shippable version is **frontend only** — no separate backend and no database. The app is built entirely in the frontend (Nuxt/Vue), with thin Nuxt server routes acting as a proxy to the user's LLM provider (bring-your-own-key). All user data (drafts, attempts, results) lives client-side in localStorage; core practice flows are offline-first and never require the network.

The goal of this phase is a **complete, ready-to-use app covering all exam parts** — exactly the current architecture, fully finished.

**Supported exams:**
- **English** — Cambridge A2
- **German** — Goethe A2 (see `agent-os/product/german-exam-A2.md`)

**Must-have features:**
- **Reading practice** — comprehension exercises
- **Writing practice** — tasks with AI review and model answers
- **Listening practice** — audio-based comprehension exercises
- **Speaking practice** — prompt-driven tasks with AI evaluation
- **Demo prompt templates** — bundled templates that generate and review exercises and grade student answers, editable by the user
- **Mock exam mode** — a true single-attempt simulation with no pauses and the same limitations applied in real language exams

## Phase 2: Self-Hostable Full-Stack App

Evolve the finished frontend MVP into a full-stack application that users serve locally via **Docker Compose** (NestJS backend, Nuxt/Vue frontend, PostgreSQL database). Like n8n, a self-hosted instance supports signing up a single user who then uses the app. AI features still run on the user's own LLM API keys.

- **Backend** — NestJS API replacing the thin Nuxt proxy
- **Database** — PostgreSQL for users, exercises, attempts, results, and drafts
- **Persistence** — localStorage replaced by API-backed state
- **Packaging** — single-command Docker Compose self-hosting

## Phase 3: Post-MVP — Open-Source Enhancements

Improve the open-source solution with:

- **Progress tracking** — performance history per skill
- **Readiness score** — exam-readiness signal over time
- **Adaptive practice** — surface exercises targeting the learner's weakest areas

## Phase 4: Hosted Cloud Product

A separately hosted copy of the project, run in the cloud and offered under paid price plans for users who prefer not to self-host. Likely additions:

- Managed accounts and cloud sync across devices
- More exam levels (B1/B2, C1) and additional language certifications
- Teacher/classroom mode for cohorts
