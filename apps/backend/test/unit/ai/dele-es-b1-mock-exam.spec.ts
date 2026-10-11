import {
  deleEsB1,
  deleEsA2,
  objectiveScore,
  evaluateMockPass,
  bundledAudioSegments,
  validatePacks,
  findPrompt,
  assemblePrompt,
  type SkillId,
  type MockExamContent,
} from '@exam-one/exam-packs'

const SKILLS: SkillId[] = ['reading', 'listening', 'writing', 'speaking']
const set = deleEsB1.bundledMockSet!
const payloads = (skill: SkillId) => set.content[skill] as unknown as Record<string, unknown>[]
const partOf = (skill: SkillId, n: number) =>
  deleEsB1.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!

describe('Spanish B1 mock exam', () => {
  it('bundles all 16 original tasks, correct timings and /25 normalization', () => {
    expect(set).toMatchObject({
      id: 'dele-es-b1-set-1',
      examId: 'dele-es-b1',
      level: 'B1',
      generated: false,
    })
    expect(set.modules.map(m => m.skill)).toEqual(SKILLS)
    expect(set.modules.map(m => m.minutes)).toEqual([70, 40, 60, 15])
    expect(set.modules.map(m => m.maxRawPoints)).toEqual([30, 30, 24, 36])
    expect(set.modules.map(m => m.exercises.length)).toEqual([5, 5, 2, 4])
    expect(set.rules!.maximumPoints).toBe(100)
    expect(set.rules!.passPoints).toBeUndefined()
    for (const m of set.modules) {
      expect(m.maxFinalPoints).toBe(25)
      expect(m.multiplier * m.maxRawPoints).toBeCloseTo(25)
      expect(m.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(m.maxRawPoints)
    }
    expect(set.modules[1]!.exercises.map(e => e.replays)).toEqual([2, 2, 2, 2, 2])
    expect(set.modules[3]!.provisional).toBe(true)
  })

  it.each(SKILLS)(
    'validates fresh %s exam-only seeds and retains independent practice content',
    skill => {
      const seeds = deleEsB1.seedExercises![skill]!
      const practice = seeds.filter(s => !s['examOnly'])
      expect(practice).toHaveLength(payloads(skill).length)
      expect(seeds.filter(s => s['examOnly'])).toEqual(payloads(skill))
      for (const payload of payloads(skill)) {
        expect(practice.map(s => s['id'])).not.toContain(payload['id'])
        const p = partOf(skill, Number(payload['testingPart']))
        expect(() => p.validate!(structuredClone(payload), p.runtime!)).not.toThrow()
        if (skill === 'reading' || skill === 'listening') {
          const view = p.adapter!.project(payload)
          expect(view.questions).toHaveLength(6)
          expect(
            objectiveScore(
              view,
              p.runtime!,
              Object.fromEntries(view.questions!.map(q => [q.id, q.correctAnswer]))
            ).score
          ).toBe(6)
          expect(objectiveScore(view, p.runtime!, {}).score).toBe(0)
          expect(practice.map(s => s['content'])).not.toContain(payload['content'])
        }
      }
      expect(() => validatePacks([deleEsB1])).not.toThrow()
    }
  )

  it('retains repeated reading matches but rejects reuse in exclusive matching banks', () => {
    const repeat = partOf('reading', 3).adapter!.project(payloads('reading')[2]!).questions!
    expect(new Set(repeat.map(q => q.correctAnswer)).size).toBe(3)
    for (const [skill, n] of [
      ['reading', 1],
      ['reading', 4],
      ['listening', 4],
    ] as const) {
      const p = partOf(skill, n)
      const broken = structuredClone(payloads(skill)[n - 1]!)
      const questions = broken['questions'] as Record<string, unknown>[]
      questions[1]!['correctAnswer'] = questions[0]!['correctAnswer']
      expect(() => p.validate!(broken, p.runtime!)).toThrow()
    }
  })

  it('maps six individual and four shared recordings under the Spanish prefix', () => {
    const audio = bundledAudioSegments(deleEsB1)
    expect(audio).toHaveLength(10)
    expect(new Set(audio.map(a => a.url)).size).toBe(10)
    expect(audio.filter(a => a.url.endsWith('/shared.wav'))).toHaveLength(4)
    expect(
      audio.every(
        a =>
          a.url.startsWith('/audio/listening/dele-es-b1/mock-dele-es-b1-set1-') &&
          a.transcript.length > 200
      )
    ).toBe(true)
  })

  it('allocates blank drafts and sorts generated parts while preserving A2 rules', () => {
    const blank: MockExamContent = { reading: [], listening: [], writing: [], speaking: [] }
    const draft = deleEsB1.createMockSet!(2, blank)
    expect(draft).toMatchObject({ id: 'dele-es-b1-set-2', generated: true })
    expect(draft.modules.map(m => m.exercises.length)).toEqual([0, 0, 0, 0])
    const generated = deleEsB1.createMockSet!(3, {
      ...set.content,
      reading: [...set.content.reading].reverse(),
    })
    expect(generated.modules).toEqual(set.modules)
    expect(generated.rules).toEqual(set.rules)
    expect(deleEsA2.bundledMockSet!.rules!.groups!.every(g => g.rounding === undefined)).toBe(true)
  })

  it('requires 30/50 in both groups without rounding or compensation across groups', () => {
    const maxima = { reading: 25, listening: 25, writing: 25, speaking: 25 }
    expect(evaluateMockPass(set.rules, maxima).passed).toBe(true)
    expect(
      evaluateMockPass(set.rules, { reading: 15, writing: 15, listening: 15, speaking: 15 }).passed
    ).toBe(true)
    for (const delta of [0.01, 0.001]) {
      const result = evaluateMockPass(set.rules, { ...maxima, reading: 5 - delta })
      expect(result).toMatchObject({ passed: false })
      expect(result.groups[0]!.points).toBeCloseTo(30 - delta)
      expect(result.groups[1]!.passed).toBe(true)
    }
    // A realistic six-question reading score and a /24 writing grade land at 29.1666/50.
    const raw = { reading: 15, listening: 30, writing: 16, speaking: 24 }
    const final = Object.fromEntries(set.modules.map(m => [m.skill, raw[m.skill] * m.multiplier]))
    const result = evaluateMockPass(set.rules, final)
    expect(result).toMatchObject({ passed: false })
    expect(result.groups[0]!.points).toBeCloseTo(29.16666667)
    expect(result.groups[1]!.passed).toBe(true)
    expect(evaluateMockPass(set.rules, { ...maxima, listening: 4.99 }).passed).toBe(false)
  })

  it('withholds each incomplete group result for missing and invalid productive grades', () => {
    for (const skill of ['writing', 'speaking'] as const)
      for (const missing of [null, undefined, NaN]) {
        const scores: Partial<Record<SkillId, number | null>> = {
          reading: 25,
          listening: 25,
          writing: 25,
          speaking: 25,
        }
        if (missing === undefined) delete scores[skill]
        else scores[skill] = missing
        const result = evaluateMockPass(set.rules, scores)
        expect(result).toMatchObject({ pending: true, passed: false })
        const pendingIndex = skill === 'writing' ? 0 : 1
        expect(result.groups[pendingIndex]).toMatchObject({
          pending: true,
          passed: false,
          points: 25,
        })
        expect(result.groups[1 - pendingIndex]!.passed).toBe(true)
      }
  })

  it('retains formative B1 analytic reviews and explicitly estimates productive /25 marks', () => {
    for (const skill of ['writing', 'speaking'] as const)
      for (const payload of payloads(skill)) {
        const p = partOf(skill, Number(payload['testingPart']))
        expect(p.runtime!.criteria!.map(c => c.maxPoints)).toEqual(
          skill === 'writing' ? [3, 3, 3, 3] : [3, 3, 3]
        )
        const prompt = findPrompt(deleEsB1, skill, p.n, 'review')!
        const assembled = assemblePrompt(prompt, {
          task: JSON.stringify(payload),
          userContent: 'Mi respuesta',
          outputLanguage: 'en',
        })
        expect(assembled).toContain(JSON.stringify(payload))
        expect(assembled).toContain('2 for performance meeting the B1 standard')
        if (skill === 'speaking') expect(assembled).toContain('Do not assess pronunciation')
      }
    const overview = deleEsB1.mockOverview!.assemble('en', { overallPoints: 75, modules: [] })
    for (const text of [
      'Compare unrounded marks',
      'pending or unavailable',
      '/24 normalized to /25',
      '/36 normalized to /25',
      'not an official DELE certificate',
    ])
      expect(overview).toContain(text)
  })
})
