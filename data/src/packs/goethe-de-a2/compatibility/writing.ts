import type { Difficulty, WritingExercise } from '../content'
import { isRecord } from './json'


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

export function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : null
}

export function normalizeGeneratedTopic(
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

export function optionalStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined
}

export function normalizeModelAnswer(value: unknown): ModelAnswerData | null {
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
