import { goetheGenerateReadingSystem0 } from '@exam-one/exam-packs'
import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type {
  GeneratedReadingExercise,
  ReadingA2Part,
  ReadingExercise,
  ReadingPromptPart,
} from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import type { GenerateReadingDto } from './dto/ai.dto'
import {
  goetheExtractTextsFromResponse as extractTextsFromResponse,
  goetheNormaliseText as normaliseText,
} from '@exam-one/exam-packs'

@Injectable()
export class GenerateReadingService {
  private readonly logger = new Logger(GenerateReadingService.name)

  constructor(private readonly llm: LlmService) {}

  async generate(body: GenerateReadingDto): Promise<AiResponse<ReadingExercise[]>> {
    if (!this.llm.getConfig()) {
      return { data: null, error: this.llm.missingKeyError() }
    }

    const jobs: ReadingPromptPart[] =
      Array.isArray(body.prompts) && body.prompts.length > 0
        ? body.prompts.map(job => ({ part: job.part as ReadingA2Part, prompt: job.prompt }))
        : body.prompt
          ? [{ part: 1, prompt: body.prompt }]
          : []

    if (jobs.length === 0) {
      return { data: null, error: 'No prompt provided for reading generation.' }
    }

    try {
      this.logger.log(`queue parts=${jobs.map(job => job.part).join(',')}`)
      const texts: ReadingExercise[] = []
      for (const job of jobs) {
        this.logger.log(`start part=${job.part}`)
        let parsed = await this.generateForPrompt(job.prompt)
        if (!parsed || parsed.length === 0) {
          parsed = await this.generateForPrompt(job.prompt)
        }
        if (!parsed || parsed.length === 0) {
          this.logger.error(`failed part=${job.part} reason=parse_error`)
          continue
        }
        texts.push(...parsed.map(text => normaliseText(text, body.difficulty, job.part)))
        this.logger.log(`done part=${job.part} texts=${parsed.length}`)
      }

      if (texts.length === 0) {
        return {
          data: null,
          error: 'Failed to parse reading exercises from AI response. Please try again.',
        }
      }

      return { data: texts, error: null }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { data: null, error: error.message }
      }
      this.logger.error('Error generating reading exercises', error)
      return { data: null, error: 'Failed to generate reading exercises. Please try again.' }
    }
  }

  private async generateForPrompt(prompt: string): Promise<GeneratedReadingExercise[] | null> {
    const rawText = await this.llm.complete(
      [
        {
          role: 'system',
          content: goetheGenerateReadingSystem0,
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.8, maxTokens: 4000 }
    )
    if (!rawText) return null
    return extractTextsFromResponse(rawText)
  }
}
