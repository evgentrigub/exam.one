import { goetheGenerateSpeakingSystem0 } from '@exam-one/exam-packs'
import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type { Difficulty, SpeakingA2Topic } from '@exam-one/exam-content'
import { LlmService } from './llm.service'
import { extractJsonArray, nonEmptyString } from './json'
import type { GenerateSpeakingDto } from './dto/ai.dto'
import { goetheSpeakingPromptPart as SpeakingPromptPart, goetheIsSpeakingA2Part as isSpeakingA2Part, goetheNormaliseTopic as normaliseTopic } from '@exam-one/exam-packs'

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
            goetheGenerateSpeakingSystem0,
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
