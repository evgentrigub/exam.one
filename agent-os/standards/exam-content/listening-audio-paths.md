# Listening Audio Paths

Build seed audio maps with `buildSeedListeningAudioMap` in the owning pack's `content/` folder (`data/src/packs/goethe-de-a2/content/`). Do not hand-write path strings.

```
/audio/listening/a2/{exerciseId}/shared.wav          # Teil 2 / 4, seed
/audio/listening/a2/{exerciseId}/{itemId}.wav        # Teil 1 / 3, seed
/audio/listening/generated/{sha256}/shared.wav       # TTS output, one recording
/audio/listening/generated/{sha256}/item-{n}.wav     # TTS output, per item
```

- Seed WAVs live under `public/audio/listening/a2/`. Mock Set 1 reuses those files (new id, same paths).
- Generated files go to `GENERATED_LISTENING_AUDIO_DIR` (Compose volume or `public/audio/listening/generated/`). Never write TTS into the seed `a2/` tree.
- Generated audio is keyed by a SHA-256 of `(packId, userId, exerciseId)`, so **the exercise id is deliberately not a path segment** and no id format is required or enforced. Files are positional (`item-{n}`) and the stored `audio` map — keyed by projected question id — is the only way back to a URL; never derive a generated path on the client. Still resolve write and delete paths through `containedAudioPath` and require they stay under the audio root.
- Postgres stores paths only, not bytes.
