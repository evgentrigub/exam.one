# Cambridge English A2 Key — pack brief

Normalized requirements for `cambridge-en-a2`. Official facts are kept apart from the practice adaptations this app
makes. No official task text, image or recording is bundled; every seed is original.

## Identity and sources

- Exam: **Cambridge English A2 Key** (2020 format), Cambridge Assessment English. English (`en`), CEFR A2.
- Pack: `cambridge-en-a2`, aliases `cambridge-a2`, `a2-key`. Variant: A2 Key (general). A2 Key for Schools has the
  same format, marks and certificate; only its topics are school-oriented.
- Scope: full supported practice of all 14 parts, as solo practice with the adaptations below, and mock exams
  (see below).
- Sources, checked 2026-09-29 (cambridgeenglish.org):
  - *A2 Key Handbook for teachers* (2024, ENG/04485-60/V3/MAY24) and the edition for exams from 2020
    (CER/6178/V1/FEB19): paper structure, task types, marking, writing scale, speaking format and scales.
  - *A2 Key for Schools Handbook for teachers* (CER/6188/V4/JUL21): identical format.
  - *The Cambridge English Scale explained* (ENG/36303/V1/NOV23): raw marks per skill and practice-test conversions.
  - *Understanding the Statement of Results, A2 Key* (ENG/10052a/V2/MAY26): Scale bands and grades.
  - *Information for candidates, A2 Key for Schools* (ENG/25835/V1/MAY26): spelling and case notes.
  - *Assessing Speaking Performance – Level A2* (2019) and the *A2 Key Vocabulary List* (August 2025).

## Official structure and marks

| Paper | Time | Parts | Raw marks |
| --- | --- | --- | --- |
| Reading & Writing | 60 min (≈40 reading, 20 writing) | 7 | Reading 30 (1 per item) + Writing 30 (2 × 15) |
| Listening | ≈30 min, every recording heard twice | 5 | 25 (1 per item) |
| Speaking | 8–10 min per pair, two examiners | 2 | 45 = (GV + P + IC) × 2 + GA × 3, half marks allowed |

- Each skill is 25 % of the result. Cambridge English Scale: 140–150 Grade A (B1), 133–139 Grade B, 120–132 Grade C,
  100–119 A1 certificate. Practice-test guide (raw needed for 120 / 140): Reading 20 / 28, Writing 18 / 26,
  Listening 17 / 23, Speaking 27 / 41.
- Writing is marked on Content, Organisation and Language, 0–5 each, whole marks. There is no zero-word rule.
- Speaking: the assessor marks Grammar and Vocabulary, Pronunciation and Interactive Communication; the interlocutor
  gives Global Achievement.
- Spelling must be correct in Reading Part 5. In Listening Part 2, spelled-out words and common words must be
  correctly spelled. US spelling is accepted when consistent. Case does not matter.

| Part | Task | Items |
| --- | --- | --- |
| R1 | 6 short real-world texts, 3-option multiple choice | 6 |
| R2 | 3 short texts, 7 questions matched to A/B/C | 7 |
| R3 | one longer text, 3-option multiple choice | 5 |
| R4 | factual text, multiple-choice cloze (3 words per gap) | 6 |
| R5 | email, open cloze (one word per gap) | 6 |
| W6 | email or note, 25+ words, 3 content points | 15 marks |
| W7 | picture story, 35+ words, 3 pictures | 15 marks |
| L1 | 5 short dialogues, 3 picture options | 5 |
| L2 | monologue, complete 5 notes (word, number, date, time) | 5 |
| L3 | longer dialogue, 3-option multiple choice | 5 |
| L4 | 5 short monologues or dialogues, 3-option multiple choice | 5 |
| L5 | longer dialogue, match 5 items to 8 options (A–H) | 5 |
| S1 | interlocutor questions: personal, then a topic, then "tell me about…" (3–4 min) | — |
| S2 | pictures discussion with the partner, follow-up questions (5–6 min) | — |

Conflicts resolved in favour of the handbooks: *Information for candidates* says Listening Part 2 answers are "1 or 2
words" (handbook: one word, a number, a date or a time; practice allows up to 3 words so "half past six" fits), and
that each Listening Part 4 recording has one speaker (handbook: monologues or dialogues).

## Practice adaptations

- **Scoring:** raw marks per part, `multiplier` 1; the Scale conversion is stated in each module's `scoringNote`, not
  applied. One AI review replaces the examiners.
