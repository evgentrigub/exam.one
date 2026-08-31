import type {
  SpeakingA2Topic,
  SpeakingReviewData,
  SpeakingTranscripts,
  SpeakingTopicA2Teil1,
  SpeakingTopicA2Teil2,
} from '~/utils/exercises/speaking'
import {
  reviewPromptSpeakingA2Teil1,
  reviewPromptSpeakingA2Teil2,
} from '~/data/speaking/a2/reviewSpeakingA2'
import { useReviewOutputLanguage } from '~/utils/reviewLocale'
import type { LanguageOptions } from '~/utils/types'

type SpeakingReviewStatus = 'idle' | 'pending' | 'ready' | 'error'

function buildSpeakingReviewPrompt(
  topic: SpeakingA2Topic,
  transcripts: SpeakingTranscripts,
  outputLanguage: LanguageOptions
): string | null {
  if (topic.testingPart === 1) {
    const answers = transcripts.answers?.trim() ?? ''
    const questions = transcripts.questions?.trim() ?? ''
    return answers && questions
      ? reviewPromptSpeakingA2Teil1(
          topic as SpeakingTopicA2Teil1,
          answers,
          questions,
          outputLanguage
        )
      : null
  }
  const monologue = transcripts.monologue?.trim() ?? ''
  return monologue
    ? reviewPromptSpeakingA2Teil2(topic as SpeakingTopicA2Teil2, monologue, outputLanguage)
    : null
}

export function useSpeakingReview() {
  const status = ref<SpeakingReviewStatus>('idle')
  const review = ref<SpeakingReviewData | null>(null)
  const error = ref<string | null>(null)
  const outputLanguage = useReviewOutputLanguage()
  const { hydrate: hydratePrompts, filledOrDefault } = usePromptOverrides()

  function numbered(items: string[]): string {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n')
  }

  function speakingReviewVars(
    topic: SpeakingA2Topic,
    transcripts: SpeakingTranscripts
  ): Record<string, string> {
    const teil1 = topic.testingPart === 1 ? (topic as SpeakingTopicA2Teil1) : null
    const teil2 = topic.testingPart === 2 ? (topic as SpeakingTopicA2Teil2) : null
    return {
      topicId: topic.id,
      theme: topic.theme,
      task: topic.theme,
      answerQuestions: teil1 ? numbered(teil1.answerQuestions) : '',
      askQuestions: teil1 ? numbered(teil1.askQuestions) : '',
      keywords: teil2 ? numbered(teil2.keywords) : '',
      answers: transcripts.answers?.trim() ?? '',
      questions: transcripts.questions?.trim() ?? '',
      monologue: transcripts.monologue?.trim() ?? '',
      userContent: transcripts.monologue?.trim() || transcripts.answers?.trim() || '',
      outputLanguage: outputLanguage.value,
    }
  }

  async function requestReview(
    topic: SpeakingA2Topic,
    transcripts: SpeakingTranscripts
  ): Promise<SpeakingReviewData | null> {
    status.value = 'pending'
    review.value = null
    error.value = null

    try {
      await hydratePrompts()
      const fallback = buildSpeakingReviewPrompt(topic, transcripts, outputLanguage.value)
      const prompt = fallback
        ? filledOrDefault(
            'speaking',
            topic.testingPart,
            'review',
            fallback,
            speakingReviewVars(topic, transcripts)
          )
        : null
      if (!prompt) {
        throw new Error(
          topic.testingPart === 1
            ? 'Both Teil 1 transcripts are required for AI review.'
            : 'A monologue transcript is required for AI review.'
        )
      }

      const response = await aiFetch<SpeakingReviewData>('/ai/review-speaking', {
        method: 'POST',
        body: { prompt },
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
