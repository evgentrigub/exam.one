"""One isolated model per process. stdin/stdout carry JSON; engine logs use stderr."""
import contextlib
import json
import os
import sys
from pathlib import Path


def main() -> None:
    engine, model_file, threads = sys.argv[1:]
    path = Path(model_file)
    os.environ.update(FERMION_DEVICE="cpu", FERMION_CPU_THREADS=threads, HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1")
    with contextlib.redirect_stdout(sys.stderr):
        if engine == "fermion":
            from fermion._speech.fetch import _unpack
            from fermion._speech.engine_phonon2_cpu import load
            directory = path.parent / "unpacked"
            if not (directory / "model.fermion").is_file() or not (directory / "config.json").is_file():
                _unpack(path, directory)
            model = load(directory, profile="five-value", backend="phonon2-five-value", quiet=True)
        else:
            import transcribe_cpp
            model = transcribe_cpp.Model(path, backend="cpu")
    print(json.dumps({"ready": True}), flush=True)
    for line in sys.stdin:
        try:
            request = json.loads(line)
            with contextlib.redirect_stdout(sys.stderr):
                if engine == "fermion":
                    text = model.transcribe(request["path"])[0]
                else:
                    from audio import load_wav_mono_16k
                    with model.session(n_threads=int(threads)) as session:
                        text = session.run(load_wav_mono_16k(Path(request["path"])), timestamps="none").text
            print(json.dumps({"text": text.strip()}), flush=True)
        except Exception as error:
            print(json.dumps({"error": str(error)}), flush=True)


if __name__ == "__main__":
    main()
