# Listening audio generation (Kokoro German Martin + Victoria)

Listening practice plays **stable WAV files** (identical on every replay). Kokoro is only
needed when generating or regenerating those files.

`pnpm tts:up` starts **both** voices automatically:

- **Martin** (male) on `:8881`
- **Victoria** (female) on `:8882`

Dialogue transcripts that use `Role:` labels (Teil 2–4) are synthesized **turn-by-turn**
with male/female voices, then concatenated. Unlabeled monologues (Teil 1) stay single-voice
Martin. Voice selection is automatic from speaker labels — you do not pick male/female when
starting TTS.

## Seed audio (maintainer)

```bash
# One-time: download Martin ONNX + Victoria weights
./scripts/tts/setup-kokoro.sh

# Start dual-voice TTS (Martin + Victoria)
pnpm tts:up

# Synthesize WAVs for default A2 listening seeds → public/audio/listening/a2/
pnpm generate:listening-audio

FORCE=1 pnpm generate:listening-audio   # force full regenerate (needed after dialogue TTS upgrade)
pnpm tts:down                            # stop both TTS services
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

Env overrides:

| Variable | Default | Meaning |
|----------|---------|---------|
| `TTS_BASE_URL` | `http://127.0.0.1:8881` | Martin (male) |
| `TTS_FEMALE_BASE_URL` | `http://127.0.0.1:8882` | Victoria (female); falls back to Martin when offline |
| `TTS_VOICE_MALE` | `martin` | Male voice id |
| `TTS_VOICE_FEMALE` | `victoria` | Female voice id |
| `TTS_SPEED` | `1.0` | Speaking rate |
| `TTS_LANG` | `de` | Language hint |
| `TTS_TURN_PAUSE_MS` | `350` | Silence between dialogue turns |

Upstream Martin: [Kokoro-82M-ONNX-German-Martin](https://github.com/Godelaune/Kokoro-82M-ONNX-German-Martin).
Upstream Victoria: [kikiri-german-victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria).
