# Pack verification and rollout

Working-tree verification, not a production deployment. Live registrations: `goethe-de-a2` (default), `goethe-de-a1`, `cambridge-en-a2`, `certpol-pl-a2` and `dele-es-a2`. The synthetic English A1 fixture is retained under `src/testing/` and excluded from `src/registry.ts`.

## Stage 2.16.3 — DELE A2 (2026-09-30)

Branch `stage-2.16`, working tree only (not committed).

- **Sources.** The structure was checked against the Instituto Cervantes *Guía del examen DELE A2* (© 2022), the 2020 *Especificaciones* and *Modelo 0* before any prompt was written. Summary in `src/packs/dele-es-a2/brief.md`; the product reference is `agent-os/product/languages/spanish/spanish-exam-A2.md` in the docs repository.
- **Offline, before registration.** A scratch harness ran `validatePacks` on the registered packs plus a live copy of the candidate. It projected every seed (14) by module and part through `validateView` and the part guard, checked the objective maximum and zero with `objectiveScore`, ran `validateReview` on a band review for each rubric part, and assembled all 23 prompts with no unresolved placeholder.
- **Offline, after registration.** `node scripts/eval-prompts.mjs --pack dele-es-a2 --control` passes for all 14 seeds, and the Goethe A2, Goethe A1, Cambridge and Polish controls still pass. `pnpm lint`, `pnpm type-check` and `pnpm build` pass across the workspace, and `pnpm test` passes 424 tests in 40 suites (422 backend, 2 infrastructure). That includes `dele-es-a2-pack.spec.ts` and the Spanish dialogue-voice specs; German, English and Polish plan keys are unchanged. Locale parity passes; no new i18n keys were needed.
- **Speech, statically only.** `main.py` compiles, and the shell and Node scripts parse. The Spanish Kokoro voices (`ef_dora`, `em_alex`, `em_santa`), the shared v1.0 backbone and the misaki `es` G2P have **not** yet been run in the container.
- **Live generation (2026-10-02).** `node scripts/eval-prompts.mjs --pack dele-es-a2 --n 3` with OpenAI `gpt-5.5`: 39/39 generations passed the production projection and the `validate` guards, with no problems reported. Every one of the 13 generators scored 3/3. The harness stores scores, not payloads, so the generated Spanish was not read.
- **Seeding (2026-10-02).** `docker compose up -d --build --wait frontend backend` recreated both services, and the entrypoint seeded the catalog: `dele-es-a2=14` (reading 4, listening 4, writing 3, speaking 3) next to unchanged counts for `goethe-de-a2=24`, `goethe-de-a1=22`, `cambridge-en-a2=14` and `certpol-pl-a2=16`.
- **Not yet run:**
  - `pnpm tts:setup` and a rebuild of `kokoro-voices` with the Spanish voices, then synthesis of a Spanish dialogue (until then the running TTS container reports Spanish as unsupported);
  - browser practice of each part (Generate audio, model answers, reviews, pack switching);
  - Parakeet STT on Spanish speech.

## Stage 2.15 — Goethe A1 (2026-09-27)

Branch `german-a1`, verified plan by plan against the local Docker stack (PostgreSQL, Kokoro TTS, Parakeet STT) with a disposable test account and the configured OpenAI provider.

- **Sources.** The structure was checked against the official _Start Deutsch 1_ Modellsatz (02/2024) and Durchführungsbestimmungen (2025) before any prompt was written. Summary in `src/packs/goethe-de-a1/brief.md`; the product reference is `agent-os/product/languages/german/german-exam-A1.md` in the docs repository.
- **A2 parity.** `a2-projection-parity.spec.ts` snapshots the view projected from every bundled A2 payload. It was recorded before the projection moved to `goethe-shared/` and passes unchanged. `pnpm db:seed` against an existing database left every A2 seed row identical (24 rows, same ids, visibility and level). A2 reading, listening, writing and speaking screens were re-checked in the browser after each plan.
- **Offline.** `node scripts/eval-prompts.mjs --pack goethe-de-a1 --control` passes for all 11 seeds; the A2 control passes unchanged. Unit coverage is 270 tests across 34 suites (268 backend, 2 infrastructure), including the A1 pack and speaking specs: projections, per-part validators, placeholder resolution for every answer and review prompt, rubric totals, and the server-side speaking transcript guard.
- **Live generation.** The eval harness ran every A1 generator three times: reading 9/9, listening 9/9, writing 6/6, speaking 9/9, each on the first call. In the app, one generation per part stored through the write gate and rendered.
- **Live practice, per part.** Reading and listening seeds scored and stored correctly (4/5, 6/6). Listening seed audio was generated on demand through **Generate audio**, stored on the user's copy of the seed, and played. The form-fill seed with one wrong entry was reviewed 4/5 in German; the message seed 10/10. The three speaking seeds were reviewed 3/3, 5.25/6 (a one-word answer at half points) and 6/6. Past exams shows every attempt structurally.
- **Fixed during verification** (these affected A2 as well): the listening-audio route answered HEAD with the SPA shell, so a missing file looked present and the Generate audio notice never appeared; catalogs and progress fetched with the default pack before settings loaded and were never refetched for a non-default pack; a TTS request that hit a just-closed keep-alive socket failed a whole dialogue (now retried once); practice writing reviews never sent the feedback language, so they were English in every locale.
- **Not covered.** No A1 mock exams exist, so no mock was run. Pronunciation is not assessed (transcripts only). A hard reload of a reading exercise page, or of a submitted writing task, starts before the catalog or progress has loaded — the same behaviour as A2.

## Stage 2.11 reproducible acceptance (2026-09-05–06)

Use Node 24+, pnpm 10+ and a disposable PostgreSQL 17 container named `exam-one-pack-check`, published only on `127.0.0.1:55432`. The acceptance database is `pack_check`. Never point these checks at user or production databases.

1. Temporarily import `syntheticEnglishA1` from `./testing/english-a1` and append it to `PACKS` in `data/src/registry.ts`. These are the only registration changes; the fixture itself also lives entirely in `data/`.
2. Deploy migrations to the disposable database and build the workspace. Set `DATABASE_URL` to its `pack_check` database and run `node scripts/verify-pack-runtime.mjs`.
3. For browser checks, use `node scripts/verify-pack-runtime.mjs --serve` and the existing Nuxt development server. The harness prints a disposable account and uses deterministic mocked LLM responses, with a 20-second browser generation delay for switching checks. It makes no paid LLM calls. English speech is deliberately unsupported by the default German installation.
4. Remove the synthetic import and registration, rebuild, and verify that only `goethe-de-a2` is returned by `listLivePacks()`.

The HTTP harness verifies all five formats with parts 7/9/11/13/15, generation, payload validation, persisted drafts and attempts, snapshot stability after source edits, fractional rubric totals, server-derived scores, reused external IDs across packs, owner isolation, delayed generation across active-setting changes, missing AI, invalid provider output, unavailable mocks, unsupported speech, repeated seed upserts and read-only C1 history. It passed with nine mocked provider calls.

`node scripts/rehearse-pack-migrations.mjs` creates two new disposable databases in the dedicated container. All eight migrations passed on a fresh database and on representative pre-pack data. The upgrade assertions preserve C1 exercise/attempt/draft identity, response text and score, and retain ambiguous history under `legacy-history`. Final rehearsal databases: `pack_fresh_1788627294408` and `pack_upgrade_1788627294408`.

## Regression evidence (through 2.14)

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
