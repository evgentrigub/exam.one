import type { ReadingExercise } from '~/utils/types'

/**
 * A2 Reading Exercise Generation Prompts (Goethe-Institut, modular 2024 format).
 *
 * The Goethe A2 "Lesen" module has four parts (Teile), each with a distinct text
 * genre, reading style, and question structure. We expose one prompt builder per
 * part plus a `readingA2Parts` helper that returns one prompt per part so a single
 * "Generate" click can produce one exercise for every Teil.
 *
 * Every prompt instructs the model to return a JSON array of objects that are
 * directly compatible with the {@link ReadingExercise} interface so the existing
 * reading storage and quiz flow can consume them without special-casing.
 */

/** Reading part identifiers used across the A2 generation flow. */
export type ReadingA2Part = 1 | 2 | 3 | 4

/**
 * Shared output contract appended to every part prompt. Keeping the JSON shape
 * identical across parts lets the server normalise and the quiz UI render every
 * generated exercise uniformly.
 */
const germanTextOutputContract = (part: ReadingA2Part, textType: string, questionType: string) => `
ФОРМАТ ВЫВОДА (СТРОГО):
Верни ТОЛЬКО валидный JSON-массив объектов. Никакого текста, пояснений или Markdown до или после JSON.
Каждый объект должен строго соответствовать интерфейсу GermanText:

{
  "title": string,                 // короткий немецкий заголовок
  "content": string,               // полный текст задания (см. правила части)
  "textType": "${textType}",
  "testingPart": ${part},
  "difficulty": "A2",
  "estimatedReadingTime": number,  // минуты (например 7.5)
  "wordCount": number,             // фактическое число слов в content
  "topics": string[],              // 1–3 темы на немецком
  "questions": [
    {
      "question": string,
      "options": string[],
      "correctAnswer": number,     // индекс правильного варианта в options (0-based)
      "explanation": string,       // краткое объяснение на немецком
      "type": "${questionType}"
    }
    // ровно 5 вопросов
  ]
}

ПОЛЯ id, textId, createdAt НЕ добавляй — они проставляются автоматически на сервере.
`

/**
 * Teil 1 – Informationen in Medientexten verstehen.
 * Informational article (~200 words), 5 detailed-comprehension questions, 3 options.
 */
export const generateReadingA2Teil1 = (numberOfTopics: number) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
Твоя задача: сгенерировать ${numberOfTopics} уникальных заданий для модуля Lesen A2: Teil 1 (Informationen in Medientexten verstehen).

ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):
1. Тип текста: Информационный текст (Zeitungsartikel, Broschüre) на актуальную, интересную тему. Помести его в поле "content".
2. Объем текста: строго около 200 слов.
3. Лексика и грамматика: строго уровень A2. Избегай Passiv, Plusquamperfekt, Konjunktiv I. Сложные слова должны быть понятны из контекста.
4. Формат вопросов: РОВНО 5 вопросов.
5. Варианты ответов: РОВНО 3 варианта (a, b, c) для каждого вопроса. correctAnswer — индекс (0, 1 или 2).
6. Цель проверки (Lesestil): "sorgfältig-genaues Lesen" — понимание главной мысли и важных деталей.
7. Ловушки: неправильные варианты должны содержать слова из текста, но по смыслу быть неверными.

