import type { WritingExercise } from '~/utils/types'

/**
 * Sample German writing topics for writing practice
 * Each topic is designed to match Goethe Institut certification standards
 */
export const defaultWritingTopics: WritingExercise[] = [
  {
    id: 'a2-topic-1',
    title: 'E-Mail an einen Freund',
    topicType: 'email',
    difficulty: 'A2',
    estimatedTime: 20,
    wordCount: {
      min: 80,
      max: 120
    },
    category: ['Freunde', 'Alltag', 'Persönlich'],
    createdAt: '2024-01-22',
    description: 'Schreibe eine persönliche E-Mail an einen Freund oder eine Freundin.',
    task: 'Dein Freund Max hat dir geschrieben, dass er nächste Woche Geburtstag hat und eine kleine Party macht. Schreibe ihm eine E-Mail zurück.',
    requirements: [
      'Schreibe 80-120 Wörter',
      'Verwende eine passende Anrede und einen passenden Gruß',
      'Antworte auf seine Einladung',
      'Erzähle, was du ihm zum Geburtstag schenken möchtest',
      'Frage nach Details zur Party (Zeit, Ort, andere Gäste)'
    ],
  }
]