// Types now live in the canonical location and are re-exported for callers
// that still import them from this generator module.
export type {
  SpeakingTopicA2Teil1,
  SpeakingTopicA2Teil2,
  SpeakingA2Topic
} from '~/utils/exercises/speaking'

export const generateSpeakingA2Teil1 = (numberOfTopics: number) => { 
    return `
  Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024 года.
  Задача: сгенерируй ${numberOfTopics} самостоятельных заданий для части Sprechen A2: Teil 1 (Gespräch zur Kontaktaufnahme).
  
  ОБЩИЕ ТРЕБОВАНИЯ И ПРАВИЛА:
  1. Формат: Для каждого задания нужно сгенерировать 1 общую тему (theme) и ровно 4 коротких слова для карточек (cards).
  2. Специфика экзамена: В этой части проверяется умение задавать простые вопросы о человеке и его привычках и отвечать на них.
  3. Темы (theme): Должны быть бытовыми и понятными. Возможные темы: "Fragen zur Person", "Alltag", "Wochenende", "Hobby", "Arbeit", "Sprachen lernen".
  4. Слова на карточках (cards): Это должны быть ОДИНОЧНЫЕ слова (существительные, глаголы или вопросительные слова), на основе которых легко задать вопрос на "Ты" (Du-Form). 
     Например, для темы "Fragen zur Person" карточки могут быть: ["Internet", "Musik", "Urlaub", "Beruf"].
     Для темы "Wochenende" карточки: ["Samstag", "Freunde", "Sport", "Kino"].
  
  ФОРМАТ ВЫВОДА:
  Сгенерируй результат строго в формате валидного JSON-массива, соответствующего интерфейсу SpeakingTopicA2Teil1.
  Структура объекта в JSON:
  {
    "theme": "Название темы",
    "cards": ["Слово 1", "Слово 2", "Слово 3", "Слово 4"]
  }
  
  Никакого дополнительного текста до или после JSON.
  ` 
};

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
  };