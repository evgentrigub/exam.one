import type { PartRuntime, RubricCriterion } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'
import { validateListening, validateReading, validateSpeaking, validateWriting } from './validate'

/** Content, Organisation and Language, 0–5 each, as the A2 Key writing assessment scale. */
const WRITING_CRITERIA: RubricCriterion[] = [
  { id: 'content', label: 'Content', maxPoints: 5 },
  { id: 'organisation', label: 'Organisation', maxPoints: 5 },
  { id: 'language', label: 'Language', maxPoints: 5 },
]

/** The A2 speaking scales that a transcript can show; Pronunciation needs the audio. */
const SPEAKING_CRITERIA: RubricCriterion[] = [
  { id: 'grammarVocabulary', label: 'Grammar and Vocabulary', maxPoints: 5 },
  { id: 'interactiveCommunication', label: 'Interactive Communication', maxPoints: 5 },
  { id: 'globalAchievement', label: 'Global Achievement', maxPoints: 5 },
]

/** One recording per examiner question or partner turn, in order. */
export const SPEAKING_SEGMENTS: Record<1 | 2, Array<{ id: string; label: string }>> = {
  1: [
    { id: 'personal1', label: 'Personal question 1' },
    { id: 'personal2', label: 'Personal question 2' },
    { id: 'topic1', label: 'Topic question 1' },
    { id: 'topic2', label: 'Topic question 2' },
    { id: 'extended', label: 'Longer answer' },
  ],
  2: [
    { id: 'opinion', label: 'Your opinion' },
    { id: 'askPartner', label: 'Question to your partner' },
    { id: 'followUp', label: 'Follow-up question' },
    { id: 'favourite', label: 'Favourite' },
    { id: 'preference', label: 'Preference' },
  ],
}

const choice = (minutes: number, count: number, options = 3): PartRuntime => ({
  minutes,
  maxPoints: count,
  questionCount: count,
  optionCount: options,
  multiplier: 1,
})

/**
 * Per-part rules. Points are raw (1 per objective item, 0–5 per rubric scale) and practice
 * applies no conversion, so `multiplier` is 1. Every listening recording is heard twice.
 */
const RULES: Partial<Record<SkillId, Record<number, PartRuntime>>> = {
  reading: {
    1: choice(8, 6),
    2: choice(9, 7),
    3: choice(9, 5),
    4: choice(7, 6),
    5: { minutes: 7, maxPoints: 6, questionCount: 6, multiplier: 1 },
  },
  listening: {
    1: { ...choice(6, 5), replays: 2 },
    2: { minutes: 6, maxPoints: 5, questionCount: 5, multiplier: 1, replays: 2 },
    3: { ...choice(6, 5), replays: 2 },
    4: { ...choice(6, 5), replays: 2 },
    5: { ...choice(6, 5, 8), reuseOptions: false, replays: 2 },
  },
  // No zero-word rule: a short answer loses Content marks instead. The ranges are guidance.
  writing: {
    1: {
      minutes: 10,
      maxPoints: 15,
      multiplier: 1,
      fields: [{ id: 'answer', label: 'Your email', minWords: 25, maxWords: 60 }],
      criteria: WRITING_CRITERIA,
    },
    2: {
      minutes: 10,
      maxPoints: 15,
      multiplier: 1,
      fields: [{ id: 'answer', label: 'Your story', minWords: 35, maxWords: 80 }],
      criteria: WRITING_CRITERIA,
    },
  },
  speaking: {
    1: {
      minutes: 4,
      maxPoints: 15,
      multiplier: 1,
      segments: SPEAKING_SEGMENTS[1],
      criteria: SPEAKING_CRITERIA,
    },
    2: {
      minutes: 6,
      maxPoints: 15,
      multiplier: 1,
      segments: SPEAKING_SEGMENTS[2],
      criteria: SPEAKING_CRITERIA,
    },
  },
}

/** The rules of one part, for the mock factory; throws on a part the exam does not have. */
export function cambridgeA2PartRules(skill: SkillId, n: number): PartRuntime {
  const rules = RULES[skill]?.[n]
  if (!rules) throw new Error(`cambridge-en-a2: no runtime rules for ${skill}:${n}`)
  return rules
}

const VALIDATORS: Partial<Record<SkillId, NonNullable<ExamPart['validate']>>> = {
  reading: validateReading,
  listening: validateListening,
  writing: validateWriting,
  speaking: validateSpeaking,
}

/** Attach rules, the shared raw-payload projection and the payload guard to every part. */
export function attachCambridgeA2Runtime(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => {
      if (part.available === false) return part
      const rules = RULES[module.id]?.[part.n]
      if (!rules) throw new Error(`cambridge-en-a2: no runtime rules for ${module.id}:${part.n}`)
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
