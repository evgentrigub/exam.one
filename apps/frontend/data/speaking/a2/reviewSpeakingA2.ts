import type { SpeakingTopicA2Teil1, SpeakingTopicA2Teil2 } from '~/utils/exercises/speaking'
import type { LanguageOptions } from '~/utils/types'

function outputRules(teil: 1 | 2, outputLanguage: LanguageOptions): string {
  const criteria =
    teil === 1
      ? [
          { id: 'answers', label: 'Antworten', points: 0, maxPoints: 2 },
          { id: 'questions', label: 'Fragen stellen', points: 0, maxPoints: 2 },
        ]
      : [
          { id: 'taskCompletion', label: 'Aufgabenerfüllung', points: 0, maxPoints: 4 },
          { id: 'language', label: 'Sprachliche Realisierung', points: 0, maxPoints: 4 },
        ]

  return `
Язык обратной связи: ${outputLanguage}.
Пиши на этом языке все comment, strengths, improvements и summary.

Верни только валидный JSON-объект по этой схеме:
${JSON.stringify(
  {
    teil,
    totalPoints: 0,
    maxPoints: teil === 1 ? 4 : 8,
    criteria: criteria.map(item => ({
      ...item,
      comment: `краткий конкретный комментарий на языке обратной связи (${outputLanguage})`,
    })),
    strengths: [`конкретная сильная сторона на языке обратной связи (${outputLanguage})`],
    improvements: [`конкретный следующий шаг на языке обратной связи (${outputLanguage})`],
    summary: `краткая общая оценка на языке обратной связи (${outputLanguage})`,
  },
  null,
  2
)}
Все баллы — целые числа в пределах своего максимума.
Без Markdown и без текста вне JSON-объекта.
`
}

export function reviewPromptSpeakingA2Teil1(
  topic: SpeakingTopicA2Teil1,
  answersTranscript: string,
  questionsTranscript: string,
  outputLanguage: LanguageOptions
): string {
  return `
Ты — опытный экзаменатор Goethe-Zertifikat A2 Sprechen.
Оцени самостоятельную текстовую адаптацию Teil 1. Оценивай только то, что видно в STT-транскриптах; произношение не оценивай.

Тема: ${topic.theme}
Вопросы, на которые нужно ответить:
${topic.answerQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

Транскрипт ответов:
${answersTranscript}

Вопросы, которые ученик должен задать:
${topic.askQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

Транскрипт заданных вопросов:
${questionsTranscript}

Максимум 4 прямых балла:
- answers, Label "Antworten", 0–2 балла: все четыре вопроса понятно и простыми полными предложениями A2; короткие уместные детали — плюс.
- questions, Label "Fragen stellen", 0–2 балла: все четыре вопроса узнаваемы, понятны и грамматически оформлены как вопросы.

Поставь teil = 1, maxPoints = 4 и верни ровно два критерия answers и questions с maxPoints 2 у каждого. totalPoints — их сумма.
${outputRules(1, outputLanguage)}
`
}

export function reviewPromptSpeakingA2Teil2(
  topic: SpeakingTopicA2Teil2,
  monologueTranscript: string,
  outputLanguage: LanguageOptions
): string {
  return `
Ты — опытный экзаменатор Goethe-Zertifikat A2 Sprechen.
Оцени текстовую транскрипцию монолога Teil 2. Оценивай только то, что видно в транскрипте; произношение не оценивай.

Тема: ${topic.theme}
Четыре опорных пункта:
${topic.keywords.map((keyword, index) => `${index + 1}. ${keyword}`).join('\n')}

STT-транскрипт:
${monologueTranscript}

Максимум 8 прямых баллов:
- taskCompletion, Label "Aufgabenerfüllung", 0–4 балла: покрытие четырёх опорных пунктов, понятность и достаточно связный монолог.
- language, Label "Sprachliche Realisierung", 0–4 балла: уместная лексика A2, простые грамматические структуры и связки вроде und, aber или deshalb.
  Небольшие устные ошибки допустимы, пока высказывание понятно.

Поставь teil = 2, maxPoints = 8 и верни ровно два критерия taskCompletion и language с maxPoints 4 у каждого. totalPoints — их сумма.
${outputRules(2, outputLanguage)}
`
}
