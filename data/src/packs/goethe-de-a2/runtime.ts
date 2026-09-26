import {
  defineAdapter,
  record,
  validateReview,
  type ExerciseView,
  type PartRuntime,
} from '../../runtime'
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
      const adapter = defineAdapter(payload => {
        const d = record(payload)
        const view: ExerciseView = {
          version: 1,
          format: part.itemFormat,
          title: String(d['title'] ?? d['theme'] ?? part.title),
          text: String(d['content'] ?? d['task'] ?? d['context'] ?? ''),
        }
        if (module.id === 'writing') view.fields = rules.fields ?? []
        else if (module.id === 'speaking')
          view.segments = (rules.segments ?? []).map(s => ({
            ...s,
            prompt: String(
              d[
                s.id === 'answers'
                  ? 'answerQuestions'
                  : s.id === 'questions'
                    ? 'askQuestions'
                    : 'keywords'
              ] ?? ''
            ),
          }))
        else {
          const rows = (d['questions'] ?? d['items'] ?? []) as Record<string, unknown>[]
          const audio =
            typeof d['audio'] === 'object' && d['audio']
              ? (d['audio'] as { shared?: string; items?: Record<string, string> })
              : {}
          if (audio.shared) view.audio = audio.shared
          if (typeof d['transcript'] === 'string') view.transcript = d['transcript']
          view.questions = rows.map((q, i) => ({
            id: String(
              q['id'] ??
                (module.id === 'listening'
                  ? `${d['id']}-${d['items'] ? 'i' : 'q'}${i}`
                  : `q${i + 1}`)
            ),
            text: String(q['question'] ?? q['person'] ?? q['statement'] ?? ''),
            options: (q['options'] ?? d['options'] ?? ['Ja', 'Nein']) as string[],
            correctAnswer:
              typeof q['correctAnswer'] === 'boolean'
                ? q['correctAnswer']
                  ? 0
                  : 1
                : Number(q['correctAnswer']),
            explanation: String(q['explanation'] ?? ''),
            ...(typeof q['transcript'] === 'string' ? { transcript: q['transcript'] } : {}),
            ...(audio.items?.[String(q['id'])] ? { audio: audio.items[String(q['id'])] } : {}),
          }))
        }
        return view
      })
      adapter.validateStoredReview = (value, savedRules) => {
        const review = record(value)
        const writing = review['writingReview']
        if (module.id === 'writing' && writing && typeof writing === 'object') {
          const response = record(writing)['responseData']
          // Writing rubrics are stored as a `CriterionReview`; the part is implied by the
          // attempt's own snapshot, so the rubric no longer carries a `teil` to cross-check.
          if (response !== undefined) {
            try {
              validateReview(response, savedRules)
            } catch {
              throw new Error('Invalid saved writing rubric or total')
            }
          }
        }
        // Speaking rubrics are `CriterionReview` too. An older rubric still carrying `teil`
        // validates unchanged: the extra key is ignored, and the numbers it used to be
        // checked against are the ones `validateReview` checks.
        if (module.id === 'speaking' && review['review'] !== undefined) {
          try {
            validateReview(review['review'], savedRules)
          } catch {
            throw new Error('Invalid saved speaking rubric or total')
          }
        }
      }
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
