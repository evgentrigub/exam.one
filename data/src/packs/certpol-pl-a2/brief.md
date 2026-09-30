# Certyfikat Polski A2 — pack brief

Normalized requirements for `certpol-pl-a2`. Official facts are kept apart from the practice adaptations this app
makes. No official task text, image or recording is bundled; every seed is original.

## Identity and sources

- Exam: **Państwowy egzamin certyfikatowy z języka polskiego jako obcego**, level **A2, adults** (A2 is currently
  offered only for adults; the youth variant starts at B1). Board: Państwowa Komisja do spraw Poświadczania Znajomości
  Języka Polskiego jako Obcego (certyfikatpolski.pl). Polish (`pl`), CEFR A2.
- Pack: `certpol-pl-a2`, aliases `certyfikat-pl-a2`, `polish-a2`.
- Scope: full supported practice of all 16 tasks of the sample (5 listening, 6 reading, 2 writing, 3 speaking), as solo
  practice with the adaptations below. No mock exams.
- Sources, checked 2026-09-29:
  - *Struktura egzaminu* — https://certyfikatpolski.pl/o-egzaminie/struktura-egzaminu/ (modules, timing, variants).
  - *Przykładowe testy* — https://certyfikatpolski.pl/o-egzaminie/przykladowe-testy-zbiory-zadan/: the only official
    A2 sample, 2018: test `…/2018/10/t_a2.pdf` (18 pp.), transcripts and key `…/2018/10/tr_klucz_a2.pdf` (4 pp.),
    audio `…/2018/10/A2_przyklad.mp3` (not played).
  - *Rozporządzenie MNiSW z 14 lutego 2025 r. w sprawie egzaminów z języka polskiego jako obcego*, Dz.U. 2025 poz. 217
    (in force from 2025-02-22): §14 ust. 1 (modules), §17 (oral part), §22–23 (results and pass rule), Załącznik 1
    część II D (adult A2 standards, PDF pp. 65–73).

## Official structure and points

| Module | Time | Tasks | Points |
| --- | --- | --- | --- |
| Rozumienie ze słuchu (listening) | 25 min, every recording heard twice | 5 | 30 |
| Rozumienie tekstów pisanych z rozpoznawaniem struktur gramatycznych (reading with grammar) | 45 min | 6 | 30 |
| Pisanie (writing) | 45 min | 1 set of 2 tasks | 20 |
| Mówienie (speaking) | up to 10 min + about 5 min preparation | 3 | 40 |

- Written part (listening, reading, writing): at most 160 minutes by law, 115 in the sample; 80 points.
- Pass rule at A2: at least 50% of the written part and at least 50% of the oral part (§23 pkt 1 lit. a). There is no
  minimum per module below B1.
- Grammar is part of the reading module at A2; it becomes its own module from B1.

| Task | Official task (2018 sample) | Items | Points |
| --- | --- | --- | --- |
| L I | Who is speaking (1–4) and where is it said (5–10); single utterances; a / b / c | 10 | 1 each |
| L II | Radio announcement; prawda / fałsz | 5 | 1 each |
| L III | Dialogue; match 5 people to pictures A–H (one used by the example, two not needed) | 5 | 1 each |
| L IV | 5 answering-machine messages; match to statements A–F (one used by the example) | 5 | 1 each |
| L V | Announcement; write down numbers (date, count, time, age, year) | 5 | 1 each |
| R I | Underline the correct form (3 inflected forms per gap) | 10 | 0.5 each |
| R II | Words from a box, already in the right form (11 words: example + 10 gaps) | 10 | 0.5 each |
| R III | Public signs; where / what it means; a / b / c | 5 | 1 each |
| R IV | Short notices; a / b / c | 5 | 1 each |
| R V | Fill a survey form from a first-person text ("other correct answers are accepted") | 10 | 0.5 each |
| R VI | Match pictures to captions A–G (one used by the example, one not needed) | 5 | 1 each |
| W | Choose one of two sets, each (a) a short text (greeting 20 words / SMS 10 words) and (b) a longer text (description 80–90 words) | 2 | 20 for the set: wykonanie zadania 0–6, bogactwo językowe 0–7, poprawność językowa 0–7 |
| S 1 | Answer the examiner's questions about yourself | — | 0–4 |
| S 2 | Describe a person in a photo | — | 0–10 |
| S 3 | Role-play with the examiner | — | 0–10 |
| S all | Accuracy for the whole speaking test: vocabulary 0–6, grammar 0–6, pronunciation 0–4 | — | 16 |

