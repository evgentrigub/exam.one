# German Exam Reference — Goethe C1 Writing

Use this document when changing the existing Goethe C1 writing content, prompt templates, review logic, or grading.

This is a specialized content reference. It does not define the current product phase or the completion status of German / Goethe A2.

## Existing writing support

- Writing practice (tasks aligned to Goethe-Zertifikat C1 writing expectations)
- Editable demo prompt templates for exercise generation, model answers, and writing review
- AI-assisted generation and review via bring-your-own-key (OpenAI / OpenRouter), with graceful degrade when AI is unavailable

## Implementation pointers

Typed seed / prompt modules for C1 writing currently live under:

```
apps/frontend/data/writing/c1/
  exerciseGeneratorWritingC1.ts
  answerGeneratorWritingC1.ts
  reviewTextWritingC1.ts
```

- Keep shared data structures exam-agnostic where possible; express C1 specifics through exam IDs, difficulty metadata, and prompt templates.
- When adding C1 Writing exercises or prompts, follow the same seed and persistence boundaries as other skills.

## Persistence and AI

- Existing frontend drafts and results may live in localStorage; core writing practice must work without AI.
- During the Phase 2 cutover, user attempts, drafts, and results move to PostgreSQL via the NestJS API on the local Docker Compose stack.
- AI remains an optional enhancement in all phases.
