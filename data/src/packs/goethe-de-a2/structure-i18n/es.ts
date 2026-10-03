import type { StructureText } from '../../../types'

export const es: StructureText = {
  reading: {
    label: 'Comprensión de lectura (Lesen)',
    summary:
      'Cuatro textos breves de dificultad creciente. Lees para captar la idea general y los detalles, y relacionas ofertas con personas.',
    scoringNote: 'Puntos brutos (Messpunkte) × 1,25 → puntos del resultado.',
    parts: {
      1: {
        title: 'Artículo o texto periodístico',
        format: '5 × opción múltiple (a · b · c)',
        short: 'Lee un artículo breve (~200 palabras) y responde 5 preguntas a/b/c.',
        goal: 'Entender las ideas principales y los detalles clave de un texto informativo.',
        skill: 'Lectura detallada de textos cotidianos auténticos.',
      },
      2: {
        title: 'Panel informativo / horario',
        format: '5 situaciones · elige el lugar (a · b · c)',
        short:
          'Busca información en un panel informativo o un horario: elige la planta o el lugar correctos.',
        goal: 'Localizar rápidamente un dato concreto en carteles cotidianos.',
        skill: 'Lectura selectiva / de búsqueda.',
      },
      3: {
        title: 'Carta o correo personal',
        format: '5 × opción múltiple (a · b · c)',
        short: 'Lee un correo personal (~230 palabras) y responde 5 preguntas a/b/c.',
        goal: 'Captar intenciones, sentimientos y detalles en la correspondencia personal.',
        skill: 'Lectura de correspondencia privada.',
      },
      4: {
        title: 'Relacionar anuncios',
        format: 'Relaciona los anuncios a–f con 5 personas (una respuesta es siempre "x")',
        short: 'Relaciona cada persona con el anuncio adecuado: una nunca tiene anuncio (x).',
        goal: 'Relacionar las necesidades de cada persona con una oferta adecuada.',
        skill: 'Relacionar e inferir con presión de tiempo.',
      },
    },
  },
  listening: {
    label: 'Comprensión auditiva (Hören)',
    summary:
      'Cuatro grabaciones: anuncios, un diálogo largo para relacionar, intercambios breves y una entrevista.',
    scoringNote: 'Puntos brutos (Messpunkte) × 1,25 → puntos del resultado.',
    parts: {
      1: {
        title: 'Anuncios y mensajes de voz',
        format: '5 × opción múltiple (a · b · c) · se oye dos veces',
        short: 'Anuncios y mensajes breves: 5 preguntas, el audio se oye dos veces.',
        goal: 'Captar la información clave de mensajes orales breves.',
        skill: 'Comprensión detallada de audios breves.',
      },
      2: {
        title: 'Un diálogo largo para relacionar',
        format: 'Relaciona 5 personas con 9 opciones · se oye una vez',
        short: 'Un diálogo largo: relaciona personas con opciones, 9 opciones, se oye una vez.',
        goal: 'Seguir una conversación más larga y asignar a cada persona el dato correcto.',
        skill: 'Relacionar mientras escuchas.',
      },
      3: {
        title: 'Diálogos cotidianos',
        format: '5 × opción múltiple (a · b · c) · se oye una vez',
        short: 'Conversaciones cotidianas breves: 5 preguntas de opción múltiple, se oyen una vez.',
        goal: 'Entender intercambios breves en situaciones diarias.',
        skill: 'Idea general y detalles en una conversación.',
      },
      4: {
        title: 'Entrevista de radio',
        format: '5 × Ja / Nein · se oye dos veces',
        short:
          'Una entrevista de radio: decide si 5 afirmaciones son correctas (Ja / Nein), se oye dos veces.',
        goal: 'Entender opiniones y afirmaciones en una entrevista más larga.',
        skill: 'Juicio de verdadero / falso.',
      },
    },
  },
  writing: {
    label: 'Expresión escrita (Schreiben)',
    summary: 'Dos textos breves: un mensaje informal a un amigo y un correo formal y educado.',
    scoringNote:
      'Máx. 20 puntos brutos × 1,25. Por debajo del mínimo de palabras, esa parte puntúa 0.',
    parts: {
      1: {
        title: 'Mensaje informal / SMS',
        format: '"du" informal · 20–30 palabras',
        short: 'Escribe un mensaje breve e informal a un amigo con "du" y 3 puntos de contenido.',
        goal: 'Comunicar información personal sencilla en un registro informal.',
        skill: 'Escritura cotidiana informal.',
      },
      2: {
        title: 'Correo semiformal / formal',
        format: '"Sie" formal · 30–40 palabras',
        short:
          'Escribe un correo educado con "Sie", con saludo, despedida y 3 puntos de contenido.',
        goal: 'Hacer una petición o responder con educación en un registro formal.',
        skill: 'Correspondencia formal.',
      },
    },
  },
  speaking: {
    label: 'Expresión oral (Sprechen)',
    summary:
      'Un examen en parejas en tres fases: una entrevista breve, un monólogo sobre ti y planificar algo juntos.',
    scoringNote:
      'Puntos directos 4 + 8 + 8 + 5 de pronunciación = 25 (sin el multiplicador × 1,25).',
    parts: {
      1: {
        title: 'Entrevista',
        format: 'Haz y responde 4 preguntas con tarjetas (4 pts)',
        short: 'Hazle 4 preguntas a tu compañero con las tarjetas y responde a las suyas.',
        goal: 'Intercambiar información personal en una entrevista sencilla.',
        skill: 'Hacer y responder preguntas.',
      },
      2: {
        title: 'Monólogo',
        format: 'Habla de un tema con 4 palabras clave + preguntas posteriores (8 pts)',
        short:
          'Habla de ti sobre un tema con 4 palabras clave y luego responde a las preguntas del examinador.',
        goal: 'Hablar con coherencia sobre temas personales y conocidos.',
        skill: 'Discurso estructurado y coherente.',
      },
      3: {
        title: 'Diálogo y planificación',
        format: 'Planificad juntos con una agenda con huecos ocupados (8 pts)',
        short:
          'Planificad juntos una actividad común con una agenda personal que tiene huecos ocupados.',
        goal: 'Negociar y acordar un plan con un compañero.',
        skill: 'Negociación interactiva.',
      },
    },
  },
}
