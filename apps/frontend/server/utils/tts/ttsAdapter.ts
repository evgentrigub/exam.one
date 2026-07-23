/**
 * Thin OpenAI-compatible TTS client for Kokoro
 * (Martin ONNX + multi-voice PyTorch: victoria / bernd / eva).
 * Used by listening audio generation — not required at app runtime for seed playback.
 */

import { concatWavWithPauses } from '~/server/utils/tts/concatWav'
import { getTtsConcurrency, mapPool } from '~/server/utils/tts/mapPool'
import {
  dialogueAudioPlanKey,
  fallbackVoiceFor,
  MALE_VOICE_POOL,
  planDialogueVoices,
  type DialogueVoiceId,
} from '~/utils/listening/dialogueTranscript'

export interface TtsSynthesizeOptions {
  text: string
  voice?: string
  speed?: number
  /** Optional language hint (Kokoro German accepts `de`). */
  lang?: string
}

export interface TtsConfig {
  /** Martin ONNX (primary male / monologues). */
  baseUrl: string
  /** Multi-voice PyTorch service (victoria, bernd, eva). */
  multiBaseUrl: string
  voice: string
  speed: number
  lang: string
  /** Silence between dialogue turns in ms. */
  turnPauseMs: number
  /** Parallel segment / turn concurrency. */
  concurrency: number
}

const ONNX_VOICES = new Set<string>(['martin'])
const MULTI_VOICES = new Set<string>(['victoria', 'bernd', 'eva'])

export function getTtsConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TtsConfig {
  const baseUrl = (env['TTS_BASE_URL'] ?? 'http://127.0.0.1:8881').replace(/\/$/, '')
  const multiBaseUrl = (
    env['TTS_MULTI_BASE_URL']
    ?? env['TTS_FEMALE_BASE_URL']
    ?? env['TTS_VICTORIA_BASE_URL']
    ?? 'http://127.0.0.1:8882'
  ).replace(/\/$/, '')

  return {
    baseUrl,
    multiBaseUrl,
    voice: env['TTS_VOICE'] ?? 'martin',
    speed: Number(env['TTS_SPEED'] ?? '1.0') || 1.0,
    lang: env['TTS_LANG'] ?? 'de',
    turnPauseMs: Number(env['TTS_TURN_PAUSE_MS'] ?? '350') || 350,
    concurrency: getTtsConcurrency(env),
  }
}

function resolveBaseUrlForVoice(voice: string, config: TtsConfig): string {
  if (ONNX_VOICES.has(voice) || voice === 'martin') return config.baseUrl
  if (MULTI_VOICES.has(voice)) return config.multiBaseUrl
  // Unknown → route by gender pool membership default
  if (MALE_VOICE_POOL.includes(voice as DialogueVoiceId) && voice === 'bernd') {
    return config.multiBaseUrl
  }
  return config.baseUrl
}

/**
 * Call OpenAI-compatible POST /v1/audio/speech and return raw audio bytes (WAV).
 */
export async function synthesizeSpeech(
  options: TtsSynthesizeOptions,
  config: TtsConfig = getTtsConfigFromEnv(),
): Promise<Buffer> {
  const text = options.text.trim()
  if (!text) {
    throw new Error('TTS synthesize requires non-empty text')
  }

  const voice = options.voice ?? config.voice
  const baseUrl = resolveBaseUrlForVoice(voice, config)
  const url = `${baseUrl}/v1/audio/speech`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kokoro',
      input: text,
      voice,
      speed: options.speed ?? config.speed,
      lang: options.lang ?? config.lang,
      response_format: 'wav',
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    // Multi-voice offline → fall back to Martin ONNX once.
    if (
      voice !== 'martin'
      && baseUrl === config.multiBaseUrl
      && (response.status === 400 || response.status === 404 || response.status >= 500)
    ) {
      return synthesizeSpeech(
        { ...options, voice: 'martin' },
        config,
      )
    }
    throw new Error(
      `TTS request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ''}`,
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Synthesize a listening transcript. Labeled dialogues are split into turns,
 * voiced from the 4-voice roster, synthesized in parallel, then concatenated.
 * Unlabeled monologues use a single Martin synthesize call.
 */
export async function synthesizeListeningTranscript(
  transcript: string,
  config: TtsConfig = getTtsConfigFromEnv(),
): Promise<Buffer> {
  const plan = planDialogueVoices(transcript)
  if (!plan) {
    return synthesizeSpeech({ text: transcript, voice: 'martin' }, config)
  }

  const available = await listAvailableVoices(config)
  const wavParts = await mapPool(plan, config.concurrency, async (turn) => {
    const voice = fallbackVoiceFor(turn.voice, available)
    return synthesizeSpeech({ text: turn.text, voice }, config)
  })

  return concatWavWithPauses(wavParts, config.turnPauseMs)
}

/** Hash key for seed sidecar files (includes voice plan when dialogue). */
export function listeningTranscriptHashKey(transcript: string): string {
  return dialogueAudioPlanKey(transcript)
}

const voicesCache = new Map<string, { checkedAt: number; voices: Set<string> }>()
const VOICES_CACHE_TTL_MS = 30_000

async function fetchVoicesFrom(baseUrl: string): Promise<Set<string>> {
  const cached = voicesCache.get(baseUrl)
  if (cached && Date.now() - cached.checkedAt < VOICES_CACHE_TTL_MS) {
    return cached.voices
  }

  try {
    const response = await fetch(`${baseUrl}/v1/audio/voices`, { method: 'GET' })
    if (!response.ok) {
      const empty = new Set<string>()
      voicesCache.set(baseUrl, { checkedAt: Date.now(), voices: empty })
      return empty
    }
    const body = await response.json().catch(() => null) as { voices?: string[] } | null
    const voices = new Set(
      Array.isArray(body?.voices) ? body.voices.map((v) => String(v).toLowerCase()) : [],
    )
    voicesCache.set(baseUrl, { checkedAt: Date.now(), voices })
    return voices
  } catch {
    const empty = new Set<string>()
    voicesCache.set(baseUrl, { checkedAt: Date.now(), voices: empty })
    return empty
  }
}

async function listAvailableVoices(config: TtsConfig): Promise<Set<string>> {
  const [onnx, multi] = await Promise.all([
    fetchVoicesFrom(config.baseUrl),
    fetchVoicesFrom(config.multiBaseUrl),
  ])
  return new Set([...onnx, ...multi])
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
