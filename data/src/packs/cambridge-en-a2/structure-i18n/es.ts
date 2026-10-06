import type { StructureText } from '../../../types'

export const es: StructureText = {
  reading: {
    label: 'Comprensión de lectura',
    summary:
      'Cinco partes: avisos breves, relacionar preguntas con tres textos, un artículo más largo y dos textos con huecos.',
    scoringNote:
      'Puntos brutos, 1 por ítem (30). En los exámenes de práctica, unos 20/30 equivalen a 120 en la Cambridge English Scale (Grade C) y 28/30 a 140 (Grade A).',
    parts: {
      1: {
        title: 'Textos breves',
        format: '6 avisos y mensajes · A · B · C',
        short: 'Lee seis avisos y mensajes breves y elige qué dice cada uno.',
        goal: 'Entender el mensaje principal de carteles, notas y correos breves.',
        skill: 'Lectura de textos reales breves.',
      },
      2: {
        title: 'Tres textos',
        format: '7 preguntas · relaciona con el texto A · B · C',
        short: 'Lee tres textos breves sobre un tema y decide qué texto responde a cada pregunta.',
        goal: 'Encontrar información concreta y detalles en tres textos.',
        skill: 'Lectura de búsqueda y relación múltiple.',
      },
      3: {
        title: 'Texto más largo',
        format: '5 × opción múltiple (A · B · C)',
        short: 'Lee un artículo de revista y responde cinco preguntas.',
        goal: 'Entender las ideas principales y los detalles de un texto más largo.',
        skill: 'Lectura detallada.',
      },
      4: {
        title: 'Texto con huecos de opción múltiple',
        format: '6 huecos · elige A · B · C',
        short:
          'Elige la palabra correcta para cada uno de los seis huecos de un texto informativo breve.',
        goal: 'Usar la palabra correcta en contexto: vocabulario y algo de gramática.',
        skill: 'Vocabulario en contexto.',
      },
      5: {
        title: 'Texto con huecos abiertos',
        format: '6 huecos · escribe una palabra',
        short: 'Escribe una palabra en cada uno de los seis huecos de un correo.',
        goal: 'Usar bien las palabras gramaticales: preposiciones, pronombres, verbos y conectores.',
        skill: 'Gramática y estructura.',
      },
    },
  },
  writing: {
    label: 'Expresión escrita',
    summary:
      'Escribe un correo o una nota breve (Part 6) y una historia breve a partir de tres imágenes (Part 7).',
    scoringNote:
      'Cada tarea: Content, Organisation y Language, 0–5 cada uno (15). En los exámenes de práctica, unos 18/30 equivalen a 120 en la escala y 26/30 a 140.',
    parts: {
      1: {
        title: 'Correo o nota',
        format: 'Reading & Writing Part 6 · 25+ palabras · 3 puntos',
        short: 'Escribe un correo o una nota de 25 palabras o más que trate los tres puntos.',
        goal: 'Escribir un mensaje cotidiano breve con toda la información pedida.',
        skill: 'Escritura guiada.',
      },
      2: {
        title: 'Historia con imágenes',
        format: 'Reading & Writing Part 7 · 35+ palabras · 3 imágenes',
        short: 'Escribe una historia breve de 35 palabras o más sobre tres imágenes.',
        goal: 'Contar una historia sencilla y coherente sobre las tres imágenes.',
        skill: 'Escritura narrativa.',
      },
    },
  },
  listening: {
    label: 'Comprensión auditiva',
    summary:
      'Conversaciones breves, una charla con notas que completar, una conversación más larga, grabaciones breves y una tarea de relacionar. Cada grabación se oye dos veces.',
    scoringNote:
      'Puntos brutos, 1 por ítem (25). En los exámenes de práctica, unos 17/25 equivalen a 120 en la escala y 23/25 a 140.',
    parts: {
      1: {
        title: 'Conversaciones breves',
        format: '5 × opción múltiple (A · B · C)',
        short: 'Cinco conversaciones breves, con una pregunta cada una.',
        goal: 'Captar información clave: horas, precios, lugares, cosas.',
        skill: 'Comprensión de información específica.',
      },
      2: {
        title: 'Notas',
        format: '5 huecos · una palabra, un número, una fecha o una hora',
        short: 'Escucha una charla y completa cinco notas.',
        goal: 'Anotar datos clave, incluidos nombres deletreados y números.',
        skill: 'Toma de notas.',
      },
      3: {
        title: 'Conversación más larga',
        format: '5 × opción múltiple (A · B · C)',
        short: 'Escucha a dos personas hablando y responde cinco preguntas.',
        goal: 'Seguir una conversación, incluido lo que piensa cada hablante.',
        skill: 'Comprensión de detalles y opiniones.',
      },
      4: {
        title: 'Grabaciones breves',
        format: '5 × opción múltiple (A · B · C)',
        short: 'Cinco grabaciones breves, con una pregunta sobre la idea principal de cada una.',
        goal: 'Entender la idea principal, el motivo o el sentimiento de una grabación breve.',
        skill: 'Comprensión de la idea general.',
      },
      5: {
        title: 'Relacionar',
        format: '5 ítems · 8 opciones, 3 sin usar',
        short: 'Escucha una conversación y relaciona a cinco personas con la opción correcta.',
        goal: 'Seguir una conversación con atención y relacionar información.',
        skill: 'Comprensión de información específica.',
      },
    },
  },
  speaking: {
    label: 'Expresión oral',
    summary:
      'Responde a las preguntas del examinador sobre ti y luego comenta un conjunto de imágenes.',
    scoringNote:
      'Práctica: Grammar and Vocabulary, Interactive Communication y Global Achievement, 0–5 cada uno por parte, a partir de tu transcripción. El examen también evalúa Pronunciation y pondera las escalas hasta 45 puntos; unos 27/45 equivalen a 120 en la escala.',
    parts: {
      1: {
        title: 'Entrevista',
        format: 'Preguntas del examinador · 5 respuestas',
        short: 'Responde a las preguntas del examinador sobre ti y sobre un tema cotidiano.',
        goal: 'Dar información personal y hablar un poco de temas cotidianos.',
        skill: 'Responder preguntas.',
      },
      2: {
        title: 'Conversación',
        format: 'Imágenes · opiniones · preguntas posteriores',
        short:
          'Di qué opinas de algunas actividades, pregunta a tu compañero y responde a las preguntas posteriores.',
        goal: 'Dar y pedir opiniones, y decir qué prefieres y por qué.',
        skill: 'Hablar de gustos y preferencias.',
      },
    },
  },
}
