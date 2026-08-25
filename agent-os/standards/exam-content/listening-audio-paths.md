# Listening Audio Paths

Build seed audio maps with `buildSeedListeningAudioMap` in `@exam-one/exam-content`. Do not hand-write path strings.

```
/audio/listening/a2/{exerciseId}/shared.wav          # Teil 2 / 4
/audio/listening/a2/{exerciseId}/{itemId}.wav        # Teil 1 / 3
/audio/listening/generated/{exerciseId}/…            # TTS output
```

- Seed WAVs live under `public/audio/listening/a2/`. Mock Set 1 reuses those files (new id, same paths).
- Generated files go to `GENERATED_LISTENING_AUDIO_DIR` (Compose volume or `public/audio/listening/generated/`). Never write TTS into the seed `a2/` tree.
- Postgres stores paths only, not bytes.
