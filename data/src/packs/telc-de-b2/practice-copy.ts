import type { ModuleText, PartText, SkillId, StructureText } from '../../types'
import type { ModuleDefinition, TaskDefinition } from './runtime'
import { titles } from './titles'

const locales = ['en', 'de', 'es', 'pl', 'ru'] as const
export type CopyLocale = (typeof locales)[number]

const copy = {
  en: {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
    part: 'Part',
    items: 'items',
    options: 'options',
    words: 'words',
    turns: 'responses',
    official: 'official items',
    choice: 'Choose the correct answer for each item.',
    matching: 'Match each item to one option from the bank.',
    tf: 'Decide whether each statement is richtig or falsch.',
    write: 'Write a semi-formal e-mail that covers three of the four points.',
    speak: 'Record each response to the cards. Fixed partner lines support solo practice.',
    readGoal: 'Understand the main message, details and specific information in texts.',
    listenGoal: 'Follow news, an interview and short announcements heard once.',
    writeGoal: 'Write a clear, well-organised semi-formal e-mail at B2.',
    speakGoal: 'Report experiences, discuss arguments and plan together at B2.',
    summaries: {
      reading:
        'Leseverstehen (Parts 1–3) and Sprachbausteine (Parts 4–5) share 90 minutes, as in the written exam.',
      listening: 'News bulletin, interview and short announcements; every recording plays once.',
      writing: 'One semi-formal e-mail: Aufgabe A (request for information) or B (complaint).',
      speaking: 'Experience report, discussion of a text and joint planning, simulated solo.',
    },
    notes: {
      reading: 'Lesen 75 + Sprachbausteine 30 points; raw practice marks.',
      listening: 'Raw practice marks; each recording is played once.',
      writing: 'Three criteria rated A–D (5/3/1/0) × 3; formative estimate.',
      speaking:
        'Three criteria rated A–D (7/5/3/0) per part; pronunciation is not scored; provisional.',
    },
    tip: 'Read the task first and check every condition in the text.',
  },
  de: {
    labels: ['Leseverstehen', 'Schriftlicher Ausdruck', 'Hörverstehen', 'Mündlicher Ausdruck'],
    part: 'Teil',
    items: 'Aufgaben',
    options: 'Optionen',
    words: 'Wörter',
    turns: 'Antworten',
    official: 'Prüfungsaufgaben',
    choice: 'Wählen Sie für jede Aufgabe die richtige Lösung.',
    matching: 'Ordnen Sie jeder Aufgabe eine Lösung aus der Auswahl zu.',
    tf: 'Entscheiden Sie, ob jede Aussage richtig oder falsch ist.',
    write: 'Schreiben Sie eine halbformelle E-Mail zu drei der vier Leitpunkte.',
    speak:
      'Nehmen Sie jede Antwort zu den Karten auf. Feste Partnerbeiträge unterstützen das Üben allein.',
    readGoal: 'Hauptaussagen, Einzelheiten und gezielte Informationen in Texten verstehen.',
    listenGoal: 'Nachrichten, ein Interview und kurze Ansagen nach einmaligem Hören verstehen.',
    writeGoal: 'Eine klare, gut gegliederte halbformelle E-Mail auf B2-Niveau schreiben.',
    speakGoal:
      'Auf B2-Niveau über Erfahrungen berichten, Argumente diskutieren und gemeinsam planen.',
    summaries: {
      reading:
        'Leseverstehen (Teile 1–3) und Sprachbausteine (Teile 4–5) teilen sich 90 Minuten wie in der schriftlichen Prüfung.',
      listening: 'Nachrichten, Interview und kurze Ansagen; jede Aufnahme wird einmal gehört.',
      writing: 'Eine halbformelle E-Mail: Aufgabe A (Bitte um Informationen) oder B (Beschwerde).',
      speaking:
        'Erfahrungsbericht, Diskussion über einen Text und gemeinsame Planung, allein simuliert.',
    },
    notes: {
      reading: 'Lesen 75 + Sprachbausteine 30 Punkte; Übungspunkte.',
      listening: 'Übungspunkte; jede Aufnahme wird einmal gehört.',
      writing: 'Drei Kriterien mit A–D (5/3/1/0) × 3; lernorientierte Schätzung.',
      speaking:
        'Drei Kriterien mit A–D (7/5/3/0) pro Teil; Aussprache wird nicht bewertet; vorläufig.',
    },
    tip: 'Lesen Sie zuerst die Aufgabe und prüfen Sie jede Bedingung im Text.',
  },
  es: {
    labels: [
      'Comprensión de lectura',
      'Expresión escrita',
      'Comprensión auditiva',
      'Expresión oral',
    ],
    part: 'Parte',
    items: 'ítems',
    options: 'opciones',
    words: 'palabras',
    turns: 'respuestas',
    official: 'ítems oficiales',
    choice: 'Elige la respuesta correcta para cada ítem.',
    matching: 'Relaciona cada ítem con una opción del banco.',
    tf: 'Decide si cada afirmación es richtig (correcta) o falsch (falsa).',
    write: 'Escribe un correo semiformal que trate tres de los cuatro puntos.',
    speak:
      'Graba cada respuesta a las tarjetas. Las intervenciones fijas del compañero permiten practicar a solas.',
    readGoal: 'Comprender la idea principal, los detalles y la información concreta de textos.',
    listenGoal: 'Seguir noticias, una entrevista y avisos breves escuchados una sola vez.',
    writeGoal: 'Escribir un correo semiformal claro y bien organizado de nivel B2.',
    speakGoal: 'Relatar experiencias, debatir argumentos y planificar en común en nivel B2.',
    summaries: {
      reading:
        'Leseverstehen (partes 1–3) y Sprachbausteine (partes 4–5) comparten 90 minutos, como en el examen escrito.',
      listening: 'Noticias, entrevista y avisos breves; cada grabación se escucha una vez.',
      writing: 'Un correo semiformal: Aufgabe A (solicitud de información) o B (reclamación).',
      speaking:
        'Relato de una experiencia, debate sobre un texto y planificación conjunta, a solas.',
    },
    notes: {
      reading: 'Lesen 75 + Sprachbausteine 30 puntos; puntos de práctica.',
      listening: 'Puntos de práctica; cada grabación se escucha una vez.',
      writing: 'Tres criterios A–D (5/3/1/0) × 3; estimación formativa.',
      speaking:
        'Tres criterios A–D (7/5/3/0) por parte; la pronunciación no se evalúa; provisional.',
    },
    tip: 'Lee primero la tarea y comprueba cada condición en el texto.',
  },
  pl: {
    labels: ['Rozumienie tekstów pisanych', 'Pisanie', 'Rozumienie ze słuchu', 'Mówienie'],
    part: 'Część',
    items: 'zadań',
    options: 'opcji',
    words: 'słów',
    turns: 'wypowiedzi',
    official: 'zadania egzaminu',
    choice: 'Wybierz poprawną odpowiedź w każdym zadaniu.',
    matching: 'Dopasuj do każdego zadania jedną opcję z banku.',
    tf: 'Zdecyduj, czy każde stwierdzenie jest richtig (prawdziwe) czy falsch (fałszywe).',
    write: 'Napisz półformalny e-mail, odnosząc się do trzech z czterech punktów.',
    speak:
      'Nagraj każdą wypowiedź do kart. Stałe kwestie partnera umożliwiają samodzielne ćwiczenie.',
    readGoal: 'Rozumieć główną myśl, szczegóły i konkretne informacje w tekstach.',
    listenGoal: 'Rozumieć wiadomości, wywiad i krótkie komunikaty słyszane raz.',
    writeGoal: 'Napisać jasny, dobrze zorganizowany półformalny e-mail na poziomie B2.',
    speakGoal: 'Opowiadać o doświadczeniach, dyskutować i wspólnie planować na poziomie B2.',
    summaries: {
      reading:
        'Leseverstehen (części 1–3) i Sprachbausteine (części 4–5) mają wspólne 90 minut, jak na egzaminie pisemnym.',
      listening: 'Wiadomości, wywiad i krótkie komunikaty; każde nagranie słychać raz.',
      writing: 'Jeden półformalny e-mail: Aufgabe A (prośba o informacje) lub B (reklamacja).',
      speaking:
        'Relacja z doświadczenia, dyskusja o tekście i wspólne planowanie, ćwiczone samodzielnie.',
    },
    notes: {
      reading: 'Lesen 75 + Sprachbausteine 30 punktów; punkty ćwiczeniowe.',
      listening: 'Punkty ćwiczeniowe; każde nagranie słychać raz.',
      writing: 'Trzy kryteria A–D (5/3/1/0) × 3; szacunek do nauki.',
      speaking: 'Trzy kryteria A–D (7/5/3/0) w każdej części; wymowa nie jest oceniana; wstępnie.',
    },
    tip: 'Najpierw przeczytaj zadanie i sprawdź każdy warunek w tekście.',
  },
  ru: {
    labels: ['Чтение', 'Письмо', 'Аудирование', 'Говорение'],
    part: 'Часть',
    items: 'заданий',
    options: 'вариантов',
    words: 'слов',
    turns: 'ответов',
    official: 'задания экзамена',
    choice: 'Выберите правильный ответ в каждом задании.',
    matching: 'Подберите к каждому заданию один вариант из банка.',
    tf: 'Определите, верно (richtig) или неверно (falsch) каждое утверждение.',
    write: 'Напишите полуофициальное письмо, раскрыв три из четырёх пунктов.',
    speak:
      'Запишите каждый ответ по карточкам. Заданные реплики партнёра помогают тренироваться самостоятельно.',
    readGoal: 'Понимать основную мысль, детали и конкретную информацию в текстах.',
    listenGoal: 'Понимать новости, интервью и короткие объявления с одного прослушивания.',
    writeGoal: 'Написать ясное, хорошо построенное полуофициальное письмо уровня B2.',
    speakGoal: 'Рассказывать об опыте, обсуждать аргументы и планировать вместе на уровне B2.',
    summaries: {
      reading:
        'Leseverstehen (части 1–3) и Sprachbausteine (части 4–5) выполняются за общие 90 минут, как на письменном экзамене.',
      listening: 'Новости, интервью и короткие объявления; каждая запись звучит один раз.',
      writing: 'Одно полуофициальное письмо: Aufgabe A (запрос информации) или B (жалоба).',
      speaking: 'Рассказ об опыте, обсуждение текста и совместное планирование, в одиночку.',
    },
    notes: {
      reading: 'Lesen 75 + Sprachbausteine 30 баллов; тренировочные баллы.',
      listening: 'Тренировочные баллы; каждая запись звучит один раз.',
      writing: 'Три критерия A–D (5/3/1/0) × 3; учебная оценка.',
      speaking:
        'Три критерия A–D (7/5/3/0) в каждой части; произношение не оценивается; предварительно.',
    },
    tip: 'Сначала прочитайте задание и проверьте каждое условие в тексте.',
  },
}

