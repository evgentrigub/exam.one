# Listening audio generation (PyTorch Kokoro: German and British English)

Listening practice plays **stable WAV files** (identical on every replay). Kokoro is only
needed when generating or regenerating those files.

`pnpm tts:up` selects and starts the **single** `kokoro-voices` service from the
root `compose.yaml` on `:8881`. It loads the languages in `KOKORO_LANGS` (default `de,en`):

| Voice         | Language | Gender   | Backbone                   |
| ------------- | -------- | -------- | -------------------------- |
| `martin`      | German   | male 1   | Kikiri Stage-2             |
| `bernd`       | German   | male 2   | Kikiri base + voicepack    |
| `victoria`    | German   | female 1 | Kikiri Stage-2             |
| `eva`         | German   | female 2 | Kikiri base + voicepack    |
| `bf_emma`     | English  | female 1 | Kokoro-82M v1.0 (grade B-) |
| `bm_george`   | English  | male 1   | Kokoro-82M v1.0 (grade C)  |
| `bf_isabella` | English  | female 2 | Kokoro-82M v1.0 (grade C)  |
| `bm_fable`    | English  | male 2   | Kokoro-82M v1.0 (grade C)  |

German text→phonemes uses `phonemizer` + espeak-ng `de` (same path as the former Martin ONNX stack).
British English uses misaki's British G2P with the espeak `en-gb` fallback, as kokoro's own
`KPipeline(lang_code="b")` does; one base model serves all four English voices and adds
about 0.5 GiB of memory. Grades are upstream's own voice ratings. `KOKORO_LANGS=de` skips the
English download and model.

Every request names a voice and a language. An unknown voice, or a voice of another language,
is refused with HTTP 400 instead of being spoken by a German voice. `/v1/audio/voices` and
`/health` list the loaded voices per language; the backend reports a pack whose voices are
missing as `unsupported`, not offline.

Dialogue transcripts that use `Role:` labels (Teil 2–4) are synthesized **turn-by-turn**
with up to **two male + two female** voices (assigned by gender and order of appearance),
then concatenated. Unlabeled monologues (Teil 1) stay Martin.

Example: `Mann` → martin, `Frau` → victoria, `Verkäuferin` → eva.

English packs label turns with one word: roles (`Man`, `Woman`, `Boy`, `Girl`, `Mum`, `Dad`,
`Assistant`, …) or first names (`Tom`, `Katie`). Their voices come from the pack's own
`speech.voices`, by gender and order of appearance, so `Man` → bm_george, `Woman` → bf_emma.
A monologue opening with one label (`Paul: Hi Jenny, …`) takes that speaker's voice and the
label is not read aloud; an unlabeled one takes the pack's first voice.

## Seed audio (maintainer)

```bash
# One-time: download the German and English weights (KOKORO_LANGS=de for German only)
bash scripts/tts/victoria/download-models.sh
# or: ./scripts/tts/setup-kokoro.sh

# Start four-voice TTS (downloads models if missing, then starts the container)
pnpm tts:up

# Synthesize WAVs for default A2 listening seeds → public/audio/listening/a2/
pnpm generate:listening-audio

# After voice-roster or dialogue-pipeline changes, force a full regen:
FORCE=1 pnpm generate:listening-audio

# Optional: raise parallelism (default 3; try 4–6 on fast machines)
TTS_CONCURRENCY=4 FORCE=1 pnpm generate:listening-audio

pnpm tts:down
```

To start the application, database, TTS, and STT together, use `pnpm stack:up`.
All services are defined in the root `compose.yaml`; there is no speech-specific
Compose file.

Seed WAVs are typically gitignored; each machine regenerates them once.

## In-app Generate audio

On a listening practice page, the sidebar shows:

- **TTS health** (ready / offline) via NestJS `/api/v1/tts/health` → Kokoro `:8881`
- A **missing audio** alert when expected files are not found
- **Generate audio** — calls `/api/v1/tts/generate-listening-audio`, writes
  generated WAVs onto the shared Compose volume (or `public/audio/listening/generated/`
  in local `pnpm dev`), and stores the `audio` map on the exercise via the API

Requires `pnpm tts:up` first. Segment and dialogue-turn synthesis run in parallel
(`TTS_CONCURRENCY`, default 3).

Env overrides:

| Variable            | Default                 | Meaning                           |
| ------------------- | ----------------------- | --------------------------------- |
| `TTS_BASE_URL`      | `http://127.0.0.1:8881` | Four-voice PyTorch service        |
| `TTS_CONCURRENCY`   | `3`                     | Parallel segment + turn synthesis |
| `TTS_SPEED`         | `1.0`                   | Speaking rate                     |
| `TTS_LANGUAGES`     | `de` (Compose `de,en`)  | Languages packs may use           |
| `TTS_LANG`          | `de`                    | Single-language form of the above |
| `TTS_VOICES`        | German + British ids    | Voices packs may use              |
| `KOKORO_LANGS`      | `de,en`                 | Languages the service downloads and loads |
| `TTS_TURN_PAUSE_MS` | `350`                   | Silence between dialogue turns    |

Upstream Martin: [kikiri-german-martin](https://huggingface.co/kikiri-tts/kikiri-german-martin).
Upstream Victoria: [kikiri-german-victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria).
Bernd / Eva voicepacks: recovered via [r1di/kokoro-fastapi-german](https://github.com/r1di/kokoro-fastapi-german) (Apache-2.0).
Multi-speaker base: [kikiri-german-base-51speakers-synthetic](https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic).
English model and voices: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), with
[misaki](https://github.com/hexgrad/misaki) G2P (Apache-2.0) and spaCy `en_core_web_sm` (MIT) baked into the image.
The Kikiri models are Apache-2.0; the multi-speaker base was trained on synthetic audio.

Legacy Martin ONNX scripts remain under `scripts/tts/kokoro-german/` but are not used by `pnpm tts:up`.
