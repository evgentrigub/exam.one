import type {
  SpeakingCardsTopic,
  SpeakingKeywordTopic,
} from '../../../goethe-de-a2/content/types/speaking'

/**
 * Original DELE A2 speaking seeds, one per tarea, in the format of the 2020 model. Not official
 * tasks. Solo practice: the photo of Tarea 2 is described in words, and the examiner's
 * role-play lines in Tarea 3 are fixed `answer` cards marked `speaker: 'examiner'`.
 */
export const speakingEsSeeds: (SpeakingCardsTopic | SpeakingKeywordTopic)[] = [
  {
    id: 'speaking-es-a2-tarea1-001',
    theme: 'Mi barrio',
    topicType: 'monologue',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    keywords: [
      'Dónde está tu barrio y cuánto tiempo llevas viviendo allí',
      'Cómo es: las calles, las casas, las tiendas',
      'Qué haces normalmente en tu barrio',
      'Cómo era tu barrio cuando eras pequeño o pequeña',
      'Qué es lo que más te gusta y qué cambiarías',
    ],
  },
  {
    id: 'speaking-es-a2-tarea2-001',
    theme:
      'Escena: en una farmacia, una farmacéutica con bata blanca le explica algo a un señor mayor con bastón. Detrás, una madre joven con un niño en brazos espera su turno y mira el móvil.',
    topicType: 'photo',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    keywords: [
      '¿Cómo son las personas? ¿Qué ropa llevan?',
      '¿Dónde están? ¿Cómo es el lugar?',
      '¿Qué están haciendo?',
      '¿Qué relación hay entre ellos? ¿Cómo se sienten?',
      '¿Qué han hecho antes y qué van a hacer después?',
    ],
  },
  {
    id: 'speaking-es-a2-tarea3-001',
    theme:
      'Estás en una farmacia porque te duele mucho la garganta desde ayer. Quieres comprar algo para el dolor. El examinador es el farmacéutico.',
    topicType: 'roleplay',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    cards: [
      { segment: 'reply1', kind: 'answer', speaker: 'examiner', topic: 'En la farmacia', cue: 'Buenos días. ¿Qué le pasa?' },
      { segment: 'reply2', kind: 'answer', speaker: 'examiner', topic: 'En la farmacia', cue: '¿Desde cuándo le duele? ¿Tiene también fiebre?' },
      { segment: 'question', kind: 'ask', topic: 'En la farmacia', cue: 'preguntar cómo tomar el medicamento' },
      { segment: 'reply3', kind: 'answer', speaker: 'examiner', topic: 'En la farmacia', cue: 'Muy bien. Son ocho euros con cincuenta. ¿Va a pagar con tarjeta?' },
    ],
  },
]
