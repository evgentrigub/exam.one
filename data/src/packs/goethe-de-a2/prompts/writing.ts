import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { AUTHOR_ROLE, JSON_ONLY, RULES_HEADER, WRITING_EXAMINER_ROLE } from './common'

const WRITING_INTERFACE = `export interface WritingExercise {
  title: string
  topicType: 'note' | 'email'
  testingPart: 1 | 2
  estimatedTime: number
  wordCount: { min: number; max: number }
  category: string[]
  description: string
  task: string
  requirements: string[]
}`

const ANSWER_CONTRACT = `{
    "topicId": "{topicId}",
    "content": "the generated response",
    "wordCount": number,
    "highlights": {
        "greeting": "the greeting that opens the response",
        "mainPoints": ["the main points made in the response"],
        "closing": "the closing that ends the response",
        "keyPhrases": ["the key phrases used in the response"]
    }
}
JSON fields: do not change topicId; content is the model response; wordCount is an integer; highlights explains why the response is exemplary.
Important: responses must be realistic and contemporary. ${JSON_ONLY}`

const REVIEW_JSON_TEIL1 = `Output JSON format (strict):
{
  "teil": 1,
  "word_count": <number>,
  "required_word_count": { "min": 20, "max": 30 },
  "criteria": {
    "aufgabenerfuellung": { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<short comment in the feedback language>" },
    "sprache":            { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<short comment in the feedback language>" }
  },
  "teil_points_mess": <0–10>,
  "teil_points_result": <teil_points_mess * 1.25>,
  "teil_rule_applied": "none | E_zero_rule | wordcount_below_minimum | off_topic",
  "register_check": { "expected": "du", "detected": "<du|sie|mixed|unknown>", "ok": true },
  "content_points_covered": { "required": 3, "covered": <0–3> },
  "priority_fixes": [ "<fix 1>", "<fix 2>", "<fix 3>" ],
  "examples": [
    { "error": "<quotation from the learner response>", "correction": "<corrected German text>", "rule": "<short explanation>" }
  ],
  "report": "<short closing report>"
}`

const REVIEW_JSON_TEIL2 = `Output JSON format (strict):
{
  "teil": 2,
  "word_count": <number>,
  "required_word_count": { "min": 30, "max": 40 },
  "criteria": {
    "aufgabenerfuellung": { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<short comment in the feedback language>" },
    "sprache":            { "grade": "A|B|C|D|E", "points": <5|3.5|2|0.5|0>, "comment": "<short comment in the feedback language>" }
  },
  "teil_points_mess": <0–10>,
  "teil_points_result": <teil_points_mess * 1.25>,
  "teil_rule_applied": "none | E_zero_rule | wordcount_below_minimum | off_topic",
  "register_check": { "expected": "sie", "detected": "<du|sie|mixed|unknown>", "ok": true },
  "content_points_covered": { "required": 3, "covered": <0–3> },
  "priority_fixes": [ "<fix 1>", "<fix 2>", "<fix 3>" ],
  "examples": [
    { "error": "<quotation from the learner response>", "correction": "<corrected German text>", "rule": "<short explanation>" }
  ],
  "report": "<short closing report>"
}`

