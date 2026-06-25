const dataAnswerRuleSpeakingA2Part1 = `
Ein Gespräch zur Kontaktaufnahme (Sprechen, Teil 1).
In Sprechen, Teil 1 sollen Sie sehr kurze Kontaktgespräche führen. Sie bekommen 4 Karten mit Wörtern zu einem Thema und müssen Fragen stellen und auf Fragen antworten.

ВАЖНЫЕ ПРАВИЛА ДЛЯ ГЕНЕРАЦИИ (ИДЕАЛЬНЫЙ ОТВЕТ):
1. Беседа представляет собой диалог между Партнером А (задает вопросы) и Партнером Б (отвечает). Используйте неформальное обращение на "ты" (Du-Form).
2. Постановка вопросов: К каждому из 4 предложенных слов сформулируйте понятный, естественный вопрос уровня A2 (вопрос с вопросительным словом или вопрос типа да/нет).
3. Развернутые ответы: Ответы НИКОГДА не должны состоять только из одного слова! Партнер Б должен отвечать полными предложениями и добавлять детали (по 1-2 предложения на каждый ответ).
4. Естественные реакции: Партнер А должен коротко и естественно реагировать на каждый ответ Партнера Б перед тем, как задать следующий вопрос (например, с помощью слов-реакций "Ach so", "Aha", "Interessant", "Toll", "Wirklich?").
5. Диалог должен звучать связно (плавно) и аутентично.
`;

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
    "content": "Скрипт диалога. Например:\nPartner A: Hallo! Unsere Thema ist 'Wochenende'. Meine erste Karte ist 'Sport'. Machst du am Wochenende Sport?\nPartner B: Ja, ich spiele am Samstag oft Fußball mit meinen Freunden. Das macht viel Spaß.\nPartner A: Ach so, toll! Meine zweite Karte ist...",
    "wordCount": 80,
    "highlights": {
      "greeting": "приветствие в начале",
      "mainPoints": ["Укажи здесь, почему этот ответ идеален (например: 'Использованы полные предложения', 'Есть реакции на ответы')"],
      "closing": "завершение диалога (например: 'Danke für das Gespräch')",
      "keyPhrases": ["Ключевые разговорные фразы из текста, например: 'Ach so', 'Das finde ich auch'"]
    }
  }
  \`\`\`
  
  wordCount - количество слов в content (целое число, не строка).
  Важное: ответы должны звучать как реальная живая речь, а не как текст из учебника. Выводи ТОЛЬКО JSON.
  `
  };

const dataAnswerRuleSpeakingA2Part2 = `
ВАЖНЫЕ ПРАВИЛА ДЛЯ ГЕНЕРАЦИИ (ИДЕАЛЬНЫЙ ОТВЕТ):
1. Структура ответа: Сначала Кандидат произносит связный монолог (около 40-60 слов), раскрывая все 4 опорных слова с карточки. Затем Экзаменатор (Prüfer) задает 1-2 дополнительных вопроса по теме, на которые Кандидат кратко отвечает.
2. Формат монолога: Кандидат должен говорить полными предложениями от первого лица ("Ich..."). Обязательно использование простых коннекторов (und, oder, aber, danach, deshalb), чтобы речь звучала связно (плавно), а не как список изолированных слов.
3. Естественность: Речь должна звучать аутентично для уровня A2, допускаются небольшие разговорные вводные слова (Also, Naja).
4. Вопросы экзаменатора: Экзаменатор обращается к Кандидату на "Вы" (Sie-Form).
`;

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
};