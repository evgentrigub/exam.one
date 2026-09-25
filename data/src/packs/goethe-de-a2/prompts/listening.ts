import { definePrompt } from '../../../assemble'
import type { PromptSpec } from '../../../types'
import { AUTHOR_ROLE, PRELUDE, RULES_HEADER } from './common'

export const listeningPrompts: PromptSpec[] = [
  definePrompt({
    skill: 'listening',
    part: 1,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercise sets for the Hören A2 module: Teil 1 (Informationen im Radio, auf dem Anrufbeantworter, bei Durchsagen verstehen).',
    rules: [
      RULES_HEADER,
      '1. Structure: each set must contain EXACTLY 5 independent situations in the "items" array.',
      '2. Context (context): a short description of the situation, for example "Sie hören den Wetterbericht im Radio" or "Sie hören eine Nachricht auf dem Anrufbeantworter".',
      '3. Audio text (transcript): a monologue (announcement, radio broadcast, answering machine). Each text is strictly about 50 words.',
      '4. Vocabulary and grammar: strictly CEFR A2. The text must sound spoken: simple sentences, natural word order, familiar everyday topics.',
      '5. Question format: exactly 1 short question per transcript.',
      '6. Answer options: EXACTLY 3 options in "options"; correctAnswer is the index of the correct one (0, 1 or 2).',
      '7. Listening skill tested (Hörstil): "selektives Hören" — the learner must catch one specific detail (a time, place, price, reason or object).',
      '8. DISTRACTORS (CRITICAL): the transcript must mention words or concepts from ALL THREE options. The wrong options must occur in the text but refer to a different time, person or situation.',
    ],
    examples: [
      `REFERENCE EXAMPLE (for style, distractors and length):
Context: "Sie hören eine Durchsage im Kaufhaus."
Transcript: "Liebe Kunden! Bitte beachten Sie unsere Sonderangebote in der Sportabteilung. Auf Tennisschuhe und Laufschuhe gibt es heute einen Rabatt von 50 Prozent. Dieses Angebot gilt nur heute. Und denken Sie daran: Morgen in der Zeit von 10.00 Uhr bis 12.00 Uhr gibt es in unserer Buchabteilung drei Krimis zu insgesamt 10 Euro. Am Montag haben wir dann Preisreduzierungen für Spielsachen. Wir freuen uns auf Ihren Besuch."
Question: "Was gibt es heute billiger?"
Options: ["Bücher.", "Spielsachen.", "Sportschuhe."]
Correct Answer: 2
Explanation: "Im Text steht, dass es heute einen Rabatt auf Tennisschuhe und Laufschuhe gibt. Bücher gibt es morgen billiger, Spielsachen am Montag."`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil1'),
    outputContract: `{
  "title": string,
  "testingPart": 1,
  "difficulty": "A2",
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
Generate {count} new sets of 5 situations as JSON. Use a different topic for each item: weather, news, railway station, airport, a message from the doctor, an invitation from a friend, a shop, a sports club.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 2,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Hören A2 module: Teil 2 (Ein zusammenhängendes Gespräch verstehen).',
    rules: [
      RULES_HEADER,
      '1. Context (context): state one overall question covering the whole exercise, for example "Was schenken die Personen?", "Wo verbringen die Personen ihren Urlaub?", "Wie kommen die Personen ins Büro?".',
      '2. Audio text (transcript): one informal dialogue between two friends, acquaintances or colleagues. The text is strictly about 220 words.',
      '3. Speaker labels (MANDATORY): EVERY turn must start with a role label and a colon, for example "Mann:" and "Frau:" (or "Herr Schmidt:" / "Frau Becker:"). Without the labels audio generation cannot assign different voices.',
      '4. Vocabulary and grammar: strictly CEFR A2. The text must sound lively and natural: "Ach so", "Na ja", "Oh je", "Wirklich?", short reactions.',
      '5. Answer options (options): an array of EXACTLY 9 short text options. In the real exam these are pictures; here we adapt them to text, for example "das Auto", "ein Buch", "der Zug".',
      '6. Questions (questions): EXACTLY 5 objects. Each object holds the name of a person or object in the "person" field, to be matched with one of the 9 options.',
      '7. MATCHING LOGIC: each of the 5 questions maps to exactly ONE unique option. The five correctAnswer values must be different indices. The remaining 4 options are distractors. All 5 person values must be mentioned in the transcript. Build the distractors around a change of mind.',
    ],
    examples: [
      `REFERENCE EXAMPLE (for style and logic):
Context: "Wie kommen die Personen normalerweise ins Büro?"
Transcript: "Frau: Hallo, Manfred! Du bist ja auch schon so früh im Büro. Mein Mann hat mich gefahren. Er bringt mich jeden Morgen mit dem Auto zur Arbeit. Zum Glück waren unsere Straßen frei von Schnee. Mann: Ach so, Frauke. Na, da hast du ja Glück gehabt! Wie kommt denn Mareike heute wohl ins Büro? Sie nimmt ja immer das Motorrad. Frau: Tja, das wird heute sicher nicht gehen. Und Andreas? Was der wohl macht? Er benutzt ja sonst immer die S-Bahn. Mann: Die hat auch Verspätung! Auch für Ralf wird es schwierig, denn er kommt ja immer mit dem Fahrrad. Frau: Und Herr Schmidt benutzt ja eigentlich die U-Bahn."
Options: ["das Auto", "der Bus", "die U-Bahn", "das Fahrrad", "zu Fuß", "die S-Bahn", "der Zug", "das Motorrad", "die Straßenbahn"]
Questions:
- person: "Frauke", correctAnswer: 0
- person: "Mareike", correctAnswer: 7
- person: "Andreas", correctAnswer: 5
- person: "Ralf", correctAnswer: 3
- person: "Herr Schmidt", correctAnswer: 2`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil2'),
    outputContract: `{
  "title": string,
  "testingPart": 2,
  "difficulty": "A2",
  "context": string,
  "transcript": string,
  "options": [string, string, string, string, string, string, string, string, string],
  "questions": [
    {
      "person": string,
      "correctAnswer": 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      "explanation": string
    }
  ]
}
Generate {count} new exercises as JSON. Dialogue topics: choosing presents, who brings what to a party, friends' weekend hobbies, holiday destinations, commuting to work, buying things for the flat.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 3,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercise sets for the Hören A2 module: Teil 3 (Einzelgespräche verstehen).',
    rules: [
      RULES_HEADER,
      '1. Structure: each set must contain EXACTLY 5 independent short dialogues in the "items" array.',
      '2. Audio text (transcript): a short dialogue between two people in an everyday situation (shop, doctor, office, home, restaurant). Each dialogue is strictly about 55 words.',
      '3. Speaker labels (MANDATORY): separate EVERY turn with a role label and a colon, for example "Mann:", "Frau:", "Arzt:", "Patient:", "Verkäuferin:". The labels are required for multi-voice TTS (male/female voice).',
      '4. Vocabulary and grammar: strictly CEFR A2. Natural conversational speech.',
      '5. Question format: 1 short question per dialogue, for example "Was kauft die Frau?", "Was tut dem Mann weh?".',
      '6. Answer options (options): EXACTLY 3 short options. In the real exam these are pictures; here generate text options, for example ["das Sofa", "der Tisch", "die Stühle"].',
      '7. Listening skill tested (Hörstil): "selektives Hören".',
      '8. NEGATION DISTRACTORS (CRITICAL): the dialogue must mention words connected to ALL THREE options. The correct answer must be settled by a negation, a change of mind or a clarification: "nein", "nicht", "kein", "schon gestern", "leider nicht", "doch lieber".',
    ],
    examples: [
      `REFERENCE EXAMPLE (for style and distractors):
Question: "Was bestellt der Herr?"
Transcript: "Kellnerin: Guten Abend! Ich bringe Ihnen sofort die Speisekarte. Gast: Nein, danke. Nicht nötig! Können Sie mir etwas empfehlen? Kellnerin: Ja, den Fisch. Der ist ganz frisch. Gast: Nein, danke. Ich habe erst gestern Fisch gegessen. Haben Sie Wiener Schnitzel? Kellnerin: Leider nicht. Gast: Schade, dann nehme ich nur einen Salat und vorher bitte die Suppe."
Options: ["Schnitzel", "Suppe", "Fisch"]
Correct Answer: 1
Explanation: "Schnitzel gibt es nicht, Fisch möchte der Gast nicht. Am Ende bestellt er Suppe."`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil3'),
    outputContract: `{
  "title": string,
  "testingPart": 3,
  "difficulty": "A2",
  "items": [
    {
      "question": string,
      "transcript": string,
      "options": [string, string, string],
      "correctAnswer": 0 | 1 | 2,
      "explanation": string
    }
  ]
}
Generate {count} new sets of 5 dialogues as JSON. Use a different topic for each item: clothes, food, appliances, a film, the doctor, transport, a present, furniture.`,
  }),
  definePrompt({
    skill: 'listening',
    part: 4,
    kind: 'generator',
    role: AUTHOR_ROLE,
    task: 'Your task: generate {count} unique exercises for the Hören A2 module: Teil 4 (Ein Radiointerview verstehen).',
    rules: [
      RULES_HEADER,
      '1. Context (context): always begins with the words "Sie hören ein Interview..." (for example "Sie hören ein Interview im Radio." or "Sie hören ein Interview in einem Podcast.").',
      '2. Audio text (transcript): a radio interview between a host and a guest. The text is strictly about 220 words.',
      '3. Speaker labels (MANDATORY): turns must be clearly separated by labels with a colon, for example "Moderator:" / "Moderatorin:" and "Frau Müller:" / "Herr Schmidt:". Every change of speaker starts a new label (required for multi-voice TTS).',
      '4. Vocabulary and grammar: strictly CEFR A2. The topic must be current and accessible: education, the internet, health, sport, the environment, work, food.',
      '5. Questions (questions): EXACTLY 5 statements (Aussagen) about the content of the text.',
      '6. Answer format: correctAnswer is a boolean, where true = Ja/Richtig and false = Nein/Falsch.',
      '7. Answer balance: among the 5 answers there must be at least two true and at least two false.',
      '8. Listening skill tested (Hörstil): "globales und detailliertes Hören" — grasping the main idea and the important details.',
      '9. DISTRACTORS (PARAPHRASE AND ANTONYMS): the statements must NOT copy the transcript word for word. Use synonyms for true. Use antonyms or a distorted fact for false.',
      '10. In every question object the "type" field is strictly "true_false".',
    ],
    examples: [
      `REFERENCE EXAMPLE (for the Ja/Nein logic):
Context: "Sie hören ein Interview."
Transcript: "Moderator: Hallo und herzlich willkommen. Wir sprechen heute über das Thema Ausbildung. Frau Möckel, kann man vorher sehen, ob der Beruf zu einem passt? Frau Möckel: Man könnte natürlich auch erstmal ein Praktikum machen, um das zu sehen. Moderator: Bekommt ein Azubi eigentlich Urlaub oder hat er Ferien, wie in der Schule? Frau Möckel: Es ist ja keine Schule mehr. Also haben die Azubis jetzt Urlaub und keine Ferien mehr. Moderator: Wie ist es mit der Bezahlung? Frau Möckel: Sie bekommen ein Gehalt. Dieses Gehalt steigt mit den Jahren."
Statements:
- "Ein Praktikum hilft bei der Berufswahl." correctAnswer: true
- "Die Azubis haben Ferien." correctAnswer: false
- "Das Ausbildungsgehalt bleibt gleich." correctAnswer: false`,
    ],
    outputPrelude: PRELUDE('ListeningExerciseA2Teil4'),
    outputContract: `{
  "title": string,
  "testingPart": 4,
  "difficulty": "A2",
  "context": string,
  "transcript": string,
  "questions": [
    {
      "statement": string,
      "correctAnswer": boolean,
      "explanation": string,
      "type": "true_false"
    }
  ]
}
Generate {count} new exercises as JSON. Possible topics: life without a car, online shopping, foreign languages, healthy eating, sport in the city, studying after school.`,
  }),
]