const skills: SkillId[] = ['reading', 'writing', 'listening', 'speaking']

export function partCopy(
  module: ModuleDefinition,
  task: TaskDefinition,
  locale: CopyLocale
): PartText {
  const c = copy[locale]
  const r = task.runtime
  const label = c.labels[skills.indexOf(module.id)]!
  const title = titles[module.id]?.[task.n - 1]?.[locales.indexOf(locale)] ?? label
  const short =
    task.itemFormat === 'freeform'
      ? c.write
      : task.itemFormat === 'recording'
        ? c.speak
        : task.itemFormat === 'matching'
          ? c.matching
          : task.itemFormat === 'true-false'
            ? c.tf
            : c.choice
  const field = r.fields?.[0]
  const format = [
    `${c.part} ${task.n}`,
    ...(r.questionCount ? [`${r.questionCount} ${c.items}`] : []),
    ...(r.optionCount && task.itemFormat !== 'true-false' ? [`${r.optionCount} ${c.options}`] : []),
    ...(field ? [`${field.minWords}–${field.maxWords} ${c.words}`] : []),
    ...(r.segments ? [`${r.segments.length} ${c.turns}`] : []),
    ...(task.officialItems && module.id !== 'writing'
      ? [`${c.official} ${task.officialItems}`]
      : []),
  ].join(' · ')
  const goal =
    module.id === 'reading'
      ? c.readGoal
      : module.id === 'listening'
        ? c.listenGoal
        : module.id === 'writing'
          ? c.writeGoal
          : c.speakGoal
  return { title, format, short, goal, skill: label }
}

