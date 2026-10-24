# DELE B1: implementation evidence

The original practice delivery is recorded below; the current mock follow-up is recorded at the end. Earlier practice-only limitations describe the 2026-10-07 delivery.

Stage 2.18.3, checked 2026-10-07. **Implemented, registered and locally enabled (`live: true`).** Identity: `dele-es-b1`. The user explicitly requested Spanish B1 after the English and Polish stages. Implementation continues their stated solo-speaking, written-scene and assigned-task practice conventions. See [brief.md](brief.md).

## Delivered

- Five reading and five listening tareas, six scored questions each: /30 raw marks per skill. Listening permits two plays. Matching uses identical ordered option banks; reading Tarea 3 permits reuse, while reading Tareas 1/4 and listening Tarea 4 prohibit it.
- Two assigned writing tasks with 100–120 and 130–150-word ranges, four formative analytic 0–3 criteria (/12 each).
- Four solo speaking tareas with fixed examiner cue cards and written photo scenes. Three transcript-visible criteria use 0–3 bands (/9 each). Actual examiner interaction, acoustic fluency and pronunciation are not assessed.
- 16 original seeds and 28 prompt slots: generators for every task, plus model-answer and review prompts for writing/speaking.
- Pack-owned runtime guards, known Spanish speech metadata and English/German/Spanish/Polish/Russian structure copy. `DELE_ES_B1_PACK_ID` and the pack are exported by the package.
- All 60 objective explanations now cite text evidence or explain grammar in Spanish. An ambiguous cloze distractor was replaced, a train departure announcement corrected, and writing category text translated. Reading metadata reflects the edited article.
- Review prompts explain each criterion and use band 2 for expected B1 performance, reserving band 3 for stronger performance. These practice scores do not reproduce official holistic weighting, /25 conversion or the two-group certification decision.

## Checks completed after activation

- `pnpm lint`: passed, with one existing `SetRadio.vue` prop-default warning.
- `pnpm type-check`: passed across the workspace.
- `pnpm i18n:check`: five UI locales match (1,219 keys).
- `pnpm build`: full workspace/frontend/backend build passed, with existing Browserslist and DaisyUI warnings.
- `pnpm --filter ./apps/backend test --runInBand`: 55 suites, 538 tests and four snapshots passed. Registry-driven translation checks include all three enabled B1 packs.
- `node scripts/eval-prompts.mjs --pack dele-es-b1 --control`: all 16 seeds passed production projection and raw guards through the real registry, with zero problems and no provider call.
- Scratch validation checked all 16 parts and 28 prompt slots, all-correct/all-incorrect objective scores, zero/partial/full rubric reviews and rejection of 44 malformed payload/review cases. It passed before and after registration.
- A registered-pack integration check used production `PackAiService` with a stub LLM: 16 generator requests, six rubric reviews and two writing model answers passed. All four blank speaking submissions and unavailable mock requests were rejected. No paid call was made.
- The integration check confirmed reading/listening /30 totals, two plays throughout listening, full marks for the repeated A/B/C matches in reading Tarea 3, and three rejected duplicate-answer banks in tasks prohibiting reuse. Writing ranges and writing/speaking criterion maxima matched their runtime rules.
- Production `seedCatalog` ran twice with a Prisma stub: 16 Spanish B1 PRACTICE rows at level B1, stable identities and updates on rerun without duplicates. No Spanish B1 mock set was created. No real database was modified.
- The real registry lists English, Polish and Spanish B1 as live, preserves Cambridge A2 as the default, and leaves German B1 unregistered. Four translated structure locales retain numeric values and runtime/adapter references.
- `graphify update .` refreshed the code graph after implementation.

## Use in an existing installation

Use the installation's usual frontend/backend rebuild and restart procedure so both services load the registry. Compose backend startup discovers registered seeds through its normal seed path; host development needs the usual `pnpm db:seed` against the intended local database. No new Prisma migration or database reset is required. See the root [installation guide](../../../../README.md#local-development).

Select **DELE B1** in **Settings → Learning plan**. Objective tasks score automatically. Generate exercises, writing model answers and formative reviews with the configured AI provider. Listening seeds have transcripts but no WAVs; audio generation needs installed Spanish voices. Manual speaking transcripts remain available.

This run did not restart services, seed a real database, perform browser checks, make live-provider calls or verify speech playback. B1 mocks, complete oral interaction, official result conversion and certification are outside this practice-pack scope. Offline and isolated checks establish implementation consistency, not exhaustive linguistic or end-to-end validation.

