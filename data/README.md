# Exam packs · @exam-one/exam-packs

[Back to the application](../README.md#how-the-framework-works)

This package is the content and runtime boundary of exam.one's generic language-exam framework. Each pack defines an exam board, language, CEFR level, task structure, prompts, validation, scoring, speech metadata, and optional bundled content. The application reuses shared practice and persistence flows across packs.

Add an exam by creating `src/packs/<packId>/` and registering it in [src/registry.ts](src/registry.ts). A pack using supported interactions needs no application, database, or seed-script changes. A new interaction requires shared framework work before it can be used as pack data.

## Package map

| Source                                                 | Responsibility                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| [src/types.ts](src/types.ts)                           | Pack, part, module, speech, and PromptSpec contracts               |
| [src/registry.ts](src/registry.ts)                     | Pack registration and live availability                            |
| [src/runtime.ts](src/runtime.ts)                       | Exercise views, adapters, scoring, and review validation           |
| [src/validation.ts](src/validation.ts)                 | Registry validation                                                |
| [src/mock-rules.ts](src/mock-rules.ts)                 | Objective points, group pass rules, and scale conversion           |
| [src/bundled-audio.ts](src/bundled-audio.ts)           | Bundled listening segments and paths                               |
| [src/packs/](src/packs/)                               | Per-exam definitions, prompts, rules, adapters, and content        |
| [src/testing/english-a1.ts](src/testing/english-a1.ts) | Synthetic extension fixture; excluded from the production registry |

## Current packs

| Pack              | Language / level | Available product                                                                    |
| ----------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `goethe-de-a1`    | German A1        | Four skills and mock exams; forms, word cards, request cards                         |
| `goethe-de-a2`    | German A2        | Four skills and mock exams                                                           |
| `goethe-de-b1`    | German B1        | Four skills, three writing tasks, 15 practice seeds and formative feedback; no mocks |
| `cambridge-en-a2` | English A2       | Four skills and mock exams; typed gaps and estimated Cambridge Scale results         |
| `cambridge-en-b1` | English B1       | Four skills, 16 original practice seeds and formative feedback; no mocks             |
| `certpol-pl-a2`   | Polish A2        | Four skills and mock exams; fractional objective marks and written/oral pass groups  |
| `certpol-pl-b1`   | Polish B1        | Reading/grammar, listening, writing and solo speaking; 23 practice seeds; no mocks   |
| `dele-es-a2`      | Spanish A2       | Four skills and mock exams; two pass groups                                          |
| `dele-es-b1`      | Spanish B1       | Four skills, 16 original practice seeds and formative feedback; no mocks             |
| `goethe-de-c1`    | German C1        | Inactive historical stub; no new practice or grading                                 |

`DEFAULT_PACK_ID` is `cambridge-en-a2`. Live packs are selected in Settings → Learning plan. New levels and boards use the same registration contract. A pack's language is independent of the UI locale.

## B1 implementation: stage 2.18

**Stages 2.18.1–2.18.4 are implemented and locally enabled.** The registry includes English B1 (`cambridge-en-b1`), Polish B1 (`certpol-pl-b1`), Spanish B1 (`dele-es-b1`) and German B1 (`goethe-de-b1`). Together they provide 70 original practice seeds and 116 prompt slots.

| Stage  | Pack              | Seeds / prompt slots | Scope and evidence                                                                               |
| ------ | ----------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| 2.18.1 | `cambridge-en-b1` | 16 / 28              | [Brief](src/packs/cambridge-en-b1/brief.md), [checks](src/packs/cambridge-en-b1/verification.md) |
| 2.18.2 | `certpol-pl-b1`   | 23 / 33              | [Brief](src/packs/certpol-pl-b1/brief.md), [checks](src/packs/certpol-pl-b1/verification.md)     |
| 2.18.3 | `dele-es-b1`      | 16 / 28              | [Brief](src/packs/dele-es-b1/brief.md), [checks](src/packs/dele-es-b1/verification.md)           |
| 2.18.4 | `goethe-de-b1`    | 15 / 27              | [Brief](src/packs/goethe-de-b1/brief.md), [checks](src/packs/goethe-de-b1/verification.md)       |

B1 packs include original practice tasks and formative writing/speaking feedback. English B1 uses solo speaking cues, written scene descriptions and one assigned writing task per exercise. It omits mock factories, official result conversions and bundled listening WAVs. Polish B1 places clearly labelled grammar tasks in the Reading catalog, preserving separate official paper scores; its writing tasks use the assigned 25+175-word pair. Spanish B1 uses fixed examiner cards, written scenes and assigned writing options. Reading and listening each retain /30 raw marks; writing/speaking use formative 0–3 analytic bands, with band 2 representing B1. German B1 preserves all three writing tasks, /40+/40+/20 rubric allocations and half-length zero rules; speaking uses fixed partner cues, an assigned presentation and a self-contained feedback task. B1 speaking scores remain formative across all packs.

## Runtime and payload contract

Each available part declares `itemFormat`, `runtime`, and an `adapter`. The database stores the original payload; the adapter projects it into an `ExerciseView` used by scoring, validation, speech, and Past exams.

**Live practice screens consume established raw payload shapes.** Reading uses fields such as `content` and `questions[].question`; listening may use `items[]`; speaking uses the shapes its task layout supports. A live pack must provide that shape and a matching projection. The shared [raw adapter](src/packs/goethe-shared/raw-adapter.ts) supports existing packs with pack-owned runtime rules.

`formatAdapter` projects generic fixtures into views, but its default payload is not a universal live-screen schema. Use it for headless tests and supported projections; confirm every new live payload against its practice screen.

| Format       | Generic projected input                                     | Runtime configuration                                    |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------- |
| `selection`  | Questions with `id`, `text`, `options`, and `correctAnswer` | Counts, weights, maximum, multiplier                     |
| `matching`   | Questions sharing an ordered option list                    | Counts and `reuseOptions`                                |
| `true-false` | Questions with answer index 0 or 1                          | Count and two options                                    |
| `gap-fill`   | Questions with `accepted: string[]`; no options             | Gap count and weights                                    |
| `freeform`   | `fields` keyed by field ID                                  | Field labels, word bounds, and optional zero-below rules |
| `recording`  | `segments` keyed by segment ID                              | Ordered segments and labels                              |

Gap answers are checked by `isGapAnswerCorrect`. Case, spacing, typographic apostrophes/dashes, and outer punctuation are normalized; spelling is not. List valid alternatives explicitly in `accepted`. Raw reading/listening payloads use `questions[].accepted` with numbered gaps such as `(1) ____`; reserve `(0)` for a worked example. The projection uses `options: []` and `correctAnswer: -1`. Keep typed answers out of `correctAnswer`, which generation normalizes as a choice index.

Audio may be shared or per question/item. Runtime rules supply timing and replay limits; pause/resume does not consume another replay. Recording tasks retain editable/manual transcripts when microphone or STT is unavailable.

### Layouts

| Layout          | Format      | Interaction                                                              |
| --------------- | ----------- | ------------------------------------------------------------------------ |
| `form-fill`     | `freeform`  | Scenario plus form rows mapped to field IDs; expected entries for review |
| `word-cards`    | `recording` | One recording per ask/answer card, mapped to segment IDs                 |
| `request-cards` | `recording` | One recording per request/respond card, mapped to segment IDs            |

Form payloads include `form: { title, rows: [{ label, value?, field?, options? }] }` and `expected`. Card payloads include `cards: [{ segment, kind, cue, topic? }]` in segment order. An answer/respond card may set `speaker: 'examiner'` for a fixed examiner cue.

Per-part practice copy controls labels, tips, phrases, instructions, subtitles, estimated time, session countdowns, exercise types, and session titles. Keep this copy in the pack. An unfamiliar interaction, such as a live conversation partner, requires a new shared layout or flow.

### Validation and rubrics

Objective weights must sum to the raw maximum. Rubric criteria use stable IDs, labels, and `maxPoints`; criterion totals must match the rubric maximum. Fractional scores are supported.

A review contains criteria points/comments, `totalPoints`, `maxPoints`, `summary`, `strengths`, and `improvements`. The API validates totals, derives stored scores, and applies pack-configured word rules. A per-part `validate(payload, rules)` catches content/shape constraints that the projected view cannot express.

Registry startup rejects duplicate identities, unsupported formats, missing adapters/rules/prompts, invalid references, inconsistent rubrics, impossible bounds, incompatible layouts, and invalid seed IDs. Generated payloads pass the production validators; generation retries once after an invalid response.

## Prompts and bundled content

Keep prompt definitions in `src/packs/<packId>/prompts/{reading,listening,writing,speaking}.ts`. Each slot is a `PromptSpec`: role, task, rules, optional examples, output contract, and optional LLM settings. `assemble()` interpolates runtime values; `buildReviewVars` supplies pack-specific review context.

Edit prompt source files to change behavior. A prompt editor/override API is not mounted; an unused override table remains in the database.

Bundled payloads, types, audio maps, and mock Set 1 belong in the pack's `content/` folder. `seedExercises` lists content by skill. Each payload needs a stable unique ID within that pack; `examOnly: true` keeps mock parts out of practice catalogs. `pnpm db:seed` discovers every registered pack and upserts its content without wiping user-owned exercises.

Mocks are optional at the framework level. A pack with `createMockSet` may generate sets; `bundledMockSet` supplies Set 1. Mock definitions persist their own timing, replay, and scoring rules, including total pass marks, pass groups, or a score scale. All four B1 packs are live practice-only packs and do not provide mocks.

## Contributor workflow

1. Write a brief that distinguishes the exam's rules from application practice adaptations.
2. Define a unique identity and structure in `src/packs/<packId>/pack.ts`. Part numbers are positive and scoped to each skill.
3. Configure runtime rules, payload adapters, validation, prompt specs, and supported layouts for every available part.
4. Add original seeds, explicit accepted answers, speech metadata, and optional mock factories/rules.
5. Register the pack in `src/registry.ts`. Add shared UI locale entries if it introduces new criterion or exercise-type labels.
6. Build, validate seeds and generation, seed the database, and try every part and mock result path. Enable `live` only after the supported flows work.

The [exam-pack-author skill](../.agents/skills/exam-pack-author/SKILL.md) guides authoring. Existing pack folders are worked examples; the synthetic English A1 fixture demonstrates arbitrary parts, another rubric, and supported formats without claiming an official exam.

Run from the application root:

```bash
pnpm --filter @exam-one/exam-packs build
pnpm --filter @exam-one/exam-packs lint
pnpm --filter @exam-one/exam-packs type-check
pnpm test:backend
```

The prompt-evaluation harness requires a built workspace (`pnpm build`). For a chosen registered pack:

```bash
node scripts/eval-prompts.mjs --pack cambridge-en-a2 --control
node scripts/eval-prompts.mjs --pack cambridge-en-a2 --n 3
```

`--control` checks bundled seeds without a paid call; `--n` exercises generators through the configured LLM. Replace the sample pack ID with the pack under development. The data package's `test` command is a placeholder; automated pack/runtime tests run in backend Jest.

Format validation verifies implementation contracts. Linguistic accuracy, level appropriateness, and useful feedback also require content review.

## Identity, history, and provider availability

Frontend requests send `x-exam-pack`; requests without it resolve the user's active settings. New practice/generation requires a registered live identity. Catalogs, drafts, attempts, mocks, and generated media carry user/pack ownership. Activity lists the user's jobs across packs.

New practice attempts store version-1 rendering/rubric snapshots. Historical review uses the saved snapshot and pack; version-0 snapshots retain older payloads. Inactive history remains readable without enabling new practice. `legacy-history` holds unattributable old records and is not selectable.

Speech metadata declares the intended language/voices, but does not install models. TTS checks instance configuration and reported installed voices; STT checks supported languages. Unavailable providers preserve explicit error states and manual transcript entry. New generated audio uses user/pack/exercise namespaces; historical shared paths remain readable.

See the [TTS](../scripts/tts/README.md) and [STT](../scripts/stt/README.md) guides for installation and capabilities.
