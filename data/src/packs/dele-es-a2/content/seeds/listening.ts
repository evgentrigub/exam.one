import type { ListeningEsExercise, ListeningEsItem } from '../types'
import { NEITHER } from '../../validate'
import { withSeedAudio } from '../listening-audio'

/** Stamp the per-item ids the per-item audio map is keyed by. */
function items(
  exerciseId: string,
  context: (n: number) => string,
  rows: Omit<ListeningEsItem, 'id' | 'context'>[]
): ListeningEsItem[] {
  return rows.map((row, index) => ({
    ...row,
    context: context(index + 1),
    id: `${exerciseId}-i${index + 1}`,
  }))
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
        explanation:
          '«Mejor en la cafetería de enfrente» y ella acepta: «en la cafetería a las siete».',
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
        explanation:
          'Llovió el sábado y «me quedé en casa viendo películas»; la montaña fue el domingo.',
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
        options: [
          'Hay actividades para niños.',
          'Los escritores firman libros.',
          'Cierran las librerías.',
        ],
        correctAnswer: 1,
        explanation:
          '«Por la tarde, varios escritores firmarán sus libros»; los niños tienen actividades por la mañana.',
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
        options: [
          'Dos sillas con la compra de una mesa.',
          'Un sofá con la compra de una mesa.',
          'Un veinte por ciento en todas las mesas.',
        ],
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
        options: [
          'Es gratis para los estudiantes.',
          'No se puede visitar los lunes.',
          'Termina en septiembre.',
        ],
        correctAnswer: 1,
        explanation:
          '«Los lunes el museo está cerrado»; los estudiantes pagan la mitad y termina en noviembre.',
      },
    ]),
  },
  {
    id: 'listening-es-a2-tarea3-001',
    title: 'Tarea 3: Planes para el verano',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-09-30',
    context:
      'Vas a escuchar una conversación entre Javier y Elena sobre sus planes para el verano.',
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
      {
        person: 'Tiene exámenes esta semana.',
        correctAnswer: 1,
        explanation: 'Elena: «Estoy terminando los exámenes… El último es el viernes».',
      },
      {
        person: 'Va a pasar sus vacaciones en la costa.',
        correctAnswer: 0,
        explanation: 'Javier: «En agosto me voy con mi novia a Asturias… un pueblo de la costa».',
      },
      {
        person: 'El año pasado viajó con su familia.',
        correctAnswer: 1,
        explanation: 'Elena: «El verano pasado estuve en Galicia con mis padres».',
      },
      {
        person: 'Va a trabajar con niños.',
        correctAnswer: 1,
        explanation: 'Elena: «Voy a trabajar de monitora en un campamento de verano con niños».',
      },
      {
        person: 'Va a estudiar inglés en Irlanda.',
        correctAnswer: 2,
        explanation:
          'Es Luis, el hermano de Javier, quien va a Irlanda; Elena dice que este año no puede.',
      },
      {
        person: 'Va a cuidar de un familiar en agosto.',
        correctAnswer: 1,
        explanation:
          'Elena: «En agosto me voy a quedar en Madrid, porque mi hermana tiene un bebé y quiero ayudarla».',
      },
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
      {
        person: 'Mensaje 1',
        correctAnswer: 1,
        explanation: '«El sábado es mi cumpleaños… ¡Espero que puedas venir!».',
      },
      {
        person: 'Mensaje 2',
        correctAnswer: 2,
        explanation: '«Saldrá con cuarenta minutos de retraso».',
      },
      {
        person: 'Mensaje 3',
        correctAnswer: 0,
        explanation: '«Su cita del jueves a las diez es ahora a las doce».',
      },
      {
        person: 'Mensaje 4',
        correctAnswer: 3,
        explanation: '«Solo hoy… tienen un treinta por ciento de descuento».',
      },
      {
        person: 'Mensaje 5',
        correctAnswer: 4,
        explanation: '«Llámame cuando escuches este mensaje, por favor».',
      },
      {
        person: 'Mensaje 6',
        correctAnswer: 6,
        explanation:
          '«No olvidéis traer vuestra esterilla y una botella de agua»; la clase no se cancela, cambia de lugar.',
      },
      {
        person: 'Mensaje 7',
        correctAnswer: 9,
        explanation: '«Efectuará su salida por la vía cuatro, y no por la vía dos».',
      },
    ]),
  },
]

const MOCK_MESSAGES = [
  'Cambian el lugar de una reunión.',
  'Ofrecen un trabajo para el verano.',
  'Anuncian que un vuelo sale más tarde.',
  'Invitan a una cena de cumpleaños.',
  'Piden ayuda para una mudanza.',
  'Informan de una tienda que cierra antes.',
  'Recuerdan que hay que pagar algo.',
  'Venden entradas para un partido.',
  'Devuelven un objeto perdido.',
  'Cancelan un viaje en autobús.',
]

