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
    audioPathPrefix: '/audio/listening/cambridge-en-b1',
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
    reading: readingSeeds,
    listening: listeningSeeds,
    writing: writingSeeds,
    speaking: speakingSeeds,
  },
}
