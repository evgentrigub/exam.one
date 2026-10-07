import type { ModuleDefinition } from './runtime'
export const EXAM_TITLE = 'Cambridge B1 Preliminary'
export const EXAM_LANGUAGE = 'English'
import { readingSeeds } from './content/seeds/reading'
import { listeningSeeds } from './content/seeds/listening'
import { writingSeeds } from './content/seeds/writing'
import { speakingSeeds } from './content/seeds/speaking'

const seeds = {
  reading: readingSeeds,
  listening: listeningSeeds,
  writing: writingSeeds,
  speaking: speakingSeeds,
}
function seed(skill: keyof typeof seeds, n: number): Record<string, unknown> {
  const found = seeds[skill].find(payload => payload['testingPart'] === n)
  if (!found) throw new Error(`Missing ${skill} seed for Part ${n}`)
  return found
}

export const modules: ModuleDefinition[] = [
  {
    id: 'reading',
    label: 'Reading',
    minutes: 45,
    tasks: [
      {
        n: 1,
        title: 'Short notices and messages',
        itemFormat: 'selection',
        runtime: {
          minutes: 7,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 1),
        hints: [
          '5 short real-world texts; three choices per question.',
          'Identify the intended message, instruction or purpose rather than matching isolated words.',
        ],
      },
      {
        n: 2,
        title: 'Matching people to activities',
        itemFormat: 'matching',
        runtime: {
          minutes: 8,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 8,
          reuseOptions: false,
        },
        seed: seed('reading', 2),
        hints: [
          '5 people matched to 8 short texts, with 3 unused options.',
          'Make each person require two or more specific features; an option fits only when all features agree.',
        ],
        bank: true,
      },
      {
        n: 3,
        title: 'A repair café',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 4,
        },
        seed: seed('reading', 3),
        hints: [
          '5 questions, four choices each, on one extended B1 article.',
          'Test detail, inference, writer attitude and global meaning; use a 400–500-word text.',
        ],
      },
      {
        n: 4,
        title: 'A different journey',
        itemFormat: 'matching',
        runtime: {
          minutes: 8,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 8,
          reuseOptions: false,
        },
        seed: seed('reading', 4),
        hints: [
          '5 removed sentences and 8 options; use each correct sentence once.',
          'Include cohesive references and narrative progression that make each placement uniquely defensible.',
        ],
        bank: true,
        gaps: true,
      },
      {
        n: 5,
        title: 'Learning to grow food',
        itemFormat: 'selection',
        runtime: {
          minutes: 7,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 4,
        },
        seed: seed('reading', 5),
        hints: [
          '6 vocabulary gaps with four choices per gap.',
          'Use collocations and meaning in a coherent short B1 text.',
        ],
        gaps: true,
      },
      {
        n: 6,
        title: 'A letter about volunteering',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 7,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
        },
        seed: seed('reading', 6),
        hints: [
          '6 open cloze gaps; exactly one word per gap.',
          'Use B1 grammar words such as relatives, prepositions, conjunctions and comparative links.',
        ],
        oneWord: true,
      },
    ],
    summary:
      'Six parts: notices, matching, article comprehension, gapped sentences, vocabulary cloze and open cloze.',
    scoringNote:
      '32 raw marks, one per answer. No Cambridge English Scale conversion in this practice pack.',
  },
  {
    id: 'writing',
    label: 'Writing',
    minutes: 45,
    tasks: [
      {
        n: 1,
        title: 'Reply to an email',
        itemFormat: 'freeform',
        runtime: {
          minutes: 22,
          maxPoints: 20,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 90,
              maxWords: 110,
            },
          ],
          criteria: [
            {
              id: 'content',
              label: 'Content',
              maxPoints: 5,
            },
            {
              id: 'communicativeAchievement',
              label: 'Communicative Achievement',
              maxPoints: 5,
            },
            {
              id: 'organisation',
              label: 'Organisation',
              maxPoints: 5,
            },
            {
              id: 'language',
              label: 'Language',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('writing', 1),
        hints: [
          'Reply to a supplied email and four notes, about 100 words.',
          'Judge Content, Communicative Achievement, Organisation and Language on the official 0–5 scales; the 90–110 range is practice guidance, not an official zero rule.',
        ],
      },
      {
        n: 2,
        title: 'Article or story',
        itemFormat: 'freeform',
        runtime: {
          minutes: 23,
          maxPoints: 20,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 90,
              maxWords: 110,
            },
          ],
          criteria: [
            {
              id: 'content',
              label: 'Content',
              maxPoints: 5,
            },
            {
              id: 'communicativeAchievement',
              label: 'Communicative Achievement',
              maxPoints: 5,
            },
            {
              id: 'organisation',
              label: 'Organisation',
              maxPoints: 5,
            },
            {
              id: 'language',
              label: 'Language',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('writing', 2),
        hints: [
          'Assign one article OR one story prompt per exercise; the exam offers a choice of two.',
          'For an article, address the reader and explain reasons. For a story, supply a first sentence the learner must continue and require a connected narrative. About 100 words; practice range 90–110.',
        ],
      },
    ],
    summary: 'Reply to an email, then practise an assigned article or story.',
    scoringNote:
      '20 raw marks per task: Content, Communicative Achievement, Organisation and Language (0–5).',
  },
  {
    id: 'listening',
    label: 'Listening',
    minutes: 30,
    tasks: [
      {
        n: 1,
        title: 'Short conversations: key information',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          replays: 2,
          optionCount: 3,
        },
        seed: seed('listening', 1),
        hints: [
          '7 short recordings with three visual choices represented by concise written descriptions.',
          'Use corrections or changed plans to make the listener identify the final information.',
        ],
        items: true,
        dialogue: true,
      },
      {
        n: 2,
        title: 'Short dialogues: attitudes',
        itemFormat: 'selection',
        runtime: {
          minutes: 7,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 2),
        hints: [
          '6 short dialogues and three choices per item.',
          'Focus on feelings, attitudes, agreement and reasons.',
        ],
        items: true,
        dialogue: true,
      },
      {
        n: 3,
        title: 'Notes about a community festival',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 7,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          replays: 2,
        },
        seed: seed('listening', 3),
        hints: [
          '6 note-completion gaps from a shared monologue.',
          'Answers may be short words, names or numbers; list valid date, time, spelling and number variants.',
        ],
      },
      {
        n: 4,
        title: 'An interview with a bookseller',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 4),
        hints: [
          '6 questions with three choices on one interview.',
          'Use a sustained B1 dialogue testing detail, opinion and attitude.',
        ],
        dialogue: true,
      },
    ],
    summary: 'Four parts and 25 questions; each recording is heard twice.',
    scoringNote:
      '25 raw marks, one per answer. Visual choices use written descriptions in practice.',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 12,
    tasks: [
      {
        n: 1,
        title: 'Interview',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 2,
          maxPoints: 20,
          multiplier: 1,
          segments: [
            {
              id: 'turn1',
              label: 'Turn 1',
            },
            {
              id: 'turn2',
              label: 'Turn 2',
            },
            {
              id: 'turn3',
              label: 'Turn 3',
            },
          ],
          criteria: [
            {
              id: 'grammarVocabulary',
              label: 'Grammar and Vocabulary',
              maxPoints: 5,
            },
            {
              id: 'discourseManagement',
              label: 'Discourse Management',
              maxPoints: 5,
            },
            {
              id: 'interactiveCommunication',
              label: 'Interactive Communication',
              maxPoints: 5,
            },
            {
              id: 'globalAchievement',
              label: 'Global Achievement',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 1),
        hints: [
          'Answer personal and familiar-topic questions, giving reasons and details.',
          'Solo examiner cue cards; transcript-based practice omits pronunciation and uses four equally weighted 0–5 criteria.',
        ],
      },
      {
        n: 2,
        title: 'Extended turn: a community meal',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 3,
          maxPoints: 20,
          multiplier: 1,
          segments: [
            {
              id: 'turn1',
              label: 'Turn 1',
            },
          ],
          criteria: [
            {
              id: 'grammarVocabulary',
              label: 'Grammar and Vocabulary',
              maxPoints: 5,
            },
            {
              id: 'discourseManagement',
              label: 'Discourse Management',
              maxPoints: 5,
            },
            {
              id: 'interactiveCommunication',
              label: 'Interactive Communication',
              maxPoints: 5,
            },
            {
              id: 'globalAchievement',
              label: 'Global Achievement',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 2),
        hints: [
          'Describe one photograph for about one minute; practice supplies a written scene.',
          'Organise the description and distinguish observation from reasonable speculation.',
        ],
      },
      {
        n: 3,
        title: 'Discussion: welcoming a new colleague',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 4,
          maxPoints: 20,
          multiplier: 1,
          segments: [
            {
              id: 'turn1',
              label: 'Turn 1',
            },
            {
              id: 'turn2',
              label: 'Turn 2',
            },
            {
              id: 'turn3',
              label: 'Turn 3',
            },
            {
              id: 'turn4',
              label: 'Turn 4',
            },
          ],
          criteria: [
            {
              id: 'grammarVocabulary',
              label: 'Grammar and Vocabulary',
              maxPoints: 5,
            },
            {
              id: 'discourseManagement',
              label: 'Discourse Management',
              maxPoints: 5,
            },
            {
              id: 'interactiveCommunication',
              label: 'Interactive Communication',
              maxPoints: 5,
            },
            {
              id: 'globalAchievement',
              label: 'Global Achievement',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 3),
        hints: [
          'Make and respond to suggestions, compare alternatives and negotiate agreement.',
          'Fixed partner cues practise language; actual collaborative interaction is not assessed.',
        ],
      },
      {
        n: 4,
        title: 'General conversation: meeting people',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 3,
          maxPoints: 20,
          multiplier: 1,
          segments: [
            {
              id: 'turn1',
              label: 'Turn 1',
            },
            {
              id: 'turn2',
              label: 'Turn 2',
            },
            {
              id: 'turn3',
              label: 'Turn 3',
            },
          ],
          criteria: [
            {
              id: 'grammarVocabulary',
              label: 'Grammar and Vocabulary',
              maxPoints: 5,
            },
            {
              id: 'discourseManagement',
              label: 'Discourse Management',
              maxPoints: 5,
            },
            {
              id: 'interactiveCommunication',
              label: 'Interactive Communication',
              maxPoints: 5,
            },
            {
              id: 'globalAchievement',
              label: 'Global Achievement',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 4),
        hints: [
          'Develop a conversation related to the discussion topic with opinions, experiences and reasons.',
          'Solo follow-up cards; pronunciation and actual examiner interaction remain outside transcript grading.',
        ],
      },
    ],
    summary:
      'Interview, extended turn, discussion and general conversation as solo cue-card practice.',
    scoringNote:
      'Each part has a formative /20 transcript score; pronunciation and real interaction are excluded. This is not the official speaking score.',
  },
]
