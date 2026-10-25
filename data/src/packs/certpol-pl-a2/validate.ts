// Per-part checks on a generated Polish A2 payload, beyond what the projected view can express.
//
// `validateView` checks counts, option counts, answer ranges, unique matching answers and
// accepted-answer lists on the projection. These guards assert what the projection drops: the
// metadata the screens show, numbered gaps that match the questions, shared option banks,
// the "Prawda / Fałsz" options, labelled dialogue turns for TTS, and the speaking cards.

import { normalizeGapAnswer, type PartRuntime } from '../../runtime'

export const TRUE_FALSE_OPTIONS = ['Prawda', 'Fałsz'] as const

const READING_TEXT_TYPE: Record<number, string> = {
  1: 'email',
  2: 'article',
  3: 'notice',
  4: 'announcement',
  5: 'article',
  6: 'article',
}

/** The label each question of a reading part starts with, numbered from 1. */
const READING_QUESTION_PREFIX: Record<number, string> = {
  1: 'Luka',
  2: 'Luka',
  3: 'Napis',
  4: 'Tekst',
  6: 'Scena',
}

/** `(1) ____`: a numbered gap in a text, a form or a page of notes. */
const GAP_MARKER = /\((\d+)\)\s*_{2,}/g

/**
 * A dialogue turn label: a role or first name (`Kobieta:`, `Łucja:`), or `Pan` / `Pani` with a
 * name (`Pani Nowak:`), as the TTS voice mapping reads them.
 */
const TURN_LABEL =
  /(?:^|\s)((?:Pan|Pani) [A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{1,20}|[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{1,20}):\s/g

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(message: string): never {
  throw new Error(`Generated exercise is invalid: ${message}`)
}

function requireString(value: unknown, field: string): void {
  if (typeof value !== 'string' || !value.trim()) fail(`${field} must be a non-empty string`)
}

function requireRows(value: unknown, field: string, count: number): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length !== count)
    fail(`${field} must contain exactly ${count} entries`)
  return value.map((row, index) => {
    if (!isRecord(row)) fail(`${field}[${index}] must be an object`)
    return row
  })
}

function requireOptions(row: Record<string, unknown>, at: string, count: number): string[] {
  const options = row['options']
  if (!Array.isArray(options) || options.length !== count)
    fail(`${at}.options must contain exactly ${count} entries`)
  options.forEach((option, index) => requireString(option, `${at}.options[${index}]`))
  if (new Set(options.map(option => String(option).trim().toLowerCase())).size !== count)
    fail(`${at}.options must all be different`)
  const answer = row['correctAnswer']
  if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= count)
    fail(`${at}.correctAnswer must be an index from 0 to ${count - 1}`)
  return options as string[]
}

/** A top-level option bank shared by every question of a matching task. */
function requireBank(value: unknown, field: string, count: number): void {
  if (!Array.isArray(value) || value.length !== count)
    fail(`${field} must contain exactly ${count} entries`)
  value.forEach((option, index) => requireString(option, `${field}[${index}]`))
  if (new Set(value.map(option => String(option).trim().toLowerCase())).size !== count)
    fail(`${field} must all be different`)
}

/** The gap numbers in a text must be exactly 1..count, each once, in order. */
function requireGapMarkers(text: unknown, field: string, count: number): void {
  requireString(text, field)
  const numbers = [...String(text).matchAll(GAP_MARKER)]
    .map(match => Number(match[1]))
    .filter(n => n > 0)
  const expected = Array.from({ length: count }, (_, i) => i + 1)
  if (numbers.join(',') !== expected.join(','))
    fail(`${field} must contain the gaps (1) ____ to (${count}) ____, each once and in order`)
}

/** A typed gap: its label, explanation and accepted answers, all distinct and short enough. */
function requireGap(row: Record<string, unknown>, at: string, maxWords: number): void {
  requireString(row['question'], `${at}.question`)
  requireString(row['explanation'], `${at}.explanation`)
  if ('options' in row || 'correctAnswer' in row)
    fail(`${at} is a gap: use accepted, not options or correctAnswer`)
  const accepted = row['accepted']
  if (!Array.isArray(accepted) || !accepted.length)
    fail(`${at}.accepted must list at least one answer`)
  accepted.forEach((answer, index) => requireString(answer, `${at}.accepted[${index}]`))
  const normalized = (accepted as string[]).map(normalizeGapAnswer)
  if (new Set(normalized).size !== normalized.length)
    fail(`${at}.accepted must not repeat an answer`)
  if (normalized.some(answer => answer.split(' ').length > maxWords))
    fail(`${at}.accepted answers must be at most ${maxWords} words`)
}

