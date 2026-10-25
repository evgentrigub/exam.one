import type { ReadingEsExercise, ReadingEsQuestion } from '../types'

type Row = Omit<ReadingEsQuestion, 'id' | 'textId' | 'type'>

/** Stamp the ids and question type the reading screen and scoring expect. */
function questions(
  textId: string,
  type: ReadingEsQuestion['type'],
  rows: Row[]
): ReadingEsQuestion[] {
  return rows.map((row, index) => ({ ...row, id: `${textId}-q${index + 1}`, textId, type }))
}

const TEXTS = ['Texto A', 'Texto B', 'Texto C']

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

const TAREA1 = [
  '¡Hola, Lucía!',
  '',
  '¿Qué tal estás? Perdona que no te he escrito antes, pero estas semanas han sido muy intensas. Como sabes, en septiembre empecé a trabajar en una escuela de idiomas en Salamanca. Doy clases de inglés a niños por las tardes y por las mañanas ayudo en la secretaría. El trabajo me gusta mucho, aunque al principio estaba un poco nerviosa porque nunca había trabajado con niños tan pequeños. Ahora ya los conozco a todos y son muy simpáticos, aunque a veces hablan todos a la vez.',
  '',
  'La ciudad es preciosa. Vivo en un piso compartido cerca de la Plaza Mayor con dos chicas: Irene, que es de Burgos y estudia Medicina, y Sophie, una chica francesa que hace un máster. Nos llevamos muy bien y los domingos siempre cocinamos juntas. Sophie hace unas crepes buenísimas y yo les enseño a preparar la tortilla de mi abuela.',
  '',
  'El sábado pasado fuimos de excursión a la Peña de Francia, una montaña que está a una hora de aquí. Subimos andando y desde arriba vimos unos paisajes increíbles. Comimos unos bocadillos al sol y hicimos muchas fotos. Llegamos a casa muy cansadas, pero muy contentas.',
  '',
  'Te escribo también por otra cosa: el 14 de noviembre es mi cumpleaños y quiero celebrarlo aquí con mis amigos nuevos. ¿Por qué no vienes ese fin de semana? Puedes dormir en mi habitación y yo duermo en el sofá, no hay problema. Desde Madrid hay autobuses cada dos horas y el viaje dura unas dos horas y media.',
  '',
  'Escríbeme pronto y dime si puedes venir. ¡Tengo muchas ganas de verte!',
  '',
  'Un abrazo muy fuerte,',
  'Marina',
].join('\n')

const TAREA2 = [
  'Texto 1',
  'CURSO DE COCINA ITALIANA. Aprende a preparar pasta fresca y pizza en ocho clases. Los martes y jueves de 18:00 a 20:00 en el Centro Cultural del barrio. El precio incluye todos los ingredientes. Grupos de diez personas como máximo. Inscripción en la recepción del centro antes del 30 de septiembre.',
  '',
  'Texto 2',
  'SE ALQUILA HABITACIÓN en piso compartido, cerca de la estación de metro Ópera. Habitación grande con balcón y mucha luz. El piso tiene cocina nueva, lavadora y wifi. 400 euros al mes con gastos incluidos. Solo para estudiantes o chicas que trabajen. No se aceptan animales. Llamar por las tardes.',
  '',
  'Texto 3',
  'BIBLIOTECA MUNICIPAL. Durante el mes de agosto la biblioteca abre solo por las mañanas, de 9:00 a 14:00. La sala de estudio permanecerá cerrada por obras hasta el 1 de septiembre. Los libros prestados en julio se pueden devolver en el buzón que está junto a la puerta principal.',
  '',
  'Texto 4',
  'Hola a todos. Me llamo Andrés y el mes que viene me mudo a Valencia por trabajo. Busco gente para hacer deporte los fines de semana: correr por la playa, jugar al pádel o montar en bicicleta. No conozco a nadie en la ciudad y me gustaría hacer amigos. ¿Alguien se apunta?',
  '',
  'Texto 5',
  'FIESTAS DEL PUEBLO. El sábado 12, a las 22:00, gran concierto en la plaza del Ayuntamiento con el grupo Los Olivos. La entrada es gratuita. El domingo 13 por la mañana habrá juegos para niños en el parque y, a las 14:00, una paella popular. Los tiques para la paella cuestan cinco euros.',
  '',
  'Texto 6',
  'SUPERMERCADO LA ESQUINA. Desde el lunes, llevamos la compra a su casa. Si compra más de 50 euros, el servicio es gratis; si compra menos, cuesta tres euros. Puede hacer su pedido por teléfono o en nuestra página web hasta las 12:00 y lo recibirá el mismo día por la tarde.',
  '',
  'Texto 7',
  'Se busca camarero o camarera para trabajar los fines de semana en una cafetería del centro. Horario: sábados y domingos de 8:00 a 15:00. No es necesario tener experiencia, pero sí hablar inglés. Ofrecemos buen ambiente de trabajo y comida gratis. Interesados, enviar el currículum por correo electrónico.',
  '',
  'Texto 8',
  'MUSEO DE CIENCIAS. ¡Nueva exposición sobre los dinosaurios! Abierta de martes a domingo de 10:00 a 19:00. Entrada general: ocho euros. Los niños menores de seis años y los jubilados no pagan. Los miércoles por la tarde, a partir de las 16:00, la entrada es gratis para todos. Visitas guiadas los sábados.',
].join('\n')