- **Numbering:** reading and listening keep Parts 1–5. Writing Parts 6 and 7 are writing parts 1 and 2, because the
  writing screens number their parts 1 and 2; the official number is in each part's `format` line.
- **Reading:** R1 lists the six texts, numbered, in the text panel ("Text n:" questions). R2 labels the texts `A:`,
  `B:`, `C:` and every question offers the same three names. R4 shows gaps as `(n) ____` with "Gap n" questions.
  R5 uses the new **gap-fill** format: the learner types one word per gap, scored automatically against the listed
  accepted answers (case, spacing, typographic apostrophes and outer punctuation are ignored; spelling is not).
- **Listening:** L1 picture options become short text options. L2 uses **gap-fill** for the notes. L3 is one shared
  recording with five choice questions. L4 repeats the scene-setter in the question. L5 matches five people to eight
  shared options, each used once. Dialogue turns carry one-word labels (`Man:`, `Katie:`) so TTS can assign voices.
  Practice allows unlimited replays; `replays: 2` records the exam rule.
- **Writing:** Part 7's three pictures are described in words in the task and in `pictures`. The word ranges
  (25–60, 35–80) are practice guidance for the submit gate; nothing is auto-zeroed.
- **Speaking (solo):** both parts use the `word-cards` screen. Examiner questions are fixed `answer` cards marked
  `speaker: 'examiner'`; Part 2's five pictures become a text list, and the learner asks the (absent) partner one
  question from a word card. Each part is reviewed from the editable transcript on Grammar and Vocabulary,
  Interactive Communication and Global Achievement (0–5 each, 15 per part). **Pronunciation is not assessed**, and
  there is no live turn-taking.

## Speech

- TTS `en` with the British Kokoro voices `bf_emma`, `bm_george`, `bf_isabella`, `bm_fable`; STT `en`. Both need an
  instance that lists English (`TTS_LANGUAGES`, `STT_LANGUAGES`) with the English Kokoro model installed. Practice
  seeds ship without audio; **Generate audio** synthesises them. Without English TTS the listening screen reports audio
  as unavailable; manual transcripts stay available in speaking. The exam-only mock Set 1 ships seed WAVs.

## Mock exams

- **Set 1** (`cambridge-a2-set-1`) is bundled and works offline: 14 original exam-only parts
  (`mock-key-set1-<skill>-part<n>`, writing `part6` / `part7`, `examOnly`), separate from the practice seeds. Its
  listening WAVs live under `/audio/listening/cambridge-en-a2/` and are written by `pnpm stack:seed-audio` (Parts 1
  and 4 one file per item, Parts 2, 3 and 5 one shared file).
- **Generated sets** (`cambridge-a2-set-<n>`, from Set 2) use the shared resumable pipeline: one generation per part
  through the pack's generators, plus British English TTS for listening.
- **Modules** follow the paper order: Reading 40, Writing 20, Listening 30, Speaking 10 minutes. **Practice
  adaptation:** the 60-minute Reading & Writing paper is split 40 / 20, the handbook's suggestion, with a timer per
  module. Every recording plays twice.
- **Scoring** stays in raw marks per module (30 / 30 / 25 / 30). The result is reported on the **Cambridge English
  Scale** through `rules.scale`: each skill's raw marks convert through the practice-test anchors of *The Cambridge
  English Scale explained* (raw for Scale 82 / 100 / 120 / 140 — Reading 7 / 13 / 20 / 28, Writing 8 / 12 / 18 / 26,
  Listening 6 / 11 / 17 / 23, Speaking 10 / 18 / 27 / 41 of 45 — and the raw maximum at 150), interpolated linearly;
  the overall score is their rounded average. Grade A 140–150 (B1), B 133–139, C 120–132 (pass), A1 100–119, no
  certificate below. **Practice adaptation:** practice speaking has no Pronunciation scale, so its 30 marks are
  scaled to 45 before the conversion and the result is labelled an estimate; speaking is provisional.
- **Not modelled:** a shared Reading & Writing clock, the answer-transfer time, the paired speaking test.
## Decisions and gaps

- Chosen with the user on 2026-09-29: build the gap-fill format and UI rather than drop R5/L2; add British English
  TTS in this stage; solo speaking with three transcript-based scales; minimal A2-neutral app fixes.
- Chosen with the user on 2026-10-03 for mock exams: report on the Cambridge English Scale with a grade; modules in
  the paper order with the 40 / 20 split.
- Not covered: pictures of any kind, a live partner or examiner, pronunciation, timed answer transfer.
