from __future__ import annotations

import os
import subprocess
import tempfile
import threading
from pathlib import Path
from typing import Annotated, Any

import librosa
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from transformers import AutoModelForTDT, AutoProcessor


MODEL_DIR = Path(os.environ.get("PARAKEET_MODEL_DIR", "/app/models"))
MODEL_ID = os.environ.get("PARAKEET_MODEL_ID", "nvidia/parakeet-tdt-0.6b-v3")


def select_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


class ParakeetService:
    def __init__(self) -> None:
        self.processor: Any | None = None
        self.model: Any | None = None
        self.device = select_device()
        self.lock = threading.Lock()

    def load(self) -> None:
        if not MODEL_DIR.joinpath("config.json").is_file():
            raise RuntimeError(
                f"Parakeet snapshot is missing from {MODEL_DIR}. Run pnpm stt:up."
            )

        self.processor = AutoProcessor.from_pretrained(
            MODEL_DIR,
            local_files_only=True,
        )
        dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.model = AutoModelForTDT.from_pretrained(
            MODEL_DIR,
            dtype=dtype,
            local_files_only=True,
        ).to(self.device)
        self.model.eval()

    @property
    def ready(self) -> bool:
        return self.processor is not None and self.model is not None

    def transcribe(self, audio_path: Path) -> str:
        if not self.ready:
            raise RuntimeError("Parakeet is not loaded.")
        assert self.processor is not None
        assert self.model is not None

        sampling_rate = self.processor.feature_extractor.sampling_rate
        speech, _ = librosa.load(
            str(audio_path),
            sr=sampling_rate,
            mono=True,
            dtype="float32",
        )
        inputs = self.processor(
            [speech],
            sampling_rate=sampling_rate,
            return_tensors="pt",
            padding=True,
        )
        inputs = inputs.to(device=self.model.device, dtype=self.model.dtype)

        with self.lock, torch.inference_mode():
            output = self.model.generate(**inputs, return_dict_in_generate=True)

        decoded = self.processor.decode(
            output.sequences,
            skip_special_tokens=True,
        )
        if isinstance(decoded, list):
            return str(decoded[0]).strip()
        return str(decoded).strip()


service = ParakeetService()
app = FastAPI(title="exam.one local Parakeet STT")


@app.on_event("startup")
def load_model() -> None:
    service.load()


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok" if service.ready else "loading",
        "ready": service.ready,
        "model": MODEL_ID,
        "device": service.device,
    }


def convert_to_wav(source: Path, destination: Path) -> None:
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
            str(destination),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or "Unsupported or invalid audio."
        raise HTTPException(status_code=400, detail=detail)


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

    suffix = Path(file.filename or "speaking.webm").suffix or ".webm"
    with tempfile.TemporaryDirectory(prefix="exam-one-stt-") as temp_dir:
        source = Path(temp_dir) / f"input{suffix}"
        wav = Path(temp_dir) / "audio.wav"
        source.write_bytes(file.file.read())
        if not source.stat().st_size:
            raise HTTPException(status_code=400, detail="The uploaded audio file is empty.")

        convert_to_wav(source, wav)
        try:
            text = service.transcribe(wav)
        except RuntimeError as error:
            raise HTTPException(status_code=503, detail=str(error)) from error

    return JSONResponse({"text": text})
