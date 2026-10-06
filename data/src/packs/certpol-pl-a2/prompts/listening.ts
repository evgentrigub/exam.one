import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  A2_LANGUAGE,
  A2_TOPICS,
  AUTHOR_ROLE,
  CHOICE_RULE,
  GAP_MARKER_RULE,
  GAP_RULE,
  LABEL_RULE,
  PRELUDE,
  RULES_HEADER,
} from './common'

const LLM = { temperature: 0.8, maxTokens: 5000 }

export const listeningPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'listening',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Listening, Zadanie I (ten short recordings: who is speaking, and where it is said; 3-option multiple choice).',
    rules: [
      RULES_HEADER,
      '1. Structure: EXACTLY 10 "items". Each is ONE short utterance by ONE speaker (1–3 sentences, 12–35 words) in "transcript", starting with the speaker\'s label ("Kobieta: …", "Mężczyzna: …", "Kelner: …").',
      '2. Items 1–4: "question" is "Kto mówi?". The options are three people or jobs ("lekarz", "kelner", "sprzedawca"); the utterance shows who speaks without naming the job. Use the neutral label "Kobieta" or "Mężczyzna", never the answer as the label.',
      '3. Items 5–10: "question" is "Gdzie to słyszymy?". The options are three places ("w sklepie", "na dworcu", "w restauracji"); the utterance shows the place without naming it.',
      '4. "context": a short neutral line for the learner ("Nagranie 1"), the same pattern for every item.',
      `5. ${CHOICE_RULE}`,
      '6. Mix women and men across the ten items.',
      `7. ${A2_LANGUAGE}`,
      `8. ${A2_TOPICS}`,
      '9. "explanation" (one sentence, in Polish) names the words that show the answer. "title": "Zadanie I: Kto mówi? Gdzie?".',
    ],
    outputPrelude: PRELUDE('ListeningPlA2Zadanie1'),
    outputContract: `{
  "title": string,
  "items": [
    {
      "context": string,
      "transcript": string,
      "question": "Kto mówi?" | "Gdzie to słyszymy?",
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string
    }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Listening, Zadanie II (a radio announcement and five true/false sentences).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE radio announcement of 120–170 words in "transcript", read by one speaker and starting with "Spiker:" – an event, a festival, a change in public transport, opening hours, a weather or travel notice.',
      '2. "context": one sentence introducing it ("Usłyszysz komunikat w radiu o festiwalu w Gdańsku.").',
      '3. Questions: EXACTLY 5 statements in "question", in the order of the recording. Each question has "options": ["Prawda", "Fałsz"] exactly, and "correctAnswer" 0 for true and 1 for false. Two or three are false; a false statement changes one detail (a day, a place, a price).',
      '4. Use the key "question", never "statement". Do NOT add a top-level "options" field.',
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. "explanation" (one sentence, in Polish) quotes what the speaker says. "title": "Zadanie II: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningPlA2Zadanie2'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "questions": [
    { "question": string, "options": ["Prawda", "Fałsz"], "correctAnswer": 0 | 1, "explanation": string }
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
    task: 'Your task: generate {count} unique exercises for Polish A2 Listening, Zadanie III (a dialogue; match five people to seven options, two not used).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE conversation of 180–250 words between two people who know each other, in "transcript", 8–12 turns, each on its own line.',
      '2. "context": one sentence saying who is talking and what to match ("Usłyszysz rozmowę Kasi i Tomka o tym, jaki sport uprawiają ich znajomi.").',
      '3. In the exam the options are pictures. Here "options" are EXACTLY 7 short text labels from one set (sports, jobs, presents, hobbies, places), 1–3 words each, without letters.',
      '4. "questions": EXACTLY 5, each with "person" (a person talked about: "brat Kasi", "Ola", "pan Nowak") in the order they are discussed, and "correctAnswer" the index 0–6 of their option. Each person has a DIFFERENT option.',
      '5. The two unused options are also mentioned in the conversation (as a past hobby, a plan that changed, someone else), so the learner must listen carefully.',
      `6. ${LABEL_RULE}`,
      `7. ${A2_LANGUAGE}`,
      '8. "explanation" (one sentence, in Polish) quotes the decisive words. "title": "Zadanie III: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningPlA2Zadanie3'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "options": [string, string, string, string, string, string, string],
  "questions": [
    { "person": string, "correctAnswer": number, "explanation": string }
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
    task: 'Your task: generate {count} unique exercises for Polish A2 Listening, Zadanie IV (five answering-machine messages; match each to one of six statements, one not used).',
    rules: [
      RULES_HEADER,
      '1. Recording: FIVE separate phone messages in ONE "transcript", in order, each on its own line and 25–45 words long. Each message is spoken by its caller and starts with the caller\'s label ("Kasia: Cześć Ola, tu Kasia …", "Pani Nowak: Dzień dobry, …"). Use at least one man and one woman, and five different callers.',
      '2. The messages have clearly different purposes: cancelling, inviting, asking for help, changing a time, thanking, asking someone to call back, reminding.',
      '3. "options": EXACTLY 6 statements in Polish describing a purpose ("Ktoś zmienia godzinę spotkania."), without letters. Five match one message each; one matches none.',
      '4. "questions": EXACTLY 5, with "person" "Wiadomość 1" … "Wiadomość 5" in order, and "correctAnswer" the index 0–5 of the matching statement. Each message has a DIFFERENT statement.',
      `5. ${LABEL_RULE}`,
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "context": one sentence ("Usłyszysz pięć wiadomości nagranych na sekretarce."). "explanation" (one sentence, in Polish) quotes the decisive words. "title": "Zadanie IV: Wiadomości na sekretarce".',
    ],
    outputPrelude: PRELUDE('ListeningPlA2Zadanie4'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "options": [string, string, string, string, string, string],
  "questions": [
    { "person": "Wiadomość 1", "correctAnswer": number, "explanation": string }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 5,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for Polish A2 Listening, Zadanie V (an announcement; write down five numbers).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE announcement or piece of information of 120–170 words in "transcript", read by one speaker and starting with "Spiker:" – a museum, a trip, a course, a concert, a sports event, a shop opening.',
      '2. The numbers are spoken in words, as a speaker says them ("dwudziestego piątego czerwca", "o siedemnastej trzydzieści", "czterdzieści pięć złotych"). Exactly five numbers are asked for: a date, a time, a price, a number of people or an age, a year or a phone number – at least four different kinds.',
      '3. "content": a title line, an empty line, then EXACTLY 5 note lines in the order of the recording, each "Label: (n) ____", for example "Data koncertu: (1) ____", "Cena biletu: (2) ____ zł".',
      `4. ${GAP_MARKER_RULE}`,
      `5. ${GAP_RULE}`,
      '6. Each accepted answer is at most 4 words. For a date list the day with the month in words and in digits; for a year list "2019" and "2019 r."; for a time on the 24-hour clock list the digits in its common spellings.',
      `7. ${A2_LANGUAGE}`,
      '8. "context": one sentence ("Usłyszysz informację o koncercie w parku."). "question" is the note\'s label without the colon ("Data koncertu"). "explanation" (one sentence, in Polish) quotes what the speaker says. "title": "Zadanie V: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningPlA2Zadanie5'),
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
]
