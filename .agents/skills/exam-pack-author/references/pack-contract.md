# Pack contracts and examples

Read the current repository sources before authoring. Paths below are relative to the application root; do not resolve them against this reference directory.

## Source map

| Source | Use |
| --- | --- |
| `data/src/types.ts` | `ExamPack`, module/part identities, `PartLayout`, `PromptSpec`, speech configuration |
| `data/src/runtime.ts` | `PartRuntime`, `formatAdapter`, `defineAdapter`, `ExerciseView`, `objectiveScore`, `validateReview`, `resolveAnswers` |
| `data/src/assemble.ts` | `definePrompt` and variable interpolation |
| `data/src/validation.ts` | Registry configuration validation and its limits |
| `data/src/registry.ts` | Existing identities, aliases, and registration |
| `data/src/packs/goethe-de-a1/` | **The worked example of a new pack**: brief, structure, runtime rules, per-part validators, review variables, prompts per module, one seed per part, practice copy, and all three layouts |
| `data/src/packs/cambridge-en-a2/` | A second worked example in another language: gap-fill parts, shared-recording choice and matching listening, examiner cards on `word-cards`, and British English speech |
| `data/src/packs/certpol-pl-a2/` | A third: half-point parts, a gap-fill form, true/false on the shared-choice shape, a keyword monologue beside card exchanges, and Polish speech |
| `data/src/packs/dele-es-a2/` | A fourth: man / woman / neither matching on the shared bank, one-option-per-exercise writing choice, a written-scene monologue and an examiner-led role-play, and Spanish speech |
| `data/src/packs/goethe-de-a2/` | The reference for every optional slot, including a mock factory and `mockOverview` |
| `data/src/packs/goethe-de-b1/` | B1 in German with a pack-local `runtime.ts` (`attachRuntime`), `titles.ts` and `verification.md`: Richtig / Falsch question rows, advertisement matching with exactly one `x`, three numbered writing tasks, fixed partner turns for planning, presentation and feedback on `word-cards`, and a module-per-group mock |
| `data/src/packs/goethe-de-c1/` | The richest German example: four-option choice gaps (`choiceGaps`), a sentence bank without reuse, opinion matching with `x`, listening `sections` with separate recordings, hearing limits and preview time, writing bands (`allowedPoints`) with `zeroCriterion` and guidance-only word counts, speaking `topicOptions` with timed segments, and a 20-minute mock preparation phase |
| `data/src/packs/cambridge-en-b1/`, `certpol-pl-b1/`, `dele-es-b1/` | B1 in English, Polish and Spanish: scale-reported, separate-paper (`moduleIds`) and two-group mocks |
| `data/src/packs/goethe-shared/raw-adapter.ts` | The projection from the raw payload shape the practice screens read |
| `data/src/mock-rules.ts` | `evaluateMockPass`, `objectiveExercisePoints` and scale conversion |
| `data/src/testing/english-a1.ts` | Original synthetic examples of all six formats in the generic shape; not a production registration |
| `apps/backend/src/ai/pack-ai.service.ts` | Read-only reference for generation, prompt variables, and review processing |
| `apps/backend/test/unit/ai/pack-structure-i18n.spec.ts` | Fails any registered pack without `structureText` for every locale |
| `scripts/eval-prompts.mjs` | Offline seed check (`--control`) and live generator eval (`--n`), per pack with `--pack` |
| `scripts/generate-listening-audio.mjs` | Bundled seed WAVs: `pnpm generate:listening-audio --packs <packId>` |

## Identity and configuration

Use a distinct `packId` such as a board/language/level combination. Check aliases against both live and inactive packs. `examIds` provides aliases, not another independent namespace. Do not change `DEFAULT_PACK_ID`. The `board` string groups packs in Learning plan and is labelled through `settings.boards.<board>`; a new board needs that key in every UI locale.

