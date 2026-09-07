import {
  formatAdapter,
  objectiveScore,
  validatePacks,
  validateReview,
  validateView,
  goetheDeA2,
} from '@exam-one/exam-packs'
import { goetheA2MockExamSet1 } from '@exam-one/exam-content'
import { syntheticEnglishA1, syntheticPayloads } from '../../../../../data/src/testing/english-a1'

describe('Data-only pack runtime', () => {
  it('validates saved compatibility reviews against snapshot maxima and totals', () => {
    const part = goetheDeA2.structure.find(module => module.id === 'speaking')!.parts[0]!
    const rules = { ...part.runtime!, maxPoints: 6, criteria: part.runtime!.criteria!.map(criterion => ({ ...criterion, maxPoints: 3 })) }
    const review = { teil: 1, totalPoints: 6, maxPoints: 6, criteria: rules.criteria.map(criterion => ({ ...criterion, points: 3, comment: 'Clear' })), summary: 'Good', strengths: [], improvements: [] }
    expect(() => part.adapter!.validateStoredReview!({ review }, rules)).not.toThrow()
    expect(() => part.adapter!.validateStoredReview!({ review: { ...review, totalPoints: 999 } }, rules)).toThrow('total')
    expect(() => part.adapter!.validateStoredReview!({ review }, part.runtime!)).toThrow('rubric')
  })
  it('accepts a different language, CEFR, part numbering and all five formats', () => {
    expect(() => validatePacks([syntheticEnglishA1])).not.toThrow()
    const formats = new Set<string>()
    for (const module of syntheticEnglishA1.structure)
      for (const part of module.parts) {
        const view = part.adapter!.project(syntheticPayloads[part.n])
        formats.add(view.format)
        expect(view.title).toContain('Synthetic')
      }
    expect(formats.size).toBe(5)
  })
  it('rejects invalid generated answer indices and counts', () => {
    const adapter = formatAdapter('selection', {
      minutes: 1,
      maxPoints: 3,
      questionCount: 2,
      optionCount: 4,
    })
    expect(() =>
      adapter.project({
        ...syntheticPayloads[7],
        questions: [{ text: 'bad', options: ['a', 'b'], correctAnswer: 9 }],
      })
    ).toThrow()
  })
  it('uses weights and allows fractional points', () => {
    const part = syntheticEnglishA1.structure[0]!.parts[0]!
    const view = part.adapter!.project(syntheticPayloads[7])
    expect(objectiveScore(view, part.runtime!, { a: 0, b: 0 })).toEqual({
      score: 1.5,
      maxScore: 3,
      percentage: 50,
    })
  })
  it('rejects duplicate identities, missing prompts and inconsistent rubrics', () => {
    expect(() => validatePacks([syntheticEnglishA1, syntheticEnglishA1])).toThrow(
      'duplicate identity'
    )
    expect(() => validatePacks([{ ...syntheticEnglishA1, prompts: [] }])).toThrow('missing')
    const pack = {
      ...syntheticEnglishA1,
      structure: syntheticEnglishA1.structure.map(m => ({
        ...m,
        parts: m.parts.map(p => ({ ...p, runtime: { ...p.runtime!, maxPoints: 999 } })),
      })),
    }
    expect(() => validatePacks([pack])).toThrow('rubric')
  })
  it('checks review totals against configured criteria rather than Goethe part numbers', () => {
    const rules = syntheticEnglishA1.structure.find(m => m.id === 'writing')!.parts[0]!.runtime!
    const review = {
      maxPoints: 3.5,
      totalPoints: 2.5,
      criteria: rules.criteria!.map(c => ({
        ...c,
        points: c.id === 'content' ? 2 : 0.5,
        comment: '',
      })),
    }
    expect(validateReview(review, rules).totalPoints).toBe(2.5)
    expect(() => validateReview({ ...review, totalPoints: 4 }, rules)).toThrow('total')
    expect(() => validateReview({ ...review, totalPoints: NaN }, rules)).toThrow('total')
  })
  it('projects every bundled Goethe mock exercise without changing payload identity or raw scores', () => {
    for (const module of goetheDeA2.structure) {
      for (const exercise of goetheA2MockExamSet1.content[module.id]) {
        const before = JSON.stringify(exercise)
        const part = module.parts.find(part => part.n === exercise.testingPart)!
        const view = part.adapter!.project(exercise)
        expect(() => validateView(view, part.runtime!)).not.toThrow()
        expect(JSON.stringify(exercise)).toBe(before)
        if (view.questions) {
          const answers = Object.fromEntries(
            view.questions.map(question => [question.id, question.correctAnswer])
          )
          expect(objectiveScore(view, part.runtime!, answers)).toEqual({
            score: 5,
            maxScore: 5,
            percentage: 100,
          })
        }
      }
    }
    expect(goetheA2MockExamSet1.rules).toEqual({ maximumPoints: 100, passPoints: 60 })
  })
  it('projects generated shared and per-item audio without changing the stored payload format', () => {
    const part = syntheticEnglishA1.structure[0]!.parts[0]!
    const payload = {
      ...syntheticPayloads[7],
      audio: { shared: '/shared.wav', items: { a: '/item.wav' } },
    }
    const view = part.adapter!.project(payload)
    expect(view.audio).toBe('/shared.wav')
    expect(view.questions![0]!.audio).toBe('/item.wav')
  })
  it('rejects impossible replay and field configurations at registry startup', () => {
    const pack = {
      ...syntheticEnglishA1,
      structure: syntheticEnglishA1.structure.map(module => ({
        ...module,
        parts: module.parts.map(part => ({ ...part, runtime: { ...part.runtime!, replays: -1 } })),
      })),
    }
    expect(() => validatePacks([pack])).toThrow('replay')
  })
})
