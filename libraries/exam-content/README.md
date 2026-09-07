# @exam-one/exam-content

[Back to the project README](../../README.md#project-structure)

Bundled Goethe exercise content, TypeScript payload types, listening audio-path helpers and mock Set 1 definitions/factory. This internal workspace package is shared by the applications, database seed runner and exam-pack package.

## Contents

| Path | Responsibility |
| --- | --- |
| [src/index.ts](src/index.ts) | Public exports |
| [src/types/](src/types/) | Reading, writing, listening and speaking payload types |
| [src/seeds/](src/seeds/) | Bundled passages, questions, writing tasks, listening transcripts and speaking topics |
| [src/seeds/mock-exam.ts](src/seeds/mock-exam.ts) | Goethe A2 Set 1, mock factory, timing/scoring and replay/pass rules |
| [src/listening/audio-paths.ts](src/listening/audio-paths.ts) | Bundled listening audio URL helpers |

## Content versus pack definitions

Edit this package to correct a bundled passage, question, answer, topic or mock definition. Preserve exercise IDs and relationships: existing database records and attempts refer to them. Persist catalog updates through [database seed upserts](../database/README.md).

[data/](../../data/README.md) owns pack identity, structure, generation/review prompts, configurable practice rules and adapters. For example, the actual reading passage belongs here; the pack's five-question format and grading configuration belong in `data/`. Adapters preserve existing Goethe payload shapes while supplying shared rendering views.

Bundled content remains here for compatibility. New packs can generate exercises through the data-only extension workflow without modifying this library. This package contains audio references and transcripts; audio files are provisioned separately by the stack's audio utilities.

```ts
import { goetheA2MockExamSet1 } from '@exam-one/exam-content'
import type { ReadingExercise } from '@exam-one/exam-content'
```

## Commands

Run from the repository root after `pnpm install`:

```bash
pnpm --filter @exam-one/exam-content build
pnpm --filter @exam-one/exam-content type-check
pnpm --filter @exam-one/exam-content lint
```

The package's `test` command is a placeholder. Backend pack-runtime tests exercise bundled Goethe projections and score compatibility; see [verification](../../data/VERIFICATION.md). Edit `src/`, not generated `dist/` output. ESM workspace consumers use the source entry; CommonJS consumers use the compiled entry.
