// Original Set 1 content, using the existing B1 practice formats.
type Row = {
  question: string
  options?: string[]
  correctAnswer?: number
  accepted?: string[]
  explanation: string
}

function exercise(part: number, title: string, content: string, rows: Row[], textType = 'article') {
  const id = `mock-cambridge-en-b1-set1-reading-part${part}`
  return {
    id,
    title,
    content,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    textType,
    estimatedReadingTime: [7, 8, 8, 8, 7, 7][part - 1],
    wordCount: content.trim().split(/\s+/).length,
    topics: ['B1', title],
    questions: rows.map((row, index) => ({
      ...row,
      id: `${id}-q${index + 1}`,
      textId: id,
      type: part === 6 ? 'gap-fill' : part === 2 || part === 4 ? 'matching' : 'selection',
    })),
  }
}

const activities = [
  'A · Harbour sketching: Saturday morning outdoors. Draw boats with an artist; materials supplied. No previous experience needed.',
  'B · Indoor climbing: Wednesday evening, adults only. Equipment included; beginners welcome. A trained coach helps you practise safely.',
  'C · Family cycling: Sunday afternoon. Bring your own bicycles for an easy countryside ride. Children are welcome; café stop at the end.',
  'D · Local history walk: Sunday morning. An expert explains the old town. Adults and teenagers welcome; finish at the museum. No photography lesson.',
  'E · Street photography: Sunday morning. Explore the old town with a photographer and learn to use your own phone camera. Beginners welcome.',
  'F · Indoor painting: Saturday morning. Experienced painters practise portraits with a model. Bring your own paints and brushes.',
  'G · Cooking together: Tuesday evening. Prepare vegetarian meals indoors with a chef. Ingredients supplied; suitable for complete beginners.',
  'H · Kayaking: Saturday afternoon. Adults who can already swim learn to paddle on the river. Boats and safety equipment supplied.',
]
const sentences = [
  'A · This meant that we could no longer hold the event in the garden.',
  'B · Luckily, our music teacher had a suggestion for solving that problem.',
  'C · Their replies showed that most of them preferred an earlier start.',
  'D · Without their help, we would never have been ready on time.',
  'E · Seeing everyone join in made all the difficult preparation worthwhile.',
  'F · I had bought that bicycle two years before.',
  'G · The restaurant had already served our food.',
  'H · We decided to cancel the concert and return the tickets.',
]

