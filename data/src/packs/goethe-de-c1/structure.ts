import type { ModuleDefinition, TaskDefinition } from './runtime'
import type { RubricCriterion } from '../../runtime'
import { readingSeeds } from './content/seeds/reading'
import { listeningSeeds } from './content/seeds/listening'
import { writingSeeds } from './content/seeds/writing'
import { speakingSeeds } from './content/seeds/speaking'
export const EXAM_TITLE = 'Goethe-Zertifikat C1'
export const EXAM_LANGUAGE = 'German'
const criteria = (maxima: number[], bands = false): RubricCriterion[] =>
  ['taskCompletion', 'coherence', 'vocabulary', 'structures', 'interactiveCommunication']
    .slice(0, maxima.length)
    .map((id, i) => ({
      id,
      label: ['Erfüllung', 'Kohärenz', 'Wortschatz', 'Strukturen', 'Reaktion und Rückfragen'][i]!,
      maxPoints: maxima[i]!,
      ...(bands ? { allowedPoints: [1, 0.75, 0.5, 0.25, 0].map(f => f * maxima[i]!) } : {}),
    }))
const objective = (
  n: number,
  title: string,
  count: number,
  options: number,
  seed: Record<string, unknown>,
  extra: Partial<TaskDefinition> = {}
): TaskDefinition => ({
  n,
  title,
  itemFormat: 'selection',
  runtime: {
    minutes: 15,
    maxPoints: count,
    questionCount: count,
    optionCount: options,
    multiplier: 1,
  },
  seed,
  hints: [],
  ...extra,
})
export const modules: ModuleDefinition[] = [
  {
    id: 'reading',
    label: 'Reading',
    minutes: 65,
    summary: 'Choice gaps, comprehension, sentence insertion and expert opinions.',
    scoringNote:
      '30 raw marks; mock conversion rounds raw × 100/30, each module passes independently at 60.',
    tasks: [
      objective(1, 'Wortlücken', 8, 4, readingSeeds[0]!, {
        gaps: true,
        hints: ['Eight four-option lexical/grammatical gaps in a coherent C1 article.'],
      }),
      objective(2, 'Artikel verstehen', 7, 3, readingSeeds[1]!, {
        hints: ['Seven three-option questions on detailed comprehension, argument and inference.'],
      }),
      objective(3, 'Sätze einsetzen', 8, 10, readingSeeds[2]!, {
        itemFormat: 'matching',
        bank: true,
        gaps: true,
        runtime: {
          minutes: 20,
          maxPoints: 8,
          questionCount: 8,
          optionCount: 10,
          reuseOptions: false,
        },
        hints: [
          'Eight sentence gaps; ten sentences in one ordered bank, two distractors; no reuse.',
        ],
      }),
      objective(4, 'Expertenmeinungen', 7, 4, readingSeeds[3]!, {
        itemFormat: 'matching',
        bank: true,
        hints: [
          'Three distinct expert opinions; seven statements matched to A/B/C/x, exactly two x answers; matches may repeat.',
        ],
      }),
    ],
  },
  {
    id: 'listening',
    label: 'Listening',
    minutes: 40,
    summary: 'Podcast, interview, four-section discussion and lecture.',
    scoringNote: '30 raw marks. Parts 1/3 once, Parts 2/4 twice; separate section recordings.',
    tasks: [
      ...[6, 9, 8, 7].map((count, index) => {
        const n = index + 1
        const task = objective(
          n,
          ['Podcast', 'Interview', 'Diskussion', 'Vortrag'][index]!,
          count,
          3,
          listeningSeeds[index]!
        )
        task.runtime = {
          ...task.runtime,
          minutes: 10,
          replays: n === 1 || n === 3 ? 1 : 2,
          previewSeconds: n === 3 ? 30 : n === 4 ? 90 : 60,
        }
        task.hints = [
          n === 1
            ? 'Six statements matched to three podcast subjects; repeat matches.'
            : n === 2
              ? 'Nine selections: stimmt / stimmt nicht / dazu wird nichts gesagt; do not infer unstated facts.'
              : n === 3
                ? 'Four labelled multi-speaker discussion sections with stable IDs section1..section4, each referencing exactly two question IDs. Provide sections[].transcript and questionIds; no shared or per-question transcript.'
                : 'Seven three-option questions on a sustained lecture, its argument and detail.',
        ]
        if (n === 1) {
          task.itemFormat = 'matching'
          task.bank = true
        }
        return task
      }),
    ],
  },
  {
    id: 'writing',
    label: 'Writing',
    minutes: 75,
    summary: 'Forum argument and formal/semi-formal message.',
    scoringNote:
      'Task 1 /60 plus Task 2 /40. Discrete A–E bands; task zero below half length or with Erfüllung zero.',
    tasks: [1, 2].map(n => ({
      n,
      title: n === 1 ? 'Forumsbeitrag' : 'Formelle Nachricht',
      itemFormat: 'freeform',
      seed: writingSeeds[n - 1]!,
      hints: [
        n === 1
          ? 'About 230 words, four communicative functions, neutral argumentative forum register, 50 minutes.'
          : 'About 120 words, four communicative functions, recipient-appropriate formal/semi-formal message, 25 minutes.',
      ],
      runtime: {
        minutes: n === 1 ? 50 : 25,
        maxPoints: n === 1 ? 60 : 40,
        multiplier: 1,
        zeroCriterion: 'taskCompletion',
        wordCountGuidanceOnly: true,
        fields: [
          {
            id: 'answer',
            label: 'Your text',
            minWords: n === 1 ? 230 : 120,
            maxWords: n === 1 ? 260 : 150,
            zeroBelowWords: n === 1 ? 115 : 60,
          },
        ],
        criteria: criteria(n === 1 ? [14, 14, 16, 16] : [10, 10, 10, 10], true),
      },
    })),
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 20,
    summary:
      'Two-topic presentation, questions and guided discussion; mock preparation 20 minutes.',
    scoringNote:
      'Five transcript-visible /5 criteria per part; provisional /50 normalized to /100. No pronunciation or acoustic fluency assessment.',
    tasks: [
      {
        n: 1,
        title: 'Präsentation und Fragen',
        itemFormat: 'recording',
        layout: 'word-cards',
        seed: speakingSeeds[0]!,
        hints: [
          'Two topicOptions with stable IDs topic1/topic2 and self-contained cards; first is a five-minute presentation, followed by two prepared questions and a reciprocal question about a supplied partner presentation.',
        ],
        runtime: {
          minutes: 10,
          maxPoints: 25,
          criteria: criteria([5, 5, 5, 5, 5]),
          segments: [
            { id: 'presentation', label: 'Presentation', maxSeconds: 300 },
            { id: 'followup1', label: 'Follow-up 1', maxSeconds: 60 },
            { id: 'followup2', label: 'Follow-up 2', maxSeconds: 60 },
            { id: 'reciprocal', label: 'Question to partner', maxSeconds: 60 },
          ],
        },
      },
      {
        n: 2,
        title: 'Geleitete Diskussion',
        itemFormat: 'recording',
        layout: 'word-cards',
        seed: speakingSeeds[1]!,
        hints: [
          'Four prepared partner cues elicit a position, response to an objection, evaluation and a jointly framed conclusion; this is a guided solo simulation.',
        ],
        runtime: {
          minutes: 10,
          maxPoints: 25,
          criteria: criteria([5, 5, 5, 5, 5]),
          segments: [1, 2, 3, 4].map(i => ({ id: `turn${i}`, label: `Turn ${i}`, maxSeconds: 90 })),
        },
      },
    ],
  },
]
