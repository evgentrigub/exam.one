# Speech tools

The project has two different speech services:

- **TTS (text-to-speech):** Kokoro converts German text into WAV audio for Listening.
- **STT (speech-to-text):** Parakeet converts Speaking recordings into editable transcripts.

Both services, the applications, and PostgreSQL are defined in the single root
`compose.yaml`.

## Start everything

```bash
cp .env.example .env
pnpm stack:setup
pnpm stack:up
pnpm stack:ps
```

`stack:setup` only downloads and verifies the models. `stack:up` performs that
setup automatically before starting Compose. The first run downloads about 1.7
GB of weights and builds the PyTorch
TTS image plus the lightweight `transcribe.cpp` STT runtime; subsequent starts
reuse those files.

```bash
pnpm stack:logs
pnpm stack:down
```

Stopping the stack preserves PostgreSQL, generated listening audio, and model weights.

## Start only one speech service

```bash
pnpm tts:setup
pnpm tts:up
pnpm tts:down

pnpm stt:setup
pnpm stt:up
pnpm stt:down
```

These commands still use the root `compose.yaml`; they only select one service.

## Health checks

```bash
curl http://127.0.0.1:8881/v1/audio/voices
curl http://127.0.0.1:8882/health
```

For detailed model, voice, and native-macOS instructions, see
[`tts/README.md`](tts/README.md) and [`stt/README.md`](stt/README.md).
