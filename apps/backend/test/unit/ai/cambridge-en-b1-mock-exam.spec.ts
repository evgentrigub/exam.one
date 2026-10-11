import {
  cambridgeEnB1,
  cambridgeEnA2,
  evaluateMockPass,
  evaluateMockScale,
  scaleScore,
  bundledAudioSegments,
  validatePacks,
  findPrompt,
  assemblePrompt,
  type MockExamContent,
  type MockExamOverviewInput,
  type SkillId,
} from '@exam-one/exam-packs'
import { PackAiService } from '../../../src/ai/pack-ai.service'
import type { LlmService } from '../../../src/ai/llm.service'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

const SKILLS: SkillId[] = ['reading', 'writing', 'listening', 'speaking']
const set = cambridgeEnB1.bundledMockSet!
const scale = set.rules!.scale!
const maxima = { reading: 32, writing: 40, listening: 25, speaking: 80 }
const blank: MockExamContent = { reading: [], writing: [], listening: [], speaking: [] }
const payloads = (skill: SkillId) => set.content[skill] as unknown as Record<string, unknown>[]
const partOf = (skill: SkillId, n: number) =>
  cambridgeEnB1.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!

describe('Cambridge B1 Preliminary mock exam', () => {
  it('bundles all 16 tasks in paper order with the B1 timers and raw scores', () => {
    expect(set).toMatchObject({
      id: 'cambridge-en-b1-set-1',
      examId: 'cambridge-en-b1',
      level: 'B1',
      generated: false,
    })
    expect(set.modules.map(m => m.skill)).toEqual(SKILLS)
    expect(set.modules.map(m => m.minutes)).toEqual([45, 45, 30, 12])
    expect(set.modules.map(m => m.maxRawPoints)).toEqual([32, 40, 25, 80])
    expect(set.modules.map(m => m.exercises.length)).toEqual([6, 2, 4, 4])
    expect(set.modules.find(m => m.skill === 'speaking')!.provisional).toBe(true)
    expect(set.rules).toMatchObject({ maximumPoints: 177, scale: { pass: 140, estimated: true } })
    for (const module of set.modules) {
      expect(module.multiplier).toBe(1)
      expect(module.maxFinalPoints).toBe(module.maxRawPoints)
      expect(module.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(module.maxRawPoints)
      expect(module.exercises.map(e => e.id)).toEqual(payloads(module.skill).map(p => p['id']))
    }
    expect(set.modules.find(m => m.skill === 'listening')!.exercises.map(e => e.replays)).toEqual([
      2, 2, 2, 2,
    ])
  })

  it.each(SKILLS)('ships distinct, validated %s exam-only seeds', skill => {
    const seeds = cambridgeEnB1.seedExercises![skill]!
    expect(seeds.filter(seed => seed['examOnly'] === true)).toEqual(payloads(skill))
    const practiceIds = seeds.filter(seed => !seed['examOnly']).map(seed => seed['id'])
    expect(practiceIds).toHaveLength(payloads(skill).length)
    for (const payload of payloads(skill)) {
      expect(practiceIds).not.toContain(payload['id'])
      const part = partOf(skill, Number(payload['testingPart']))
      expect(() => part.validate!(structuredClone(payload), part.runtime!)).not.toThrow()
      const malformed = structuredClone(payload)
      if (skill === 'writing') malformed['task'] = ''
      else if (skill === 'speaking') malformed['cards'] = []
      else malformed['content'] = ''
      expect(() => part.validate!(malformed, part.runtime!)).toThrow()
    }
    expect(() => validatePacks([cambridgeEnB1])).not.toThrow()
  })

  it('includes a sustained B1 article and preserves the typed one-word cloze', () => {
    const article = payloads('reading').find(p => p['testingPart'] === 3)!
    expect(Number(article['wordCount'])).toBeGreaterThanOrEqual(400)
    expect(Number(article['wordCount'])).toBeLessThanOrEqual(500)
    const gaps = partOf('reading', 6).adapter!.project(payloads('reading')[5]!).questions!
    expect(gaps).toHaveLength(6)
    expect(gaps.every(q => q.accepted?.length && q.options.length === 0)).toBe(true)
  })

  it('maps 13 item WAVs and two shared tracks under the B1 prefix', () => {
    const segments = bundledAudioSegments(cambridgeEnB1)
    expect(segments).toHaveLength(15)
    expect(new Set(segments.map(s => s.url)).size).toBe(15)
    expect(
      segments.every(s =>
        s.url.startsWith('/audio/listening/cambridge-en-b1/mock-cambridge-en-b1-set1-')
      )
    ).toBe(true)
    expect(segments.every(s => s.transcript.length > 100)).toBe(true)
    const [first, second, third, fourth] = payloads('listening')
    expect(Object.keys((first!['audio'] as { items: object }).items)).toHaveLength(7)
    expect(Object.keys((second!['audio'] as { items: object }).items)).toHaveLength(6)
    expect((third!['audio'] as { shared: string }).shared).toMatch(/\/shared.wav$/)
    expect((fourth!['audio'] as { shared: string }).shared).toMatch(/\/shared.wav$/)
  })

  it('supports blank draft allocation, generated content and runtime part sorting', () => {
    const draft = cambridgeEnB1.createMockSet!(2, blank)
    expect(draft).toMatchObject({ id: 'cambridge-en-b1-set-2', generated: true })
    expect(draft.modules.map(m => m.exercises.length)).toEqual([0, 0, 0, 0])
    const generated = cambridgeEnB1.createMockSet!(3, {
      ...set.content,
      reading: [...set.content.reading].reverse(),
    })
    expect(generated.id).toBe('cambridge-en-b1-set-3')
    expect(generated.modules).toEqual(set.modules)
    expect(generated.rules).toEqual(set.rules)
    expect(cambridgeEnA2.bundledMockSet!.id).toBe('cambridge-a2-set-1')
  })

  it('uses every published B1 anchor, including normalized speaking marks', () => {
    for (const skill of SKILLS) {
      for (const [raw, expected] of scale.anchors[skill]!) {
        const practiceRaw = (raw / scale.officialRaw[skill]!) * maxima[skill]
        expect(scaleScore(scale, skill, practiceRaw, maxima[skill])).toBeCloseTo(expected)
      }
      expect(scaleScore(scale, skill, maxima[skill], maxima[skill])).toBe(170)
      expect(scaleScore(scale, skill, 0, maxima[skill])).toBeGreaterThanOrEqual(0)
    }
    expect(scaleScore(scale, 'speaking', 48, 80)).toBe(140)
  })

  it('passes at the rounded Scale 140 boundary, independently of raw totals', () => {
    const scores = { reading: 23, writing: 24, listening: 18, speaking: 48 }
    expect(evaluateMockPass(set.rules, scores, maxima)).toMatchObject({
      passed: true,
      scale: { overall: 140, band: 'gradeC' },
    })
    expect(evaluateMockScale(scale, { ...scores, writing: 23.2 }, maxima).overall).toBe(140)
    expect(evaluateMockScale(scale, { ...scores, writing: 23 }, maxima)).toMatchObject({
      overall: 139,
      passed: false,
    })
    const bands = [
      [120, 'levelA2'],
      [140, 'gradeC'],
      [153, 'gradeB'],
      [160, 'gradeA'],
    ] as const
    for (const [target, band] of bands) {
      const marks = Object.fromEntries(
        SKILLS.map(skill => {
          const anchors = scale.anchors[skill]!
          const index = anchors.findIndex(a => a[1] >= target)
          const [x1, y1] = anchors[index]!
          const [x0, y0] = anchors[Math.max(0, index - 1)]!
          const raw = y1 === y0 ? x1 : x0 + ((target - y0) * (x1 - x0)) / (y1 - y0)
          return [skill, (raw / scale.officialRaw[skill]!) * maxima[skill]]
        })
      )
      expect(evaluateMockScale(scale, marks, maxima)).toMatchObject({ overall: target, band })
    }
  })

  it('withholds an overall result for null, omitted or invalid required grades', () => {
    for (const scores of [
      { reading: 32 },
      { reading: 32, writing: null, listening: 25, speaking: 80 },
      { reading: 32, writing: NaN, listening: 25, speaking: 80 },
    ]) {
      expect(evaluateMockScale(scale, scores, maxima)).toMatchObject({
        overall: null,
        band: null,
        passed: false,
      })
    }
  })

  it('assembles each productive task’s existing B1 review prompt', () => {
    for (const skill of ['writing', 'speaking'] as const) {
      for (const payload of payloads(skill)) {
        const prompt = findPrompt(cambridgeEnB1, skill, Number(payload['testingPart']), 'review')!
        const assembled = assemblePrompt(prompt, {
          task: JSON.stringify(payload),
          userContent: 'My response',
          outputLanguage: 'en',
        })
        expect(assembled).toContain('My response')
        expect(assembled).toContain(JSON.stringify(payload))
        expect(prompt.part).toBe(payload['testingPart'])
      }
    }
  })

  it('explains provisional scale results in its pack-owned overview', async () => {
    const input: MockExamOverviewInput = {
      overallPoints: 113,
      modules: [],
      scale: {
        name: 'Cambridge English Scale',
        overall: 140,
        band: 'gradeC',
        pass: 140,
        skills: {},
      },
    }
    expect(cambridgeEnB1.mockOverview!.assemble('en', input)).toContain('uncalibrated')
    const complete = jest.fn().mockResolvedValue(
      JSON.stringify({
        summary: 'Estimated B1 result.',
        strengths: [],
        focusAreas: [],
        nextSteps: ['Practise writing.'],
      })
    )
    const llm = {
      getConfig: () => ({ provider: 'openai' }),
      complete,
      missingKeyError: () => 'no key',
    } as unknown as LlmService
    const result = await packContext.run({ packId: 'cambridge-en-b1' }, () =>
      new PackAiService(llm).reviewMockFor({ result: input, outputLanguage: 'en' })
    )
    expect(result.error).toBeNull()
    expect(complete.mock.calls[0][0][0].content).toContain('Cambridge B1 Preliminary')
  })
})
