# DELE B1: implementation evidence

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
