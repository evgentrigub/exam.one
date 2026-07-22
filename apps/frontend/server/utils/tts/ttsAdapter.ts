/**
 * Thin OpenAI-compatible TTS client for Kokoro (Martin + optional Victoria).
 * Used by listening audio generation — not required at app runtime for seed playback.
 */

import { concatWavWithPauses } from '~/server/utils/tts/concatWav'
import {
  dialogueAudioPlanKey,
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
  /** Primary / male (Martin) base URL. */
  baseUrl: string
  /** Optional female (Victoria) base URL; falls back to baseUrl when unset/unreachable. */
  femaleBaseUrl: string
  voice: string
  maleVoice: DialogueVoiceId
  femaleVoice: DialogueVoiceId
  speed: number
  lang: string
  /** Silence between dialogue turns in ms. */
  turnPauseMs: number
}

export function getTtsConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TtsConfig {
  const baseUrl = (env['TTS_BASE_URL'] ?? 'http://127.0.0.1:8881').replace(/\/$/, '')
  const femaleBaseUrl = (
    env['TTS_FEMALE_BASE_URL']
    ?? env['TTS_VICTORIA_BASE_URL']
    ?? 'http://127.0.0.1:8882'
  ).replace(/\/$/, '')

  return {
    baseUrl,
    femaleBaseUrl,
    voice: env['TTS_VOICE'] ?? 'martin',
    maleVoice: (env['TTS_VOICE_MALE'] as DialogueVoiceId | undefined) ?? 'martin',
    femaleVoice: (env['TTS_VOICE_FEMALE'] as DialogueVoiceId | undefined) ?? 'victoria',
    speed: Number(env['TTS_SPEED'] ?? '1.0') || 1.0,
    lang: env['TTS_LANG'] ?? 'de',
    turnPauseMs: Number(env['TTS_TURN_PAUSE_MS'] ?? '350') || 350,
  }
}

function resolveBaseUrlForVoice(voice: string, config: TtsConfig): string {
  if (voice === config.femaleVoice || voice === 'victoria') {
    return config.femaleBaseUrl
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
    // When Victoria is requested but only Martin is up on the female URL,
    // retry once with the male voice on the primary URL (labels already stripped).
    if (
      voice === config.femaleVoice
      && config.femaleBaseUrl !== config.baseUrl
      && (response.status === 400 || response.status === 404 || response.status >= 500)
    ) {
      return synthesizeSpeech(
        { ...options, voice: config.maleVoice },
        { ...config, femaleBaseUrl: config.baseUrl },
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
 * voiced by gender (martin/victoria), and concatenated with pauses.
 * Unlabeled monologues use a single synthesize call.
 */
export async function synthesizeListeningTranscript(
  transcript: string,
  config: TtsConfig = getTtsConfigFromEnv(),
): Promise<Buffer> {
  const plan = planDialogueVoices(transcript)
  if (!plan) {
    return synthesizeSpeech({ text: transcript }, config)
  }

  const femaleAvailable = await isVoiceServiceAvailable(config.femaleBaseUrl, config.femaleVoice)
  const wavParts: Buffer[] = []

  for (const turn of plan) {
    const voice = turn.voice === 'victoria' && !femaleAvailable
      ? config.maleVoice
      : (turn.voice === 'victoria' ? config.femaleVoice : config.maleVoice)

    const part = await synthesizeSpeech(
      { text: turn.text, voice },
      config,
    )
    wavParts.push(part)
  }

  return concatWavWithPauses(wavParts, config.turnPauseMs)
}

/** Hash key for seed sidecar files (includes voice plan when dialogue). */
export function listeningTranscriptHashKey(transcript: string): string {
  return dialogueAudioPlanKey(transcript)
}

const femaleAvailabilityCache = new Map<string, { checkedAt: number; ok: boolean }>()
const FEMALE_AVAILABILITY_TTL_MS = 30_000

async function isVoiceServiceAvailable(baseUrl: string, voice: string): Promise<boolean> {
  const cacheKey = `${baseUrl}::${voice}`
  const cached = femaleAvailabilityCache.get(cacheKey)
  if (cached && Date.now() - cached.checkedAt < FEMALE_AVAILABILITY_TTL_MS) {
    return cached.ok
  }

  try {
    const response = await fetch(`${baseUrl}/v1/audio/voices`, { method: 'GET' })
    if (!response.ok) {
      femaleAvailabilityCache.set(cacheKey, { checkedAt: Date.now(), ok: false })
      return false
    }
    const body = await response.json().catch(() => null) as { voices?: string[] } | null
    const voices = body?.voices
    const ok = Array.isArray(voices) && voices.includes(voice)
    femaleAvailabilityCache.set(cacheKey, { checkedAt: Date.now(), ok })
    return ok
  } catch {
    femaleAvailabilityCache.set(cacheKey, { checkedAt: Date.now(), ok: false })
    return false
  }
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
