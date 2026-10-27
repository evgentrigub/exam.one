import { evaluateMockPass, getPack, objectiveExercisePoints } from '@exam-one/exam-packs'

const pack = getPack('telc-de-b2')!
const set = pack.bundledMockSet!
const empty = { reading: [], listening: [], writing: [], speaking: [] }
const scores = (written: [number, number, number], speaking: number | null) => ({
  reading: written[0],
  listening: written[1],
  writing: written[2],
  speaking,
})

describe('telc Deutsch B2 mock exam', () => {
  it('bundles all twelve exam-only tasks in the written-exam order', () => {
    expect(set.modules.map(m => [m.skill, m.minutes, m.exercises.length])).toEqual([
      ['reading', 90, 5],
      ['listening', 20, 3],
      ['writing', 30, 1],
      ['speaking', 15, 3],
    ])
    const ids = set.modules.flatMap(m => m.exercises.map(e => e.id))
    const examOnly = Object.values(pack.seedExercises!)
      .flat()
      .filter(seed => seed['examOnly'])
      .map(seed => seed['id'])
    expect(ids.sort()).toEqual([...examOnly].sort())
    expect(set.modules[0]!.exercises.map(e => e.title)).toEqual([
      'Leseverstehen · Teil 1',
      'Leseverstehen · Teil 2',
      'Leseverstehen · Teil 3',
      'Sprachbausteine · Teil 1',
      'Sprachbausteine · Teil 2',
    ])
  })

  it('converts raw marks to the official 105 / 75 / 45 / 75 and prepares speaking for 20 minutes', () => {
    expect(set.modules.map(m => [m.maxRawPoints, m.maxFinalPoints])).toEqual([
      [105, 105],
      [75, 75],
      [15, 45],
      [63, 75],
    ])
    const speaking = set.modules[3]!
    expect(speaking).toMatchObject({ provisional: true, preparationMinutes: 20 })
    expect(63 * speaking.multiplier).toBeCloseTo(75)
    expect(set.modules[1]!.exercises.map(e => e.replays)).toEqual([1, 1, 1])
    // Five-point and half-point items need no special case.
    expect(objectiveExercisePoints(4, 5, 25)).toBe(20)
    expect(objectiveExercisePoints(7, 10, 25)).toBe(17.5)
    expect(objectiveExercisePoints(9, 10, 15)).toBe(13.5)
  })

  it('passes only when the written and the oral exam each reach 60 % exactly', () => {
    expect(evaluateMockPass(set.rules, scores([60, 45, 30], 45))).toMatchObject({
      overall: 180,
      passed: true,
      grade: 'ausreichend',
    })
    expect(evaluateMockPass(set.rules, scores([60, 44.5, 30], 75))).toMatchObject({
      passed: false,
      grade: 'failed',
    })
    expect(evaluateMockPass(set.rules, scores([105, 75, 45], 44.5))).toMatchObject({
      overall: 269.5,
      passed: false,
      grade: 'failed',
    })
  })

  it('awards grades on the exact total of a passed result', () => {
    const grade = (speaking: number) =>
      evaluateMockPass(set.rules, scores([100, 70, 45], speaking)).grade
    expect(grade(55)).toBe('sehrGut')
    expect(grade(54.5)).toBe('gut')
    expect(evaluateMockPass(set.rules, scores([95, 55, 40], 50))).toMatchObject({
      overall: 240,
      grade: 'gut',
    })
    expect(evaluateMockPass(set.rules, scores([80, 55, 30], 50))).toMatchObject({
      overall: 215,
      grade: 'befriedigend',
    })
  })

  it('reports no grade while the speaking grade is pending', () => {
    expect(evaluateMockPass(set.rules, scores([105, 75, 45], null))).toMatchObject({
      pending: true,
      grade: null,
    })
  })

  it('allocates an empty draft and builds generated immutable sets', () => {
    const draft = pack.createMockSet!(2, empty)
    expect(draft).toMatchObject({ id: 'telc-de-b2-set-2', generated: true, rules: set.rules })
    expect(draft.modules.map(m => m.exercises.length)).toEqual([0, 0, 0, 0])
    const full = pack.createMockSet!(3, set.content)
    expect(full.modules.map(m => m.exercises.length)).toEqual([5, 3, 1, 3])
  })
})
