"""
OpenAI-compatible FastAPI sidecar for Kikiri German Victoria (female).
Mirrors the Martin ONNX /v1/audio/speech contract used by exam-one.
"""

from __future__ import annotations

import io
import os
import re
import time
import wave
from pathlib import Path

import numpy as np
import torch
from fastapi import FastAPI, Request
from fastapi.responses import Response

SAMPLE_RATE = 24000
DEFAULT_VOICE = "victoria"
DEFAULT_LANG = os.getenv("KOKORO_VICTORIA_LANG", "de")
DEFAULT_SPEED = float(os.getenv("KOKORO_VICTORIA_SPEED", "1.0"))
PAUSE_DURATION = float(os.getenv("KOKORO_PAUSE_DURATION", "0.25"))
MODEL_DIR = Path(os.getenv("KOKORO_VICTORIA_MODEL_DIR", "/app/models"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI()
pipeline = None
voice_tensor = None


def wav_bytes(samples: np.ndarray, sample_rate: int = SAMPLE_RATE) -> bytes:
    samples = np.asarray(samples, dtype=np.float32)
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767.0).astype(np.int16)
    output = io.BytesIO()
    with wave.open(output, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm.tobytes())
    return output.getvalue()


def split_into_sentences(text: str) -> list[str]:
    text = re.sub(r"\n\s*\n", "\n\n", text)
    sentences = re.split(r"(?<=[.!?])\s+(?=\S)", text)
    result: list[str] = []
    for segment in sentences:
        for line in segment.split("\n"):
            line = line.strip()
            if line and len(line) > 1:
                result.append(line)
    return result


def normalize_simple(text: str) -> str:
    cleaned = text.replace("\n", " ").strip()
    cleaned = re.sub(r"[«‹»›""„]", '"', cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


def load_pipeline():
    global pipeline, voice_tensor
    if pipeline is not None:
        return

    from kokoro import KModel, KPipeline

    model_path = MODEL_DIR / "kikiri_german_victoria_ep10.pth"
    config_path = MODEL_DIR / "config.json"
    voice_path = MODEL_DIR / "voices" / "victoria.pt"

    if not model_path.is_file():
        raise FileNotFoundError(f"Missing Victoria model: {model_path}")
    if not voice_path.is_file():
        raise FileNotFoundError(f"Missing Victoria voicepack: {voice_path}")

    started = time.perf_counter()
    print(f"Loading Victoria on {DEVICE}…", flush=True)

    kmodel = KModel(
        repo_id="hexgrad/Kokoro-82M",
        config=str(config_path) if config_path.is_file() else None,
        model=str(model_path),
    ).to(DEVICE).eval()

    pipeline = KPipeline(lang_code="de", model=kmodel)
    voice_tensor = torch.load(str(voice_path), map_location="cpu")
    print(f"Victoria ready in {time.perf_counter() - started:.3f}s", flush=True)


def synthesize_sentence(text: str, speed: float) -> np.ndarray:
    assert pipeline is not None and voice_tensor is not None
    chunks: list[np.ndarray] = []
    for result in pipeline(text, voice=voice_tensor, speed=speed):
        audio = result[2] if isinstance(result, (tuple, list)) and len(result) >= 3 else result
        arr = np.asarray(audio, dtype=np.float32).reshape(-1)
        if arr.size:
            chunks.append(arr)
    if not chunks:
        return np.zeros(0, dtype=np.float32)
    return np.concatenate(chunks)


@app.on_event("startup")
async def startup() -> None:
    load_pipeline()


@app.get("/v1/audio/voices")
async def list_voices():
    return {"voices": [DEFAULT_VOICE]}


@app.get("/health")
async def health():
    return {"ok": pipeline is not None, "voice": DEFAULT_VOICE}


@app.post("/v1/audio/speech")
async def generate_speech(request: Request):
    data = await request.json()
    raw_text = str(data.get("input") or "")
    text = normalize_simple(raw_text)
    voice = str(data.get("voice") or DEFAULT_VOICE).lower()
    speed = float(data.get("speed") or DEFAULT_SPEED)
    req_pause = float(data.get("pause_duration", PAUSE_DURATION))

    if voice not in {DEFAULT_VOICE, "female"}:
        # Only Victoria is loaded in this sidecar.
        voice = DEFAULT_VOICE

    if not text:
        return Response(status_code=400, content="Empty input")

    try:
        load_pipeline()
        started = time.perf_counter()
        sentences = split_into_sentences(text) or [text]
        parts: list[np.ndarray] = []

        for i, sentence in enumerate(sentences):
            safe = re.sub(r"[^\w\säöüßÄÖÜ.,:;!?\"'\-]", " ", sentence).strip()
            if not safe:
                continue
            samples = synthesize_sentence(safe, speed)
            if samples.size:
                parts.append(samples)
            if req_pause > 0 and i < len(sentences) - 1:
                parts.append(np.zeros(int(SAMPLE_RATE * req_pause), dtype=np.float32))

        if not parts:
            return Response(status_code=500, content="No audio generated")

        final_audio = np.concatenate(parts)
        elapsed = time.perf_counter() - started
        print(
            f"Victoria fertig in {elapsed:.3f}s, samples={len(final_audio)}, voice={voice}",
            flush=True,
        )
        return Response(content=wav_bytes(final_audio), media_type="audio/wav")
    except Exception as err:
        print(f"Victoria Fehler: {err!r}", flush=True)
        return Response(status_code=500, content=str(err))
