"""
OpenAI-compatible FastAPI multi-voice TTS: German, British English and Spanish on PyTorch
Kokoro, Polish on Piper (ONNX).

German voices:
  - martin   — Kikiri Stage-2 (primary male)
  - bernd    — Kikiri base + dm_bernd voicepack (second male)
  - victoria — Kikiri Stage-2 (primary female)
  - eva      — Kikiri base + df_eva voicepack (second female)

British English voices: bf_emma, bf_isabella (female) and
bm_george, bm_fable (male), all on one base Kokoro-82M v1.0 model.

Spanish voices: ef_dora (female), em_alex and em_santa (male),
on the same base v1.0 model as English, which is loaded once for both.

German G2P matches kokoro-onnx: phonemizer + espeak-ng lang=de, filtered to model vocab,
then KModel.forward with voice_pack[len(ps)-1]. English G2P is misaki's British G2P (as
kokoro's KPipeline(lang_code="b") builds it), then the same forward pass. Spanish G2P is
misaki's espeak-ng "es" G2P, as KPipeline(lang_code="e") builds it.

Polish voices: pl_gosia (female), pl_darkman and pl_bass
(male), Piper VITS voices with Piper's bundled espeak-ng. Kokoro has no Polish. Piper speaks
at 22.05 kHz; its audio is resampled to the service's 24 kHz so every WAV matches.

Voices are listed in voice-manifest.json. Every voice whose files are on disk under the model
directory is loaded at startup, whatever KOKORO_LANGS says (that variable only chooses what the
setup script downloads). /v1/models/voices installs and removes voices at runtime, loading
or unloading them without a restart; Settings → Generated files → Voice models drives it.

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

from voice_catalog import CatalogError, VoiceCatalog, load_manifest

SAMPLE_RATE = 24000
DEFAULT_SPEED = float(os.getenv("KOKORO_MULTI_SPEED", "1.0"))
PAUSE_DURATION = float(os.getenv("KOKORO_PAUSE_DURATION", "0.25"))
MODEL_DIR = Path(os.getenv("KOKORO_VICTORIA_MODEL_DIR", "/app/models"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAX_PHONEME_LEN = 500
NOISE_ZCR_THRESHOLD = 0.35



@dataclass(frozen=True)
class VoiceSpec:
    lang: str
    backbone: str
    model_file: str
    voice_file: str
    engine: str = "kokoro"


MANIFEST = load_manifest()
# Registry order from the manifest; German load order: Stage-2 martin, Stage-2 victoria, base.
VOICE_SPECS: dict[str, VoiceSpec] = {
    voice.id: VoiceSpec(
        voice.lang,
        voice.backbone,
        MANIFEST.files[voice.model].path,
        MANIFEST.files[voice.voice].path,
        voice.engine,
    )
    for voice in MANIFEST.voices.values()
}
GERMAN_ALIASES = {
    "female": "victoria",
    "df_victoria": "victoria",
    "dm_martin": "martin",
    "dm_bernd": "bernd",
    "df_eva": "eva",
    "male": "martin",
}
PROBES = {
    "de": "Guten Tag.",
    "en": "Hello, how are you?",
    "es": "Buenos días, ¿qué tal?",
    "pl": "Dzień dobry, jak się masz?",
}

app = FastAPI()
synth_lock = threading.Lock()

models: dict[str, object] = {}  # backbone key -> KModel
voice_tensors: dict[str, torch.Tensor] = {}
voice_backbone: dict[str, str] = {}  # voice id -> backbone key
piper_voices: dict[str, object] = {}  # voice id -> PiperVoice
models_loaded = False
phonemizer_backend = None
misaki_g2p: dict[str, object] = {}  # lang -> misaki G2P callable ("en", "es")


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


# kokoro's KPipeline language codes: British English and Spanish.
MISAKI_LANG_CODES = {"en": ("b", "British English"), "es": ("e", "Spanish")}


def init_misaki_g2p(lang: str) -> None:
    """misaki's G2P for a language, exactly as KPipeline(lang_code=…) builds it."""
    code, name = MISAKI_LANG_CODES[lang]
    patch_espeak_wrapper()
    from kokoro import KPipeline

    misaki_g2p[lang] = KPipeline(lang_code=code, repo_id="hexgrad/Kokoro-82M", model=False).g2p
    patch_espeak_wrapper()
    print(f"  misaki G2P ({name}) ready", flush=True)


def phonemize_misaki(lang: str, text: str, vocab: dict) -> str:
    g2p = misaki_g2p.get(lang)
    assert g2p is not None
    phonemes, _tokens = g2p(text)
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
    phonemes = phonemize_misaki(lang, text, vocab) if lang in MISAKI_LANG_CODES else phonemize_german(text, vocab)
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


def ensure_g2p(lang: str) -> None:
    """The phonemizer a language needs, built once when its first voice loads."""
    if lang == "de":
        if phonemizer_backend is None:
            init_phonemizer()
    elif lang in MISAKI_LANG_CODES and lang not in misaki_g2p:
        init_misaki_g2p(lang)


