import { buildSeedListeningAudioMap } from '../listening-audio'

type Choice = {
  context: string
  transcript: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}
function exercise(
  part: number,
  title: string,
  content: string,
  rows: Record<string, unknown>[],
  transcript?: string
) {
  const id = `mock-cambridge-en-b1-set1-listening-part${part}`
  const questions = rows.map((row, index) => ({ ...row, id: `${id}-q${index + 1}` }))
  const items = part <= 2 ? questions : undefined
  return {
    id,
    title,
    content,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    ...(items ? { items } : { questions, transcript, context: title }),
    audio: buildSeedListeningAudioMap({ id, ...(items ? { items } : {}) }),
  }
}

const keyInformation: Choice[] = [
  {
    context: 'Booking a tennis lesson',
    transcript:
      'Woman: Can we book the court for half past four? Man: That time is full. There is a space at five, or at six if you prefer. Woman: Five suits me. I need to leave before six.',
    question: 'When will they play tennis?',
    options: ['4:30', '5:00', '6:00'],
    correctAnswer: 1,
    explanation: 'The woman chooses five because she must leave before six.',
  },
  {
    context: 'Looking for a phone',
    transcript:
      'Man: Have you seen my phone? It is not beside the sofa. Woman: I moved it from the kitchen table onto your desk so it would not get wet. Man: Thanks, I will look in the study.',
    question: 'Where is the phone now?',
    options: ['Beside the sofa.', 'On the kitchen table.', 'On the desk.'],
    correctAnswer: 2,
    explanation: 'The woman moved the phone onto the desk.',
  },
  {
    context: 'Choosing a birthday present',
    transcript:
      'Woman: Shall we get Dad a book? Man: He still has three he has not read. Woman: What about a scarf? Man: He needs a new one for walking. Woman: Good. We can buy the chocolates another time.',
    question: 'What will they buy?',
    options: ['A scarf.', 'A book.', 'Chocolates.'],
    correctAnswer: 0,
    explanation: 'They agree on the scarf Dad needs for walking.',
  },
  {
    context: 'Travelling to a market',
    transcript:
      'Man: I thought we were taking the bus to the market. Woman: The road is closed today. We could cycle, but your bicycle still has a flat tyre. Man: Then let us walk through the park. It only takes twenty minutes.',
    question: 'How will they travel?',
    options: ['By bus.', 'On foot.', 'By bicycle.'],
    correctAnswer: 1,
    explanation: 'The bus route is closed and the bicycle cannot be used, so they will walk.',
  },
  {
    context: 'A restaurant reservation',
    transcript:
      'Woman: I reserved a table inside by the window. Man: The weather is lovely. Could we sit outside? Woman: The terrace is full, but they have a table in the garden. Man: That sounds perfect.',
    question: 'Where will they sit?',
    options: ['Inside by a window.', 'On the terrace.', 'In the garden.'],
    correctAnswer: 2,
    explanation: 'The garden is the available outdoor choice they accept.',
  },
  {
    context: 'Packing for a school trip',
    transcript:
      'Man: Do we need to bring lunch on the trip? Woman: Lunch is included, but everyone needs a bottle of water. Man: What about a notebook? Woman: The teacher will give us one when we arrive.',
    question: 'What must students bring?',
    options: ['A water bottle.', 'A packed lunch.', 'A notebook.'],
    correctAnswer: 0,
    explanation: 'Lunch and notebooks are provided; students bring water.',
  },
  {
    context: 'Meeting after a film',
    transcript:
      'Woman: I will wait for you at the main entrance. Man: It will be busy there. Meet me by the ticket machines instead. Woman: The ones near the café? Man: Yes, just opposite it.',
    question: 'Where will they meet?',
    options: ['At the main entrance.', 'By the ticket machines.', 'Inside the café.'],
    correctAnswer: 1,
    explanation: 'They change the plan to the ticket machines opposite the café.',
  },
]
const attitudes: Choice[] = [
  {
    context: 'After a swimming lesson',
    transcript:
      'Woman: I was nervous about joining the class. Man: Was it difficult? Woman: A little, but the instructor never hurried us. I finally managed to swim a whole length. I wish I had tried sooner.',
    question: 'How does the woman feel about the lesson?',
    options: [
      'She is proud of her progress.',
      'She thinks the instructor was impatient.',
      'She wants a harder class immediately.',
    ],
    correctAnswer: 0,
    explanation: 'Swimming a whole length and wishing she had tried sooner show satisfaction.',
  },
  {
    context: 'Discussing a concert',
    transcript:
      'Man: The band played well, but we could hardly see them from our seats. Woman: Would you go again? Man: Yes, but I would pay a little more to sit closer next time.',
    question: 'What would the man change?',
    options: ['The band.', 'The position of his seat.', 'The length of the concert.'],
    correctAnswer: 1,
    explanation: 'He enjoyed the music but would buy seats nearer the band.',
  },
  {
    context: 'Learning to cook',
    transcript:
      'Woman: I followed the recipe exactly, but the bread did not rise. Man: That is frustrating. Woman: It is, but I think the yeast was too old. I will use a fresh packet tomorrow.',
    question: 'What does the woman intend to do?',
    options: [
      'Stop baking bread.',
      'Change every part of the recipe.',
      'Try again with a different ingredient.',
    ],
    correctAnswer: 2,
    explanation: 'She plans another attempt with fresh yeast.',
  },
  {
    context: 'Working in a team',
    transcript:
      'Man: I thought doing the presentation alone would be quicker. Woman: Was it? Man: No. When I asked the others to join, their ideas made it much better. I should have involved them from the beginning.',
    question: 'What has the man learned?',
    options: [
      'Other people can improve his work.',
      'Presentations should always be shorter.',
      'Planning is unnecessary.',
    ],
    correctAnswer: 0,
    explanation: 'He regrets not involving the team earlier because their ideas helped.',
  },
  {
    context: 'A weekend visit',
    transcript:
      'Woman: Our cousins stayed with us all weekend. Man: Was your flat too small? Woman: It was crowded, but we laughed so much. I would happily invite them again, perhaps when we can spend more time outside.',
    question: 'What does the woman think about the visit?',
    options: [
      'She wants her cousins to stay elsewhere.',
      'She enjoyed it despite the limited space.',
      'She found the whole weekend boring.',
    ],
    correctAnswer: 1,
    explanation: 'She enjoyed their company and would invite them back.',
  },
  {
    context: 'An evening course',
    transcript:
      'Man: The course is more expensive than the online one. Woman: Then why did you choose it? Man: I need to ask questions while I am learning. Having the teacher there is worth the extra cost to me.',
    question: 'Why does the man prefer this course?',
    options: [
      'It finishes sooner.',
      'It provides a new computer.',
      'It offers immediate help from a teacher.',
    ],
    correctAnswer: 2,
    explanation: 'Being able to ask the teacher questions during lessons matters most to him.',
  },
]

