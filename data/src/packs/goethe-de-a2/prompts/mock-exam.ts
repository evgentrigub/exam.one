import type { SkillId } from '../../../types'

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
  outputLanguage: string,
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

const SKILLS: readonly string[] = ['reading', 'listening', 'writing', 'speaking']

function isItemArray(value: unknown): value is MockExamOverviewItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        SKILLS.includes(String((item as Record<string, unknown>)['skill'])) &&
        typeof (item as Record<string, unknown>)['text'] === 'string'
    )
  )
}

/** The overview card keys its lists by `skill`, so an unknown skill would render unlabelled. */
export function isMockExamOverview(value: unknown): value is MockExamOverview {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const overview = value as Record<string, unknown>
  return (
    typeof overview['summary'] === 'string' &&
    isItemArray(overview['strengths']) &&
    isItemArray(overview['focusAreas']) &&
    Array.isArray(overview['nextSteps']) &&
    overview['nextSteps'].every(step => typeof step === 'string')
  )
}

/**
 * The mock overview as a pack slot.
 *
 * It cannot be an ordinary `PromptSpec`: `findPrompt` keys on skill + part, and the overview
 * is cross-module with neither. The prompt asks for at most three of each list but nothing
 * in the card enforces it, so the trim lives here.
 */
export const goetheA2MockOverview = {
  llm: { temperature: 0.3, maxTokens: 900 },
  system:
    'You are a supportive Goethe A2 exam coach. Return only valid JSON and keep feedback concise.',
  assemble: buildMockExamOverviewPrompt,
  parse(value: unknown): MockExamOverview | null {
    if (!isMockExamOverview(value)) return null
    return {
      summary: value.summary,
      strengths: value.strengths.slice(0, 3),
      focusAreas: value.focusAreas.slice(0, 3),
      nextSteps: value.nextSteps.slice(0, 3),
    }
  },
}
