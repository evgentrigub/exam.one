# Product Context Index

Use these files as the product reference set before implementing exam behavior, seed content, prompt templates, grading, or mock exam flows.

## Core Product

- `mission.md` - product problem, audience, positioning, and generic multi-language / multi-level framework goal.
- `roadmap.md` - phase boundaries, supported exams per phase, and technical substages.
- `tech-stack.md` - Phase 1 frontend-only architecture and Phase 2 Docker Compose full-stack target.

## Exam References

- `german-exam-A2.md` - Goethe A2 module structure, timings, scoring, generation rules, review rules, and mock exam constraints.
- `german-exam-C1.md` - Goethe C1 Phase 1 scope (Writing only); out-of-scope skills for this phase.

## Agent Guidance

- Read `mission.md`, `roadmap.md`, and `tech-stack.md` for product-wide decisions.
- Read the matching exam reference before implementing exam-specific content, prompts, review logic, scoring, or mock exam behavior.
- Keep shared models and UI flows exam-agnostic; express provider/exam specifics through typed seed data, metadata, and prompt templates.
- **Phase 1:** core practice flows are offline-capable (localStorage); AI is an optional enhancement.
- **Phase 2 onward:** core user/exam data lives in PostgreSQL behind the NestJS API on the local Docker Compose stack; AI remains optional and bring-your-own-key (OpenAI / OpenRouter).
