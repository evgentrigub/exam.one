import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import {
  getPack,
  DEFAULT_PACK_ID,
  findPrompt,
  record,
  validateView,
  validateReview,
  applyReviewRules,
  withQuestionIds,
  coerceAnswerIndices,
  type LlmComplete,
  type SkillId,
  type PromptVars,
} from '@exam-one/exam-packs'
import type { AiResponse } from '@exam-one/contracts'
import { packContext } from '../core/interceptors/pack-context.interceptor'
import { LlmService } from './llm.service'
import { extractJsonArray, extractJsonObject } from './json'

/** How many exercises to generate in one call. The writing screen asks for several. */
function count(body: Record<string, unknown>): number {
  const value = body['count']
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
}

/** Feedback language from the request, defaulting to English when the client omits it. */
function language(body: Record<string, unknown>): string {
  const value = body['outputLanguage']
  return typeof value === 'string' && value.trim() ? value : 'en'
}

@Injectable()
export class PackAiService {
  constructor(private readonly llm: LlmService) {}

  pack() {
    return getPack(packContext.getStore()?.packId ?? DEFAULT_PACK_ID)!
  }

  private configured(): Promise<boolean> {
    return this.llm.hasConfig()
  }

  private missingKey(): AiResponse<unknown> {
    return { data: null, error: this.llm.missingKeyError() }
  }

  private complete: LlmComplete = (messages, options) => this.llm.complete(messages, options)

  async generateForSkill(
    skill: SkillId,
    body: Record<string, unknown>,
    parts: number[]
  ): Promise<AiResponse<unknown>> {
    return this.generate(skill, parts, count(body))
  }

  async answerFor(body: Record<string, unknown>): Promise<AiResponse<unknown>> {
    const topic = (body['topic'] ?? {}) as Record<string, unknown>
    return this.respond(
      'writing',
      Number(topic['testingPart']),
      'answer',
      topic,
      {},
      language(body)
    )
  }

  async reviewWritingFor(body: Record<string, unknown>): Promise<AiResponse<unknown>> {
    const topic = (body['topic'] ?? {}) as Record<string, unknown>
    return this.respond(
      'writing',
      Number(topic['testingPart']),
      'review',
      topic,
      body['answers'] ?? { answer: body['userContent'] },
      language(body)
    )
  }

  async reviewSpeakingFor(body: Record<string, unknown>): Promise<AiResponse<unknown>> {
    const topic = body['topic'] as Record<string, unknown> | undefined
    return this.respond(
      'speaking',
      Number(topic?.['testingPart']),
      'review',
      topic,
      body['answers'] ?? {},
      language(body)
    )
  }

