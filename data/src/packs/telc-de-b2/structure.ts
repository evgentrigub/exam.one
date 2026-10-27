import type { RubricCriterion } from '../../runtime'
import type { ModuleDefinition } from './runtime'
import { readingSeeds } from './content/seeds/reading'
import { listeningSeeds } from './content/seeds/listening'
import { writingSeeds } from './content/seeds/writing'
import { speakingSeeds } from './content/seeds/speaking'

export const EXAM_TITLE = 'telc Deutsch B2'
export const EXAM_LANGUAGE = 'German'

/** telc rates each criterion on four bands, A to D. */
const bands =
  (points: number[]) =>
  (id: string, label: string): RubricCriterion => ({
    id,
    label,
    maxPoints: points[0]!,
    allowedPoints: points,
  })
const writingBand = bands([5, 3, 1, 0])
const speakingBand = bands([7, 5, 3, 0])

const TRUE_FALSE_HINT =
  'Every statement has options ["Richtig", "Falsch"]; correctAnswer 0 means the recording confirms it. A "Falsch" statement must contradict the recording, never rely on information that is simply not mentioned.'

const speakingCriteria = [
  speakingBand('expression', 'Ausdrucksfähigkeit'),
  speakingBand('taskCompletion', 'Aufgabenbewältigung'),
  speakingBand('accuracy', 'Formale Richtigkeit'),
]

/** The practice seed of a part; it is also the generator's example. */
const seed = (seeds: Record<string, unknown>[], n: number): Record<string, unknown> =>
  seeds.find(item => item['testingPart'] === n) ?? { testingPart: n }

