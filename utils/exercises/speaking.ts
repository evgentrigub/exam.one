import type { Difficulty } from '~/utils/types'

export type SpeakingA2Part = 1 | 2

export type SpeakingDifficulty = Extract<Difficulty, 'A2'>

export type SpeakingFourCards = [string, string, string, string]

export interface SpeakingTopicBase {
  id: string
  difficulty: SpeakingDifficulty
  createdAt: string
}

/** Teil 1: Gespräch zur Kontaktaufnahme — ask & answer using 4 prompt cards. */
export interface SpeakingTopicA2Teil1 extends SpeakingTopicBase {
  testingPart: 1
  topicType: 'interview'
  /** Overall theme, e.g. "Alltag" or "Hobby". */
  theme: string
  /** Exactly four single-word prompt cards. */
  cards: SpeakingFourCards
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
