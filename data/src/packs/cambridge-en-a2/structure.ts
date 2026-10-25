import type { ExamModule } from '../../types'

/**
 * Cambridge English A2 Key (2020 format), per the A2 Key Handbook for teachers (2024) and
 * *The Cambridge English Scale explained*. See `brief.md` for sources and the practice
 * adaptations. Practice shows raw marks; conversions below are Cambridge's rough guides for
 * practice tests.
 */
export const cambridgeEnA2Structure: ExamModule[] = [
  {
    id: 'reading',
    label: 'Reading',
    minutes: 40,
    points: 30,
    summary:
      'Five parts: short notices, matching questions to three texts, a longer article, and two gapped texts.',
    scoringNote:
      'Raw marks, 1 per item (30). In practice tests about 20/30 is Cambridge English Scale 120 (Grade C) and 28/30 is 140 (Grade A).',
    parts: [
      {
        n: 1,
        title: 'Short texts',
        format: '6 notices and messages · A · B · C',
        short: 'Read six short notices and messages and choose what each one says.',
        goal: 'Understand the main message of signs, notes and short emails.',
        skill: 'Reading short real-world texts.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Three texts',
        format: '7 questions · match to text A · B · C',
        short: 'Read three short texts on one topic and decide which text answers each question.',
        goal: 'Find specific information and detail across three texts.',
        skill: 'Scanning and multiple matching.',
        itemFormat: 'matching',
      },
      {
        n: 3,
        title: 'Longer text',
        format: '5 × multiple choice (A · B · C)',
        short: 'Read a magazine article and answer five questions.',
        goal: 'Understand the main ideas and details of a longer text.',
        skill: 'Detailed reading.',
        itemFormat: 'selection',
      },
      {
        n: 4,
        title: 'Multiple-choice cloze',
        format: '6 gaps · choose A · B · C',
        short: 'Choose the right word for each of the six gaps in a short factual text.',
        goal: 'Use the right word in context: vocabulary and some grammar.',
        skill: 'Vocabulary in context.',
        itemFormat: 'selection',
      },
      {
        n: 5,
        title: 'Open cloze',
        format: '6 gaps · write one word',
        short: 'Write one word in each of the six gaps in an email.',
        goal: 'Use grammar words correctly: prepositions, pronouns, verbs and linkers.',
        skill: 'Grammar and structure.',
        itemFormat: 'gap-fill',
      },
    ],
  },
  {
    id: 'writing',
    label: 'Writing',
    minutes: 20,
    points: 30,
    summary: 'Write a short email or note (Part 6) and a short story from three pictures (Part 7).',
    scoringNote:
      'Each task: Content, Organisation and Language, 0–5 each (15). In practice tests about 18/30 is Scale 120 and 26/30 is 140.',
    parts: [
      {
        n: 1,
        title: 'Email or note',
        format: 'Reading & Writing Part 6 · 25+ words · 3 points',
        short: 'Write an email or note of 25 words or more that covers all three points.',
        goal: 'Write a short everyday message that gives all the information asked for.',
        skill: 'Guided writing.',
        itemFormat: 'freeform',
      },
      {
        n: 2,
        title: 'Picture story',
        format: 'Reading & Writing Part 7 · 35+ words · 3 pictures',
        short: 'Write a short story of 35 words or more about three pictures.',
        goal: 'Tell a simple connected story about all three pictures.',
        skill: 'Narrative writing.',
        itemFormat: 'freeform',
      },
    ],
  },
  {
    id: 'listening',
    label: 'Listening',
    minutes: 30,
    points: 25,
    summary:
      'Short conversations, a talk with notes to complete, a longer conversation, short recordings and a matching task. Each recording is heard twice.',
    scoringNote:
      'Raw marks, 1 per item (25). In practice tests about 17/25 is Scale 120 and 23/25 is 140.',
    parts: [
      {
        n: 1,
        title: 'Short conversations',
        format: '5 × multiple choice (A · B · C)',
        short: 'Five short conversations, one question each.',
        goal: 'Catch key information: times, prices, places, things.',
        skill: 'Listening for specific information.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Notes',
        format: '5 gaps · a word, number, date or time',
        short: 'Listen to a talk and complete five notes.',
        goal: 'Write down key facts, including spelled names and numbers.',
        skill: 'Note-taking.',
        itemFormat: 'gap-fill',
      },
      {
        n: 3,
        title: 'Longer conversation',
        format: '5 × multiple choice (A · B · C)',
        short: 'Listen to two people talking and answer five questions.',
        goal: 'Follow a conversation, including what each speaker thinks.',
        skill: 'Listening for detail and opinion.',
        itemFormat: 'selection',
      },
      {
        n: 4,
        title: 'Short recordings',
        format: '5 × multiple choice (A · B · C)',
        short: 'Five short recordings, one question each about the main idea.',
        goal: 'Understand the main point, reason or feeling in a short recording.',
        skill: 'Listening for gist.',
        itemFormat: 'selection',
      },
      {
        n: 5,
        title: 'Matching',
        format: '5 items · 8 options, 3 not used',
        short: 'Listen to a conversation and match five people to the right option.',
        goal: 'Follow a conversation closely and match information.',
        skill: 'Listening for specific information.',
        itemFormat: 'matching',
      },
    ],
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 10,
    points: 30,
    summary: 'Answer the examiner’s questions about yourself, then discuss a set of pictures.',
    scoringNote:
      'Practice: Grammar and Vocabulary, Interactive Communication and Global Achievement, 0–5 each per part, from your transcript. The exam also marks Pronunciation and weights the scales to 45 marks; about 27/45 is Scale 120.',
    parts: [
      {
        n: 1,
        title: 'Interview',
        format: 'Examiner questions · 5 answers',
        short: 'Answer the examiner’s questions about yourself and an everyday topic.',
        goal: 'Give personal information and talk a little about everyday topics.',
        skill: 'Answering questions.',
        itemFormat: 'recording',
        layout: 'word-cards',
      },
      {
        n: 2,
        title: 'Discussion',
        format: 'Pictures · opinions · follow-up questions',
        short:
          'Say what you think about some activities, ask your partner, and answer follow-up questions.',
        goal: 'Give and ask for opinions, and say what you prefer and why.',
        skill: 'Discussing likes and preferences.',
        itemFormat: 'recording',
        layout: 'word-cards',
      },
    ],
  },
]
