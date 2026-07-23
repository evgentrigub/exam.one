"""
OpenAI-compatible FastAPI multi-voice German TTS sidecar.

Serves:
  - victoria — Kikiri Stage-2 Victoria (primary female)
  - bernd    — Hui/kikiri base + dm_bernd voicepack (second male)
  - eva      — Hui/kikiri base + df_eva voicepack (second female)

Martin (primary male) stays on the ONNX service (:8881).
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
DEFAULT_LANG = os.getenv("KOKORO_MULTI_LANG", "de")
DEFAULT_SPEED = float(os.getenv("KOKORO_MULTI_SPEED", "1.0"))
PAUSE_DURATION = float(os.getenv("KOKORO_PAUSE_DURATION", "0.25"))
MODEL_DIR = Path(os.getenv("KOKORO_VICTORIA_MODEL_DIR", "/app/models"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Voice id → which backbone to use
STAGE2_VOICES = {"victoria"}
BASE_VOICES = {"bernd", "eva"}
ALL_VOICES = sorted(STAGE2_VOICES | BASE_VOICES)

app = FastAPI()
stage2_pipeline = None
base_pipeline = None
voice_tensors: dict[str, torch.Tensor] = {}


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


def enable_german_lang_code() -> str:
    """
    Stock kokoro 0.9.x has no German lang_code. Register 'd'/'de' so KPipeline
    falls through to EspeakG2P(language='de') — espeak-ng is installed in the image.
    """
    from kokoro.pipeline import ALIASES, LANG_CODES

    LANG_CODES['d'] = 'de'
    ALIASES['de'] = 'd'
    ALIASES['de-de'] = 'd'
    return 'd'


def load_kmodel(model_path: Path, config_path: Path):
    from kokoro import KModel

    return KModel(
        repo_id="hexgrad/Kokoro-82M",
        config=str(config_path) if config_path.is_file() else None,
        model=str(model_path),
    ).to(DEVICE).eval()


def load_voice_tensor(path: Path) -> torch.Tensor:
    tensor = torch.load(str(path), map_location="cpu")
    if isinstance(tensor, dict):
        # Some packs wrap the style tensor
        for key in ("voice", "style", "emb", "tensor"):
            if key in tensor and torch.is_tensor(tensor[key]):
                return tensor[key]
        for value in tensor.values():
            if torch.is_tensor(value):
                return value
        raise ValueError(f"No tensor found in voice pack {path}")
    if not torch.is_tensor(tensor):
        raise ValueError(f"Unexpected voice pack type in {path}: {type(tensor)}")
    return tensor


def load_pipelines() -> None:
    global stage2_pipeline, base_pipeline, voice_tensors
    if stage2_pipeline is not None or base_pipeline is not None:
        return

    from kokoro import KPipeline

    lang_code = enable_german_lang_code()
    config_path = MODEL_DIR / "config.json"
    started = time.perf_counter()
    print(f"Loading multi-voice German TTS on {DEVICE}…", flush=True)
    print(f"  model dir: {MODEL_DIR} exists={MODEL_DIR.is_dir()}", flush=True)

    victoria_model = MODEL_DIR / "kikiri_german_victoria_ep10.pth"
    victoria_voice = MODEL_DIR / "voices" / "victoria.pt"
    if victoria_model.is_file() and victoria_voice.is_file():
        kmodel = load_kmodel(victoria_model, config_path)
        stage2_pipeline = KPipeline(lang_code=lang_code, model=kmodel, repo_id="hexgrad/Kokoro-82M")
        voice_tensors["victoria"] = load_voice_tensor(victoria_voice)
        print("  loaded victoria (Stage-2)", flush=True)
    else:
        print(f"  WARNING: Victoria Stage-2 missing ({victoria_model})", flush=True)

    base_model = MODEL_DIR / "kikiri_german_base_51spk_ep4.pth"
    bernd_voice = MODEL_DIR / "voices" / "bernd.pt"
    eva_voice = MODEL_DIR / "voices" / "eva.pt"
    if base_model.is_file():
        kmodel = load_kmodel(base_model, config_path)
        base_pipeline = KPipeline(lang_code=lang_code, model=kmodel, repo_id="hexgrad/Kokoro-82M")
        if bernd_voice.is_file():
            voice_tensors["bernd"] = load_voice_tensor(bernd_voice)
            print("  loaded bernd (base + voicepack)", flush=True)
        if eva_voice.is_file():
            voice_tensors["eva"] = load_voice_tensor(eva_voice)
            print("  loaded eva (base + voicepack)", flush=True)
    else:
        print(f"  WARNING: multi-speaker base missing ({base_model})", flush=True)

    if not voice_tensors:
        raise RuntimeError(
            "No voices loaded. Run: bash scripts/tts/victoria/download-models.sh "
            f"(expected models under {MODEL_DIR})",
        )

    print(
        f"Multi-voice ready in {time.perf_counter() - started:.3f}s: "
        f"{sorted(voice_tensors.keys())}",
        flush=True,
    )


def pipeline_for(voice: str):
    if voice in STAGE2_VOICES:
        return stage2_pipeline
    return base_pipeline


def extract_audio_samples(result) -> np.ndarray:
    """Normalize a KPipeline yield (graphemes, phonemes, audio) into a float32 mono vector."""
    audio = result
    if isinstance(result, (tuple, list)) and len(result) >= 3:
        audio = result[2]
    elif hasattr(result, 'audio'):
        audio = result.audio

    if audio is None:
        return np.zeros(0, dtype=np.float32)
    if torch.is_tensor(audio):
        return audio.detach().cpu().float().numpy().reshape(-1)
    return np.asarray(audio, dtype=np.float32).reshape(-1)


def synthesize_sentence(text: str, voice: str, speed: float) -> np.ndarray:
    pipe = pipeline_for(voice)
    voice_tensor = voice_tensors.get(voice)
    if pipe is None or voice_tensor is None:
        raise RuntimeError(f"Voice not available: {voice}")

    chunks: list[np.ndarray] = []
    for result in pipe(text, voice=voice_tensor, speed=speed):
        arr = extract_audio_samples(result)
        if arr.size:
            chunks.append(arr)
    if not chunks:
        return np.zeros(0, dtype=np.float32)
    return np.concatenate(chunks)


@app.on_event("startup")
async def startup() -> None:
    load_pipelines()


@app.get("/v1/audio/voices")
async def list_voices():
    return {"voices": sorted(voice_tensors.keys()) or ALL_VOICES}


@app.get("/health")
async def health():
    return {"ok": bool(voice_tensors), "voices": sorted(voice_tensors.keys())}


@app.post("/v1/audio/speech")
async def generate_speech(request: Request):
    data = await request.json()
    raw_text = str(data.get("input") or "")
    text = normalize_simple(raw_text)
    voice = str(data.get("voice") or "victoria").lower()
    speed = float(data.get("speed") or DEFAULT_SPEED)
    req_pause = float(data.get("pause_duration", PAUSE_DURATION))

    # Aliases
    if voice in {"female", "df_victoria"}:
        voice = "victoria"
    elif voice in {"dm_bernd"}:
        voice = "bernd"
    elif voice in {"df_eva"}:
        voice = "eva"

    if voice not in voice_tensors:
        # Prefer same-gender fallback inside this service
        if voice in {"martin"} and "bernd" in voice_tensors:
            voice = "bernd"
        elif "victoria" in voice_tensors:
            voice = "victoria"
        else:
            voice = next(iter(voice_tensors.keys()))

    if not text:
        return Response(status_code=400, content="Empty input")

    try:
        load_pipelines()
        started = time.perf_counter()
        sentences = split_into_sentences(text) or [text]
        parts: list[np.ndarray] = []

        for i, sentence in enumerate(sentences):
            safe = re.sub(r"[^\w\säöüßÄÖÜ.,:;!?\"'\-]", " ", sentence).strip()
            if not safe:
                continue
            samples = synthesize_sentence(safe, voice, speed)
            if samples.size:
                parts.append(samples)
            if req_pause > 0 and i < len(sentences) - 1:
                parts.append(np.zeros(int(SAMPLE_RATE * req_pause), dtype=np.float32))

        if not parts:
            return Response(status_code=500, content="No audio generated")

        final_audio = np.concatenate(parts)
        elapsed = time.perf_counter() - started
        print(
            f"Multi-voice fertig in {elapsed:.3f}s, samples={len(final_audio)}, voice={voice}",
            flush=True,
        )
        return Response(content=wav_bytes(final_audio), media_type="audio/wav")
    except Exception as err:
        print(f"Multi-voice Fehler: {err!r}", flush=True)
        return Response(status_code=500, content=str(err))