Modules use the existing IDs `reading`, `listening`, `writing`, and `speaking`. A part's identity is its module ID plus positive integer `n`; numbers can repeat in different modules. The part's `skill` string is descriptive, not a replacement for the module ID. `itemFormat` selects the default screen for the skill and the prompts it needs; `format` is a descriptive string.

Available parts need a runtime configuration and adapter. Configure positive practice minutes and raw `maxPoints`, plus applicable counts, matching reuse, replay limits, writing fields, recording segments, and rubric criteria. Criterion maxima sum to raw `maxPoints`. A multiplier is separate from the raw rubric; do not apply it twice. Module totals and durations should reflect the documented exam/practice scope, with any conversion explained in `scoringNote`.

Optional `PartRuntime` fields, all used by an existing pack:

| Field | Use |
| --- | --- |
| `reuseOptions: false` | Every question's answer is a different option (headline or sentence banks). Validation rejects repeated answers, so a repeatable `x` needs a pack `validate` guard instead, as in Goethe B1 Reading 3. |
| `replays`, `previewSeconds` | How often a recording may be heard, and the reading time before it starts. |
| `criteria[].allowedPoints` | Discrete bands, highest first, such as `[5, 3, 1, 0]`; a review outside them fails validation. |
| `zeroCriterion` | A criterion whose zero zeros the whole review (Goethe C1 Erfüllung). Omit it when the exam has no such rule. |
| `fields[].zeroBelowWords`, `wordCountGuidanceOnly` | A whole-task zero below a word count; a word range shown as guidance rather than a submission gate. |
| `segments[].maxSeconds` | A recording limit per speaking segment. |
| `multiplier` | Converts raw points to the official scale, for example a writing rubric `× 3`. Practice and mock results apply it once. |

Optional slots, all used by an existing pack:

