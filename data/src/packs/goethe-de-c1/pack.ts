import type { ExamPack } from '../../types'

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
