"""Bound inference to one worker; process teardown releases native/PyTorch memory."""
import json
import select
import subprocess
import sys
import threading
import time
from pathlib import Path

from catalog import Catalog


class Runtime:
    def __init__(self, catalog: Catalog, threads: int = 4):
        self.catalog = catalog
        self.threads = threads
        self.lock = threading.Lock()
        self.process = None
        self.model_id = None
        self.loading = False
        self.error = None
        self.last_used = 0.0
        self.closed = threading.Event()
        threading.Thread(target=self._reap, daemon=True).start()

    def close_worker(self):
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()
            self.process.stdin.close()
            self.process.stdout.close()
        self.process = None
        self.model_id = None

    def close(self):
        self.closed.set()
        with self.lock:
            self.close_worker()

    def _reap(self):
        while not self.closed.wait(5):
            if self.lock.acquire(blocking=False):
                try:
                    if self.process and time.monotonic() - self.last_used >= 300:
                        self.close_worker()
                finally:
                    self.lock.release()

    def _read(self, timeout=120):
        if not select.select([self.process.stdout], [], [], timeout)[0]:
            raise RuntimeError("Speech worker timed out")
        line = self.process.stdout.readline()
        if not line:
            raise RuntimeError("Speech worker stopped; check service logs")
        response = json.loads(line)
        if "error" in response:
            raise RuntimeError(response["error"])
        return response

    def transcribe(self, model: dict, wav: Path) -> str:
        if not self.lock.acquire(timeout=120):
            raise RuntimeError("Speech recognition is busy; try again")
        try:
            if not self.catalog.installed(model["id"]):
                raise ValueError("Speech model is not installed. Install it in Settings or type your transcript.")
            if self.model_id != model["id"] or self.process is None or self.process.poll() is not None:
                self.close_worker()
                self.loading = True
                self.model_id = model["id"]
                self.process = subprocess.Popen([sys.executable, str(Path(__file__).with_name("worker.py")), model["engine"], str(self.catalog.path(model["id"])), str(self.threads)], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)
                self._read()
                self.loading = False
            self.process.stdin.write(json.dumps({"path": str(wav)}) + "\n")
            self.process.stdin.flush()
            result = self._read()["text"]
            self.error = None
            return result
        except Exception as error:
            self.error = str(error)
            self.close_worker()
            raise
        finally:
            self.loading = False
            self.last_used = time.monotonic()
            self.lock.release()

    def remove(self, model_id: str) -> int:
        if not self.lock.acquire(blocking=False):
            raise RuntimeError("A transcription is active; try removing the model later")
        try:
            if model_id == self.model_id:
                self.close_worker()
            return self.catalog.remove(model_id)
        finally:
            self.lock.release()
