import {
  findPrompt,
  getLivePack,
  goetheDeA1,
  objectiveScore,
  validateReview,
  validateView,
  type SkillId,
} from '@exam-one/exam-packs'

function part(skill: SkillId, n: number) {
  return goetheDeA1.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function seed(skill: SkillId, n: number): Record<string, unknown> {
  return structuredClone(
    goetheDeA1.seedExercises![skill]!.find(s => s['testingPart'] === n)!
  ) as Record<string, unknown>
}

describe('Goethe A1 pack', () => {
  it('is live, selectable and falls back to the Cambridge A2 Key default', () => {
    expect(getLivePack('goethe-de-a1').packId).toBe('goethe-de-a1')
    expect(getLivePack(undefined).packId).toBe('cambridge-en-a2')
    expect(goetheDeA1.createMockSet).toBeDefined()
    expect(goetheDeA1.bundledMockSet?.id).toBe('goethe-a1-set-1')
  })

  it.each([
    ['reading', 1, 5],
    ['reading', 2, 5],
    ['reading', 3, 5],
    ['listening', 1, 6],
    ['listening', 2, 4],
    ['listening', 3, 5],
  ] as const)('projects and validates the %s Teil %i seed (%i items)', (skill, n, count) => {
    const p = part(skill, n)
    const payload = seed(skill, n)
    const view = p.adapter!.project(payload)
    expect(() => validateView(view, p.runtime!)).not.toThrow()
    expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
    expect(view.questions).toHaveLength(count)
    expect(findPrompt(goetheDeA1, skill, n, 'generator')).toBeDefined()
  })

  it('scores a true/false reading answer by numeric index', () => {
    const p = part('reading', 1)
    const view = p.adapter!.project(seed('reading', 1))
    const answers = Object.fromEntries(view.questions!.map(q => [q.id, q.correctAnswer]))
    expect(objectiveScore(view, p.runtime!, answers)).toMatchObject({ score: 5, maxScore: 5 })
  })

  it('rejects a boolean true/false answer, which would always score as wrong', () => {
    const payload = seed('reading', 3)
    ;(payload['questions'] as Record<string, unknown>[])[0]!['correctAnswer'] = true
    expect(() => part('reading', 3).validate!(payload, part('reading', 3).runtime!)).toThrow(
      'correctAnswer must be 0 (richtig) or 1 (falsch)'
    )
  })

  it('rejects true/false options other than Richtig / Falsch', () => {
    const payload = seed('listening', 2)
    ;(payload['items'] as Record<string, unknown>[])[0]!['options'] = ['Ja', 'Nein']
    expect(() => part('listening', 2).validate!(payload, part('listening', 2).runtime!)).toThrow(
      'options must be ["Richtig", "Falsch"]'
    )
  })

  it('rejects a listening item without a transcript, which could never have audio', () => {
    const payload = seed('listening', 3)
    ;(payload['items'] as Record<string, unknown>[])[2]!['transcript'] = ''
    expect(() => part('listening', 3).validate!(payload, part('listening', 3).runtime!)).toThrow(
      'items[2].transcript'
    )
  })

  it('rejects a Teil 1 conversation without speaker labels', () => {
    const payload = seed('listening', 1)
    ;(payload['items'] as Record<string, unknown>[])[0]!['transcript'] =
      'Guten Abend. Zimmer 314, bitte.'
    expect(() => part('listening', 1).validate!(payload, part('listening', 1).runtime!)).toThrow(
      'labelled turns'
    )
  })

  it('rejects the wrong item count for the Teil', () => {
    const payload = seed('listening', 1)
    payload['items'] = (payload['items'] as unknown[]).slice(0, 5)
    expect(() => part('listening', 1).validate!(payload, part('listening', 1).runtime!)).toThrow(
      'exactly 6 entries'
    )
  })

  it('leaves no unresolved placeholder in a generator prompt but {count}', () => {
    for (const spec of goetheDeA1.prompts.filter(p => p.kind === 'generator')) {
      const text = spec.assemble({ count: 2 })
      expect(text).not.toMatch(/\{(?!count\})[a-zA-Z]+\}/)
      expect(text).not.toContain('{count}')
    }
  })

  it.each([1, 2])('projects and validates the writing Teil %i seed', n => {
    const p = part('writing', n)
    const payload = seed('writing', n)
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).not.toThrow()
    expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
  })

  it('uses the form-fill layout for Teil 1 and names each field after its form row', () => {
    const p = part('writing', 1)
    expect(p.layout).toBe('form-fill')
    const view = p.adapter!.project(seed('writing', 1))
    expect(view.fields!.map(f => f.prompt)).toEqual([
      'Herkunftsland',
      'Beruf',
      'Anzahl der Personen',
      'Kurszeit',
      'Telefon (Handy)',
    ])
  })

  it('rejects a form whose blanks are not field1–field5 in order', () => {
    const payload = seed('writing', 1)
    const rows = (payload['form'] as { rows: Record<string, unknown>[] }).rows
    rows[1]!['field'] = 'field2'
    expect(() => part('writing', 1).validate!(payload, part('writing', 1).runtime!)).toThrow(
      'the blank rows must be field1'
    )
  })

  it('rejects a form without an expected entry, or with one outside its options', () => {
    const missing = seed('writing', 1)
    delete (missing['expected'] as Record<string, unknown>)['field3']
    expect(() => part('writing', 1).validate!(missing, part('writing', 1).runtime!)).toThrow(
      'expected.field3'
    )
    const outside = seed('writing', 1)
    ;(outside['expected'] as Record<string, unknown>)['field4'] = 'Nachmittag'
    expect(() => part('writing', 1).validate!(outside, part('writing', 1).runtime!)).toThrow(
      'expected.field4 must be one of its options'
    )
  })

  it.each([
    [1, 'answer'],
    [1, 'review'],
    [2, 'answer'],
    [2, 'review'],
  ] as const)('resolves every placeholder in the writing Teil %i %s prompt', (n, kind) => {
    const vars = goetheDeA1.buildReviewVars!({
      skill: 'writing',
      part: n,
      kind,
      payload: seed('writing', n),
      answers: { field1: 'Marokko', answer: 'Liebe Damen und Herren, …' },
      outputLanguage: 'de',
    })
    const text = findPrompt(goetheDeA1, 'writing', n, kind)!.assemble(vars)
    expect(text).not.toMatch(/\{[a-zA-Z]+\}/)
  })

  it('lists each form entry by field id and label for the reviewer', () => {
    const vars = goetheDeA1.buildReviewVars!({
      skill: 'writing',
      part: 1,
      kind: 'review',
      payload: seed('writing', 1),
      answers: { field1: 'Marokko', field3: 'zwei' },
      outputLanguage: 'en',
    })
    expect(vars['userContent']).toContain('field1 (Herkunftsland): Marokko')
    expect(vars['userContent']).toContain('field2 (Beruf): —')
    expect(vars['expected']).toContain('field4 (Kurszeit): Abend')
  })

  it('accepts a 1/0 form review and rejects a wrong total', () => {
    const rules = part('writing', 1).runtime!
    const review = {
      criteria: rules.criteria!.map((c, i) => ({ ...c, points: i === 2 ? 0 : 1, comment: 'ok' })),
      totalPoints: 4,
      maxPoints: 5,
      summary: 'Gut',
      strengths: [],
      improvements: [],
    }
    expect(validateReview(review, rules).totalPoints).toBe(4)
    expect(() => validateReview({ ...review, totalPoints: 5 }, rules)).toThrow()
  })

  it('accepts a 3/1.5/0 message review for Teil 2', () => {
    const rules = part('writing', 2).runtime!
    const points: Record<string, number> = {
      content1: 3,
      content2: 1.5,
      content3: 3,
      communication: 0.5,
    }
    const review = {
      criteria: rules.criteria!.map(c => ({ ...c, points: points[c.id], comment: 'ok' })),
      totalPoints: 8,
      maxPoints: 10,
      summary: 'Gut',
      strengths: [],
      improvements: [],
    }
    expect(validateReview(review, rules).totalPoints).toBe(8)
  })
})