function requireDialogue(transcript: unknown, at: string, minTurns: number): void {
  requireString(transcript, at)
  const labels = [...String(transcript).matchAll(TURN_LABEL)].map(match => match[1]!)
  if (labels.length < minTurns || new Set(labels).size < 2)
    fail(
      `${at} must have at least ${minTurns} turns by at least two speakers, labelled "Kobieta: …", "Pani Nowak: …" or "Łucja: …"`
    )
}

function requirePrefix(row: Record<string, unknown>, at: string, prefix: string, n: number): void {
  if (!String(row['question']).startsWith(`${prefix} ${n}`))
    fail(`${at}.question must start with "${prefix} ${n}"`)
}

/** Reading: the reading screen's metadata, and the per-part question shape. */
export function validateReading(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  requireString(payload['content'], 'content')
  if (payload['textType'] !== READING_TEXT_TYPE[part])
    fail(`textType must be "${READING_TEXT_TYPE[part]}" for part ${part}`)
  if (typeof payload['estimatedReadingTime'] !== 'number')
    fail('estimatedReadingTime must be a number')
  if (typeof payload['wordCount'] !== 'number') fail('wordCount must be a number')
  if (!Array.isArray(payload['topics']) || payload['topics'].some(t => typeof t !== 'string'))
    fail('topics must be an array of strings')

  const count = rules.questionCount ?? 0
  const questions = requireRows(payload['questions'], 'questions', count)
  if (part === 1 || part === 2 || part === 5)
    requireGapMarkers(payload['content'], 'content', count)
  if (part === 3 || part === 4 || part === 6) {
    const label = part === 3 ? 'Napis' : part === 4 ? 'Tekst' : 'Scena'
    for (let n = 1; n <= count; n += 1)
      if (!String(payload['content']).includes(`${label} ${n}`))
        fail(`content must label its texts "${label} 1" to "${label} ${count}"`)
  }

  let bank: string | undefined
  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    if (part === 5) return requireGap(row, at, 4)
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    const options = requireOptions(row, at, rules.optionCount ?? 3)
    requirePrefix(row, at, READING_QUESTION_PREFIX[part] ?? '', index + 1)
    if (part === 2 || part === 6) {
      bank ??= options.join('|')
      if (options.join('|') !== bank)
        fail('every question must offer the same options, in the same order')
    }
  })
}

/** Listening: one recording per item (1) or one shared recording (2–5). */
export function validateListening(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  const count = rules.questionCount ?? 5
  requireString(payload['title'], 'title')

  if (part === 1) {
    const items = requireRows(payload['items'], 'items', count)
    items.forEach((row, index) => {
      const at = `items[${index}]`
      requireString(row['context'], `${at}.context`)
      requireString(row['transcript'], `${at}.transcript`)
      requireString(row['question'], `${at}.question`)
      requireString(row['explanation'], `${at}.explanation`)
      requireOptions(row, at, rules.optionCount ?? 3)
    })
    return
  }

  requireString(payload['context'], 'context')
  requireString(payload['transcript'], 'transcript')
  if ('items' in payload) fail('this part uses one shared transcript, not items')
  const questions = requireRows(payload['questions'], 'questions', count)

  if (part === 2) {
    // A top-level bank or `statement` rows would make the screen read this as another task.
    if ('options' in payload) fail('part 2 questions carry their own options')
    questions.forEach((row, index) => {
      const at = `questions[${index}]`
      if ('statement' in row) fail(`${at} uses "question", not "statement"`)
      requireString(row['question'], `${at}.question`)
      requireString(row['explanation'], `${at}.explanation`)
      const options = requireOptions(row, at, 2)
      if (options.join('|') !== TRUE_FALSE_OPTIONS.join('|'))
        fail(`${at}.options must be exactly ["Prawda", "Fałsz"]`)
    })
    return
  }

  if (part === 5) {
    requireGapMarkers(payload['content'], 'content', count)
    questions.forEach((row, index) => requireGap(row, `questions[${index}]`, 4))
    return
  }

  requireDialogue(payload['transcript'], 'transcript', part === 3 ? 6 : count)
  requireBank(payload['options'], 'options', rules.optionCount ?? 0)
  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    requireString(row['person'], `${at}.person`)
    requireString(row['explanation'], `${at}.explanation`)
    if ('options' in row) fail(`${at} must use the shared options`)
    if (part === 4 && row['person'] !== `Wiadomość ${index + 1}`)
      fail(`${at}.person must be "Wiadomość ${index + 1}"`)
  })
}

