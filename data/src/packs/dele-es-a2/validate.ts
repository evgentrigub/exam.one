// Per-part checks on a generated DELE A2 payload, beyond what the projected view can express.
//
// `validateView` checks counts, option counts, answer ranges and unique matching answers on the
// projection. These guards assert what the projection drops: the metadata the screens show,
// the labelled texts of a reading part, shared option banks, the man / woman / neither options,
// labelled dialogue turns for TTS, the writing word range and the speaking cards.

import type { PartRuntime } from '../../runtime'

/** The third option of listening Tarea 3. */
export const NEITHER = 'Ninguno de los dos'

/** The three options of reading Tarea 3, one per text. */
export const TEXT_OPTIONS = ['Texto A', 'Texto B', 'Texto C'] as const

const READING_TEXT_TYPE: Record<number, string> = {
  1: 'email',
  2: 'advertisement',
  3: 'article',
  4: 'article',
}

/**
 * A dialogue turn label: a role or first name (`Mujer:`, `Álvaro:`), or a title with a
 * surname (`Señora López:`), at the start of a line or a sentence, as the TTS voice mapping
 * reads them.
 */
const TURN_LABEL =
  /(?:^|\n|[.!?…»"]\s)((?:Señor|Señora|Señorita|Don|Doña) [A-ZÁÉÍÓÚÑ][a-záéíóúñü]{1,20}|[A-ZÁÉÍÓÚÑ][a-záéíóúñü]{1,20}):\s/g

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

function requireStrings(value: unknown, field: string, count: number): string[] {
  if (!Array.isArray(value) || value.length !== count)
    fail(`${field} must contain exactly ${count} entries`)
  value.forEach((item, index) => requireString(item, `${field}[${index}]`))
  if (new Set(value.map(item => String(item).trim().toLowerCase())).size !== count)
    fail(`${field} must all be different`)
  return value as string[]
}

function requireAnswer(row: Record<string, unknown>, at: string, count: number): void {
  const answer = row['correctAnswer']
  if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= count)
    fail(`${at}.correctAnswer must be an index from 0 to ${count - 1}`)
}

function requireOptions(row: Record<string, unknown>, at: string, count: number): string[] {
  const options = requireStrings(row['options'], `${at}.options`, count)
  requireAnswer(row, at, count)
  return options
}

function labels(transcript: unknown): string[] {
  return [...String(transcript).matchAll(TURN_LABEL)].map(match => match[1]!)
}

function requireDialogue(transcript: unknown, at: string, minTurns: number): string[] {
  requireString(transcript, at)
  const found = labels(transcript)
  if (found.length < minTurns || new Set(found).size < 2)
    fail(
      `${at} must have at least ${minTurns} turns by at least two speakers, labelled "Mujer: …", "Señor López: …" or "Lucía: …"`
    )
  return found
}

function requireLabelled(text: string, field: string, names: readonly string[]): void {
  for (const name of names)
    if (!text.includes(name))
      fail(`${field} must label its texts ${names.map(n => `"${n}"`).join(', ')}`)
}

function requireMeta(payload: Record<string, unknown>, part: number): void {
  requireString(payload['title'], 'title')
  requireString(payload['content'], 'content')
  if (payload['textType'] !== READING_TEXT_TYPE[part])
    fail(`textType must be "${READING_TEXT_TYPE[part]}" for part ${part}`)
  if (typeof payload['estimatedReadingTime'] !== 'number')
    fail('estimatedReadingTime must be a number')
  if (typeof payload['wordCount'] !== 'number') fail('wordCount must be a number')
  if (!Array.isArray(payload['topics']) || payload['topics'].some(t => typeof t !== 'string'))
    fail('topics must be an array of strings')
}

/** Reading: the reading screen's metadata, the labelled texts and the per-part question shape. */
export function validateReading(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireMeta(payload, part)
  const content = String(payload['content'])
  const count = rules.questionCount ?? 0
  const questions = requireRows(payload['questions'], 'questions', count)
  if (part === 2)
    requireLabelled(
      content,
      'content',
      Array.from({ length: count }, (_, i) => `Texto ${i + 1}`)
    )
  if (part === 3) requireLabelled(content, 'content', TEXT_OPTIONS)

  const used = new Set<number>()
  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    const options = requireOptions(row, at, rules.optionCount ?? 3)
    if (part === 2 && !String(row['question']).startsWith(`Texto ${index + 1}:`))
      fail(`${at}.question must start with "Texto ${index + 1}:"`)
    if (part === 3) {
      if (options.join('|') !== TEXT_OPTIONS.join('|'))
        fail(`${at}.options must be exactly ["Texto A", "Texto B", "Texto C"]`)
      used.add(row['correctAnswer'] as number)
    }
  })
  if (part === 3 && used.size !== TEXT_OPTIONS.length)
    fail('every text must answer at least one statement')
}

