export const generateModelAnswerA2Part1 = (topicTask: string, topicId: string) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024. 
Ранее ты сгенерировал следюущее задание: ${topicTask}
ТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.
Детальное описание формата ответа Teil 1: ${dataAnswerRuleA2Part1}

ФОРМАТ ВЫВОДА (строго): 
Сгенерированный ответ выводи в формате JSON, который представлен ниже. Не меняй поле topicId.
{
    "topicId": "${topicId}",
    "content": "сгенерированный ответ",
    "wordCount": 25,
    "highlights": {
        "greeting": "приветствие в начале ответа",
        "mainPoints": ["основные моменты в ответе"],
        "closing": "закрытие в конце ответа",
        "keyPhrases": ["ключевые фразы в ответе"]
    }
}

Поля JSON:
topicId - id задания (не меняй)
content - сгенерированный "идеальный" ответ (строка)
wordCount - количество слов в content (целое число, не строка)
highlights - объяснение почему ответ идеален

Важное: ответы должны быть реалистичными и современными. Выводи ТОЛЬКО JSON, без пояснений до и после.
  `
}

export const generateModelAnswerA2Part2 = (topicTask: string, topicId: string) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024. 
Ранее ты сгенерировал следюущее задание: ${topicTask}
ТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.
Детальное описание формата ответа Teil 2: ${dataAnswerRuleA2Part2}

ФОРМАТ ВЫВОДА (строго): 
Сгенерированный ответ выводи в формате JSON, который представлен ниже. Не меняй поле topicId.
{
    "topicId": "${topicId}",
    "content": "сгенерированный ответ",
    "wordCount": 35,
    "highlights": {
        "greeting": "приветствие в начале ответа",
        "mainPoints": ["основные моменты в ответе"],
        "closing": "закрытие в конце ответа",
        "keyPhrases": ["ключевые фразы в ответе"]
    }
}

Поля JSON:
topicId - id задания (не меняй)
content - сгенерированный "идеальный" ответ (строка)
wordCount - количество слов в content (целое число, не строка)
highlights - объяснение почему ответ идеален

Важное: ответы должны быть реалистичными и современными. Выводи ТОЛЬКО JSON, без пояснений до и после.
  `
}

const dataAnswerRuleA2Part1 = `
Eine Kurznachricht (SMS) schreiben. 
In Schreiben, Teil 1 schreiben Sie eine SMS an Freunde, Bekannte oder Verwandte in der informellen „Du“-Form. 
In einem kurzen freien Text von 20–30 Wörtern sollen Sie auf Alltagssituationen reagieren (wie z. B. eine Verspätung), einfache Informationen geben oder erfragen, sich entschuldigen, sich bedanken, um etwas bitten und etwas vorschlagen.

ВАЖНЫЕ ПРАВИЛА ДЛЯ ГЕНЕРАЦИИ (ИДЕАЛЬНЫЙ ОТВЕТ):
1. Используйте неформальное приветствие (например, Hallo, Hi) и формулу прощания (например, Bis bald, LG). Свое собственное имя в конце указывать не обязательно (опционально).
2. В SMS вполне нормально и разрешено опускать подлежащее, если оно стоит в начале предложения (например, "Bin auf dem Weg" вместо "Ich bin auf dem Weg" или "Habe keine Lust"). Используйте этот стилистический прием, чтобы звучать аутентично!
3. Вы можете (и должны) использовать 1-2 подходящих эмодзи/смайлика.
4. Обязательно раскройте все 3 содержательных пункта из задания.
`;

const dataAnswerRuleA2Part2 = `
Eine E-Mail schreiben.
In Schreiben, Teil 2 schreiben Sie eine E-Mail an Kollegen, Vorgesetzte oder andere Personen in der (halb)formellen „Sie“-Form. 
In einem kurzen freien Text von 30–40 Wörtern sollen Sie auf Alltagssituationen reagieren (wie z. B. eine Verspätung), einfache Informationen geben oder erfragen, sich entschuldigen, sich bedanken, um etwas bitten und etwas vorschlagen.

ВАЖНЫЕ ПРАВИЛА ДЛЯ ГЕНЕРАЦИИ (ИДЕАЛЬНЫЙ ОТВЕТ):
1. Письмо ОБЯЗАТЕЛЬНО должно начинаться с подходящего (полу)формального приветствия (например, Sehr geehrte(r)... / Lieber Herr...), а в конце ОБЯЗАТЕЛЬНО должна стоять формула прощания (например, Mit freundlichen Grüßen) и Ваше полное имя (имя и фамилия).
2. Вы должны писать грамматически правильными и полными предложениями.
3. Вы ОБЯЗАТЕЛЬНО должны использовать коннекторы (союзы), чтобы плавно связывать предложения (например, und, oder, aber, denn, weil). Избегайте простого перечисления/нанизывания коротких главных предложений друг за другом.
4. Обязательно раскройте все 3 содержательных пункта из задания.
`;