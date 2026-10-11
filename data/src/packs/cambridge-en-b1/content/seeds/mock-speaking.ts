function exercise(part: number, theme: string, cues: string[], askFirst = false) {
  return {
    id: `mock-cambridge-en-b1-set1-speaking-part${part}`,
    testingPart: part,
    difficulty: 'B1',
    createdAt: '2026-10-10',
    examOnly: true,
    theme,
    topicType: 'interview',
    cards: cues.map((cue, index) => ({
      segment: `turn${index + 1}`,
      kind: askFirst && index === 0 ? 'ask' : 'answer',
      topic: theme,
      cue,
      ...(askFirst && index === 0 ? {} : { speaker: 'examiner' }),
    })),
  }
}

export const mockSpeakingSeeds: Record<string, unknown>[] = [
  exercise(1, 'Interview: everyday interests', [
    'What do you enjoy doing at weekends, and why?',
    'Tell me about a place you would like to visit.',
    'How do you usually keep in touch with your friends?',
  ]),
  exercise(2, 'Extended turn: a group learning outdoors', [
    'Written scene: Five adults are in a park learning to draw. A teacher stands beside a board showing a sketch of a tree. Two people sit on folding chairs and look at their notebooks. Another person points towards the lake while their partner holds pencils. Bags and a bottle of water are on the grass. Describe the people, place and activities for about one minute, adding careful guesses.',
  ]),
  exercise(
    3,
    'Discussion: a day out for a visiting friend',
    [
      'A friend is visiting your town for one day. The possible activities are a guided museum visit, a picnic in the park, a cycling tour, a cooking workshop and a boat trip. Suggest an activity and ask your partner what they think.',
      'Partner: The museum would be interesting, but our friend likes being active. What other option might be better? Respond and suggest another possibility.',
      'Partner: We could choose the cycling tour or the cooking workshop. Compare what our friend would enjoy about these two activities.',
      'Partner: We only have enough time for one activity. Which should we choose? Give a reason and agree on a plan.',
    ],
    true
  ),
  exercise(4, 'General conversation: activities and visitors', [
    'Do you prefer trying a new activity with other people or on your own? Why?',
    'Tell me about a day out that you particularly enjoyed.',
    'What can towns do to make visitors feel welcome?',
  ]),
]
