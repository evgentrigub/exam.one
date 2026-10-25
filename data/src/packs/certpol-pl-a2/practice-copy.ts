import type { ExamModule } from '../../types'

/** Official task numbers: roman numerals for the written part, a and b for the writing set. */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const

function practiceLabel(module: ExamModule['id'], n: number): string {
  if (module === 'writing') return `Zadanie ${n === 1 ? 'a' : 'b'}`
  if (module === 'speaking') return `Zadanie ${n}`
  return `Zadanie ${ROMAN[n - 1]}`
}

const listeningInstructions = {
  1: 'Listen to ten short recordings. For recordings 1–4 decide who is speaking, for 5–10 where you hear them. In the exam you hear each recording twice.',
  2: 'Listen to the radio announcement and decide if each sentence is true (Prawda) or false (Fałsz).',
  3: 'Listen to the conversation and choose the right option for each person. Two options are not used.',
  4: 'Listen to five phone messages and choose what each message says. One option is not used.',
  5: 'Listen to the announcement and write down the missing numbers: a date, a time, a price, an age or a year. Digits or words are both fine.',
} as const

/** Session and catalog chrome, in the slots the listening screen reads (see `ExamPart`). */
const listeningChrome = {
  1: {
    practiceSubtitle: 'Kto mówi? Gdzie?',
    practiceType: 'recordings',
    practiceMinutes: 7,
    practiceTimerSec: 420,
  },
  2: {
    practiceSubtitle: 'Komunikat w radiu',
    practiceType: 'announcement',
    practiceMinutes: 4,
    practiceTimerSec: 240,
  },
  3: {
    practiceSubtitle: 'Rozmowa',
    practiceType: 'matching',
    practiceMinutes: 5,
    practiceTimerSec: 300,
  },
  4: {
    practiceSubtitle: 'Wiadomości na sekretarce',
    practiceType: 'voicemail',
    practiceMinutes: 5,
    practiceTimerSec: 300,
  },
  5: {
    practiceSubtitle: 'Liczby',
    practiceType: 'notes',
    practiceMinutes: 4,
    practiceTimerSec: 240,
  },
} as const

const writingTips = {
  1: [
    'Do everything the task asks – each point you leave out costs task-completion points.',
    'Start and end like a real message: "Cześć Aniu!" … "Pozdrawiam, Tomek" or "Całuję".',
    'Wishes use the genitive: "Wszystkiego najlepszego!", "Zdrowia, szczęścia i sukcesów!".',
    'Keep it short and correct; about 10–20 words is enough.',
  ],
  2: [
    'Write about every guiding point, in order, with two or three sentences each.',
    'Join your sentences with i, ale, bo, więc, potem and na końcu.',
    'Check your endings: adjectives agree with nouns ("mój starszy brat", "moja młodsza siostra").',
    'Use the past tense for events ("pojechałem", "byłam") and the present for descriptions.',
    'Aim for 80–90 words; a text that is much shorter loses points.',
  ],
} as const

const speakingCopy = {
  1: {
    sessionTitle: 'O sobie',
    practiceMinutes: 4,
    instruction:
      'The examiner asks you four questions about yourself. Record one answer for each, in two or three full sentences.',
    phrases: [
      'Nazywam się …',
      'Mieszkam w …',
      'Pracuję jako … / Studiuję …',
      'Mam … lat.',
      'W wolnym czasie lubię …',
      'Moja rodzina jest …',
    ],
  },
  2: {
    sessionTitle: 'Opis zdjęcia',
    practiceMinutes: 6,
    practiceType: 'photo',
    instruction:
      'In the exam you see a photo. Here the photo is described in words. Describe the person in it with the help of the four prompts: who it is, what they look like, what they are doing and how they feel. Speak for about a minute.',
    phrases: [
      'Na zdjęciu jest …',
      'To jest chyba …',
      'Ma krótkie / długie włosy.',
      'Ma na sobie …',
      'Wygląda na …',
      'Myślę, że on / ona …',
    ],
  },
  3: {
    sessionTitle: 'Rozmowa z egzaminatorem',
    practiceMinutes: 5,
    practiceType: 'roleplay',
    instruction:
      'In the exam you act out a situation with the examiner. Here, start the conversation from your card, then react to each of the examiner’s lines. Record each turn separately.',
    phrases: [
      'Czy masz ochotę …?',
      'Może pójdziemy …?',
      'Co powiesz na …?',
      'Spotkajmy się …',
      'Dobrze, zgoda!',
      'Niestety nie mogę, bo …',
    ],
  },
} as const

/** Attach the labels and coach copy the practice screens show. */
export function withPracticeCopy(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => ({
      ...part,
      practiceLabel: practiceLabel(module.id, part.n),
      ...(module.id === 'writing' ? { tips: writingTips[part.n as 1 | 2] } : {}),
      ...(module.id === 'speaking' ? speakingCopy[part.n as 1 | 2 | 3] : {}),
      ...(module.id === 'listening'
        ? {
            instruction: listeningInstructions[part.n as 1 | 2 | 3 | 4 | 5],
            ...listeningChrome[part.n as 1 | 2 | 3 | 4 | 5],
          }
        : {}),
    })),
  }))
}
