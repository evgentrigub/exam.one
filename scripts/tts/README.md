# Listening audio generation (four-voice Kokoro + parallel synth)

Listening practice plays **stable WAV files** (identical on every replay). Kokoro is only
needed when generating or regenerating those files.

`pnpm tts:up` starts **both** TTS containers:

| Port | Service | Voices |
|------|---------|--------|
| `:8881` | Martin ONNX | `martin` (primary male / monologues) |
| `:8882` | Multi-voice PyTorch | `victoria`, `bernd`, `eva` |

Dialogue transcripts that use `Role:` labels (Teil 2–4) are synthesized **turn-by-turn**
with up to **two male + two female** voices (assigned by gender and order of appearance),
then concatenated. Unlabeled monologues (Teil 1) stay Martin.

Example: `Mann` → martin, `Frau` → victoria, `Verkäuferin` → eva.

## Seed audio (maintainer)

```bash
# One-time: download Martin ONNX + victoria/bernd/eva weights
./scripts/tts/setup-kokoro.sh

# Start four-voice TTS stack (downloads multi-voice models if missing, then starts containers)
pnpm tts:up

# Synthesize WAVs for default A2 listening seeds → public/audio/listening/a2/
pnpm generate:listening-audio

# After voice-roster or dialogue-pipeline changes, force a full regen:
FORCE=1 pnpm generate:listening-audio

# Optional: raise parallelism (default 3; try 4–6 on fast machines)
TTS_CONCURRENCY=4 FORCE=1 pnpm generate:listening-audio

pnpm tts:down
```

Seed WAVs are typically gitignored; each machine regenerates them once.

## In-app Generate audio

On a listening practice page, the sidebar shows:

- **TTS health** (ready / offline) via Nuxt `/api/tts/health` → Kokoro `:8881`
- A **missing audio** alert when expected files are not found
- **Generate audio** — calls `/api/tts/generate-listening-audio`, writes
  `public/audio/listening/generated/{exerciseId}/…`, and stores the `audio` map
  on the exercise (localStorage, including overrides for seed exercises)

Requires `pnpm tts:up` first. Segment and dialogue-turn synthesis run in parallel
(`TTS_CONCURRENCY`, default 3).

Env overrides:

| Variable | Default | Meaning |
|----------|---------|---------|
| `TTS_BASE_URL` | `http://127.0.0.1:8881` | Martin ONNX |
| `TTS_MULTI_BASE_URL` | `http://127.0.0.1:8882` | victoria / bernd / eva |
| `TTS_FEMALE_BASE_URL` | (alias) | Same as `TTS_MULTI_BASE_URL` |
| `TTS_CONCURRENCY` | `3` | Parallel segment + turn synthesis |
| `TTS_SPEED` | `1.0` | Speaking rate |
| `TTS_LANG` | `de` | Language hint |
| `TTS_TURN_PAUSE_MS` | `350` | Silence between dialogue turns |

Upstream Martin: [Kokoro-82M-ONNX-German-Martin](https://github.com/Godelaune/Kokoro-82M-ONNX-German-Martin).
Upstream Victoria: [kikiri-german-victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria).
Bernd / Eva voicepacks: recovered via [r1di/kokoro-fastapi-german](https://github.com/r1di/kokoro-fastapi-german) (Apache-2.0).
Multi-speaker base: [kikiri-german-base-51speakers-synthetic](https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic).
