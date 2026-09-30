import type { WritingKeyExercise } from '../types'

/**
 * Original A2 Key writing seeds, one per part, in the 2020 format. Not official tasks.
 * Reading & Writing Part 6 is writing part 1 here, and Part 7 is part 2, because the writing
 * screens number their parts 1 and 2. The picture story describes its three pictures in words.
 */
export const writingKeySeeds: WritingKeyExercise[] = [
  {
    id: 'writing-key-part6-001',
    title: 'An email to your friend Alex',
    topicType: 'email',
    difficulty: 'A2',
    testingPart: 1,
    estimatedTime: 10,
    wordCount: { min: 25, max: 60 },
    category: ['Social interaction', 'Hobbies and leisure'],
    createdAt: '2026-09-29',
    description: 'You are having a birthday party and want to invite your English friend Alex.',
    task: 'You are having a party for your birthday next month. Write an email to your English friend, Alex.\nIn your email:\n– invite Alex to your party\n– say where the party will be\n– tell Alex what to bring\nWrite 25 words or more.',
    requirements: [
      'Invite Alex to your party',
      'Say where the party will be',
      'Tell Alex what to bring',
    ],
  },
  {
    id: 'writing-key-part7-001',
    title: 'A day at the beach',
    topicType: 'story',
    difficulty: 'A2',
    testingPart: 2,
    estimatedTime: 10,
    wordCount: { min: 35, max: 80 },
    category: ['Travel and holidays', 'People'],
    createdAt: '2026-09-29',
    description: 'Look at the three pictures and write the story they show.',
    task: 'Look at the three pictures. Write the story shown in the pictures.\nPicture 1: On a sunny morning, a girl and her father put bags and a big umbrella into their car.\nPicture 2: At the beach, the girl is building a sandcastle while her father sleeps under the umbrella.\nPicture 3: A big wave has knocked the sandcastle down. They are both wet and laughing.\nWrite 35 words or more.',
    requirements: ['Write about all three pictures', 'Tell the story in order', '35 words or more'],
    pictures: [
      'On a sunny morning, a girl and her father put bags and a big umbrella into their car.',
      'At the beach, the girl is building a sandcastle while her father sleeps under the umbrella.',
      'A big wave has knocked the sandcastle down. They are both wet and laughing.',
    ],
  },
]
