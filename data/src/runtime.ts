import { OBJECTIVE_FORMATS, type ItemFormat, type SkillId } from './types'

export interface RubricCriterion {
  id: string
  label: string
  maxPoints: number
  /** Discrete rubric bands, highest first (A–E). */
  allowedPoints?: number[]
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
  previewSeconds?: number
  zeroCriterion?: string
  wordCountGuidanceOnly?: boolean
  fields?: ResponseField[]
  segments?: Array<{ id: string; label: string; maxSeconds?: number }>
  criteria?: RubricCriterion[]
  maxPoints: number
  multiplier?: number
}
export interface RuntimeQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  /**
   * Gap-fill only: every typed answer that earns the mark. Such a question has no options and
   * `correctAnswer` is `GAP_ANSWER_INDEX`, so no numeric answer can ever match it.
   */
  accepted?: string[]
  explanation?: string
  weight?: number
  audio?: string
  transcript?: string
}

/** The `correctAnswer` of a gap-fill question, which is scored against `accepted` instead. */
export const GAP_ANSWER_INDEX = -1

export function isGapQuestion(question: RuntimeQuestion): boolean {
  return Array.isArray(question.accepted)
}

/**
 * Compare typed answers without forgiving spelling: case, spacing, typographic apostrophes and
 * dashes, surrounding quotes and trailing punctuation are ignored; everything else must match
 * an accepted answer. Numbers, times and spelling variants are listed in `accepted`, not
 * inferred here, so the accepted answers shown to the learner are the whole rule.
 */
