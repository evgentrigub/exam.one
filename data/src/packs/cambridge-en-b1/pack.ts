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
import { cambridgeB1MockExamSet1, createCambridgeB1MockExamSet } from './content/seeds/mock-exam'
import { CAMBRIDGE_B1_AUDIO_PATH_PREFIX } from './content/listening-audio'
import { cambridgeB1MockOverview } from './prompts/mock-overview'

export const CAMBRIDGE_EN_B1_PACK_ID = 'cambridge-en-b1'

export const cambridgeEnB1: ExamPack = {
  packId: CAMBRIDGE_EN_B1_PACK_ID,
  board: 'cambridge',
  language: 'en',
  cefr: 'B1',
  title: EXAM_TITLE,
  live: true,
  examIds: [CAMBRIDGE_EN_B1_PACK_ID],
  structure: attachRuntime(modules),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'en',
    sttLang: 'en',
    audioPathPrefix: CAMBRIDGE_B1_AUDIO_PATH_PREFIX,
    voices: [
      {
        id: 'bf_emma',
        gender: 'female',
      },
      {
        id: 'bm_george',
        gender: 'male',
      },
      {
        id: 'bf_isabella',
        gender: 'female',
      },
      {
        id: 'bm_fable',
        gender: 'male',
      },
    ],
  },
  seedExercises: {
    reading: [...readingSeeds, ...mockReadingSeeds],
    listening: [...listeningSeeds, ...mockListeningSeeds],
    writing: [...writingSeeds, ...mockWritingSeeds],
    speaking: [...speakingSeeds, ...mockSpeakingSeeds],
  },
  createMockSet: createCambridgeB1MockExamSet,
  bundledMockSet: cambridgeB1MockExamSet1,
  mockOverview: cambridgeB1MockOverview,
}
