import type { ListeningEsExercise, ListeningEsItem } from '../types'
import { NEITHER } from '../../validate'

/** Stamp the per-item ids the per-item audio map is keyed by. */
function items(
  exerciseId: string,
  context: (n: number) => string,
  rows: Omit<ListeningEsItem, 'id' | 'context'>[]
): ListeningEsItem[] {
  return rows.map((row, index) => ({ ...row, context: context(index + 1), id: `${exerciseId}-i${index + 1}` }))
}

function rows<T extends object>(exerciseId: string, list: T[]): Array<T & { id: string }> {
  return list.map((row, index) => ({ ...row, id: `${exerciseId}-q${index + 1}` }))
}

const MESSAGES = [
  'Cambian la hora de una cita.',
  'Invitan a una fiesta.',
  'Hay un retraso en un transporte.',
  'Ofrecen un descuento solo por hoy.',
  'Piden que devuelvan una llamada.',
  'Cancelan una clase.',
  'Recuerdan que hay que llevar algo.',
  'Venden entradas para un concierto.',
  'Buscan a una persona perdida.',
  'Anuncian un cambio de andén.',
]

/**
 * Original DELE A2 listening seeds, one per tarea, in the format of the 2020 model. Not
 * official tasks.
 *
 * They ship without an `audio` map: the player finds no file, shows the missing-audio notice,
 * and **Generate audio** synthesises it with the local Spanish Kokoro voices. Every turn starts
 * with a role, a first name or "Señor / Señora" and a surname, so each speaker gets a voice of
 * the right gender; a single leading label picks the voice of a monologue and is not read aloud.
 */
