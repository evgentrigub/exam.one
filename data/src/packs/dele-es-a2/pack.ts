import type { ExamPack } from '../../types'
import { createGoetheMockOverview } from '../goethe-shared/mock-overview'
import {
  DELE_AUDIO_PATH_PREFIX,
  createDeleA2MockExamSet,
  deleA2MockExamSet1,
  listeningEsSeeds,
  mockListeningEsSeeds,
  mockReadingEsSeeds,
  mockSpeakingEsSeeds,
  mockWritingEsSeeds,
  readingEsSeeds,
  speakingEsSeeds,
  writingEsSeeds,
} from './content'
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
 * four tests and thirteen tareas as solo practice, and mock exams: a bundled Set 1 with seed
 * WAVs and generated sets, passed per group (Grupo 1 and 2, 30 of 50 each). Practice seeds ship
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
    audioPathPrefix: DELE_AUDIO_PATH_PREFIX,
  },
  // Practice seeds first, then the exam-only Set 1 payloads (their listening WAVs are seeded).
  seedExercises: {
    reading: [...readingEsSeeds, ...mockReadingEsSeeds] as unknown as Record<string, unknown>[],
    listening: [...listeningEsSeeds, ...mockListeningEsSeeds] as unknown as Record<
      string,
      unknown
    >[],
    writing: [...writingEsSeeds, ...mockWritingEsSeeds] as unknown as Record<string, unknown>[],
    speaking: [...speakingEsSeeds, ...mockSpeakingEsSeeds] as unknown as Record<string, unknown>[],
  },
  createMockSet: createDeleA2MockExamSet,
  bundledMockSet: deleA2MockExamSet1,
  buildReviewVars: deleA2ReviewVars,
  mockOverview: createGoetheMockOverview('DELE A2'),
}
