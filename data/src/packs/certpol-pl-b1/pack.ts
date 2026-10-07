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

export const CERTPOL_PL_B1_PACK_ID = 'certpol-pl-b1'

export const certpolPlB1: ExamPack = {
  packId: CERTPOL_PL_B1_PACK_ID,
  board: 'certyfikat-polski',
  language: 'pl',
  cefr: 'B1',
  title: EXAM_TITLE,
  live: true,
  examIds: [CERTPOL_PL_B1_PACK_ID],
  structure: attachRuntime(modules),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'pl',
    sttLang: 'pl',
    audioPathPrefix: '/audio/listening/certpol-pl-b1',
    voices: [
      {
        id: 'pl_gosia',
        gender: 'female',
      },
      {
        id: 'pl_darkman',
        gender: 'male',
      },
      {
        id: 'pl_bass',
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
