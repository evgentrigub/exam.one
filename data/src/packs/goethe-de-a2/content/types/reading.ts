import type { Difficulty } from './common'

export type ReadingA2Part = 1 | 2 | 3 | 4

export type ReadingTextType =
  'email' | 'notice' | 'article' | 'advertisement' | 'instructions' | 'announcement' | 'list'

export type ReadingQuestionType =
  'comprehension' | 'vocabulary' | 'grammar' | 'inference' | 'selective' | 'matching'

export type ReadingMcqAnswerIndex = 0 | 1 | 2

export type ReadingMatchingAnswerIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ReadingThreeOptions = [string, string, string]

export type ReadingSevenOptions = [string, string, string, string, string, string, string]

export type ReadingFiveQuestions<T> = [T, T, T, T, T]

export interface ReadingPromptPart<TPart extends ReadingA2Part = ReadingA2Part> {
  part: TPart
  prompt: string
}

export interface ReadingQuestionBase<
  TType extends ReadingQuestionType = ReadingQuestionType,
  TOptions extends string[] = string[],
  TAnswer extends number = number,
> {
  id: string
  textId: string
  question: string
  options: TOptions
  correctAnswer: TAnswer
  explanation: string
  type: TType
}

export type ReadingQuestion = ReadingQuestionBase

export type GeneratedReadingQuestion<TQuestion extends ReadingQuestion = ReadingQuestion> = Omit<
  TQuestion,
  'id' | 'textId' | 'correctAnswer'
> &
  Partial<Pick<TQuestion, 'id' | 'textId'>> & {
    correctAnswer: TQuestion['correctAnswer'] | string
  }

export interface ReadingExerciseBase<
  TDifficulty extends Difficulty = Difficulty,
  TTextType extends ReadingTextType = ReadingTextType,
  TQuestion extends ReadingQuestion = ReadingQuestion,
> {
  id: string
  title: string
  content: string
  textType: TTextType
  difficulty: TDifficulty
  testingPart?: ReadingA2Part
  estimatedReadingTime: number
  wordCount: number
  topics: string[]
  createdAt: string
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
  questions?: TQuestion[]
}

export type ReadingExercise = ReadingExerciseBase

export type GeneratedReadingExercise<
  TQuestion extends GeneratedReadingQuestion = GeneratedReadingQuestion,
> = Omit<ReadingExercise, 'id' | 'createdAt' | 'questions'> & {
  id?: string
  createdAt?: string
  questions?: TQuestion[]
}

export type ReadingQuestionA2Teil1 = ReadingQuestionBase<
  'comprehension',
  ReadingThreeOptions,
  ReadingMcqAnswerIndex
>

export interface ReadingExerciseA2Teil1 extends ReadingExerciseBase<
  'A2',
  'article',
  ReadingQuestionA2Teil1
> {
  testingPart: 1
  questions: ReadingFiveQuestions<ReadingQuestionA2Teil1>
}

export type ReadingQuestionA2Teil2 = ReadingQuestionBase<
  'selective',
  ReadingThreeOptions,
  ReadingMcqAnswerIndex
>

export interface ReadingExerciseA2Teil2 extends ReadingExerciseBase<
  'A2',
  'list',
  ReadingQuestionA2Teil2
> {
  testingPart: 2
  questions: ReadingFiveQuestions<ReadingQuestionA2Teil2>
}

export type ReadingQuestionA2Teil3 = ReadingQuestionBase<
  'comprehension',
  ReadingThreeOptions,
  ReadingMcqAnswerIndex
>

export interface ReadingExerciseA2Teil3 extends ReadingExerciseBase<
  'A2',
  'email',
  ReadingQuestionA2Teil3
> {
  testingPart: 3
  questions: ReadingFiveQuestions<ReadingQuestionA2Teil3>
}

export type ReadingQuestionA2Teil4 = ReadingQuestionBase<
  'matching',
  ReadingSevenOptions,
  ReadingMatchingAnswerIndex
>

export interface ReadingExerciseA2Teil4 extends ReadingExerciseBase<
  'A2',
  'advertisement',
  ReadingQuestionA2Teil4
> {
  testingPart: 4
  questions: ReadingFiveQuestions<ReadingQuestionA2Teil4>
}

export type ReadingA2Exercise =
  ReadingExerciseA2Teil1 | ReadingExerciseA2Teil2 | ReadingExerciseA2Teil3 | ReadingExerciseA2Teil4