def load_voice(voice_id: str) -> None:
    """Load one installed voice, plus its backbone and G2P when it is the first to need them.
    A Kokoro backbone (KModel) is loaded before the G2P: importing kokoro/misaki touches the
    EspeakWrapper that the German phonemizer then repairs."""
    spec = VOICE_SPECS[voice_id]
    model_path = MODEL_DIR / spec.model_file
    voice_path = MODEL_DIR / spec.voice_file
    if not model_path.is_file() or not voice_path.is_file():
        raise RuntimeError(f"{voice_id} ({spec.lang}) missing ({model_path.name} / {voice_path.name})")
    if spec.engine == "piper":
        from piper import PiperVoice

        piper_voices[voice_id] = PiperVoice.load(model_path, config_path=voice_path)
    else:
        try:
            if spec.backbone not in models:
                remap = MANIFEST.voices[voice_id].remap
                models[spec.backbone] = load_kmodel(model_path, MODEL_DIR / "config.json", remap=remap)
            voice_tensors[voice_id] = load_voice_tensor(voice_path)
            voice_backbone[voice_id] = spec.backbone
            ensure_g2p(spec.lang)
        except Exception:
            unload_voice(voice_id)
            raise
    print(f"  loaded {voice_id} ({spec.lang}, {spec.backbone})", flush=True)


def unload_voice(voice_id: str) -> None:
    """Forget a voice; a backbone no loaded voice uses any more is released with it."""
    piper_voices.pop(voice_id, None)
    voice_tensors.pop(voice_id, None)
    voice_backbone.pop(voice_id, None)
    for backbone in [key for key in models if key not in voice_backbone.values()]:
        models.pop(backbone, None)


def probe_language(lang: str, voice: str) -> None:
    """Quality gate: a short sentence must come out as speech, not noise."""
    probe = synthesize_sentence(PROBES.get(lang, "Hello."), voice, 1.0)
    zcr = zero_crossing_rate(probe)
    print(f"  probe lang={lang} voice={voice} samples={probe.size} zcr={zcr:.3f}", flush=True)
    if probe.size < 1000 or zcr > NOISE_ZCR_THRESHOLD:
        raise RuntimeError(
            f"Startup probe for {lang} sounds like noise (zcr={zcr:.3f}). "
            "Check the phonemizer / model assets.",
        )


def load_models() -> None:
    global models_loaded
    if models_loaded:
        return

    started = time.perf_counter()
    print(f"Loading installed TTS voices on {DEVICE}…", flush=True)
    print(f"  model dir: {MODEL_DIR} exists={MODEL_DIR.is_dir()}", flush=True)

    for voice_id in catalog.installed_voices():
        try:
            load_voice(voice_id)
        except Exception as err:  # This voice stays unavailable; the others keep working.
            print(f"  WARNING: {voice_id} failed to load ({err!r})", flush=True)
            unload_voice(voice_id)

    if not loaded_voices():
        print(
            "  WARNING: no voices installed. Download one in Settings → Generated files → Voice models "
            f"or run: bash scripts/tts/victoria/download-models.sh (models under {MODEL_DIR})",
            flush=True,
        )

    # Startup quality gate per language, on martin for German (or the first voice).
    for lang, voices in languages().items():
        probe_language(lang, "martin" if "martin" in voices else voices[0])

    models_loaded = True
    print(
        f"TTS ready in {time.perf_counter() - started:.3f}s: {loaded_voices()}",
        flush=True,
    )


def on_voice_installed(voice_id: str) -> None:
    """Load a freshly downloaded voice without a restart; drop it again if it sounds wrong."""
    with synth_lock:
        load_voice(voice_id)
        try:
            probe_language(VOICE_SPECS[voice_id].lang, voice_id)
        except Exception:
            unload_voice(voice_id)
            raise


def on_voice_removing(voice_id: str) -> None:
    with synth_lock:
        unload_voice(voice_id)


catalog = VoiceCatalog(MODEL_DIR, MANIFEST, on_installed=on_voice_installed, on_removing=on_voice_removing)


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
    if lang == "es":
        # \w keeps á é í ó ú ü ñ; espeak reads digits, ¿ and ¡ themselves.
        return re.sub(r"[^\w\s.,:;!?¿¡\"'\-%/€]", " ", sentence).strip()
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
    return {"voices": loaded_voices(), "languages": languages()}


# Plain `def`: FastAPI runs these in its threadpool, so a voice loading under synth_lock never
# blocks the event loop (and with it the catalog the Settings page polls).
@app.get("/v1/models/voices")
def list_voice_models():
    """Every downloadable voice: installed or not, its size on disk (or to download) and progress."""
    described = catalog.describe()
    loaded = set(loaded_voices())
    for voice in described["voices"]:
        voice["loaded"] = voice["id"] in loaded
    return described


@app.post("/v1/models/voices/{voice_id}/download")
def download_voice_model(voice_id: str):
    try:
        if catalog.installed(voice_id) and voice_id in loaded_voices():
            return {"installed": True, "progress": None}
        return {"installed": False, "progress": catalog.start_download(voice_id)}
    except CatalogError as err:
        return JSONResponse(status_code=404, content={"error": str(err)})


@app.delete("/v1/models/voices/{voice_id}/download")
def cancel_voice_model_download(voice_id: str):
    try:
        catalog.cancel_download(voice_id)
        return {"cancelled": True}
    except CatalogError as err:
        return JSONResponse(status_code=404, content={"error": str(err)})


@app.delete("/v1/models/voices/{voice_id}")
def delete_voice_model(voice_id: str):
    try:
        catalog.voice(voice_id)
    except CatalogError as err:
        return JSONResponse(status_code=404, content={"error": str(err)})
    try:
        return {"freedBytes": catalog.remove(voice_id)}
    except CatalogError as err:
        return JSONResponse(status_code=409, content={"error": str(err)})


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
