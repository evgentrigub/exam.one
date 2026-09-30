// Payload shapes of the A2 Key seeds. They use the raw field names the practice screens read,
// as the Goethe payloads do; the counts per part are enforced by `validate.ts`, not by tuples.

import type { WritingExercise } from '../../goethe-de-a2/content/types/writing'

/** A choice question: reading parts 1–4 and listening parts 1, 3 and 4. */
export interface KeyChoiceQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

/** A typed-answer gap (reading part 5, listening part 2), scored against `accepted`. */
export interface KeyGap {
  id: string
  /** The gap's label, e.g. "Gap 1" or the note it completes ("Day of the trip"). */
  question: string
  accepted: string[]
  explanation: string
}

export interface ReadingKeyQuestion extends KeyChoiceQuestion {
  textId: string
  type: 'comprehension' | 'matching' | 'cloze'
}

export interface ReadingKeyGap extends KeyGap {
  textId: string
  type: 'gap'
}

export interface ReadingKeyExercise {
  id: string
  title: string
  content: string
  textType: 'notice' | 'article' | 'email'
  testingPart: 1 | 2 | 3 | 4 | 5
  difficulty: 'A2'
  estimatedReadingTime: number
  wordCount: number
  topics: string[]
  createdAt: string
  questions: (ReadingKeyQuestion | ReadingKeyGap)[]
}

interface ListeningKeyBase {
  id: string
  title: string
  difficulty: 'A2'
  createdAt: string
  /** Absent on practice seeds, which generate their audio on demand. */
  audio?: { shared?: string; items?: Record<string, string> }
}

/** Listening parts 1 and 4: one recording per item. */
export interface ListeningKeyItem extends KeyChoiceQuestion {
  context: string
  transcript: string
}

export interface ListeningKeyItemsExercise extends ListeningKeyBase {
  testingPart: 1 | 4
  items: ListeningKeyItem[]
}

/** Listening part 2: one monologue and a page of notes with numbered gaps in `content`. */
export interface ListeningKeyNotesExercise extends ListeningKeyBase {
  testingPart: 2
  context: string
  content: string
  transcript: string
  questions: KeyGap[]
}

/** Listening part 3: one longer conversation and five choice questions on it. */
export interface ListeningKeyConversationExercise extends ListeningKeyBase {
  testingPart: 3
  context: string
  transcript: string
  questions: KeyChoiceQuestion[]
}

/** Listening part 5: one conversation; match five people or days to eight options. */
export interface ListeningKeyMatchingExercise extends ListeningKeyBase {
  testingPart: 5
  context: string
  transcript: string
  options: string[]
  questions: Array<{ id: string; person: string; correctAnswer: number; explanation: string }>
}

export type ListeningKeyExercise =
  | ListeningKeyItemsExercise
  | ListeningKeyNotesExercise
  | ListeningKeyConversationExercise
  | ListeningKeyMatchingExercise

/** Writing parts: the shared writing-topic shape; the picture story adds its three scenes. */
export interface WritingKeyExercise extends WritingExercise {
  pictures?: string[]
}
