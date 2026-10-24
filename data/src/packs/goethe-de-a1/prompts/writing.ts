import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A1_LANGUAGE,
  AUTHOR_ROLE,
  FEEDBACK_LANGUAGE,
  JSON_ONLY,
  RULES_HEADER,
  WRITING_EXAMINER_ROLE,
} from './common'

const GENERATOR_LLM = { temperature: 0.8, maxTokens: 2500 }
const REVIEW_LLM = { maxTokens: 2500 }

const TOPIC_FIELDS = `  "title": string,
  "topicType": TOPIC_TYPE,
  "estimatedTime": number,
  "wordCount": { "min": number, "max": number },
  "category": string[],
  "description": string,
  "task": string,
  "requirements": string[]`

const ANSWER_CONTRACT = `{
  "topicId": "{topicId}",
  "content": "the model answer",
  "wordCount": number,
  "highlights": {
    "greeting": "the greeting that opens the answer, or an empty string",
    "mainPoints": ["why each part of the answer is right"],
    "closing": "the closing that ends the answer, or an empty string",
    "keyPhrases": ["useful A1 phrases in the answer"]
  }
}
Do not change topicId. wordCount is an integer. ${JSON_ONLY}`

export const writingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for Schreiben A1, Teil 1 (ein Formular ausfüllen). Write every text the learner sees in GERMAN.',
    rules: [
      RULES_HEADER,
      '1. Situation ("task"): 4–6 short sentences in the third person about a friend of the learner ("Ihre Freundin, …", "Ihr Freund, …") who registers for something: a course, a trip, a sports club, a library card, a hotel, a doctor. The situation contains EVERY fact needed for the five missing entries, and nothing about the person must be invented.',
      '2. Form ("form"): a German "title" such as "Anmeldung Deutschkurs" and 7–9 "rows" in order. Each row has a German "label". Rows the form prints already filled in carry a "value". EXACTLY FIVE rows are blank: they carry "field" with the ids "field1" to "field5", in order, and no value.',
      '3. A blank row may be a choice between printed options: give it "options" (2–3 short strings, for example ["bar", "Kreditkarte"] or ["Vormittag", "Abend"]). Use this for at most one or two rows.',
      '4. "expected": the correct entry for each blank field, keyed by field id, as short as the form needs ("4", "Koch", "Linz", "nächsten Freitag"). For an option row it is exactly one of its options.',
      '5. Make the learner combine facts, as in the real exam: count people ("mit ihrem Mann und den zwei Kindern" → 4), turn "keine Kreditkarte" into "bar", read a date or place from the text.',
      `6. ${A1_LANGUAGE}`,
      '7. title: a short German heading. topicType: "form". estimatedTime: 5. wordCount: { "min": 5, "max": 20 }. description: one German sentence naming the situation. category: 1–3 German tags. requirements: ["Lesen Sie die Situation.", "Ergänzen Sie die fünf fehlenden Angaben im Formular."]. Do not emit id, createdAt, testingPart or difficulty.',
    ],
    examples: [
      `REFERENCE EXAMPLE (logic only):
task: "Ihre Freundin, Maria Lopes, möchte mit ihrem Mann und ihrer Tochter am Samstag eine Stadtführung in Wien machen. Sie wohnen im Hotel Park in der Ringstraße 8. Maria bezahlt mit Kreditkarte."
rows: Name: "Lopes, Maria" · Anzahl der Personen: (field1) · Hotel: (field2) · Straße: "Ringstraße 8" · Datum: (field3) · Zahlungsweise: (field4) options ["bar", "Kreditkarte"] · …
expected: { "field1": "3", "field2": "Hotel Park", "field3": "Samstag", "field4": "Kreditkarte", … }`,
    ],
    outputPrelude: `OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON array of {count} objects. No prose or Markdown before or after the JSON.`,
    outputContract: `{
${TOPIC_FIELDS.replace('TOPIC_TYPE', '"form"')},
  "form": {
    "title": string,
    "rows": [ { "label": string, "value": string } | { "label": string, "field": "field1" | "field2" | "field3" | "field4" | "field5", "options"?: string[] } ]
  },
  "expected": { "field1": string, "field2": string, "field3": string, "field4": string, "field5": string }
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for Schreiben A1, Teil 2 (eine kurze Mitteilung schreiben). Write every text the learner sees in GERMAN. No model answers.',
    rules: [
      RULES_HEADER,
      '1. Situation: a short personal or semi-formal message — an email or note to a friend, a neighbour, a course, a hotel, a tourist office. One sentence of context, then EXACTLY 3 content points as bullet lines starting with "– ", for example "– Warum schreiben Sie?", "– Fragen Sie: …", "– Bitten Sie: …".',
      '2. End "task" with: „Schreiben Sie zu jedem Punkt ein bis zwei Sätze (circa 30 Wörter). Schreiben Sie auch eine Anrede und einen Gruß.“',
      '3. Formal tasks (an office, a hotel, a school) use Sie; personal tasks use du. Mix both across the exercises.',
      `4. ${A1_LANGUAGE}`,
      '5. topicType: "email" for formal messages, "note" for personal ones. estimatedTime: 15. wordCount: { "min": 20, "max": 50 }. description: one German sentence naming the situation and the addressee. category: 1–3 German tags. requirements: ["Anrede und Gruß", "3 Inhaltspunkte", "circa 30 Wörter"]. Do not emit id, createdAt, testingPart or difficulty.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure):
"Sie möchten im Juli einen Kochkurs machen. Schreiben Sie an die Kochschule:
– Warum schreiben Sie?
– Fragen Sie: Wann gibt es Kurse?
– Bitten Sie: Informationen über die Preise.
Schreiben Sie zu jedem Punkt ein bis zwei Sätze (circa 30 Wörter). Schreiben Sie auch eine Anrede und einen Gruß."`,
    ],
    outputPrelude: `OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON array of {count} objects. No prose or Markdown before or after the JSON.`,
    outputContract: `{
${TOPIC_FIELDS.replace('TOPIC_TYPE', '"email" | "note"')}
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: `Situation: {task}
Form:
{form}
YOUR TASK: fill in the five blank entries correctly, using only facts from the situation.`,
    rules: [
      'In "content", write one line per blank entry: "Label: entry". Only the five blank rows, in form order.',
      'Keep each entry as short as the form needs; for a choice row, write exactly one of the printed options.',
      'In highlights.mainPoints explain in one short sentence per entry where the fact is in the situation. greeting and closing are empty strings.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: write one exemplary A1 answer to it.',
    rules: [
      'About 30 words, one or two short sentences per content point, all 3 points covered.',
      'Open with a fitting greeting (Liebe …, Hallo …, Sehr geehrte Damen und Herren) and end with a closing and a name.',
      'Use du or Sie as the task requires. Strictly A1 language.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'review',
    llm: REVIEW_LLM,
    role: WRITING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

Input
Situation: {task}
Form:
{form}
Expected entries:
{expected}
Learner entries:
{userContent}`,
    rules: [
      'Mark each of the five entries field1–field5 with 1 point (correct) or 0 points (wrong or empty). No half points.',
      'An entry is correct when it gives the expected information, even in another form: "4" or "vier", "Sonntag" or the date of that Sunday, a different word order in a name. Accept small spelling mistakes that do not change the meaning, for example "Kreditkarte" written "Kreditkate".',
      'An entry is wrong when the information is wrong, missing, or belongs to another row.',
      'Each comment says in one short sentence why the entry is right or what was expected.',
    ],
    outputContract: `Output JSON format (strict):
{
  "criteria": [
    { "id": "field1", "label": "Entry 1", "maxPoints": 1, "points": <1|0>, "comment": "<short comment in the feedback language>" },
    { "id": "field2", "label": "Entry 2", "maxPoints": 1, "points": <1|0>, "comment": "…" },
    { "id": "field3", "label": "Entry 3", "maxPoints": 1, "points": <1|0>, "comment": "…" },
    { "id": "field4", "label": "Entry 4", "maxPoints": 1, "points": <1|0>, "comment": "…" },
    { "id": "field5", "label": "Entry 5", "maxPoints": 1, "points": <1|0>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the five points, 0-5>,
  "maxPoints": 5,
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to check next time>" ]
}
${JSON_ONLY}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: WRITING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected German text.

Input
Exercise text: {task}
Requirements: {requirements}
Learner response: {userContent}`,
    rules: [
      'Mark each of the 3 content points (content1–content3, in the order of the task): 3 = fully covered and understandable; 1.5 = only partly covered because of language or content gaps; 0 = missing or not understandable.',
      'Mark communication (Kommunikative Gestaltung): 1 = appropriate greeting and closing for the text type; 0.5 = untypical or missing phrases, for example no greeting; 0 = no text-type phrases at all.',
      'There is no word minimum and no automatic zero: about 30 words is guidance. Judge A1 language generously; errors only cost points when they block understanding.',
      'An off-topic response scores 0 on every content point (ruleApplied "off_topic").',
      'Give 2–4 typical errors with exact corrections. Do not rewrite the whole text.',
    ],
    outputContract: `Output JSON format (strict):
{
  "criteria": [
    { "id": "content1", "label": "Content point 1", "maxPoints": 3, "points": <3|1.5|0>, "comment": "<short comment in the feedback language>" },
    { "id": "content2", "label": "Content point 2", "maxPoints": 3, "points": <3|1.5|0>, "comment": "…" },
    { "id": "content3", "label": "Content point 3", "maxPoints": 3, "points": <3|1.5|0>, "comment": "…" },
    { "id": "communication", "label": "Greeting and closing", "maxPoints": 1, "points": <1|0.5|0>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the four points values, 0-10>,
  "maxPoints": 10,
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to work on next>" ],
  "wordCount": { "actual": <number>, "min": 20, "max": 50 },
  "ruleApplied": "none | off_topic",
  "checks": [
    { "id": "register", "expected": "<du|sie, as the task requires>", "detected": "<du|sie|mixed|unknown>", "ok": <true|false> },
    { "id": "contentPoints", "required": 3, "covered": <0-3> }
  ],
  "priorityFixes": [ "<fix 1>", "<fix 2>" ],
  "examples": [
    { "error": "<quotation from the learner response>", "correction": "<corrected German text>", "rule": "<short explanation>" }
  ],
  "report": "<short closing report>"
}
${JSON_ONLY}`,
  }),
]
