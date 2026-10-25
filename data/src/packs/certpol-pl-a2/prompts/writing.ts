import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A2_LANGUAGE,
  A2_TOPICS,
  AUTHOR_ROLE,
  FEEDBACK_LANGUAGE,
  JSON_ONLY,
  PRELUDE,
  RULES_HEADER,
  WRITING_EXAMINER_ROLE,
} from './common'

const GENERATOR_LLM = { temperature: 0.8, maxTokens: 2500 }
const REVIEW_LLM = { maxTokens: 2500 }

const TOPIC_FIELDS = (
  topicType: string,
  time: number,
  min: number,
  max: number
) => `  "title": string,
  "topicType": ${topicType},
  "estimatedTime": ${time},
  "wordCount": { "min": ${min}, "max": ${max} },
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
    "mainPoints": ["how each part of the answer meets the task"],
    "closing": "the closing that ends the answer, or an empty string",
    "keyPhrases": ["useful A2 phrases in the answer"]
  }
}
Do not change topicId. wordCount is an integer. ${JSON_ONLY}`

/**
 * The exam's writing criteria, summarised in our own words and scaled to the points of each
 * practice task. `task`, `range` and `accuracy` are the maxima of the three criteria.
 */
const criteriaRules = (task: number, range: number, accuracy: number): string[] => [
  `Mark each criterion with a number from 0 to its maximum; half points are allowed. taskCompletion 0–${task}, range 0–${range}, accuracy 0–${accuracy}.`,
  `taskCompletion (wykonanie zadania) – full marks: every guiding point is covered, the text type and register fit the task (greeting and closing where a message needs them). Lose about ${task / (task > 2 ? 4 : 2)} point for each point missing or unclear. 0: off topic or no real attempt.`,
  `range (bogactwo językowe) – full marks: everyday vocabulary suited to the topic, some variety instead of repetition, simple sentences joined with basic linkers (i, ale, bo, więc, potem). Half marks: very basic, repetitive vocabulary and mostly unconnected sentences. 0: isolated words.`,
  `accuracy (poprawność językowa) – full marks: good control of simple grammar (case endings, verb forms, agreement) and spelling with diacritics; errors do not hide the meaning. Half marks: frequent errors, sometimes unclear. 0: errors make most of the text unclear. Count a missing or wrong diacritic as a small spelling error.`,
  'There is no automatic zero for a short text, but a text far below the word guidance cannot score well on taskCompletion or range. An off-topic response scores 0 on every criterion (ruleApplied "off_topic").',
  'Judge A2 language fairly: simple and correct is better than ambitious and unclear. Give 2–4 typical errors with exact corrections; do not rewrite the whole text.',
]

const reviewContract = (
  task: number,
  range: number,
  accuracy: number,
  min: number,
  max: number
) => `Output JSON format (strict):
{
  "criteria": [
    { "id": "taskCompletion", "label": "Task completion", "maxPoints": ${task}, "points": <0-${task}>, "comment": "<short comment in the feedback language>" },
    { "id": "range", "label": "Range of language", "maxPoints": ${range}, "points": <0-${range}>, "comment": "…" },
    { "id": "accuracy", "label": "Accuracy", "maxPoints": ${accuracy}, "points": <0-${accuracy}>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the three points values, 0-${task + range + accuracy}>,
  "maxPoints": ${task + range + accuracy},
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to work on next>" ],
  "wordCount": { "actual": <number>, "min": ${min}, "max": ${max} },
  "ruleApplied": "none | off_topic",
  "checks": [
    { "id": "guidingPoints", "required": <number of guiding points>, "covered": <number covered> }
  ],
  "priorityFixes": [ "<fix 1>", "<fix 2>" ],
  "examples": [
    { "error": "<quotation from the learner response>", "correction": "<corrected Polish text>", "rule": "<short explanation>" }
  ],
  "report": "<short closing report>"
}
${JSON_ONLY}`

const REVIEW_INPUT = `${FEEDBACK_LANGUAGE}
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected Polish text.

Input
Exercise text: {task}
Guiding points: {requirements}
Learner response: {userContent}`

