/**
 * useModelAnswer composable
 * Manages generation and storage of AI model answers for writing topics.
 *
 * Storage: NestJS attempts (`Result.review.modelAnswer`)
 */

import type { WritingExercise, ModelAnswer } from '~/utils/types'
import { onPackReset, packEpoch } from '~/utils/packScope'
import { ref } from 'vue'
import { generateUUID } from '~/utils/uuid'
import type { AttemptDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

type GenerationStatus = 'idle' | 'pending' | 'ready' | 'error'

interface ModelAnswerRecord {
  topicId: string
  status: GenerationStatus
  prompt: string
  requestedAt: string
  completedAt?: string
  modelAnswer?: ModelAnswer
  error?: string
}

const answers = ref<Record<string, ModelAnswerRecord>>({})
const modelAnswerVersion = ref(0)
let hydrated = false
onPackReset(() => { answers.value = {}; hydrated = false; modelAnswerVersion.value++ })

function persistModelAnswer(record: ModelAnswerRecord): void {
  void apiFetch('/attempts', {
    method: 'POST',
    body: {
      skill: 'WRITING',
      exerciseExternalId: record.topicId,
      answers: { kind: 'model-answer' },
      result: { review: { modelAnswer: record } },
    },
  }).catch(error => console.warn('Failed to persist model answer', error))
}

function readAllModelAnswers(): Record<string, ModelAnswerRecord> {
  return answers.value
}

function writeAllModelAnswers(map: Record<string, ModelAnswerRecord>): void {
  answers.value = map
  modelAnswerVersion.value++
}

async function hydrateModelAnswers(): Promise<void> {
  if (!import.meta.client || hydrated) return
  hydrated = true
  try {
    const rows = await apiFetch<AttemptDto[]>('/attempts?skill=WRITING')
    const map: Record<string, ModelAnswerRecord> = {}
    for (const row of rows) {
      const review = row.result?.review
      if (!review || typeof review !== 'object' || Array.isArray(review)) continue
      const nested = (review as { modelAnswer?: ModelAnswerRecord }).modelAnswer
      const topicId = nested?.topicId ?? row.exerciseExternalId
      if (nested && topicId) map[topicId] = nested
    }
    answers.value = map
  } catch (error) {
    console.warn('Failed to load model answers', error)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined
}

function normalizeModelAnswerData(
  value: unknown
): Pick<ModelAnswer, 'content' | 'wordCount' | 'highlights'> | null {
  if (!isRecord(value) || typeof value['content'] !== 'string') return null
  const wordCount = Number(value['wordCount'])
  if (!Number.isFinite(wordCount) || wordCount < 0) return null

  const highlights = isRecord(value['highlights']) ? value['highlights'] : {}
  const normalizedHighlights: NonNullable<ModelAnswer['highlights']> = {}
  const mainPoints = stringArray(highlights['mainPoints'])
  const keyPhrases = stringArray(highlights['keyPhrases'])

  if (typeof highlights['greeting'] === 'string')
    normalizedHighlights.greeting = highlights['greeting']
  if (typeof highlights['closing'] === 'string')
    normalizedHighlights.closing = highlights['closing']
  if (mainPoints) normalizedHighlights.mainPoints = mainPoints
  if (keyPhrases) normalizedHighlights.keyPhrases = keyPhrases

  return {
    content: value['content'],
    wordCount,
    ...(Object.keys(normalizedHighlights).length > 0 && { highlights: normalizedHighlights }),
  }
}

function saveRecord(record: ModelAnswerRecord): void {
  const all = { ...answers.value, [record.topicId]: record }
  writeAllModelAnswers(all)
  persistModelAnswer(record)
}

function getRecord(topicId: string): ModelAnswerRecord | null {
  return answers.value[topicId] || null
}

export function useModelAnswer() {
  const requestPackId = useSettingsStore().packId
  const requestEpoch = packEpoch()
  if (import.meta.client) void hydrateModelAnswers()
  const { assemble } = usePackPrompt(requestPackId)
  function getModelAnswer(topicId: string): ModelAnswer | null {
    const record = getRecord(topicId)
    return record?.modelAnswer || null
  }

  function isGenerating(topicId: string): boolean {
    return getRecord(topicId)?.status === 'pending'
  }

  function hasModelAnswer(topicId: string): boolean {
    const rec = getRecord(topicId)
    return rec?.status === 'ready' && !!rec?.modelAnswer
  }

  function getModelAnswerError(topicId: string): string | null {
    const rec = getRecord(topicId)
    return rec?.status === 'error' ? rec.error || 'Model answer generation is unavailable.' : null
  }

  function clearModelAnswer(topicId: string): void {
    const all = readAllModelAnswers()
    const { [topicId]: _removed, ...rest } = all
    writeAllModelAnswers(rest)
  }

  function getGenerationPrompt(topic: WritingExercise): string {
    const part = topic.testingPart === 2 ? 2 : 1
    const prompt = assemble('writing', part, 'answer', {
      task: topic.task,
      topicId: topic.id,
    })
    if (!prompt) {
      throw new Error(`No model-answer prompt is configured for writing part ${part}`)
    }
    return prompt
  }

  /**
   * Request generation of a model answer for the given topic.
   * Uses OpenAI API if available, otherwise returns error.
   */
  async function generateModelAnswer(topic: WritingExercise): Promise<void> {
    const prompt = getGenerationPrompt(topic)

    saveRecord({
      topicId: topic.id,
      status: 'pending',
      prompt,
      requestedAt: new Date().toISOString(),
    })

    try {
      // Cast through unknown to bypass Nuxt's complex route type inference
      const response = await aiFetch<Partial<ModelAnswer>>('/llm/generate-model-answer', {
        packId: requestPackId,
        method: 'POST',
        body: { topic, prompt },
      })

      if (requestEpoch !== packEpoch()) return
      const current = getRecord(topic.id)
      if (current) {
        if (response.error) throw new Error(response.error)
        let parsedData = normalizeModelAnswerData(response.data)

        if (!parsedData) {
          parsedData = null
        }

        if (parsedData) {
          // Generate UUID for the model answer
          const modelAnswer: ModelAnswer = {
            id: generateUUID(),
            topicId: topic.id,
            content: parsedData.content,
            wordCount: parsedData.wordCount,
            ...(parsedData.highlights && { highlights: parsedData.highlights }),
          }

          const update: ModelAnswerRecord = {
            ...current,
            status: 'ready',
            completedAt: new Date().toISOString(),
            modelAnswer,
          }

          saveRecord(update)
        } else {
          saveRecord({
            ...current,
            status: 'error',
            completedAt: new Date().toISOString(),
            error: 'Failed to parse model answer from response',
          })
        }
      }
    } catch (error) {
      if (requestEpoch !== packEpoch()) return
      const current = getRecord(topic.id)
      if (current) {
        saveRecord({
          ...current,
          status: 'error',
          completedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Model answer generation is unavailable.',
        })
      }
    }
  }

  return {
    // queries
    getModelAnswer,
    isGenerating,
    hasModelAnswer,
    getModelAnswerError,
    modelAnswerVersion,
    // commands
    generateModelAnswer,
    clearModelAnswer,
  }
}
