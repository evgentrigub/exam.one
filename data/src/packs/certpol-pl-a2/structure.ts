import type { ExamModule } from '../../types'

/**
 * Państwowy egzamin certyfikatowy z języka polskiego jako obcego, level A2 (adults), per the
 * official 2018 A2 sample test and Dz.U. 2025 poz. 217. See `brief.md` for sources and the
 * practice adaptations. Modules follow the exam order; practice shows raw points.
 */
export const certpolPlA2Structure: ExamModule[] = [
  {
    id: 'listening',
    label: 'Listening (Rozumienie ze słuchu)',
    minutes: 25,
    points: 30,
    summary:
      'Five tasks: who is speaking and where, a radio announcement, a dialogue, phone messages and numbers to write down. Every recording is heard twice.',
    scoringNote:
      'Raw points, 1 per item (30). The written part (listening, reading and writing, 80 points) is passed with 50% of its total; there is no minimum per module at A2.',
    parts: [
      {
        n: 1,
        title: 'Who is speaking? Where?',
        format: 'Zadanie I · 10 short recordings · a · b · c',
        short: 'Listen to ten short recordings and decide who is speaking or where you hear them.',
        goal: 'Recognise the speaker and the situation of short everyday utterances.',
        skill: 'Listening for the situation.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Radio announcement',
        format: 'Zadanie II · 5 × prawda / fałsz',
        short: 'Listen to a radio announcement and decide if five sentences are true or false.',
        goal: 'Understand the key facts of a public announcement.',
        skill: 'Listening for detail.',
        itemFormat: 'true-false',
      },
      {
        n: 3,
        title: 'Dialogue',
        format: 'Zadanie III · 5 people · 7 options, 2 not used',
        short: 'Listen to a conversation and match five people to what they do.',
        goal: 'Follow a conversation and link information to the right person.',
        skill: 'Listening for specific information.',
        itemFormat: 'matching',
      },
      {
        n: 4,
        title: 'Phone messages',
        format: 'Zadanie IV · 5 messages · 6 options, 1 not used',
        short: 'Listen to five answering-machine messages and match each one to what it says.',
        goal: 'Understand the purpose of short phone messages.',
        skill: 'Listening for gist.',
        itemFormat: 'matching',
      },
      {
        n: 5,
        title: 'Numbers',
        format: 'Zadanie V · 5 gaps · a date, number, time or year',
        short:
          'Listen to an announcement and write down five numbers: dates, times, prices and years.',
        goal: 'Catch and write down numbers you hear.',
        skill: 'Note-taking.',
        itemFormat: 'gap-fill',
      },
    ],
  },
  {
    id: 'reading',
    label: 'Reading and grammar (Rozumienie tekstów pisanych)',
    minutes: 45,
    points: 30,
    summary:
      'Six tasks: choosing the correct form, words from a box, public signs, short notices, a form to fill in and captions to match.',
    scoringNote:
      'Raw points (30): 0.5 per gap in tasks I, II and V, 1 per item in tasks III, IV and VI. Grammar is part of this module at A2.',
    parts: [
      {
        n: 1,
        title: 'The correct form',
        format: 'Zadanie I · 10 gaps · choose 1 of 3 forms · 0.5 each',
        short: 'Choose the correct grammatical form for each of the ten gaps in a text.',
        goal: 'Use the right case, verb form and word form in context.',
        skill: 'Grammar in context.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Words from a box',
        format: 'Zadanie II · 10 gaps · 11 words, 1 not used · 0.5 each',
        short: 'Complete ten sentences with words from a box.',
        goal: 'Choose the word that fits the meaning and the grammar of the sentence.',
        skill: 'Vocabulary and grammar.',
        itemFormat: 'matching',
      },
      {
        n: 3,
        title: 'Public signs',
        format: 'Zadanie III · 5 signs · a · b · c',
        short: 'Read five public signs and choose where you see them or what they mean.',
        goal: 'Understand the signs and short notices of everyday places.',
        skill: 'Reading short real-world texts.',
        itemFormat: 'selection',
      },
      {
        n: 4,
        title: 'Short notices',
        format: 'Zadanie IV · 5 notices · a · b · c',
        short: 'Read five short notices and messages and choose the correct answer.',
        goal: 'Understand the main information of short practical texts.',
        skill: 'Reading for specific information.',
        itemFormat: 'selection',
      },
      {
        n: 5,
        title: 'Fill in a form',
        format: 'Zadanie V · a text and a form · 10 gaps · 0.5 each',
        short: 'Read what a person writes about themselves and fill in ten fields of a form.',
        goal: 'Find personal information in a text and write it down correctly.',
        skill: 'Reading for detail.',
        itemFormat: 'gap-fill',
      },
      {
        n: 6,
        title: 'Captions',
        format: 'Zadanie VI · 5 scenes · 6 captions, 1 not used',
        short: 'Match five scenes to the captions that describe them.',
        goal: 'Connect a short description to the situation it shows.',
        skill: 'Reading for meaning.',
        itemFormat: 'matching',
      },
    ],
  },
  {
    id: 'writing',
    label: 'Writing (Pisanie)',
    minutes: 45,
    points: 20,
    summary:
      'A short text (a greeting or a message) and a longer text (a description or a letter).',
    scoringNote:
      'Officially one set of two tasks, scored together: task completion 6, range of language 7, accuracy 7 (20). Practice scores each task on the same criteria: 2/2/2 and 4/5/5.',
    parts: [
      {
        n: 1,
        title: 'Short text',
        format: 'Zadanie a · greeting or message · 10–30 words',
        short: 'Write a short greeting or text message for an everyday occasion.',
        goal: 'Write a short personal message that does what the task asks.',
        skill: 'Short functional writing.',
        itemFormat: 'freeform',
      },
      {
        n: 2,
        title: 'Longer text',
        format: 'Zadanie b · description or letter · 70–100 words',
        short: 'Write a description of a person, a place or an event, or a short private letter.',
        goal: 'Write a connected text that covers every guiding point.',
        skill: 'Descriptive writing.',
        itemFormat: 'freeform',
      },
    ],
  },
  {
    id: 'speaking',
    label: 'Speaking (Mówienie)',
    minutes: 15,
    points: 36,
    summary:
      'Answer the examiner’s questions about yourself, describe a person in a photo, and act out a situation with the examiner.',
    scoringNote:
      'Practice, from your transcript: task completion 4 + 10 + 10 and vocabulary and grammar 6 each, split across the tasks (36). The exam also marks pronunciation (0–4) for 40 points and is passed with 50% (20).',
    parts: [
      {
        n: 1,
        title: 'About you',
        format: 'Zadanie 1 · examiner questions · 4 answers',
        short:
          'Answer the examiner’s questions about yourself, your family, your interests and your work or studies.',
        goal: 'Give simple personal information in full sentences.',
        skill: 'Answering questions.',
        itemFormat: 'recording',
        layout: 'word-cards',
      },
      {
        n: 2,
        title: 'Describe a photo',
        format: 'Zadanie 2 · a person in a photo · monologue',
        short:
          'Describe the person in a photo: who it is, what they look like, what they are doing.',
        goal: 'Describe a person and a situation in a short connected monologue.',
        skill: 'Describing.',
        itemFormat: 'recording',
      },
      {
        n: 3,
        title: 'Role-play',
        format: 'Zadanie 3 · a situation with the examiner · 4 turns',
        short:
          'Act out an everyday situation: start the conversation, then react to what the examiner says.',
        goal: 'Invite, suggest, arrange and react in a simple everyday conversation.',
        skill: 'Interaction.',
        itemFormat: 'recording',
        layout: 'word-cards',
      },
    ],
  },
]
