import type { Difficulty } from '~/utils/types'

export type SpeakingA2Part = 1 | 2

export type SpeakingDifficulty = Extract<Difficulty, 'A2'>

export type SpeakingFourCards = [string, string, string, string]

export interface SpeakingTopicBase {
  id: string
  difficulty: SpeakingDifficulty
  createdAt: string
}

/** Teil 1: practice-adapted contact interview with explicit answer/ask questions. */
export interface SpeakingTopicA2Teil1 extends SpeakingTopicBase {
  testingPart: 1
  topicType: 'interview'
  /** Overall theme, e.g. "Alltag" or "Hobby". */
  theme: string
  /** Exactly four questions the learner answers aloud. */
  answerQuestions: SpeakingFourCards
  /** Exactly four questions the learner asks aloud. */
  askQuestions: SpeakingFourCards
}

/** Teil 2: Über sich sprechen — short monologue guided by 4 keywords. */
export interface SpeakingTopicA2Teil2 extends SpeakingTopicBase {
  testingPart: 2
  topicType: 'monologue'
  /** Main question/theme, e.g. "Wie wohnen Sie?". */
  theme: string
  /** Exactly four supporting keywords/mini-questions. */
  keywords: SpeakingFourCards
}

export type SpeakingA2Topic = SpeakingTopicA2Teil1 | SpeakingTopicA2Teil2

export interface SpeakingTranscripts {
  answers?: string
  questions?: string
  monologue?: string
}

export interface SpeakingReviewCriterion {
  id: 'answers' | 'questions' | 'taskCompletion' | 'language'
  label: string
  points: number
  maxPoints: number
  comment: string
}

export interface SpeakingReviewData {
  teil: SpeakingA2Part
  totalPoints: number
  maxPoints: 4 | 8
  criteria: SpeakingReviewCriterion[]
  strengths: string[]
  improvements: string[]
  summary: string
}
