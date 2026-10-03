import type { ExamPack } from '../../types'
import { listeningKeySeeds, readingKeySeeds, speakingKeySeeds, writingKeySeeds } from './content'
import { withPracticeCopy } from './practice-copy'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
import { cambridgeA2ReviewVars } from './review-vars'
import { attachCambridgeA2Runtime } from './runtime'
import { cambridgeEnA2Structure } from './structure'
import { structureText } from './structure-i18n'

export const CAMBRIDGE_EN_A2_PACK_ID = 'cambridge-en-a2'

/**
 * Cambridge English A2 Key (2020 format) — all four skills and fourteen parts as solo
 * practice, with no mock exams. Practice seeds ship without audio. Sources and adaptations
 * are in `brief.md`.
 */
export const cambridgeEnA2: ExamPack = {
  packId: CAMBRIDGE_EN_A2_PACK_ID,
  board: 'cambridge',
  language: 'en',
  cefr: 'A2',
  title: 'Cambridge A2 Key',
  live: true,
  examIds: ['cambridge-en-a2', 'cambridge-a2', 'a2-key'],
  structure: attachCambridgeA2Runtime(withPracticeCopy(cambridgeEnA2Structure)),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  // British Kokoro voices; a monologue uses the first one.
  speech: {
    ttsLang: 'en',
    voices: [
      { id: 'bf_emma', gender: 'female' },
      { id: 'bm_george', gender: 'male' },
      { id: 'bf_isabella', gender: 'female' },
      { id: 'bm_fable', gender: 'male' },
    ],
    sttLang: 'en',
    audioPathPrefix: '/audio/listening/cambridge-en-a2',
  },
  seedExercises: {
    reading: readingKeySeeds as unknown as Record<string, unknown>[],
    listening: listeningKeySeeds as unknown as Record<string, unknown>[],
    writing: writingKeySeeds as unknown as Record<string, unknown>[],
    speaking: speakingKeySeeds as unknown as Record<string, unknown>[],
  },
  buildReviewVars: cambridgeA2ReviewVars,
}
