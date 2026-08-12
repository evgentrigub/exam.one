# Product Roadmap

exam.one ships in four phases: a completed frontend-only German MVP, a localhost Docker Compose full stack, a public open-source release with community docs, and a hosted cloud product. Orientation (not a 1:1 copy): successful self-host → community → cloud patterns such as [Postiz](https://github.com/gitroomhq/postiz-app).

```mermaid
flowchart LR
  P1[Phase1_FrontendMVP]
  P2[Phase2_SelfHostCompose]
  P3[Phase3_OpenSourceAndCloudPrep]
  P4[Phase4_HostedCloud]
  P1 --> P2 --> P3 --> P4
```

---

## Phase 1: Frontend-Only MVP (complete)

The first usable, shippable version is **frontend only** for product flows — practice data does not require NestJS or PostgreSQL yet. The app is built in Nuxt/Vue, with thin Nuxt server routes proxying the user's LLM provider (bring-your-own-key). All user data (drafts, attempts, results) lives in localStorage. Core practice flows are **offline-capable** and do not require the network; AI is optional.

> **Note:** The monorepo already contains NestJS / Prisma / Compose scaffolding from early Phase 2 groundwork. The completed Phase 1 flows remain on localStorage until each domain is deliberately moved during the Phase 2 persistence cutover.

The German / Goethe A2 product is complete and tested across Reading, Writing, Listening, Speaking, and mock exam mode. The architecture remains exam-agnostic so later phases can add other levels, languages, and providers without changing the completed Phase 1 definition.

### Skill status (Goethe A2)

| Skill | Status | Notes |
| --- | --- | --- |
| Reading | **Complete and tested** | Seed content, practice, scoring, explanations, progress, and optional AI generation |
| Writing | **Complete and tested** | Seed content, drafts, optional AI grading, persisted detailed reviews, and generation |
| Listening | **Complete and tested** | Four exam parts, automatic scoring, stable WAVs, replay rules, and optional Docker TTS |
| Speaking | **Complete and tested** | Recording, local/cloud STT or manual transcripts, optional AI grading, persisted reviews, and local attempts |
| Mock exam | **Complete and tested** | Offline Set 1, generated local sets, resumable pipeline, automatic grading, module reviews, and aggregate AI overview |

### Substages

#### 1.1 Goethe A2 core skills

**Complete and tested:** Reading, Writing, Listening, and Speaking provide local-first practice against the product's modular Goethe A2 rules.

- Reading provides exam-style content, scored questions, explanations, progress, and optional generation.
- Writing provides drafts, word-count rules, optional automatic AI grading, detailed feedback, and persisted results.
- Listening provides all four exam parts, stable seed audio, official replay behavior in mock exams, and optional Docker TTS generation.
- Speaking provides recording, provider-neutral local/cloud STT, editable/manual transcripts, automatic optional AI grading, detailed feedback, and persisted attempts.
- Every core skill remains usable without a cloud AI provider; optional enhancements fail gracefully.

#### 1.2 Mock exam mode

**Complete and tested:** Goethe A2 Set 1 ships as a local-first simulation with reload-safe timers, ordered and locked exercises, immutable answer snapshots, and module scoring. It remains usable without an LLM or TTS service.

Users can generate additional immutable sets after preflight verifies the LLM configuration, provider connection, and Docker TTS health. Reading, Listening content/audio, Writing, and Speaking run serially through a persisted, resumable pipeline with expandable module progress. Completed attempts provide automatic scores, read-only exercise review pages, persisted Writing/Speaking AI review details, and an optional aggregate AI overview in the active UI language.

#### 1.3 Demo prompt templates + BYOK AI

Bundled editable prompt templates for generate / review / grade. Supported providers: **OpenAI** and **OpenRouter**. Graceful degrade when keys are missing or upstream AI fails. Root `.env` is loaded by Nest (`../../.env`) and by Nuxt via `--dotenv ../../.env`.

#### 1.4 Polish / ship gate

i18n, settings, and progress UX solid enough that Phase 2 can freeze the product surface and migrate persistence without redesigning core practice flows.

**Exit criteria: met.** German / Goethe A2 Reading, Writing, Listening, Speaking, mock exam mode, local persistence, and optional BYOK AI work end-to-end in the frontend-only architecture. Phase 1 is complete.

---

## Phase 2: Self-Hostable Full-Stack App (current)

Evolve the finished frontend MVP into a full-stack application that users run on their own laptop via **Docker Compose** (Nuxt frontend, NestJS backend, PostgreSQL). Like Postiz / n8n, a self-hosted instance supports signing up a single operator who then uses the app. AI features still use the user's own LLM API keys (OpenAI / OpenRouter).

**Stack:**

- **Frontend** — Vue.js (Nuxt)
- **Backend** — NestJS API replacing the thin Nuxt AI proxy for long-term ownership
- **Database** — PostgreSQL for users, exercises, attempts, results, drafts, and settings
- **Persistence** — localStorage for exam/user data fully replaced by API-backed state
- **Packaging** — single-command Docker Compose self-hosting with a **named Postgres volume** so data survives container removal/recreation

### Substages

#### 2.1 Backend foundation

NestJS API modules, shared contracts, Prisma schema for users / exercises / attempts / results / drafts / settings, and health checks.

#### 2.2 Auth and account UI

Wire Scalo-derived auth, profile, and settings pages (login, register, forgot/reset password, verify account, 2FA as applicable, profile/account settings) to NestJS auth. Vue/Nuxt is retained partly to reuse this UI library.

#### 2.3 Persistence cutover

Replace skill, mock exam, progress, and draft localStorage with NestJS API + PostgreSQL. Optional one-time client migration helper. Seed content moves to a DB- or server-owned seed strategy. Theme and similar non-authoritative UI prefs may remain client-side.

#### 2.4 AI move to NestJS

Retire Nitro as the long-term AI proxy. OpenAI and OpenRouter adapters behind the same `{ data, error }` envelope; graceful degrade unchanged.

#### 2.5 Docker Compose packaging

One root `compose.yaml` for frontend, backend, Postgres, Kokoro TTS, and Parakeet STT. Named volumes preserve Postgres data and generated listening audio; host model directories preserve speech weights. Local Parakeet uses the sub-1 GB Handy Q8 GGUF with a pinned `transcribe.cpp` runtime. Local development selects only the root file's `postgres` service.

#### 2.6 Self-host runbook

Root README + env reference: install Docker, `compose up`, first user, configure API keys, backup/restore the named volume. Full documentation site waits for Phase 3.

**Exit criteria:** all Phase 1 practice flows work against the DB-backed stack on localhost Docker Compose with durable volume data.

---

## Phase 3: Open-Source Release, Community, and Cloud Prep

Make the self-hosted solution public, document it properly, grow with community feedback, add open-source product enhancements, and prepare (but not yet ship) the hosted cloud product.

### Substages

#### 3.1 Public GitHub release

License, CONTRIBUTING, issue/PR templates, security policy, changelog. Publish the repository for external use.

#### 3.2 Community loop

Triage issues and pull requests, accept external contributions under project standards, and track user feedback.

#### 3.3 Docusaurus docs site

Dedicated docs project ([Docusaurus](https://docusaurus.io/)): install/self-host, architecture, exam-framework extension guide, AI provider setup, troubleshooting; version docs as needed.

#### 3.4 Open-source product enhancements

Progress history per skill, exam-readiness score over time, and adaptive practice that surfaces exercises targeting weak areas.

#### 3.5 Cloud groundwork

Multi-tenant design notes, auth hardening, billing research, and deploy topology — without shipping the paid hosted product yet.

**Exit criteria:** public repo with working self-host docs site, active issue/PR workflow, and a written path to cloud hosting.

---

## Phase 4: Hosted Cloud Product

A separately hosted copy of the project, run in the cloud and offered under paid price plans for users who prefer not to self-host.

### Substages

#### 4.1 Managed hosting

Managed accounts, cloud sync across devices, and paid plans.

#### 4.2 Exam expansion

More Goethe levels beyond A2, plus additional language certifications and difficulty levels via the generic framework.

#### 4.3 Collaboration features

Teacher / classroom / cohort mode as a later cloud differentiator.
