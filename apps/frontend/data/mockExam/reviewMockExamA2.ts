import type { SkillId } from '~/utils/labels'
import type { LanguageOptions } from '~/utils/types'

export interface MockExamOverviewItem {
  skill: SkillId
  text: string
}

export interface MockExamOverview {
  summary: string
  strengths: MockExamOverviewItem[]
  focusAreas: MockExamOverviewItem[]
  nextSteps: string[]
}

export interface MockExamOverviewInput {
  overallPoints: number
  modules: Array<{
    skill: SkillId
    score: number | null
    maximum: number
    grading: string
    exercises: Array<{
      part: number
      score: number | null
      total: number | null
      wordCount?: number
      content?: string
      transcripts?: Record<string, string>
    }>
  }>
}

export function buildMockExamOverviewPrompt(
  outputLanguage: LanguageOptions,
  result: MockExamOverviewInput
): string {
  return `Review this Goethe A2 mock-exam result and give a concise learner overview in ${outputLanguage}.
Identify what went well and what deserves more practice. Treat pending AI grades as provisional.
Return only JSON with this shape:
{"summary":"2-3 sentences","strengths":[{"skill":"reading|listening|writing|speaking","text":"..."}],"focusAreas":[{"skill":"reading|listening|writing|speaking","text":"..."}],"nextSteps":["..."]}
Use at most three strengths, three focus areas, and three practical next steps.

Result:
${JSON.stringify(result)}`
}
