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

/**
 * One row of a form-fill task. A row with `field` is blank and is one of the part's response
 * fields; a row with `value` is printed already filled in. `options` makes a blank row a choice.
 */
export interface WritingFormRow {
  label: string
  value?: string
  field?: string
  options?: string[]
}

export interface WritingForm {
  title: string
  rows: WritingFormRow[]
}

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
  /** Form-fill tasks only: the form, and the expected entry per blank field for the reviewer. */
  form?: WritingForm
  expected?: Record<string, string>
}
