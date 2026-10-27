import { record, validateView, type PartRuntime } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { moduleCopy, partCopy, practiceTip, speakingCopy } from './practice-copy'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'

export interface TaskDefinition {
  n: number
  title: string
  itemFormat: ExamPart['itemFormat']
  layout?: ExamPart['layout']
  runtime: PartRuntime
  seed: Record<string, unknown>
  hints: string[]
  /** Every question repeats one option bank, shown once on the screen. */
  bank?: boolean
  /** Questions are numbered gaps `(1) ____` in the passage. */
  gaps?: boolean
  /** The official item numbers of this part on the answer sheet, such as `21–30`. */
  officialItems?: string
  practiceLabel: string
  practiceType?: string
}

export interface ModuleDefinition {
  id: SkillId
  minutes: number
  tasks: TaskDefinition[]
}

const TRUE_FALSE = ['Richtig', 'Falsch']
const LETTERS = 'abcdefghijklmno'

const text = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0
const words = (value: unknown): number =>
  typeof value === 'string' ? value.trim().split(/\s+/u).filter(Boolean).length : 0
const same = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right)

/** Lines of `content` that start with a label such as `1 · ` or `a · `, in order. */
function labelledLines(content: unknown): string[] {
  return String(content ?? '')
    .split(/\n+/)
    .map(line => line.match(/^\s*([0-9a-z]{1,2}) · \S/)?.[1])
    .filter((label): label is string => Boolean(label))
}

function gapMarkers(content: unknown): number[] {
  return [...String(content ?? '').matchAll(/\((\d+)\)\s*_{2,}/g)].map(match => Number(match[1]))
}

function checkQuestions(rows: unknown[], options?: string[]): void {
  for (const row of rows) {
    const q = record(row)
    const choices = q['options']
    if (
      !text(q['question']) ||
      !text(q['explanation']) ||
      !Array.isArray(choices) ||
      !choices.every(text) ||
      new Set(choices).size !== choices.length
    )
      throw new Error('Invalid question or options')
    if (options && !same(choices, options))
      throw new Error(`Options must be ${options.join(' / ')}`)
  }
}

function checkBank(rows: unknown[]): string[] {
  const bank = record(rows[0])['options'] as string[]
  if (rows.some(row => !same(record(row)['options'], bank)))
    throw new Error('Every question must repeat the same option bank')
  return bank
}

function validateReading(task: TaskDefinition, payload: Record<string, unknown>): void {
  if (!text(payload['content'])) throw new Error('Missing reading text')
  const rows = payload['questions'] as unknown[]
  checkQuestions(rows)
  const bank = task.bank ? checkBank(rows) : undefined
  if (
    task.gaps &&
    !same(
      gapMarkers(payload['content']),
      rows.map((_, i) => i + 1)
    )
  )
    throw new Error('Gaps must be numbered (1) ____ to the last question, in order')
  if (task.n === 1) {
    if (!same(labelledLines(payload['content']), ['1', '2', '3', '4', '5']))
      throw new Error('Five texts labelled 1 · to 5 · are required')
    if (!bank!.every((option, i) => option.startsWith(`${LETTERS[i]} · `)))
      throw new Error('Headlines are labelled a · to j ·')
    rows.forEach((row, i) => {
      if (record(row)['question'] !== `Text ${i + 1}`)
        throw new Error('Questions name the texts: Text 1 … Text 5')
    })
  }
  if (task.n === 3) {
    const labels = labelledLines(payload['content'])
    if (!same(labels, [...LETTERS.slice(0, 12)]))
      throw new Error('Twelve advertisements labelled a · to l · are required')
    if (
      !bank!.slice(0, 12).every((option, i) => option.startsWith(`${LETTERS[i]} · `)) ||
      !bank![12]!.startsWith('x · ')
    )
      throw new Error('Options are a · to l · followed by x ·')
    const none = rows.filter(row => record(row)['correctAnswer'] === 12).length
    if (none < 1 || none > 3) throw new Error('Between one and three situations have no match (x)')
  }
}

function validateListening(task: TaskDefinition, payload: Record<string, unknown>): void {
  if (task.n === 3) {
    const items = payload['items']
    if (!Array.isArray(items) || payload['transcript'])
      throw new Error('Part 3 uses one recording per item and no shared transcript')
    checkQuestions(items, TRUE_FALSE)
    if (items.some(item => !text(record(item)['transcript'])))
      throw new Error('Every item needs its own transcript')
    return
  }
  if (!text(payload['transcript'])) throw new Error('Missing shared transcript')
  checkQuestions(payload['questions'] as unknown[], TRUE_FALSE)
}

