// Per-part checks on a generated payload, beyond what the projected view can express.
//
// `validateView` only sees the projection, so anything the projection discards or
// synthesises is invisible to it: the Goethe adapter coerces missing values into
// strings and builds `fields`/`segments` from the part rules, which makes those
// checks tautological. These guards assert the payload itself.

const READING_TEXT_TYPES = [
  'email',
  'notice',
  'article',
  'advertisement',
  'instructions',
  'announcement',
  'list',
] as const

const READING_QUESTION_TYPES = [
  'comprehension',
  'vocabulary',
  'grammar',
  'inference',
  'selective',
  'matching',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(message: string): never {
  throw new Error(`Generated exercise is invalid: ${message}`)
}

function requireString(value: unknown, field: string): void {
  if (typeof value !== 'string' || !value.trim()) fail(`${field} must be a non-empty string`)
}

function requireStringArray(value: unknown, field: string): void {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string'))
    fail(`${field} must be an array of strings`)
}

/**
 * Coerce a numeric answer index written as a string.
 *
 * Models routinely return `"2"` instead of `2`. The legacy normaliser accepted and
 * coerced it; `validateView` rejects it outright, so coerce before validating or the
 * generic path is stricter than the path it replaces.
 */
export function coerceAnswerIndices(payload: Record<string, unknown>): Record<string, unknown> {
  const rows = payload['questions'] ?? payload['items']
  if (!Array.isArray(rows)) return payload
  const coerced = rows.map(row => {
    if (!isRecord(row)) return row
    const answer = row['correctAnswer']
    if (typeof answer !== 'string') return row
    const parsed = Number(answer)
    return Number.isInteger(parsed) ? { ...row, correctAnswer: parsed } : row
  })
  return payload['questions'] ? { ...payload, questions: coerced } : { ...payload, items: coerced }
}

/** Reading: text metadata and per-question shape the projection drops. */
export function validateReading(payload: Record<string, unknown>): void {
  requireString(payload['title'], 'title')
  requireString(payload['content'], 'content')
  if (!READING_TEXT_TYPES.includes(payload['textType'] as (typeof READING_TEXT_TYPES)[number]))
    fail(`textType must be one of ${READING_TEXT_TYPES.join(', ')}`)
  if (typeof payload['estimatedReadingTime'] !== 'number') fail('estimatedReadingTime must be a number')
  if (typeof payload['wordCount'] !== 'number') fail('wordCount must be a number')
  requireStringArray(payload['topics'], 'topics')

  const questions = payload['questions']
  if (!Array.isArray(questions)) fail('questions must be an array')
  for (const [index, row] of questions.entries()) {
    const at = `questions[${index}]`
    if (!isRecord(row)) fail(`${at} must be an object`)
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    requireStringArray(row['options'], `${at}.options`)
    if (!READING_QUESTION_TYPES.includes(row['type'] as (typeof READING_QUESTION_TYPES)[number]))
      fail(`${at}.type must be one of ${READING_QUESTION_TYPES.join(', ')}`)
  }
}

/** Exactly five rows, which is the fixed Goethe A2 shape for every listening Teil. */
function requireFive(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length !== 5) fail(`${field} must contain exactly 5 entries`)
  return value as unknown[]
}

/**
 * Listening: contexts, transcripts and per-Teil item shape.
 *
 * `validateView` already covers the item count, the per-Teil option count and the answer
 * range, but it never sees a transcript — the projection carries it only as optional extra
 * data. A transcript-less exercise therefore validates, stores, and can never have audio
 * synthesised for it, because `collectListeningAudioSegments` skips empty transcripts.
 */
export function validateListening(payload: Record<string, unknown>): void {
  requireString(payload['title'], 'title')
  const part = payload['testingPart']

  // Teil 1 and 3 are five independent recordings: the transcript hangs off each item.
  if (part === 1 || part === 3) {
    for (const [index, row] of requireFive(payload['items'], 'items').entries()) {
      const at = `items[${index}]`
      if (!isRecord(row)) fail(`${at} must be an object`)
      if (part === 1) requireString(row['context'], `${at}.context`)
      requireString(row['transcript'], `${at}.transcript`)
      requireString(row['question'], `${at}.question`)
      requireString(row['explanation'], `${at}.explanation`)
    }
    return
  }

  // Teil 2 and 4 are one recording with five questions against it.
  requireString(payload['context'], 'context')
  requireString(payload['transcript'], 'transcript')
  if (part === 2) {
    if (!Array.isArray(payload['options']) || payload['options'].length !== 9)
      fail('options must contain exactly 9 entries')
    requireStringArray(payload['options'], 'options')
  }
  for (const [index, row] of requireFive(payload['questions'], 'questions').entries()) {
    const at = `questions[${index}]`
    if (!isRecord(row)) fail(`${at} must be an object`)
    requireString(row['explanation'], `${at}.explanation`)
    if (part === 2) {
      requireString(row['person'], `${at}.person`)
      continue
    }
    requireString(row['statement'], `${at}.statement`)
    if (typeof row['correctAnswer'] !== 'boolean') fail(`${at}.correctAnswer must be a boolean`)
    if (row['type'] !== 'true_false') fail(`${at}.type must be "true_false"`)
  }
}

const WRITING_TOPIC_TYPES = ['note', 'email'] as const

/**
 * Writing: the task text and its metadata.
 *
 * For writing, `validateView` is tautological — the adapter builds `fields` from the part
 * rules and `validateView` then compares them back to those same rules, so it can never
 * fail. Nothing checks the payload itself. That matters more here than elsewhere, because
 * `buildReviewVars` feeds `task` and `requirements` straight into the review prompt: a topic
 * generated without them would be graded against a blank exercise.
 */
export function validateWriting(payload: Record<string, unknown>): void {
  requireString(payload['title'], 'title')
  requireString(payload['description'], 'description')
  requireString(payload['task'], 'task')
  if (!WRITING_TOPIC_TYPES.includes(payload['topicType'] as (typeof WRITING_TOPIC_TYPES)[number]))
    fail(`topicType must be one of ${WRITING_TOPIC_TYPES.join(', ')}`)
  if (typeof payload['estimatedTime'] !== 'number') fail('estimatedTime must be a number')
  requireStringArray(payload['category'], 'category')

  const requirements = payload['requirements']
  requireStringArray(requirements, 'requirements')
  if ((requirements as string[]).length === 0) fail('requirements must not be empty')

  const wordCount = payload['wordCount']
  if (!isRecord(wordCount)) fail('wordCount must be an object')
  if (typeof wordCount['min'] !== 'number' || typeof wordCount['max'] !== 'number')
    fail('wordCount must have numeric min and max')
}
