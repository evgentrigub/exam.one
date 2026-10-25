import { getPack, validateReview } from '@exam-one/exam-packs'
import { extractJsonObject } from '../../../src/ai/json'

/**
 * Writing runs on the generic prompt path, so its rubric is a `CriterionReview` rather than
 * the object-keyed A2 shape. These cover the three things that migration depends on: the
 * rubric validates, the prompt gets real variables instead of literal `{placeholders}`, and
 * a stored rubric still passes the attempt's own validator.
 */
describe('pack writing review', () => {
  const pack = getPack('goethe-de-a2')!
  const module = pack.structure.find(module => module.id === 'writing')!
  const partFor = (n: number) => module.parts.find(p => p.n === n)!

  const rubric = (overrides: Record<string, unknown> = {}) => ({
    criteria: [
      {
        id: 'aufgabenerfuellung',
        label: 'Task completion',
        maxPoints: 5,
        grade: 'B',
        points: 3.5,
        comment: 'Alle drei Punkte genannt.',
      },
      { id: 'sprache', label: 'Language', maxPoints: 5, grade: 'A', points: 5, comment: 'Klar.' },
    ],
    totalPoints: 8.5,
    maxPoints: 10,
    summary: 'Gut gemacht.',
    strengths: ['Klare Struktur'],
    improvements: ['Mehr Konnektoren'],
    wordCount: { actual: 26, min: 20, max: 30 },
    ruleApplied: 'none',
    checks: [
      { id: 'register', expected: 'du', detected: 'du', ok: true },
      { id: 'contentPoints', required: 3, covered: 3 },
    ],
    priorityFixes: ['Kommasetzung'],
    examples: [{ error: 'ich gehe', correction: 'Ich gehe', rule: 'Großschreibung' }],
    report: 'Insgesamt solide.',
    ...overrides,
  })

  it('accepts the rubric the prompt asks for, keeping the rich fields', () => {
    const review = validateReview(rubric(), partFor(1).runtime!)
    expect(review.totalPoints).toBe(8.5)
    expect(review.maxPoints).toBe(10)
    expect(review.criteria.map(c => c.id)).toEqual(['aufgabenerfuellung', 'sprache'])
    expect(review.criteria[0]!.grade).toBe('B')
    expect(review.wordCount).toEqual({ actual: 26, min: 20, max: 30 })
    expect(review.ruleApplied).toBe('none')
    expect(review.checks).toHaveLength(2)
    expect(review.priorityFixes).toEqual(['Kommasetzung'])
    expect(review.examples).toHaveLength(1)
    expect(review.report).toBe('Insgesamt solide.')
  })

  it('rejects a total that does not match the criteria sum', () => {
    expect(() => validateReview(rubric({ totalPoints: 10 }), partFor(1).runtime!)).toThrow(
      'Invalid review total'
    )
  })

  it('rejects a criterion scored above its maximum', () => {
    const invalid = rubric()
    invalid.criteria[0]!.points = 6
    expect(() => validateReview(invalid, partFor(1).runtime!)).toThrow('Invalid criterion score')
  })

  it('totalPoints equals what the mock page used to read as teil_points_mess', () => {
    // The criteria sum to maxPoints: 10, so the displayed score is unchanged by the migration.
    const review = validateReview(rubric(), partFor(2).runtime!)
    const rules = partFor(2).runtime!
    expect(review.maxPoints).toBe(rules.maxPoints)
    expect(review.totalPoints).toBe(review.criteria.reduce((sum, c) => sum + c.points, 0))
    expect(review.totalPoints * (rules.multiplier ?? 1)).toBeCloseTo(10.625)
  })

  it('accepts a stored rubric through the attempt validator', () => {
    const part = partFor(1)
    const stored = { writingReview: { responseData: rubric() } }
    expect(() => part.adapter!.validateStoredReview!(stored, part.runtime!)).not.toThrow()
  })

  it('rejects a stored rubric whose total was tampered with', () => {
    const part = partFor(1)
    const stored = { writingReview: { responseData: rubric({ totalPoints: 10 }) } }
    expect(() => part.adapter!.validateStoredReview!(stored, part.runtime!)).toThrow(
      'Invalid saved writing rubric'
    )
  })
})

