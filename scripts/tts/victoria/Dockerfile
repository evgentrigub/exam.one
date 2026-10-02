# Speech sidecar: German (martin / bernd / victoria / eva), British English
# (bf_emma / bf_isabella / bm_george / bm_fable) and Spanish (ef_dora / em_alex / em_santa) on
# Kokoro, Polish (pl_gosia / pl_darkman / pl_bass) on Piper, chosen by KOKORO_LANGS.
# OpenAI-compatible /v1/audio/speech — PyTorch + phonemizer(de) + misaki(en-GB, es) + Piper(pl)
FROM python:3.11-slim-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    curl \
    espeak-ng \
    libsndfile1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

ENV KOKORO_VICTORIA_MODEL_DIR=/app/models
ENV KOKORO_MULTI_SPEED=1.0
ENV KOKORO_PAUSE_DURATION=0.25
ENV KOKORO_LANGS=de,en,pl,es
# Every model and the spaCy English model ship with the image or the mount; never fetch at runtime.
ENV HF_HUB_OFFLINE=1

EXPOSE 8881

HEALTHCHECK --interval=15s --timeout=10s --retries=40 --start-period=300s \
  CMD curl -fsS http://127.0.0.1:8881/v1/audio/voices >/dev/null || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8881"]
