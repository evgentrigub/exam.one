import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A2_LANGUAGE,
  A2_TOPICS,
  AUTHOR_ROLE,
  CHOICE_RULE,
  GAP_MARKER_RULE,
  GAP_RULE,
  PRELUDE,
  RULES_HEADER,
} from './common'

const LLM = { temperature: 0.8, maxTokens: 5000 }

/** The reading-screen metadata every reading payload carries. */
const META = (textType: string) => `  "title": string,
  "content": string,
  "textType": "${textType}",
  "estimatedReadingTime": number,
  "wordCount": number,
  "topics": string[],`

const META_RULE =
  '"estimatedReadingTime" is the reading time in minutes, "wordCount" the words in "content", "topics" 1–3 short Polish topic tags.'

export const readingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'reading',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Reading, Zadanie I (grammar: choose the correct form for ten gaps in a text).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): ONE informal email or letter of 100–150 words from a named person to a friend ("Cześć Aniu!" … "Pozdrawiam, Marek"), with EXACTLY 10 gaps.',
      `2. ${GAP_MARKER_RULE}`,
      '3. Each gap tests grammar: the case of a noun, adjective or pronoun after a preposition or verb (do + genitive, z + instrumental, w + locative, lubić + accusative), verb person and tense, the aspect of a verb, the comparison of an adjective or adverb, or a numeral with a noun. Mix at least five of these areas.',
      '4. "questions": EXACTLY 10, one per gap in order, "question" "Luka 1" … "Luka 10". The three options are three forms of the SAME word ("mama", "mamy", "mamą"); exactly one is correct in the sentence.',
      `5. ${CHOICE_RULE}`,
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      `8. ${META_RULE} "textType": "email". "type": "cloze". "explanation" (one sentence, in Polish) names the rule ("Po przyimku „z” używamy narzędnika."). "title": a short Polish title.`,
    ],
    outputPrelude: PRELUDE('ReadingPlA2Zadanie1'),
    outputContract: `{
${META('email')}
  "questions": [
    { "question": "Luka 1", "options": [string, string, string], "correctAnswer": 0 | 1 | 2, "explanation": string, "type": "cloze" }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Reading, Zadanie II (vocabulary and grammar: complete ten gaps with words from a box).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): ten short numbered sentences on one everyday topic, one per line ("1. W sobotę idę z koleżanką (1) ____ kina."), each with ONE gap, or one connected text of 100–140 words with EXACTLY 10 gaps.',
      `2. ${GAP_MARKER_RULE}`,
      '3. The box: EXACTLY 11 different words, already in the form the gap needs – verbs, nouns, prepositions, adverbs, adjectives. Ten fit one gap each; ONE fits no gap. Each word is used once.',
      '4. "questions": EXACTLY 10, one per gap in order, "question" "Luka 1" … "Luka 10". EVERY question has the SAME "options": the 11 words of the box, in the same order (alphabetical), and "correctAnswer" the index 0–10 of its word. No two gaps share a word.',
      '5. Each gap has exactly one word that fits both meaning and grammar.',
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      `8. ${META_RULE} "textType": "article". "type": "cloze". "explanation" (one sentence, in Polish) says why the word fits. "title": a short Polish title.`,
    ],
    outputPrelude: PRELUDE('ReadingPlA2Zadanie2'),
    outputContract: `{
${META('article')}
  "questions": [
    { "question": "Luka 1", "options": [string, string, string, string, string, string, string, string, string, string, string], "correctAnswer": number, "explanation": string, "type": "cloze" }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Reading, Zadanie III (five public signs: where you see them or what they mean; 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): FIVE short public signs, labelled "Napis 1" … "Napis 5", each on its own line with the sign text in quotation marks ("Napis 1: „Szatnia”", "Napis 2: „Nie deptać trawników”"). A sign is 1–6 words, as in real Polish public places: shops, stations, offices, parks, hospitals, museums.',
      '2. "questions": EXACTLY 5, one per sign, "question" starting "Napis 1: " … "Napis 5: " and asking "Gdzie można zobaczyć ten napis?" or "Co oznacza ten napis?". Mix both kinds.',
      `3. ${CHOICE_RULE}`,
      `4. ${A2_LANGUAGE}`,
      `5. ${META_RULE} "textType": "notice". "type": "comprehension". "explanation" (one sentence, in Polish) explains the sign. "title": "Napisy".`,
    ],
    outputPrelude: PRELUDE('ReadingPlA2Zadanie3'),
    outputContract: `{
${META('notice')}
  "questions": [
    { "question": string, "options": [string, string, string], "correctAnswer": 0 | 1 | 2, "explanation": string, "type": "comprehension" }
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
    task: 'Your task: generate {count} unique exercises for Polish A2 Reading, Zadanie IV (five short notices and messages; 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Text ("content"): FIVE short practical texts of 20–45 words each, labelled "Tekst 1" … "Tekst 5" on their own line and separated by an empty line: an announcement in a block of flats, a note on a door, a text message, a small advertisement, a notice at school or work.',
      '2. "questions": EXACTLY 5, one per text, "question" starting "Tekst 1: " … "Tekst 5: " ("Tekst 1: Kto napisał to ogłoszenie?", "Tekst 2: Co trzeba zrobić?").',
      '3. The two wrong options reuse words from the text but change the meaning.',
      `4. ${CHOICE_RULE}`,
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      `7. ${META_RULE} "textType": "announcement". "type": "comprehension". "explanation" (one sentence, in Polish) says where the text shows the answer. "title": "Krótkie teksty".`,
    ],
    outputPrelude: PRELUDE('ReadingPlA2Zadanie4'),
    outputContract: `{
${META('announcement')}
  "questions": [
    { "question": string, "options": [string, string, string], "correctAnswer": 0 | 1 | 2, "explanation": string, "type": "comprehension" }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 5,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Reading, Zadanie V (read a first-person text and fill in ten fields of a form).',
    rules: [
      RULES_HEADER,
      '1. "content" has two parts. First, a first-person text of 120–170 words in which a named adult introduces themselves ("Nazywam się Anna Kowalska …") for a purpose: signing up for a language course, a sports club, a library, a trip, a job. Then an empty line, the form\'s title in capitals ("ANKIETA", "FORMULARZ ZGŁOSZENIOWY") and EXACTLY 10 lines "Label: (n) ____" ("Imię: (1) ____", "Wiek: (3) ____", "Zawód: (5) ____", "Zainteresowania: (9) ____").',
      `2. ${GAP_MARKER_RULE}`,
      '3. Each field is answered by a fact in the text, often in another form than the text gives it (the text says "urodziłam się w Toruniu", the field "Miejsce urodzenia" takes "Toruń"; the text says "mam trzydzieści dwa lata", the field "Wiek" takes "32"). At least three answers are numbers or dates.',
      `4. ${GAP_RULE}`,
      '5. Each accepted answer is at most 4 words. Accept the natural variants of a form entry ("Toruń", "w Toruniu"; "nauczycielka", "nauczycielka angielskiego").',
      `6. ${A2_LANGUAGE}`,
      `7. ${META_RULE} "textType": "article". "type": "gap". "question" is the field's label without the colon ("Miejsce urodzenia"). "explanation" (one sentence, in Polish) quotes the text. "title": the form's purpose in Polish.`,
    ],
    outputPrelude: PRELUDE('ReadingPlA2Zadanie5'),
    outputContract: `{
${META('article')}
  "questions": [
    { "question": string, "accepted": string[], "explanation": string, "type": "gap" }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'reading',
    part: 6,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Reading, Zadanie VI (match five scenes to six captions, one not used).',
    rules: [
      RULES_HEADER,
      '1. In the exam the scenes are pictures. Here "content" describes FIVE scenes in words, labelled "Scena 1" … "Scena 5", each on its own line, 12–25 words saying what the picture would show ("Scena 1: Mężczyzna stoi w deszczu na przystanku i patrzy na zegarek.").',
      '2. The captions: EXACTLY 6 short sentences a person in a scene could say or a title for it ("Autobus znowu się spóźnia!"). Five match one scene each; one matches none but fits the same topic.',
      '3. "questions": EXACTLY 5, one per scene in order, "question" "Scena 1" … "Scena 5". EVERY question has the SAME "options": the 6 captions, in the same order, and "correctAnswer" the index 0–5 of its caption. No two scenes share a caption.',
      '4. Keep the scenes on one theme (a day in the city, a family holiday, at work) so the learner must read the details.',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      `7. ${META_RULE} "textType": "article". "type": "matching". "explanation" (one sentence, in Polish) links the caption to the scene. "title": a short Polish title.`,
    ],
    outputPrelude: PRELUDE('ReadingPlA2Zadanie6'),
    outputContract: `{
${META('article')}
  "questions": [
    { "question": "Scena 1", "options": [string, string, string, string, string, string], "correctAnswer": number, "explanation": string, "type": "matching" }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
]
