# Exam-Agnostic Core

exam.one is a multi-exam framework. Goethe A2 (plus C1 Writing) is the first pack, not the platform core.

Allowed to name Goethe / Teile / scoring rules:

- `@exam-one/exam-content` types and seeds
- `apps/frontend/data/` prompts, reviews, `examStructure/`

Must stay generic:

- Nest modules, Prisma schema, contracts domain DTOs, auth, layout/cards, composable orchestration

- New exams add a pack (types + seeds + prompts), not Goethe columns or `if (exam === 'goethe')` in Nest.
- Shared UI reads `skill`, `level`, `payload`, `testingPart` — not hard-coded Teil copy.
