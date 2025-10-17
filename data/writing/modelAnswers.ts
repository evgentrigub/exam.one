/**
 * Model answers for German A2/C1 writing exercises
 * High-quality example responses that demonstrate proper structure, vocabulary, and grammar
 */

export interface ModelAnswer {
  id: string
  topicId: string
  content: string
  wordCount: number
  highlights?: {
    greeting?: string
    mainPoints?: string[]
    closing?: string
    keyPhrases?: string[]
  }
}
