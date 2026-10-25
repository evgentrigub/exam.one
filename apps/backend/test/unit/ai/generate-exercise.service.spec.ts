import { coerceAnswerIndices, getPack, withQuestionIds } from '@exam-one/exam-packs'

/**
 * Reading generation runs on the generic prompt path, so the guards that used to live
 * in the compatibility runner now hang off the part as `validate`. These cover what
 * `validateView` cannot see: it only inspects the projection, which coerces missing
 * values into strings.
 */
describe('pack reading generation', () => {
  const pack = getPack('goethe-de-a2')!
  const part = pack.structure.find(module => module.id === 'reading')!.parts.find(p => p.n === 1)!

  const exercise = () => ({
    title: 'Paella mit Bauernbrot',
    content: 'Ein kurzer Zeitungsartikel über Integration.',
    textType: 'article',
    testingPart: 1,
    difficulty: 'A2',
    estimatedReadingTime: 4,
    wordCount: 200,
    topics: ['Integration'],
    questions: Array.from({ length: 5 }, (_, index) => ({
      question: `Frage ${index + 1}?`,
      options: ['a', 'b', 'c'],
      correctAnswer: 0,
      explanation: 'Steht im Text.',
      type: 'comprehension',
    })),
  })

  it('accepts a well formed exercise', () => {
    expect(() => part.validate!(exercise(), part.runtime!)).not.toThrow()
  })

  it('rejects an unknown text type', () => {
    expect(() => part.validate!({ ...exercise(), textType: 'blog' }, part.runtime!)).toThrow(
      'textType'
    )
  })

  it('rejects an unknown question type', () => {
    const payload = exercise()
    payload.questions[0]!.type = 'opinion'
    expect(() => part.validate!(payload, part.runtime!)).toThrow('type')
  })

  it('rejects missing text metadata', () => {
    const { topics: _topics, ...withoutTopics } = exercise()
    expect(() => part.validate!(withoutTopics, part.runtime!)).toThrow('topics')
  })

  it('coerces a numeric answer index sent as a string', () => {
    const payload = coerceAnswerIndices({
      ...exercise(),
      questions: [{ question: 'Frage?', options: ['a', 'b', 'c'], correctAnswer: '2' }],
    })
    expect((payload['questions'] as Array<{ correctAnswer: unknown }>)[0]!.correctAnswer).toBe(2)
  })

  it('never coerces typed gap answers, which live outside correctAnswer', () => {
    const payload = coerceAnswerIndices({
      ...exercise(),
      questions: [{ question: 'Gap 1', accepted: ['15', 'fifteen'] }],
    })
    expect((payload['questions'] as Array<{ accepted: unknown }>)[0]!.accepted).toEqual([
      '15',
      'fifteen',
    ])
  })

  it('leaves a non-numeric answer index alone so validation can reject it', () => {
    const payload = coerceAnswerIndices({
      ...exercise(),
      questions: [{ question: 'Frage?', options: ['a', 'b', 'c'], correctAnswer: 'zwei' }],
    })
    expect((payload['questions'] as Array<{ correctAnswer: unknown }>)[0]!.correctAnswer).toBe(
      'zwei'
    )
  })
})

/**
 * Listening's guards matter more than reading's: `validateView` never sees a transcript,
 * so without them an exercise with no transcript validates, stores, and can never have
 * audio synthesised for it.
 */
describe('pack listening generation', () => {
  const pack = getPack('goethe-de-a2')!
  const module = pack.structure.find(module => module.id === 'listening')!
  const partFor = (n: number) => module.parts.find(p => p.n === n)!

  const items = () =>
    Array.from({ length: 5 }, (_, index) => ({
      context: 'Sie hören eine Durchsage.',
      transcript: `Durchsage ${index + 1}.`,
      question: `Frage ${index + 1}?`,
      options: ['a', 'b', 'c'],
      correctAnswer: 0,
      explanation: 'Steht im Text.',
    }))

  const teil1 = () => ({ title: 'Durchsagen', testingPart: 1, items: items() })

  const teil2 = () => ({
    title: 'Gespräch',
    testingPart: 2,
    context: 'Was schenken die Personen?',
    transcript: 'Mann: Hallo. Frau: Hallo.',
    options: Array.from({ length: 9 }, (_, index) => `Option ${index + 1}`),
    questions: Array.from({ length: 5 }, (_, index) => ({
      person: `Person ${index + 1}`,
      correctAnswer: index,
      explanation: 'Steht im Text.',
    })),
  })

  const teil4 = () => ({
    title: 'Radiosendung',
    testingPart: 4,
    context: 'Sie hören ein Interview.',
    transcript: 'Mann: Guten Tag. Frau: Guten Tag.',
    questions: Array.from({ length: 5 }, (_, index) => ({
      statement: `Aussage ${index + 1}.`,
      correctAnswer: index % 2 === 0,
      explanation: 'Steht im Text.',
      type: 'true_false',
    })),
  })

  it('accepts a well formed Teil 1 exercise', () => {
    const part = partFor(1)
    expect(() => part.validate!(teil1(), part.runtime!)).not.toThrow()
  })

  it('accepts a well formed Teil 2 exercise', () => {
    const part = partFor(2)
    expect(() => part.validate!(teil2(), part.runtime!)).not.toThrow()
  })

  it('accepts a well formed Teil 4 exercise', () => {
    const part = partFor(4)
    expect(() => part.validate!(teil4(), part.runtime!)).not.toThrow()
  })

  it('rejects an item with no transcript, which could never have audio', () => {
    const part = partFor(1)
    const payload = teil1()
    payload.items[2] = { ...payload.items[2]!, transcript: '   ' }
    expect(() => part.validate!(payload, part.runtime!)).toThrow('transcript')
  })

  it('rejects a Teil 2 exercise with no shared transcript', () => {
    const part = partFor(2)
    const { transcript: _transcript, ...withoutTranscript } = teil2()
    expect(() => part.validate!(withoutTranscript, part.runtime!)).toThrow('transcript')
  })

  it('rejects an exercise that does not have exactly five items', () => {
    const part = partFor(1)
    const payload = teil1()
    expect(() =>
      part.validate!({ ...payload, items: payload.items.slice(1) }, part.runtime!)
    ).toThrow('exactly 5')
  })

  it('rejects a Teil 2 exercise without nine shared options', () => {
    const part = partFor(2)
    const payload = teil2()
    expect(() =>
      part.validate!({ ...payload, options: payload.options.slice(1) }, part.runtime!)
    ).toThrow('exactly 9')
  })

  it('rejects a Teil 4 answer that is not a boolean', () => {
    const part = partFor(4)
    const payload = teil4()
    payload.questions[0] = { ...payload.questions[0]!, correctAnswer: 1 as unknown as boolean }
    expect(() => part.validate!(payload, part.runtime!)).toThrow('boolean')
  })

  it('stamps item ids that the audio map and the projection agree on', () => {
    const id = 'listening-a2-part1-abc-def'
    const payload = withQuestionIds({ ...teil1(), id })
    const stamped = payload['items'] as Array<{ id: string }>
    expect(stamped.map(item => item.id)).toEqual([1, 2, 3, 4, 5].map(n => `${id}-i${n}`))

    const part = partFor(1)
    const view = part.adapter!.project(payload)
    expect(view.questions!.map(question => question.id)).toEqual(stamped.map(item => item.id))
  })
})
