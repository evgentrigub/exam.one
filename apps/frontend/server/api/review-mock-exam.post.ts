import {
  buildMockExamOverviewPrompt,
  type MockExamOverview,
  type MockExamOverviewInput,
} from '~/data/mockExam/reviewMockExamA2'
import { callLlm, getLlmConfig } from '~/server/utils/llm'

interface ReviewMockExamBody {
  locale?: string
  result?: MockExamOverviewInput
}

function isOverview(value: unknown): value is MockExamOverview {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const validItems = (items: unknown): boolean => Array.isArray(items) && items.every(item => {
    if (!item || typeof item !== 'object') return false
    const entry = item as Record<string, unknown>
    return ['reading', 'listening', 'writing', 'speaking'].includes(String(entry['skill']))
      && typeof entry['text'] === 'string'
  })
  return typeof record['summary'] === 'string'
    && validItems(record['strengths'])
    && validItems(record['focusAreas'])
    && Array.isArray(record['nextSteps'])
    && record['nextSteps'].every(item => typeof item === 'string')
}

function parseOverview(raw: string): MockExamOverview | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  const candidates = [fenced, raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)]
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const parsed: unknown = JSON.parse(candidate.trim())
      if (isOverview(parsed)) {
        return {
          summary: parsed.summary,
          strengths: parsed.strengths.slice(0, 3),
          focusAreas: parsed.focusAreas.slice(0, 3),
          nextSteps: parsed.nextSteps.slice(0, 3),
        }
      }
    } catch {
      // Try the next candidate.
    }
  }
  return null
}

export default defineEventHandler(async (event): Promise<{ data: MockExamOverview | null; error: string | null }> => {
  const body = await readBody<ReviewMockExamBody>(event)
  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing mock exam result' })
  }

  const config = getLlmConfig(useRuntimeConfig())
  if (!config) return { data: null, error: 'AI overview is unavailable because no LLM API key is configured.' }

  try {
    const locale = body.locale === 'de' ? 'de' : 'en'
    const raw = await callLlm(config, [
      {
        role: 'system',
        content: 'You are a supportive Goethe A2 exam coach. Return only valid JSON and keep feedback concise.',
      },
      { role: 'user', content: buildMockExamOverviewPrompt(locale, body.result) },
    ], { temperature: 0.3, maxTokens: 900 })
    const overview = parseOverview(raw)
    return overview
      ? { data: overview, error: null }
      : { data: null, error: 'The AI overview response could not be read. Please try again.' }
  } catch (error: unknown) {
    console.error('[review-mock-exam] failed', error)
    return { data: null, error: 'AI overview generation failed. Please try again.' }
  }
})
