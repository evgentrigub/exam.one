import {
  certpolPlA2,
  evaluateMockPass,
  objectiveExercisePoints,
  validateView,
  type MockExamContent,
  type MockExamOverviewInput,
  type SkillId,
} from '@exam-one/exam-packs'
import { PackAiService } from '../../../src/ai/pack-ai.service'
import type { LlmService } from '../../../src/ai/llm.service'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

const ORDER: SkillId[] = ['listening', 'reading', 'writing', 'speaking']
const set1 = certpolPlA2.bundledMockSet!
const BLANK: MockExamContent = { reading: [], listening: [], writing: [], speaking: [] }

function part(skill: SkillId, n: number) {
  return certpolPlA2.structure.find(m => m.id === skill)!.parts.find(p => p.n === n)!
}

function contentOf(skill: SkillId): Record<string, unknown>[] {
  return set1.content[skill] as unknown as Record<string, unknown>[]
}

function moduleOf(skill: SkillId) {
  return set1.modules.find(m => m.skill === skill)!
}

describe('Certyfikat Polski A2 mock exam', () => {
  it('bundles Set 1 with the four modules in exam order, timed per the exam', () => {
    expect(set1).toMatchObject({
      id: 'certpol-pl-a2-set-1',
      examId: 'certpol-pl-a2',
      level: 'A2',
      title: 'Certyfikat Polski A2 · Set 1',
      generated: false,
    })
    expect(set1.modules.map(m => m.skill)).toEqual(ORDER)
    expect(set1.modules.map(m => m.minutes)).toEqual([25, 45, 45, 15])
    expect(moduleOf('speaking').provisional).toBe(true)
  })

  it('reports raw points with no conversion: 30 / 30 / 20 / 36', () => {
    expect(set1.modules.map(m => m.maxRawPoints)).toEqual([30, 30, 20, 36])
    for (const module of set1.modules) {
      expect(module.multiplier).toBe(1)
      expect(module.maxFinalPoints).toBe(module.maxRawPoints)
      expect(module.exercises.reduce((sum, e) => sum + e.maxRawPoints, 0)).toBe(module.maxRawPoints)
    }
  })

  it('takes per-task points, two plays per recording and Polish task titles from the runtime', () => {
    const points = (skill: SkillId) => moduleOf(skill).exercises.map(e => e.maxRawPoints)
    expect(points('listening')).toEqual([10, 5, 5, 5, 5])
    expect(points('reading')).toEqual([5, 5, 5, 5, 5, 5])
    expect(points('writing')).toEqual([6, 14])
    expect(points('speaking')).toEqual([6, 15, 15])
    expect(moduleOf('listening').exercises.map(e => e.replays)).toEqual([2, 2, 2, 2, 2])
    expect(moduleOf('listening').exercises[4]!.title).toBe('Rozumienie ze słuchu · Zadanie V')
    expect(moduleOf('writing').exercises[1]!.title).toBe('Pisanie · Zadanie b')
  })

  it('passes only when the written part (40 of 80) and the oral part (18 of 36) both pass', () => {
    expect(set1.rules).toEqual({
      maximumPoints: 116,
      groups: [
        expect.objectContaining({
          id: 'written',
          skills: ['listening', 'reading', 'writing'],
          maximumPoints: 80,
          passPoints: 40,
        }),
        expect.objectContaining({
          id: 'oral',
          skills: ['speaking'],
          maximumPoints: 36,
          passPoints: 18,
        }),
      ],
    })
    expect(set1.rules!.passPoints).toBeUndefined()
    expect(
      evaluateMockPass(set1.rules, { listening: 15, reading: 15, writing: 10, speaking: 18 }).passed
    ).toBe(true)
    // A high total does not hide a failed part.
    const weakOral = evaluateMockPass(set1.rules, {
      listening: 30,
      reading: 30,
      writing: 20,
      speaking: 17,
    })
    expect(weakOral.overall).toBe(97)
    expect(weakOral.passed).toBe(false)
    expect(
      evaluateMockPass(set1.rules, { listening: 15, reading: 14, writing: 10, speaking: 36 }).passed
    ).toBe(false)
  })

  it('credits the half-point reading tasks as points, not correct answers', () => {
    const grammar = moduleOf('reading').exercises[0]!
    expect(objectiveExercisePoints(7, 10, grammar.maxRawPoints)).toBe(3.5)
  })

  it('resolves every module exercise to its content', () => {
    for (const module of set1.modules) {
      const ids = contentOf(module.skill).map(item => item['id'])
      expect(module.exercises.map(e => e.id)).toEqual(ids)
    }
  })

  it.each(ORDER)('ships %s content that passes the task validators', skill => {
    const payloads = contentOf(skill)
    expect(payloads.map(p => p['testingPart'])).toEqual(
      certpolPlA2.structure.find(m => m.id === skill)!.parts.map(p => p.n)
    )
    for (const payload of payloads) {
      const p = part(skill, Number(payload['testingPart']))
      expect(payload['examOnly']).toBe(true)
      expect(() => p.validate!(structuredClone(payload), p.runtime!)).not.toThrow()
      expect(() =>
        validateView(p.adapter!.project(structuredClone(payload)), p.runtime!)
      ).not.toThrow()
    }
  })

  it('uses other texts than the practice seeds', () => {
    const text = (payload: Record<string, unknown>) =>
      JSON.stringify(
        payload['content'] ??
          payload['transcript'] ??
          payload['items'] ??
          payload['task'] ??
          payload['cards'] ??
          payload['theme']
      )
    for (const skill of ORDER) {
      const practice = new Set(
        certpolPlA2.seedExercises![skill]!.filter(seed => seed['examOnly'] !== true).map(text)
      )
      for (const payload of contentOf(skill)) expect(practice.has(text(payload))).toBe(false)
    }
  })

  it('points the Set 1 listening recordings at bundled seed WAVs', () => {
    const prefix = '/audio/listening/certpol-pl-a2'
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
    expect(certpolPlA2.speech.audioPathPrefix).toBe(prefix)
  })

  it('registers the Set 1 payloads as exam-only seeds after the practice seeds', () => {
    for (const skill of ORDER) {
      const seeds = certpolPlA2.seedExercises![skill]!
      expect(seeds[0]!['examOnly']).toBeUndefined()
      const ids = contentOf(skill).map(item => item['id'])
      expect(seeds.filter(seed => seed['examOnly'] === true).map(seed => seed['id'])).toEqual(ids)
    }
  })

  it('creates generated sets from blank draft content and from pipeline content', () => {
    expect(certpolPlA2.createMockSet!(2, BLANK)).toMatchObject({
      id: 'certpol-pl-a2-set-2',
      generated: true,
    })
    const generated = certpolPlA2.createMockSet!(3, set1.content)
    expect(generated).toMatchObject({
      id: 'certpol-pl-a2-set-3',
      generated: true,
      level: 'A2',
      title: 'Certyfikat Polski A2 · Set 3',
    })
    expect(generated.modules).toEqual(set1.modules)
    expect(generated.rules).toEqual(set1.rules)
  })

  it('has its own overview that explains the per-part rule', () => {
    const grouped: MockExamOverviewInput = {
      overallPoints: 60,
      modules: [],
      passGroups: [
        { label: 'Część pisemna', points: 41, maximum: 80, passPoints: 40, passed: true },
      ],
    }
    expect(certpolPlA2.mockOverview!.system).toContain('Certyfikat Polski A2')
    expect(certpolPlA2.mockOverview!.assemble('en', grouped)).toContain('every group in passGroups')
  })

  describe('AI overview request', () => {
    const complete = jest.fn()
    const llm = {
      hasConfig: async () => true,
      complete,
      missingKeyError: () => 'no key',
    } as unknown as LlmService
    const service = new PackAiService(llm)

    it('reviews a Polish result through the Polish overview', async () => {
      complete.mockResolvedValue(
        JSON.stringify({ summary: 'Dobrze', strengths: [], focusAreas: [], nextSteps: ['Pisanie'] })
      )
      const result = await packContext.run({ packId: 'certpol-pl-a2' }, () =>
        service.reviewMockFor({ result: { overallPoints: 70, modules: [] }, outputLanguage: 'pl' })
      )
      expect(result).toEqual({
        data: { summary: 'Dobrze', strengths: [], focusAreas: [], nextSteps: ['Pisanie'] },
        error: null,
      })
      expect(complete.mock.calls[0][0][0].content).toContain('Certyfikat Polski A2')
    })
  })
})