const TAREA3 = [
  'Texto A: Casa Rural El Molino',
  'Esta antigua casa de piedra está en un pequeño pueblo de la sierra, a cinco kilómetros del río. Tiene seis habitaciones dobles, todas con baño, y un jardín grande con piscina, abierta de junio a septiembre. El desayuno está incluido en el precio y se prepara con productos de la zona. Los dueños organizan rutas a caballo por la montaña los sábados. No se admiten mascotas. Es ideal para familias con niños, porque hay una zona de juegos y bicicletas gratis para los clientes. En invierno, el salón tiene una chimenea y una pequeña biblioteca con libros y juegos de mesa.',
  '',
  'Texto B: Hotel Puerta del Mar',
  'Este hotel moderno está en primera línea de playa, a diez minutos a pie del centro histórico. Todas las habitaciones tienen terraza con vistas al mar y aire acondicionado. El restaurante del hotel ofrece pescado fresco y abre también para personas que no están alojadas. En la recepción alquilan bicicletas y venden entradas para los barcos que salen cada día hacia las islas. Los perros pequeños son bienvenidos. El aparcamiento cuesta doce euros al día y hay que reservarlo antes. En verano el hotel está casi siempre lleno, así que es mejor reservar con dos o tres meses de antelación.',
  '',
  'Texto C: Albergue La Estación',
  'Este albergue juvenil está en el antiguo edificio de la estación de tren, en pleno centro de la ciudad. Tiene habitaciones de cuatro y seis camas y una cocina que pueden usar todos los clientes. Por la noche, en la terraza, hay música en directo los viernes y los sábados. El desayuno no está incluido, pero cuesta solo tres euros. Organizan visitas gratuitas a pie por el casco antiguo todos los días a las once. Las sábanas y las toallas se pagan aparte. Es el alojamiento más barato de la zona y está a solo cinco minutos de la estación de autobuses.',
].join('\n')

const TAREA4 = [
  'Carmen Ruiz nació en 1962 en Cazorla, un pueblo de Jaén rodeado de montañas y olivos. Sus padres tenían una pequeña tienda de comestibles en la plaza, y Carmen pasaba allí las tardes después del colegio. Allí aprendió a hablar con todo tipo de personas y, sobre todo, a escuchar. Su abuela, que vivía con la familia, le contaba historias antiguas del pueblo, y Carmen las escribía en un cuaderno azul que todavía conserva.',
  '',
  'A los dieciocho años se fue a Granada para estudiar Magisterio. No fue fácil: echaba de menos a su familia y tenía poco dinero, así que trabajaba los fines de semana en una librería. Allí descubrió los libros para niños y decidió que quería escribirlos ella misma. Cuando terminó la carrera, volvió a Cazorla y empezó a trabajar como maestra en la escuela del pueblo.',
  '',
  'Durante veinte años, Carmen enseñó a leer a varias generaciones de niños. Todos los viernes, al final de la clase, les leía un cuento. Pero no eran cuentos de los libros: eran las historias de su abuela, que ella adaptaba para los pequeños. A los niños les encantaban, y muchos padres empezaron a pedirle copias para leerlas en casa.',
  '',
  'En 2004, una antigua alumna que trabajaba en una editorial de Madrid leyó uno de esos cuentos y le propuso publicarlo. Así nació su primer libro, «El lobo que no sabía aullar», que tuvo un gran éxito y se tradujo a seis idiomas. Después vinieron otros doce libros, todos inspirados en la vida del campo y en las personas mayores del pueblo.',
  '',
  'Hoy Carmen ya no da clases, pero sigue viviendo en Cazorla, en la misma casa de la plaza donde estaba la tienda de sus padres. En la planta baja ha abierto una pequeña biblioteca para los niños del pueblo, que abre todas las tardes. Los sábados por la mañana, los abuelos del pueblo vienen a contar sus propias historias y los niños las dibujan.',
  '',
  'Cuando le preguntan por el secreto de su éxito, Carmen siempre responde lo mismo: «Yo no he inventado casi nada. Solo he escuchado a mi abuela y a mis vecinos. Las mejores historias no están en los libros, están en la gente». Ahora está preparando un nuevo libro, esta vez para adultos, sobre la historia de su familia.',
].join('\n')

