import type { ItemFormat, SkillId } from './types'

export interface RubricCriterion {
  id: string
  label: string
  maxPoints: number
}
export interface ResponseField {
  id: string
  label: string
  minWords?: number
  maxWords?: number
  zeroBelowWords?: number
}
export interface PartRuntime {
  minutes: number
  questionCount?: number
  optionCount?: number
  reuseOptions?: boolean
  replays?: number
  fields?: ResponseField[]
  segments?: Array<{ id: string; label: string }>
  criteria?: RubricCriterion[]
  maxPoints: number
  multiplier?: number
}
export interface RuntimeQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
  weight?: number
  audio?: string
  transcript?: string
}
export interface ExerciseView {
  version: 1
  format: ItemFormat
  title: string
  text: string
  questions?: RuntimeQuestion[]
  fields?: Array<ResponseField & { prompt?: string }>
  segments?: Array<{ id: string; label: string; prompt: string }>
  audio?: string
  transcript?: string
}
/** A concrete error the learner made, with the correction and the rule behind it. */
export interface ReviewExample {
  error: string
  correction: string
  rule: string
}

/** A named check a rubric may report on, such as register or content coverage. */
export interface ReviewCheck {
  id: string
  expected?: string
  detected?: string
  ok?: boolean
  required?: number
  covered?: number
}

