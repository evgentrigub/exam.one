# Third-party notices

exam.one's original code, documentation, and bundled practice content are covered by the [project license](LICENSE), except where separate terms are identified. Third-party software, models, voices, fonts, and other assets retain their own licenses and copyright notices.

## Scope of the first release

The v1.0.0 release is provided as source code and Docker build instructions. Speech weights, voice files, generated audio, font files, and prebuilt container images are not included in this source repository. Setup installs dependencies and downloads selected speech assets separately.

This document identifies the main upstream components and existing notices. It does not replace their license texts or establish permission beyond the applicable upstream terms. Exact application dependency versions are recorded in [pnpm-lock.yaml](pnpm-lock.yaml); speech dependencies and asset sources are recorded in the files linked below.

## Application software

These license declarations were checked against installed package metadata while preparing the first release.

| Components                                                                              | Declared license                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Nuxt, Vue, Vue Router, Pinia, Vue I18n, Nuxt i18n, VueUse, persisted-state plugin       | MIT                                                                      |
| NestJS, Express, BullMQ, Bull Board, ioredis, bcrypt, node-postgres, Swagger UI Express | MIT                                                                      |
| Prisma, RxJS, OpenAI JavaScript SDK, reflect-metadata                                   | Apache-2.0                                                               |
| Nodemailer                                                                              | MIT-0                                                                    |
| Lucide / lucide-vue-next                                                                | ISC; preserve the complete package license and any included icon notices |

The package manifests also list styling libraries, build tools, and other dependencies. Their own packages contain the authoritative licenses and copyright notices. The PostgreSQL and Redis servers, Node.js and Python runtimes, base images, and operating-system packages also retain their own terms; a client library's license does not determine its server's license.

## Speech-to-text

See the [STT guide](scripts/stt/README.md), [model manifest](scripts/stt/model-manifest.json), [runtime requirements](scripts/stt/requirements.txt), and [Dockerfile](scripts/stt/Dockerfile).

| Component                                                                                                                                                                   | Attribution and license evidence                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Phonon 2 weights](https://huggingface.co/FermionResearch/Phonon-2)                                                                                                         | Fermion Research, derived from NVIDIA Parakeet TDT 0.6B v3; CC-BY-4.0 according to the manifest and bundled [NOTICE](scripts/stt/notices/phonon-2-NOTICE.txt). |
| [Parakeet TDT 0.6B v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3), [Handy Q4_K_M GGUF conversion](https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf) | NVIDIA; conversion and quantization by Handy; CC-BY-4.0 according to the manifest and [Q4 NOTICE](scripts/stt/notices/parakeet-q4-NOTICE.txt).                 |
| [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)                                                                                                          | MIT; preserve the bundled [license](scripts/stt/notices/transcribe-cpp-LICENSE.txt). The build pins its source commit and archive checksum.                    |
| Fermion runtime                                                                                                                                                             | Apache-2.0 according to the bundled Phonon NOTICE; the requirements pin its wheel and checksum. The installed runtime's own license also applies.              |

The repository includes the [CC-BY-4.0 license text](scripts/stt/notices/CC-BY-4.0.txt) and upstream notices. Preserve attribution, source links, license information, and descriptions of modifications with redistributed weights. Additional runtime packages, including PyTorch, Transformers, FFmpeg, and OpenBLAS, have their own terms.

## Text-to-speech and voices

See the [TTS guide](scripts/tts/README.md), [voice manifest](scripts/tts/victoria/voice-manifest.json), [runtime requirements](scripts/tts/victoria/requirements.txt), and [Dockerfile](scripts/tts/victoria/Dockerfile).

| Component                                                                                             | Source and licensing information                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kokoro-82M base model, selected British English and Spanish voices                                    | [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M); the model repository declares Apache-2.0. Preserve the notices applicable to the selected model and voice files.                                                                                                                                                                                                                                        |
| German Martin, Victoria, and shared base models                                                       | [Kikiri Martin](https://huggingface.co/kikiri-tts/kikiri-german-martin), [Kikiri Victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria), [Kikiri base](https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic); the model repositories declare Apache-2.0.                                                                                                                               |
| German Bernd and Eva voicepacks                                                                       | [r1di/kokoro-fastapi-german](https://github.com/r1di/kokoro-fastapi-german); the repository declares Apache-2.0 for its code. Voice-specific provenance and terms must be checked separately before redistributing those voice files.                                                                                                                                                                                    |
| Polish Gosia, Darkman, and Bass voices                                                                | Individual upstream model cards: [Gosia](https://huggingface.co/rhasspy/piper-voices/blob/main/pl/pl_PL/gosia/medium/MODEL_CARD), [Darkman](https://huggingface.co/rhasspy/piper-voices/blob/main/pl/pl_PL/darkman/medium/MODEL_CARD), [Bass](https://huggingface.co/rhasspy/piper-voices/blob/main/pl/pl_PL/bass/high/MODEL_CARD). Voice, dataset, and base-model terms are separate from the inference engine license. |
| [Kokoro](https://github.com/hexgrad/kokoro) and [Misaki](https://github.com/hexgrad/misaki) libraries | Upstream repositories declare Apache-2.0.                                                                                                                                                                                                                                                                                                                                                                                |
| [Piper inference engine](https://github.com/OHF-Voice/piper1-gpl)                                     | Upstream identifies GPL-3.0; local requirements identify GPL-3.0-or-later. Use the exact installed package's license when fulfilling redistribution obligations.                                                                                                                                                                                                                                                         |
| [phonemizer](https://github.com/bootphon/phonemizer)                                                  | Upstream declares GPL-3.0-or-later.                                                                                                                                                                                                                                                                                                                                                                                      |
| [eSpeak NG](https://github.com/espeak-ng/espeak-ng) and supporting packages                           | Their own licenses apply, including packages installed by the image build.                                                                                                                                                                                                                                                                                                                                               |

The model license, voice terms, engine license, and rights in synthesized output are separate matters. This inventory does not certify voice-specific permissions that have not been established. Download links do not grant additional rights.

## Fonts and exam content

The frontend requests Fraunces, Inter, and JetBrains Mono through Google Fonts in [nuxt.config.ts](apps/frontend/nuxt.config.ts). The source repository does not bundle their font files. Redistributing or self-hosting font files requires preserving the applicable font licenses.

Bundled exercises are original practice material, as described in the pack documentation. Official exam papers, preparation books, and recordings are not licensed for reuse merely because they are publicly accessible.

Goethe-Institut, Cambridge English, Certyfikat Polski, DELE, Instituto Cervantes, and other third-party names identify the formats being practised. They do not imply endorsement, certification, or affiliation. Project licensing does not grant rights in third-party trademarks.

## Redistributing images or downloaded assets

If distributing built images, dependencies, weights, voices, or fonts, retain their required license texts, copyright notices, and NOTICE files. For components with source-distribution obligations, provide the corresponding source and other required materials under their actual license terms. Include notices for transitive dependencies and operating-system packages present in those artifacts.

Before offering prebuilt images or asset bundles, review their exact contents and any unresolved asset-specific terms. The source repository's notices alone are not a completed license review of a built image or voice bundle.
