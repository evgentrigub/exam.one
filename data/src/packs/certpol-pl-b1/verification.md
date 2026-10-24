# Certyfikat Polski B1, adults: implementation evidence

Stage 2.18.2, checked 2026-10-07. **Implemented, registered and locally enabled (`live: true`).** Identity: `certpol-pl-b1`. The user requested the next stage after English B1; the implementation uses the stated existing solo-speaking, written-scene and assigned-task conventions. Grammar is explicitly labelled in the Reading catalog. See [brief.md](brief.md).

## Delivered

- Five reading parts and eight grammar parts in one catalog, with official reading I–V and grammar I–VIII numbering retained. The display separates the official /30 reading and /30 grammar papers and explains their independent 50% requirements. The /60 catalog total does not imply certification.
- Five listening parts, two assigned writing tasks (about 25 + 175 words), and three solo speaking parts.
- 23 original seeds and 33 prompt slots: generators for every part, with model-answer and review prompts for writing/speaking.
- Pack-owned runtime guards, formative rubrics, known Polish speech metadata and English/German/Spanish/Polish/Russian structure copy. `CERTPOL_PL_B1_PACK_ID` and the pack are exported by the package.
- Reviewed seed content: corrected first-person verb forms, supplied Polish evidence/grammar explanations, constrained transformation openings, and retained common accepted sentence variants. Word-bank tasks enforce six distinct supplied words and five non-reused answers. Spelling/diacritic errors are not silently accepted.
- Writing feedback distinguishes task completion, language range and accuracy. Speaking feedback distinguishes task completion, grammar and vocabulary/style using transcripts only. Neither produces an official examination result.

## Checks completed after activation

- `pnpm lint`: passed, with one existing `SetRadio.vue` prop-default warning.
- `pnpm type-check`: passed across the workspace.
- `pnpm i18n:check`: five UI locales match (1,219 keys).
- `pnpm build`: full frontend/backend/workspace build passed, with existing Browserslist and DaisyUI warnings.
- `pnpm --filter ./apps/backend test --runInBand`: 55 suites, 537 tests and four snapshots passed. Registry-driven structure translation checks include English and Polish B1.
- `node scripts/eval-prompts.mjs --pack certpol-pl-b1 --control`: all 23 seeds passed the production projection and raw guards through the real registry.
- Scratch validation checked all 23 parts and 33 prompt slots, all-correct/all-incorrect objective scores, zero/partial/full rubric reviews and 56 malformed payload/review cases. A further ten malformed typed-bank cases were rejected.
- A registered-pack integration check used production `PackAiService` with a stub LLM: 23 generator requests, five rubric reviews and two writing model answers passed. Blank speaking responses and unavailable mock requests were rejected. No paid call was made.
- The same check confirmed separate reading /30 and grammar /30 totals. One correct answer scored exactly 0.5 in each of nine fractional task families. Case/spacing normalization accepted `ALE`, while removing the diacritic from `fotografią` was rejected.
- Production `seedCatalog` ran twice with a Prisma stub. It discovered 23 Polish B1 PRACTICE rows at level B1, preserved stable IDs and updated on rerun without duplicates. No Polish B1 mock set was created. No real database was modified.
- The real registry lists Polish and English B1 as live, preserves Cambridge A2 as the default, and leaves Spanish/German B1 unregistered. Four structure locales retain numerical text and runtime/adapter references.
- `graphify update .` refreshed the code graph after implementation.

## Use in an existing installation

Use the installation's usual frontend/backend rebuild and restart procedure so both services load the registry. Existing Compose backend startup discovers registered seeds through its normal seed path; host development needs the usual `pnpm db:seed` against the intended local database. Registration needs no new Prisma migration or database reset. See the root [installation guide](../../../../README.md#local-development).

Select **Certyfikat Polski B1** in **Settings → Learning plan**. The Reading catalog contains labelled reading and grammar tasks. Objective tasks score automatically. Generate exercises, writing model answers and formative reviews with the configured AI provider. Listening seeds have transcripts but no WAVs; audio generation needs installed Polish voices. Manual speaking transcripts remain available.

