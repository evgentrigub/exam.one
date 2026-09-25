import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { AUTHOR_ROLE, PRELUDE, RULES_HEADER } from './common'

const READING_PRELUDE = (name: string) => PRELUDE(name, 'id/textId')

export const readingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'reading',
    part: 1,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A2 module: Teil 1 (Informationen in Medientexten verstehen).',
    rules: [
      RULES_HEADER,
      '1. Text type: an informational text (Zeitungsartikel, Broschüre) on a current, engaging topic. Put it in the "content" field.',
      '2. Text length: strictly about 200 words.',
      '3. Vocabulary and grammar: strictly CEFR A2. Avoid Passiv, Plusquamperfekt and Konjunktiv I. Difficult words must be inferable from context.',
      '4. Question format: EXACTLY 5 questions.',
      '5. Answer options: EXACTLY 3 options (a, b, c) per question. correctAnswer is the index (0, 1 or 2).',
      '6. Reading skill tested (Lesestil): "sorgfältig-genaues Lesen" — grasping the main idea and the important details.',
      '7. Distractors: the wrong options must reuse words from the text while being wrong in meaning.',
    ],
    examples: [
      `REFERENCE EXAMPLE (for style and difficulty):
Text "Paella mit Bauernbrot":
"Mireia Vicario ist ein Beispiel für gute Integrationspolitik, denn sie ist eine der ersten Nachrichtensprecherinnen des deutschen Fernsehens mit Migrationshintergrund. Als Tochter spanischer Gastarbeiter wuchs sie in Kiel auf... Mit eisernem Willen und einer guten Schulbildung schaffte sie es, ab 2004 als Nachrichtensprecherin vor der Kamera zu stehen. Seit 2010 moderiert sie nun schon die Nachrichten im deutschen Fernsehen."
Example question:
question: "Als sie jünger war, ..."
options: ["arbeitete sie im Geschäft ihres Vaters.", "half ihr Vater Mireia bei den Hausaufgaben.", "hatte sie einen Job im Gymnasium."]
correctAnswer: 0`,
    ],
    outputPrelude: READING_PRELUDE('ReadingExerciseA2Teil1'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "article",
  "testingPart": 1,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "comprehension"
    }
  ]
}
Generate {count} new texts (different topics) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 2,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A2 module: Teil 2 (Informationstafeln, Veranstaltungsprogramme etc. verstehen).',
    rules: [
      RULES_HEADER,
      '1. Text type: a structured list-style text (listenartiger Text): a shopping-centre floor directory, an events programme, a transport timetable or a TV schedule. Put it in the "content" field with line breaks (\\n) between blocks.',
      '2. Text length: strictly about 100 words, split into logical blocks (by floor, day or time).',
      '3. Vocabulary and grammar: strictly CEFR A2.',
      '4. Question format: EXACTLY 5 questions phrased as real-life situations (for example "Sie möchten einen Kaffee trinken.").',
      '5. Answer options: EXACTLY 3 options (a, b, c). IMPORTANT: the third option (index 2) is almost always a fallback generalisation: "anderer Stock", "anderer Ort", "andere Zeit" or "anderer Tag". correctAnswer is the index (0, 1 or 2).',
      '6. Reading skill tested (Lesestil): "suchendes, selektives Lesen" — locating one specific detail in a list.',
    ],
    examples: [
      `REFERENCE EXAMPLE (answer structure and logic):
Text "Kaufhaus" (floors with departments).
Example question:
question: "Sie möchten Ohrringe kaufen."
options: ["3. Stock", "2. Stock", "anderer Stock"]
correctAnswer: 2
explanation: "Schmuck ist in der Drogerie im 1. Stock, also 'anderer Stock'."`,
    ],
    outputPrelude: READING_PRELUDE('ReadingExerciseA2Teil2'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "list",
  "testingPart": 2,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "selective"
    }
  ]
}
Generate {count} new list-style texts (different topics: TV schedule, festival programme, airport plan and so on) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 3,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A2 module: Teil 3 (Korrespondenz lesen und verstehen).',
    rules: [
      RULES_HEADER,
      '1. Text type: personal correspondence (E-Mail) with an informal greeting ("Lieber...", "Hallo...") and closing ("Bis bald", "Liebe Grüße"). Put it in the "content" field.',
      '2. Text length: strictly about 230 words; the text recounts an event (a trip, a party, a house move, a meeting).',
      '3. Vocabulary and grammar: strictly CEFR A2. Use Perfekt and Präteritum (haben/sein/Modalverben) and weil/dass-Sätze. Avoid Passiv, Plusquamperfekt and Konjunktiv I (except \'würde/hätte/wäre\').',
      '4. Question format: EXACTLY 5 questions, in the order the text presents them.',
      '5. Answer options: EXACTLY 3 options (a, b, c). correctAnswer is the index (0, 1 or 2).',
      '6. Reading skill tested (Lesestil): "sorgfältig-genaues Lesen" — grasping the main ideas and the details.',
      '7. Distractors: the correct option is paraphrased with synonyms; the wrong options often reuse the exact words of the text but distort the meaning.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure and logic):
Text "Klassentreffen" — a letter to a friend about a class reunion 20 years on.
Example question:
question: "Auf dem Klassentreffen ..."
options: ["waren fast alle anwesend.", "fehlten zwei Personen.", "haben Andreas und Holger über sich erzählt."]
correctAnswer: 1
explanation: "Im Text: 'außer dir noch zwei Ehemalige nicht dabei waren: Andreas und Holger.'"`,
    ],
    outputPrelude: READING_PRELUDE('ReadingExerciseA2Teil3'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "email",
  "testingPart": 3,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "comprehension"
    }
  ]
}
Generate {count} new letters (different topics: a holiday, a house move, a new job, a wedding invitation) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 4,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A2 module: Teil 4 (Anzeigen verstehen / Zuordnung).',
    rules: [
      RULES_HEADER,
      '1. Text type: 6 short advertisements (Anzeigen) on one shared topic. Put them in the "content" field, one per line, each prefixed with its letter, for example: "a: ...\\nb: ...\\nc: ...\\nd: ...\\ne: ...\\nf: ..."',
      '2. Length: no more than 240 words in total across all 6 advertisements.',
      '3. Vocabulary and grammar: strictly CEFR A2.',
      '4. Questions (situations): EXACTLY 5 situations. The question text states one person\'s concrete need (for example: "Rupert braucht ein Geschenk für seinen Enkel.").',
      '5. MATCHING LOGIC (CRITICAL): EVERY question has exactly these options: ["a", "b", "c", "d", "e", "f", "x"]. correctAnswer is the index: a=0 … f=5, x=6. 4 situations have exactly one suitable advertisement. Exactly 1 of the 5 situations has no suitable advertisement (x). The 6 advertisements therefore cover 4 situations and two advertisements are left unused. Using the same advertisement for two situations is forbidden.',
      '6. Reading skill tested (Lesestil): "selektives Lesen".',
      '7. explanation: briefly explain in German why the advertisement fits (or why the answer is "x").',
    ],
    examples: [
      `REFERENCE EXAMPLE (logic):
Advertisements a–f on the topic "Tests / Apps / Reisen".
Example question:
question: "Theo sucht eine Stelle im Tourismusbereich."
options: ["a", "b", "c", "d", "e", "f", "x"]
correctAnswer: 6
explanation: "Es gibt keine Anzeige für Stellenangebote, daher 'x'."`,
    ],
    outputPrelude: READING_PRELUDE('ReadingExerciseA2Teil4'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "advertisement",
  "testingPart": 4,
  "difficulty": "A2",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": ["a", "b", "c", "d", "e", "f", "x"],
      "correctAnswer": 0 | 1 | 2 | 3 | 4 | 5 | 6,
      "explanation": string,
      "type": "matching"
    }
  ]
}
Generate {count} new exercises (sets of 6 advertisements and 5 situations) as JSON. Make sure that exactly one situation has the answer "x".`,
  }),
]
