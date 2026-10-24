import type { ExamModule } from '../../types'

const listeningInstructions = {
  1: 'Listen to each short conversation and choose the correct answer. In the exam you hear each recording twice.',
  2: 'Listen to the talk and complete the notes. Write one word, a number, a date or a time in each gap. Spell names you hear spelled out exactly.',
  3: 'Listen to the conversation and choose the correct answer to each question. In the exam you hear it twice.',
  4: 'Listen to each short recording and choose the correct answer. In the exam you hear each recording twice.',
  5: 'Listen to the conversation and choose the right option for each person. Three options are not used.',
} as const

/** Session and catalog chrome, in the slots the listening screen reads (see `ExamPart`). */
const listeningChrome = {
  1: { practiceSubtitle: 'Short conversations', practiceType: 'dialog', practiceMinutes: 6, practiceTimerSec: 360 },
  2: { practiceSubtitle: 'Complete the notes', practiceType: 'notes', practiceMinutes: 6, practiceTimerSec: 360 },
  3: { practiceSubtitle: 'Longer conversation', practiceType: 'conversation', practiceMinutes: 6, practiceTimerSec: 360 },
  4: { practiceSubtitle: 'Short recordings', practiceType: 'recordings', practiceMinutes: 6, practiceTimerSec: 360 },
  5: { practiceSubtitle: 'Matching', practiceType: 'matching', practiceMinutes: 6, practiceTimerSec: 360 },
} as const

const writingTips = {
  1: [
    'Answer all three points – each one you leave out costs Content marks.',
    'Start and end like a real email or note: "Hi Alex," … "See you soon, Sam".',
    'Join your ideas with simple linkers such as and, but, because and so.',
    'Write 25 words or more; short, correct sentences are better than long, confusing ones.',
  ],
  2: [
    'Write about all three pictures, in order – say what happens in each one.',
    'Use the past simple for the story: went, saw, was, started to laugh.',
    'Connect the events with then, after that, suddenly and in the end.',
    'Write 35 words or more and give the people a name to make the story clear.',
  ],
} as const

const speakingCopy = {
  1: {
    sessionTitle: 'Interview',
    practiceMinutes: 4,
    instruction:
      'The examiner asks you five questions. Record one answer for each: short answers for the first four, and two or three sentences for the last one.',
    phrases: ['I live in …', 'I’m a student at …', 'I work as a …', 'I usually …', 'I really like … because …', 'My favourite … is …'],
  },
  2: {
    sessionTitle: 'Discussion',
    practiceMinutes: 6,
    instruction:
      'In the exam you talk with a partner about some pictures. Here, say what you think about each activity, ask your partner one question, then answer the examiner’s questions. Record each turn separately and give reasons.',
    phrases: ['I like … because …', 'I don’t really like … It’s too …', 'What about you?', 'Do you like …?', 'I think … is more interesting than …', 'I prefer … because …'],
  },
} as const

/** Attach the labels and coach copy the practice screens show. */
export function withPracticeCopy(modules: ExamModule[]): ExamModule[] {
  return modules.map(module => ({
    ...module,
    parts: module.parts.map(part => ({
      ...part,
      practiceLabel: `Part ${part.n}`,
      ...(module.id === 'writing' ? { tips: writingTips[part.n as 1 | 2] } : {}),
      ...(module.id === 'speaking' ? speakingCopy[part.n as 1 | 2] : {}),
      ...(module.id === 'listening'
        ? {
            instruction: listeningInstructions[part.n as 1 | 2 | 3 | 4 | 5],
            ...listeningChrome[part.n as 1 | 2 | 3 | 4 | 5],
          }
        : {}),
    })),
  }))
}
