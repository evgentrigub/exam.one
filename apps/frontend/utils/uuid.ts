/**
 * Generate a UUID v4
 * Simple implementation without external dependencies
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Generate a shorter unique ID for topics
 * Format: [difficulty]-part[part]-[timestamp]-[random]
 */
export function generateTopicId(part: 1 | 2, difficulty: 'A2' | 'C1' = 'C1'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  const difficultyPrefix = difficulty.toLowerCase()
  return `${difficultyPrefix}-part${part}-${timestamp}-${random}`
}

/**
 * Generate a shorter unique ID for reading texts
 * Format: reading-[difficulty]-[timestamp]-[random]
 */
export function generateReadingId(difficulty: Difficulty = 'A2'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  const difficultyPrefix = difficulty.toLowerCase()
  return `reading-${difficultyPrefix}-${timestamp}-${random}`
}

/**
 * Generate a unique ID for a listening exercise
 * Format: listening-[difficulty]-part[part]-[timestamp]-[random]
 */
export function generateListeningId(part: 1 | 2 | 3 | 4, difficulty: Difficulty = 'A2'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  const difficultyPrefix = difficulty.toLowerCase()
  return `listening-${difficultyPrefix}-part${part}-${timestamp}-${random}`
}

/**
 * Generate a unique ID for a speaking topic
 * Format: speaking-[difficulty]-part[part]-[timestamp]-[random]
 */
export function generateSpeakingId(part: 1 | 2, difficulty: Difficulty = 'A2'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  const difficultyPrefix = difficulty.toLowerCase()
  return `speaking-${difficultyPrefix}-part${part}-${timestamp}-${random}`
}