## Stage 2.18.5.4: Spanish B1 mocks (2026-10-11)

The approved last B1 mock pack adds a fresh original Set 1, generated sets and optional overview through the existing shared framework. All 16 tareas remain independent from the 16 practice seeds. IDs and audio paths are pack-owned. The Cambridge A2 default and older A1/A2/B1 behavior are preserved.

- Reading/Listening/Writing/Speaking contain 5/5/2/4 tasks with 70/40/60/15-minute timers. The 15-minute oral preparation period remains outside the timer. Objective tasks retain six items each and two listening plays.
- Raw totals 30/30/24/36 normalize to /25 each. Both Reading+Writing and Listening+Speaking require 30/50, comparing exact points with `rounding: 'none'`. Productive normalization uses equally weighted analytic 0–3 bands; official holistic weighting, acoustic fluency and live interaction are excluded. Band 2 represents B1. Assigned writing and presentation tasks, written scenes and fixed examiner cues remain explicit.
- Missing required grades leave the affected group and overall result pending. Full validated productive reviews and optional overview are persisted; failures remain visible after reload.
- Blank generated drafts retain their four-paper blueprint; generated content is ordered by tarea. The generated Set 2 is immutable and includes all 16 tasks and ten audio segments.

Checks completed on the final implementation:

- Workspace `pnpm lint` and `pnpm type-check` passed; lint retains the existing `SetRadio.vue` prop-default warning. Five UI locales match at 1,226 keys.
- Backend regression suite: 59 suites, 587 tests and four snapshots passed. Eleven Spanish tests validate all new seeds, exclusive/reusable matching banks, audio maps, normalization, blank drafts, generated ordering, group thresholds and pending grades. A final editorial check clarified the exhibition question in Reading Tarea 3; its tests and full regression suite passed again.
- Production prompt control passed all 16 individual-practice seed projections and raw guards with zero problems. New mock payloads independently pass the same runtime guards and objective all-correct/blank-answer scoring checks in the Spanish test suite.
- Isolated Docker backend and frontend production images built successfully. Production seeding and a rerun against temporary PostgreSQL yielded exactly 16 PRACTICE and 16 EXAM_ONLY Spanish rows, with 16 distinct IDs in each category, and exactly one bundled Set 1. No development or production database was reset.
- Browser regression suite: 58 deterministic checks passed across all four B1 packs plus DELE A2, Cambridge A2 and Goethe A2. Three optional real-playback checks were skipped in that suite. Final Spanish full completion, grouped results, saved module reviews, optional overview, missing-grade persistence, generated immutable Set 2 and a 29.58/50 group staying below 30 despite a passing second group all passed again after the wording edit.
- Public documentation facts were synchronized from the app. `pnpm check` passed all 40 pages, privacy/structure checks, fact drift, types and strict production build.
- `graphify update .` refreshed the AST graph after the final content edit.

AI review and generated-set provider calls used deterministic local stubs. These checks do not claim paid-provider or live-STT verification, official examiner interaction, rubric calibration or a production deployment. Bundled audio preparation and real playback evidence follows below.

Real audio checks completed:

- `TTS_CONCURRENCY=1 pnpm generate:listening-audio --packs dele-es-b1` prepared all ten recordings using the existing local Spanish Kokoro models: six item recordings and four shared tracks, with zero failures.
- WAV inspection confirmed 24 kHz, mono, 16-bit PCM and non-silent samples in every file. Total duration is 634.12 seconds; individual tracks span 17.98–146.62 seconds. Files and transcript-hash sidecars remain in the normal ignored seed-audio tree and can be reproduced by the existing preparation command.
- `E2E_PACKS=dele-es-b1 E2E_REAL_BUNDLED_AUDIO=1 pnpm test tests/mock-exam/dele-b1.spec.ts --grep 'prepared Set 1'` passed against the isolated production stack. Every item/shared recording played, every counter showed 1/2, responses contained real WAV bytes and no synthesis requests were made. The temporary local TTS service was stopped before this check.

There are 59 distinct successful browser checks in this verification (58 deterministic plus the real Spanish playback check); the final four Spanish deterministic flows also passed on rerun. Temporary test services were stopped after verification. All four B1 mock packs are now implemented. No paid LLM calls or production deployment were performed.
