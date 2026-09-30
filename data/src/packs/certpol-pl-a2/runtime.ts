import type { PartRuntime, RubricCriterion } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'
import { validateListening, validateReading, validateSpeaking, validateWriting } from './validate'

/**
 * The exam's three writing criteria (wykonanie zadania, bogactwo językowe, poprawność
 * językowa: 6 / 7 / 7 for the whole set), split across the two practice tasks as 2/2/2 and
 * 4/5/5 so the parts add up to the official 20.
 */
const writingCriteria = (task: number, range: number, accuracy: number): RubricCriterion[] => [
  { id: 'taskCompletion', label: 'Task completion', maxPoints: task },
  { id: 'range', label: 'Range of language', maxPoints: range },
  { id: 'accuracy', label: 'Accuracy', maxPoints: accuracy },
]

/**
 * Speaking: the official task points (4 / 10 / 10) and the vocabulary and grammar scales
 * (0–6 each, for the whole exam) split 1 / 2.5 / 2.5 across the tasks. Pronunciation (0–4)
 * needs the audio and is not marked from a transcript.
 */
const speakingCriteria = (task: number, language: number): RubricCriterion[] => [
  { id: 'taskCompletion', label: 'Task completion', maxPoints: task },
  { id: 'vocabulary', label: 'Vocabulary', maxPoints: language },
  { id: 'grammar', label: 'Grammar', maxPoints: language },
]

/** One recording per examiner question or turn, in order. */
export const SPEAKING_SEGMENTS: Record<1 | 2 | 3, Array<{ id: string; label: string }>> = {
  1: [
    { id: 'question1', label: 'Question 1' },
    { id: 'question2', label: 'Question 2' },
    { id: 'question3', label: 'Question 3' },
    { id: 'question4', label: 'Question 4' },
  ],
  2: [{ id: 'monologue', label: 'Photo description' }],
  3: [
    { id: 'opening', label: 'Your opening' },
    { id: 'reply1', label: 'Reply 1' },
    { id: 'reply2', label: 'Reply 2' },
    { id: 'reply3', label: 'Reply 3' },
  ],
}

const objective = (minutes: number, maxPoints: number, count: number, options?: number): PartRuntime => ({
  minutes,
  maxPoints,
  questionCount: count,
  ...(options ? { optionCount: options } : {}),
  multiplier: 1,
})

/**
 * Per-part rules. Points are raw and practice applies no conversion, so `multiplier` is 1.
 * Every listening recording is heard twice; no matching option is used twice.
 */
const RULES: Partial<Record<SkillId, Record<number, PartRuntime>>> = {
  listening: {
    1: { ...objective(7, 10, 10, 3), replays: 2 },
    2: { ...objective(4, 5, 5, 2), replays: 2 },
    3: { ...objective(5, 5, 5, 7), reuseOptions: false, replays: 2 },
    4: { ...objective(5, 5, 5, 6), reuseOptions: false, replays: 2 },
    5: { ...objective(4, 5, 5), replays: 2 },
  },
  reading: {
    1: objective(8, 5, 10, 3),
    2: { ...objective(8, 5, 10, 11), reuseOptions: false },
    3: objective(6, 5, 5, 3),
    4: objective(7, 5, 5, 3),
    5: objective(9, 5, 10),
    6: { ...objective(7, 5, 5, 6), reuseOptions: false },
  },
  // No zero-word rule in the A2 exam; the ranges are guidance around the tasks' word counts.
  writing: {
    1: {
      minutes: 10,
      maxPoints: 6,
      multiplier: 1,
      fields: [{ id: 'answer', label: 'Your text', minWords: 10, maxWords: 30 }],
      criteria: writingCriteria(2, 2, 2),
    },
    2: {
      minutes: 35,
      maxPoints: 14,
      multiplier: 1,
      fields: [{ id: 'answer', label: 'Your text', minWords: 70, maxWords: 100 }],
      criteria: writingCriteria(4, 5, 5),
    },
  },
  speaking: {
    1: { minutes: 4, maxPoints: 6, multiplier: 1, segments: SPEAKING_SEGMENTS[1], criteria: speakingCriteria(4, 1) },
    2: { minutes: 6, maxPoints: 15, multiplier: 1, segments: SPEAKING_SEGMENTS[2], criteria: speakingCriteria(10, 2.5) },
    3: { minutes: 5, maxPoints: 15, multiplier: 1, segments: SPEAKING_SEGMENTS[3], criteria: speakingCriteria(10, 2.5) },
  },
}

const VALIDATORS: Partial<Record<SkillId, NonNullable<ExamPart['validate']>>> = {
  reading: validateReading,
  listening: validateListening,
  writing: validateWriting,
  speaking: validateSpeaking,
}

/** Attach rules, the shared raw-payload projection and the payload guard to every part. */
export function attachCertpolA2Runtime(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => {
      if (part.available === false) return part
      const rules = RULES[module.id]?.[part.n]
      if (!rules) throw new Error(`certpol-pl-a2: no runtime rules for ${module.id}:${part.n}`)
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
