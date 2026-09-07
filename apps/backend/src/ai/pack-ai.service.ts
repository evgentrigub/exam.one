import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import {
  getPack,
  DEFAULT_PACK_ID,
  findPrompt,
  record,
  validateView,
  validateReview,
  type SkillId,
  type PromptVars,
} from '@exam-one/exam-packs'
import type { AiResponse } from '@exam-one/contracts'
import { packContext } from '../common/pack-context.interceptor'
import { LlmService } from '../llm/llm.service'
import { extractJsonArray } from './json'

@Injectable()
export class PackAiService {
  constructor(private readonly llm: LlmService) {}

  pack() {
    return getPack(packContext.getStore()?.packId ?? DEFAULT_PACK_ID)!
  }
  isGeneric(): boolean {
    return !this.pack().compatibility
  }

  partError(skill: SkillId, parts: number[]): string | null {
    const module = this.pack().structure.find(module => module.id === skill)
    const invalid = parts.find(
      number => !module?.parts.some(part => part.n === number && part.available !== false)
    )
    return invalid === undefined
      ? null
      : `Part ${invalid} is not available for ${skill} in ${this.pack().title}`
  }

  payloadError(skill: SkillId, payload: Record<string, unknown>): string | null {
    if (payload['difficulty'] && payload['difficulty'] !== this.pack().cefr)
      return 'This exercise belongs to a different exam pack'
    return this.partError(skill, [Number(payload['testingPart'] ?? 1)])
  }

  async validateGenerated(
    skill: SkillId,
    response: Promise<AiResponse<unknown>>
  ): Promise<AiResponse<unknown>> {
    const result = await response
    if (result.error || !Array.isArray(result.data)) return result
    try {
      for (const payload of result.data) {
        const data = record(payload)
        const part = this.pack()
          .structure.find(module => module.id === skill)
          ?.parts.find(part => part.n === data['testingPart'])
        if (!part?.adapter || !part.runtime)
          throw new Error('Generated exercise has no registered part')
        validateView(part.adapter.project(data), part.runtime)
      }
      return result
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Invalid generated exercise',
      }
    }
  }

  async generate(skill: SkillId, parts: number[]): Promise<AiResponse<unknown[]>> {
    try {
      const pack = this.pack()
      if (!pack.live) throw new Error('This pack is unavailable for new practice')
      if (!this.llm.getConfig()) return { data: null, error: this.llm.missingKeyError() }
      const output: unknown[] = []
      for (const n of parts) {
        const part = pack.structure
          .find(m => m.id === skill)
          ?.parts.find(p => p.n === n && p.available !== false)
        const spec = findPrompt(pack, skill, n, 'generator')
        if (!part?.adapter || !part.runtime || !spec)
          throw new Error(`Unsupported ${skill} part ${n}`)
        const raw = await this.llm.complete([
          { role: 'user', content: spec.assemble({ count: 1 }) },
        ])
        const parsed = extractJsonArray(raw)
        if (!parsed?.length) throw new Error('The provider did not return an exercise array')
        for (const value of parsed) {
          const payload = {
            ...record(value),
            id: `${skill}-${pack.packId}-${randomUUID()}`,
            testingPart: n,
            difficulty: pack.cefr,
            createdAt: new Date().toISOString(),
          }
          validateView(part.adapter.project(payload), part.runtime)
          output.push(payload)
        }
      }
      return { data: output, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Generation failed' }
    }
  }

  async respond(
    skill: SkillId,
    n: number,
    kind: 'answer' | 'review',
    payload: unknown,
    answers: unknown
  ): Promise<AiResponse<unknown>> {
    try {
      const pack = this.pack()
      const part = pack.structure
        .find(m => m.id === skill)
        ?.parts.find(p => p.n === n && p.available !== false)
      if (!pack.live || !part?.adapter || !part.runtime)
        throw new Error('This exercise is unavailable')
      part.adapter.project(payload)
      const prompt = findPrompt(pack, skill, n, kind)
      if (!prompt) throw new Error('This prompt is unavailable')
      if (!this.llm.getConfig()) return { data: null, error: this.llm.missingKeyError() }
      const vars: PromptVars = {
        task: JSON.stringify(payload),
        userContent: JSON.stringify(answers),
        outputLanguage: 'en',
      }
      const raw = await this.llm.complete([{ role: 'user', content: prompt.assemble(vars) }])
      if (kind === 'answer') return { data: { text: raw }, error: null }
      const cleaned = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
      const review = validateReview(JSON.parse(cleaned), part.runtime)
      const responses = record(answers)
      if (
        part.runtime.fields?.some(
          field =>
            field.zeroBelowWords !== undefined &&
            String(responses[field.id] ?? '')
              .trim()
              .split(/\s+/)
              .filter(Boolean).length < field.zeroBelowWords
        )
      ) {
        review.totalPoints = 0
        review.criteria = review.criteria.map(c => ({ ...c, points: 0 }))
      }
      return { data: review, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Review failed' }
    }
  }
}
