// Payload shapes of the A1 seeds. They use the raw field names the practice screens read,
// as the A2 payloads do; the counts per Teil are enforced by `validate.ts`, not by tuples.

export type TrueFalse = ['Richtig', 'Falsch']

export interface ReadingA1Question {
  id: string
  textId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  type: 'comprehension' | 'selective'
}

export interface ReadingA1Exercise {
  id: string
  title: string
  content: string
  textType: 'email' | 'advertisement' | 'notice'
  testingPart: 1 | 2 | 3
  difficulty: 'A1'
  estimatedReadingTime: number
  wordCount: number
  topics: string[]
  createdAt: string
  questions: ReadingA1Question[]
}

export interface ListeningA1Item {
  id: string
  context: string
  transcript: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ListeningA1Exercise {
  id: string
  title: string
  testingPart: 1 | 2 | 3
  difficulty: 'A1'
  createdAt: string
  items: ListeningA1Item[]
}
