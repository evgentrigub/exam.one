import { attachGoetheRuntime } from './runtime'
import { createGoetheA2MockExamSet, goetheA2MockExamSet1 } from './content'
import { goetheA2MockOverview } from './prompts/mock-exam'
import type { ExamPack } from '../../types'
import { goetheA2ExerciseId } from './exercise-id'
import { goetheA2ReviewVars } from './review-vars'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
import { withPracticeCopy } from './practice-copy'
import { goetheDeA2Structure } from './structure'

export const GOETHE_DE_A2_PACK_ID = 'goethe-de-a2'

export const goetheDeA2: ExamPack = {
  packId: GOETHE_DE_A2_PACK_ID,
  board: 'goethe',
  language: 'de',
  cefr: 'A2',
  title: 'Goethe A2',
  live: true,
  compatibility: 'goethe-a2-v1',
  examIds: ['goethe-de-a2', 'goethe-a2'],
  structure: attachGoetheRuntime(withPracticeCopy(goetheDeA2Structure)),
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'de',
    voices: [
      { id: 'martin', gender: 'male' },
      { id: 'bernd', gender: 'male' },
      { id: 'victoria', gender: 'female' },
      { id: 'eva', gender: 'female' },
    ],
    sttLang: 'de',
    audioPathPrefix: '/audio/listening/a2',
  },
  createMockSet: createGoetheA2MockExamSet,
  bundledMockSet: goetheA2MockExamSet1,
  exerciseId: goetheA2ExerciseId,
  buildReviewVars: goetheA2ReviewVars,
  mockOverview: goetheA2MockOverview,
}
