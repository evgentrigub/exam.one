import type { ExamPack } from '../../types'
import { listeningPlSeeds, readingPlSeeds, speakingPlSeeds, writingPlSeeds } from './content'
import { withPracticeCopy } from './practice-copy'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
import { certpolA2ReviewVars } from './review-vars'
import { attachCertpolA2Runtime } from './runtime'
import { certpolPlA2Structure } from './structure'
import { structureText } from './structure-i18n'

export const CERTPOL_PL_A2_PACK_ID = 'certpol-pl-a2'

/**
 * Certyfikat Polski A2 — the Polish state certificate exam in Polish as a foreign language,
 * level A2 for adults: all four modules and sixteen tasks as solo practice, with no mock
 * exams. Practice seeds ship without audio. Sources and adaptations are in `brief.md`.
 */
export const certpolPlA2: ExamPack = {
  packId: CERTPOL_PL_A2_PACK_ID,
  board: 'certyfikat-polski',
  language: 'pl',
  cefr: 'A2',
  title: 'Certyfikat Polski A2',
  live: true,
  examIds: ['certpol-pl-a2', 'certyfikat-pl-a2', 'polish-a2'],
  structure: attachCertpolA2Runtime(withPracticeCopy(certpolPlA2Structure)),
  structureText,
  prompts: [...listeningPrompts, ...readingPrompts, ...writingPrompts, ...speakingPrompts],
  // Piper voices on the local TTS service; a monologue without a label uses the first one.
  speech: {
    ttsLang: 'pl',
    voices: [
      { id: 'pl_gosia', gender: 'female' },
      { id: 'pl_darkman', gender: 'male' },
      { id: 'pl_bass', gender: 'male' },
    ],
    sttLang: 'pl',
    audioPathPrefix: '/audio/listening/certpol-pl-a2',
  },
  seedExercises: {
    listening: listeningPlSeeds as unknown as Record<string, unknown>[],
    reading: readingPlSeeds as unknown as Record<string, unknown>[],
    writing: writingPlSeeds as unknown as Record<string, unknown>[],
    speaking: speakingPlSeeds as unknown as Record<string, unknown>[],
  },
  buildReviewVars: certpolA2ReviewVars,
}