export const modules: ModuleDefinition[] = [
  {
    id: 'reading',
    minutes: 90,
    tasks: [
      {
        n: 1,
        title: 'Leseverstehen Teil 1 · Globalverstehen',
        itemFormat: 'matching',
        bank: true,
        officialItems: '1–5',
        practiceLabel: 'Leseverstehen 1',
        runtime: {
          minutes: 20,
          maxPoints: 25,
          questionCount: 5,
          optionCount: 10,
          reuseOptions: false,
        },
        seed: seed(readingSeeds, 1),
        hints: [
          'Five short newspaper or magazine texts (80–130 words each) from two subject areas, written in content as paragraphs starting "1 · " to "5 · ". Questions are "Text 1" to "Text 5". The bank holds ten headlines "a · …" to "j · …": five fit one text each, five are plausible distractors that share topic words with a text but miss its main message.',
        ],
      },
      {
        n: 2,
        title: 'Leseverstehen Teil 2 · Detailverstehen',
        itemFormat: 'selection',
        officialItems: '6–10',
        practiceLabel: 'Leseverstehen 2',
        runtime: { minutes: 25, maxPoints: 25, questionCount: 5, optionCount: 3 },
        seed: seed(readingSeeds, 2),
        hints: [
          'One popular-science or general-interest article of 500–650 words (or two related shorter articles under clear headings). Five questions in text order, each with three options a/b/c and exactly one correct option; distractors restate details from the text with a change in meaning.',
        ],
      },
      {
        n: 3,
        title: 'Leseverstehen Teil 3 · Selektives Verstehen',
        itemFormat: 'matching',
        bank: true,
        officialItems: '11–20',
        practiceLabel: 'Leseverstehen 3',
        runtime: {
          minutes: 25,
          maxPoints: 25,
          questionCount: 10,
          optionCount: 13,
          reuseOptions: false,
          repeatableOptions: [12],
        },
        seed: seed(readingSeeds, 3),
        hints: [
          'Ten situations (one sentence each, a person and a need) and twelve short advertisements or information texts (40–70 words) written in content as paragraphs starting "a · " to "l · ". The bank is "a · <short ad name>" … "l · <short ad name>" followed by "x · Keine passende Anzeige". Each advertisement fits at most one situation; one to three situations have no match (correctAnswer 12). Make near misses: an advertisement on the right topic that fails one condition (time, price, place, target group).',
        ],
      },
      {
        n: 4,
        title: 'Sprachbausteine Teil 1',
        itemFormat: 'selection',
        gaps: true,
        officialItems: '21–30',
        practiceLabel: 'Sprachbausteine 1',
        runtime: { minutes: 10, maxPoints: 15, questionCount: 10, optionCount: 3 },
        seed: seed(readingSeeds, 4),
        hints: [
          'A semi-formal or informal letter or e-mail of 180–230 words with ten numbered gaps testing grammar: connectors, prepositions, pronouns and articles, verb forms, word order, reflexive verbs, relative pronouns. Each gap has three options a/b/c that are the same word class; only one is grammatically correct in context. Questions are "Lücke 1" to "Lücke 10".',
        ],
      },
      {
        n: 5,
        title: 'Sprachbausteine Teil 2',
        itemFormat: 'matching',
        gaps: true,
        bank: true,
        officialItems: '31–40',
        practiceLabel: 'Sprachbausteine 2',
        runtime: {
          minutes: 10,
          maxPoints: 15,
          questionCount: 10,
          optionCount: 15,
          reuseOptions: false,
        },
        seed: seed(readingSeeds, 5),
        hints: [
          'A newspaper or magazine article of 180–240 words with ten numbered gaps testing vocabulary and fixed expressions. The bank holds fifteen single words without letter prefixes, in alphabetical order: ten fit one gap each, five are distractors. Questions are "Lücke 1" to "Lücke 10".',
        ],
      },
    ],
  },
  {
    id: 'listening',
    minutes: 20,
    tasks: [
      {
        n: 1,
        title: 'Hörverstehen Teil 1 · Globalverstehen',
        itemFormat: 'true-false',
        officialItems: '41–45',
        practiceLabel: 'Hörverstehen 1',
        practiceType: 'news',
        runtime: {
          minutes: 6,
          maxPoints: 25,
          questionCount: 5,
          optionCount: 2,
          replays: 1,
          previewSeconds: 30,
        },
        seed: seed(listeningSeeds, 1),
        hints: [
          'A radio news bulletin read by one newsreader: six short reports on different topics, about 600 words in total. Five statements test the main point of five reports in order; one report has no statement.',
          TRUE_FALSE_HINT,
        ],
      },
      {
        n: 2,
        title: 'Hörverstehen Teil 2 · Detailverstehen',
        itemFormat: 'true-false',
        officialItems: '46–55',
        practiceLabel: 'Hörverstehen 2',
        practiceType: 'interview',
        runtime: {
          minutes: 9,
          maxPoints: 25,
          questionCount: 10,
          optionCount: 2,
          replays: 1,
          previewSeconds: 60,
        },
        seed: seed(listeningSeeds, 2),
        hints: [
          'A radio interview of about 900 words between a presenter and one guest, with every turn labelled "Moderatorin:" or "Moderator:" and the guest\'s name (for example "Herr Kraus:"). Ten statements test details and opinions in the order they occur.',
          TRUE_FALSE_HINT,
        ],
      },
      {
        n: 3,
        title: 'Hörverstehen Teil 3 · Selektives Verstehen',
        itemFormat: 'true-false',
        officialItems: '56–60',
        practiceLabel: 'Hörverstehen 3',
        practiceType: 'recordings',
        runtime: {
          minutes: 5,
          maxPoints: 25,
          questionCount: 5,
          optionCount: 2,
          replays: 1,
        },
        seed: seed(listeningSeeds, 3),
        hints: [
          'Five separate short recordings (60–110 words each): station or airport announcements, voicemails, radio service notes or recorded phone menus. Use items[] with id, context, transcript, question, options, correctAnswer and explanation; each transcript starts with the context sentence (for example "Sie hören eine Nachricht auf dem Anrufbeantworter."). One statement per recording tests a specific detail (time, place, change, what to do).',
          TRUE_FALSE_HINT,
        ],
      },
    ],
  },
  {
    id: 'writing',
    minutes: 30,
    tasks: [
      {
        n: 1,
        title: 'Schriftlicher Ausdruck · Halbformelle E-Mail',
        itemFormat: 'freeform',
        officialItems: 'Aufgabe A/B',
        practiceLabel: 'Schreiben',
        runtime: {
          minutes: 30,
          maxPoints: 15,
          multiplier: 3,
          wordCountGuidanceOnly: true,
          fields: [{ id: 'answer', label: 'Ihre E-Mail', minWords: 150, maxWords: 220 }],
          criteria: [
            writingBand('taskCompletion', 'Aufgabenbewältigung'),
            writingBand('communicativeDesign', 'Kommunikative Gestaltung'),
            writingBand('accuracy', 'Formale Richtigkeit'),
          ],
        },
        seed: seed(writingSeeds, 1),
        hints: [
          'A semi-formal e-mail of at least 150 words that answers an advertisement or notice. Aufgabe A asks for information; Aufgabe B is a complaint. The candidate covers three of the four Leitpunkte, or two plus an aspect of their own, in a sensible order, with a Betreff, Anrede, introduction and closing.',
        ],
      },
    ],
  },
  {
    id: 'speaking',
    minutes: 15,
    tasks: [
      {
        n: 1,
        title: 'Über Erfahrungen sprechen',
        itemFormat: 'recording',
        layout: 'word-cards',
        practiceLabel: 'Sprechen 1',
        runtime: {
          minutes: 6,
          maxPoints: 21,
          criteria: speakingCriteria,
          segments: [
            { id: 'present', label: 'Report', maxSeconds: 90 },
            { id: 'answer1', label: 'Answer 1', maxSeconds: 60 },
            { id: 'answer2', label: 'Answer 2', maxSeconds: 60 },
            { id: 'ask', label: 'Question to partner', maxSeconds: 60 },
          ],
        },
        seed: seed(speakingSeeds, 1),
        hints: [
          "Seven topicOptions with ids topic1 … topic7 for the seven fixed telc topics: a book, a film, a trip, a music event, a sports event, an important person, an important experience. In each option the first card asks for a report of up to 1½ minutes on a personal experience; two partner follow-up questions follow; the last card summarises the partner's own short report in two or three sentences and asks the learner to react and ask one or two questions.",
        ],
      },
      {
        n: 2,
        title: 'Diskussion',
        itemFormat: 'recording',
        layout: 'word-cards',
        practiceLabel: 'Sprechen 2',
        runtime: {
          minutes: 6,
          maxPoints: 21,
          criteria: speakingCriteria,
          segments: [
            { id: 'summary', label: 'Summary', maxSeconds: 60 },
            { id: 'turn1', label: 'Turn 1', maxSeconds: 90 },
            { id: 'turn2', label: 'Turn 2', maxSeconds: 90 },
            { id: 'turn3', label: 'Turn 3', maxSeconds: 90 },
          ],
        },
        seed: seed(speakingSeeds, 2),
        hints: [
          "A stimulus newspaper text of 180–300 words on a controversial everyday topic, giving arguments for and against. The first card asks for a summary of the arguments in at most one minute; three partner lines then disagree, ask about experience in the learner's country and propose a compromise.",
        ],
      },
      {
        n: 3,
        title: 'Gemeinsam etwas planen',
        itemFormat: 'recording',
        layout: 'word-cards',
        practiceLabel: 'Sprechen 3',
        runtime: {
          minutes: 6,
          maxPoints: 21,
          criteria: speakingCriteria,
          segments: [1, 2, 3, 4].map(i => ({ id: `turn${i}`, label: `Turn ${i}`, maxSeconds: 75 })),
        },
        seed: seed(speakingSeeds, 3),
        hints: [
          'A planning situation as a short stimulus text (40–120 words, title "Situation") with four or five points to agree on. The first card asks the learner to open the planning with proposals; three partner lines react, raise a problem and ask to summarise the agreed plan.',
        ],
      },
    ],
  },
]
