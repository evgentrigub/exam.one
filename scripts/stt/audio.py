import array
import subprocess
import sys
import wave
from pathlib import Path
from fastapi import HTTPException


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


