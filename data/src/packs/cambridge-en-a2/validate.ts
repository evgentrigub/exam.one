// Per-part checks on a generated A2 Key payload, beyond what the projected view can express.
//
// `validateView` checks counts, option counts, answer ranges and accepted-answer lists on the
// projection. These guards assert what the projection drops: the metadata the screens show,
// numbered gaps that match the questions, one-word open-cloze answers, labelled dialogue
// turns for TTS, and the examiner cards of the speaking parts.

import { normalizeGapAnswer, type PartRuntime } from '../../runtime'

const READING_TEXT_TYPE: Record<number, string> = {
  1: 'notice',
  2: 'article',
  3: 'article',
  4: 'article',
  5: 'email',
}

/** `(1) ____`: a numbered gap in a text or a page of notes. `(0)` marks the worked example. */
const GAP_MARKER = /\((\d+)\)\s*_{2,}/g

/** A dialogue turn label: one capitalised word such as `Man:`, `Assistant:` or `Katie:`. */
const TURN_LABEL = /(?:^|\s)([A-Z][a-z]{1,20}):\s/g

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
  if (!Array.isArray(value) || value.length !== count) fail(`${field} must contain exactly ${count} entries`)
  return value.map((row, index) => {
    if (!isRecord(row)) fail(`${field}[${index}] must be an object`)
    return row
  })
}

function requireOptions(row: Record<string, unknown>, at: string, count: number): string[] {
  const options = row['options']
  if (!Array.isArray(options) || options.length !== count) fail(`${at}.options must contain exactly ${count} entries`)
  options.forEach((option, index) => requireString(option, `${at}.options[${index}]`))
  const answer = row['correctAnswer']
  if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= count)
    fail(`${at}.correctAnswer must be an index from 0 to ${count - 1}`)
  return options as string[]
}

/** The gap numbers in a text must be exactly 1..count, each once, in order. */
function requireGapMarkers(text: unknown, field: string, count: number): void {
  requireString(text, field)
  const numbers = [...String(text).matchAll(GAP_MARKER)].map(match => Number(match[1])).filter(n => n > 0)
  const expected = Array.from({ length: count }, (_, i) => i + 1)
  if (numbers.join(',') !== expected.join(','))
    fail(`${field} must contain the gaps (1) ____ to (${count}) ____, each once and in order`)
}

/** A typed gap: its label, explanation and accepted answers, all distinct and short enough. */
function requireGap(row: Record<string, unknown>, at: string, maxWords: number): void {
  requireString(row['question'], `${at}.question`)
  requireString(row['explanation'], `${at}.explanation`)
  if ('options' in row || 'correctAnswer' in row) fail(`${at} is a gap: use accepted, not options or correctAnswer`)
  const accepted = row['accepted']
  if (!Array.isArray(accepted) || !accepted.length) fail(`${at}.accepted must list at least one answer`)
  accepted.forEach((answer, index) => requireString(answer, `${at}.accepted[${index}]`))
  const normalized = (accepted as string[]).map(normalizeGapAnswer)
  if (new Set(normalized).size !== normalized.length) fail(`${at}.accepted must not repeat an answer`)
  if (normalized.some(answer => answer.split(' ').length > maxWords))
    fail(`${at}.accepted answers must be at most ${maxWords} word${maxWords === 1 ? '' : 's'}`)
}

function speakers(transcript: unknown): Set<string> {
  return new Set([...String(transcript).matchAll(TURN_LABEL)].map(match => match[1]!))
}

function requireDialogue(transcript: unknown, at: string, minTurns: number): void {
  requireString(transcript, at)
  const turns = [...String(transcript).matchAll(TURN_LABEL)].length
  if (turns < minTurns || speakers(transcript).size < 2)
    fail(`${at} must be a dialogue of at least ${minTurns} turns labelled with one word ("Man: …", "Katie: …")`)
}

/** Reading: the reading screen's metadata, and the per-part question shape. */
export function validateReading(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  requireString(payload['content'], 'content')
  if (payload['textType'] !== READING_TEXT_TYPE[part])
    fail(`textType must be "${READING_TEXT_TYPE[part]}" for part ${part}`)
  if (typeof payload['estimatedReadingTime'] !== 'number') fail('estimatedReadingTime must be a number')
  if (typeof payload['wordCount'] !== 'number') fail('wordCount must be a number')
  if (!Array.isArray(payload['topics']) || payload['topics'].some(t => typeof t !== 'string'))
    fail('topics must be an array of strings')

  const count = rules.questionCount ?? 0
  const questions = requireRows(payload['questions'], 'questions', count)
  if (part === 4 || part === 5) requireGapMarkers(payload['content'], 'content', count)
  if (part === 2 && !['A:', 'B:', 'C:'].every(label => String(payload['content']).includes(label)))
    fail('content must label its three texts "A:", "B:" and "C:"')

  let firstOptions: string | undefined
  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    if (part === 5) return requireGap(row, at, 1)
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    const options = requireOptions(row, at, rules.optionCount ?? 3)
    if (part === 1 && !String(row['question']).startsWith(`Text ${index + 1}`))
      fail(`${at}.question must start with "Text ${index + 1}"`)
    if (part === 2) {
      firstOptions ??= options.join('|')
      if (options.join('|') !== firstOptions) fail('every question must offer the same three texts')
    }
  })
}

