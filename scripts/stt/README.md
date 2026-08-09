# Local Parakeet speech-to-text

Speaking practice can transcribe recordings with Handy's Q8 GGUF conversion of
NVIDIA `parakeet-tdt-0.6b-v3`, served by `transcribe.cpp` behind the existing
OpenAI-compatible local endpoint. The service is optional: editable manual
transcripts and progress saving work without it.

## Model and runtime

- Source: `handy-computer/parakeet-tdt-0.6b-v3-gguf`
- File: `parakeet-tdt-0.6b-v3-Q8_0.gguf`
- Download size: 739,508,576 bytes (about 740 MB / 705 MiB)
- SHA-256: `5859f77944efcd8eafa23a6350731960b2b55b2203df51f319665c807d802cc7`
- Engine: pinned `handy-computer/transcribe.cpp`, CPU backend in Docker

The download script writes to a temporary `.partial` file, verifies the fixed
checksum, and only then installs the model under
`scripts/stt/parakeet/models/`. The directory is mounted read-only in Compose.
It is independent of the Handy desktop app and works on machines without Handy.
When the same verified model already exists in the standard Hugging Face cache
(for example after Handy downloaded it), the script reuses it with a hard link
or copy-on-write clone when the filesystem allows that, avoiding a second
physical 740 MB copy.

## Start and stop

```bash
pnpm stt:setup
pnpm stt:up
pnpm stt:down
```

`stt:setup` downloads and verifies the model without starting a container.
`stt:up` also performs setup and then selects the `parakeet` service from the
root `compose.yaml`. To
download both speech-model sets and start the application, database, TTS, and
STT together, run `pnpm stack:up`.

`stt:up` downloads and verifies the GGUF if necessary, builds the pinned
`transcribe.cpp` runtime, and starts the service on `:8882`. The model remains
on the host project disk after `pnpm stack:down`.

Verify:

```bash
curl http://127.0.0.1:8882/health
```

The service loads the model once at startup and serializes inference through
that shared model. Browser WebM/MP4/OGG recordings are converted locally with
FFmpeg to the 16 kHz mono PCM expected by `transcribe.cpp`.

Docker Desktop on Apple Silicon runs this Linux service on CPU; Metal is not
exposed inside Docker. `STT_CPU_THREADS` controls inference threads.

## Environment

```bash
STT_PROVIDER=local
STT_BASE_URL=http://127.0.0.1:8882
STT_MODEL=handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0
STT_CPU_THREADS=4
```

For OpenAI instead:

```bash
STT_PROVIDER=openai
OPENAI_API_KEY=sk-...
STT_OPENAI_MODEL=whisper-1
```

The local endpoint remains API-compatible with the Nuxt STT adapter:

- `GET /health`
- `POST /v1/audio/transcriptions`

The local service accepts the OpenAI-compatible `model`, `language`, and
`response_format=json` form fields. Parakeet V3 detects its supported European
language automatically.

## Licenses

- `transcribe.cpp`: MIT
- Parakeet model and Handy GGUF conversion: CC-BY-4.0

Keep upstream attribution when redistributing the model or a derived image.
