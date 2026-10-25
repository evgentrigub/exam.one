import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A1_LANGUAGE,
  AUTHOR_ROLE,
  FEEDBACK_LANGUAGE,
  JSON_ONLY,
  RULES_HEADER,
  SPEAKING_EXAMINER_ROLE,
} from './common'

const GENERATOR_LLM = { temperature: 0.8, maxTokens: 2000 }
const REVIEW_LLM = { maxTokens: 2000 }

const GENERATOR_PRELUDE = `OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON array of {count} objects. No prose or Markdown before or after the JSON.
Do not emit id, createdAt, testingPart or difficulty; the application fills them in.`

const SCORING = `Scoring per turn, as on the official form: full points when the task is fully met and understandable; half points when it is only partly met because of language or content gaps; 0 when it is not met or not understandable.
Transcripts come from speech-to-text: ignore missing punctuation, capitalisation and obvious recognition slips.`

/** The rubric shape shared by every speaking review; `criteria` is spelled out per Teil. */
const reviewContract = (criteria: string, max: number) => `Output JSON format (strict):
{
  "criteria": [
${criteria}
  ],
  "totalPoints": <the exact sum of the points values, 0-${max}>,
  "maxPoints": ${max},
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to practise next>" ]
}
${JSON_ONLY}`

const turn = (id: string, label: string) =>
  `    { "id": "${id}", "label": "${label}", "maxPoints": 1.5, "points": <1.5|0.75|0>, "comment": "<short comment in the feedback language>" }`

const MODEL_CONTRACT = `{
  "topicId": "{topicId}",
  "content": "the model answer, one line per turn",
  "wordCount": number,
  "highlights": {
    "greeting": "",
    "mainPoints": ["why each turn works"],
    "closing": "",
    "keyPhrases": ["useful A1 phrases"]
  }
}
${JSON_ONLY}`

