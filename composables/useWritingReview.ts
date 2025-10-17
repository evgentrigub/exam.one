/**
 * useWritingReview composable
 * Manages requesting an AI-style review for a user's writing submission.
 *
 * Constraints in this project require 100% offline operation. Therefore, the
 * OpenAI request is mocked. We still shape the payload as if calling OpenAI
 * and keep a placeholder variable with the composed input.
 *
 * Storage: localStorage under key `writing-reviews`
 */

import type { WritingTopic, AiReviewData } from '~/utils/types'
import { ref } from 'vue'
import { reviewPromptC1Teil1, reviewPromptC1Teil2 } from '~/data/writing/reviewTextPrompts'

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

const WRITING_REVIEW_KEY = 'writing-reviews'

// Global reactive tick to notify UI of updates to localStorage-backed reviews
const reviewVersion = ref(0)

function readAllReviews(): Record<string, WritingReviewRecord> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(WRITING_REVIEW_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WritingReviewRecord>) : {}
  } catch {
    return {}
  }
}

function writeAllReviews(map: Record<string, WritingReviewRecord>): void {
  if (!import.meta.client) return
  localStorage.setItem(WRITING_REVIEW_KEY, JSON.stringify(map))
  reviewVersion.value++
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

  function clearReview(topicId: string): void {
    const all = readAllReviews()
    const { [topicId]: _removed, ...rest } = all
    writeAllReviews(rest)
  }

  function getReviewPrompt(topic: WritingTopic, userContent: string) {
    if (topic.testingPart === 1) {
      return reviewPromptC1Teil1(topic, userContent)
    } else {
      return reviewPromptC1Teil2(topic, userContent)
    }
}

  /**
   * Request a review for the given topic and user submission content.
   * This function mocks latency and response. If an OpenAI API key is
   * available, the call site is prepared but disabled by default.
   */
  async function requestReview(topic: WritingTopic, userContent: string): Promise<void> {
    const prompt = getReviewPrompt(topic, userContent)
    console.log("🚀 ~ requestReview ~ prompt:", prompt)
    saveRecord({
      topicId: topic.id,
      status: 'pending',
      prompt,
      content: userContent,
      requestedAt: new Date().toISOString(),
    })

    // Call internal server endpoint to keep API key private (server mocks response offline)
    try {
      const result = await $fetch(
        '/api/review',
        { method: 'POST', body: { topic, userContent, prompt } }
      ) as { text: string; data?: AiReviewData | null }
      const current = getRecord(topic.id)
      if (current) {
        const update: WritingReviewRecord = {
          ...current,
          status: 'ready',
          completedAt: new Date().toISOString(),
          responseText: result?.text || '',
        }
        if (result && result.data) {
          update.responseData = result.data
        }
        console.log("🚀 ~ The response from OpenAI is received:", result)
        saveRecord(update)

      }
    } catch (error) {
      const current = getRecord(topic.id)
      if (current) {
        saveRecord({ ...current, status: 'error', completedAt: new Date().toISOString(), error: String(error) })
      }
    }
  }

  return {
    // queries
    getReview,
    isReviewInProgress,
    hasReview,
    reviewVersion,
    // commands
    requestReview,
    clearReview,
  }
}


