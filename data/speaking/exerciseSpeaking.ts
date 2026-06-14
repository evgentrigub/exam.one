import type {
  SpeakingTopicA2Teil1,
  SpeakingTopicA2Teil2
} from '~/data/speaking/a2/exerciseGeneratorSpeakingA2'

/**
 * Default A2-level German speaking topics (Goethe-Institut, modular 2024 format).
 * One topic per Teil: Teil 1 (Gespräch zur Kontaktaufnahme, interview cards)
 * and Teil 2 (Über sich sprechen, monologue keywords).
 */
export const defaultSpeakingTopics: Array<SpeakingTopicA2Teil1 | SpeakingTopicA2Teil2> = [
  {
    id: 'speaking-a2-teil1-001',
    testingPart: 1,
    topicType: 'interview',
    difficulty: 'A2',
    theme: 'Einkaufen',
    cards: ['Supermarkt', 'Geld', 'Kleidung', 'Markt'],
    createdAt: '2026-06-14'
  },

  {
    id: 'speaking-a2-teil2-001',
    testingPart: 2,
    topicType: 'monologue',
    difficulty: 'A2',
    theme: 'Wie wohnen Sie?',
    keywords: ['Wohnung oder Haus?', 'Wie viele Zimmer?', 'Mit wem?', 'In welcher Stadt?'],
    createdAt: '2026-06-14'
  }
]