/** Original DELE A2 reading seeds, one per tarea, in the format of the 2020 model. Not official tasks. */
export const readingEsSeeds: ReadingEsExercise[] = [
  {
    id: 'reading-es-a2-tarea1-001',
    title: 'Un correo desde Salamanca',
    content: TAREA1,
    textType: 'email',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: words(TAREA1),
    topics: ['Trabajo', 'Vivienda', 'Amigos'],
    createdAt: '2026-09-30',
    questions: questions('reading-es-a2-tarea1-001', 'comprehension', [
      {
        question: '¿Por qué escribe Marina a Lucía?',
        options: [
          'Para contarle su nueva vida e invitarla a su cumpleaños.',
          'Para pedirle ayuda con su trabajo nuevo.',
          'Para decirle que va a visitarla en Madrid.',
        ],
        correctAnswer: 0,
        explanation:
          'Marina cuenta cómo le va en Salamanca y le pregunta: «¿Por qué no vienes ese fin de semana?».',
      },
      {
        question: '¿Qué hace Marina por las mañanas?',
        options: [
          'Da clases de inglés a niños.',
          'Trabaja en la secretaría de la escuela.',
          'Estudia en la universidad.',
        ],
        correctAnswer: 1,
        explanation: '«Por las mañanas ayudo en la secretaría»; las clases son por las tardes.',
      },
      {
        question: '¿Qué dice Marina de sus compañeras de piso?',
        options: [
          'Las dos son estudiantes de Medicina.',
          'No las ve casi nunca.',
          'Se llevan bien y cocinan juntas los domingos.',
        ],
        correctAnswer: 2,
        explanation: '«Nos llevamos muy bien y los domingos siempre cocinamos juntas».',
      },
      {
        question: 'El sábado pasado, Marina y sus amigas…',
        options: [
          'subieron a una montaña a pie.',
          'fueron en autobús a Madrid.',
          'hicieron una fiesta en casa.',
        ],
        correctAnswer: 0,
        explanation: '«Fuimos de excursión a la Peña de Francia… Subimos andando».',
      },
      {
        question: 'Si Lucía va a Salamanca, ¿dónde va a dormir?',
        options: [
          'En el sofá del salón.',
          'En la habitación de Marina.',
          'En un hotel cerca de la Plaza Mayor.',
        ],
        correctAnswer: 1,
        explanation: '«Puedes dormir en mi habitación y yo duermo en el sofá».',
      },
    ]),
  },
  {
    id: 'reading-es-a2-tarea2-001',
    title: 'Anuncios y avisos',
    content: TAREA2,
    textType: 'advertisement',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 8,
    wordCount: words(TAREA2),
    topics: ['Ciudad', 'Servicios', 'Tiempo libre'],
    createdAt: '2026-09-30',
    questions: questions('reading-es-a2-tarea2-001', 'comprehension', [
      {
        question: 'Texto 1: Según el anuncio, en el curso de cocina…',
        options: [
          'hay que llevar los ingredientes.',
          'los grupos son pequeños.',
          'las clases son por la mañana.',
        ],
        correctAnswer: 1,
        explanation:
          '«Grupos de diez personas como máximo»; los ingredientes están incluidos y las clases son por la tarde.',
      },
      {
        question: 'Texto 2: ¿Quién puede alquilar la habitación?',
        options: [
          'Una estudiante con un gato.',
          'Una familia con niños.',
          'Una chica que trabaja.',
        ],
        correctAnswer: 2,
        explanation: '«Solo para estudiantes o chicas que trabajen. No se aceptan animales».',
      },
      {
        question: 'Texto 3: En agosto, en la biblioteca…',
        options: [
          'no se puede usar la sala de estudio.',
          'no se pueden devolver libros.',
          'el horario es de tarde.',
        ],
        correctAnswer: 0,
        explanation: '«La sala de estudio permanecerá cerrada por obras hasta el 1 de septiembre».',
      },
      {
        question: 'Texto 4: ¿Qué quiere Andrés?',
        options: [
          'Encontrar trabajo en Valencia.',
          'Conocer gente para hacer deporte.',
          'Vender su bicicleta.',
        ],
        correctAnswer: 1,
        explanation:
          '«Busco gente para hacer deporte los fines de semana… me gustaría hacer amigos».',
      },
      {
        question: 'Texto 5: En las fiestas del pueblo hay que pagar…',
        options: ['el concierto del sábado.', 'los juegos para niños.', 'la comida del domingo.'],
        correctAnswer: 2,
        explanation: '«Los tiques para la paella cuestan cinco euros»; el concierto es gratuito.',
      },
      {
        question: 'Texto 6: El servicio a domicilio del supermercado es gratis si…',
        options: [
          'la compra cuesta más de 50 euros.',
          'se pide por la página web.',
          'se pide antes de las 12:00.',
        ],
        correctAnswer: 0,
        explanation: '«Si compra más de 50 euros, el servicio es gratis».',
      },
      {
        question: 'Texto 7: Para trabajar en la cafetería es necesario…',
        options: [
          'tener experiencia como camarero.',
          'hablar inglés.',
          'trabajar de lunes a viernes.',
        ],
        correctAnswer: 1,
        explanation: '«No es necesario tener experiencia, pero sí hablar inglés».',
      },
      {
        question: 'Texto 8: ¿Cuándo es gratis el museo para todos?',
        options: [
          'Los sábados con visita guiada.',
          'Los martes por la mañana.',
          'Los miércoles por la tarde.',
        ],
        correctAnswer: 2,
        explanation:
          '«Los miércoles por la tarde, a partir de las 16:00, la entrada es gratis para todos».',
      },
    ]),
  },
  {
    id: 'reading-es-a2-tarea3-001',
    title: 'Tres alojamientos',
    content: TAREA3,
    textType: 'article',
    testingPart: 3,
    difficulty: 'A2',
    estimatedReadingTime: 6,
    wordCount: words(TAREA3),
    topics: ['Viajes', 'Alojamiento'],
    createdAt: '2026-09-30',
    questions: questions('reading-es-a2-tarea3-001', 'matching', [
      {
        question: 'Aquí puedes cocinar tu propia comida.',
        options: TEXTS,
        correctAnswer: 2,
        explanation: 'Texto C: «tiene… una cocina que pueden usar todos los clientes».',
      },
      {
        question: 'Puedes ir con tu perro.',
        options: TEXTS,
        correctAnswer: 1,
        explanation:
          'Texto B: «Los perros pequeños son bienvenidos»; en el texto A no se admiten mascotas.',
      },
      {
        question: 'Puedes montar a caballo.',
        options: TEXTS,
        correctAnswer: 0,
        explanation: 'Texto A: «Los dueños organizan rutas a caballo por la montaña los sábados».',
      },
      {
        question: 'Puedes comer allí aunque no duermas en el lugar.',
        options: TEXTS,
        correctAnswer: 1,
        explanation: 'Texto B: el restaurante «abre también para personas que no están alojadas».',
      },
      {
        question: 'Puedes escuchar música el fin de semana.',
        options: TEXTS,
        correctAnswer: 2,
        explanation: 'Texto C: «hay música en directo los viernes y los sábados».',
      },
      {
        question: 'No tienes que pagar aparte el desayuno.',
        options: TEXTS,
        correctAnswer: 0,
        explanation:
          'Texto A: «El desayuno está incluido en el precio»; en el texto C cuesta tres euros.',
      },
    ]),
  },
  {
    id: 'reading-es-a2-tarea4-001',
    title: 'Carmen Ruiz, la maestra que escuchaba',
    content: TAREA4,
    textType: 'article',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 8,
    wordCount: words(TAREA4),
    topics: ['Biografía', 'Educación', 'Libros'],
    createdAt: '2026-09-30',
    questions: questions('reading-es-a2-tarea4-001', 'comprehension', [
      {
        question: 'Según el texto, en la tienda de sus padres Carmen…',
        options: [
          'aprendió a escuchar a la gente.',
          'trabajaba todas las mañanas.',
          'escribía cuentos para los clientes.',
        ],
        correctAnswer: 0,
        explanation:
          'Primer párrafo: «Allí aprendió a hablar con todo tipo de personas y, sobre todo, a escuchar».',
      },
      {
        question: '¿Por qué trabajaba Carmen en una librería en Granada?',
        options: [
          'Porque quería ser escritora.',
          'Porque necesitaba dinero.',
          'Porque era parte de sus estudios.',
        ],
        correctAnswer: 1,
        explanation:
          'Segundo párrafo: «tenía poco dinero, así que trabajaba los fines de semana en una librería».',
      },
      {
        question: 'Los cuentos que Carmen leía en clase…',
        options: [
          'eran de libros famosos.',
          'los escribían los niños.',
          'venían de las historias de su abuela.',
        ],
        correctAnswer: 2,
        explanation:
          'Tercer párrafo: «eran las historias de su abuela, que ella adaptaba para los pequeños».',
      },
      {
        question: '¿Cómo publicó Carmen su primer libro?',
        options: [
          'Gracias a una antigua alumna.',
          'Lo envió ella misma a muchas editoriales.',
          'Ganó un concurso en Madrid.',
        ],
        correctAnswer: 0,
        explanation:
          'Cuarto párrafo: «una antigua alumna que trabajaba en una editorial de Madrid… le propuso publicarlo».',
      },
      {
        question: '¿Qué hay hoy en la planta baja de la casa de Carmen?',
        options: [
          'La tienda de sus padres.',
          'Una biblioteca para niños.',
          'Una escuela para adultos.',
        ],
        correctAnswer: 1,
        explanation:
          'Quinto párrafo: «En la planta baja ha abierto una pequeña biblioteca para los niños del pueblo».',
      },
      {
        question: 'Según Carmen, las mejores historias…',
        options: [
          'están en los libros antiguos.',
          'hay que inventarlas.',
          'las cuentan las personas.',
        ],
        correctAnswer: 2,
        explanation:
          'Último párrafo: «Las mejores historias no están en los libros, están en la gente».',
      },
    ]),
  },
]

