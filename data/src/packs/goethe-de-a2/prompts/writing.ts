import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'

const ROLE =
  'Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату A2.'

const WRITING_INTERFACE = `export interface WritingTopic {
  id: string
  title: string
  topicType: 'report' | 'review' | 'proposal' | 'article' | 'note' | 'form' | 'email' | 'letter' | 'essay' | 'postcard' | 'post'
  difficulty: 'A2'
  testingPart: number
  estimatedTime: number
  wordCount: { min: number; max: number }
  category: string[]
  createdAt: string
  description: string
  task: string
  requirements: string[]
}`

const ANSWER_CONTRACT = `{
    "topicId": "{topicId}",
    "content": "сгенерированный ответ",
    "wordCount": number,
    "highlights": {
        "greeting": "приветствие в начале ответа",
        "mainPoints": ["основные моменты в ответе"],
        "closing": "закрытие в конце ответа",
        "keyPhrases": ["ключевые фразы в ответе"]
    }
}
Поля JSON: topicId не меняй; content — идеальный ответ; wordCount — целое число; highlights — почему ответ идеален.
Важное: ответы должны быть реалистичными и современными. Выводи ТОЛЬКО JSON, без пояснений до или после.`

const REVIEW_JSON_TEIL1 = `Формат вывода JSON (строго):
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
  "priority_fixes": [ "<исправление 1>", "<исправление 2>", "<исправление 3>" ],
  "examples": [
    { "error": "<цитата из ответа>", "correction": "<исправленный немецкий текст>", "rule": "<краткое объяснение>" }
  ],
  "report": "<короткий итоговый отчёт>"
}`

const REVIEW_JSON_TEIL2 = `Формат вывода JSON (строго):
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
  "priority_fixes": [ "<исправление 1>", "<исправление 2>", "<исправление 3>" ],
  "examples": [
    { "error": "<цитата из ответа>", "correction": "<исправленный немецкий текст>", "rule": "<краткое объяснение>" }
  ],
  "report": "<короткий итоговый отчёт>"
}`