export interface CriterionReview {
  criteria: Array<RubricCriterion & { points: number; comment: string; grade?: string }>
  totalPoints: number
  maxPoints: number
  summary: string
  strengths: string[]
  improvements: string[]
  /** Optional richer feedback. A pack may emit any subset; absent fields are simply not rendered. */
  examples?: ReviewExample[]
  priorityFixes?: string[]
  report?: string
  wordCount?: { actual: number; min?: number; max?: number }
  ruleApplied?: string
  checks?: ReviewCheck[]
}
export interface ExerciseAdapter {
  project(payload: unknown): ExerciseView
  validateStoredReview?(review: unknown, rules: PartRuntime): void
}
export interface RuntimeSnapshot {
  version: 1
  compatibility?: string
  payload?: unknown
  packId: string
  skill: SkillId
  part: number
  view: ExerciseView
  rules: PartRuntime
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected an exercise object')
  return value as Record<string, unknown>
}
function string(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${name}`)
  return value
}

/** A pack may map its own JSON into this view; stored payloads need not use these keys. */
export function defineAdapter(project: (payload: unknown) => ExerciseView): ExerciseAdapter {
  return { project }
}

/** Default projection for authors using the documented format payloads. */
export function formatAdapter(format: ItemFormat, rules: PartRuntime): ExerciseAdapter {
  return defineAdapter(payload => {
    const data = record(payload)
    const view: ExerciseView = {
      version: 1,
      format,
      title: string(data['title'], 'title'),
      text: typeof data['text'] === 'string' ? data['text'] : '',
    }
    if (typeof data['audio'] === 'string') view.audio = data['audio']
    const audio = data['audio'] && typeof data['audio'] === 'object' ? record(data['audio']) : {}
    if (typeof audio['shared'] === 'string') view.audio = audio['shared']
    const itemAudio =
      audio['items'] && typeof audio['items'] === 'object' ? record(audio['items']) : {}
    if (typeof data['transcript'] === 'string') view.transcript = data['transcript']
    if (['selection', 'matching', 'true-false'].includes(format)) {
      if (!Array.isArray(data['questions']) || !data['questions'].length)
        throw new Error('Missing questions')
      view.questions = data['questions'].map((item, index) => {
        const q = record(item)
        const options = format === 'true-false' ? ['True', 'False'] : q['options']
        if (
          !Array.isArray(options) ||
          options.length < 2 ||
          !options.every(x => typeof x === 'string')
        )
          throw new Error('Invalid options')
        if (
          !Number.isInteger(q['correctAnswer']) ||
          Number(q['correctAnswer']) < 0 ||
          Number(q['correctAnswer']) >= options.length
        )
          throw new Error('Invalid correct answer')
        const id = typeof q['id'] === 'string' ? q['id'] : `q${index + 1}`
        return {
          id,
          text: string(q['text'], 'question text'),
          options: options as string[],
          correctAnswer: Number(q['correctAnswer']),
          ...(typeof q['explanation'] === 'string' ? { explanation: q['explanation'] } : {}),
          ...(typeof q['audio'] === 'string' ? { audio: q['audio'] } : {}),
          ...(typeof itemAudio[id] === 'string' ? { audio: itemAudio[id] as string } : {}),
          ...(typeof q['transcript'] === 'string' ? { transcript: q['transcript'] } : {}),
          ...(typeof q['weight'] === 'number' ? { weight: q['weight'] } : {}),
        }
      })
    } else if (format === 'freeform') {
      const prompts = data['fields'] ? record(data['fields']) : {}
      view.fields = (rules.fields ?? []).map(field => ({
        ...field,
        prompt: typeof prompts[field.id] === 'string' ? (prompts[field.id] as string) : '',
      }))
    } else {
      const prompts = record(data['segments'])
      view.segments = (rules.segments ?? []).map(segment => ({
        ...segment,
        prompt: string(prompts[segment.id], segment.id),
      }))
    }
    validateView(view, rules)
    return view
  })
}

export function validateView(view: ExerciseView, rules: PartRuntime): void {
  if (view.version !== 1 || !view.title) throw new Error('Invalid exercise view')
  if (['selection', 'matching', 'true-false'].includes(view.format) && !view.questions?.length)
    throw new Error('Missing objective questions')
  if (
    view.format === 'freeform' &&
    (!view.fields?.length ||
      view.fields.map(field => field.id).join('|') !==
        rules.fields?.map(field => field.id).join('|'))
  )
    throw new Error('Writing fields do not match the part configuration')
  if (
    view.format === 'recording' &&
    (!view.segments?.length ||
      view.segments.map(segment => segment.id).join('|') !==
        rules.segments?.map(segment => segment.id).join('|'))
  )
    throw new Error('Recording segments do not match the part configuration')
  if (view.questions) {
    if (rules.questionCount !== undefined && view.questions.length !== rules.questionCount)
      throw new Error('Unexpected question count')
    if (new Set(view.questions.map(q => q['id'])).size !== view.questions.length)
      throw new Error('Duplicate question ids')
    for (const q of view.questions) {
      if (rules.optionCount !== undefined && q['options'].length !== rules.optionCount)
        throw new Error('Unexpected option count')
      if (
        !Number.isInteger(q['correctAnswer']) ||
        q['correctAnswer'] < 0 ||
        q['correctAnswer'] >= q['options'].length
      )
        throw new Error('Invalid answer index')
      if (q['weight'] !== undefined && (!Number.isFinite(q['weight']) || q['weight'] <= 0))
        throw new Error('Invalid question weight')
    }
    if (
      view.format === 'matching' &&
      rules.reuseOptions === false &&
      new Set(view.questions.map(q => q['correctAnswer'])).size !== view.questions.length
    )
      throw new Error('Matching answers must be unique')
  }
}

export function objectiveScore(
  view: ExerciseView,
  rules: PartRuntime,
  answers: Record<string, unknown>
) {
  const questions = view.questions ?? []
  const totalWeight = questions.reduce((sum, q) => sum + (q['weight'] ?? 1), 0)
  const earned = questions.reduce(
    (sum, q) => sum + (answers[q['id']] === q['correctAnswer'] ? (q['weight'] ?? 1) : 0),
    0
  )
  const maxScore = rules.maxPoints * (rules.multiplier ?? 1)
  const score = totalWeight ? (earned / totalWeight) * maxScore : 0
  return { score, maxScore, percentage: maxScore ? Math.round((score / maxScore) * 100) : 0 }
}

export function validateReview(value: unknown, rules: PartRuntime): CriterionReview {
  const review = record(value)
  const criteria = rules.criteria ?? []
  if (!Array.isArray(review['criteria']) || review['criteria'].length !== criteria.length)
    throw new Error('Unexpected review criteria')
  const seen = new Set<string>()
  const checked = review['criteria'].map(item => {
    const row = record(item)
    const definition = criteria.find(c => c.id === row['id'])
    if (
      !definition ||
      seen.has(definition.id) ||
      row['maxPoints'] !== definition.maxPoints ||
      typeof row['points'] !== 'number' ||
      !Number.isFinite(row['points']) ||
      row['points'] < 0 ||
      row['points'] > definition.maxPoints
    )
      throw new Error('Invalid criterion score')
    seen.add(definition.id)
    return {
      ...definition,
      points: row['points'],
      comment: typeof row['comment'] === 'string' ? row['comment'] : '',
      ...(typeof row['grade'] === 'string' ? { grade: row['grade'] } : {}),
    }
  })
  const totalPoints = checked.reduce((sum, c) => sum + c.points, 0)
  if (
    review['maxPoints'] !== rules.maxPoints ||
    typeof review['totalPoints'] !== 'number' ||
    !Number.isFinite(review['totalPoints']) ||
    Math.abs(review['totalPoints'] - totalPoints) > 0.000001
  )
    throw new Error('Invalid review total')
  return {
    criteria: checked,
    totalPoints,
    maxPoints: rules.maxPoints,
    summary: typeof review['summary'] === 'string' ? review['summary'] : '',
    strengths: Array.isArray(review['strengths'])
      ? review['strengths'].filter((s): s is string => typeof s === 'string')
      : [],
    improvements: Array.isArray(review['improvements'])
      ? review['improvements'].filter((s): s is string => typeof s === 'string')
      : [],
    ...reviewExtras(review),
  }
}

/** Optional richer feedback a rubric may report. Anything malformed is dropped, not thrown on. */
function reviewExtras(review: Record<string, unknown>): Partial<CriterionReview> {
  const strings = (value: unknown): string[] | undefined =>
    Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string') : undefined
  const examples = Array.isArray(review['examples'])
    ? review['examples'].filter(
        (item): item is ReviewExample =>
          isRecord(item) &&
          typeof item['error'] === 'string' &&
          typeof item['correction'] === 'string' &&
          typeof item['rule'] === 'string'
      )
    : undefined
  const checks = Array.isArray(review['checks'])
    ? review['checks'].filter((item): item is ReviewCheck => isRecord(item) && typeof item['id'] === 'string')
    : undefined
  const wordCount = isRecord(review['wordCount']) && typeof review['wordCount']['actual'] === 'number'
    ? (review['wordCount'] as CriterionReview['wordCount'])
    : undefined
  const priorityFixes = strings(review['priorityFixes'])
  return {
    ...(examples?.length ? { examples } : {}),
    ...(priorityFixes?.length ? { priorityFixes } : {}),
    ...(typeof review['report'] === 'string' ? { report: review['report'] } : {}),
    ...(wordCount ? { wordCount } : {}),
    ...(typeof review['ruleApplied'] === 'string' ? { ruleApplied: review['ruleApplied'] } : {}),
    ...(checks?.length ? { checks } : {}),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
