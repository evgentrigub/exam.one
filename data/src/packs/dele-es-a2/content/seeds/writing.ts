import type { WritingEsExercise } from '../types'

/**
 * Original DELE A2 writing seeds in the format of the 2020 model. Not official tasks. Tarea 2
 * has one seed per option, because each exercise is one option; Opción B gives its facts in
 * words where the exam shows photos.
 */
export const writingEsSeeds: WritingEsExercise[] = [
  {
    id: 'writing-es-a2-tarea1-001',
    title: 'Respuesta a Andrés',
    topicType: 'email',
    difficulty: 'A2',
    testingPart: 1,
    estimatedTime: 20,
    wordCount: { min: 60, max: 70 },
    category: ['Amigos', 'Tiempo libre'],
    createdAt: '2026-09-30',
    description: 'Un amigo te invita a pasar un fin de semana en su casa de la playa.',
    task: '«¡Hola! ¿Qué tal? Mis padres me dejan la casa de la playa el último fin de semana de junio y quiero invitar a unos amigos. ¿Te apetece venir? Podemos ir en mi coche el viernes. Un abrazo, Andrés.»\n\nEscribe un correo a Andrés. En él debes:\n– saludar\n– decir si puedes ir y por qué\n– contar qué hiciste la última vez que fuiste a la playa\n– preguntarle qué tienes que llevar\n– despedirte\nNúmero de palabras: entre 60 y 70.',
    requirements: [
      'Saludar',
      'Decir si puedes ir y por qué',
      'Contar qué hiciste la última vez que fuiste a la playa',
      'Preguntarle qué tienes que llevar',
      'Despedirte',
    ],
  },
  {
    id: 'writing-es-a2-tarea2-a-001',
    title: 'Mi primer viaje sin mi familia',
    topicType: 'opcion-a',
    difficulty: 'A2',
    testingPart: 2,
    estimatedTime: 25,
    wordCount: { min: 70, max: 80 },
    category: ['Viajes', 'Experiencias'],
    createdAt: '2026-09-30',
    description: 'Opción A: un texto para un blog sobre el primer viaje sin la familia.',
    task: 'Un blog de viajes pide a sus lectores textos sobre su primer viaje sin la familia.\nEscribe un texto en el que cuentes:\n– adónde fuiste, cuándo y con quién\n– cómo viajaste y dónde dormiste\n– qué hiciste allí\n– qué fue lo mejor y lo peor del viaje\nNúmero de palabras: entre 70 y 80.',
    requirements: [
      'Adónde fuiste, cuándo y con quién',
      'Cómo viajaste y dónde dormiste',
      'Qué hiciste allí',
      'Qué fue lo mejor y lo peor del viaje',
    ],
  },
  {
    id: 'writing-es-a2-tarea2-b-001',
    title: 'La vida de Rosa Molina',
    topicType: 'opcion-b',
    difficulty: 'A2',
    testingPart: 2,
    estimatedTime: 25,
    wordCount: { min: 70, max: 80 },
    category: ['Biografía', 'Trabajo'],
    createdAt: '2026-09-30',
    description: 'Opción B: la biografía de una cocinera a partir de unos datos.',
    task: 'En el examen verías unas fotos. Aquí tienes la información sobre la vida de Rosa Molina:\n1978: nace en un pueblo de Murcia\n1990: aprende a cocinar con su abuela\n1997: estudia Cocina en Barcelona\n2005: abre un restaurante pequeño en su pueblo\n2020: publica un libro de recetas\nEscribe un texto sobre Rosa Molina en el que cuentes:\n– dónde nació y cómo era su infancia\n– qué estudió y dónde\n– qué hizo después de estudiar\n– qué piensas tú de su vida\nNúmero de palabras: entre 70 y 80.',
    requirements: [
      'Dónde nació y cómo era su infancia',
      'Qué estudió y dónde',
      'Qué hizo después de estudiar',
      'Qué piensas tú de su vida',
    ],
  },
]
