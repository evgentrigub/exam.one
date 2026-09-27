import type { ExamModule } from '../../types'

const SCORING_NOTE =
  'Raw points, 1 per item. The official result multiplies each module by 1.66 (15 → 25 points).'

/**
 * Goethe-Zertifikat A1: Start Deutsch 1, per the 2024 Modellsatz and the 2025
 * Durchführungsbestimmungen. See `brief.md` for sources and the practice adaptations.
 */
export const goetheDeA1Structure: ExamModule[] = [
  {
    id: 'reading',
    label: 'Reading (Lesen)',
    minutes: 25,
    points: 15,
    summary:
      'Three short tasks: two personal messages, choosing the right web page or advert, and everyday signs.',
    scoringNote: SCORING_NOTE,
    parts: [
      {
        n: 1,
        title: 'Short personal messages',
        format: '5 × Richtig / Falsch',
        short: 'Read two short messages and decide whether 5 statements are correct.',
        goal: 'Understand the key facts in short personal notes and emails.',
        skill: 'Detailed reading of very short texts.',
        itemFormat: 'true-false',
      },
      {
        n: 2,
        title: 'Web pages and adverts',
        format: '5 situations · choose a or b',
        short: 'For each situation, choose which of two short texts has the information you need.',
        goal: 'Find where specific information is, in short everyday texts.',
        skill: 'Selective reading.',
        itemFormat: 'selection',
      },
      {
        n: 3,
        title: 'Signs and notices',
        format: '5 × Richtig / Falsch',
        short: 'Read five signs and notices and decide whether each statement is correct.',
        goal: 'Understand public signs, notices and short instructions.',
        skill: 'Reading everyday signs.',
        itemFormat: 'true-false',
      },
    ],
  },
  {
    id: 'listening',
    label: 'Listening (Hören)',
    minutes: 20,
    points: 15,
    summary: 'Short conversations, public announcements and telephone messages — one question each.',
    scoringNote: SCORING_NOTE,
    parts: [
      {
        n: 1,
        title: 'Short conversations',
        format: '6 × multiple choice (a · b · c) · played twice',
        short: 'Six short everyday conversations, one a/b/c question each.',
        goal: 'Catch a number, time, price or place in a short conversation.',
        skill: 'Listening for specific information.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Public announcements',
        format: '4 × Richtig / Falsch · played once',
        short: 'Four announcements at a station, airport or shop — is the statement correct?',
        goal: 'Understand the key message of a public announcement.',
        skill: 'True / false judgement.',
        itemFormat: 'true-false',
      },
      {
        n: 3,
        title: 'Telephone messages',
        format: '5 × multiple choice (a · b · c) · played twice',
        short: 'Five answering-machine messages, one a/b/c question each.',
        goal: 'Note down the important detail of a telephone message.',
        skill: 'Listening for specific information.',
        itemFormat: 'selection',
      },
    ],
  },
  {
    id: 'writing',
    label: 'Writing (Schreiben)',
    minutes: 20,
    points: 15,
    summary: 'Fill in five missing entries in a form, then write a short message of about 30 words.',
    scoringNote: 'Form: 1 point per entry. Message: 3 per content point + 1 for greeting and closing.',
    parts: [
      {
        n: 1,
        title: 'Fill in a form',
        format: '5 missing entries',
        short: 'Read about a friend and fill in the five missing entries in a form.',
        goal: 'Complete a form with simple personal information.',
        skill: 'Filling in forms.',
        itemFormat: 'freeform',
        layout: 'form-fill',
        available: false,
      },
      {
        n: 2,
        title: 'Short message',
        format: 'About 30 words · 3 content points',
        short: 'Write a short message with a greeting, three content points and a closing.',
        goal: 'Write a short personal or semi-formal message.',
        skill: 'Short everyday writing.',
        itemFormat: 'freeform',
        available: false,
      },
    ],
  },
  {
    id: 'speaking',
    label: 'Speaking (Sprechen)',
    minutes: 15,
    points: 15,
    summary:
      'Introduce yourself, ask and answer questions on two topics, and make and answer requests.',
    scoringNote: 'Direct points 3 + 6 + 6 = 15 (the official result multiplies by 1.66).',
    parts: [
      {
        n: 1,
        title: 'Introduce yourself',
        format: 'Keywords · spell a word · say a number (3 pts)',
        short: 'Introduce yourself using the keywords, then spell a word and say a number.',
        goal: 'Give basic information about yourself.',
        skill: 'Simple personal presentation.',
        itemFormat: 'recording',
        available: false,
      },
      {
        n: 2,
        title: 'Ask and answer',
        format: 'Word cards on 2 topics (6 pts)',
        short: 'Ask a question from a word card, then answer your partner’s question.',
        goal: 'Ask for and give simple information on everyday topics.',
        skill: 'Asking & answering questions.',
        itemFormat: 'recording',
        layout: 'word-cards',
        available: false,
      },
      {
        n: 3,
        title: 'Requests',
        format: 'Request cards, 2 rounds (6 pts)',
        short: 'Make a polite request from a card, then react to your partner’s request.',
        goal: 'Make everyday requests and respond to them.',
        skill: 'Requests & reactions.',
        itemFormat: 'recording',
        layout: 'request-cards',
        available: false,
      },
    ],
  },
]
