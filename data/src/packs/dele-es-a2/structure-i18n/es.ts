import type { StructureText } from '../../../types'

export const es: StructureText = {
  reading: {
    label: 'Comprensión de lectura',
    summary:
      'Cuatro tareas: una carta o un correo personal, ocho anuncios y avisos breves, tres textos que relacionar con enunciados y un texto narrativo más largo.',
    scoringNote:
      'Puntos brutos, 1 por ítem (25). El examen agrupa Comprensión de lectura y Expresión escrita en el Grupo 1 (50 puntos); para aprobar hacen falta 30 en cada grupo.',
    parts: {
      1: {
        title: 'Carta o correo personal',
        format: 'Tarea 1 · 1 texto · 5 preguntas · a · b · c',
        short: 'Lee una carta o un correo personal y responde cinco preguntas sobre él.',
        goal: 'Entender la información principal y los detalles de un mensaje personal.',
        skill: 'Lectura detallada.',
      },
      2: {
        title: 'Anuncios y avisos',
        format: 'Tarea 2 · 8 textos breves · 1 pregunta cada uno · a · b · c',
        short:
          'Lee ocho anuncios, avisos o publicaciones breves y responde una pregunta sobre cada uno.',
        goal: 'Encontrar información concreta en textos públicos breves.',
        skill: 'Lectura de información específica.',
      },
      3: {
        title: 'Tres textos',
        format: 'Tarea 3 · 3 textos · 6 enunciados · A · B · C',
        short:
          'Lee tres textos breves y decide a qué texto se refiere cada uno de los seis enunciados.',
        goal: 'Comparar textos parecidos y localizar cada dato.',
        skill: 'Lectura de información específica.',
      },
      4: {
        title: 'Texto narrativo',
        format: 'Tarea 4 · 1 texto · 6 preguntas · a · b · c',
        short:
          'Lee un texto más largo (una biografía, un blog, un relato o una guía de viaje) y responde seis preguntas.',
        goal: 'Seguir un texto narrativo más largo y entender sus detalles.',
        skill: 'Lectura detallada.',
      },
    },
  },
  listening: {
    label: 'Comprensión auditiva',
    summary:
      'Cuatro tareas: seis conversaciones breves, seis fragmentos de radio, una conversación para relacionar con los hablantes y siete mensajes breves. Cada grabación se oye dos veces.',
    scoringNote:
      'Puntos brutos, 1 por ítem (25). El examen agrupa Comprensión auditiva y Expresión oral en el Grupo 2 (50 puntos); para aprobar hacen falta 30 en cada grupo.',
    parts: {
      1: {
        title: 'Conversaciones breves',
        format: 'Tarea 1 · 6 conversaciones · a · b · c',
        short:
          'Escucha seis conversaciones cotidianas breves y responde una pregunta sobre cada una.',
        goal: 'Entender la información clave de conversaciones breves cara a cara.',
        skill: 'Comprensión de información específica.',
      },
      2: {
        title: 'Radio',
        format: 'Tarea 2 · 6 fragmentos de radio · a · b · c',
        short:
          'Escucha seis fragmentos breves de radio – noticias, anuncios, avisos – y responde una pregunta sobre cada uno.',
        goal: 'Entender la idea principal de textos radiofónicos breves.',
        skill: 'Comprensión de la idea general y los detalles.',
      },
      3: {
        title: '¿Quién lo dice?',
        format: 'Tarea 3 · 1 conversación · 6 enunciados · hombre · mujer · ninguno de los dos',
        short:
          'Escucha una conversación entre dos amigos y decide quién dice cada una de las seis cosas: el hombre, la mujer o ninguno de los dos.',
        goal: 'Seguir una conversación y relacionar la información con el hablante correcto.',
        skill: 'Comprensión de información específica.',
      },
      4: {
        title: 'Mensajes',
        format: 'Tarea 4 · 7 mensajes · 10 enunciados, 3 sin usar',
        short: 'Escucha siete mensajes y avisos breves y relaciona cada uno con lo que dice.',
        goal: 'Entender la finalidad de mensajes y avisos breves.',
        skill: 'Comprensión de la idea general.',
      },
    },
  },
  writing: {
    label: 'Expresión e interacción escritas',
    summary:
      'Una respuesta a un mensaje breve (60–70 palabras) y un texto sobre la vida cotidiana o una biografía (70–80 palabras).',
    scoringNote:
      'La práctica puntúa cada tarea con las dos escalas del examen, 0–3 cada una: cumplimiento de la tarea y uso de la lengua. El examen pondera el uso de la lengua al 66% y el cumplimiento de la tarea al 34%, y convierte el resultado a 25 puntos (×25/3); la práctica muestra las bandas brutas, donde 2 significa que se alcanza el A2.',
    parts: {
      1: {
        title: 'Responder a un mensaje',
        format: 'Tarea 1 · correo, nota o publicación · 60–70 palabras',
        short:
          'Lee un mensaje breve de un amigo y escribe una respuesta que trate todos los puntos.',
        goal: 'Escribir un mensaje personal que responda, informe y proponga.',
        skill: 'Interacción escrita.',
      },
      2: {
        title: 'Vida cotidiana o biografía',
        format: 'Tarea 2 · Opción A u Opción B · 70–80 palabras',
        short:
          'Escribe sobre una experiencia de tu vida cotidiana (Opción A) o una biografía o historia a partir de los datos dados (Opción B).',
        goal: 'Escribir un texto coherente sobre el pasado y el presente.',
        skill: 'Expresión escrita.',
      },
    },
  },
  speaking: {
    label: 'Expresión e interacción orales',
    summary:
      'Una breve presentación sobre un tema, la descripción de una escena y un juego de rol con el entrevistador en esa escena. El examen da 12 minutos de preparación.',
    scoringNote:
      'Práctica, a partir de tu transcripción: cada tarea con las dos escalas del examen, 0–3 cada una: cumplimiento de la tarea y uso de la lengua (18). El examen también da una calificación global de toda la prueba y la convierte a 25 puntos; la práctica muestra las bandas brutas, donde 2 significa que se alcanza el A2.',
    parts: {
      1: {
        title: 'Presentación',
        format: 'Tarea 1 · un tema · 5 puntos · monólogo',
        short:
          'Haz una breve presentación sobre ti a partir de un tema, tratando los puntos de la tarjeta.',
        goal: 'Hablar de tu vida en un monólogo breve y coherente.',
        skill: 'Expresión oral.',
      },
      2: {
        title: 'Describir una escena',
        format: 'Tarea 2 · una escena · preguntas guía · monólogo',
        short:
          'Describe una escena cotidiana: las personas, el lugar, qué hacen y cómo se sienten.',
        goal: 'Describir personas y una situación con ayuda de preguntas guía.',
        skill: 'Descripción.',
      },
      3: {
        title: 'Juego de rol',
        format: 'Tarea 3 · una situación con el entrevistador · 4 turnos',
        short:
          'Representa con el entrevistador una situación de la escena: responde, pregunta y reacciona.',
        goal: 'Participar en una transacción o una conversación cotidiana sencilla.',
        skill: 'Interacción oral.',
      },
    },
  },
}
