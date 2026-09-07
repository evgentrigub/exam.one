import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'

const ROLE =
  'Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.'

const PRELUDE = (name: string) => `ФОРМАТ ВЫВОДА (СТРОГО):
Верни ТОЛЬКО валидный JSON-массив объектов. Никакого текста, пояснений или Markdown до или после JSON.
Каждый объект должен строго соответствовать интерфейсу ${name}.
Поля id, createdAt и вложенные id НЕ добавляй — они будут проставляться автоматически позже.`

export const listeningPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'listening',
    part: 1,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий (наборов) для модуля Hören A2: Teil 1 (Informationen im Radio, auf dem Anrufbeantworter, bei Durchsagen verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Структура: каждый набор должен содержать РОВНО 5 независимых ситуаций в массиве "items".',
      '2. Контекст (context): короткое описание ситуации, например "Sie hören den Wetterbericht im Radio" или "Sie hören eine Nachricht auf dem Anrufbeantworter".',
      '3. Аудиотекст (transcript): монолог (объявление, радио, автоответчик). Длина каждого текста — строго около 50 слов.',
      '4. Лексика и грамматика: строго уровень A2. Текст должен звучать как устная речь: простые предложения, естественный порядок слов, понятные бытовые темы.',
      '5. Формат вопросов: к каждому transcript ровно 1 короткий вопрос.',
      '6. Варианты ответов: РОВНО 3 варианта в "options"; correctAnswer — индекс правильного варианта (0, 1 или 2).',
      '7. Цель проверки (Hörstil): "selektives Hören" — ученик должен услышать конкретную деталь (время, место, цену, причину, предмет).',
      '8. ЛОВУШКИ (КРИТИЧЕСКИ ВАЖНО): в transcript должны упоминаться слова или концепции из ВСЕХ трех вариантов ответа. Неправильные варианты должны звучать в тексте, но относиться к другому времени, человеку или ситуации.',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (для понимания стиля, ловушек и длины):
Context: "Sie hören eine Durchsage im Kaufhaus."
Transcript: "Liebe Kunden! Bitte beachten Sie unsere Sonderangebote in der Sportabteilung. Auf Tennisschuhe und Laufschuhe gibt es heute einen Rabatt von 50 Prozent. Dieses Angebot gilt nur heute. Und denken Sie daran: Morgen in der Zeit von 10.00 Uhr bis 12.00 Uhr gibt es in unserer Buchabteilung drei Krimis zu insgesamt 10 Euro. Am Montag haben wir dann Preisreduzierungen für Spielsachen. Wir freuen uns auf Ihren Besuch."
Question: "Was gibt es heute billiger?"
Options: ["Bücher.", "Spielsachen.", "Sportschuhe."]
Correct Answer: 2
Explanation: "Im Text steht, dass es heute einen Rabatt auf Tennisschuhe und Laufschuhe gibt. Bücher gibt es morgen billiger, Spielsachen am Montag."`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil1'),
    outputContract: `{
  "title": string,
  "testingPart": 1,
  "difficulty": "A2",
  "items": [
    {
      "context": string,
      "transcript": string,
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string
    }
  ]
}
Сгенерируй {count} новых наборов по 5 ситуаций в формате JSON. Используй разные темы для каждого item: погода, новости, вокзал, аэропорт, автоответчик от врача, приглашение от друга, магазин, спортивный клуб.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 2,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для модуля Hören A2: Teil 2 (Ein zusammenhängendes Gespräch verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Контекст (context): задай один общий вопрос для всего задания, например "Was schenken die Personen?", "Wo verbringen die Personen ihren Urlaub?", "Wie kommen die Personen ins Büro?".',
      '2. Аудиотекст (transcript): один неформальный диалог между двумя друзьями, знакомыми или коллегами. Длина текста — строго около 220 слов.',
      '3. Роли (ОБЯЗАТЕЛЬНО): КАЖДАЯ реплика должна начинаться с метки роли и двоеточия, например "Mann:" и "Frau:" (или "Herr Schmidt:" / "Frau Becker:"). Без меток аудио генерация не сможет назначить разные голоса.',
      '4. Лексика и грамматика: строго уровень A2. Текст должен звучать живо и естественно: "Ach so", "Na ja", "Oh je", "Wirklich?", короткие реакции.',
      '5. Варианты ответов (options): массив из РОВНО 9 коротких текстовых опций. В оригинальном экзамене это 9 картинок; здесь мы адаптируем их в текст, например "das Auto", "ein Buch", "der Zug".',
      '6. Задания (questions): РОВНО 5 объектов. Каждый объект содержит имя человека или объекта в поле "person", которому нужно подобрать одну из 9 опций.',
      '7. ЛОГИКА СОПОСТАВЛЕНИЯ: каждому из 5 вопросов соответствует только ОДНА уникальная опция. Пять correctAnswer должны быть разными индексами. Оставшиеся 4 options являются лишними ловушками. В transcript должны быть упомянуты все 5 person. Делай ловушки через изменение решения.',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (для понимания стиля и логики):
Context: "Wie kommen die Personen normalerweise ins Büro?"
Transcript: "Frau: Hallo, Manfred! Du bist ja auch schon so früh im Büro. Mein Mann hat mich gefahren. Er bringt mich jeden Morgen mit dem Auto zur Arbeit. Zum Glück waren unsere Straßen frei von Schnee. Mann: Ach so. Na, da hast du ja Glück gehabt! Wie kommt denn Mareike heute wohl ins Büro? Sie nimmt ja immer das Motorrad. Frau: Tja, das wird heute sicher nicht gehen. Und Andreas? Was der wohl macht? Er benutzt ja sonst immer die S-Bahn. Mann: Die hat auch Verspätung! Auch für Ralf wird es schwierig, denn er kommt ja immer mit dem Fahrrad. Frau: Und Herr Schmidt benutzt ja eigentlich die U-Bahn."
Options: ["das Auto", "der Bus", "die U-Bahn", "das Fahrrad", "zu Fuß", "die S-Bahn", "der Zug", "das Motorrad", "die Straßenbahn"]
Questions:
- person: "Frauke", correctAnswer: 0
- person: "Mareike", correctAnswer: 7
- person: "Andreas", correctAnswer: 5
- person: "Ralf", correctAnswer: 3
- person: "Herr Schmidt", correctAnswer: 2`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil2'),
    outputContract: `{
  "title": string,
  "testingPart": 2,
  "difficulty": "A2",
  "context": string,
  "transcript": string,
  "options": [string, string, string, string, string, string, string, string, string],
  "questions": [
    {
      "person": string,
      "correctAnswer": 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      "explanation": string
    }
  ]
}
Сгенерируй {count} новых заданий в формате JSON. Темы диалогов: выбор подарков, кто что приносит на вечеринку, хобби друзей на выходных, места отпуска, транспорт на работу, покупки для квартиры.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 3,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий (наборов) для модуля Hören A2: Teil 3 (Einzelgespräche verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Структура: каждый набор должен содержать РОВНО 5 независимых коротких диалогов в массиве "items".',
      '2. Аудиотекст (transcript): короткий диалог между двумя людьми в повседневной ситуации (магазин, врач, офис, дом, ресторан). Длина каждого диалога — строго около 55 слов.',
      '3. Роли (ОБЯЗАТЕЛЬНО): разделяй КАЖДУЮ реплику ролью с двоеточием, например "Mann:", "Frau:", "Arzt:", "Patient:", "Verkäuferin:". Метки нужны для multi-voice TTS (мужской/женский голос).',
      '4. Лексика и грамматика: строго уровень A2. Естественная разговорная речь.',
      '5. Формат вопросов: к каждому диалогу 1 короткий вопрос, например "Was kauft die Frau?", "Was tut dem Mann weh?".',
      '6. Варианты ответов (options): РОВНО 3 коротких варианта. В оригинальном экзамене это картинки; здесь генерируй текстовые варианты, например ["das Sofa", "der Tisch", "die Stühle"].',
      '7. Цель проверки (Hörstil): "selektives Hören".',
      '8. ЛОВУШКИ С ОТРИЦАНИЕМ (КРИТИЧЕСКИ ВАЖНО): в диалоге должны прозвучать слова, связанные со ВСЕМИ ТРЕМЯ вариантами. Правильный ответ должен определяться через отрицание, передумывание или уточнение: "nein", "nicht", "kein", "schon gestern", "leider nicht", "doch lieber".',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (для понимания стиля и ловушек):
Question: "Was bestellt der Herr?"
Transcript: "Kellnerin: Guten Abend! Ich bringe Ihnen sofort die Speisekarte. Gast: Nein, danke. Nicht nötig! Können Sie mir etwas empfehlen? Kellnerin: Ja, den Fisch. Der ist ganz frisch. Gast: Nein, danke. Ich habe erst gestern Fisch gegessen. Haben Sie Wiener Schnitzel? Kellnerin: Leider nicht. Gast: Schade, dann nehme ich nur einen Salat und vorher bitte die Suppe."
Options: ["Schnitzel", "Suppe", "Fisch"]
Correct Answer: 1
Explanation: "Schnitzel gibt es nicht, Fisch möchte der Gast nicht. Am Ende bestellt er Suppe."`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil3'),
    outputContract: `{
  "title": string,
  "testingPart": 3,
  "difficulty": "A2",
  "items": [
    {
      "question": string,
      "transcript": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string
    }
  ]
}
Сгенерируй {count} новых наборов по 5 диалогов в формате JSON. Используй разные темы для каждого item: одежда, еда, техника, фильм, врач, транспорт, подарок, мебель.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 4,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для модуля Hören A2: Teil 4 (Ein Radiointerview verstehen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Контекст (context): всегда начинается со слов "Sie hören ein Interview..." (например, "Sie hören ein Interview im Radio." или "Sie hören ein Interview in einem Podcast.").',
      '2. Аудиотекст (transcript): радиоинтервью между ведущим и гостем. Длина текста — строго около 220 слов.',
      '3. Роли (ОБЯЗАТЕЛЬНО): реплики должны быть четко разделены метками с двоеточием, например "Moderator:" / "Moderatorin:" и "Frau Müller:" / "Herr Schmidt:". Каждая смена говорящего — новая метка (нужно для multi-voice TTS).',
      '4. Лексика и грамматика: строго уровень A2. Тема должна быть актуальной и понятной: образование, интернет, здоровье, спорт, экология, работа, питание.',
      '5. Задания (questions): РОВНО 5 утверждений (Aussagen) по содержанию текста.',
      '6. Формат ответов: correctAnswer — boolean, где true = Ja/Richtig, false = Nein/Falsch.',
      '7. Баланс ответов: среди 5 ответов должно быть минимум два true и минимум два false.',
      '8. Цель проверки (Hörstil): "globales und detailliertes Hören" — понять главную мысль и важные детали.',
      '9. ЛОВУШКИ (ПАРАФРАЗ И АНТОНИМЫ): statements НЕ ДОЛЖНЫ дословно копировать transcript. Для true используй синонимы. Для false используй антонимы или искажение факта.',
      '10. В каждом объекте question поле "type" строго равно "true_false".',
    ],
    examples: [
      `ЭТАЛОННЫЙ ПРИМЕР (для понимания логики Ja/Nein):
Context: "Sie hören ein Interview."
Transcript: "Moderator: Hallo und herzlich willkommen. Wir sprechen heute über das Thema Ausbildung. Frau Möckel, kann man vorher sehen, ob der Beruf zu einem passt? Frau Möckel: Man könnte natürlich auch erstmal ein Praktikum machen, um das zu sehen. Moderator: Bekommt ein Azubi eigentlich Urlaub oder hat er Ferien, wie in der Schule? Frau Möckel: Es ist ja keine Schule mehr. Also haben die Azubis jetzt Urlaub und keine Ferien mehr. Moderator: Wie ist es mit der Bezahlung? Frau Möckel: Sie bekommen ein Gehalt. Dieses Gehalt steigt mit den Jahren."
Statements:
- "Ein Praktikum hilft bei der Berufswahl." correctAnswer: true
- "Die Azubis haben Ferien." correctAnswer: false
- "Das Ausbildungsgehalt bleibt gleich." correctAnswer: false`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil4'),
    outputContract: `{
  "title": string,
  "testingPart": 4,
  "difficulty": "A2",
  "context": string,
  "transcript": string,
  "questions": [
    {
      "statement": string,
      "correctAnswer": boolean,
      "explanation": string,
      "type": "true_false"
    }
  ]
}
Сгенерируй {count} новых заданий в формате JSON. Возможные темы: жизнь без автомобиля, онлайн-шопинг, иностранные языки, здоровое питание, спорт в городе, обучение после школы.`,
  }),
]
