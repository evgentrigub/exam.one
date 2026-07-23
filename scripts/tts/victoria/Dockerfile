# Multi-voice German Kokoro sidecar (victoria / bernd / eva)
# OpenAI-compatible /v1/audio/speech
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
ENV KOKORO_MULTI_LANG=de
ENV KOKORO_MULTI_SPEED=1.0
ENV KOKORO_PAUSE_DURATION=0.25

EXPOSE 8882

HEALTHCHECK --interval=15s --timeout=10s --retries=40 --start-period=240s \
  CMD curl -fsS http://127.0.0.1:8882/v1/audio/voices >/dev/null || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8882"]
