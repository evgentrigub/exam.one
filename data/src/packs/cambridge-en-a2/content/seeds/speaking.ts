import type { SpeakingCardsTopic } from '../../../goethe-de-a2/content/types/speaking'

/**
 * Original A2 Key speaking seeds, one per part, in the 2020 format. Not official tasks.
 * Solo practice: the examiner's questions are fixed `answer` cards marked `speaker: 'examiner'`,
 * and part 2 adds one question the learner asks their partner. The five pictures of part 2
 * are named in words, in the first card and in `pictures`.
 */
export const speakingKeySeeds: (SpeakingCardsTopic & { pictures?: string[] })[] = [
  {
    id: 'speaking-key-part1-001',
    theme: 'About you · Food',
    topicType: 'interview',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    cards: [
      {
        segment: 'personal1',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'About you',
        cue: 'Where do you live?',
      },
      {
        segment: 'personal2',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'About you',
        cue: 'Do you work or are you a student?',
      },
      {
        segment: 'topic1',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Food',
        cue: 'What do you usually eat for breakfast?',
      },
      {
        segment: 'topic2',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Food',
        cue: 'Where do you like to go for a meal with your friends?',
      },
      {
        segment: 'extended',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Food',
        cue: 'Please tell me something about your favourite food.',
      },
    ],
  },
  {
    id: 'speaking-key-part2-001',
    theme: 'Free-time activities',
    topicType: 'discussion',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    pictures: [
      'reading a book',
      'playing football',
      'cooking',
      'playing video games',
      'going to the cinema',
    ],
    cards: [
      {
        segment: 'opinion',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Free-time activities',
        cue: 'Here are some free-time activities: reading a book, playing football, cooking, playing video games and going to the cinema. Do you like these different activities? Say why or why not.',
      },
      {
        segment: 'askPartner',
        kind: 'ask',
        topic: 'Free-time activities',
        cue: 'favourite activity?',
      },
      {
        segment: 'followUp',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Free-time activities',
        cue: 'Do you think cooking is difficult? Why? Why not?',
      },
      {
        segment: 'favourite',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Free-time activities',
        cue: 'Which of these activities do you like best?',
      },
      {
        segment: 'preference',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Free-time activities',
        cue: 'Do you prefer spending your free time at home or outside? Why?',
      },
    ],
  },
]

/** Dedicated mock-exam Set 1 interview and discussion. Original, not official; `examOnly`. */
export const mockSpeakingKeySeeds: (SpeakingCardsTopic & {
  pictures?: string[]
  examOnly?: boolean
})[] = [
  {
    id: 'mock-key-set1-speaking-part1',
    theme: 'About you · Weekends',
    topicType: 'interview',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    cards: [
      {
        segment: 'personal1',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'About you',
        cue: 'Where are you from?',
      },
      {
        segment: 'personal2',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'About you',
        cue: 'What do you study or what is your job?',
      },
      {
        segment: 'topic1',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Weekends',
        cue: 'What time do you get up on Saturdays?',
      },
      {
        segment: 'topic2',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Weekends',
        cue: 'Who do you usually spend your weekends with?',
      },
      {
        segment: 'extended',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Weekends',
        cue: 'Please tell me something about what you did last weekend.',
      },
    ],
  },
  {
    id: 'mock-key-set1-speaking-part2',
    theme: 'Holidays',
    topicType: 'discussion',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    pictures: [
      'a beach holiday',
      'a camping trip',
      'a city break',
      'a skiing holiday',
      'a boat trip',
    ],
    cards: [
      {
        segment: 'opinion',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Holidays',
        cue: 'Here are some different holidays: a beach holiday, a camping trip, a city break, a skiing holiday and a boat trip. Do you like these different holidays? Say why or why not.',
      },
      { segment: 'askPartner', kind: 'ask', topic: 'Holidays', cue: 'best holiday?' },
      {
        segment: 'followUp',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Holidays',
        cue: 'Do you think a camping trip is fun? Why? Why not?',
      },
      {
        segment: 'favourite',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Holidays',
        cue: 'Which of these holidays do you like best?',
      },
      {
        segment: 'preference',
        kind: 'answer',
        speaker: 'examiner',
        topic: 'Holidays',
        cue: 'Do you prefer going on holiday with your family or with friends? Why?',
      },
    ],
  },
]
