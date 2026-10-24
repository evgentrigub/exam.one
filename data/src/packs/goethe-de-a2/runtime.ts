import type { PartRuntime } from '../../runtime'
import { goetheRawAdapter } from '../goethe-shared/raw-adapter'
import type { ExamModule } from '../../types'
import {
  validateListening,
  validateReading,
  validateSpeaking,
  validateWriting,
} from './validate'

/** Compatibility projection: the original seed JSON and session components remain valid. */
export function attachGoetheRuntime(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => {
      if (part.available === false) return part
      const n = part.n
      const rules: PartRuntime = {
        minutes: module.minutes / module.parts.filter(p => p.available !== false).length,
        maxPoints: 5,
      }
      if (module.id === 'reading' || module.id === 'listening') {
        rules.questionCount = 5
        rules.optionCount =
          module.id === 'reading' ? (n === 4 ? 7 : 3) : n === 2 ? 9 : n === 4 ? 2 : 3
        // Practice retains its historical raw /5 score; mock sets store their own conversion.
        rules.multiplier = 1
        if (module.id === 'listening') rules.replays = n === 1 || n === 4 ? 2 : 1
      } else if (module.id === 'writing') {
        rules.maxPoints = 10
        rules.multiplier = 1.25
        rules.fields = [
          {
            id: 'answer',
            label: 'Your answer',
            minWords: n === 1 ? 20 : 30,
            maxWords: n === 1 ? 30 : 40,
            zeroBelowWords: n === 1 ? 10 : 15,
          },
        ]
        rules.criteria = [
          { id: 'aufgabenerfuellung', label: 'Task completion', maxPoints: 5 },
          { id: 'sprache', label: 'Language', maxPoints: 5 },
        ]
      } else {
        rules.maxPoints = n === 1 ? 4 : 8
        rules.segments =
          n === 1
            ? [
                { id: 'answers', label: 'Answers' },
                { id: 'questions', label: 'Questions' },
              ]
            : [{ id: 'monologue', label: 'Monologue' }]
        rules.criteria =
          n === 1
            ? [
                { id: 'answers', label: 'Answers', maxPoints: 2 },
                { id: 'questions', label: 'Questions', maxPoints: 2 },
              ]
            : [
                { id: 'taskCompletion', label: 'Task completion', maxPoints: 4 },
                { id: 'language', label: 'Language', maxPoints: 4 },
              ]
      }
      const adapter = goetheRawAdapter(module.id, part, rules)
      // Every module now carries a payload guard; `validateView` only sees the projection.
      const validate =
        module.id === 'reading'
          ? validateReading
          : module.id === 'listening'
            ? validateListening
            : module.id === 'writing'
              ? validateWriting
              : validateSpeaking
      return { ...part, runtime: rules, adapter, validate }
    }),
  }))
}
