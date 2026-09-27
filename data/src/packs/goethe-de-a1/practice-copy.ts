import type { ExamModule } from '../../types'

const listeningInstructions = {
  1: 'Listen to each short conversation and choose the correct answer. Replay the audio as often as you need.',
  2: 'Listen to each announcement and decide whether the statement is correct (Richtig) or not (Falsch). Replay the audio as often as you need.',
  3: 'Listen to each telephone message and choose the correct answer. Replay the audio as often as you need.',
} as const

/** Session and catalog chrome, in the same slots A2 fills (see `ExamPart`). */
const listeningChrome = {
  1: { practiceSubtitle: 'Short conversations', practiceType: 'dialog', practiceMinutes: 8, practiceTimerSec: 480 },
  2: { practiceSubtitle: 'Announcements · Richtig/Falsch', practiceType: 'announcement', practiceMinutes: 5, practiceTimerSec: 300 },
  3: { practiceSubtitle: 'Telephone messages', practiceType: 'voicemail', practiceMinutes: 7, practiceTimerSec: 420 },
} as const

/** Attach the labels and coach copy the practice screens show. */
export function withPracticeCopy(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => ({
      ...part,
      practiceLabel: `Teil ${part.n}`,
      ...(module.id === 'listening'
        ? {
            instruction: listeningInstructions[part.n as 1 | 2 | 3],
            ...listeningChrome[part.n as 1 | 2 | 3],
          }
        : {}),
    })),
  }))
}
