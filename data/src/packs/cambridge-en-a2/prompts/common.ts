// Shared wording for the Cambridge A2 Key prompt set, in the voice of the Goethe sets.
// Everything the learner sees is British English; feedback follows the interface language.

/** Author voice for every generator and model-answer prompt. */
export const AUTHOR_ROLE =
  'You are an experienced exam author for Cambridge English A2 Key (2020 format). You write original practice material in the style of the handbook tasks and never copy official test items.'

/** Opening line of every generator rules array. */
export const RULES_HEADER = 'GENERAL REQUIREMENTS AND RULES (STRICT):'

/** The level rule every generator repeats, so no prompt drifts above A2. */
export const A2_LANGUAGE =
  'Language: British English, strictly CEFR A2 (the level of the A2 Key Vocabulary List). Short sentences; present simple and continuous, past simple, present perfect, going to and will, can / could / must / should; common linkers (and, but, because, so, when, then). No idioms or rare words.'

/** Topic rule: the handbook topic list, and nothing sensitive. */
export const A2_TOPICS =
  'Topics: choose from the A2 Key topic list – clothes, daily life, entertainment and media, food and drink, health and exercise, hobbies and leisure, house and home, language, people, personal feelings and opinions, places and buildings, school and study, services, shopping, social interaction, sport, the natural world, transport, travel and holidays, weather. Avoid war, politics, religion, serious illness and death.'

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
  'Choice format: "options" has EXACTLY 3 strings, without letters in front. "correctAnswer" is the NUMBER 0, 1 or 2 – the index of the right option – never a letter or a string. Mix the answer positions. Exactly one option is right; the other two are plausible and reuse words from the text or recording.'

/** How every typed-answer gap is stored and marked. */
export const GAP_RULE =
  'Gap format: mark each gap in the text as "(1) ____", "(2) ____" … (the number in brackets and four underscores), numbered in order, each exactly once. Each gap is one entry in "questions", in the same order, with "question" (its label), "accepted" and "explanation" – and NO "options" or "correctAnswer". "accepted" lists every answer that earns the mark: the answer and each acceptable variant (British and American spellings, a number in digits and in words, "6.30" and "6:30" for a time). Spelling must be correct, so never list misspellings.'

/** Speaker labels the TTS voice mapping understands. */
export const LABEL_RULE =
  'Dialogue labels: start every turn with ONE capitalised word and a colon – a role (Man, Woman, Boy, Girl, Mum, Dad, Mother, Father, Assistant, Teacher, Receptionist, Waiter) or a first name (Tom, Katie, Anna, Paul). No titles with full stops ("Mr."), no two-word labels. Two speakers in one dialogue are a man and a woman, or have clearly different names, so the audio can use two voices.'

/** Examiner voice for the writing review prompts. */
export const WRITING_EXAMINER_ROLE =
  'You are an experienced Cambridge English A2 Key writing examiner. You mark with the A2 Key writing assessment scale: Content, Organisation and Language, 0–5 each. The learner response is written in English.'

/** Examiner voice for the speaking review prompts. */
export const SPEAKING_EXAMINER_ROLE =
  'You are an experienced Cambridge English A2 Key speaking examiner. You judge only what a speech-to-text transcript shows: never pronunciation, intonation or fluency.'

/** The feedback-language preamble every review prompt opens with. */
export const FEEDBACK_LANGUAGE = `Feedback language: {outputLanguage}.
Write every comment, summary, strength, improvement and report in that language. Quote the learner's English exactly where you quote it.`

/** The single "return only JSON" instruction. */
export const JSON_ONLY =
  'Return ONLY valid JSON. No prose, explanation or Markdown before or after the JSON.'
