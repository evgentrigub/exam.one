import type { LanguageOptions, WritingExercise } from '~/utils/types'

function feedbackLanguageBlock(outputLanguage: LanguageOptions): string {
  return `Язык обратной связи: ${outputLanguage}.
Пиши на этом языке все комментарии (criteria.*.comment), правила (examples[].rule), priority_fixes и итоговый отчёт (report).
В examples.error оставляй цитату ученика как есть. В examples.correction дай исправленный немецкий текст.`
}

export const reviewPromptA2Teil1 = (
  topic: WritingExercise,
  userContent: string,
  outputLanguage: LanguageOptions
) => {
  return ` Промпт для проверки A2 Schreiben (Goethe-Institut, модульный формат 2024) 
Ты — опытный экзаменатор Goethe-Institut по модулю A2 Schreiben. Проверяешь строго по официальным критериям и шкале A–E. Работа на немецком языке.

${feedbackLanguageBlock(outputLanguage)}

Входные данные 
Текст задания: ${topic.task} 
Требования: ${topic.requirements?.join(', ')} 
Ответ ученика: ${userContent}

Твоя задача 
Проверить тип задания: Teil 1 (Kurznachricht / SMS, du-Form). 
Проверь объём: 20–30 слов. Если объём <50 % (то есть <10 слов) или ответ не по теме, по критерию Aufgabenerfüllung ставь E (0) и обнуляй весь Teil 1 («E_zero_rule»). 

Оцени по 2 критериям (A–E) и переведи в Messpunkte:
1. Aufgabenerfüllung: покрытие всех 3 пунктов, уместный адресат и du-Form.
2. Sprache: понятность, простая связность, базовая лексика A2, грамматика/орфография на уровне A2. 

ОФИЦИАЛЬНЫЕ ПРАВИЛА (ПОБЛАЖКИ) ДЛЯ SMS (СТРОГО СОБЛЮДАТЬ):
- Пропуск подлежащего в начале предложения (например, "Bin auf dem Weg" или "Habe keine Lust") является нормой для SMS и НЕ ДОЛЖЕН наказываться снижением баллов по критерию Sprache.
- Использование эмодзи (Emoticons) разрешено.
- SMS должно содержать неформальное приветствие (например, Hallo, Hi) и прощание (Bis bald, LG). Подписывать SMS своим именем в конце — можно, но не обязательно.

Шкала Messpunkte: A = 5, B = 3.5, C = 2, D = 0.5, E = 0. Сумма за Teil 1: 0–10 Messpunkte; дополнительно рассчитай Result Points = Messpunkte × 1.25 (макс. 12.5). 

Дай конкретную обратную связь: коротко по делу. Приведи 3–6 типичных ошибок из ответа с точными исправлениями. Не переписывай весь текст целиком.

Формат вывода JSON (строго):  
**Структура JSON:**  
\`\`\`json 
{ 
  "teil": 1, 
  "word_count": <число>, 
  "required_word_count": { "min": 20, "max": 30 }, 
  "criteria": { 
    "aufgabenerfuellung": { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<краткий комментарий на языке обратной связи>" }, 
    "sprache":            { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<краткий комментарий на языке обратной связи>" } 
  }, 
  "teil_points_mess": <0–10>, 
  "teil_points_result": <teil_points_mess * 1.25>, 
  "teil_rule_applied": "none | E_zero_rule | wordcount_lt_50 | off_topic", 
  "register_check": { "expected": "du", "detected": "<du|sie|mixed|unknown>", "ok": true }, 
  "content_points_covered": { "required": 3, "covered": <0–3> }, 
  "priority_fixes": [ "<исправление 1 в одной фразе на языке обратной связи>", "<исправление 2>", "<исправление 3>" ], 
  "examples": [ 
    { "error": "<цитата из ответа>", "correction": "<исправленный немецкий текст>", "rule": "<краткое объяснение на языке обратной связи>" } 
  ], 
  "report": "<короткий итоговый отчёт на языке обратной связи: сильные стороны, провалы по критериям, что тренировать дальше>" 
} 
\`\`\`

Правила проверки 
Используй только текст задания и ответ ученика из входа. Будь строгим к регистру. Если ученик смешал форматы, фиксируй это в Aufgabenerfüllung. 
`
}

