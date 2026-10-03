import type { MockExamRules } from './packs/goethe-de-a2/content/seeds/mock-exam'
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
}

/**
 * Whether a mock result passes. A set with `groups` passes only when every group reaches its
 * own mark; otherwise the rounded total is compared with `passPoints`. A module without a
 * final score (not taken, or still being graded) counts as zero.
 */
export function evaluateMockPass(
  rules: MockExamRules | undefined,
  scores: Partial<Record<SkillId, number | null>>
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
  const passed = groups.length
    ? groups.every(group => group.passed)
    : Math.round(overall) >= (rules?.passPoints ?? DEFAULT_RULES.passPoints)
  return { overall, maximum, passed, groups }
}
