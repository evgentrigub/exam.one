"""
OpenAI-compatible FastAPI multi-voice TTS: German and British English on PyTorch Kokoro,
Polish on Piper (ONNX).

German voices (KOKORO_LANGS contains "de", the default):
  - martin   — Kikiri Stage-2 (primary male)
  - bernd    — Kikiri base + dm_bernd voicepack (second male)
  - victoria — Kikiri Stage-2 (primary female)
  - eva      — Kikiri base + df_eva voicepack (second female)

British English voices (KOKORO_LANGS contains "en"): bf_emma, bf_isabella (female) and
bm_george, bm_fable (male), all on one base Kokoro-82M v1.0 model.

German G2P matches kokoro-onnx: phonemizer + espeak-ng lang=de, filtered to model vocab,
then KModel.forward with voice_pack[len(ps)-1]. English G2P is misaki's British G2P (as
kokoro's KPipeline(lang_code="b") builds it), then the same forward pass.

Polish voices (KOKORO_LANGS contains "pl"): pl_gosia (female), pl_darkman and pl_bass
(male), Piper VITS voices with Piper's bundled espeak-ng. Kokoro has no Polish. Piper speaks
at 22.05 kHz; its audio is resampled to the service's 24 kHz so every WAV matches.

A request names a voice and, optionally, a language. An unknown voice, or a voice of
another language, is refused with 400 rather than spoken by the wrong voice.
"""

from __future__ import annotations

import io
import os
import re
import threading
import time
import wave
from dataclasses import dataclass
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

ALL_VOICES = ["bernd", "eva", "martin", "victoria"]
KOKORO_LANGS = {
    lang.strip().lower() for lang in os.getenv("KOKORO_LANGS", "de").split(",") if lang.strip()
}


@dataclass(frozen=True)
class VoiceSpec:
    lang: str
    backbone: str
    model_file: str
    voice_file: str
    engine: str = "kokoro"


# Load order matters for German: Stage-2 martin, Stage-2 victoria, then the shared base.
VOICE_SPECS: dict[str, VoiceSpec] = {
    "martin": VoiceSpec("de", "stage2:martin", "kikiri_german_martin_ep10.pth", "voices/martin.pt"),
    "victoria": VoiceSpec("de", "stage2:victoria", "kikiri_german_victoria_ep10.pth", "voices/victoria.pt"),
    "bernd": VoiceSpec("de", "base", "kikiri_german_base_51spk_ep4.pth", "voices/bernd.pt"),
    "eva": VoiceSpec("de", "base", "kikiri_german_base_51spk_ep4.pth", "voices/eva.pt"),
    "bf_emma": VoiceSpec("en", "en", "kokoro-v1_0.pth", "voices/bf_emma.pt"),
    "bf_isabella": VoiceSpec("en", "en", "kokoro-v1_0.pth", "voices/bf_isabella.pt"),
    "bm_george": VoiceSpec("en", "en", "kokoro-v1_0.pth", "voices/bm_george.pt"),
    "bm_fable": VoiceSpec("en", "en", "kokoro-v1_0.pth", "voices/bm_fable.pt"),
    # Piper: model_file is the ONNX voice, voice_file its JSON config.
    "pl_gosia": VoiceSpec(
        "pl", "piper", "piper/pl_PL-gosia-medium.onnx", "piper/pl_PL-gosia-medium.onnx.json", "piper"
    ),
    "pl_darkman": VoiceSpec(
        "pl", "piper", "piper/pl_PL-darkman-medium.onnx", "piper/pl_PL-darkman-medium.onnx.json", "piper"
    ),
    "pl_bass": VoiceSpec(
        "pl", "piper", "piper/pl_PL-bass-high.onnx", "piper/pl_PL-bass-high.onnx.json", "piper"
    ),
}
GERMAN_ALIASES = {
    "female": "victoria",
    "df_victoria": "victoria",
    "dm_martin": "martin",
    "dm_bernd": "bernd",
    "df_eva": "eva",
    "male": "martin",
}
PROBES = {"de": "Guten Tag.", "en": "Hello, how are you?", "pl": "Dzień dobry, jak się masz?"}

app = FastAPI()
synth_lock = threading.Lock()

models: dict[str, object] = {}  # backbone key -> KModel
voice_tensors: dict[str, torch.Tensor] = {}
voice_backbone: dict[str, str] = {}  # voice id -> backbone key
piper_voices: dict[str, object] = {}  # voice id -> PiperVoice
models_loaded = False
phonemizer_backend = None
english_g2p = None


class VoiceError(ValueError):
    """A request for a voice this server does not serve in the requested language."""


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


