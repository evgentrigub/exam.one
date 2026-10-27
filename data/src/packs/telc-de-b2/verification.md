# telc Deutsch B2 verification · 2026-10-25

Roadmap stage 3.3a.1, branch `stage-3.3a.1`, uncommitted. Authored with the project skill `exam-pack-author`; shared screen and contract additions were made as separately verified application work. All seed tasks and model examples are original app content. No production deployment, paid-provider evaluation or specialist content review.

## Pack authoring (skill checks)

- `brief.md` normalized from the 2019 Übungstest, Handbuch, Tipps booklet and telc.net; official facts and adaptations are separate.
- Identity `telc-de-b2` and board `telc` are new; the Cambridge A2 default is unchanged.
- Candidate checks in a scratch harness, run with the pack still inactive: `validatePacks` with a temporary live copy beside all registered packs; `validateView` and the part `validate` guard for all 13 practice and 12 exam-only seeds; objective all-correct = maximum and all-wrong = 0 for every objective seed (25/25/25/15/15 reading, 25/25/25 listening); all 20 prompts assemble with the backend's variables and no unresolved placeholders, generator examples are arrays, review contracts parse; A, C and D band reviews validate and an off-band score is rejected. 64 checks passed.
- Package lint, type-check and build passed. After registration the combined registry loads and lists eleven live packs.
- `node scripts/eval-prompts.mjs --pack telc-de-b2 --control`: PASS (13 practice seeds, no provider call).
- Locale parity (`pnpm i18n:check`): five locales in sync, 1331 keys.

## Shared additions

- Option bank (`optionBank`), repeatable `x` (`repeatableOptions`), speaking `stimulus` with a generalized mock preparation screen, A–D rubric bands (two to five bands), mock `grades`, a time-aware monologue card title, and the Learning-plan B2 placeholder only for boards without B2.
- Saved mock attempts are now re-validated and module scores recomputed for every banded pack, not only packs with a task-zero rule (Goethe C1). Without this, telc's saved speaking reviews would not update module scores.
- Unit coverage: repeatable options, option-bank and band validation, four-band grading and zeroing, grade boundaries (269.5 gut, 270 sehr gut, failed despite a high total, pending), and the banded re-validation in `MockExamService`.

## Checks

- Workspace lint (one existing SetRadio warning), workspace type-check, backend 71 suites / 703 tests / 4 snapshots, locale parity: passed.
- Browser, against the local dev stack with a stubbed LLM:
  - telc E2E spec (`exam-one-e2e/tests/mock-exam/telc-b2.spec.ts`), 4/4: all reading and listening practice parts persist 100 % results; the advertisement bank lists 13 options once, dims a used ad and keeps `x` reusable (`→ 2, 3`); speaking shows seven topics and the discussion text; the full Set 1 mock completes, grades writing (27/45) and speaking (53.57/75), shows 260.57 / 300 with the grade gut, and a weak oral exam turns the result into "Not passed" with "Below the pass mark in Mündliche Prüfung."
  - Regression: default-pack practice/shell/pack-switch 32/33 (the failure needs a TTS service the dev stack did not run); Goethe B1 and C1 mock specs 10 passed, 4 failed on environment-only prerequisites (TTS preflight for generated sets, STT for recording, the E2E database for checkpoint recovery). The generic practice specs only support the default pack; that predates this stage.
  - Manual checks: Sprachbausteine 2 fills the gap with the chosen bank word; the mock preparation screen shows the topic choice, the Part 2 text and the Part 3 situation; Learning plan shows telc B2 without a placeholder and Goethe still with "B2 · Available soon"; tablet width in dark theme without overflow.
- Finding outside this stage: at phone width (375 px) the app shell keeps its 240 px sidebar on every page, leaving about 135 px of content.

## Prepared audio

`TTS_CONCURRENCY=1 pnpm generate:listening-audio --packs telc-de-b2` with the installed German Kokoro voices prepared all 14 WAVs: seven practice and seven Set 1 tracks. Offline inspection: mono, 16-bit PCM, 24 kHz, non-silent; news bulletins 244 and 247 s, interviews 362 and 342 s, announcements 34–38 s. A final run wrote the last six files in 5 minutes and reused the others by content hash. An earlier attempt timed out because it overlapped with listening-audio jobs queued by the E2E regression runs. Bundled audio is gitignored and generated per installation.

## Generated sets

Set 2 was generated through the real BullMQ worker against the local stack, with the stub LLM and the real German TTS service, in 501 s: twelve exercises (5/3/1/3), the telc pass groups (written 135/225, oral 45/75) and grade bands intact, and seven generated recordings (two shared tracks and five per-item announcements) on disk. A second request for Set 2 is rejected with 409.

## Limits

Solo speaking with fixed partner lines cannot assess interaction, pronunciation or fluency; the oral score is a provisional transcript estimate. Original texts, distractors and recording pace need specialist calibration. Synthetic German voices replace human exam recordings, and bundled listening seeds are shorter than official recordings.
