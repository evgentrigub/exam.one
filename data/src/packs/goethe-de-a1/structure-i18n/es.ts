import type { StructureText } from '../../../types'

const SCORING_NOTE =
  'Puntos brutos, 1 por ítem. El resultado oficial multiplica cada módulo por 1,66 (15 → 25 puntos).'

export const es: StructureText = {
  reading: {
    label: 'Comprensión de lectura (Lesen)',
    summary:
      'Tres tareas breves: dos mensajes personales, elegir la página web o el anuncio correctos y carteles cotidianos.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Mensajes personales breves',
        format: '5 × Richtig / Falsch',
        short: 'Lee dos mensajes breves y decide si 5 afirmaciones son correctas.',
        goal: 'Entender los datos clave de notas y correos personales breves.',
        skill: 'Lectura detallada de textos muy breves.',
      },
      2: {
        title: 'Páginas web y anuncios',
        format: '5 situaciones · elige a o b',
        short:
          'Para cada situación, elige cuál de los dos textos breves tiene la información que necesitas.',
        goal: 'Localizar información concreta en textos cotidianos breves.',
        skill: 'Lectura selectiva.',
      },
      3: {
        title: 'Carteles y avisos',
        format: '5 × Richtig / Falsch',
        short: 'Lee cinco carteles y avisos y decide si cada afirmación es correcta.',
        goal: 'Entender carteles públicos, avisos e instrucciones breves.',
        skill: 'Lectura de carteles cotidianos.',
      },
    },
  },
  listening: {
    label: 'Comprensión auditiva (Hören)',
    summary:
      'Conversaciones breves, anuncios públicos y mensajes telefónicos, con una pregunta cada uno.',
    scoringNote: SCORING_NOTE,
    parts: {
      1: {
        title: 'Conversaciones breves',
        format: '6 × opción múltiple (a · b · c) · se oye dos veces',
        short: 'Seis conversaciones cotidianas breves, con una pregunta a/b/c cada una.',
        goal: 'Captar un número, una hora, un precio o un lugar en una conversación breve.',
        skill: 'Comprensión de información específica.',
      },
      2: {
        title: 'Anuncios públicos',
        format: '4 × Richtig / Falsch · se oye una vez',
        short:
          'Cuatro anuncios en una estación, un aeropuerto o una tienda: ¿es correcta la afirmación?',
        goal: 'Entender el mensaje clave de un anuncio público.',
        skill: 'Juicio de verdadero / falso.',
      },
      3: {
        title: 'Mensajes telefónicos',
        format: '5 × opción múltiple (a · b · c) · se oye dos veces',
        short: 'Cinco mensajes de contestador, con una pregunta a/b/c cada uno.',
        goal: 'Anotar el dato importante de un mensaje telefónico.',
        skill: 'Comprensión de información específica.',
      },
    },
  },
  writing: {
    label: 'Expresión escrita (Schreiben)',
    summary:
      'Completa cinco datos que faltan en un formulario y luego escribe un mensaje breve de unas 30 palabras.',
    scoringNote:
      'Formulario: 1 punto por dato. Mensaje: 3 por punto de contenido + 1 por el saludo y la despedida.',
    parts: {
      1: {
        title: 'Rellenar un formulario',
        format: '5 datos que faltan',
        short: 'Lee sobre un amigo y completa los cinco datos que faltan en un formulario.',
        goal: 'Completar un formulario con datos personales sencillos.',
        skill: 'Rellenar formularios.',
      },
      2: {
        title: 'Mensaje breve',
        format: 'Unas 30 palabras · 3 puntos de contenido',
        short: 'Escribe un mensaje breve con un saludo, tres puntos de contenido y una despedida.',
        goal: 'Escribir un mensaje breve personal o semiformal.',
        skill: 'Escritura cotidiana breve.',
      },
    },
  },
  speaking: {
    label: 'Expresión oral (Sprechen)',
    summary:
      'Preséntate, haz y responde preguntas sobre dos temas, y formula peticiones y responde a ellas.',
    scoringNote: 'Puntos directos 3 + 6 + 6 = 15 (el resultado oficial multiplica por 1,66).',
    parts: {
      1: {
        title: 'Preséntate',
        format: 'Palabras clave · deletrear una palabra · decir un número (3 pts)',
        short: 'Preséntate con las palabras clave y luego deletrea una palabra y di un número.',
        goal: 'Dar información básica sobre ti.',
        skill: 'Presentación personal sencilla.',
      },
      2: {
        title: 'Preguntar y responder',
        format: 'Tarjetas de palabras sobre 2 temas (6 pts)',
        short:
          'Haz una pregunta a partir de una tarjeta y luego responde a la pregunta de tu compañero.',
        goal: 'Pedir y dar información sencilla sobre temas cotidianos.',
        skill: 'Hacer y responder preguntas.',
      },
      3: {
        title: 'Peticiones',
        format: 'Tarjetas de peticiones, 2 rondas (6 pts)',
        short:
          'Haz una petición educada a partir de una tarjeta y luego reacciona a la petición de tu compañero.',
        goal: 'Formular peticiones cotidianas y responder a ellas.',
        skill: 'Peticiones y reacciones.',
      },
    },
  },
}
