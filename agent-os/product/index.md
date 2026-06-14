# Product Context Index

Use these files as the product reference set before implementing exam behavior, seed content, prompt templates, grading, or mock exam flows.

## Core Product

- `mission.md` - product problem, audience, positioning, and generic multi-language framework goal.
- `roadmap.md` - current MVP scope, supported exams, and phase boundaries.
- `tech-stack.md` - current frontend-only architecture and Phase 2 full-stack target.

## Exam References

- `german-exam-A2.md` - Goethe A2 module structure, timings, scoring, generation rules, review rules, and mock exam constraints.

## Agent Guidance

- Read `mission.md`, `roadmap.md`, and `tech-stack.md` for product-wide decisions.
- Read the matching exam reference before implementing exam-specific content, prompts, review logic, scoring, or mock exam behavior.
- Keep shared models and UI flows exam-agnostic; express provider/exam specifics through typed seed data, metadata, and prompt templates.
- Preserve the offline-first MVP boundary: core practice flows must work without network access, and AI remains an optional enhancement.
