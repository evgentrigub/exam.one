interface SttHealthData {
  provider: 'local' | 'openai'
  ready: boolean
  detail: string
}

interface SttHealthResponse {
  data: SttHealthData | null
  error: string | null
}

interface TranscriptionResponse {
  data: {
    transcript: string
    provider: 'local' | 'openai'
  } | null
  error: string | null
}

function audioFileName(blob: Blob): string {
  if (blob.type.includes('ogg')) return 'speaking.ogg'
  if (blob.type.includes('mp4')) return 'speaking.m4a'
  if (blob.type.includes('wav')) return 'speaking.wav'
  return 'speaking.webm'
}

export function useSpeechTranscription() {
  const health = ref<SttHealthData | null>(null)
  const checkingHealth = ref(false)
  const transcribing = ref(false)
  const error = ref<string | null>(null)

  async function refreshHealth(): Promise<void> {
    checkingHealth.value = true
    try {
      const response = await $fetch<SttHealthResponse>('/api/stt/health')
      health.value = response.data
      error.value = response.error
    } catch (requestError: unknown) {
      health.value = null
      error.value =
        requestError instanceof Error ? requestError.message : 'Could not check STT status.'
    } finally {
      checkingHealth.value = false
    }
  }

  async function transcribe(blob: Blob): Promise<string | null> {
    transcribing.value = true
    error.value = null
    try {
      const form = new FormData()
      form.append('file', blob, audioFileName(blob))
      const response = await $fetch<TranscriptionResponse>('/api/transcribe', {
        method: 'POST',
        body: form,
      })
      if (response.error || !response.data) {
        throw new Error(response.error || 'Transcription failed.')
      }
      return response.data.transcript
    } catch (requestError: unknown) {
      error.value = requestError instanceof Error ? requestError.message : 'Transcription failed.'
      return null
    } finally {
      transcribing.value = false
    }
  }

  onMounted(() => {
    void refreshHealth()
  })

  return {
    // State
    health,
    checkingHealth,
    transcribing,
    error,

    // Methods
    refreshHealth,
    transcribe,
  }
}
