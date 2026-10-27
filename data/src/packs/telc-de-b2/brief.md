# telc Deutsch B2

Roadmap stage 3.3a.1. Normalized from the exam-pack-author brief template; official facts are kept apart from practice adaptations. All seed texts, tasks and model answers are original app content.

## Identity and sources

- Exam: telc Deutsch B2 (general language; formerly Zertifikat Deutsch Plus). Not telc Deutsch B2+ Beruf, B1·B2 Pflege or B2·C1 Medizin, which have different structures.
- Board: telc gGmbH. Board id `telc`, displayed as "German telc" / "Deutsch telc".
- Language `de`, CEFR B2. Pack id `telc-de-b2`; no aliases.
- Edition: the format revised in 2019, still current in 2026; paper, hybrid and digital (DIGItelc) delivery share the content.
- Sources:
  - telc Deutsch B2 Übungstest 1, 9th edition 2019: task instructions pp. 6–31, rating criteria and scoring pp. 40–47.
  - [Handbuch telc Deutsch B2](https://www.telc.net/fileadmin/user_upload/pdfs/Handbuch_und_Tipps_fuer_Pruefungsvorbereitung/Deutsch_B2_Handbuch.pdf), 8th revised edition 2019: test specification.
  - [Tipps zur Prüfungsvorbereitung](https://www.telc.net/fileadmin/user_upload/pdfs/Handbuch_und_Tipps_fuer_Pruefungsvorbereitung/Deutsch_B2_tipps_zur_Pruefungsvorbereitung.pdf), 6th edition 2020: timings and recording lengths.
  - [telc.net exam page](https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/telc-deutsch-b2/) and the delivery-mode page.
- Status: official exam specification, with the solo-practice adaptations listed below.
- Scope: all 12 parts practisable, with mock exams.

## Official format

| Module                                                                      | Part                        | Items                                                                                                                                                          | Points                                           |
| --------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Leseverstehen (90 min with Sprachbausteine)                                 | 1 Globalverstehen           | 5 texts, 10 headlines a–j, each used once                                                                                                                      | 5 each = 25                                      |
|                                                                             | 2 Detailverstehen           | 5 × a/b/c on one article (the 2019 Übungstest prints two related articles)                                                                                     | 5 each = 25                                      |
|                                                                             | 3 Selektives Verstehen      | 10 situations, 12 advertisements a–l plus x; each advertisement once, x when none fits                                                                         | 2.5 each = 25                                    |
| Sprachbausteine                                                             | 1                           | letter or e-mail, 10 gaps × a/b/c (grammar)                                                                                                                    | 1.5 each = 15                                    |
|                                                                             | 2                           | article, 10 gaps, box of 15 words a–o, each used once                                                                                                          | 1.5 each = 15                                    |
| Hörverstehen (about 20 min, every recording heard **once**)                 | 1 Globalverstehen           | radio news with six reports, 5 statements richtig/falsch, 30 s to read first                                                                                   | 5 each = 25                                      |
|                                                                             | 2 Detailverstehen           | interview of about 7 minutes, 10 statements in order, 60 s to read first                                                                                       | 2.5 each = 25                                    |
|                                                                             | 3 Selektives Verstehen      | 5 short announcements or voicemails, one statement each                                                                                                        | 5 each = 25                                      |
| Schriftlicher Ausdruck (30 min)                                             | Aufgabe A or B              | semi-formal e-mail of at least 150 words answering an advertisement; three of four Leitpunkte, or two plus an own aspect; Betreff, Anrede, Einleitung, Schluss | criteria I–III × A/B/C/D = 5/3/1/0, sum × 3 = 45 |
| Mündlicher Ausdruck (pairs, about 15 min, 20 min preparation for Teile 2–3) | 1 Über Erfahrungen sprechen | one of seven fixed topics, up to 1½ minutes, partner questions both ways                                                                                       | 25                                               |
|                                                                             | 2 Diskussion                | summarise a shared text (≤ 1 minute), then discuss                                                                                                             | 25                                               |
|                                                                             | 3 Gemeinsam etwas planen    | plan an event together                                                                                                                                         | 25                                               |

- "Richtig" means the recording confirms the statement; a "falsch" item is never built on information that is simply missing.
- Writing criteria: I Aufgabenbewältigung (Leitpunkte handled), II Kommunikative Gestaltung (register, cohesion, text-type features; no A without Betreff, Anrede and Schluss), III Formale Richtigkeit (A/B = B2 well met / met, C = B1, D = A2 or below). Off-topic: D throughout. A D on III does not cancel I and II. No zero-below-words rule.
- Speaking criteria per part: Ausdrucksfähigkeit, Aufgabenbewältigung and Formale Richtigkeit at 7/5/3/0, Aussprache und Intonation at 4/2/1/0. Unscored warm-up.
- Totals: written 225 + oral 75 = 300. Pass: at least 135 written **and** 45 oral, unrounded. Grades: 270 sehr gut, 240 gut, 210 befriedigend, 180 ausreichend; below either mark nicht bestanden.

## App mapping

| Part                          | Format and screen                                     | Runtime                                           |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Reading 1                     | `matching`, option bank                               | 5 × 10, no reuse, 25                              |
| Reading 2                     | `selection`                                           | 5 × 3, 25                                         |
| Reading 3                     | `matching`, option bank                               | 10 × 13 (a–l + x), no reuse except x, 25          |
| Reading 4 (Sprachbausteine 1) | `selection`, choice gaps                              | 10 × 3, 15                                        |
| Reading 5 (Sprachbausteine 2) | `matching`, choice gaps, option bank                  | 10 × 15, no reuse, 15                             |
| Listening 1                   | `true-false` rows Richtig / Falsch, shared transcript | 5, once, 30 s preview, 25                         |
| Listening 2                   | same, two-voice interview                             | 10, once, 60 s preview, 25                        |
| Listening 3                   | `true-false`, one recording per item                  | 5, once, 25                                       |
| Writing 1                     | `freeform`, one field                                 | 150–220 words guidance, 3 × A–D bands, raw 15 × 3 |
| Speaking 1                    | `recording`, `word-cards`, seven `topicOptions`       | presentation 90 s, two answers, one question      |
| Speaking 2                    | `recording`, `word-cards`, discussion `stimulus`      | summary 60 s, three turns                         |
| Speaking 3                    | `recording`, `word-cards`, situation `stimulus`       | four turns                                        |

Speech: German Kokoro voices martin, victoria, bernd and eva; STT `de` on Parakeet Q4. Without speech services, bundled WAVs still play, generated audio is unavailable and manual transcripts remain usable.

## Practice adaptations

- Sprachbausteine are Reading Parts 4–5, because the app has four skill modules; the official exam reports them separately inside the written result.
- Item numbers restart in each part; each part's format line names the official item range (1–60 across the paper).
- Writing: one Aufgabe per exercise. `topicType` is `email`; `category` says Aufgabe A (Bitte um Informationen) or B (Beschwerde). The mock assigns one task instead of a choice of two.
- Speaking is solo: fixed partner lines on cards, a supplied summary of the partner's talk in Part 1, and the discussion text and planning situation as readable `stimulus` texts. Transcripts cannot show pronunciation, intonation or fluency, so Aussprache is not scored: three 7/5/3/0 criteria give raw 21 per part, a formative estimate. Mocks scale 63 raw to a provisional /75.
- Listening part 3's context sentence is the start of each recording, as in the exam audio.
- Bundled listening seeds are compact (about 2–4 minutes per part); generator prompts target the official lengths. Synthetic German voices replace human recordings.

## Gaps and assumptions

- Text lengths per part are not specified officially beyond about 3,000 words for all reading texts.
- The DIGItelc interface is undocumented; the paper layout is used.
- Content and difficulty need specialist calibration; structural checks do not certify CEFR level.