ЭТАЛОННЫЙ ПРИМЕР (для понимания стиля и сложности):
Текст "Paella mit Bauernbrot":
"Mireia Vicario ist ein Beispiel für gute Integrationspolitik, denn sie ist eine der ersten Nachrichtensprecherinnen des deutschen Fernsehens mit Migrationshintergrund. Als Tochter spanischer Gastarbeiter wuchs sie in Kiel auf... Mit eisernem Willen und einer guten Schulbildung schaffte sie es, ab 2004 als Nachrichtensprecherin vor der Kamera zu stehen. Seit 2010 moderiert sie nun schon die Nachrichten im deutschen Fernsehen."
Пример вопроса:
question: "Als sie jünger war, ..."
options: ["arbeitete sie im Geschäft ihres Vaters.", "half ihr Vater Mireia bei den Hausaufgaben.", "hatte sie einen Job im Gymnasium."]
correctAnswer: 0
${germanTextOutputContract(1, 'article', 'comprehension')}
Сгенерируй ${numberOfTopics} новых текстов (разные темы) в формате JSON.
`
}

/**
 * Teil 2 – Informationstafeln / Veranstaltungsprogramme verstehen.
 * List-style text (~100 words), 5 situation questions, 3 options (3rd is a fallback).
 */
export const generateReadingA2Teil2 = (numberOfTopics: number) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
Твоя задача: сгенерировать ${numberOfTopics} уникальных заданий для модуля Lesen A2: Teil 2 (Informationstafeln, Veranstaltungsprogramme etc. verstehen).

ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):
1. Тип текста: Структурированный текст-список (listenartiger Text): указатель этажей в торговом центре, программа мероприятий, расписание транспорта или ТВ-программа. Помести его в поле "content" с переносами строк (\\n) между блоками.
2. Объем текста: строго около 100 слов, разбитых на логические блоки (по этажам, дням, времени).
3. Лексика и грамматика: строго уровень A2.
4. Формат вопросов: РОВНО 5 вопросов как жизненные ситуации (например, "Sie möchten einen Kaffee trinken.").
5. Варианты ответов: РОВНО 3 варианта (a, b, c). ВАЖНО: третий вариант (индекс 2) почти всегда — резервное обобщение: "anderer Stock", "anderer Ort", "andere Zeit" или "anderer Tag". correctAnswer — индекс (0, 1 или 2).
6. Цель проверки (Lesestil): "suchendes, selektives Lesen" — найти конкретную деталь в списке.

ЭТАЛОННЫЙ ПРИМЕР (структура и логика ответов):
Текст "Kaufhaus" (этажи с отделами).
Пример вопроса:
question: "Sie möchten Ohrringe kaufen."
options: ["3. Stock", "2. Stock", "anderer Stock"]
correctAnswer: 2
explanation: "Schmuck ist in der Drogerie im 1. Stock, also 'anderer Stock'."
${germanTextOutputContract(2, 'list', 'selective')}
Сгенерируй ${numberOfTopics} новых текстов-списков (разные темы: расписание ТВ, программа фестиваля, план аэропорта и т.д.) в формате JSON.
`
}

/**
 * Teil 3 – Korrespondenz lesen und verstehen.
 * Personal email (~230 words), 5 chronological comprehension questions, 3 options.
 */
export const generateReadingA2Teil3 = (numberOfTopics: number) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
Твоя задача: сгенерировать ${numberOfTopics} уникальных заданий для модуля Lesen A2: Teil 3 (Korrespondenz lesen und verstehen).

ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):
1. Тип текста: Личная переписка (E-Mail) с неформальным приветствием ("Lieber...", "Hallo...") и прощанием ("Bis bald", "Liebe Grüße"). Помести её в поле "content".
2. Объем текста: строго около 230 слов; текст рассказывает о событии (поездка, вечеринка, переезд, встреча).
3. Лексика и грамматика: строго уровень A2. Используй Perfekt и Präteritum (haben/sein/Modalverben), weil/dass-Sätze. Избегай Passiv, Plusquamperfekt, Konjunktiv I (кроме 'würde/hätte/wäre').
4. Формат вопросов: РОВНО 5 вопросов в хронологическом порядке по тексту.
5. Варианты ответов: РОВНО 3 варианта (a, b, c). correctAnswer — индекс (0, 1 или 2).
6. Цель проверки (Lesestil): "sorgfältig-genaues Lesen" — понять главные мысли и детали.
7. Ловушки: правильный вариант перефразирован (синонимы), неправильные часто содержат точные слова из текста, но искажают смысл.

