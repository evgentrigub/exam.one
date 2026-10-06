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
 * The exam's speaking criteria that a transcript can show, summarised in our own words and
 * scaled to each practice task. Pronunciation (wymowa) needs the audio and is not marked.
 */
const scales = (task: number, language: number): string[] => [
  `Mark three criteria; half points are allowed. taskCompletion 0–${task}, vocabulary 0–${language}, grammar 0–${language}. Judge the whole performance across all turns.`,
  `taskCompletion – full marks: every turn does what it should (answers the question, covers the prompt, reacts to the partner) in full sentences with some detail. Half marks: turns are relevant but very short, or some do not really answer. 0: no relevant response.`,
  `vocabulary – full marks: everyday vocabulary suited to the topic, with some variety. Half marks: very basic, repetitive words, sometimes the wrong word. 0: isolated words only.`,
  `grammar – full marks: good control of simple structures: case endings after common prepositions and verbs, verb person and tense, agreement of adjectives. Errors do not hide the meaning. Half marks: frequent errors, sometimes unclear. 0: almost no control.`,
  'Pronunciation is not assessed: do not comment on it. Transcripts come from speech-to-text: ignore missing punctuation, capitalisation, missing diacritics and obvious recognition slips.',
]

const reviewContract = (task: number, language: number) => `Output JSON format (strict):
{
  "criteria": [
    { "id": "taskCompletion", "label": "Task completion", "maxPoints": ${task}, "points": <0-${task}>, "comment": "<short comment in the feedback language>" },
    { "id": "vocabulary", "label": "Vocabulary", "maxPoints": ${language}, "points": <0-${language}>, "comment": "…" },
    { "id": "grammar", "label": "Grammar", "maxPoints": ${language}, "points": <0-${language}>, "comment": "…" }
  ],
  "totalPoints": <the exact sum of the three points values, 0-${task + 2 * language}>,
  "maxPoints": ${task + 2 * language},
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
    task: 'Task: generate {count} exercises for Polish A2 Speaking, task 1 (the examiner asks the candidate about themselves). Solo practice: every card is an examiner question the learner answers.',
    rules: [
      RULES_HEADER,
      '1. "cards": EXACTLY 4 cards in this order, segments "question1" … "question4", each { "segment", "kind": "answer", "speaker": "examiner", "topic", "cue" }.',
      '2. The questions ask about the candidate\'s own life, in the formal "Pan / Pani" form: name and origin, family, where and how they live, work or studies, interests and free time, a typical day. Use one theme per exercise (for example family and home) and make the last question invite a longer answer ("Proszę opowiedzieć o …").',
      '3. "topic": the theme in Polish ("Rodzina i dom"), the same on every card.',
      `4. ${A2_LANGUAGE}`,
      '5. "theme": "O sobie · <topic>". topicType: "interview".',
    ],
    outputPrelude: PRELUDE('SpeakingPlA2Zadanie1'),
    outputContract: `{
  "theme": string,
  "topicType": "interview",
  "cards": [
    { "segment": "question1", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "question2", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "question3", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "question4", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for Polish A2 Speaking, task 2 (describe a person in a photo).',
    rules: [
      RULES_HEADER,
      '1. In the exam the candidate sees a photo. Here "theme" describes the photo in Polish in 1–2 sentences, starting "Zdjęcie: " – ONE clearly visible person, their age, appearance, clothes, what they are doing and where ("Zdjęcie: starszy mężczyzna w czapce i ciepłej kurtce karmi ptaki w parku zimą.").',
      '2. "keywords": EXACTLY 4 short prompts in Polish, in this order: who the person is and how old they might be; what they look like and wear; what they are doing and where; how they feel or what they might be thinking, and why.',
      `3. ${A2_LANGUAGE}`,
      `4. ${A2_TOPICS}`,
      '5. topicType: "photo". Do not add cards.',
    ],
    outputPrelude: PRELUDE('SpeakingPlA2Zadanie2'),
    outputContract: `{
  "theme": string,
  "topicType": "photo",
  "keywords": [string, string, string, string]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'generator',
    llm: GENERATOR_LLM,
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} exercises for Polish A2 Speaking, task 3 (a role-play with the examiner). Solo practice: the learner opens the conversation from a card, and the examiner\'s three lines are fixed cards.',
    rules: [
      RULES_HEADER,
      '1. Situation ("theme", in Polish, addressed to "ty"): an everyday situation where the learner must invite, suggest, arrange, ask for information or buy something, with the examiner as a friend, a shop assistant or an official ("Zaproś kolegę / koleżankę do kina. Zaproponuj film, dzień, godzinę i miejsce spotkania.").',
      '2. "cards": EXACTLY 4 cards in this order:',
      '   - "opening": kind "ask", NO speaker; the learner\'s own card, a 2–5 word prompt of what to start with ("zaproszenie do kina").',
      '   - "reply1", "reply2", "reply3": kind "answer", speaker "examiner"; the examiner\'s line in the role, each a question or reaction that makes the learner give one more piece of information from the situation ("Chętnie! A na jaki film?", "Dobrze. Kiedy i o której?", "A gdzie się spotkamy?").',
      '3. Every card has the same "topic": the situation in 1–3 Polish words ("W kinie").',
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      '6. topicType: "roleplay".',
    ],
    outputPrelude: PRELUDE('SpeakingPlA2Zadanie3'),
    outputContract: `{
  "theme": string,
  "topicType": "roleplay",
  "cards": [
    { "segment": "opening", "kind": "ask", "topic": string, "cue": string },
    { "segment": "reply1", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "reply2", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string },
    { "segment": "reply3", "kind": "answer", "speaker": "examiner", "topic": string, "cue": string }
  ]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Theme: {theme}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A2 answer in Polish for every examiner question, as a strong A2 candidate would say it.',
    rules: [
      'One line per turn, prefixed with its segment id ("question1: …").',
      'Two or three full sentences per answer, four or five for the last one. Invented but plausible personal details; strictly A2 language.',
    ],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Photo: {theme}\nPrompts: {keywords}\nYOUR TASK: write an exemplary A2 description of the person in the photo in Polish, as a strong A2 candidate would say it.',
    rules: [
      '70–100 words, one connected monologue covering the four prompts in order ("Na zdjęciu jest …", "Myślę, że …").',
      'Present tense, correct adjective endings for looks and clothes (ma na sobie + accusative), strictly A2 language.',
    ],
    outputContract: MODEL_CONTRACT,
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'answer',
    role: AUTHOR_ROLE,
    task: 'Situation: {theme}\nTurns:\n{turns}\nYOUR TASK: write an exemplary A2 line in Polish for every learner turn, as a strong A2 candidate would say it.',
    rules: [
      'One line per turn, prefixed with its segment id ("opening: …").',
      '"opening" starts the conversation from the card with a greeting; each reply answers the examiner\'s line and gives the information the situation asks for (a film, a day, a time, a place). One or two sentences per turn.',
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

This is speaking task 1: the examiner asks the candidate about themselves. In the exam it earns up to 4 points for task completion; here vocabulary and grammar add 1 point each.
Theme: {theme}
Turns (segment id, question, transcript):
{turns}`,
    rules: [
      'Answers in full sentences with a detail score higher than one-word answers; the last answer should be longer.',
      ...scales(4, 1),
    ],
    outputContract: reviewContract(4, 1),
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

This is speaking task 2: the candidate describes a person in a photo. In the exam it earns up to 10 points for task completion; here vocabulary and grammar add 2.5 points each.
Photo: {theme}
Prompts: {keywords}
Transcript: {userContent}`,
    rules: [
      'For taskCompletion, check the four prompts: all four covered with details = full marks; about 2.5 points less for each prompt missing. The description must fit the photo.',
      ...scales(10, 2.5),
    ],
    outputContract: reviewContract(10, 2.5),
  }),
  definePrompt({
    skill: 'speaking',
    part: 3,
    kind: 'review',
    llm: REVIEW_LLM,
    role: SPEAKING_EXAMINER_ROLE,
    task: `${FEEDBACK_LANGUAGE}

This is speaking task 3: a role-play with the examiner. In the exam it earns up to 10 points for task completion; here vocabulary and grammar add 2.5 points each.
Situation: {theme}
Turns (segment id, card or examiner line, transcript):
{turns}`,
    rules: [
      'For taskCompletion, the learner must open the conversation appropriately, react to each examiner line and give every piece of information the situation asks for. Polite forms and a natural reaction ("Chętnie!", "Niestety …") count in their favour.',
      ...scales(10, 2.5),
    ],
    outputContract: reviewContract(10, 2.5),
  }),
]
