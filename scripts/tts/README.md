# Listening audio generation (Kokoro German Martin)

Seed listening exercises ship pre-generated WAV files under
`apps/frontend/public/audio/listening/a2/`. The player uses those files so
every replay is identical. Kokoro is only needed when regenerating assets.

## Regenerate seed audio

```bash
# One-time: clone upstream + download ONNX models (~hundreds of MB)
./scripts/tts/setup-kokoro.sh

# Start optional TTS service
docker compose -f compose.tts.yaml up -d --build --wait

# Synthesize WAVs for default A2 listening seeds
pnpm generate:listening-audio

# Optional: force full regenerate
FORCE=1 pnpm generate:listening-audio
```

Env overrides: `TTS_BASE_URL` (default `http://127.0.0.1:8881`), `TTS_VOICE`,
`TTS_SPEED`, `TTS_LANG`.

Upstream: [Kokoro-82M-ONNX-German-Martin](https://github.com/Godelaune/Kokoro-82M-ONNX-German-Martin).
