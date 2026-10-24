import type { ExamPack } from '../../types'
import { attachRuntime } from './runtime'
import { structureText } from './structure-i18n'
import { modules, EXAM_TITLE } from './structure'
import { readingPrompts } from './prompts/reading'
import { readingSeeds } from './content/seeds/reading'
import { listeningPrompts } from './prompts/listening'
import { listeningSeeds } from './content/seeds/listening'
import { writingPrompts } from './prompts/writing'
import { writingSeeds } from './content/seeds/writing'
import { speakingPrompts } from './prompts/speaking'
import { speakingSeeds } from './content/seeds/speaking'
import { mockReadingSeeds } from './content/seeds/mock-reading'
import { mockListeningSeeds } from './content/seeds/mock-listening'
import { mockWritingSeeds } from './content/seeds/mock-writing'
import { mockSpeakingSeeds } from './content/seeds/mock-speaking'
import { goetheC1MockExamSet1, createGoetheC1MockExamSet } from './content/seeds/mock-exam'
import { goetheC1MockOverview } from './prompts/mock-overview'

export const GOETHE_DE_C1_PACK_ID = 'goethe-de-c1'

export const goetheDeC1: ExamPack = {
  packId: GOETHE_DE_C1_PACK_ID,
  board: 'goethe',
  language: 'de',
  cefr: 'C1',
  title: EXAM_TITLE,
  live: true,
  examIds: [GOETHE_DE_C1_PACK_ID],
  structure: attachRuntime(modules),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'de',
    maxChunkCharacters: 400,
    sttLang: 'de',
    audioPathPrefix: '/audio/listening/goethe-de-c1',
    voices: [
      {
        id: 'martin',
        gender: 'male',
      },
      {
        id: 'victoria',
        gender: 'female',
      },
      {
        id: 'bernd',
        gender: 'male',
      },
      {
        id: 'eva',
        gender: 'female',
      },
    ],
  },
  seedExercises: {
    reading: [...readingSeeds, ...mockReadingSeeds],
    listening: [...listeningSeeds, ...mockListeningSeeds],
    writing: [...writingSeeds, ...mockWritingSeeds],
    speaking: [...speakingSeeds, ...mockSpeakingSeeds],
  },
  bundledMockSet: goetheC1MockExamSet1,
  createMockSet: createGoetheC1MockExamSet,
  mockOverview: goetheC1MockOverview,
}
