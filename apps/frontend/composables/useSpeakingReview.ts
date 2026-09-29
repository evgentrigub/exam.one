import type { CriterionReview } from '@exam-one/exam-packs'
import type { SpeakingA2Topic, SpeakingTranscripts } from '~/utils/exercises/speaking'
import { useReviewOutputLanguage } from '~/utils/reviewLocale'

type SpeakingReviewStatus = 'idle' | 'pending' | 'ready' | 'error'

export function useSpeakingReview() {
  const { t } = useI18n()
  const requestPackId = useSettingsStore().packId
  const { aiFetch } = usePackRequest(requestPackId)
  const status = ref<SpeakingReviewStatus>('idle')
  const review = ref<CriterionReview | null>(null)
  const error = ref<string | null>(null)
  const outputLanguage = useReviewOutputLanguage()
  const { partsFor } = useActivePack()

  /**
   * Every configured segment must have a transcript before the server is asked to grade it,
   * or the model scores a blank answer with confidence. The two A2 layouts keep their
   * original messages.
   */
  function assertTranscripts(topic: SpeakingA2Topic, transcripts: SpeakingTranscripts): void {
    const fallback = topic.testingPart === 1 ? ['answers', 'questions'] : ['monologue']
    const segments =
      partsFor('speaking').find(part => part.n === topic.testingPart)?.runtime?.segments ??
      fallback.map(id => ({ id, label: id }))
    const values = transcripts as Record<string, string | undefined>
    const missing = segments.some(segment => !values[segment.id]?.trim())
    if (!missing) return
    const ids = segments.map(segment => segment.id).join(',')
    if (ids === 'answers,questions') throw new Error(t('errors.teil1TranscriptsRequired'))
    if (ids === 'monologue') throw new Error(t('errors.monologueTranscriptRequired'))
    throw new Error(t('errors.allTranscriptsRequired'))
  }

  async function requestReview(
    topic: SpeakingA2Topic,
    transcripts: SpeakingTranscripts
  ): Promise<CriterionReview | null> {
    status.value = 'pending'
    review.value = null
    error.value = null

    try {
      assertTranscripts(topic, transcripts)

      const response = await aiFetch<CriterionReview>('/llm/review-speaking', {
        method: 'POST',
        body: { topic, answers: transcripts, outputLanguage: outputLanguage.value },
      })

      if (response.error || !response.data) {
        throw new Error(response.error || t('errors.aiReviewUnavailable'))
      }

      review.value = response.data
      status.value = 'ready'
      return response.data
    } catch (requestError: unknown) {
      error.value =
        requestError instanceof Error ? requestError.message : t('errors.aiReviewUnavailable')
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
