import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type { SpeakingReviewCriterion, SpeakingReviewData } from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { extractJsonObject, isRecord } from './json'
import type { ReviewMockExamDto, ReviewSpeakingDto, ReviewWritingDto } from './dto/ai.dto'

interface ReviewCriteriaItem {
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

function isCriteriaItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value['grade'] === 'string' &&
    typeof value['points'] === 'number' &&
    typeof value['comment'] === 'string'
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isExampleArray(value: unknown): boolean {
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

function hasCommonReviewShape(value: Record<string, unknown>): boolean {
  return (
    typeof value['teil'] === 'number' &&
    typeof value['word_count'] === 'number' &&
    typeof value['teil_rule_applied'] === 'string' &&
    isStringArray(value['priority_fixes']) &&
    isExampleArray(value['examples']) &&
    typeof value['report'] === 'string'
  )
}

function isValidA2Review(value: unknown): value is WritingReviewData {
  if (!isRecord(value) || !hasCommonReviewShape(value)) return false
  const criteria = value['criteria']
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

function isValidC1Review(value: unknown): value is WritingReviewData {
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

function isSpeakingReviewData(value: unknown): value is SpeakingReviewData {
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

function isOverview(value: unknown): value is MockExamOverview {
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

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name)

  constructor(private readonly llm: LlmService) {}

  async reviewWriting(body: ReviewWritingDto): Promise<AiResponse<WritingReviewData>> {
    if (!this.llm.getConfig()) {
      return { data: null, error: this.llm.missingKeyError() }
    }

    try {
      const rawText = await this.llm.complete([
        {
          role: 'system',
          content:
            'You are an expert Goethe-Institut examiner. Review writing submissions according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.',
        },
        { role: 'user', content: body.prompt },
      ])
      const parsed = extractJsonObject(rawText)
      const data = isValidA2Review(parsed) || isValidC1Review(parsed) ? parsed : null
      return data
        ? { data, error: null }
        : { data: null, error: 'Failed to parse review from AI response.' }
    } catch (error: unknown) {
      this.logger.error('Error reviewing writing submission', error)
      return {
        data: null,
        error: 'AI review failed. Please check your API key and try again.',
      }
    }
  }

  async reviewSpeaking(body: ReviewSpeakingDto): Promise<AiResponse<SpeakingReviewData>> {
    if (!this.llm.getConfig()) {
      return {
        data: null,
        error:
          'AI review is unavailable because no LLM API key is configured. You can still save this attempt.',
      }
    }

    try {
      const rawText = await this.llm.complete([
        {
          role: 'system',
          content:
            'You are an expert Goethe-Institut A2 speaking examiner. Return only the requested valid JSON object.',
        },
        { role: 'user', content: body.prompt },
      ])
      const parsed = extractJsonObject(rawText)
      return isSpeakingReviewData(parsed)
        ? { data: parsed, error: null }
        : { data: null, error: 'The AI response could not be parsed as a speaking review.' }
    } catch (error: unknown) {
      this.logger.error('speaking review provider request failed', error)
      return {
        data: null,
        error:
          'AI review failed. Check your provider configuration and try again, or save without AI.',
      }
    }
  }

  async reviewMockExam(body: ReviewMockExamDto): Promise<AiResponse<MockExamOverview>> {
    if (!this.llm.getConfig()) {
      return {
        data: null,
        error: 'AI overview is unavailable because no LLM API key is configured.',
      }
    }

    try {
      const raw = await this.llm.complete(
        [
          {
            role: 'system',
            content:
              'You are a supportive Goethe A2 exam coach. Return only valid JSON and keep feedback concise.',
          },
          { role: 'user', content: body.prompt },
        ],
        { temperature: 0.3, maxTokens: 900 }
      )
      const parsed = extractJsonObject(raw)
      if (!isOverview(parsed)) {
        return { data: null, error: 'The AI overview response could not be read. Please try again.' }
      }
      return {
        data: {
          summary: parsed.summary,
          strengths: parsed.strengths.slice(0, 3),
          focusAreas: parsed.focusAreas.slice(0, 3),
          nextSteps: parsed.nextSteps.slice(0, 3),
        },
        error: null,
      }
    } catch (error: unknown) {
      this.logger.error('review-mock-exam failed', error)
      return { data: null, error: 'AI overview generation failed. Please try again.' }
    }
  }
}