const MOCK_TAREA1 = [
  'Querida Sara:',
  '',
  '¡Por fin tengo un poco de tiempo para escribirte! Te cuento las novedades: desde el mes pasado vivo en Valencia. Me ofrecieron un trabajo en la recepción de un hotel cerca de la playa y no lo pensé mucho. Trabajo de lunes a viernes, por las mañanas, y los fines de semana los tengo libres. Mis compañeros son muy amables y el jefe me deja practicar mi inglés con los clientes extranjeros.',
  '',
  'Al principio viví dos semanas en casa de mi tía Rosa, pero ahora he alquilado un estudio pequeño en el barrio del Carmen. Es antiguo y no tiene ascensor, pero desde la ventana veo una plaza muy bonita con naranjos. Lo malo es que por la noche hay bastante ruido, porque hay muchos bares en la calle.',
  '',
  'Todavía no conozco a mucha gente, así que me he apuntado a un club de senderismo. Salimos un domingo al mes a la montaña y después comemos todos juntos. El domingo pasado fue mi primera excursión y lo pasé genial, aunque terminé muy cansado.',
  '',
  'Te escribo también porque en abril tengo una semana de vacaciones y me gustaría ir a verte a Sevilla. ¿Te parece bien? Si no puedes en abril, podemos dejarlo para mayo. Ah, y una pregunta: ¿todavía tienes la guía de Andalucía que te regalé? Me gustaría llevarla en el viaje.',
  '',
  'Contéstame cuando puedas.',
  '',
  'Un abrazo,',
  'Daniel',
].join('\n')