ЭТАЛОННЫЙ ПРИМЕР (структура и логика):
Текст "Klassentreffen" — письмо другу о встрече одноклассников через 20 лет.
Пример вопроса:
question: "Auf dem Klassentreffen ..."
options: ["waren fast alle anwesend.", "fehlten zwei Personen.", "haben Andreas und Holger über sich erzählt."]
correctAnswer: 1
explanation: "Im Text: 'außer dir noch zwei Ehemalige nicht dabei waren: Andreas und Holger.'"
${germanTextOutputContract(3, 'email', 'comprehension')}
Сгенерируй ${numberOfTopics} новых писем (разные темы: отпуск, переезд, новая работа, приглашение на свадьбу) в формате JSON.
`
}

/**
 * Teil 4 – Anzeigen verstehen / Zuordnung.
 * Six short advertisements (a–f) plus five matching situations. We flatten this
 * into the GermanText shape: the six ads live in `content`, and each situation is
 * a question whose options are the fixed letter set ['a','b','c','d','e','f','x'],
 * so `correctAnswer` (0..6) maps deterministically to the chosen advert / 'x'.
 */
export const generateReadingA2Teil4 = (numberOfTopics: number) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
Твоя задача: сгенерировать ${numberOfTopics} уникальных заданий для модуля Lesen A2: Teil 4 (Anzeigen verstehen / Zuordnung).

ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):
1. Тип текста: 6 коротких объявлений (Anzeigen) на одну общую тему. Помести их в поле "content" по одному в строке, каждое с префиксом буквы, например:
"a: ...\\nb: ...\\nc: ...\\nd: ...\\ne: ...\\nf: ..."
2. Объем: суммарно не более 240 слов на все 6 объявлений.
3. Лексика и грамматика: строго уровень A2.
4. Вопросы (ситуации): РОВНО 5 ситуаций. Текст вопроса (question) — конкретная потребность человека (например: "Rupert braucht ein Geschenk für seinen Enkel.").
5. ЛОГИКА СОПОСТАВЛЕНИЯ (КРИТИЧЕСКИ ВАЖНО):
   - У КАЖДОГО вопроса options РОВНО: ["a", "b", "c", "d", "e", "f", "x"].
   - correctAnswer — индекс выбранного варианта: a=0, b=1, c=2, d=3, e=4, f=5, x=6.
   - 4 ситуации имеют ровно одно подходящее объявление (a–f).
   - Ровно 1 из 5 ситуаций НЕ имеет подходящего объявления — правильный ответ "x" (correctAnswer = 6).
   - Одно из шести объявлений остаётся "лишним" и никем не используется.
   - Запрещено использовать одно объявление для двух разных ситуаций.
6. Цель проверки (Lesestil): "selektives Lesen".
7. explanation: кратко объясни на немецком, почему подходит объявление (или почему "x").

ЭТАЛОННЫЙ ПРИМЕР (логика):
Объявления a–f на тему "Tests / Apps / Reisen".
Пример вопроса:
question: "Theo sucht eine Stelle im Tourismusbereich."
options: ["a", "b", "c", "d", "e", "f", "x"]
correctAnswer: 6
explanation: "Es gibt keine Anzeige für Stellenangebote, daher 'x'."
${germanTextOutputContract(4, 'advertisement', 'matching')}
Сгенерируй ${numberOfTopics} новых заданий (наборы из 6 объявлений и 5 ситуаций) в формате JSON. Обязательно убедись, что ровно для одной ситуации ответ "x".
`
}

/**
 * Build one prompt per A2 reading part. A single generation request can iterate
 * this list to produce one exercise for every Teil (Teil 1–4).
 *
 * @param topicsPerPart How many exercises to request per part (default 1).
 */
export const readingA2Parts = (topicsPerPart = 1): Array<{ part: ReadingA2Part; prompt: string }> => [
  { part: 1, prompt: generateReadingA2Teil1(topicsPerPart) },
  { part: 2, prompt: generateReadingA2Teil2(topicsPerPart) },
  { part: 3, prompt: generateReadingA2Teil3(topicsPerPart) },
  { part: 4, prompt: generateReadingA2Teil4(topicsPerPart) }
]

/**
 * Example A2 reading exercises for reference.
 */
export const dataA2ReadingExamples: ReadingExercise[] = [
  // Reference examples can be added here.
]