export const listeningEsSeeds: ListeningEsExercise[] = [
  {
    id: 'listening-es-a2-tarea1-001',
    title: 'Tarea 1: Conversaciones breves',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    items: items('listening-es-a2-tarea1-001', n => `Conversación ${n}`, [
      {
        transcript:
          'Mujer: Buenos días. Quería unos zapatos para mi hijo, para el colegio. Hombre: ¿Qué número tiene? Mujer: El treinta y dos. Unos negros, por favor. Hombre: Negros en el treinta y dos no me quedan, lo siento. Tengo estos marrones y también unas zapatillas azules. Mujer: Mmm… Las zapatillas no, que en el colegio no las dejan llevar. Me llevo los marrones.',
        question: '¿Qué compra la mujer?',
        options: ['unos zapatos negros', 'unos zapatos marrones', 'unas zapatillas azules'],
        correctAnswer: 1,
        explanation: 'No tienen negros en su número y la mujer dice: «Me llevo los marrones».',
      },
      {
        transcript:
          'Hombre: Oye, Lucía, ¿quedamos esta tarde para ir al cine? Mujer: Vale. ¿Dónde nos vemos? ¿En la puerta del cine? Hombre: Mejor en la cafetería de enfrente, así tomamos algo antes. Mujer: Es que salgo tarde del trabajo… Bueno, venga, en la cafetería a las siete. Hombre: Perfecto, hasta luego.',
        question: '¿Dónde van a quedar?',
        options: ['en la puerta del cine', 'en la cafetería', 'en el trabajo de ella'],
        correctAnswer: 1,
        explanation: '«Mejor en la cafetería de enfrente» y ella acepta: «en la cafetería a las siete».',
      },
      {
        transcript:
          'Mujer: Perdone, ¿a qué hora sale el próximo tren para Toledo? Hombre: Acaba de salir uno, a las diez y cuarto. El siguiente sale a las once menos cuarto. Mujer: ¿Y no hay ninguno antes? Hombre: No, señora. Después hay otro a las doce y media. Mujer: Bueno, pues deme un billete para el de las once menos cuarto.',
        question: '¿A qué hora sale el tren de la mujer?',
        options: ['a las 10:15', 'a las 10:45', 'a las 12:30'],
        correctAnswer: 1,
        explanation: 'Compra un billete «para el de las once menos cuarto», es decir, las 10:45.',
      },
      {
        transcript:
          'Hombre: ¿Qué vas a pedir tú? Mujer: Yo de primero una ensalada, y de segundo pensaba pedir el pescado, pero hoy no hay. Hombre: El pollo aquí está muy bueno. Mujer: No, hoy no me apetece carne. Voy a tomar la paella de verduras. Hombre: Pues yo sí, el pollo.',
        question: '¿Qué va a comer la mujer de segundo?',
        options: ['pescado', 'pollo', 'paella de verduras'],
        correctAnswer: 2,
        explanation: 'Hoy no hay pescado y no quiere carne: «Voy a tomar la paella de verduras».',
      },
      {
        transcript:
          'Mujer: Hola, Pablo, ¿qué tal el fin de semana? Hombre: Muy bien. El sábado quería ir a la playa, pero llovió todo el día. Mujer: ¡Qué pena! ¿Y qué hiciste? Hombre: Me quedé en casa viendo películas, y el domingo fui con mi hermano a la montaña. Hizo un día estupendo.',
        question: '¿Qué hizo el hombre el sábado?',
        options: ['Fue a la playa.', 'Vio películas en casa.', 'Fue a la montaña.'],
        correctAnswer: 1,
        explanation: 'Llovió el sábado y «me quedé en casa viendo películas»; la montaña fue el domingo.',
      },
      {
        transcript:
          'Hombre: Buenas tardes. Tengo una reserva a nombre de García. Mujer: Sí, señor García, una habitación doble para tres noches. ¿Me deja su carné, por favor? Hombre: Aquí tiene. ¿El desayuno está incluido? Mujer: Sí, de siete a diez en el comedor. Su habitación es la doscientos catorce, en la segunda planta.',
        question: '¿En qué planta está la habitación?',
        options: ['en la primera', 'en la segunda', 'en la cuarta'],
        correctAnswer: 1,
        explanation: '«Su habitación es la doscientos catorce, en la segunda planta».',
      },
    ]),
  },
  {
    id: 'listening-es-a2-tarea2-001',
    title: 'Tarea 2: Radio',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    items: items('listening-es-a2-tarea2-001', n => `Radio ${n}`, [
      {
        transcript:
          'Locutora: Este fin de semana llega a Zaragoza la Feria del Libro. Más de cien librerías y editoriales estarán en el parque Grande desde el viernes hasta el domingo. El sábado por la mañana habrá actividades para niños y, por la tarde, varios escritores firmarán sus libros. La entrada es libre.',
        question: '¿Qué pasa el sábado por la tarde en la feria?',
        options: ['Hay actividades para niños.', 'Los escritores firman libros.', 'Cierran las librerías.'],
        correctAnswer: 1,
        explanation: '«Por la tarde, varios escritores firmarán sus libros»; los niños tienen actividades por la mañana.',
      },
      {
        transcript:
          'Locutor: ¿Quieres aprender a nadar este verano? La piscina municipal de Alcalá ofrece cursos para adultos en julio y agosto, de lunes a jueves a las ocho de la tarde. Los cursos duran dos semanas y cuestan treinta euros. Inscripciones en la piscina o en la web del ayuntamiento.',
        question: '¿Para quién son los cursos de la piscina?',
        options: ['Para niños.', 'Para adultos.', 'Para profesores de natación.'],
        correctAnswer: 1,
        explanation: '«La piscina municipal ofrece cursos para adultos en julio y agosto».',
      },
      {
        transcript:
          'Locutora: Y ahora el tiempo para mañana. En el norte seguirá lloviendo durante todo el día, con temperaturas bajas para la época. En el centro y en el sur, en cambio, tendremos sol y mucho calor, con temperaturas de hasta treinta y cinco grados en Sevilla y Córdoba.',
        question: '¿Qué tiempo va a hacer mañana en el sur?',
        options: ['Va a llover todo el día.', 'Va a hacer frío.', 'Va a hacer sol y calor.'],
        correctAnswer: 2,
        explanation: '«En el centro y en el sur… tendremos sol y mucho calor».',
      },
      {
        transcript:
          'Locutor: Muebles Casa Luz celebra su aniversario. Durante toda esta semana, todos los sofás tienen un veinte por ciento de descuento. Además, si compra una mesa, le regalamos dos sillas. Y recuerde: el transporte a su casa es gratis. Estamos en la calle Mayor, número cuarenta y ocho.',
        question: '¿Qué regalan en la tienda?',
        options: ['Dos sillas con la compra de una mesa.', 'Un sofá con la compra de una mesa.', 'Un veinte por ciento en todas las mesas.'],
        correctAnswer: 0,
        explanation: '«Si compra una mesa, le regalamos dos sillas»; el descuento es en los sofás.',
      },
      {
        transcript:
          'Locutora: Información de tráfico. A esta hora hay mucho tráfico en la entrada a Madrid por la autovía de Valencia, a causa de un accidente sin heridos. La policía recomienda usar la carretera de Barcelona. En el resto de las carreteras de la región, la circulación es normal.',
        question: '¿Qué recomienda la policía?',
        options: ['No salir de casa.', 'Usar el transporte público.', 'Tomar otra carretera.'],
        correctAnswer: 2,
        explanation: '«La policía recomienda usar la carretera de Barcelona».',
      },
      {
        transcript:
          'Locutor: El museo de arte moderno de Málaga presenta una nueva exposición de fotografía sobre la vida en los pueblos andaluces. Se puede visitar hasta el treinta de noviembre, de martes a domingo. Los lunes el museo está cerrado. Los estudiantes pagan solo la mitad del precio de la entrada.',
        question: '¿Qué dice la noticia sobre la exposición?',
        options: ['Es gratis para los estudiantes.', 'No se puede visitar los lunes.', 'Termina en septiembre.'],
        correctAnswer: 1,
        explanation: '«Los lunes el museo está cerrado»; los estudiantes pagan la mitad y termina en noviembre.',
      },
    ]),
  },
  {
    id: 'listening-es-a2-tarea3-001',
    title: 'Tarea 3: Planes para el verano',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context: 'Vas a escuchar una conversación entre Javier y Elena sobre sus planes para el verano.',
    transcript: [
      'Elena: ¡Hola, Javier! ¡Cuánto tiempo! ¿Qué tal todo?',
      'Javier: Muy bien, Elena. Muy ocupado con el trabajo, pero ya queda poco para las vacaciones. ¿Y tú?',
      'Elena: Bien, estoy terminando los exámenes en la universidad. El último es el viernes. ¿Qué vas a hacer este verano?',
      'Javier: Pues en julio tengo que trabajar, pero en agosto me voy con mi novia a Asturias. Hemos alquilado una casa pequeña en un pueblo de la costa.',
      'Elena: ¡Qué bien! A mí me encanta el norte. El verano pasado estuve en Galicia con mis padres y me gustó muchísimo.',
      'Javier: Y tú, ¿tienes planes?',
      'Elena: Sí, en julio voy a trabajar de monitora en un campamento de verano con niños, en la sierra. Necesito ganar un poco de dinero para el curso que viene.',
      'Javier: ¡Uf! Con niños… Yo no tengo paciencia para eso. Prefiero estar tranquilo en la playa leyendo un libro.',
      'Elena: Pues a mí me encanta. Además, el campamento está en la montaña y hace menos calor que aquí.',
      'Javier: Eso es verdad. Oye, mi hermano Luis también va a hacer un curso de inglés en Irlanda en agosto. ¿No querías tú aprender inglés?',
      'Elena: Sí, pero este año no puedo. En agosto me voy a quedar en Madrid, porque mi hermana tiene un bebé y quiero ayudarla.',
      'Javier: ¡Qué bonito! Bueno, a la vuelta tenemos que quedar para tomar algo y enseñarnos las fotos.',
      'Elena: ¡Claro! Te escribo en septiembre.',
    ].join('\n'),
    options: ['Javier', 'Elena', NEITHER],
    questions: rows('listening-es-a2-tarea3-001', [
      { person: 'Tiene exámenes esta semana.', correctAnswer: 1, explanation: 'Elena: «Estoy terminando los exámenes… El último es el viernes».' },
      { person: 'Va a pasar sus vacaciones en la costa.', correctAnswer: 0, explanation: 'Javier: «En agosto me voy con mi novia a Asturias… un pueblo de la costa».' },
      { person: 'El año pasado viajó con su familia.', correctAnswer: 1, explanation: 'Elena: «El verano pasado estuve en Galicia con mis padres».' },
      { person: 'Va a trabajar con niños.', correctAnswer: 1, explanation: 'Elena: «Voy a trabajar de monitora en un campamento de verano con niños».' },
      { person: 'Va a estudiar inglés en Irlanda.', correctAnswer: 2, explanation: 'Es Luis, el hermano de Javier, quien va a Irlanda; Elena dice que este año no puede.' },
      { person: 'Va a cuidar de un familiar en agosto.', correctAnswer: 1, explanation: 'Elena: «En agosto me voy a quedar en Madrid, porque mi hermana tiene un bebé y quiero ayudarla».' },
    ]),
  },
  {
    id: 'listening-es-a2-tarea4-001',
    title: 'Tarea 4: Mensajes y avisos',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context: 'Vas a escuchar siete mensajes y avisos.',
    transcript: [
      'Lucía: Hola, Pablo, soy Lucía. El sábado es mi cumpleaños y lo voy a celebrar en casa con unos amigos. Empezamos a las nueve de la noche. ¡Espero que puedas venir! Un beso.',
      'Locutora: Atención, señores pasajeros. El tren con destino a Valencia, que tenía su salida a las once y veinte, saldrá con cuarenta minutos de retraso. Perdonen las molestias.',
      'Señora Martín: Buenos días, llamo de la consulta del doctor Pérez. Su cita del jueves a las diez es ahora a las doce, porque el doctor tiene una reunión. Si no le va bien, llámenos, por favor.',
      'Locutor: ¡Solo hoy, en todas las tiendas Deportes Rápido, las zapatillas de correr tienen un treinta por ciento de descuento! Mañana vuelven a su precio normal. ¡No lo piense más!',
      'Carlos: Hola, Marta, soy Carlos, de la oficina. Necesito hablar contigo sobre la reunión de mañana. Es importante. Llámame cuando escuches este mensaje, por favor. Mi número es el seis, cuatro, cinco, treinta y dos, dieciocho, noventa.',
      'Profesora: Hola, soy Ana, la profesora de yoga. Os recuerdo que la clase de mañana es en el parque, no en el gimnasio. No olvidéis traer vuestra esterilla y una botella de agua. ¡Hasta mañana!',
      'Locutora: Señores clientes: el tren con destino a Barcelona, con salida a las doce y diez, efectuará su salida por la vía cuatro, y no por la vía dos, como estaba anunciado.',
    ].join('\n'),
    options: MESSAGES,
    questions: rows('listening-es-a2-tarea4-001', [
      { person: 'Mensaje 1', correctAnswer: 1, explanation: '«El sábado es mi cumpleaños… ¡Espero que puedas venir!».' },
      { person: 'Mensaje 2', correctAnswer: 2, explanation: '«Saldrá con cuarenta minutos de retraso».' },
      { person: 'Mensaje 3', correctAnswer: 0, explanation: '«Su cita del jueves a las diez es ahora a las doce».' },
      { person: 'Mensaje 4', correctAnswer: 3, explanation: '«Solo hoy… tienen un treinta por ciento de descuento».' },
      { person: 'Mensaje 5', correctAnswer: 4, explanation: '«Llámame cuando escuches este mensaje, por favor».' },
      { person: 'Mensaje 6', correctAnswer: 6, explanation: '«No olvidéis traer vuestra esterilla y una botella de agua»; la clase no se cancela, cambia de lugar.' },
      { person: 'Mensaje 7', correctAnswer: 9, explanation: '«Efectuará su salida por la vía cuatro, y no por la vía dos».' },
    ]),
  },
]
