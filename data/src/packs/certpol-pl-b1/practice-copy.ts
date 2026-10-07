import type { ModuleText, PartText, SkillId, StructureText } from '../../types'
import type { ModuleDefinition, TaskDefinition } from './runtime'
import { titles } from './titles'
const locales = ['en', 'de', 'es', 'pl', 'ru'] as const
export type CopyLocale = (typeof locales)[number]
const copy = {
  en: {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
    readingGrammar: 'Reading and grammar',
    grammarLabel: 'Grammar',
    grammarGoal: 'Use cases, verb forms and sentence relationships in B1 contexts.',
    grammarScores:
      'Reading /30 and Grammar /30 are separate official papers, each requiring 50%. This /60 practice catalog total does not determine a pass.',
    part: 'Part',
    items: 'questions',
    options: 'options',
    words: 'words',
    turns: 'responses',
    choice: 'Choose the best answer for each question.',
    matching: 'Match each question to the appropriate option.',
    tf: 'Decide whether each statement is correct.',
    gap: 'Type the missing words in the numbered gaps.',
    write: 'Write a connected response that covers every requirement.',
    speak: 'Record each response to the cue cards. Fixed examiner cues support solo practice.',
    readGoal: 'Understand the main message, details and connections in the text.',
    listenGoal: 'Identify key information, attitudes and reasons in the recording.',
    writeGoal: 'Communicate clearly with appropriate register, organisation and B1 language.',
    speakGoal: 'Explain ideas, experiences and reasons using connected B1 language.',
    summary: 'practice parts',
    objective: 'Raw practice marks; no official scale or pass calculation.',
    formative: 'Formative feedback; no official result or pass calculation.',
    grammar:
      'Reading and grammar are grouped here. Grammar tasks start at Part 6; their marks remain separate in the official exam.',
    tip: 'Check every requirement and use the evidence provided.',
  },
  de: {
    labels: ['Leseverstehen', 'Schreiben', 'Hörverstehen', 'Sprechen'],
    readingGrammar: 'Lesen und Grammatik',
    grammarLabel: 'Grammatik',
    grammarGoal: 'Verwende Fälle, Verbformen und Satzverbindungen im B1-Kontext.',
    grammarScores:
      'Lesen /30 und Grammatik /30 sind getrennte offizielle Prüfungsteile, die jeweils 50% erfordern. Die /60 Gesamtpunkte dieses Übungskatalogs bestimmen kein Bestehen.',
    part: 'Teil',
    items: 'Fragen',
    options: 'Optionen',
    words: 'Wörter',
    turns: 'Antworten',
    choice: 'Wähle für jede Frage die beste Antwort.',
    matching: 'Ordne jeder Frage die passende Option zu.',
    tf: 'Entscheide, ob jede Aussage richtig ist.',
    gap: 'Schreibe die fehlenden Wörter in die nummerierten Lücken.',
    write: 'Schreibe einen zusammenhängenden Text zu allen Vorgaben.',
    speak:
      'Nimm jede Antwort zu den Karten auf. Feste Prüferfragen unterstützen das alleinige Üben.',
    readGoal: 'Verstehe Hauptaussagen, Details und Zusammenhänge im Text.',
    listenGoal: 'Erkenne wichtige Informationen, Haltungen und Gründe in der Aufnahme.',
    writeGoal: 'Kommuniziere klar mit passendem Register, Aufbau und B1-Sprache.',
    speakGoal: 'Erkläre Ideen, Erfahrungen und Gründe in zusammenhängender B1-Sprache.',
    summary: 'Übungsteile',
    objective: 'Rohpunkte zur Übung; keine offizielle Skala oder Bestehensberechnung.',
    formative: 'Lernorientiertes Feedback; kein offizielles Ergebnis oder Bestehensurteil.',
    grammar:
      'Lesen und Grammatik sind hier zusammengefasst. Grammatik beginnt bei Teil 6; ihre Punkte bleiben in der offiziellen Prüfung getrennt.',
    tip: 'Beachte alle Vorgaben und nutze die vorhandenen Informationen.',
  },
  es: {
    readingGrammar: 'Lectura y gramática',
    grammarLabel: 'Gramática',
    grammarGoal: 'Usa casos, formas verbales y relaciones entre frases en contextos B1.',
    grammarScores:
      'Lectura /30 y Gramática /30 son pruebas oficiales independientes y cada una requiere el 50%. El total /60 de este catálogo de práctica no determina un aprobado.',
    labels: [
      'Comprensión de lectura',
      'Expresión escrita',
      'Comprensión auditiva',
      'Expresión oral',
    ],
    part: 'Parte',
    items: 'preguntas',
    options: 'opciones',
    words: 'palabras',
    turns: 'respuestas',
    choice: 'Elige la mejor respuesta para cada pregunta.',
    matching: 'Relaciona cada pregunta con la opción adecuada.',
    tf: 'Decide si cada afirmación es correcta.',
    gap: 'Escribe las palabras que faltan en los huecos numerados.',
    write: 'Escribe un texto coherente que cumpla todos los requisitos.',
    speak:
      'Graba cada respuesta a las tarjetas. Las intervenciones fijas del examinador permiten practicar a solas.',
    readGoal: 'Comprende el mensaje principal, los detalles y las conexiones del texto.',
    listenGoal: 'Identifica información clave, actitudes y razones en la grabación.',
    writeGoal: 'Comunica con claridad, registro apropiado, organización y lenguaje B1.',
    speakGoal: 'Explica ideas, experiencias y razones con un discurso conectado de nivel B1.',
    summary: 'partes de práctica',
    objective: 'Puntos de práctica sin escala oficial ni cálculo de aprobado.',
    formative: 'Comentarios formativos sin resultado oficial ni cálculo de aprobado.',
    grammar:
      'Aquí se agrupan lectura y gramática. La gramática empieza en la Parte 6; sus puntos son independientes en el examen oficial.',
    tip: 'Revisa todos los requisitos y utiliza la información disponible.',
  },
  pl: {
    labels: ['Rozumienie tekstów pisanych', 'Pisanie', 'Rozumienie ze słuchu', 'Mówienie'],
    readingGrammar: 'Czytanie i gramatyka',
    grammarLabel: 'Gramatyka',
    grammarGoal: 'Stosuj przypadki, formy czasowników i związki między zdaniami w kontekstach B1.',
    grammarScores:
      'Czytanie /30 i Gramatyka /30 to odrębne części oficjalnego egzaminu; każda wymaga 50%. Suma /60 w tym katalogu ćwiczeń nie określa wyniku zdania egzaminu.',
    part: 'Część',
    items: 'pytania',
    options: 'opcje',
    words: 'słów',
    turns: 'wypowiedzi',
    choice: 'Wybierz najlepszą odpowiedź na każde pytanie.',
    matching: 'Dopasuj do każdego pytania odpowiednią opcję.',
    tf: 'Zdecyduj, czy każde stwierdzenie jest prawdziwe.',
    gap: 'Wpisz brakujące słowa w ponumerowane luki.',
    write: 'Napisz spójny tekst spełniający wszystkie wymagania.',
    speak:
      'Nagraj każdą wypowiedź do kart. Stałe pytania egzaminatora umożliwiają samodzielne ćwiczenie.',
    readGoal: 'Zrozum główny przekaz, szczegóły i powiązania w tekście.',
    listenGoal: 'Rozpoznaj kluczowe informacje, postawy i przyczyny w nagraniu.',
    writeGoal: 'Komunikuj się jasno, zachowując właściwy styl, organizację i język na poziomie B1.',
    speakGoal:
      'Wyjaśniaj pomysły, doświadczenia i przyczyny, tworząc spójną wypowiedź na poziomie B1.',
    summary: 'części ćwiczeniowe',
    objective: 'Surowe punkty ćwiczeniowe; bez oficjalnej skali i wyniku zdania egzaminu.',
    formative: 'Informacja zwrotna do nauki; bez oficjalnego wyniku i oceny zdania egzaminu.',
    grammar:
      'Czytanie i gramatyka są tu połączone. Gramatyka zaczyna się od Części 6; w oficjalnym egzaminie jej punkty są odrębne.',
    tip: 'Sprawdź wszystkie wymagania i wykorzystaj podane informacje.',
  },
  ru: {
    labels: ['Чтение', 'Письмо', 'Аудирование', 'Говорение'],
    readingGrammar: 'Чтение и грамматика',
    grammarLabel: 'Грамматика',
    grammarGoal: 'Используйте падежи, формы глаголов и связи между предложениями в контекстах B1.',
    grammarScores:
      'Чтение /30 и Грамматика /30 — отдельные части официального экзамена, каждая требует 50%. Сумма /60 в этом каталоге упражнений не определяет сдачу экзамена.',
    part: 'Часть',
    items: 'вопросов',
    options: 'вариантов',
    words: 'слов',
    turns: 'ответов',
    choice: 'Выберите лучший ответ на каждый вопрос.',
    matching: 'Подберите подходящий вариант для каждого вопроса.',
    tf: 'Определите, верно ли каждое утверждение.',
    gap: 'Впишите пропущенные слова в пронумерованные пробелы.',
    write: 'Напишите связный текст, выполняющий все требования.',
    speak:
      'Запишите каждый ответ по карточкам. Заданные реплики экзаменатора помогают тренироваться самостоятельно.',
    readGoal: 'Понимайте основную мысль, детали и связи в тексте.',
    listenGoal: 'Определяйте ключевые сведения, отношение и причины в записи.',
    writeGoal: 'Выражайте мысли ясно, соблюдая стиль и структуру и используя язык уровня B1.',
    speakGoal: 'Связно объясняйте идеи, опыт и причины на уровне B1.',
    summary: 'частей для практики',
    objective: 'Исходные баллы для практики; без официальной шкалы и расчёта сдачи экзамена.',
    formative: 'Обратная связь для обучения; без официального результата и расчёта сдачи экзамена.',
    grammar:
      'Чтение и грамматика объединены здесь. Грамматика начинается с Части 6; на официальном экзамене её баллы считаются отдельно.',
    tip: 'Проверьте все требования и используйте предоставленную информацию.',
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
  const title =
    titles[module.id]?.[task.n - 1]?.[locales.indexOf(locale)] ??
    c.labels[skills.indexOf(module.id)]!
  const isGrammar = module.id === 'reading' && task.n >= 6
  const label = isGrammar ? c.grammarLabel : c.labels[skills.indexOf(module.id)]!
  const short =
    task.itemFormat === 'freeform'
      ? c.write
      : task.itemFormat === 'recording'
        ? c.speak
        : task.itemFormat === 'gap-fill'
          ? c.gap
          : task.itemFormat === 'matching'
            ? c.matching
            : task.itemFormat === 'true-false'
              ? c.tf
              : c.choice
  const field = r.fields?.[0]
  const official =
    module.id === 'reading'
      ? `${isGrammar ? c.grammarLabel : c.labels[0]} ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][isGrammar ? task.n - 6 : task.n - 1]}`
      : undefined
  const format = [
    ...(official ? [official] : []),
    `${c.part} ${task.n}`,
    ...(r.questionCount ? [`${r.questionCount} ${c.items}`] : []),
    ...(r.optionCount ? [`${r.optionCount} ${c.options}`] : []),
    ...(field ? [`${field.minWords}–${field.maxWords} ${c.words}`] : []),
    ...(r.segments ? [`${r.segments.length} ${c.turns}`] : []),
  ].join(' · ')
  return {
    title,
    format,
    short,
    goal:
      module.id === 'reading'
        ? isGrammar
          ? c.grammarGoal
          : c.readGoal
        : module.id === 'listening'
          ? c.listenGoal
          : module.id === 'writing'
            ? c.writeGoal
            : c.speakGoal,
    skill: label,
  }
}
export function moduleCopy(
  module: ModuleDefinition,
  locale: CopyLocale
): Omit<ModuleText, 'parts'> {
  const c = copy[locale]
  const points = module.tasks.reduce((sum, task) => sum + task.runtime.maxPoints, 0)
  return {
    label: module.id === 'reading' ? c.readingGrammar : c.labels[skills.indexOf(module.id)]!,
    summary:
      `${module.tasks.length} ${c.summary}.` +
      (module.id === 'reading' && module.tasks.length === 13 ? ` ${c.grammar}` : ''),
    scoringNote:
      module.id === 'reading'
        ? `${points} · ${c.grammarScores}`
        : `${points} · ${module.id === 'listening' ? c.objective : c.formative}`,
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
