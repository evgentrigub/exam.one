# Goethe-Zertifikat A2 Exam Reference

This is the implementation reference for German / Goethe A2 exam content in `exam.one`. Use it when creating typed seed data, prompt templates, AI generation endpoints, review prompts, grading logic, mock exam flows, or UI labels for Goethe A2.

Keep the app architecture exam-agnostic, but keep Goethe A2 content faithful to this structure.

## General Scoring

The exam has four modules worth 25 points each, for 100 points total.

- Reading (`Lesen`), listening (`Hoeren`), and writing (`Schreiben`): sum raw task points (`Messpunkte`) and multiply by `1.25` to get final result points (`Ergebnispunkte`).
- Speaking (`Sprechen`): do not apply the `1.25` multiplier. Speaking points are `4 + 8 + 8` for the three parts, plus `5` pronunciation points, for a direct maximum of 25 points.

## Reading: Lesen

Time limit: 30 minutes. The module has four parts and 20 questions total.

### Part 1: Newspaper Article

- Format: informational text, approximately 200 words.
- Task: 5 questions, each with exactly 3 multiple-choice options (`a`, `b`, `c`).
- Generation rule: test careful, detailed reading. Incorrect options should reuse exact words from the text while distorting the overall meaning.

### Part 2: Information Board Or Schedule

- Format: structured list text, approximately 100 words, such as a mall directory or schedule.
- Task: 5 situations, each with 3 options (`a`, `b`, `c`).
- Generation rule: test selective reading. One answer option, usually `c`, must act as a fallback such as `anderer Stock` or `anderer Ort`.

### Part 3: Personal Email

- Format: personal email, approximately 230 words.
- Task: 5 questions, each with 3 options (`a`, `b`, `c`).
- Generation rule: questions in generated JSON must follow the chronological order of the text. Correct answers should rely on semantic paraphrase instead of exact word matching.

### Part 4: Matching Advertisements

- Format: 6 short advertisements (`a` through `f`), no more than 240 words total.
- Task: match the correct advertisement to 5 people based on their needs.
- Generation rule: use arrays for both people and advertisements. Exactly one person has no suitable advertisement and must use answer `x`. Exactly one advertisement from `a` through `f` remains unused.

## Listening: Hoeren

> **Implementation status (Phase 1):** **Complete (iteration 1)** — Teile 1–4 practice, seed/on-demand audio, missing-audio lock UX. Mock-exam integration waits on Speaking + mock exam substages.

Time limit: 30 minutes. The module has four parts and 20 questions total.

### Part 1: Short Announcements

- Format: 5 independent audio texts, approximately 50 words each. Played twice.
- Task: 5 questions, each with 3 options (`a`, `b`, `c`).
- Generation rule: each transcript should mention words or concepts from all three answer options in different contexts to create realistic traps.

### Part 2: Long Dialogue Matching

- Format: informal conversation, approximately 220 words. Played once.
- Task: match 5 people to 9 options. Original exam options are pictures.
- Generation rule: replace pictures with an array of 9 short nouns or phrases, such as `das Auto`, `der Zug`, or `das Fahrrad`.

### Part 3: Short Dialogues

- Format: 5 independent everyday dialogues, approximately 55 words each. Played once.
- Task: 1 question per dialogue, each with 3 text options replacing original pictures.
- Generation rule: use negation traps. Speakers should mention all options, but the correct answer is determined through rejection or negation with words like `nein`, `nicht`, `leider nicht`, or `kein`.

### Part 4: Radio Interview

- Format: interview, approximately 220 words. Played twice.
- Task: 5 statements with `Ja` / `Nein` answers.
- Generation rule: `Ja` statements should use paraphrase and synonyms. `Nein` statements should distort facts or use antonyms. Statements should not copy exact phrases from the transcript.

## Writing: Schreiben

Time limit: 30 minutes. The module has two parts. Maximum raw score is 20 `Messpunkte`, multiplied by `1.25`. Each task provides 3 mandatory content points (`Inhaltspunkte`) that must be addressed.

### Part 1: Short Message Or SMS

- Format: short personal message in informal `du` register.
- Length: 20-30 words.
- Exam rule: dropping the subject at the start of a sentence is allowed, such as `Bin auf dem Weg` instead of `Ich bin auf dem Weg`. Emoticons are welcome. Signing with a name is optional.
- Zero-score rule: fewer than 10 words gives the entire part 0 points.

### Part 2: Email

- Format: semi-formal or formal email in `Sie` register.
- Length: 30-40 words.
- Exam rule: formal greeting and sign-off with the student's full name are mandatory. The answer must use basic connectors such as `und`, `aber`, `weil`, or `denn`.
- Zero-score rule: fewer than 15 words gives the entire part 0 points.

## Speaking: Sprechen

Time limit: 15 minutes. The module has three interactive parts. The app may use STT and TTS for interaction and evaluation. Speaking points are not multiplied.

> **Implementation status (Phase 1):** Listening is complete (iteration 1). Speaking is the **next skill** — Teil 1–2 UI/recorder/seed exist; STT, wired AI review, Teil 3, and pronunciation scoring are still open. See `roadmap.md` §1.1 Speaking plan.

### Part 1: Interview Or Introduction

- Points: 4.
- Format: 4 prompt cards containing single words, such as `Internet` or `Urlaub`, centered around a common theme.
- Task: the user formulates 4 questions based on the cards and gives detailed answers to the partner's questions, not single-word responses.
- Generation rule: ideal answer scripts should include natural conversational reactions such as `Ach so`, `Aha`, or `Toll` before moving to the next question.

### Part 2: Monologue

- Points: 8.
- Format: task card with a main theme or question and 4 keywords.
- Task: deliver a coherent monologue covering all 4 keywords, approximately 40-60 words, then answer 1-2 examiner follow-up questions.
- Review rule: evaluate task completion across all 4 points and linguistic realization, especially use of simple conjunctions for a fluid narrative.

### Part 3: Joint Planning

- Points: 8.
- Format: interactive dialogue to arrange a meeting or activity. Both partners have individual schedules containing occupied slots.
- Task: propose meeting times, politely decline conflicting times while giving a reason, and eventually agree on a shared free slot.
- Generation rule: create `userSchedule` and `aiSchedule` with conflicts, but mathematically guarantee at least 1 or 2 common free time slots. The AI partner rejects proposals based on its own schedule. Review the full STT/TTS chat log for interactivity and task fulfillment.

### Pronunciation

- Points: 5.
- Review rule: evaluate separately from the three speaking task parts.

## Implementation Rules

- Store built-in Goethe A2 exercises and prompt templates as typed seed data under the relevant `data/{skill}/` module.
- Keep reusable data structures exam-agnostic where possible, then map Goethe A2 specifics through exam IDs, module metadata, task definitions, and prompt templates.
- AI generation and review prompts must encode the trap rules above, not just the surface task format.
- Mock exam mode should use the module time limits and scoring rules in this document.
- **Phase 1:** core practice is offline-capable without AI (localStorage). AI-generated variants are optional enhancements and must degrade gracefully when AI is unavailable.
- **Phase 2 onward:** core attempts, drafts, and results live in PostgreSQL via the NestJS API on the local Docker Compose stack; AI remains optional.