export const writingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'generator',
    role: ROLE,
    task: 'Задача: сгенерируй {count} самостоятельных задания для части Schreiben A2: Teil 1 (Kurznachricht / SMS). ВСЕ инструкции к заданиям выдай на НЕМЕЦКОМ. Никаких ответов-образцов — только условия задач.',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ:',
      '• Формат и стиль соответствуют A2 Schreiben, Teil 1.',
      '• Каждое задание — личная SMS в du-Form для друзей/знакомых/родных.',
      '• Для каждого задания дай ровно 3 Inhaltspunkte, которые надо раскрыть.',
      '• В конце каждого задания явно укажи: „Schreiben Sie 20–30 Wörter. Schreiben Sie zu allen drei Punkten.”',
      '• Ситуации — типичные повседневные: опоздание, встреча, приглашение, просьба, предложение, информация/вопрос.',
      '• Лексика и грамматика — строго уровень A2, простые формулировки.',
      '• Не добавляй языковых подсказок, клише, шаблонов и примеров ответов.',
      '• Темы выбирай случайно: Alltag; Familie & Freunde; Freizeit & Termine; Einkaufen & Preise; Schule/Kurs; Arbeit; Wohnen & Nachbarn; Gesundheit; Verkehr & Treffpunkte; Essen & Einladungen.',
      '• id: уникальный строковый идентификатор. title: короткий заголовок на немецком. estimatedTime: 15. wordCount: { min: 20, max: 30 }. topicType: note. testingPart: 1.',
      '• requirements: Du-Form (informell); 3 Inhaltspunkte; 20–30 Wörter; ohne Vorlagen/Beispiele.',
    ],
    examples: [
      `Teil 1
Sie sind auf dem Weg ins Kino und schreiben eine SMS an Ihren Freund Tobias.
Entschuldigen Sie sich, dass Sie zu spät kommen.
Erklären Sie, warum.
Schreiben Sie, was Ihr Freund machen soll.
Schreiben Sie 20–30 Wörter.
Schreiben Sie zu allen drei Punkten.`,
      `Teil 1
Sie sind zu Hause und schreiben eine SMS an Ihre Freundin Paula.
Schreiben Sie, dass Sie sie am Wochenende sehen möchten.
Erklären Sie, warum.
Nennen Sie eine Uhrzeit und einen Ort für das Treffen.
Schreiben Sie 20–30 Wörter.
Schreiben Sie zu allen drei Punkten.`,
    ],
    outputPrelude: `ФОРМАТ ВЫВОДА (строго, массив из {count} объектов). Для Teil 1 используй topicType: 'note'.\n${WRITING_INTERFACE}`,
    outputContract: 'СГЕНЕРИРУЙ РЕЗУЛЬТАТ ТОЛЬКО В ВИДЕ МАССИВА ИЗ {count} ОБЪЕКТОВ WritingTopic. Без пояснений, без Markdown-комментариев.',
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'generator',
    role: ROLE,
    task: 'Задача: сгенерируй {count} самостоятельных задания для части Schreiben A2: Teil 2 (E-Mail). ВСЕ инструкции к заданиям выдай на НЕМЕЦКОМ. Никаких ответов-образцов — только условия задач.',
    rules: [
      'ОБЩИЕ ТРЕБОВАНИЯ:',
      '• Формат и стиль соответствуют A2 Schreiben, Teil 2.',
      '• Каждое задание — (полу)формальная E-Mail в Sie-Form адресату: Kollegin/Kollege, Vorgesetzte(r), Kursleitung/Lehrer(in), Verwaltung/Service, Nachbar(in) (вежливо).',
      '• Для каждого задания дай ровно 3 Inhaltspunkte.',
      '• В конце каждого задания явно укажи: „Schreiben Sie 30–40 Wörter. Schreiben Sie zu allen drei Punkten.”',
      '• Требуй Anrede и Grußformel, нейтрально-вежливый регистр.',
      '• Ситуации — типичные повседневно-деловые: благодарность, просьба, извинение, предложение помощи, уточнение даты/места.',
      '• Лексика и грамматика — строго A2.',
      '• Не добавляй языковых подсказок и примеров ответов.',
      '• Темы: Arbeit & Büroalltag; Kurs/Prüfung/Termin; Veranstaltungen; Wohnen & Hausverwaltung; Nachbarschaft; Verein; Service; Gesundheitstermin; Wegbeschreibung; Einkäufe/Bestellungen.',
      '• topicType: email. testingPart: 2. estimatedTime: 15. wordCount: { min: 30, max: 40 }.',
      '• requirements: Sie-Form; Anrede und Grußformel; 3 Inhaltspunkte; 30–40 Wörter; ohne Vorlagen/Beispiele.',
    ],
    examples: [
      `Teil 2
Herr Krüger, der Leiter von Ihrem Sportverein, möchte ein kostenloses Kennenlern-Wochenende für Jugendliche organisieren und bittet Sie um Hilfe.
Schreiben Sie Herrn Krüger eine E-Mail:
Schreiben Sie, wie Sie die Idee finden.
Fragen Sie nach dem Datum.
Schlagen Sie etwas vor, wie Sie helfen können.
Schreiben Sie 30–40 Wörter.
Schreiben Sie zu allen drei Punkten.`,
    ],
    outputPrelude: `ФОРМАТ ВЫВОДА (строго, массив из {count} объектов). Для Teil 2 используй topicType: 'email'.\n${WRITING_INTERFACE}`,
    outputContract: 'СГЕНЕРИРУЙ РЕЗУЛЬТАТ ТОЛЬКО В ВИДЕ МАССИВА ИЗ {count} ОБЪЕКТОВ WritingTopic. Без пояснений, без Markdown-комментариев.',
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'answer',
    role: 'Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024.',
    task: 'Ранее ты сгенерировал следующее задание: {task}\nТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.',
    rules: [
      'Eine Kurznachricht (SMS) schreiben. Du-Form, 20–30 Wörter, 3 Inhaltspunkte.',
      'Используйте неформальное приветствие (Hallo, Hi) и формулу прощания (Bis bald, LG). Имя в конце необязательно.',
      'В SMS нормально опускать подлежащее в начале предложения ("Bin auf dem Weg").',
      'Можно использовать 1–2 эмодзи.',
      'Обязательно раскройте все 3 содержательных пункта.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'answer',
    role: 'Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату 2024.',
    task: 'Ранее ты сгенерировал следующее задание: {task}\nТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.',
    rules: [
      'Eine E-Mail schreiben. Sie-Form, 30–40 Wörter, 3 Inhaltspunkte.',
      'Письмо ОБЯЗАТЕЛЬНО начинается с (полу)формального приветствия и заканчивается Grußformel и полным именем.',
      'Пишите грамматически правильными полными предложениями.',
      'ОБЯЗАТЕЛЬНО используйте коннекторы (und, oder, aber, denn, weil).',
      'Обязательно раскройте все 3 содержательных пункта.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'review',
    role: 'Ты — опытный экзаменатор Goethe-Institut по модулю A2 Schreiben. Проверяешь строго по официальным критериям и шкале A–E. Работа на немецком языке.',
    task: `Язык обратной связи: {outputLanguage}.
Пиши на этом языке все комментарии (criteria.*.comment), правила (examples[].rule), priority_fixes и итоговый отчёт (report).
В examples.error оставляй цитату ученика как есть. В examples.correction дай исправленный немецкий текст.

Входные данные
Текст задания: {task}
Требования: {requirements}
Ответ ученика: {userContent}`,
    rules: [
      'Проверить тип задания: Teil 1 (Kurznachricht / SMS, du-Form).',
      'Проверь объём: 20–30 слов. Если объём <50 % (то есть <10 слов) или ответ не по теме, по критерию Aufgabenerfüllung ставь E (0) и обнуляй весь Teil 1 («E_zero_rule»).',
      'Оцени по 2 критериям (A–E): 1. Aufgabenerfüllung: покрытие всех 3 пунктов, уместный адресат и du-Form. 2. Sprache: понятность, простая связность, базовая лексика A2.',
      'Пропуск подлежащего в начале SMS не наказывается. Эмодзи разрешены. Нужны неформальное приветствие и прощание.',
      'Шкала Messpunkte: A = 5, B = 3.5, C = 2, D = 0.5, E = 0. Сумма за Teil 1: 0–10; Result Points = Messpunkte × 1.25.',
      'Дай конкретную обратную связь. Приведи 3–6 типичных ошибок с точными исправлениями. Не переписывай весь текст.',
    ],
    outputContract: REVIEW_JSON_TEIL1,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'review',
    role: 'Ты — опытный экзаменатор Goethe-Institut по модулю A2 Schreiben. Проверяешь строго по официальным критериям и шкале A–E. Работа на немецком языке.',
    task: `Язык обратной связи: {outputLanguage}.
Пиши на этом языке все комментарии (criteria.*.comment), правила (examples[].rule), priority_fixes и итоговый отчёт (report).
В examples.error оставляй цитату ученика как есть. В examples.correction дай исправленный немецкий текст.

Входные данные
Текст задания: {task}
Требования: {requirements}
Ответ ученика: {userContent}`,
    rules: [
      'Проверить тип задания: Teil 2 ((halb-)formelle E-Mail, Sie-Form).',
      'Проверь объём: 30–40 слов. Если объём <50 % (то есть <15 слов) или ответ не по теме, ставь E (0) и обнуляй Teil 2 («E_zero_rule»).',
      'Оцени по 2 критериям: 1. Aufgabenerfüllung: все 3 пункта, Anrede/Grußformel, Sie-Form. 2. Sprache: понятность, базовые связки, лексика A2.',
      'Обязательные коннекторы. Письмо должно начинаться с (полу)формального обращения и заканчиваться прощанием и ПОЛНЫМ ИМЕНЕМ.',
      'Шкала Messpunkte: A = 5, B = 3.5, C = 2, D = 0.5, E = 0. Сумма за Teil 2: 0–10; Result Points = Messpunkte × 1.25.',
      'Дай конкретную обратную связь и 3–6 типичных ошибок с исправлениями.',
    ],
    outputContract: REVIEW_JSON_TEIL2,
  }),
]
