# Listening audio generation (Kokoro: German, British English and Spanish · Piper: Polish)

Listening practice plays **stable WAV files** (identical on every replay). Kokoro is only
needed when generating or regenerating those files.

`pnpm tts:up` selects and starts the **single** `kokoro-voices` service from the
root `compose.yaml` on `:8881`. It loads every voice whose files are installed under
`scripts/tts/victoria/models` (listed in `victoria/voice-manifest.json`). `pnpm tts:setup` downloads
the voices of the languages in `KOKORO_LANGS` (default `en`); Settings → Generated files → Voice
models downloads or removes single voices while the service runs and loads them without a restart
(`GET/POST/DELETE /v1/models/voices…`). One installed voice per language is enough; the others fall
back to it.

| Voice         | Language | Gender   | Backbone                   |
| ------------- | -------- | -------- | -------------------------- |
| `martin`      | German   | male 1   | Kikiri Stage-2             |
| `bernd`       | German   | male 2   | Kikiri base + voicepack    |
| `victoria`    | German   | female 1 | Kikiri Stage-2             |
| `eva`         | German   | female 2 | Kikiri base + voicepack    |
| `bf_emma`     | English  | female 1 | Kokoro-82M v1.0 (grade B-) |
| `bm_george`   | English  | male 1   | Kokoro-82M v1.0 (grade C)  |
| `bf_isabella` | English  | female 2 | Kokoro-82M v1.0 (grade C)  |
| `bm_fable`    | English  | male 2   | Kokoro-82M v1.0 (grade C)  |
| `pl_gosia`    | Polish   | female 1 | Piper VITS, medium         |
| `pl_darkman`  | Polish   | male 1   | Piper VITS, medium         |
| `pl_bass`     | Polish   | male 2   | Piper VITS, high           |
| `ef_dora`     | Spanish  | female 1 | Kokoro-82M v1.0            |
| `em_alex`     | Spanish  | male 1   | Kokoro-82M v1.0            |
| `em_santa`    | Spanish  | male 2   | Kokoro-82M v1.0            |

