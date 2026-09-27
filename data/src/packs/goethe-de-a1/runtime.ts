import type { PartRuntime } from '../../runtime'
import type { ExamModule, ExamPart, SkillId } from '../../types'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'
import { validateListening, validateReading } from './validate'

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
}

const VALIDATORS: Partial<Record<SkillId, NonNullable<ExamPart['validate']>>> = {
  reading: validateReading,
  listening: validateListening,
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
