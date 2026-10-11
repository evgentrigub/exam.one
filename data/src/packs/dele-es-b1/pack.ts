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
import { deleB1MockExamSet1, createDeleB1MockExamSet } from './content/seeds/mock-exam'
import { deleB1MockOverview } from './prompts/mock-overview'

export const DELE_ES_B1_PACK_ID = 'dele-es-b1'

export const deleEsB1: ExamPack = {
  packId: DELE_ES_B1_PACK_ID,
  board: 'instituto-cervantes',
  language: 'es',
  cefr: 'B1',
  title: EXAM_TITLE,
  live: true,
  examIds: [DELE_ES_B1_PACK_ID],
  structure: attachRuntime(modules),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'es',
    sttLang: 'es',
    audioPathPrefix: '/audio/listening/dele-es-b1',
    voices: [
      {
        id: 'ef_dora',
        gender: 'female',
      },
      {
        id: 'em_alex',
        gender: 'male',
      },
      {
        id: 'em_santa',
        gender: 'male',
      },
    ],
  },
  bundledMockSet: deleB1MockExamSet1,
  createMockSet: createDeleB1MockExamSet,
  mockOverview: deleB1MockOverview,
  seedExercises: {
    reading: [...readingSeeds, ...mockReadingSeeds],
    listening: [...listeningSeeds, ...mockListeningSeeds],
    writing: [...writingSeeds, ...mockWritingSeeds],
    speaking: [...speakingSeeds, ...mockSpeakingSeeds],
  },
}