export function normalizeGapAnswer(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  return String(value)
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201B\u02BC`\u00B4]/g, "'")
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["\u201C\u201D.,;:!?]+|["\u201C\u201D.,;:!?]+$/g, '')
    .trim()
    .toLowerCase()
}

export function isGapAnswerCorrect(answer: unknown, accepted: readonly string[]): boolean {
  const given = normalizeGapAnswer(answer)
  return given !== '' && accepted.some(option => normalizeGapAnswer(option) === given)
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
  sections?: Array<{ id: string; transcript: string; questionIds: string[]; audio?: string }>
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
    if (format === 'gap-fill') {
      if (!Array.isArray(data['questions']) || !data['questions'].length)
        throw new Error('Missing questions')
      view.questions = data['questions'].map((item, index) => {
        const q = record(item)
        const accepted = q['accepted']
        if (!Array.isArray(accepted) || !accepted.every(x => typeof x === 'string'))
          throw new Error('Invalid accepted answers')
        return {
          id: typeof q['id'] === 'string' ? q['id'] : `q${index + 1}`,
          text: typeof q['text'] === 'string' ? q['text'] : '',
          options: [],
          correctAnswer: GAP_ANSWER_INDEX,
          accepted: accepted as string[],
          ...(typeof q['explanation'] === 'string' ? { explanation: q['explanation'] } : {}),
          ...(typeof q['weight'] === 'number' ? { weight: q['weight'] } : {}),
        }
      })
    } else if (['selection', 'matching', 'true-false'].includes(format)) {
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
  if (OBJECTIVE_FORMATS.includes(view.format) && !view.questions?.length)
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
      if (view.format === 'gap-fill') validateGap(q)
      else {
        if (q.accepted !== undefined) throw new Error('Accepted answers are only for gap-fill')
        if (rules.optionCount !== undefined && q['options'].length !== rules.optionCount)
          throw new Error('Unexpected option count')
        if (
          !Number.isInteger(q['correctAnswer']) ||
          q['correctAnswer'] < 0 ||
          q['correctAnswer'] >= q['options'].length
        )
          throw new Error('Invalid answer index')
      }
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
  if (view.sections) {
    const ids = view.sections.map(section => section.id)
    const references = view.sections.flatMap(section => section.questionIds)
    if (
      new Set(ids).size !== ids.length ||
      view.sections.some(s => !s.id || !s.transcript.trim() || !s.questionIds.length) ||
      new Set(references).size !== references.length ||
      references.length !== view.questions?.length ||
      references.some(id => !view.questions?.some(q => q.id === id))
    )
      throw new Error('Invalid audio section references')
  }
}

function validateGap(q: RuntimeQuestion): void {
  if (
    !q.accepted?.length ||
    q.accepted.some(answer => typeof answer !== 'string' || !normalizeGapAnswer(answer))
  )
    throw new Error('A gap needs at least one accepted answer')
  if (q.options.length || q.correctAnswer !== GAP_ANSWER_INDEX)
    throw new Error('A gap has no options or answer index')
}

/**
 * Flatten a stored attempt's answers to the `{ id: value }` map the view is scored and
 * rendered against.
 *
 * The client stores a *submission record*, not a flat map: reading and listening nest their
 * choices under `responses`, writing keeps the essay under `content`, and speaking keeps its
 * transcripts under `transcripts`. Those names are load-bearing — the practice screens rebuild
 * their history from them by key — so this is a permanent adapter between the two shapes
 * rather than a migration shim. Flat values are preferred, so a caller that already passes a
 * flat map is unaffected.
 */
export function resolveAnswers(
  view: ExerciseView,
  answers: Record<string, unknown>
): Record<string, unknown> {
  const responses = isRecord(answers['responses']) ? answers['responses'] : {}
  const transcripts = isRecord(answers['transcripts']) ? answers['transcripts'] : {}
  const resolved: Record<string, unknown> = {}

  for (const question of view.questions ?? []) {
    const value = answers[question.id] ?? responses[question.id]
    if (value !== undefined) resolved[question.id] = value
  }
  for (const field of view.fields ?? []) {
    const value = answers[field.id] ?? answers['content']
    if (value !== undefined) resolved[field.id] = value
  }
  for (const segment of view.segments ?? []) {
    // A single-segment part may have stored only the combined `transcript`.
    const value =
      answers[segment.id] ??
      transcripts[segment.id] ??
      ((view.segments ?? []).length === 1 ? answers['transcript'] : undefined)
    if (value !== undefined) resolved[segment.id] = value
  }
  return resolved
}

export function objectiveScore(
  view: ExerciseView,
  rules: PartRuntime,
  answers: Record<string, unknown>
) {
  const questions = view.questions ?? []
  const totalWeight = questions.reduce((sum, q) => sum + (q['weight'] ?? 1), 0)
  const correct = (q: RuntimeQuestion): boolean =>
    q.accepted ? isGapAnswerCorrect(answers[q.id], q.accepted) : answers[q.id] === q.correctAnswer
  const earned = questions.reduce((sum, q) => sum + (correct(q) ? (q['weight'] ?? 1) : 0), 0)
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
    if (definition.allowedPoints) {
      const band = definition.allowedPoints.indexOf(row['points'])
      if (band < 0 || row['grade'] !== 'ABCDE'[band]) throw new Error('Invalid criterion band')
    }
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

/** Apply task-wide zero rules using actual submitted words, never the model's claimed count. */
export function applyReviewRules(
  review: CriterionReview,
  rules: PartRuntime,
  answers: Record<string, unknown>
): CriterionReview {
  const tooShort = (rules.fields ?? []).some(
    field =>
      field.zeroBelowWords !== undefined &&
      String(answers[field.id] ?? '')
        .trim()
        .split(/\s+/u)
        .filter(Boolean).length < field.zeroBelowWords
  )
  const unfulfilled =
    rules.zeroCriterion && review.criteria.some(c => c.id === rules.zeroCriterion && c.points === 0)
  if (!tooShort && !unfulfilled) return review
  return {
    ...review,
    totalPoints: 0,
    criteria: review.criteria.map(c => ({
      ...c,
      points: 0,
      ...(c.allowedPoints ? { grade: 'E' } : {}),
    })),
    ruleApplied: tooShort ? 'below_half_length' : 'task_fulfilment_zero',
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
    ? review['checks'].filter(
        (item): item is ReviewCheck => isRecord(item) && typeof item['id'] === 'string'
      )
    : undefined
  const wordCount =
    isRecord(review['wordCount']) && typeof review['wordCount']['actual'] === 'number'
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

/**
 * Give every generated question or item a stable id.
 *
 * Models are told not to emit ids, and the projected view needs unique ones:
 * `validateView` rejects duplicates, and generated listening audio is keyed by
 * question id, so without this per-item audio never attaches.
 */
export function withQuestionIds(payload: Record<string, unknown>): Record<string, unknown> {
  const id = String(payload['id'])
  const stamp = (rows: unknown, prefix: string): unknown =>
    Array.isArray(rows)
      ? rows.map((row, index) =>
          row && typeof row === 'object' && !Array.isArray(row)
            ? { id: `${id}-${prefix}${index + 1}`, ...(row as Record<string, unknown>) }
            : row
        )
      : rows
  return {
    ...payload,
    ...(payload['items'] ? { items: stamp(payload['items'], 'i') } : {}),
    ...(payload['questions'] ? { questions: stamp(payload['questions'], 'q') } : {}),
  }
}
