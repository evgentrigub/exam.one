import type { ExamPack } from '../../types'
import { listeningA1Seeds, readingA1Seeds, speakingA1Seeds, writingA1Seeds } from './content'
import { withPracticeCopy } from './practice-copy'
import { listeningPrompts } from './prompts/listening'
import { readingPrompts } from './prompts/reading'
import { speakingPrompts } from './prompts/speaking'
import { writingPrompts } from './prompts/writing'
import { goetheA1ReviewVars } from './review-vars'
import { attachGoetheA1Runtime } from './runtime'
import { goetheDeA1Structure } from './structure'

export const GOETHE_DE_A1_PACK_ID = 'goethe-de-a1'

/**
 * Goethe-Zertifikat A1: Start Deutsch 1 — a practice pack, not A2 parity: no mock exams and no
 * bundled audio. Sources and adaptations are in `brief.md`.
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
    audioPathPrefix: '/audio/listening/a1',
  },
  seedExercises: {
    reading: readingA1Seeds as unknown as Record<string, unknown>[],
    listening: listeningA1Seeds as unknown as Record<string, unknown>[],
    writing: writingA1Seeds as unknown as Record<string, unknown>[],
    speaking: speakingA1Seeds as unknown as Record<string, unknown>[],
  },
  buildReviewVars: goetheA1ReviewVars,
}