/** Listening Tareas 1 and 2: one recording per item, each with its own question. */
function validateItems(payload: Record<string, unknown>, rules: PartRuntime, part: number): void {
  if ('transcript' in payload || 'questions' in payload)
    fail('this part has one recording per item, in "items"')
  const items = requireRows(payload['items'], 'items', rules.questionCount ?? 6)
  items.forEach((row, index) => {
    const at = `items[${index}]`
    requireString(row['context'], `${at}.context`)
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    requireOptions(row, at, rules.optionCount ?? 3)
    if (part === 1) requireDialogue(row['transcript'], `${at}.transcript`, 2)
    else requireString(row['transcript'], `${at}.transcript`)
  })
}

/** Listening Tareas 3 and 4: one shared recording and a bank shared by every question. */
function validateShared(payload: Record<string, unknown>, rules: PartRuntime, part: number): void {
  requireString(payload['context'], 'context')
  if ('items' in payload) fail('this part uses one shared transcript, not items')
  const count = rules.questionCount ?? 0
  const questions = requireRows(payload['questions'], 'questions', count)
  const bank = requireStrings(payload['options'], 'options', rules.optionCount ?? 0)
  const speakers = requireDialogue(payload['transcript'], 'transcript', part === 3 ? 8 : count)

  if (part === 3) {
    if (bank[2] !== NEITHER) fail(`options[2] must be "${NEITHER}"`)
    for (const name of bank.slice(0, 2))
      if (!speakers.includes(name))
        fail(
          `options must name the two speakers as they are labelled in the transcript ("${name}" is not)`
        )
    if (new Set(speakers).size !== 2) fail('the conversation must have exactly two speakers')
  }

  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    requireString(row['person'], `${at}.person`)
    requireString(row['explanation'], `${at}.explanation`)
    if ('options' in row) fail(`${at} must use the shared options`)
    requireAnswer(row, at, bank.length)
    if (part === 4 && row['person'] !== `Mensaje ${index + 1}`)
      fail(`${at}.person must be "Mensaje ${index + 1}"`)
  })
}

/** Listening: one recording per item (1, 2) or one shared recording (3, 4). */
export function validateListening(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  if (part === 1 || part === 2) validateItems(payload, rules, part)
  else validateShared(payload, rules, part)
}

const WRITING_TOPIC_TYPES: Record<number, readonly string[]> = {
  1: ['email', 'note', 'post'],
  2: ['opcion-a', 'opcion-b'],
}

/** How many content points each writing task lists. */
const WRITING_POINTS: Record<number, [number, number]> = { 1: [4, 5], 2: [3, 5] }

/** Writing: the writing-screen metadata, the content points and the part's word range. */
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
    fail(`requirements must list ${min}–${max} content points`)
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

const SPEAKING_TOPIC_TYPE: Record<number, string> = { 1: 'monologue', 2: 'photo', 3: 'roleplay' }

/** The number of points on a presentation card, and of guide questions for a scene. */
const KEYWORDS = 5

/** The examiner opens and leads the role-play; the learner asks one question of their own. */
const CARD_KINDS = ['answer', 'answer', 'ask', 'answer'] as const

/**
 * Speaking: tasks 1 and 2 are keyword monologues; task 3 is a card exchange, one card per
 * configured segment, in order, with the examiner's lines marked `speaker: 'examiner'`.
 */
export function validateSpeaking(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['theme'], 'theme')
  if (payload['topicType'] !== SPEAKING_TOPIC_TYPE[part])
    fail(`topicType must be "${SPEAKING_TOPIC_TYPE[part]}" for part ${part}`)
  if (part === 1 || part === 2) {
    if ('cards' in payload) fail('this task has keywords, not cards')
    requireStrings(payload['keywords'], 'keywords', KEYWORDS)
    return
  }
  const ids = (rules.segments ?? []).map(segment => segment.id)
  const cards = requireRows(payload['cards'], 'cards', ids.length)
  cards.forEach((card, index) => {
    const at = `cards[${index}]`
    const kind = CARD_KINDS[index]
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
