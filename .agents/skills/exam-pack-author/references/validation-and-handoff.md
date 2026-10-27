# Validation and handoff for future authoring

These instructions apply when using the skill to author a pack. Respect the invoking user's execution limits. If validation is deferred, retain an unregistered candidate and report exactly what remains unchecked.

## Before registration

Use existing repository functions through an ephemeral invocation or scratch harness outside tracked files. Do not add a package command, test framework, or shared validation script. Inspect existing package scripts before using them; no `pack:validate` command is assumed.

1. Load the candidate export and current registered packs. Run `validatePacks` against the existing packs plus a shallow copy of the candidate with `live: true`. Most checks are skipped for inactive packs, so validating only its saved `live: false` definition is insufficient. This temporary copy must not change the source or registry.
2. For every available module/part, project its sample payload with its adapter and call `validateView` with its runtime. Address samples by module and part, not part number alone. Check task prompts, matching option-bank consistency, and source requirements that structural validation does not enforce.
3. Assemble every required prompt with the variables actually provided by the generic backend. Inspect unresolved placeholders and ensure generator examples are arrays, answers are text, and review contracts match configured criteria.
4. For objective samples, use `objectiveScore` with all-correct and all-incorrect responses to confirm configured maximum and zero. For rubric-scored samples, use `validateReview` to check the sample review's criteria and raw total. These checks demonstrate contract compatibility, not exam accuracy.
5. Run the existing package checks from the repository root when execution is permitted:

   ```sh
   pnpm --filter @exam-one/exam-packs lint
   pnpm --filter @exam-one/exam-packs type-check
   pnpm i18n:check
   ```

   `pnpm i18n:check` compares the five frontend locales after new criterion, exercise-type or board keys.

6. Once registered, `node scripts/eval-prompts.mjs --pack <packId> --control` scores the pack's seeds against the production projection and `validate` guards, offline and free. With provider credentials and the user's agreement, `--n 3 --skill <module>` runs each generator through the real LLM and scores its output the same way; it makes paid calls.

The data package's current `test` script only reports that no pack tests are configured. Do not report it as runtime coverage. Backend unit specs under `apps/backend/test/unit/ai/` show how existing packs are tested, but adding one is application work. Existing specs still run against the new registration: importing the registry runs `validatePacks` over every pack, and `pack-structure-i18n.spec.ts` checks every registered pack's translations. Run the backend suite (`pnpm --filter exam-one-backend test`) after registering when execution is permitted. Checks requiring provider credentials, a running application, or a database are separate from offline contract checks; report their status independently.

## Registration and integration

When requirements are resolved and candidate checks pass, set the pack live and add its import and entry to the registry. Load the combined registry to exercise startup validation and confirm the new identity is returned by `listLivePacks`. Preserve unrelated entries and edits.

Use existing workspace lint/type-check/build scripts for integration as appropriate to the user's request and execution limits. Do not run global autofix or formatting commands that could change files outside the pack boundary. If activation introduces an error, remove only the new registration and return the candidate to inactive while correcting it.

Explain any checks not performed. Structural checks alone cannot establish provider output quality or browser behavior. Offer the following manual evaluation steps without claiming to have completed them:

- Run `pnpm db:seed` if the pack ships seeds, select the pack in Learning plan, open each seed, and generate an exercise for each available part with the user's configured AI provider.
- Submit objective answers; request model answers and rubric reviews for writing/recording. Check scores and detailed feedback against the brief.
- Save a draft, switch packs, switch back, and resume. Review the completed attempt.
- Confirm unavailable mock support and unavailable speech capabilities are clearly reported, with manual transcripts usable where applicable.

Do not require paid provider calls or browser automation as an unstated prerequisite to ordinary pack authoring. State the resulting evidence level precisely.

## Local restart guidance

Determine whether the user runs local development or Docker Compose before recommending commands. Read the current root README and scripts for the installation's prerequisites.

- For local development, `pnpm build` rebuilds workspace packages; restart the existing frontend/backend development processes as needed (`pnpm dev` starts both).
- For an existing Compose installation, rebuilding and recreating the frontend/backend services with `docker compose up -d --build frontend backend` incorporates pack source changes. Explain that the existing startup process may run its normal database initialization; pack registration itself needs no new Prisma migration.
- Do not recommend resetting the database, reinstalling speech models, or using the full stack setup merely to activate a pack. Do not restart services unless that action is within the user's request.

Bundled listening seeds with an explicit `audio` map need prepared WAVs: `pnpm generate:listening-audio --packs <packId>` synthesises them with the installed voices and reuses unchanged files on later runs. Report it as not run when the speech service is unavailable.

In the final report, distinguish authored configuration, available runtime capabilities, checks performed, and manual checks still pending. Include the pack ID, file links, selection instructions, and agreed unsupported scope. No deployment or publication is implied.
