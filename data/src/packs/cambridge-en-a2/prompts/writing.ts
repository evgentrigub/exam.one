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

const TOPIC_FIELDS = (topicType: string, min: number, max: number) => `  "title": string,
  "topicType": ${topicType},
  "estimatedTime": 10,
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
 * The A2 Key writing assessment scale, summarised in our own words. Bands 5, 3 and 1 are
 * described; 4 and 2 share features of the bands either side.
 */
const SCALE = [
  'Mark each subscale separately with a WHOLE number from 0 to 5. Bands 4 and 2 fall between the described bands.',
  'content – 5: everything is relevant and the reader has all the information the task asks for. 3: small irrelevances or omissions; the reader is mostly informed. 1: the task is misunderstood or mostly irrelevant; the reader learns very little. 0: totally irrelevant or no real attempt.',
  'organisation – 5: the text is connected and coherent, with basic linkers (and, but, because, then) and a few referencing words (it, they, this). 3: ideas are joined with very common linkers only. 1: mostly unconnected words and phrases. 0: below band 1.',
  'language – 5: everyday vocabulary used appropriately (some repetition is fine); good control of simple grammar; errors are noticeable but the meaning is clear. 3: basic vocabulary used reasonably; some control of simple grammar; errors sometimes make the meaning unclear. 1: isolated words and phrases; very little control. 0: below band 1.',
  'There is no automatic zero for a short answer: a text below the word guidance usually loses Content marks. An off-topic response scores 0 for content (ruleApplied "off_topic").',
  'Judge A2 language fairly: simple and correct is better than ambitious and unclear. Give 2–4 typical errors with exact corrections; do not rewrite the whole text.',
]

const reviewContract = (min: number, max: number, coverage: string) => `Output JSON format (strict):
{
  "criteria": [
    { "id": "content", "label": "Content", "maxPoints": 5, "points": <0-5>, "comment": "<short comment in the feedback language>" },
    { "id": "organisation", "label": "Organisation", "maxPoints": 5, "points": <0-5>, "comment": "…" },
    { "id": "language", "label": "Language", "maxPoints": 5, "points": <0-5>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the three points values, 0-15>,
  "maxPoints": 15,
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to work on next>" ],
  "wordCount": { "actual": <number>, "min": ${min}, "max": ${max} },
  "ruleApplied": "none | off_topic",
  "checks": [
    { "id": "${coverage}", "required": 3, "covered": <0-3> }
  ],
  "priorityFixes": [ "<fix 1>", "<fix 2>" ],
  "examples": [
    { "error": "<quotation from the learner response>", "correction": "<corrected English text>", "rule": "<short explanation>" }
  ],
  "report": "<short closing report>"
}
${JSON_ONLY}`

export const writingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for A2 Key Reading & Writing Part 6 (guided writing: an email or note of 25 words or more).',
    rules: [
      RULES_HEADER,
      '1. Situation ("task"): one or two sentences setting the scene, addressed to "you", with a named English friend, classmate, neighbour or teacher to write to. Then "In your email:" (or "In your note:"), then EXACTLY 3 bullet lines starting with "– ", each a clear communicative job: invite, suggest, explain, describe, ask, apologise, thank, say when / where / what. End with "Write 25 words or more."',
      '2. "requirements": the 3 bullet points, in order, without the dash.',
      `3. ${A2_LANGUAGE}`,
      `4. ${A2_TOPICS}`,
      '5. topicType: "email" or "note". "description": one sentence naming the situation. "category": 1–3 topic tags. estimatedTime: 10. wordCount: { "min": 25, "max": 60 }. No model answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure):
task: "You are having a party for your birthday next month. Write an email to your English friend, Alex.\\nIn your email:\\n– invite Alex to your party\\n– say where the party will be\\n– tell Alex what to bring\\nWrite 25 words or more."
requirements: ["Invite Alex to your party", "Say where the party will be", "Tell Alex what to bring"]`,
    ],
    outputPrelude: PRELUDE('WritingKeyPart6'),
    outputContract: `{
${TOPIC_FIELDS('"email" | "note"', 25, 60)}
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for A2 Key Reading & Writing Part 7 (a picture story of 35 words or more).',
    rules: [
      RULES_HEADER,
      '1. In the real exam the learner sees three pictures. Here each picture is described in ONE clear sentence, in the present, so the story can be told from the three descriptions. Together they show a simple sequence with a small problem, surprise or funny ending.',
      '2. "pictures": the 3 descriptions, in order.',
      '3. "task": "Look at the three pictures. Write the story shown in the pictures." then "Picture 1: …", "Picture 2: …", "Picture 3: …" on their own lines (the same descriptions), then "Write 35 words or more."',
      '4. "requirements": ["Write about all three pictures", "Tell the story in order", "35 words or more"].',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. topicType: "story". "description": one sentence. "category": 1–3 topic tags. estimatedTime: 10. wordCount: { "min": 35, "max": 80 }. No model answer.',
    ],
    outputPrelude: PRELUDE('WritingKeyPart7'),
    outputContract: `{
${TOPIC_FIELDS('"story"', 35, 80)},
  "pictures": [string, string, string]
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: write one exemplary A2 answer to it, as a strong A2 Key candidate would.',
    rules: [
      '30–45 words, covering all three points in order, with an informal greeting ("Hi Alex,") and closing ("See you soon, Sam").',
      'Use simple linkers (and, but, because, so) and strictly A2 language.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: write one exemplary A2 story about the three pictures, as a strong A2 Key candidate would.',
    rules: [
      '40–60 words in the past simple, covering all three pictures in order and ending the story clearly.',
      'Use time linkers (one day, then, after that, suddenly, in the end). Give the people names. greeting and closing are empty strings.',
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
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected English text.

Input
Exercise text: {task}
Content points: {requirements}
Learner response: {userContent}`,
    rules: [
      'This is Reading & Writing Part 6: an email or note of 25 words or more covering three content points.',
      'For content, check each of the three points: all three communicated clearly = 5; one point missing or unclear = 3; only one point = 1. Report the covered points in checks.',
      ...SCALE,
    ],
    outputContract: reviewContract(25, 60, 'contentPoints'),
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: WRITING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected English text.

Input
Exercise text: {task}
Pictures:
{pictures}
Learner response: {userContent}`,
    rules: [
      'This is Reading & Writing Part 7: a story of 35 words or more about three pictures.',
      'For content, the story must refer to all three pictures: all three clearly = 5; one picture missing or unclear = 3; only one picture = 1. Report the pictures covered in checks.',
      'A consistent tense (usually past simple) and a clear ending help organisation.',
      ...SCALE,
    ],
    outputContract: reviewContract(35, 80, 'pictures'),
  }),
]
