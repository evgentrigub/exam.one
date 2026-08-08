# Product Context Index

Use these files as the product reference set before implementing exam behavior, seed content, prompt templates, grading, or mock exam flows.

## Current focus (Phase 1)

- **Listening (Hoeren):** complete for iteration 1 — see `roadmap.md` skill status and `tech-stack.md` Listening audio.
- **Speaking (Sprechen):** Teil 1–2 iteration complete — recording, manual/local/cloud STT transcripts, optional LLM review, and local attempt persistence are shipped.
- **Next product stage:** implement Speaking Teil 3 joint planning, then pronunciation and mock-exam integration; follow `roadmap.md` §1.1 and `german-exam-A2.md`.

## Core Product

- `mission.md` - product problem, audience, positioning, and generic multi-language / multi-level framework goal.
- `roadmap.md` - phase boundaries, supported exams per phase, skill status, and technical substages.
- `tech-stack.md` - Phase 1 frontend-only architecture and Phase 2 Docker Compose full-stack target.

## Exam References

- `german-exam-A2.md` - Goethe A2 module structure, timings, scoring, generation rules, review rules, and mock exam constraints (includes Listening/Speaking implementation status callouts).
- `german-exam-C1.md` - Goethe C1 Phase 1 scope (Writing only); out-of-scope skills for this phase.

## Agent Guidance

- Read `mission.md`, `roadmap.md`, and `tech-stack.md` for product-wide decisions.
- Read the matching exam reference before implementing exam-specific content, prompts, review logic, scoring, or mock exam behavior.
- Keep shared models and UI flows exam-agnostic; express provider/exam specifics through typed seed data, metadata, and prompt templates.
- **Phase 1:** core practice flows are offline-capable (localStorage); AI is an optional enhancement.
- **Phase 2 onward:** core user/exam data lives in PostgreSQL behind the NestJS API on the local Docker Compose stack; AI remains optional and bring-your-own-key (OpenAI / OpenRouter).
