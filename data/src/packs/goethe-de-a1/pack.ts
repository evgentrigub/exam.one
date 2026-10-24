import type { ExamPack } from '../../types'
import {
  createGoetheA1MockExamSet,
  goetheA1MockExamSet1,
  listeningA1Seeds,
  mockListeningA1Seeds,
  mockReadingA1Seeds,
  mockSpeakingA1Seeds,
  mockWritingA1Seeds,
  readingA1Seeds,
  speakingA1Seeds,
  writingA1Seeds,
} from './content'
import { A1_AUDIO_PATH_PREFIX } from './content/listening-audio'
import { createGoetheMockOverview } from '../goethe-shared/mock-overview'
import { withPracticeCopy } from './practice-copy'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
import { goetheA1ReviewVars } from './review-vars'
import { attachGoetheA1Runtime } from './runtime'
import { goetheDeA1Structure } from './structure'
import { structureText } from './structure-i18n'

export const GOETHE_DE_A1_PACK_ID = 'goethe-de-a1'

/**
 * Goethe-Zertifikat A1: Start Deutsch 1 — all four modules plus mock exams: a bundled Set 1
 * (with seed WAVs) and generated sets. Practice seeds ship without audio. Sources and
 * adaptations are in `brief.md`.
 */
export const goetheDeA1: ExamPack = {
  packId: GOETHE_DE_A1_PACK_ID,
  board: 'goethe',
  language: 'de',
  cefr: 'A1',
  title: 'Goethe A1',
  live: true,
  examIds: ['goethe-de-a1', 'goethe-a1'],
  structure: attachGoetheA1Runtime(withPracticeCopy(goetheDeA1Structure)),
  structureText,
  prompts: [...readingPrompts, ...listeningPrompts, ...writingPrompts, ...speakingPrompts],
  speech: {
    ttsLang: 'de',
    voices: [
      { id: 'martin', gender: 'male' },
      { id: 'bernd', gender: 'male' },
      { id: 'victoria', gender: 'female' },
      { id: 'eva', gender: 'female' },
    ],
    sttLang: 'de',
    audioPathPrefix: A1_AUDIO_PATH_PREFIX,
  },
  // Practice seeds first, then the mock Set 1 payloads, which are flagged `examOnly` and stored
  // as `EXAM_ONLY`, keeping them out of the practice catalogs.
  seedExercises: {
    reading: [...readingA1Seeds, ...mockReadingA1Seeds] as unknown as Record<string, unknown>[],
    listening: [...listeningA1Seeds, ...mockListeningA1Seeds] as unknown as Record<string, unknown>[],
    writing: [...writingA1Seeds, ...mockWritingA1Seeds] as unknown as Record<string, unknown>[],
    speaking: [...speakingA1Seeds, ...mockSpeakingA1Seeds] as unknown as Record<string, unknown>[],
  },
  createMockSet: createGoetheA1MockExamSet,
  bundledMockSet: goetheA1MockExamSet1,
  buildReviewVars: goetheA1ReviewVars,
  mockOverview: createGoetheMockOverview('Goethe A1'),
}
