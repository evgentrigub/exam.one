import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'

const ROLE =
  'Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.'

const REVIEWER = 'Ты — опытный экзаменатор Goethe-Zertifikat A2 Sprechen.'

export const speakingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'generator',
    role: ROLE,
    task: 'Задача: сгенерируй {count} самостоятельных заданий для части Sprechen A2: Teil 1 (Gespräch zur Kontaktaufnahme).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА:',
      '1. Формат практики: Для каждого задания нужно сгенерировать 1 общую тему (theme), ровно 4 готовых вопроса, на которые ученик отвечает (answerQuestions), и ровно 4 готовых вопроса, которые ученик произносит вслух (askQuestions).',
      '2. Специфика экзамена: В этой части проверяется умение задавать простые вопросы о человеке и его привычках и отвечать на них.',
      '3. Темы (theme): Должны быть бытовыми. Возможные темы: "Fragen zur Person", "Alltag", "Wochenende", "Hobby", "Arbeit", "Sprachen lernen".',
      '4. Все вопросы должны быть короткими, естественными, уровня A2 и использовать Du-Form. Вопросы в двух списках не должны повторяться.',
      '5. answerQuestions: вопросы партнёра, на которые ученик может ответить 1–2 полными предложениями.',
      '6. askQuestions: вопросы, которые ученик должен чётко и грамматически правильно произнести вслух.',
    ],
    outputPrelude: 'ФОРМАТ ВЫВОДА: валидный JSON-массив, соответствующий интерфейсу SpeakingTopicA2Teil1. Никакого дополнительного текста до или после JSON.',
    outputContract: `{
  "theme": "Название темы",
  "answerQuestions": ["Вопрос 1?", "Вопрос 2?", "Вопрос 3?", "Вопрос 4?"],
  "askQuestions": ["Вопрос 1?", "Вопрос 2?", "Вопрос 3?", "Вопрос 4?"]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'generator',
    role: ROLE,
    task: 'Твоя задача: сгенерировать {count} уникальных заданий для устной части Sprechen A2: Teil 2 (Über sich sprechen).',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):',
      '1. Формат: Для каждого задания сгенерируй главную тему-вопрос (theme) и ровно 4 опорных слова (keywords).',
      '2. Темы (theme): Главный вопрос должен касаться личной жизни кандидата. Возможные темы: семья, жилье, распорядок дня, выходные, отпуск, покупки, хобби, работа/учеба.',
      '3. Опорные слова (keywords): 4 коротких слова или мини-вопроса, которые помогают ученику построить монолог (например, "Sport?", "mit wem?", "Sonntagabend?", "lange schlafen?").',
    ],
    outputPrelude: 'ФОРМАТ ВЫВОДА: валидный JSON-массив, соответствующий интерфейсу SpeakingTopicA2Teil2. Никакого текста до или после JSON.',
    outputContract: `{
  "theme": "Was machen Sie in Ihrer Freizeit?",
  "keywords": ["Sich ausruhen?", "Sport?", "Ausgehen?", "Mit wem?"]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'answer',
    role: 'Ты — опытный преподаватель Goethe-Institut (уровень A2).',
    task: 'Ранее ты сгенерировал следующее задание для устной части (Sprechen Teil 1):\n{task}\n\nТВОЯ ЗАДАЧА: Сгенерируй пример идеального устного ответа (скрипт диалога) на это задание.',
    rules: [
      'Ответьте на все 4 вопроса из answerQuestions полными предложениями и добавьте по одной уместной детали.',
      'Затем произнесите все 4 вопроса из askQuestions грамматически правильно и естественно, используя Du-Form.',
      'Не добавляйте ответы вымышленного партнёра: пример должен соответствовать двум самостоятельным записям ученика.',
      'Речь должна звучать естественно для уровня A2, а не как письменное сочинение.',
    ],
    outputContract: `{
  "topicId": "{topicId}",
  "content": "Antworten:\\n1. ...\\n\\nFragen:\\n1. ...",
  "wordCount": 80,
  "highlights": {
    "greeting": "приветствие в начале",
    "mainPoints": ["почему ответ идеален"],
    "closing": "короткое завершение упражнения",
    "keyPhrases": ["ключевые разговорные фразы"]
  }
}
Не меняй topicId. Выводи ТОЛЬКО JSON.`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'answer',
    role: 'Ты — опытный преподаватель Goethe-Institut (уровень A2).',
    task: 'Ранее ты сгенерировал следующее задание для устной части (Sprechen Teil 2 - Монолог):\n{task}\n\nТВОЯ ЗАДАЧА: Сгенерируй пример идеального устного ответа (монолог + вопросы экзаменатора) на это задание.',
    rules: [
      'Сначала кандидат произносит связный монолог (около 40–60 слов), раскрывая все 4 опорных слова. Затем экзаменатор задаёт 1–2 дополнительных вопроса.',
      'Кандидат говорит полными предложениями от первого лица. Используй простые коннекторы (und, oder, aber, danach, deshalb).',
      'Речь должна звучать аутентично для A2; допускаются Also, Naja.',
      'Экзаменатор обращается на Sie.',
    ],
    outputContract: `{
  "topicId": "{topicId}",
  "content": "Kandidat: ...\\nPrüfer: ...\\nKandidat: ...",
  "wordCount": 60,
  "highlights": {
    "greeting": "вводное слово",
    "mainPoints": ["почему ответ идеален"],
    "closing": "реакция на вопросы экзаменатора",
    "keyPhrases": ["ключевые разговорные фразы"]
  }
}
Не меняй topicId. Выводи ТОЛЬКО JSON.`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'review',
    role: REVIEWER,
    task: `Оцени самостоятельную текстовую адаптацию Teil 1. Оценивай только то, что видно в STT-транскриптах; произношение не оценивай.

Язык обратной связи: {outputLanguage}.
Пиши на этом языке все comment, strengths, improvements и summary.

Тема: {theme}
Вопросы, на которые нужно ответить:
{answerQuestions}

Транскрипт ответов:
{answers}

Вопросы, которые ученик должен задать:
{askQuestions}

Транскрипт заданных вопросов:
{questions}`,
    rules: [
      'Максимум 4 прямых балла.',
      'answers, Label "Antworten", 0–2 балла: все четыре вопроса понятно и простыми полными предложениями A2.',
      'questions, Label "Fragen stellen", 0–2 балла: все четыре вопроса узнаваемы, понятны и грамматически оформлены как вопросы.',
      'Поставь teil = 1, maxPoints = 4 и верни ровно два критерия answers и questions с maxPoints 2 у каждого. totalPoints — их сумма.',
      'Все баллы — целые числа в пределах своего максимума. Без Markdown и без текста вне JSON-объекта.',
    ],
    outputContract: `{
  "teil": 1,
  "totalPoints": 0,
  "maxPoints": 4,
  "criteria": [
    { "id": "answers", "label": "Antworten", "points": 0, "maxPoints": 2, "comment": "..." },
    { "id": "questions", "label": "Fragen stellen", "points": 0, "maxPoints": 2, "comment": "..." }
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "..."
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'review',
    role: REVIEWER,
    task: `Оцени текстовую транскрипцию монолога Teil 2. Оценивай только то, что видно в транскрипте; произношение не оценивай.

Язык обратной связи: {outputLanguage}.
Пиши на этом языке все comment, strengths, improvements и summary.

Тема: {theme}
Четыре опорных пункта:
{keywords}

STT-транскрипт:
{monologue}`,
    rules: [
      'Максимум 8 прямых баллов.',
      'taskCompletion, Label "Aufgabenerfüllung", 0–4 балла: покрытие четырёх опорных пунктов, понятность и достаточно связный монолог.',
      'language, Label "Sprachliche Realisierung", 0–4 балла: уместная лексика A2, простые грамматические структуры и связки (und, aber, deshalb). Небольшие устные ошибки допустимы, пока высказывание понятно.',
      'Поставь teil = 2, maxPoints = 8 и верни ровно два критерия taskCompletion и language с maxPoints 4 у каждого. totalPoints — их сумма.',
      'Все баллы — целые числа. Без Markdown и без текста вне JSON-объекта.',
    ],
    outputContract: `{
  "teil": 2,
  "totalPoints": 0,
  "maxPoints": 8,
  "criteria": [
    { "id": "taskCompletion", "label": "Aufgabenerfüllung", "points": 0, "maxPoints": 4, "comment": "..." },
    { "id": "language", "label": "Sprachliche Realisierung", "points": 0, "maxPoints": 4, "comment": "..." }
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "..."
}`,
  }),
]
