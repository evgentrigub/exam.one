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
import { generateListeningId } from './ids'
import { isRecord, nonEmptyString } from './json'


export interface ListeningPromptPart {
  part: ListeningA2Part
  prompt: string
}

export function isListeningA2Part(value: unknown): value is ListeningA2Part {
  return value === 1 || value === 2 || value === 3 || value === 4
}

export function isStringArrayOfLength(value: unknown, length: number): value is string[] {
  return (
    Array.isArray(value) && value.length === length && value.every(item => typeof item === 'string')
  )
}

export function isIndexInRange(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max
}

export function isTeil1Item(value: unknown): value is ListeningItemA2Teil1 {
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

export function isTeil3Item(value: unknown): value is ListeningItemA2Teil3 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['question']) &&
    nonEmptyString(value['transcript']) &&
    isStringArrayOfLength(value['options'], 3) &&
    isIndexInRange(value['correctAnswer'], 2) &&
    nonEmptyString(value['explanation'])
  )
}

export function isTeil2Question(value: unknown): value is ListeningQuestionA2Teil2 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['person']) &&
    isIndexInRange(value['correctAnswer'], 8) &&
    nonEmptyString(value['explanation'])
  )
}

export function isTeil4Question(value: unknown): value is ListeningQuestionA2Teil4 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['statement']) &&
    typeof value['correctAnswer'] === 'boolean' &&
    nonEmptyString(value['explanation']) &&
    value['type'] === 'true_false'
  )
}

export function hasFiveItems(value: unknown, predicate: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.length === 5 && value.every(predicate)
}

export function isValidForPart(value: unknown, part: ListeningA2Part): value is ListeningA2Exercise {
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

export function normaliseExercise(
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
