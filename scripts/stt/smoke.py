"""Integration smoke only: exercise browser codecs, without scoring ASR accuracy.

Run inside the STT container, supplying an existing English audio sample:
python smoke.py --audio /samples/english.wav --models phonon-2,parakeet-v3-q4
"""
import argparse
import json
import subprocess
import tempfile
import urllib.request
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", type=Path, required=True)
    parser.add_argument("--models", default="phonon-2,parakeet-v3-q4")
    parser.add_argument("--formats", default="wav,webm,mp3,ogg,m4a")
    parser.add_argument("--url", default="http://127.0.0.1:8882")
    args = parser.parse_args()
    if not args.audio.is_file():
        parser.error("Audio sample does not exist")
    formats = args.formats.split(",")
    if any(extension not in {"wav", "webm", "mp3", "ogg", "m4a"} for extension in formats):
        parser.error("Unsupported smoke-test format")
    with tempfile.TemporaryDirectory(prefix="exam-one-smoke-") as temporary:
        for extension in formats:
            target = Path(temporary) / f"sample.{extension}"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(args.audio), str(target)], check=True)
            for model in args.models.split(","):
                boundary = "exam-one-stt-smoke"
                fields = "".join(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n' for key, value in [("language", "en"), ("model", model)])
                data = (fields + f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample.{extension}"\r\n\r\n').encode() + target.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
                request = urllib.request.Request(args.url.rstrip("/") + "/v1/audio/transcriptions", data=data, headers={"Content-Type": "multipart/form-data; boundary=" + boundary})
                with urllib.request.urlopen(request, timeout=150) as response:
                    result = json.load(response)
                if not isinstance(result.get("text"), str) or not result["text"].strip():
                    raise RuntimeError(f"No transcript returned for {model}/{extension}")
                print(f"PASS {model}/{extension}", flush=True)


if __name__ == "__main__":
    main()
