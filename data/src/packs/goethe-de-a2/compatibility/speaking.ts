import type { Difficulty, SpeakingA2Part, SpeakingA2Topic, SpeakingFourCards } from '@exam-one/exam-content'
import { generateSpeakingId } from './ids'
import { isRecord, nonEmptyString } from './json'


export interface SpeakingPromptPart {
  part: SpeakingA2Part
  prompt: string
}

export function isSpeakingA2Part(value: unknown): value is SpeakingA2Part {
  return value === 1 || value === 2
}

export function isFourCards(value: unknown): value is SpeakingFourCards {
  return Array.isArray(value) && value.length === 4 && value.every(nonEmptyString)
}

export function normaliseTopic(
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