export const writingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for Polish A2 Writing, task a (a short text: a greeting or a text message of about 10–20 words).',
    rules: [
      RULES_HEADER,
      '1. Type: topicType "greeting" – wishes to a friend or relative for an occasion (urodziny, imieniny, Boże Narodzenie, Wielkanoc, ślub, nowa praca, egzamin), or "sms" – a text message to a friend to arrange, cancel or change a meeting, or to ask for something.',
      '2. In the exam a greeting task may show a photo of the occasion. Here the occasion is stated in words.',
      '3. "task" (in Polish, addressed to "ty"): one or two sentences setting the scene with a named friend or relative, then "Napisz …" and the word guidance: "Napisz około 20 słów." for a greeting, "Napisz około 10–15 słów." for a message. For a message, name 2–3 things to include ("Napisz, gdzie i o której się spotkacie.").',
      '4. "requirements": the 2–3 things the text must do, in Polish, in order ("Złóż życzenia z okazji urodzin", "Podpisz się").',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. "description": one sentence naming the situation. "category": 1–3 topic tags. estimatedTime: 10. wordCount: { "min": 10, "max": 30 }. No model answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure):
task: "Twoja koleżanka Magda ma jutro urodziny. Napisz do niej kartkę z życzeniami. Napisz około 20 słów."
requirements: ["Złóż Magdzie życzenia urodzinowe", "Napisz, czego jej życzysz", "Podpisz się"]`,
    ],
    outputPrelude: PRELUDE('WritingPlA2ZadanieA'),
    outputContract: `{
${TOPIC_FIELDS('"greeting" | "sms"', 10, 10, 30)}
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for Polish A2 Writing, task b (a longer text: a description or a short private letter of about 80–90 words).',
    rules: [
      RULES_HEADER,
      '1. Type: topicType "description" – describe a person (a family member, a friend), a place (your flat, your town), or an event (your last holiday, a party, a weekend) – or "letter" – an informal letter or email to a friend about one of these.',
      '2. "task" (in Polish, addressed to "ty"): one sentence stating what to write, then "Napisz:" and 3–5 guiding points as lines starting with "– " ("– gdzie byłeś / byłaś", "– z kim pojechałeś / pojechałaś", "– co tam robiłeś / robiłaś"), then "Napisz około 80–90 słów.". Give masculine and feminine forms for the learner.',
      '3. "requirements": the guiding points, in order, without the dash.',
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      '6. "description": one sentence naming the situation. "category": 1–3 topic tags. estimatedTime: 35. wordCount: { "min": 70, "max": 100 }. No model answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure):
task: "Opisz swojego najlepszego przyjaciela lub swoją najlepszą przyjaciółkę.\\nNapisz:\\n– jak się nazywa i ile ma lat\\n– jak wygląda\\n– jaki ma charakter\\n– co lubicie robić razem\\nNapisz około 80–90 słów."
requirements: ["Jak się nazywa i ile ma lat", "Jak wygląda", "Jaki ma charakter", "Co lubicie robić razem"]`,
    ],
    outputPrelude: PRELUDE('WritingPlA2ZadanieB'),
    outputContract: `{
${TOPIC_FIELDS('"description" | "letter"', 35, 70, 100)}
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: write one exemplary A2 answer to it, as a strong A2 candidate would.',
    rules: [
      '15–25 words in Polish, doing everything the task asks, with a fitting opening ("Kochana Magdo!", "Cześć Tomek,") and signature.',
      'Wishes use the genitive ("Wszystkiego najlepszego, dużo zdrowia i szczęścia"). Strictly A2 language, every diacritic.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: write one exemplary A2 answer to it, as a strong A2 candidate would.',
    rules: [
      '80–95 words in Polish, covering every guiding point in order, in connected sentences with simple linkers (i, ale, bo, więc, potem, na końcu).',
      'Past tense for events, present for descriptions; correct case endings and agreement. For a letter, add an informal opening and closing; for a description, greeting and closing are empty strings.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'review',
    llm: REVIEW_LLM,
    role: WRITING_EXAMINER_ROLE,
    task: REVIEW_INPUT,
    rules: [
      'This is writing task a: a short greeting or text message of about 10–20 words. In the exam it is marked together with task b; here it has its own 6 points (2 / 2 / 2).',
      'For taskCompletion, check each requirement and report them in checks. A greeting needs the wishes and a signature; a message needs every piece of information asked for.',
      ...criteriaRules(2, 2, 2),
    ],
    outputContract: reviewContract(2, 2, 2, 10, 30),
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: WRITING_EXAMINER_ROLE,
    task: REVIEW_INPUT,
    rules: [
      'This is writing task b: a description or a short private letter of about 80–90 words with guiding points. In the exam it is marked together with task a; here it has its own 14 points (4 / 5 / 5).',
      'For taskCompletion, check each guiding point and report them in checks. A connected text with a clear order helps range.',
      ...criteriaRules(4, 5, 5),
    ],
    outputContract: reviewContract(4, 5, 5, 70, 100),
  }),
]
