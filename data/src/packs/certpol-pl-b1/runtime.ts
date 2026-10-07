import { record, validateView, type PartRuntime } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { moduleCopy, partCopy, practiceTip } from './practice-copy'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'

export interface TaskDefinition {
  n: number
  title: string
  itemFormat: ExamPart['itemFormat']
  layout?: ExamPart['layout']
  runtime: PartRuntime
  seed: Record<string, unknown>
  hints: string[]
  bank?: boolean
  gaps?: boolean
  oneWord?: boolean
  items?: boolean
  dialogue?: boolean
  optionPattern?: number[]
  unmatchedIndex?: number
  typedBankSize?: number
}
export interface ModuleDefinition {
  id: SkillId
  label: string
  minutes: number
  summary: string
  scoringNote: string
  tasks: TaskDefinition[]
}
const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
function requireText(value: unknown, name: string): void {
  if (!nonempty(value)) throw new Error(`Missing ${name}`)
}
/** Guard the raw screen payload as well as its scored projection. */
export function attachRuntime(modules: ModuleDefinition[]): ExamModule[] {
  return modules.map(module => ({
    id: module.id,
    ...moduleCopy(module, 'en'),
    minutes: module.minutes,
    points: module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0),
    parts: module.tasks.map(task => {
      const rules = task.runtime
      const display = partCopy(module, task, 'en')
      const part: ExamPart = {
        ...display,
        n: task.n,
        itemFormat: task.itemFormat,
        ...(task.layout ? { layout: task.layout } : {}),
        practiceLabel: `Part ${task.n}`,
        practiceSubtitle: display.title,
        practiceMinutes: rules.minutes,
        practiceTimerSec: rules.minutes * 60,
        tips: [display.short, practiceTip('en')],
        sessionTitle: display.title,
        ...(task.itemFormat === 'recording'
          ? {
              instruction:
                'Solo practice: record each response to the cue card. Manual transcripts are available.',
            }
          : {}),
        runtime: rules,
      }
      const adapter = goetheRawAdapter(module.id, part, rules)
      return {
        ...part,
        adapter,
        validate: (payload: unknown) => {
          const data = record(payload)
          validateView(adapter.project(data), rules)
          requireText(data[module.id === 'speaking' ? 'theme' : 'title'], 'title/theme')
          if (module.id === 'writing') {
            for (const key of ['description', 'task', 'topicType']) requireText(data[key], key)
            for (const key of ['requirements', 'category']) {
              if (
                !Array.isArray(data[key]) ||
                !(data[key] as unknown[]).length ||
                !(data[key] as unknown[]).every(nonempty)
              )
                throw new Error(`Missing ${key}`)
            }
            const wordCount = record(data['wordCount'])
            const field = rules.fields?.[0]
            if (
              wordCount['min'] !== field?.minWords ||
              wordCount['max'] !== field?.maxWords ||
              data['estimatedTime'] !== rules.minutes
            )
              throw new Error('Writing word limits or timing differ from this part')
          } else if (module.id === 'speaking') {
            requireText(data['topicType'], 'topicType')
            const cards = data['cards']
            if (!Array.isArray(cards) || cards.length !== rules.segments?.length)
              throw new Error('Missing speaking cards')
            cards.forEach((value, index) => {
              const card = record(value)
              if (
                card['segment'] !== rules.segments?.[index]?.id ||
                !['ask', 'answer'].includes(String(card['kind']))
              )
                throw new Error('Speaking cards must match segments in order')
              requireText(card['cue'], 'cue')
            })
          } else {
            requireText(data['content'], 'content')
            if (module.id === 'reading') {
              if (
                ![
                  'email',
                  'notice',
                  'article',
                  'advertisement',
                  'instructions',
                  'announcement',
                  'list',
                ].includes(String(data['textType']))
              )
                throw new Error('Invalid reading textType')
              if (
                !Number.isFinite(data['wordCount']) ||
                Number(data['wordCount']) <= 0 ||
                !Number.isFinite(data['estimatedReadingTime']) ||
                Number(data['estimatedReadingTime']) <= 0
              )
                throw new Error('Missing reading metadata')
              if (
                !Array.isArray(data['topics']) ||
                !(data['topics'] as unknown[]).length ||
                !(data['topics'] as unknown[]).every(nonempty)
              )
                throw new Error('Missing topics')
            }
            const rows = data[task.items ? 'items' : 'questions']
            if (!Array.isArray(rows) || rows.length !== rules.questionCount)
              throw new Error('Unexpected question rows')
            const bank = task.bank ? record(rows[0])['options'] : undefined
            rows.forEach((value, index) => {
              const row = record(value)
              requireText(row['question'], 'question')
              requireText(row['explanation'], 'explanation')
              if (task.itemFormat !== 'gap-fill') {
                const options = row['options']
                if (
                  !Array.isArray(options) ||
                  !options.every(nonempty) ||
                  new Set(options.map(option => option.trim())).size !== options.length
                )
                  throw new Error('Options must be distinct non-empty strings')
                if (!Number.isInteger(row['correctAnswer']))
                  throw new Error('Answer index must be an integer')
              }
              if (task.items) {
                requireText(row['context'], 'context')
                requireText(row['transcript'], 'transcript')
              }
              if (task.bank && JSON.stringify(row['options']) !== JSON.stringify(bank))
                throw new Error('Matching banks must be identical and ordered')
              if (
                task.optionPattern &&
                (!Array.isArray(row['options']) ||
                  (row['options'] as unknown[]).length !== task.optionPattern[index])
              )
                throw new Error('Wrong options for mixed listening item')
              if (
                task.oneWord &&
                (!Array.isArray(row['accepted']) ||
                  !(row['accepted'] as unknown[]).every(
                    answer => nonempty(answer) && answer.trim().split(/\s+/).length === 1
                  ))
              )
                throw new Error('Each open-cloze answer must be one word')
              if (
                task.itemFormat === 'gap-fill' &&
                (row['options'] !== undefined || row['correctAnswer'] !== undefined)
              )
                throw new Error('Typed gaps must use accepted answers only')
            })
            if (task.gaps || task.itemFormat === 'gap-fill') {
              const markers = [...String(data['content']).matchAll(/\((\d+)\)\s*_{2,}/g)]
                .map(m => Number(m[1]))
                .filter(n => n !== 0)
              if (JSON.stringify(markers) !== JSON.stringify(rows.map((_, i) => i + 1)))
                throw new Error('Numbered gaps must match questions in order')
            }
            if (task.typedBankSize) {
              const bankLine = String(data['content']).match(/^Wyrazy:\s*([^\n]+)\.$/m)?.[1]
              const words =
                bankLine?.split(',').map(word => word.trim().toLocaleLowerCase('pl')) ?? []
              if (
                words.length !== task.typedBankSize ||
                !words.every(nonempty) ||
                new Set(words).size !== words.length
              )
                throw new Error('Typed word bank must contain the required distinct words')
              const answers = rows.map(value => {
                const accepted = record(value)['accepted'] as string[]
                const variants = new Set(
                  accepted.map(answer => answer.trim().toLocaleLowerCase('pl'))
                )
                if (variants.size !== 1 || !words.includes([...variants][0]!))
                  throw new Error('Typed bank answers must identify one word from the bank')
                return [...variants][0]!
              })
              if (new Set(answers).size !== answers.length)
                throw new Error('Typed bank words cannot be reused')
            }
            if (module.id === 'listening' && !task.items)
              requireText(data['transcript'], 'transcript')
            if (task.dialogue) {
              const transcripts = task.items
                ? rows.map(value => String(record(value)['transcript']))
                : [String(data['transcript'])]
              if (
                transcripts.some(
                  text =>
                    new Set(
                      [...text.matchAll(/(?:^|\s)([A-ZÁÉÍÓÚŁŚŻŹĆŃ][\p{L}]+):\s/gu)].map(m => m[1])
                    ).size < 2
                )
              )
                throw new Error('Dialogue needs two labelled speakers')
            }
            if (task.unmatchedIndex !== undefined) {
              const answers = rows.map(value => record(value)['correctAnswer'])
              if (answers.filter(a => a === task.unmatchedIndex).length !== 1)
                throw new Error('Exactly one situation must have no match')
              const matched = answers.filter(a => a !== task.unmatchedIndex)
              if (new Set(matched).size !== matched.length)
                throw new Error('An advertisement is reused')
            }
          }
        },
      }
    }),
  }))
}