export const mockReadingSeeds: Record<string, unknown>[] = [
  exercise(
    1,
    'Messages for a busy week',
    '1. Sports centre: The changing rooms are being painted on Thursday. Arrive wearing your sports clothes. Classes will run as usual.\n\n2. Hi Jo, I have left your book with my neighbour. She will be at home after six. Please collect it before Friday. — Mia\n\n3. Café notice: Order any soup before noon and receive a free bread roll. The offer is for customers eating here only.\n\n4. Workshop email: Your place is confirmed. Tools are provided, but please bring an old shirt to protect your clothes.\n\n5. Library: Books due on Monday may be returned on Tuesday without a fine because the building is closed for repairs.',
    [
      {
        question: 'What should sports centre visitors do on Thursday?',
        options: [
          'Bring painting equipment.',
          'Come dressed for their class.',
          'Book a different day.',
        ],
        correctAnswer: 1,
        explanation: 'Classes continue, but visitors cannot use the changing rooms.',
      },
      {
        question: 'What must Jo do?',
        options: [
          'Ask Mia to bring the book on Friday.',
          'Visit Mia before six.',
          'Get the book from Mia’s neighbour before Friday.',
        ],
        correctAnswer: 2,
        explanation: 'The neighbour has the book and is available after six.',
      },
      {
        question: 'Who receives a free bread roll?',
        options: [
          'Someone eating soup in the café before noon.',
          'Anyone buying food to take away.',
          'Anyone ordering after lunch.',
        ],
        correctAnswer: 0,
        explanation: 'Both the soup order time and eating in the café are required.',
      },
      {
        question: 'What should the workshop participant bring?',
        options: ['Their own tools.', 'Clothing that can get dirty.', 'A written confirmation.'],
        correctAnswer: 1,
        explanation: 'Tools are supplied; an old shirt protects clothing.',
      },
      {
        question: 'What does the library notice allow?',
        options: [
          'Keeping all borrowed books until next week.',
          'Entering the library on Monday.',
          'Returning Monday’s books a day late without paying.',
        ],
        correctAnswer: 2,
        explanation: 'The closure means Tuesday returns are accepted without a fine.',
      },
    ],
    'notice'
  ),
  exercise(
    2,
    'Choose a local activity',
    'Read about five people. Match each person to one activity. Use each activity once.\n\n' +
      activities.join('\n\n'),
    [
      {
        question:
          'Nora has never drawn before. She wants an outdoor activity on Saturday morning and does not own art materials.',
        options: activities,
        correctAnswer: 0,
        explanation:
          'Harbour sketching is outdoors on Saturday morning and supplies beginner materials.',
      },
      {
        question:
          'Ben wants to try a sport indoors after work on Wednesday. He needs to borrow the equipment and receive instruction.',
        options: activities,
        correctAnswer: 1,
        explanation: 'Indoor climbing meets the day, setting, equipment and coaching requirements.',
      },
      {
        question:
          'Leila wants to learn to photograph buildings with her phone on Sunday morning. She has no experience.',
        options: activities,
        correctAnswer: 4,
        explanation: 'Street photography teaches beginners to use phone cameras in the old town.',
      },
      {
        question:
          'Oscar can swim but has never used a small boat. He is free on Saturday afternoon and needs equipment provided.',
        options: activities,
        correctAnswer: 7,
        explanation: 'Kayaking supplies equipment and teaches swimmers on Saturday afternoon.',
      },
      {
        question:
          'Eva wants to learn to prepare meals without meat on a weekday evening. She would like ingredients included.',
        options: activities,
        correctAnswer: 6,
        explanation:
          'Cooking together teaches vegetarian meals on Tuesday evening with ingredients supplied.',
      },
    ],
    'list'
  ),
  exercise(
    3,
    'The station garden',
    `When I began travelling to college by train, I noticed a small garden beside the station. It looked neglected, although someone had planted roses there years earlier. I thought the railway company should look after it. Then I saw a handwritten sign asking for local volunteers. I had never grown anything except a pot of herbs, but I sent a message to the address on the sign. I was curious about what could be done with such a forgotten place.

The organiser, Rosa, invited me to a Saturday meeting. I expected a group of experienced gardeners with expensive tools. Instead, there were six people of different ages, and two were as new to gardening as I was. Rosa explained that the railway company owned the land but had given the group permission to care for it. The company could not offer money. A nearby shop had agreed to donate tools, while residents would bring any spare plants they had. We would have to make a careful plan with what was available.

At our first working session, I wanted to plant bright flowers immediately. Rosa asked us to clear the rubbish and improve the soil first. I was disappointed because these jobs seemed to make very little difference. After three hours, however, we could finally see the shape of the garden. A passenger stopped to thank us. That small conversation helped me understand why the less exciting work mattered. Before long, people were leaving friendly notes and offering us plants from their own gardens.

There were problems too. During a dry week in June, several new plants began to die. We had assumed that rain would be enough, and nobody had made a watering schedule. It would have been easy to blame one another. Instead, Rosa put a simple weekly list on the gate. People chose days that suited them, and the plants recovered. I began to check the list whenever I passed the station, even on days when I was not helping.

By the end of summer, the garden had become a place where passengers waited for their trains. The flowers were lovely, but what surprised me most was how many neighbours I now knew. I used to hurry straight home from college. Now I sometimes stop to talk to someone I met through the project. Next year we want to add vegetables, although we will need advice before we start. I am still far from an expert, but I no longer think that useful community work has to begin with lots of knowledge or money.`,
    [
      {
        question: 'Why did the writer contact the group?',
        options: [
          'The railway company offered a paid job.',
          'They wanted to sell their herbs.',
          'They wanted to explore the garden’s possibilities.',
          'Rosa had already invited them.',
        ],
        correctAnswer: 2,
        explanation: 'The sign made the writer curious about improving the neglected place.',
      },
      {
        question: 'What did the writer discover at the meeting?',
        options: [
          'Everyone had bought expensive tools.',
          'The group included other beginners.',
          'The railway company would pay for plants.',
          'Rosa owned the land.',
        ],
        correctAnswer: 1,
        explanation: 'Two other volunteers were new to gardening too.',
      },
      {
        question: 'How did the writer’s attitude to clearing the garden change?',
        options: [
          'They recognised its value after a passenger’s comment.',
          'They decided flowers were unnecessary.',
          'They thought the group worked too slowly.',
          'They wanted to work alone.',
        ],
        correctAnswer: 0,
        explanation: 'A passenger’s thanks helped them value the preparation work.',
      },
      {
        question: 'What solved the problem in June?',
        options: [
          'Buying older plants.',
          'Asking the railway company for money.',
          'Waiting for wetter weather.',
          'Agreeing who would water on each day.',
        ],
        correctAnswer: 3,
        explanation: 'The weekly schedule gave volunteers clear responsibility for watering.',
      },
      {
        question: 'What is the writer’s main message?',
        options: [
          'Train passengers should grow vegetables.',
          'Only skilled gardeners should volunteer.',
          'A modest project can build both a garden and a community.',
          'Community projects always need company funding.',
        ],
        correctAnswer: 2,
        explanation:
          'The garden also helped neighbours meet, despite limited resources and experience.',
      },
    ]
  ),
  exercise(
    4,
    'Our first neighbourhood concert',
    'Our street planned a small concert to raise money for the community centre. I agreed to help organise it, although I had never done anything similar. We expected a warm evening outside, but three days before the concert the forecast changed to heavy rain. (1) ____\n\nThe centre had an empty hall, but we did not own the equipment needed to perform there. (2) ____ She offered to lend us the school’s speakers and microphones.\n\nWe also needed to decide when to open the doors. Rather than guess, we emailed everyone who had reserved tickets. (3) ____ So we changed the opening time from seven to six.\n\nOn the day, several neighbours arrived to arrange chairs and decorate the hall. (4) ____ By five o’clock, the room looked welcoming and the sound equipment was working.\n\nWhen the last song began, the audience started singing too. (5) ____ I was tired, but already thinking about organising another event the following year.',
    sentences
      .slice(0, 5)
      .map((answer, index) => ({
        question: `Gap ${index + 1}`,
        options: sentences,
        correctAnswer: index,
        explanation: answer,
      }))
  ),
  exercise(
    5,
    'An evening walking group',
    'When my neighbour (1) ____ that we start a walking group, I was unsure whether anyone would join. We put a notice in the local shop and were pleased with the (2) ____. Our first walk took (3) ____ on a Friday evening. We chose a short route so that people of different ages could take (4) ____. Now we meet every week, even when the weather is not perfect. Walking together gives us a (5) ____ to talk, and it has helped several people (6) ____ new friends.',
    [
      {
        question: 'Gap 1',
        options: ['suggested', 'reminded', 'warned', 'promised'],
        correctAnswer: 0,
        explanation: 'Suggest that we do something introduces an idea.',
      },
      {
        question: 'Gap 2',
        options: ['replying', 'response', 'responsibility', 'request'],
        correctAnswer: 1,
        explanation: 'Response describes people’s reaction to the notice.',
      },
      {
        question: 'Gap 3',
        options: ['time', 'care', 'place', 'action'],
        correctAnswer: 2,
        explanation: 'Take place means happen.',
      },
      {
        question: 'Gap 4',
        options: ['role', 'side', 'turn', 'part'],
        correctAnswer: 3,
        explanation: 'Take part means participate.',
      },
      {
        question: 'Gap 5',
        options: ['chance', 'choice', 'change', 'cause'],
        correctAnswer: 0,
        explanation: 'A chance to talk is an opportunity.',
      },
      {
        question: 'Gap 6',
        options: ['do', 'make', 'keep', 'take'],
        correctAnswer: 1,
        explanation: 'Make friends is the correct collocation.',
      },
    ]
  ),
  exercise(
    6,
    'An invitation to a language club',
    'Hi Chris, there is a new language club (1) ____ meets at our library. You do not have (2) ____ be an expert to join. Some members are beginners, while others have studied (3) ____ several years. I went last week and enjoyed it (4) ____ much that I have signed up again. The next meeting starts (5) ____ seven on Thursday. Let me know (6) ____ you would like to come with me.',
    [
      {
        question: 'Gap 1',
        accepted: ['which', 'that'],
        explanation: 'A relative pronoun links the club to its activity.',
      },
      {
        question: 'Gap 2',
        accepted: ['to'],
        explanation: 'Have to is followed by the infinitive.',
      },
      { question: 'Gap 3', accepted: ['for'], explanation: 'For introduces a duration.' },
      {
        question: 'Gap 4',
        accepted: ['so'],
        explanation: 'So much that introduces the consequence of enjoying it.',
      },
      { question: 'Gap 5', accepted: ['at'], explanation: 'At is used with a clock time.' },
      {
        question: 'Gap 6',
        accepted: ['if', 'whether'],
        explanation: 'If or whether introduces an indirect yes/no question.',
      },
    ],
    'email'
  ),
]
