import type {
  Difficulty,
  GeneratedReadingExercise,
  GeneratedReadingQuestion,
  ReadingA2Part,
  ReadingExercise,
  ReadingQuestionType,
  ReadingTextType,
} from '../content'
import { generateReadingId } from './ids'
import { extractJsonArray, isRecord } from './json'


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

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'A2' || value === 'C1'
}

export function isReadingA2Part(value: unknown): value is ReadingA2Part {
  return value === 1 || value === 2 || value === 3 || value === 4
}

export function isReadingTextType(value: unknown): value is ReadingTextType {
  return typeof value === 'string' && (readingTextTypes as readonly string[]).includes(value)
}

export function isReadingQuestionType(value: unknown): value is ReadingQuestionType {
  return typeof value === 'string' && (readingQuestionTypes as readonly string[]).includes(value)
}

export function isAnswerIndex(value: unknown): value is number | string {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    return Number.isInteger(numericValue) && numericValue >= 0
  }
  return false
}

export function isGeneratedReadingQuestion(value: unknown): value is GeneratedReadingQuestion {
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

export function isGeneratedReadingExercise(value: unknown): value is GeneratedReadingExercise {
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

export function parseGeneratedReadingExercises(candidate: unknown): GeneratedReadingExercise[] | null {
  return Array.isArray(candidate) && candidate.every(isGeneratedReadingExercise) ? candidate : null
}

export function extractTextsFromResponse(rawText: string): GeneratedReadingExercise[] | null {
  const parsed = extractJsonArray(rawText)
  return parsed ? parseGeneratedReadingExercises(parsed) : null
}

export function normaliseText(
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