function validateWriting(task: TaskDefinition, payload: Record<string, unknown>): void {
  const field = task.runtime.fields![0]!
  const category = payload['category']
  if (
    !text(payload['task']) ||
    !text(payload['description']) ||
    !Array.isArray(payload['requirements']) ||
    payload['requirements'].length !== 4 ||
    !payload['requirements'].every(text)
  )
    throw new Error('Writing needs an advertisement, a task and four Leitpunkte')
  if (
    payload['topicType'] !== 'email' ||
    !Array.isArray(category) ||
    !/^Aufgabe [AB] · /.test(String(category[0] ?? ''))
  )
    throw new Error('Writing is an email for Aufgabe A or B')
  const count = record(payload['wordCount'])
  if (
    count['min'] !== field.minWords ||
    count['max'] !== field.maxWords ||
    payload['estimatedTime'] !== task.runtime.minutes
  )
    throw new Error('Incorrect writing length or time')
}

const CARD_KINDS: Record<number, string[]> = {
  1: ['presentation', 'answer', 'answer', 'ask'],
  2: ['presentation', 'answer', 'answer', 'answer'],
  3: ['ask', 'answer', 'answer', 'answer'],
}

function validateSpeaking(task: TaskDefinition, payload: Record<string, unknown>): void {
  const segments = task.runtime.segments ?? []
  const checkCards = (cards: unknown): void => {
    if (!Array.isArray(cards) || cards.length !== segments.length)
      throw new Error('Wrong number of speaking cards')
    cards.forEach((card, index) => {
      const c = record(card)
      if (
        c['segment'] !== segments[index]!.id ||
        c['kind'] !== CARD_KINDS[task.n]![index] ||
        !text(c['cue'])
      )
        throw new Error('Invalid speaking card')
    })
  }
  checkCards(payload['cards'])
  if (task.n === 1) {
    const options = payload['topicOptions']
    const ids = [1, 2, 3, 4, 5, 6, 7].map(i => `topic${i}`)
    if (
      !Array.isArray(options) ||
      !same(
        options.map(o => record(o)['id']),
        ids
      )
    )
      throw new Error('Seven topic options topic1 … topic7 are required')
    options.forEach(o => {
      const option = record(o)
      if (!text(option['theme'])) throw new Error('Invalid topic option')
      checkCards(option['cards'])
    })
    return
  }
  const stimulus = payload['stimulus'] ? record(payload['stimulus']) : {}
  const length = words(stimulus['content'])
  const [min, max] = task.n === 2 ? [150, 380] : [30, 160]
  if (!text(stimulus['title']) || length < min || length > max)
    throw new Error(`A stimulus text of ${min}–${max} words is required`)
}

export function attachRuntime(modules: ModuleDefinition[]): ExamModule[] {
  return modules.map(module => ({
    id: module.id,
    ...moduleCopy(module, 'en'),
    minutes: module.minutes,
    points: module.tasks.reduce(
      (sum, task) => sum + task.runtime.maxPoints * (task.runtime.multiplier ?? 1),
      0
    ),
    parts: module.tasks.map(task => {
      const display = partCopy(module, task, 'en')
      const part: ExamPart = {
        ...display,
        n: task.n,
        itemFormat: task.itemFormat,
        ...(task.layout ? { layout: task.layout } : {}),
        ...(task.gaps ? { choiceGaps: true } : {}),
        ...(task.bank ? { optionBank: true } : {}),
        runtime: task.runtime,
        practiceLabel: task.practiceLabel,
        practiceSubtitle: display.title,
        practiceMinutes: task.runtime.minutes,
        practiceTimerSec: task.runtime.minutes * 60,
        ...(task.practiceType ? { practiceType: task.practiceType } : {}),
        tips: [display.short, practiceTip('en')],
        sessionTitle: display.title,
        ...(module.id === 'speaking' ? speakingCopy[task.n] : {}),
      }
      const adapter = goetheRawAdapter(module.id, part, task.runtime)
      return {
        ...part,
        adapter,
        validate(payload: Record<string, unknown>) {
          validateView(adapter.project(payload), task.runtime)
          if (module.id === 'reading') validateReading(task, payload)
          else if (module.id === 'listening') validateListening(task, payload)
          else if (module.id === 'writing') validateWriting(task, payload)
          else validateSpeaking(task, payload)
        },
      }
    }),
  }))
}
