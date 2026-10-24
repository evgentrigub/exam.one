import {
  cambridgeEnA2,
  deleEsA2,
  evaluateMockPass,
  goetheDeA1,
  goetheDeA2,
  objectiveExercisePoints,
  type MockExamRules,
} from '@exam-one/exam-packs'

const GOETHE: MockExamRules = { maximumPoints: 100, passPoints: 60 }

const DELE: MockExamRules = {
  maximumPoints: 100,
  groups: [
    { id: 'grupo-1', label: 'Grupo 1', skills: ['reading', 'writing'], maximumPoints: 50, passPoints: 30 },
    { id: 'grupo-2', label: 'Grupo 2', skills: ['listening', 'speaking'], maximumPoints: 50, passPoints: 30 },
  ],
}

describe('evaluateMockPass', () => {
  it('passes a single-threshold set at the rounded pass mark and fails below it', () => {
    const scores = { reading: 20, listening: 20, writing: 10, speaking: 9.6 }
    expect(evaluateMockPass(GOETHE, scores)).toMatchObject({ overall: 59.6, maximum: 100, passed: true, groups: [] })
    expect(evaluateMockPass(GOETHE, { ...scores, speaking: 9.4 }).passed).toBe(false)
  })

  it('defaults to 60 of 100 when a set has no rules', () => {
    expect(evaluateMockPass(undefined, { reading: 60 })).toMatchObject({ maximum: 100, passed: true })
    expect(evaluateMockPass(undefined, { reading: 59 }).passed).toBe(false)
  })

  it('passes a grouped set only when every group reaches its pass mark', () => {
    const result = evaluateMockPass(DELE, { reading: 18, writing: 12.5, listening: 15, speaking: 16 })
    expect(result.passed).toBe(true)
    expect(result.groups).toEqual([
      { id: 'grupo-1', label: 'Grupo 1', points: 30.5, maximum: 50, passPoints: 30, passed: true },
      { id: 'grupo-2', label: 'Grupo 2', points: 31, maximum: 50, passPoints: 30, passed: true },
    ])
  })

  it('fails a grouped set with one group below its mark although the total is high', () => {
    const result = evaluateMockPass(DELE, { reading: 25, writing: 25, listening: 14, speaking: 15 })
    expect(result.overall).toBe(79)
    expect(result.passed).toBe(false)
    expect(result.groups.map(group => group.passed)).toEqual([true, false])
  })

  it('counts a missing or ungraded module as zero', () => {
    const result = evaluateMockPass(DELE, { reading: 25, writing: null, listening: 25, speaking: 25 })
    expect(result.groups.map(group => group.points)).toEqual([25, 50])
    expect(result.passed).toBe(false)
  })
})

describe('objectiveExercisePoints', () => {
  it('scales correct answers to the exercise points, so half-point gaps earn half', () => {
    expect(objectiveExercisePoints(7, 10, 5)).toBe(3.5)
    expect(objectiveExercisePoints(10, 10, 5)).toBe(5)
    expect(objectiveExercisePoints(0, 10, 5)).toBe(0)
  })

  it('keeps the count when every question is worth one point or the total is unknown', () => {
    expect(objectiveExercisePoints(4, 5, 5)).toBe(4)
    expect(objectiveExercisePoints(4, undefined, 5)).toBe(4)
    expect(objectiveExercisePoints(4, 0, 5)).toBe(4)
  })

  it('changes no objective score of the other bundled sets: one point per question there', () => {
    for (const pack of [goetheDeA2, goetheDeA1, deleEsA2, cambridgeEnA2]) {
      const set = pack.bundledMockSet!
      for (const module of set.modules.filter(m => m.skill === 'reading' || m.skill === 'listening')) {
        for (const exercise of module.exercises) {
          const payload = (set.content[module.skill] as unknown as Record<string, unknown>[]).find(
            item => item['id'] === exercise.id
          )!
          const part = pack.structure.find(m => m.id === module.skill)!.parts.find(p => p.n === exercise.part)!
          const total = part.adapter!.project(structuredClone(payload)).questions!.length
          expect([pack.packId, exercise.id, total]).toEqual([pack.packId, exercise.id, exercise.maxRawPoints])
        }
      }
    }
  })
})
