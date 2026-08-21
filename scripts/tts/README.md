# Listening audio generation (four-voice PyTorch Kokoro)

Listening practice plays **stable WAV files** (identical on every replay). Kokoro is only
needed when generating or regenerating those files.

`pnpm tts:up` selects and starts the **single** `kokoro-voices` service from the
root `compose.yaml` on `:8881`, with four German voices:

| Voice      | Gender   | Backbone                |
| ---------- | -------- | ----------------------- |
| `martin`   | male 1   | Kikiri Stage-2          |
| `bernd`    | male 2   | Kikiri base + voicepack |
| `victoria` | female 1 | Kikiri Stage-2          |
| `eva`      | female 2 | Kikiri base + voicepack |

German text→phonemes uses `phonemizer` + espeak-ng `de` (same path as the former Martin ONNX stack).

Dialogue transcripts that use `Role:` labels (Teil 2–4) are synthesized **turn-by-turn**
with up to **two male + two female** voices (assigned by gender and order of appearance),
then concatenated. Unlabeled monologues (Teil 1) stay Martin.

Example: `Mann` → martin, `Frau` → victoria, `Verkäuferin` → eva.

## Seed audio (maintainer)

```bash
# One-time: download martin / victoria / bernd / eva weights
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
| `TTS_LANG`          | `de`                    | Language hint                     |
| `TTS_TURN_PAUSE_MS` | `350`                   | Silence between dialogue turns    |

Upstream Martin: [kikiri-german-martin](https://huggingface.co/kikiri-tts/kikiri-german-martin).
Upstream Victoria: [kikiri-german-victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria).
Bernd / Eva voicepacks: recovered via [r1di/kokoro-fastapi-german](https://github.com/r1di/kokoro-fastapi-german) (Apache-2.0).
Multi-speaker base: [kikiri-german-base-51speakers-synthetic](https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic).

Legacy Martin ONNX scripts remain under `scripts/tts/kokoro-german/` but are not used by `pnpm tts:up`.