export const mockListeningSeeds: Record<string, unknown>[] = [
  exercise(
    1,
    'Plans and practical details',
    'Listen to seven conversations. Choose the correct written description.',
    keyInformation
  ),
  exercise(
    2,
    'Feelings and decisions',
    'Listen to six conversations. Choose the answer that best expresses the speaker’s meaning.',
    attitudes
  ),
  exercise(
    3,
    'A visit to the science centre',
    'Science centre visit\nVisit date: (1) ____\nBus departs at: (2) ____\nMorning workshop: (3) ____\nBring a (4) ____\nGroup leader: Mrs (5) ____\nStudent ticket: £(6) ____',
    [
      {
        question: 'Visit date',
        accepted: ['22 May', 'May 22', '22nd May', 'May 22nd'],
        explanation: 'The visit has moved from the fifteenth to the twenty-second of May.',
      },
      {
        question: 'Bus departure time',
        accepted: [
          '9:15',
          '9.15',
          '9:15 am',
          '9.15 am',
          'quarter past nine',
          'a quarter past nine',
        ],
        explanation: 'The bus leaves at quarter past nine.',
      },
      {
        question: 'Morning workshop subject',
        accepted: ['robots', 'robot', 'robotics'],
        explanation: 'The morning workshop is about robots.',
      },
      {
        question: 'What to bring',
        accepted: ['jacket', 'a jacket'],
        explanation: 'Students need a jacket for the outdoor part.',
      },
      {
        question: 'Group leader’s surname',
        accepted: ['Turner'],
        explanation: 'The group leader is Mrs Turner, spelled T-U-R-N-E-R.',
      },
      {
        question: 'Student ticket price',
        accepted: ['6', 'six', '6 pounds', 'six pounds', '£6'],
        explanation: 'Student tickets cost six pounds.',
      },
    ],
    'Here are the final arrangements for our science centre visit. The original date was the fifteenth of May, but the centre has asked us to come on the twenty-second of May instead. Please meet outside the school at nine. The bus leaves at quarter past nine and cannot wait for late arrivals. In the morning we will join a workshop about robots. The space exhibition will be available after lunch, so there is time for both activities. Lunch is provided, and you will not need a notebook because the centre supplies worksheets. However, bring a jacket: part of the afternoon visit is outdoors and it can be cool. Our group leader is Mrs Turner. Her name is spelled T-U-R-N-E-R. If you get separated from the group, ask a member of staff to contact her. The usual adult ticket is twelve pounds, but our student tickets cost six pounds each. Please pay at the school office by Friday.'
  ),
  exercise(
    4,
    'An interview with a bicycle mechanic',
    'Listen to an interview with Maya, who runs a bicycle repair service.',
    [
      {
        question: 'Why did Maya start repairing bicycles professionally?',
        options: [
          'A shop offered her a permanent job.',
          'Neighbours kept asking for her help.',
          'She wanted to sell new bicycles.',
        ],
        correctAnswer: 1,
        explanation: 'After helping one neighbour, more people asked her to repair their bicycles.',
      },
      {
        question: 'What was most difficult at the beginning?',
        options: [
          'Learning to use tools.',
          'Finding customers.',
          'Estimating how long repairs would take.',
        ],
        correctAnswer: 2,
        explanation: 'She could do the repairs but underestimated the time required.',
      },
      {
        question: 'Why did she begin visiting customers at home?',
        options: [
          'Some people could not transport broken bicycles.',
          'Her workshop was too noisy.',
          'Customers wanted to watch her travel.',
        ],
        correctAnswer: 0,
        explanation:
          'Home visits solved the problem of bringing an unusable bicycle to her workshop.',
      },
      {
        question: 'What surprises her about the work?',
        options: [
          'People rarely ask questions.',
          'Customers want to learn basic repairs.',
          'Old bicycles are impossible to repair.',
        ],
        correctAnswer: 1,
        explanation: 'Many customers ask to learn simple repair skills.',
      },
      {
        question: 'What does she plan to do next?',
        options: [
          'Open a large shop.',
          'Stop making home visits.',
          'Offer small maintenance classes.',
        ],
        correctAnswer: 2,
        explanation: 'She plans to teach basic bicycle maintenance to small groups.',
      },
      {
        question: 'What advice does she give new businesses?',
        options: [
          'Be clear about what you can offer.',
          'Spend as much as possible on advertising.',
          'Accept every job immediately.',
        ],
        correctAnswer: 0,
        explanation:
          'She recommends explaining honestly which jobs you can do and referring other work.',
      },
    ],
    'Man: Our guest today is Maya, a bicycle mechanic. How did your business begin?\nWoman: I used to repair my own bicycle in the garage. One day a neighbour asked me to fix his brakes. He told his friends, and soon I had more requests than I could manage at weekends. That made me consider it as a job. I was not interested in selling new bicycles.\nMan: What did you find difficult at first?\nWoman: I already knew how to use most of the tools. The problem was judging how long a job would take. I promised people their bicycles too soon, then worked late to finish. Now I allow extra time for unexpected problems.\nMan: You also visit customers at home. Why?\nWoman: Someone explained that a bicycle with a broken wheel would not fit in her car. Other customers had the same difficulty. So I began taking my tools to them. I still use my garage for bigger repairs.\nMan: Has anything surprised you?\nWoman: I thought people would just hand over their bicycles and leave. Actually, many want to watch and ask how to do simple things themselves. Showing them how to repair a tyre takes longer, but I enjoy it.\nMan: Does that influence your plans?\nWoman: Yes. I am organising short classes for small groups next spring. People will bring their own bicycles and learn basic maintenance. I am not planning a big shop, and I will continue home visits.\nMan: What would you tell someone starting a service like yours?\nWoman: Be honest about what you can do. I do not repair every type of bicycle, and I recommend another mechanic when a job needs different skills. Customers appreciate a clear explanation more than a promise you cannot keep.'
  ),
]
