import { objectiveExercisePoints } from '@exam-one/exam-packs'
import type { MockExerciseResult } from '~/composables/useMockExam'

/**
 * An objective response's raw points out of the exercise's `maxRawPoints`, rounded to a tenth
 * for display (a half-point gap shows as 3.5); null while the exercise has no answers.
 */
export function objectivePoints(
  response: Pick<MockExerciseResult, 'score' | 'total'> | undefined,
  maxRawPoints: number
): number | null {
  if (typeof response?.score !== 'number') return null
  return Math.round(objectiveExercisePoints(response.score, response.total, maxRawPoints) * 10) / 10
}
