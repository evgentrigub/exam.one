# Stage 2.11 verification and rollout

Verified locally on 2026-09-05–06. This records working-tree verification, not a production deployment. Goethe A2 is the only live production registration; the synthetic English A1 fixture is retained under `src/testing/` and excluded from `src/registry.ts`.

## Reproducible acceptance

Use Node 24+, pnpm 10+ and a disposable PostgreSQL 17 container named `exam-one-pack-check`, published only on `127.0.0.1:55432`. The acceptance database is `pack_check`. Never point these checks at user or production databases.

1. Temporarily import `syntheticEnglishA1` from `./testing/english-a1` and append it to `PACKS` in `data/src/registry.ts`. These are the only registration changes; the fixture itself also lives entirely in `data/`.
2. Deploy migrations to the disposable database and build the workspace. Set `DATABASE_URL` to its `pack_check` database and run `node scripts/verify-pack-runtime.mjs`.
3. For browser checks, use `node scripts/verify-pack-runtime.mjs --serve` and the existing Nuxt development server. The harness prints a disposable account and uses deterministic mocked LLM responses, with a 20-second browser generation delay for switching checks. It makes no paid LLM calls. English speech is deliberately unsupported by the default German installation.
4. Remove the synthetic import and registration, rebuild, and verify that only `goethe-de-a2` is returned by `listLivePacks()`.

The HTTP harness verifies all five formats with parts 7/9/11/13/15, generation, payload validation, persisted drafts and attempts, snapshot stability after source edits, fractional rubric totals, server-derived scores, reused external IDs across packs, owner isolation, delayed generation across active-setting changes, missing AI, invalid provider output, unavailable mocks, unsupported speech, repeated seed upserts and read-only C1 history. It passed with nine mocked provider calls.

`node scripts/rehearse-pack-migrations.mjs` creates two new disposable databases in the dedicated container. All eight migrations passed on a fresh database and on representative pre-pack data. The upgrade assertions preserve C1 exercise/attempt/draft identity, response text and score, and retain ambiguous history under `legacy-history`. Final rehearsal databases: `pack_fresh_1788627294408` and `pack_upgrade_1788627294408`.

## Regression evidence

- Workspace `pnpm lint`, `pnpm type-check`, `pnpm test` and `pnpm build` passed. Unit coverage is 218 tests (216 backend, 2 infrastructure) across 29 suites, including pack projections for all bundled Goethe mock exercises, unchanged payloads/raw practice scoring, registry errors, audio projection, rubric validation, per-part payload guards for all four skills, stored-answer resolution and saved-rubric validation.
- Database-backed auth/health regressions passed all six tests with `DATABASE_URL` pointing to the same disposable instance using `pnpm test:e2e`.
- Browser checks used the existing in-app browser, without adding a frontend runner: all five synthetic formats; saved objective results; writing draft resume; editable recording transcripts and fractional feedback; interrupted generation resume; switching during a delayed request and returning to the original catalog; unavailable mock support; inactive C1 historical review; Goethe four-skill catalog and practice screens; bundled Set 1 and its stored module timers.
- Goethe reading was submitted in the browser and reloaded as mastered at 100%. A final HTTP assertion confirmed raw five-point arithmetic and correction of a supplied 999-point score. Generic objective and rubric details were reviewed after persistence. Set 1 projection/scoring rules are also checked in unit tests; the browser smoke test is not a claim that a full timed exam or every provider/model was exercised.
- Speech checks cover graceful unavailability and editable/manual transcripts. No additional speech models were installed. Existing audio assets remain an installation prerequisite for playback.

Temporary run logs are `/tmp/pack-{lint,types,unit,build,e2e,http,migrations}-final.log`; these are local evidence, not durable application inputs. Known build output includes the existing DaisyUI CSS calculation warning.

## Backup and forward recovery before rollout

1. Stop application writers and generation workers. Record the deployed revision, migration status and row counts for users, exercises, attempts, results, drafts, jobs and mock sets.
2. Take a `pg_dump --format=custom` backup of the target database and a filesystem backup of generated/bundled audio. Keep instance configuration separately in the operator's secure backup location. Verify the database archive with `pg_restore --list`; rehearse restoring it into a separate database.
3. Rehearse the upgrade on a restored copy of representative data. Verify pack attribution, C1 history, user ownership, snapshots, partial unique indexes, fractional scores and repeated seed counts before touching the live database.
4. Deploy the application and run `pnpm db:migrate:deploy`, followed by `pnpm db:seed`, against the intended target. Do not rewrite already applied migrations. Confirm Goethe A2 selection, old history, new draft/attempt persistence and stored mock rules before reopening writers.
5. If verification fails, keep writers stopped and preserve the failed database and logs. Diagnose and apply a new forward migration/fix, or restore the verified backup into a separate database and switch the application connection after validation. Do not improvise destructive down-migrations, reset the production schema or relabel uncertain history as A2. Retain original backups until post-rollout checks are accepted.
