import type { ReadingExercise } from '~/utils/exercises/reading'

/**
 * C1 Reading Exercise Generation Prompt
 * User will fill this with actual prompt for generating C1-level reading exercises
 */
export const generateReadingC1 = () => {
  return `[MOCK PROMPT - User will fill this with actual C1 reading generation prompt]
  
  Expected output format: JSON array of GermanText objects with questions.
  Each exercise should include:
  - A text appropriate for C1 level (300-400 words, complex structure)
  - 5-8 comprehension questions with multiple choice options
  - Questions testing deeper understanding, inference, and nuanced meaning
  - Correct answers and detailed explanations
  
  Generate 3 complete reading exercises.
  
  C1-level texts should have:
  - Complex sentence structures
  - Advanced vocabulary
  - Abstract concepts
  - Nuanced arguments or perspectives
  
  Interface structure:
  {
    id: string (will be auto-generated)
    title: string
    content: string (the reading text)
    textType: 'email' | 'notice' | 'article' | 'advertisement' | 'instructions' | 'announcement'
    difficulty: 'C1'
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
 * Example C1 reading exercises for reference
 * User can add actual examples from Goethe C1 exam materials
 */
export const dataC1ReadingExamples: ReadingExercise[] = [
  // User can add reference examples here
]
