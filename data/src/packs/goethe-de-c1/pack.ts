import type { ExamPack } from '../../types'
import { c1WritingTips } from './practice-copy'

/** Structural stub only — not a live product. */
export const goetheDeC1: ExamPack = {
  packId: 'goethe-de-c1',
  board: 'goethe',
  language: 'de',
  cefr: 'C1',
  title: 'Goethe C1',
  live: false,
  examIds: ['goethe-de-c1'],
  structure: [
    {
      id: 'writing',
      label: 'Writing (Schreiben)',
      minutes: 80,
      points: 25,
      summary: 'Placeholder C1 writing module. Not selectable in the live product.',
      scoringNote: 'Stub — no scoring in this pack.',
      parts: [
        {
          n: 1,
          title: 'Forum contribution',
          format: 'Free writing',
          short: 'Placeholder part.',
          goal: 'Stub',
          skill: 'Writing',
          itemFormat: 'freeform',
          practiceLabel: 'Teil 1',
          tips: c1WritingTips[1],
        },
        {
          n: 2,
          title: 'Formal letter',
          format: 'Free writing',
          short: 'Historical C1 writing tips.',
          goal: 'Stub',
          skill: 'Writing',
          itemFormat: 'freeform',
          available: false,
          practiceLabel: 'Teil 2',
          tips: c1WritingTips[2],
        },
      ],
    },
  ],
  prompts: [],
  speech: {
    ttsLang: 'de',
    voices: [],
    sttLang: 'de',
    audioPathPrefix: '/audio/listening/c1',
  },
}
