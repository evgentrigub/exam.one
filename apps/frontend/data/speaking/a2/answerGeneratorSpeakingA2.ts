const dataAnswerRuleSpeakingA2Part1 = `
Ein Gespräch zur Kontaktaufnahme (Sprechen, Teil 1).
In Sprechen, Teil 1 sollen Sie sehr kurze Kontaktgespräche führen. Für diese selbstständige Übung bekommen Sie 4 konkrete Fragen, die Sie beantworten, und 4 konkrete Fragen, die Sie selbst stellen.

ВАЖНЫЕ ПРАВИЛА ДЛЯ ГЕНЕРАЦИИ (ИДЕАЛЬНЫЙ ОТВЕТ):
1. Ответьте на все 4 вопроса из answerQuestions полными предложениями и добавьте по одной уместной детали.
2. Затем произнесите все 4 вопроса из askQuestions грамматически правильно и естественно, используя Du-Form.
3. Не добавляйте ответы вымышленного партнёра: пример должен соответствовать двум самостоятельным записям ученика.
4. Речь должна звучать естественно для уровня A2, а не как письменное сочинение.
`

export const generateModelAnswerSpeakingA2Teil1 = (topicTask: string, topicId: string) => {
  return `
  Ты — опытный преподаватель Goethe-Institut (уровень A2). 
  Ранее ты сгенерировал следующее задание для устной части (Sprechen Teil 1):
  ${topicTask}
  
  ТВОЯ ЗАДАЧА: Сгенерируй пример идеального устного ответа (скрипт диалога) на это задание. 
  Детальное описание формата и правил для идеального ответа: 
  ${dataAnswerRuleSpeakingA2Part1}
  
  ФОРМАТ ВЫВОДА (строго):
  Сгенерированный ответ выводи в формате JSON, который представлен ниже. Не меняй поле topicId. Никакого текста до или после JSON.
  
  \`\`\`json
  {
    "topicId": "${topicId}",
    "content": "Antworten:\n1. Ich kaufe meistens im Supermarkt ein, weil er nah bei mir ist. ...\n\nFragen:\n1. Gehst du gern in den Supermarkt?\n2. ...",
    "wordCount": 80,
    "highlights": {
      "greeting": "приветствие в начале",
      "mainPoints": ["Укажи здесь, почему этот ответ идеален (например: 'Даны полные ответы на все вопросы', 'Все вопросы сформулированы правильно')"],
      "closing": "короткое завершение упражнения",
      "keyPhrases": ["Ключевые разговорные фразы из ответов"]
    }
  }
  \`\`\`
  
  wordCount - количество слов в content (целое число, не строка).
  Важное: ответы должны звучать как реальная живая речь, а не как текст из учебника. Выводи ТОЛЬКО JSON.
  `
}

const dataAnswerRuleSpeakingA2Part2 = `
ВАЖНЫЕ ПРАВИЛА ДЛЯ ГЕНЕРАЦИИ (ИДЕАЛЬНЫЙ ОТВЕТ):
1. Структура ответа: Сначала Кандидат произносит связный монолог (около 40-60 слов), раскрывая все 4 опорных слова с карточки. Затем Экзаменатор (Prüfer) задает 1-2 дополнительных вопроса по теме, на которые Кандидат кратко отвечает.
2. Формат монолога: Кандидат должен говорить полными предложениями от первого лица ("Ich..."). Обязательно использование простых коннекторов (und, oder, aber, danach, deshalb), чтобы речь звучала связно (плавно), а не как список изолированных слов.
3. Естественность: Речь должна звучать аутентично для уровня A2, допускаются небольшие разговорные вводные слова (Also, Naja).
4. Вопросы экзаменатора: Экзаменатор обращается к Кандидату на "Вы" (Sie-Form).
`

export const generateModelAnswerSpeakingA2Teil2 = (topicTask: string, topicId: string) => {
  return `
Ты — опытный преподаватель Goethe-Institut (уровень A2). 
Ранее ты сгенерировал следующее задание для устной части (Sprechen Teil 2 - Монолог):
${topicTask}

ТВОЯ ЗАДАЧА: Сгенерируй пример идеального устного ответа (монолог + вопросы экзаменатора) на это задание. 
Детальное описание формата и правил: 
${dataAnswerRuleSpeakingA2Part2}

ФОРМАТ ВЫВОДА (строго):
Сгенерируй ответ в формате JSON. Не меняй поле topicId. 

\`\`\`json
{
  "topicId": "${topicId}",
  "content": "Kandidat: Also, in meiner Freizeit mache ich viele Dinge. Am liebsten ruhe ich mich auf dem Sofa aus und lese ein Buch... (продолжение монолога по всем 4 словам).\n\nPrüfer: Welche Bücher lesen Sie denn am liebsten?\nKandidat: Ich lese sehr gern Krimis.\nPrüfer: Und gehen Sie auch manchmal ins Theater?\nKandidat: Nein, Theater finde ich ein bisschen langweilig.",
  "wordCount": 60,
  "highlights": {
    "greeting": "вводное слово (например, 'Also...')",
    "mainPoints": ["Укажи, почему ответ идеален (например, 'Раскрыты все 4 пункта из задания', 'Использованы союзы und/aber')"],
    "closing": "реакция на вопросы экзаменатора",
    "keyPhrases": ["Ключевые разговорные фразы (например, 'Am liebsten', 'Außerdem')"]
  }
}
\`\`\`
`
}
