FROM debian:bookworm-slim AS transcribe-builder

ARG TRANSCRIBE_CPP_COMMIT=856d7c10a1a864b900e066b7c9801edf373f5148
ARG TRANSCRIBE_CPP_ARCHIVE_SHA256=4b3eb8701033a8e1802e174852d25d58060f6547ecb4240bc9a03d77526e1e63

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        cmake \
        curl \
        g++ \
        libopenblas-dev \
        make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src/transcribe.cpp

RUN curl --location --fail --retry 3 \
        "https://github.com/handy-computer/transcribe.cpp/archive/${TRANSCRIBE_CPP_COMMIT}.tar.gz" \
        --output /tmp/transcribe.cpp.tar.gz \
    && echo "${TRANSCRIBE_CPP_ARCHIVE_SHA256}  /tmp/transcribe.cpp.tar.gz" | sha256sum --check --strict \
    && tar --extract --gzip --file /tmp/transcribe.cpp.tar.gz --strip-components=1 \
    && rm /tmp/transcribe.cpp.tar.gz \
    && cmake -S . -B build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/opt/transcribe \
        -DTRANSCRIBE_BUILD_EXAMPLES=OFF \
        -DTRANSCRIBE_BUILD_SHARED=ON \
        -DTRANSCRIBE_BUILD_TESTS=OFF \
        -DTRANSCRIBE_BUILD_TOOLS=OFF \
        -DTRANSCRIBE_INSTALL=ON \
        -DTRANSCRIBE_USE_SYSTEM_BLAS=ON \
        -DGGML_NATIVE=OFF \
        -DGGML_CPU_ARM_ARCH=armv8-a \
    && cmake --build build --config Release --parallel 2 \
    && cmake --install build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    LD_LIBRARY_PATH=/opt/transcribe/lib \
    TRANSCRIBE_BACKEND=cpu \
    TRANSCRIBE_LIBRARY=/opt/transcribe/lib/libtranscribe.so \
    PYTHONPATH=/opt/transcribe/python

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libopenblas0-pthread \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY --from=transcribe-builder /opt/transcribe /opt/transcribe
COPY --from=transcribe-builder /src/transcribe.cpp/bindings/python/src /opt/transcribe/python
COPY main.py .

EXPOSE 8882

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8882"]
