import type { ExamModule } from '../../types'

const readingChrome = {
  1: { practiceType: 'email' },
  2: { practiceType: 'advertisement' },
  3: { practiceType: 'matching' },
  4: { practiceType: 'story' },
} as const

const listeningInstructions = {
  1: 'Listen to six short conversations and choose the right answer for each. In the exam the options are pictures; here they are short texts. You hear each conversation twice.',
  2: 'Listen to six short pieces from the radio and choose the right answer for each. You hear each piece twice.',
  3: 'Listen to a conversation between two friends. For each statement decide who says it: the man, the woman, or neither of them (Ninguno de los dos).',
  4: 'Listen to seven short messages and announcements and choose the statement that matches each one. Three statements are not used.',
} as const

/** Session and catalog chrome, in the slots the listening screen reads (see `ExamPart`). */
const listeningChrome = {
  1: {
    practiceSubtitle: 'Conversaciones breves',
    practiceType: 'dialog',
    practiceMinutes: 10,
    practiceTimerSec: 600,
  },
  2: {
    practiceSubtitle: 'Noticias y anuncios de radio',
    practiceType: 'announcement',
    practiceMinutes: 10,
    practiceTimerSec: 600,
  },
  3: {
    practiceSubtitle: '¿Quién lo dice?',
    practiceType: 'conversation',
    practiceMinutes: 10,
    practiceTimerSec: 600,
  },
  4: {
    practiceSubtitle: 'Mensajes y avisos',
    practiceType: 'voicemail',
    practiceMinutes: 10,
    practiceTimerSec: 600,
  },
} as const

const writingChrome = {
  1: { practiceType: 'email' },
  2: { practiceType: 'post' },
} as const

const writingTips = {
  1: [
    'Answer every point of the task – each one you leave out costs task-completion marks.',
    'Open and close like a real message: "¡Hola, Marta!" / "Querido Pablo:" … "Un abrazo," / "Besos,".',
    'Use the pretérito indefinido for what you did ("Ayer fui…") and ir a + infinitive for plans ("Voy a…").',
    'Propose something concretely: "¿Quedamos el sábado a las seis en la plaza?".',
    'Keep to 60–70 words and count them before you submit.',
  ],
  2: [
    'Write about every point, in order, with one or two sentences each.',
    'Join your sentences with y, pero, porque, cuando, después and al final.',
    'Past events: pretérito indefinido ("En 2019 viajé…"); descriptions and habits in the past: imperfecto ("Era un pueblo pequeño…").',
    'Opción B gives you information instead of photos: turn every fact into a sentence of your own.',
    'Aim for 70–80 words.',
  ],
} as const

const speakingCopy = {
  1: {
    sessionTitle: 'Presentación',
    practiceType: 'monologue',
    instruction:
      'In the exam you choose one of two topics and talk about it for 2–3 minutes, without interruption. Cover all five points on the card. You may prepare notes, but do not read them out.',
    phrases: [
      'Voy a hablar de …',
      'Para mí, lo más importante es …',
      'Normalmente …',
      'El año pasado …',
      'Lo que más me gusta es …',
      'Para terminar, …',
    ],
  },
  2: {
    sessionTitle: 'Descripción de una escena',
    practiceType: 'photo',
    instruction:
      'In the exam you describe a photo for 2–3 minutes. Here the scene is described in words. Describe the people, the place, what they are doing and how they feel, with the help of the five guide questions.',
    phrases: [
      'En la escena hay …',
      'Parece que …',
      'Está/Están + gerundio (hablando, comiendo) …',
      'A la derecha / a la izquierda …',
      'Creo que se sienten …',
      'Antes / después, seguramente …',
    ],
  },
  3: {
    sessionTitle: 'Conversación con el examinador',
    practiceType: 'roleplay',
    instruction:
      'In the exam you act out a situation from the scene with the examiner for 3–4 minutes. Here the examiner’s lines are fixed cards: answer each one, and ask the question on your own card. Record each turn separately.',
    phrases: [
      'Buenos días, quería …',
      '¿Cuánto cuesta …?',
      '¿Tiene …?',
      'Prefiero …',
      'Vale, perfecto.',
      'Muchas gracias, adiós.',
    ],
  },
} as const

/** Attach the labels and coach copy the practice screens show. */
export function withPracticeCopy(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => ({
      ...part,
      practiceLabel: `Tarea ${part.n}`,
      ...(module.id === 'reading' ? readingChrome[part.n as 1 | 2 | 3 | 4] : {}),
      ...(module.id === 'writing'
        ? { tips: writingTips[part.n as 1 | 2], ...writingChrome[part.n as 1 | 2] }
        : {}),
      ...(module.id === 'speaking' ? speakingCopy[part.n as 1 | 2 | 3] : {}),
      ...(module.id === 'listening'
        ? {
            instruction: listeningInstructions[part.n as 1 | 2 | 3 | 4],
            ...listeningChrome[part.n as 1 | 2 | 3 | 4],
          }
        : {}),
    })),
  }))
}
