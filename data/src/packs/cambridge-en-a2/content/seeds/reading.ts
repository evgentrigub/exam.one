import type { ReadingKeyExercise, ReadingKeyGap, ReadingKeyQuestion } from '../types'

type Row = Omit<ReadingKeyQuestion, 'id' | 'textId' | 'type'>
type GapRow = Omit<ReadingKeyGap, 'id' | 'textId' | 'type'>

/** Stamp the ids and question type the reading screen and scoring expect. */
function questions(
  textId: string,
  type: ReadingKeyQuestion['type'],
  rows: Row[]
): ReadingKeyQuestion[] {
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
        explanation:
          'The trip leaves at 8.30 instead of 9.00; the children must bring their own lunch.',
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
      "I started learning Japanese two years ago because my company works with a team in Tokyo. I have a lesson online every Tuesday evening, but I also practise with an app on my phone on the train to work. Grammar is quite easy for me, but writing the characters is still very hard. Next spring I'm going to visit my colleagues in Japan for the first time.",
      '',
      'B: Marco',
      "I'm learning English at an evening class in my town. There are twelve of us and we all come from different countries, so English is the only language we can use together! Our teacher often gives us games to play, and I've made some good friends in the class. I'd like to take an exam at the end of the year, but I'm worried about the speaking part.",
      '',
      'C: Hana',
      "My grandmother is from Portugal, so I decided to learn Portuguese to talk to her. I don't go to classes – I watch films with subtitles and read children's books. My grandmother gave me my first dictionary for my birthday. When I phone her now, we only speak Portuguese, and she says my pronunciation is getting better.",
    ].join('\n'),
    textType: 'article',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 230,
    topics: ['Language', 'School and study', 'People'],
    createdAt: '2026-09-29',
    questions: questions('reading-key-part2-001', 'matching', [
      {
        question: 'Who is learning the language for their job?',
        options: WHO,
        correctAnswer: 0,
        explanation: "Lucia's company works with a team in Tokyo.",
      },
      {
        question: 'Who is studying without a teacher?',
        options: WHO,
        correctAnswer: 2,
        explanation: "Hana doesn't go to classes; she watches films and reads books.",
      },
      {
        question: 'Who is nervous about a test?',
        options: WHO,
        correctAnswer: 1,
        explanation: 'Marco wants to take an exam but is worried about the speaking part.',
      },
      {
        question: 'Who practises while travelling?',
        options: WHO,
        correctAnswer: 0,
        explanation: 'Lucia uses an app on the train to work.',
      },
      {
        question: 'Who was given a present to help them learn?',
        options: WHO,
        correctAnswer: 2,
        explanation: "Hana's grandmother gave her a dictionary for her birthday.",
      },
      {
        question: 'Who has made new friends while learning?',
        options: WHO,
        correctAnswer: 1,
        explanation: 'Marco has made some good friends in his class.',
      },
      {
        question: 'Who is planning a trip abroad?',
        options: WHO,
        correctAnswer: 0,
        explanation: 'Lucia will visit her colleagues in Japan next spring.',
      },
    ]),
  },
  {
    id: 'reading-key-part3-001',
    title: 'My summer job at the zoo',
    content: [
      'My summer job at the zoo – by Anna Price',
      '',
      "Last summer, I got a job at Greenfield Zoo. I'm studying biology at university, so I thought it would be interesting to work with animals for a few weeks.",
      'On my first day, I was a bit disappointed. I hoped to feed the lions, but my manager, Tony, asked me to clean the café tables and help in the gift shop. "Everyone starts there," he said. "You need to learn how the zoo works first."',
      "After a week, I moved to the part of the zoo with the monkeys. Every morning I helped the keepers prepare the animals' food. It took almost two hours, because every monkey eats different things. The keepers also taught me how to check if an animal is ill.",
      "The best part of the job was talking to visitors. Children always asked me lots of questions, and sometimes I didn't know the answers! So I started reading about the animals in the evenings. By the end of the summer, I could answer nearly every question.",
      "I was sad when the job finished. Tony has asked me to come back next summer, and I've already said yes. One day I'd love to work with the big cats.",
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
        explanation:
          'She studies biology, so she thought working with animals would be interesting.',
      },
      {
        question: 'How did Anna feel on her first day?',
        options: [
          'unhappy with the work she was given',
          'worried about working with the lions',
          'tired after a long day in the shop',
        ],
        correctAnswer: 0,
        explanation:
          'She was "a bit disappointed" because she cleaned tables instead of feeding the lions.',
      },
      {
        question: 'What does Anna say about the monkeys?',
        options: [
          'They need to eat several times a day.',
          'They often become ill.',
          'Getting their food ready takes a long time.',
        ],
        correctAnswer: 2,
        explanation:
          'Preparing the food took almost two hours because every monkey eats different things.',
      },
      {
        question: 'Why did Anna start reading about animals?',
        options: [
          'Tony told her to learn more.',
          "She wanted to answer the visitors' questions.",
          'She needed information for her university course.',
        ],
        correctAnswer: 1,
        explanation: "Children asked questions she couldn't answer, so she read about the animals.",
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
      "The first bicycles appeared in Europe about 200 years ago. They didn't have (1) ____, so people moved them by pushing their feet on the ground. Later, in the 1870s, bicycles with one very big front wheel became (2) ____. They were fast, but it was easy to fall off them!",
      "Modern bicycles, with two wheels of the (3) ____ size, were first made in the 1880s. Soon, many people used them to (4) ____ to work. Today there are more than a billion bicycles in the world, and in some cities there are more bicycles (5) ____ people. Cycling is cheap and good for your health, and it doesn't (6) ____ the air dirty.",
    ].join('\n'),
    textType: 'article',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 130,
    topics: ['Transport', 'Travel and holidays'],
    createdAt: '2026-09-29',
    questions: questions('reading-key-part4-001', 'cloze', [
      {
        question: 'Gap 1',
        options: ['engines', 'pedals', 'seats'],
        correctAnswer: 1,
        explanation: 'People pushed with their feet because there were no pedals.',
      },
      {
        question: 'Gap 2',
        options: ['pleased', 'interested', 'popular'],
        correctAnswer: 2,
        explanation: '"Become popular" means many people started to like and use them.',
      },
      {
        question: 'Gap 3',
        options: ['same', 'equal', 'similar'],
        correctAnswer: 0,
        explanation: '"Of the same size" is the fixed phrase; "the similar size" is not used.',
      },
      {
        question: 'Gap 4',
        options: ['drive', 'travel', 'arrive'],
        correctAnswer: 1,
        explanation:
          'You "travel to work"; you ride, not drive, a bicycle, and you "arrive at" work.',
      },
      {
        question: 'Gap 5',
        options: ['that', 'as', 'than'],
        correctAnswer: 2,
        explanation: 'Comparisons with "more" use "than".',
      },
      {
        question: 'Gap 6',
        options: ['make', 'do', 'have'],
        correctAnswer: 0,
        explanation: '"Make something dirty" means cause it to become dirty.',
      },
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
      "Thanks (0) for your email. I'm sorry I didn't reply sooner. I've been really busy (1) ____ my new job started last Monday!",
      "I'm working in a hotel in the city centre. The work is hard, but I like it. I start (2) ____ seven o'clock every morning, so I have to get up very early. My manager is really nice and she always helps me when I (3) ____ a problem.",
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
      {
        question: 'Gap 1',
        accepted: ['because', 'since', 'as'],
        explanation: 'A linking word gives the reason: busy because the new job started.',
      },
      {
        question: 'Gap 2',
        accepted: ['at'],
        explanation: 'Clock times take "at": at seven o\'clock.',
      },
      {
        question: 'Gap 3',
        accepted: ['have'],
        explanation:
          '"Have a problem" – present simple after "when" for something that happens often.',
      },
      {
        question: 'Gap 4',
        accepted: ['would'],
        explanation: '"Would you like to …?" is a polite invitation.',
      },
      {
        question: 'Gap 5',
        accepted: ['could', 'can', 'might'],
        explanation: 'A modal verb suggests a possibility: we could go.',
      },
      {
        question: 'Gap 6',
        accepted: ['what'],
        explanation: '"Tell me what you think" asks for an opinion.',
      },
    ]),
  },
]

