import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { A1_LANGUAGE, AUTHOR_ROLE, PRELUDE, RULES_HEADER, TRUE_FALSE_RULE } from './common'

const LLM = { temperature: 0.8, maxTokens: 4000 }

export const readingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'reading',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A1 module: Teil 1 (kurze persönliche Mitteilungen verstehen).',
    rules: [
      RULES_HEADER,
      '1. Texts: EXACTLY TWO short personal messages (an email, a text message or a note) from different people about everyday matters: meeting a friend, a party, a train arrival, a change of plan. Each message is 40–60 words and has a greeting and a name at the end.',
      '2. Put both messages in "content", one after the other, separated by an empty line (\\n\\n). Keep the line breaks of each message.',
      `3. ${A1_LANGUAGE}`,
      '4. Questions: EXACTLY 5 statements in "questions". Statements 1–2 are about the first message, 3–5 about the second. Each "question" is one short statement, for example "Lis Zug kommt nach halb eins an."',
      `5. ${TRUE_FALSE_RULE}`,
      '6. Test numbers, times, days, places and who does what. A falsch statement changes one fact (a time, a day, a person) while reusing words from the text.',
      '7. "explanation" (German, one sentence) quotes or paraphrases the part of the text that decides the answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (style and difficulty):
Message: "Hallo Tom, mein Zug kommt am Freitag um 18.10 Uhr in Köln an. Kannst du mich abholen? Ich warte vor dem Bahnhof. Viele Grüße, Anna"
Statement: "Anna kommt am Freitagabend in Köln an." → options ["Richtig", "Falsch"], correctAnswer 0
Statement: "Anna wartet im Bahnhof." → correctAnswer 1 (sie wartet vor dem Bahnhof)`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA1Teil1'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "email",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": ["Richtig", "Falsch"],
      "correctAnswer": 0 | 1,
      "explanation": string,
      "type": "comprehension"
    }
  ]
}
Generate {count} new exercises (different situations) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A1 module: Teil 2 (Informationen in kurzen Texten finden: Webseiten, Anzeigen).',
    rules: [
      RULES_HEADER,
      '1. Structure: EXACTLY 5 situations in "questions". Each "question" is one situation in Sie-form, for example "Sie möchten am Sonntag schwimmen gehen." or "Sie suchen einen Deutschkurs am Abend."',
      '2. Options: EXACTLY 2 short texts per situation in "options" — two web pages or two small adverts, each 12–30 words on ONE line. Start each with its web address or name and a dash, for example "www.hallenbad-mitte.de – Hallenbad Mitte: Montag bis Samstag 7–21 Uhr, Sonntag geschlossen."',
      '3. Exactly ONE of the two texts contains the information the person needs. The other is about the same topic or uses the same key word, but does not help (the wrong day, the wrong service, or only a café called "Bahnhof" when the person needs a train time).',
      '4. "correctAnswer" is the index of the helpful text: 0 for a, 1 for b. Mix both answers across the five situations.',
      `5. ${A1_LANGUAGE}`,
      '6. "content" is one short German instruction line: "Lesen Sie die Situationen 1 bis 5. Wo finden Sie Informationen? Wählen Sie a oder b."',
      '7. "explanation" (German, one sentence) says why the chosen text helps and the other does not.',
    ],
    examples: [
      `REFERENCE EXAMPLE (answer logic):
question: "Sie wollen wissen: Regnet es morgen in Hamburg?"
options: ["www.stadtfest-hamburg.de – Stadtfest am Samstag: bei Regen in der Markthalle.", "www.wetter-nord.de – Wetter heute und morgen für Hamburg, Bremen und Kiel. Aktuelle Warnungen."]
correctAnswer: 1`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA1Teil2'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "advertisement",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string],
      "correctAnswer": 0 | 1,
      "explanation": string,
      "type": "selective"
    }
  ]
}
Generate {count} new exercises (different everyday topics) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Lesen A1 module: Teil 3 (Schilder und Hinweise verstehen).',
    rules: [
      RULES_HEADER,
      "1. Texts: EXACTLY 5 short signs or notices (10–25 words each) from different places: a door, a shop window, a bus stop, a school, a doctor's practice, a restaurant, a station.",
      '2. "content" lists the five signs, numbered, each as two lines: the number and place ("1 · An der Tür der Arztpraxis"), then the sign text in quotation marks. Separate the signs with an empty line (\\n\\n).',
      '3. Questions: EXACTLY 5 statements in "questions", in the same order as the signs. Each "question" starts with the sign number, for example "Schild 1: Die Praxis ist am Mittwochnachmittag geschlossen."',
      `4. ${TRUE_FALSE_RULE}`,
      `5. ${A1_LANGUAGE}`,
      '6. Test opening times, prices, places and what you may or must do. A falsch statement contradicts one detail of the sign.',
      '7. "explanation" (German, one sentence) points to the words on the sign that decide the answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (style):
Sign: "3 · An der Bäckerei\\n„Sonntags geöffnet: 8 bis 11 Uhr. Frische Brötchen ab 7.30 Uhr am Fenster.“"
question: "Schild 3: Am Sonntagnachmittag können Sie hier Brot kaufen." → options ["Richtig", "Falsch"], correctAnswer 1`,
    ],
    outputPrelude: PRELUDE('ReadingExerciseA1Teil3'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "notice",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": ["Richtig", "Falsch"],
      "correctAnswer": 0 | 1,
      "explanation": string,
      "type": "comprehension"
    }
  ]
}
Generate {count} new exercises (different places and signs) as JSON.`,
  }),
]
