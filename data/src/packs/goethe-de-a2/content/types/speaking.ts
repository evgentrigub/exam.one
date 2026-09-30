import type { Difficulty } from './common'

export type SpeakingA2Part = 1 | 2

export type SpeakingDifficulty = Difficulty

export type SpeakingFourCards = [string, string, string, string]

export interface SpeakingTopicBase {
  id: string
  difficulty: SpeakingDifficulty
  createdAt: string
  /** Bundled content reserved for mock-exam sets and hidden from practice lists. */
  examOnly?: boolean
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

/**
 * A spoken introduction guided by keywords, recorded as one monologue (Goethe A1 Teil 1).
 * The monologue screen renders it like the A2 Teil 2 keywords; only the count differs.
 */
export interface SpeakingKeywordTopic extends SpeakingTopicBase {
  testingPart: number
  topicType: string
  theme: string
  keywords: string[]
}

/**
 * One card of a card exchange. `ask` and `request` are the learner's own card (a word, or an
 * everyday object or action); `answer` and `respond` hold the partner's fixed line that the
 * learner reacts to. `segment` is the recording the card belongs to.
 */
export type SpeakingCardKind = 'ask' | 'answer' | 'request' | 'respond'

export interface SpeakingCard {
  segment: string
  kind: SpeakingCardKind
  /** The topic the card belongs to, such as "Essen und Trinken". */
  topic?: string
  cue: string
  /**
   * Who says an `answer` or `respond` line. Absent, it is the partner; `examiner` is an
   * interlocutor question, as in Cambridge speaking tests.
   */
  speaker?: 'examiner'
}

/** A card exchange: one recording per card, in the part's segment order (Goethe A1 Teil 2–3). */
export interface SpeakingCardsTopic extends SpeakingTopicBase {
  testingPart: number
  topicType: string
  theme: string
  cards: SpeakingCard[]
}

export type SpeakingA2Topic =
  | SpeakingTopicA2Teil1
  | SpeakingTopicA2Teil2
  | SpeakingKeywordTopic
  | SpeakingCardsTopic

export interface SpeakingTranscripts {
  answers?: string
  questions?: string
  monologue?: string
  /** A card exchange stores one transcript per segment id. */
  [segment: string]: string | undefined
}
