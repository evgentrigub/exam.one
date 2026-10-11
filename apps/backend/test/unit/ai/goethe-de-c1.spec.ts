import {
  getPack,
  validatePacks,
  validateView,
  validateReview,
  applyReviewRules,
  bundledAudioSegments,
  objectiveScore,
  evaluateMockPass,
  type SkillId,
  type CriterionReview,
} from '@exam-one/exam-packs'
const pack = getPack('goethe-de-c1')!
const part = (skill: SkillId, n: number) =>
  pack.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
const rubric = (n: number, band = 0): CriterionReview => {
  const rules = part('writing', n).runtime!
  const criteria = rules.criteria!.map(c => ({
    ...c,
    points: c.allowedPoints![band]!,
    grade: 'ABCDE'[band]!,
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
describe('Goethe C1 replacement pack', () => {
  it('covers all twelve parts and twenty prompt slots, without a grammar module', () => {
    expect(pack.structure.map(m => m.parts.length)).toEqual([4, 4, 2, 2])
    expect(pack.prompts).toHaveLength(20)
    expect(() => validatePacks([{ ...pack, live: true }])).not.toThrow()
  })
  it.each(['reading', 'listening', 'writing', 'speaking'] as SkillId[])(
    'validates original practice and exam-only %s content',
    skill => {
      const seeds = pack.seedExercises![skill]!
      expect(seeds.filter(s => !s['examOnly'])).toHaveLength(partCount(skill))
      expect(seeds.filter(s => s['examOnly'])).toHaveLength(partCount(skill))
      for (const seed of seeds) {
        const definition = part(skill, Number(seed['testingPart']))
        expect(() => definition.validate!(seed, definition.runtime!)).not.toThrow()
        const view = definition.adapter!.project(seed)
        expect(() => validateView(view, definition.runtime!)).not.toThrow()
        if (view.questions)
          expect(
            objectiveScore(
              view,
              definition.runtime!,
              Object.fromEntries(view.questions.map(q => [q.id, q.correctAnswer]))
            ).score
          ).toBe(definition.runtime!.maxPoints)
      }
    }
  )
  it('uses one ten-sentence bank without reuse and exactly two unmatched expert opinions', () => {
    const seed = pack.seedExercises!.reading![2]!
    const broken = structuredClone(seed)
    const rows = broken['questions'] as { correctAnswer: number }[]
    rows[1]!.correctAnswer = rows[0]!.correctAnswer
    expect(() => part('reading', 3).validate!(broken, part('reading', 3).runtime!)).toThrow()
    expect(part('reading', 1).choiceGaps).toBe(true)
    expect(part('reading', 3).runtime!.optionCount).toBe(10)
  })
  it('discovers seven separate practice and seven mock WAVs, not one per discussion question', () => {
    const audio = bundledAudioSegments(pack)
    expect(audio).toHaveLength(14)
    expect(audio.filter(a => a.exerciseId.includes('practice'))).toHaveLength(7)
    expect(audio.filter(a => a.sectionId)).toHaveLength(8)
    expect(audio.filter(a => a.sectionId).every(a => a.itemId === undefined)).toBe(true)
    const seed = pack.seedExercises!.listening![2]!
    const view = part('listening', 3).adapter!.project(seed)
    expect(view.sections).toHaveLength(4)
    expect(view.sections!.map(s => s.questionIds.length)).toEqual([2, 2, 2, 2])
    expect(view.questions!.every(q => !q.transcript)).toBe(true)
    const broken = structuredClone(view)
    broken.sections![0]!.questionIds[0] = 'missing'
    expect(() => validateView(broken, part('listening', 3).runtime!)).toThrow('section references')
    const outOfOrder = structuredClone(seed)
    const sections = outOfOrder['sections'] as { questionIds: string[] }[]
    ;[sections[0]!.questionIds, sections[1]!.questionIds] = [
      sections[1]!.questionIds,
      sections[0]!.questionIds,
    ]
    expect(() => part('listening', 3).validate!(outOfOrder, part('listening', 3).runtime!)).toThrow(
      'consecutive questions'
    )
  })
  it.each([1, 2])('accepts only the five official bands for writing part %s', n => {
    const rules = part('writing', n).runtime!
    for (let band = 0; band < 5; band++)
      expect(validateReview(rubric(n, band), rules).totalPoints).toBe(
        rules.maxPoints * [1, 0.75, 0.5, 0.25, 0][band]!
      )
    const bad = rubric(n)
    bad.criteria[0]!.points -= 1
    bad.totalPoints -= 1
    expect(() => validateReview(bad, rules)).toThrow('band')
    const wrongGrade = rubric(n)
    wrongGrade.criteria[0]!.grade = 'F'
    expect(() => validateReview(wrongGrade, rules)).toThrow('band')
  })
  it.each([
    [1, 115],
    [2, 60],
  ])('enforces part %s word boundaries and task-fulfilment zero', (n, boundary) => {
    const rules = part('writing', n).runtime!
    const words = (count: number) => Array(count).fill('Wort').join(' ')
    expect(applyReviewRules(rubric(n), rules, { answer: words(boundary - 1) }).totalPoints).toBe(0)
    expect(applyReviewRules(rubric(n), rules, { answer: words(boundary) }).totalPoints).toBe(
      rules.maxPoints
    )
    const offTopic = rubric(n)
    offTopic.totalPoints -= offTopic.criteria[0]!.points
    offTopic.criteria[0]!.points = 0
    offTopic.criteria[0]!.grade = 'E'
    const checked = applyReviewRules(validateReview(offTopic, rules), rules, {
      answer: words(boundary + 30),
    })
    expect(checked.criteria.every(c => c.points === 0 && c.grade === 'E')).toBe(true)
  })
  it('retains recovered writing instructions with corrected timing, count and output language', () => {
    for (const prompt of pack.prompts.filter(p => p.skill === 'writing')) {
      const assembled = prompt.assemble({
        count: 2,
        task: 'TASK',
        userContent: 'TEXT',
        outputLanguage: 'Polish',
      })
      expect(assembled).not.toContain('{outputLanguage}')
      expect(assembled).not.toContain('"passed_module":')
      if (prompt.kind === 'generator') expect(assembled).toContain('Generate 2 independent')
    }
    for (const prompt of pack.prompts.filter(p => p.skill === 'writing' && p.kind === 'answer')) {
      const model = JSON.parse(prompt.examples![0]!) as { content: string; wordCount: number }
      expect(model.wordCount).toBe(model.content.trim().split(/\s+/u).length)
      expect(model.wordCount).toBeGreaterThanOrEqual(prompt.part === 1 ? 230 : 120)
    }
    expect(part('writing', 1).runtime!.minutes).toBe(50)
    expect(part('writing', 2).runtime!.criteria!.map(c => c.maxPoints)).toEqual([10, 10, 10, 10])
  })
  it('offers two presentations with a five-minute limit and four discussion turns', () => {
    expect(pack.seedExercises!.speaking![0]!['topicOptions'] as unknown[]).toHaveLength(2)
    expect(part('speaking', 1).runtime!.segments![0]!.maxSeconds).toBe(300)
    expect(part('speaking', 2).runtime!.segments).toHaveLength(4)
    expect(part('speaking', 1).runtime!.criteria).toHaveLength(5)
  })
  it('has independent module pass results and official rounded objective conversion', () => {
    const set = pack.bundledMockSet!
    expect(set.modules.map(m => m.minutes)).toEqual([65, 40, 75, 20])
    expect(set.modules[3]!.preparationMinutes).toBe(20)
    expect(set.modules[3]!.maxRawPoints).toBe(50)
    expect(set.modules[3]!.provisional).toBe(true)
    const table = [
      0, 3, 7, 10, 13, 17, 20, 23, 27, 30, 33, 37, 40, 43, 47, 50, 53, 57, 60, 63, 67, 70, 73, 77,
      80, 83, 87, 90, 93, 97, 100,
    ]
    for (let raw = 0; raw <= 30; raw++)
      expect(Math.round(raw * set.modules[0]!.multiplier)).toBe(table[raw])
    expect(
      evaluateMockPass(set.rules, {
        reading: (17 * 100) / 30,
        listening: 100,
        writing: 100,
        speaking: 100,
      }).passed
    ).toBe(false)
    expect(
      evaluateMockPass(set.rules, { reading: 60, listening: 60, writing: 60, speaking: 60 }).passed
    ).toBe(true)
    expect(
      evaluateMockPass(set.rules, { reading: 100, listening: 100, writing: 59.5, speaking: 100 })
        .passed
    ).toBe(false)
    expect(
      evaluateMockPass(set.rules, { reading: 100, listening: 100, writing: null, speaking: 100 })
        .pending
    ).toBe(true)
  })
  it('allocates an empty draft and constructs generated immutable Set 2 definitions', () => {
    expect(
      pack.createMockSet!(2, {
        reading: [],
        listening: [],
        writing: [],
        speaking: [],
      }).modules.every(m => m.exercises.length === 0)
    ).toBe(true)
    const set = pack.createMockSet!(2, structuredClone(pack.bundledMockSet!.content))
    expect(set.id).toBe('goethe-de-c1-set-2')
    expect(set.modules.flatMap(m => m.exercises)).toHaveLength(12)
  })
})
function partCount(skill: SkillId) {
  return skill === 'writing' || skill === 'speaking' ? 2 : 4
}
