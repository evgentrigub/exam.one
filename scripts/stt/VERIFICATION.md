# Speech recognition integration verification

Verified locally on 2026-10-16. This records integration behavior, not comparative recognition accuracy. No learner recordings or custom accuracy benchmark were collected.

## Retire Q8 and explicit English setup — 2026-10-18

This supersedes the earlier Q8-preservation/adoption decisions below. The application manifest now contains only Phonon 2 and shared Parakeet Q4. Retired IDs/aliases remain solely for migrating saved preferences to Phonon for English and Q4 for German/Polish/Spanish. Q8 files are neither copied nor deleted automatically; retained managed directories still count in disk totals, without a Settings row. Unknown missing preferences continue to fail closed. Sidebar label: “Speech models,” translated across all five locales.

- **17 standard-library catalog/lifecycle tests passed**, including migration with present/missing retired assets and all known aliases, file preservation/accounting, unchanged valid/unknown preferences, explicit English setup overriding saved choices/setup languages, shared Q4, verification without downloads, checksums, cancellation and safe removal.
- **10 backend STT tests across three suites passed.** Workspace lint/type checks, locale parity (**1,287 keys**), changed UI formatting, Bash syntax and cross-project diff whitespace checks passed. The existing optional SetRadio lint warning remains.
- A temporary real FastAPI gateway using that image and fixture mount returned exactly two catalog entries, persisted retired-preference migration, reported missing Q4 for German/Polish/Spanish, rejected Q8 download with **HTTP 400**, and counted retained retired files without exposing a row. This verifies actual gateway behavior rather than only the E2E stub.
- **Three focused browser scenarios passed** against rebuilt frontend/backend production images: fresh English/shared-Q4 lifecycle with manual transcripts, installed-retired migration, and missing-retired migration. Both retired cases show no Q8 in API or UI, install Q4 without a further selection step, and verify a one-line menu label. Inspected the missing-retired screenshot.
- E2E type checking and public-docs fact generation/drift, structure/privacy, type checking and strict production build passed. Existing non-failing frontend build and Docusaurus update-check notices remain. App/private/public setup and upgrade docs, workspace index/plan and E2E fixtures describe the same behavior. The unchanged landing has no affected model-specific claims. Application graph refreshed (**7,541 nodes**).

Tests used the current sibling workingtrees with the application manifest mounted directly into E2E stubs. Temporary setup files/network and gateway were removed; E2E containers were stopped after checking. Existing application weights/preferences and application containers were not changed. No real weight downloads, new inference/accuracy claims, database migration, publishing or deployment were needed; earlier real-engine codec/platform evidence remains below.

## Container-based speech setup — 2026-10-18

Self-host setup no longer requires host Python/pip packages. `stt:setup` invokes Bash; both STT and TTS Bash launchers run Python inside their speech Compose images with the service model mounts, configured languages and invoking UID/GID. Setup containers are removed on exit. `stack:verify-models` now calls the same launchers in verification mode, so it shares their environment, mount paths and checks. The legacy STT Bash path forwards to the new launcher. Contributor-only `stt:test`/`tts:test` remain standard-library host Python commands.

- Built both speech images successfully, including the TTS downloader. Added a TTS Docker ignore file to exclude host model weights from build context.
- **16 STT tests and 12 TTS tests passed**, including missing/installed voice verification without downloads. Bash syntax, Compose validation, JS formatting, workspace lint/type checks and public-docs generation/structure/type/strict build passed. Existing optional/non-failing lint/docs notices remain.
- Executed actual `pnpm stt:setup`, `pnpm tts:setup` and `pnpm stack:verify-models` with **host Python absent from PATH**. Used isolated Compose project `exam-one-setup-check`, temporary model mounts and tiny file:// fixture assets. STT prepared Phonon/Q4 once, retained expected language preferences and created no Q8 file; TTS installed the seven configured English/Polish voices using shared files.
- Verified setup files are owned by the invoking host user. Removed an English TTS fixture, then confirmed stack verification failed with “Missing voice bf_emma” and left the missing file absent (no repair/download in verification mode).
- These checks establish setup/verification orchestration, not new real-engine or recognition-accuracy results. Previous real-engine evidence remains below. No real model downloads, existing preference/model changes or application-container restarts were performed.
- Updated app/private/public setup requirements and contributor guidance. Graph refreshed (7,537 nodes). Temporary fixture mounts and the isolated setup network were removed after checking.

## Remove global model environment override — 2026-10-18

Removed `STT_MODEL` from backend configuration, app requests, setup selection, Compose, local/template environment files, shared API contract, Settings controls and all five UI translations. Saved instance language preferences now govern setup and application transcription without an environment override. Existing preferences/adopted files remain intact. The low-level speech endpoint still accepts a per-request model for integration tooling; the application sends the exam language only. External endpoints must choose their own model.

