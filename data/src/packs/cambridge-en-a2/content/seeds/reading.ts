import type { ReadingKeyExercise, ReadingKeyGap, ReadingKeyQuestion } from '../types'

type Row = Omit<ReadingKeyQuestion, 'id' | 'textId' | 'type'>
type GapRow = Omit<ReadingKeyGap, 'id' | 'textId' | 'type'>

/** Stamp the ids and question type the reading screen and scoring expect. */
function questions(textId: string, type: ReadingKeyQuestion['type'], rows: Row[]): ReadingKeyQuestion[] {
  return rows.map((row, index) => ({ ...row, id: `${textId}-q${index + 1}`, textId, type }))
}

function gaps(textId: string, rows: GapRow[]): ReadingKeyGap[] {
  return rows.map((row, index) => ({ ...row, id: `${textId}-q${index + 1}`, textId, type: 'gap' }))
}

const WHO = ['Lucia', 'Marco', 'Hana']

/** Original A2 Key reading seeds, one per part, in the 2020 format. Not official tasks. */
export const readingKeySeeds: ReadingKeyExercise[] = [
  {
    id: 'reading-key-part1-001',
    title: 'Signs and messages',
    content: [
      '1 · On a café door',
      '"Sorry, the café is closed this afternoon for a private party. We open again at 8 a.m. tomorrow."',
      '',
      '2 · A text message',
      '"Hi Tom, I\'ve missed the 6.15 bus. I\'ll get the next one and meet you outside the cinema at 7, not inside. Ella"',
      '',
      '3 · At the sports centre',
      '"Towels are not provided – please bring your own. Lockers need a £1 coin, which you get back."',
      '',
      '4 · An email',
      '"Dear parents, the school trip on Friday will leave at 8.30, not 9.00. Please make sure your child has a packed lunch. Mrs Hall"',
      '',
      '5 · In a bookshop window',
      '"Second-hand books: buy two and get a third one free. This week only."',
      '',
      '6 · On a notice board',
      '"Guitar for sale – used for one year, comes with case. £60 or best offer. Call Sam after 6 p.m."',
    ].join('\n'),
    textType: 'notice',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 120,
    topics: ['Daily life', 'Shopping', 'Social interaction'],
    createdAt: '2026-09-29',
    questions: questions('reading-key-part1-001', 'comprehension', [
      {
        question: 'Text 1: What does the notice say?',
        options: [
          'You can have dinner at the café this evening.',
          'The café will be open again tomorrow morning.',
          'The café is having a party for all its customers.',
        ],
        correctAnswer: 1,
        explanation: 'The café is closed this afternoon and opens again "at 8 a.m. tomorrow".',
      },
      {
        question: 'Text 2: What does Ella want Tom to do?',
        options: [
          'wait for her at the bus stop',
          'go into the cinema without her',
          'meet her in front of the cinema',
        ],
        correctAnswer: 2,
        explanation: 'Ella writes "meet you outside the cinema at 7, not inside".',
      },
      {
        question: 'Text 3: At the sports centre,',
        options: [
          'you have to pay to use a towel.',
          'you need a coin to use a locker.',
          'you can buy coins for the lockers.',
        ],
        correctAnswer: 1,
        explanation: 'Lockers need a £1 coin, and you get it back afterwards.',
      },
      {
        question: 'Text 4: Mrs Hall is writing to tell parents that',
        options: [
          'the trip will start earlier than planned.',
          'the children will get lunch on the trip.',
          'the trip is now on a different day.',
        ],
        correctAnswer: 0,
        explanation: 'The trip leaves at 8.30 instead of 9.00; the children must bring their own lunch.',
      },
      {
        question: 'Text 5: What does the notice say?',
        options: [
          'All the books in the shop are free this week.',
          'If you pay for two books, you get another one for nothing.',
          'The shop is selling new books at lower prices.',
        ],
        correctAnswer: 1,
        explanation: '"Buy two and get a third one free" – the offer is for second-hand books.',
      },
      {
        question: 'Text 6: What do we learn about the guitar?',
        options: [
          'Sam has had it for a long time.',
          'It comes with something to carry it in.',
          'Sam will only sell it for exactly £60.',
        ],
        correctAnswer: 1,
        explanation: 'The guitar "comes with case"; the price is "£60 or best offer".',
      },
    ]),
  },
  {
    id: 'reading-key-part2-001',
    title: 'Learning a new language',
    content: [
      'A: Lucia',
      'I started learning Japanese two years ago because my company works with a team in Tokyo. I have a lesson online every Tuesday evening, but I also practise with an app on my phone on the train to work. Grammar is quite easy for me, but writing the characters is still very hard. Next spring I\'m going to visit my colleagues in Japan for the first time.',
      '',
      'B: Marco',
      'I\'m learning English at an evening class in my town. There are twelve of us and we all come from different countries, so English is the only language we can use together! Our teacher often gives us games to play, and I\'ve made some good friends in the class. I\'d like to take an exam at the end of the year, but I\'m worried about the speaking part.',
      '',
      'C: Hana',
      'My grandmother is from Portugal, so I decided to learn Portuguese to talk to her. I don\'t go to classes – I watch films with subtitles and read children\'s books. My grandmother gave me my first dictionary for my birthday. When I phone her now, we only speak Portuguese, and she says my pronunciation is getting better.',
    ].join('\n'),
    textType: 'article',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 230,
    topics: ['Language', 'School and study', 'People'],
    createdAt: '2026-09-29',
    questions: questions('reading-key-part2-001', 'matching', [
      { question: 'Who is learning the language for their job?', options: WHO, correctAnswer: 0, explanation: 'Lucia\'s company works with a team in Tokyo.' },
      { question: 'Who is studying without a teacher?', options: WHO, correctAnswer: 2, explanation: 'Hana doesn\'t go to classes; she watches films and reads books.' },
      { question: 'Who is nervous about a test?', options: WHO, correctAnswer: 1, explanation: 'Marco wants to take an exam but is worried about the speaking part.' },
      { question: 'Who practises while travelling?', options: WHO, correctAnswer: 0, explanation: 'Lucia uses an app on the train to work.' },
      { question: 'Who was given a present to help them learn?', options: WHO, correctAnswer: 2, explanation: 'Hana\'s grandmother gave her a dictionary for her birthday.' },
      { question: 'Who has made new friends while learning?', options: WHO, correctAnswer: 1, explanation: 'Marco has made some good friends in his class.' },
      { question: 'Who is planning a trip abroad?', options: WHO, correctAnswer: 0, explanation: 'Lucia will visit her colleagues in Japan next spring.' },
    ]),
  },
  {
    id: 'reading-key-part3-001',
    title: 'My summer job at the zoo',
    content: [
      'My summer job at the zoo – by Anna Price',
      '',
      'Last summer, I got a job at Greenfield Zoo. I\'m studying biology at university, so I thought it would be interesting to work with animals for a few weeks.',
      'On my first day, I was a bit disappointed. I hoped to feed the lions, but my manager, Tony, asked me to clean the café tables and help in the gift shop. "Everyone starts there," he said. "You need to learn how the zoo works first."',
      'After a week, I moved to the part of the zoo with the monkeys. Every morning I helped the keepers prepare the animals\' food. It took almost two hours, because every monkey eats different things. The keepers also taught me how to check if an animal is ill.',
      'The best part of the job was talking to visitors. Children always asked me lots of questions, and sometimes I didn\'t know the answers! So I started reading about the animals in the evenings. By the end of the summer, I could answer nearly every question.',
      'I was sad when the job finished. Tony has asked me to come back next summer, and I\'ve already said yes. One day I\'d love to work with the big cats.',
    ].join('\n'),
    textType: 'article',
    testingPart: 3,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 230,
    topics: ['Work and jobs', 'The natural world'],
    createdAt: '2026-09-29',
    questions: questions('reading-key-part3-001', 'comprehension', [
      {
        question: 'Why did Anna want to work at the zoo?',
        options: [
          'She needed money for her studies.',
          'It was connected to the subject she studies.',
          'A friend of hers already worked there.',
        ],
        correctAnswer: 1,
        explanation: 'She studies biology, so she thought working with animals would be interesting.',
      },
      {
        question: 'How did Anna feel on her first day?',
        options: [
          'unhappy with the work she was given',
          'worried about working with the lions',
          'tired after a long day in the shop',
        ],
        correctAnswer: 0,
        explanation: 'She was "a bit disappointed" because she cleaned tables instead of feeding the lions.',
      },
      {
        question: 'What does Anna say about the monkeys?',
        options: [
          'They need to eat several times a day.',
          'They often become ill.',
          'Getting their food ready takes a long time.',
        ],
        correctAnswer: 2,
        explanation: 'Preparing the food took almost two hours because every monkey eats different things.',
      },
      {
        question: 'Why did Anna start reading about animals?',
        options: [
          'Tony told her to learn more.',
          'She wanted to answer the visitors\' questions.',
          'She needed information for her university course.',
        ],
        correctAnswer: 1,
        explanation: 'Children asked questions she couldn\'t answer, so she read about the animals.',
      },
      {
        question: 'What does Anna say about next summer?',
        options: [
          'She is going to work with the lions.',
          'She has agreed to go back to the zoo.',
          'She hopes to find a different job.',
        ],
        correctAnswer: 1,
        explanation: 'Tony asked her to come back and she has already said yes.',
      },
    ]),
  },
  {
    id: 'reading-key-part4-001',
    title: 'The bicycle',
    content: [
      'The bicycle',
      '',
      'The first bicycles appeared in Europe about 200 years ago. They didn\'t have (1) ____, so people moved them by pushing their feet on the ground. Later, in the 1870s, bicycles with one very big front wheel became (2) ____. They were fast, but it was easy to fall off them!',
      'Modern bicycles, with two wheels of the (3) ____ size, were first made in the 1880s. Soon, many people used them to (4) ____ to work. Today there are more than a billion bicycles in the world, and in some cities there are more bicycles (5) ____ people. Cycling is cheap and good for your health, and it doesn\'t (6) ____ the air dirty.',
    ].join('\n'),
    textType: 'article',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 130,
    topics: ['Transport', 'Travel and holidays'],
    createdAt: '2026-09-29',
    questions: questions('reading-key-part4-001', 'cloze', [
      { question: 'Gap 1', options: ['engines', 'pedals', 'seats'], correctAnswer: 1, explanation: 'People pushed with their feet because there were no pedals.' },
      { question: 'Gap 2', options: ['pleased', 'interested', 'popular'], correctAnswer: 2, explanation: '"Become popular" means many people started to like and use them.' },
      { question: 'Gap 3', options: ['same', 'equal', 'similar'], correctAnswer: 0, explanation: '"Of the same size" is the fixed phrase; "the similar size" is not used.' },
      { question: 'Gap 4', options: ['drive', 'travel', 'arrive'], correctAnswer: 1, explanation: 'You "travel to work"; you ride, not drive, a bicycle, and you "arrive at" work.' },
      { question: 'Gap 5', options: ['that', 'as', 'than'], correctAnswer: 2, explanation: 'Comparisons with "more" use "than".' },
      { question: 'Gap 6', options: ['make', 'do', 'have'], correctAnswer: 0, explanation: '"Make something dirty" means cause it to become dirty.' },
    ]),
  },
  {
    id: 'reading-key-part5-001',
    title: 'An email from Jack',
    content: [
      'From: Jack',
      'To: Sofia',
      '',
      'Hi Sofia,',
      'Thanks (0) for your email. I\'m sorry I didn\'t reply sooner. I\'ve been really busy (1) ____ my new job started last Monday!',
      'I\'m working in a hotel in the city centre. The work is hard, but I like it. I start (2) ____ seven o\'clock every morning, so I have to get up very early. My manager is really nice and she always helps me when I (3) ____ a problem.',
      '(4) ____ you like to visit me next month? There are lots of things to do here. We (5) ____ go to the new art museum, or have dinner by the river.',
      'Write back soon and tell me (6) ____ you think.',
      'Jack',
    ].join('\n'),
    textType: 'email',
    testingPart: 5,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 110,
    topics: ['Work and jobs', 'Social interaction'],
    createdAt: '2026-09-29',
    questions: gaps('reading-key-part5-001', [
      { question: 'Gap 1', accepted: ['because', 'since', 'as'], explanation: 'A linking word gives the reason: busy because the new job started.' },
      { question: 'Gap 2', accepted: ['at'], explanation: 'Clock times take "at": at seven o\'clock.' },
      { question: 'Gap 3', accepted: ['have'], explanation: '"Have a problem" – present simple after "when" for something that happens often.' },
      { question: 'Gap 4', accepted: ['would'], explanation: '"Would you like to …?" is a polite invitation.' },
      { question: 'Gap 5', accepted: ['could', 'can', 'might'], explanation: 'A modal verb suggests a possibility: we could go.' },
      { question: 'Gap 6', accepted: ['what'], explanation: '"Tell me what you think" asks for an opinion.' },
    ]),
  },
]
