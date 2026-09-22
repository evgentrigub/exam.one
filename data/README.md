# Exam packs

Forkers add an exam by creating a folder under `src/packs/` and registering it in `src/registry.ts`. Do not edit `apps/` or `libraries/` to add a pack.

| Path | What lives here |
| --- | --- |
| `src/types.ts` | Generic pack, module, and `PromptSpec` contracts |
| `src/packs/goethe-de-a2/` | Live Goethe A2 template (structure, prompts, bundled seeds) |
| `src/packs/goethe-de-c1/` | Structural stub only (`live: false`) |

Each prompt slot is a `PromptSpec` with `role`, `task`, `rules`, optional `examples`, and `outputContract`. Runtime values (`{count}`, `{task}`, `{userContent}`, …) are interpolated by `assemble()`.

Optional bundled seeds, payload types, and mock Set 1 live in that pack's `content/` folder. New packs stay seed-free unless they ship bundled exercises. After the pack-author skill ships (roadmap 2.11b), new packs can be generated from an exam brief into this tree.

## Runtime contract

Every available part declares `itemFormat`, `runtime`, and an `adapter`. Use `formatAdapter(format, runtime)` from `src/runtime.ts` for ordinary packs; use `defineAdapter()` to project an existing private payload schema into `ExerciseView`. The database keeps the original payload. Shared Vue components consume the projected view, so a new pack needs no application or database edits.

| Format | Default payload | Runtime configuration |
| --- | --- | --- |
| `selection` | `questions: [{id, text, options, correctAnswer, explanation?, weight?}]` | Question/option counts, maximum and multiplier |
| `matching` | Same question shape, with the same ordered option list | Counts and `reuseOptions` |
| `true-false` | Question shape with answer index 0 (true) or 1 (false) | Question count; two options |
| `freeform` | `fields: { [fieldId]: prompt }` | `fields` with stable IDs, labels, word bounds and optional zero-below threshold |
| `recording` | `segments: { [segmentId]: prompt }` | Ordered `segments` with stable IDs and labels |

All payloads have a title and optional `text`. Objective formats support a shared `transcript` and `audio` URL, per-question transcript/audio, or `audio: {shared?, items?: {[questionId]: url}}`. `replays` limits starts of each audio clip; pause/resume does not consume another replay. `minutes` supplies the practice countdown. Recording segments run sequentially and retain editable transcripts when microphone or STT support is unavailable.

Rubrics use `criteria: [{id, label, maxPoints}]`, `maxPoints`, and optional `multiplier`. Objective weights must sum to the raw maximum. Rubric criteria must sum to their declared maximum. Scores may be fractional; percentages retain integer display rounding. A generated review returns `criteria` with points/comments, `totalPoints`, `maxPoints`, `summary`, `strengths`, and `improvements`. The API validates totals and derives scores, including configured zero-word rules. The synthetic fixture demonstrates a 3.5-point rubric.

Registry startup rejects duplicate identities, unsupported formats, missing runtime/adapters/prompts, invalid part references, impossible counts/word bounds and inconsistent rubric totals. Error messages identify the pack and part. Existing Goethe JSON uses compatibility projections and review validation under `src/packs/goethe-de-a2/`; its practice raw scores and mock conversion remain distinct.

## Contributor workflow

1. Create `src/packs/{packId}/pack.ts` with a unique identity, language/CEFR, modules and arbitrary positive part numbers.
2. Configure each available part and attach `formatAdapter`; add the required generator, answer and review PromptSpecs as indicated by its format.
3. Specify speech language and voice IDs supported by the intended installation. Omit `createMockSet` when no mock is supplied.
4. Import the pack in `src/registry.ts`. Run validation, generate against deterministic provider fixtures, and test all configured interactions before making it live.

See `src/testing/english-a1.ts` for a deliberately synthetic, unofficial English A1 example covering all five formats, parts 7/9/11/13/15, a different rubric and no mock. It is a test fixture and is not production-registered. Do not copy its example prompts as official exam content. A fundamentally new interaction, such as a live conversation partner, requires framework work beyond this contract.

## Identity, history and optional services

Frontend requests capture explicit `packId`; the transport sends `x-exam-pack` on the existing API paths. Requests without it resolve the user's active setting. Part-based requests must name a registered available part. Invalid or inactive identities cannot start practice, generation or grading. Catalogs, drafts, attempts, jobs, mock sets and generated audio are isolated by pack and user; exercise external IDs can repeat across packs.

New attempts store a version-1 rendering/rubric snapshot. Historical review uses that snapshot and the stored pack, independent of the current selection. Version-0 compatibility snapshots preserve old payloads. Progress → Past exams uses owner-scoped attempt detail and supports inactive C1 history without retries or grading. Unattributable old records retain `legacy-history`, which is not selectable. Existing Goethe routes and seed IDs remain valid.

Mock definitions persist their own timing, replay, scoring and pass rules. A pack without a factory has an explicit unavailable mock state. Goethe's provisional speaking arithmetic is preserved. Prompt overrides remain unmounted; their unused database table is retained.

TTS checks pack language/voices against `TTS_LANG` and `TTS_VOICES`; STT checks `STT_LANGUAGES` (default `de`). Unsupported capabilities return an unavailable response, preserving manual transcription and playback. No model installation is implied by registering a pack. New generated files use a user/pack/exercise namespace; historical shared paths remain readable and are retained during cleanup.

Verification and migration rollout: [VERIFICATION.md](VERIFICATION.md).
