import type { H3Event } from 'h3'
import {
  reviewPromptSpeakingA2Teil1,
  reviewPromptSpeakingA2Teil2,
} from '~/data/speaking/a2/reviewSpeakingA2'
import { callLlm, getLlmConfig } from '~/server/utils/llm'
import type {
  SpeakingA2Topic,
  SpeakingReviewCriterion,
  SpeakingReviewData,
  SpeakingTranscripts,
} from '~/utils/exercises/speaking'

interface SpeakingReviewRequest {
  topic: SpeakingA2Topic
  transcripts: SpeakingTranscripts
}

interface AiResponse<T> {
  data: T | null
  error: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFourStrings(value: unknown): value is [string, string, string, string] {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(item => typeof item === 'string' && item.trim().length > 0)
  )
}

function isSpeakingTopic(value: unknown): value is SpeakingA2Topic {
  if (
    !isRecord(value) ||
    typeof value['id'] !== 'string' ||
    typeof value['theme'] !== 'string' ||
    value['difficulty'] !== 'A2'
  ) {
    return false
  }

  if (value['testingPart'] === 1 && value['topicType'] === 'interview') {
    return isFourStrings(value['answerQuestions']) && isFourStrings(value['askQuestions'])
  }

  return (
    value['testingPart'] === 2 &&
    value['topicType'] === 'monologue' &&
    isFourStrings(value['keywords'])
  )
}

function isSpeakingTranscripts(value: unknown): value is SpeakingTranscripts {
  if (!isRecord(value)) return false
  return ['answers', 'questions', 'monologue'].every(
    key => value[key] === undefined || typeof value[key] === 'string'
  )
}

function isValidRequest(value: unknown): value is SpeakingReviewRequest {
  return (
    isRecord(value) &&
    isSpeakingTopic(value['topic']) &&
    isSpeakingTranscripts(value['transcripts'])
  )
}

function buildPrompt(body: SpeakingReviewRequest): string | null {
  if (body.topic.testingPart === 1) {
    const answers = body.transcripts.answers?.trim() ?? ''
    const questions = body.transcripts.questions?.trim() ?? ''
    return answers && questions ? reviewPromptSpeakingA2Teil1(body.topic, answers, questions) : null
  }

  const monologue = body.transcripts.monologue?.trim() ?? ''
  return monologue ? reviewPromptSpeakingA2Teil2(body.topic, monologue) : null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isCriterion(value: unknown): value is SpeakingReviewCriterion {
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

function isReviewData(value: unknown): value is SpeakingReviewData {
  if (!isRecord(value)) return false
  if (value['teil'] !== 1 && value['teil'] !== 2) return false
  const maxPoints = value['teil'] === 1 ? 4 : 8
  if (value['maxPoints'] !== maxPoints) return false
  if (!Array.isArray(value['criteria']) || !value['criteria'].every(isCriterion)) return false
  if (!isStringArray(value['strengths']) || !isStringArray(value['improvements'])) return false
  if (typeof value['summary'] !== 'string' || !Number.isInteger(value['totalPoints'])) return false

  const criteria = value['criteria'] as SpeakingReviewCriterion[]
  const expectedIds =
    value['teil'] === 1
      ? new Set(['answers', 'questions'])
      : new Set(['taskCompletion', 'language'])
  if (criteria.length !== 2 || criteria.some(item => !expectedIds.has(item.id))) return false
  if (new Set(criteria.map(item => item.id)).size !== 2) return false
  if (criteria.some(item => item.maxPoints !== (value['teil'] === 1 ? 2 : 4))) return false

  const total = criteria.reduce((sum, item) => sum + item.points, 0)
  return value['totalPoints'] === total && total <= maxPoints
}

function parseReview(rawText: string): SpeakingReviewData | null {
  const fenceStart = rawText.indexOf('```json')
  if (fenceStart >= 0) {
    const contentStart = fenceStart + 7
    const fenceEnd = rawText.indexOf('```', contentStart)
    if (fenceEnd > contentStart) {
      try {
        const parsed = JSON.parse(rawText.slice(contentStart, fenceEnd).trim()) as unknown
        if (isReviewData(parsed)) return parsed
      } catch {
        // Fall through to object scanning.
      }
    }
  }

  const firstBrace = rawText.indexOf('{')
  if (firstBrace < 0) return null
  for (let index = rawText.length - 1; index > firstBrace; index--) {
    if (rawText[index] !== '}') continue
    try {
      const parsed = JSON.parse(rawText.slice(firstBrace, index + 1)) as unknown
      if (isReviewData(parsed)) return parsed
    } catch {
      // Try a shorter candidate.
    }
  }
  return null
}

export default defineEventHandler(
  async (event: H3Event): Promise<AiResponse<SpeakingReviewData>> => {
    const body = await readBody<unknown>(event)
    if (!isValidRequest(body)) {
      return { data: null, error: 'Invalid speaking review request.' }
    }

    const prompt = buildPrompt(body)
    if (!prompt) {
      return {
        data: null,
        error:
          body.topic.testingPart === 1
            ? 'Both Teil 1 transcripts are required for AI review.'
            : 'A monologue transcript is required for AI review.',
      }
    }

    const llmConfig = getLlmConfig(useRuntimeConfig())
    if (!llmConfig) {
      return {
        data: null,
        error:
          'AI review is unavailable because no LLM API key is configured. You can still save this attempt.',
      }
    }

    try {
      const rawText = await callLlm(llmConfig, [
        {
          role: 'system',
          content:
            'You are an expert Goethe-Institut A2 speaking examiner. Return only the requested valid JSON object.',
        },
        { role: 'user', content: prompt },
      ])
      const data = parseReview(rawText)
      return data
        ? { data, error: null }
        : { data: null, error: 'The AI response could not be parsed as a speaking review.' }
    } catch (error: unknown) {
      console.error('[speaking/review] provider request failed', error)
      return {
        data: null,
        error:
          'AI review failed. Check your provider configuration and try again, or save without AI.',
      }
    }
  }
)