const WRITING_TOPIC_TYPES: Record<number, readonly string[]> = {
  1: ['greeting', 'sms'],
  2: ['description', 'letter'],
}

/** How many guiding points each writing task lists. */
const WRITING_POINTS: Record<number, [number, number]> = { 1: [2, 3], 2: [3, 5] }

/** Writing: the writing-screen metadata, the guiding points and the part's word range. */
export function validateWriting(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  requireString(payload['description'], 'description')
  requireString(payload['task'], 'task')
  const types = WRITING_TOPIC_TYPES[part] ?? []
  if (!types.includes(String(payload['topicType'])))
    fail(`topicType must be one of ${types.join(', ')}`)
  if (typeof payload['estimatedTime'] !== 'number') fail('estimatedTime must be a number')
  if (!Array.isArray(payload['category']) || payload['category'].some(c => typeof c !== 'string'))
    fail('category must be an array of strings')
  const requirements = payload['requirements']
  if (!Array.isArray(requirements) || requirements.some(r => typeof r !== 'string' || !r.trim()))
    fail('requirements must be an array of strings')
  const [min, max] = WRITING_POINTS[part] ?? [1, 5]
  if (requirements.length < min || requirements.length > max)
    fail(`requirements must list ${min}–${max} guiding points`)
  // The practice screen gates submission on this range, so it must match the part's field.
  const field = rules.fields?.[0]
  const wordCount = payload['wordCount']
  if (
    !isRecord(wordCount) ||
    wordCount['min'] !== field?.minWords ||
    wordCount['max'] !== field?.maxWords
  )
    fail(`wordCount must be { "min": ${field?.minWords}, "max": ${field?.maxWords} }`)
}

const SPEAKING_TOPIC_TYPE: Record<number, string> = { 1: 'interview', 2: 'photo', 3: 'roleplay' }

/** Task 1 is four examiner questions; task 3 opens with the learner's own card. */
const CARD_KINDS: Record<number, readonly string[]> = {
  1: ['answer', 'answer', 'answer', 'answer'],
  3: ['ask', 'answer', 'answer', 'answer'],
}

/**
 * Speaking: the photo monologue has a description and four prompts; the other tasks are a card
 * exchange, one card per configured segment, in order.
 */
export function validateSpeaking(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['theme'], 'theme')
  if (payload['topicType'] !== SPEAKING_TOPIC_TYPE[part])
    fail(`topicType must be "${SPEAKING_TOPIC_TYPE[part]}" for part ${part}`)
  if (part === 2) {
    if ('cards' in payload) fail('the photo description has keywords, not cards')
    const keywords = payload['keywords']
    if (!Array.isArray(keywords) || keywords.length !== 4)
      fail('keywords must contain exactly 4 prompts')
    keywords.forEach((keyword, index) => requireString(keyword, `keywords[${index}]`))
    return
  }
  const ids = (rules.segments ?? []).map(segment => segment.id)
  const cards = requireRows(payload['cards'], 'cards', ids.length)
  cards.forEach((card, index) => {
    const at = `cards[${index}]`
    const kind = CARD_KINDS[part]?.[index]
    if (card['segment'] !== ids[index]) fail(`${at}.segment must be "${ids[index]}"`)
    if (card['kind'] !== kind) fail(`${at}.kind must be "${kind}"`)
    requireString(card['topic'], `${at}.topic`)
    requireString(card['cue'], `${at}.cue`)
    if (kind === 'answer' && card['speaker'] !== 'examiner')
      fail(`${at}.speaker must be "examiner"`)
    if (kind === 'ask' && card['speaker'] !== undefined)
      fail(`${at} is the learner's own card and has no speaker`)
  })
}
