import type { SttHealthData, SttProvider } from '@exam-one/contracts'

const DEFAULT_LOCAL_BASE_URL = 'http://127.0.0.1:8882'

export interface SttEnvSource {
  baseUrl?: string | undefined
}

export interface SttConfig {
  language?: string
  provider: SttProvider
  baseUrl: string
}

export interface SttAudioInput {
  data: ArrayBuffer
  fileName: string
  mimeType: string
}

export function getSttConfig(source: SttEnvSource): SttConfig {
  return {
    provider: 'local',
    baseUrl: (source.baseUrl || DEFAULT_LOCAL_BASE_URL).replace(/\/+$/, ''),
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
  form.append('language', config.language ?? 'en')
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
    const response = await fetch(
      `${config.baseUrl}/health?${new URLSearchParams({ language: config.language ?? 'en' })}`,
      {
        signal: AbortSignal.timeout(5_000),
      }
    )
    if (!response.ok) {
      return {
        provider: 'local',
        ready: false,
        detail: `Local STT health check returned HTTP ${response.status}.`,
      }
    }

    const payload = (await response.json().catch(() => null)) as unknown
    const model =
      typeof payload === 'object' &&
      payload !== null &&
      'model' in payload &&
      typeof payload.model === 'string'
        ? payload.model
        : undefined
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'ready' in payload &&
      payload.ready === false
    ) {
      return {
        provider: 'local',
        ready: false,
        detail:
          'detail' in payload && typeof payload.detail === 'string'
            ? payload.detail
            : 'Local STT is still loading its model.',
        state:
          'state' in payload &&
          ['ready', 'missing', 'loading', 'unsupported', 'offline'].includes(String(payload.state))
            ? (payload.state as NonNullable<SttHealthData['state']>)
            : 'loading',
        ...(model ? { model } : {}),
        ...(config.language ? { language: config.language } : {}),
      }
    }

    return {
      provider: 'local',
      ready: true,
      detail: `Local STT ready${model ? ' · ' + model : ''}`,
      ...(model ? { model } : {}),
      state: 'ready',
      ...(config.language ? { language: config.language } : {}),
    }
  } catch {
    return {
      provider: 'local',
      ready: false,
      detail: 'Local STT is offline. Run pnpm stt:up.',
      state: 'offline',
    }
  }
}
