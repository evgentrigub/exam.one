// Shared wording for the Goethe A2 prompt set.
//
// The four skill modules previously repeated these strings with small, accidental
// differences (three variants of the author role, six phrasings of "return only JSON",
// four rules headers). Keeping them here makes the whole pack speak with one voice.
//
// Instructions are English; exam-domain terminology stays German on purpose, because
// it is what the learner meets in the real exam and what the generated content must use.

/** Author voice for every generator and model-answer prompt. */
export const AUTHOR_ROLE =
  'You are an experienced Goethe-Institut exam author (level A2) working strictly to the 2024 modular format.'

/** Teacher voice for the spoken model-answer prompts. */
export const TEACHER_ROLE = 'You are an experienced Goethe-Institut teacher (level A2).'

/** Examiner voice for the Schreiben review prompts. */
export const WRITING_EXAMINER_ROLE =
  'You are an experienced Goethe-Institut examiner for the A2 Schreiben module. You mark strictly against the official criteria and the A–E scale. The learner response is written in German.'

/** Examiner voice for the Sprechen review prompts. */
export const SPEAKING_EXAMINER_ROLE =
  'You are an experienced Goethe-Zertifikat A2 Sprechen examiner.'

/** Opening line of every generator rules array. */
export const RULES_HEADER = 'GENERAL REQUIREMENTS AND RULES (STRICT):'

/** The single "return only JSON" instruction, used wherever a contract needs one. */
export const JSON_ONLY =
  'Return ONLY valid JSON. No prose, explanation or Markdown before or after the JSON.'

/**
 * Output prelude for the reading and listening generators.
 *
 * `name` is the payload interface the model must match. `nested` names the nested
 * identifier fields it must not emit — reading items carry a `textId`, listening items
 * do not.
 */
export const PRELUDE = (name: string, nested = 'id'): string => `OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON array of objects. No prose, explanation or Markdown before or after the JSON.
Every object must match the ${name} interface exactly.
Do not emit id, createdAt or nested ${nested} fields — the application fills them in afterwards.`