describe('pack writing prompt variables', () => {
  const pack = getPack('goethe-de-a2')!
  const topic = {
    id: 'a2-part1-abc',
    task: 'Schreiben Sie Ihrer Freundin eine SMS.',
    requirements: ['Grund nennen', 'Zeit vorschlagen', 'Sich entschuldigen'],
    testingPart: 1,
  }

  it.each([['answer' as const], ['review' as const]])(
    'leaves no unresolved placeholder in the %s prompt',
    kind => {
      const spec = pack.prompts.find(s => s.skill === 'writing' && s.part === 1 && s.kind === kind)!
      const vars = pack.buildReviewVars!({
        skill: 'writing',
        part: 1,
        kind,
        payload: topic,
        answers: { answer: 'Hallo Anna, ich kann leider nicht kommen.' },
        outputLanguage: 'de',
      })
      expect(spec.assemble(vars)).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  )

  it('passes the requirements as a readable list, not a JSON blob', () => {
    const vars = pack.buildReviewVars!({
      skill: 'writing',
      part: 1,
      kind: 'review',
      payload: topic,
      answers: { answer: 'Hallo' },
      outputLanguage: 'en',
    })
    expect(vars['requirements']).toBe('Grund nennen, Zeit vorschlagen, Sich entschuldigen')
    expect(vars['userContent']).toBe('Hallo')
  })
})

/**
 * The model answer used to come back as `{ text: raw }`, which the writing screen could not
 * parse: it needs `content` and `wordCount`.
 */
describe('model answer extraction', () => {
  it('pulls the object out of a fenced response', () => {
    const raw = '```json\n{"topicId":"t1","content":"Hallo","wordCount":1}\n```'
    expect(extractJsonObject(raw)).toEqual({ topicId: 't1', content: 'Hallo', wordCount: 1 })
  })

  it('pulls the object out of surrounding prose', () => {
    const raw = 'Here you go:\n{"content":"Hallo","wordCount":1}\nHope that helps!'
    expect(extractJsonObject(raw)).toEqual({ content: 'Hallo', wordCount: 1 })
  })

  it('returns null when there is no object at all', () => {
    expect(extractJsonObject('no json here')).toBeNull()
  })

  it('reaches into a single-element array, which models sometimes wrap the answer in', () => {
    expect(extractJsonObject('[{"content":"Hallo"}]')).toEqual({ content: 'Hallo' })
  })
})

/**
 * The legacy normaliser rejected a topic missing its task metadata; `validateView` cannot,
 * because for writing it only compares the part's own rules back to themselves.
 */
describe('pack writing generation', () => {
  const pack = getPack('goethe-de-a2')!
  const part = pack.structure.find(module => module.id === 'writing')!.parts.find(p => p.n === 1)!

  const topic = () => ({
    title: 'Termin absagen',
    topicType: 'note',
    testingPart: 1,
    estimatedTime: 15,
    wordCount: { min: 20, max: 30 },
    category: ['Alltag'],
    description: 'Eine kurze SMS an eine Freundin.',
    task: 'Schreiben Sie Ihrer Freundin eine SMS.',
    requirements: ['Grund nennen', 'Zeit vorschlagen', 'Sich entschuldigen'],
  })

  it('accepts a well formed topic', () => {
    expect(() => part.validate!(topic(), part.runtime!)).not.toThrow()
  })

  it('rejects a topic with no task, which would be graded against a blank exercise', () => {
    const { task: _task, ...withoutTask } = topic()
    expect(() => part.validate!(withoutTask, part.runtime!)).toThrow('task')
  })

  it('rejects a topic with no requirements', () => {
    expect(() => part.validate!({ ...topic(), requirements: [] }, part.runtime!)).toThrow(
      'requirements'
    )
  })

  it('rejects an unknown topic type', () => {
    expect(() => part.validate!({ ...topic(), topicType: 'letter' }, part.runtime!)).toThrow(
      'topicType'
    )
  })

  it('rejects a malformed word count range', () => {
    expect(() => part.validate!({ ...topic(), wordCount: { min: 20 } }, part.runtime!)).toThrow(
      'wordCount'
    )
  })
})
