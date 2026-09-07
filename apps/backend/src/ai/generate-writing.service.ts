import { goetheGenerateWritingSystem1 } from '@exam-one/exam-packs'
import { goetheGenerateWritingSystem0 } from '@exam-one/exam-packs'
import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type { WritingExercise } from '@exam-one/exam-content'
import { LlmService } from './llm.service'
import { generateTopicId } from './ids'
import { extractJsonArray, extractJsonObject } from './json'
import type { GenerateModelAnswerDto, GenerateTopicsDto } from './dto/ai.dto'
import { goetheModelAnswerData as ModelAnswerData, goetheNormalizeGeneratedTopic as normalizeGeneratedTopic, goetheNormalizeModelAnswer as normalizeModelAnswer } from '@exam-one/exam-packs'

@Injectable()
export class GenerateWritingService {
  private readonly logger = new Logger(GenerateWritingService.name)

  constructor(private readonly llm: LlmService) {}

  async generateTopics(body: GenerateTopicsDto): Promise<AiResponse<WritingExercise[]>> {
    if (!this.llm.getConfig()) {
      return { data: null, error: this.llm.missingKeyError() }
    }

    try {
      const rawText = await this.llm.complete(
        [
          {
            role: 'system',
            content:
              goetheGenerateWritingSystem0,
          },
          { role: 'user', content: body.prompt },
        ],
        { temperature: 0.8, maxTokens: 2500 }
      )
      if (!rawText) return { data: null, error: 'No response from AI.' }

      const topics = extractJsonArray(rawText)
      if (!topics || topics.length === 0) {
        this.logger.error('Failed to parse topics from response')
        return {
          data: null,
          error: 'Failed to parse topics from AI response. Please try again.',
        }
      }

      const difficulty = body.difficulty === 'C1' ? 'C1' : 'A2'
      const normalizedTopics = topics
        .map(topic => normalizeGeneratedTopic(topic, body.part === 2 ? 2 : 1, difficulty))
        .filter((topic): topic is Omit<WritingExercise, 'id' | 'createdAt'> => topic !== null)

      if (normalizedTopics.length === 0) {
        return {
          data: null,
          error:
            'Generated topics did not match the expected writing exercise shape. Please try again.',
        }
      }

      const topicsWithUniqueIds = normalizedTopics.map(topic => ({
        ...topic,
        id: generateTopicId(body.part === 2 ? 2 : 1, difficulty),
        createdAt: new Date().toISOString(),
      }))
      return { data: topicsWithUniqueIds, error: null }
    } catch (error: unknown) {
      this.logger.error('Error generating topics', error)
      return {
        data: null,
        error: 'AI topic generation failed. Please check your API key and try again.',
      }
    }
  }

  async generateModelAnswer(body: GenerateModelAnswerDto): Promise<AiResponse<ModelAnswerData>> {
    if (!this.llm.getConfig()) {
      return { data: null, error: this.llm.missingKeyError() }
    }

    try {
      const rawText = await this.llm.complete([
        {
          role: 'system',
          content:
            goetheGenerateWritingSystem1,
        },
        { role: 'user', content: body.prompt },
      ])
      const data = normalizeModelAnswer(extractJsonObject(rawText))
      return data
        ? { data, error: null }
        : { data: null, error: 'Failed to parse model answer from AI response.' }
    } catch (error: unknown) {
      this.logger.error('Error generating model answer', error)
      return {
        data: null,
        error: 'AI model answer generation failed. Please check your API key and try again.',
      }
    }
  }
}

export type { goetheModelAnswerData as ModelAnswerData } from '@exam-one/exam-packs'
