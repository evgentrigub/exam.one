import {
  goetheDeA1,
  goetheDeA2,
  validateView,
  type MockExamContent,
  type SkillId,
} from '@exam-one/exam-packs'
import { PackAiService } from '../../../src/ai/pack-ai.service'
import type { LlmService } from '../../../src/ai/llm.service'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

const SKILLS: SkillId[] = ['reading', 'listening', 'writing', 'speaking']
const set1 = goetheDeA1.bundledMockSet!

function part(skill: SkillId, n: number) {
  return goetheDeA1.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function contentOf(skill: SkillId): Record<string, unknown>[] {
  return set1.content[skill] as unknown as Record<string, unknown>[]
}

describe('Goethe A1 mock exam', () => {
  it('bundles Set 1 with four modules in the A2 order, timed and scored per the exam', () => {
    expect(set1).toMatchObject({
      id: 'goethe-a1-set-1',
      examId: 'goethe-a1',
      level: 'A1',
      generated: false,
      rules: { maximumPoints: 100, passPoints: 60 },
    })
    expect(set1.modules.map(m => m.skill)).toEqual(SKILLS)
    expect(set1.modules.map(m => m.minutes)).toEqual([25, 20, 20, 15])
    for (const module of set1.modules) {
      expect(module.maxRawPoints).toBe(15)
      expect(module.maxFinalPoints).toBe(25)
      expect(module.maxRawPoints * module.multiplier).toBeCloseTo(25)
      expect(module.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(15)
    }
    expect(set1.modules.find(m => m.skill === 'speaking')!.provisional).toBe(true)
  })

  it('takes per-part points and replay limits from the runtime rules', () => {
    const points = (skill: SkillId) =>
      set1.modules.find(m => m.skill === skill)!.exercises.map(e => e.maxRawPoints)
    expect(points('reading')).toEqual([5, 5, 5])
    expect(points('listening')).toEqual([6, 4, 5])
    expect(points('writing')).toEqual([5, 10])
    expect(points('speaking')).toEqual([3, 6, 6])
    expect(set1.modules.find(m => m.skill === 'listening')!.exercises.map(e => e.replays)).toEqual([
      2, 1, 2,
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
      goetheDeA1.structure.find(m => m.id === skill)!.parts.map(p => p.n)
    )
    for (const payload of payloads) {
      const p = part(skill, Number(payload['testingPart']))
      expect(payload['examOnly']).toBe(true)
      expect(() => p.validate!(payload, p.runtime!)).not.toThrow()
      expect(() => validateView(p.adapter!.project(payload), p.runtime!)).not.toThrow()
    }
  })

  it('points every Set 1 listening item at a bundled seed WAV', () => {
    for (const exercise of contentOf('listening')) {
      const items = exercise['items'] as { id: string }[]
      const audio = (exercise['audio'] as { items: Record<string, string> }).items
      for (const item of items) {
        expect(audio[item.id]).toBe(`/audio/listening/a1/${exercise['id']}/${item.id}.wav`)
      }
    }
  })

  it('registers the Set 1 payloads as exam-only seeds after the practice seeds', () => {
    for (const skill of SKILLS) {
      const seeds = goetheDeA1.seedExercises![skill]!
      expect(seeds[0]!['examOnly']).toBeUndefined()
      const ids = contentOf(skill).map(item => item['id'])
      expect(seeds.filter(seed => seed['examOnly'] === true).map(seed => seed['id'])).toEqual(ids)
    }
  })

  it('creates a generated set from pipeline content', () => {
    const generated = goetheDeA1.createMockSet!(2, set1.content as MockExamContent)
    expect(generated).toMatchObject({ id: 'goethe-a1-set-2', generated: true, level: 'A1' })
    expect(generated.title).toBe('Goethe-Zertifikat A1 · Set 2')
    expect(generated.modules).toEqual(set1.modules)
  })

  it('has its own overview, and leaves the A2 one untouched', () => {
    expect(goetheDeA1.mockOverview!.system).toContain('Goethe A1')
    expect(goetheDeA1.mockOverview!.assemble('en', { overallPoints: 0, modules: [] })).toContain(
      'Review this Goethe A1 mock-exam result'
    )
    expect(goetheDeA2.mockOverview!.system).toBe(
      'You are a supportive Goethe A2 exam coach. Return only valid JSON and keep feedback concise.'
    )
  })

  describe('AI overview request', () => {
    const complete = jest.fn()
    const llm = {
      hasConfig: async () => true,
      complete,
      missingKeyError: () => 'no key',
    } as unknown as LlmService
    const service = new PackAiService(llm)

    it('reviews an A1 result through the A1 overview', async () => {
      complete.mockResolvedValue(
        JSON.stringify({ summary: 'Gut', strengths: [], focusAreas: [], nextSteps: ['Lesen'] })
      )
      const result = await packContext.run({ packId: 'goethe-de-a1' }, () =>
        service.reviewMockFor({ result: { overallPoints: 70, modules: [] }, outputLanguage: 'de' })
      )
      expect(result).toEqual({
        data: { summary: 'Gut', strengths: [], focusAreas: [], nextSteps: ['Lesen'] },
        error: null,
      })
      expect(complete.mock.calls[0][0][0].content).toContain('Goethe A1')
    })
  })
})