Allowed adult A2 writing text types (Załącznik 1): greetings and wishes, text messages, informal private letters,
descriptions of people, objects, places and situations, and forms.

## Practice mapping and adaptations

| Part | Format / screen | Adaptation |
| --- | --- | --- |
| Listening 1 | `selection`, one recording per item | None. A one-word role label picks the voice and is not read aloud. |
| Listening 2 | `true-false` on the shared-choice shape (`question` + `["Prawda", "Fałsz"]`) | The `statement` shape would show German "Ja / Nein" labels. |
| Listening 3 | `matching` (`person` + shared bank), 7 options | **Pictures → short text labels.** The example is dropped, so 7 options with 2 distractors. |
| Listening 4 | `matching`, 6 options | The example is dropped; its option stays as 1 distractor. The five messages are one transcript with a caller label per message. |
| Listening 5 | `gap-fill` notes | Every acceptable spelling of each number is listed in `accepted`. |
| Reading 1 | `selection`, gaps `(n) ____`, 10 × 3 options, 5 points | None. |
| Reading 2 | `matching`, every question carries the 11-word box, no reuse, 5 points | The example is dropped; its word stays as 1 distractor. |
| Reading 3–4 | `selection` | None. |
| Reading 5 | `gap-fill`, the form lines in `content`, 5 points | The key's "other correct answers" become explicit `accepted` lists. |
| Reading 6 | `matching`, 6 captions, no reuse | **Pictures → written scene descriptions.** The example is dropped; 1 distractor. |
| Writing 1–2 | `freeform`, one field each | **The set of two tasks is split into two parts** (the writing screens number parts 1 and 2); the official "a / b" is in `format`. The set's 6 / 7 / 7 is split 2 / 2 / 2 and 4 / 5 / 5. A photo occasion is stated in words. No set choice: each generation is one task. Word ranges 10–30 and 70–100 are guidance; there is no zero rule. |
| Speaking 1 | `word-cards`, 4 examiner cards | Solo: the examiner's questions are fixed cards. |
| Speaking 2 | monologue with 4 keyword prompts | **The photo → a written description** in `theme`. |
| Speaking 3 | `word-cards`: the learner's opening card + 3 examiner cards | Solo role-play with fixed examiner lines. |

- **Speaking scoring.** Marked from transcripts only: task points 4 / 10 / 10, and vocabulary and grammar (6 each in
  the exam) split 1 / 2.5 / 2.5 across the tasks. **Pronunciation (0–4) is not marked**, so practice totals 36, not 40.
- **Instructions and tips** are in English, the interface language; exam content, phrases and feedback quotes are Polish.
  Reviews are written in the learner's interface language (`{outputLanguage}`).
- **Speech.** TTS uses three Piper voices on the local speech service: `pl_gosia` (female), `pl_darkman` and `pl_bass`
  (male). With one female voice, two women in one dialogue share `pl_gosia`. Speaker labels are roles, first names or
  "Pan / Pani" + surname, which the Polish voice mapping reads for gender. STT uses Parakeet v3 (auto-detects Polish)
  or Whisper; transcripts stay editable.
- **Seeds** ship without audio; **Generate audio** synthesises it per user. No mock exams, bundled WAVs or mock factory.

## Gaps and assumptions

- The task counts, points and word limits come from the single 2018 sample; the regulation does not fix them. Live
  exams may differ.
- The regulation Dz.U. 2025 poz. 217 is repealed from 2027-01-01 by Dz.U. 2026 poz. 676 (Sejm API metadata only; the
  new act was not read). Re-check this brief against the new rules then.
- The sample's audio was not played; listening timings follow the printed test.
- Not included: images, official recordings, the youth variant, a live conversation partner, pronunciation marking.
