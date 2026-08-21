# Product Context Index

Use these files as the product reference set before implementing exam behavior, seed content, prompt templates, grading, or mock exam flows.

## Current focus

- **Phase 1:** complete and tested. German / Goethe A2 Reading, Writing, Listening, Speaking, and mock exam mode are shipped as a local-first frontend product.
- **Mock exam:** offline Set 1, locally persisted AI/TTS-generated sets, resumable generation, automatic grading, module-level detailed reviews, and an optional aggregate AI overview are complete.
- **Phase 2.1–2.6:** complete. Auth (2.2), practice persistence (2.3), AI-to-Nest (2.4), Compose packaging (2.5), and the self-host runbook (2.6) are done.
- **Phase 2.7–2.11:** current. Auth UI fidelity, account/settings UI, security audit, design-vs-app comparison, and the generic exam-pack framework (with A1 demo packs for English, German, and Spanish).
- **Phase 3:** next. Public open-source release, community workflow, and a dedicated docs site after 2.11.

## Core Product

- `mission.md` - product problem, audience, positioning, and generic multi-language / multi-level framework goal.
- `roadmap.md` - phase boundaries, supported exams per phase, skill status, and technical substages.
- `tech-stack.md` - completed Phase 1 frontend architecture and the Phase 2 Docker Compose full stack (2.1–2.6 complete; 2.7–2.11 current).

## Exam References

- `german-exam-A2.md` - completed Goethe A2 product reference: module structure, timings, scoring, generation rules, review rules, and mock exam constraints.
- `german-exam-C1.md` - reference for existing Goethe C1 writing content and prompt behavior; it does not define the current product phase.

## Agent Guidance

- Read `mission.md`, `roadmap.md`, and `tech-stack.md` for product-wide decisions.
- Read the matching exam reference before implementing exam-specific content, prompts, review logic, scoring, or mock exam behavior.
- Keep shared models and UI flows exam-agnostic; express provider/exam specifics through typed seed data, metadata, and prompt templates. The typed exam-pack contract itself is roadmap 2.11 — do not treat today's Goethe-shaped `apps/frontend/data/` modules as that contract.
- **Completed Phase 1:** core practice flows are offline-capable (localStorage); AI is an optional enhancement.
- **Completed Phase 2.1–2.6:** accounts, session, profile, exam settings, skill practice, mock exams, progress, drafts, optional BYOK AI/TTS/STT, Docker Compose packaging, and the self-host README runbook are NestJS-backed.
- **Phase 2.7–2.11 (current):** design-faithful auth and settings UI, security pass, design comparison punch list, then exam-pack interfaces plus A1 demo packs.
- **Phase 3 (next):** public GitHub release, community loop, and Docusaurus docs site (the 2.11 extension guide is published there, not invented there).
