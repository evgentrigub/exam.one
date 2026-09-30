import type { WritingPlExercise } from '../types'

/**
 * Original Polish A2 writing seeds, one per task, in the format of the 2018 sample. Not official
 * tasks. Task a is writing part 1 here and task b part 2, because the writing screens number
 * their parts 1 and 2. An occasion the exam would show in a photo is stated in words.
 */
export const writingPlSeeds: WritingPlExercise[] = [
  {
    id: 'writing-pl-a2-zadanie-a-001',
    title: 'Gratulacje dla Oli',
    topicType: 'greeting',
    difficulty: 'A2',
    testingPart: 1,
    estimatedTime: 10,
    wordCount: { min: 10, max: 30 },
    category: ['Przyjaciele', 'Uroczystości'],
    createdAt: '2026-09-30',
    description: 'Twoja przyjaciółka Ola zdała egzamin na prawo jazdy.',
    task: 'Twoja przyjaciółka Ola zdała wczoraj egzamin na prawo jazdy. Napisz do niej krótką wiadomość z gratulacjami i zaproponuj, jak to uczcić. Napisz około 20 słów.',
    requirements: ['Pogratuluj Oli zdanego egzaminu', 'Zaproponuj, jak razem to uczcić', 'Podpisz się'],
  },
  {
    id: 'writing-pl-a2-zadanie-b-001',
    title: 'Moje mieszkanie',
    topicType: 'description',
    difficulty: 'A2',
    testingPart: 2,
    estimatedTime: 35,
    wordCount: { min: 70, max: 100 },
    category: ['Dom i mieszkanie'],
    createdAt: '2026-09-30',
    description: 'Opisz swoje mieszkanie albo swój dom.',
    task: 'Opisz swoje mieszkanie albo swój dom.\nNapisz:\n– gdzie jest i jak długo tam mieszkasz\n– ile ma pokoi i jakie one są\n– który pokój lubisz najbardziej i dlaczego\n– co chcesz w nim zmienić\nNapisz około 80–90 słów.',
    requirements: [
      'Gdzie jest i jak długo tam mieszkasz',
      'Ile ma pokoi i jakie one są',
      'Który pokój lubisz najbardziej i dlaczego',
      'Co chcesz w nim zmienić',
    ],
  },
]