export const speakingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for Sprechen A1, Teil 1 (sich vorstellen). Write every text the learner sees in GERMAN.',
    rules: [
      RULES_HEADER,
      '1. "theme": a short German heading, for example "Sich vorstellen" or "Wer sind Sie?".',
      '2. "keywords": 7 short German keyword prompts, one per piece of information, each ending with "?": "Name?", "Alter?", "Land?", "Wohnort?", "Sprachen?", "Beruf?", "Hobby?" — vary the wording and order a little between exercises.',
      '3. Then add exactly TWO more keywords, in this order: a spelling task ("Buchstabieren Sie Ihren Familiennamen." or "Buchstabieren Sie Ihren Wohnort.") and a number task ("Sagen Sie Ihre Telefonnummer." or "Sagen Sie Ihre Hausnummer und Postleitzahl."). The learner may invent the number.',
      `4. ${A1_LANGUAGE}`,
      '5. topicType: "introduction".',
    ],
    outputPrelude: GENERATOR_PRELUDE,
    outputContract: `{ "theme": string, "topicType": "introduction", "keywords": [string, string, string, string, string, string, string, string, string] }`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for Sprechen A1, Teil 2 (um Informationen bitten und Informationen geben). Write every text the learner sees in GERMAN.',
    rules: [
      RULES_HEADER,
      '1. Two everyday topics per exercise (Essen und Trinken, Einkaufen, Wochenende, Familie, Wohnen, Freizeit, Reisen, Arbeit). "theme" names both: "Einkaufen · Wochenende".',
      '2. "cards": EXACTLY 4 cards, in this order: round 1 on topic 1, round 2 on topic 2.',
      '   - { "segment": "ask1" | "ask2", "kind": "ask", "topic": <topic>, "cue": <ONE German word on the card, e.g. "Brot", "Kino", "Bruder"> } — the learner makes a question with this word.',
      '   - { "segment": "answer1" | "answer2", "kind": "answer", "topic": <same topic>, "cue": <a short partner question in du-Form on that topic, with a different word, e.g. "Was trinkst du am Morgen?"> } — the learner answers it.',
      '3. The word must allow a simple question ("Wo kann ich Brot kaufen?"). The partner question must be answerable in one A1 sentence.',
      `4. ${A1_LANGUAGE}`,
      '5. topicType: "interview".',
    ],
    outputPrelude: GENERATOR_PRELUDE,
    outputContract: `{
  "theme": string,
  "topicType": "interview",
  "cards": [
    { "segment": "ask1", "kind": "ask", "topic": string, "cue": string },
    { "segment": "answer1", "kind": "answer", "topic": string, "cue": string },
    { "segment": "ask2", "kind": "ask", "topic": string, "cue": string },
    { "segment": "answer2", "kind": "answer", "topic": string, "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for Sprechen A1, Teil 3 (Bitten formulieren und darauf reagieren). Write every text the learner sees in GERMAN.',
    rules: [
      RULES_HEADER,
      '1. In the real exam the cards show pictures of everyday objects or actions. Here each card names them in words.',
      '2. "cards": EXACTLY 4 cards, in this order:',
      '   - { "segment": "request1" | "request2", "kind": "request", "cue": <an object or action, 1–4 words, e.g. "eine Tasse Kaffee", "das Fenster öffnen", "einen Stift"> } — the learner makes a polite request.',
      '   - { "segment": "response1" | "response2", "kind": "respond", "cue": <a short polite partner request in Sie- or du-Form, e.g. "Können Sie mir bitte Ihr Handy geben?"> } — the learner reacts (yes or no, politely, with a short reason or action).',
      '3. Use a different everyday situation for every card (at home, in a café, in class, at the office).',
      `4. ${A1_LANGUAGE}`,
      '5. "theme": a short German heading such as "Bitten im Alltag". topicType: "requests".',
    ],
    outputPrelude: GENERATOR_PRELUDE,
    outputContract: `{
  "theme": string,
  "topicType": "requests",
  "cards": [
    { "segment": "request1", "kind": "request", "cue": string },
    { "segment": "response1", "kind": "respond", "cue": string },
    { "segment": "request2", "kind": "request", "cue": string },
    { "segment": "response2", "kind": "respond", "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Theme: {theme}\nKeywords:\n{keywords}\nYOUR TASK: write an exemplary A1 self-introduction covering every keyword, with a spelled name (letters separated by hyphens) and a number written out in digits.',
    rules: ['About 50 words, short main clauses, invented but plausible details.'],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Theme: {theme}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A1 line for every turn: a question with the card word, or a one-sentence answer to the partner question.',
    rules: ['One line per turn, prefixed with its segment id ("ask1: …").'],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Theme: {theme}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A1 line for every turn: a polite request for the thing on the card, or a polite reaction to the partner request.',
    rules: ['One line per turn, prefixed with its segment id ("request1: …").'],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

Theme: {theme}
Keywords:
{keywords}

Transcript of the introduction:
{monologue}`,
    rules: [
      'introduction (1 point): the learner gives information for the keywords in simple, understandable sentences. Most keywords covered = 1; about half = 0.5; little or nothing = 0.',
      'spelling (1 point): the learner spells a word letter by letter as the keyword asks (in a transcript this shows as separated letters). Done = 1; attempted but incomplete = 0.5; missing = 0.',
      'number (1 point): the learner says the number the keyword asks for (digits or words). Done = 1; partly = 0.5; missing = 0.',
      SCORING,
    ],
    outputContract: reviewContract(
      [
        '    { "id": "introduction", "label": "Introduction", "maxPoints": 1, "points": <1|0.5|0>, "comment": "<short comment in the feedback language>" },',
        '    { "id": "spelling", "label": "Spelling", "maxPoints": 1, "points": <1|0.5|0>, "comment": "…" },',
        '    { "id": "number", "label": "Number", "maxPoints": 1, "points": <1|0.5|0>, "comment": "…" }',
      ].join('\n'),
      3
    ),
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

Theme: {theme}
Turns (segment id, task, card, transcript):
{turns}`,
    rules: [
      'ask1 / ask2: a recognisable question that uses the card word and fits the topic ("Isst du gern Brot?"). A statement instead of a question is at most half points.',
      'answer1 / answer2: a fitting answer to the partner question in a short sentence. A single word that answers it is half points.',
      SCORING,
    ],
    outputContract: reviewContract(
      [
        turn('ask1', 'Question 1'),
        turn('answer1', 'Answer 1'),
        turn('ask2', 'Question 2'),
        turn('answer2', 'Answer 2'),
      ].join(',\n'),
      6
    ),
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

Theme: {theme}
Turns (segment id, task, card, transcript):
{turns}`,
    rules: [
      'request1 / request2: a polite request or instruction for the thing on the card ("Eine Tasse Kaffee, bitte." / "Können Sie bitte das Fenster öffnen?"). Naming the thing without a request is half points.',
      'response1 / response2: a fitting reaction to the partner request: agreeing ("Ja, gern. Hier, bitte.") or politely declining with a short reason. A bare "ja" or "nein" is half points.',
      SCORING,
    ],
    outputContract: reviewContract(
      [
        turn('request1', 'Request 1'),
        turn('response1', 'Reaction 1'),
        turn('request2', 'Request 2'),
        turn('response2', 'Reaction 2'),
      ].join(',\n'),
      6
    ),
  }),
]