def load_kmodel(model_path: Path, config_path: Path, remap: bool = True):
    patch_espeak_wrapper()
    from kokoro import KModel
    # misaki may have pointed EspeakWrapper at a broken espeakng_loader path
    patch_espeak_wrapper()

    if not remap:
        # The base Kokoro checkpoint already has the key layout KModel expects.
        return KModel(
            repo_id="hexgrad/Kokoro-82M",
            config=str(config_path) if config_path.is_file() else None,
            model=str(model_path),
        ).to(DEVICE).eval()

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


def init_english_g2p() -> None:
    """misaki's British G2P with the espeak fallback, exactly as KPipeline(lang_code="b")."""
    global english_g2p
    patch_espeak_wrapper()
    from kokoro import KPipeline

    english_g2p = KPipeline(lang_code="b", repo_id="hexgrad/Kokoro-82M", model=False).g2p
    patch_espeak_wrapper()
    print("  misaki G2P (British English) ready", flush=True)


def phonemize_english(text: str, vocab: dict) -> str:
    assert english_g2p is not None
    phonemes, _tokens = english_g2p(text)
    return "".join(ch for ch in (phonemes or "") if ch in vocab).strip()


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


def loaded_voices() -> list[str]:
    return sorted([*voice_tensors.keys(), *piper_voices.keys()])


def resample_to_output(samples: np.ndarray, rate: int) -> np.ndarray:
    if rate == SAMPLE_RATE or not samples.size:
        return samples
    import soxr

    return soxr.resample(samples, rate, SAMPLE_RATE, "HQ").astype(np.float32)


def synthesize_piper(text: str, voice: str, speed: float) -> np.ndarray:
    from piper import SynthesisConfig

    piper_voice = piper_voices.get(voice)
    if piper_voice is None:
        raise RuntimeError(f"Voice not available: {voice}")
    config = SynthesisConfig(length_scale=1.0 / max(speed, 0.1))
    chunks = [chunk.audio_int16_array for chunk in piper_voice.synthesize(text, syn_config=config)]
    if not chunks:
        return np.zeros(0, dtype=np.float32)
    samples = np.concatenate(chunks).astype(np.float32) / 32768.0
    return resample_to_output(samples, piper_voice.config.sample_rate)


def load_piper_voices() -> None:
    for voice_id, spec in VOICE_SPECS.items():
        if spec.engine != "piper" or spec.lang not in KOKORO_LANGS:
            continue
        model_path = MODEL_DIR / spec.model_file
        config_path = MODEL_DIR / spec.voice_file
        if not model_path.is_file() or not config_path.is_file():
            print(f"  WARNING: {voice_id} ({spec.lang}) missing ({model_path.name} / {config_path.name})", flush=True)
            continue
        try:
            from piper import PiperVoice

            piper_voices[voice_id] = PiperVoice.load(model_path, config_path=config_path)
        except Exception as err:  # Polish stays unavailable; the Kokoro voices keep working.
            print(f"  WARNING: Piper voice {voice_id} failed to load ({err!r})", flush=True)
            continue
        print(f"  loaded {voice_id} ({spec.lang}, piper)", flush=True)


