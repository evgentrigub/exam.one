// Shared wording for the Polish A2 prompt set, in the voice of the Cambridge and Goethe sets.
// Everything the learner sees is Polish; feedback follows the interface language.

/** Author voice for every generator and model-answer prompt. */
export const AUTHOR_ROLE =
  'You are an experienced exam author for the Polish state certificate exam in Polish as a foreign language (Państwowy egzamin certyfikatowy z języka polskiego jako obcego), level A2 for adults. You write original practice material in the style of the official sample tasks and never copy official test items.'

/** Opening line of every generator rules array. */
export const RULES_HEADER = 'GENERAL REQUIREMENTS AND RULES (STRICT):'

/** The level rule every generator repeats, so no prompt drifts above A2. */
export const A2_LANGUAGE =
  'Language: correct, natural standard Polish with every diacritic (ą ć ę ł ń ó ś ź ż), strictly CEFR A2. Short sentences; present, past and future tenses (perfective and imperfective pairs of common verbs), all seven cases of common nouns, adjectives and pronouns, modal verbs (móc, musieć, chcieć, lubić), simple linkers (i, a, ale, bo, więc, potem, kiedy). Use "Pan / Pani" forms for formal address. No idioms, no rare words, no complex participles.'

/** Topic rule: the A2 thematic scope of the exam standards, and nothing sensitive. */
export const A2_TOPICS =
  'Topics: choose from the A2 thematic scope – personal information, family and friends, home and flat, daily routine, free time and hobbies, shopping and services, food and restaurants, travel and transport, city and orientation, weather and seasons, health and the body, school, work and study, holidays and celebrations. Use Polish names and places (Kraków, Gdańsk, ulica Długa). Avoid war, politics, religion, serious illness and death.'

/**
 * Output prelude for the generators. `name` is the payload shape the model must match.
 * The application fills in ids, `testingPart`, `difficulty` and `createdAt`.
 */
export const PRELUDE = (name: string): string => `OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON array of {count} objects. No prose, explanation or Markdown before or after the JSON.
Every object must match the ${name} shape exactly.
Do not emit id, createdAt, testingPart or difficulty fields, at any level – the application fills them in.`

/** How every three-option question is stored. */
export const CHOICE_RULE =
  'Choice format: "options" has EXACTLY 3 different strings, without letters in front. "correctAnswer" is the NUMBER 0, 1 or 2 – the index of the right option – never a letter or a string. Mix the answer positions across questions. Exactly one option is right; the other two are plausible.'

/** How every numbered gap is marked in a text. */
export const GAP_MARKER_RULE =
  'Gap markers: mark each gap in the text as "(1) ____", "(2) ____" … (the number in brackets and four underscores), numbered in order, each exactly once. There is no example gap (0).'

/** How every typed-answer gap is stored and marked. */
export const GAP_RULE =
  'Typed gaps: each gap is one entry in "questions", in the same order, with "question" (its label), "accepted" and "explanation" – and NO "options" or "correctAnswer". "accepted" lists EVERY answer that earns the point, because answers are compared exactly apart from case, spaces and a final full stop: a number in digits and in words ("15", "piętnaście"), times as "8:30", "8.30" and "8 30", dates as "12 maja" and "12.05", a price with and without the currency ("25 zł", "25"). Never list two answers that differ only by a final full stop or by case. Every accepted answer is spelled correctly with its diacritics; never list misspellings.'

/** Speaker labels the TTS voice mapping understands. */
export const LABEL_RULE =
  'Dialogue labels: start every turn with a label and a colon – a role (Kobieta, Mężczyzna, Chłopak, Dziewczyna, Mama, Tata, Sprzedawca, Sprzedawczyni, Kelner, Kelnerka, Lekarz, Lekarka, Klient, Klientka, Recepcjonistka), a common Polish first name (Anna, Kasia, Ewa, Marta, Piotr, Tomek, Marek, Kuba) or "Pan" / "Pani" with a surname ("Pani Nowak", "Pan Kowalski"). Never "Pan." or two roles in one label. Two speakers in one dialogue are a man and a woman, or have clearly different names, so the audio can use two voices.'

/** Examiner voice for the writing review prompts. */
export const WRITING_EXAMINER_ROLE =
  'You are an experienced examiner of the Polish state certificate exam, level A2, marking the writing module. You mark with the exam criteria: task completion (wykonanie zadania), range of language (bogactwo językowe) and accuracy (poprawność językowa). The learner response is written in Polish.'

/** Examiner voice for the speaking review prompts. */
export const SPEAKING_EXAMINER_ROLE =
  'You are an experienced examiner of the Polish state certificate exam, level A2, marking the speaking module. You judge only what a speech-to-text transcript shows: never pronunciation, intonation or fluency.'

/** The feedback-language preamble every review prompt opens with. */
export const FEEDBACK_LANGUAGE = `Feedback language: {outputLanguage}.
Write every comment, summary, strength, improvement and report in that language. Quote the learner's Polish exactly where you quote it.`

/** The single "return only JSON" instruction. */
export const JSON_ONLY =
  'Return ONLY valid JSON. No prose, explanation or Markdown before or after the JSON.'
