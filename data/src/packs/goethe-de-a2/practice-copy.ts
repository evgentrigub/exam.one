import type { ExamModule } from '../../types'

const writingTips = {
  1: [
    'Behandeln Sie genau die drei vorgegebenen Inhaltspunkte und bleiben Sie dabei im Rahmen von 20–30 Wörtern.',
    'Schreiben Sie durchgehend in der du-Form und beginnen Sie mit einer lockeren Anrede wie „Hallo Lisa“ oder „Hi Tom“.',
    'Schließen Sie kurz und freundlich ab, zum Beispiel mit „Bis bald“ oder „LG“; Ihren Namen dürfen Sie anhängen, müssen es aber nicht.',
    'Lassen Sie ruhig das Subjektpronomen am Satzanfang weg („Bin schon unterwegs“, „Habe leider keine Zeit“), denn das klingt in einer SMS natürlich.',
    'Setzen Sie ein bis zwei passende Emojis ein, um die Stimmung Ihrer Nachricht (Freude, Entschuldigung, Eile) zu unterstreichen.',
  ],
  2: [
    'Beginnen Sie mit einer (halb-)formellen Anrede wie „Sehr geehrte Frau Berger“ oder „Lieber Herr Klein“ und siezen Sie durchgehend.',
    'Decken Sie alle drei Inhaltspunkte ab und halten Sie sich an den Umfang von 30–40 Wörtern.',
    'Verbinden Sie Ihre Sätze mit Konnektoren wie „und“, „aber“, „denn“ oder „weil“, statt kurze Hauptsätze aneinanderzureihen.',
    'Formulieren Sie vollständige, grammatisch korrekte Sätze und bleiben Sie höflich, etwa mit „könnten Sie“ oder „ich würde gern“.',
    'Schließen Sie mit einer Grußformel wie „Mit freundlichen Grüßen“ ab und setzen Sie darunter Ihren vollständigen Vor- und Nachnamen.',
  ],
} as const

const speakingPhrases = {
  1: [
    'Ich … normalerweise, weil …',
    'Am Wochenende … ich oft …',
    'Wie oft … du …?',
    'Was machst du, wenn …?',
  ],
  2: ['Also, ich …', 'Normalerweise …', 'Außerdem …', 'Ich finde das …, weil …'],
} as const

const listeningInstructions = {
  1: 'Listen to each short message and choose the correct answer. Replay the audio as often as you need.',
  2: 'Listen to the conversation and match each person to the correct option. Replay the audio as often as you need.',
  3: 'Listen to each short dialogue and choose the correct answer. Replay the audio as often as you need.',
  4: 'Listen to the interview and decide whether each statement is correct (Ja) or not (Nein). Replay the audio as often as you need.',
} as const

const speakingInstructions = {
  1: 'First answer all four partner questions. Then make a second recording in which you ask all four questions.',
  2: 'Talk about the topic using all four keywords. Aim for a few connected sentences.',
} as const

/**
 * Session and catalog chrome the screens used to hardcode for A2. The values are the literals
 * those screens carried, moved here verbatim so another pack can supply its own.
 */
const listeningChrome = {
  1: {
    practiceSubtitle: 'Short messages',
    practiceType: 'announcement',
    practiceMinutes: 6,
    practiceTimerSec: 600,
  },
  2: {
    practiceSubtitle: 'Matching conversation',
    practiceType: 'matching',
    practiceMinutes: 7,
    practiceTimerSec: 480,
  },
  3: {
    practiceSubtitle: 'Short dialogues',
    practiceType: 'dialog',
    practiceMinutes: 5,
    practiceTimerSec: 600,
  },
  4: {
    practiceSubtitle: 'Interview · Ja/Nein',
    practiceType: 'interview',
    practiceMinutes: 8,
    practiceTimerSec: 480,
  },
} as const

const speakingChrome = {
  1: { practiceMinutes: 6, sessionTitle: 'Interview' },
  2: { practiceMinutes: 7, sessionTitle: 'Monologue' },
} as const

/** Attach the labels and coach copy the existing screens already show. */
export function withPracticeCopy(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => ({
      ...part,
      practiceLabel: `Teil ${part.n}`,
      ...(module.id === 'writing' ? { tips: writingTips[part.n as 1 | 2] } : {}),
      ...(module.id === 'listening'
        ? {
            instruction: listeningInstructions[part.n as 1 | 2 | 3 | 4],
            ...listeningChrome[part.n as 1 | 2 | 3 | 4],
          }
        : {}),
      ...(module.id === 'speaking'
        ? {
            phrases: speakingPhrases[part.n as 1 | 2],
            instruction: speakingInstructions[part.n as 1 | 2],
            ...speakingChrome[part.n as 1 | 2],
          }
        : {}),
    })),
  }))
}