def synthesize_sentence(text: str, voice: str, speed: float) -> np.ndarray:
    if voice in piper_voices:
        return synthesize_piper(text, voice, speed)
    backbone = voice_backbone.get(voice)
    model = models.get(backbone) if backbone else None
    voice_pack = voice_tensors.get(voice)
    if model is None or voice_pack is None:
        raise RuntimeError(f"Voice not available: {voice}")

    vocab = model.vocab
    lang = VOICE_SPECS[voice].lang if voice in VOICE_SPECS else "de"
    phonemes = phonemize_english(text, vocab) if lang == "en" else phonemize_german(text, vocab)
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
    global models, voice_tensors, voice_backbone, models_loaded
    if models_loaded:
        return

    config_path = MODEL_DIR / "config.json"
    started = time.perf_counter()
    print(f"Loading Kokoro TTS for {sorted(KOKORO_LANGS)} on {DEVICE}…", flush=True)
    print(f"  model dir: {MODEL_DIR} exists={MODEL_DIR.is_dir()}", flush=True)

    # Load KModels first (imports kokoro/misaki which touch EspeakWrapper), then phonemizers.
    # One backbone per model file, shared by every voice on it.
    for voice_id, spec in VOICE_SPECS.items():
        if spec.engine != "kokoro" or spec.lang not in KOKORO_LANGS:
            continue
        model_path = MODEL_DIR / spec.model_file
        voice_path = MODEL_DIR / spec.voice_file
        if not model_path.is_file() or not voice_path.is_file():
            print(f"  WARNING: {voice_id} ({spec.lang}) missing ({model_path.name} / {voice_path.name})", flush=True)
            continue
        if spec.backbone not in models:
            models[spec.backbone] = load_kmodel(model_path, config_path, remap=spec.lang == "de")
        voice_tensors[voice_id] = load_voice_tensor(voice_path)
        voice_backbone[voice_id] = spec.backbone
        print(f"  loaded {voice_id} ({spec.lang}, {spec.backbone})", flush=True)

    if any(VOICE_SPECS[v].lang == "de" for v in voice_tensors):
        init_phonemizer()
    english_voices = [v for v in voice_tensors if VOICE_SPECS[v].lang == "en"]
    if english_voices:
        try:
            init_english_g2p()
        except Exception as err:  # English stays unavailable; German keeps working.
            print(f"  WARNING: English G2P unavailable ({err!r}); dropping {english_voices}", flush=True)
            for voice_id in english_voices:
                voice_tensors.pop(voice_id, None)
                voice_backbone.pop(voice_id, None)
            models.pop("en", None)
    load_piper_voices()

    if not loaded_voices():
        raise RuntimeError(
            "No voices loaded. Run: bash scripts/tts/victoria/download-models.sh "
            f"(expected models under {MODEL_DIR})",
        )

    # Startup quality gate per language, on martin for German (or the first voice).
    for lang, voices in languages().items():
        probe_voice = "martin" if "martin" in voices else voices[0]
        probe = synthesize_sentence(PROBES.get(lang, "Hello."), probe_voice, 1.0)
        zcr = zero_crossing_rate(probe)
        print(f"  probe lang={lang} voice={probe_voice} samples={probe.size} zcr={zcr:.3f}", flush=True)
        if probe.size < 1000 or zcr > NOISE_ZCR_THRESHOLD:
            raise RuntimeError(
                f"Startup probe for {lang} sounds like noise (zcr={zcr:.3f}). "
                "Check the phonemizer / model assets.",
            )

    models_loaded = True
    print(
        f"TTS ready in {time.perf_counter() - started:.3f}s: {loaded_voices()}",
        flush=True,
    )


def languages() -> dict[str, list[str]]:
    """Loaded voices per language, in registry order."""
    result: dict[str, list[str]] = {}
    loaded = set(loaded_voices())
    for voice_id, spec in VOICE_SPECS.items():
        if voice_id in loaded:
            result.setdefault(spec.lang, []).append(voice_id)
    return result


def resolve_voice(voice: str, lang: str | None) -> str:
    """The loaded voice for a request; German aliases still resolve. Never another language."""
    voice = GERMAN_ALIASES.get(voice.lower(), voice.lower())
    if voice not in voice_tensors and voice not in piper_voices:
        raise VoiceError(f"Unknown or unavailable voice: {voice}")
    wanted = (lang or "").split("-")[0].lower()
    if wanted and VOICE_SPECS[voice].lang != wanted:
        raise VoiceError(f"Voice {voice} does not speak {lang}")
    return voice


def clean_sentence(sentence: str, lang: str) -> str:
    """Drop characters the G2P cannot read. German keeps its original rule unchanged."""
    if lang == "pl":
        # Piper reads digits and punctuation itself; \w keeps ą ć ę ł ń ó ś ź ż.
        return re.sub(r"[^\w\s.,:;!?\"'\-%/]", " ", sentence).strip()
    if lang != "en":
        return re.sub(r"[^\w\säöüßÄÖÜ.,:;!?\"'\-]", " ", sentence).strip()
    sentence = re.sub(r"[‘’ʼ`´]", "'", sentence)
    sentence = re.sub(r"[“”]", '"', sentence)
    return re.sub(r"[^\w\s.,:;!?\"'\-£$€%&/]", " ", sentence).strip()


@app.on_event("startup")
async def startup() -> None:
    load_models()


@app.get("/v1/audio/voices")
async def list_voices():
    return {"voices": loaded_voices() or ALL_VOICES, "languages": languages()}


@app.get("/health")
async def health():
    ok = models_loaded and bool(loaded_voices())
    return {"ok": ok, "voices": loaded_voices(), "languages": languages()}


@app.post("/v1/audio/speech")
async def generate_speech(request: Request):
    data = await request.json()
    raw_text = str(data.get("input") or "")
    text = normalize_text(raw_text)
    try:
        load_models()
        voice = resolve_voice(str(data.get("voice") or "martin"), data.get("lang"))
    except VoiceError as err:
        return Response(status_code=400, content=str(err))
    lang = VOICE_SPECS[voice].lang
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
                safe = clean_sentence(sentence, lang)
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
            f"TTS fertig in {elapsed:.3f}s voice={voice} lang={lang} samples={len(final_audio)} zcr={zcr:.3f}",
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
