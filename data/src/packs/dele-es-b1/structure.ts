import type { ModuleDefinition } from './runtime'
export const EXAM_TITLE = 'DELE B1'
export const EXAM_LANGUAGE = 'Spanish'
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
    minutes: 70,
    tasks: [
      {
        n: 1,
        title: 'Tarea 1 · Personas y anuncios',
        itemFormat: 'matching',
        runtime: {
          minutes: 14,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 9,
          reuseOptions: false,
        },
        seed: seed('reading', 1),
        hints: [
          '6 people matched to 9 promotional or information texts; 3 unused options.',
          'Use detailed needs and original notices of roughly 40–60 words each.',
        ],
        bank: true,
      },
      {
        n: 2,
        title: 'Tarea 2 · Un centro de intercambio',
        itemFormat: 'selection',
        runtime: {
          minutes: 14,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 2),
        hints: [
          '6 three-option questions on an informative text of about 400–450 words.',
          'Test essential ideas, specific detail and reasonable inference.',
        ],
      },
      {
        n: 3,
        title: 'Tarea 3 · Experiencias laborales',
        itemFormat: 'matching',
        runtime: {
          minutes: 14,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 3),
        hints: [
          '6 statements mapped to 3 personal texts of about 100–120 words each.',
          'A text may answer several statements; preserve the shared A/B/C bank.',
        ],
        bank: true,
      },
      {
        n: 4,
        title: 'Tarea 4 · Reconstruir un texto',
        itemFormat: 'matching',
        runtime: {
          minutes: 14,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 8,
          reuseOptions: false,
        },
        seed: seed('reading', 4),
        hints: [
          '6 removed fragments from a coherent text of about 400–450 words, with 8 options.',
          'Use each correct fragment once; two remain unused. Cohesive references must make the match unique.',
        ],
        bank: true,
        gaps: true,
      },
      {
        n: 5,
        title: 'Tarea 5 · Un correo con huecos',
        itemFormat: 'selection',
        runtime: {
          minutes: 14,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
        },
        seed: seed('reading', 5),
        hints: [
          '6 grammatical cloze gaps in a personal letter of about 150–200 words.',
          'Three options per gap; practise tense, mood, relatives and connectors at B1.',
        ],
        gaps: true,
      },
    ],
    summary:
      'Five tareas: notices, article, multiple matching, text reconstruction and grammar cloze.',
    scoringNote:
      '30 raw marks, one per item. Official comprehension score is converted to /25; practice does not apply that conversion.',
  },
  {
    id: 'listening',
    label: 'Listening',
    minutes: 40,
    tasks: [
      {
        n: 1,
        title: 'Tarea 1 · Avisos y mensajes',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 1),
        hints: [
          '6 short monologues, roughly 40–60 words each, one three-option question each.',
          'Identify main message and specific intention; recordings heard twice.',
        ],
        items: true,
      },
      {
        n: 2,
        title: 'Tarea 2 · Una experiencia personal',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 2),
        hints: [
          '6 three-option questions on a sustained personal monologue of about 400–450 words.',
          'Test essential idea, detail and experience; heard twice.',
        ],
      },
      {
        n: 3,
        title: 'Tarea 3 · Noticias',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 3),
        hints: [
          '6 news items, roughly 350–400 words in total, three choices per question.',
          'One shared radio programme transcript with six clearly separated news items, heard twice.',
        ],
      },
      {
        n: 4,
        title: 'Tarea 4 · Testimonios y opiniones',
        itemFormat: 'matching',
        runtime: {
          minutes: 8,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 9,
          replays: 2,
          reuseOptions: false,
        },
        seed: seed('listening', 4),
        hints: [
          '6 informal testimonies of about 50–70 words, matched to 9 statements.',
          'Use each correct statement once; 3 unused distractors. Heard twice.',
        ],
        bank: true,
      },
      {
        n: 5,
        title: 'Tarea 5 · Preparar un viaje',
        itemFormat: 'selection',
        runtime: {
          minutes: 8,
          maxPoints: 6,
          questionCount: 6,
          multiplier: 1,
          optionCount: 3,
          replays: 2,
        },
        seed: seed('listening', 5),
        hints: [
          '6 three-option questions on a 250–300-word informal conversation.',
          'Recognise specific information and changed plans; labelled speakers, heard twice.',
        ],
        dialogue: true,
      },
    ],
    summary:
      'Five tareas of six items each: messages, experience, news, testimonies and conversation. All recordings heard twice.',
    scoringNote: '30 raw marks. No official /25 conversion or group pass result in practice.',
  },
  {
    id: 'writing',
    label: 'Writing',
    minutes: 60,
    tasks: [
      {
        n: 1,
        title: 'Tarea 1 · Responder a un mensaje',
        itemFormat: 'freeform',
        runtime: {
          minutes: 25,
          maxPoints: 12,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 100,
              maxWords: 120,
            },
          ],
          criteria: [
            {
              id: 'genreAdequacy',
              label: 'Adecuación al género discursivo',
              maxPoints: 3,
            },
            {
              id: 'coherence',
              label: 'Coherencia',
              maxPoints: 3,
            },
            {
              id: 'accuracy',
              label: 'Corrección',
              maxPoints: 3,
            },
            {
              id: 'range',
              label: 'Alcance',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('writing', 1),
        hints: [
          'Official task 1: written interaction, 100–120 words, from a short input message.',
          'Formative analytic bands 0–3: 2 represents B1, 3 exceeds the threshold. Four scales total /12; official 40% holistic and 60% analytic weighting is not applied.',
        ],
      },
      {
        n: 2,
        title: 'Tarea 2 · Una experiencia que cambió tu opinión',
        itemFormat: 'freeform',
        runtime: {
          minutes: 35,
          maxPoints: 12,
          multiplier: 1,
          fields: [
            {
              id: 'answer',
              label: 'Your text',
              minWords: 130,
              maxWords: 150,
            },
          ],
          criteria: [
            {
              id: 'genreAdequacy',
              label: 'Adecuación al género discursivo',
              maxPoints: 3,
            },
            {
              id: 'coherence',
              label: 'Coherencia',
              maxPoints: 3,
            },
            {
              id: 'accuracy',
              label: 'Corrección',
              maxPoints: 3,
            },
            {
              id: 'range',
              label: 'Alcance',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('writing', 2),
        hints: [
          'Official task 2: one of two descriptive/narrative/opinion options, 130–150 words. Practice assigns one option per exercise.',
          'Use the same four analytic 0–3 scales; 2 is B1. Do not label /12 as the official /25 writing score.',
        ],
      },
    ],
    summary:
      'Respond in 100–120 words and produce an assigned narrative/opinion text in 130–150 words.',
    scoringNote:
      'Each task uses four formative analytic bands 0–3 (/12). Official holistic/analytic weighting and /25 aggregation are not applied.',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 15,
    tasks: [
      {
        n: 1,
        title: 'Tarea 1 · Presentación breve',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 3,
          maxPoints: 9,
          multiplier: 1,
          segments: [
            {
              id: 'turn1',
              label: 'Turn 1',
            },
          ],
          criteria: [
            {
              id: 'coherence',
              label: 'Coherencia',
              maxPoints: 3,
            },
            {
              id: 'accuracy',
              label: 'Corrección',
              maxPoints: 3,
            },
            {
              id: 'range',
              label: 'Alcance',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('speaking', 1),
        hints: [
          'Official prepared presentation: choose one of two familiar topics; solo practice assigns one.',
          'Use 0–3 bands; 2 demonstrates B1. Transcript practice scores Coherence, Accuracy and Range only (/9), excluding acoustic Fluency and official weighting.',
        ],
      },
      {
        n: 2,
        title: 'Tarea 2 · Conversación sobre el tema',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 4,
          maxPoints: 9,
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
              id: 'coherence',
              label: 'Coherencia',
              maxPoints: 3,
            },
            {
              id: 'accuracy',
              label: 'Corrección',
              maxPoints: 3,
            },
            {
              id: 'range',
              label: 'Alcance',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('speaking', 2),
        hints: [
          'Examiner conversation follows the presentation topic, with experience and opinions.',
          'Independent solo exercise includes its own topic context; fixed questions cannot assess live interaction.',
        ],
      },
      {
        n: 3,
        title: 'Tarea 3 · Descripción y conversación',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 4,
          maxPoints: 9,
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
              id: 'coherence',
              label: 'Coherencia',
              maxPoints: 3,
            },
            {
              id: 'accuracy',
              label: 'Corrección',
              maxPoints: 3,
            },
            {
              id: 'range',
              label: 'Alcance',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('speaking', 3),
        hints: [
          'Describe an unprepared photograph and answer related questions; practice uses a written scene.',
          'Official task lasts 2–3 minutes; 4 minutes here allows independent recordings and transitions.',
        ],
      },
      {
        n: 4,
        title: 'Tarea 4 · Diálogo en una situación',
        itemFormat: 'recording',
        layout: 'word-cards',
        runtime: {
          minutes: 4,
          maxPoints: 9,
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
              id: 'coherence',
              label: 'Coherencia',
              maxPoints: 3,
            },
            {
              id: 'accuracy',
              label: 'Corrección',
              maxPoints: 3,
            },
            {
              id: 'range',
              label: 'Alcance',
              maxPoints: 3,
            },
          ],
        },
        seed: seed('speaking', 4),
        hints: [
          'Simulated practical dialogue linked to the previous scene; include enough context for an independent exercise.',
          'Use solo examiner cards; no actual negotiation or acoustic fluency grade.',
        ],
      },
    ],
    summary:
      'Presentation, topic conversation, scene description with follow-ups, and practical dialogue, as solo practice.',
    scoringNote:
      'Each task /9 on transcript-visible analytic scales. Acoustic fluency, official holistic weighting and /25 conversion are excluded.',
  },
]
