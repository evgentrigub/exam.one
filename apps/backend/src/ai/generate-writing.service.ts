import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type { Difficulty, WritingExercise } from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { generateTopicId } from './ids'
import { extractJsonArray, extractJsonObject, isRecord } from './json'
import type { GenerateModelAnswerDto, GenerateTopicsDto } from './dto/ai.dto'

export interface ModelAnswerData {
  content: string
  wordCount: number
  highlights?: {
    greeting?: string
    mainPoints?: string[]
    closing?: string
    keyPhrases?: string[]
  }
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : null
}

function normalizeGeneratedTopic(
  value: unknown,
  part: 1 | 2,
  difficulty: Difficulty
): Omit<WritingExercise, 'id' | 'createdAt'> | null {
  if (!isRecord(value)) return null
  const wordCount = value['wordCount']
  const category = stringArray(value['category'])
  const requirements = stringArray(value['requirements'])
  if (!isRecord(wordCount) || !category || !requirements) return null
  if (
    typeof value['title'] !== 'string' ||
    typeof value['topicType'] !== 'string' ||
    typeof value['estimatedTime'] !== 'number' ||
    typeof value['description'] !== 'string' ||
    typeof value['task'] !== 'string' ||
    typeof wordCount['min'] !== 'number' ||
    typeof wordCount['max'] !== 'number'
  ) {
    return null
  }
  return {
    title: value['title'],
    topicType: value['topicType'],
    difficulty,
    testingPart: part,
    estimatedTime: value['estimatedTime'],
    wordCount: { min: wordCount['min'], max: wordCount['max'] },
    category,
    description: value['description'],
    task: value['task'],
    requirements,
  }
}

function optionalStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined
}

function normalizeModelAnswer(value: unknown): ModelAnswerData | null {
  if (!isRecord(value) || typeof value['content'] !== 'string') return null
  const wordCount = Number(value['wordCount'])
  if (!Number.isFinite(wordCount) || wordCount < 0) return null
  const highlights = isRecord(value['highlights']) ? value['highlights'] : {}
  const normalizedHighlights: NonNullable<ModelAnswerData['highlights']> = {}
  const mainPoints = optionalStringArray(highlights['mainPoints'])
  const keyPhrases = optionalStringArray(highlights['keyPhrases'])
  if (typeof highlights['greeting'] === 'string') normalizedHighlights.greeting = highlights['greeting']
  if (typeof highlights['closing'] === 'string') normalizedHighlights.closing = highlights['closing']
  if (mainPoints) normalizedHighlights.mainPoints = mainPoints
  if (keyPhrases) normalizedHighlights.keyPhrases = keyPhrases
  return {
    content: value['content'],
    wordCount,
    ...(Object.keys(normalizedHighlights).length > 0 && { highlights: normalizedHighlights }),
  }
}

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
              'You are an expert Goethe-Institut exam creator. Generate writing topics according to the specifications provided. Return ONLY valid JSON array of WritingTopic objects, no additional text.',
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
        .map(topic => normalizeGeneratedTopic(topic, body.part, difficulty))
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
        id: generateTopicId(body.part, difficulty),
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
            'You are an expert Goethe-Institut exam creator. Generate model answers according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.',
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
