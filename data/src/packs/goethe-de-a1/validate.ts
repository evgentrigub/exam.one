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
