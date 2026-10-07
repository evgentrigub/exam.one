# Goethe-Zertifikat B1, adults: implementation evidence

Stage 2.18.4, checked 2026-10-07. **Implemented, registered and locally enabled (`live: true`).** Identity: `goethe-de-b1`. The user requested the next stage after Spanish B1. Implementation continues the established solo speaking and assigned-task practice conventions. See [brief.md](brief.md).

## Delivered

- Five reading Teile with 6/6/7/7/4 items and four listening Teile with 10/5/7/8 items. Each skill retains /30 raw objective marks. Listening replays are 2/1/1/2. Part 1 compiles five recordings with paired true/false and multiple-choice questions.
- Advertisement matching enforces exactly one unmatched situation (`x`) and prohibits advertisement reuse. Listening speaker matching permits repeated options.
- Three writing tasks, all retaining their task numbers: personal email, forum opinion and formal email. Their four-criterion rubrics are /40, /40 and /20; maxima are 10/10/10/10, 10/10/10/10 and 4/4/6/6. The practice word ranges are 70–90, 70–90 and 35–50, around official approximate lengths of 80/80/40. Responses below 40/40/20 words receive zero for the whole task. Off-topic zero is instructed in the review prompt.
- Three solo speaking parts: planning with fixed partner cues, one assigned five-point presentation, and self-contained feedback/questions. Four transcript-visible formative criteria use 0–5 points each (/20 per part). Actual partner interaction, pronunciation and official speaking weighting are excluded.
- 15 original seeds and 27 prompt slots: generators for every task, plus model-answer and review prompts for writing/speaking.
- Pack-owned runtime guards, known German speech metadata and English/German/Spanish/Polish/Russian structure copy. `GOETHE_DE_B1_PACK_ID` and the pack are exported by the package.
- All 60 objective explanations cite text/transcript evidence in German. The annual-fee question was rewritten for natural wording, and writing category labels translated. Review prompts explain the distinct task-completion, coherence, vocabulary and structures criteria.
- The official model paper, its writing rubric and the September 2025 regulations were rechecked. Writing scores remain formative AI estimates; the app does not issue module certification.

## Checks completed after activation

- `pnpm lint`: passed, with one existing `SetRadio.vue` prop-default warning.
- `pnpm type-check`: passed across the workspace.
- `pnpm i18n:check`: five UI locales match (1,219 keys).
- `pnpm build`: full workspace/frontend/backend build passed, with existing Browserslist and DaisyUI warnings.
- `pnpm --filter ./apps/backend test --runInBand`: 55 suites, 539 tests and four snapshots passed. Registry-driven structure translation checks include all four enabled B1 packs.
- `node scripts/eval-prompts.mjs --pack goethe-de-b1 --control`: all 15 seeds passed production projection and raw guards through the real registry, with zero problems and no provider call. The same control passed for each of the other three B1 packs through the final registry.
- Scratch validation checked all 15 parts and 27 prompt slots, all-correct/all-incorrect objective scores, zero/partial/full rubric reviews and rejection of 42 malformed payload/review cases. It passed before and after registration.
- A registered-pack integration check used production `PackAiService` with a stub LLM: 15 generator requests, six rubric reviews and three writing model answers passed. All three blank speaking submissions and unavailable mock requests were rejected. No paid call was made.
- The integration check confirmed task counts, /30 comprehension totals, replay limits, alternating 2/3-option rows in listening Part 1, and full marks for repeated speaker matches in listening Part 4. It rejected three invalid advertisement mappings: no unmatched situation, two unmatched situations, and a reused advertisement.
- Six production writing-review boundary checks confirmed whole-task zero at 39/39/19 words and assessable scores at exactly 40/40/20 words. This verifies deterministic backend thresholds, not the linguistic quality of the stub review.
- An isolated execution of the actual frontend writing model-answer and review composables confirmed Aufgabe 3 prompt lookup, outgoing task number and selected feedback language. These shared helpers were corrected during earlier B1 stages.
- Production `seedCatalog` ran twice with a Prisma stub: 15 German B1 PRACTICE rows at level B1, stable identities and updates on rerun without duplicates. All four B1 packs were discovered; no German B1 mock set was created. No real database was modified.
- The final registry lists English, Polish, Spanish and German B1 as live and preserves Cambridge A2 as the default. Four translated structure locales retain numeric values and runtime/adapter references.
- `graphify update .` refreshed the code graph after implementation.

## Use in an existing installation

Use the installation's usual frontend/backend rebuild and restart procedure so both services load the registry. Compose backend startup discovers registered seeds through its normal seed path; host development needs the usual `pnpm db:seed` against the intended local database. No new Prisma migration or database reset is required. See the root [installation guide](../../../../README.md#local-development).

Select **Goethe-Zertifikat B1** in **Settings → Learning plan**. Objective tasks score automatically. Generate exercises, writing model answers and formative reviews with the configured AI provider. Listening seeds have transcripts but no WAVs; audio generation needs installed German voices. Manual speaking transcripts remain available.

This run did not restart services, seed a real database, perform browser checks, make live-provider calls or verify speech playback. B1 mocks, complete oral interaction, official comprehension/speaking score conversion and certification are outside this practice-pack scope. Offline and isolated checks establish implementation consistency, not exhaustive linguistic or end-to-end validation.
