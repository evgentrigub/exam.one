// Payload shapes of the DELE A2 seeds. They use the raw field names the practice screens read,
// as the Goethe, Cambridge and Polish payloads do; the counts per part are enforced by `validate.ts`.

import type { WritingExercise } from '../../goethe-de-a2/content/types/writing'

/** A three-option question: every reading part, and listening parts 1 and 2. */
export interface EsChoiceQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ReadingEsQuestion extends EsChoiceQuestion {
  textId: string
  type: 'comprehension' | 'matching'
}

export interface ReadingEsExercise {
  id: string
  title: string
  content: string
  textType: 'email' | 'advertisement' | 'article'
  testingPart: 1 | 2 | 3 | 4
  difficulty: 'A2'
  estimatedReadingTime: number
  wordCount: number
  topics: string[]
  createdAt: string
  questions: ReadingEsQuestion[]
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
}

interface ListeningEsBase {
  id: string
  title: string
  difficulty: 'A2'
  createdAt: string
  /** Absent on practice seeds, which generate their audio on demand. */
  audio?: { shared?: string; items?: Record<string, string> }
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
}

/** Listening parts 1 and 2: one short recording per item. */
export interface ListeningEsItem extends EsChoiceQuestion {
  context: string
  transcript: string
}

export interface ListeningEsItemsExercise extends ListeningEsBase {
  testingPart: 1 | 2
  items: ListeningEsItem[]
}

/**
 * Listening parts 3 and 4: one recording and a bank shared by every question. In part 3 the
 * bank is the man, the woman and "Ninguno de los dos", and `person` holds the statement; in
 * part 4 the bank is ten statements and `person` is "Mensaje n".
 */
export interface ListeningEsMatchingExercise extends ListeningEsBase {
  testingPart: 3 | 4
  context: string
  transcript: string
  options: string[]
  questions: Array<{ id: string; person: string; correctAnswer: number; explanation: string }>
}

export type ListeningEsExercise = ListeningEsItemsExercise | ListeningEsMatchingExercise

export type WritingEsExercise = WritingExercise
