# Speaking speech-to-text

[Back to scripts](../README.md)

exam.one's speaking flows turn recordings into editable transcripts using an optional STT provider. Pack metadata selects the language; manual entry remains available when the provider or microphone is unavailable. Transcripts and reviews are persisted, while browser recording blobs are temporary.

## Local Parakeet service

The `parakeet` service uses Handy's Q8 GGUF conversion of NVIDIA `parakeet-tdt-0.6b-v3` with a pinned `transcribe.cpp` CPU runtime. It serves an OpenAI-compatible transcription endpoint.

| Asset       | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Source      | `handy-computer/parakeet-tdt-0.6b-v3-gguf`                         |
| File        | `parakeet-tdt-0.6b-v3-Q8_0.gguf`                                   |
| Download    | 739,508,576 bytes (about 740 MB)                                   |
| SHA-256     | `5859f77944efcd8eafa23a6350731960b2b55b2203df51f319665c807d802cc7` |
| Host folder | `scripts/stt/parakeet/models/`                                     |

The download script writes a `.partial` file, verifies the checksum, and installs it only after success. It can reuse the same verified file from the standard Hugging Face cache. The service works independently of the Handy desktop app.

## Start and stop

Run from the application root:

```bash
pnpm stt:setup
pnpm stt:up
curl http://127.0.0.1:8882/health
pnpm stt:down
```

Setup downloads/verifies files without starting a container. `stt:up` performs setup, builds the runtime, and starts the root Compose `parakeet` service. Its model directory is mounted read-only; stopping the service preserves the files. `pnpm stack:up` starts it with the rest of the platform.

The model loads once and inference is serialized. FFmpeg converts supported browser recordings to 16 kHz mono PCM. Docker uses the CPU backend, including on Apple Silicon; adjust `STT_CPU_THREADS` for the host.

## API and languages

The backend NestJS STT adapter calls:

- `GET /health`
- `POST /v1/audio/transcriptions`

The local endpoint accepts OpenAI-compatible `model`, `language`, and JSON-response fields. Parakeet detects its supported languages automatically. The app checks the pack's language against `STT_LANGUAGES`, configured as `de,en,pl,es` in the supplied environment/Compose setup. Adding a pack does not establish speech support for another language; configure and verify the provider capability separately.

## Configuration

For local transcription in host development:

```dotenv
STT_PROVIDER=local
STT_BASE_URL=http://127.0.0.1:8882
STT_MODEL=handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0
STT_LANGUAGES=de,en,pl,es
STT_CPU_THREADS=4
```

Compose points the API at the service's internal hostname. For OpenAI Whisper, configure:

```dotenv
STT_PROVIDER=openai
OPENAI_API_KEY=<your-key>
STT_OPENAI_MODEL=whisper-1
```

Restart the backend after environment changes. Unsupported language or provider failures return an explicit unavailable response; users can edit or enter their transcript manually.

## Attribution

`transcribe.cpp` is distributed under MIT; the Parakeet model and Handy GGUF conversion use CC-BY-4.0. Preserve upstream attribution when distributing the model or a derived image. The pinned assets and download checks live beside this guide under [parakeet/](parakeet/).
