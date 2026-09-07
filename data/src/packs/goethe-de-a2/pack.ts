import { attachGoetheRuntime } from './runtime'
import { createGoetheA2MockExamSet } from '@exam-one/exam-content'
import type { ExamPack } from '../../types'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
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
  structure: attachGoetheRuntime(goetheDeA2Structure),
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
}
