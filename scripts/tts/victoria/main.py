"""
OpenAI-compatible FastAPI multi-voice German TTS (PyTorch / Kikiri).

Voices:
  - martin   — Kikiri Stage-2 (primary male)
  - bernd    — Kikiri base + dm_bernd voicepack (second male)
  - victoria — Kikiri Stage-2 (primary female)
  - eva      — Kikiri base + df_eva voicepack (second female)

German G2P matches kokoro-onnx: phonemizer + espeak-ng lang=de, filtered to model vocab,
then KModel.forward with voice_pack[len(ps)-1].
"""

from __future__ import annotations

import io
import os
import re
import threading
import time
import wave
from pathlib import Path

import numpy as np
import torch
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response

SAMPLE_RATE = 24000
DEFAULT_SPEED = float(os.getenv("KOKORO_MULTI_SPEED", "1.0"))
PAUSE_DURATION = float(os.getenv("KOKORO_PAUSE_DURATION", "0.25"))
MODEL_DIR = Path(os.getenv("KOKORO_VICTORIA_MODEL_DIR", "/app/models"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAX_PHONEME_LEN = 500
NOISE_ZCR_THRESHOLD = 0.35

STAGE2_VOICES = {"martin", "victoria"}
BASE_VOICES = {"bernd", "eva"}
ALL_VOICES = ["bernd", "eva", "martin", "victoria"]

app = FastAPI()
synth_lock = threading.Lock()

models: dict[str, object] = {}  # backbone key -> KModel
voice_tensors: dict[str, torch.Tensor] = {}
voice_backbone: dict[str, str] = {}  # voice id -> backbone key
phonemizer_backend = None


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


def zero_crossing_rate(samples: np.ndarray) -> float:
    if samples.size < 2:
        return 0.0
    signs = np.signbit(samples)
    return float(np.mean(signs[1:] != signs[:-1]))


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


def normalize_text(text: str) -> str:
    cleaned = text.replace("\n", " ").strip()
    cleaned = re.sub(r"[«‹»›""„]", '"', cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


SYSTEM_ESPEAK_DATA = Path("/usr/share/espeak-ng-data")
SYSTEM_ESPEAK_LIB_CANDIDATES = (
    "/usr/lib/aarch64-linux-gnu/libespeak-ng.so.1",
    "/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1",
    "/usr/lib/libespeak-ng.so.1",
)


def patch_espeak_wrapper() -> None:
    """
    phonemizer 3.3+ / misaki / espeakng_loader fight over EspeakWrapper paths.
    Pin the system espeak-ng library + data so German G2P stays valid.
    """
    from phonemizer.backend.espeak.wrapper import EspeakWrapper

    system_data = str(SYSTEM_ESPEAK_DATA)
    for lib in SYSTEM_ESPEAK_LIB_CANDIDATES:
        if Path(lib).is_file():
            try:
                EspeakWrapper.set_library(lib)
            except Exception as err:
                print(f"  warn: set_library({lib}) failed: {err!r}", flush=True)
            break

    @classmethod
    def set_data_path(cls, path: str) -> None:
        if (SYSTEM_ESPEAK_DATA / "phontab").is_file():
            cls.data_path = system_data
            return
        cls.data_path = path

    EspeakWrapper.set_data_path = set_data_path  # type: ignore[method-assign]
    if (SYSTEM_ESPEAK_DATA / "phontab").is_file():
        EspeakWrapper.data_path = system_data


def remap_weight_norm_keys(state_dict: dict) -> dict:
    """
    Kikiri checkpoints are saved with modern torch parametrizations weight_norm
    (*.parametrizations.weight.original0/1). kokoro 0.9.4 expects legacy weight_g/weight_v.
    Also strip a leading ``module.`` prefix from DataParallel saves.
    """
    remapped: dict = {}
    for key, value in state_dict.items():
        new_key = key[7:] if key.startswith("module.") else key
        new_key = new_key.replace(".parametrizations.weight.original0", ".weight_g")
        new_key = new_key.replace(".parametrizations.weight.original1", ".weight_v")
        remapped[new_key] = value
    return remapped


def prepare_kokoro_checkpoint(model_path: Path) -> Path:
    """Rewrite checkpoint keys so KModel.load_state_dict can consume them."""
    import tempfile

    ckpt = torch.load(str(model_path), map_location="cpu", weights_only=True)
    if not isinstance(ckpt, dict):
        raise ValueError(f"Unexpected checkpoint type in {model_path}: {type(ckpt)}")

    remapped = {
        module_name: remap_weight_norm_keys(state_dict)
        for module_name, state_dict in ckpt.items()
    }
    tmp = tempfile.NamedTemporaryFile(prefix=f"{model_path.stem}-remapped-", suffix=".pth", delete=False)
    tmp_path = Path(tmp.name)
    tmp.close()
    torch.save(remapped, tmp_path)
    return tmp_path


def load_kmodel(model_path: Path, config_path: Path):
    patch_espeak_wrapper()
    from kokoro import KModel
    # misaki may have pointed EspeakWrapper at a broken espeakng_loader path
    patch_espeak_wrapper()

    remapped_path = prepare_kokoro_checkpoint(model_path)
    try:
        model = KModel(
            repo_id="hexgrad/Kokoro-82M",
            config=str(config_path) if config_path.is_file() else None,
            model=str(remapped_path),
        ).to(DEVICE).eval()
    finally:
        try:
            remapped_path.unlink(missing_ok=True)
        except OSError:
            pass
    return model


def load_voice_tensor(path: Path) -> torch.Tensor:
    tensor = torch.load(str(path), map_location="cpu")
    if isinstance(tensor, dict):
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


def init_phonemizer() -> None:
    global phonemizer_backend
    patch_espeak_wrapper()
    from phonemizer.backend import EspeakBackend

    phonemizer_backend = EspeakBackend(
        language="de",
        preserve_punctuation=True,
        with_stress=True,
        language_switch="remove-flags",
    )
    print("  phonemizer EspeakBackend(language=de) ready", flush=True)


def phonemize_german(text: str, vocab: dict) -> str:
    """Match kokoro-onnx Tokenizer.phonemize(lang='de'): espeak IPA filtered to vocab."""
    assert phonemizer_backend is not None
    raw = phonemizer_backend.phonemize([text], strip=True)[0]
    filtered = "".join(ch for ch in raw if ch in vocab)
    return filtered.strip()


def chunk_phonemes(ps: str, max_len: int = MAX_PHONEME_LEN) -> list[str]:
    if len(ps) <= max_len:
        return [ps] if ps else []
    chunks: list[str] = []
    start = 0
    while start < len(ps):
        end = min(start + max_len, len(ps))
        if end < len(ps):
            # Prefer split on space within the window
            space = ps.rfind(" ", start, end)
            if space > start + max_len // 2:
                end = space
        piece = ps[start:end].strip()
        if piece:
            chunks.append(piece)
        start = end if end > start else start + max_len
    return chunks


def synthesize_phonemes(model, voice_pack: torch.Tensor, phonemes: str, speed: float) -> np.ndarray:
    if not phonemes:
        return np.zeros(0, dtype=np.float32)

    # Kokoro indexes style by phoneme-string length (same as KPipeline.infer).
    idx = min(max(len(phonemes) - 1, 0), voice_pack.shape[0] - 1)
    ref_s = voice_pack[idx]
    with torch.no_grad():
        audio = model(phonemes, ref_s, speed)
    if torch.is_tensor(audio):
        return audio.detach().cpu().float().numpy().reshape(-1)
    if hasattr(audio, "audio"):
        tensor = audio.audio
        return tensor.detach().cpu().float().numpy().reshape(-1)
    return np.asarray(audio, dtype=np.float32).reshape(-1)


def synthesize_sentence(text: str, voice: str, speed: float) -> np.ndarray:
    backbone = voice_backbone.get(voice)
    model = models.get(backbone) if backbone else None
    voice_pack = voice_tensors.get(voice)
    if model is None or voice_pack is None:
        raise RuntimeError(f"Voice not available: {voice}")

    vocab = model.vocab
    phonemes = phonemize_german(text, vocab)
    if not phonemes:
        raise RuntimeError(f"Phonemizer produced empty output for: {text[:80]!r}")

    parts: list[np.ndarray] = []
    for chunk in chunk_phonemes(phonemes):
        samples = synthesize_phonemes(model, voice_pack, chunk, speed)
        if samples.size:
            parts.append(samples)
    if not parts:
        return np.zeros(0, dtype=np.float32)
    return np.concatenate(parts)


def load_models() -> None:
    global models, voice_tensors, voice_backbone
    if models and voice_tensors:
        return

    config_path = MODEL_DIR / "config.json"
    started = time.perf_counter()
    print(f"Loading four-voice German TTS on {DEVICE}…", flush=True)
    print(f"  model dir: {MODEL_DIR} exists={MODEL_DIR.is_dir()}", flush=True)

    # Load KModel first (imports kokoro/misaki which touch EspeakWrapper), then phonemizer.
    stage2_specs = [
        ("martin", MODEL_DIR / "kikiri_german_martin_ep10.pth", MODEL_DIR / "voices" / "martin.pt"),
        ("victoria", MODEL_DIR / "kikiri_german_victoria_ep10.pth", MODEL_DIR / "voices" / "victoria.pt"),
    ]
    for voice_id, model_path, voice_path in stage2_specs:
        if model_path.is_file() and voice_path.is_file():
            key = f"stage2:{voice_id}"
            models[key] = load_kmodel(model_path, config_path)
            voice_tensors[voice_id] = load_voice_tensor(voice_path)
            voice_backbone[voice_id] = key
            print(f"  loaded {voice_id} (Stage-2)", flush=True)
        else:
            print(f"  WARNING: {voice_id} Stage-2 missing ({model_path.name})", flush=True)

    base_model = MODEL_DIR / "kikiri_german_base_51spk_ep4.pth"
    if base_model.is_file():
        models["base"] = load_kmodel(base_model, config_path)
        for voice_id, voice_path in [
            ("bernd", MODEL_DIR / "voices" / "bernd.pt"),
            ("eva", MODEL_DIR / "voices" / "eva.pt"),
        ]:
            if voice_path.is_file():
                voice_tensors[voice_id] = load_voice_tensor(voice_path)
                voice_backbone[voice_id] = "base"
                print(f"  loaded {voice_id} (base + voicepack)", flush=True)
    else:
        print(f"  WARNING: multi-speaker base missing ({base_model})", flush=True)

    init_phonemizer()

    if not voice_tensors:
        raise RuntimeError(
            "No voices loaded. Run: bash scripts/tts/victoria/download-models.sh "
            f"(expected models under {MODEL_DIR})",
        )

    # Startup quality gate on martin (or first available voice)
    probe_voice = "martin" if "martin" in voice_tensors else next(iter(voice_tensors))
    probe = synthesize_sentence("Guten Tag.", probe_voice, 1.0)
    zcr = zero_crossing_rate(probe)
    print(f"  probe voice={probe_voice} samples={probe.size} zcr={zcr:.3f}", flush=True)
    if probe.size < 1000 or zcr > NOISE_ZCR_THRESHOLD:
        raise RuntimeError(
            f"Startup probe sounds like noise (zcr={zcr:.3f}). "
            "Check German phonemizer / model assets.",
        )

    print(
        f"Four-voice ready in {time.perf_counter() - started:.3f}s: "
        f"{sorted(voice_tensors.keys())}",
        flush=True,
    )


def resolve_voice(voice: str) -> str:
    voice = voice.lower()
    aliases = {
        "female": "victoria",
        "df_victoria": "victoria",
        "dm_martin": "martin",
        "dm_bernd": "bernd",
        "df_eva": "eva",
        "male": "martin",
    }
    voice = aliases.get(voice, voice)
    if voice in voice_tensors:
        return voice
    if voice in STAGE2_VOICES and "martin" in voice_tensors:
        return "martin"
    if voice in BASE_VOICES and "bernd" in voice_tensors:
        return "bernd"
    return next(iter(voice_tensors.keys()))


@app.on_event("startup")
async def startup() -> None:
    load_models()


@app.get("/v1/audio/voices")
async def list_voices():
    return {"voices": sorted(voice_tensors.keys()) or ALL_VOICES}


@app.get("/health")
async def health():
    ok = bool(voice_tensors) and bool(models)
    return {"ok": ok, "voices": sorted(voice_tensors.keys())}


@app.post("/v1/audio/speech")
async def generate_speech(request: Request):
    data = await request.json()
    raw_text = str(data.get("input") or "")
    text = normalize_text(raw_text)
    voice = resolve_voice(str(data.get("voice") or "martin"))
    speed = float(data.get("speed") or DEFAULT_SPEED)
    req_pause = float(data.get("pause_duration", PAUSE_DURATION))

    if not text:
        return Response(status_code=400, content="Empty input")

    try:
        load_models()
        started = time.perf_counter()
        sentences = split_into_sentences(text) or [text]
        parts: list[np.ndarray] = []

        with synth_lock:
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
        zcr = zero_crossing_rate(final_audio)
        elapsed = time.perf_counter() - started
        print(
            f"TTS fertig in {elapsed:.3f}s voice={voice} samples={len(final_audio)} zcr={zcr:.3f}",
            flush=True,
        )
        if zcr > NOISE_ZCR_THRESHOLD:
            return JSONResponse(
                status_code=500,
                content={"error": f"Synthesized audio looks like noise (zcr={zcr:.3f})"},
            )
        return Response(content=wav_bytes(final_audio), media_type="audio/wav")
    except Exception as err:
        print(f"TTS Fehler: {err!r}", flush=True)
        return Response(status_code=500, content=str(err))
