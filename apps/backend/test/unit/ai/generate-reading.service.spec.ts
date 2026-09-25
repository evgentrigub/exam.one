import { coerceAnswerIndices, getPack } from '@exam-one/exam-packs'

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
    expect(() => part.validate!({ ...exercise(), textType: 'blog' }, part.runtime!)).toThrow('textType')
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

  it('leaves a non-numeric answer index alone so validation can reject it', () => {
    const payload = coerceAnswerIndices({
      ...exercise(),
      questions: [{ question: 'Frage?', options: ['a', 'b', 'c'], correctAnswer: 'zwei' }],
    })
    expect((payload['questions'] as Array<{ correctAnswer: unknown }>)[0]!.correctAnswer).toBe('zwei')
  })
})
