import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import {
  AUTHOR_ROLE,
  JSON_ONLY,
  RULES_HEADER,
  SPEAKING_EXAMINER_ROLE,
  TEACHER_ROLE,
} from './common'

export const speakingPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'generator',
    llm: { temperature: 0.8, maxTokens: 2000 },
    role: AUTHOR_ROLE,
    task: 'Task: generate {count} independent exercises for the Sprechen A2 part: Teil 1 (Gespräch zur Kontaktaufnahme).',
    rules: [
      RULES_HEADER,
      '1. Practice format: for each exercise generate 1 overall theme (theme), exactly 4 ready-made questions the learner answers (answerQuestions), and exactly 4 ready-made questions the learner asks aloud (askQuestions).',
      '2. What this part tests: asking and answering simple questions about a person and their habits.',
      '3. Themes (theme): everyday ones. Possible themes: "Fragen zur Person", "Alltag", "Wochenende", "Hobby", "Arbeit", "Sprachen lernen".',
      '4. All questions must be short, natural, at CEFR A2 and use Du-Form. The two lists must not repeat each other.',
      '5. answerQuestions: partner questions the learner can answer in 1–2 full sentences.',
      '6. askQuestions: questions the learner has to say aloud clearly and grammatically correctly.',
      '7. topicType: always the exact string "interview".',
    ],
    outputPrelude: `OUTPUT FORMAT: a valid JSON array matching the SpeakingTopicA2Teil1 interface. ${JSON_ONLY}`,
    outputContract: `{
  "topicType": "interview",
  "theme": "Fragen zur Person",
  "answerQuestions": ["Wie heißt du?", "Woher kommst du?", "Wo wohnst du jetzt?", "Welche Sprachen sprichst du?"],
  "askQuestions": ["Wie alt bist du?", "Was machst du beruflich?", "Hast du Geschwister?", "Was ist dein Lieblingsessen?"]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'generator',
    llm: { temperature: 0.8, maxTokens: 2000 },
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the spoken Sprechen A2 part: Teil 2 (Über sich sprechen).',
    rules: [
      RULES_HEADER,
      '1. Format: for each exercise generate one main theme question (theme) and exactly 4 prompt words (keywords).',
      "2. Themes (theme): the main question must concern the candidate's own life. Possible topics: family, housing, daily routine, weekends, holidays, shopping, hobbies, work or study.",
      '3. Prompt words (keywords): 4 short words or mini-questions that help the learner build a monologue (for example "Sport?", "mit wem?", "Sonntagabend?", "lange schlafen?").',
      '4. topicType: always the exact string "monologue".',
    ],
    outputPrelude: `OUTPUT FORMAT: a valid JSON array matching the SpeakingTopicA2Teil2 interface. ${JSON_ONLY}`,
    outputContract: `{
  "topicType": "monologue",
  "theme": "Was machen Sie in Ihrer Freizeit?",
  "keywords": ["Sich ausruhen?", "Sport?", "Ausgehen?", "Mit wem?"]
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'answer',
    role: TEACHER_ROLE,
    task: 'You previously generated the following exercise for the spoken part (Sprechen Teil 1):\n{task}\n\nYOUR TASK: generate one exemplary spoken answer (a dialogue script) for this exercise.',
    rules: [
      'Answer all 4 questions from answerQuestions in full sentences and add one relevant detail to each.',
      'Then say all 4 questions from askQuestions grammatically correctly and naturally, using Du-Form.',
      'Do not add replies from an imaginary partner: the example must match two independent learner recordings.',
      'The speech must sound natural for CEFR A2, not like a written essay.',
    ],
    outputContract: `{
  "topicId": "{topicId}",
  "content": "Antworten:\\n1. ...\\n\\nFragen:\\n1. ...",
  "wordCount": 80,
  "highlights": {
    "greeting": "the opening words",
    "mainPoints": ["why the answer is exemplary"],
    "closing": "a short close to the exercise",
    "keyPhrases": ["the key conversational phrases"]
  }
}
Do not change topicId. ${JSON_ONLY}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'answer',
    role: TEACHER_ROLE,
    task: 'You previously generated the following exercise for the spoken part (Sprechen Teil 2 — monologue):\n{task}\n\nYOUR TASK: generate one exemplary spoken answer (monologue plus examiner questions) for this exercise.',
    rules: [
      'First the candidate delivers a connected monologue (about 40–60 words) covering all 4 prompt words. Then the examiner asks 1–2 follow-up questions.',
      'The candidate speaks in full sentences in the first person. Use simple connectors (und, oder, aber, danach, deshalb).',
      'The speech must sound authentic for A2; Also and Naja are acceptable.',
      'The examiner addresses the candidate with Sie.',
    ],
    outputContract: `{
  "topicId": "{topicId}",
  "content": "Kandidat: ...\\nPrüfer: ...\\nKandidat: ...",
  "wordCount": 60,
  "highlights": {
    "greeting": "the opening word",
    "mainPoints": ["why the answer is exemplary"],
    "closing": "the response to the examiner's questions",
    "keyPhrases": ["the key conversational phrases"]
  }
}
Do not change topicId. ${JSON_ONLY}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 1,
    kind: 'review',
    role: SPEAKING_EXAMINER_ROLE,
    task: `Assess the independent written adaptation of Teil 1. Judge only what is visible in the STT transcripts; do not assess pronunciation.

Feedback language: {outputLanguage}.
Write every comment, strengths entry, improvements entry and the summary in that language.

Theme: {theme}
Questions to be answered:
{answerQuestions}

Transcript of the answers:
{answers}

Questions the learner has to ask:
{askQuestions}

Transcript of the questions asked:
{questions}`,
    rules: [
      'A maximum of 4 raw points.',
      'answers, Label "Answers", 0–2 points: all four questions answered intelligibly in simple full A2 sentences.',
      'questions, Label "Questions", 0–2 points: all four questions recognisable, intelligible and grammatically formed as questions.',
      'Set maxPoints = 4 and return exactly the two criteria answers and questions, each with maxPoints 2. totalPoints is their sum.',
      'All points are integers within their own maximum. No Markdown and no text outside the JSON object.',
    ],
    outputContract: `{
  "totalPoints": 0,
  "maxPoints": 4,
  "criteria": [
    { "id": "answers", "label": "Answers", "points": 0, "maxPoints": 2, "comment": "..." },
    { "id": "questions", "label": "Questions", "points": 0, "maxPoints": 2, "comment": "..." }
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "..."
}`,
  }),
  definePrompt({
    skill: 'speaking',
    part: 2,
    kind: 'review',
    role: SPEAKING_EXAMINER_ROLE,
    task: `Assess the written transcription of the Teil 2 monologue. Judge only what is visible in the transcript; do not assess pronunciation.

Feedback language: {outputLanguage}.
Write every comment, strengths entry, improvements entry and the summary in that language.

Theme: {theme}
The four prompt points:
{keywords}

STT transcript:
{monologue}`,
    rules: [
      'A maximum of 8 raw points.',
      'taskCompletion, Label "Task completion", 0–4 points: coverage of the four prompt points, intelligibility and a reasonably connected monologue.',
      'language, Label "Language", 0–4 points: appropriate A2 vocabulary, simple grammatical structures and connectors (und, aber, deshalb). Minor spoken errors are acceptable as long as the utterance stays intelligible.',
      'Set maxPoints = 8 and return exactly the two criteria taskCompletion and language, each with maxPoints 4. totalPoints is their sum.',
      'All points are integers. No Markdown and no text outside the JSON object.',
    ],
    outputContract: `{
  "totalPoints": 0,
  "maxPoints": 8,
  "criteria": [
    { "id": "taskCompletion", "label": "Task completion", "points": 0, "maxPoints": 4, "comment": "..." },
    { "id": "language", "label": "Language", "points": 0, "maxPoints": 4, "comment": "..." }
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "..."
}`,
  }),
]
