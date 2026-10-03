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

/**
 * The DELE A2 Set 1 speaking tareas: exam-only. As in the exam, the role-play of Tarea 3 takes
 * place where the scene of Tarea 2 does: a restaurant.
 */
export const mockSpeakingEsSeeds: (SpeakingCardsTopic | SpeakingKeywordTopic)[] = [
  {
    id: 'mock-es-a2-set1-speaking-tarea1',
    theme: 'Mi trabajo o mis estudios',
    topicType: 'monologue',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    keywords: [
      'Qué haces: dónde trabajas o qué estudias',
      'Cómo es un día normal para ti',
      'Cómo son tus compañeros',
      'Qué hacías antes o qué estudiaste',
      'Qué te gusta más y qué te gustaría cambiar',
    ],
  },
  {
    id: 'mock-es-a2-set1-speaking-tarea2',
    theme:
      'Escena: en un restaurante, un camarero joven toma nota a una familia con dos niños pequeños. La madre mira la carta y el padre habla con el camarero mientras los niños dibujan.',
    topicType: 'photo',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    keywords: [
      '¿Cómo son las personas? ¿Qué ropa llevan?',
      '¿Dónde están? ¿Cómo es el lugar?',
      '¿Qué están haciendo?',
      '¿Qué relación hay entre ellos? ¿Cómo se sienten?',
      '¿Qué han hecho antes y qué van a hacer después?',
    ],
  },
  {
    id: 'mock-es-a2-set1-speaking-tarea3',
    theme:
      'Estás en un restaurante con un amigo y queréis comer. El examinador es el camarero.',
    topicType: 'roleplay',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    cards: [
      { segment: 'reply1', kind: 'answer', speaker: 'examiner', topic: 'En el restaurante', cue: 'Buenas tardes. ¿Cuántos son? ¿Prefieren mesa dentro o en la terraza?' },
      { segment: 'reply2', kind: 'answer', speaker: 'examiner', topic: 'En el restaurante', cue: 'Aquí tienen la carta. ¿Qué van a tomar de primero y de segundo?' },
      { segment: 'question', kind: 'ask', topic: 'En el restaurante', cue: 'preguntar si hay postre casero' },
      { segment: 'reply3', kind: 'answer', speaker: 'examiner', topic: 'En el restaurante', cue: 'Muy bien. ¿Y para beber? ¿Agua, vino, un refresco?' },
    ],
  },
]