const WHO_SET1 = ['Daniel', 'Rosa', 'Ken']

/** Dedicated mock-exam Set 1 texts, one per part. Original, not official; `examOnly`. */
export const mockReadingKeySeeds: ReadingKeyExercise[] = [
  {
    id: 'mock-key-set1-reading-part1',
    title: 'Mock Set 1 · Signs and messages',
    content: [
      '1 · At the train station',
      '"Platform 4 is closed today. Trains to Brighton will leave from Platform 2."',
      '',
      '2 · A text message',
      "\"Mum, I'm at Lucy's house. Her dad will drive me home after dinner, so you don't need to collect me. Jo\"",
      '',
      '3 · In a supermarket',
      '"Fresh bread is half price after 6 p.m. every day."',
      '',
      '4 · On a classroom door',
      '"Art club has moved to Room 12 this term. Bring your own paints."',
      '',
      '5 · A note on a fridge',
      '"Sam – the plumber is coming at 10. Please let him in and show him the kitchen sink. Thanks! Dad"',
      '',
      '6 · On a museum website',
      '"Free entry for students on Wednesdays. Please show your student card at the desk."',
    ].join('\n'),
    textType: 'notice',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 115,
    topics: ['Daily life', 'Transport', 'Services'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-key-set1-reading-part1', 'comprehension', [
      {
        question: 'Text 1: What does the notice say?',
        options: [
          'There are no trains to Brighton today.',
          'Brighton trains are using a different platform today.',
          'Platform 2 is closed for the whole day.',
        ],
        correctAnswer: 1,
        explanation: 'Platform 4 is closed, so Brighton trains leave from Platform 2.',
      },
      {
        question: 'Text 2: Why is Jo sending this message?',
        options: [
          'to ask her mum to pick her up',
          'to say she will eat at home tonight',
          'to tell her mum how she will get home',
        ],
        correctAnswer: 2,
        explanation: "Lucy's dad will drive Jo home, so her mum does not need to collect her.",
      },
      {
        question: 'Text 3: What does the sign say?',
        options: [
          'Bread is cheaper in the evening.',
          'The shop sells bread only after 6 p.m.',
          'All food is half price every day.',
        ],
        correctAnswer: 0,
        explanation: 'Fresh bread costs half price after 6 p.m.',
      },
      {
        question: 'Text 4: Students who go to art club',
        options: [
          'must meet in a new room.',
          'can borrow paints from the school.',
          'should come to Room 4.',
        ],
        correctAnswer: 0,
        explanation: 'Art club has moved to Room 12, and students bring their own paints.',
      },
      {
        question: 'Text 5: What does Dad want Sam to do?',
        options: [
          'repair the kitchen sink',
          'open the door for the plumber',
          'phone the plumber at 10',
        ],
        correctAnswer: 1,
        explanation: 'Sam should let the plumber in and show him the sink.',
      },
      {
        question: 'Text 6: What do we learn about the museum?',
        options: [
          'Students pay less every day of the week.',
          'Students need a card to get in free on one day.',
          'Everyone can visit for free on Wednesdays.',
        ],
        correctAnswer: 1,
        explanation: 'Entry is free for students on Wednesdays if they show their student card.',
      },
    ]),
  },
  {
    id: 'mock-key-set1-reading-part2',
    title: 'Mock Set 1 · My favourite place to relax',
    content: [
      'A: Daniel',
      "My favourite place is the small park near my flat. I go there every morning before work with my dog. In summer I sometimes take a book and read under the trees. It's never crowded, and I like listening to the birds. My only problem is that the café there closed last year.",
      '',
      'B: Rosa',
      "I relax at the swimming pool in my town. I go three evenings a week after my classes at college. Swimming helps me forget about my exams. The pool is quite expensive, but my uncle gave me a ticket for the whole year as a birthday present, so I don't have to pay.",
      '',
      'C: Ken',
      "For me, the best place is my grandparents' farm in the countryside. I can only go there in the holidays because it's two hours away by train. I help my grandfather with the animals and in the evening we cook together. I'd love to live there one day.",
    ].join('\n'),
    textType: 'article',
    testingPart: 2,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 220,
    topics: [
      'Hobbies and leisure',
      'Places and buildings',
      'Personal feelings, opinions and experiences',
    ],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-key-set1-reading-part2', 'matching', [
      {
        question: 'Who goes to their place with an animal?',
        options: WHO_SET1,
        correctAnswer: 0,
        explanation: 'Daniel goes to the park with his dog.',
      },
      {
        question: 'Who would like to move to their favourite place?',
        options: WHO_SET1,
        correctAnswer: 2,
        explanation: 'Ken would love to live on the farm one day.',
      },
      {
        question: 'Who got something free from a relative?',
        options: WHO_SET1,
        correctAnswer: 1,
        explanation: "Rosa's uncle gave her a ticket for the whole year.",
      },
      {
        question: 'Who has to travel a long way to their place?',
        options: WHO_SET1,
        correctAnswer: 2,
        explanation: 'The farm is two hours away by train.',
      },
      {
        question: 'Who misses something that is no longer there?',
        options: WHO_SET1,
        correctAnswer: 0,
        explanation: "The café in Daniel's park closed last year.",
      },
      {
        question: 'Who uses their place to stop worrying about studying?',
        options: WHO_SET1,
        correctAnswer: 1,
        explanation: 'Swimming helps Rosa forget about her exams.',
      },
      {
        question: 'Who prepares food at their favourite place?',
        options: WHO_SET1,
        correctAnswer: 2,
        explanation: 'Ken and his grandfather cook together in the evening.',
      },
    ]),
  },
  {
    id: 'mock-key-set1-reading-part3',
    title: 'Mock Set 1 · Learning to cook at fifteen',
    content: [
      'Learning to cook at fifteen – by Leo Ward',
      '',
      "Until last year, I couldn't cook anything except toast. My mum always made dinner, and I never helped. Then she started a new job and came home late three days a week, so we agreed that I would cook on those days.",
      'At first it was a disaster. I burned the rice twice and once I forgot to buy the most important thing for a curry – the chicken! My little sister laughed at me, but she still ate everything I made.',
      'Things got better when my aunt, who is a chef, gave me a simple cookbook for teenagers. The recipes have photos for every step, so they are easy to follow. I also watch short cooking videos online when I need ideas.',
      "Now my favourite dish to make is pasta with vegetables. It's quick, cheap and healthy. My friends think it's strange that I enjoy cooking, but I've invited them for dinner next Saturday, and I hope they will change their minds.",
    ].join('\n'),
    textType: 'article',
    testingPart: 3,
    difficulty: 'A2',
    estimatedReadingTime: 5,
    wordCount: 210,
    topics: ['Food and drink', 'Daily life', 'Family'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-key-set1-reading-part3', 'comprehension', [
      {
        question: 'Why did Leo start cooking?',
        options: [
          'His mum was too busy on some days.',
          'He wanted to learn a new hobby.',
          'His mum asked him to help her every evening.',
        ],
        correctAnswer: 0,
        explanation: 'His mum started a new job and came home late three days a week.',
      },
      {
        question: 'What happened when Leo made a curry?',
        options: [
          'He burned it.',
          'He did not have the meat for it.',
          'His sister did not want to eat it.',
        ],
        correctAnswer: 1,
        explanation: 'He forgot to buy the chicken.',
      },
      {
        question: 'Why does Leo like the cookbook from his aunt?',
        options: [
          'It has recipes from her restaurant.',
          'It shows him what to do at each stage.',
          'It includes links to cooking videos.',
        ],
        correctAnswer: 1,
        explanation: 'The recipes have photos for every step.',
      },
      {
        question: 'What does Leo say about pasta with vegetables?',
        options: [
          'It takes a long time to make.',
          "It is his sister's favourite meal.",
          'It does not cost much.',
        ],
        correctAnswer: 2,
        explanation: 'He says it is quick, cheap and healthy.',
      },
      {
        question: 'What does Leo hope will happen next Saturday?',
        options: [
          'His friends will see that cooking is not strange.',
          'His friends will cook dinner for him.',
          'His aunt will teach his friends to cook.',
        ],
        correctAnswer: 0,
        explanation: 'He hopes his friends will change their minds about cooking.',
      },
    ]),
  },
  {
    id: 'mock-key-set1-reading-part4',
    title: 'Mock Set 1 · Penguins',
    content: [
      'Penguins',
      '',
      'Penguins are birds, but they cannot fly. Instead, they are very (1) ____ swimmers and spend a lot of their lives in the sea. Most penguins live in the south of the world, and some (2) ____ them live on the ice in Antarctica.',
      'Penguins eat fish and other small sea animals. Their black and white feathers help them to (3) ____ safe: from above, their black backs look like the dark sea. Many penguins live in large groups, and parents (4) ____ turns to look after their eggs. The biggest kind, the emperor penguin, can be more than a metre (5) ____. Today, some kinds of penguin are in danger because the oceans are getting warmer, so scientists are working hard to (6) ____ them.',
    ].join('\n'),
    textType: 'article',
    testingPart: 4,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 140,
    topics: ['The natural world'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: questions('mock-key-set1-reading-part4', 'cloze', [
      {
        question: 'Gap 1',
        options: ['good', 'well', 'strong'],
        correctAnswer: 0,
        explanation: 'An adjective before a noun: "good swimmers".',
      },
      {
        question: 'Gap 2',
        options: ['from', 'of', 'in'],
        correctAnswer: 1,
        explanation: '"Some of them" is the fixed pattern.',
      },
      {
        question: 'Gap 3',
        options: ['keep', 'make', 'hold'],
        correctAnswer: 0,
        explanation: '"Keep safe" means stay safe.',
      },
      {
        question: 'Gap 4',
        options: ['give', 'take', 'do'],
        correctAnswer: 1,
        explanation: '"Take turns" means one after the other.',
      },
      {
        question: 'Gap 5',
        options: ['high', 'long', 'tall'],
        correctAnswer: 2,
        explanation: 'People and animals are "tall"; "high" is for things like mountains.',
      },
      {
        question: 'Gap 6',
        options: ['protect', 'prevent', 'stop'],
        correctAnswer: 0,
        explanation: '"Protect" means keep something safe from danger.',
      },
    ]),
  },
  {
    id: 'mock-key-set1-reading-part5',
    title: 'Mock Set 1 · An email from Mia',
    content: [
      'From: Mia',
      'To: Ben',
      '',
      'Hi Ben,',
      "Guess what? We moved (0) into our new flat on Saturday! It's much bigger (1) ____ our old one, and my bedroom has a balcony.",
      "The only problem is that it's far from school. Now I have (2) ____ take two buses every morning, so I leave home at seven o'clock.",
      "My mum says I can invite some friends (3) ____ the weekend. (4) ____ you free on Sunday afternoon? We could watch a film or play games. My new address is 14 Green Road. You can come by bike because there's a cycle path (5) ____ goes all the way here.",
      'Let me know (6) ____ you can come!',
      'Mia',
    ].join('\n'),
    textType: 'email',
    testingPart: 5,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 110,
    topics: ['House and home', 'Social interaction'],
    createdAt: '2026-10-03',
    examOnly: true,
    questions: gaps('mock-key-set1-reading-part5', [
      {
        question: 'Gap 1',
        accepted: ['than'],
        explanation: 'Comparisons with "bigger" use "than".',
      },
      {
        question: 'Gap 2',
        accepted: ['to'],
        explanation: '"Have to" + verb means it is necessary.',
      },
      {
        question: 'Gap 3',
        accepted: ['at', 'for', 'on', 'over'],
        explanation: '"At / for / on the weekend" – British and American English both accepted.',
      },
      {
        question: 'Gap 4',
        accepted: ['are'],
        explanation: 'A question with "be": "Are you free…?"',
      },
      {
        question: 'Gap 5',
        accepted: ['that', 'which'],
        explanation: 'A relative pronoun for a thing: "a cycle path that goes…".',
      },
      {
        question: 'Gap 6',
        accepted: ['if', 'whether'],
        explanation: '"Let me know if…" introduces a yes/no question.',
      },
    ]),
  },
]