export function moduleCopy(
  module: ModuleDefinition,
  locale: CopyLocale
): Omit<ModuleText, 'parts'> {
  const c = copy[locale]
  return {
    label: c.labels[skills.indexOf(module.id)]!,
    summary: c.summaries[module.id],
    scoringNote: c.notes[module.id],
  }
}

export function structureCopy(modules: ModuleDefinition[], locale: CopyLocale): StructureText {
  return Object.fromEntries(
    modules.map(module => [
      module.id,
      {
        ...moduleCopy(module, locale),
        parts: Object.fromEntries(
          module.tasks.map(task => [task.n, partCopy(module, task, locale)])
        ),
      },
    ])
  )
}

export function practiceTip(locale: CopyLocale): string {
  return copy[locale].tip
}

/** Speaking coach copy per part: an English instruction and German Redemittel. */
export const speakingCopy: Record<number, { instruction: string; phrases: readonly string[] }> = {
  1: {
    instruction:
      'Choose one of the seven topics and report on a personal experience for up to 1½ minutes. Answer your partner’s two questions, then react to your partner’s short report and ask a question. Record each turn separately.',
    phrases: [
      'Ich möchte von … erzählen, das ich vor … erlebt habe.',
      'Besonders beeindruckt hat mich, dass …',
      'Damals war ich … Jahre alt und …',
      'Rückblickend würde ich sagen, dass …',
      'Das klingt spannend! Wie bist du darauf gekommen, …?',
      'Hast du so etwas schon einmal wieder gemacht?',
    ],
  },
  2: {
    instruction:
      'Summarise the arguments of the text in at most one minute. Then discuss with your partner: give your opinion with reasons, react to their arguments, compare with your country and look for a solution. Record each turn separately.',
    phrases: [
      'In dem Text geht es um die Frage, ob …',
      'Befürworter meinen, dass …, Kritiker wenden ein, dass …',
      'Ich bin der Meinung, dass …, weil …',
      'Da hast du recht, aber man darf nicht vergessen, dass …',
      'In meinem Heimatland ist das anders: …',
      'Wie wäre es mit einem Kompromiss: …?',
    ],
  },
  3: {
    instruction:
      'Plan the activity with your partner: make suggestions, react to their ideas, solve the problem they raise and agree on a plan. Record each turn separately.',
    phrases: [
      'Was hältst du davon, wenn wir …?',
      'Ich schlage vor, dass …',
      'Das ist eine gute Idee, aber …',
      'Wer kümmert sich um …?',
      'Dann machen wir es so: …',
      'Fassen wir zusammen: …',
    ],
  },
}