  async reviewMockFor(body: Record<string, unknown>): Promise<AiResponse<unknown>> {
    const pack = this.pack()
    if (!pack.createMockSet) {
      return { data: null, error: 'Mock exams are unavailable for this pack' }
    }
    // Checked before dispatch: an unconfigured provider has always reported the missing key
    // rather than the pack's own unavailability.
    if (!(await this.configured())) {
      return {
        data: null,
        error:
          'AI overview is unavailable because no LLM API key is configured. Add one in Settings → AI provider.',
      }
    }
    const overview = pack.mockOverview
    if (!overview) return { data: null, error: 'Mock overview is unavailable for this pack' }
    try {
      const raw = await this.llm.complete(
        [
          { role: 'system', content: overview.system },
          { role: 'user', content: overview.assemble(language(body), body['result']) },
        ],
        overview.llm
      )
      const parsed = overview.parse(extractJsonObject(raw ?? ''))
      return parsed
        ? { data: parsed, error: null }
        : { data: null, error: 'The AI overview response could not be read. Please try again.' }
    } catch {
      return { data: null, error: 'AI overview generation failed. Please try again.' }
    }
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

  async generate(skill: SkillId, parts: number[], count = 1): Promise<AiResponse<unknown[]>> {
    try {
      const pack = this.pack()
      if (!pack.live) throw new Error('This pack is unavailable for new practice')
      if (!(await this.configured())) return { data: null, error: this.llm.missingKeyError() }
      const output: unknown[] = []
      for (const n of parts) {
        const part = pack.structure
          .find(m => m.id === skill)
          ?.parts.find(p => p.n === n && p.available !== false)
        const spec = findPrompt(pack, skill, n, 'generator')
        if (!part?.adapter || !part.runtime || !spec)
          throw new Error(`Unsupported ${skill} part ${n}`)
        const content = spec.assemble({ count })
        // A model that returns unparseable output, or output that misses a field the pack
        // requires, usually succeeds on a second attempt; one retry is what the exercise
        // generators have always done. The retry covers validation too, because a prompt
        // that asks for a fixed field is occasionally ignored and one bad draft should not
        // fail the whole request.
        const attempt = async (): Promise<Record<string, unknown>[]> => {
          const parsed = extractJsonArray(
            await this.llm.complete([{ role: 'user', content }], spec.llm)
          )
          if (!parsed?.length) throw new Error('The provider did not return an exercise array')
          return parsed.map(value => {
            const id = `${skill}-${pack.packId}-${randomUUID()}`
            const payload = withQuestionIds({
              ...coerceAnswerIndices(record(value)),
              id,
              testingPart: n,
              difficulty: pack.cefr,
              createdAt: new Date().toISOString(),
            })
            part.validate?.(payload, part.runtime!)
            validateView(part.adapter!.project(payload), part.runtime!)
            return payload
          })
        }
        output.push(...(await attempt().catch(() => attempt())))
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
    answers: unknown,
    outputLanguage = 'en'
  ): Promise<AiResponse<unknown>> {
    try {
      const pack = this.pack()
      const part = pack.structure
        .find(m => m.id === skill)
        ?.parts.find(p => p.n === n && p.available !== false)
      if (!pack.live || !part?.adapter || !part.runtime)
        throw new Error('This exercise is unavailable')
      if (skill === 'speaking') {
        const data = record(payload)
        const chosen = record(answers)['selectedTopic']
        if (Array.isArray(data['topicOptions'])) {
          const option = data['topicOptions'].map(record).find(o => o['id'] === chosen)
          if (option) payload = { ...data, theme: option['theme'], cards: option['cards'] }
        }
      }
      part.adapter.project(payload)
      // A blank transcript would be graded anyway, and the model returns a confident score
      // for nothing. The screen blocks it too; this covers every other caller.
      if (skill === 'speaking' && kind === 'review') {
        const transcripts = record(answers)
        const missing = (part.runtime.segments ?? []).filter(
          segment => !String(transcripts[segment.id] ?? '').trim()
        )
        if (missing.length)
          throw new Error(`A transcript is required for ${missing.map(s => s.id).join(', ')}`)
      }
      const prompt = findPrompt(pack, skill, n, kind)
      if (!prompt) throw new Error('This prompt is unavailable')
      if (!(await this.configured())) return { data: null, error: this.llm.missingKeyError() }
      // A pack may need more than the three generic variables; anything it does not
      // supply would otherwise reach the model as a literal "{placeholder}".
      const vars: PromptVars = pack.buildReviewVars
        ? pack.buildReviewVars({
            skill,
            part: n,
            kind,
            payload: record(payload),
            answers: record(answers),
            outputLanguage,
          })
        : {
            task: JSON.stringify(payload),
            userContent: JSON.stringify(answers),
            outputLanguage,
          }
      const raw = await this.llm.complete(
        [{ role: 'user', content: prompt.assemble(vars) }],
        prompt.llm
      )
      const parsed = extractJsonObject(raw)
      if (!parsed) throw new Error('The provider did not return a JSON object')
      // A model answer is handed to the client as-is: the prompt's contract already matches
      // the `{ content, wordCount, highlights }` shape the writing screen renders.
      if (kind === 'answer') {
        if (skill === 'writing' && typeof parsed['content'] === 'string')
          parsed['wordCount'] = parsed['content'].trim().split(/\s+/u).filter(Boolean).length
        return { data: parsed, error: null }
      }
      const review = applyReviewRules(
        validateReview(parsed, part.runtime),
        part.runtime,
        record(answers)
      )
      return { data: review, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Review failed' }
    }
  }
}