const MOCK_TAREA2 = [
  'Texto 1',
  'GIMNASIO FORMA. Este mes, la matrícula es gratis para todos los nuevos socios. Abrimos de lunes a sábado de 7:00 a 22:00 y los domingos solo por la mañana. Tenemos clases de yoga, baile y natación. Los menores de dieciséis años tienen que venir con una persona adulta.',
  '',
  'Texto 2',
  'INTERCAMBIO DE IDIOMAS. Soy Laura, tengo veinticinco años y soy profesora de música. Busco a una persona alemana para practicar alemán una hora a la semana. A cambio, yo puedo ayudarte con tu español. Podemos quedar en una cafetería del centro los jueves por la tarde.',
  '',
  'Texto 3',
  '¡SE HA PERDIDO UN GATO! Se llama Tom, es blanco y negro y lleva un collar rojo. Se perdió el martes por la noche cerca del parque del Oeste. Es muy tranquilo, pero tiene miedo de los perros. Si lo ves, llama al teléfono que está debajo. Ofrecemos una recompensa.',
  '',
  'Texto 4',
  'CINE DE VERANO. Durante julio y agosto, todas las noches a las 22:30 hay películas al aire libre en el patio del museo. Los lunes las películas son en versión original con subtítulos. La entrada cuesta tres euros y se compra en la taquilla una hora antes. Si llueve, la sesión se cancela.',
  '',
  'Texto 5',
  'AVISO A LOS VIAJEROS. Por obras en la vía, desde el 3 hasta el 15 de mayo no habrá trenes entre Alcalá y Guadalajara. La empresa ofrece autobuses gratuitos que salen de la puerta principal de la estación cada treinta minutos. El viaje en autobús dura veinte minutos más.',
  '',
  'Texto 6',
  'PANADERÍA LA ESPIGA. Desde el lunes tenemos nuevo horario: abrimos a las siete de la mañana y cerramos a las tres de la tarde. Los domingos cerramos todo el día. Recuerda que puedes encargar tus tartas de cumpleaños por teléfono con dos días de antelación.',
  '',
  'Texto 7',
  'Hola a todos. Vendo una bicicleta de montaña casi nueva, solo la he usado tres meses. Es de color azul y está en muy buen estado. La vendo porque me voy a vivir a otra ciudad y no la puedo llevar. Precio: 150 euros. Incluye un candado y una luz. Escribidme un mensaje.',
  '',
  'Texto 8',
  'PISCINA MUNICIPAL. La piscina abre el 15 de junio. Hay cursos de natación para niños de cuatro a doce años, por las mañanas, de lunes a viernes. Las inscripciones se hacen en internet a partir del 1 de junio. Las plazas son limitadas. Es obligatorio llevar gorro de baño.',
].join('\n')

