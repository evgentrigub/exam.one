// Payload shapes of the Polish A2 seeds. They use the raw field names the practice screens read,
// as the Goethe and Cambridge payloads do; the counts per part are enforced by `validate.ts`.

import type { WritingExercise } from '../../goethe-de-a2/content/types/writing'

/** A choice question: reading parts 1–4 and 6, and listening parts 1 and 2. */
export interface PlChoiceQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

/** A typed-answer gap (reading part 5, listening part 5), scored against `accepted`. */
export interface PlGap {
  id: string
  /** The field or note the gap completes, e.g. "Miejsce urodzenia". */
  question: string
  accepted: string[]
  explanation: string
}

export interface ReadingPlQuestion extends PlChoiceQuestion {
  textId: string
  type: 'comprehension' | 'matching' | 'cloze'
}

export interface ReadingPlGap extends PlGap {
  textId: string
  type: 'gap'
}

export interface ReadingPlExercise {
  id: string
  title: string
  content: string
  textType: 'email' | 'article' | 'notice' | 'announcement'
  testingPart: 1 | 2 | 3 | 4 | 5 | 6
  difficulty: 'A2'
  estimatedReadingTime: number
  wordCount: number
  topics: string[]
  createdAt: string
  questions: (ReadingPlQuestion | ReadingPlGap)[]
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
}

interface ListeningPlBase {
  id: string
  title: string
  difficulty: 'A2'
  createdAt: string
  /** Absent on practice seeds, which generate their audio on demand. */
  audio?: { shared?: string; items?: Record<string, string> }
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
}

/** Listening part 1: one short recording per item. */
export interface ListeningPlItem extends PlChoiceQuestion {
  context: string
  transcript: string
}

export interface ListeningPlItemsExercise extends ListeningPlBase {
  testingPart: 1
  items: ListeningPlItem[]
}

/** Listening part 2: one announcement and five "Prawda / Fałsz" questions. */
export interface ListeningPlTrueFalseExercise extends ListeningPlBase {
  testingPart: 2
  context: string
  transcript: string
  questions: PlChoiceQuestion[]
}

/** Listening parts 3 and 4: one recording; match five people or messages to a shared bank. */
export interface ListeningPlMatchingExercise extends ListeningPlBase {
  testingPart: 3 | 4
  context: string
  transcript: string
  options: string[]
  questions: Array<{ id: string; person: string; correctAnswer: number; explanation: string }>
}

/** Listening part 5: one announcement and a page of notes with numbered gaps in `content`. */
export interface ListeningPlNotesExercise extends ListeningPlBase {
  testingPart: 5
  context: string
  content: string
  transcript: string
  questions: PlGap[]
}

export type ListeningPlExercise =
  | ListeningPlItemsExercise
  | ListeningPlTrueFalseExercise
  | ListeningPlMatchingExercise
  | ListeningPlNotesExercise

export type WritingPlExercise = WritingExercise
