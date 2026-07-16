# German Exam Reference — Goethe C1 (Phase 1 scope)

Use this document when changing Goethe C1 writing content, prompt templates, review logic, or grading related to Writing only.

## Phase 1 scope

**In scope for Phase 1:**
- Writing practice (tasks aligned to Goethe-Zertifikat C1 writing expectations)
- Editable demo prompt templates for exercise generation, model answers, and writing review
- AI-assisted generation and review via bring-your-own-key (OpenAI / OpenRouter), with graceful degrade when AI is unavailable

**Out of scope for Phase 1:**
- Full C1 Reading, Listening, or Speaking modules
- C1 mock exam mode
- Complete C1 scoring across all skills

Expanding C1 beyond Writing is a later roadmap item (exam expansion in Phase 4, or earlier if explicitly prioritized).

## Implementation pointers

Typed seed / prompt modules for C1 writing currently live under:

```
apps/frontend/data/writing/c1/
  exerciseGeneratorWritingC1.ts
  answerGeneratorWritingC1.ts
  reviewTextWritingC1.ts
```

- Keep shared data structures exam-agnostic where possible; express C1 specifics through exam IDs, difficulty metadata, and prompt templates.
- Do not treat C1 Writing as implying other C1 skills are available in the UI.
- When adding C1 Writing exercises or prompts, follow the same seed + merge patterns as other skills (Phase 1: localStorage; Phase 2+: API / PostgreSQL).

## Persistence and AI

- **Phase 1:** drafts and results may live in localStorage; core writing practice must work without AI.
- **Phase 2 onward:** user attempts, drafts, and results move to PostgreSQL via the NestJS API on the local Docker Compose stack.
- AI remains an optional enhancement in all phases.
