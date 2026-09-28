// Per-part checks on a generated A1 payload, beyond what the projected view can express.
//
// `validateView` checks counts, option counts and answer ranges on the projection. These
// guards assert what the projection drops or synthesises: the metadata the reading screen
// shows, the fixed Richtig/Falsch options, and a transcript for every listening item —
// without one the item can never have audio.

import type { PartRuntime } from '../../runtime'

/** The option pair every true/false item stores; index 0 is "richtig". */
export const TRUE_FALSE_OPTIONS = ['Richtig', 'Falsch'] as const

const READING_TEXT_TYPE: Record<number, string> = { 1: 'email', 2: 'advertisement', 3: 'notice' }
const LISTENING_ITEMS: Record<number, number> = { 1: 6, 2: 4, 3: 5 }

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

function requireTrueFalse(row: Record<string, unknown>, at: string): void {
  const options = row['options']
  if (
    !Array.isArray(options) ||
    options.length !== 2 ||
    options[0] !== TRUE_FALSE_OPTIONS[0] ||
    options[1] !== TRUE_FALSE_OPTIONS[1]
  )
    fail(`${at}.options must be ["Richtig", "Falsch"]`)
  // A boolean answer would render, and then always score as wrong.
  if (row['correctAnswer'] !== 0 && row['correctAnswer'] !== 1)
    fail(`${at}.correctAnswer must be 0 (richtig) or 1 (falsch)`)
}

function requireOptions(row: Record<string, unknown>, at: string, count: number): void {
  const options = row['options']
  if (!Array.isArray(options) || options.length !== count) fail(`${at}.options must contain exactly ${count} entries`)
  options.forEach((option, index) => requireString(option, `${at}.options[${index}]`))
}

/** Lesen: the reading screen's metadata, and the per-Teil option shape. */
export function validateReading(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  requireString(payload['content'], 'content')
  if (payload['textType'] !== READING_TEXT_TYPE[part])
    fail(`textType must be "${READING_TEXT_TYPE[part]}" for Teil ${part}`)
  if (typeof payload['estimatedReadingTime'] !== 'number') fail('estimatedReadingTime must be a number')
  if (typeof payload['wordCount'] !== 'number') fail('wordCount must be a number')
  if (!Array.isArray(payload['topics']) || payload['topics'].some(t => typeof t !== 'string'))
    fail('topics must be an array of strings')

  const questions = requireRows(payload['questions'], 'questions', rules.questionCount ?? 5)
  questions.forEach((row, index) => {
    const at = `questions[${index}]`
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    if (part === 2) requireOptions(row, at, 2)
    else requireTrueFalse(row, at)
  })
}

/** A dialogue needs at least two labelled turns, or TTS reads it in one voice. */
const TURN_LABEL = /(?:^|\s)[A-ZÄÖÜ][\wÄÖÜäöüß.-]{0,20}(?: [A-ZÄÖÜ][\wäöüß.-]{0,20})?:\s/g

/** Hören: one recording per item, each with its context, transcript and question. */
export function validateListening(payload: Record<string, unknown>): void {
  const part = Number(payload['testingPart'])
  requireString(payload['title'], 'title')
  const items = requireRows(payload['items'], 'items', LISTENING_ITEMS[part] ?? 0)
  items.forEach((row, index) => {
    const at = `items[${index}]`
    requireString(row['context'], `${at}.context`)
    requireString(row['transcript'], `${at}.transcript`)
    requireString(row['question'], `${at}.question`)
    requireString(row['explanation'], `${at}.explanation`)
    if (part === 2) requireTrueFalse(row, at)
    else requireOptions(row, at, 3)
    if (part === 1 && (String(row['transcript']).match(TURN_LABEL)?.length ?? 0) < 2)
      fail(`${at}.transcript must be a dialogue with labelled turns ("Mann: …", "Frau: …")`)
  })
}

/** Schreiben: both parts keep the writing-screen metadata the A2 topics carry. */
function requireWritingTopic(payload: Record<string, unknown>, topicTypes: readonly string[]): void {
  requireString(payload['title'], 'title')
  requireString(payload['description'], 'description')
  requireString(payload['task'], 'task')
  if (!topicTypes.includes(String(payload['topicType'])))
    fail(`topicType must be one of ${topicTypes.join(', ')}`)
  if (typeof payload['estimatedTime'] !== 'number') fail('estimatedTime must be a number')
  if (!Array.isArray(payload['category']) || payload['category'].some(c => typeof c !== 'string'))
    fail('category must be an array of strings')
  const requirements = payload['requirements']
  if (!Array.isArray(requirements) || !requirements.length || requirements.some(r => typeof r !== 'string'))
    fail('requirements must be a non-empty array of strings')
  const wordCount = payload['wordCount']
  if (!isRecord(wordCount) || typeof wordCount['min'] !== 'number' || typeof wordCount['max'] !== 'number')
    fail('wordCount must have numeric min and max')
}

