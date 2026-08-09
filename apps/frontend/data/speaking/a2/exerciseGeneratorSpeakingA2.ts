import type { SpeakingA2Part } from '~/utils/exercises/speaking'

// Types now live in the canonical location and are re-exported for callers
// that still import them from this generator module.
export type {
  SpeakingTopicA2Teil1,
  SpeakingTopicA2Teil2,
  SpeakingA2Topic,
} from '~/utils/exercises/speaking'

export const generateSpeakingA2Teil1 = (numberOfTopics: number) => {
  return `
  Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
  Задача: сгенерируй ${numberOfTopics} самостоятельных заданий для части Sprechen A2: Teil 1 (Gespräch zur Kontaktaufnahme).
  
  ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА:
  1. Формат практики: Для каждого задания нужно сгенерировать 1 общую тему (theme), ровно 4 готовых вопроса, на которые ученик отвечает (answerQuestions), и ровно 4 готовых вопроса, которые ученик произносит вслух (askQuestions).
  2. Специфика экзамена: В этой части проверяется умение задавать простые вопросы о человеке и его привычках и отвечать на них. В приложении карточки адаптированы в полные текстовые вопросы для самостоятельной практики без партнёра.
  3. Темы (theme): Должны быть бытовыми и понятными. Возможные темы: "Fragen zur Person", "Alltag", "Wochenende", "Hobby", "Arbeit", "Sprachen lernen".
  4. Все вопросы должны быть короткими, естественными, уровня A2 и использовать Du-Form. Вопросы в двух списках не должны повторяться.
  5. answerQuestions: вопросы партнёра, на которые ученик может ответить 1–2 полными предложениями.
  6. askQuestions: вопросы, которые ученик должен чётко и грамматически правильно произнести вслух.
  
  ФОРМАТ ВЫВОДА:
  Сгенерируй результат строго в формате валидного JSON-массива, соответствующего интерфейсу SpeakingTopicA2Teil1.
  Структура объекта в JSON:
  {
    "theme": "Название темы",
    "answerQuestions": ["Вопрос 1?", "Вопрос 2?", "Вопрос 3?", "Вопрос 4?"],
    "askQuestions": ["Вопрос 1?", "Вопрос 2?", "Вопрос 3?", "Вопрос 4?"]
  }
  
  Никакого дополнительного текста до или после JSON.
  `
}

export const generateSpeakingA2Teil2 = (numberOfTopics: number) => {
  return `
  Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
  Твоя задача: сгенерировать ${numberOfTopics} уникальных заданий для устной части Sprechen A2: Teil 2 (Über sich sprechen).
  
  ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА (СТРОГО):
  1. Формат: Для каждого задания сгенерируй главную тему-вопрос (theme) и ровно 4 опорных слова (keywords).
  2. Темы (theme): Главный вопрос должен касаться личной жизни кандидата. Возможные темы: семья, жилье, распорядок дня, выходные, отпуск, покупки, хобби, работа/учеба.
  3. Опорные слова (keywords): Это 4 коротких слова или мини-вопроса, которые помогают ученику построить монолог (например, если тема "Wochenende", слова могут быть: "Sport?", "mit wem?", "Sonntagabend?", "lange schlafen?").
  
  ФОРМАТ ВЫВОДА:
  Сгенерируй результат строго в формате валидного JSON-массива, соответствующего интерфейсу SpeakingTopicA2Teil2.
  Структура объекта в JSON:
  {
    "theme": "Was machen Sie in Ihrer Freizeit?",
    "keywords": ["Sich ausruhen?", "Sport?", "Ausgehen?", "Mit wem?"]
  }
  Никакого текста до или после JSON.
  `
}

/**
 * Build one prompt per A2 speaking part. Mirrors `listeningA2Parts` /
 * `readingA2Parts` so a single generation call yields one topic for every
 * Sprechen Teil. Only Teil 1 & 2 are modelled in this build.
 */
export const speakingA2Parts = (
  topicsPerPart = 1
): Array<{ part: SpeakingA2Part; prompt: string }> => [
  { part: 1, prompt: generateSpeakingA2Teil1(topicsPerPart) },
  { part: 2, prompt: generateSpeakingA2Teil2(topicsPerPart) },
]
