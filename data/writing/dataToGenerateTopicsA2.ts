export const generateTopicsA2Part1 = (numberOfTopics: number) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату A2.
Задача: сгенерируй ${numberOfTopics} самостоятельных задания для части Schreiben A2: Teil 1 (Kurznachricht / SMS).
ВСЕ инструкции к заданиям выдай на НЕМЕЦКОМ. Никаких ответов-образцов — только условия задач.

ОБЩИЕ ТРЕБОВАНИЯ:
• Формат и стиль соответствуют A2 Schreiben, Teil 1.
• Каждое задание — личная SMS в du-Form для друзей/знакомых/родных.
• Для каждого задания дай ровно 3 Inhalts­punkte, которые надо раскрыть.
• В конце каждого задания явно укажи: „Schreiben Sie 20–30 Wörter. Schreiben Sie zu allen drei Punkten.”
• Ситуации — типичные повседневные: опоздание, встреча, приглашение, просьба, предложение, информация/вопрос.
• Лексика и грамматика — строго уровень A2, простые формулировки.
• Не добавляй языковых подсказок, клише, шаблонов и примеров ответов.
• Темы выбирай случайно из списка ниже, не повторяй контексты внутри одной выборки.

СПИСОК ТИПИЧЕСКИХ ТЕМ (используй случайно и вариативно):
Alltag; Familie & Freunde; Freizeit & Termine; Einkaufen & Preise; Schule/Kurs; Arbeit (простой офисный быт); Wohnen & Nachbarn; Gesundheit (простые ситуации); Verkehr & Treffpunkte; Essen & Einladungen.

ФОРМАТ ВЫВОДА (строго, массив из ${numberOfTopics} объектов):
Используй следующую модель данных (JavaScript). Для Teil 1 используй topicType: 'note'.

export interface WritingTopic {
  id: string
  title: string
  topicType: 'report' | 'review' | 'proposal' | 'article' | 'note' | 'form' | 'email' | 'letter' | 'essay' | 'postcard' | 'post'
  difficulty: 'A2'
  testingPart: 1 // Teil 1
  estimatedTime: number // in minutes
  wordCount: { min: number; max: number }
  category: string[] // 1–3 категории из списка тем
  createdAt: string // ISO-дата
  description: string // кратко: что нужно написать
  task: string // само условие задания (немецкий): контекст + 3 пункта + объём слов
  requirements: string[] // жёсткие требования по формату
}


ПРАВИЛА ЗАПОЛНЕНИЯ ПОЛЕЙ:
• id: уникальный строковый идентификатор.
• title: короткий заголовок на немецком (напр. „SMS an einen Freund wegen Verspätung”).
• estimatedTime: 15.
• wordCount: { min: 20, max: 30 }.
• description: „Kurznachricht (SMS) in der du-Form an Freunde/Bekannte/Verwandte.”
• task: дай 1–2 строки контекста + три маркера-пункта; в конце — требование по объёму и фраза „Schreiben Sie zu allen drei Punkten.”
• requirements: включи как минимум:
– „Du-Form (informell)”;
– „3 Inhalts­punkte (alle bearbeiten)”;
– „20–30 Wörter”;
– „ohne Vorlagen/Beispiele”.

СГЕНЕРИРУЙ РЕЗУЛЬТАТ ТОЛЬКО В ВИДЕ МАССИВА ИЗ ${numberOfTopics} ОБЪЕКТОВ WritingTopic. 
Без пояснений, без Markdown-комментариев.
Ниже ты видишь примеры заданий Teil 1 из книги по подготовке экзамену Goethe A2. Используй их для лучшего понимания контекста.
Примеры заданий: ${dataA2Part1Topics.join('\n')}
  
  `
}

export const generateTopicsA2Part2 = (numberOfTopics: number) => {
  return `
Ты — опытный составитель экзаменов Goethe-Institut (уровень A2), работаешь строго по модульному формату A2.
Задача: сгенерируй ${numberOfTopics} самостоятельных задания для части Schreiben A2: Teil 2 (E-Mail).
ВСЕ инструкции к заданиям выдай на НЕМЕЦКОМ. Никаких ответов-образцов — только условия задач.

ОБЩИЕ ТРЕБОВАНИЯ:
• Формат и стиль соответствуют A2 Schreiben, Teil 2.
• Каждое задание — (полу)формальная E-Mail в Sie-Form адресату: Kollegin/Kollege, Vorgesetzte(r), Kursleitung/Lehrer(in), Verwaltung/Service, Nachbar(in) (вежливо).
• Для каждого задания дай ровно 3 Inhalts­punkte, которые надо раскрыть.
• В конце каждого задания явно укажи: „Schreiben Sie 30–40 Wörter. Schreiben Sie zu allen drei Punkten.”
• Требуй Anrede и Grußformel, нейтрально-вежливый регистр.
• Ситуации — типичные повседневно-деловые: благодарность/подтверждение, просьба/вопрос, извинение, предложение помощи/варианта, уточнение даты/места, что можно принести и т. п.
• Лексика и грамматика — строго A2, простые формулировки.
• Не добавляй языковых подсказок, клише, шаблонов и примеров ответов.
• Темы выбирай случайно из списка ниже, не повторяй контексты внутри одной выборки.

