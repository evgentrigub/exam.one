import type { MockExamRules, MockScaleRules } from './packs/goethe-de-a2/content/seeds/mock-exam'
import type { SkillId } from './types'

/** The pass mark of a set without rules, as the Goethe sets have always used. */
const DEFAULT_RULES = { maximumPoints: 100, passPoints: 60 }

export interface MockGroupResult {
  id: string
  label: string
  points: number
  maximum: number
  passPoints: number
  passed: boolean
}

export interface MockPassResult {
  overall: number
  maximum: number
  passed: boolean
  groups: MockGroupResult[]
  /** Set when the rules report on a scale. */
  scale?: MockScaleResult
}

export interface MockScaleResult {
  /** Each module's scale score, or null while it has no score. */
  skills: Partial<Record<SkillId, number | null>>
  /** The rounded average of every module, or null until all of them are scored. */
  overall: number | null
  /** The band the overall score earns, or null below every band or while pending. */
  band: string | null
  passed: boolean
}

/**
 * The raw points an objective exercise earns in a mock: its correct answers out of `total`
 * questions, scaled to the exercise's `maxRawPoints`. Most parts score one point per question,
 * so this is the count itself; a part worth half a point per gap (Certyfikat Polski: 10 gaps for
 * 5 points) earns half of it. Responses keep storing the count, so stored attempts stay valid.
 */
export function objectiveExercisePoints(
  correct: number,
  total: number | undefined,
  maxRawPoints: number
): number {
  if (!total || total <= 0 || total === maxRawPoints) return correct
  return (correct / total) * maxRawPoints
}

/**
 * One module's raw marks on the scale. Raw marks out of `maxRaw` are first rescaled to the
 * official maximum (practice Speaking: 30 → 45), then interpolated between the anchors; below
 * the lowest anchor the first segment is extended, floored at 0. Not rounded.
 */
export function scaleScore(
  scale: MockScaleRules,
  skill: SkillId,
  raw: number,
  maxRaw: number
): number {
  const anchors = scale.anchors[skill]
  if (!anchors?.length) throw new Error(`No scale anchors for ${skill}`)
  const official = scale.officialRaw[skill] ?? maxRaw
  const value = Math.min(Math.max(maxRaw > 0 ? (raw / maxRaw) * official : 0, 0), official)
  const segment = (index: number): number => {
    const [x0, y0] = anchors[index]!
    const [x1, y1] = anchors[index + 1]!
    return y0 + ((value - x0) * (y1 - y0)) / (x1 - x0)
  }
  if (anchors.length === 1) return anchors[0]![1]
  if (value <= anchors[0]![0]) return Math.max(segment(0), 0)
  for (let index = 0; index < anchors.length - 1; index += 1) {
    if (value <= anchors[index + 1]![0]) return segment(index)
  }
  return anchors[anchors.length - 1]![1]
}

/** Every module on the scale, their rounded average, its band and whether it passes. */
export function evaluateMockScale(
  scale: MockScaleRules,
  scores: Partial<Record<SkillId, number | null>>,
  maxima: Partial<Record<SkillId, number>>
): MockScaleResult {
  // The scale defines the required skills. An omitted grade must not produce an average
  // from just the already-scored papers (for example Reading alone).
  const entries = (Object.keys(scale.anchors) as SkillId[]).map(
    skill => [skill, scores[skill]] as const
  )
  const skills = Object.fromEntries(
    entries.map(([skill, raw]) => [
      skill,
      typeof raw === 'number' && Number.isFinite(raw)
        ? scaleScore(scale, skill, raw, maxima[skill] ?? 0)
        : null,
    ])
  ) as Partial<Record<SkillId, number | null>>
  const values = Object.values(skills)
  const complete = values.length > 0 && values.every(value => typeof value === 'number')
  const overall = complete
    ? Math.round((values as number[]).reduce((sum, value) => sum + value, 0) / values.length)
    : null
  const band = overall === null ? null : (scale.bands.find(item => overall >= item.min)?.id ?? null)
  return { skills, overall, band, passed: overall !== null && overall >= scale.pass }
}

/**
 * Whether a mock result passes. A set with a `scale` passes when the average scale score of
 * every module reaches the scale's pass score (this needs each module's raw maximum in
 * `maxima`, and its scores as raw marks). A set with `groups` passes only when every group
 * reaches its own mark; otherwise the rounded total is compared with `passPoints`. For
 * points, a module without a final score (not taken, or still being graded) counts as zero.
 */
export function evaluateMockPass(
  rules: MockExamRules | undefined,
  scores: Partial<Record<SkillId, number | null>>,
  maxima: Partial<Record<SkillId, number>> = {}
): MockPassResult {
  const points = (skill: SkillId): number => scores[skill] ?? 0
  const overall = (Object.keys(scores) as SkillId[]).reduce((sum, skill) => sum + points(skill), 0)
  const maximum = rules?.maximumPoints ?? DEFAULT_RULES.maximumPoints
  const groups = (rules?.groups ?? []).map(group => {
    const total = group.skills.reduce((sum, skill) => sum + points(skill), 0)
    return {
      id: group.id,
      label: group.label,
      points: total,
      maximum: group.maximumPoints,
      passPoints: group.passPoints,
      passed: Math.round(total) >= group.passPoints,
    }
  })
  if (rules?.scale) {
    const scale = evaluateMockScale(rules.scale, scores, maxima)
    return { overall, maximum, passed: scale.passed, groups, scale }
  }
  const passed = groups.length
    ? groups.every(group => group.passed)
    : Math.round(overall) >= (rules?.passPoints ?? DEFAULT_RULES.passPoints)
  return { overall, maximum, passed, groups }
}
