import { goetheReviewSystem2 } from '@exam-one/exam-packs'
import { goetheReviewSystem1 } from '@exam-one/exam-packs'
import { goetheReviewSystem0 } from '@exam-one/exam-packs'
import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type { SpeakingReviewData } from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { extractJsonObject } from './json'
import type { ReviewMockExamDto, ReviewSpeakingDto, ReviewWritingDto } from './dto/ai.dto'
import {
  goetheWritingReviewData as WritingReviewData,
  goetheMockExamOverview as MockExamOverview,
  goetheIsValidA2Review as isValidA2Review,
  goetheIsSpeakingReviewData as isSpeakingReviewData,
  goetheIsOverview as isOverview,
} from '@exam-one/exam-packs'

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
          content: goetheReviewSystem0,
        },
        { role: 'user', content: body.prompt },
      ])
      const parsed = extractJsonObject(rawText)
      const data = isValidA2Review(parsed) ? parsed : null
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
          content: goetheReviewSystem1,
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
            content: goetheReviewSystem2,
          },
          { role: 'user', content: body.prompt },
        ],
        { temperature: 0.3, maxTokens: 900 }
      )
      const parsed = extractJsonObject(raw)
      if (!isOverview(parsed)) {
        return {
          data: null,
          error: 'The AI overview response could not be read. Please try again.',
        }
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

export type {
  goetheWritingReviewData as WritingReviewData,
  goetheMockExamOverview as MockExamOverview,
} from '@exam-one/exam-packs'
