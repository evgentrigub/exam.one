import type { Difficulty, WritingExercise, WritingTopicTypes } from '@exam-one/exam-packs'

export type { Difficulty, WritingExercise, WritingTopicTypes }

/**
 * Exam.one - Type Definitions
 * Shared data structures for exercises, reviews, and user progress
 */

export const LANGUAGE_OPTIONS = ['en', 'de'] as const
export type LanguageOptions = (typeof LANGUAGE_OPTIONS)[number]
export const DEFAULT_LANGUAGE: LanguageOptions = 'en'

export function isLanguageOption(value: string): value is LanguageOptions {
  return (LANGUAGE_OPTIONS as readonly string[]).includes(value)
}

export function toLanguageOption(value: string): LanguageOptions {
  return isLanguageOption(value) ? value : DEFAULT_LANGUAGE
}

export interface UserProgress {
  textId: string
  completed: boolean
  score?: number
  attemptCount: number
  bestScore?: number
  completedAt?: string
  timeSpent?: number // in seconds
}

export interface Session {
  id: string
  textId: string
  startedAt: string
  completedAt?: string
  answers: Record<string, number> // questionId -> selected option index
  score?: number
  timeSpent?: number
}

export interface WritingProgress {
  topicId: string
  completed: boolean
  attemptCount: number
  bestWordCount?: number
  completedAt?: string
  timeSpent?: number // in seconds
  submissions: WritingSubmission[]
}

export interface WritingSubmission {
  id: string
  topicId: string
  content: string
  wordCount: number
  submittedAt: string
  timeSpent?: number // in seconds
  isDraft?: boolean
  feedback?: WritingFeedbackModel
}

export interface WritingFeedbackModel {
  wordCountValid: boolean
  structureScore: number // 1-5 scale
  completenessScore: number // 1-5 scale
  suggestions: string[]
  overallScore: number // 1-5 scale
}

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
