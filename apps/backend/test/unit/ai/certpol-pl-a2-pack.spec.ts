import {
  certpolPlA2,
  findPrompt,
  getLivePack,
  getPack,
  objectiveScore,
  validateReview,
  validateView,
  type SkillId,
} from '@exam-one/exam-packs'

function part(skill: SkillId, n: number) {
  return certpolPlA2.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function seed(skill: SkillId, n: number): Record<string, unknown> {
  return structuredClone(
    certpolPlA2.seedExercises![skill]!.find(s => s['testingPart'] === n)!
  ) as Record<string, unknown>
}

function rows(payload: Record<string, unknown>, key = 'questions'): Record<string, unknown>[] {
  return payload[key] as Record<string, unknown>[]
}

/** Skill, part, items and raw points: 0.5 per gap in reading I, II and V. */
const OBJECTIVE = [
  ['listening', 1, 10, 10],
  ['listening', 2, 5, 5],
  ['listening', 3, 5, 5],
  ['listening', 4, 5, 5],
  ['listening', 5, 5, 5],
  ['reading', 1, 10, 5],
  ['reading', 2, 10, 5],
  ['reading', 3, 5, 5],
  ['reading', 4, 5, 5],
  ['reading', 5, 10, 5],
  ['reading', 6, 5, 5],
] as const

const RUBRIC = [
  ['writing', 1, 6],
  ['writing', 2, 14],
  ['speaking', 1, 6],
  ['speaking', 2, 15],
  ['speaking', 3, 15],
] as const

describe('Certyfikat Polski A2 pack', () => {
  it('is live and selectable by alias, keeps Goethe A2 the default, and has mocks', () => {
    expect(getLivePack('certpol-pl-a2').packId).toBe('certpol-pl-a2')
    expect(getPack('polish-a2')?.packId).toBe('certpol-pl-a2')
    expect(getLivePack(undefined).packId).toBe('goethe-de-a2')
    expect(certpolPlA2.createMockSet).toBeDefined()
    expect(certpolPlA2.bundledMockSet?.id).toBe('certpol-pl-a2-set-1')
    expect(certpolPlA2.speech).toMatchObject({ ttsLang: 'pl', sttLang: 'pl' })
  })

  it('totals 80 written points, as the exam does', () => {
    const total = certpolPlA2.structure
      .filter(m => m.id !== 'speaking')
      .flatMap(m => m.parts)
      .reduce((sum, p) => sum + p.runtime!.maxPoints, 0)
    expect(total).toBe(80)
  })

  it.each(OBJECTIVE)(
    'projects, validates and scores the %s part %i seed (%i items, %i points)',
    (skill, n, count, points) => {
      const p = part(skill, n)
      const payload = seed(skill, n)
      const view = p.adapter!.project(payload)
      expect(() => validateView(view, p.runtime!)).not.toThrow()
      expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
      expect(view.questions).toHaveLength(count)
      const right = Object.fromEntries(
        view.questions!.map(q => [q.id, q.accepted ? q.accepted.at(-1)!.toUpperCase() : q.correctAnswer])
      )
      const wrong = Object.fromEntries(
        view.questions!.map(q => [q.id, q.accepted ? 'x' : (q.correctAnswer + 1) % q.options.length])
      )
      expect(objectiveScore(view, p.runtime!, right).score).toBe(points)
      expect(objectiveScore(view, p.runtime!, wrong).score).toBe(0)
      expect(findPrompt(certpolPlA2, skill, n, 'generator')).toBeDefined()
    }
  )

  it('gives half a point per form field and accepts listed number variants', () => {
    const p = part('reading', 5)
    const view = p.adapter!.project(seed('reading', 5))
    const [age] = view.questions!.filter(q => q.text === 'Wiek')
    expect(objectiveScore(view, p.runtime!, { [age!.id]: 'trzydzieści cztery lata' }).score).toBe(0.5)
    const time = part('listening', 5).adapter!.project(seed('listening', 5)).questions![1]!
    for (const answer of ['19:30', '19.30', 'Dziewiętnasta trzydzieści.'])
      expect(objectiveScore({ ...view, questions: [time] }, { ...p.runtime!, maxPoints: 1 }, { [time.id]: answer }).score).toBe(1)
  })

  it('stores listening true/false as Prawda / Fałsz questions, not German statements', () => {
    const p = part('listening', 2)
    const payload = seed('listening', 2)
    expect(rows(payload).every(q => (q['options'] as string[]).join() === 'Prawda,Fałsz')).toBe(true)
    rows(payload)[0]!['statement'] = rows(payload)[0]!['question']
    expect(() => p.validate!(payload, p.runtime!)).toThrow('not "statement"')
  })

  it('rejects gaps in a text that do not match the questions', () => {
    const payload = seed('reading', 1)
    payload['content'] = String(payload['content']).replace('(10) ____', 'przyjedziesz')
    expect(() => part('reading', 1).validate!(payload, part('reading', 1).runtime!)).toThrow('(1) ____ to (10) ____')
  })

  it('rejects a word box that differs between questions', () => {
    const payload = seed('reading', 2)
    rows(payload)[4]!['options'] = [...(rows(payload)[4]!['options'] as string[])].reverse()
    expect(() => part('reading', 2).validate!(payload, part('reading', 2).runtime!)).toThrow('same options')
  })

  it('rejects a matching option used twice', () => {
    const p = part('listening', 3)
    const payload = seed('listening', 3)
    rows(payload)[1]!['correctAnswer'] = rows(payload)[0]!['correctAnswer']
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).toThrow('unique')
  })

  it('rejects a gap that carries options or an answer index', () => {
    const payload = seed('listening', 5)
    rows(payload)[1]!['correctAnswer'] = 0
    expect(() => part('listening', 5).validate!(payload, part('listening', 5).runtime!)).toThrow('use accepted')
  })

  it('rejects a dialogue without Polish speaker labels', () => {
    const payload = seed('listening', 3)
    payload['transcript'] = 'Cześć, co u ciebie? Dobrze, dziękuję.'
    expect(() => part('listening', 3).validate!(payload, part('listening', 3).runtime!)).toThrow('labelled')
  })

  it.each(RUBRIC)('projects and validates the %s part %i seed with a %i-point rubric', (skill, n, points) => {
    const p = part(skill, n)
    const payload = seed(skill, n)
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).not.toThrow()
    expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
    expect(p.runtime!.maxPoints).toBe(points)
  })

  it('uses examiner cards for speaking tasks 1 and 3 and a keyword monologue for task 2', () => {
    expect(part('speaking', 1).layout).toBe('word-cards')
    expect(part('speaking', 2).layout).toBeUndefined()
    expect(part('speaking', 3).layout).toBe('word-cards')
    const payload = seed('speaking', 3)
    delete rows(payload, 'cards')[2]!['speaker']
    expect(() => part('speaking', 3).validate!(payload, part('speaking', 3).runtime!)).toThrow('examiner')
  })

  it('rejects a writing word range that differs from the part field', () => {
    const payload = seed('writing', 2)
    payload['wordCount'] = { min: 80, max: 90 }
    expect(() => part('writing', 2).validate!(payload, part('writing', 2).runtime!)).toThrow('wordCount')
  })

  it('leaves no unresolved placeholder in a generator prompt but {count}', () => {
    for (const spec of certpolPlA2.prompts.filter(p => p.kind === 'generator')) {
      const text = spec.assemble({ count: 2 })
      expect(text).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it.each(RUBRIC)('resolves every %s part %i answer and review variable', (skill, n) => {
    const p = part(skill, n)
    const ids = skill === 'writing' ? ['answer'] : p.runtime!.segments!.map(s => s.id)
    const answers = Object.fromEntries(ids.map(id => [id, 'Lubię czytać książki, bo to jest ciekawe.']))
    for (const kind of ['answer', 'review'] as const) {
      const vars = certpolPlA2.buildReviewVars!({
        skill,
        part: n,
        kind,
        payload: seed(skill, n),
        answers,
        outputLanguage: 'German',
      })
      const text = findPrompt(certpolPlA2, skill, n, kind)!.assemble(vars)
      expect(text).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it.each(RUBRIC)('accepts a %s part %i review on its criteria and rejects a wrong maximum', (skill, n, points) => {
    const rules = part(skill, n).runtime!
    const review = {
      criteria: rules.criteria!.map(c => ({ ...c, points: c.maxPoints / 2, comment: 'ok' })),
      totalPoints: points / 2,
      maxPoints: points,
      summary: 'Dobrze',
      strengths: [],
      improvements: [],
    }
    expect(validateReview(review, rules).totalPoints).toBe(points / 2)
    expect(() => validateReview({ ...review, maxPoints: points + 1 }, rules)).toThrow('total')
  })
})
