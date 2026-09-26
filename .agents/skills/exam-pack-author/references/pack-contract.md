# Pack contracts and examples

Read the current repository sources before authoring. Paths below are relative to the application root; do not resolve them against this reference directory.

## Source map

| Source | Use |
| --- | --- |
| `data/src/types.ts` | `ExamPack`, module/part identities, `PromptSpec`, speech configuration |
| `data/src/runtime.ts` | `PartRuntime`, `formatAdapter`, `ExerciseView`, `objectiveScore`, `validateReview` |
| `data/src/assemble.ts` | `definePrompt` and variable interpolation |
| `data/src/validation.ts` | Registry configuration validation and its limits |
| `data/src/registry.ts` | Existing identities, aliases, and registration |
| `data/src/testing/english-a1.ts` | Original synthetic examples of all five formats; not a production registration |
| `data/src/packs/goethe-de-a2/pack.ts` and its sibling files | Live exam structure and detailed prompt examples; the reference implementation of every optional pack slot |
| `apps/backend/src/ai/pack-ai.service.ts` | Read-only reference for generic generation, prompt variables, and review processing |

## Identity and configuration

Use a distinct `packId` such as a board/language/level combination. Check aliases against both live and inactive packs. `examIds` provides aliases, not another independent namespace. Do not change `DEFAULT_PACK_ID`.

Modules use the existing IDs `reading`, `listening`, `writing`, and `speaking`. A part's identity is its module ID plus positive integer `n`; numbers can repeat in different modules. The part's `skill` string is descriptive, not a replacement for the module ID. `itemFormat` selects the renderer; `format` is a descriptive string.

Available parts need a runtime configuration and adapter. Configure positive practice minutes and raw `maxPoints`, plus applicable counts, matching reuse, replay limits, writing fields, recording segments, and rubric criteria. Criterion maxima sum to raw `maxPoints`. A multiplier is separate from the raw rubric; do not apply it twice. Module totals and durations should reflect the documented exam/practice scope, with any conversion explained in `scoringNote`.

New packs normally omit `createMockSet`. The optional slots — `exerciseId`, `buildReviewVars`, `mockOverview` — exist for packs whose storage or review conventions need them; omit them and the generic path applies. Adding a pack does not install content into the database or supply a mock factory automatically.

## Generic payload conventions

Create an adapter with `formatAdapter(itemFormat, runtime)`. Author prompts and samples that agree with the same runtime object. The adapter projects stored payloads into a versioned view; samples remain ordinary pack-local payloads.

| Format | Payload shape and rules |
| --- | --- |
| Selection | `title`, optional `text`, and `questions` containing stable `id`, `text`, string `options`, and zero-based integer `correctAnswer` |
| Matching | Same question shape; use the same ordered option bank for every question. With `reuseOptions: false`, correct answer indices must be unique. |
| True/false | Question `correctAnswer` is `0` for true or `1` for false. The generic helper supplies the labels `True` and `False`; generated options do not override them. |
| Freeform | `title`, `text`, and a `fields` object mapping configured field IDs to task prompts |
| Recording | `title`, `text`, and a `segments` object mapping every configured segment ID to a nonempty prompt, displayed in configured sequence |

Objective questions may include `explanation`, `weight`, `audio`, and `transcript`. Missing weights default to one. Scores normalize earned weight against total weight and scale to `maxPoints * multiplier`; weights do not have to sum to `maxPoints`.

Shared audio can use an `audio` string or `audio.shared`; per-item audio can use question `audio` or `audio.items` keyed by question ID. Top-level and per-question transcripts are supported. Do not invent existing audio URLs or assume transcript text alone means audio has been generated. Keep source language and provider capability separate from payload compatibility.

Use the generic helper unless a documented payload requirement actually needs a pack-owned projection. A custom projection must still return the existing `ExerciseView` and pass `validateView`; it cannot add a new interaction. Avoid custom validators that duplicate the generic helper.

## Prompt construction

Use `definePrompt` with explicit `skill`, `part`, `kind`, role, task, rules, and output contract. Available objective parts require `generator`; freeform and recording require `generator`, `answer`, and `review`.

The current generic backend supplies:

- Generator: `{count}`. Specify exam language, CEFR, structure, and constraints in the pack's prompt rather than relying on nonexistent variables. Return a JSON array even for one exercise. The backend assigns `id`, `testingPart`, `difficulty`, and `createdAt`.
- Answer/review: `{task}` and `{userContent}` as serialized JSON, and `{outputLanguage}` (currently `en`). A model answer returns text. Do not promise a configurable feedback language that the current caller cannot supply.
- Review: return one JSON object with `criteria`, `totalPoints`, `maxPoints`, `summary`, `strengths`, and `improvements`. Each criterion uses the configured `id`, `label`, `maxPoints`, numeric `points`, and a `comment`. Totals are raw scores; fractional points are supported.

Unknown placeholders remain unresolved during assembly. Do not copy Goethe-specific prompt variables without checking the generic caller. Include task-specific grading guidance beyond a schema example.

The generic review validator checks criterion identities, maxima, ranges, and summed totals. The current writing zero-word rule zeros the entire review when any configured field falls below its `zeroBelowWords` threshold. Do not describe it as a per-field deduction. If official rules differ, resolve the adaptation rather than misrepresenting the behavior.

## Speech

Configure `ttsLang`, `sttLang`, voices, and a distinct `audioPathPrefix`. Use empty voices when no supported voice has been established instead of borrowing German IDs. Configuration does not install provider models or guarantee that the language is supported. Preserve the expectation of editable/manual transcripts and explain when audio generation is unavailable.
