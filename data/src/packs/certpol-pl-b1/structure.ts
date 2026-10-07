import type { ModuleDefinition } from './runtime'
export const EXAM_TITLE = 'Certyfikat Polski B1'
export const EXAM_LANGUAGE = 'Polish'
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
    label: 'Reading and grammar',
    minutes: 85,
    tasks: [
      {
        n: 1,
        title: 'Czytanie I · Krótkie teksty',
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
          'Reading task I: 5 short texts and 5 three-option questions, 1 mark each.',
          'Identify the message or implication, using original Polish texts.',
        ],
      },
      {
        n: 2,
        title: 'Czytanie II · Biblioteka sąsiedzka',
        itemFormat: 'true-false',
        runtime: {
          minutes: 8,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 2,
        },
        seed: seed('reading', 2),
        hints: [
          'Reading task II: 7 true/false statements, 1 mark each.',
          'Use integer answers 0 for Tak and 1 for Nie; test paraphrases, not only word overlap.',
        ],
      },
      {
        n: 3,
        title: 'Czytanie III · Spójność tekstu',
        itemFormat: 'matching',
        runtime: {
          minutes: 9,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 8,
          reuseOptions: false,
        },
        seed: seed('reading', 3),
        hints: [
          'Reading task III: 7 removed fragments, a common bank of 8 options; 1 mark each.',
          'Include a spare distractor and preserve syntactic and logical links.',
        ],
        bank: true,
        gaps: true,
      },
      {
        n: 4,
        title: 'Czytanie IV · Tytuły i informacje',
        itemFormat: 'matching',
        runtime: {
          minutes: 8,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 8,
          reuseOptions: false,
        },
        seed: seed('reading', 4),
        hints: [
          'Reading task IV: 7 headlines matched to short information texts, 1 mark each.',
          'Use 8 options including a distractor; all option banks identical.',
        ],
        bank: true,
      },
      {
        n: 5,
        title: 'Czytanie V · Wspólny ogród',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 4,
          questionCount: 8,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 5),
        hints: [
          'Reading task V: 8 lexical cloze gaps, three choices each, 0.5 mark per item.',
          'Use vocabulary collocations in a connected text; display /4 raw marks.',
        ],
        gaps: true,
      },
      {
        n: 6,
        title: 'Gramatyka I · Odmiana rzeczowników, przymiotników i zaimków',
        itemFormat: 'selection',
        runtime: {
          minutes: 6,
          maxPoints: 5,
          questionCount: 10,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 6),
        hints: [
          'Grammar paper task I; catalog Part 6. 10 inflection choices, three options, 0.5 mark each.',
          'Use cases of nouns, adjectives and pronouns in a coherent passage.',
        ],
        gaps: true,
      },
      {
        n: 7,
        title: 'Gramatyka II · Spójniki',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 5,
          maxPoints: 2.5,
          questionCount: 5,
          multiplier: 1,
        },
        seed: seed('reading', 7),
        typedBankSize: 6,
        hints: [
          'Grammar paper task II; catalog Part 7. 5 conjunction gaps from a word bank with one unused word, 0.5 mark each.',
          'Use each intended bank word once; accepted lists must retain Polish diacritics.',
        ],
      },
      {
        n: 8,
        title: 'Gramatyka III · Stopniowanie',
        itemFormat: 'selection',
        runtime: {
          minutes: 5,
          maxPoints: 2.5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 8),
        hints: [
          'Grammar paper task III; catalog Part 8. 5 adjective/adverb comparison choices, 0.5 mark each.',
          'Use forms whose agreement and comparative context make one answer correct.',
        ],
        gaps: true,
      },
      {
        n: 9,
        title: 'Gramatyka IV · Czas teraźniejszy i przyszły',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 7,
          maxPoints: 5,
          questionCount: 10,
          multiplier: 1,
        },
        seed: seed('reading', 9),
        hints: [
          'Grammar paper task IV; catalog Part 9. 10 present/future verb forms, 0.5 mark each.',
          'Supply lemma, grammatical person and time context; list every valid future variant.',
        ],
      },
      {
        n: 10,
        title: 'Gramatyka V · Pytania o informację',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 5,
          maxPoints: 2.5,
          questionCount: 5,
          multiplier: 1,
        },
        seed: seed('reading', 10),
        hints: [
          'Grammar paper task V; catalog Part 10. 5 question-phrase gaps, 0.5 mark each.',
          'Specify the exact highlighted information and keep valid multiword question forms.',
        ],
      },
      {
        n: 11,
        title: 'Gramatyka VI · Przekształcanie zdań',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 6,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
        },
        seed: seed('reading', 11),
        hints: [
          'Grammar paper task VI; catalog Part 11. 5 full-sentence transformations, 1 mark each.',
          'Typed exact-answer practice: constrain the transformation and enumerate equivalent forms; this cannot accept every possible human paraphrase.',
        ],
      },
      {
        n: 12,
        title: 'Gramatyka VII · Aspekt i tryby',
        itemFormat: 'selection',
        runtime: {
          minutes: 6,
          maxPoints: 5,
          questionCount: 10,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 12),
        hints: [
          'Grammar paper task VII; catalog Part 12. 10 aspect/mood choices, 0.5 mark each.',
          'Use clear completed/repeated actions, imperatives and conditional constructions.',
        ],
        gaps: true,
      },
      {
        n: 13,
        title: 'Gramatyka VIII · Przyimki',
        itemFormat: 'gap-fill',
        runtime: {
          minutes: 5,
          maxPoints: 2.5,
          questionCount: 5,
          multiplier: 1,
        },
        seed: seed('reading', 13),
        typedBankSize: 6,
        hints: [
          'Grammar paper task VIII; catalog Part 13. 5 preposition gaps from a bank with one unused option, 0.5 mark each.',
          'Include case and time/place context for unique answers.',
        ],
      },
    ],
    summary:
      'Reading I–V and the separate grammar paper I–VIII appear as clearly labelled catalog parts 1–13.',
    scoringNote:
      'Reading /30 and Grammar /30 are separate official papers. This catalog sum /60 is only navigation; passing requires 50% in each paper separately.',
  },
  {
    id: 'listening',
    label: 'Listening',
    minutes: 30,
    tasks: [
      {
        n: 1,
        title: 'Słuchanie I · Krótkie wypowiedzi',
        itemFormat: 'selection',
        runtime: {
          minutes: 6,
          maxPoints: 6,
          questionCount: 12,
          multiplier: 1,
          optionCount: 3,
          replays: 1,
        },
        seed: seed('listening', 1),
        hints: [
          '2020 listening task I: 12 items, three choices, 0.5 mark each; heard once.',
          'Identify situation, intention and meaning.',
        ],
        items: true,
      },
      {
        n: 2,
        title: 'Słuchanie II · Dialogi',
        itemFormat: 'selection',
        runtime: {
          minutes: 6,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 2),
        hints: [
          '2020 listening task II: 7 short dialogues, 1 mark per item, heard twice.',
          'Use corrections, reasons and implied attitudes.',
        ],
        items: true,
        dialogue: true,
      },
      {
        n: 3,
        title: 'Słuchanie III · Wywiad',
        itemFormat: 'true-false',
        runtime: {
          minutes: 6,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 2,
          replays: 2,
        },
        seed: seed('listening', 3),
        hints: [
          '2020 listening task III: 5 true/false items, 1 mark each; heard twice.',
          'Use Tak/Nie choice rows with integer answers.',
        ],
        dialogue: true,
      },
      {
        n: 4,
        title: 'Słuchanie IV · Opinie mieszkańców',
        itemFormat: 'matching',
        runtime: {
          minutes: 6,
          maxPoints: 7,
          questionCount: 7,
          multiplier: 1,
          optionCount: 4,
          replays: 2,
        },
        seed: seed('listening', 4),
        hints: [
          '2020 listening task IV: 7 answer slots mapped to 4 speakers; one speaker may express multiple opinions.',
          'Reuse of speaker options is allowed. Heard twice, 1 mark per slot.',
        ],
        bank: true,
      },
      {
        n: 5,
        title: 'Słuchanie V · Zajęcia sportowe',
        itemFormat: 'matching',
        runtime: {
          minutes: 6,
          maxPoints: 5,
          questionCount: 5,
          multiplier: 1,
          optionCount: 6,
          replays: 2,
          reuseOptions: false,
        },
        seed: seed('listening', 5),
        hints: [
          '2020 listening task V: 5 matches, common bank of 6 options, one unused.',
          'Heard twice; 1 mark each; do not reuse correct options.',
        ],
        bank: true,
      },
    ],
    summary:
      'Five adult B1 task families from the 2020 sample. Task I is heard once; tasks II–V twice.',
    scoringNote: '30 raw marks: 6,7,5,7,5. Task I awards half a mark per item.',
  },
  {
    id: 'writing',
    label: 'Writing',
    minutes: 75,
    tasks: [
      {
        n: 1,
        title: 'Pisanie a · Krótka wiadomość',
        itemFormat: 'freeform',
        runtime: {
          minutes: 15,
          maxPoints: 6,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 20,
              maxWords: 30,
            },
          ],
          criteria: [
            {
              id: 'taskCompletion',
              label: 'Wykonanie zadania',
              maxPoints: 2,
            },
            {
              id: 'range',
              label: 'Bogactwo językowe',
              maxPoints: 2,
            },
            {
              id: 'accuracy',
              label: 'Poprawność językowa',
              maxPoints: 2,
            },
          ],
        },
        seed: seed('writing', 1),
        hints: [
          'Practice task a: a short message of about 25 words; guidance 20–30.',
          'The official paper offers three paired sets totalling 200 words. Practice assigns one task; scores allocate 2/2/2 of the paper’s 10/10/10 criteria to this short task.',
        ],
      },
      {
        n: 2,
        title: 'Pisanie b · Relacja z wydarzenia',
        itemFormat: 'freeform',
        runtime: {
          minutes: 60,
          maxPoints: 24,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 160,
              maxWords: 190,
            },
          ],
          criteria: [
            {
              id: 'taskCompletion',
              label: 'Wykonanie zadania',
              maxPoints: 8,
            },
            {
              id: 'range',
              label: 'Bogactwo językowe',
              maxPoints: 8,
            },
            {
              id: 'accuracy',
              label: 'Poprawność językowa',
              maxPoints: 8,
            },
          ],
        },
        seed: seed('writing', 2),
        hints: [
          'Practice task b: a report, narrative or essay of about 175 words; guidance 160–190.',
          'Assign one 25+175-word pair type from the 2020 sample; practice does not offer the official three-set choice or 40+160 variants. Criteria allocated 8/8/8; combined short+long maximum is 30.',
        ],
      },
    ],
    summary: 'Assigned short and long texts corresponding to one 25+175-word pair.',
    scoringNote:
      '30 raw practice marks across two tasks (6+24). The official whole-set criteria are 10/10/10; part allocations are practice conventions.',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 15,
    tasks: [
      {
        n: 1,
        title: 'Mówienie 1 · Opis sytuacji',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 5,
          maxPoints: 13,
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
              label: 'Wykonanie zadania',
              maxPoints: 7,
            },
            {
              id: 'grammar',
              label: 'Poprawność gramatyczna',
              maxPoints: 3,
            },
            {
              id: 'vocabulary',
              label: 'Słownictwo i styl',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('speaking', 1),
        hints: [
          'Adult B1 oral task 1: photo description, represented by a written scene.',
          'Formative transcript rubric; pronunciation and intonation excluded.',
        ],
      },
      {
        n: 2,
        title: 'Mówienie 2 · Monolog',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 5,
          maxPoints: 13,
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
              label: 'Wykonanie zadania',
              maxPoints: 7,
            },
            {
              id: 'grammar',
              label: 'Poprawność gramatyczna',
              maxPoints: 3,
            },
            {
              id: 'vocabulary',
              label: 'Słownictwo i styl',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('speaking', 2),
        hints: [
          'Adult B1 oral task 2: connected monologue on a familiar topic.',
          'Include description, personal experience and justified opinion.',
        ],
      },
      {
        n: 3,
        title: 'Mówienie 3 · Sytuacja komunikacyjna',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 5,
          maxPoints: 10,
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
              label: 'Wykonanie zadania',
              maxPoints: 6,
            },
            {
              id: 'grammar',
              label: 'Poprawność gramatyczna',
              maxPoints: 2,
            },
            {
              id: 'vocabulary',
              label: 'Słownictwo i styl',
              maxPoints: 2,
            },
          ],
        },
        seed: seed('speaking', 3),
        hints: [
          'Adult B1 oral task 3: practical dialogue with an examiner, adapted to solo cards.',
          'Practice allocation retains task maxima 7/7/6, grammar 3/3/2 and vocabulary 3/3/2 (36 total); official pronunciation/intonation adds 4 to the whole oral paper.',
        ],
      },
    ],
    summary: 'Written-scene description, monologue and solo practical dialogue.',
    scoringNote:
      '36 transcript-visible practice marks; official oral paper /40 includes 4 pronunciation/intonation marks. No official pass result is computed.',
  },
]
