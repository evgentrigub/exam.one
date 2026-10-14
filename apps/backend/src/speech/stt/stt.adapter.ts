import type { SttHealthData, SttProvider } from '@exam-one/contracts'

const DEFAULT_LOCAL_BASE_URL = 'http://127.0.0.1:8882'
const DEFAULT_LOCAL_MODEL = 'handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0'
const LEGACY_LOCAL_MODEL = 'nvidia/parakeet-tdt-0.6b-v3'

export interface SttEnvSource {
  baseUrl?: string | undefined
  model?: string | undefined
}

export interface SttConfig {
  language?: string
  provider: SttProvider
  baseUrl: string
  model: string
}

export interface SttAudioInput {
  data: ArrayBuffer
  fileName: string
  mimeType: string
}

export function getSttConfig(source: SttEnvSource): SttConfig {
  const configuredModel = source.model || DEFAULT_LOCAL_MODEL
  return {
    provider: 'local',
    baseUrl: (source.baseUrl || DEFAULT_LOCAL_BASE_URL).replace(/\/+$/, ''),
    model: configuredModel === LEGACY_LOCAL_MODEL ? DEFAULT_LOCAL_MODEL : configuredModel,
  }
}

function responseError(value: unknown, status: number): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'object' &&
    value.error !== null &&
    'message' in value.error &&
    typeof value.error.message === 'string'
  ) {
    return value.error.message
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'detail' in value &&
    typeof value.detail === 'string'
  ) {
    return value.detail
  }

  return `STT provider returned HTTP ${status}.`
}

export async function transcribeAudio(audio: SttAudioInput, config: SttConfig): Promise<string> {
  const form = new FormData()
  form.append('model', config.model)
  form.append('language', config.language ?? 'de')
  form.append('response_format', 'json')
  form.append('file', new Blob([audio.data], { type: audio.mimeType }), audio.fileName)

  let response: Response
  try {
    response = await fetch(`${config.baseUrl}/v1/audio/transcriptions`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(120_000),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown connection error'
    throw new Error(`Local STT is offline. Run pnpm stt:up and try again. (${message})`, {
      cause: error,
    })
  }

  const payload = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(responseError(payload, response.status))
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('text' in payload) ||
    typeof payload.text !== 'string'
  ) {
    throw new Error('STT provider returned an invalid transcription response.')
  }

  const transcript = payload.text.trim()
  if (!transcript) {
    throw new Error('No speech was detected. You can re-record or enter the transcript manually.')
  }
  return transcript
}

export async function checkSttHealth(config: SttConfig): Promise<SttHealthData> {
  try {
    const response = await fetch(`${config.baseUrl}/health`, {
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) {
      return {
        provider: 'local',
        ready: false,
        detail: `Local Parakeet health check returned HTTP ${response.status}.`,
      }
    }

    const payload = (await response.json().catch(() => null)) as unknown
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'ready' in payload &&
      payload.ready === false
    ) {
      return {
        provider: 'local',
        ready: false,
        detail: 'Local Parakeet is still loading its model.',
      }
    }

    return {
      provider: 'local',
      ready: true,
      detail: `Local Parakeet ready · ${config.model}`,
    }
  } catch {
    return {
      provider: 'local',
      ready: false,
      detail: 'Local Parakeet is offline. Run pnpm stt:up.',
    }
  }
}
