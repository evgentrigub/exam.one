# Listening text-to-speech

[Back to scripts](../README.md)

Exam packs supply listening transcripts, language, voice metadata, and audio maps. The local TTS service synthesizes stable WAV files for those tasks; replaying an existing file does not require TTS or an LLM.

One Compose service, `text-to-speech`, serves German, British English, and Spanish through Kokoro and Polish through Piper. The API selects language/voices from the active pack and supports shared recordings, per-item clips, monologues, and dialogues.

## Install and start

Run from the application root:

```bash
pnpm tts:setup
pnpm tts:up
curl http://127.0.0.1:8881/v1/audio/voices
```

`tts:setup` downloads languages selected by `KOKORO_LANGS`; the default is English. `tts:up` performs setup and starts the root Compose service on port 8881. Files live under `scripts/tts/victoria/models/`, with catalog metadata in [victoria/voice-manifest.json](victoria/voice-manifest.json).

To prepare more languages before startup:

```bash
KOKORO_LANGS=en,de,pl,es pnpm tts:setup
```

While TTS runs, **Settings → Generated files → Voice models** downloads/removes individual voices and sets the user's preferred voice per language. Downloaded voices load without a restart. A running container may still be loading its engines. Settings retries an unavailable voice catalog every five seconds, refreshes the storage total when it reconnects, and stops retrying when you leave the page. At least one installed voice for a pack's language is needed; other requested voices can fall back to an installed voice of that language.

```bash
pnpm tts:down
```

Stopping the service preserves model files and audio. Full-stack startup is documented in the [application README](../../README.md#self-host-with-docker-compose).

## Available voice families

| Language        | Voice IDs                                         | Engine/model family                    |
| --------------- | ------------------------------------------------- | -------------------------------------- |
| German          | `martin`, `bernd`, `victoria`, `eva`              | Kikiri German Kokoro models/voicepacks |
| British English | `bf_emma`, `bf_isabella`, `bm_george`, `bm_fable` | Kokoro-82M v1.0                        |
| Polish          | `pl_gosia`, `pl_darkman`, `pl_bass`               | Piper VITS                             |
| Spanish         | `ef_dora`, `em_alex`, `em_santa`                  | Kokoro-82M v1.0                        |

English and Spanish share a base model. Shared model files are retained until the last voice requiring them is removed. Piper output is resampled to the common 24 kHz WAV format.

Every request supplies a language and voice; invalid/wrong-language voices are rejected. The backend checks `TTS_LANGUAGES`, `TTS_VOICES`, and the service's reported installed voices. Missing capability is reported as unsupported rather than silently changing the language.

## Dialogue transcripts

Speaker labels are removed from spoken audio. Turns are synthesized separately, assigned voices by speaker gender and order, and concatenated with pauses. Voice choices come from the pack's roster; a preferred default may change the order used for synthesis.

Examples of labels recognized by the existing language-specific planners:

| Language | Example labels                                    |
| -------- | ------------------------------------------------- |
| German   | `Mann:`, `Frau:`, `Verkäuferin:`                  |
| English  | `Man:`, `Woman:`, `Tom:`, `Katie:`                |
| Polish   | `Kobieta:`, `Mężczyzna:`, `Kasia:`, `Pani Nowak:` |
| Spanish  | `Mujer:`, `Hombre:`, `Lucía:`, `Señora López:`    |

Keep generated transcripts consistent with the owning pack's conventions. An unlabeled monologue uses the language's narrator/selected voice. A language with one installed female voice reuses it for multiple female speakers. Registering a new language requires supported synthesis and label handling as well as pack metadata.

## Bundled audio

With TTS running and the necessary voices installed:

```bash
pnpm generate:listening-audio
pnpm generate:listening-audio --packs cambridge-en-a2,dele-es-a2
TTS_CONCURRENCY=1 pnpm generate:listening-audio --packs cambridge-en-b1,goethe-de-b1,certpol-pl-b1,dele-es-b1
pnpm generate:listening-audio --packs all
FORCE=1 pnpm generate:listening-audio --packs cambridge-en-a2
```

The default pack is Cambridge A2 Key. `--packs` or `STACK_SEED_PACKS` selects other packs. The generator reads explicit bundled segments from each pack; WAVs are normally gitignored and generated once per machine. `FORCE=1` regenerates selected files after transcript/voice changes.

The four B1 packs prepare 51 Set 1 recordings: Cambridge B1 Preliminary (15), Goethe-Zertifikat B1 (4), Certyfikat Polski B1 (22) and DELE B1 (10). Their mock listening content is separate from practice seeds. Select the B1 pack IDs explicitly; the default command does not prepare them. Once the WAVs exist, bundled mock playback works with TTS stopped.

`pnpm stack:seed-audio` waits for TTS and prepares the selected seed folders when missing. Its existing-folder check is coarse; use the generator directly when repairing an incomplete folder.

## In-app audio generation

Listening pages show missing-audio and capability states. **Generate audio** enqueues a server-side `LISTENING_AUDIO` job. The worker synthesizes clips, writes user/pack/exercise-scoped files, saves the audio map, and reports progress through Activity. It continues when the browser tab closes.

Compose bind-mounts `apps/frontend/public/audio/listening/` into the backend and frontend. Generated files live under `generated/`; Nuxt serves their URLs. Local development uses the same host folder by default. Seed WAVs and installed models are shared resources; generated files are user-scoped.

## Configuration and checks

| Variable                     | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `TTS_BASE_URL` / `TTS_PORT`  | Service endpoint and published port               |
| `KOKORO_LANGS`               | Languages downloaded during setup; default `en`   |
| `TTS_LANGUAGES` / `TTS_LANG` | Allowed languages / older single-language setting |
| `TTS_VOICES`                 | Allowed voice IDs                                 |
| `TTS_SPEED`                  | Speaking rate                                     |
| `TTS_CONCURRENCY`            | Parallel synthesis requests; default 3            |
| `TTS_TURN_PAUSE_MS`          | Pauses between concatenated turns; default 350 ms |
| `TTS_PAUSE_DURATION`         | Speech-service pause setting                      |
| `STACK_SEED_PACKS`           | Bundled packs selected for audio setup            |

The supplied `.env.example`/Compose configure `de,en,pl,es` as allowed languages and `en` as the initial installation. Backend code without those settings retains single-language German fallback defaults. Set instance capabilities explicitly for a custom installation.

```bash
pnpm tts:test
```

## Sources and attribution

The installed files come from [Kikiri Martin](https://huggingface.co/kikiri-tts/kikiri-german-martin), [Kikiri Victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria), the [Kikiri multi-speaker base](https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic), [German voicepacks](https://github.com/r1di/kokoro-fastapi-german), [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), [misaki](https://github.com/hexgrad/misaki), and [Polish Piper voices](https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL). The [Piper engine](https://github.com/OHF-Voice/piper1-gpl) runs in the speech container.

These engines, models, and voices have their own licenses. Preserve their upstream notices when distributing weights or images. Legacy Martin ONNX tooling under `kokoro-german/` is separate from the current `tts:up` service.
