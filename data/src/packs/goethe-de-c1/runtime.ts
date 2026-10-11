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
  bank?: boolean
  gaps?: boolean
}
export interface ModuleDefinition {
  id: SkillId
  label: string
  minutes: number
  summary: string
  scoringNote: string
  tasks: TaskDefinition[]
}
const text = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0
export function attachRuntime(modules: ModuleDefinition[]): ExamModule[] {
  return modules.map(module => ({
    id: module.id,
    ...moduleCopy(module, 'en'),
    minutes: module.minutes,
    points: module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0),
    parts: module.tasks.map(task => {
      const display = partCopy(module, task, 'en')
      const part: ExamPart = {
        ...display,
        n: task.n,
        itemFormat: task.itemFormat,
        ...(task.layout ? { layout: task.layout } : {}),
        ...(task.gaps ? { choiceGaps: true } : {}),
        runtime: task.runtime,
        practiceLabel: `Part ${task.n}`,
        practiceSubtitle: display.title,
        practiceMinutes: task.runtime.minutes,
        practiceTimerSec: task.runtime.minutes * 60,
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
          if (module.id === 'writing') {
            if (
              !text(payload['task']) ||
              !text(payload['description']) ||
              !Array.isArray(payload['requirements']) ||
              payload['requirements'].length !== 4 ||
              !payload['requirements'].every(text)
            )
              throw new Error('Writing requires four communicative functions')
            const words = record(payload['wordCount'])
            const field = task.runtime.fields![0]!
            if (
              words['min'] !== field.minWords ||
              words['max'] !== field.maxWords ||
              payload['estimatedTime'] !== task.runtime.minutes
            )
              throw new Error('Incorrect C1 writing length or time')
          } else if (module.id === 'speaking') {
            const checkCards = (cards: unknown) => {
              if (!Array.isArray(cards) || cards.length !== task.runtime.segments?.length)
                throw new Error('Wrong speaking turns')
              cards.forEach((card, index) => {
                const c = record(card)
                if (
                  c['segment'] !== task.runtime.segments?.[index]?.id ||
                  !text(c['cue']) ||
                  c['kind'] !==
                    (task.n === 1 ? ['presentation', 'answer', 'answer', 'ask'][index] : 'answer')
                )
                  throw new Error('Invalid speaking card')
              })
            }
            checkCards(payload['cards'])
            if (task.n === 1) {
              const options = payload['topicOptions']
              if (!Array.isArray(options) || options.length !== 2)
                throw new Error('Two presentation topics required')
              if (new Set(options.map(o => record(o)['id'])).size !== 2)
                throw new Error('Duplicate topic IDs')
              options.forEach(o => {
                const option = record(o)
                if (!text(option['id']) || !text(option['theme']))
                  throw new Error('Invalid presentation topic')
                checkCards(option['cards'])
              })
            }
          } else {
            if (!text(payload['content'])) throw new Error('Missing passage/instructions')
            const rows = payload['questions']
            if (!Array.isArray(rows)) throw new Error('Missing questions')
            rows.forEach(row => {
              const q = record(row)
              const options = q['options']
              if (
                !text(q['question']) ||
                !text(q['explanation']) ||
                !Array.isArray(options) ||
                !options.every(text) ||
                new Set(options).size !== options.length
              )
                throw new Error('Invalid question or options')
            })
            if (
              task.bank &&
              rows.some(
                row =>
                  JSON.stringify(record(row)['options']) !==
                  JSON.stringify(record(rows[0])['options'])
              )
            )
              throw new Error('Inconsistent option bank')
            if (task.gaps) {
              const markers = [...String(payload['content']).matchAll(/\((\d+)\)\s*_{2,}/g)].map(
                m => Number(m[1])
              )
              if (JSON.stringify(markers) !== JSON.stringify(rows.map((_, i) => i + 1)))
                throw new Error('Incorrect gap references')
            }
            if (
              module.id === 'reading' &&
              task.n === 4 &&
              rows.filter(row => record(row)['correctAnswer'] === 3).length !== 2
            )
              throw new Error('Exactly two opinions have no match')
            if (module.id === 'listening') {
              if (task.n === 3) {
                if (payload['transcript'] || rows.some(row => record(row)['transcript']))
                  throw new Error('Discussion uses section transcripts only')
                const sections = payload['sections']
                if (
                  !Array.isArray(sections) ||
                  sections.length !== 4 ||
                  sections.some(s => (record(s)['questionIds'] as unknown[])?.length !== 2)
                )
                  throw new Error('Four sections of two questions required')
                if (
                  JSON.stringify(sections.map(s => record(s)['id'])) !==
                    JSON.stringify(['section1', 'section2', 'section3', 'section4']) ||
                  JSON.stringify(sections.flatMap(s => record(s)['questionIds'])) !==
                    JSON.stringify(rows.map(q => record(q)['id']))
                )
                  throw new Error(
                    'Discussion sections must reference consecutive questions in order'
                  )
              } else if (!text(payload['transcript'])) throw new Error('Missing shared transcript')
              if (
                task.n === 2 &&
                rows.some(
                  row =>
                    JSON.stringify(record(row)['options']) !==
                    JSON.stringify(['stimmt', 'stimmt nicht', 'dazu wird nichts gesagt'])
                )
              )
                throw new Error('Interview options differ')
            }
          }
        },
      }
    }),
  }))
}
