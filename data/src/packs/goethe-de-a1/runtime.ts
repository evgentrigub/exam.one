import type { PartRuntime } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'
import { validateListening, validateReading, validateSpeaking, validateWriting } from './validate'

/** The five blank entries of the Teil 1 form, each worth one point. */
export const FORM_FIELDS = [1, 2, 3, 4, 5].map(n => ({ id: `field${n}`, label: `Entry ${n}` }))

/**
 * Per-part rules. Points are raw (1 per objective item); practice shows them without the
 * official ×1.66, so `multiplier` is 1.
 */
const RULES: Partial<Record<SkillId, Record<number, PartRuntime>>> = {
  reading: {
    1: { minutes: 8, maxPoints: 5, questionCount: 5, optionCount: 2, multiplier: 1 },
    2: { minutes: 9, maxPoints: 5, questionCount: 5, optionCount: 2, multiplier: 1 },
    3: { minutes: 8, maxPoints: 5, questionCount: 5, optionCount: 2, multiplier: 1 },
  },
  listening: {
    1: { minutes: 8, maxPoints: 6, questionCount: 6, optionCount: 3, multiplier: 1, replays: 2 },
    2: { minutes: 5, maxPoints: 4, questionCount: 4, optionCount: 2, multiplier: 1, replays: 1 },
    3: { minutes: 7, maxPoints: 5, questionCount: 5, optionCount: 3, multiplier: 1, replays: 2 },
  },
  writing: {
    1: {
      minutes: 5,
      maxPoints: 5,
      multiplier: 1,
      fields: FORM_FIELDS,
      criteria: FORM_FIELDS.map(field => ({ ...field, maxPoints: 1 })),
    },
    // No official word minimum and no zero rule: the range is guidance only.
    2: {
      minutes: 15,
      maxPoints: 10,
      multiplier: 1,
      fields: [{ id: 'answer', label: 'Your answer', minWords: 20, maxWords: 50 }],
      criteria: [
        { id: 'content1', label: 'Content point 1', maxPoints: 3 },
        { id: 'content2', label: 'Content point 2', maxPoints: 3 },
        { id: 'content3', label: 'Content point 3', maxPoints: 3 },
        { id: 'communication', label: 'Greeting and closing', maxPoints: 1 },
      ],
    },
  },
  // Official maxima 3 / 6 / 6. The split into turns is a practice decomposition of them.
  speaking: {
    1: {
      minutes: 5,
      maxPoints: 3,
      segments: [{ id: 'monologue', label: 'Introduction' }],
      criteria: [
        { id: 'introduction', label: 'Introduction', maxPoints: 1 },
        { id: 'spelling', label: 'Spelling', maxPoints: 1 },
        { id: 'number', label: 'Number', maxPoints: 1 },
      ],
    },
    2: cardRules(
      ['ask1', 'answer1', 'ask2', 'answer2'],
      ['Question', 'Answer', 'Question', 'Answer']
    ),
    3: cardRules(
      ['request1', 'response1', 'request2', 'response2'],
      ['Request', 'Reaction', 'Request', 'Reaction']
    ),
  },
}

/** Four turns of 1.5 points: two rounds of "make it" and "react to it". */
function cardRules(ids: string[], labels: string[]): PartRuntime {
  const segments = ids.map((id, i) => ({ id, label: `${labels[i]} ${Math.floor(i / 2) + 1}` }))
  return {
    minutes: 5,
    maxPoints: 6,
    segments,
    criteria: segments.map(segment => ({ ...segment, maxPoints: 1.5 })),
  }
}

/** The rules of one part, for callers outside the structure such as the mock factory. */
export function a1PartRules(skill: SkillId, n: number): PartRuntime {
  const rules = RULES[skill]?.[n]
  if (!rules) throw new Error(`goethe-de-a1: no runtime rules for ${skill}:${n}`)
  return rules
}

const VALIDATORS: Partial<Record<SkillId, NonNullable<ExamPart['validate']>>> = {
  reading: validateReading,
  listening: validateListening,
  writing: validateWriting,
  speaking: validateSpeaking,
}

/** Attach rules, the shared Goethe projection and the payload guard to every available part. */
export function attachGoetheA1Runtime(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => {
      if (part.available === false) return part
      const rules = RULES[module.id]?.[part.n]
      if (!rules) throw new Error(`goethe-de-a1: no runtime rules for ${module.id}:${part.n}`)
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
