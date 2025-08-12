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

export type Difficulty = 'A2' | 'B1' | 'B2' | 'C1'

// Writing Topic Types
export interface WritingTopic {
  id: string
  title: string
  topicType: WritingTopicTypeA2 | WritingTopicTypeC1
  difficulty: Difficulty
  estimatedTime: number // in minutes
  wordCount: {
    min: number
    max: number
  }
  category: string[]
  createdAt: string
  description: string // What type of text they should write
  prompt: string // The actual writing prompt/task
  requirements: string[] // Specific requirements (format, length, etc.)
  tips?: string[] // Optional writing tips
}

export type WritingTopicTypeA2 = 
  | 'email'
  | 'letter'
  | 'essay'
  | 'form'
  | 'postcard'
  | 'note'

export type WritingTopicTypeC1 = 
  | 'report'
  | 'review'
  | 'proposal'
  | 'article'
  | 'note'
  | 'form'

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
  feedback: WritingFeedbackModel
}

export interface WritingFeedbackModel {
  wordCountValid: boolean
  structureScore: number // 1-5 scale
  completenessScore: number // 1-5 scale
  suggestions: string[]
  overallScore: number // 1-5 scale
} 