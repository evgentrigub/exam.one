import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A2_LANGUAGE,
  A2_TOPICS,
  AUTHOR_ROLE,
  BAND_SCALES,
  ERRORS_RULE,
  FEEDBACK_LANGUAGE,
  JSON_ONLY,
  PRELUDE,
  RULES_HEADER,
  WRITING_EXAMINER_ROLE,
} from './common'

const GENERATOR_LLM = { temperature: 0.8, maxTokens: 2500 }
const REVIEW_LLM = { maxTokens: 2500 }

const TOPIC_FIELDS = (topicType: string, time: number, min: number, max: number) => `  "title": string,
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

const reviewContract = (min: number, max: number) => `Output JSON format (strict):
{
  "criteria": [
    { "id": "taskCompletion", "label": "Cumplimiento de la tarea", "maxPoints": 3, "points": <0-3>, "comment": "<short comment in the feedback language>" },
    { "id": "language", "label": "Uso de la lengua", "maxPoints": 3, "points": <0-3>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the two points values, 0-6>,
  "maxPoints": 6,
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to work on next>" ],
  "wordCount": { "actual": <number>, "min": ${min}, "max": ${max} },
  "ruleApplied": "none | off_topic",
  "checks": [
    { "id": "contentPoints", "required": <number of content points>, "covered": <number covered> }
  ],
  "priorityFixes": [ "<fix 1>", "<fix 2>" ],
  "examples": [
    { "error": "<quotation from the learner response>", "correction": "<corrected Spanish text>", "rule": "<short explanation>" }
  ],
  "report": "<short closing report>"
}
${JSON_ONLY}`

const REVIEW_INPUT = `${FEEDBACK_LANGUAGE}
In examples.error keep the learner's wording exactly as written. In examples.correction give the corrected Spanish text.

Input
Exercise text: {task}
Content points: {requirements}
Learner response: {userContent}`

const LENGTH_RULE = (min: number, max: number) =>
  `The official length is ${min}–${max} words. There is no automatic zero for length, but a text far below ${min} words cannot reach band 2 in taskCompletion, and a text far above ${max} words must still be judged on the points it covers. An off-topic response scores 0 on both criteria (ruleApplied "off_topic").`

export const writingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for DELE A2 Writing, Tarea 1 (reply to a short personal message in 60–70 words).',
    rules: [
      RULES_HEADER,
      '1. Type: topicType "email" (a reply to an email), "note" (a reply to a note or a postcard) or "post" (a reply to a message or a forum post). The situation is personal: a friend or relative writes about an invitation, a visit, a trip, a new flat, a course, a birthday, a plan for the weekend.',
      '2. "task" (in Spanish, addressed to "tú"): first the message you received, in quotation marks, 35–40 words, signed with a Spanish first name; then an empty line and "Escribe un correo (una nota / un mensaje) a <name>. En él debes:" followed by EXACTLY 4 or 5 content points, each on its own line starting with "– " ("– saludar", "– decir qué hiciste el fin de semana", "– explicar por qué no puedes ir", "– proponer otro día, hora y lugar", "– despedirte"); then "Número de palabras: entre 60 y 70.".',
      '3. The points make the learner use at least two time frames (past, present, future) and include one proposal or question.',
      '4. "requirements": the content points, in order, without the dash.',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. "description": one sentence naming the situation. "category": 1–3 topic tags. estimatedTime: 20. wordCount: { "min": 60, "max": 70 }. No model answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure):
task: "«¡Hola! Ya estoy en mi piso nuevo. Es pequeño pero muy bonito y está cerca del centro. El sábado hago una fiesta para mis amigos. ¿Vienes? Escríbeme pronto. Un beso, Marta.»\\n\\nEscribe un correo a Marta. En él debes:\\n– saludar\\n– decir cómo estás y qué has hecho esta semana\\n– explicar si puedes ir a la fiesta\\n– preguntarle dos cosas sobre su piso\\n– despedirte\\nNúmero de palabras: entre 60 y 70."
requirements: ["Saludar", "Decir cómo estás y qué has hecho esta semana", "Explicar si puedes ir a la fiesta", "Preguntarle dos cosas sobre su piso", "Despedirte"]`,
    ],
    outputPrelude: PRELUDE('WritingEsA2Tarea1'),
    outputContract: `{
${TOPIC_FIELDS('"email" | "note" | "post"', 20, 60, 70)}
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for DELE A2 Writing, Tarea 2 (a text of 70–80 words: Opción A, an everyday experience; or Opción B, a biography or story from given information).',
    rules: [
      RULES_HEADER,
      '1. In the exam the candidate chooses one of two options. Here each exercise is ONE option; alternate the two across the {count} exercises.',
      '2. topicType "opcion-a": a text about the learner\'s own life – a special day, a trip, a celebration, the place where you grew up, a change in your life, your best friend. "task" (in Spanish, addressed to "tú"): one or two sentences setting the scene ("Un blog de viajes pide a sus lectores textos sobre su primer viaje."), then "Escribe un texto en el que cuentes:" and 3–5 content points, each on its own line starting with "– ", then "Número de palabras: entre 70 y 80.".',
      '3. topicType "opcion-b": in the exam the candidate writes from photos. Here the information is given in words: a short list of 4–6 dated facts about an invented person or a story ("1995: nace en Cádiz", "2013: estudia Turismo en Granada", "2018: abre un restaurante con su hermano"), then "Escribe un texto sobre <name> en el que cuentes:" and 3–5 content points with "– ", then "Número de palabras: entre 70 y 80.".',
      '4. The points make the learner narrate in the past (pretérito indefinido and imperfecto) and add an opinion or a feeling.',
      '5. "requirements": the content points, in order, without the dash.',
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "description": one sentence naming the option and the topic. "category": 1–3 topic tags. estimatedTime: 25. wordCount: { "min": 70, "max": 80 }. No model answer.',
    ],
    examples: [
      `REFERENCE EXAMPLE (structure, Opción A):
task: "Una revista pide a sus lectores textos sobre una fiesta especial.\\nEscribe un texto en el que cuentes:\\n– qué fiesta fue y cuándo\\n– dónde fue y con quién estuviste\\n– qué hicisteis\\n– por qué fue especial para ti\\nNúmero de palabras: entre 70 y 80."
requirements: ["Qué fiesta fue y cuándo", "Dónde fue y con quién estuviste", "Qué hicisteis", "Por qué fue especial para ti"]`,
    ],
    outputPrelude: PRELUDE('WritingEsA2Tarea2'),
    outputContract: `{
${TOPIC_FIELDS('"opcion-a" | "opcion-b"', 25, 70, 80)}
}`,
  }),
  definePrompt({
    skill: 'writing',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise: {task}\nYOUR TASK: write one exemplary A2 answer to it, as a strong A2 candidate would, in {words} words.',
    rules: [
      'A personal reply in Spanish covering every content point in order, with a fitting opening ("¡Hola, Marta!", "Querido Pablo:") and closing ("Un abrazo,", "Besos,") and the writer\'s first name.',
      'Past tense for what happened, present for how things are, ir a + infinitive or a question for plans. Strictly A2 language with every accent.',
    ],
    outputContract: ANSWER_CONTRACT,
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'You previously generated the following exercise ({option}): {task}\nYOUR TASK: write one exemplary A2 answer to it, as a strong A2 candidate would, in {words} words.',
    rules: [
      'One connected text in Spanish covering every content point in order, with simple linkers (y, pero, porque, cuando, después, al final). For Opción B, use every given fact in your own sentences.',
      'Pretérito indefinido for events, imperfecto for descriptions and habits in the past, and one opinion or feeling. Greeting and closing are empty strings.',
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
      'This is writing Tarea 1: a reply to a short personal message, 60–70 words. In the exam both tasks are marked on the same two scales and averaged; here this task has its own 6 raw points (3 + 3).',
      'For taskCompletion, check each content point and report them in checks. A reply needs a greeting, a closing and the register of a message between friends.',
      LENGTH_RULE(60, 70),
      ...BAND_SCALES,
      ERRORS_RULE,
    ],
    outputContract: reviewContract(60, 70),
  }),
  definePrompt({
    skill: 'writing',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: WRITING_EXAMINER_ROLE,
    task: `${REVIEW_INPUT}
Option: {option}`,
    rules: [
      'This is writing Tarea 2: a text of 70–80 words, either about an everyday experience (opcion-a) or a biography or story from given facts (opcion-b). Here it has its own 6 raw points (3 + 3).',
      'For taskCompletion, check each content point and report them in checks. For opcion-b, the given facts must be used and turned into connected sentences, not copied as a list.',
      'For language, past tenses (indefinido for events, imperfecto for descriptions) are central to this task.',
      LENGTH_RULE(70, 80),
      ...BAND_SCALES,
      ERRORS_RULE,
    ],
    outputContract: reviewContract(70, 80),
  }),
]