/**
 * Teil 1 is a form: the blank rows must be exactly the part's fields, in order, and every
 * blank needs an expected entry — the reviewer grades against it, and without one a correct
 * answer could be marked wrong.
 */
function validateForm(payload: Record<string, unknown>, rules: PartRuntime): void {
  const form = payload['form']
  if (!isRecord(form)) fail('form must be an object')
  requireString(form['title'], 'form.title')
  const rows = form['rows']
  if (!Array.isArray(rows) || rows.some(row => !isRecord(row))) fail('form.rows must be an array of objects')
  const blanks: string[] = []
  ;(rows as Record<string, unknown>[]).forEach((row, index) => {
    const at = `form.rows[${index}]`
    requireString(row['label'], `${at}.label`)
    if (row['field'] === undefined) return requireString(row['value'], `${at}.value`)
    blanks.push(String(row['field']))
    if (row['options'] !== undefined) {
      const options = row['options']
      if (!Array.isArray(options) || options.length < 2) fail(`${at}.options must list at least 2 choices`)
      options.forEach((option, i) => requireString(option, `${at}.options[${i}]`))
    }
  })
  const fieldIds = (rules.fields ?? []).map(field => field.id)
  if (blanks.join('|') !== fieldIds.join('|')) fail(`the blank rows must be ${fieldIds.join(', ')}, in order`)
  if (blanks.length === rows.length) fail('form must also print some rows already filled in')

  const expected = payload['expected']
  if (!isRecord(expected)) fail('expected must be an object')
  ;(rows as Record<string, unknown>[]).forEach(row => {
    if (row['field'] === undefined) return
    const id = String(row['field'])
    requireString(expected[id], `expected.${id}`)
    const options = row['options']
    if (Array.isArray(options) && !options.includes(expected[id]))
      fail(`expected.${id} must be one of its options`)
  })
}

/** Schreiben: Teil 1 is a form-fill, Teil 2 a short message. */
export function validateWriting(payload: Record<string, unknown>, rules: PartRuntime): void {
  if (Number(payload['testingPart']) === 1) {
    requireWritingTopic(payload, ['form'])
    validateForm(payload, rules)
    return
  }
  requireWritingTopic(payload, ['email', 'note'])
}

const SPEAKING_TOPIC_TYPE: Record<number, string> = { 1: 'introduction', 2: 'interview', 3: 'requests' }
/** Teil 2 alternates asking and answering; Teil 3 alternates requesting and reacting. */
const CARD_KINDS: Record<number, readonly string[]> = {
  2: ['ask', 'answer', 'ask', 'answer'],
  3: ['request', 'respond', 'request', 'respond'],
}

/**
 * Sprechen. Teil 1 is a keyword introduction on the monologue screen. Teil 2 and 3 are card
 * exchanges: one card per configured segment, in order, each of the kind the round needs —
 * the screen draws the card above its recording, so a missing card is a missing recording.
 */
export function validateSpeaking(payload: Record<string, unknown>, rules: PartRuntime): void {
  const part = Number(payload['testingPart'])
  requireString(payload['theme'], 'theme')
  if (payload['topicType'] !== SPEAKING_TOPIC_TYPE[part])
    fail(`topicType must be "${SPEAKING_TOPIC_TYPE[part]}" for Teil ${part}`)

  if (part === 1) {
    const keywords = payload['keywords']
    if (!Array.isArray(keywords) || keywords.length < 7 || keywords.length > 10)
      fail('keywords must contain 7 to 10 entries')
    keywords.forEach((keyword, index) => requireString(keyword, `keywords[${index}]`))
    return
  }

  const cards = requireRows(payload['cards'], 'cards', rules.segments?.length ?? 4)
  const ids = (rules.segments ?? []).map(segment => segment.id)
  cards.forEach((card, index) => {
    const at = `cards[${index}]`
    if (card['segment'] !== ids[index]) fail(`${at}.segment must be "${ids[index]}"`)
    if (card['kind'] !== CARD_KINDS[part]?.[index]) fail(`${at}.kind must be "${CARD_KINDS[part]?.[index]}"`)
    requireString(card['cue'], `${at}.cue`)
    if (part === 2) requireString(card['topic'], `${at}.topic`)
  })
}
