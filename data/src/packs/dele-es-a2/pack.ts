import type { ExamPack } from '../../types'
import { listeningEsSeeds, readingEsSeeds, speakingEsSeeds, writingEsSeeds } from './content'
import { withPracticeCopy } from './practice-copy'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
import { deleA2ReviewVars } from './review-vars'
import { attachDeleA2Runtime } from './runtime'
import { deleEsA2Structure } from './structure'
import { structureText } from './structure-i18n'

export const DELE_ES_A2_PACK_ID = 'dele-es-a2'

/**
 * DELE A2 — the Instituto Cervantes diploma of Spanish as a foreign language, level A2: all
 * four tests and thirteen tareas as solo practice, with no mock exams. Practice seeds ship
 * without audio. Sources and adaptations are in `brief.md`.
 */
export const deleEsA2: ExamPack = {
  packId: DELE_ES_A2_PACK_ID,
  board: 'instituto-cervantes',
  language: 'es',
  cefr: 'A2',
  title: 'DELE A2',
  live: true,
  examIds: ['dele-es-a2', 'dele-a2', 'spanish-a2'],
  structure: attachDeleA2Runtime(withPracticeCopy(deleEsA2Structure)),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  // Kokoro v1.0 Spanish voices on the local TTS service; a monologue without a label uses the first one.
  speech: {
    ttsLang: 'es',
    voices: [
      { id: 'ef_dora', gender: 'female' },
      { id: 'em_alex', gender: 'male' },
      { id: 'em_santa', gender: 'male' },
    ],
    sttLang: 'es',
    audioPathPrefix: '/audio/listening/dele-es-a2',
  },
  seedExercises: {
    reading: readingEsSeeds as unknown as Record<string, unknown>[],
    listening: listeningEsSeeds as unknown as Record<string, unknown>[],
    writing: writingEsSeeds as unknown as Record<string, unknown>[],
    speaking: speakingEsSeeds as unknown as Record<string, unknown>[],
  },
  buildReviewVars: deleA2ReviewVars,
}
