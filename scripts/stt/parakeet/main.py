from __future__ import annotations

import array
import os
import subprocess
import sys
import tempfile
import threading
import wave
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Any, AsyncIterator

import transcribe_cpp
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse


MODEL_DIR = Path(os.environ.get("PARAKEET_MODEL_DIR", "/app/models"))
MODEL_FILE = os.environ.get(
    "PARAKEET_MODEL_FILE",
    "parakeet-tdt-0.6b-v3-Q8_0.gguf",
)
MODEL_PATH = MODEL_DIR / MODEL_FILE
MODEL_ID = os.environ.get(
    "PARAKEET_MODEL_ID",
    "handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0",
)
CPU_THREADS = max(1, int(os.environ.get("STT_CPU_THREADS", "4")))
MAX_AUDIO_BYTES = 25 * 1024 * 1024


def load_wav_mono_16k(path: Path) -> array.array[float]:
    with wave.open(str(path), "rb") as wav_file:
        channels = wav_file.getnchannels()
        sample_width = wav_file.getsampwidth()
        sample_rate = wav_file.getframerate()
        frames = wav_file.readframes(wav_file.getnframes())

    if channels != 1 or sample_width != 2 or sample_rate != 16_000:
        raise RuntimeError("Converted audio is not 16 kHz mono 16-bit PCM.")

    pcm16 = array.array("h")
    pcm16.frombytes(frames)
    if sys.byteorder == "big":
        pcm16.byteswap()
    return array.array("f", (sample / 32768.0 for sample in pcm16))


def convert_to_wav(source: Path, destination: Path) -> None:
    try:
        completed = subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(source),
                "-ac",
                "1",
                "-ar",
                "16000",
                "-c:a",
                "pcm_s16le",
                str(destination),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=60,
        )
    except subprocess.TimeoutExpired as error:
        raise HTTPException(status_code=400, detail="Audio conversion timed out.") from error

    if completed.returncode != 0:
        detail = completed.stderr.strip() or "Unsupported or invalid audio."
        raise HTTPException(status_code=400, detail=detail)


class ParakeetService:
    def __init__(self) -> None:
        self.model: Any | None = None
        self.lock = threading.Lock()
        self.arch = ""
        self.variant = ""
        self.backend = ""

    def load(self) -> None:
        if not MODEL_PATH.is_file():
            raise RuntimeError(
                f"Handy Parakeet GGUF is missing from {MODEL_PATH}. Run pnpm stt:up."
            )

        self.model = transcribe_cpp.Model(MODEL_PATH, backend="cpu")
        self.arch = self.model.arch
        self.variant = self.model.variant
        self.backend = self.model.backend
        print(
            f"Loaded {MODEL_ID} ({self.arch}/{self.variant}) on {self.backend} "
            f"with {CPU_THREADS} thread(s).",
            flush=True,
        )

    def close(self) -> None:
        if self.model is not None:
            self.model.close()
            self.model = None

    @property
    def ready(self) -> bool:
        return self.model is not None

    def transcribe(self, audio_path: Path) -> str:
        if self.model is None:
            raise RuntimeError("Parakeet is not loaded.")

        pcm = load_wav_mono_16k(audio_path)
        with self.lock, self.model.session(n_threads=CPU_THREADS) as session:
            result = session.run(pcm, timestamps="none")
        return result.text.strip()


service = ParakeetService()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    service.load()
    try:
        yield
    finally:
        service.close()


app = FastAPI(title="exam.one local Handy Parakeet STT", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok" if service.ready else "loading",
        "ready": service.ready,
        "model": MODEL_ID,
        "engine": "transcribe.cpp",
        "backend": service.backend or "cpu",
    }


@app.post("/v1/audio/transcriptions")
def create_transcription(
    file: Annotated[UploadFile, File()],
    model: Annotated[str, Form()] = MODEL_ID,
    language: Annotated[str | None, Form()] = None,
    response_format: Annotated[str, Form()] = "json",
) -> JSONResponse:
    del model, language
    if response_format != "json":
        raise HTTPException(status_code=400, detail="Only response_format=json is supported.")

    audio = file.file.read(MAX_AUDIO_BYTES + 1)
    if not audio:
        raise HTTPException(status_code=400, detail="The uploaded audio file is empty.")
    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="The uploaded audio is larger than 25 MB.")

    suffix = Path(file.filename or "speaking.webm").suffix or ".webm"
    with tempfile.TemporaryDirectory(prefix="exam-one-stt-") as temp_dir:
        source = Path(temp_dir) / f"input{suffix}"
        wav = Path(temp_dir) / "audio.wav"
        source.write_bytes(audio)
        convert_to_wav(source, wav)
        try:
            text = service.transcribe(wav)
        except Exception as error:
            raise HTTPException(status_code=503, detail=f"Transcription failed: {error}") from error

    return JSONResponse({"text": text})