- **16 Python catalog tests passed**, including a regression proving that a leftover removed environment value cannot override English setup.
- **10 backend STT tests across three suites passed**, including preference changes and language-only transcription/health requests.
- **Two focused browser scenarios passed** against freshly rebuilt frontend/backend containers: fresh English/shared Q4 lifecycle and existing-Q8 replacement. Settings preference changes remain available.
- App lint/type checks and production frontend/backend Docker builds passed; five locales remain in parity (**1,287 keys**). Existing non-failing lint/build warnings remain.
- E2E type check, Compose validation, public-docs generated environment reference/structure/privacy/type check/strict build passed. Exact removed variable is absent from local/template environment and Compose configurations. The only executable-source mention retained is the regression test for ignoring obsolete values.
- Updated setup/provider/upgrade/troubleshooting docs, workspace index/plan and private architecture/specification. Application graph refreshed (**7,534 nodes**).

The isolated E2E containers were stopped after verification. Existing application model files, stored preferences and production containers were not changed. No model download, accuracy benchmark, database migration or deployment was needed.

## Two-model Settings catalog — 2026-10-18

Settings now offers **Phonon 2 for English** and **Parakeet v3 Q4 for German/Polish/Spanish**. Q8 is marked `downloadable: false` in the application manifest. It is hidden from fresh catalogs and excluded from generated public download tables. Existing installed/selected Q8 remains visible only for compatibility and cleanup, with translated replacement guidance and no Download or Use controls. Saved selections and explicit aliases still work; no weights are deleted or downloaded automatically.

Verification for this follow-up:

- **15 Python catalog/lifecycle tests passed**: fresh catalog has two entries, recommendation languages are curated separately from capabilities, retired downloads/selections are rejected, legacy inference resolution and storage/removal remain available, and preferences survive removal/restart.
- **11 backend STT tests across three suites passed**, including retired download/selection rejection and allowed removal.
- **Two focused browser scenarios passed** against rebuilt app containers: fresh two-model Settings (Phonon only under English; no Q8), shared Q4 installation/cancellation/removal/manual transcripts, and legacy Q8 readiness with no new download/selection controls plus explicit replacement by Q4. Fresh-state and legacy screenshots were inspected.
- A temporary real STT gateway using the current source listed only Phonon/Q4 with their curated languages and returned **HTTP 400** for a new Q8 download. No model downloads were needed for this catalog-only check; real Q4 engine/codec evidence below remains applicable because inference was unchanged.
- App lint/type checks and production frontend/backend Docker builds passed. Five UI locales have **1,288 matching keys**. Existing non-failing lint/build warnings remain.
- E2E type check and public-docs generation/structure/privacy/type check/strict build passed. Generated catalogs derive the retirement flag from the manifest. Application graph refreshed (7,532 nodes).

App/private/public docs, workspace index/plan and E2E fixtures are synchronized. The landing has no affected model-specific claims. Test containers were stopped after verification; existing application model files and preferences were preserved. No publishing or deployment.

## Q4 default update — 2026-10-18

Fresh German, Polish and Spanish installations now share **Parakeet v3 Q4_K_M**. English retains Phonon 2. Q8 stays separately available, and existing preferences, legacy adoption and explicit Q8 aliases retain their meaning.

- Downloaded the actual **485,425,504-byte** Q4 asset at revision `d8d8c32cb2017c57e5307767343e97870f8a7f53` and verified SHA-256 `b68557be1e3c40207fd7c4bd9d63f1d3316b963f15325bfb0cc16a8bb0ffd181` against the pinned manifest and upstream metadata.
- Saves **254,083,072 bytes (34.36%)** relative to Q8. Installed managed Q4 storage including its attribution/license was **485,444,676 bytes**. Runtime images remain separate and unchanged.
- Real gateway/FFmpeg transcription with Q4 returned nonempty text for **WAV, WebM, MP3, Ogg and M4A** on native Linux ARM64 and emulated Linux AMD64: **10 cases passed**. Used the same public JFK sample and pinned runtime images as the original checks. No native x86 performance or comparative accuracy claim.
- **13 Python catalog/lifecycle tests passed**, including new coverage for Q4 routing, one download across three languages without Q8, and retained Q8 preferences after restart.
- Focused Settings browser scenario passed (**1 test**): fresh English, Q4 cancellation/download, shared language readiness/storage, selection, removal, manual transcript saving and recovery. The browser showed Q4 selected for German and Polish at 485 MB, with Q8 available but uninstalled. E2E type check passed.
- App lint/type checks/production build passed. Existing non-failing lint, CSS/Browserslist build warnings remain. Public-docs generated facts, structure/privacy, type check and strict build passed (40 pages); the optional Docusaurus update-check notice remains. Application code graph refreshed (7,528 nodes).
- Application/private/public docs, workspace index/next-stage notes and E2E scenario now describe Q4 defaults. Generated catalog content was regenerated from the manifest. No frontend wording or landing claims required changes.

Upstream reports English LibriSpeech test-clean WER of 1.98% for Q4 versus 1.94% for Q8. No multilingual or learner-speech equivalence is claimed. The approximately 200 MB target remains unmet for German, Polish and Spanish. Existing installation files and preferences were not changed; temporary smoke assets and containers were removed after verification, and the isolated E2E stack was stopped. No publishing or deployment.

