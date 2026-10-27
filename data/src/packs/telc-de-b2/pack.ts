import type { ExamPack } from '../../types'
import { attachRuntime } from './runtime'
import { structureText } from './structure-i18n'
import { modules, EXAM_TITLE } from './structure'
import { readingPrompts } from './prompts/reading'
import { listeningPrompts } from './prompts/listening'
import { writingPrompts } from './prompts/writing'
import { speakingPrompts } from './prompts/speaking'
import { readingSeeds } from './content/seeds/reading'
import { listeningSeeds } from './content/seeds/listening'
import { writingSeeds } from './content/seeds/writing'
import { speakingSeeds } from './content/seeds/speaking'
import { mockReadingSeeds } from './content/seeds/mock-reading'
import { mockListeningSeeds } from './content/seeds/mock-listening'
import { mockWritingSeeds } from './content/seeds/mock-writing'
import { mockSpeakingSeeds } from './content/seeds/mock-speaking'
import { telcB2MockExamSet1, createTelcB2MockExamSet } from './content/seeds/mock-exam'
import { telcB2MockOverview } from './prompts/mock-overview'

export const TELC_DE_B2_PACK_ID = 'telc-de-b2'

export const telcDeB2: ExamPack = {
  packId: TELC_DE_B2_PACK_ID,
  board: 'telc',
  language: 'de',
  cefr: 'B2',
  title: EXAM_TITLE,
  live: true,
  examIds: [TELC_DE_B2_PACK_ID],
  structure: attachRuntime(modules),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'de',
    maxChunkCharacters: 400,
    sttLang: 'de',
    audioPathPrefix: '/audio/listening/telc-de-b2',
    voices: [
      { id: 'martin', gender: 'male' },
      { id: 'victoria', gender: 'female' },
      { id: 'bernd', gender: 'male' },
      { id: 'eva', gender: 'female' },
    ],
  },
  seedExercises: {
    reading: [...readingSeeds, ...mockReadingSeeds],
    listening: [...listeningSeeds, ...mockListeningSeeds],
    writing: [...writingSeeds, ...mockWritingSeeds],
    speaking: [...speakingSeeds, ...mockSpeakingSeeds],
  },
  bundledMockSet: telcB2MockExamSet1,
  createMockSet: createTelcB2MockExamSet,
  mockOverview: telcB2MockOverview,
}
