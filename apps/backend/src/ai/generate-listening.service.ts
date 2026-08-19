import { Injectable, Logger } from '@nestjs/common'
import type { AiResponse } from '@exam-one/contracts'
import type {
  Difficulty,
  ListeningA2Exercise,
  ListeningA2Part,
  ListeningExerciseA2Teil1,
  ListeningExerciseA2Teil2,
  ListeningExerciseA2Teil3,
  ListeningExerciseA2Teil4,
  ListeningItemA2Teil1,
  ListeningItemA2Teil3,
  ListeningQuestionA2Teil2,
  ListeningQuestionA2Teil4,
} from '@exam-one/exam-content'
import { LlmService } from '../llm/llm.service'
import { generateListeningId } from './ids'
import { extractJsonArray, isRecord, nonEmptyString } from './json'
import type { GenerateListeningDto } from './dto/ai.dto'

interface ListeningPromptPart {
  part: ListeningA2Part
  prompt: string
}

function isListeningA2Part(value: unknown): value is ListeningA2Part {
  return value === 1 || value === 2 || value === 3 || value === 4
}

function isStringArrayOfLength(value: unknown, length: number): value is string[] {
  return (
    Array.isArray(value) && value.length === length && value.every(item => typeof item === 'string')
  )
}

function isIndexInRange(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max
}

function isTeil1Item(value: unknown): value is ListeningItemA2Teil1 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['context']) &&
    nonEmptyString(value['transcript']) &&
    nonEmptyString(value['question']) &&
    isStringArrayOfLength(value['options'], 3) &&
    isIndexInRange(value['correctAnswer'], 2) &&
    nonEmptyString(value['explanation'])
  )
}

function isTeil3Item(value: unknown): value is ListeningItemA2Teil3 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['question']) &&
    nonEmptyString(value['transcript']) &&
    isStringArrayOfLength(value['options'], 3) &&
    isIndexInRange(value['correctAnswer'], 2) &&
    nonEmptyString(value['explanation'])
  )
}

function isTeil2Question(value: unknown): value is ListeningQuestionA2Teil2 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['person']) &&
    isIndexInRange(value['correctAnswer'], 8) &&
    nonEmptyString(value['explanation'])
  )
}

function isTeil4Question(value: unknown): value is ListeningQuestionA2Teil4 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['statement']) &&
    typeof value['correctAnswer'] === 'boolean' &&
    nonEmptyString(value['explanation']) &&
    value['type'] === 'true_false'
  )
}

function hasFiveItems(value: unknown, predicate: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.length === 5 && value.every(predicate)
}

function isValidForPart(value: unknown, part: ListeningA2Part): value is ListeningA2Exercise {
  if (!isRecord(value) || !nonEmptyString(value['title'])) return false
  if (part === 1) return hasFiveItems(value['items'], isTeil1Item)
  if (part === 3) return hasFiveItems(value['items'], isTeil3Item)
  if (part === 2) {
    return (
      nonEmptyString(value['context']) &&
      nonEmptyString(value['transcript']) &&
      isStringArrayOfLength(value['options'], 9) &&
      hasFiveItems(value['questions'], isTeil2Question)
    )
  }
  return (
    nonEmptyString(value['context']) &&
    nonEmptyString(value['transcript']) &&
    hasFiveItems(value['questions'], isTeil4Question)
  )
}

function normaliseExercise(
  exercise: ListeningA2Exercise,
  part: ListeningA2Part,
  difficulty: Difficulty
): ListeningA2Exercise {
  const id = generateListeningId(part, difficulty)
  const createdAt = new Date().toISOString()
  const base = { id, difficulty: 'A2' as const, createdAt }

  if (part === 1) {
    const ex = exercise as ListeningExerciseA2Teil1
    return {
      ...ex,
      ...base,
      testingPart: 1,
      items: ex.items.map((item, i) => ({ ...item, id: `${id}-i${i + 1}` })) as ListeningExerciseA2Teil1['items'],
    }
  }
  if (part === 3) {
    const ex = exercise as ListeningExerciseA2Teil3
    return {
      ...ex,
      ...base,
      testingPart: 3,
      items: ex.items.map((item, i) => ({ ...item, id: `${id}-i${i + 1}` })) as ListeningExerciseA2Teil3['items'],
    }
  }
  if (part === 2) {
    const ex = exercise as ListeningExerciseA2Teil2
    return {
      ...ex,
      ...base,
      testingPart: 2,
      questions: ex.questions.map((q, i) => ({
        ...q,
        id: `${id}-q${i + 1}`,
      })) as ListeningExerciseA2Teil2['questions'],
    }
  }
  const ex = exercise as ListeningExerciseA2Teil4
  return {
    ...ex,
    ...base,
    testingPart: 4,
    questions: ex.questions.map((q, i) => ({
      ...q,
      id: `${id}-q${i + 1}`,
    })) as ListeningExerciseA2Teil4['questions'],
  }
}

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
            'You are an expert Goethe-Institut exam creator. Generate listening comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of exercise objects, no additional text.',
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
