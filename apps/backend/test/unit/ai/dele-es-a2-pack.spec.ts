import {
  deleEsA2,
  findPrompt,
  getLivePack,
  getPack,
  objectiveScore,
  validateReview,
  validateView,
  type SkillId,
} from '@exam-one/exam-packs'

function part(skill: SkillId, n: number) {
  return deleEsA2.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function seed(skill: SkillId, n: number): Record<string, unknown> {
  return structuredClone(
    deleEsA2.seedExercises![skill]!.find(s => s['testingPart'] === n)!
  ) as Record<string, unknown>
}

function rows(payload: Record<string, unknown>, key = 'questions'): Record<string, unknown>[] {
  return payload[key] as Record<string, unknown>[]
}

/** Skill, part, items and raw points: 1 per item, 25 per module. */
const OBJECTIVE = [
  ['reading', 1, 5, 5],
  ['reading', 2, 8, 8],
  ['reading', 3, 6, 6],
  ['reading', 4, 6, 6],
  ['listening', 1, 6, 6],
  ['listening', 2, 6, 6],
  ['listening', 3, 6, 6],
  ['listening', 4, 7, 7],
] as const

/** Every writing and speaking tarea: the two DELE scales, 0–3 each. */
const RUBRIC = [
  ['writing', 1, 6],
  ['writing', 2, 6],
  ['speaking', 1, 6],
  ['speaking', 2, 6],
  ['speaking', 3, 6],
] as const

describe('DELE A2 pack', () => {
  it('is live and selectable by alias, falls back to the Cambridge A2 Key default, and has mock exams', () => {
    expect(getLivePack('dele-es-a2').packId).toBe('dele-es-a2')
    expect(getPack('spanish-a2')?.packId).toBe('dele-es-a2')
    expect(getPack('dele-a2')?.packId).toBe('dele-es-a2')
    expect(getLivePack(undefined).packId).toBe('cambridge-en-a2')
    expect(deleEsA2.createMockSet).toBeDefined()
    expect(deleEsA2.bundledMockSet?.id).toBe('dele-es-a2-set-1')
    expect(deleEsA2.mockOverview).toBeDefined()
    expect(deleEsA2.speech).toMatchObject({ ttsLang: 'es', sttLang: 'es' })
  })

  it('scores 25 items in reading and in listening, as the exam does', () => {
    for (const skill of ['reading', 'listening'] as const) {
      const total = deleEsA2.structure
        .find(m => m.id === skill)!
        .parts.reduce((sum, p) => sum + p.runtime!.maxPoints, 0)
      expect(total).toBe(25)
    }
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
      const right = Object.fromEntries(view.questions!.map(q => [q.id, q.correctAnswer]))
      const wrong = Object.fromEntries(view.questions!.map(q => [q.id, (q.correctAnswer + 1) % q.options.length]))
      expect(objectiveScore(view, p.runtime!, right).score).toBe(points)
      expect(objectiveScore(view, p.runtime!, wrong).score).toBe(0)
      expect(findPrompt(deleEsA2, skill, n, 'generator')).toBeDefined()
    }
  )

  it('matches reading Tarea 3 statements to Texto A, B or C and uses every text', () => {
    const p = part('reading', 3)
    const payload = seed('reading', 3)
    for (const row of rows(payload)) row['correctAnswer'] = 0
    expect(() => p.validate!(payload, p.runtime!)).toThrow('every text')
    const renamed = seed('reading', 3)
    rows(renamed)[0]!['options'] = ['A', 'B', 'C']
    expect(() => p.validate!(renamed, p.runtime!)).toThrow('"Texto A", "Texto B", "Texto C"')
  })

  it('requires the two speakers and "Ninguno de los dos" in listening Tarea 3', () => {
    const p = part('listening', 3)
    const payload = seed('listening', 3)
    payload['options'] = ['Javier', 'Elena', 'Nadie']
    expect(() => p.validate!(payload, p.runtime!)).toThrow('Ninguno de los dos')
    const stranger = seed('listening', 3)
    stranger['options'] = ['Pedro', 'Elena', 'Ninguno de los dos']
    expect(() => p.validate!(stranger, p.runtime!)).toThrow('two speakers')
  })

  it('rejects a listening Tarea 4 statement used for two messages', () => {
    const p = part('listening', 4)
    const payload = seed('listening', 4)
    rows(payload)[1]!['correctAnswer'] = rows(payload)[0]!['correctAnswer']
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).toThrow('unique')
  })

  it('rejects a dialogue without Spanish speaker labels', () => {
    const payload = seed('listening', 1)
    rows(payload, 'items')[0]!['transcript'] = 'Buenos días. Quería unos zapatos. ¿Qué número tiene?'
    expect(() => part('listening', 1).validate!(payload, part('listening', 1).runtime!)).toThrow('labelled')
  })

  it.each(RUBRIC)('projects and validates the %s part %i seed with a %i-point rubric', (skill, n, points) => {
    const p = part(skill, n)
    const payload = seed(skill, n)
    expect(() => validateView(p.adapter!.project(payload), p.runtime!)).not.toThrow()
    expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
    expect(p.runtime!.maxPoints).toBe(points)
    expect(p.runtime!.criteria!.map(c => c.id)).toEqual(['taskCompletion', 'language'])
    expect(p.runtime!.multiplier).toBe(1)
  })

  it('ships both writing Tarea 2 options and rejects any other', () => {
    const options = deleEsA2.seedExercises!.writing!
      .filter(s => s['testingPart'] === 2 && s['examOnly'] !== true)
      .map(s => s['topicType'])
    expect(options).toEqual(['opcion-a', 'opcion-b'])
    const payload = seed('writing', 2)
    payload['topicType'] = 'essay'
    expect(() => part('writing', 2).validate!(payload, part('writing', 2).runtime!)).toThrow('topicType')
  })

  it('rejects a writing word range that differs from the part field', () => {
    const payload = seed('writing', 1)
    payload['wordCount'] = { min: 50, max: 80 }
    expect(() => part('writing', 1).validate!(payload, part('writing', 1).runtime!)).toThrow('wordCount')
  })

  it('uses keyword monologues for speaking 1 and 2 and examiner cards for the role-play', () => {
    expect(part('speaking', 1).layout).toBeUndefined()
    expect(part('speaking', 2).layout).toBeUndefined()
    expect(part('speaking', 3).layout).toBe('word-cards')
    const short = seed('speaking', 1)
    short['keywords'] = (short['keywords'] as string[]).slice(0, 4)
    expect(() => part('speaking', 1).validate!(short, part('speaking', 1).runtime!)).toThrow('exactly 5')
    const payload = seed('speaking', 3)
    delete rows(payload, 'cards')[0]!['speaker']
    expect(() => part('speaking', 3).validate!(payload, part('speaking', 3).runtime!)).toThrow('examiner')
  })

  it('leaves no unresolved placeholder in a generator prompt but {count}', () => {
    for (const spec of deleEsA2.prompts.filter(p => p.kind === 'generator')) {
      const text = spec.assemble({ count: 2 })
      expect(text).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it.each(RUBRIC)('resolves every %s part %i answer and review variable', (skill, n) => {
    const p = part(skill, n)
    const ids = skill === 'writing' ? ['answer'] : p.runtime!.segments!.map(s => s.id)
    const answers = Object.fromEntries(ids.map(id => [id, 'Me gusta mucho leer, porque es interesante.']))
    for (const kind of ['answer', 'review'] as const) {
      const vars = deleEsA2.buildReviewVars!({
        skill,
        part: n,
        kind,
        payload: seed(skill, n),
        answers,
        outputLanguage: 'German',
      })
      const text = findPrompt(deleEsA2, skill, n, kind)!.assemble(vars)
      expect(text).not.toMatch(/\{[a-zA-Z][a-zA-Z0-9]*\}/)
    }
  })

  it.each(RUBRIC)('accepts a %s part %i review on its bands and rejects a wrong maximum', (skill, n, points) => {
    const rules = part(skill, n).runtime!
    const review = {
      criteria: rules.criteria!.map(c => ({ ...c, points: 2, comment: 'ok' })),
      totalPoints: 4,
      maxPoints: points,
      summary: 'Bien',
      strengths: [],
      improvements: [],
    }
    expect(validateReview(review, rules).totalPoints).toBe(4)
    expect(() => validateReview({ ...review, maxPoints: points + 1 }, rules)).toThrow('total')
  })
})
