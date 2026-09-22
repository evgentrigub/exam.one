import type { Difficulty } from '../content'

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 7)
}

function timestamp(): string {
  return Date.now().toString(36)
}

export function generateTopicId(part: 1 | 2, difficulty: Difficulty = 'A2'): string {
  return `${difficulty.toLowerCase()}-part${part}-${timestamp()}-${randomSuffix()}`
}

export function generateReadingId(difficulty: Difficulty = 'A2'): string {
  return `reading-${difficulty.toLowerCase()}-${timestamp()}-${randomSuffix()}`
}

export function generateListeningId(part: 1 | 2 | 3 | 4, difficulty: Difficulty = 'A2'): string {
  return `listening-${difficulty.toLowerCase()}-part${part}-${timestamp()}-${randomSuffix()}`
}

export function generateSpeakingId(part: 1 | 2, difficulty: Difficulty = 'A2'): string {
  return `speaking-${difficulty.toLowerCase()}-part${part}-${timestamp()}-${randomSuffix()}`
}
