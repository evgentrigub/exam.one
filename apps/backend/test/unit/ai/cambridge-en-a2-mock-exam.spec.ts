import {
  cambridgeEnA2,
  evaluateMockPass,
  evaluateMockScale,
  goetheDeA1,
  goetheDeA2,
  scaleScore,
  validateView,
  type MockExamContent,
  type MockExamOverviewInput,
  type SkillId,
} from '@exam-one/exam-packs'
import { PackAiService } from '../../../src/ai/pack-ai.service'
import type { LlmService } from '../../../src/ai/llm.service'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

const SKILLS: SkillId[] = ['reading', 'writing', 'listening', 'speaking']
const set1 = cambridgeEnA2.bundledMockSet!
const scale = set1.rules!.scale!
const BLANK: MockExamContent = { reading: [], listening: [], writing: [], speaking: [] }
const MAXIMA = { reading: 30, writing: 30, listening: 25, speaking: 30 }

function part(skill: SkillId, n: number) {
  return cambridgeEnA2.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function contentOf(skill: SkillId): Record<string, unknown>[] {
  return set1.content[skill] as unknown as Record<string, unknown>[]
}

function moduleOf(skill: SkillId) {
  return set1.modules.find(m => m.skill === skill)!
}

describe('Cambridge A2 Key mock exam', () => {
  it('bundles Set 1 in the paper order, Reading and Writing split 40 / 20 minutes', () => {
    expect(set1).toMatchObject({
      id: 'cambridge-a2-set-1',
      examId: 'cambridge-a2',
      level: 'A2',
      title: 'Cambridge A2 Key · Set 1',
      generated: false,
    })
    expect(set1.modules.map(m => m.skill)).toEqual(SKILLS)
    expect(set1.modules.map(m => m.minutes)).toEqual([40, 20, 30, 10])
    expect(moduleOf('speaking').provisional).toBe(true)
  })

  it('keeps raw marks per module, for the Scale conversion', () => {
    expect(set1.modules.map(m => m.maxRawPoints)).toEqual([30, 30, 25, 30])
    for (const module of set1.modules) {
      expect(module.maxFinalPoints).toBe(module.maxRawPoints)
      expect(module.multiplier).toBe(1)
      expect(module.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(module.maxRawPoints)
    }
    expect(set1.rules).toMatchObject({ maximumPoints: 115, passPoints: 73 })
  })

  it('takes per-part points and two plays per recording from the runtime rules', () => {
    const points = (skill: SkillId) => moduleOf(skill).exercises.map(e => e.maxRawPoints)
    expect(points('reading')).toEqual([6, 7, 5, 6, 6])
    expect(points('writing')).toEqual([15, 15])
    expect(points('listening')).toEqual([5, 5, 5, 5, 5])
    expect(points('speaking')).toEqual([15, 15])
    expect(moduleOf('listening').exercises.map(e => e.replays)).toEqual([2, 2, 2, 2, 2])
    expect(moduleOf('writing').exercises.map(e => [e.part, e.title])).toEqual([
      [1, 'Writing · Part 6'],
      [2, 'Writing · Part 7'],
    ])
  })

  it('resolves every module exercise to its content', () => {
    for (const module of set1.modules) {
      const ids = contentOf(module.skill).map(item => item['id'])
      expect(module.exercises.map(e => e.id)).toEqual(ids)
    }
  })

  it.each(SKILLS)('ships %s content that passes the part validators', skill => {
    const payloads = contentOf(skill)
    expect(payloads.map(p => p['testingPart'])).toEqual(
      cambridgeEnA2.structure.find(m => m.id === skill)!.parts.map(p => p.n)
    )
    for (const payload of payloads) {
      const p = part(skill, Number(payload['testingPart']))
      expect(payload['examOnly']).toBe(true)
      expect(() => p.validate!(structuredClone(payload), p.runtime!)).not.toThrow()
      expect(() => validateView(p.adapter!.project(structuredClone(payload)), p.runtime!)).not.toThrow()
    }
  })

  it('points the Set 1 listening recordings at bundled seed WAVs', () => {
    const prefix = '/audio/listening/cambridge-en-a2'
    for (const exercise of contentOf('listening')) {
      const id = String(exercise['id'])
      const audio = exercise['audio'] as { items?: Record<string, string>; shared?: string }
      if (Array.isArray(exercise['items'])) {
        for (const item of exercise['items'] as { id: string }[])
          expect(audio.items![item.id]).toBe(`${prefix}/${id}/${item.id}.wav`)
        expect(audio.shared).toBeUndefined()
      } else {
        expect(audio).toEqual({ shared: `${prefix}/${id}/shared.wav` })
      }
    }
    expect(cambridgeEnA2.speech.audioPathPrefix).toBe(prefix)
  })

  it('registers the Set 1 payloads as exam-only seeds after the practice seeds', () => {
    for (const skill of SKILLS) {
      const seeds = cambridgeEnA2.seedExercises![skill]!
      expect(seeds[0]!['examOnly']).toBeUndefined()
      const ids = contentOf(skill).map(item => item['id'])
      expect(seeds.filter(seed => seed['examOnly'] === true).map(seed => seed['id'])).toEqual(ids)
    }
  })

  it('creates generated sets from blank draft content and from pipeline content', () => {
    expect(cambridgeEnA2.createMockSet!(2, BLANK)).toMatchObject({ id: 'cambridge-a2-set-2', generated: true })
    const generated = cambridgeEnA2.createMockSet!(3, set1.content)
    expect(generated).toMatchObject({ id: 'cambridge-a2-set-3', generated: true, title: 'Cambridge A2 Key · Set 3' })
    expect(generated.modules).toEqual(set1.modules)
    expect(generated.rules).toEqual(set1.rules)
  })

  describe('Cambridge English Scale', () => {
    it('hits every published anchor exactly and tops out at 150', () => {
      expect(scaleScore(scale, 'reading', 20, 30)).toBe(120)
      expect(scaleScore(scale, 'reading', 28, 30)).toBe(140)
      expect(scaleScore(scale, 'writing', 12, 30)).toBe(100)
      expect(scaleScore(scale, 'listening', 6, 25)).toBe(82)
      expect(scaleScore(scale, 'listening', 25, 25)).toBe(150)
      expect(scaleScore(scale, 'reading', 24, 30)).toBe(130)
    })

    it('rescales practice Speaking from 30 to the official 45 marks', () => {
      expect(scaleScore(scale, 'speaking', 18, 30)).toBe(120)
      expect(scaleScore(scale, 'speaking', 30, 30)).toBe(150)
    })

    it('extends the lowest segment below 82, never below 0', () => {
      expect(scaleScore(scale, 'reading', 4, 30)).toBe(73)
      expect(scaleScore(scale, 'reading', 0, 30)).toBe(61)
      expect(scaleScore(scale, 'listening', 0, 25)).toBeGreaterThanOrEqual(0)
    })

    it('averages the four skills into a rounded overall score and band', () => {
      const result = evaluateMockScale(scale, { reading: 20, writing: 18, listening: 17, speaking: 18 }, MAXIMA)
      expect(result).toMatchObject({ overall: 120, band: 'gradeC', passed: true })
      const strong = evaluateMockScale(scale, { reading: 30, writing: 26, listening: 23, speaking: 28 }, MAXIMA)
      expect(strong.band).toBe('gradeA')
      const weak = evaluateMockScale(scale, { reading: 10, writing: 10, listening: 9, speaking: 10 }, MAXIMA)
      expect(weak).toMatchObject({ band: null, passed: false })
    })

    it('waits for every skill before it reports an overall score', () => {
      const pending = evaluateMockScale(scale, { reading: 30, writing: null, listening: 25, speaking: 30 }, MAXIMA)
      expect(pending).toMatchObject({ overall: null, band: null, passed: false })
      expect(pending.skills.reading).toBe(150)
    })

    it('decides the pass on the Scale, not on raw points', () => {
      const result = evaluateMockPass(set1.rules, { reading: 20, writing: 18, listening: 17, speaking: 18 }, MAXIMA)
      expect(result.passed).toBe(true)
      expect(result.scale?.overall).toBe(120)
      expect(evaluateMockPass(set1.rules, { reading: 19, writing: 17, listening: 16, speaking: 17 }, MAXIMA).passed).toBe(false)
    })
  })

  it('has its own overview that explains the Scale, and leaves the Goethe prompts untouched', () => {
    const plain: MockExamOverviewInput = { overallPoints: 0, modules: [] }
    const scaled: MockExamOverviewInput = {
      ...plain,
      scale: { name: 'Cambridge English Scale', overall: 124, band: 'gradeC', pass: 120, skills: { reading: 130 } },
    }
    expect(cambridgeEnA2.mockOverview!.system).toContain('Cambridge A2 Key')
    expect(cambridgeEnA2.mockOverview!.assemble('en', scaled)).toContain('reported on the scale')
    expect(cambridgeEnA2.mockOverview!.assemble('en', plain)).not.toContain('scale')
    for (const pack of [goetheDeA2, goetheDeA1]) {
      const text = pack.mockOverview!.assemble('en', plain)
      expect(text).toContain('Treat pending AI grades as provisional.\nReturn only JSON')
    }
  })

  it('reviews a Cambridge result through the Cambridge overview', async () => {
    const complete = jest.fn().mockResolvedValue(
      JSON.stringify({ summary: 'Good', strengths: [], focusAreas: [], nextSteps: ['Writing'] })
    )
    const llm = {
      getConfig: () => ({ provider: 'openai' }),
      complete,
      missingKeyError: () => 'no key',
    } as unknown as LlmService
    const result = await packContext.run({ packId: 'cambridge-en-a2' }, () =>
      new PackAiService(llm).reviewMockFor({ result: { overallPoints: 80, modules: [] }, outputLanguage: 'en' })
    )
    expect(result.error).toBeNull()
    expect(complete.mock.calls[0][0][0].content).toContain('Cambridge A2 Key')
  })
})
