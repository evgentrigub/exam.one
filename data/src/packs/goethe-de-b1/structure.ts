import type { ModuleDefinition } from './runtime'
export const EXAM_TITLE = 'Goethe-Zertifikat B1'
export const EXAM_LANGUAGE = 'German'
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
    minutes: 65,
    tasks: [
      {
        n: 1,
        title: 'Teil 1 · Eine persönliche Nachricht',
        itemFormat: 'true-false',
        runtime: {
          minutes: 10,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 2,
        },
        seed: seed('reading', 1),
        hints: [
          '6 true/false items on a personal email or blog, 1 raw mark each.',
          'Use integer 0 for Richtig and 1 for Falsch; test details and paraphrases.',
        ],
      },
      {
        n: 2,
        title: 'Teil 2 · Zwei Zeitungsartikel',
        itemFormat: 'selection',
        runtime: {
          minutes: 20,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 2),
        hints: [
          'Two journalistic texts with 3 three-option questions each, 6 marks total.',
          'Use connected B1 articles; test global meaning, detail and inference.',
        ],
      },
      {
        n: 3,
        title: 'Teil 3 · Situationen und Anzeigen',
        itemFormat: 'matching',
        runtime: {
          minutes: 10,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 11,
        },
        seed: seed('reading', 3),
        hints: [
          '7 situations and 10 advertisements; exactly one situation has no match (x).',
          'Each advertisement is used at most once; x is a distinct final option.',
        ],
        bank: true,
        unmatchedIndex: 10,
      },
      {
        n: 4,
        title: 'Teil 4 · Meinungen zu einem Vorschlag',
        itemFormat: 'true-false',
        runtime: {
          minutes: 15,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 2,
        },
        seed: seed('reading', 4),
        hints: [
          '7 opinions about a proposal; identify whether each person supports it.',
          'Use Ja/Nein options; read the overall stance despite concessions.',
        ],
      },
      {
        n: 5,
        title: 'Teil 5 · Regeln im Gästehaus',
        itemFormat: 'selection',
        runtime: {
          minutes: 10,
          maxPoints: 4,
          questionCount: 4,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 5),
        hints: [
          '4 three-option questions on written instructions or house rules.',
          'Test exact conditions, exceptions and practical obligations.',
        ],
      },
    ],
    summary: 'Five Teile: personal text, articles, advertisements, opinions and instructions.',
    scoringNote:
      '30 raw marks. The official module uses /100, with pass at 60; this pack retains raw objective scores.',
  },
  {
    id: 'listening',
    label: 'Listening',
    minutes: 40,
    tasks: [
      {
        n: 1,
        title: 'Teil 1 · Fünf kurze Aufnahmen',
        itemFormat: 'selection',
        runtime: {
          minutes: 10,
          maxPoints: 10,
          questionCount: 10,
          multiplier: 1,
          replays: 2,
        },
        seed: seed('listening', 1),
        hints: [
          '5 recordings with 2 questions each: true/false then three-option choice, 10 marks.',
          'One shared compilation contains all five recordings; each is heard twice.',
        ],
        optionPattern: [2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
      },
      {
        n: 2,
        title: 'Teil 2 · Ein Rundgang',
        itemFormat: 'selection',
        runtime: {
          minutes: 10,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 3,
          replays: 1,
        },
        seed: seed('listening', 2),
        hints: [
          'One sustained explanation with 5 three-option questions, heard once.',
          'Test practical detail and purpose.',
        ],
      },
      {
        n: 3,
        title: 'Teil 3 · Über einen Kurs sprechen',
        itemFormat: 'true-false',
        runtime: {
          minutes: 10,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 2,
          replays: 1,
        },
        seed: seed('listening', 3),
        hints: [
          'One informal dialogue with 7 true/false items, heard once.',
          'Two labelled speakers; use integer 0/1 answers.',
        ],
        dialogue: true,
      },
      {
        n: 4,
        title: 'Teil 4 · Eine Radiodiskussion',
        itemFormat: 'matching',
        runtime: {
          minutes: 10,
          maxPoints: 8,
          questionCount: 8,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 4),
        hints: [
          '8 statements matched to moderator, guest 1 or guest 2; options may repeat.',
          'A labelled radio discussion heard twice.',
        ],
        bank: true,
        dialogue: true,
      },
    ],
    summary: 'Four Teile with 10,5,7,8 questions. Parts 1 and 4 twice; Parts 2 and 3 once.',
    scoringNote:
      '30 raw marks. Part 1 mixes true/false and three-option choices within one shared compilation.',
  },
  {
    id: 'writing',
    label: 'Writing',
    minutes: 60,
    tasks: [
      {
        n: 1,
        title: 'Aufgabe 1 · Eine persönliche E-Mail',
        itemFormat: 'freeform',
        runtime: {
          minutes: 20,
          maxPoints: 40,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 70,
              maxWords: 90,
              zeroBelowWords: 40,
            },
          ],
          criteria: [
            {
              id: 'taskCompletion',
              label: 'Erfüllung',
              maxPoints: 10,
            },
            {
              id: 'coherence',
              label: 'Kohärenz',
              maxPoints: 10,
            },
            {
              id: 'vocabulary',
              label: 'Wortschatz',
              maxPoints: 10,
            },
            {
              id: 'structures',
              label: 'Strukturen',
              maxPoints: 10,
            },
          ],
        },
        seed: seed('writing', 1),
        hints: [
          'Official writing task 1: personal email, approximately 80 words and three communicative functions; 20 minutes.',
          'Four criteria total /40 (10 each). A response below 40 words or off topic receives zero for the whole task. Practice guidance 70–90 words.',
        ],
      },
      {
        n: 2,
        title: 'Aufgabe 2 · Ein Diskussionsbeitrag',
        itemFormat: 'freeform',
        runtime: {
          minutes: 25,
          maxPoints: 40,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 70,
              maxWords: 90,
              zeroBelowWords: 40,
            },
          ],
          criteria: [
            {
              id: 'taskCompletion',
              label: 'Erfüllung',
              maxPoints: 10,
            },
            {
              id: 'coherence',
              label: 'Kohärenz',
              maxPoints: 10,
            },
            {
              id: 'vocabulary',
              label: 'Wortschatz',
              maxPoints: 10,
            },
            {
              id: 'structures',
              label: 'Strukturen',
              maxPoints: 10,
            },
          ],
        },
        seed: seed('writing', 2),
        hints: [
          'Official writing task 2: online discussion contribution, approximately 80 words; 25 minutes.',
          'Four criteria total /40 (10 each). Below 40 words or off topic: zero throughout. Use connected reasons and an appropriate forum register.',
        ],
      },
      {
        n: 3,
        title: 'Aufgabe 3 · Eine höfliche Nachricht',
        itemFormat: 'freeform',
        runtime: {
          minutes: 15,
          maxPoints: 20,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 35,
              maxWords: 50,
              zeroBelowWords: 20,
            },
          ],
          criteria: [
            {
              id: 'taskCompletion',
              label: 'Erfüllung',
              maxPoints: 4,
            },
            {
              id: 'coherence',
              label: 'Kohärenz',
              maxPoints: 4,
            },
            {
              id: 'vocabulary',
              label: 'Wortschatz',
              maxPoints: 6,
            },
            {
              id: 'structures',
              label: 'Strukturen',
              maxPoints: 6,
            },
          ],
        },
        seed: seed('writing', 3),
        hints: [
          'Official writing task 3: formal short email, approximately 40 words; 15 minutes.',
          'Rubric /20: Erfüllung 4, Kohärenz 4, Wortschatz 6, Strukturen 6. Below 20 words or off topic: zero throughout. Practice guidance 35–50.',
        ],
      },
    ],
    summary:
      'Personal email, forum opinion and formal short email; all three task numbers retained.',
    scoringNote:
      'Official rubric allocations /40, /40 and /20 total /100. Scores are formative AI estimates; no module pass result is issued.',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 15,
    tasks: [
      {
        n: 1,
        title: 'Teil 1 · Gemeinsam etwas planen',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 5,
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
              id: 'taskCompletion',
              label: 'Aufgabenerfüllung',
              maxPoints: 5,
            },
            {
              id: 'coherence',
              label: 'Zusammenhang',
              maxPoints: 5,
            },
            {
              id: 'vocabulary',
              label: 'Wortschatz',
              maxPoints: 5,
            },
            {
              id: 'structures',
              label: 'Strukturen',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 1),
        hints: [
          'Official paired planning task with four guiding points, roughly 3 minutes per pair.',
          'Solo fixed partner turns use 5 practice minutes. Actual interaction and pronunciation are not assessed.',
        ],
      },
      {
        n: 2,
        title: 'Teil 2 · Ein Thema präsentieren',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 6,
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
              id: 'taskCompletion',
              label: 'Aufgabenerfüllung',
              maxPoints: 5,
            },
            {
              id: 'coherence',
              label: 'Zusammenhang',
              maxPoints: 5,
            },
            {
              id: 'vocabulary',
              label: 'Wortschatz',
              maxPoints: 5,
            },
            {
              id: 'structures',
              label: 'Strukturen',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 2),
        hints: [
          'Official presentation: choose one of two topics and follow five slides, approximately 3 minutes.',
          'Independent practice assigns one topic with five written guiding points; timer includes preparation and recording.',
        ],
      },
      {
        n: 3,
        title: 'Teil 3 · Rückmeldung und Fragen',
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
          ],
          criteria: [
            {
              id: 'taskCompletion',
              label: 'Aufgabenerfüllung',
              maxPoints: 5,
            },
            {
              id: 'coherence',
              label: 'Zusammenhang',
              maxPoints: 5,
            },
            {
              id: 'vocabulary',
              label: 'Wortschatz',
              maxPoints: 5,
            },
            {
              id: 'structures',
              label: 'Strukturen',
              maxPoints: 5,
            },
          ],
        },
        seed: seed('speaking', 3),
        hints: [
          'Official feedback, one question to the partner and response to a question about one’s own presentation.',
          'Self-contained partner summary and question allow solo practice; feedback does not depend on a real partner.',
        ],
      },
    ],
    summary: 'Planning, presentation and feedback/question exchange as solo practice.',
    scoringNote:
      'Each task has four formative transcript criteria of /5 each. Official /100 weighting, pronunciation and actual paired interaction are excluded.',
  },
]
