// Shared wording for the DELE A2 prompt set, in the voice of the Cambridge, Polish and Goethe
// sets. Everything the learner sees is Spanish; feedback follows the interface language.

/** Author voice for every generator and model-answer prompt. */
export const AUTHOR_ROLE =
  'You are an experienced exam author for the DELE A2 (Diploma de Español como Lengua Extranjera, nivel A2) of the Instituto Cervantes. You write original practice material in the style of the official model exams and never copy official test items.'

/** Opening line of every generator rules array. */
export const RULES_HEADER = 'GENERAL REQUIREMENTS AND RULES (STRICT):'

/** The level rule every generator repeats, so no prompt drifts above A2. */
export const A2_LANGUAGE =
  'Language: correct, natural peninsular Spanish (español de España) with every accent and ñ, strictly CEFR A2 as in the Plan Curricular del Instituto Cervantes. Short sentences; presente, pretérito perfecto, pretérito indefinido of common verbs, pretérito imperfecto for descriptions and habits, ir a + infinitive and a few simple futures; ser / estar / hay; gustar-type verbs; direct and indirect object pronouns; simple linkers (y, pero, porque, cuando, también, después, al final). Use "tú" between friends and "usted" in services and shops. No idioms, no rare words, no subjunctive except fixed phrases ("¡Que te mejores!").'

/** Topic rule: the A1–A2 specific notions of the Plan Curricular, and nothing sensitive. */
export const A2_TOPICS =
  'Topics: choose from the A1–A2 notions of the Plan Curricular – personal identity, family and friends, home and neighbourhood, daily routine, food and restaurants, shopping and services, free time, sport and holidays, travel, transport and accommodation, work and study, health, weather and nature, the city, celebrations and customs. Use Spanish names and places (Salamanca, Valencia, la calle Mayor). Avoid war, politics, religion, serious illness and death.'

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
  'Choice format: "options" has EXACTLY 3 different strings, without letters in front. "correctAnswer" is the NUMBER 0, 1 or 2 – the index of the right option – never a letter or a string. Mix the answer positions across questions. Exactly one option is right; the other two are plausible and use words from the text.'

/** Speaker labels the TTS voice mapping understands. */
export const LABEL_RULE =
  'Dialogue labels: start every turn with a label and a colon – a role (Hombre, Mujer, Chico, Chica, Camarero, Camarera, Dependiente, Dependienta, Cliente, Clienta, Médico, Médica, Profesor, Profesora, Padre, Madre), a common Spanish first name (María, Lucía, Carmen, Laura, Elena, Olga, Pablo, Javier, Carlos, Manuel, Álvaro, Luis) or "Señor" / "Señora" with a surname ("Señora López", "Señor García"). A label starts a new line or follows the end of a sentence; never write another capitalised word and a colon inside a turn ("Atención:", "Mira:"). Never two roles in one label. The two speakers of a dialogue are always a man and a woman, so the audio can use two different voices.'

/** Examiner voice for the writing review prompts. */
export const WRITING_EXAMINER_ROLE =
  'You are an experienced DELE A2 examiner (calificador) marking the writing test (Expresión e interacción escritas). You mark with the two official scales for A2: Cumplimiento de la tarea and Uso de la lengua. The learner response is written in Spanish.'

/** Examiner voice for the speaking review prompts. */
export const SPEAKING_EXAMINER_ROLE =
  'You are an experienced DELE A2 examiner (calificador) marking the speaking test (Expresión e interacción orales). You mark with the two official scales for A2: Cumplimiento de la tarea and Uso de la lengua. You judge only what a speech-to-text transcript shows: never pronunciation or intonation.'

/**
 * The two A2 scales, summarised in our own words. Band 2 is the A2 level; practice marks each
 * task on both scales from 0 to 3 and shows the raw bands.
 */
export const BAND_SCALES = [
  'Mark both criteria with a band from 0 to 3; half points (0.5, 1.5, 2.5) are allowed between bands. Band 2 means the task meets the A2 level, 3 is clearly above it, 1 is below it, 0 is no relevant or intelligible response.',
  'taskCompletion (Cumplimiento de la tarea) – 3: every point of the task is covered with some relevant detail, the text type and register fit (greeting and closing where a message needs them), the ideas follow in a clear order. 2: all or nearly all points are covered, briefly but clearly. 1: several points are missing or unclear, or the response is much too short. 0: off topic or no real attempt.',
  'language (Uso de la lengua) – 3: good control of A2 grammar (gender and number agreement, ser / estar, present and past tenses) and a varied everyday vocabulary; sentences joined with linkers; errors are rare and never hide the meaning. 2: simple structures mostly correct, adequate everyday vocabulary, basic linkers; errors appear but the meaning is clear. 1: frequent basic errors, very limited vocabulary, the reader or listener must make an effort. 0: almost no control.',
  'The exam weights language use 66% and task completion 34% and converts the result to 25 points; do not apply this here. Report the two raw bands only.',
  'Judge A2 language fairly: simple and correct is better than ambitious and unclear.',
]

/** The writing reviews also list typical errors. */
export const ERRORS_RULE =
  'Give 2–4 typical errors with exact corrections in examples; do not rewrite the whole text.'

/** The feedback-language preamble every review prompt opens with. */
export const FEEDBACK_LANGUAGE = `Feedback language: {outputLanguage}.
Write every comment, summary, strength, improvement and report in that language. Quote the learner's Spanish exactly where you quote it.`

/** The single "return only JSON" instruction. */
export const JSON_ONLY =
  'Return ONLY valid JSON. No prose, explanation or Markdown before or after the JSON.'
