import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type {
  Difficulty,
  GeneratedReadingExercise,
  GeneratedReadingQuestion,
  ReadingA2Part,
  ReadingExercise,
  ReadingPromptPart,
  ReadingQuestionType,
  ReadingTextType,
} from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { generateReadingId } from './ids'
import { extractJsonArray, isRecord } from './json'
import type { GenerateReadingDto } from './dto/ai.dto'

const readingTextTypes = [
  'email',
  'notice',
  'article',
  'advertisement',
  'instructions',
  'announcement',
  'list',
] satisfies ReadingTextType[]

const readingQuestionTypes = [
  'comprehension',
  'vocabulary',
  'grammar',
  'inference',
  'selective',
  'matching',
] satisfies ReadingQuestionType[]

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'A2' || value === 'C1'
}

function isReadingA2Part(value: unknown): value is ReadingA2Part {
  return value === 1 || value === 2 || value === 3 || value === 4
}

function isReadingTextType(value: unknown): value is ReadingTextType {
  return typeof value === 'string' && (readingTextTypes as readonly string[]).includes(value)
}

function isReadingQuestionType(value: unknown): value is ReadingQuestionType {
  return typeof value === 'string' && (readingQuestionTypes as readonly string[]).includes(value)
}

function isAnswerIndex(value: unknown): value is number | string {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    return Number.isInteger(numericValue) && numericValue >= 0
  }
  return false
}

function isGeneratedReadingQuestion(value: unknown): value is GeneratedReadingQuestion {
  if (!isRecord(value)) return false
  return (
    (value['id'] === undefined || typeof value['id'] === 'string') &&
    (value['textId'] === undefined || typeof value['textId'] === 'string') &&
    typeof value['question'] === 'string' &&
    Array.isArray(value['options']) &&
    value['options'].every(option => typeof option === 'string') &&
    isAnswerIndex(value['correctAnswer']) &&
    typeof value['explanation'] === 'string' &&
    isReadingQuestionType(value['type'])
  )
}

function isGeneratedReadingExercise(value: unknown): value is GeneratedReadingExercise {
  if (!isRecord(value)) return false
  return (
    (value['id'] === undefined || typeof value['id'] === 'string') &&
    typeof value['title'] === 'string' &&
    typeof value['content'] === 'string' &&
    isReadingTextType(value['textType']) &&
    isDifficulty(value['difficulty']) &&
    (value['testingPart'] === undefined || isReadingA2Part(value['testingPart'])) &&
    typeof value['estimatedReadingTime'] === 'number' &&
    typeof value['wordCount'] === 'number' &&
    Array.isArray(value['topics']) &&
    value['topics'].every(topic => typeof topic === 'string') &&
    (value['createdAt'] === undefined || typeof value['createdAt'] === 'string') &&
    (value['questions'] === undefined ||
      (Array.isArray(value['questions']) && value['questions'].every(isGeneratedReadingQuestion)))
  )
}

function parseGeneratedReadingExercises(candidate: unknown): GeneratedReadingExercise[] | null {
  return Array.isArray(candidate) && candidate.every(isGeneratedReadingExercise) ? candidate : null
}

function extractTextsFromResponse(rawText: string): GeneratedReadingExercise[] | null {
  const parsed = extractJsonArray(rawText)
  return parsed ? parseGeneratedReadingExercises(parsed) : null
}

function normaliseText(
  text: GeneratedReadingExercise,
  difficulty: Difficulty,
  part: ReadingA2Part | undefined
): ReadingExercise {
  const textId = generateReadingId(difficulty)
  const questions =
    text.questions?.map((question, questionIndex) => {
      const answerIndex = Number(question.correctAnswer)
      return {
        ...question,
        id: `${textId}-q${questionIndex + 1}`,
        textId,
        correctAnswer: Number.isInteger(answerIndex) && answerIndex >= 0 ? answerIndex : 0,
      }
    }) ?? []

  const wordCount =
    typeof text.wordCount === 'number' && text.wordCount > 0
      ? text.wordCount
      : (text.content?.trim().split(/\s+/).filter(Boolean).length ?? 0)

  return {
    ...text,
    id: textId,
    difficulty,
    ...(part ? { testingPart: part } : {}),
    wordCount,
    createdAt: new Date().toISOString(),
    questions,
  }
}

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
    const isMultiPart = Array.isArray(body.prompts) && body.prompts.length > 0

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
        texts.push(
          ...parsed.map(text =>
            normaliseText(text, body.difficulty, isMultiPart ? job.part : undefined)
          )
        )
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
          content:
            'You are an expert Goethe-Institut exam creator. Generate reading comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of GermanText objects with questions, no additional text.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.8, maxTokens: 4000 }
    )
    if (!rawText) return null
    return extractTextsFromResponse(rawText)
  }
}
