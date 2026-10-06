import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { A2_LANGUAGE, A2_TOPICS, AUTHOR_ROLE, CHOICE_RULE, PRELUDE, RULES_HEADER } from './common'

const LLM = { temperature: 0.8, maxTokens: 6000 }

/** The reading-screen metadata every reading payload carries. */
const META = (textType: string) => `  "title": string,
  "content": string,
  "textType": "${textType}",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],`

const META_RULE =
  '"estimatedReadingTime" is the reading time in minutes, "wordCount" the words in "content", "topics" 1–3 short Spanish topic tags.'

const CHOICE_CONTRACT = (textType: string, type: string) => `{
${META(textType)}
  "questions": [
    { "question": string, "options": [string, string, string], "correctAnswer": 0 | 1 | 2, "explanation": string, "type": "${type}" }
  ]
}
Generate {count} new exercises as JSON.`

export const readingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'reading',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Reading, Tarea 1 (a personal letter or email; five 3-option questions).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): ONE personal email or letter of 250–300 words from a named person to a friend or relative, with an opening ("¡Hola, Ana!" / "Querida Carmen:"), 3–4 paragraphs and a closing ("Un abrazo, Pablo"). The writer tells news, describes a recent experience, makes a plan and asks for something.',
      '2. "questions": EXACTLY 5, in the order of the text, each a question in Spanish ("¿Por qué escribe Pablo a Ana?", "¿Qué hizo Pablo el fin de semana?"). The first asks for the purpose of the message; the others for details.',
      `3. ${CHOICE_RULE}`,
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      `6. ${META_RULE} "textType": "email". "type": "comprehension". "explanation" (one sentence, in Spanish) quotes or points to the words that show the answer. "title": a short Spanish title.`,
    ],
    outputPrelude: PRELUDE('ReadingEsA2Tarea1'),
    outputContract: CHOICE_CONTRACT('email', 'comprehension'),
  }),
  definePrompt({
    skill: 'reading',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Reading, Tarea 2 (eight short ads, notices and posts; one 3-option question each).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): EIGHT different short public texts of 50–80 words each, labelled "Texto 1" … "Texto 8" on their own line and separated by an empty line: an ad for a course, a flat or a job, a notice in a shop or a library, an event poster, a brochure extract, a forum or blog post, a sign with opening times.',
      '2. "questions": EXACTLY 8, one per text in order, each starting "Texto 1: " … "Texto 8: " ("Texto 1: ¿Qué ofrece este anuncio?", "Texto 2: Según el cartel, los niños…").',
      '3. Each question asks for one specific piece of information: a day, a price, a condition, who it is for, what you must do.',
      `4. ${CHOICE_RULE}`,
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      `7. ${META_RULE} "textType": "advertisement". "type": "comprehension". "explanation" (one sentence, in Spanish) says where the text shows the answer. "title": "Anuncios y avisos".`,
    ],
    outputPrelude: PRELUDE('ReadingEsA2Tarea2'),
    outputContract: CHOICE_CONTRACT('advertisement', 'comprehension'),
  }),
  definePrompt({
    skill: 'reading',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Reading, Tarea 3 (three short texts on one theme; match six statements to text A, B or C).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): THREE texts of 100–120 words each on the SAME theme, labelled "Texto A", "Texto B" and "Texto C" on their own line (with a short name after the label, "Texto A: Museo del Traje") and separated by an empty line: three museums, three restaurants, three hotels, three courses, three people describing their job, three recipes, three excursions.',
      '2. "questions": EXACTLY 6 statements in Spanish ("Aquí se puede comer al aire libre.", "Esta persona trabaja los fines de semana."). EVERY question has "options": ["Texto A", "Texto B", "Texto C"] exactly, in this order, and "correctAnswer" 0 for A, 1 for B, 2 for C.',
      '3. Each text answers two statements. The three texts share similar details (prices, days, activities), so the learner must read carefully; exactly one text fits each statement.',
      '4. The statements paraphrase the text; they do not copy its sentences.',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      `7. ${META_RULE} "textType": "article". "type": "matching". "explanation" (one sentence, in Spanish) names the text and the words that show the answer. "title": a short Spanish title for the theme.`,
    ],
    outputPrelude: PRELUDE('ReadingEsA2Tarea3'),
    outputContract: `{
${META('article')}
  "questions": [
    { "question": string, "options": ["Texto A", "Texto B", "Texto C"], "correctAnswer": 0 | 1 | 2, "explanation": string, "type": "matching" }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 4,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Reading, Tarea 4 (a longer narrative text; six 3-option questions).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): ONE narrative text of 375–425 words in 4–6 paragraphs – a short biography of an invented person, a travel blog entry, a diary, a short story, a local news story or a page of a travel guide. Tell events in the past (pretérito indefinido and imperfecto) with dates, places and reasons.',
      '2. "questions": EXACTLY 6, in the order of the text, each a question or an unfinished sentence in Spanish ("¿Por qué se fue Lucía a Sevilla?", "Según el texto, el pueblo…").',
      `3. ${CHOICE_RULE}`,
      `4. ${A2_LANGUAGE}`,
      `5. ${A2_TOPICS}`,
      `6. ${META_RULE} "textType": "article". "type": "comprehension". "explanation" (one sentence, in Spanish) points to the paragraph and the words that show the answer. "title": a short Spanish title.`,
    ],
    outputPrelude: PRELUDE('ReadingEsA2Tarea4'),
    outputContract: CHOICE_CONTRACT('article', 'comprehension'),
  }),
]
