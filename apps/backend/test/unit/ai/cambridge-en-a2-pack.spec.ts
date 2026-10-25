import {
  cambridgeEnA2,
  findPrompt,
  getLivePack,
  getPack,
  objectiveScore,
  validateReview,
  validateView,
  type SkillId,
} from '@exam-one/exam-packs'

function part(skill: SkillId, n: number) {
  return cambridgeEnA2.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function seed(skill: SkillId, n: number): Record<string, unknown> {
  return structuredClone(
    cambridgeEnA2.seedExercises![skill]!.find(s => s['testingPart'] === n)!
  ) as Record<string, unknown>
}

function rows(payload: Record<string, unknown>, key = 'questions'): Record<string, unknown>[] {
  return payload[key] as Record<string, unknown>[]
}

const OBJECTIVE = [
  ['reading', 1, 6],
  ['reading', 2, 7],
  ['reading', 3, 5],
  ['reading', 4, 6],
  ['reading', 5, 6],
  ['listening', 1, 5],
  ['listening', 2, 5],
  ['listening', 3, 5],
  ['listening', 4, 5],
  ['listening', 5, 5],
] as const

describe('Cambridge A2 Key pack', () => {
  it('is live and selectable by alias, falls back to the Cambridge A2 Key default, and has mock exams', () => {
    expect(getLivePack('cambridge-en-a2').packId).toBe('cambridge-en-a2')
    expect(getPack('a2-key')?.packId).toBe('cambridge-en-a2')
    expect(getLivePack(undefined).packId).toBe('cambridge-en-a2')
    expect(cambridgeEnA2.createMockSet).toBeDefined()
    expect(cambridgeEnA2.bundledMockSet?.id).toBe('cambridge-a2-set-1')
    expect(cambridgeEnA2.speech).toMatchObject({ ttsLang: 'en', sttLang: 'en' })
  })

  it.each(OBJECTIVE)(
    'projects, validates and scores the %s part %i seed (%i items)',
    (skill, n, count) => {
      const p = part(skill, n)
      const payload = seed(skill, n)
      const view = p.adapter!.project(payload)
      expect(() => validateView(view, p.runtime!)).not.toThrow()
      expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
      expect(view.questions).toHaveLength(count)
      const right = Object.fromEntries(
        view.questions!.map(q => [
          q.id,
          q.accepted ? q.accepted.at(-1)!.toUpperCase() : q.correctAnswer,
        ])
      )
      const wrong = Object.fromEntries(
        view.questions!.map(q => [
          q.id,
          q.accepted ? 'x' : (q.correctAnswer + 1) % q.options.length,
        ])
      )
      expect(objectiveScore(view, p.runtime!, right).score).toBe(count)
      expect(objectiveScore(view, p.runtime!, wrong).score).toBe(0)
      expect(findPrompt(cambridgeEnA2, skill, n, 'generator')).toBeDefined()
    }
  )

  it('uses gap-fill for the open cloze and the listening notes', () => {
    expect(part('reading', 5).itemFormat).toBe('gap-fill')
    expect(part('listening', 2).itemFormat).toBe('gap-fill')
  })

  it('rejects an open-cloze answer of more than one word', () => {
    const payload = seed('reading', 5)
    rows(payload)[0]!['accepted'] = ['because of']
    expect(() => part('reading', 5).validate!(payload, part('reading', 5).runtime!)).toThrow(
      'at most 1 word'
    )
  })

  it('rejects gaps in the text that do not match the questions', () => {
    const payload = seed('reading', 4)
    payload['content'] = String(payload['content']).replace('(6) ____', 'dirty')
    expect(() => part('reading', 4).validate!(payload, part('reading', 4).runtime!)).toThrow(
      '(1) ____ to (6) ____'
    )
  })

  it('rejects a gap that carries options or an answer index', () => {
    const payload = seed('listening', 2)
    rows(payload)[1]!['correctAnswer'] = 0
    expect(() => part('listening', 2).validate!(payload, part('listening', 2).runtime!)).toThrow(
      'use accepted'
    )
  })

  it('rejects a part 3 conversation with a top-level option bank', () => {
    const payload = seed('listening', 3)
    payload['options'] = ['a', 'b', 'c']
    expect(() => part('listening', 3).validate!(payload, part('listening', 3).runtime!)).toThrow(
      'own options'
    )
  })

  it('rejects a part 5 option used twice', () => {
    const p = part('listening', 5)
    const payload = seed('listening', 5)
    rows(payload)[1]!['correctAnswer'] = rows(payload)[0]!['correctAnswer']
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).toThrow('unique')
  })

  it('rejects part 2 questions that offer different texts', () => {
    const payload = seed('reading', 2)
    rows(payload)[3]!['options'] = ['Lucia', 'Marco', 'Nina']
    expect(() => part('reading', 2).validate!(payload, part('reading', 2).runtime!)).toThrow(
      'same three texts'
    )
  })

  it('rejects a dialogue without one-word speaker labels', () => {
    const payload = seed('listening', 1)
    rows(payload, 'items')[0]!['transcript'] = 'Excuse me, when is the next train? At ten forty.'
    expect(() => part('listening', 1).validate!(payload, part('listening', 1).runtime!)).toThrow(
      'labelled'
    )
  })

  it.each([1, 2])('projects and validates the writing part %i seed with a 15-point rubric', n => {
    const p = part('writing', n)
    const payload = seed('writing', n)
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).not.toThrow()
    expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
    expect(p.runtime!.multiplier).toBe(1)
    expect(p.runtime!.criteria!.map(c => c.id)).toEqual(['content', 'organisation', 'language'])
  })

  it('rejects a writing word range that differs from the part field', () => {
    const payload = seed('writing', 1)
    payload['wordCount'] = { min: 20, max: 50 }
    expect(() => part('writing', 1).validate!(payload, part('writing', 1).runtime!)).toThrow(
      'wordCount'
    )
  })

  it.each([1, 2])('projects and validates the speaking part %i seed as examiner cards', n => {
    const p = part('speaking', n)
    const payload = seed('speaking', n)
    expect(p.layout).toBe('word-cards')
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).not.toThrow()
    expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
  })

  it('rejects an examiner question without the examiner speaker', () => {
    const payload = seed('speaking', 1)
    delete rows(payload, 'cards')[2]!['speaker']
    expect(() => part('speaking', 1).validate!(payload, part('speaking', 1).runtime!)).toThrow(
      'examiner'
    )
  })

  it('leaves no unresolved placeholder in a generator prompt but {count}', () => {
    for (const spec of cambridgeEnA2.prompts.filter(p => p.kind === 'generator')) {
      const text = spec.assemble({ count: 2 })
      expect(text).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it.each([
    ['writing', 1],
    ['writing', 2],
    ['speaking', 1],
    ['speaking', 2],
  ] as const)('resolves every %s part %i answer and review variable', (skill, n) => {
    const p = part(skill, n)
    const answers =
      skill === 'writing'
        ? { answer: 'Hi Alex, come to my party at my house on Saturday. Bring some music!' }
        : Object.fromEntries(p.runtime!.segments!.map(s => [s.id, 'I like it because it is fun.']))
    for (const kind of ['answer', 'review'] as const) {
      const vars = cambridgeEnA2.buildReviewVars!({
        skill,
        part: n,
        kind,
        payload: seed(skill, n),
        answers,
        outputLanguage: 'German',
      })
      const text = findPrompt(cambridgeEnA2, skill, n, kind)!.assemble(vars)
      expect(text).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it.each([
    ['writing', 1],
    ['writing', 2],
    ['speaking', 1],
    ['speaking', 2],
  ] as const)(
    'accepts a %s part %i review on its three 0–5 scales and rejects a wrong maximum',
    (skill, n) => {
      const rules = part(skill, n).runtime!
      const points = [3, 4, 2.5]
      const review = {
        criteria: rules.criteria!.map((c, i) => ({ ...c, points: points[i], comment: 'ok' })),
        totalPoints: 9.5,
        maxPoints: 15,
        summary: 'Good',
        strengths: [],
        improvements: [],
      }
      expect(validateReview(review, rules).totalPoints).toBe(9.5)
      expect(() => validateReview({ ...review, maxPoints: 20 }, rules)).toThrow('total')
    }
  )
})
