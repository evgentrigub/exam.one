import type { Difficulty } from '~/utils/types'

export type ListeningA2Part = 1 | 2 | 3 | 4

export type ListeningDifficulty = Extract<Difficulty, 'A2'>

export type ListeningMcqAnswerIndex = 0 | 1 | 2

export type ListeningMatchingAnswerIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type ListeningFiveItems<T> = [T, T, T, T, T]

export type ListeningThreeOptions = [string, string, string]

export type ListeningNineOptions = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]

/** Public URL paths for pre-generated listening audio (stable across replays). */
export interface ListeningExerciseAudioMap {
  shared?: string
  items?: Record<string, string> // item id -> audio url
}

export interface ListeningExerciseBase {
  id?: string
  title: string
  testingPart: ListeningA2Part
  difficulty: ListeningDifficulty
  createdAt?: string
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
  audio?: ListeningExerciseAudioMap | undefined
}

export interface ListeningItemA2Teil1 {
  id?: string
  context: string
  transcript: string
  question: string
  options: ListeningThreeOptions
  correctAnswer: ListeningMcqAnswerIndex
  explanation: string
}

export interface ListeningExerciseA2Teil1 extends ListeningExerciseBase {
  testingPart: 1
  items: ListeningFiveItems<ListeningItemA2Teil1>
}

export interface ListeningQuestionA2Teil2 {
  id?: string
  person: string
  correctAnswer: ListeningMatchingAnswerIndex
  explanation: string
}

export interface ListeningExerciseA2Teil2 extends ListeningExerciseBase {
  testingPart: 2
  context: string
  transcript: string
  options: ListeningNineOptions
  questions: ListeningFiveItems<ListeningQuestionA2Teil2>
}

export interface ListeningItemA2Teil3 {
  id?: string
  question: string
  transcript: string
  options: ListeningThreeOptions
  correctAnswer: ListeningMcqAnswerIndex
  explanation: string
}

export interface ListeningExerciseA2Teil3 extends ListeningExerciseBase {
  testingPart: 3
  items: ListeningFiveItems<ListeningItemA2Teil3>
}

export interface ListeningQuestionA2Teil4 {
  id?: string
  statement: string
  correctAnswer: boolean
  explanation: string
  type: 'true_false'
}

export interface ListeningExerciseA2Teil4 extends ListeningExerciseBase {
  testingPart: 4
  context: string
  transcript: string
  questions: ListeningFiveItems<ListeningQuestionA2Teil4>
}

export type ListeningA2Exercise =
  | ListeningExerciseA2Teil1
  | ListeningExerciseA2Teil2
  | ListeningExerciseA2Teil3
  | ListeningExerciseA2Teil4
