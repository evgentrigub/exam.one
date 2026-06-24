/**
 * useWritingReview composable
 * Manages requesting an AI-style review for a user's writing submission.
 *
 * Constraints in this project require 100% offline operation. Therefore, the
 * OpenAI request is mocked. We still shape the payload as if calling OpenAI
 * and keep a placeholder variable with the composed input.
 *
 * Storage: localStorage under key `exam-one:writing:reviews`
 */

import type { WritingExercise, AiReviewData } from '~/utils/types'
import { ref } from 'vue'
import { reviewPromptC1Teil1, reviewPromptC1Teil2 } from '~/data/writing/c1/reviewTextWritingC1'
import { reviewPromptA2Teil1, reviewPromptA2Teil2 } from '~/data/writing/a2/reviewWritingA2'

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

const WRITING_REVIEW_KEY = 'exam-one:writing:reviews'
const WRITING_REVIEW_LEGACY_KEY = 'writing-reviews'

// Global reactive tick to notify UI of updates to localStorage-backed reviews
const reviewVersion = ref(0)

function readAllReviews(): Record<string, WritingReviewRecord> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(WRITING_REVIEW_KEY) || localStorage.getItem(WRITING_REVIEW_LEGACY_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WritingReviewRecord>) : {}
  } catch {
    return {}
  }
}

function writeAllReviews(map: Record<string, WritingReviewRecord>): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(WRITING_REVIEW_KEY, JSON.stringify(map))
    reviewVersion.value++
  } catch (error) {
    console.warn('Failed to save writing reviews:', error)
  }
}

function saveRecord(record: WritingReviewRecord): void {
  const all = readAllReviews()
  all[record.topicId] = record
  writeAllReviews(all)
}

function getRecord(topicId: string): WritingReviewRecord | null {
  const all = readAllReviews()
  return all[topicId] || null
}

export function useWritingReview() {
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

  function getReviewPrompt(topic: WritingExercise, userContent: string) {
    // Select prompts based on difficulty level
    if (topic.difficulty === 'A2') {
      if (topic.testingPart === 1) {
        return reviewPromptA2Teil1(topic, userContent)
      } else {
        return reviewPromptA2Teil2(topic, userContent)
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
      const response = (await $fetch('/api/review', {
        method: 'POST',
        body: { topic, userContent, prompt }
      }) as unknown) as { text?: string; data?: AiReviewData | null; error?: string | null }
      const current = getRecord(topic.id)
      if (current) {
        if (current.requestedAt !== requestedAt || current.content !== userContent || current.prompt !== prompt) return
        if (response.error) throw new Error(response.error)
        const update: WritingReviewRecord = {
          ...current,
          status: 'ready',
          completedAt: new Date().toISOString(),
          responseText: response?.text || '',
        }
        if (response && response.data) {
          update.responseData = response.data
        }
        saveRecord(update)

      }
    } catch (error) {
      const current = getRecord(topic.id)
      if (current) {
        if (current.requestedAt !== requestedAt || current.content !== userContent || current.prompt !== prompt) return
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
    clearReview,
  }
}


