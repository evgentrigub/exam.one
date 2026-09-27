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

import type { CriterionReview } from '@exam-one/exam-packs'
import type { WritingExercise } from '~/utils/types'
import { onPackReset, packEpoch } from '~/utils/packScope'
import { formatFormValues, isFormFillTopic, parseFormValues } from '~/utils/writing/formFill'
import { ref } from 'vue'
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
  responseData?: CriterionReview
  error?: string
}

const reviews = ref<Record<string, WritingReviewRecord>>({})
const reviewVersion = ref(0)
let hydrated = false
onPackReset(() => { reviews.value = {}; hydrated = false; reviewVersion.value++ })

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
  const requestPackId = useSettingsStore().packId
  const requestEpoch = packEpoch()
  if (import.meta.client) void hydrateReviews()
  const outputLanguage = useReviewOutputLanguage()
  const { assemble } = usePackPrompt(requestPackId)

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

  /**
   * A form is submitted as its entries keyed by field id, which is what its reviewer grades;
   * `userContent` stays a readable version, since the DTO requires one. An essay is its text.
   */
  function reviewAnswers(
    topic: WritingExercise,
    userContent: string
  ): { userContent: string; answers?: Record<string, string> } {
    if (!isFormFillTopic(topic)) return { userContent }
    const answers = parseFormValues(userContent)
    return { userContent: formatFormValues(topic, answers), answers }
  }

  function getReviewPrompt(topic: WritingExercise, userContent: string) {
    const part = topic.testingPart === 2 ? 2 : 1
    const prompt = assemble('writing', part, 'review', {
      task: topic.task,
      requirements: topic.requirements?.join(', ') ?? '',
      userContent,
      outputLanguage: outputLanguage.value,
      topicId: topic.id,
    })
    if (!prompt) {
      throw new Error(`No writing review prompt is configured for part ${part}`)
    }
    return prompt
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
      // The server re-assembles the prompt from `topic` and the answers, so the feedback
      // language has to travel in the body; the client-assembled `prompt` is not used for it.
      const response = await aiFetch<CriterionReview>('/llm/review', {
        packId: requestPackId,
        method: 'POST',
        body: { topic, ...reviewAnswers(topic, userContent), prompt, outputLanguage: outputLanguage.value },
      })
      if (requestEpoch !== packEpoch()) return
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
      if (requestEpoch !== packEpoch()) return
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
