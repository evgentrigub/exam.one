import type { KeyChoiceQuestion, KeyGap, ListeningKeyExercise, ListeningKeyItem } from '../types'
import { withSeedAudio } from '../listening-audio'

/** Stamp the per-item ids the per-item audio map is keyed by. */
function items(exerciseId: string, rows: Omit<ListeningKeyItem, 'id'>[]): ListeningKeyItem[] {
  return rows.map((row, index) => ({ ...row, id: `${exerciseId}-i${index + 1}` }))
}

function rows<T extends object>(exerciseId: string, list: T[]): Array<T & { id: string }> {
  return list.map((row, index) => ({ ...row, id: `${exerciseId}-q${index + 1}` }))
}

/**
 * Original A2 Key listening seeds, one per part, in the 2020 format. Not official tasks.
 *
 * They ship without an `audio` map: the player finds no file, shows the missing-audio notice,
 * and **Generate audio** synthesises it with the local British English voices. Dialogue turns
 * carry one-word `Name:` or role labels so each speaker gets a different voice.
 */
export const listeningKeySeeds: ListeningKeyExercise[] = [
  {
    id: 'listening-key-part1-001',
    title: 'Part 1: Short conversations',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    items: items('listening-key-part1-001', [
      {
        context: 'At a railway station.',
        transcript:
          'Man: Excuse me, when is the next train to Oxford? Woman: There\'s one at ten fifteen, but it stops at every station. Man: Is there a faster one? Woman: Yes, the ten forty. It gets to Oxford before the ten fifteen. Man: Then I\'ll wait for the ten forty. Thanks.',
        question: 'Which train will the man take?',
        options: ['the 10.15', 'the 10.40', 'the 10.50'],
        correctAnswer: 1,
        explanation: 'The 10.40 is faster and arrives first, so he decides to wait for it.',
      },
      {
        context: 'In a clothes shop.',
        transcript:
          'Woman: I\'d like to try this jacket, please. Man: I\'m sorry, we haven\'t got it in your size. Woman: What a shame. What about the blue dress in the window? Man: Yes, we\'ve got that in your size. Woman: Lovely, I\'ll take it. I was going to buy a scarf too, but just the dress, thanks.',
        question: 'What does the woman buy?',
        options: ['a jacket', 'a dress', 'a scarf'],
        correctAnswer: 1,
        explanation: 'The jacket isn\'t in her size and she decides not to buy the scarf.',
      },
      {
        context: 'Two friends are talking about the weekend.',
        transcript:
          'Woman: Shall we have a picnic on Saturday? Man: Good idea, but I think it\'s going to rain on Saturday. Woman: Really? I heard it would be sunny. Man: No, the sun is on Sunday. Saturday will be wet and windy. Woman: OK, let\'s go on Sunday then.',
        question: 'What will the weather be like on Saturday?',
        options: ['sunny', 'rainy', 'cloudy but dry'],
        correctAnswer: 1,
        explanation: 'The man says Saturday will be wet and windy; the sun comes on Sunday.',
      },
      {
        context: 'A boy is talking to his mother.',
        transcript:
          'Boy: Mum, have you seen my football boots? They\'re not in my bedroom. Mother: Did you leave them in the car after the match? Boy: No, I took them out. Mother: Then look in the kitchen, next to the back door. I saw them there this morning. Boy: Oh yes, here they are!',
        question: 'Where are the boy\'s football boots?',
        options: ['in his bedroom', 'in the car', 'in the kitchen'],
        correctAnswer: 2,
        explanation: 'His mother saw them next to the back door in the kitchen, and he finds them there.',
      },
      {
        context: 'A woman is phoning a restaurant.',
        transcript:
          'Man: Good evening, Bella\'s Restaurant. Woman: Hello, I\'d like to book a table for six people on Friday. Man: For six? Woman: Well, it was six, but two friends can\'t come now. So four, please. Man: Four people on Friday at eight. That\'s fine.',
        question: 'How many people will have dinner at the restaurant?',
        options: ['two', 'four', 'six'],
        correctAnswer: 1,
        explanation: 'She first says six, then two friends can\'t come, so the table is for four.',
      },
    ]),
  },
  {
    id: 'listening-key-part2-001',
    title: 'Part 2: A cooking course',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    context: 'You will hear a woman talking about a cooking course at a college.',
    content: [
      'Cooking course at Hill Street College',
      '',
      'Day of the course: (1) ____',
      'Lessons start at: (2) ____',
      'Price for four lessons: £(3) ____',
      'Bring an apron and a (4) ____',
      'Teacher\'s name: Mrs (5) ____',
    ].join('\n'),
    transcript:
      'Hello everyone, and thank you for coming to hear about our new cooking course here at Hill Street College. The course is on Wednesday evenings. It used to be on Thursdays, but that changed this year. Each lesson starts at half past six and finishes at nine. There are four lessons, and the price for all four is forty-five pounds. That includes all the food we cook with. You don\'t need to bring any knives or pans, but please bring an apron and a box, so you can take home what you\'ve made. Your teacher is Mrs Galloway. That\'s G-A-L-L-O-W-A-Y. She worked in restaurants for twenty years before she came to the college.',
    questions: rows<Omit<KeyGap, 'id'>>('listening-key-part2-001', [
      { question: 'Day of the course', accepted: ['Wednesday', 'Wednesdays'], explanation: 'The course is on Wednesday evenings; it used to be on Thursdays.' },
      { question: 'Lessons start at', accepted: ['6.30', '6:30', 'half past six', '18.30', '18:30', '6.30 pm', '6:30 pm', '6.30pm', '6:30pm'], explanation: 'Each lesson starts at half past six and finishes at nine.' },
      { question: 'Price for four lessons', accepted: ['45', 'forty-five', 'forty five'], explanation: 'All four lessons cost forty-five pounds.' },
      { question: 'Bring', accepted: ['box'], explanation: 'Bring an apron and a box to take home what you have made; knives and pans are not needed.' },
      { question: 'Teacher\'s name', accepted: ['Galloway'], explanation: 'The name is spelled out: G-A-L-L-O-W-A-Y. A spelled-out word must be spelled correctly.' },
    ]),
  },
  {
    id: 'listening-key-part3-001',
    title: 'Part 3: A holiday in Scotland',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    context: 'You will hear Tom talking to his friend Katie about her holiday in Scotland.',
    transcript: [
      'Tom: Hi Katie! How was your holiday in Scotland?',
      'Katie: It was brilliant, thanks. We stayed in a small village by the sea. I wanted to stay in Edinburgh, but my parents prefer quiet places.',
      'Tom: How did you get there? Did you fly?',
      'Katie: No, we went by train. It took seven hours, but that was fine because I read two books on the way. Flying is quicker, but my dad hates airports.',
      'Tom: What was the weather like?',
      'Katie: Everyone told us it would rain every day, but it only rained once. It was quite cold, though, so I was glad I took my thick jumper.',
      'Tom: What was the best thing you did?',
      'Katie: We went on a boat trip to see dolphins. I didn\'t think we\'d see any, but there were about ten of them! The walk up the mountain was nice too, but it was very tiring.',
      'Tom: Would you go back?',
      'Katie: Definitely. Next time I\'d like to go in the summer, when it\'s warmer, and camp by the beach.',
    ].join('\n'),
    questions: rows<Omit<KeyChoiceQuestion, 'id'>>('listening-key-part3-001', [
      { question: 'Where did Katie stay?', options: ['in a city', 'in a village', 'on a farm'], correctAnswer: 1, explanation: 'They stayed in a small village by the sea; Edinburgh was only what Katie wanted.' },
      { question: 'How did Katie\'s family travel to Scotland?', options: ['by plane', 'by car', 'by train'], correctAnswer: 2, explanation: 'They went by train because her dad hates airports.' },
      { question: 'What was the weather like?', options: ['It rained every day.', 'It was cold but mostly dry.', 'It was warm and sunny.'], correctAnswer: 1, explanation: 'It only rained once, but it was quite cold.' },
      { question: 'What did Katie enjoy most?', options: ['seeing some sea animals', 'climbing a mountain', 'reading on the beach'], correctAnswer: 0, explanation: 'The best thing was the boat trip to see dolphins.' },
      { question: 'What would Katie like to do next time?', options: ['stay in a hotel', 'go at a different time of year', 'take a friend with her'], correctAnswer: 1, explanation: 'She would like to go in the summer, when it is warmer.' },
    ]),
  },
  {
    id: 'listening-key-part4-001',
    title: 'Part 4: Five short recordings',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    items: items('listening-key-part4-001', [
      {
        context: 'A woman is talking about a film.',
        transcript:
          'Woman: I went to see the new space film last night. The story was a bit silly, to be honest, and it was far too long. But the music was fantastic – I\'ve been listening to it all morning.',
        question: 'You will hear a woman talking about a film. What did she like most about it?',
        options: ['the story', 'the music', 'the length'],
        correctAnswer: 1,
        explanation: 'The story was silly and the film too long, but the music was fantastic.',
      },
      {
        context: 'A man is talking to a shop assistant.',
        transcript:
          'Man: Hello, I bought this shirt here yesterday. The size is fine and I like the colour, but look, there\'s a hole in the sleeve. Could I have another one, please? Assistant: Of course. I\'m very sorry about that.',
        question: 'You will hear a man talking to a shop assistant. Why does he want to change the shirt?',
        options: ['It is the wrong size.', 'He doesn\'t like the colour.', 'It is damaged.'],
        correctAnswer: 2,
        explanation: 'The size and colour are fine, but there is a hole in the sleeve.',
      },
      {
        context: 'A teacher is talking to her class.',
        transcript:
          'Teacher: Before you go, remember that tomorrow we\'re going to the science museum. You don\'t need to bring any money, because the school is paying, and we\'ll have lunch in the museum café. But please bring a pen and a notebook, because you\'ll need to answer some questions.',
        question: 'You will hear a teacher talking to her class. What must the students bring tomorrow?',
        options: ['some money', 'something to write with', 'their lunch'],
        correctAnswer: 1,
        explanation: 'The school pays and lunch is at the museum, but they need a pen and a notebook.',
      },
      {
        context: 'Two friends are making plans.',
        transcript:
          'Man: So, shall we meet at the station on Saturday? Woman: It\'s always so busy there. What about the café opposite the park? Man: That\'s closed at the weekend. Woman: Oh, right. Then let\'s meet outside the library. It\'s near the bus stop. Man: Perfect.',
        question: 'You will hear two friends talking. Where are they going to meet?',
        options: ['at the station', 'at a café', 'outside the library'],
        correctAnswer: 2,
        explanation: 'The station is too busy and the café is closed, so they choose the library.',
      },
      {
        context: 'A man is leaving a phone message.',
        transcript:
          'Paul: Hi Jenny, it\'s Paul. I\'m calling about the concert. I\'ve got the tickets, but I\'m afraid the concert is now on Thursday, not Friday. Can you still come? Call me back when you can.',
        question: 'You will hear a man leaving a message. Why is he calling?',
        options: ['to invite Jenny to a concert', 'to say the date has changed', 'to ask Jenny to buy tickets'],
        correctAnswer: 1,
        explanation: 'He already has the tickets; the concert has moved from Friday to Thursday.',
      },
    ]),
  },
  {
    id: 'listening-key-part5-001',
    title: 'Part 5: Presents for the family',
    testingPart: 5,
    difficulty: 'A2',
    createdAt: '2026-09-29',
    context: 'You will hear Anna telling her dad about the presents she has bought. What did she buy for each person?',
    transcript: [
      'Dad: Have you finished your shopping, Anna?',
      'Anna: Yes, finally! I got something for everyone.',
      'Dad: What did you get your brother? He wanted a video game, didn\'t he?',
      'Anna: He did, but they were too expensive. So I bought him a football instead. He plays every weekend.',
      'Dad: Good idea. And your mum?',
      'Anna: I thought about a scarf, but she has lots of them. I got her a plant for the kitchen.',
      'Dad: She\'ll love that. What about Grandad?',
      'Anna: He\'s always late, so I bought him a watch. It has really big numbers.',
      'Dad: Ha! And Aunt Mary?',
      'Anna: She loves reading, so a book about gardens. I nearly got her chocolates, but she\'s trying not to eat sweet things.',
      'Dad: And your cousin Leo?',
      'Anna: A camera. Not an expensive one, but he\'s starting a photography club at school.',
    ].join('\n'),
    options: ['a book', 'a camera', 'chocolates', 'a football', 'a plant', 'a scarf', 'a video game', 'a watch'],
    questions: rows('listening-key-part5-001', [
      { person: 'her brother', correctAnswer: 3, explanation: 'Video games were too expensive, so she bought him a football.' },
      { person: 'her mother', correctAnswer: 4, explanation: 'Her mum has lots of scarves, so Anna got her a plant.' },
      { person: 'her grandfather', correctAnswer: 7, explanation: 'He is always late, so she bought him a watch.' },
      { person: 'her aunt', correctAnswer: 0, explanation: 'Aunt Mary loves reading; the chocolates were only an idea.' },
      { person: 'her cousin', correctAnswer: 1, explanation: 'Leo is starting a photography club, so she bought a camera.' },
    ]),
  },
]

