import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { A2_LANGUAGE, A2_TOPICS, AUTHOR_ROLE, CHOICE_RULE, LABEL_RULE, PRELUDE, RULES_HEADER } from './common'

const LLM = { temperature: 0.8, maxTokens: 6000 }

/** One recording per item, each with its own question: Tareas 1 and 2. */
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
}
Generate {count} new exercises as JSON.`

export const listeningPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'listening',
    part: 1,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Listening, Tarea 1 (six short face-to-face conversations; one 3-option question each).',
    rules: [
      RULES_HEADER,
      '1. Structure: EXACTLY 6 "items". Each is ONE short conversation of 50–80 words between TWO people (a man and a woman), 4–6 turns, in "transcript": everyday talk between friends or family, or a transaction in a shop, a restaurant, a station, an airport, a hotel or a doctor\'s surgery.',
      '2. "context": a short neutral line for the learner ("Conversación 1"), the same pattern for every item.',
      '3. "question": one question in Spanish that the conversation answers ("¿Qué va a comprar la mujer?", "¿Dónde van a quedar?", "¿A qué hora sale el tren?").',
      '4. In the exam the three options are pictures. Here "options" are three SHORT text labels of the kind a picture would show (1–5 words: "unas botas negras", "en la puerta del cine", "a las 10:15"). All three are mentioned or suggested in the conversation; only one answers the question.',
      `5. ${CHOICE_RULE}`,
      `6. ${LABEL_RULE}`,
      `7. ${A2_LANGUAGE}`,
      `8. ${A2_TOPICS}`,
      '9. "explanation" (one sentence, in Spanish) quotes the decisive words. "title": "Tarea 1: Conversaciones breves".',
    ],
    outputPrelude: PRELUDE('ListeningEsA2Tarea1'),
    outputContract: ITEMS_CONTRACT,
  }),
  definePrompt({
    skill: 'listening',
    part: 2,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Listening, Tarea 2 (six short radio pieces; one 3-option question each).',
    rules: [
      RULES_HEADER,
      '1. Structure: EXACTLY 6 "items". Each is ONE short radio piece of 40–60 words read by ONE speaker, in "transcript", starting with the label "Locutor:" or "Locutora:" (mix both across the six): a short news item, an extract from a programme, an advertisement, an event announcement, a traffic or weather report.',
      '2. "context": a short neutral line for the learner ("Noticia 1", "Anuncio 2" – say what kind of piece it is and its number).',
      '3. "question": one question in Spanish about the main point or one important detail ("¿Qué ofrece la tienda esta semana?", "¿Qué pasa el domingo en el parque?").',
      `4. ${CHOICE_RULE}`,
      `5. ${A2_LANGUAGE}`,
      `6. ${A2_TOPICS}`,
      '7. "explanation" (one sentence, in Spanish) quotes the decisive words. "title": "Tarea 2: Radio".',
    ],
    outputPrelude: PRELUDE('ListeningEsA2Tarea2'),
    outputContract: ITEMS_CONTRACT,
  }),
  definePrompt({
    skill: 'listening',
    part: 3,
    kind: 'generator',
    llm: LLM,
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for DELE A2 Listening, Tarea 3 (a conversation between two friends; decide who says six things: the man, the woman or neither).',
    rules: [
      RULES_HEADER,
      '1. Recording: ONE informal conversation of 225–275 words between TWO friends, a man and a woman with Spanish first names (for example Manuel and Olga), in "transcript", 10–14 turns, each on its own line starting with the speaker\'s first name and a colon. Only these two speak.',
      '2. "context": one sentence saying who is talking and about what ("Vas a escuchar una conversación entre Manuel y Olga sobre sus vacaciones.").',
      '3. "options": EXACTLY 3, in this order: the man\'s first name, the woman\'s first name, and "Ninguno de los dos" – exactly as the labels are written.',
      '4. "questions": EXACTLY 6, in the order of the conversation, each with "person" (a short statement in Spanish about something one of them says, does or thinks: "Va a trabajar en verano.", "Prefiere la montaña.") and "correctAnswer" 0 (the man), 1 (the woman) or 2 (neither). Use each answer at least once; at least one statement is true of neither – something that is mentioned but neither of them says or does.',
      '5. The statements paraphrase the conversation; they do not copy its sentences.',
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "explanation" (one sentence, in Spanish) quotes the decisive words. "title": "Tarea 3: <topic>".',
    ],
    outputPrelude: PRELUDE('ListeningEsA2Tarea3'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "options": [string, string, "Ninguno de los dos"],
  "questions": [
    { "person": string, "correctAnswer": 0 | 1 | 2, "explanation": string }
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
    task: 'Your task: generate {count} unique exercises for DELE A2 Listening, Tarea 4 (seven short messages and announcements; match each to one of ten statements, three not used).',
    rules: [
      RULES_HEADER,
      '1. Recording: SEVEN separate short messages in ONE "transcript", in order, each on its own line and 30–50 words long: answering-machine messages from friends or services, public-address announcements in a station, a shop or a school, short ads. Each message is spoken by ONE speaker and starts with that speaker\'s label ("Lucía: Hola, Pablo, soy Lucía…", "Locutora: Atención, señores pasajeros…"). Use at least two women and two men.',
      '2. The seven messages have clearly different purposes: cancelling, inviting, changing a time, asking for a call back, informing about a delay, offering a discount, reminding.',
      '3. "options": EXACTLY 10 statements in Spanish describing what a message says ("Cambian la hora de una cita.", "Hay un descuento solo hoy."), without letters. Seven match one message each; three match none but are plausible, reusing words from the messages.',
      '4. "questions": EXACTLY 7, with "person" "Mensaje 1" … "Mensaje 7" in order, and "correctAnswer" the index 0–9 of the matching statement. Each message has a DIFFERENT statement.',
      `5. ${LABEL_RULE}`,
      `6. ${A2_LANGUAGE}`,
      `7. ${A2_TOPICS}`,
      '8. "context": one sentence ("Vas a escuchar siete mensajes y avisos."). "explanation" (one sentence, in Spanish) quotes the decisive words. "title": "Tarea 4: Mensajes y avisos".',
    ],
    outputPrelude: PRELUDE('ListeningEsA2Tarea4'),
    outputContract: `{
  "title": string,
  "context": string,
  "transcript": string,
  "options": [string, string, string, string, string, string, string, string, string, string],
  "questions": [
    { "person": "Mensaje 1", "correctAnswer": number, "explanation": string }
  ]
}
Generate {count} new exercises as JSON.`,
  }),
]
