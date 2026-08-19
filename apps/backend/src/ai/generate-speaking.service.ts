import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type { Difficulty, SpeakingA2Part, SpeakingA2Topic, SpeakingFourCards } from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { generateSpeakingId } from './ids'
import { extractJsonArray, isRecord, nonEmptyString } from './json'
import type { GenerateSpeakingDto } from './dto/ai.dto'

interface SpeakingPromptPart {
  part: SpeakingA2Part
  prompt: string
}

function isSpeakingA2Part(value: unknown): value is SpeakingA2Part {
  return value === 1 || value === 2
}

function isFourCards(value: unknown): value is SpeakingFourCards {
  return Array.isArray(value) && value.length === 4 && value.every(nonEmptyString)
}

function normaliseTopic(
  value: unknown,
  part: SpeakingA2Part,
  difficulty: Difficulty
): SpeakingA2Topic | null {
  if (!isRecord(value) || !nonEmptyString(value['theme'])) return null
  const id = generateSpeakingId(part, difficulty)
  const createdAt = new Date().toISOString()
  const supportedDifficulty = 'A2' as const

  if (part === 1) {
    if (!isFourCards(value['answerQuestions']) || !isFourCards(value['askQuestions'])) return null
    return {
      id,
      testingPart: 1,
      topicType: 'interview',
      difficulty: supportedDifficulty,
      theme: value['theme'],
      answerQuestions: value['answerQuestions'],
      askQuestions: value['askQuestions'],
      createdAt,
    }
  }

  if (!isFourCards(value['keywords'])) return null
  return {
    id,
    testingPart: 2,
    topicType: 'monologue',
    difficulty: supportedDifficulty,
    theme: value['theme'],
    keywords: value['keywords'],
    createdAt,
  }
}

@Injectable()
export class GenerateSpeakingService {
  private readonly logger = new Logger(GenerateSpeakingService.name)

  constructor(private readonly llm: LlmService) {}

  async generate(body: GenerateSpeakingDto): Promise<AiResponse<SpeakingA2Topic[]>> {
    if (!this.llm.getConfig()) {
      return { data: null, error: this.llm.missingKeyError() }
    }

    const jobs = body.prompts.filter(
      (job): job is SpeakingPromptPart => isSpeakingA2Part(job.part) && nonEmptyString(job.prompt)
    )
    if (jobs.length === 0) {
      return { data: null, error: 'No prompt provided for speaking generation.' }
    }

    try {
      this.logger.log(`queue parts=${jobs.map(job => job.part).join(',')}`)
      const topics: SpeakingA2Topic[] = []
      for (const job of jobs) {
        this.logger.log(`start part=${job.part}`)
        let partTopics = await this.generateForPart(job, body.difficulty)
        if (partTopics.length === 0) {
          partTopics = await this.generateForPart(job, body.difficulty)
        }
        if (partTopics.length === 0) {
          this.logger.error(`failed part=${job.part} reason=parse_error`)
        } else {
          this.logger.log(`done part=${job.part} topics=${partTopics.length}`)
        }
        topics.push(...partTopics)
      }

      if (topics.length === 0) {
        return {
          data: null,
          error: 'Failed to parse speaking topics from AI response. Please try again.',
        }
      }
      return { data: topics, error: null }
    } catch (error: unknown) {
      if (error instanceof Error) return { data: null, error: error.message }
      this.logger.error('Error generating speaking topics', error)
      return { data: null, error: 'Failed to generate speaking topics. Please try again.' }
    }
  }

  private async generateForPart(
    job: SpeakingPromptPart,
    difficulty: Difficulty
  ): Promise<SpeakingA2Topic[]> {
    const rawText = await this.llm.complete(
      [
        {
          role: 'system',
          content:
            'You are an expert Goethe-Institut exam creator. Generate speaking topics according to the specifications provided. Return ONLY a valid JSON array of topic objects, no additional text.',
        },
        { role: 'user', content: job.prompt },
      ],
      { temperature: 0.8, maxTokens: 2000 }
    )
    if (!rawText) return []
    const parsed = extractJsonArray(rawText)
    if (!parsed) {
      this.logger.error(`Failed to parse speaking topics for part ${job.part}`)
      return []
    }
    return parsed
      .map(candidate => normaliseTopic(candidate, job.part, difficulty))
      .filter((topic): topic is SpeakingA2Topic => topic !== null)
  }
}
