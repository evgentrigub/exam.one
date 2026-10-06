# DELE A2 — pack brief

Normalized requirements for `dele-es-a2`. Official facts are kept apart from the practice adaptations this app makes.
No official task text, image or recording is bundled; every seed is original.

## Identity and sources

- Exam: **Diploma de Español como Lengua Extranjera (DELE), nivel A2**, Instituto Cervantes, in the format used since
  the February 2020 session. Spanish (`es`), CEFR A2. Input texts use peninsular Spanish; in the candidate's own texts
  any Hispanic norm is accepted if used consistently (G p. 7).
- Pack: `dele-es-a2`, aliases `dele-a2`, `spanish-a2`.
- Scope: full supported practice of all 13 tareas (4 reading, 4 listening, 2 writing, 3 speaking), as solo practice
  with the adaptations below, and mock exams (see below).
- Sources, linked from https://examenes.cervantes.es/es/dele/examenes/a2 and checked 2026-09-29:
  - **[G]** *Guía del examen DELE A2*, © 2022, NIPO 503-14-007-X, 29 pp. (`DELE_A2_v2020_Guía_de_examen_0.pdf`).
    The © 2014 guide describes the old format and was not used.
  - **[E]** *DELE A2 Especificaciones*, 4 pp. (`Especificaciones_DELE_A2_2020.pdf`).
  - **[M]** *Modelo 0* (exam code 00), valid from the February 2020 session (`DELE-A2_v2020_Modelo0_0.pdf`).
  - Topic scope: *Plan Curricular del Instituto Cervantes*, Nociones específicas A1–A2 (cvc.cervantes.es).

## Official structure and points

| Prueba | Time | Tareas | Items | Points |
| --- | --- | --- | --- | --- |
| 1 Comprensión de lectura | 60 min | 4 | 25 (5 / 8 / 6 / 6) | 25 |
| 2 Comprensión auditiva | 40 min, every text heard twice | 4 | 25 (6 / 6 / 6 / 7) | 25 |
| 3 Expresión e interacción escritas | 45 min | 2 | open | 25 |
| 4 Expresión e interacción orales | 12 min + 12 min preparation | 3 | open | 25 |

- G p. 6: 100 points, each prueba 25%. G p. 27: Grupo 1 = Lectura + Escritura, Grupo 2 = Auditiva + Oral (50 each);
  **Apto** needs at least 30 in each group. There is no overall pass mark.
- Reading and listening: 1 point per correct item, no penalty (G pp. 25–26).
- Writing and speaking: bands 0–3 on two categories, **Uso de la lengua (66%)** and **Cumplimiento de la tarea
  (34%)**; band 2 = A2 reached; the weighted raw score converts to 25 points as × 25 / 3 (G pp. 13–14, 18–20, 26).
  Writing: both tareas 50% each, two examiners averaged. Speaking: the calificador (60%) rates T1 + T2 (25% each) and
  T3 (50%); the entrevistador (40%) gives one global rating. Fluency and pronunciation sit inside the Uso descriptors.

| Tarea | Official task | Items |
| --- | --- | --- |
| L 1 | Personal letter or email, 250–300 words; 3 options (G p. 8, E p. 1) | 5 |
| L 2 | 8 ads / notices / posts, 50–80 words each; 3 options | 8 |
| L 3 | 3 texts of 100–120 words; match statements to A / B / C | 6 |
| L 4 | Narrative text (biography, diary, blog, story, news, guide), 375–425 words; 3 options | 6 |
| A 1 | 6 face-to-face conversations, 50–80 words; **3 picture options** (G p. 10, E p. 2) | 6 |
| A 2 | 6 radio pieces, 40–60 words; 3 options | 6 |
| A 3 | 1 conversation, 225–275 words; match to the man / the woman / *ninguno de los dos* | 6 |
| A 4 | 7 messages, 30–50 words; match to 7 of 10 statements (3 distractors) | 7 |
| E 1 | Reply to a message of 35–40 words; note, postcard, message or email; **60–70 words** (G p. 12, M) | — |
| E 2 | **70–80 words**; choose Opción A (everyday topic) or Opción B (biography or story from photos or data) | — |
| O 1 | Presentation on a topic, about 5 points; choice of 2 cards; 2–3 min monologue (G p. 17, M) | — |
| O 2 | Photo description with guide questions; choice of 2 photos; 2–3 min monologue | — |
| O 3 | Role-play with the entrevistador in a situation linked to the T2 photo; 3–4 min | — |

## Practice mapping and adaptations

