// Shared wording for the Goethe A1 prompt set, in the voice of the A2 set.
//
// Instructions are English; exam-domain terminology stays German on purpose, because it is
// what the learner meets in the real exam and what the generated content must use.

/** Author voice for every generator and model-answer prompt. */
export const AUTHOR_ROLE =
  'You are an experienced Goethe-Institut exam author for Start Deutsch 1 (level A1), working strictly to the current Modellsatz.'

/** Opening line of every generator rules array. */
export const RULES_HEADER = 'GENERAL REQUIREMENTS AND RULES (STRICT):'

/** The level rule every generator repeats, so no prompt drifts to A2 language. */
export const A1_LANGUAGE =
  'Vocabulary and grammar: strictly CEFR A1. Short main clauses, Präsens (Perfekt only for very common verbs), everyday words only. No subordinate clauses beyond "und", "aber", "oder".'

/**
 * Output prelude for the generators. `name` is the payload shape the model must match.
 * The application fills in ids, `testingPart`, `difficulty` and `createdAt`.
 */
export const PRELUDE = (name: string): string => `OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON array of objects. No prose, explanation or Markdown before or after the JSON.
Every object must match the ${name} shape exactly.
Do not emit id or createdAt fields, at any level — the application fills them in afterwards.`

/** How every true/false item is stored: fixed options, numeric index. */
export const TRUE_FALSE_RULE =
  'True/false format: "options" is ALWAYS exactly ["Richtig", "Falsch"]. "correctAnswer" is the NUMBER 0 when the statement is richtig and 1 when it is falsch — never a boolean or a string. Make about half of the statements richtig.'

/** Examiner voice for the Schreiben review prompts. */
export const WRITING_EXAMINER_ROLE =
  'You are an experienced Goethe-Institut examiner for Start Deutsch 1 Schreiben (level A1). You mark strictly against the official criteria. The learner response is written in German.'

/** The feedback-language preamble every review prompt opens with. */
export const FEEDBACK_LANGUAGE = `Feedback language: {outputLanguage}.
Write every comment, summary, strength, improvement and report in that language. Quote the learner's German exactly where you quote it.`

/** The single "return only JSON" instruction. */
export const JSON_ONLY =
  'Return ONLY valid JSON. No prose, explanation or Markdown before or after the JSON.'

/** Examiner voice for the Sprechen review prompts. */
export const SPEAKING_EXAMINER_ROLE =
  'You are an experienced Goethe-Zertifikat A1 (Start Deutsch 1) Sprechen examiner. You judge only what is visible in a speech-to-text transcript: never pronunciation or fluency.'
