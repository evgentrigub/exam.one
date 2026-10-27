import {
  applyReviewRules,
  bundledAudioSegments,
  getPack,
  objectiveScore,
  validatePacks,
  validateReview,
  validateView,
  type CriterionReview,
  type SkillId,
} from '@exam-one/exam-packs'

const pack = getPack('telc-de-b2')!
const part = (skill: SkillId, n: number) =>
  pack.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
const seeds = (skill: SkillId, examOnly = false) =>
  pack.seedExercises![skill]!.filter(seed => Boolean(seed['examOnly']) === examOnly)
const seedFor = (skill: SkillId, n: number, examOnly = false) =>
  seeds(skill, examOnly).find(seed => seed['testingPart'] === n)!
const review = (skill: SkillId, n: number, band: number): CriterionReview => {
  const rules = part(skill, n).runtime!
  const criteria = rules.criteria!.map(c => ({
    ...c,
    points: c.allowedPoints![band]!,
    grade: 'ABCD'[band]!,
    comment: 'Evidence',
  }))
  return {
    criteria,
    totalPoints: criteria.reduce((sum, c) => sum + c.points, 0),
    maxPoints: rules.maxPoints,
    summary: '',
    strengths: [],
    improvements: [],
  }
}

describe('telc Deutsch B2 pack', () => {
  it('covers all twelve parts and twenty prompt slots with the official raw maxima', () => {
    expect(pack.structure.map(m => [m.id, m.parts.length, m.points, m.minutes])).toEqual([
      ['reading', 5, 105, 90],
      ['listening', 3, 75, 20],
      ['writing', 1, 45, 30],
      ['speaking', 3, 63, 15],
    ])
    expect(pack.prompts).toHaveLength(20)
    expect(pack.board).toBe('telc')
    expect(() => validatePacks([{ ...pack, live: true }])).not.toThrow()
  })

  it.each(['reading', 'listening', 'writing', 'speaking'] as SkillId[])(
    'validates original practice and exam-only %s content and scores objective seeds 0 to max',
    skill => {
      const parts = pack.structure.find(m => m.id === skill)!.parts.length
      expect(new Set(seeds(skill).map(s => s['testingPart'])).size).toBe(parts)
      expect(seeds(skill, true)).toHaveLength(parts)
      for (const seed of pack.seedExercises![skill]!) {
        const definition = part(skill, Number(seed['testingPart']))
        expect(() => definition.validate!(seed, definition.runtime!)).not.toThrow()
        const view = definition.adapter!.project(seed)
        expect(() => validateView(view, definition.runtime!)).not.toThrow()
        if (!view.questions) continue
        const right = Object.fromEntries(view.questions.map(q => [q.id, q.correctAnswer]))
        const wrong = Object.fromEntries(
          view.questions.map(q => [q.id, (q.correctAnswer + 1) % q.options.length])
        )
        expect(objectiveScore(view, definition.runtime!, right).score).toBe(
          definition.runtime!.maxPoints
        )
        expect(objectiveScore(view, definition.runtime!, wrong).score).toBe(0)
      }
    }
  )

  it('banks headlines, advertisements and words once, with x repeatable only in Leseverstehen 3', () => {
    expect([1, 2, 3, 4, 5].map(n => Boolean(part('reading', n).optionBank))).toEqual([
      true,
      false,
      true,
      false,
      true,
    ])
    expect([1, 2, 3, 4, 5].map(n => Boolean(part('reading', n).choiceGaps))).toEqual([
      false,
      false,
      false,
      true,
      true,
    ])
    const ads = part('reading', 3)
    expect(ads.runtime!.repeatableOptions).toEqual([12])
    const seed = seedFor('reading', 3)
    const questions = seed['questions'] as Array<{ correctAnswer: number }>
    const unmatched = questions.filter(q => q.correctAnswer === 12).length
    expect(unmatched).toBeGreaterThanOrEqual(1)
    expect(unmatched).toBeLessThanOrEqual(3)
    const reused = {
      ...seed,
      questions: questions.map((q, i) =>
        i === 1
          ? {
              ...q,
              correctAnswer: questions[0]!.correctAnswer === 12 ? 0 : questions[0]!.correctAnswer,
            }
          : q
      ),
    }
    expect(() => ads.validate!(reused, ads.runtime!)).toThrow()
  })

  it('plays every recording once with 30 and 60 second previews and maps fourteen WAVs', () => {
    expect([1, 2, 3].map(n => part('listening', n).runtime!.replays)).toEqual([1, 1, 1])
    expect([1, 2, 3].map(n => part('listening', n).runtime!.previewSeconds)).toEqual([
      30,
      60,
      undefined,
    ])
    const segments = bundledAudioSegments(pack)
    expect(segments).toHaveLength(14)
    expect(segments.every(s => s.url.startsWith('/audio/listening/telc-de-b2/'))).toBe(true)
    expect(segments.filter(s => s.itemId)).toHaveLength(10)
  })

  it('rates writing on A–D bands, multiplies by three and never zeroes the whole task', () => {
    const rules = part('writing', 1).runtime!
    expect(rules.criteria!.map(c => [c.id, c.allowedPoints])).toEqual([
      ['taskCompletion', [5, 3, 1, 0]],
      ['communicativeDesign', [5, 3, 1, 0]],
      ['accuracy', [5, 3, 1, 0]],
    ])
    expect([rules.maxPoints, rules.multiplier, rules.zeroCriterion]).toEqual([15, 3, undefined])
    expect(validateReview(review('writing', 1, 0), rules).totalPoints).toBe(15)
    const mixed = {
      ...review('writing', 1, 1),
      criteria: review('writing', 1, 1).criteria.map(c =>
        c.id === 'accuracy' ? { ...c, points: 0, grade: 'D' } : c
      ),
      totalPoints: 6,
    }
    const kept = applyReviewRules(validateReview(mixed, rules), rules, { answer: 'kurz' })
    expect(kept.totalPoints).toBe(6)
    expect(seeds('writing').map(s => (s['category'] as string[])[0])).toEqual([
      'Aufgabe A · Bitte um Informationen',
      'Aufgabe B · Beschwerde',
    ])
  })

  it('keeps the writing model answer within the requested length', () => {
    const answer = pack.prompts.find(p => p.skill === 'writing' && p.kind === 'answer')!
    const model = JSON.parse(answer.examples![0]!) as { content: string; wordCount: number }
    expect(model.wordCount).toBe(model.content.trim().split(/\s+/u).length)
    expect(model.wordCount).toBeGreaterThanOrEqual(160)
    expect(model.wordCount).toBeLessThanOrEqual(200)
  })

  it('offers the seven fixed topics and requires the discussion and planning texts', () => {
    const topics = seedFor('speaking', 1)['topicOptions'] as Array<{ id: string; theme: string }>
    expect(topics.map(t => t.id)).toEqual([1, 2, 3, 4, 5, 6, 7].map(i => `topic${i}`))
    expect(part('speaking', 1).runtime!.segments![0]).toMatchObject({
      id: 'present',
      maxSeconds: 90,
    })
    expect(part('speaking', 2).runtime!.segments![0]).toMatchObject({
      id: 'summary',
      maxSeconds: 60,
    })
    for (const n of [2, 3]) {
      const definition = part('speaking', n)
      const withoutText = { ...seedFor('speaking', n) }
      delete withoutText['stimulus']
      expect(() => definition.validate!(withoutText, definition.runtime!)).toThrow('stimulus')
    }
    for (const n of [1, 2, 3])
      expect(
        validateReview(review('speaking', n, 0), part('speaking', n).runtime!).totalPoints
      ).toBe(21)
  })
})
