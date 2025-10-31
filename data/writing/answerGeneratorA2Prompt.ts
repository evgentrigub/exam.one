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
    "wordCount": "количество слов в ответе",
    "highlights": {
        "greeting": "приветствие в начале ответа",
        "mainPoints": ["основные моменты в ответе"],
        "closing": "закрытие в конце ответа",
        "keyPhrases": ["ключевые фразы в ответе"]
    }
}

topicId - id задания, к которому ты составляешь ответ 
content - сгенерированный "идеальный" ответ 
highlights - здесь укажи основные моменты почему твой сгенерированный ответ является идеальным

Важное: ответы должны быть реалистичными и современными. 
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
    "wordCount": "количество слов в ответе",
    "highlights": {
        "greeting": "приветствие в начале ответа",
        "mainPoints": ["основные моменты в ответе"],
        "closing": "закрытие в конце ответа",
        "keyPhrases": ["ключевые фразы в ответе"]
    }
}

topicId - id задания, к которому ты составляешь ответ 
content - сгенерированный "идеальный" ответ 
highlights - здесь укажи основные моменты почему твой сгенерированный ответ является идеальным

Важное: ответы должны быть реалистичными и современными. 
  `
}

const dataAnswerRuleA2Part1 = `
Eine Kurznachricht (SMS) schreiben
In Schreiben, Teil 1 schreiben Sie eine SMS an Freunde, Bekannte oder Verwandte in der informellen „Du“-Form.
In einem kurzen freien Text von 20–30 Wörtern sollen Sie auf Alltagssituationen reagieren (wie z. B. eine Verspätung), 
einfache Informationen geben oder erfragen, sich entschuldigen, sich bedanken, um etwas bitten und etwas vorschlagen.
`

const dataAnswerRuleA2Part2 = `
Eine E-Mail schreiben
In Schreiben, Teil 2 schreiben Sie eine E-Mail an Kollegen, Vorgesetzte oder andere Personen in der (halb)formellen „Sie“-Form.
In einem kurzen freien Text von 30–40 Wörtern sollen Sie auf Alltagssituationen reagieren (wie z. B. eine Verspätung), 
einfache Informationen geben oder erfragen, sich entschuldigen, sich bedanken, um etwas bitten und etwas vorschlagen.
`