| Part | Format / screen | Adaptation |
| --- | --- | --- |
| Reading 1 | `selection`, 5 × 3 | None. |
| Reading 2 | `selection`, the 8 texts labelled "Texto 1 … 8" in one `content`, questions start "Texto n:" | None. |
| Reading 3 | `matching`, every question carries `["Texto A", "Texto B", "Texto C"]`, reuse allowed | None; each text answers two statements. |
| Reading 4 | `selection`, 6 × 3 | None. |
| Listening 1 | `selection`, one recording per item, labelled `Hombre:` / `Mujer:` | **Pictures → short text labels.** |
| Listening 2 | `selection`, one recording per item, one `Locutor:` / `Locutora:` label that picks the voice | None. |
| Listening 3 | `matching` (`person` + shared bank): options are the two first names and "Ninguno de los dos"; `person` holds the statement | The answer sheet's columns become a dropdown per statement. |
| Listening 4 | `matching` (`person` + shared bank), 10 statements, no reuse; seven messages in one transcript with a speaker label each, `person` "Mensaje n" | The seven messages are one recording, replayed as a whole. |
| Writing 1 | `freeform`, one field, 60–70 words | None. |
| Writing 2 | `freeform`, one field, 70–80 words, `topicType` `opcion-a` or `opcion-b` | **No in-task choice: each exercise is one option.** Opción B gives dated facts in words instead of photos. |
| Speaking 1 | monologue with 5 keyword points | No choice of card: each exercise is one topic. |
| Speaking 2 | monologue with 5 guide questions | **The photo → a written scene** in `theme` ("Escena: …"). |
| Speaking 3 | `word-cards`: 3 examiner cards (`speaker: 'examiner'`) and the learner's own question card | **Solo role-play** with fixed examiner lines; the situation is its own exercise, not linked to a T2 exercise. |

- **Scoring.** Every writing tarea and speaking tarea is marked on both official scales, `taskCompletion` (Cumplimiento
  de la tarea) and `language` (Uso de la lengua), 0–3 each, half points allowed: 6 raw points per tarea, 12 for
  writing and 18 for speaking. **The 66 / 34 weighting and the × 25 / 3 conversion are stated in `scoringNote`, not
  applied.** Speaking is marked from transcripts only; there is no global entrevistador rating. `multiplier` is 1.
- **Instructions and tips** are in English, the interface language; exam content, phrases and feedback quotes are
  Spanish. Reviews are written in the learner's interface language (`{outputLanguage}`).
- **Speech.** TTS uses three Kokoro v1.0 voices on the local speech service: `ef_dora` (female), `em_alex` and
  `em_santa` (male), on the base model shared with British English, with misaki's espeak `es` G2P. With one female
  voice, two women in one dialogue share `ef_dora`. Speaker labels are roles, first names or "Señor / Señora" +
  surname, which the Spanish voice mapping reads for gender. STT uses Parakeet v3 (auto-detects Spanish) or Whisper;
  transcripts stay editable.
- **Practice seeds** ship without audio; **Generate audio** synthesises it per user. The exam-only mock Set 1 ships seed WAVs.

## Gaps and assumptions

- Speaking recordings are capped at 90 seconds by the speaking screen, but the official monologues run 2–3 minutes.
  The review prompts judge coverage of the points rather than length. Raising the cap is application work.
- The item distribution across the three texts of reading T3 is not stated in G; two per text is a practice choice.
- Speaker counts in listening T2 and T4 are not specified; practice uses one speaker per piece or message.
- Pause lengths between recordings follow the player's defaults, not the exam's reading windows.
- Not included: images, official recordings, a live examiner, the choice between two cards or photos, pronunciation
  marking, the entrevistador's global rating.

## Mock exams

- **Set 1** (`dele-es-a2-set-1`) is bundled and works offline: 13 original exam-only tareas
  (`mock-es-a2-set1-<skill>-tarea<n>`, `examOnly`), separate from the practice seeds. Its listening WAVs live under
  `/audio/listening/dele-es-a2/` and are written by `pnpm stack:seed-audio` (Tareas 1–2 one file per item, 3–4 one
  shared file). Writing Tarea 2 is Opción A; the speaking scene and role-play share one place (a restaurant).
- **Generated sets** (`dele-es-a2-set-<n>`, from Set 2) use the shared resumable pipeline: one generation per tarea
  through the pack's generators, plus Spanish TTS for listening. Each set has one writing Tarea 2 option, whichever
  the generator writes.
- **Scoring.** Modules follow the exam order and minutes (60 / 40 / 45 / 12). Raw points convert linearly to 25 per
  prueba: reading 25 → 25 and listening 25 → 25 (× 1), writing 12 → 25 (× 25 / 12), speaking 18 → 25 (× 25 / 18, shown
  as provisional because it is graded from transcripts). Every recording plays twice. **Practice adaptation:** the
  two writing and speaking scales count equally; the official 66 / 34 weighting and the entrevistador's global
  rating are not applied.
- **Pass rule.** As in the exam, `rules.groups` pass the set only when **Grupo 1** (reading + writing) and **Grupo 2**
  (listening + speaking) each reach 30 of 50; there is no overall pass mark. The result screen shows each group, and
  the AI overview comments on each.
- **Not modelled:** the choice between Opción A and B inside one set, the 12-minute speaking preparation, recordings
  longer than 90 seconds.