const MOCK_TAREA3 = [
  'Texto A: Escuela de Baile Ritmo',
  'Nuestra escuela ofrece clases de salsa, flamenco y tango para adultos de todas las edades. No es necesario tener experiencia ni venir con pareja: en clase cambiamos de pareja a menudo. Las clases son de lunes a jueves por la tarde y duran una hora y media. El primer mes cuesta solo veinte euros. Los viernes por la noche organizamos fiestas para practicar con los compañeros. Estamos en el centro, al lado de la estación de metro Sol.',
  '',
  'Texto B: Taller de Fotografía Mirada',
  'En este taller aprenderás a hacer buenas fotos con tu móvil o con tu cámara. Los grupos son pequeños, de ocho personas como máximo. Las clases son los sábados por la mañana y siempre salimos a la calle a hacer fotos por la ciudad. Al final del curso, las mejores fotos se presentan en una exposición en la biblioteca municipal. El curso dura tres meses y es necesario traer tu propia cámara o móvil.',
  '',
  'Texto C: Clases de Guitarra Cuerdas',
  'Damos clases individuales de guitarra española en casa del alumno, por eso puedes elegir el día y la hora. Nuestros profesores tienen mucha experiencia con niños y con adultos. Si no tienes guitarra, te prestamos una durante el primer mes. La primera clase es gratis para conocer al profesor. Al final del año, los alumnos dan un pequeño concierto para sus familias en un teatro del barrio.',
].join('\n')

const MOCK_TAREA4 = [
  'El verano pasado, Álvaro decidió hacer algo que soñaba desde hacía años: el Camino de Santiago a pie. Tenía veintiocho años, trabajaba en una oficina en Madrid y, según él, necesitaba «desconectar del ordenador y del ruido». Como no tenía mucho tiempo, eligió el Camino Portugués, que empieza en la ciudad de Tui, en la frontera con Portugal, y tiene unos ciento veinte kilómetros.',
  '',
  'Antes de salir, Álvaro preparó su mochila con mucho cuidado. Llevaba poca ropa, un saco de dormir, unas buenas botas y un cuaderno para escribir un diario. Su madre le dio un pequeño botiquín, porque, como decía ella, «en el camino siempre hay pies con problemas». Y tenía razón: el segundo día Álvaro ya tenía dos heridas en los pies.',
  '',
  'Cada día caminaba entre veinte y veinticinco kilómetros. Se levantaba muy temprano, a las seis, para caminar antes del calor, y por la tarde descansaba en los albergues, donde dormían peregrinos de todo el mundo. Allí conoció a Giulia, una estudiante italiana, y a Peter, un jubilado alemán que hacía el camino por tercera vez. Los tres caminaron juntos hasta el final y hablaban en una mezcla de español, inglés e italiano.',
  '',
  'El día más difícil fue el cuarto. Llovió desde la mañana hasta la noche y Álvaro pensó en volver a casa en autobús. Pero Peter le explicó que en el camino los días malos también son importantes, porque te enseñan a seguir adelante. Esa noche, en el albergue, todos cocinaron juntos una gran tortilla y Álvaro olvidó el cansancio.',
  '',
  'Al sexto día llegaron a Santiago de Compostela. En la plaza del Obradoiro, delante de la catedral, Álvaro se sentó en el suelo y no dijo nada durante un buen rato. «No sé explicarlo, pero estaba muy feliz», escribió en su diario.',
  '',
  'Hoy, un año después, Álvaro sigue en contacto con Giulia y con Peter. El próximo verano quieren hacer juntos otro camino, el del Norte, que va por la costa del Cantábrico. Esta vez Álvaro ya sabe qué no debe olvidar: unas buenas tiritas.',
].join('\n')

