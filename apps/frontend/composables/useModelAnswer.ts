/**
 * useModelAnswer composable
 * Manages generation and storage of AI model answers for writing topics.
 *
 * Storage: localStorage under key `exam-one:writing:model-answers`
 */

import type { WritingExercise, ModelAnswer } from '~/utils/types'
import { ref } from 'vue'
import {
  generateModelAnswerC1Part1,
  generateModelAnswerC1Part2,
} from '~/data/writing/c1/answerGeneratorWritingC1'
import {
  generateModelAnswerA2Part1,
  generateModelAnswerA2Part2,
} from '~/data/writing/a2/answerGeneratorWritingA2'
import { generateUUID } from '~/utils/uuid'

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

const MODEL_ANSWER_KEY = 'exam-one:writing:model-answers'
const MODEL_ANSWER_LEGACY_KEY = 'model-answers'

// Global reactive tick to notify UI of updates
const modelAnswerVersion = ref(0)

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

function readAllModelAnswers(): Record<string, ModelAnswerRecord> {
  if (!import.meta.client) return {}
  try {
    const raw =
      localStorage.getItem(MODEL_ANSWER_KEY) || localStorage.getItem(MODEL_ANSWER_LEGACY_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ModelAnswerRecord>) : {}
  } catch {
    return {}
  }
}

function writeAllModelAnswers(map: Record<string, ModelAnswerRecord>): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(MODEL_ANSWER_KEY, JSON.stringify(map))
    modelAnswerVersion.value++
  } catch (error) {
    console.warn('Failed to save model answers:', error)
  }
}

function saveRecord(record: ModelAnswerRecord): void {
  const all = readAllModelAnswers()
  all[record.topicId] = record
  writeAllModelAnswers(all)
}

function getRecord(topicId: string): ModelAnswerRecord | null {
  const all = readAllModelAnswers()
  return all[topicId] || null
}

export function useModelAnswer() {
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
    switch (topic.difficulty) {
      case 'A2':
        switch (topic.testingPart) {
          case 1:
            return generateModelAnswerA2Part1(topic.task, topic.id)
          default:
            return generateModelAnswerA2Part2(topic.task, topic.id)
        }
      case 'C1':
        switch (topic.testingPart) {
          case 1:
            return generateModelAnswerC1Part1(topic.task, topic.id)
          default:
            return generateModelAnswerC1Part2(topic.task, topic.id)
        }
      default:
        throw new Error(`Unsupported difficulty level: ${topic.difficulty}`)
    }
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
      const response = (await $fetch('/api/generate-model-answer', {
        method: 'POST',
        body: { topic, prompt },
      })) as unknown as { text?: string; data?: unknown; error?: string | null }

      const current = getRecord(topic.id)
      if (current) {
        if (response.error) throw new Error(response.error)
        let parsedData = normalizeModelAnswerData(response.data)

        if (!parsedData && response.text) {
          try {
            parsedData = normalizeModelAnswerData(JSON.parse(response.text) as unknown)
          } catch {
            parsedData = null
          }
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
