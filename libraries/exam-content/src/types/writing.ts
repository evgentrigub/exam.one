import type { Difficulty } from './common'

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
  | string

export interface WritingExercise {
  id: string
  title: string
  topicType: WritingTopicTypes
  difficulty: Difficulty
  testingPart?: 1 | 2
  estimatedTime: number
  wordCount: {
    min: number
    max: number
  }
  category: string[]
  createdAt: string
  description: string
  task: string
  requirements: string[]
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
}
