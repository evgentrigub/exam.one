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
  topicType: WritingTopicTypes
  difficulty: Difficulty
  testingPart?: 1 | 2
  estimatedTime: number // in minutes
  wordCount: {
    min: number
    max: number
  }
  category: string[]
  createdAt: string
  description: string // What type of text they should write
  task: string // The actual writing prompt/task
  requirements: string[] // Specific requirements (format, length, etc.)
}


export type WritingTopicTypes = 
| 'report'
| 'review'
| 'proposal'
| 'article'
| 'note'
| 'form'
| 'email'
| 'letter'
| 'essay'
| 'postcard'

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

// --- AI Review (C1 – JSON output from model) ---
export type TeilRuleApplied = 'none' | 'E_zero_rule'

export interface AiReviewCriteriaItem {
  grade: string
  points: number
  comment: string
}

export interface AiReviewCriteria {
  aufgabenerfuellung: AiReviewCriteriaItem
  kohaerenz: AiReviewCriteriaItem
  wortschatz: AiReviewCriteriaItem
  strukturen: AiReviewCriteriaItem
}

export interface AiReviewExampleItem {
  error: string
  correction: string
  rule: string
}

export interface AiReviewData {
  teil: number
  word_count: number
  required_word_count: number
  criteria: AiReviewCriteria
  teil_points: number
  teil_rule_applied: TeilRuleApplied
  passed_module: boolean
  priority_fixes: string[]
  examples: AiReviewExampleItem[]
  report: string
}