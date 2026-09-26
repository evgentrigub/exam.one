import type { CriterionReview } from '@exam-one/exam-packs'
import type { SpeakingA2Topic, SpeakingTranscripts } from '~/utils/exercises/speaking'
import { useReviewOutputLanguage } from '~/utils/reviewLocale'

type SpeakingReviewStatus = 'idle' | 'pending' | 'ready' | 'error'

export function useSpeakingReview() {
  const requestPackId = useSettingsStore().packId
  const { aiFetch } = usePackRequest(requestPackId)
  const status = ref<SpeakingReviewStatus>('idle')
  const review = ref<CriterionReview | null>(null)
  const error = ref<string | null>(null)
  const outputLanguage = useReviewOutputLanguage()

  async function requestReview(
    topic: SpeakingA2Topic,
    transcripts: SpeakingTranscripts
  ): Promise<CriterionReview | null> {
    status.value = 'pending'
    review.value = null
    error.value = null

    try {
      if (topic.testingPart === 1) {
        const answers = transcripts.answers?.trim() ?? ''
        const questions = transcripts.questions?.trim() ?? ''
        if (!answers || !questions) {
          throw new Error('Both Teil 1 transcripts are required for AI review.')
        }
      } else {
        const monologue = transcripts.monologue?.trim() ?? ''
        if (!monologue) {
          throw new Error('A monologue transcript is required for AI review.')
        }
      }

      const response = await aiFetch<CriterionReview>('/llm/review-speaking', {
        method: 'POST',
        body: { topic, answers: transcripts, outputLanguage: outputLanguage.value },
      })

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