/** The DELE A2 Set 1 reading tareas: exam-only, used by the bundled mock and hidden from practice. */
export const mockReadingEsSeeds: ReadingEsExercise[] = [
  {
    id: 'mock-es-a2-set1-reading-tarea1',
    title: 'Un correo desde Valencia',
    content: MOCK_TAREA1,
    textType: 'email',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: words(MOCK_TAREA1),
    topics: ['Trabajo', 'Vivienda', 'Viajes'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-es-a2-set1-reading-tarea1', 'comprehension', [
      {
        question: '¿Para qué escribe Daniel a Sara?',
        options: [
          'Para invitarla a vivir en Valencia.',
          'Para contarle su nueva vida y proponerle una visita.',
          'Para pedirle trabajo en un hotel de Sevilla.',
        ],
        correctAnswer: 1,
        explanation:
          'Daniel cuenta sus novedades en Valencia y escribe: «me gustaría ir a verte a Sevilla».',
      },
      {
        question: '¿Qué dice Daniel de su trabajo?',
        options: [
          'Trabaja también los fines de semana.',
          'Su jefe no le deja hablar inglés.',
          'Puede practicar idiomas con los clientes.',
        ],
        correctAnswer: 2,
        explanation: '«El jefe me deja practicar mi inglés con los clientes extranjeros».',
      },
      {
        question: '¿Cómo es el piso de Daniel?',
        options: [
          'Es pequeño y está en un edificio sin ascensor.',
          'Es grande y muy tranquilo.',
          'Es la casa de su tía Rosa.',
        ],
        correctAnswer: 0,
        explanation: '«He alquilado un estudio pequeño… no tiene ascensor».',
      },
      {
        question: '¿Por qué se ha apuntado Daniel a un club de senderismo?',
        options: [
          'Porque quiere conocer gente.',
          'Porque trabaja en la montaña.',
          'Porque su tía es socia del club.',
        ],
        correctAnswer: 0,
        explanation:
          '«Todavía no conozco a mucha gente, así que me he apuntado a un club de senderismo».',
      },
      {
        question: '¿Qué le pide Daniel a Sara?',
        options: [
          'Que vaya a Valencia en mayo.',
          'Que le preste una guía de viaje.',
          'Que le busque un hotel en Sevilla.',
        ],
        correctAnswer: 1,
        explanation:
          '«¿Todavía tienes la guía de Andalucía que te regalé? Me gustaría llevarla en el viaje».',
      },
    ]),
  },
  {
    id: 'mock-es-a2-set1-reading-tarea2',
    title: 'Anuncios y avisos',
    content: MOCK_TAREA2,
    textType: 'advertisement',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 8,
    wordCount: words(MOCK_TAREA2),
    topics: ['Ciudad', 'Servicios', 'Tiempo libre'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-es-a2-set1-reading-tarea2', 'comprehension', [
      {
        question: 'Texto 1: Según el anuncio, este mes en el gimnasio…',
        options: [
          'no hay que pagar la matrícula.',
          'los domingos abre todo el día.',
          'los niños pueden ir solos.',
        ],
        correctAnswer: 0,
        explanation: '«Este mes, la matrícula es gratis para todos los nuevos socios».',
      },
      {
        question: 'Texto 2: ¿Qué busca Laura?',
        options: [
          'Clases de música.',
          'Una persona para practicar alemán.',
          'Un trabajo en una cafetería.',
        ],
        correctAnswer: 1,
        explanation: '«Busco a una persona alemana para practicar alemán una hora a la semana».',
      },
      {
        question: 'Texto 3: ¿Qué sabemos del gato?',
        options: [
          'Se perdió en el parque el lunes.',
          'Le gustan mucho los perros.',
          'Lleva algo rojo en el cuello.',
        ],
        correctAnswer: 2,
        explanation: '«Lleva un collar rojo»; se perdió el martes y tiene miedo de los perros.',
      },
      {
        question: 'Texto 4: En el cine de verano…',
        options: [
          'algunas películas tienen subtítulos.',
          'las entradas se compran por internet.',
          'si llueve, la película se ve dentro del museo.',
        ],
        correctAnswer: 0,
        explanation: '«Los lunes las películas son en versión original con subtítulos».',
      },
      {
        question: 'Texto 5: Del 3 al 15 de mayo, los viajeros entre Alcalá y Guadalajara…',
        options: [
          'tienen que pagar un autobús.',
          'pueden ir en autobús sin pagar.',
          'llegan veinte minutos antes.',
        ],
        correctAnswer: 1,
        explanation: '«La empresa ofrece autobuses gratuitos»; el viaje dura veinte minutos más.',
      },
      {
        question: 'Texto 6: En la panadería, las tartas de cumpleaños…',
        options: [
          'solo se venden los domingos.',
          'hay que pedirlas dos días antes.',
          'se pueden comprar hasta las siete.',
        ],
        correctAnswer: 1,
        explanation:
          '«Puedes encargar tus tartas de cumpleaños por teléfono con dos días de antelación».',
      },
      {
        question: 'Texto 7: ¿Por qué vende la bicicleta esta persona?',
        options: [
          'Porque está en mal estado.',
          'Porque prefiere una de otro color.',
          'Porque se va a otra ciudad.',
        ],
        correctAnswer: 2,
        explanation: '«La vendo porque me voy a vivir a otra ciudad y no la puedo llevar».',
      },
      {
        question: 'Texto 8: Para los cursos de natación…',
        options: [
          'hay que inscribirse en internet.',
          'los niños tienen que tener doce años.',
          'no es necesario llevar gorro.',
        ],
        correctAnswer: 0,
        explanation: '«Las inscripciones se hacen en internet a partir del 1 de junio».',
      },
    ]),
  },
  {
    id: 'mock-es-a2-set1-reading-tarea3',
    title: 'Tres cursos',
    content: MOCK_TAREA3,
    textType: 'article',
    testingPart: 3,
    difficulty: 'A2',
    estimatedReadingTime: 6,
    wordCount: words(MOCK_TAREA3),
    topics: ['Tiempo libre', 'Cursos'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-es-a2-set1-reading-tarea3', 'matching', [
      {
        question: 'Las clases son en tu propia casa.',
        options: TEXTS,
        correctAnswer: 2,
        explanation:
          'Texto C: «Damos clases individuales de guitarra española en casa del alumno».',
      },
      {
        question: 'Puedes ir aunque no tengas pareja.',
        options: TEXTS,
        correctAnswer: 0,
        explanation: 'Texto A: «No es necesario… venir con pareja».',
      },
      {
        question: 'Tus trabajos se pueden ver en una exposición.',
        options: TEXTS,
        correctAnswer: 1,
        explanation:
          'Texto B: «las mejores fotos se presentan en una exposición en la biblioteca municipal».',
      },
      {
        question: 'La primera clase no cuesta nada.',
        options: TEXTS,
        correctAnswer: 2,
        explanation: 'Texto C: «La primera clase es gratis para conocer al profesor».',
      },
      {
        question:
          'Hay actividades para practicar con los otros alumnos fuera del horario de clase.',
        options: TEXTS,
        correctAnswer: 0,
        explanation:
          'Texto A: «Los viernes por la noche organizamos fiestas para practicar con los compañeros».',
      },
      {
        question: 'Las clases no son en un aula: se hacen en la calle.',
        options: TEXTS,
        correctAnswer: 1,
        explanation: 'Texto B: «siempre salimos a la calle a hacer fotos por la ciudad».',
      },
    ]),
  },
  {
    id: 'mock-es-a2-set1-reading-tarea4',
    title: 'El Camino de Álvaro',
    content: MOCK_TAREA4,
    textType: 'article',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 8,
    wordCount: words(MOCK_TAREA4),
    topics: ['Viajes', 'Experiencias'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-es-a2-set1-reading-tarea4', 'comprehension', [
      {
        question: '¿Por qué eligió Álvaro el Camino Portugués?',
        options: [
          'Porque era el más corto para su tiempo.',
          'Porque vivía en Portugal.',
          'Porque lo recomendaba su madre.',
        ],
        correctAnswer: 0,
        explanation: 'Primer párrafo: «Como no tenía mucho tiempo, eligió el Camino Portugués».',
      },
      {
        question: 'Según el texto, la madre de Álvaro…',
        options: [
          'le preparó la mochila.',
          'le regaló unas botas.',
          'pensaba que iba a tener problemas en los pies.',
        ],
        correctAnswer: 2,
        explanation:
          'Segundo párrafo: su madre le dio un botiquín porque «en el camino siempre hay pies con problemas».',
      },
      {
        question: '¿Por qué se levantaba Álvaro tan temprano?',
        options: [
          'Para encontrar sitio en los albergues.',
          'Para caminar cuando no hacía calor.',
          'Para escribir su diario.',
        ],
        correctAnswer: 1,
        explanation: 'Tercer párrafo: «se levantaba muy temprano… para caminar antes del calor».',
      },
      {
        question: 'Peter…',
        options: ['era un estudiante alemán.', 'ya conocía el camino.', 'hablaba solo en inglés.'],
        correctAnswer: 1,
        explanation:
          'Tercer párrafo: Peter era un jubilado alemán «que hacía el camino por tercera vez».',
      },
      {
        question: '¿Qué pasó el cuarto día?',
        options: [
          'Álvaro volvió a casa en autobús.',
          'Llovió y Álvaro quiso abandonar el camino.',
          'Los tres amigos llegaron a Santiago.',
        ],
        correctAnswer: 1,
        explanation:
          'Cuarto párrafo: llovió todo el día y «Álvaro pensó en volver a casa en autobús», pero siguió.',
      },
      {
        question: '¿Qué planes tienen ahora los tres amigos?',
        options: [
          'Visitar Italia el próximo verano.',
          'Repetir el Camino Portugués.',
          'Hacer otro camino por la costa.',
        ],
        correctAnswer: 2,
        explanation:
          'Último párrafo: «quieren hacer juntos otro camino, el del Norte, que va por la costa».',
      },
    ]),
  },
]
