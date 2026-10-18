# Speaking speech-to-text

[Back to scripts](../README.md)

The local service transcribes recordings into editable text. Missing models, microphone or provider never remove manual transcript entry. Transcripts and reviews are persisted; recordings remain temporary browser data.

## Language-specific installation

`pnpm stt:setup` runs a Bash launcher and a temporary Compose container using the STT image. Python and inference dependencies stay inside Docker; no host Python or pip packages are required for setup or `stack:up`. The launcher builds/reuses the image, shares the service’s model mounts and language settings, and removes the setup container on exit. Verified current files are reused; setup installs and selects the recommended model for each requested language.

Fresh installations use **Phonon 2 for English** (163,515,201-byte download). German, Polish and Spanish use **Parakeet v3 Q4** (485,425,504 bytes), shared across languages and levels. The approximately 200 MB model-download target remains unmet for these three languages. Model evidence, runtime versions, hashes, licenses and defaults live in [model-manifest.json](model-manifest.json).

```bash
pnpm stt:setup
pnpm stt:up
curl 'http://127.0.0.1:8882/health?language=en'
pnpm stt:down
```

To prepare more languages before startup:

```bash
STT_SETUP_LANGS=en,de,pl,es pnpm stt:setup
```

`STT_SETUP_LANGS=en` controls setup downloads and is the default for `stack:setup`/`stack:up`.

Restart an already running STT service after a setup command changes preferences on disk. `--verify` only checks recommended files; it never downloads or changes current selections.

`STT_LANGUAGES=de,en,pl,es` controls permitted exam languages; it does not download models. Persistent instance preferences select the model for each exam language. Changing backend environment requires a restart.

The Compose service keeps the name `parakeet` and port 8882 for compatibility. Its build context is now `scripts/stt/`. `pnpm stack:up`, `stt:setup`, `stt:up` and `stt:down` remain supported. Model files, derived caches and `preferences.json` live in `scripts/stt/models/`, mounted writable. Copy this folder when preserving choices across installations. Model files are shared resources, not per-user downloads.

## Model management

**Settings → Generated files → Speech models** shows one card per model, with download size, actual managed disk usage and selected languages. English uses its own card; German, Polish and Spanish share a single **Multilingual** card and one download/cancel/remove control. Download, cancel, retry, remove or select an installed model without restarting. Multilingual files count once in storage totals. Removing a model affects all its languages/users, preserves preferences, and makes transcription unavailable until the model returns or another model is selected. It never downloads a fallback automatically. Model management uses the existing authenticated Settings boundary.

Speaking distinguishes a missing language model, model loading, unsupported languages and an offline service. A missing model links directly to Speech models in Settings; editable transcripts remain available. The frontend uses the shared health contract rather than interpreting every non-ready result as offline.

The backend exposes `GET /media/stt-models`, `PUT /media/stt-models/preferred` (`lang`, `modelId`), `POST /media/stt-models/:id/download`, `DELETE /media/stt-models/:id/download`, and `DELETE /media/stt-models/:id`, under `/api/v1`. The sidecar implements these under `/v1/models/stt`. `/media/summary` includes `sttBytes`.

Custom `STT_BASE_URL` endpoints still receive OpenAI-compatible transcription requests. Their catalog controls are disabled when `/v1/models/stt` is unsupported. External endpoints must resolve their own model from the language/default configuration; the application does not send a global model override.

## Upgrades and reliability

Q8 is no longer in the catalog or runtime. On setup/service startup, saved Q8 IDs and their known aliases migrate to Phonon for English and Q4 for German/Polish/Spanish. Current-model preferences are otherwise preserved. Migration itself never downloads weights. Missing replacements report unavailable; manual transcripts remain usable.

Apply an update and install both supported models:

```bash
STT_SETUP_LANGS=en,de,pl,es pnpm stt:setup
docker compose up -d --build parakeet frontend
```

Downloads use temporary files and a pinned SHA-256 before atomic installation. After a restart, interrupted downloads can be retried; partial files never count as installed. Corrupt preference files fail closed instead of changing providers.

FFmpeg converts WAV, WebM, MP3, Ogg, M4A and other supported browser recordings to 16 kHz mono PCM. A single isolated worker owns a model; transcription is serialized, switching engines closes the old worker, and five minutes idle releases the worker. In-use model removal returns a conflict. Engines load only local assets with Hugging Face offline mode enabled. `STT_CPU_THREADS` controls inference threads.

## Footprint and evidence

Download sizes refer to weights, not RAM or complete installation. Phonon retains its verified archive and unpacks approximately 178 MB on first inference; native caches can add more. The CPU image also includes PyTorch, Transformers, FFmpeg and transcribe.cpp. Measure its size with `docker image inspect`; do not advertise a 164 MB total installation.

Phonon's published English WER is 5.21% across seven test sets, versus 4.96% for its full-precision teacher. This is upstream evidence, not a local learner-speech comparison. No custom accuracy benchmark or learner corpus is included. Whisper and Vosk remain research candidates.

Contributor tests use host Python 3.10+ (standard library only); they are not part of self-host setup.

```bash
pnpm stt:test
```

To check an installed runtime with an existing English audio sample mounted at `/samples/english.wav`, run inside the service container:

```bash
docker compose exec parakeet python smoke.py --audio /samples/english.wav
```

Both models must already be installed for the default smoke command. Use `--models phonon-2` for English-only setup. It checks codecs and nonempty responses, without comparing accuracy.

The service supports Linux amd64 and arm64 CPUs through its upstream engines. Platform-specific integration verification and measured footprints are recorded in [VERIFICATION.md](VERIFICATION.md).

## Attribution

Phonon 2 weights: Fermion Research, derived from NVIDIA Parakeet, CC-BY-4.0. Installation copies the pinned upstream NOTICE and weight license from the bundled notices directory. Fermion runtime: Apache-2.0, pinned to 0.2.11 and its wheel checksum. Parakeet weights/Handy GGUF: CC-BY-4.0; transcribe.cpp: MIT. Preserve upstream notices when redistributing weights or images.

## Smaller multilingual default

German, Polish and Spanish use Q4_K_M (485,425,504 bytes), about 34% smaller than the retired Q8 model.

Upstream reports English LibriSpeech test-clean WER of 1.98% for Q4 and 1.94% for Q8. This does not establish equivalent multilingual or learner-speech accuracy.

Settings offers only Phonon for English and shared Parakeet Q4 for German, Polish and Spanish. Published capability languages remain separate from the curated `recommendedLanguages` shown in Settings. The manifest retains only retired IDs for preference migration, without retired asset URLs or download entries.
