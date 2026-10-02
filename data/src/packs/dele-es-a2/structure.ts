import type { ExamModule } from '../../types'

/**
 * DELE A2 (Diploma de Español como Lengua Extranjera, nivel A2), Instituto Cervantes, in the
 * format used since the February 2020 session. See `brief.md` for sources and the practice
 * adaptations. Modules follow the exam order; practice shows raw points.
 */
export const deleEsA2Structure: ExamModule[] = [
  {
    id: 'reading',
    label: 'Reading (Comprensión de lectura)',
    minutes: 60,
    points: 25,
    summary:
      'Four tasks: a personal letter or email, eight short ads and notices, three texts to match to statements, and a longer narrative text.',
    scoringNote:
      'Raw points, 1 per item (25). The exam counts Reading and Writing together as Grupo 1 (50 points); a candidate needs 30 in each group to pass.',
    parts: [
      {
        n: 1,
        title: 'Personal letter or email',
        format: 'Tarea 1 · 1 text · 5 questions · a · b · c',
        short: 'Read a personal letter or email and answer five questions about it.',
        goal: 'Understand the main information and details of a personal message.',
        skill: 'Reading for detail.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Ads and notices',
        format: 'Tarea 2 · 8 short texts · 1 question each · a · b · c',
        short: 'Read eight short ads, notices or posts and answer one question about each.',
        goal: 'Find specific information in short public texts.',
        skill: 'Reading for specific information.',
        itemFormat: 'selection',
      },
      {
        n: 3,
        title: 'Three texts',
        format: 'Tarea 3 · 3 texts · 6 statements · A · B · C',
        short: 'Read three short texts and decide which text each of six statements is about.',
        goal: 'Compare similar texts and find where each piece of information is.',
        skill: 'Reading for specific information.',
        itemFormat: 'matching',
      },
      {
        n: 4,
        title: 'Narrative text',
        format: 'Tarea 4 · 1 text · 6 questions · a · b · c',
        short: 'Read a longer text (a biography, a blog, a story or a travel guide) and answer six questions.',
        goal: 'Follow a longer narrative text and understand its details.',
        skill: 'Reading for detail.',
        itemFormat: 'selection',
      },
    ],
  },
  {
    id: 'listening',
    label: 'Listening (Comprensión auditiva)',
    minutes: 40,
    points: 25,
    summary:
      'Four tasks: six short conversations, six radio pieces, one conversation to match to the speakers, and seven short messages. Every recording is heard twice.',
    scoringNote:
      'Raw points, 1 per item (25). The exam counts Listening and Speaking together as Grupo 2 (50 points); a candidate needs 30 in each group to pass.',
    parts: [
      {
        n: 1,
        title: 'Short conversations',
        format: 'Tarea 1 · 6 conversations · a · b · c',
        short: 'Listen to six short everyday conversations and answer one question about each.',
        goal: 'Understand the key information of short face-to-face conversations.',
        skill: 'Listening for specific information.',
        itemFormat: 'selection',
      },
      {
        n: 2,
        title: 'Radio',
        format: 'Tarea 2 · 6 radio pieces · a · b · c',
        short: 'Listen to six short pieces from the radio – news, ads, announcements – and answer one question about each.',
        goal: 'Understand the main point of short broadcast texts.',
        skill: 'Listening for gist and detail.',
        itemFormat: 'selection',
      },
      {
        n: 3,
        title: 'Who says it?',
        format: 'Tarea 3 · 1 conversation · 6 statements · man · woman · neither',
        short: 'Listen to a conversation between two friends and decide who says each of six things: the man, the woman or neither.',
        goal: 'Follow a conversation and link information to the right speaker.',
        skill: 'Listening for specific information.',
        itemFormat: 'matching',
      },
      {
        n: 4,
        title: 'Messages',
        format: 'Tarea 4 · 7 messages · 10 statements, 3 not used',
        short: 'Listen to seven short messages and announcements and match each to what it says.',
        goal: 'Understand the purpose of short messages and announcements.',
        skill: 'Listening for gist.',
        itemFormat: 'matching',
      },
    ],
  },
  {
    id: 'writing',
    label: 'Writing (Expresión e interacción escritas)',
    minutes: 45,
    points: 12,
    summary: 'A reply to a short message (60–70 words) and a text about everyday life or a biography (70–80 words).',
    scoringNote:
      'Practice marks each task on the exam’s two scales, 0–3 each: task completion (cumplimiento de la tarea) and language use (uso de la lengua). The exam weights language use 66% and task completion 34% and converts the result to 25 points (×25/3); practice shows the raw bands, where 2 means A2 is reached.',
    parts: [
      {
        n: 1,
        title: 'Reply to a message',
        format: 'Tarea 1 · email, note or post · 60–70 words',
        short: 'Read a short message from a friend and write a reply that covers every point.',
        goal: 'Write a personal message that answers, informs and proposes.',
        skill: 'Written interaction.',
        itemFormat: 'freeform',
      },
      {
        n: 2,
        title: 'Everyday life or a biography',
        format: 'Tarea 2 · Opción A or B · 70–80 words',
        short: 'Write about an experience from your everyday life (Opción A) or a biography or story from given information (Opción B).',
        goal: 'Write a connected text about the past and the present.',
        skill: 'Written production.',
        itemFormat: 'freeform',
      },
    ],
  },
  {
    id: 'speaking',
    label: 'Speaking (Expresión e interacción orales)',
    minutes: 12,
    points: 18,
    summary:
      'A short presentation on a topic, the description of a scene, and a role-play with the examiner in that scene. The exam gives 12 minutes to prepare.',
    scoringNote:
      'Practice, from your transcript: each task on the exam’s two scales, 0–3 each: task completion and language use (18). The exam also rates the whole test globally and converts to 25 points; practice shows the raw bands, where 2 means A2 is reached.',
    parts: [
      {
        n: 1,
        title: 'Presentation',
        format: 'Tarea 1 · a topic · 5 points · monologue',
        short: 'Give a short presentation about yourself on a topic, covering the points on the card.',
        goal: 'Talk about your own life in a short, connected monologue.',
        skill: 'Spoken production.',
        itemFormat: 'recording',
      },
      {
        n: 2,
        title: 'Describe a scene',
        format: 'Tarea 2 · a scene · guide questions · monologue',
        short: 'Describe an everyday scene: the people, the place, what they are doing and how they feel.',
        goal: 'Describe people and a situation with the help of guide questions.',
        skill: 'Describing.',
        itemFormat: 'recording',
      },
      {
        n: 3,
        title: 'Role-play',
        format: 'Tarea 3 · a situation with the examiner · 4 turns',
        short: 'Act out a situation from the scene with the examiner: answer, ask and react.',
        goal: 'Take part in a simple everyday transaction or conversation.',
        skill: 'Spoken interaction.',
        itemFormat: 'recording',
        layout: 'word-cards',
      },
    ],
  },
]
