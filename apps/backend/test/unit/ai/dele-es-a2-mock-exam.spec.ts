import {
  deleEsA2,
  evaluateMockPass,
  goetheDeA1,
  goetheDeA2,
  validateView,
  type MockExamContent,
  type MockExamOverviewInput,
  type SkillId,
} from '@exam-one/exam-packs'
import { PackAiService } from '../../../src/ai/pack-ai.service'
import type { LlmService } from '../../../src/ai/llm.service'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

const SKILLS: SkillId[] = ['reading', 'listening', 'writing', 'speaking']
const set1 = deleEsA2.bundledMockSet!
const BLANK: MockExamContent = { reading: [], listening: [], writing: [], speaking: [] }

function part(skill: SkillId, n: number) {
  return deleEsA2.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function contentOf(skill: SkillId): Record<string, unknown>[] {
  return set1.content[skill] as unknown as Record<string, unknown>[]
}

function moduleOf(skill: SkillId) {
  return set1.modules.find(m => m.skill === skill)!
}

describe('DELE A2 mock exam', () => {
  it('bundles Set 1 with the four pruebas in exam order, timed per the exam', () => {
    expect(set1).toMatchObject({
      id: 'dele-es-a2-set-1',
      examId: 'dele-es-a2',
      level: 'A2',
      title: 'DELE A2 · Set 1',
      generated: false,
    })
    expect(set1.modules.map(m => m.skill)).toEqual(SKILLS)
    expect(set1.modules.map(m => m.minutes)).toEqual([60, 40, 45, 12])
    expect(moduleOf('speaking').provisional).toBe(true)
  })

  it('converts every prueba to 25 points from its raw total', () => {
    expect(set1.modules.map(m => m.maxRawPoints)).toEqual([25, 25, 12, 18])
    for (const module of set1.modules) {
      expect(module.maxFinalPoints).toBe(25)
      expect(module.maxRawPoints * module.multiplier).toBeCloseTo(25)
      expect(module.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(module.maxRawPoints)
    }
  })

  it('passes per group, Grupo 1 reading and writing and Grupo 2 listening and speaking', () => {
    expect(set1.rules).toEqual({
      maximumPoints: 100,
      groups: [
        expect.objectContaining({ id: 'grupo-1', skills: ['reading', 'writing'], maximumPoints: 50, passPoints: 30 }),
        expect.objectContaining({ id: 'grupo-2', skills: ['listening', 'speaking'], maximumPoints: 50, passPoints: 30 }),
      ],
    })
    expect(set1.rules!.passPoints).toBeUndefined()
    const strongReading = evaluateMockPass(set1.rules, { reading: 25, writing: 10, listening: 25, speaking: 25 })
    expect(strongReading.passed).toBe(true)
    const weakListening = evaluateMockPass(set1.rules, { reading: 25, writing: 25, listening: 10, speaking: 15 })
    expect(weakListening.passed).toBe(false)
  })

  it('takes per-part points and two plays per recording from the runtime rules', () => {
    const points = (skill: SkillId) => moduleOf(skill).exercises.map(e => e.maxRawPoints)
    expect(points('reading')).toEqual([5, 8, 6, 6])
    expect(points('listening')).toEqual([6, 6, 6, 7])
    expect(points('writing')).toEqual([6, 6])
    expect(points('speaking')).toEqual([6, 6, 6])
    expect(moduleOf('listening').exercises.map(e => e.replays)).toEqual([2, 2, 2, 2])
    expect(moduleOf('reading').exercises[0]!.title).toBe('Comprensión de lectura · Tarea 1')
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
      deleEsA2.structure.find(m => m.id === skill)!.parts.map(p => p.n)
    )
    for (const payload of payloads) {
      const p = part(skill, Number(payload['testingPart']))
      expect(payload['examOnly']).toBe(true)
      expect(() => p.validate!(structuredClone(payload), p.runtime!)).not.toThrow()
      expect(() => validateView(p.adapter!.project(structuredClone(payload)), p.runtime!)).not.toThrow()
    }
  })

  it('offers one writing Tarea 2 option, as the mock shows one task per part', () => {
    expect(contentOf('writing').map(p => p['topicType'])).toEqual(['email', 'opcion-a'])
  })

  it('points the Set 1 listening recordings at bundled seed WAVs', () => {
    const prefix = '/audio/listening/dele-es-a2'
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
    expect(deleEsA2.speech.audioPathPrefix).toBe(prefix)
  })

  it('registers the Set 1 payloads as exam-only seeds after the practice seeds', () => {
    for (const skill of SKILLS) {
      const seeds = deleEsA2.seedExercises![skill]!
      expect(seeds[0]!['examOnly']).toBeUndefined()
      const ids = contentOf(skill).map(item => item['id'])
      expect(seeds.filter(seed => seed['examOnly'] === true).map(seed => seed['id'])).toEqual(ids)
    }
  })

  it('creates generated sets from blank draft content and from pipeline content', () => {
    expect(deleEsA2.createMockSet!(2, BLANK)).toMatchObject({ id: 'dele-es-a2-set-2', generated: true })
    const generated = deleEsA2.createMockSet!(3, set1.content)
    expect(generated).toMatchObject({ id: 'dele-es-a2-set-3', generated: true, level: 'A2', title: 'DELE A2 · Set 3' })
    expect(generated.modules).toEqual(set1.modules)
    expect(generated.rules).toEqual(set1.rules)
  })

  it('has its own overview that explains the group rule, and leaves the Goethe prompts untouched', () => {
    const plain: MockExamOverviewInput = { overallPoints: 0, modules: [] }
    const grouped: MockExamOverviewInput = {
      ...plain,
      passGroups: [{ label: 'Grupo 1', points: 31, maximum: 50, passPoints: 30, passed: true }],
    }
    expect(deleEsA2.mockOverview!.system).toContain('DELE A2')
    expect(deleEsA2.mockOverview!.assemble('en', grouped)).toContain('every group in passGroups')
    expect(deleEsA2.mockOverview!.assemble('en', plain)).not.toContain('passGroups')
    for (const pack of [goetheDeA2, goetheDeA1]) {
      const text = pack.mockOverview!.assemble('en', plain)
      expect(text).toContain('Treat pending AI grades as provisional.\nReturn only JSON')
    }
  })

  describe('AI overview request', () => {
    const complete = jest.fn()
    const llm = {
      hasConfig: async () => true,
      complete,
      missingKeyError: () => 'no key',
    } as unknown as LlmService
    const service = new PackAiService(llm)

    it('reviews a DELE result through the DELE overview', async () => {
      complete.mockResolvedValue(
        JSON.stringify({ summary: 'Bien', strengths: [], focusAreas: [], nextSteps: ['Escritura'] })
      )
      const result = await packContext.run({ packId: 'dele-es-a2' }, () =>
        service.reviewMockFor({ result: { overallPoints: 70, modules: [] }, outputLanguage: 'es' })
      )
      expect(result).toEqual({
        data: { summary: 'Bien', strengths: [], focusAreas: [], nextSteps: ['Escritura'] },
        error: null,
      })
      expect(complete.mock.calls[0][0][0].content).toContain('DELE A2')
    })
  })
})
