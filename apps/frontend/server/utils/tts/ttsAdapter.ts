/**
 * Thin OpenAI-compatible TTS client for Kokoro (and future Piper) HTTP services.
 * Used by the listening audio generation script — not required at app runtime for seed playback.
 */

export interface TtsSynthesizeOptions {
  text: string
  voice?: string
  speed?: number
  /** Optional language hint (Kokoro German Martin accepts `de`). */
  lang?: string
}

export interface TtsConfig {
  baseUrl: string
  voice: string
  speed: number
  lang: string
}

export function getTtsConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TtsConfig {
  return {
    baseUrl: (env['TTS_BASE_URL'] ?? 'http://127.0.0.1:8881').replace(/\/$/, ''),
    voice: env['TTS_VOICE'] ?? 'martin',
    speed: Number(env['TTS_SPEED'] ?? '1.0') || 1.0,
    lang: env['TTS_LANG'] ?? 'de',
  }
}

/**
 * Call OpenAI-compatible POST /v1/audio/speech and return raw audio bytes (WAV from Kokoro Martin).
 */
export async function synthesizeSpeech(
  options: TtsSynthesizeOptions,
  config: TtsConfig = getTtsConfigFromEnv(),
): Promise<Buffer> {
  const text = options.text.trim()
  if (!text) {
    throw new Error('TTS synthesize requires non-empty text')
  }

  const url = `${config.baseUrl}/v1/audio/speech`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kokoro',
      input: text,
      voice: options.voice ?? config.voice,
      speed: options.speed ?? config.speed,
      lang: options.lang ?? config.lang,
      response_format: 'wav',
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `TTS request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ''}`,
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function checkTtsHealth(
  config: TtsConfig = getTtsConfigFromEnv(),
): Promise<boolean> {
  try {
    const response = await fetch(`${config.baseUrl}/v1/audio/voices`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}
