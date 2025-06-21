/**
 * German Reading Trainer - Type Definitions
 * Data structures for German texts, questions, and user progress
 */

export interface GermanText {
  id: string
  title: string
  content: string
  textType: TextType
  difficulty: 'A2'
  estimatedReadingTime: number // in minutes
  wordCount: number
  topics: string[]
  createdAt: string
  questions?: Question[] // Will be added in Stage 3
}

export type TextType = 
  | 'email'
  | 'notice'
  | 'article'
  | 'advertisement'
  | 'instructions'
  | 'announcement'

export interface Question {
  id: string
  textId: string
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation: string
  type: QuestionType
}

export type QuestionType = 
  | 'comprehension'
  | 'vocabulary'
  | 'grammar'
  | 'inference'

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