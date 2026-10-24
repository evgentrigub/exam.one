# Cambridge B1 Preliminary: implementation evidence

Stage 2.18.1, checked 2026-10-07. **Implemented, registered and locally enabled (`live: true`).** Identity: `cambridge-en-b1`. The user selected the first pack and requested implementation; the existing solo-speaking, written-scene and assigned-task practice conventions were stated as the implementation scope and are recorded in [brief.md](brief.md).

## Delivered

- Six reading parts / 32 questions, two writing parts, four listening parts / 25 questions and four speaking parts.
- 16 original practice seeds and 28 prompt slots: a generator for every part and model-answer/review prompts for writing and speaking.
- Pack-owned structure, runtime rules, raw guards, speech metadata and English/German/Spanish/Polish/Russian display copy.
- Registry entry and package exports, including `CAMBRIDGE_EN_B1_PACK_ID`. Cambridge A2 remains the default. The Polish, Spanish and German B1 candidates are unregistered and inactive.
- Writing feedback distinguishes content, communicative achievement, organisation and language. Speaking feedback interprets interaction only through the supplied fixed cues; it does not claim to assess live conversation or pronunciation.

## Checks completed after activation

- `pnpm lint`: passed, with one existing `SetRadio.vue` prop-default warning.
- `pnpm type-check`: passed across the workspace.
- `pnpm i18n:check`: all five UI locale files match (1,219 keys).
- `pnpm build`: full frontend/backend/workspace build passed, with existing Browserslist and DaisyUI warnings.
- `pnpm --filter ./apps/backend test --runInBand`: 55 suites, 536 tests and four snapshots passed. The registry-driven structure translation test now includes English B1.
- `node scripts/eval-prompts.mjs --pack cambridge-en-b1 --control`: all 16 seeds passed the production projection and raw guards through the actual registry.
- A scratch invocation checked all 16 parts and 28 prompt slots, all-correct/incorrect objective scores, zero/partial/full rubric scores, and 44 malformed-payload/review rejection cases.
- A separate scratch integration check used the real registered identity and production `PackAiService`, with a stub LLM: 16 generator requests, six rubric reviews and two writing model answers passed. Blank speaking submissions and unavailable mock requests were rejected as expected. No paid call was made.
- The production `seedCatalog` ran twice with a Prisma stub. It discovered 16 English B1 PRACTICE rows at level B1, preserved their stable IDs, and updated on rerun without duplicates. No English B1 mock set was created. No real database was modified.
- The real registry lists English B1 as live, preserves every prior identity and the Cambridge A2 default, and excludes the other three B1 candidates. Four structure locales preserve all numeric copy and runtime/adapter references.
- `graphify update .` refreshed the code graph after activation.

## Use in an existing installation

Use the installation's usual frontend/backend rebuild and restart procedure so both services load the new registry. The existing Compose backend startup discovers registered seeds through its normal seed path; host development needs the usual `pnpm db:seed` against the intended local database. Registration requires no new Prisma migration or database reset. See the root [installation guide](../../../../README.md#local-development).

Then select **Cambridge B1 Preliminary** in **Settings → Learning plan**. Objective reading/listening answers use automatic scoring. Generate exercises, writing model answers and rubric reviews with the configured AI provider. Listening seeds have transcripts but no WAVs; generate audio with installed English voices. Manual speaking transcripts remain available.

This authoring run did not restart services, seed a real database, perform browser checks, make live-provider calls or verify speech playback. A read-only Compose status query could not access the Docker socket, and no host listener was reported on the standard development ports. Installation mode could not be confirmed, so no service-specific restart was performed.

B1 mocks, official scale conversion and certification results are outside this practice-pack scope. Contract and isolated service checks do not certify linguistic quality or complete end-to-end behavior.

## B1 mock extension — checked 2026-10-10

**Implemented: bundled Set 1 and generated mock sets.** This section supersedes the earlier practice-only mock/browser limitations. All four B1 practice packs are now live; the other three B1 mock implementations follow separately.

Delivered 16 fresh exam-only tasks in addition to the 16 existing practice seeds, preserving practice IDs and catalog counts. Paper order/timers: Reading 45, Writing 45, Listening 30, Speaking 12 minutes. Existing task formats, productive rubrics and solo speaking adaptations are reused. Raw maxima /32, /40, /25 and /80 feed an explicitly estimated Cambridge English Scale result, pass 140. Grade A/B/C labels now use the B1 result levels, while existing A2 labels remain unchanged. Original tasks are uncalibrated; speaking normalization /80 → /30 does not restore pronunciation or official weighting.

Checks completed:

- Workspace `pnpm lint`, `pnpm type-check`, `pnpm i18n:check`: passed (1,224 keys in five locales); existing `SetRadio.vue` warning only.
- Full workspace `pnpm build`: passed. The final scale-label update also passed production frontend/backend Docker builds in the isolated stack, with existing DaisyUI/Browserslist warnings.
- Backend Jest: **56 suites / 552 tests / 4 snapshots passed**. New checks cover every mock seed's raw validator, blank/generated factories, task order, timers, scores, replay limits, audio maps, malformed tasks, every scale anchor, band boundaries, omitted/null/invalid grades and the pack-owned overview.
- Production prompt control: 16 practice seeds passed; mock validators and content checks pass in the new Jest suite.
- Isolated `exam-one-e2e` stack (real PostgreSQL, Redis/BullMQ, backend, production frontend; deterministic LLM/TTS/STT stubs): **15 Chromium mock checks passed** with `E2E_PACKS=cambridge-en-b1,cambridge-en-a2`. Covers list/overview, sequential unlocking, resume, soft timer expiry, reset, completing all 16 tasks, stored writing/speaking criterion reviews and all four review routes after reload, unavailable writing grades remaining pending after reload, generated Set 2 with all four audio jobs, duplicate generation rejection and immutable set content.
- The production seeder ran on the isolated real database on boot and again explicitly. Counts remain exactly **16 PRACTICE + 16 EXAM_ONLY**, all IDs distinct, and one bundled `cambridge-en-b1-set-1`. No production/development database reset or reseed was performed.
- `pnpm generate:listening-audio --packs cambridge-en-b1` used the installed British English Kokoro models and wrote **15 real WAVs, zero failures**. PCM/non-silence checks passed for all files: durations 11.2–119.5 seconds, 365.6 seconds total. Files remain in the existing ignored host audio tree, prepared through the standard self-host audio workflow.
- Actual bundled playback passed in Chromium against the isolated frontend serving copied real WAVs: successful WAV GETs and playing/paused control state with TTS endpoints disabled; no synthesis requests. This verifies prepared Set 1 playback independently of TTS availability. Optional speech health probes remain part of the shared session.
- Public docs `pnpm sync-facts && pnpm check`: generated support/rule tables, privacy/structure, drift, types and strict production build passed. Internal roadmap and next-stage plan record English complete and German next.
- `graphify update .`: AST graph refreshed without an LLM call.

The mock screen now retains arbitrary writing task numbers, including Aufgabe 3. Scale results require every scale-defined skill and withhold the overall result for pending/unavailable module grades; partial numeric sums cannot become a complete result. Failure of the optional overview still leaves valid results intact.

No paid LLM call or live external-provider grading was performed. Linguistic quality and exam calibration still require human review; these mocks provide practice estimates and do not award certificates. Existing installations need their normal frontend/backend rebuild and catalog seed; seed audio can be prepared with the command above. The isolated verification stack is separate from the user's normal installation.