export const writingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'generator',
    llm: { temperature: 0.8, maxTokens: 2500 },
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for the Schreiben A2 part: Teil 1 (Kurznachricht / SMS). Write ALL exercise instructions in GERMAN. No model answers — only the task prompts themselves.',
    rules: [
      RULES_HEADER,
      '• Format and style follow A2 Schreiben, Teil 1.',
      '• Each exercise is a personal SMS in du-Form to friends, acquaintances or family.',
      '• Give each exercise exactly 3 Inhaltspunkte to be covered.',
      '• End every exercise explicitly with: „Schreiben Sie 20–30 Wörter. Schreiben Sie zu allen drei Punkten.“',
      '• Situations are typical everyday ones: running late, a meeting, an invitation, a request, a suggestion, information or a question.',
      '• Vocabulary and grammar: strictly CEFR A2, simple formulations.',
      '• Do not add language hints, set phrases, templates or sample answers.',
      '• Choose topics at random from: Alltag; Familie & Freunde; Freizeit & Termine; Einkaufen & Preise; Schule/Kurs; Arbeit; Wohnen & Nachbarn; Gesundheit; Verkehr & Treffpunkte; Essen & Einladungen.',
      '• title: a short German heading. estimatedTime: 15. wordCount: { min: 20, max: 30 }. topicType: note. testingPart: 1. Do not emit id or createdAt; the application supplies them.',
      '• description: one short German sentence naming the situation and the addressee. category: an array of 1–3 short German topic tags, for example ["Alltag", "Freizeit"]. Both fields are required.',
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
    outputPrelude: `OUTPUT FORMAT (strict, an array of {count} objects). For Teil 1 use topicType: 'note'.\n${WRITING_INTERFACE}`,
    outputContract:
      'RETURN THE RESULT ONLY AS AN ARRAY OF {count} WritingExercise OBJECTS. No explanation, no Markdown commentary.',
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'generator',
    llm: { temperature: 0.8, maxTokens: 2500 },
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for the Schreiben A2 part: Teil 2 (E-Mail). Write ALL exercise instructions in GERMAN. No model answers — only the task prompts themselves.',
    rules: [
      RULES_HEADER,
      '• Format and style follow A2 Schreiben, Teil 2.',
      '• Each exercise is a (semi-)formal E-Mail in Sie-Form to a recipient such as Kollegin/Kollege, Vorgesetzte(r), Kursleitung/Lehrer(in), Verwaltung/Service or Nachbar(in) (politely).',
      '• Give each exercise exactly 3 Inhaltspunkte.',
      '• End every exercise explicitly with: „Schreiben Sie 30–40 Wörter. Schreiben Sie zu allen drei Punkten.“',
      '• Require Anrede and Grußformel, in a neutral-polite register.',
      '• Situations are typical everyday-professional ones: thanks, a request, an apology, offering help, confirming a date or place.',
      '• Vocabulary and grammar: strictly A2.',
      '• Do not add language hints or sample answers.',
      '• Topics: Arbeit & Büroalltag; Kurs/Prüfung/Termin; Veranstaltungen; Wohnen & Hausverwaltung; Nachbarschaft; Verein; Service; Gesundheitstermin; Wegbeschreibung; Einkäufe/Bestellungen.',
      '• topicType: email. testingPart: 2. estimatedTime: 15. wordCount: { min: 30, max: 40 }. Do not emit id or createdAt; the application supplies them.',
      '• description: one short German sentence naming the situation and the addressee. category: an array of 1–3 short German topic tags, for example ["Arbeit", "Service"]. Both fields are required.',
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
    outputPrelude: `OUTPUT FORMAT (strict, an array of {count} objects). For Teil 2 use topicType: 'email'.\n${WRITING_INTERFACE}`,
    outputContract:
      'RETURN THE RESULT ONLY AS AN ARRAY OF {count} WritingExercise OBJECTS. No explanation, no Markdown commentary.',
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: generate one exemplary model answer to the exercise above.',
    rules: [
      'Eine Kurznachricht (SMS) schreiben. Du-Form, 20–30 Wörter, 3 Inhaltspunkte.',
      'Use an informal greeting (Hallo, Hi) and a closing formula (Bis bald, LG). A name at the end is optional.',
      'In an SMS it is normal to drop the subject at the start of a sentence ("Bin auf dem Weg").',
      'One or two emoji are acceptable.',
      'Cover all 3 content points.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: generate one exemplary model answer to the exercise above.',
    rules: [
      'Eine E-Mail schreiben. Sie-Form, 30–40 Wörter, 3 Inhaltspunkte.',
      'The email MUST open with a (semi-)formal greeting and end with a Grußformel and the full name.',
      'Write grammatically correct, complete sentences.',
      'You MUST use connectors (und, oder, aber, denn, weil).',
      'Cover all 3 content points.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'review',
    role: WRITING_EXAMINER_ROLE,
    task: `Feedback language: {outputLanguage}.
Write every comment (criteria.*.comment), rule (examples[].rule), priority_fixes entry and the closing report in that language.
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected German text.

Input
Exercise text: {task}
Requirements: {requirements}
Learner response: {userContent}`,
    rules: [
      'Confirm the exercise type: Teil 1 (Kurznachricht / SMS, du-Form).',
      'Check the length: 20–30 words. If the response is under 50% of that (fewer than 10 words) or off topic, award E (0) for Aufgabenerfüllung and zero the whole Teil 1 ("E_zero_rule").',
      'Mark against 2 criteria (A–E): 1. Aufgabenerfüllung: all 3 content points covered, an appropriate addressee and du-Form. 2. Sprache: intelligibility, simple cohesion, basic A2 vocabulary.',
      'Dropping the subject at the start of an SMS is not penalised. Emoji are allowed. An informal greeting and closing are required.',
      'Messpunkte scale: A = 5, B = 3.5, C = 2, D = 0.5, E = 0. Total for Teil 1: 0–10; Result Points = Messpunkte × 1.25.',
      'Give specific feedback. List 3–6 typical errors with exact corrections. Do not rewrite the whole text.',
    ],
    outputContract: REVIEW_JSON_TEIL1,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'review',
    role: WRITING_EXAMINER_ROLE,
    task: `Feedback language: {outputLanguage}.
Write every comment (criteria.*.comment), rule (examples[].rule), priority_fixes entry and the closing report in that language.
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected German text.

Input
Exercise text: {task}
Requirements: {requirements}
Learner response: {userContent}`,
    rules: [
      'Confirm the exercise type: Teil 2 ((halb-)formelle E-Mail, Sie-Form).',
      'Check the length: 30–40 words. If the response is under 50% of that (fewer than 15 words) or off topic, award E (0) and zero Teil 2 ("E_zero_rule").',
      'Mark against 2 criteria: 1. Aufgabenerfüllung: all 3 content points, Anrede/Grußformel, Sie-Form. 2. Sprache: intelligibility, basic connectors, A2 vocabulary.',
      'Connectors are required. The email must open with a (semi-)formal salutation and end with a closing formula and the FULL NAME.',
      'Messpunkte scale: A = 5, B = 3.5, C = 2, D = 0.5, E = 0. Total for Teil 2: 0–10; Result Points = Messpunkte × 1.25.',
      'Give specific feedback and 3–6 typical errors with corrections.',
    ],
    outputContract: REVIEW_JSON_TEIL2,
  }),
]
