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
