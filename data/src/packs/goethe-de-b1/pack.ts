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

export const GOETHE_DE_B1_PACK_ID = 'goethe-de-b1'

export const goetheDeB1: ExamPack = {
  packId: GOETHE_DE_B1_PACK_ID,
  board: 'goethe',
  language: 'de',
  cefr: 'B1',
  title: EXAM_TITLE,
  live: true,
  examIds: [GOETHE_DE_B1_PACK_ID],
  structure: attachRuntime(modules),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'de',
    sttLang: 'de',
    audioPathPrefix: '/audio/listening/goethe-de-b1',
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
    reading: readingSeeds,
    listening: listeningSeeds,
    writing: writingSeeds,
    speaking: speakingSeeds,
  },
}
