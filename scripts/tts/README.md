# Listening audio generation (Kokoro German Martin)

Listening practice plays **stable WAV files** (identical on every replay). Kokoro is only
needed when generating or regenerating those files.

## Seed audio (maintainer)

```bash
# One-time: clone upstream + download ONNX models (~hundreds of MB)
./scripts/tts/setup-kokoro.sh

# Start optional TTS service
docker compose -f compose.tts.yaml up -d --build --wait
# or: pnpm tts:up

# Synthesize WAVs for default A2 listening seeds → public/audio/listening/a2/
pnpm generate:listening-audio

FORCE=1 pnpm generate:listening-audio   # force full regenerate
pnpm tts:down                            # stop TTS when done
```

Seed WAVs are typically gitignored; each machine regenerates them once.

## In-app Generate audio

On a listening practice page, the sidebar shows:

- **TTS health** (ready / offline) via Nuxt `/api/tts/health` → Kokoro `:8881`
- A **missing audio** alert when expected files are not found
- **Generate audio** — calls `/api/tts/generate-listening-audio`, writes
  `public/audio/listening/generated/{exerciseId}/…`, and stores the `audio` map
  on the exercise (localStorage, including overrides for seed exercises)

Requires `pnpm tts:up` first. AI “Generate exercises” still creates **transcripts only**;
audio is on-demand via this button (Phase 1).

Env overrides: `TTS_BASE_URL` (default `http://127.0.0.1:8881`), `TTS_VOICE`,
`TTS_SPEED`, `TTS_LANG`.

Upstream: [Kokoro-82M-ONNX-German-Martin](https://github.com/Godelaune/Kokoro-82M-ONNX-German-Martin).
