import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A2_LANGUAGE,
  A2_TOPICS,
  AUTHOR_ROLE,
  BAND_SCALES,
  FEEDBACK_LANGUAGE,
  JSON_ONLY,
  PRELUDE,
  RULES_HEADER,
  SPEAKING_EXAMINER_ROLE,
} from './common'

const GENERATOR_LLM = { temperature: 0.8, maxTokens: 2000 }
const REVIEW_LLM = { maxTokens: 2000 }

/** Transcript caveats every speaking review repeats. */
const TRANSCRIPT_RULE =
  'Pronunciation and intonation are not assessed: do not comment on them. Transcripts come from speech-to-text: ignore missing punctuation, capitalisation, missing accents and obvious recognition slips. Fluency shows only as length and connection of what was said.'

const REVIEW_CONTRACT = `Output JSON format (strict):
{
  "criteria": [
    { "id": "taskCompletion", "label": "Cumplimiento de la tarea", "maxPoints": 3, "points": <0-3>, "comment": "<short comment in the feedback language>" },
    { "id": "language", "label": "Uso de la lengua", "maxPoints": 3, "points": <0-3>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the two points values, 0-6>,
  "maxPoints": 6,
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to practise next>" ]
}
${JSON_ONLY}`

const MODEL_CONTRACT = `{
  "topicId": "{topicId}",
  "content": "the model answer",
  "wordCount": number,
  "highlights": {
    "greeting": "",
    "mainPoints": ["why each part works"],
    "closing": "",
    "keyPhrases": ["useful A2 phrases"]
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
    task: 'Task: generate {count} exercises for DELE A2 Speaking, Tarea 1 (a short presentation on a personal topic, 2–3 minutes, without interruption).',
    rules: [
      RULES_HEADER,
      '1. "theme" (in Spanish): the topic of the card, about the candidate\'s own life, as a short title ("Un viaje que he hecho", "Mi barrio", "Mi comida favorita", "Mi trabajo o mis estudios", "Una fiesta de mi país", "Mi tiempo libre").',
      '2. "keywords": EXACTLY 5 points in Spanish, in a natural order, that the presentation must cover – what, where, when, with whom, what you did or do, and an opinion or feeling ("Adónde fuiste y cuándo", "Con quién viajaste", "Qué hiciste allí", "Qué es lo que más te gustó", "Si te gustaría volver y por qué").',
      '3. The points make the learner use the present and at least one past tense.',
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      '6. topicType: "monologue". Do not add cards.',
    ],
    outputPrelude: PRELUDE('SpeakingEsA2Tarea1'),
    outputContract: `{
  "theme": string,
  "topicType": "monologue",
  "keywords": [string, string, string, string, string]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for DELE A2 Speaking, Tarea 2 (describe an everyday scene, 2–3 minutes).',
    rules: [
      RULES_HEADER,
      '1. In the exam the candidate describes a photo. Here "theme" describes the photo in Spanish in 1–2 short sentences (at most 35 words, because it is also the page title), starting "Escena: " – an everyday public scene with two or three people: where they are, what each is doing and one detail that suggests their relationship or mood ("Escena: en una tienda de ropa, una dependienta enseña un abrigo rojo a una señora mayor. Al lado, un chico mira unos zapatos y habla por teléfono.").',
      '2. The scene is set somewhere a short transaction can happen (a shop, a restaurant, a station, a hotel reception, a pharmacy, a tourist office), because Tarea 3 is a role-play in the same kind of place.',
      '3. "keywords": EXACTLY 5 guide questions in Spanish, in this order: the people (who they are, what they look like, what they wear); the place; what they are doing; their relationship and how they feel; what they did before or will do after.',
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      '6. topicType: "photo". Do not add cards.',
    ],
    outputPrelude: PRELUDE('SpeakingEsA2Tarea2'),
    outputContract: `{
  "theme": string,
  "topicType": "photo",
  "keywords": [string, string, string, string, string]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: "Task: generate {count} exercises for DELE A2 Speaking, Tarea 3 (a role-play with the examiner in an everyday situation, 3–4 minutes). Solo practice: the examiner's lines are fixed cards, and the learner asks one question of their own.",
    rules: [
      RULES_HEADER,
      '1. Situation ("theme", in Spanish, addressed to "tú"): an everyday transaction or conversation in a public place, with the examiner in a role – a shop assistant, a waiter, a hotel receptionist, a ticket office clerk, a tourist-office employee, a pharmacist. Say who the learner is and what they want ("Estás en una tienda de ropa y quieres comprar un regalo para tu madre. El examinador es el dependiente.").',
      '2. "cards": EXACTLY 4 cards in this order:',
      '   - "reply1": kind "answer", speaker "examiner"; the examiner opens in the role and asks what the learner wants ("Buenos días, ¿qué desea?").',
      '   - "reply2": kind "answer", speaker "examiner"; a question that makes the learner give details or choose ("¿De qué color lo quiere? ¿Qué talla?").',
      '   - "question": kind "ask", NO speaker; the learner\'s own card, a 2–5 word prompt of what to ask ("preguntar el precio", "preguntar el horario").',
      '   - "reply3": kind "answer", speaker "examiner"; a closing line that makes the learner decide, pay or say goodbye ("Son 45 euros. ¿Cómo va a pagar?").',
      '3. Every card has the same "topic": the situation in 1–3 Spanish words ("En una tienda").',
      '4. The examiner uses "usted" with the learner, as in a real service situation.',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. topicType: "roleplay".',
    ],
    outputPrelude: PRELUDE('SpeakingEsA2Tarea3'),
    outputContract: `{
  "theme": string,
  "topicType": "roleplay",
  "cards": [
    { "segment": "reply1", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "reply2", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "question", "kind": "ask", "topic": string, "cue": string },
    { "segment": "reply3", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Topic: {theme}\nPoints: {keywords}\nYOUR TASK: write an exemplary A2 presentation in Spanish on this topic, as a strong A2 candidate would say it in 2–3 minutes.',
    rules: [
      '180–250 words, one connected monologue covering the five points in order, opening with the topic ("Voy a hablar de…") and ending with a short conclusion.',
      'Invented but plausible personal details; present and past tenses; simple linkers; strictly A2 language.',
    ],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Scene: {theme}\nGuide questions: {keywords}\nYOUR TASK: write an exemplary A2 description of the scene in Spanish, as a strong A2 candidate would say it in 2–3 minutes.',
    rules: [
      '160–220 words, one connected monologue that answers the five guide questions in order ("En la escena hay…", "Creo que…", "Seguramente antes…").',
      'Estar + gerundio for actions, ser / estar / tener for descriptions, hay for what is in the place; strictly A2 language.',
    ],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Situation: {theme}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A2 line in Spanish for every learner turn, as a strong A2 candidate would say it.',
    rules: [
      'One line per turn, prefixed with its segment id ("reply1: …").',
      'Each reply answers the examiner\'s line and gives the information the situation needs; "question" asks the question on the card politely ("Perdone, ¿cuánto cuesta?"). One or two sentences per turn, "usted" with the examiner.',
    ],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

This is speaking Tarea 1: a short presentation of 2–3 minutes on a personal topic, without interruption. Practice records up to 90 seconds, so judge the points covered rather than the full length.
Topic: {theme}
Points: {keywords}
Transcript: {userContent}`,
    rules: [
      'For taskCompletion, check the five points: all five covered with some detail and in a clear order = band 3; four, or five very briefly = band 2; two or three = band 1.',
      ...BAND_SCALES,
      TRANSCRIPT_RULE,
    ],
    outputContract: REVIEW_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

This is speaking Tarea 2: the description of an everyday scene, 2–3 minutes. In the exam it is a photo; here the scene was described in words. Practice records up to 90 seconds, so judge the guide questions covered rather than the full length.
Scene: {theme}
Guide questions: {keywords}
Transcript: {userContent}`,
    rules: [
      'For taskCompletion, check the five guide questions: people, place, actions, relationship and feelings, before or after. The description must fit the scene; going beyond the written description with plausible details is good.',
      ...BAND_SCALES,
      TRANSCRIPT_RULE,
    ],
    outputContract: REVIEW_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

This is speaking Tarea 3: a role-play with the examiner in an everyday situation. In practice the examiner's lines are fixed.
Situation: {theme}
Turns (segment id, card or examiner line, transcript):
{turns}`,
    rules: [
      'For taskCompletion, each reply must react to the examiner\'s line and give the information the situation needs, and the learner must ask the question on their card. Polite forms ("quería", "perdone", "por favor", "usted") and a natural close count in their favour.',
      ...BAND_SCALES,
      TRANSCRIPT_RULE,
    ],
    outputContract: REVIEW_CONTRACT,
  }),
]
