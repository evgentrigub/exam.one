# Product Context Index

Use these files as the product reference set before implementing exam behavior, seed content, prompt templates, grading, or mock exam flows.

## Current focus

- **Phase 1:** complete and tested. German / Goethe A2 Reading, Writing, Listening, Speaking, and mock exam mode are shipped as a local-first frontend product.
- **Mock exam:** offline Set 1, locally persisted AI/TTS-generated sets, resumable generation, automatic grading, module-level detailed reviews, and an optional aggregate AI overview are complete.
- **Phase 2:** current. Auth (2.2), practice persistence (2.3), AI-to-Nest (2.4), and Compose packaging (2.5) are complete. Next is the self-host runbook (2.6).

## Core Product

- `mission.md` - product problem, audience, positioning, and generic multi-language / multi-level framework goal.
- `roadmap.md` - phase boundaries, supported exams per phase, skill status, and technical substages.
- `tech-stack.md` - completed Phase 1 frontend architecture and the current Phase 2 Docker Compose full-stack target.

## Exam References

- `german-exam-A2.md` - completed Goethe A2 product reference: module structure, timings, scoring, generation rules, review rules, and mock exam constraints.
- `german-exam-C1.md` - reference for existing Goethe C1 writing content and prompt behavior; it does not define the current product phase.

## Agent Guidance

- Read `mission.md`, `roadmap.md`, and `tech-stack.md` for product-wide decisions.
- Read the matching exam reference before implementing exam-specific content, prompts, review logic, scoring, or mock exam behavior.
- Keep shared models and UI flows exam-agnostic; express provider/exam specifics through typed seed data, metadata, and prompt templates.
- **Completed Phase 1:** core practice flows are offline-capable (localStorage); AI is an optional enhancement.
- **Phase 2 (in progress):** accounts, session, profile, exam settings, skill practice, mock exams, progress, drafts, optional BYOK AI/TTS/STT, and Docker Compose packaging are NestJS-backed (2.2–2.5). Next is 2.6 (self-host runbook).
