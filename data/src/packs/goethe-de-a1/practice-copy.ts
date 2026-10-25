import type { ExamModule } from '../../types'

const listeningInstructions = {
  1: 'Listen to each short conversation and choose the correct answer. Replay the audio as often as you need.',
  2: 'Listen to each announcement and decide whether the statement is correct (Richtig) or not (Falsch). Replay the audio as often as you need.',
  3: 'Listen to each telephone message and choose the correct answer. Replay the audio as often as you need.',
} as const

const writingTips = {
  1: [
    'Lesen Sie zuerst die Situation ganz und markieren Sie alle Zahlen, Namen, Orte und Zeiten.',
    'Schreiben Sie nur die Information, die das Formular fragt – ein Wort oder eine Zahl reicht oft.',
    'Rechnen Sie mit: „mit ihrem Mann und zwei Kindern“ sind vier Personen.',
    'Bei einer Auswahl (zum Beispiel bar / Kreditkarte) wählen Sie genau eine Möglichkeit.',
  ],
  2: [
    'Beginnen Sie mit einer Anrede („Liebe Anna“, „Sehr geehrte Damen und Herren“) und enden Sie mit einem Gruß und Ihrem Namen.',
    'Schreiben Sie zu jedem der drei Punkte ein bis zwei kurze Sätze.',
    'Circa 30 Wörter sind genug – einfache, richtige Sätze sind besser als lange.',
    'Achten Sie auf du oder Sie: Freunde duzen Sie, eine Schule oder ein Hotel siezen Sie.',
  ],
} as const

const speakingCopy = {
  1: {
    sessionTitle: 'Introduction',
    practiceMinutes: 5,
    instruction:
      'Introduce yourself using every keyword, then spell the word and say the number. Record it all in one go.',
    phrases: [
      'Ich heiße …',
      'Ich bin … Jahre alt.',
      'Ich komme aus …',
      'Ich wohne in …',
      'Ich spreche …',
      'Ich bin … von Beruf.',
      'Mein Hobby ist …',
    ],
  },
  2: {
    sessionTitle: 'Ask & answer',
    practiceMinutes: 5,
    instruction:
      'Two rounds. Ask a question with the word on your card, then answer your partner’s question. Record each turn separately.',
    phrases: ['Was …?', 'Wo …?', 'Wann …?', 'Hast du …?', 'Magst du …?', 'Ich … gern …'],
  },
  3: {
    sessionTitle: 'Requests',
    practiceMinutes: 5,
    instruction:
      'Two rounds. Make a polite request for what is on your card, then react to your partner’s request. Record each turn separately.',
    phrases: [
      'Können Sie bitte …?',
      'Kannst du mir bitte … geben?',
      '…, bitte.',
      'Ja, gern. Hier, bitte.',
      'Tut mir leid, …',
      'Kein Problem.',
    ],
  },
} as const

/** Session and catalog chrome, in the same slots A2 fills (see `ExamPart`). */
const listeningChrome = {
  1: {
    practiceSubtitle: 'Short conversations',
    practiceType: 'dialog',
    practiceMinutes: 8,
    practiceTimerSec: 480,
  },
  2: {
    practiceSubtitle: 'Announcements · Richtig/Falsch',
    practiceType: 'announcement',
    practiceMinutes: 5,
    practiceTimerSec: 300,
  },
  3: {
    practiceSubtitle: 'Telephone messages',
    practiceType: 'voicemail',
    practiceMinutes: 7,
    practiceTimerSec: 420,
  },
} as const

/** Attach the labels and coach copy the practice screens show. */
export function withPracticeCopy(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => ({
      ...part,
      practiceLabel: `Teil ${part.n}`,
      ...(module.id === 'writing' ? { tips: writingTips[part.n as 1 | 2] } : {}),
      ...(module.id === 'speaking' ? speakingCopy[part.n as 1 | 2 | 3] : {}),
      ...(module.id === 'listening'
        ? {
            instruction: listeningInstructions[part.n as 1 | 2 | 3],
            ...listeningChrome[part.n as 1 | 2 | 3],
          }
        : {}),
    })),
  }))
}
