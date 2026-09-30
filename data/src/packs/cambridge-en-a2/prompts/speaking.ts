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
  SPEAKING_EXAMINER_ROLE,
} from './common'

const GENERATOR_LLM = { temperature: 0.8, maxTokens: 2000 }
const REVIEW_LLM = { maxTokens: 2000 }

/**
 * The A2 speaking scales a transcript can show, summarised in our own words. Pronunciation
 * is part of the real exam but cannot be judged from text, so it is not marked here.
 */
const SCALES = [
  'Mark three scales, each 0–5; half points are allowed. Judge the learner\'s whole performance across all turns, not each turn separately.',
  'grammarVocabulary – 5: good control of simple grammar and a range of everyday vocabulary for the topics. 3: enough control of simple grammar and suitable vocabulary for everyday situations. 1: limited control of a few simple forms; mostly isolated words and phrases. 0: below band 1.',
  'interactiveCommunication – 5: every turn answers its question relevantly, answers give reasons or details, and any question to the partner is natural and correct. 3: turns are mostly relevant but very short, or some do not really answer the question. 1: minimal or irrelevant responses. 0: below band 1.',
  'globalAchievement – 5: handles every turn and produces longer answers (the "tell me about" answer, reasons, preferences) despite some hesitation. 3: gets basic meaning across in very short turns. 1: struggles to convey basic meaning. 0: below band 1.',
  'Pronunciation is not assessed: do not comment on it. Transcripts come from speech-to-text: ignore missing punctuation, capitalisation and obvious recognition slips.',
]

const REVIEW_CONTRACT = `Output JSON format (strict):
{
  "criteria": [
    { "id": "grammarVocabulary", "label": "Grammar and Vocabulary", "maxPoints": 5, "points": <0-5>, "comment": "<short comment in the feedback language>" },
    { "id": "interactiveCommunication", "label": "Interactive Communication", "maxPoints": 5, "points": <0-5>, "comment": "…" },
    { "id": "globalAchievement", "label": "Global Achievement", "maxPoints": 5, "points": <0-5>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the three points values, 0-15>,
  "maxPoints": 15,
  "summary": "<one sentence in the feedback language>",
  "strengths": [ "<what the learner did well>" ],
  "improvements": [ "<what to practise next>" ]
}
${JSON_ONLY}`

const MODEL_CONTRACT = `{
  "topicId": "{topicId}",
  "content": "the model answer, one line per turn",
  "wordCount": number,
  "highlights": {
    "greeting": "",
    "mainPoints": ["why each turn works"],
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
    task: 'Task: generate {count} exercises for A2 Key Speaking Part 1 (the examiner asks the candidate questions). Solo practice: every card is an examiner question the learner answers.',
    rules: [
      RULES_HEADER,
      '1. "cards": EXACTLY 5 cards in this order, each { "segment", "kind": "answer", "speaker": "examiner", "topic", "cue" }:',
      '   - "personal1", "personal2": topic "About you"; simple personal questions ("Where do you live?", "Do you work or are you a student?", "Where are you from?").',
      '   - "topic1", "topic2": one everyday topic (food, free time, holidays, shopping, school or work, weather, transport); short-answer questions ("What do you usually eat for breakfast?").',
      '   - "extended": the same topic; an invitation to talk longer, starting "Please tell me something about …".',
      `2. ${A2_LANGUAGE}`,
      `3. ${A2_TOPICS}`,
      '4. "theme": "About you · <topic>". topicType: "interview".',
    ],
    outputPrelude: PRELUDE('SpeakingKeyPart1'),
    outputContract: `{
  "theme": string,
  "topicType": "interview",
  "cards": [
    { "segment": "personal1", "kind": "answer", "speaker": "examiner", "topic": "About you", "cue": string },
    { "segment": "personal2", "kind": "answer", "speaker": "examiner", "topic": "About you", "cue": string },
    { "segment": "topic1", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "topic2", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "extended", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for A2 Key Speaking Part 2 (a discussion about a set of pictures, then follow-up questions). Solo practice: the examiner\'s questions are fixed cards, and the learner asks the partner one question.',
    rules: [
      RULES_HEADER,
      '1. In the real exam the candidates see five pictures on one topic. Here "pictures" names the five things in words, 1–4 words each ("reading a book", "going to the cinema").',
      '2. "cards": EXACTLY 5 cards in this order:',
      '   - "opinion": kind "answer", speaker "examiner"; the cue names all five things and asks "Do you like these different …? Say why or why not."',
      '   - "askPartner": kind "ask", NO speaker; the learner\'s own word card – a 1–3 word prompt for a question to the partner ("favourite activity?").',
      '   - "followUp": kind "answer", speaker "examiner"; "Do you think … is …? Why? Why not?" about one of the five things.',
      '   - "favourite": kind "answer", speaker "examiner"; "Which of these … do you like best?"',
      '   - "preference": kind "answer", speaker "examiner"; a wider question on the topic, "Do you prefer … or …? Why?"',
      '3. Every card has the same "topic", the name of the picture set ("Free-time activities").',
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      '6. "theme": the topic. topicType: "discussion".',
    ],
    outputPrelude: PRELUDE('SpeakingKeyPart2'),
    outputContract: `{
  "theme": string,
  "topicType": "discussion",
  "pictures": [string, string, string, string, string],
  "cards": [
    { "segment": "opinion", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "askPartner", "kind": "ask", "topic": string, "cue": string },
    { "segment": "followUp", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "favourite", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "preference", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Theme: {theme}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A2 answer for every examiner question, as a strong A2 Key candidate would say it.',
    rules: [
      'One line per turn, prefixed with its segment id ("personal1: …").',
      'Short answers of one or two sentences for the first four; three or four connected sentences for "extended". Invented but plausible details.',
    ],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Theme: {theme}\nPictures: {pictures}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A2 line for every turn, as a strong A2 Key candidate would say it.',
    rules: [
      'One line per turn, prefixed with its segment id ("opinion: …").',
      '"opinion" talks about at least three of the pictures with a reason each; "askPartner" is a natural question to the partner made from the card; the other turns answer with a reason ("because …").',
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

This is Speaking Part 1: the examiner asks personal questions, then questions on one topic, then asks the candidate to talk a little longer.
Theme: {theme}
Turns (segment id, question, transcript):
{turns}`,
    rules: [
      'Short personal answers are normal for the first questions; the "extended" answer should be several connected sentences.',
      ...SCALES,
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

This is Speaking Part 2: the candidate says what they think about five pictured activities or things, asks their partner a question, and answers follow-up questions with reasons.
Theme: {theme}
Pictures: {pictures}
Turns (segment id, task, card, transcript):
{turns}`,
    rules: [
      'Good answers give opinions with reasons ("I like … because …") and compare or prefer ("I prefer … to …").',
      'In "askPartner" the learner should ask a clear, correct question made from the card.',
      ...SCALES,
    ],
    outputContract: REVIEW_CONTRACT,
  }),
]
