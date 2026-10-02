import type { PartRuntime, RubricCriterion } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'
import { validateListening, validateReading, validateSpeaking, validateWriting } from './validate'

/**
 * The exam's two scales for writing and speaking, 0–3 each (band 2 = A2 reached). The
 * official 66% / 34% weighting and the conversion to 25 points are stated in `scoringNote`,
 * not applied, so practice shows the raw bands.
 */
const CRITERIA: RubricCriterion[] = [
  { id: 'taskCompletion', label: 'Cumplimiento de la tarea', maxPoints: 3 },
  { id: 'language', label: 'Uso de la lengua', maxPoints: 3 },
]

/** One recording per task, except the role-play: one per examiner line or learner question. */
export const SPEAKING_SEGMENTS: Record<1 | 2 | 3, Array<{ id: string; label: string }>> = {
  1: [{ id: 'monologue', label: 'Presentation' }],
  2: [{ id: 'monologue', label: 'Scene description' }],
  3: [
    { id: 'reply1', label: 'Reply 1' },
    { id: 'reply2', label: 'Reply 2' },
    { id: 'question', label: 'Your question' },
    { id: 'reply3', label: 'Reply 3' },
  ],
}

const objective = (minutes: number, count: number, options: number): PartRuntime => ({
  minutes,
  maxPoints: count,
  questionCount: count,
  optionCount: options,
  multiplier: 1,
})

const writing = (minutes: number, minWords: number, maxWords: number): PartRuntime => ({
  minutes,
  maxPoints: 6,
  multiplier: 1,
  fields: [{ id: 'answer', label: 'Your text', minWords, maxWords }],
  criteria: CRITERIA,
})

const speaking = (part: 1 | 2 | 3): PartRuntime => ({
  minutes: 4,
  maxPoints: 6,
  multiplier: 1,
  segments: SPEAKING_SEGMENTS[part],
  criteria: CRITERIA,
})

/**
 * Per-part rules. Points are raw (1 per objective item) and practice applies no conversion,
 * so `multiplier` is 1. Every listening recording is heard twice. In reading Tarea 3 a text
 * may answer several statements; in listening Tarea 4 each statement fits one message at most.
 */
const RULES: Partial<Record<SkillId, Record<number, PartRuntime>>> = {
  reading: {
    1: objective(15, 5, 3),
    2: objective(15, 8, 3),
    3: objective(15, 6, 3),
    4: objective(15, 6, 3),
  },
  listening: {
    1: { ...objective(10, 6, 3), replays: 2 },
    2: { ...objective(10, 6, 3), replays: 2 },
    3: { ...objective(10, 6, 3), replays: 2 },
    4: { ...objective(10, 7, 10), reuseOptions: false, replays: 2 },
  },
  // No zero-word rule in the A2 exam; the ranges are the tasks' official word counts.
  writing: {
    1: writing(20, 60, 70),
    2: writing(25, 70, 80),
  },
  speaking: {
    1: speaking(1),
    2: speaking(2),
    3: speaking(3),
  },
}

const VALIDATORS: Partial<Record<SkillId, NonNullable<ExamPart['validate']>>> = {
  reading: validateReading,
  listening: validateListening,
  writing: validateWriting,
  speaking: validateSpeaking,
}

/** Attach rules, the shared raw-payload projection and the payload guard to every part. */
export function attachDeleA2Runtime(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => {
      if (part.available === false) return part
      const rules = RULES[module.id]?.[part.n]
      if (!rules) throw new Error(`dele-es-a2: no runtime rules for ${module.id}:${part.n}`)
      const validate = VALIDATORS[module.id]
      return {
        ...part,
        runtime: rules,
        adapter: goetheRawAdapter(module.id, part, rules),
        ...(validate ? { validate } : {}),
      }
    }),
  }))
}
