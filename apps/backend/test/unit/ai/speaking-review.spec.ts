import { getPack, validateReview } from '@exam-one/exam-packs'

const pack = getPack('goethe-de-a2')!
const speaking = pack.structure.find(module => module.id === 'speaking')!
const partFor = (n: number) => speaking.parts.find(p => p.n === n)!

/**
 * The legacy normaliser rejected a topic that was not exactly four cards, and synthesised
 * `topicType`. `validateView` can replace neither: for speaking it only compares the part's
 * own `segments` back to themselves, and it never sees `topicType` at all.
 */
describe('pack speaking generation', () => {
  const teil1 = () => ({
    testingPart: 1,
    topicType: 'interview',
    theme: 'Fragen zur Person',
    answerQuestions: ['Wie heißt du?', 'Woher kommst du?', 'Wo wohnst du?', 'Was machst du?'],
    askQuestions: ['Wie alt bist du?', 'Hast du Geschwister?', 'Was isst du gern?', 'Wann stehst du auf?'],
  })

  const teil2 = () => ({
    testingPart: 2,
    topicType: 'monologue',
    theme: 'Was machen Sie in Ihrer Freizeit?',
    keywords: ['Sport?', 'Mit wem?', 'Wann?', 'Wo?'],
  })

  it('accepts a well formed Teil 1 topic', () => {
    expect(() => partFor(1).validate!(teil1(), partFor(1).runtime!)).not.toThrow()
  })

  it('accepts a well formed Teil 2 topic', () => {
    expect(() => partFor(2).validate!(teil2(), partFor(2).runtime!)).not.toThrow()
  })

  it('rejects a card list that is not exactly four entries', () => {
    const payload = teil1()
    expect(() =>
      partFor(1).validate!({ ...payload, askQuestions: payload.askQuestions.slice(1) }, partFor(1).runtime!)
    ).toThrow('exactly 4')
  })

  it('rejects a blank card, which would render an empty prompt', () => {
    const payload = teil2()
    payload.keywords[2] = '   '
    expect(() => partFor(2).validate!(payload, partFor(2).runtime!)).toThrow('keywords[2]')
  })

  it('rejects a missing theme', () => {
    const { theme: _theme, ...withoutTheme } = teil2()
    expect(() => partFor(2).validate!(withoutTheme, partFor(2).runtime!)).toThrow('theme')
  })

  it('rejects the wrong topicType, which would mislabel the session card', () => {
    expect(() =>
      partFor(1).validate!({ ...teil1(), topicType: 'monologue' }, partFor(1).runtime!)
    ).toThrow('topicType')
  })
})

/**
 * Speaking's review prompt takes seven variables. An unknown placeholder is passed through
 * verbatim, so without these the model grades a prompt full of literal braces and returns a
 * confident, fabricated score.
 */
describe('pack speaking prompt variables', () => {
  const topic = {
    id: 'speaking-a2-part1-abc',
    testingPart: 1,
    theme: 'Alltag',
    answerQuestions: ['Frage A', 'Frage B', 'Frage C', 'Frage D'],
    askQuestions: ['Frage E', 'Frage F', 'Frage G', 'Frage H'],
  }
  const transcripts = { answers: ' Ich wohne in Berlin. ', questions: 'Wie alt bist du?' }

  it('leaves no unresolved placeholder in either Teil', () => {
    for (const part of [1, 2]) {
      const spec = pack.prompts.find(s => s.skill === 'speaking' && s.part === part && s.kind === 'review')!
      const vars = pack.buildReviewVars!({
        skill: 'speaking',
        part,
        kind: 'review',
        payload: part === 1 ? topic : { ...topic, testingPart: 2, keywords: ['a', 'b', 'c', 'd'] },
        answers: part === 1 ? transcripts : { monologue: 'Ich spiele Fussball.' },
        outputLanguage: 'de',
      })
      expect(spec.assemble(vars)).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it('numbers the cards on separate lines rather than comma-joining them', () => {
    const vars = pack.buildReviewVars!({
      skill: 'speaking',
      part: 1,
      kind: 'review',
      payload: topic,
      answers: transcripts,
      outputLanguage: 'en',
    })
    expect(vars['answerQuestions']).toBe('1. Frage A\n2. Frage B\n3. Frage C\n4. Frage D')
    expect(vars['keywords']).toBe('')
    expect(vars['answers']).toBe('Ich wohne in Berlin.')
  })
})

describe('stored speaking rubric', () => {
  const rubric = (overrides: Record<string, unknown> = {}) => ({
    criteria: [
      { id: 'answers', label: 'Answers', maxPoints: 2, points: 2, comment: 'Klar.' },
      { id: 'questions', label: 'Questions', maxPoints: 2, points: 1, comment: 'Teilweise.' },
    ],
    totalPoints: 3,
    maxPoints: 4,
    summary: 'Gut.',
    strengths: ['Verständlich'],
    improvements: ['Fragen üben'],
    ...overrides,
  })

  it('accepts a rubric through validateStoredReview', () => {
    const part = partFor(1)
    expect(() =>
      part.adapter!.validateStoredReview!({ review: rubric() }, part.runtime!)
    ).not.toThrow()
  })

  it('rejects a tampered total', () => {
    const part = partFor(1)
    expect(() =>
      part.adapter!.validateStoredReview!({ review: rubric({ totalPoints: 4 }) }, part.runtime!)
    ).toThrow('Invalid saved speaking rubric or total')
  })

  it('still accepts an older rubric that carries teil', () => {
    // `teil` left the prompt contract, but stored rows predate that and must keep opening.
    const part = partFor(1)
    expect(() =>
      part.adapter!.validateStoredReview!({ review: rubric({ teil: 1 }) }, part.runtime!)
    ).not.toThrow()
  })

  it('drops teil rather than passing it through', () => {
    expect(validateReview(rubric({ teil: 1 }), partFor(1).runtime!)).not.toHaveProperty('teil')
  })
})

/**
 * The overview has no skill or part, so `findPrompt` cannot reach it — hence a pack slot.
 * Nothing downstream trims the lists, so the slot must.
 */
describe('pack mock overview slot', () => {
  const overview = pack.mockOverview!
  const item = (skill: string) => ({ skill, text: 'x' })

  it('is registered with the settings the legacy runner used', () => {
    expect(overview.llm).toEqual({ temperature: 0.3, maxTokens: 900 })
    expect(overview.system).toContain('Goethe A2')
  })

  it('trims each list to three, which the card assumes but never enforces', () => {
    const parsed = overview.parse({
      summary: 's',
      strengths: ['reading', 'writing', 'speaking', 'listening'].map(item),
      focusAreas: ['reading', 'writing', 'speaking', 'listening'].map(item),
      nextSteps: ['a', 'b', 'c', 'd'],
    }) as { strengths: unknown[]; focusAreas: unknown[]; nextSteps: unknown[] }
    expect(parsed.strengths).toHaveLength(3)
    expect(parsed.focusAreas).toHaveLength(3)
    expect(parsed.nextSteps).toHaveLength(3)
  })

  it('rejects an unknown skill, which would render an unlabelled row', () => {
    expect(
      overview.parse({ summary: 's', strengths: [item('maths')], focusAreas: [], nextSteps: [] })
    ).toBeNull()
  })

  it('rejects a malformed response', () => {
    expect(overview.parse({ summary: 's' })).toBeNull()
    expect(overview.parse(null)).toBeNull()
  })

  it('builds a prompt carrying the language and the result', () => {
    const prompt = overview.assemble('de', { overallPoints: 42, modules: [] } as never)
    expect(prompt).toContain('de')
    expect(prompt).toContain('42')
  })
})
