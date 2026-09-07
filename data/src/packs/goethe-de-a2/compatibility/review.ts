import type { SpeakingReviewCriterion, SpeakingReviewData } from '@exam-one/exam-content'
import { isRecord } from './json'
import { goetheDeA2 } from '../pack'
import type { PartRuntime } from '../../../runtime'

export interface ReviewCriteriaItem {
  grade: string
  points: number
  comment: string
}

export interface WritingReviewData {
  teil: number
  word_count: number
  teil_rule_applied: string
  priority_fixes: string[]
  examples: { error: string; correction: string; rule: string }[]
  report: string
  criteria: Record<string, ReviewCriteriaItem>
  [key: string]: unknown
}

export interface MockExamOverview {
  summary: string
  strengths: { skill: string; text: string }[]
  focusAreas: { skill: string; text: string }[]
  nextSteps: string[]
}

export function isCriteriaItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value['grade'] === 'string' &&
    typeof value['points'] === 'number' &&
    typeof value['comment'] === 'string'
  )
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

export function isExampleArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        isRecord(item) &&
        typeof item['error'] === 'string' &&
        typeof item['correction'] === 'string' &&
        typeof item['rule'] === 'string'
    )
  )
}

export function hasCommonReviewShape(value: Record<string, unknown>): boolean {
  return (
    typeof value['teil'] === 'number' &&
    typeof value['word_count'] === 'number' &&
    typeof value['teil_rule_applied'] === 'string' &&
    isStringArray(value['priority_fixes']) &&
    isExampleArray(value['examples']) &&
    typeof value['report'] === 'string'
  )
}

export function isValidA2Review(
  value: unknown,
  savedRules?: PartRuntime
): value is WritingReviewData {
  if (!isRecord(value) || !hasCommonReviewShape(value)) return false
  const criteria = value['criteria']
  const rules =
    savedRules ??
    goetheDeA2.structure
      .find(module => module.id === 'writing')
      ?.parts.find(part => part.n === value['teil'])?.runtime
  if (!rules?.criteria || !isRecord(criteria)) return false
  let total = 0
  for (const criterion of rules.criteria) {
    const row = criteria[criterion.id]
    if (
      !isRecord(row) ||
      typeof row['points'] !== 'number' ||
      !Number.isFinite(row['points']) ||
      row['points'] < 0 ||
      row['points'] > criterion.maxPoints
    )
      return false
    total += row['points']
  }
  const zero =
    rules.fields?.some(
      field =>
        field.zeroBelowWords !== undefined && Number(value['word_count']) < field.zeroBelowWords
    ) ||
    (isRecord(criteria['aufgabenerfuellung']) && criteria['aufgabenerfuellung']['points'] === 0)
  const expected = zero ? 0 : total
  if (
    value['teil_points_mess'] !== expected ||
    typeof value['teil_points_result'] !== 'number' ||
    Math.abs(value['teil_points_result'] - expected * (rules.multiplier ?? 1)) > 0.000001
  )
    return false
  const requiredWordCount = value['required_word_count']
  const registerCheck = value['register_check']
  const contentPoints = value['content_points_covered']
  return (
    isRecord(criteria) &&
    isCriteriaItem(criteria['aufgabenerfuellung']) &&
    isCriteriaItem(criteria['sprache']) &&
    typeof value['teil_points_mess'] === 'number' &&
    typeof value['teil_points_result'] === 'number' &&
    isRecord(requiredWordCount) &&
    typeof requiredWordCount['min'] === 'number' &&
    typeof requiredWordCount['max'] === 'number' &&
    isRecord(registerCheck) &&
    typeof registerCheck['expected'] === 'string' &&
    typeof registerCheck['detected'] === 'string' &&
    typeof registerCheck['ok'] === 'boolean' &&
    isRecord(contentPoints) &&
    typeof contentPoints['required'] === 'number' &&
    typeof contentPoints['covered'] === 'number'
  )
}

export function isValidC1Review(value: unknown): value is WritingReviewData {
  if (!isRecord(value) || !hasCommonReviewShape(value)) return false
  const criteria = value['criteria']
  return (
    isRecord(criteria) &&
    isCriteriaItem(criteria['aufgabenerfuellung']) &&
    isCriteriaItem(criteria['kohaerenz']) &&
    isCriteriaItem(criteria['wortschatz']) &&
    isCriteriaItem(criteria['strukturen']) &&
    typeof value['required_word_count'] === 'number' &&
    typeof value['teil_points'] === 'number' &&
    typeof value['passed_module'] === 'boolean'
  )
}

export function isCriterion(value: unknown): value is SpeakingReviewCriterion {
  if (!isRecord(value)) return false
  const id = value['id']
  return (
    (id === 'answers' || id === 'questions' || id === 'taskCompletion' || id === 'language') &&
    typeof value['label'] === 'string' &&
    Number.isInteger(value['points']) &&
    Number.isInteger(value['maxPoints']) &&
    typeof value['comment'] === 'string' &&
    (value['points'] as number) >= 0 &&
    (value['maxPoints'] as number) > 0 &&
    (value['points'] as number) <= (value['maxPoints'] as number)
  )
}

export function isSpeakingReviewData(
  value: unknown,
  savedRules?: PartRuntime
): value is SpeakingReviewData {
  if (!isRecord(value)) return false
  if (value['teil'] !== 1 && value['teil'] !== 2) return false
  const rules =
    savedRules ??
    goetheDeA2.structure
      .find(module => module.id === 'speaking')
      ?.parts.find(part => part.n === value['teil'])?.runtime
  if (!rules?.criteria) return false
  const maxPoints = rules.maxPoints
  if (value['maxPoints'] !== maxPoints) return false
  if (!Array.isArray(value['criteria']) || !value['criteria'].every(isCriterion)) return false
  if (!isStringArray(value['strengths']) || !isStringArray(value['improvements'])) return false
  if (typeof value['summary'] !== 'string' || !Number.isInteger(value['totalPoints'])) return false

  const criteria = value['criteria'] as SpeakingReviewCriterion[]
  const expectedIds = new Set(rules.criteria.map(criterion => criterion.id))
  if (criteria.length !== expectedIds.size || criteria.some(item => !expectedIds.has(item.id)))
    return false
  if (new Set(criteria.map(item => item.id)).size !== expectedIds.size) return false
  if (
    criteria.some(
      item =>
        item.maxPoints !== rules.criteria?.find(criterion => criterion.id === item.id)?.maxPoints
    )
  )
    return false
  const total = criteria.reduce((sum, item) => sum + item.points, 0)
  return value['totalPoints'] === total && total <= maxPoints
}

export function isOverview(value: unknown): value is MockExamOverview {
  if (!isRecord(value)) return false
  const validItems = (items: unknown): boolean =>
    Array.isArray(items) &&
    items.every(item => {
      if (!isRecord(item)) return false
      return (
        ['reading', 'listening', 'writing', 'speaking'].includes(String(item['skill'])) &&
        typeof item['text'] === 'string'
      )
    })
  return (
    typeof value['summary'] === 'string' &&
    validItems(value['strengths']) &&
    validItems(value['focusAreas']) &&
    Array.isArray(value['nextSteps']) &&
    value['nextSteps'].every(item => typeof item === 'string')
  )
}