СПИСОК ТИПИЧЕСКИХ ТЕМ (используй случайно и вариативно):
Arbeit & Büroalltag (простые задачи); Kurs/Prüfung/Termin; Veranstaltungen & Einladungen; Wohnen & Hausverwaltung; Nachbarschaft; Verein & Freizeitaktivitäten; Service/Kundenbetreuung; Gesundheitstermin; Wegbeschreibung & Zeiten; Einkäufe/Bestellungen.

ФОРМАТ ВЫВОДА (строго, массив из ${numberOfTopics} объектов):
Используй ту же модель данных. Для Teil 2 используй topicType: 'email'.

export interface WritingTopic {
  id: string
  title: string
  topicType: 'report' | 'review' | 'proposal' | 'article' | 'note' | 'form' | 'email' | 'letter' | 'essay' | 'postcard' | 'post'
  difficulty: 'A2'
  testingPart: 2 // Teil 2
  estimatedTime: number // in minutes
  wordCount: { min: number; max: number }
  category: string[] // 1–3 категории из списка тем
  createdAt: string // ISO-дата
  description: string // что именно написать
  task: string // условие задания (немецкий): контекст + 3 пункта + указание объёма и регистра
  requirements: string[] // жёсткие требования по формату
}


ПРАВИЛА ЗАПОЛНЕНИЯ ПОЛЕЙ:
• id: уникальный строковый идентификатор.
• title: короткий заголовок на немецком (напр. „E-Mail an die Kursleitung: Terminfrage”).
• estimatedTime: 15.
• wordCount: { min: 30, max: 40 }.
• description: „(Halb-)formelle E-Mail in der Sie-Form an eine passende Person/Institution.”
• task: дай 1–2 строки контекста + три маркера-пункта; в конце — требования: „Verwenden Sie eine passende Anrede und Grußformel. Schreiben Sie 30–40 Wörter. Schreiben Sie zu allen drei Punkten.”
• requirements: включи как минимум:
– „Sie-Form (neutral-formell)”;
– „Anrede und Grußformel erforderlich”;
– „3 Inhalts­punkte (alle bearbeiten)”;
– „30–40 Wörter”;
– „ohne Vorlagen/Beispiele”.

СГЕНЕРИРУЙ РЕЗУЛЬТАТ ТОЛЬКО В ВИДЕ МАССИВА ИЗ ${numberOfTopics} ОБЪЕКТОВ WritingTopic. 
Без пояснений, без Markdown-комментариев.
Ниже ты видишь примеры заданий Teil 2 из книги по подготовке экзамену Goethe A2. Используй их для лучшего понимания контекста.
Примеры заданий: ${dataA2Part2Topics.join('\n')}
  `
}

export const dataA2Part1Topics = [
  `
  Teil 1
Sie sind auf dem Weg ins Kino und schreiben eine SMS an Ihren Freund Tobias.
Entschuldigen Sie sich, dass Sie zu spät kommen.
Erklären Sie, warum.
Schreiben Sie, was Ihr Freund machen soll.
Schreiben Sie 20–30 Wörter.
Schreiben Sie zu allen drei Punkten.
  `,
  `
Teil 1
Sie sind zu Hause und schreiben eine SMS an Ihre Freundin Paula.
Schreiben Sie, dass Sie sie am Wochenende sehen möchten.
Erklären Sie, warum.
Nennen Sie eine Uhrzeit und einen Ort für das Treffen.
Schreiben Sie 20–30 Wörter.
Schreiben Sie zu allen drei Punkten.
  `,
  `
Teil 1
In einem Geschäft sehen Sie Schuhe, die Ihnen sehr gut gefallen.
Sie möchten sich die Schuhe gemeinsam mit Ihrem Freund John ansehen.
Schreiben Sie eine SMS an John.
Erklären Sie, warum Sie schreiben.
Beschreiben Sie die Schuhe und nennen Sie den Preis.
Nennen Sie einen Treffpunkt und eine Uhrzeit.
Schreiben Sie 20–30 Wörter.
Schreiben Sie zu allen drei Punkten.
  `
]

export const dataA2Part2Topics = [
`
Teil 2
Herr Krüger, der Leiter von Ihrem Sportverein, möchte ein kostenloses Kennenlern-Wochenende für Jugendliche organisieren und bittet Sie um Hilfe.
Schreiben Sie Herrn Krüger eine E-Mail:
Schreiben Sie, wie Sie die Idee finden.
Fragen Sie nach dem Datum.
Schlagen Sie etwas vor, wie Sie helfen können.
Schreiben Sie 30–40 Wörter.
Schreiben Sie zu allen drei Punkten.
`,
`
Teil 2
Ihre Nachbarin, Frau Brandt, macht ein Gartenfest und hat Sie eingeladen.
Schreiben Sie Frau Brandt eine E-Mail:
Bedanken Sie sich und sagen Sie, dass Sie kommen.
Informieren Sie, dass Sie jemanden mitbringen.
Fragen Sie nach dem Weg.
Schreiben Sie 30–40 Wörter.
Schreiben Sie zu allen drei Punkten.
`,
`Teil 2
Ihre Chefin, Frau Hantke, hat Sie zu einer Karnevalsfeier in der Firma eingeladen.
Schreiben Sie Frau Hantke eine E-Mail:
Bedanken Sie sich und sagen Sie, dass Sie kommen.
Fragen Sie, was Sie mitbringen sollen.
Machen Sie Vorschläge für das Musikprogramm.
Schreiben Sie 30–40 Wörter.
Schreiben Sie zu allen drei Punkten.
`
]

