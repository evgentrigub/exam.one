import {
  certpolPlB1,
  goetheDeA2,
  goetheDeB1,
  cambridgeEnB1,
  evaluateMockPass,
  mockModuleId,
  objectiveScore,
  objectiveExercisePoints,
  bundledAudioSegments,
  validatePacks,
  type MockExamContent,
  type SkillId,
} from '@exam-one/exam-packs'
const set = certpolPlB1.bundledMockSet!
const skills: SkillId[] = ['reading', 'listening', 'writing', 'speaking']
const partOf = (skill: SkillId, n: number) =>
  certpolPlB1.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
const payloads = (skill: SkillId) => set.content[skill] as unknown as Record<string, unknown>[]
describe('Certyfikat Polski adult B1 mocks', () => {
  it('bundles 23 tasks in five independent papers with four renderer skills', () => {
    expect(set.id).toBe('certpol-pl-b1-set-1')
    expect(set.modules.map(mockModuleId)).toEqual([
      'listening',
      'reading',
      'grammar',
      'writing',
      'speaking',
    ])
    expect(set.modules.map(m => m.skill)).toEqual([
      'listening',
      'reading',
      'reading',
      'writing',
      'speaking',
    ])
    expect(set.modules.map(m => m.minutes)).toEqual([30, 40, 45, 75, 15])
    expect(set.modules.map(m => m.maxRawPoints)).toEqual([30, 30, 30, 30, 36])
    expect(set.modules.map(m => m.maxFinalPoints)).toEqual([30, 30, 30, 30, 40])
    expect(set.modules.map(m => m.exercises.length)).toEqual([5, 5, 8, 2, 3])
    expect(set.rules!.maximumPoints).toBe(160)
    for (const module of set.modules) {
      expect(module.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(module.maxRawPoints)
      expect(module.multiplier * module.maxRawPoints).toBeCloseTo(module.maxFinalPoints)
    }
    expect(set.modules[2]!.exercises.map(e => e.part)).toEqual([6, 7, 8, 9, 10, 11, 12, 13])
    expect(set.modules[0]!.exercises.map(e => e.replays)).toEqual([1, 2, 2, 2, 2])
    expect(set.modules[4]!.provisional).toBe(true)
  })
  it.each(skills)(
    'ships fresh validated exam-only %s tasks alongside unchanged practice seeds',
    skill => {
      const seeds = certpolPlB1.seedExercises![skill]!
      const practice = seeds.filter(seed => !seed['examOnly'])
      expect(seeds.filter(seed => seed['examOnly'])).toEqual(payloads(skill))
      expect(practice).toHaveLength(payloads(skill).length)
      for (const payload of payloads(skill)) {
        const part = partOf(skill, Number(payload['testingPart']))
        expect(() => part.validate!(structuredClone(payload), part.runtime!)).not.toThrow()
        expect(practice.map(seed => seed['id'])).not.toContain(payload['id'])
        if (skill === 'reading' || skill === 'listening') {
          expect(practice.map(seed => seed['content'])).not.toContain(payload['content'])
          const view = part.adapter!.project(payload)
          const answers = Object.fromEntries(
            view.questions!.map(q => [q.id, q.accepted?.[0] ?? q.correctAnswer])
          )
          const result = objectiveScore(view, part.runtime!, answers)
          expect(result.score).toBe(part.runtime!.maxPoints)
          expect(
            objectiveExercisePoints(
              view.questions!.length,
              view.questions!.length,
              part.runtime!.maxPoints
            )
          ).toBe(part.runtime!.maxPoints)
        }
      }
      expect(() => validatePacks([certpolPlB1])).not.toThrow()
    }
  )
  it('keeps 14.5/30 below the threshold, passes at 15 and does not allow compensation', () => {
    const scores = { listening: 15, reading: 15, grammar: 15, writing: 15, speaking: 20 }
    expect(evaluateMockPass(set.rules, scores)).toMatchObject({ passed: true, overall: 80 })
    for (const paper of ['listening', 'reading', 'grammar', 'writing']) {
      const result = evaluateMockPass(set.rules, {
        listening: 30,
        reading: 30,
        grammar: 30,
        writing: 30,
        speaking: 40,
        [paper]: 14.5,
      })
      expect(result.passed).toBe(false)
      expect(result.groups.find(g => g.id === paper)).toMatchObject({ points: 14.5, passed: false })
    }
    expect(evaluateMockPass(set.rules, { ...scores, speaking: 19.9 }).passed).toBe(false)
    expect(objectiveExercisePoints(9, 10, 5)).toBe(4.5)
  })
  it('does not substitute Reading for a missing Grammar paper or an unavailable AI grade', () => {
    const scores = { listening: 30, reading: 30, grammar: 30, writing: 30, speaking: 40 }
    for (const key of ['grammar', 'writing', 'speaking']) {
      const result = evaluateMockPass(set.rules, { ...scores, [key]: null })
      expect(result).toMatchObject({ passed: false, pending: true })
      expect(result.groups.find(g => g.id === key)).toMatchObject({ pending: true })
    }
    const { grammar: _grammar, ...withoutGrammar } = scores
    expect(evaluateMockPass(set.rules, withoutGrammar).pending).toBe(true)
  })
  it('retains typed banks, spare matching options and valid future/question variants', () => {
    for (const n of [7, 13]) {
      const payload = structuredClone(payloads('reading')[n - 1]!)
      const rows = payload['questions'] as Record<string, unknown>[]
      rows[1]!['accepted'] = rows[0]!['accepted']
      expect(() => partOf('reading', n).validate!(payload, partOf('reading', n).runtime!)).toThrow()
    }
    const questions = (n: number) =>
      partOf('reading', n).adapter!.project(payloads('reading')[n - 1]!).questions!
    expect(questions(9)[7]!.accepted).toEqual(['będzie gotować', 'będzie gotowała'])
    expect(questions(10)[4]!.accepted).toContain('o której godzinie')
    expect(new Set(questions(3).map(q => q.correctAnswer)).size).toBe(7)
    expect(questions(3)[0]!.options).toHaveLength(8)
  })
  it('maps 19 item recordings and three shared tracks under its own prefix', () => {
    const segments = bundledAudioSegments(certpolPlB1)
    expect(segments).toHaveLength(22)
    expect(segments.filter(s => s.itemId)).toHaveLength(19)
    expect(new Set(segments.map(s => s.url)).size).toBe(22)
    expect(
      segments.every(s =>
        s.url.startsWith('/audio/listening/certpol-pl-b1/mock-certpol-pl-b1-set1-')
      )
    ).toBe(true)
    expect(segments.every(s => s.transcript.length > 50)).toBe(true)
  })
  it('allocates blank drafts and splits generated Reading content without duplication', () => {
    const blank: MockExamContent = { reading: [], listening: [], writing: [], speaking: [] }
    expect(certpolPlB1.createMockSet!(2, blank).modules.map(m => m.exercises.length)).toEqual([
      0, 0, 0, 0, 0,
    ])
    const generated = certpolPlB1.createMockSet!(2, {
      ...set.content,
      reading: [...set.content.reading].reverse(),
    })
    expect(generated).toMatchObject({ id: 'certpol-pl-b1-set-2', generated: true })
    expect(generated.modules).toEqual(set.modules)
    expect(generated.rules).toEqual(set.rules)
    expect(new Set(generated.modules.flatMap(m => m.exercises.map(e => e.id))).size).toBe(23)
    for (const legacy of [goetheDeA2, goetheDeB1, cambridgeEnB1])
      expect(legacy.bundledMockSet!.modules.map(mockModuleId)).toEqual(
        legacy.bundledMockSet!.modules.map(m => m.skill)
      )
  })
  it('explains separate Grammar, exact thresholds and estimated oral normalization in the overview', () => {
    const prompt = certpolPlB1.mockOverview!.assemble('en', { overallPoints: 80, modules: [] })
    expect(prompt).toContain('Grammar /30')
    expect(prompt).toContain('no rounding up')
    expect(prompt).toContain('pending=true')
    expect(prompt).toContain('/36 points are normalized to estimated /40')
    expect(prompt).toContain('assigned 25+175-word pair')
  })
})