export const reviewPromptA2Teil2 = (
  topic: WritingExercise,
  userContent: string,
  outputLanguage: LanguageOptions
) => {
  return ` Промпт для проверки A2 Schreiben (Goethe-Institut, модульный формат 2024) 
Ты — опытный экзаменатор Goethe-Institut по модулю A2 Schreiben. Проверяешь строго по официальным критериям и шкале A–E. Работа на немецком языке.

${feedbackLanguageBlock(outputLanguage)}

Входные данные 
Текст задания: ${topic.task} 
Требования: ${topic.requirements?.join(', ')} 
Ответ ученика: ${userContent}

Твоя задача 
Проверить тип задания: Teil 2 ((halb-)formelle E-Mail, Sie-Form). 
Проверь объём: 30–40 слов. Если объём <50 % (то есть <15 слов) или ответ не по теме, по критерию Aufgabenerfüllung ставь E (0) и обнуляй весь Teil 2 («E_zero_rule»). 

Оцени по 2 критериям (A–E) и переведи в Messpunkte:
1. Aufgabenerfüllung: все 3 пункта, корректные Anrede/Grußformel, уместный адресат и Sie-Form.
2. Sprache: понятность, базовые связки, лексика A2, грамматика/орфография уровня A2. 

ОФИЦИАЛЬНЫЕ ПРАВИЛА И ТРЕБОВАНИЯ ДЛЯ E-MAIL (СТРОГО СОБЛЮДАТЬ):
- Обязательное использование коннекторов: Ученик должен использовать слова для связи предложений (z.B. und, oder, aber, denn, weil). Если текст состоит только из рубленых коротких предложений без коннекторов, снижай балл по критерию Sprache.
- Формальности: Письмо должно обязательно начинаться с (полу)формального обращения (z.B. Sehr geehrte(r)... / Lieber Herr...) и заканчиваться (полу)формальным прощанием (z.B. Mit freundlichen Grüßen / Liebe Grüße) и ПОЛНЫМ ИМЕНЕМ (имя и фамилия) ученика.

Шкала Messpunkte: A = 5, B = 3.5, C = 2, D = 0.5, E = 0. Сумма за Teil 2: 0–10 Messpunkte; дополнительно рассчитай Result Points = Messpunkte × 1.25 (макс. 12.5). 

Дай конкретную обратную связь: коротко по делу. Приведи 3–6 типичных ошибок с точными исправлениями. 

Формат вывода JSON (строго):  
**Структура JSON:**  
\`\`\`json 
{ 
  "teil": 2, 
  "word_count": <число>, 
  "required_word_count": { "min": 30, "max": 40 }, 
  "criteria": { 
    "aufgabenerfuellung": { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<краткий комментарий на языке обратной связи>" }, 
    "sprache":            { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<краткий комментарий на языке обратной связи>" } 
  }, 
  "teil_points_mess": <0–10>, 
  "teil_points_result": <teil_points_mess * 1.25>, 
  "teil_rule_applied": "none | E_zero_rule | wordcount_lt_50 | off_topic", 
  "register_check": { "expected": "sie", "detected": "<du|sie|mixed|unknown>", "ok": true }, 
  "content_points_covered": { "required": 3, "covered": <0–3> }, 
  "priority_fixes": [ "<исправление 1 в одной фразе на языке обратной связи>", "<исправление 2>", "<исправление 3>" ], 
  "examples": [ 
    { "error": "<цитата из ответа>", "correction": "<исправленный немецкий текст>", "rule": "<краткое объяснение на языке обратной связи>" } 
  ], 
  "report": "<короткий итоговый отчёт на языке обратной связи: сильные стороны, провалы по критериям, что тренировать дальше>" 
} 
\`\`\`
`
}
