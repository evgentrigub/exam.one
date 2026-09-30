# Exam packs

Forkers add an exam by creating a folder under `src/packs/` and registering it in `src/registry.ts`. A pack that uses the existing exercise types needs no edits to `apps/` or `libraries/`. A new *type* of exercise — a screen the app does not have yet — is application work, and is added once for every pack (see [Layouts](#layouts)).

| Path | What lives here |
| --- | --- |
| `src/types.ts` | Generic pack, module, and `PromptSpec` contracts |
| `src/packs/goethe-de-a2/` | Live Goethe A2 (structure, prompts, bundled seeds, mock factory) |
| `src/packs/goethe-de-a1/` | Live Goethe A1 · Start Deutsch 1 (all four modules, one seed per part, mock factory and bundled Set 1) |
| `src/packs/cambridge-en-a2/` | Live Cambridge English A2 Key (all four skills, fourteen parts, one seed per part, gap-fill parts, solo speaking cards, no mocks) |
| `src/packs/certpol-pl-a2/` | Live Certyfikat Polski A2 (all four skills, sixteen tasks, one seed per task, gap-fill numbers and form, solo speaking cards and photo monologue, Polish Piper voices, no mocks) |
| `src/packs/goethe-shared/` | The raw-payload projection the Goethe packs, Cambridge A2 Key and Certyfikat Polski A2 use |
| `src/packs/goethe-de-c1/` | Structural stub only (`live: false`) |

Each prompt slot is a `PromptSpec` with `role`, `task`, `rules`, optional `examples`, and `outputContract`. Runtime values (`{count}`, `{task}`, `{userContent}`, …) are interpolated by `assemble()`.

Optional bundled seeds, payload types, and mock Set 1 live in that pack's `content/` folder. A pack lists its seeds in `seedExercises`, per module; `pnpm db:seed` upserts every registered pack's seeds under that pack's `packId` and `cefr`, so a new pack needs no seed-script edit. Each seed needs a unique string `id`, and `examOnly: true` stores it as mock-exam-only content. New packs can be authored from an exam brief with the `exam-pack-author` skill (`.agents/skills/exam-pack-author/`).

## Runtime contract

Every available part declares `itemFormat`, `runtime`, and an `adapter`. The database keeps the original payload; the adapter projects it into an `ExerciseView`, which the backend scores and validates against, TTS reads transcripts from, and Past exams renders.

**The practice screens read the raw payload, not the view.** Each skill has its own screen and recognises exercises by field names (`content`, `questions[].question`, `items[]`, `answerQuestions`, `keywords`, …). A pack whose exercises must run on those screens stores that raw shape and projects it with a pack-owned adapter; the Goethe packs share one in `src/packs/goethe-shared/raw-adapter.ts`, parametrised by each pack's rules. `formatAdapter(format, runtime)` projects the generic shape below, which the backend and Past exams understand but the practice screens do not render — use it for fixtures and headless tests, not for a live pack.

| Format | Default payload | Runtime configuration |
| --- | --- | --- |
| `selection` | `questions: [{id, text, options, correctAnswer, explanation?, weight?}]` | Question/option counts, maximum and multiplier |
| `matching` | Same question shape, with the same ordered option list | Counts and `reuseOptions` |
| `true-false` | Question shape with answer index 0 (true) or 1 (false) | Question count; two options |
| `gap-fill` | `questions: [{id, text?, accepted: string[], explanation?, weight?}]`; no options | Question (gap) count; no `optionCount` |
| `freeform` | `fields: { [fieldId]: prompt }` | `fields` with stable IDs, labels, word bounds and optional zero-below threshold |
| `recording` | `segments: { [segmentId]: prompt }` | Ordered `segments` with stable IDs and labels |

A `gap-fill` question is answered by typing. It projects with `options: []` and `correctAnswer: -1`, and is scored against `accepted` by `isGapAnswerCorrect`, which ignores case, spacing, typographic apostrophes and dashes, and outer punctuation, but not spelling. List every acceptable variant (UK/US spelling, `15`/`fifteen`, `6.30`/`6:30`) in `accepted`; the accepted list is also what the learner sees after submitting. In the raw shape, gaps are `questions[].accepted` and the text marks them `(1) ____`, `(2) ____` …, with `(0)` for a worked example; the reading screen shows that text with the gaps in place, and the listening screen shows it as notes under one shared recording. Keep typed answers out of `correctAnswer`: the generation path coerces numeric strings there for every pack.

All payloads have a title and optional `text`. Objective formats support a shared `transcript` and `audio` URL, per-question transcript/audio, or `audio: {shared?, items?: {[questionId]: url}}`. `replays` limits starts of each audio clip; pause/resume does not consume another replay. `minutes` supplies the practice countdown. Recording segments run sequentially and retain editable transcripts when microphone or STT support is unavailable.

Rubrics use `criteria: [{id, label, maxPoints}]`, `maxPoints`, and optional `multiplier`. Objective weights must sum to the raw maximum. Rubric criteria must sum to their declared maximum. Scores may be fractional; percentages retain integer display rounding. A generated review returns `criteria` with points/comments, `totalPoints`, `maxPoints`, `summary`, `strengths`, and `improvements`. The API validates totals and derives scores, including configured zero-word rules. The synthetic fixture demonstrates a 3.5-point rubric.

A part can also carry a per-part `validate(payload, rules)` guard for anything the projection cannot express (exact item counts, fixed option labels, required metadata). It runs on every generated exercise, and a generation that fails it is retried once. `buildReviewVars` supplies the variables an `answer` or `review` prompt needs beyond `{task}`, `{userContent}` and `{outputLanguage}`.

Registry startup rejects duplicate identities, unsupported formats, missing runtime/adapters/prompts, invalid part references, impossible counts/word bounds, inconsistent rubric totals, a layout on the wrong format, and seeds without a unique id. Error messages identify the pack and part. Goethe JSON is projected, and its stored reviews validated, by the shared adapter in `src/packs/goethe-shared/`; A2 practice raw scores and its mock conversion remain distinct.

## Layouts

`itemFormat` picks the default screen for a part's skill. A part whose interaction that screen cannot express names a `layout` instead; registry validation only accepts a layout on its own format.

| `layout` | Format | Screen | Payload |
| --- | --- | --- | --- |
| `form-fill` | `freeform` | A scenario and a form; blank rows are the part's `fields` | Writing topic plus `form: { title, rows: [{ label, value? , field?, options? }] }` and `expected: { [fieldId]: entry }` |
| `word-cards` | `recording` | One recording per card: ask from a topic + word card, answer a partner question | Speaking topic plus `cards: [{ segment, kind: 'ask' \| 'answer', topic, cue }]` |
| `request-cards` | `recording` | One recording per card: make a request, react to a partner request | Speaking topic plus `cards: [{ segment, kind: 'request' \| 'respond', cue }]` |

Cards map one-to-one onto the part's `segments`, in order. An `answer` or `respond` card may carry `speaker: 'examiner'`, which shows the line as the examiner's question instead of the partner's (Cambridge A2 Key speaking). Answers are stored per field or segment id, which `resolveAnswers` reads for scoring and Past exams. Goethe A1 uses all three. Another pack can use them as data; a genuinely new interaction is a new layout, which is application work.

Screen chrome that used to be hardcoded for A2 is now per part in the pack's practice copy: `practiceSubtitle`, `practiceMinutes`, `practiceTimerSec`, `practiceType` and `sessionTitle`, alongside the existing `practiceLabel`, `tips`, `phrases` and `instruction`.

## Contributor workflow

1. Create `src/packs/{packId}/pack.ts` with a unique identity, language/CEFR, modules and arbitrary positive part numbers.
2. Configure each available part: runtime rules, an adapter that projects the payload shape its screen reads, a `validate` guard, and a `layout` where the part needs one. Add the generator, answer and review PromptSpecs its format requires, and `buildReviewVars` if a prompt names more than the three generic variables.
3. Specify speech language and voice IDs supported by the intended installation. Omit `createMockSet` when no mock is supplied.
4. Add `seedExercises` if the pack ships bundled exercises, and import the pack in `src/registry.ts`.
5. Check it: `node scripts/eval-prompts.mjs --pack {packId} --control` scores the seeds against the production validators offline; `--n 3` runs every generator through the configured LLM and scores the output. Then run `pnpm db:seed`, select the pack in Learning plan and try every part. `src/packs/goethe-de-a1/` is the worked example.

See `src/testing/english-a1.ts` for a deliberately synthetic, unofficial English A1 example covering all six formats, parts 7/9/11/13/15/17, a different rubric and no mock. It is a test fixture and is not production-registered. Do not copy its example prompts as official exam content. A fundamentally new interaction, such as a live conversation partner, requires framework work beyond this contract.

## Identity, history and optional services

Frontend requests capture explicit `packId`; the transport sends `x-exam-pack` on the existing API paths. Requests without it resolve the user's active setting. Part-based requests must name a registered available part. Invalid or inactive identities cannot start practice, generation or grading. Catalogs, drafts, attempts, jobs, mock sets and generated audio are isolated by pack and user; exercise external IDs can repeat across packs.

New attempts store a version-1 rendering/rubric snapshot. Historical review uses that snapshot and the stored pack, independent of the current selection. Version-0 snapshots preserve old payloads for attempts whose exercise could not be projected. Progress → Past exams uses owner-scoped attempt detail and supports inactive C1 history without retries or grading. Unattributable old records retain `legacy-history`, which is not selectable. Existing Goethe routes and seed IDs remain valid.

Mock definitions persist their own timing, replay, scoring and pass rules. A pack without a factory has an explicit unavailable mock state. Goethe's provisional speaking arithmetic is preserved. Prompt overrides remain unmounted; their unused database table is retained.

TTS checks pack language/voices against `TTS_LANGUAGES` (or the single `TTS_LANG`) and `TTS_VOICES`, and against the voices the TTS service actually reports; a pack whose voices are missing is reported as `unsupported`, not offline. German uses its fixed four-voice roster; other languages assign dialogue voices from the pack's own `speech.voices` by speaker gender, read from English or Polish role and name labels. STT checks `STT_LANGUAGES` (Compose default `de,en,pl`). Unsupported capabilities return an unavailable response, preserving manual transcription and playback. No model installation is implied by registering a pack. New generated files use a user/pack/exercise namespace; historical shared paths remain readable and are retained during cleanup.

Verification and migration rollout: [VERIFICATION.md](VERIFICATION.md).
