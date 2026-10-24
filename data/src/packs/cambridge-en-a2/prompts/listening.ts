import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A2_LANGUAGE,
  A2_TOPICS,
  AUTHOR_ROLE,
  CHOICE_RULE,
  GAP_RULE,
  LABEL_RULE,
  PRELUDE,
  RULES_HEADER,
} from './common'

const LLM = { temperature: 0.8, maxTokens: 4500 }

const ITEMS_CONTRACT = `{
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
}`

export const listeningPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'listening',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Listening Part 1 (five short conversations, 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Structure: EXACTLY 5 "items". Each is one short everyday conversation between two people (4–6 turns, 50–80 words) with a one-sentence "context" ("At a railway station.") and one "question" ("Which train will the man take?").',
      '2. In the real exam the options are pictures. Here "options" are 3 short text phrases naming what the pictures would show: things, times, prices, places, weather, activities.',
      '3. All three options are mentioned or suggested in the conversation; the speakers change their mind, correct a detail or reject two of them, so the learner must follow to the end.',
      `4. ${CHOICE_RULE}`,
      `5. ${LABEL_RULE}`,
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "explanation" (one sentence) says what in the conversation decides the answer. "title": "Part 1: Short conversations".',
    ],
    outputPrelude: PRELUDE('ListeningKeyPart1'),
    outputContract: `${ITEMS_CONTRACT}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Listening Part 2 (a talk with five notes to complete).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE monologue of 150–200 words in "transcript" – a speaker giving information about a course, a trip, a club, an event or a place. No speaker label.',
      '2. "context": one sentence introducing it ("You will hear a woman talking about a cooking course.").',
      '3. Notes ("content"): a title line, an empty line, then EXACTLY 5 note lines, each "Label: (n) ____" in the order of the talk. A gap may have a fixed prefix or suffix, for example "Price: £(3) ____" or "Bring an apron and a (4) ____".',
      '4. Each answer is one word, a number, a date or a time (at most 3 words, such as "half past six"). Exactly one answer is a name the speaker spells letter by letter ("That\'s G-A-L-L-O-W-A-Y"); its "accepted" contains only that exact spelling.',
      '5. For at least two gaps the speaker first mentions a wrong detail and then corrects it (it used to be on Thursdays, now it is on Wednesdays).',
      `6. ${GAP_RULE}`,
      `7. ${A2_LANGUAGE}`,
      '8. "question" is the note\'s label without the colon ("Day of the course"). "explanation" (one sentence) quotes what the speaker says. "title": "Part 2: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningKeyPart2'),
    outputContract: `{
  "title": string,
  "context": string,
  "content": string,
  "transcript": string,
  "questions": [
    { "question": string, "accepted": string[], "explanation": string }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Listening Part 3 (one longer conversation, 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE informal conversation of 250–320 words between two people who know each other, in "transcript", 10–14 turns, one turn per line.',
      '2. "context": one sentence naming the speakers and the topic ("You will hear Tom talking to his friend Katie about her holiday.").',
      '3. Questions: EXACTLY 5, in the order of the conversation. Answers can come from either speaker and include feelings and opinions, not only facts.',
      '4. Each question carries its own "options". Do NOT add a top-level "options" field.',
      `5. ${CHOICE_RULE}`,
      `6. ${LABEL_RULE}`,
      `7. ${A2_LANGUAGE}`,
      `8. ${A2_TOPICS}`,
      '9. "explanation" (one sentence) says who says what. "title": "Part 3: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningKeyPart3'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "questions": [
    { "question": string, "options": [string, string, string], "correctAnswer": 0 | 1 | 2, "explanation": string }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 4,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Listening Part 4 (five short recordings, 3-option multiple choice on the main idea).',
    rules: [
      RULES_HEADER,
      '1. Structure: EXACTLY 5 "items", each a short monologue or a dialogue of 40–70 words: a message, an announcement, someone talking about an experience, two friends deciding something.',
      '2. "context" is the scene-setter ("A woman is talking about a film."). "question" repeats it for the learner and asks the question: "You will hear a woman talking about a film. What did she like most about it?"',
      '3. Test the main idea, the purpose, the reason or the speaker\'s feeling – not a single number.',
      `4. ${CHOICE_RULE}`,
      `5. ${LABEL_RULE} A monologue also starts with its speaker's label.`,
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "explanation" (one sentence) says what in the recording decides the answer. "title": "Part 4: Five short recordings".',
    ],
    outputPrelude: PRELUDE('ListeningKeyPart4'),
    outputContract: `${ITEMS_CONTRACT}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 5,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Listening Part 5 (one conversation, match five people to eight options).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE conversation of 250–320 words between two people who know each other, in "transcript", one turn per line.',
      '2. "context": one sentence saying who is talking and what to match ("You will hear Anna telling her dad about the presents she bought. What did she buy for each person?").',
      '3. "options": EXACTLY 8 short items from one set (presents, jobs, sports, foods, places), each 1–3 words ("a camera", "a plant"), without letters.',
      '4. "questions": EXACTLY 5, each with "person" (a person or a day: "her brother", "Monday") in the order they are discussed, and "correctAnswer" the index 0–7 of their option. Each person has a DIFFERENT option.',
      '5. The three unused options are all mentioned in the conversation as ideas that were rejected, so the learner must listen for the final choice.',
      `6. ${LABEL_RULE}`,
      `7. ${A2_LANGUAGE}`,
      '8. "explanation" (one sentence) quotes the decisive words. "title": "Part 5: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningKeyPart5'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "options": [string, string, string, string, string, string, string, string],
  "questions": [
    { "person": string, "correctAnswer": number, "explanation": string }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
]
