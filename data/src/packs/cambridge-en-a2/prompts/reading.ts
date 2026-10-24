import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { A2_LANGUAGE, A2_TOPICS, AUTHOR_ROLE, CHOICE_RULE, GAP_RULE, PRELUDE, RULES_HEADER } from './common'

const LLM = { temperature: 0.8, maxTokens: 4000 }

const META = (textType: string, type: string) => `  "title": string,
  "content": string,
  "textType": "${textType}",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    {
      "question": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string,
      "type": "${type}"
    }
  ]`

export const readingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'reading',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Reading Part 1 (short real-world texts, 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Texts: EXACTLY 6 short, different real-world texts: signs, notices, labels, text messages, notes and short emails. Each is 10–30 words and has one clear message.',
      '2. "content": for each text a line "n · <where it is or what it is>" (for example "3 · At the sports centre" or "5 · A text message"), then the text in double quotes on the next line, then an empty line. Number the texts 1 to 6.',
      '3. Questions: EXACTLY 6, one per text, in order. Each "question" starts with "Text n:" and asks what the text says or means, or starts a sentence the options complete ("Text 3: At the sports centre,").',
      `4. ${CHOICE_RULE} The options paraphrase the text; a wrong option misreads a time, a person, a condition or who does what.`,
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. "explanation" (one sentence) quotes or paraphrases the words that decide the answer. "type" is "comprehension". textType is "notice".',
    ],
    examples: [
      `REFERENCE EXAMPLE (style only):
content line: "2 · A text message" / "Hi Tom, I've missed the 6.15 bus. I'll meet you outside the cinema at 7, not inside. Ella"
question: "Text 2: What does Ella want Tom to do?"
options: ["wait for her at the bus stop", "go into the cinema without her", "meet her in front of the cinema"] → correctAnswer 2`,
    ],
    outputPrelude: PRELUDE('ReadingKeyPart1'),
    outputContract: `{
${META('notice', 'comprehension')}
}
Generate {count} new exercises (different texts) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Reading Part 2 (three short texts on one topic, 3-option multiple matching).',
    rules: [
      RULES_HEADER,
      '1. Texts: EXACTLY 3 short texts of 60–90 words on the same topic, each by or about a different person (or about three places, courses or events). They are similar enough that the learner must read carefully.',
      '2. "content": "A: <name>" on its own line, then the text, then an empty line; the same for "B: <name>" and "C: <name>".',
      '3. Questions: EXACTLY 7, each asking "Who …?" or "Which … ?" about one detail. Every question\'s "options" is the SAME list of the three names in A, B, C order, and "correctAnswer" is 0 for A, 1 for B, 2 for C. Each text answers at least two questions, and the questions are not in text order.',
      '4. A wrong text often mentions the same idea in a different way (someone wanted to do it, but did not).',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. "explanation" (one sentence) says which words in the right text answer the question. "type" is "matching". textType is "article".',
    ],
    outputPrelude: PRELUDE('ReadingKeyPart2'),
    outputContract: `{
${META('article', 'matching')}
}
Generate {count} new exercises (different topics) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Reading Part 3 (one longer text, 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Text: ONE magazine or website article of 200–250 words, for example a person describing an experience, a job, a trip or a hobby. First line is the title (and author), then an empty line, then 4–6 paragraphs, one per line.',
      '2. Questions: EXACTLY 5, in the order of the text, testing main ideas, details, reasons and the writer\'s feelings or opinions.',
      `3. ${CHOICE_RULE}`,
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      '6. "explanation" (one sentence) paraphrases the part of the text that decides the answer. "type" is "comprehension". textType is "article".',
    ],
    outputPrelude: PRELUDE('ReadingKeyPart3'),
    outputContract: `{
${META('article', 'comprehension')}
}
Generate {count} new exercises (different articles) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 4,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Reading Part 4 (multiple-choice cloze: a factual text with 6 gaps).',
    rules: [
      RULES_HEADER,
      '1. Text: a short factual text of 120–150 words (the history of an object, a place, an animal, a sport, a festival). First line is the title, then an empty line, then 2–3 paragraphs, one per line.',
      '2. Gaps: EXACTLY 6, written in the text as "(1) ____" to "(6) ____", in order, each once. Do not put the answer anywhere in the text.',
      '3. Questions: EXACTLY 6, one per gap, in order; each "question" is "Gap n". "options" are 3 single words of the same word class, only one of which fits the meaning AND the grammar of the sentence.',
      '4. Test mainly vocabulary: collocations (make / do / have), verbs with prepositions, adjectives, linkers, and some grammar (than / as, a / the).',
      `5. ${CHOICE_RULE}`,
      `6. ${A2_LANGUAGE}`,
      '7. "explanation" (one sentence) says why the right word fits and the others do not. "type" is "cloze". textType is "article".',
    ],
    outputPrelude: PRELUDE('ReadingKeyPart4'),
    outputContract: `{
${META('article', 'cloze')}
}
Generate {count} new exercises (different texts) as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 5,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for A2 Key Reading Part 5 (open cloze: an email with 6 gaps, one word each).',
    rules: [
      RULES_HEADER,
      '1. Text: an informal email of 90–120 words (optionally followed by a short reply), starting with the lines "From: <name>" and "To: <name>", then an empty line, then the email with one paragraph per line.',
      '2. Example: before gap 1, write one worked example as "(0) <word>" with its answer shown, for example "Thanks (0) for your email."',
      '3. Gaps: EXACTLY 6, written as "(1) ____" to "(6) ____". Each answer is ONE grammar word: a preposition, article, pronoun, auxiliary or modal verb, question word, linker or determiner – never a content word the reader cannot work out from grammar and context.',
      `4. ${GAP_RULE} Every accepted answer here is a single word.`,
      '5. List every word that really fits in "accepted" (for example ["because", "since", "as"]), but only words that fit both the grammar and the meaning.',
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "question" is "Gap n". "explanation" (one sentence) names the grammar point. "type" is "gap". textType is "email".',
    ],
    examples: [
      `REFERENCE EXAMPLE (gap logic):
content line: "I start (2) ____ seven o'clock every morning."
gap: { "question": "Gap 2", "accepted": ["at"], "explanation": "Clock times take \\"at\\".", "type": "gap" }`,
    ],
    outputPrelude: PRELUDE('ReadingKeyPart5'),
    outputContract: `{
  "title": string,
  "content": string,
  "textType": "email",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],
  "questions": [
    { "question": "Gap 1", "accepted": string[], "explanation": string, "type": "gap" }
  ]
}
Generate {count} new exercises (different emails) as JSON.`,
  }),
]
