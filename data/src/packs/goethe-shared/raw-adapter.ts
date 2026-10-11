import {
  defineAdapter,
  GAP_ANSWER_INDEX,
  record,
  validateReview,
  type ExerciseAdapter,
  type ExerciseView,
  type PartRuntime,
  type RuntimeQuestion,
} from '../../runtime'
import type { ExamPart, SkillId } from '../../types'

/**
 * Project a Goethe exercise payload, stored in the raw shape the practice screens read
 * (`content`, `questions[].question`, `items[]`, `answerQuestions`, `keywords`, …), into the
 * generic view. Shared by every Goethe pack so their payloads stay renderable by the same
 * screens; `rules` is the caller's own part configuration.
 *
 * Two additions are keyed on fields A2 payloads never carry, so A2 projects unchanged:
 * a writing `form.rows[]` supplies field prompts, and speaking `cards[]` supply segment prompts.
 */
export function goetheRawAdapter(
  skill: SkillId,
  part: ExamPart,
  rules: PartRuntime
): ExerciseAdapter {
  const adapter = defineAdapter(payload => {
    const d = record(payload)
    const view: ExerciseView = {
      version: 1,
      format: part.itemFormat,
      title: String(d['title'] ?? d['theme'] ?? part.title),
      text: String(d['content'] ?? d['task'] ?? d['context'] ?? ''),
    }
    if (skill === 'writing') view.fields = writingFields(d, rules)
    else if (skill === 'speaking')
      view.segments = (rules.segments ?? []).map(s => ({ ...s, prompt: segmentPrompt(d, s.id) }))
    else {
      const rows = (d['questions'] ?? d['items'] ?? []) as Record<string, unknown>[]
      const audio =
        typeof d['audio'] === 'object' && d['audio']
          ? (d['audio'] as {
              shared?: string
              items?: Record<string, string>
              sections?: Record<string, string>
            })
          : {}
      if (audio.shared) view.audio = audio.shared
      if (typeof d['transcript'] === 'string') view.transcript = d['transcript']
      if (Array.isArray(d['sections']))
        view.sections = d['sections'].map(value => {
          const section = record(value)
          const id = String(section['id'])
          return {
            id,
            transcript: String(section['transcript'] ?? ''),
            questionIds: section['questionIds'] as string[],
            ...(audio.sections?.[id] ? { audio: audio.sections[id] } : {}),
          }
        })
      const rowId = (q: Record<string, unknown>, i: number): string =>
        String(
          q['id'] ??
            (skill === 'listening' ? `${d['id']}-${d['items'] ? 'i' : 'q'}${i}` : `q${i + 1}`)
        )
      if (part.itemFormat === 'gap-fill') {
        view.questions = rows.map((q, i) => gapQuestion(q, rowId(q, i)))
        return view
      }
      view.questions = rows.map((q, i) => ({
        id: rowId(q, i),
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
    if (skill === 'writing' && writing && typeof writing === 'object') {
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
    if (skill === 'speaking' && review['review'] !== undefined) {
      try {
        validateReview(review['review'], savedRules)
      } catch {
        throw new Error('Invalid saved speaking rubric or total')
      }
    }
  }
  return adapter
}

/**
 * A typed-answer gap: its accepted answers, no options. A raw `correctAnswer` is ignored, since
 * the generation path coerces numeric strings in that key for every pack.
 */
function gapQuestion(q: Record<string, unknown>, id: string): RuntimeQuestion {
  const accepted = Array.isArray(q['accepted'])
    ? q['accepted'].filter((a): a is string => typeof a === 'string')
    : []
  return {
    id,
    text: typeof q['question'] === 'string' ? q['question'] : '',
    options: [],
    correctAnswer: GAP_ANSWER_INDEX,
    accepted,
    explanation: String(q['explanation'] ?? ''),
  }
}

function writingFields(
  d: Record<string, unknown>,
  rules: PartRuntime
): NonNullable<ExerciseView['fields']> {
  const fields = rules.fields ?? []
  const form = d['form'] && typeof d['form'] === 'object' ? record(d['form']) : undefined
  if (!form || !Array.isArray(form['rows'])) return fields
  const labels = new Map<string, string>()
  for (const row of form['rows'].map(record)) {
    if (typeof row['field'] === 'string' && typeof row['label'] === 'string')
      labels.set(row['field'], row['label'])
  }
  return fields.map(field => ({ ...field, prompt: labels.get(field.id) ?? '' }))
}

function segmentPrompt(d: Record<string, unknown>, id: string): string {
  if (Array.isArray(d['cards'])) {
    const card = d['cards'].map(record).find(c => c['segment'] === id)
    if (card)
      return [card['topic'], card['cue']].filter(v => typeof v === 'string' && v).join(' · ')
  }
  return String(
    d[id === 'answers' ? 'answerQuestions' : id === 'questions' ? 'askQuestions' : 'keywords'] ?? ''
  )
}
