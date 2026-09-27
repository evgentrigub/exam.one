import {
  findPrompt,
  getLivePack,
  goetheDeA1,
  objectiveScore,
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
  it('is live, selectable and keeps A2 as the default', () => {
    expect(getLivePack('goethe-de-a1').packId).toBe('goethe-de-a1')
    expect(getLivePack(undefined).packId).toBe('goethe-de-a2')
    expect(goetheDeA1.createMockSet).toBeUndefined()
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
    ;(payload['items'] as Record<string, unknown>[])[0]!['transcript'] = 'Guten Abend. Zimmer 314, bitte.'
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
    for (const spec of goetheDeA1.prompts) {
      const text = spec.assemble({ count: 2 })
      expect(text).not.toMatch(/\{(?!count\})[a-zA-Z]+\}/)
      expect(text).not.toContain('{count}')
    }
  })
})
