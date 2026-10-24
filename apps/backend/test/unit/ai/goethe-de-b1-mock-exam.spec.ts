import {
  objectiveScore,
  goetheDeB1,
  goetheDeA2,
  evaluateMockPass,
  bundledAudioSegments,
  validatePacks,
  findPrompt,
  assemblePrompt,
  type MockExamContent,
  type SkillId,
} from '@exam-one/exam-packs'

const SKILLS: SkillId[] = ['reading', 'listening', 'writing', 'speaking']
const set = goetheDeB1.bundledMockSet!
const payloads = (skill: SkillId) => set.content[skill] as unknown as Record<string, unknown>[]
const partOf = (skill: SkillId, n: number) =>
  goetheDeB1.structure.find(module => module.id === skill)!.parts.find(part => part.n === n)!

describe('Goethe B1 mock exam', () => {
  it('bundles all 15 tasks with four independent /100 modules', () => {
    expect(set).toMatchObject({
      id: 'goethe-de-b1-set-1',
      examId: 'goethe-de-b1',
      level: 'B1',
      generated: false,
    })
    expect(set.modules.map(module => module.skill)).toEqual(SKILLS)
    expect(set.modules.map(module => module.minutes)).toEqual([65, 40, 60, 15])
    expect(set.modules.map(module => module.maxRawPoints)).toEqual([30, 30, 100, 60])
    expect(set.modules.map(module => module.exercises.length)).toEqual([5, 4, 3, 3])
    expect(
      set.rules!.groups!.map(group => [group.id, group.maximumPoints, group.passPoints])
    ).toEqual(SKILLS.map(skill => [skill, 100, 60]))
    expect(set.rules!.passPoints).toBeUndefined()
    for (const module of set.modules) {
      expect(module.maxFinalPoints).toBe(100)
      expect(module.multiplier * module.maxRawPoints).toBeCloseTo(100)
      expect(module.exercises.reduce((sum, exercise) => sum + exercise.maxRawPoints, 0)).toBe(
        module.maxRawPoints
      )
      expect(module.exercises.map(exercise => exercise.id)).toEqual(
        payloads(module.skill).map(payload => payload['id'])
      )
    }
    expect(set.modules[1]!.exercises.map(exercise => exercise.replays)).toEqual([2, 1, 1, 2])
    expect(set.modules[2]!.exercises.map(exercise => exercise.maxRawPoints)).toEqual([40, 40, 20])
    expect(set.modules[3]!.provisional).toBe(true)
  })

  it.each(SKILLS)(
    'ships fresh, validated %s exam-only content with unchanged practice seeds',
    skill => {
      const seeds = goetheDeB1.seedExercises![skill]!
      const practice = seeds.filter(seed => !seed['examOnly'])
      expect(seeds.filter(seed => seed['examOnly'])).toEqual(payloads(skill))
      expect(practice).toHaveLength(payloads(skill).length)
      for (const payload of payloads(skill)) {
        expect(practice.map(seed => seed['id'])).not.toContain(payload['id'])
        const part = partOf(skill, Number(payload['testingPart']))
        expect(() => part.validate!(structuredClone(payload), part.runtime!)).not.toThrow()
        if (skill === 'reading' || skill === 'listening') {
          const view = part.adapter!.project(payload)
          expect(view.questions).toHaveLength(part.runtime!.questionCount!)
          expect(
            objectiveScore(
              view,
              part.runtime!,
              Object.fromEntries(view.questions!.map(q => [q.id, q.correctAnswer]))
            ).score
          ).toBe(view.questions!.length)
          expect(practice.map(seed => seed['content'])).not.toContain(payload['content'])
        }
      }
      expect(() => validatePacks([goetheDeB1])).not.toThrow()
    }
  )

  it('retains a single unmatched advertisement, repeated speakers and mixed 2/3-option listening', () => {
    const advertisements = partOf('reading', 3).adapter!.project(payloads('reading')[2]!).questions!
    const answers = advertisements.map(question => question.correctAnswer)
    expect(answers.filter(answer => answer === 10)).toHaveLength(1)
    expect(new Set(answers.filter(answer => answer !== 10)).size).toBe(6)
    const broken = structuredClone(payloads('reading')[2]!)
    const rows = broken['questions'] as Record<string, unknown>[]
    rows[6]!['correctAnswer'] = 0
    expect(() => partOf('reading', 3).validate!(broken, partOf('reading', 3).runtime!)).toThrow()
    expect(
      partOf('listening', 1)
        .adapter!.project(payloads('listening')[0]!)
        .questions!.map(q => q.options.length)
    ).toEqual([2, 3, 2, 3, 2, 3, 2, 3, 2, 3])
    const speakers = partOf('listening', 4).adapter!.project(payloads('listening')[3]!).questions!
    expect(new Set(speakers.map(q => q.correctAnswer)).size).toBe(3)
  })

  it('maps four shared audio tracks under its own prefix', () => {
    const segments = bundledAudioSegments(goetheDeB1)
    expect(segments).toHaveLength(4)
    expect(new Set(segments.map(segment => segment.url)).size).toBe(4)
    expect(
      segments.every(segment =>
        segment.url.startsWith('/audio/listening/goethe-de-b1/mock-goethe-de-b1-set1-')
      )
    ).toBe(true)
    expect(
      segments.every(
        segment => segment.url.endsWith('/shared.wav') && segment.transcript.length > 1000
      )
    ).toBe(true)
  })

  it('supports blank draft allocation, generated sets and runtime part sorting', () => {
    const blank: MockExamContent = { reading: [], listening: [], writing: [], speaking: [] }
    const draft = goetheDeB1.createMockSet!(2, blank)
    expect(draft).toMatchObject({ id: 'goethe-de-b1-set-2', generated: true })
    expect(draft.modules.map(module => module.exercises.length)).toEqual([0, 0, 0, 0])
    const generated = goetheDeB1.createMockSet!(3, {
      ...set.content,
      writing: [...set.content.writing].reverse(),
    })
    expect(generated.modules).toEqual(set.modules)
    expect(generated.rules).toEqual(set.rules)
    expect(goetheDeA2.bundledMockSet!.id).toBe('goethe-a2-set-1')
  })

  it('normalizes raw points and passes every module at 60 independently', () => {
    const raw = { reading: 18, listening: 18, writing: 60, speaking: 36 }
    const final = Object.fromEntries(
      set.modules.map(module => [module.skill, raw[module.skill] * module.multiplier])
    )
    expect(evaluateMockPass(set.rules, final)).toMatchObject({ overall: 240, passed: true })
    expect(
      evaluateMockPass(set.rules, { reading: 100, listening: 100, writing: 100, speaking: 59.4 })
    ).toMatchObject({ overall: 359.4, passed: false })
    expect(
      evaluateMockPass(set.rules, { reading: 100, listening: 100, writing: 100, speaking: 59.5 })
        .passed
    ).toBe(true)
    const reading = set.modules[0]!
    expect(
      evaluateMockPass(set.rules, { ...final, reading: 17 * reading.multiplier }).groups[0]!.passed
    ).toBe(false)
    expect(
      evaluateMockPass(set.rules, { ...final, reading: 19 * reading.multiplier }).groups[0]!.passed
    ).toBe(true)
  })

  it('withholds pass/fail for missing or invalid grades while retaining completed modules', () => {
    for (const writing of [null, undefined, NaN]) {
      const result = evaluateMockPass(set.rules, {
        reading: 100,
        listening: 100,
        ...(writing === undefined ? {} : { writing }),
        speaking: 100,
      })
      expect(result).toMatchObject({ pending: true, passed: false })
      expect(result.groups[2]).toMatchObject({ pending: true, passed: false, points: 0 })
      expect(
        result.groups.filter(group => group.id !== 'writing').every(group => group.passed)
      ).toBe(true)
    }
  })

  it('uses the proper writing Aufgabe 3 rubric and word threshold in its review', () => {
    const rules = partOf('writing', 3).runtime!
    expect(rules.criteria!.map(criterion => criterion.maxPoints)).toEqual([4, 4, 6, 6])
    expect(rules.fields![0]!.zeroBelowWords).toBe(20)
    for (const skill of ['writing', 'speaking'] as const) {
      for (const payload of payloads(skill)) {
        const prompt = findPrompt(goetheDeB1, skill, Number(payload['testingPart']), 'review')!
        const assembled = assemblePrompt(prompt, {
          task: JSON.stringify(payload),
          userContent: 'Meine Antwort',
          outputLanguage: 'en',
        })
        expect(prompt.part).toBe(payload['testingPart'])
        expect(assembled).toContain(JSON.stringify(payload))
        expect(assembled).toContain('Meine Antwort')
      }
    }
    const overview = goetheDeB1.mockOverview!.assemble('en', { overallPoints: 300, modules: [] })
    expect(overview).toContain('high total cannot compensate')
    expect(overview).toContain('pending or unavailable')
    expect(overview).toContain('adapted /60 rubric')
  })
})
