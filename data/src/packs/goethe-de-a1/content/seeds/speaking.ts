import type {
  SpeakingCardsTopic,
  SpeakingKeywordTopic,
} from '../../../goethe-de-a2/content/types/speaking'

/**
 * Original Sprechen A1 seeds, one per Teil, in the Start Deutsch 1 format. Not official tasks.
 * Solo practice: the partner's lines are fixed cues on the cards.
 */
export const speakingA1Seeds: (SpeakingKeywordTopic | SpeakingCardsTopic)[] = [
  {
    id: 'speaking-a1-teil1-001',
    theme: 'Sich vorstellen',
    topicType: 'introduction',
    testingPart: 1,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    keywords: [
      'Name?',
      'Alter?',
      'Land?',
      'Wohnort?',
      'Sprachen?',
      'Beruf?',
      'Hobby?',
      'Buchstabieren Sie Ihren Familiennamen.',
      'Sagen Sie Ihre Telefonnummer.',
    ],
  },
  {
    id: 'speaking-a1-teil2-001',
    theme: 'Essen und Trinken · Freizeit',
    topicType: 'interview',
    testingPart: 2,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    cards: [
      { segment: 'ask1', kind: 'ask', topic: 'Essen und Trinken', cue: 'Frühstück' },
      { segment: 'answer1', kind: 'answer', topic: 'Essen und Trinken', cue: 'Was trinkst du gern?' },
      { segment: 'ask2', kind: 'ask', topic: 'Freizeit', cue: 'Sport' },
      { segment: 'answer2', kind: 'answer', topic: 'Freizeit', cue: 'Was machst du am Sonntag?' },
    ],
  },
  {
    id: 'speaking-a1-teil3-001',
    theme: 'Bitten im Alltag',
    topicType: 'requests',
    testingPart: 3,
    difficulty: 'A1',
    createdAt: '2026-09-27',
    cards: [
      { segment: 'request1', kind: 'request', cue: 'die Tür schließen' },
      { segment: 'response1', kind: 'respond', cue: 'Kannst du mir bitte deinen Kuli geben?' },
      { segment: 'request2', kind: 'request', cue: 'ein Stück Kuchen' },
      { segment: 'response2', kind: 'respond', cue: 'Können Sie bitte langsamer sprechen?' },
    ],
  },
]
