import { goetheGenerateListeningSystem0 } from '@exam-one/exam-packs'
import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type {
  Difficulty,
  ListeningA2Exercise,
} from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { extractJsonArray, nonEmptyString } from './json'
import type { GenerateListeningDto } from './dto/ai.dto'
import { goetheListeningPromptPart as ListeningPromptPart, goetheIsListeningA2Part as isListeningA2Part, goetheIsValidForPart as isValidForPart, goetheNormaliseExercise as normaliseExercise } from '@exam-one/exam-packs'

@Injectable()
export class GenerateListeningService {
  private readonly logger = new Logger(GenerateListeningService.name)

  constructor(private readonly llm: LlmService) {}

  async generate(body: GenerateListeningDto): Promise<AiResponse<ListeningA2Exercise[]>> {
    if (!this.llm.getConfig()) {
      return { data: null, error: this.llm.missingKeyError() }
    }

    const jobs = body.prompts.filter(
      (job): job is ListeningPromptPart =>
        isListeningA2Part(job.part) && nonEmptyString(job.prompt)
    )
    if (jobs.length === 0) {
      return { data: null, error: 'No prompt provided for listening generation.' }
    }

    try {
      this.logger.log(`queue parts=${jobs.map(job => job.part).join(',')}`)
      const exercises: ListeningA2Exercise[] = []
      for (const job of jobs) {
        this.logger.log(`start part=${job.part}`)
        let partExercises = await this.generateForPart(job, body.difficulty)
        if (partExercises.length === 0) {
          partExercises = await this.generateForPart(job, body.difficulty)
        }
        if (partExercises.length === 0) {
          this.logger.error(`failed part=${job.part} reason=parse_error`)
        } else {
          this.logger.log(`done part=${job.part} exercises=${partExercises.length}`)
        }
        exercises.push(...partExercises)
      }

      if (exercises.length === 0) {
        return {
          data: null,
          error: 'Failed to parse listening exercises from AI response. Please try again.',
        }
      }
      return { data: exercises, error: null }
    } catch (error: unknown) {
      if (error instanceof Error) return { data: null, error: error.message }
      this.logger.error('Error generating listening exercises', error)
      return { data: null, error: 'Failed to generate listening exercises. Please try again.' }
    }
  }

  private async generateForPart(
    job: ListeningPromptPart,
    difficulty: Difficulty
  ): Promise<ListeningA2Exercise[]> {
    const rawText = await this.llm.complete(
      [
        {
          role: 'system',
          content:
            goetheGenerateListeningSystem0,
        },
        { role: 'user', content: job.prompt },
      ],
      { temperature: 0.8, maxTokens: 4000 }
    )
    if (!rawText) return []
    const parsed = extractJsonArray(rawText)
    if (!parsed) {
      this.logger.error(`Failed to parse listening exercises for part ${job.part}`)
      return []
    }
    return parsed
      .filter((candidate): candidate is ListeningA2Exercise => isValidForPart(candidate, job.part))
      .map(candidate => normaliseExercise(candidate, job.part, difficulty))
  }
}