| Slot | Where | Use |
| --- | --- | --- |
| `validate(payload, rules)` | part | Reject a generated payload the projection cannot catch: exact counts, fixed option labels, required metadata. Throw with a precise message. Runs on generation; a failure is retried once. |
| `layout` | part | A dedicated screen; see [Layouts](#layouts). |
| `choiceGaps` | part | A choice or bank part whose questions are numbered gaps `(1) ____` in the reading passage; the chosen word or sentence is shown in the gap. Answers remain option indices. |
| `practiceLabel`, `tips`, `phrases`, `instruction`, `practiceSubtitle`, `practiceMinutes`, `practiceTimerSec`, `practiceType`, `sessionTitle` | part | Screen copy and chrome. `practiceType` resolves through the frontend's `exerciseType.*` i18n; add a key when a new type appears. |
| `buildReviewVars` | pack | Variables an `answer` or `review` prompt names beyond `{task}`, `{userContent}` and `{outputLanguage}`. |
| `seedExercises` | pack | Bundled exercises per module, upserted by `pnpm db:seed` under this pack's id and level. Each needs a unique string `id`. |
| `createMockSet`, `bundledMockSet`, `mockOverview` | pack | Mock exams; every registered pack fills all three, and `goethe-shared/mock-overview.ts` builds the overview. A set's `rules` is one total (`maximumPoints`, `passPoints`); or, for an exam passed per group, `groups: [{ id, label, skills, maximumPoints, passPoints }]` with no top-level `passPoints` (DELE, Goethe B1/C1 with one group per module); or, for a reported scale, `scale: { id, min, max, pass, officialRaw, anchors, bands }` that converts each module's raw marks (keep `multiplier` 1) and averages them (Cambridge English Scale). `evaluateMockPass` scores all three. A group may select separate papers with `moduleIds` (Polish Reading and Grammar), and `rounding: 'none'` compares fractional marks exactly instead of rounding to whole points. A module definition may set `preparationMinutes` (a saved speaking preparation phase), `provisional` (a transcript-based estimate), `roundFinalPoints`, and a paper `id` / `label` / `labelKey`. Objective exercises score in points: correct answers out of the exercise's questions, scaled to its `maxRawPoints` (`objectiveExercisePoints`), so half-point or five-point items need no special case. Mock content uses fresh seeds marked `examOnly: true`, which the practice catalog hides. Without these slots the mock screens report mocks as unavailable. A bundled set is upserted by `db:seed`; its listening seeds with an explicit `audio` map under the pack's `audioPathPrefix` get seed WAVs from `pnpm generate:listening-audio`. |

Adding a pack does not install speech models or supply a mock factory.

## Payload shapes

**The practice screens read the raw payload, not the projected view.** A payload that only matches `formatAdapter`'s generic shape projects and validates, but renders blank on the practice screens. For a live pack, store the shapes below and project them with a pack-owned adapter; reuse `goetheRawAdapter` with the pack's own rules where the shapes match. `formatAdapter` remains right for fixtures and headless tests.

| Skill | Raw payload the screen reads |
| --- | --- |
| Reading | `title`, `content`, `textType` (`email`, `notice`, `article`, `advertisement`, `instructions`, `announcement`, `list`), `estimatedReadingTime`, `wordCount`, `topics`, `questions: [{ id, textId, question, options, correctAnswer, explanation, type }]` |
| Reading, several texts | One `content` string with each text, advertisement or opinion as its own paragraph, introduced by its label (`A · …`, `1 · …`); questions reference the labels, and options may carry the same `A · ` / `x · ` prefixes |
| Reading choice gaps | `content` with gaps `(1) ____` …, `questions[]` with `options` and `correctAnswer` per gap, and the part's `choiceGaps: true`; a shared bank repeats the same `options` in every question |
| Listening | `title`, and either `items: [{ id, context, transcript, question, options, correctAnswer, explanation }]` (one recording per item), or a shared `transcript` with `questions` that carry their own `options` (choice, including `["Richtig", "Falsch"]` rows), or with top-level `options` and `questions[].person` (matching), or with `questions[].statement` (true/false), or `sections: [{ id, transcript, questionIds }]` for several separately recorded sections of one part (audio in `audio.sections` by section id) |
| Gap-fill (reading or listening) | `content` with gaps marked `(1) ____` … (`(0)` is a worked example), `questions: [{ id, question, accepted, explanation }]` with no `options` or `correctAnswer`; listening adds the shared `transcript` |
| Writing | `title`, `description`, `task`, `requirements`, `topicType`, `estimatedTime`, `wordCount: { min, max }`, `category`; one exercise is one task, so an official choice between tasks becomes one option per exercise, told apart by `topicType` (DELE) |
| Speaking | `theme`, `topicType`, and `answerQuestions` + `askQuestions`, `keywords`, or `cards`; `topicOptions: [{ id, theme, cards }]` lets the learner choose a topic first (Goethe C1), and the choice is saved with the transcripts |

`correctAnswer` is always a zero-based integer; a gap-fill question has none and is scored against `accepted`, which must list every acceptable variant (spelling, digits and words, time formats), because comparison only ignores case, spacing, typographic apostrophes and outer punctuation. For true/false store `options: ["Richtig", "Falsch"]` (in the exam language) with 0 for true; a boolean renders but always scores as wrong. The practice word-count gate uses the payload's `wordCount`, so set a range the learner can meet.

Objective questions may include `explanation`, `weight`, `audio`, and `transcript`. Missing weights default to one. Scores normalize earned weight against total weight and scale to `maxPoints * multiplier`.

Audio can use `audio.shared` or `audio.items` keyed by question ID. A listening seed may ship without audio: the player then shows the missing-audio notice and **Generate audio** synthesises it per user. Do not invent audio URLs. Label dialogue turns (`Mann: … Frau: …`) so TTS assigns two voices.

## Layouts

A part names a `layout` when its skill's default screen cannot express the interaction. Registry validation only accepts a layout on its own format. These exist; using one is pack data:

| `layout` | Format | Payload additions | Answers stored as |
| --- | --- | --- | --- |
| `form-fill` | `freeform` | `form: { title, rows: [{ label, value? , field?, options? }] }`, where blank rows carry `field` ids matching the part's `fields` in order, and `expected: { [fieldId]: entry }` for the reviewer | one entry per field id |
| `word-cards` | `recording` | `cards: [{ segment, kind: 'ask' \| 'answer' \| 'presentation', topic, cue, speaker? }]`, one per segment in order; `speaker: 'examiner'` shows an `answer` card as an examiner or fixed partner line, and `presentation` is a prepared monologue | one transcript per segment id |
| `request-cards` | `recording` | `cards: [{ segment, kind: 'request' \| 'respond', cue }]`, one per segment in order | one transcript per segment id |

An interaction none of the screens or layouts support is a new layout: application work outside ordinary pack authoring. Explain the gap rather than forcing the task into an unsuitable screen.

## Prompt construction

Use `definePrompt` with explicit `skill`, `part`, `kind`, role, task, rules, and output contract. Available objective parts require `generator`; freeform and recording require `generator`, `answer`, and `review`. Set `llm: { maxTokens }` on long generators; `temperature` is ignored by OpenAI reasoning models.

The backend supplies:

- Generator: `{count}`. Specify exam language, CEFR, structure, and constraints in the prompt. Return a JSON array even for one exercise. The backend assigns `id`, `testingPart`, `difficulty`, and `createdAt`, and stamps per-question ids.
- Answer/review: `{task}` and `{userContent}` as serialized JSON, and `{outputLanguage}` from the learner's interface language. Anything else must come from `buildReviewVars`.
- Review: one JSON object with `criteria`, `totalPoints`, `maxPoints`, `summary`, `strengths`, and `improvements`. Each criterion uses the configured `id`, `label`, `maxPoints`, numeric `points`, and a `comment`. Optional `wordCount`, `ruleApplied`, `checks`, `priorityFixes`, `examples`, `report` and per-criterion `grade` render on the writing card when present. Totals are raw; fractional points are supported.

Unknown placeholders remain unresolved during assembly and reach the model verbatim. Include task-specific grading guidance beyond a schema example. Do not reproduce official task text in examples.

The review validator checks criterion identities, maxima, ranges, and summed totals. The writing zero-word rule zeros the entire review when any configured field falls below its `zeroBelowWords`; omit the threshold when the exam has no such rule. A speaking review with any blank segment transcript is refused before the model is called.

Criterion labels on the review cards are resolved from frontend i18n by criterion id, falling back to the rubric label. Add keys for new ids.

## Speech

Configure `ttsLang`, `sttLang`, voices, and a distinct `audioPathPrefix`. Use empty voices when no supported voice has been established instead of borrowing German IDs. The TTS service ships German (`martin`, `bernd`, `victoria`, `eva`) British English (`bf_emma`, `bf_isabella`, `bm_george`, `bm_fable`) and Spanish (`ef_dora`, `em_alex`, `em_santa`) on Kokoro, and Polish (`pl_gosia`, `pl_darkman`, `pl_bass`) on Piper; an instance serves the languages in `KOKORO_LANGS` / `TTS_LANGUAGES`. For other languages, dialogue voices come from the pack's voices by speaker gender, so label turns with roles or first names the voice mapping knows (English; Polish including `Pan` / `Pani` + surname; Spanish including `Señor` / `Señora` + surname, at the start of a line or sentence). Listening true/false on the `statement` shape shows German Ja / Nein buttons; exams that print Richtig / Falsch, and other languages, use `question` rows with their own two `options`. Speech-to-text is language-aware: Phonon 2 for English and Parakeet Q4 for German, Polish and Spanish, installed per instance. Configuration does not install provider models or guarantee that the language is supported. Set `maxChunkCharacters` (400 in Goethe C1) for long recordings. Preserve the expectation of editable/manual transcripts and explain when audio generation is unavailable.
