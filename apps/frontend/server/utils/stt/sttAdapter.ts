const DEFAULT_LOCAL_BASE_URL = 'http://127.0.0.1:8882'
const DEFAULT_LOCAL_MODEL = 'nvidia/parakeet-tdt-0.6b-v3'
const DEFAULT_OPENAI_MODEL = 'whisper-1'
const OPENAI_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions'

export type SttProvider = 'local' | 'openai'

export interface SttRuntimeConfig {
  sttProvider?: string
  sttBaseUrl?: string
  sttModel?: string
  sttOpenaiModel?: string
  sttOpenaiApiKey?: string
}

export interface SttConfig {
  provider: SttProvider
  baseUrl: string
  model: string
  apiKey: string
}

export interface SttAudioInput {
  data: ArrayBuffer
  fileName: string
  mimeType: string
}

export interface SttHealth {
  provider: SttProvider
  ready: boolean
  detail: string
}

function readEnv(name: string): string {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

export function getSttConfig(runtimeConfig: SttRuntimeConfig): SttConfig {
  const providerValue = (runtimeConfig.sttProvider || readEnv('STT_PROVIDER') || 'local').trim()

  if (providerValue !== 'local' && providerValue !== 'openai') {
    throw new Error(`Unsupported STT_PROVIDER "${providerValue}". Use "local" or "openai".`)
  }

  const provider: SttProvider = providerValue
  return {
    provider,
    baseUrl: (
      runtimeConfig.sttBaseUrl ||
      readEnv('STT_BASE_URL') ||
      DEFAULT_LOCAL_BASE_URL
    ).replace(/\/+$/, ''),
    model:
      provider === 'local'
        ? runtimeConfig.sttModel || readEnv('STT_MODEL') || DEFAULT_LOCAL_MODEL
        : runtimeConfig.sttOpenaiModel || readEnv('STT_OPENAI_MODEL') || DEFAULT_OPENAI_MODEL,
    apiKey: runtimeConfig.sttOpenaiApiKey || readEnv('OPENAI_API_KEY'),
  }
}

function transcriptionUrl(config: SttConfig): string {
  return config.provider === 'local'
    ? `${config.baseUrl}/v1/audio/transcriptions`
    : OPENAI_TRANSCRIPTIONS_URL
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
  if (config.provider === 'openai' && !config.apiKey) {
    throw new Error('OpenAI STT is selected but OPENAI_API_KEY is not configured.')
  }

  const form = new FormData()
  form.append('model', config.model)
  form.append('language', 'de')
  form.append('response_format', 'json')
  form.append('file', new Blob([audio.data], { type: audio.mimeType }), audio.fileName)

  let response: Response
  try {
    response = await fetch(transcriptionUrl(config), {
      method: 'POST',
      ...(config.provider === 'openai'
        ? { headers: { Authorization: `Bearer ${config.apiKey}` } }
        : {}),
      body: form,
      signal: AbortSignal.timeout(120_000),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown connection error'
    if (config.provider === 'local') {
      throw new Error(`Local STT is offline. Run pnpm stt:up and try again. (${message})`)
    }
    throw new Error(`Could not reach OpenAI STT. ${message}`)
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

export async function checkSttHealth(config: SttConfig): Promise<SttHealth> {
  if (config.provider === 'openai') {
    return config.apiKey
      ? {
          provider: 'openai',
          ready: true,
          detail: `OpenAI key configured · model ${config.model}`,
        }
      : {
          provider: 'openai',
          ready: false,
          detail: 'Set OPENAI_API_KEY to use cloud transcription.',
        }
  }

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
