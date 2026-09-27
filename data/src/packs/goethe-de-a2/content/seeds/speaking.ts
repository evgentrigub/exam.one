import type { SpeakingA2Topic } from '../types/speaking'

/**
 * Default A2-level German speaking topics (Goethe-Institut, modular 2024 format).
 * One topic per Teil: Teil 1 (practice-adapted contact interview)
 * and Teil 2 (Über sich sprechen, monologue keywords).
 */
export const defaultSpeakingTopics: SpeakingA2Topic[] = [
  {
    id: 'speaking-a2-teil1-001',
    testingPart: 1,
    topicType: 'interview',
    difficulty: 'A2',
    theme: 'Einkaufen',
    answerQuestions: [
      'Wo kaufst du normalerweise Lebensmittel ein?',
      'Wie oft gehst du einkaufen?',
      'Was kaufst du gern auf dem Markt?',
      'Kaufst du Kleidung lieber im Geschäft oder online?',
    ],
    askQuestions: [
      'Gehst du gern in den Supermarkt?',
      'Wie viel Geld gibst du pro Woche für Essen aus?',
      'Wann kaufst du neue Kleidung?',
      'Gibt es in deiner Nähe einen Wochenmarkt?',
    ],
    createdAt: '2026-06-14',
  },

  {
    id: 'speaking-a2-teil2-001',
    testingPart: 2,
    topicType: 'monologue',
    difficulty: 'A2',
    theme: 'Wie wohnen Sie?',
    keywords: ['Wohnung oder Haus?', 'Wie viele Zimmer?', 'Mit wem?', 'In welcher Stadt?'],
    createdAt: '2026-06-14',
  },
]

export const mockExamSpeakingTopics: SpeakingA2Topic[] = [
  {
    id: 'mock-a2-set1-speaking-teil1',
    testingPart: 1,
    topicType: 'interview',
    difficulty: 'A2',
    theme: 'Freizeit und Wochenende',
    answerQuestions: [
      'Was machst du am Wochenende?',
      'Mit wem verbringst du deine Freizeit?',
      'Welches Hobby hast du?',
      'Wie oft machst du Sport?',
    ],
    askQuestions: [
      'Gehst du gern ins Kino?',
      'Was machst du am Sonntag?',
      'Triffst du oft Freunde?',
      'Welche Musik hörst du gern?',
    ],
    createdAt: '2026-08-09',
    examOnly: true,
  },
  {
    id: 'mock-a2-set1-speaking-teil2',
    testingPart: 2,
    topicType: 'monologue',
    difficulty: 'A2',
    theme: 'Wie lernen Sie Deutsch?',
    keywords: ['Seit wann?', 'Wo und wie?', 'Was ist leicht?', 'Was ist schwierig?'],
    createdAt: '2026-08-09',
    examOnly: true,
  },
]

export const allDefaultSpeakingTopics: SpeakingA2Topic[] = [
  ...defaultSpeakingTopics,
  ...mockExamSpeakingTopics,
]