German text→phonemes uses `phonemizer` + espeak-ng `de` (same path as the former Martin ONNX stack).
British English uses misaki's British G2P with the espeak `en-gb` fallback, as kokoro's own
`KPipeline(lang_code="b")` does; one base model serves all four English voices and adds
about 0.5 GiB of memory. Grades are upstream's own voice ratings. Kokoro has no Polish, so Polish
runs on [Piper](https://github.com/OHF-Voice/piper1-gpl) (ONNX, with its own bundled espeak-ng) in the
same service: three voices, about 240 MB of download and 0.3 GiB of memory, many times faster than
real time on a CPU. Piper speaks at 22.05 kHz; the service resamples to 24 kHz so every WAV matches.
There is only one Polish female voice, so two women in one dialogue share `pl_gosia`. Spanish runs
on the same base v1.0 model as English, loaded once for both, with misaki's espeak-ng `es` G2P as
`KPipeline(lang_code="e")` builds it; its three voice packs add about 1.5 MB. Upstream gives the
Spanish voices no grade, and there is only one female voice, so two women share `ef_dora`. Shared
files (a Kokoro backbone, `config.json`) are downloaded once and deleted only with the last voice
that needs them.

Every request names a voice and a language. An unknown voice, or a voice of another language,
is refused with HTTP 400 instead of being spoken by a German voice. `/v1/audio/voices` and
`/health` list the loaded voices per language; the backend reports a pack whose voices are
missing as `unsupported`, not offline.

Dialogue transcripts that use `Role:` labels (Teil 2–4) are synthesized **turn-by-turn**
with up to **two male + two female** voices (assigned by gender and order of appearance),
then concatenated. Unlabeled monologues (Teil 1) stay Martin.

Example: `Mann` → martin, `Frau` → victoria, `Verkäuferin` → eva.

English packs label turns with one word: roles (`Man`, `Woman`, `Boy`, `Girl`, `Mum`, `Dad`,
`Assistant`, …) or first names (`Tom`, `Katie`). Their voices come from the pack's own
`speech.voices`, by gender and order of appearance, so `Man` → bm_george, `Woman` → bf_emma.
A monologue opening with one label (`Paul: Hi Jenny, …`) takes that speaker's voice and the
label is not read aloud; an unlabeled one takes the pack's first voice.

Polish packs label turns with a role (`Kobieta`, `Mężczyzna`, `Sprzedawczyni`, `Kelner`, …), a first
name (`Kasia`, `Tomek`, `Łucja`) or `Pan` / `Pani` with a surname (`Pani Nowak`). Feminine roles ending
in `-ka` / `-yni` and first names ending in `-a` are read as women, except listed male names such as
`Kuba`. So `Kobieta` → pl_gosia, `Mężczyzna` → pl_darkman, a second man → pl_bass.

Spanish packs label turns with a role (`Mujer`, `Hombre`, `Dependienta`, `Camarero`, `Locutora`, …), a
first name (`Lucía`, `Javier`, `Álvaro`) or `Señor` / `Señora` / `Don` / `Doña` with a name (`Señora López`).
Only a Spanish pack reads labels with accents and ñ, so no other language's plan changes. Unlisted words
ending in `-a` are read as women and in `-o` as men; an unlisted `-ista` could be either. So `Mujer` →
ef_dora, `Hombre` → em_alex, a second man → em_santa.

## Seed audio (maintainer)

```bash
# One-time: download the English voices (KOKORO_LANGS=en,de,pl,es for every language)
bash scripts/tts/victoria/download-models.sh
# or: ./scripts/tts/setup-kokoro.sh

# Start four-voice TTS (downloads models if missing, then starts the container)
pnpm tts:up

# Synthesize the default pack's bundled WAVs (Cambridge A2 Key); --packs a,b or --packs all
pnpm generate:listening-audio
pnpm generate:listening-audio --packs all

# After voice-roster or dialogue-pipeline changes, force a full regen:
FORCE=1 pnpm generate:listening-audio

# Optional: raise parallelism (default 3; try 4–6 on fast machines)
TTS_CONCURRENCY=4 FORCE=1 pnpm generate:listening-audio

pnpm tts:down

# Voice catalog tests (standard library only)
pnpm tts:test
```

To start the application, database, TTS, and STT together, use `pnpm stack:up`.
All services are defined in the root `compose.yaml`; there is no speech-specific
Compose file.

Seed WAVs are typically gitignored; each machine regenerates them once.

## In-app Generate audio

On a listening practice page, the sidebar shows:

- **TTS health** (ready / offline) via NestJS `/api/v1/tts/health` → Kokoro `:8881`
- A **missing audio** alert when expected files are not found
- **Generate audio** — calls `/api/v1/tts/generate-listening-audio`, writes
  generated WAVs onto the shared Compose volume (or `public/audio/listening/generated/`
  in local `pnpm dev`), and stores the `audio` map on the exercise via the API

Requires `pnpm tts:up` first. Segment and dialogue-turn synthesis run in parallel
(`TTS_CONCURRENCY`, default 3).

Env overrides:

| Variable            | Default                 | Meaning                           |
| ------------------- | ----------------------- | --------------------------------- |
| `TTS_BASE_URL`      | `http://127.0.0.1:8881` | Four-voice PyTorch service        |
| `TTS_CONCURRENCY`   | `3`                     | Parallel segment + turn synthesis |
| `TTS_SPEED`         | `1.0`                   | Speaking rate                     |
| `TTS_LANGUAGES`     | `de` (Compose `de,en,pl,es`) | Languages packs may use      |
| `TTS_LANG`          | `de`                    | Single-language form of the above |
| `TTS_VOICES`        | German + British + Polish + Spanish ids | Voices packs may use |
| `KOKORO_LANGS`      | `en`                    | Languages `pnpm tts:setup` downloads |
| `STACK_SEED_PACKS`  | `cambridge-en-a2`       | Packs `pnpm stack:seed-audio` seeds (`all` for every pack) |
| `TTS_TURN_PAUSE_MS` | `350`                   | Silence between dialogue turns    |

Upstream Martin: [kikiri-german-martin](https://huggingface.co/kikiri-tts/kikiri-german-martin).
Upstream Victoria: [kikiri-german-victoria](https://huggingface.co/kikiri-tts/kikiri-german-victoria).
Bernd / Eva voicepacks: recovered via [r1di/kokoro-fastapi-german](https://github.com/r1di/kokoro-fastapi-german) (Apache-2.0).
Multi-speaker base: [kikiri-german-base-51speakers-synthetic](https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic).
English and Spanish model and voices: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), with
[misaki](https://github.com/hexgrad/misaki) G2P (Apache-2.0) and spaCy `en_core_web_sm` (MIT) baked into the image.
The Kikiri models are Apache-2.0; the multi-speaker base was trained on synthetic audio.
Polish voices: [rhasspy/piper-voices `pl_PL`](https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL) —
`gosia` and `darkman` (CC0 datasets), `bass` (Apache-2.0). The `piper-tts` engine is GPL-3.0-or-later and
runs only inside this speech container, as espeak-ng (GPL-3.0) already does.

Legacy Martin ONNX scripts remain under `scripts/tts/kokoro-german/` but are not used by `pnpm tts:up`.
