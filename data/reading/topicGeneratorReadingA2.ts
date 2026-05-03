import type { GermanText } from '~/utils/types'

/**
 * A2 Reading Exercise Generation Prompt
 * User will fill this with actual prompt for generating A2-level reading exercises
 */
export const generateReadingA2 = () => {
  return `[MOCK PROMPT - User will fill this with actual A2 reading generation prompt]
  
  Expected output format: JSON array of GermanText objects with questions.
  Each exercise should include:
  - A text appropriate for A2 level (100-150 words)
  - 4-6 comprehension questions with multiple choice options
  - Correct answers and explanations
  
  Generate 3 complete reading exercises.
  
  Interface structure:
  {
    id: string (will be auto-generated)
    title: string
    content: string (the reading text)
    textType: 'email' | 'notice' | 'article' | 'advertisement' | 'instructions' | 'announcement'
    difficulty: 'A2'
    estimatedReadingTime: number (in minutes)
    wordCount: number
    topics: string[]
    createdAt: string (will be auto-generated)
    questions: [
      {
        id: string (will be auto-generated)
        textId: string (will be auto-generated)
        question: string
        options: string[] (4 options)
        correctAnswer: number (index of correct option, 0-3)
        explanation: string
        type: 'comprehension' | 'vocabulary' | 'grammar' | 'inference'
      }
    ]
  }
  `
}

/**
 * Example A2 reading exercises for reference
 * User can add actual examples from Goethe A2 exam materials
 */
export const dataA2ReadingExamples: GermanText[] = [
  // User can add reference examples here
]

