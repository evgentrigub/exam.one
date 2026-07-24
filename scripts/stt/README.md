# Local Parakeet speech-to-text

Speaking practice can transcribe recordings with NVIDIA
`nvidia/parakeet-tdt-0.6b-v3` behind an OpenAI-compatible local endpoint.
This stack is optional: editable manual transcripts and progress saving work
without it.

## Start and stop

```bash
pnpm stt:up
pnpm stt:down
```

`stt:up` first downloads and verifies the Hugging Face snapshot under
`scripts/stt/parakeet/models/`, then builds and starts the service on `:8882`.
The directory is on the host project disk and mounted read-only into the
container. `docker compose down` does not delete it.

Verify:

```bash
curl http://127.0.0.1:8882/health
```

The first image build is large because it installs PyTorch. Model loading can
also take several minutes. Docker Desktop on Apple Silicon runs the Linux
container on CPU; MPS is not exposed inside Docker, so short A2 recordings may
transcribe more slowly than their duration.

## Environment

```bash
STT_PROVIDER=local
STT_BASE_URL=http://127.0.0.1:8882
STT_MODEL=nvidia/parakeet-tdt-0.6b-v3
```

For OpenAI instead:

```bash
STT_PROVIDER=openai
OPENAI_API_KEY=sk-...
STT_OPENAI_MODEL=whisper-1
```

## Advanced native run on macOS

If Docker CPU inference is too slow, install `ffmpeg` and `uv`, then run the
same service natively so PyTorch can select MPS when supported:

```bash
cd scripts/stt/parakeet
uv venv
uv pip install -r requirements.txt
PARAKEET_MODEL_DIR="$PWD/models" uv run uvicorn main:app --host 127.0.0.1 --port 8882
```

The app continues to use `STT_BASE_URL=http://127.0.0.1:8882`.