/**
 * Dedicated mock-exam Set 1 recordings, one per part. Original, not official; `examOnly`. They
 * point at bundled seed WAVs (`pnpm stack:seed-audio`), so Set 1 plays without a TTS service.
 */
const mockListeningKeyPayloads: ListeningKeyExercise[] = [
  {
    id: 'mock-key-set1-listening-part1',
    title: 'Mock Set 1 · Part 1: Short conversations',
    testingPart: 1,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    items: items('mock-key-set1-listening-part1', [
      {
        context: 'At a café.',
        transcript:
          'Woman: Can I have a cheese sandwich, please? Man: Sorry, we haven\'t got any cheese left. We\'ve got chicken or egg. Woman: Hmm, I don\'t eat meat. I\'ll have the egg one, then. Man: Here you are.',
        question: 'What does the woman have?',
        options: ['a cheese sandwich', 'a chicken sandwich', 'an egg sandwich'],
        correctAnswer: 2,
        explanation: 'There is no cheese and she does not eat meat, so she takes the egg sandwich.',
      },
      {
        context: 'Two friends are talking about a party.',
        transcript:
          'Man: When is Tom\'s party? Is it on Friday? Woman: No, Friday is his brother\'s birthday. Tom\'s party is the next day, on Saturday. Man: Oh, and not on Sunday? Woman: No, everyone works on Monday.',
        question: 'When is Tom\'s party?',
        options: ['on Friday', 'on Saturday', 'on Sunday'],
        correctAnswer: 1,
        explanation: 'Friday is his brother\'s birthday; Tom\'s party is the next day, Saturday.',
      },
      {
        context: 'A girl is talking to her father.',
        transcript:
          'Girl: Dad, how much is the bus ticket to the city centre? Father: It used to be two pounds, but it\'s two pounds fifty now. Girl: OK. And a return ticket? Father: Four pounds, but you only need a single today.',
        question: 'How much does the girl need for her ticket?',
        options: ['£2.00', '£2.50', '£4.00'],
        correctAnswer: 1,
        explanation: 'A single now costs two pounds fifty, and she only needs a single.',
      },
      {
        context: 'A man is asking for directions.',
        transcript:
          'Man: Excuse me, where is the post office? Woman: Go straight on and it\'s next to the bank. Man: Next to the bank, not the library? Woman: No, the library is opposite the bank.',
        question: 'Where is the post office?',
        options: ['next to the bank', 'next to the library', 'opposite the bank'],
        correctAnswer: 0,
        explanation: 'The post office is next to the bank; the library is opposite it.',
      },
      {
        context: 'Two friends are planning a trip.',
        transcript:
          'Woman: Shall we go to the beach by bike? Man: It\'s too far. What about the train? Woman: The trains aren\'t running this weekend. Man: Then let\'s take the bus. Woman: Fine, the bus it is.',
        question: 'How will they travel to the beach?',
        options: ['by bike', 'by train', 'by bus'],
        correctAnswer: 2,
        explanation: 'The beach is too far by bike and there are no trains, so they take the bus.',
      },
    ]),
  },
  {
    id: 'mock-key-set1-listening-part2',
    title: 'Mock Set 1 · Part 2: A summer sports camp',
    testingPart: 2,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    context: 'You will hear a man talking about a summer sports camp for teenagers.',
    content: [
      'Riverside Summer Sports Camp',
      '',
      'Camp starts on: (1) ____ July',
      'Most popular sport: (2) ____',
      'Price for one week: £(3) ____',
      'Bring a water bottle and a (4) ____',
      'Contact: Mr (5) ____',
    ].join('\n'),
    transcript:
      'Good morning, everyone. I\'d like to tell you about the Riverside Summer Sports Camp. This year the camp starts on the twelfth of July – not the tenth, as it said in our old leaflet. You can try lots of sports, like football, tennis and basketball, but the one most students choose is climbing. One week at the camp costs ninety-five pounds, and that includes lunch every day. Please bring a water bottle and a hat, because it can be very hot by the river. If you have any questions, please speak to Mr Pritchard. That\'s P-R-I-T-C-H-A-R-D. He\'s in the sports office every afternoon.',
    questions: rows<Omit<KeyGap, 'id'>>('mock-key-set1-listening-part2', [
      { question: 'Camp starts on', accepted: ['12', '12th', 'twelfth', '12 July', '12th July'], explanation: 'The camp starts on the twelfth of July, not the tenth.' },
      { question: 'Most popular sport', accepted: ['climbing'], explanation: 'The sport most students choose is climbing.' },
      { question: 'Price for one week', accepted: ['95', 'ninety-five', 'ninety five'], explanation: 'One week costs ninety-five pounds.' },
      { question: 'Bring', accepted: ['hat'], explanation: 'Bring a water bottle and a hat because it can be hot.' },
      { question: 'Contact', accepted: ['Pritchard'], explanation: 'The name is spelled out: P-R-I-T-C-H-A-R-D.' },
    ]),
  },
  {
    id: 'mock-key-set1-listening-part3',
    title: 'Mock Set 1 · Part 3: A new job',
    testingPart: 3,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    context: 'You will hear Emma talking to her friend Jack about his new job.',
    transcript: [
      'Emma: Hi Jack! How\'s your new job at the bookshop?',
      'Jack: Really good, thanks. I work there on Saturdays and Sundays. I wanted to work after school, but they only needed someone at the weekend.',
      'Emma: What do you do there?',
      'Jack: Mostly I put new books on the shelves. I thought I would work at the till, but my manager says I need more training first.',
      'Emma: Do you like the people there?',
      'Jack: Yes, my manager is very kind. The other assistant is quite quiet, but she knows everything about books.',
      'Emma: How do you get there? It\'s quite far from your house.',
      'Jack: My mum drove me on the first day, but now I cycle. It takes about twenty minutes.',
      'Emma: And what are you going to do with the money?',
      'Jack: I\'m saving for a new laptop. I need one for my school projects next year.',
    ].join('\n'),
    questions: rows<Omit<KeyChoiceQuestion, 'id'>>('mock-key-set1-listening-part3', [
      { question: 'When does Jack work at the bookshop?', options: ['after school', 'at the weekend', 'every day'], correctAnswer: 1, explanation: 'He works on Saturdays and Sundays.' },
      { question: 'What does Jack do in the shop now?', options: ['He works at the till.', 'He helps customers find books.', 'He puts books on the shelves.'], correctAnswer: 2, explanation: 'He mostly puts new books on the shelves; the till needs more training.' },
      { question: 'What does Jack say about the other assistant?', options: ['She is very friendly.', 'She knows a lot about books.', 'She is his manager.'], correctAnswer: 1, explanation: 'She is quiet but knows everything about books.' },
      { question: 'How does Jack travel to work now?', options: ['by bike', 'by car', 'on foot'], correctAnswer: 0, explanation: 'His mum drove him on the first day, but now he cycles.' },
      { question: 'What is Jack saving his money for?', options: ['a holiday', 'a computer', 'school books'], correctAnswer: 1, explanation: 'He is saving for a new laptop.' },
    ]),
  },
  {
    id: 'mock-key-set1-listening-part4',
    title: 'Mock Set 1 · Part 4: Five short recordings',
    testingPart: 4,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    items: items('mock-key-set1-listening-part4', [
      {
        context: 'A boy is talking about a school trip.',
        transcript:
          'Boy: The trip to the castle was great. The castle itself was quite small, and the weather wasn\'t very good, but the guide was brilliant. She told us lots of funny stories about the people who lived there.',
        question: 'You will hear a boy talking about a school trip. What did he enjoy most?',
        options: ['the castle', 'the weather', 'the guide'],
        correctAnswer: 2,
        explanation: 'The castle was small and the weather bad, but the guide was brilliant.',
      },
      {
        context: 'A woman is leaving a message for a friend.',
        transcript:
          'Woman: Hi Kate, it\'s Lisa. I\'m afraid I can\'t meet you for lunch tomorrow because I have to go to the dentist. Could we meet on Thursday instead? Call me back.',
        question: 'You will hear a woman leaving a message. Why is she calling?',
        options: ['to invite Kate to lunch', 'to change a plan', 'to ask about a dentist'],
        correctAnswer: 1,
        explanation: 'She cannot meet tomorrow and wants to meet on Thursday instead.',
      },
      {
        context: 'A man is talking about his new flat.',
        transcript:
          'Man: I love my new flat. It\'s a bit expensive and the kitchen is really small, but it\'s so quiet. In my old flat I could hear the traffic all night.',
        question: 'You will hear a man talking about his new flat. What does he like about it?',
        options: ['the price', 'the kitchen', 'the quiet'],
        correctAnswer: 2,
        explanation: 'It is expensive and the kitchen is small, but it is very quiet.',
      },
      {
        context: 'Two friends are talking about a film.',
        transcript:
          'Girl: Did you like the film? Boy: Not really. The actors were good, but the story was too slow. I nearly fell asleep. Girl: Really? I thought it was exciting.',
        question: 'You will hear two friends talking about a film. How did the boy feel about it?',
        options: ['bored', 'excited', 'surprised'],
        correctAnswer: 0,
        explanation: 'He found the story too slow and nearly fell asleep.',
      },
      {
        context: 'A shop announcement.',
        transcript:
          'Woman: Good afternoon, shoppers. The shop will close in fifteen minutes. Please take your shopping to the tills now. We open again tomorrow morning at eight.',
        question: 'You will hear an announcement in a shop. What should shoppers do?',
        options: ['come back in fifteen minutes', 'go to pay now', 'wait until eight o\'clock'],
        correctAnswer: 1,
        explanation: 'The shop closes soon, so shoppers should take their shopping to the tills.',
      },
    ]),
  },
  {
    id: 'mock-key-set1-listening-part5',
    title: 'Mock Set 1 · Part 5: Weekend jobs',
    testingPart: 5,
    difficulty: 'A2',
    createdAt: '2026-10-03',
    examOnly: true,
    context: 'You will hear Sophie telling her grandfather which jobs her family did last weekend. What did each person do?',
    transcript: [
      'Grandfather: Did your family have a busy weekend, Sophie?',
      'Sophie: Very busy! Dad wanted to paint the kitchen, but we didn\'t have enough paint, so he washed the car instead.',
      'Grandfather: And your mum?',
      'Sophie: She was going to clean the windows, but it rained all day. So she cooked lunch for everyone.',
      'Grandfather: What about your brother Max?',
      'Sophie: Max cut the grass in the garden. He hates it, but Dad paid him five pounds.',
      'Grandfather: And little Amy?',
      'Sophie: She wanted to help with the shopping, but she was too tired. She tidied her bedroom.',
      'Grandfather: And you?',
      'Sophie: I took the dog for a long walk by the river. Then I fed the fish.',
      'Grandfather: The fish? I thought that was Amy\'s job.',
      'Sophie: It is, but she forgot!',
    ].join('\n'),
    options: ['washed the car', 'painted the kitchen', 'cooked lunch', 'cleaned the windows', 'cut the grass', 'went shopping', 'tidied a bedroom', 'walked the dog'],
    questions: rows('mock-key-set1-listening-part5', [
      { person: 'her father', correctAnswer: 0, explanation: 'There was not enough paint, so he washed the car instead.' },
      { person: 'her mother', correctAnswer: 2, explanation: 'It rained, so instead of the windows she cooked lunch.' },
      { person: 'her brother', correctAnswer: 4, explanation: 'Max cut the grass for five pounds.' },
      { person: 'her sister', correctAnswer: 6, explanation: 'Amy was too tired to shop and tidied her bedroom.' },
      { person: 'Sophie', correctAnswer: 7, explanation: 'Sophie took the dog for a walk; feeding the fish is not an option.' },
    ]),
  },
]

export const mockListeningKeySeeds = mockListeningKeyPayloads.map(withSeedAudio)