const mockListeningPayloads: ListeningEsExercise[] = [
  {
    id: 'mock-es-a2-set1-listening-tarea1',
    title: 'Tarea 1: Conversaciones breves',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    items: items('mock-es-a2-set1-listening-tarea1', n => `Conversación ${n}`, [
      {
        transcript:
          'Hombre: Perdone, ¿la farmacia más cercana? Mujer: Hay una en la calle Mayor, pero hoy está cerrada. Hombre: ¡Vaya! ¿Y otra? Mujer: Sí, en la plaza, al lado del banco. Está abierta hasta las diez. Hombre: Muchas gracias.',
        question: '¿Adónde va a ir el hombre?',
        options: ['a la calle Mayor', 'a la plaza, al lado del banco', 'al banco'],
        correctAnswer: 1,
        explanation:
          'La farmacia de la calle Mayor está cerrada; la abierta está «en la plaza, al lado del banco».',
      },
      {
        transcript:
          'Mujer: ¿Qué le regalamos a papá por su cumpleaños? Hombre: Siempre le regalamos libros… Mujer: Ya, y una corbata no le gusta nada. Hombre: ¿Y unas entradas para el fútbol? Le encanta. Mujer: ¡Buena idea! Compramos dos y vas tú con él.',
        question: '¿Qué van a regalar a su padre?',
        options: ['un libro', 'una corbata', 'unas entradas'],
        correctAnswer: 2,
        explanation: '«¿Y unas entradas para el fútbol?… ¡Buena idea!».',
      },
      {
        transcript:
          'Hombre: Buenas tardes, quería una mesa para cuatro personas. Mujer: ¿Para esta noche? Hombre: No, para mañana sábado, a las nueve. Mujer: A las nueve está todo lleno. Tengo mesa a las diez. Hombre: Bueno, vale, a las diez.',
        question: '¿Cuándo va a cenar el hombre en el restaurante?',
        options: ['hoy por la noche', 'el sábado a las nueve', 'el sábado a las diez'],
        correctAnswer: 2,
        explanation: 'A las nueve está lleno y el hombre acepta la mesa «a las diez» del sábado.',
      },
      {
        transcript:
          'Mujer: ¿Cómo vas al trabajo? ¿En coche? Hombre: No, el coche lo usa mi mujer. Antes iba en autobús, pero ahora voy en bicicleta. Mujer: ¿En bici? ¿No está lejos? Hombre: Solo veinte minutos, y así hago deporte.',
        question: '¿Cómo va ahora el hombre al trabajo?',
        options: ['en coche', 'en autobús', 'en bicicleta'],
        correctAnswer: 2,
        explanation: '«Antes iba en autobús, pero ahora voy en bicicleta».',
      },
      {
        transcript:
          'Hombre: ¿Qué tiempo va a hacer este fin de semana? Mujer: El sábado sol y calor, pero el domingo dicen que va a llover. Hombre: Entonces vamos a la playa el sábado. Mujer: Vale, y el domingo nos quedamos en casa.',
        question: '¿Qué van a hacer el sábado?',
        options: ['ir a la playa', 'quedarse en casa', 'ir al cine'],
        correctAnswer: 0,
        explanation: 'El sábado hace sol: «Entonces vamos a la playa el sábado».',
      },
      {
        transcript:
          'Mujer: Buenos días, ¿cuánto cuestan estas manzanas? Hombre: Las rojas, dos euros el kilo, y las verdes, dos cincuenta. Mujer: Deme un kilo de las verdes, por favor. Hombre: ¿Algo más? Mujer: No, nada más, gracias.',
        question: '¿Cuánto paga la mujer?',
        options: ['dos euros', 'dos euros con cincuenta', 'cinco euros'],
        correctAnswer: 1,
        explanation: 'Compra un kilo de manzanas verdes, que cuestan «dos cincuenta» el kilo.',
      },
    ]),
  },
  {
    id: 'mock-es-a2-set1-listening-tarea2',
    title: 'Tarea 2: Radio',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    items: items('mock-es-a2-set1-listening-tarea2', n => `Radio ${n}`, [
      {
        transcript:
          'Locutor: El próximo domingo se celebra en Bilbao la carrera popular de primavera. Pueden participar personas de todas las edades. La salida es a las nueve de la mañana desde el puente de la Salve. La inscripción cuesta cinco euros y el dinero es para un hospital infantil.',
        question: '¿Para qué es el dinero de las inscripciones?',
        options: [
          'Para la ciudad de Bilbao.',
          'Para un hospital de niños.',
          'Para los corredores.',
        ],
        correctAnswer: 1,
        explanation: '«El dinero es para un hospital infantil».',
      },
      {
        transcript:
          'Locutora: Supermercados Frescos abre una nueva tienda en el centro comercial Las Rosas. Para celebrarlo, este viernes todos los clientes recibirán un regalo con su compra. Además, la fruta y la verdura tendrán un descuento del treinta por ciento durante toda la semana.',
        question: '¿Qué pasa este viernes en la tienda?',
        options: [
          'Los clientes reciben un regalo.',
          'La tienda cierra antes.',
          'La fruta es gratis.',
        ],
        correctAnswer: 0,
        explanation: '«Este viernes todos los clientes recibirán un regalo con su compra».',
      },
      {
        transcript:
          'Locutor: Atención, conductores. Por la nieve, hoy es obligatorio llevar cadenas en las carreteras de la sierra de Madrid. La policía recomienda no viajar por la noche y salir solo si es necesario. Mañana por la tarde el tiempo va a mejorar.',
        question: '¿Qué recomienda la policía?',
        options: [
          'Viajar por la noche.',
          'Salir solo si es necesario.',
          'Ir a la sierra mañana por la mañana.',
        ],
        correctAnswer: 1,
        explanation: '«La policía recomienda… salir solo si es necesario».',
      },
      {
        transcript:
          'Locutora: Y ahora, una noticia curiosa: en un pueblo de Asturias, los vecinos han abierto una biblioteca en una antigua cabina de teléfono. Cualquier persona puede dejar un libro y llevarse otro. Ya hay más de doscientos libros y la idea ha llegado a otros pueblos.',
        question: '¿Qué han hecho los vecinos del pueblo?',
        options: [
          'Una biblioteca en una cabina de teléfono.',
          'Una tienda de libros antiguos.',
          'Un concurso de lectura.',
        ],
        correctAnswer: 0,
        explanation: '«Los vecinos han abierto una biblioteca en una antigua cabina de teléfono».',
      },
      {
        transcript:
          'Locutor: ¿Quieres aprender a cocinar platos de todo el mundo? La escuela Sabores ofrece cursos de cocina mexicana, japonesa e italiana. Las clases son los martes por la tarde y, al final, los alumnos comen lo que han preparado. Primera clase gratis.',
        question: '¿Qué hacen los alumnos al final de la clase?',
        options: ['Lavan los platos.', 'Comen lo que han cocinado.', 'Compran los ingredientes.'],
        correctAnswer: 1,
        explanation: '«Al final, los alumnos comen lo que han preparado».',
      },
      {
        transcript:
          'Locutora: El museo de la ciudad cambia su horario en verano. A partir del 1 de julio, abrirá de nueve de la mañana a tres de la tarde, de martes a domingo. Los jueves por la noche habrá visitas especiales con música de nueve a once.',
        question: '¿Qué hay los jueves por la noche en el museo?',
        options: ['Visitas con música.', 'Clases para niños.', 'Entrada gratis para todos.'],
        correctAnswer: 0,
        explanation: '«Los jueves por la noche habrá visitas especiales con música».',
      },
    ]),
  },
  {
    id: 'mock-es-a2-set1-listening-tarea3',
    title: 'Tarea 3: Un nuevo piso',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    context: 'Vas a escuchar una conversación entre Pablo y Marta sobre sus pisos.',
    transcript: [
      'Marta: ¡Pablo! ¿Qué tal? Me han dicho que te has cambiado de piso.',
      'Pablo: Sí, hace dos semanas. Ahora vivo en el barrio de Gracia, cerca del trabajo. Voy andando a la oficina.',
      'Marta: ¡Qué suerte! Yo tardo casi una hora en metro todos los días.',
      'Pablo: El piso es pequeño, pero tiene una terraza con mucho sol. Allí desayuno todas las mañanas.',
      'Marta: Pues yo estoy buscando piso. Mi compañera de piso se va a vivir con su novio y yo sola no puedo pagar el alquiler.',
      'Pablo: Te entiendo, los alquileres están carísimos. Yo comparto el piso con un amigo de la universidad, Jorge.',
      'Marta: ¿Y os lleváis bien?',
      'Pablo: Sí, muy bien. Él cocina y yo limpio. Bueno, él dice que yo no limpio mucho…',
      'Marta: Ja, ja. Oye, ¿y tienes muebles?',
      'Pablo: Pocos. El sábado voy a ir a una tienda de segunda mano a comprar una mesa y unas sillas.',
      'Marta: ¿Puedo ir contigo? Yo necesito una estantería para mis libros.',
      'Pablo: Claro. Después podemos comer algo por el barrio y te lo enseño.',
      'Marta: ¡Perfecto! Nos vemos el sábado.',
    ].join('\n'),
    options: ['Pablo', 'Marta', NEITHER],
    questions: rows('mock-es-a2-set1-listening-tarea3', [
      {
        person: 'Va al trabajo a pie.',
        correctAnswer: 0,
        explanation: 'Pablo: «Voy andando a la oficina».',
      },
      {
        person: 'Pasa mucho tiempo en el transporte público.',
        correctAnswer: 1,
        explanation: 'Marta: «Yo tardo casi una hora en metro todos los días».',
      },
      {
        person: 'Necesita un piso nuevo.',
        correctAnswer: 1,
        explanation: 'Marta: «Yo estoy buscando piso».',
      },
      {
        person: 'Se va a vivir con su pareja.',
        correctAnswer: 2,
        explanation:
          'Es la compañera de piso de Marta quien se va con su novio, no Pablo ni Marta.',
      },
      {
        person: 'Prepara la comida en su piso.',
        correctAnswer: 2,
        explanation: 'En el piso de Pablo cocina Jorge: «Él cocina y yo limpio».',
      },
      {
        person: 'Quiere comprar un mueble para sus libros.',
        correctAnswer: 1,
        explanation: 'Marta: «Yo necesito una estantería para mis libros».',
      },
    ]),
  },
  {
    id: 'mock-es-a2-set1-listening-tarea4',
    title: 'Tarea 4: Mensajes y avisos',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    context: 'Vas a escuchar siete mensajes y avisos.',
    transcript: [
      'Javier: Hola, Elena, soy Javier. Te llamo porque la reunión de mañana no es en la oficina. Es en la cafetería de la esquina, a la misma hora, a las diez. Hasta mañana.',
      'Locutora: Atención, señores pasajeros. El vuelo 342 con destino a Lisboa saldrá con una hora de retraso. La nueva hora de salida es las cinco y media. Gracias.',
      'Laura: ¡Hola, Pablo! El viernes cumplo treinta años y voy a hacer una cena en mi casa con amigos. Es a las nueve. ¿Puedes traer el postre? ¡Un beso!',
      'Carlos: Hola, Manuel, soy Carlos. El sábado me cambio de piso y necesito ayuda con las cajas. ¿Puedes venir por la mañana? Te invito a comer después.',
      'Locutor: Señores clientes, les recordamos que hoy, por ser día de fiesta, la tienda cierra a las dos de la tarde. Les rogamos que pasen por caja. Gracias.',
      'Señora Martín: Buenos días, llamo de la academia de idiomas. Le recuerdo que todavía no ha pagado el curso de este mes. Puede pagar en la secretaría hasta el viernes.',
      'Lucía: Hola, soy Lucía, de la biblioteca. Ayer se dejó usted una bufanda azul en la sala de estudio. La tenemos aquí, en la recepción. Puede venir a buscarla cuando quiera.',
    ].join('\n'),
    options: MOCK_MESSAGES,
    questions: rows('mock-es-a2-set1-listening-tarea4', [
      {
        person: 'Mensaje 1',
        correctAnswer: 0,
        explanation: '«La reunión de mañana no es en la oficina. Es en la cafetería».',
      },
      {
        person: 'Mensaje 2',
        correctAnswer: 2,
        explanation: '«El vuelo… saldrá con una hora de retraso».',
      },
      {
        person: 'Mensaje 3',
        correctAnswer: 3,
        explanation: '«El viernes cumplo treinta años y voy a hacer una cena».',
      },
      {
        person: 'Mensaje 4',
        correctAnswer: 4,
        explanation: '«Me cambio de piso y necesito ayuda con las cajas».',
      },
      {
        person: 'Mensaje 5',
        correctAnswer: 5,
        explanation: '«Hoy… la tienda cierra a las dos de la tarde».',
      },
      {
        person: 'Mensaje 6',
        correctAnswer: 6,
        explanation: '«Todavía no ha pagado el curso de este mes».',
      },
      {
        person: 'Mensaje 7',
        correctAnswer: 8,
        explanation: '«Ayer se dejó usted una bufanda azul… La tenemos aquí».',
      },
    ]),
  },
]

/**
 * The DELE A2 Set 1 listening tareas: exam-only, with bundled seed WAVs under
 * `/audio/listening/dele-es-a2` (`pnpm stack:seed-audio`), so the bundled mock plays without TTS.
 */
export const mockListeningEsSeeds: ListeningEsExercise[] = mockListeningPayloads.map(withSeedAudio)
