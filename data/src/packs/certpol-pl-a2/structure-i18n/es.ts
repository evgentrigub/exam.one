import type { StructureText } from '../../../types'

export const es: StructureText = {
  listening: {
    label: 'Comprensión auditiva (Rozumienie ze słuchu)',
    summary:
      'Cinco tareas: quién habla y dónde, un anuncio de radio, un diálogo, mensajes telefónicos y números que anotar. Cada grabación se oye dos veces.',
    scoringNote:
      'Puntos brutos, 1 por ítem (30). La parte escrita (comprensión auditiva, lectura y escritura, 80 puntos) se aprueba con el 50% del total; en A2 no hay mínimo por módulo.',
    parts: {
      1: {
        title: '¿Quién habla? ¿Dónde?',
        format: 'Zadanie I · 10 grabaciones breves · a · b · c',
        short: 'Escucha diez grabaciones breves y decide quién habla o dónde las oyes.',
        goal: 'Reconocer al hablante y la situación de enunciados cotidianos breves.',
        skill: 'Comprensión de la situación.',
      },
      2: {
        title: 'Anuncio de radio',
        format: 'Zadanie II · 5 × prawda / fałsz',
        short: 'Escucha un anuncio de radio y decide si cinco frases son verdaderas o falsas.',
        goal: 'Entender los datos clave de un anuncio público.',
        skill: 'Comprensión detallada.',
      },
      3: {
        title: 'Diálogo',
        format: 'Zadanie III · 5 personas · 7 opciones, 2 sin usar',
        short: 'Escucha una conversación y relaciona a cinco personas con lo que hacen.',
        goal: 'Seguir una conversación y relacionar la información con la persona correcta.',
        skill: 'Comprensión de información específica.',
      },
      4: {
        title: 'Mensajes telefónicos',
        format: 'Zadanie IV · 5 mensajes · 6 opciones, 1 sin usar',
        short: 'Escucha cinco mensajes de contestador y relaciona cada uno con lo que dice.',
        goal: 'Entender la finalidad de mensajes telefónicos breves.',
        skill: 'Comprensión de la idea general.',
      },
      5: {
        title: 'Números',
        format: 'Zadanie V · 5 huecos · una fecha, un número, una hora o un año',
        short: 'Escucha un anuncio y anota cinco números: fechas, horas, precios y años.',
        goal: 'Captar y anotar los números que oyes.',
        skill: 'Toma de notas.',
      },
    },
  },
  reading: {
    label: 'Comprensión de lectura y gramática (Rozumienie tekstów pisanych)',
    summary:
      'Seis tareas: elegir la forma correcta, palabras de un recuadro, carteles públicos, avisos breves, un formulario que rellenar y pies de foto que relacionar.',
    scoringNote:
      'Puntos brutos (30): 0,5 por hueco en las tareas I, II y V, 1 por ítem en las tareas III, IV y VI. En A2 la gramática forma parte de este módulo.',
    parts: {
      1: {
        title: 'La forma correcta',
        format: 'Zadanie I · 10 huecos · elige 1 de 3 formas · 0,5 cada uno',
        short: 'Elige la forma gramatical correcta para cada uno de los diez huecos de un texto.',
        goal: 'Usar el caso, la forma verbal y la forma de la palabra correctos en contexto.',
        skill: 'Gramática en contexto.',
      },
      2: {
        title: 'Palabras de un recuadro',
        format: 'Zadanie II · 10 huecos · 11 palabras, 1 sin usar · 0,5 cada uno',
        short: 'Completa diez frases con palabras de un recuadro.',
        goal: 'Elegir la palabra que encaja con el significado y la gramática de la frase.',
        skill: 'Vocabulario y gramática.',
      },
      3: {
        title: 'Carteles públicos',
        format: 'Zadanie III · 5 carteles · a · b · c',
        short: 'Lee cinco carteles públicos y elige dónde los ves o qué significan.',
        goal: 'Entender los carteles y avisos breves de lugares cotidianos.',
        skill: 'Lectura de textos reales breves.',
      },
      4: {
        title: 'Avisos breves',
        format: 'Zadanie IV · 5 avisos · a · b · c',
        short: 'Lee cinco avisos y mensajes breves y elige la respuesta correcta.',
        goal: 'Entender la información principal de textos prácticos breves.',
        skill: 'Lectura de información específica.',
      },
      5: {
        title: 'Rellenar un formulario',
        format: 'Zadanie V · un texto y un formulario · 10 huecos · 0,5 cada uno',
        short:
          'Lee lo que escribe una persona sobre sí misma y rellena diez campos de un formulario.',
        goal: 'Encontrar información personal en un texto y anotarla correctamente.',
        skill: 'Lectura detallada.',
      },
      6: {
        title: 'Pies de foto',
        format: 'Zadanie VI · 5 escenas · 6 pies de foto, 1 sin usar',
        short: 'Relaciona cinco escenas con los pies de foto que las describen.',
        goal: 'Relacionar una descripción breve con la situación que muestra.',
        skill: 'Lectura del significado.',
      },
    },
  },
  writing: {
    label: 'Expresión escrita (Pisanie)',
    summary:
      'Un texto breve (una felicitación o un mensaje) y un texto más largo (una descripción o una carta).',
    scoringNote:
      'Oficialmente es un único bloque de dos tareas que se puntúan juntas: cumplimiento de la tarea 6, variedad lingüística 7, corrección 7 (20). La práctica puntúa cada tarea con los mismos criterios: 2/2/2 y 4/5/5.',
    parts: {
      1: {
        title: 'Texto breve',
        format: 'Zadanie a · felicitación o mensaje · 10–30 palabras',
        short: 'Escribe una felicitación o un mensaje breve para una ocasión cotidiana.',
        goal: 'Escribir un mensaje personal breve que cumpla lo que pide la tarea.',
        skill: 'Escritura funcional breve.',
      },
      2: {
        title: 'Texto más largo',
        format: 'Zadanie b · descripción o carta · 70–100 palabras',
        short:
          'Escribe una descripción de una persona, un lugar o un acontecimiento, o una carta personal breve.',
        goal: 'Escribir un texto coherente que trate todos los puntos de la tarea.',
        skill: 'Escritura descriptiva.',
      },
    },
  },
  speaking: {
    label: 'Expresión oral (Mówienie)',
    summary:
      'Responde a las preguntas del examinador sobre ti, describe a una persona en una foto y representa una situación con el examinador.',
    scoringNote:
      'Práctica, a partir de tu transcripción: cumplimiento de la tarea 4 + 10 + 10 y vocabulario y gramática 6 cada uno, repartidos entre las tareas (36). El examen también evalúa la pronunciación (0–4) hasta 40 puntos y se aprueba con el 50% (20).',
    parts: {
      1: {
        title: 'Sobre ti',
        format: 'Zadanie 1 · preguntas del examinador · 4 respuestas',
        short:
          'Responde a las preguntas del examinador sobre ti, tu familia, tus intereses y tu trabajo o estudios.',
        goal: 'Dar información personal sencilla con frases completas.',
        skill: 'Responder preguntas.',
      },
      2: {
        title: 'Describir una foto',
        format: 'Zadanie 2 · una persona en una foto · monólogo',
        short: 'Describe a la persona de una foto: quién es, qué aspecto tiene, qué está haciendo.',
        goal: 'Describir a una persona y una situación en un monólogo breve y coherente.',
        skill: 'Descripción.',
      },
      3: {
        title: 'Juego de rol',
        format: 'Zadanie 3 · una situación con el examinador · 4 turnos',
        short:
          'Representa una situación cotidiana: empieza la conversación y luego reacciona a lo que dice el examinador.',
        goal: 'Invitar, proponer, quedar y reaccionar en una conversación cotidiana sencilla.',
        skill: 'Interacción.',
      },
    },
  },
}
