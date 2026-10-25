# Stack, speech, and content tools

[Back to the application](../README.md)

Utilities for running exam.one's generic platform, preparing speech assets for exam packs, checking interface locales, and evaluating prompts. Run commands from the application repository root.

## Start and inspect the stack

For a new checkout, run `bash scripts/stack-install.sh` (or `pnpm stack:install` when pnpm is available). It reports missing tools, stops until prerequisites are satisfied, prepares `.env` and missing secrets, installs dependencies, and starts the existing stack. Use `--check` for prerequisite checks only, or `--core` to install without speech. Existing nonempty secrets and configuration are preserved. See the [self-host quick start](../README.md#self-host-with-docker-compose).

For subsequent starts and diagnostics:

```bash
pnpm stack:up
docker compose ps
docker compose logs -f
pnpm stack:down
```

The root `compose.yaml` defines Nuxt, NestJS, PostgreSQL, Redis, TTS, and STT. `stack:up` starts the core services (`stack:up:core`), then prepares missing models, starts speech, and prepares selected bundled audio (`stack:up:speech`). Stopping the stack preserves named volumes and host media/model folders.

```bash
pnpm tts:setup
pnpm stt:setup
pnpm stack:verify-models
pnpm speech:seed-audio
pnpm speech:seed-audio --packs all
```

Setup downloads model files without starting containers. English is the default TTS installation, and bundled-audio preparation defaults to Cambridge A2 Key. Additional pack audio requires voices for its language; download them in Settings → Generated files → Voice models or configure `KOKORO_LANGS` before setup.

## Speech services

TTS converts pack transcripts to stable WAVs. German, British English, and Spanish use Kokoro; Polish uses Piper in the same service. STT converts recordings to editable transcripts through local Phonon / Parakeet. Both are optional integrations; existing WAV playback and manual speaking transcripts do not require a live speech service.

```bash
pnpm tts:up
pnpm tts:down
pnpm stt:up
pnpm stt:down
```

```bash
curl http://127.0.0.1:8881/v1/audio/voices
curl http://127.0.0.1:8882/health
```

See the [TTS guide](tts/README.md) and [STT guide](stt/README.md) for voice/model files, language capabilities, and configuration.

## Pack and locale checks

```bash
pnpm generate:listening-audio --packs cambridge-en-a2
TTS_CONCURRENCY=1 pnpm generate:listening-audio --packs cambridge-en-b1,goethe-de-b1,certpol-pl-b1,dele-es-b1
pnpm i18n:check
pnpm tts:test
```

`generate:listening-audio.mjs` prepares selected bundled WAVs against a running TTS service. All four B1 mock packs are supported: English (15 recordings), German (4), Polish (22) and Spanish (10). Install the required language voices first; prepared playback needs no TTS service. The default remains Cambridge A2, so select B1 packs explicitly. `check-locale-parity.mjs` compares frontend locale keys. Voice-catalog tests use Python's standard library.

`eval-prompts.mjs` checks a selected pack with the production validators. Build the workspace first, then choose a registered pack:

```bash
pnpm build
node scripts/eval-prompts.mjs --pack cambridge-en-a2 --control
node scripts/eval-prompts.mjs --pack cambridge-en-a2 --n 3
```

Control mode validates bundled seeds without a paid LLM call. Sample mode evaluates generated payloads using the configured provider. Read the [pack guide](../data/README.md) when changing content or prompt rules.

Stack/audio setup scripts read the repository configuration they need. Database CLI commands have separate environment handling; use the [database guide](../libraries/database/README.md) for migration and seed setup. Backup/restore belongs in the [operator runbook](../README.md#backup-restore-and-upgrades).

Speech setup (`tts:setup`, `stt:setup`) and `stack:verify-models` run through Bash and temporary Compose containers, using Python bundled in the speech images. Self-hosting needs no Python installation on the host. Contributor `tts:test`/`stt:test` commands use optional host Python 3.10+ and standard-library tests. Setup containers write to the service mounts as the invoking user and are removed afterward.

The default `pnpm stt:setup`/`stack:up` includes this English model through `STT_SETUP_LANGS=en`; add other languages with that variable or Settings.

Installer regression checks use Node's built-in test runner and fake tools in temporary checkouts; they do not start Docker or modify the real `.env`:

```bash
node --test scripts/stack-install.test.mjs
```
