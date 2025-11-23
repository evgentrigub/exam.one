/**
 * Exam.one - Type Definitions
 * Data structures for reading, writing, listening and speaking texts, questions, and user progress
 */

export interface GermanText {
  id: string
  title: string
  content: string
  textType: TextType
  difficulty: 'A2' | 'C1'
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

export type Difficulty = 'A2' | 'C1'

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
| 'post'
| string  // Allow any string to ensure all generated topics are saved

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

// --- AI Review Types ---
export type TeilRuleApplied = 'none' | 'E_zero_rule' | 'wordcount_lt_50' | 'off_topic'

export interface AiReviewCriteriaItem {
  grade: string
  points: number
  comment: string
}

// C1 Review Types
export interface AiReviewCriteriaC1 {
  aufgabenerfuellung: AiReviewCriteriaItem
  kohaerenz: AiReviewCriteriaItem
  wortschatz: AiReviewCriteriaItem
  strukturen: AiReviewCriteriaItem
}

// A2 Review Types
export interface AiReviewCriteriaA2 {
  aufgabenerfuellung: AiReviewCriteriaItem
  sprache: AiReviewCriteriaItem
}

export interface RegisterCheck {
  expected: 'du' | 'sie'
  detected: 'du' | 'sie' | 'mixed' | 'unknown'
  ok: boolean
}

export interface ContentPointsCovered {
  required: number
  covered: number
}

export interface AiReviewExampleItem {
  error: string
  correction: string
  rule: string
}

// C1 Review Data Structure
export interface AiReviewDataC1 {
  teil: number
  word_count: number
  required_word_count: number
  criteria: AiReviewCriteriaC1
  teil_points: number
  teil_rule_applied: TeilRuleApplied
  passed_module: boolean
  priority_fixes: string[]
  examples: AiReviewExampleItem[]
  report: string
}

// A2 Review Data Structure
export interface AiReviewDataA2 {
  teil: number
  word_count: number
  required_word_count: { min: number; max: number }
  criteria: AiReviewCriteriaA2
  teil_points_mess: number
  teil_points_result: number
  teil_rule_applied: TeilRuleApplied
  register_check: RegisterCheck
  content_points_covered: ContentPointsCovered
  priority_fixes: string[]
  examples: AiReviewExampleItem[]
  report: string
}

// Union type for both A2 and C1 reviews
export type AiReviewData = AiReviewDataC1 | AiReviewDataA2

// Type guard to check if review is A2
export function isA2Review(review: AiReviewData): review is AiReviewDataA2 {
  return 'teil_points_mess' in review
}

// Type guard to check if review is C1
export function isC1Review(review: AiReviewData): review is AiReviewDataC1 {
  return 'teil_points' in review
}

// Backward compatibility - keep old name pointing to C1
export type AiReviewCriteria = AiReviewCriteriaC1