This run did not restart services, seed a real database, perform browser checks, make live-provider calls or verify speech playback. B1 mocks, complete oral interaction, official result conversion and certification are outside the practice-pack scope. Full-sentence grammar scoring recognises enumerated variants, not every possible paraphrase. Offline and isolated checks establish implementation consistency, not exhaustive linguistic or end-to-end validation.

## Adult B1 mock extension — 2.18.5.3 (2026-10-10)

This extension supersedes the earlier practice-only mock/audio limits above. It adds a fresh original 23-task exam-only Set 1, empty-draft-safe generated-set factory and optional overview. Existing practice seeds and their part numbers are retained.

- Five papers: Listening /30 in 30 minutes, Reading /30 in 40, Grammar /30 in 45, Writing /30 in 75 and estimated Speaking /40 in 15. All require 50% independently. Speaking normalizes the transcript-visible /36 rubric; pronunciation, intonation and live interaction remain unassessed. Writing retains the assigned 25+175-word pair and formative 6+24-point allocation.
- Optional mock-module `id`, `label` and `labelKey` distinguish paper identity from renderer `skill`. Reading and Grammar use separate persisted keys, timers, responses, completion flags, marks and review routes while sharing the Reading renderer. Omitted IDs keep legacy skill keys and routes.
- Pass groups select independent paper scores through optional `moduleIds`. `rounding: 'none'` preserves half-point thresholds; existing groups retain their whole-point comparison and display. Missing productive grades remain pending. The overview receives five distinct paper identities and unrounded Polish group marks.
- Reload proof uncovered and fixed a pre-existing selected-pack hydration race. The mock page waits for sets and attempt initialization; the composable tracks the current pack and ignores stale attempt loads before restoring state.

### Verification

- Workspace lint passed with the existing `SetRadio.vue` prop-default warning. Full workspace type checks passed; frontend checks were repeated after the reload fix. Five UI locales match (1,226 keys).
- Backend: 58 suites, 576 tests and four snapshots passed. Eleven new Polish mock cases cover all 23 raw payload guards, complete objective scores, independent thresholds, missing Grammar, typed banks and variants, blank drafts, sorting, legacy IDs, audio paths and overview adaptations.
- Production prompt control passed all 23 practice seeds. Mock seeds passed the production adapters and validators through the unit suite.
- The real local Polish Piper service generated 22 WAVs: 19 item recordings and three shared tracks. All are non-silent 16-bit PCM, totaling 354.9 seconds. Browser playback verified all 22 recordings, WAV responses and once/twice replay limits while the TTS API returned unavailable; no synthesis request was sent.
- Browser: 42 deterministic cases passed across Polish B1, English B1, German B1, Cambridge A2 and Goethe A2. The Polish flow completed all 23 tasks, retained every review after reload, persisted five timers and a Grammar-only draft, correctly failed at 14.5/30 despite 130.72/160 overall, kept failed AI grades pending, persisted the five-paper overview and generated immutable Set 2 with all audio. Two real-audio cases were skipped in that deterministic run; the Polish real-audio case passed separately.
- The isolated Docker frontend and backend production images built successfully. The production seeder reran against isolated PostgreSQL and retained exactly 23 distinct PRACTICE rows, 23 distinct EXAM_ONLY rows and one shared bundled Set 1.
- Public docs facts were regenerated from the real registry; structure/privacy, drift, TypeScript and the strict 40-page production build passed. `graphify update .` refreshed the code graph without LLM calls.

Prepared WAVs remain in the ignored `apps/frontend/public/audio/listening/certpol-pl-b1/` tree and are reproduced by `pnpm generate:listening-audio --packs certpol-pl-b1` or the usual self-host seed-audio setup. Real speech models were reused locally. Generated-set and grading browser checks use deterministic external-provider stubs. No production database, deployment or paid LLM was used.
