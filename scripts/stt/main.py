from __future__ import annotations

import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from audio import convert_to_wav
from catalog import Catalog
from runtime import Runtime

catalog: Catalog
runtime: Runtime


@asynccontextmanager
async def lifespan(_: FastAPI):
    global catalog, runtime
    catalog = Catalog(Path(os.environ.get("STT_MODEL_DIR", "/app/models")), legacy=Path(os.environ.get("STT_LEGACY_MODEL", "/app/legacy-models/parakeet-tdt-0.6b-v3-Q8_0.gguf")))
    runtime = Runtime(catalog, threads=max(1, int(os.environ.get("STT_CPU_THREADS", "4"))))
    try:
        yield
    finally:
        runtime.close()


app = FastAPI(title="exam.one local speech recognition", lifespan=lifespan)


@app.get("/health")
def health(language: str | None = None, model: str = ""):
    if language is None:
        return {"status": "ok", "ready": True}
    try:
        selected = catalog.resolve(language, model)
        installed = catalog.installed(selected["id"])
        loading = runtime.loading and runtime.model_id == selected["id"]
        return {"ready": installed and not loading, "model": selected["id"], "language": language,
                "state": "missing" if not installed else "loading" if loading else "ready",
                "detail": "Install the selected speech model in Settings." if not installed else "Speech model is loading." if loading else selected["name"] + " ready"}
    except ValueError as error:
        return {"ready": False, "state": "unsupported", "detail": str(error)}


@app.get("/v1/models/stt")
def models():
    return catalog.snapshot()


class Preference(BaseModel):
    lang: str
    modelId: str


@app.put("/v1/models/stt/preferred")
def preferred(body: Preference):
    try:
        catalog.prefer(body.lang, body.modelId)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    return {"ok": True}


@app.post("/v1/models/stt/{model_id}/download", status_code=202)
def download(model_id: str):
    try:
        catalog.download(model_id)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    return {"started": True}


@app.delete("/v1/models/stt/{model_id}/download")
def cancel(model_id: str):
    try:
        catalog.cancel(model_id)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    return {"cancelled": True}


@app.delete("/v1/models/stt/{model_id}")
def remove(model_id: str):
    try:
        return {"freedBytes": runtime.remove(model_id)}
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(409, str(error)) from error


@app.post("/v1/audio/transcriptions")
def transcribe(file: Annotated[UploadFile, File()], model: Annotated[str, Form()] = "", language: Annotated[str, Form()] = "en", response_format: Annotated[str, Form()] = "json"):
    if response_format != "json":
        raise HTTPException(400, "Only response_format=json is supported")
    try:
        selected = catalog.resolve(language, model)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    audio = file.file.read(25 * 1024 * 1024 + 1)
    if not audio:
        raise HTTPException(400, "The uploaded audio file is empty")
    if len(audio) > 25 * 1024 * 1024:
        raise HTTPException(413, "The uploaded audio is larger than 25 MB")
    # The filename is not used as a filesystem path.
    with tempfile.TemporaryDirectory(prefix="exam-one-stt-") as directory:
        source, wav = Path(directory) / "input", Path(directory) / "audio.wav"
        source.write_bytes(audio)
        convert_to_wav(source, wav)
        try:
            text = runtime.transcribe(selected, wav)
        except (ValueError, RuntimeError) as error:
            raise HTTPException(503, str(error)) from error
    return {"text": text}
