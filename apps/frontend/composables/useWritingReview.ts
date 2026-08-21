/**
 * useWritingReview composable
 * Manages requesting an AI-style review for a user's writing submission.
 *
 * Constraints in this project require 100% offline operation. Therefore, the
 * OpenAI request is mocked. We still shape the payload as if calling OpenAI
 * and keep a placeholder variable with the composed input.
 *
 * Storage: NestJS attempts (`Result.review.writingReview`)
 */

import type { WritingExercise, AiReviewData } from '~/utils/types'
import { ref } from 'vue'
import { reviewPromptC1Teil1, reviewPromptC1Teil2 } from '~/data/writing/c1/reviewTextWritingC1'
import { reviewPromptA2Teil1, reviewPromptA2Teil2 } from '~/data/writing/a2/reviewWritingA2'
import type { AttemptDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { useReviewOutputLanguage } from '~/utils/reviewLocale'

type ReviewStatus = 'idle' | 'pending' | 'ready' | 'error'

interface WritingReviewRecord {
  topicId: string
  status: ReviewStatus
  prompt: string
  content: string
  requestedAt: string
  completedAt?: string
  responseText?: string
  responseData?: AiReviewData
  error?: string
}

const reviews = ref<Record<string, WritingReviewRecord>>({})
const reviewVersion = ref(0)
let hydrated = false

function persistReview(record: WritingReviewRecord): void {
  void apiFetch('/attempts', {
    method: 'POST',
    body: {
      skill: 'WRITING',
      exerciseExternalId: record.topicId,
      answers: { kind: 'writing-review', content: record.content },
      result: { review: { writingReview: record } },
    },
  }).catch(error => console.warn('Failed to persist writing review', error))
}

function readAllReviews(): Record<string, WritingReviewRecord> {
  return reviews.value
}

function writeAllReviews(map: Record<string, WritingReviewRecord>): void {
  reviews.value = map
  reviewVersion.value++
}

async function hydrateReviews(): Promise<void> {
  if (!import.meta.client || hydrated) return
  hydrated = true
  try {
    const rows = await apiFetch<AttemptDto[]>('/attempts?skill=WRITING')
    const map: Record<string, WritingReviewRecord> = {}
    for (const row of rows) {
      const review = row.result?.review
      if (!review || typeof review !== 'object' || Array.isArray(review)) continue
      const nested = (review as { writingReview?: WritingReviewRecord }).writingReview
      const topicId = nested?.topicId ?? row.exerciseExternalId
      if (nested && topicId) map[topicId] = nested
    }
    reviews.value = map
  } catch (error) {
    console.warn('Failed to load writing reviews', error)
  }
}

function saveRecord(record: WritingReviewRecord): void {
  const all = readAllReviews()
  all[record.topicId] = record
  writeAllReviews(all)
  persistReview(record)
}

function getRecord(topicId: string): WritingReviewRecord | null {
  const all = readAllReviews()
  return all[topicId] || null
}

export function useWritingReview() {
  if (import.meta.client) void hydrateReviews()
  const outputLanguage = useReviewOutputLanguage()

  function getReview(topicId: string): WritingReviewRecord | null {
    return getRecord(topicId)
  }

  function isReviewInProgress(topicId: string): boolean {
    return getRecord(topicId)?.status === 'pending'
  }

  function hasReview(topicId: string): boolean {
    const rec = getRecord(topicId)
    return rec?.status === 'ready' && (!!rec?.responseText || !!rec?.responseData)
  }

  function getReviewError(topicId: string): string | null {
    const rec = getRecord(topicId)
    return rec?.status === 'error' ? rec.error || 'AI review is unavailable.' : null
  }

  function clearReview(topicId: string): void {
    const all = readAllReviews()
    const { [topicId]: _removed, ...rest } = all
    writeAllReviews(rest)
  }

  async function regenerateReview(topic: WritingExercise, userContent: string): Promise<void> {
    clearReview(topic.id)
    return requestReview(topic, userContent)
  }

  function getReviewPrompt(topic: WritingExercise, userContent: string) {
    // Select prompts based on difficulty level
    if (topic.difficulty === 'A2') {
      if (topic.testingPart === 1) {
        return reviewPromptA2Teil1(topic, userContent, outputLanguage.value)
      } else {
        return reviewPromptA2Teil2(topic, userContent, outputLanguage.value)
      }
    } else {
      // C1 level
      if (topic.testingPart === 1) {
        return reviewPromptC1Teil1(topic, userContent)
      } else {
        return reviewPromptC1Teil2(topic, userContent)
      }
    }
  }

  /**
   * Request a review for the given topic and user submission content.
   * This function mocks latency and response. If an OpenAI API key is
   * available, the call site is prepared but disabled by default.
   */
  async function requestReview(topic: WritingExercise, userContent: string): Promise<void> {
    const prompt = getReviewPrompt(topic, userContent)
    const requestedAt = new Date().toISOString()
    saveRecord({
      topicId: topic.id,
      status: 'pending',
      prompt,
      content: userContent,
      requestedAt,
    })

    // Call internal server endpoint to keep API key private (server mocks response offline)
    try {
      // Cast through unknown to bypass Nuxt's complex route type inference
      const response = await aiFetch<AiReviewData>('/ai/review', {
        method: 'POST',
        body: { topic, userContent, prompt },
      })
      const current = getRecord(topic.id)
      if (current) {
        if (
          current.requestedAt !== requestedAt ||
          current.content !== userContent ||
          current.prompt !== prompt
        )
          return
        if (response.error) throw new Error(response.error)
        const update: WritingReviewRecord = {
          ...current,
          status: 'ready',
          completedAt: new Date().toISOString(),
          responseText: response.data ? JSON.stringify(response.data) : '',
        }
        if (response && response.data) {
          update.responseData = response.data
        }
        saveRecord(update)
      }
    } catch (error) {
      const current = getRecord(topic.id)
      if (current) {
        if (
          current.requestedAt !== requestedAt ||
          current.content !== userContent ||
          current.prompt !== prompt
        )
          return
        saveRecord({
          ...current,
          status: 'error',
          completedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'AI review is unavailable.',
        })
      }
    }
  }

  return {
    // queries
    getReview,
    isReviewInProgress,
    hasReview,
    getReviewError,
    reviewVersion,
    // commands
    requestReview,
    regenerateReview,
    clearReview,
  }
}
