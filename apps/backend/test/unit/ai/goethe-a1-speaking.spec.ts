import {
  findPrompt,
  goetheDeA1,
  validateReview,
  validateView,
  type SkillId,
} from '@exam-one/exam-packs'
import { PackAiService } from '../../../src/ai/pack-ai.service'
import type { LlmService } from '../../../src/ai/llm.service'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

function part(n: number) {
  return goetheDeA1.structure
    .find(m => m.id === ('speaking' as SkillId))!
    .parts.find(p => p.n === n)!
}

function seed(n: number): Record<string, unknown> {
  return structuredClone(
    goetheDeA1.seedExercises!.speaking!.find(s => s['testingPart'] === n)!
  ) as Record<string, unknown>
}

function fullReview(n: number) {
  const rules = part(n).runtime!
  return {
    criteria: rules.criteria!.map(c => ({ ...c, points: c.maxPoints, comment: 'Gut' })),
    totalPoints: rules.maxPoints,
    maxPoints: rules.maxPoints,
    summary: 'Gut',
    strengths: [],
    improvements: [],
  }
}

describe('Goethe A1 speaking', () => {
  it.each([
    [1, undefined, ['monologue']],
    [2, 'word-cards', ['ask1', 'answer1', 'ask2', 'answer2']],
    [3, 'request-cards', ['request1', 'response1', 'request2', 'response2']],
  ] as const)('Teil %i uses layout %s with segments %j', (n, layout, segments) => {
    const p = part(n)
    expect(p.layout).toBe(layout)
    const view = p.adapter!.project(seed(n))
    expect(() => validateView(view, p.runtime!)).not.toThrow()
    expect(() => p.validate!(seed(n), p.runtime!)).not.toThrow()
    expect(view.segments!.map(s => s.id)).toEqual(segments)
    expect(p.runtime!.criteria!.reduce((sum, c) => sum + c.maxPoints, 0)).toBe(n === 1 ? 3 : 6)
  })

  it('rejects a card out of order or of the wrong kind', () => {
    const swapped = seed(2)
    const cards = swapped['cards'] as Record<string, unknown>[]
    ;[cards[0], cards[1]] = [cards[1]!, cards[0]!]
    expect(() => part(2).validate!(swapped, part(2).runtime!)).toThrow(
      'cards[0].segment must be "ask1"'
    )
    const wrongKind = seed(3)
    ;(wrongKind['cards'] as Record<string, unknown>[])[1]!['kind'] = 'request'
    expect(() => part(3).validate!(wrongKind, part(3).runtime!)).toThrow(
      'cards[1].kind must be "respond"'
    )
  })

  it('rejects a word card without its topic, and a blank cue', () => {
    const noTopic = seed(2)
    delete (noTopic['cards'] as Record<string, unknown>[])[2]!['topic']
    expect(() => part(2).validate!(noTopic, part(2).runtime!)).toThrow('cards[2].topic')
    const blank = seed(3)
    ;(blank['cards'] as Record<string, unknown>[])[0]!['cue'] = ' '
    expect(() => part(3).validate!(blank, part(3).runtime!)).toThrow('cards[0].cue')
  })

  it('rejects an introduction without enough keywords', () => {
    const payload = seed(1)
    payload['keywords'] = ['Name?', 'Alter?']
    expect(() => part(1).validate!(payload, part(1).runtime!)).toThrow('7 to 10')
  })

  it.each([1, 2, 3])('resolves every placeholder in the Teil %i answer and review prompts', n => {
    const answers = Object.fromEntries(part(n).runtime!.segments!.map(s => [s.id, 'Hallo']))
    for (const kind of ['answer', 'review'] as const) {
      const vars = goetheDeA1.buildReviewVars!({
        skill: 'speaking',
        part: n,
        kind,
        payload: seed(n),
        answers,
        outputLanguage: 'de',
      })
      expect(findPrompt(goetheDeA1, 'speaking', n, kind)!.assemble(vars)).not.toMatch(
        /\{[a-zA-Z]+\}/
      )
    }
  })

  it.each([1, 2, 3])('accepts a full-marks Teil %i rubric', n => {
    expect(validateReview(fullReview(n), part(n).runtime!).totalPoints).toBe(n === 1 ? 3 : 6)
  })

  describe('review request', () => {
    const complete = jest.fn()
    const llm = {
      hasConfig: async () => true,
      complete,
      missingKeyError: () => 'no key',
    } as unknown as LlmService
    const service = new PackAiService(llm)
    const run = <T>(fn: () => Promise<T>) => packContext.run({ packId: 'goethe-de-a1' }, fn)

    beforeEach(() => complete.mockReset())

    it('refuses to grade a card exchange with a blank turn, without calling the model', async () => {
      const result = await run(() =>
        service.respond(
          'speaking',
          3,
          'review',
          seed(3),
          { request1: 'Bitte schließ die Tür.', response1: ' ' },
          'de'
        )
      )
      expect(result).toEqual({
        data: null,
        error: 'A transcript is required for response1, request2, response2',
      })
      expect(complete).not.toHaveBeenCalled()
    })

    it('grades a complete card exchange', async () => {
      complete.mockResolvedValue(JSON.stringify(fullReview(2)))
      const answers = {
        ask1: 'Was isst du zum Frühstück?',
        answer1: 'Ich trinke gern Tee.',
        ask2: 'Machst du Sport?',
        answer2: 'Am Sonntag schlafe ich.',
      }
      const result = await run(() =>
        service.respond('speaking', 2, 'review', seed(2), answers, 'de')
      )
      expect(result.error).toBeNull()
      expect((result.data as { totalPoints: number }).totalPoints).toBe(6)
      const prompt = complete.mock.calls[0][0][0].content as string
      expect(prompt).toContain(
        'ask1 — the learner asks a question from their word card. Card: "Essen und Trinken · Frühstück"'
      )
      expect(prompt).toContain('Learner said: "Was isst du zum Frühstück?"')
    })
  })
})
