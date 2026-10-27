import {
  applyReviewRules,
  formatAdapter,
  isGapAnswerCorrect,
  normalizeGapAnswer,
  objectiveScore,
  validatePacks,
  validateReview,
  validateView,
  goetheDeA2,
  type ExamPart,
} from '@exam-one/exam-packs'
import { goetheA2MockExamSet1 } from '@exam-one/exam-packs'
import { goetheRawAdapter } from '../../../../../data/src/packs/goethe-shared/raw-adapter'
import { syntheticEnglishA1, syntheticPayloads } from '../../../../../data/src/testing/english-a1'

describe('Data-only pack runtime', () => {
  it('validates saved compatibility reviews against snapshot maxima and totals', () => {
    const part = goetheDeA2.structure.find(module => module.id === 'speaking')!.parts[0]!
    const rules = {
      ...part.runtime!,
      maxPoints: 6,
      criteria: part.runtime!.criteria!.map(criterion => ({ ...criterion, maxPoints: 3 })),
    }
    const review = {
      teil: 1,
      totalPoints: 6,
      maxPoints: 6,
      criteria: rules.criteria.map(criterion => ({ ...criterion, points: 3, comment: 'Clear' })),
      summary: 'Good',
      strengths: [],
      improvements: [],
    }
    expect(() => part.adapter!.validateStoredReview!({ review }, rules)).not.toThrow()
    expect(() =>
      part.adapter!.validateStoredReview!({ review: { ...review, totalPoints: 999 } }, rules)
    ).toThrow('total')
    expect(() => part.adapter!.validateStoredReview!({ review }, part.runtime!)).toThrow('rubric')
  })
  it('accepts a different language, CEFR, part numbering and all six formats', () => {
    expect(() => validatePacks([syntheticEnglishA1])).not.toThrow()
    const formats = new Set<string>()
    for (const module of syntheticEnglishA1.structure)
      for (const part of module.parts) {
        const view = part.adapter!.project(syntheticPayloads[part.n])
        formats.add(view.format)
        expect(view.title).toContain('Synthetic')
      }
    expect(formats.size).toBe(6)
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

describe('Option banks and four-band rubrics', () => {
  const bankRules = { minutes: 1, maxPoints: 3, reuseOptions: false, repeatableOptions: [2] }
  const bankView = (answers: number[]) =>
    formatAdapter('matching', bankRules).project({
      title: 'Bank',
      questions: answers.map((correctAnswer, i) => ({
        id: `q${i + 1}`,
        text: `Situation ${i + 1}`,
        options: ['a · Ad', 'b · Ad', 'x · No ad'],
        correctAnswer,
      })),
    })

  it('lets a repeatable option recur while every other answer stays unique', () => {
    expect(() => validateView(bankView([0, 2, 2]), bankRules)).not.toThrow()
    expect(() => validateView(bankView([0, 0, 2]), bankRules)).toThrow('unique')
    expect(() =>
      validateView(bankView([0, 2, 2]), { ...bankRules, repeatableOptions: [] })
    ).toThrow('unique')
  })

  it('refuses an option bank on a non-choice part and repeatable options outside the list', () => {
    const patched = (patch: Partial<ExamPart>, runtimePatch: Record<string, unknown> = {}) => ({
      ...syntheticEnglishA1,
      structure: syntheticEnglishA1.structure.map(module => ({
        ...module,
        parts: module.parts.map(part =>
          part.itemFormat === (patch.itemFormat ?? 'matching')
            ? { ...part, ...patch, runtime: { ...part.runtime!, ...runtimePatch } }
            : part
        ),
      })),
    })
    expect(() => validatePacks([patched({ itemFormat: 'freeform', optionBank: true })])).toThrow(
      'option bank'
    )
    expect(() =>
      validatePacks([patched({ optionBank: true }, { optionCount: 3, repeatableOptions: [3] })])
    ).toThrow('repeatable option')
    expect(() =>
      validatePacks([patched({ optionBank: true }, { optionCount: 3, repeatableOptions: [2] })])
    ).not.toThrow()
  })

  it('grades a four-band A–D rubric and zeroes it with the lowest letter', () => {
    const rules = {
      minutes: 30,
      maxPoints: 10,
      zeroCriterion: 'task',
      criteria: [
        { id: 'task', label: 'Task', maxPoints: 5, allowedPoints: [5, 3, 1, 0] },
        { id: 'form', label: 'Form', maxPoints: 5, allowedPoints: [5, 3, 1, 0] },
      ],
    }
    const review = (task: [number, string], form: [number, string]) => ({
      maxPoints: 10,
      totalPoints: task[0] + form[0],
      criteria: [
        { ...rules.criteria[0], points: task[0], grade: task[1], comment: '' },
        { ...rules.criteria[1], points: form[0], grade: form[1], comment: '' },
      ],
    })
    expect(validateReview(review([3, 'B'], [0, 'D']), rules).totalPoints).toBe(3)
    expect(() => validateReview(review([3, 'B'], [0, 'E']), rules)).toThrow('band')
    expect(() => validateReview(review([2, 'B'], [0, 'D']), rules)).toThrow('band')
    const zeroed = applyReviewRules(validateReview(review([0, 'D'], [5, 'A']), rules), rules, {})
    expect(zeroed.criteria.map(c => c.grade)).toEqual(['D', 'D'])
    expect(() =>
      validatePacks([
        {
          ...syntheticEnglishA1,
          structure: syntheticEnglishA1.structure.map(module => ({
            ...module,
            parts: module.parts.map(part =>
              part.itemFormat === 'freeform'
                ? {
                    ...part,
                    runtime: {
                      ...part.runtime!,
                      criteria: part.runtime!.criteria!.map(c => ({
                        ...c,
                        allowedPoints: [c.maxPoints, 0, 0],
                      })),
                    },
                  }
                : part
            ),
          })),
        },
      ])
    ).toThrow('criterion bands')
  })
})

describe('Gap-fill format', () => {
  const rules = { minutes: 3, maxPoints: 2, questionCount: 2 }
  const gapPart = (): ExamPart =>
    syntheticEnglishA1.structure
      .find(module => module.id === 'reading')!
      .parts.find(part => part.itemFormat === 'gap-fill')!

  it('normalizes case, spacing, typographic marks and outer punctuation only', () => {
    expect(normalizeGapAnswer('  In  ')).toBe('in')
    expect(normalizeGapAnswer('DON\u2019T.')).toBe("don't")
    expect(normalizeGapAnswer('\u201Cby\u201D')).toBe('by')
    expect(normalizeGapAnswer('half\u2013past  seven!')).toBe('half-past seven')
    expect(normalizeGapAnswer('7.30')).toBe('7.30')
    expect(normalizeGapAnswer(15)).toBe('15')
    expect(normalizeGapAnswer(undefined)).toBe('')
  })

  it('keeps spelling strict and treats a blank as wrong', () => {
    expect(isGapAnswerCorrect('Colour', ['colour', 'color'])).toBe(true)
    expect(isGapAnswerCorrect('color', ['colour', 'color'])).toBe(true)
    expect(isGapAnswerCorrect('colur', ['colour', 'color'])).toBe(false)
    expect(isGapAnswerCorrect('fifteen', ['15'])).toBe(false)
    expect(isGapAnswerCorrect('   ', ['in'])).toBe(false)
  })

  it('scores typed answers against the accepted lists', () => {
    const part = gapPart()
    const view = part.adapter!.project(syntheticPayloads[17])
    expect(view.questions!.every(q => q.options.length === 0 && q.correctAnswer === -1)).toBe(true)
    expect(objectiveScore(view, part.runtime!, { a: 'In', b: 'by.' })).toEqual({
      score: 2,
      maxScore: 2,
      percentage: 100,
    })
    expect(objectiveScore(view, part.runtime!, { a: 'on', b: -1 })).toEqual({
      score: 0,
      maxScore: 2,
      percentage: 0,
    })
  })

  it('rejects gaps without accepted answers and accepted answers outside gap-fill', () => {
    const adapter = formatAdapter('gap-fill', rules)
    expect(() =>
      adapter.project({ ...syntheticPayloads[17], questions: [{ id: 'a' }, { id: 'b' }] })
    ).toThrow('accepted')
    expect(() =>
      adapter.project({
        ...syntheticPayloads[17],
        questions: [
          { id: 'a', accepted: [' '] },
          { id: 'b', accepted: ['by'] },
        ],
      })
    ).toThrow('accepted')
    const selection = syntheticEnglishA1.structure[0]!.parts[0]!
    const view = selection.adapter!.project(syntheticPayloads[7])
    expect(() =>
      validateView(
        { ...view, questions: view.questions!.map(q => ({ ...q, accepted: ['x'] })) },
        selection.runtime!
      )
    ).toThrow('gap-fill')
  })

  it('projects raw gap payloads without reading a coerced correctAnswer', () => {
    const part = { ...gapPart(), runtime: rules }
    const view = goetheRawAdapter('reading', part, rules).project({
      id: 'r5',
      title: 'Open cloze',
      content: 'I live (1) ____ a town. We meet (2) ____ Monday.',
      questions: [
        { id: 'r5-q1', question: 'Gap 1', accepted: ['in'], correctAnswer: 15 },
        { id: 'r5-q2', question: 'Gap 2', accepted: ['on'], explanation: 'Days take on.' },
      ],
    })
    expect(() => validateView(view, rules)).not.toThrow()
    expect(view.questions![0]).toEqual(
      expect.objectContaining({ options: [], correctAnswer: -1, accepted: ['in'] })
    )
    expect(objectiveScore(view, rules, { 'r5-q1': 'in', 'r5-q2': 'ON' }).score).toBe(2)
  })

  it('refuses option settings on a gap-fill part at registry startup', () => {
    const pack = {
      ...syntheticEnglishA1,
      structure: syntheticEnglishA1.structure.map(module => ({
        ...module,
        parts: module.parts.map(part =>
          part.itemFormat === 'gap-fill'
            ? { ...part, runtime: { ...part.runtime!, optionCount: 3 } }
            : part
        ),
      })),
    }
    expect(() => validatePacks([pack])).toThrow('gap-fill')
  })
})
