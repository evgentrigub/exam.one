import type { ExamPack } from '../../types'
import { createGoetheMockOverview } from '../goethe-shared/mock-overview'
import {
  CERTPOL_AUDIO_PATH_PREFIX,
  certpolA2MockExamSet1,
  createCertpolA2MockExamSet,
  listeningPlSeeds,
  mockListeningPlSeeds,
  mockReadingPlSeeds,
  mockSpeakingPlSeeds,
  mockWritingPlSeeds,
  readingPlSeeds,
  speakingPlSeeds,
  writingPlSeeds,
} from './content'
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
 * level A2 for adults: all four modules and sixteen tasks as solo practice, and mock exams: a
 * bundled Set 1 with seed WAVs and generated sets, passed per part (written 40 of 80, oral 18
 * of 36). Practice seeds ship without audio. Sources and adaptations are in `brief.md`.
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
    audioPathPrefix: CERTPOL_AUDIO_PATH_PREFIX,
  },
  // Practice seeds first, then the exam-only Set 1 payloads (their listening WAVs are seeded).
  seedExercises: {
    listening: [...listeningPlSeeds, ...mockListeningPlSeeds] as unknown as Record<string, unknown>[],
    reading: [...readingPlSeeds, ...mockReadingPlSeeds] as unknown as Record<string, unknown>[],
    writing: [...writingPlSeeds, ...mockWritingPlSeeds] as unknown as Record<string, unknown>[],
    speaking: [...speakingPlSeeds, ...mockSpeakingPlSeeds] as unknown as Record<string, unknown>[],
  },
  createMockSet: createCertpolA2MockExamSet,
  bundledMockSet: certpolA2MockExamSet1,
  buildReviewVars: certpolA2ReviewVars,
  mockOverview: createGoetheMockOverview('Certyfikat Polski A2'),
}
