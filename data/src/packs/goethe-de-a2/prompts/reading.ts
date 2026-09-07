import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'

const ROLE =
  'Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.'

const PRELUDE = (name: string) => `ФОРМАТ ВЫВОДА (СТРОГО):
Верни ТОЛЬКО валидный JSON-массив объектов. Никакого текста, пояснений или Markdown до или после JSON.
Каждый объект должен строго соответствовать интерфейсу ${name}.
Поля id, createdAt и вложенные id/textId НЕ добавляй — они будут проставляться автоматически позже.`

export const readingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'reading',
    part: 1,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для модуля Lesen A2: Teil 1 (Informationen in Medientexten verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Тип текста: Информационный текст (Zeitungsartikel, Broschüre) на актуальную, интересную тему. Помести его в поле "content".',
      '2. Объем текста: строго около 200 слов.',
      '3. Лексика и грамматика: строго уровень A2. Избегай Passiv, Plusquamperfekt, Konjunktiv I. Сложные слова должны быть понятны из контекста.',
      '4. Формат вопросов: РОВНО 5 вопросов.',
      '5. Варианты ответов: РОВНО 3 варианта (a, b, c) для каждого вопроса. correctAnswer — индекс (0, 1 или 2).',
      '6. Цель проверки (Lesestil): "sorgfältig-genaues Lesen" — понимание главной мысли и важных деталей.',
      '7. Ловушки: неправильные варианты должны содержать слова из текста, но по смыслу быть неверными.',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (для понимания стиля и сложности):
Текст "Paella mit Bauernbrot":
"Mireia Vicario ist ein Beispiel für gute Integrationspolitik, denn sie ist eine der ersten Nachrichtensprecherinnen des deutschen Fernsehens mit Migrationshintergrund. Als Tochter spanischer Gastarbeiter wuchs sie in Kiel auf... Mit eisernem Willen und einer guten Schulbildung schaffte sie es, ab 2004 als Nachrichtensprecherin vor der Kamera zu stehen. Seit 2010 moderiert sie nun schon die Nachrichten im deutschen Fernsehen."
Пример вопроса:
question: "Als sie jünger war, ..."
options: ["arbeitete sie im Geschäft ihres Vaters.", "half ihr Vater Mireia bei den Hausaufgaben.", "hatte sie einen Job im Gymnasium."]
correctAnswer: 0`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA2Teil1'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "article",
  "testingPart": 1,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "comprehension"
    }
  ]
}
Сгенерируй {count} новых текстов (разные темы) в формате JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 2,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для модуля Lesen A2: Teil 2 (Informationstafeln, Veranstaltungsprogramme etc. verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Тип текста: Структурированный текст-список (listenartiger Text): указатель этажей в торговом центре, программа мероприятий, расписание транспорта или ТВ-программа. Помести его в поле "content" с переносами строк (\\n) между блоками.',
      '2. Объем текста: строго около 100 слов, разбитых на логические блоки (по этажам, дням, времени).',
      '3. Лексика и грамматика: строго уровень A2.',
      '4. Формат вопросов: РОВНО 5 вопросов как жизненные ситуации (например, "Sie möchten einen Kaffee trinken.").',
      '5. Варианты ответов: РОВНО 3 варианта (a, b, c). ВАЖНО: третий вариант (индекс 2) почти всегда — резервное обобщение: "anderer Stock", "anderer Ort", "andere Zeit" или "anderer Tag". correctAnswer — индекс (0, 1 или 2).',
      '6. Цель проверки (Lesestil): "suchendes, selektives Lesen" — найти конкретную деталь в списке.',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (структура и логика ответов):
Текст "Kaufhaus" (этажи с отделами).
Пример вопроса:
question: "Sie möchten Ohrringe kaufen."
options: ["3. Stock", "2. Stock", "anderer Stock"]
correctAnswer: 2
explanation: "Schmuck ist in der Drogerie im 1. Stock, also 'anderer Stock'."`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA2Teil2'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "list",
  "testingPart": 2,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "selective"
    }
  ]
}
Сгенерируй {count} новых текстов-списков (разные темы: расписание ТВ, программа фестиваля, план аэропорта и т.д.) в формате JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 3,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для модуля Lesen A2: Teil 3 (Korrespondenz lesen und verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Тип текста: Личная переписка (E-Mail) с неформальным приветствием ("Lieber...", "Hallo...") и прощанием ("Bis bald", "Liebe Grüße"). Помести её в поле "content".',
      '2. Объем текста: строго около 230 слов; текст рассказывает о событии (поездка, вечеринка, переезд, встреча).',
      '3. Лексика и грамматика: строго уровень A2. Используй Perfekt и Präteritum (haben/sein/Modalverben), weil/dass-Sätze. Избегай Passiv, Plusquamperfekt, Konjunktiv I (кроме \'würde/hätte/wäre\').',
      '4. Формат вопросов: РОВНО 5 вопросов в хронологическом порядке по тексту.',
      '5. Варианты ответов: РОВНО 3 варианта (a, b, c). correctAnswer — индекс (0, 1 или 2).',
      '6. Цель проверки (Lesestil): "sorgfältig-genaues Lesen" — понять главные мысли и детали.',
      '7. Ловушки: правильный вариант перефразирован (синонимы), неправильные часто содержат точные слова из текста, но искажают смысл.',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (структура и логика):
Текст "Klassentreffen" — письмо другу о встрече одноклассников через 20 лет.
Пример вопроса:
question: "Auf dem Klassentreffen ..."
options: ["waren fast alle anwesend.", "fehlten zwei Personen.", "haben Andreas und Holger über sich erzählt."]
correctAnswer: 1
explanation: "Im Text: 'außer dir noch zwei Ehemalige nicht dabei waren: Andreas und Holger.'"`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA2Teil3'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "email",
  "testingPart": 3,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "comprehension"
    }
  ]
}
Сгенерируй {count} новых писем (разные темы: отпуск, переезд, новая работа, приглашение на свадьбу) в формате JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 4,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для модуля Lesen A2: Teil 4 (Anzeigen verstehen / Zuordnung).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Тип текста: 6 коротких объявлений (Anzeigen) на одну общую тему. Помести их в поле "content" по одному в строке, каждое с префиксом буквы, например: "a: ...\\nb: ...\\nc: ...\\nd: ...\\ne: ...\\nf: ..."',
      '2. Объем: суммарно не более 240 слов на все 6 объявлений.',
      '3. Лексика и грамматика: строго уровень A2.',
      '4. Вопросы (ситуации): РОВНО 5 ситуаций. Текст вопроса (question) — конкретная потребность человека (например: "Rupert braucht ein Geschenk für seinen Enkel.").',
      '5. ЛОГИКА СОПОСТАВЛЕНИЯ (КРИТИЧЕСКИ ВАЖНО): у КАЖДОГО вопроса options РОВНО: ["a", "b", "c", "d", "e", "f", "x"]. correctAnswer — индекс: a=0 … f=5, x=6. 4 ситуации имеют ровно одно подходящее объявление. Ровно 1 из 5 ситуаций НЕ имеет подходящего объявления (x). Одно объявление остаётся лишним. Запрещено использовать одно объявление для двух ситуаций.',
      '6. Цель проверки (Lesestil): "selektives Lesen".',
      '7. explanation: кратко объясни на немецком, почему подходит объявление (или почему "x").',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (логика):
Объявления a–f на тему "Tests / Apps / Reisen".
Пример вопроса:
question: "Theo sucht eine Stelle im Tourismusbereich."
options: ["a", "b", "c", "d", "e", "f", "x"]
correctAnswer: 6
explanation: "Es gibt keine Anzeige für Stellenangebote, daher 'x'."`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA2Teil4'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "advertisement",
  "testingPart": 4,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": ["a", "b", "c", "d", "e", "f", "x"],
      "correctAnswer": 0 | 1 | 2 | 3 | 4 | 5 | 6,
      "explanation": string,
      "type": "matching"
    }
  ]
}
Сгенерируй {count} новых заданий (наборы из 6 объявлений и 5 ситуаций) в формате JSON. Обязательно убедись, что ровно для одной ситуации ответ "x".`,
  }),
]
