import type {
  SpeakingA2Topic,
  SpeakingReviewData,
  SpeakingTranscripts,
} from '~/utils/exercises/speaking'

type SpeakingReviewStatus = 'idle' | 'pending' | 'ready' | 'error'

interface SpeakingReviewResponse {
  data: SpeakingReviewData | null
  error: string | null
}

export function useSpeakingReview() {
  const status = ref<SpeakingReviewStatus>('idle')
  const review = ref<SpeakingReviewData | null>(null)
  const error = ref<string | null>(null)

  async function requestReview(
    topic: SpeakingA2Topic,
    transcripts: SpeakingTranscripts
  ): Promise<SpeakingReviewData | null> {
    status.value = 'pending'
    review.value = null
    error.value = null

    try {
      const response = (await $fetch('/api/review-speaking', {
        method: 'POST',
        body: { topic, transcripts },
      })) as unknown as SpeakingReviewResponse

      if (response.error || !response.data) {
        throw new Error(response.error || 'AI review is unavailable.')
      }

      review.value = response.data
      status.value = 'ready'
      return response.data
    } catch (requestError: unknown) {
      error.value =
        requestError instanceof Error ? requestError.message : 'AI review is unavailable.'
      status.value = 'error'
      return null
    }
  }

  function clearReview(): void {
    status.value = 'idle'
    review.value = null
    error.value = null
  }

  return {
    // State
    status,
    review,
    error,
    isReviewing: computed(() => status.value === 'pending'),

    // Methods
    requestReview,
    clearReview,
  }
}
