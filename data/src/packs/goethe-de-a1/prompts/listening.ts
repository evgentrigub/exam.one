import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { A1_LANGUAGE, AUTHOR_ROLE, PRELUDE, RULES_HEADER, TRUE_FALSE_RULE } from './common'

const LLM = { temperature: 0.8, maxTokens: 4000 }

export const listeningPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'listening',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercise sets for the Hören A1 module: Teil 1 (kurze Gespräche verstehen).',
    rules: [
      RULES_HEADER,
      '1. Structure: each set contains EXACTLY 6 independent short conversations in "items".',
      '2. Context ("context"): one short line naming the situation, for example "Im Hotel.", "Am Telefon.", "Im Supermarkt.".',
      '3. Audio text ("transcript"): a dialogue between two people, 30–50 words, 4–6 turns. EVERY turn starts with a role label and a colon ("Mann:", "Frau:", "Verkäuferin:", "Kunde:"). Without the labels audio generation cannot assign two voices.',
      `4. ${A1_LANGUAGE}`,
      '5. Question: exactly 1 short question per conversation, for example "Welche Zimmernummer hat Herr Klein?" or "Wann beginnt der Kurs?".',
      '6. Answer options: EXACTLY 3 short options in "options" (in the real exam these are pictures; here they are words, numbers or times). correctAnswer is the index of the correct one (0, 1 or 2).',
      '7. DISTRACTORS (CRITICAL): the conversation mentions ALL THREE options or their numbers, but only one answers the question — a speaker corrects a number, changes a time, or rejects an item ("Nein, nicht um 9, um 10 Uhr.").',
      '8. "explanation" (German, one sentence) names what is said and why the other options are wrong.',
    ],
    examples: [
      `REFERENCE EXAMPLE (style, distractors and length):
context: "Im Café."
transcript: "Frau: Guten Tag, einen Kaffee, bitte. Kellner: Gern. Mit Milch? Frau: Nein, ohne Milch. Und ein Stück Kuchen. Kellner: Das macht 5,40 Euro. Frau: Wie bitte? 4,50? Kellner: Nein, 5,40 Euro."
question: "Wie viel kostet es?"
options: ["4,50 Euro.", "5,40 Euro.", "4,40 Euro."]
correctAnswer: 1`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA1Teil1'),
    outputContract: `{
  "title": string,
  "items": [
    {
      "context": string,
      "transcript": string,
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string
    }
  ]
}
Generate {count} new sets of 6 conversations as JSON. Use a different everyday place for each item: hotel, shop, café, doctor, school, station, market, office.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercise sets for the Hören A1 module: Teil 2 (Durchsagen verstehen).',
    rules: [
      RULES_HEADER,
      '1. Structure: each set contains EXACTLY 4 independent public announcements in "items".',
      '2. Context ("context"): where the announcement is made, for example "Am Bahnhof.", "Am Flughafen.", "Im Kaufhaus.", "Im Zug.".',
      '3. Audio text ("transcript"): one speaker, 30–45 words, spoken style ("Liebe Fahrgäste, …", "Achtung, eine Durchsage für …"). No role labels.',
      `4. ${A1_LANGUAGE}`,
      '5. Statement ("question"): exactly 1 short statement per announcement about what the listeners should do or what happens, for example "Die Fahrgäste sollen im Zug bleiben."',
      `6. ${TRUE_FALSE_RULE}`,
      '7. A falsch statement changes the place, time or action in the announcement while reusing its words.',
      '8. "explanation" (German, one sentence) quotes what the announcement actually says.',
    ],
    examples: [
      `REFERENCE EXAMPLE (style):
context: "Im Kaufhaus."
transcript: "Liebe Kundinnen und Kunden, heute gibt es in der Sportabteilung im zweiten Stock alle Jacken zum halben Preis. Das Angebot gilt nur bis 18 Uhr. Vielen Dank für Ihren Einkauf."
question: "Die Jacken sind heute billiger."
options: ["Richtig", "Falsch"]
correctAnswer: 0`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA1Teil2'),
    outputContract: `{
  "title": string,
  "items": [
    {
      "context": string,
      "transcript": string,
      "question": string,
      "options": ["Richtig", "Falsch"],
      "correctAnswer": 0 | 1,
      "explanation": string
    }
  ]
}
Generate {count} new sets of 4 announcements as JSON, each at a different place.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercise sets for the Hören A1 module: Teil 3 (Ansagen am Telefon verstehen).',
    rules: [
      RULES_HEADER,
      '1. Structure: each set contains EXACTLY 5 independent telephone messages in "items".',
      '2. Context ("context"): who calls, for example "Eine Nachricht auf dem Anrufbeantworter." or "Die Arztpraxis ruft an.".',
      '3. Audio text ("transcript"): one speaker leaving a message, 35–55 words: greeting, name, the information, a closing ("Hallo Petra, hier ist Jonas. …, Tschüs!"). No role labels.',
      `4. ${A1_LANGUAGE}`,
      '5. Question: exactly 1 short question per message about a detail: a telephone number, a time, a place, a day or what to bring.',
      '6. Answer options: EXACTLY 3 short options in "options"; correctAnswer is the index (0, 1 or 2).',
      '7. DISTRACTORS (CRITICAL): the message mentions the wrong options too — a first time that is changed, a place that is not the meeting point, numbers with swapped digits.',
      '8. "explanation" (German, one sentence) names the detail and why the other options are wrong.',
    ],
    examples: [
      `REFERENCE EXAMPLE (style and distractors):
context: "Eine Nachricht auf dem Anrufbeantworter."
transcript: "Hallo Sara, hier ist Mehmet. Wir treffen uns morgen nicht am Kino, sondern vor dem Café Rosa. Das ist neben dem Kino. Der Film beginnt um acht, wir treffen uns um halb acht. Bis morgen!"
question: "Wo treffen sich Sara und Mehmet?"
options: ["Am Kino.", "Vor dem Café.", "Im Café."]
correctAnswer: 1`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA1Teil3'),
    outputContract: `{
  "title": string,
  "items": [
    {
      "context": string,
      "transcript": string,
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string
    }
  ]
}
Generate {count} new sets of 5 telephone messages as JSON, each from a different caller.`,
  }),
]
