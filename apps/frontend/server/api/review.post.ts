import type { H3Event } from 'h3'
import type { WritingExercise, AiReviewData } from '~/utils/types'
import { callLlm, getLlmConfig } from '~/server/utils/llm'

interface ReviewRequestBody {
  topic: WritingExercise
  userContent: string
  prompt: string
}

interface ReviewResponse {
  text: string
  data: AiReviewData | null
  error: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidReviewRequest(value: unknown): value is ReviewRequestBody {
  return isRecord(value)
    && isRecord(value['topic'])
    && typeof value['userContent'] === 'string'
    && value['userContent'].trim().length > 0
    && typeof value['prompt'] === 'string'
    && value['prompt'].trim().length > 0
}

function isCriteriaItem(value: unknown): boolean {
  return isRecord(value)
    && typeof value['grade'] === 'string'
    && typeof value['points'] === 'number'
    && typeof value['comment'] === 'string'
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isExampleArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(item => (
    isRecord(item)
    && typeof item['error'] === 'string'
    && typeof item['correction'] === 'string'
    && typeof item['rule'] === 'string'
  ))
}

function hasCommonReviewShape(value: Record<string, unknown>): boolean {
  return typeof value['teil'] === 'number'
    && typeof value['word_count'] === 'number'
    && typeof value['teil_rule_applied'] === 'string'
    && isStringArray(value['priority_fixes'])
    && isExampleArray(value['examples'])
    && typeof value['report'] === 'string'
}

function isValidA2Review(value: unknown): value is AiReviewData {
  if (!isRecord(value) || !hasCommonReviewShape(value)) return false
  const criteria = value['criteria']
  const requiredWordCount = value['required_word_count']
  const registerCheck = value['register_check']
  const contentPoints = value['content_points_covered']

  return isRecord(criteria)
    && isCriteriaItem(criteria['aufgabenerfuellung'])
    && isCriteriaItem(criteria['sprache'])
    && typeof value['teil_points_mess'] === 'number'
    && typeof value['teil_points_result'] === 'number'
    && isRecord(requiredWordCount)
    && typeof requiredWordCount['min'] === 'number'
    && typeof requiredWordCount['max'] === 'number'
    && isRecord(registerCheck)
    && typeof registerCheck['expected'] === 'string'
    && typeof registerCheck['detected'] === 'string'
    && typeof registerCheck['ok'] === 'boolean'
    && isRecord(contentPoints)
    && typeof contentPoints['required'] === 'number'
    && typeof contentPoints['covered'] === 'number'
}

function isValidC1Review(value: unknown): value is AiReviewData {
  if (!isRecord(value) || !hasCommonReviewShape(value)) return false
  const criteria = value['criteria']

  return isRecord(criteria)
    && isCriteriaItem(criteria['aufgabenerfuellung'])
    && isCriteriaItem(criteria['kohaerenz'])
    && isCriteriaItem(criteria['wortschatz'])
    && isCriteriaItem(criteria['strukturen'])
    && typeof value['required_word_count'] === 'number'
    && typeof value['teil_points'] === 'number'
    && typeof value['passed_module'] === 'boolean'
}

function parseReviewCandidate(candidate: string): AiReviewData | null {
  try {
    const parsed = JSON.parse(candidate) as unknown
    return isValidA2Review(parsed) || isValidC1Review(parsed) ? parsed : null
  } catch {
    return null
  }
}

function tryExtractJsonObject(rawText: string): AiReviewData | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1
  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      const parsed = parseReviewCandidate(candidate)
      if (parsed) return parsed
    }
  }
  const firstBrace = rawText.indexOf('{')
  if (firstBrace < 0) return null
  for (let j = rawText.length - 1; j > firstBrace; j--) {
    if (rawText[j] !== '}') continue
    const candidate = rawText.slice(firstBrace, j + 1)
    const parsed = parseReviewCandidate(candidate)
    if (parsed) return parsed
  }
  return null
}

export default defineEventHandler(async (event: H3Event): Promise<ReviewResponse> => {
  const config = useRuntimeConfig()
  const llmConfig = getLlmConfig(config)
  const body = await readBody<unknown>(event)

  if (!isValidReviewRequest(body)) {
    return {
      text: '',
      data: null,
      error: 'Invalid writing review request.',
    }
  }

  if (!llmConfig) {
    return {
      text: '',
      data: null,
      error: 'AI review is unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.',
    }
  }

  try {
    const rawText = await callLlm(llmConfig, [
      {
        role: 'system',
        content: 'You are an expert Goethe-Institut examiner. Review writing submissions according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.'
      },
      { role: 'user', content: body.prompt }
    ])
    const data = tryExtractJsonObject(rawText)
    return { text: rawText, data, error: data ? null : 'Failed to parse review from AI response.' }
  } catch (error) {
    console.error('Error reviewing writing submission:', error)
    return {
      text: '',
      data: null,
      error: 'AI review failed. Please check your API key and try again.',
    }
  }
})
