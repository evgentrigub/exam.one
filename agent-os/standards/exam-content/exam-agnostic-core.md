# Exam-Agnostic Core

exam.one is a multi-exam framework. Goethe A2 is the first live pack, not the platform core.

Allowed to name Goethe / Teile / scoring rules:

- `@exam-one/exam-content` types and seeds
- `@exam-one/exam-packs` under `data/src/packs/` (structure + `PromptSpec`s)

Must stay generic:

- Nest modules, Prisma schema, contracts domain DTOs, auth, layout/cards, composable orchestration

- New exams add a folder under `data/src/packs/` and register it in `data/src/registry.ts`. Do not edit Nuxt, Nest, or Prisma to add a pack.
- Shared UI reads pack `structure` (`skill`, title, timing, `itemFormat`) plus `payload` / `testingPart` — not hard-coded Teil copy.
- Prompt bodies live only in the pack. Nest never hard-codes a Goethe A2 prompt matrix.