/** Listening: one recording per item (1, 4) or one shared recording (2, 3, 5). */
export function validateListening(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  const count = rules.questionCount ?? 5
  requireString(payload['title'], 'title')

  if (part === 1 || part === 4) {
    const items = requireRows(payload['items'], 'items', count)
    items.forEach((row, index) => {
      const at = `items[${index}]`
      requireString(row['context'], `${at}.context`)
      requireString(row['question'], `${at}.question`)
      requireString(row['explanation'], `${at}.explanation`)
      requireOptions(row, at, rules.optionCount ?? 3)
      if (part === 1) requireDialogue(row['transcript'], `${at}.transcript`, 2)
      else requireString(row['transcript'], `${at}.transcript`)
    })
    return
  }

  requireString(payload['context'], 'context')
  if ('items' in payload) fail('this part uses one shared transcript, not items')
  const questions = requireRows(payload['questions'], 'questions', count)
  if (part === 2) {
    requireString(payload['transcript'], 'transcript')
    requireGapMarkers(payload['content'], 'content', count)
    questions.forEach((row, index) => requireGap(row, `questions[${index}]`, 3))
    return
  }

  requireDialogue(payload['transcript'], 'transcript', 6)
  if (part === 3) {
    // Top-level options would make the screen read this as a matching task.
    if ('options' in payload) fail('part 3 questions carry their own options')
    questions.forEach((row, index) => {
      const at = `questions[${index}]`
      requireString(row['question'], `${at}.question`)
      requireString(row['explanation'], `${at}.explanation`)
      requireOptions(row, at, rules.optionCount ?? 3)
    })
    return
  }

  const options = payload['options']
  if (!Array.isArray(options) || options.length !== (rules.optionCount ?? 8))
    fail(`options must contain exactly ${rules.optionCount ?? 8} entries`)
  options.forEach((option, index) => requireString(option, `options[${index}]`))
  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    requireString(row['person'], `${at}.person`)
    requireString(row['explanation'], `${at}.explanation`)
    if ('options' in row) fail(`${at} must use the shared options`)
  })
}

const WRITING_TOPIC_TYPES: Record<number, readonly string[]> = { 1: ['email', 'note'], 2: ['story'] }

/** Writing: the writing-screen metadata; Part 6 has three points, Part 7 three pictures. */
export function validateWriting(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  requireString(payload['description'], 'description')
  requireString(payload['task'], 'task')
  const types = WRITING_TOPIC_TYPES[part] ?? []
  if (!types.includes(String(payload['topicType']))) fail(`topicType must be one of ${types.join(', ')}`)
  if (typeof payload['estimatedTime'] !== 'number') fail('estimatedTime must be a number')
  if (!Array.isArray(payload['category']) || payload['category'].some(c => typeof c !== 'string'))
    fail('category must be an array of strings')
  const requirements = payload['requirements']
  if (!Array.isArray(requirements) || requirements.some(r => typeof r !== 'string' || !r.trim()))
    fail('requirements must be an array of strings')
  if (part === 1 && requirements.length !== 3) fail('requirements must list the 3 content points')
  if (part === 2) {
    const pictures = requireRows(
      Array.isArray(payload['pictures']) ? payload['pictures'].map(text => ({ text })) : undefined,
      'pictures',
      3
    )
    pictures.forEach((row, index) => requireString(row['text'], `pictures[${index}]`))
  }
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

const SPEAKING_TOPIC_TYPE: Record<number, string> = { 1: 'interview', 2: 'discussion' }

/** Part 1 is five examiner questions; part 2 adds one question to the partner, second. */
const CARD_KINDS: Record<number, readonly string[]> = {
  1: ['answer', 'answer', 'answer', 'answer', 'answer'],
  2: ['answer', 'ask', 'answer', 'answer', 'answer'],
}

/**
 * Speaking: a card exchange, one card per configured segment, in order. The screen draws the
 * card above its recording, so a missing card is a missing recording.
 */
export function validateSpeaking(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['theme'], 'theme')
  if (payload['topicType'] !== SPEAKING_TOPIC_TYPE[part])
    fail(`topicType must be "${SPEAKING_TOPIC_TYPE[part]}" for part ${part}`)
  if (part === 2) {
    const pictures = payload['pictures']
    if (!Array.isArray(pictures) || pictures.length !== 5) fail('pictures must name exactly 5 things')
    pictures.forEach((picture, index) => requireString(picture, `pictures[${index}]`))
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
    if (kind === 'answer' && card['speaker'] !== 'examiner') fail(`${at}.speaker must be "examiner"`)
    if (kind === 'ask' && card['speaker'] !== undefined) fail(`${at} is the learner's own card and has no speaker`)
  })
}
