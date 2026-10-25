# Goethe A1 · Start Deutsch 1 — pack brief

Pack `goethe-de-a1` (aliases `goethe-a1`). Board Goethe, language German, CEFR A1. Independently authored
practice material; not an official Goethe exam or question bank.

## Sources

Checked 2026-09-27 against the _Start Deutsch 1 Modellsatz_ (8th edition, 02/2024; candidate sheets,
answer key, Schreiben assessment, Sprechen examiner notes) and the _Durchführungsbestimmungen_ (as of
1 September 2025; durations, points, ×1.66 conversion, pass mark 60/100). No official task, image or
recording is bundled.

## Structure

| Module             | Teil | Task                                                                          | Items | Raw points |
| ------------------ | ---- | ----------------------------------------------------------------------------- | ----- | ---------- |
| Lesen (25 min)     | 1    | Two short messages, Richtig / Falsch                                          | 5     | 5          |
|                    | 2    | Situations: which of two short texts helps? a / b                             | 5     | 5          |
|                    | 3    | Signs and notices, Richtig / Falsch                                           | 5     | 5          |
| Hören (~20 min)    | 1    | Short conversations, a/b/c, played twice                                      | 6     | 6          |
|                    | 2    | Announcements, Richtig / Falsch, played once                                  | 4     | 4          |
|                    | 3    | Telephone messages, a/b/c, played twice                                       | 5     | 5          |
| Schreiben (20 min) | 1    | Form: five missing entries, 1/0 each                                          | 5     | 5          |
|                    | 2    | Message, about 30 words, 3 content points (3/1.5/0) + communication (1/0.5/0) | —     | 10         |
| Sprechen (~15 min) | 1    | Introduce yourself, spell a word, say a number                                | —     | 3          |
|                    | 2    | Ask and answer on two topics from word cards                                  | —     | 6          |
|                    | 3    | Make and react to requests from cards                                         | —     | 6          |

## Practice adaptations

- Raw points are shown per part and module; the official ×1.66 conversion is stated, not applied.
- True/false items store `options: ["Richtig", "Falsch"]` with a numeric `correctAnswer` (0 = richtig).
- Payloads use the Goethe raw field names the practice screens read, projected through
  `../goethe-shared/raw-adapter.ts`.
- Pictures become text: Hören Teil 1 options, Sprechen Teil 3 cards.
- Listening seeds ship without audio; **Generate audio** synthesises each item with the local German TTS.
  Dialogue turns carry `Name:` labels for two voices.
- Schreiben Teil 1 uses the _form fill_ screen; Teil 2 uses a 20–50 word guidance range, no auto-zero.
- Sprechen is solo practice with fixed partner cues; feedback grades the transcript only. Teil 2 and 3
  use the _word cards_ and _request cards_ screens.

## Mock exams

- Bundled **Set 1** (`goethe-a1-set-1`): 11 original exam-only exercises (`mock-a1-set1-*`, `examOnly: true`),
  one per Teil, in `content/seeds/*` and assembled in `content/seeds/mock-exam.ts`. Its listening items point at
  seed WAVs under `/audio/listening/a1/`, written by `pnpm generate:listening-audio` (run by `pnpm stack:seed-audio`),
  so Set 1 works without an LLM key or a TTS service.
- Generated sets (`goethe-a1-set-N`) run the shared resumable pipeline after the LLM and TTS preflight.
- Modules in the A2 order (Lesen 25, Hören 20, Schreiben 20, Sprechen 15 minutes). Each module converts its 15 raw
  points to 25 with the exact factor 25/15 (the official ×1.66, whose rounded total is the same); 100 in total,
  pass mark 60. Listening replays follow the runtime: Teil 1 and 3 twice, Teil 2 once.
- Writing and Speaking are graded automatically by AI; there is no word-count zero rule. Speaking is graded from
  transcripts only, so its score is marked provisional.

## Status

All four modules are available (roadmap 2.15), plus mock exams.