## Original integration baseline — 2026-10-16

## Models and installation

- Phonon archive: **163,515,201 bytes**, pinned Hugging Face revision `7e153e4054c0a10db6d47d6fff5c062d4c77c154`, SHA-256 `98125795b6dda72f5c6eee9ba33d19815df65dcb18b50a357bf9f73c9935309e`.
- Existing Parakeet Q8: **739,508,576 bytes**, pinned revision `d8d8c32cb2017c57e5307767343e97870f8a7f53`, SHA-256 `5859f77944efcd8eafa23a6350731960b2b55b2203df51f319665c807d802cc7`.
- A fresh final-image gateway downloaded Phonon over HTTPS, cancelled an in-progress transfer, retried, verified the checksum and installed the upstream NOTICE and weight license. Its catalog contained only Phonon as installed; no Parakeet weights were downloaded.
- Fresh Phonon managed storage was **163,536,599 bytes** including notices before inference, and **341,253,274 bytes** after unpacking on first use. Runtime image size is additional.
- Actual legacy-file adoption verified the existing Parakeet checksum, retained its source, preserved English's Parakeet preference and copied notices. Unit tests also verify all language preferences and hard-link/copy adoption behavior.

## CPU engine checks

Both pinned engines transcribed the public upstream [JFK sample](https://github.com/ggml-org/whisper.cpp/blob/master/samples/jfk.wav) through the gateway after FFmpeg conversion from **WAV, WebM, MP3, Ogg and M4A**. All 20 model/format/architecture cases returned nonempty text.

- **Linux ARM64:** native execution on Docker Desktop's ARM64 engine.
- **Linux AMD64:** built and executed through Docker emulation on the same host. This verifies emulated compatibility, not native x86 performance or every CPU instruction tier.
- Fresh-image Phonon WAV transcription passed after the real managed download.
- Missing/Loading/Ready health states and HTTP **409** removal during real inference passed. Idle worker teardown is covered by a deterministic lifecycle test.
- The committed `smoke.py` command also passed with both engines on both architectures. It checks codec/API integration, without scoring transcript accuracy.

The CPU images are approximately **1.76 GB (ARM64)** and **1.91 GB (AMD64)** without model weights. They include PyTorch 2.14.1 CPU, Transformers 5.17.0, Fermion 0.2.11, FFmpeg and pinned transcribe.cpp. A 164 MB model download is not a 164 MB application installation.

## Application and repository checks

- `pnpm test`: **69 backend suites / 679 tests / 4 snapshots**, plus **11 STT catalog/lifecycle tests**, passed. Catalog tests require no speech downloads or third-party Python libraries.
- `pnpm type-check`, `pnpm build`, and `pnpm lint`: passed. Lint retains the existing non-failing `SetRadio.vue` optional-prop warning.
- `pnpm i18n:check`: five locales in parity, **1,287 keys**.
- E2E `pnpm type-check`: passed.
- E2E browser command below expanded through the Chromium project dependency: **54 reported passed, 30 skipped, exit 0**. It includes the catalog scenario, speaking/manual saving, account, navigation and pack-switch coverage. The existing reading-draft expected-failure annotation remains; skipped pack/provider tiers are not certified by this run.
- Public documentation `pnpm check`: **40 pages**, privacy/structure, generated-fact drift, types and strict production build passed. Docusaurus printed its existing optional update-check permission notice after the successful build.
- Application code graph refreshed with AST extraction. The global Graphify launcher points at a removed Python; invoking the installed package with the current Python and a temporary tree-sitter dependency completed the refresh without modifying global Python configuration.
- Landing copy was audited: its generic open-source STT and six-service claims remain accurate. No landing sources changed, so no landing build is claimed.

```bash
# From exam-one-e2e; the catalog project runs after Chromium because model state is shared.
pnpm exec playwright test tests/practice/speaking.spec.ts tests/smoke/stack.spec.ts tests/settings/stt-models.spec.ts --workers=1

# Focused model scenario only:
pnpm exec playwright test tests/settings/stt-models.spec.ts --project=stt-models --no-deps
```

The browser scenario checks fresh English-only installation, cancellation, German installation shared across languages, all four language capabilities, deduplicated storage, reload-persistent preferences, missing-model behavior, manual transcript saving and recovery. Stubs read the application manifest rather than duplicating it. Three older E2E selectors were aligned with the existing model combobox, exam-target card and light/dark toggle; the application controls were preserved.

## Boundaries

Existing project `.env` and original model files were preserved. All real-engine/model downloads used temporary smoke directories; application browser checks used the separate E2E Compose project. No production deployment, paid-provider call, custom accuracy evaluation or database migration was performed.

At the original 2026-10-16 baseline, English’s approximately 200 MB weight-download target was met and German, Polish and Spanish used the shared approximately 740 MB Q8 model. The Q4 follow-up above supersedes that default and records its separate verification.
