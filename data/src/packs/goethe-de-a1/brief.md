# Goethe A1 · Start Deutsch 1 — pack brief

Pack `goethe-de-a1` (aliases `goethe-a1`). Board Goethe, language German, CEFR A1. Independently authored
practice material; not an official Goethe exam or question bank.

## Sources

Checked 2026-09-27 against the *Start Deutsch 1 Modellsatz* (8th edition, 02/2024; candidate sheets,
answer key, Schreiben assessment, Sprechen examiner notes) and the *Durchführungsbestimmungen* (as of
1 September 2025; durations, points, ×1.66 conversion, pass mark 60/100). No official task, image or
recording is bundled.

## Structure

| Module | Teil | Task | Items | Raw points |
| --- | --- | --- | --- | --- |
| Lesen (25 min) | 1 | Two short messages, Richtig / Falsch | 5 | 5 |
| | 2 | Situations: which of two short texts helps? a / b | 5 | 5 |
| | 3 | Signs and notices, Richtig / Falsch | 5 | 5 |
| Hören (~20 min) | 1 | Short conversations, a/b/c, played twice | 6 | 6 |
| | 2 | Announcements, Richtig / Falsch, played once | 4 | 4 |
| | 3 | Telephone messages, a/b/c, played twice | 5 | 5 |
| Schreiben (20 min) | 1 | Form: five missing entries, 1/0 each | 5 | 5 |
| | 2 | Message, about 30 words, 3 content points (3/1.5/0) + communication (1/0.5/0) | — | 10 |
| Sprechen (~15 min) | 1 | Introduce yourself, spell a word, say a number | — | 3 |
| | 2 | Ask and answer on two topics from word cards | — | 6 |
| | 3 | Make and react to requests from cards | — | 6 |

## Practice adaptations

- Raw points are shown per part and module; the official ×1.66 conversion is stated, not applied.
- True/false items store `options: ["Richtig", "Falsch"]` with a numeric `correctAnswer` (0 = richtig).
- Payloads use the Goethe raw field names the practice screens read, projected through
  `../goethe-shared/raw-adapter.ts`.
- Pictures become text: Hören Teil 1 options, Sprechen Teil 3 cards.
- Listening seeds ship without audio; **Generate audio** synthesises each item with the local German TTS.
  Dialogue turns carry `Name:` labels for two voices.
- Schreiben Teil 1 uses the *form fill* screen; Teil 2 uses a 20–50 word guidance range, no auto-zero.
- Sprechen is solo practice with fixed partner cues; feedback grades the transcript only. Teil 2 and 3
  use the *word cards* and *request cards* screens.
- No mock exams.

## Status

All four modules are available (roadmap 2.15).
