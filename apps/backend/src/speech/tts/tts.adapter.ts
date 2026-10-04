/**
 * Thin OpenAI-compatible TTS client for the PyTorch Kokoro service on :8881: the German
 * voices (martin / bernd / victoria / eva) and, when installed, the British English ones.
 */

import { concatWavWithPauses } from './concatWav'
import {
  dialogueAudioPlanKey,
  fallbackVoiceFor,
  planDialogueVoices,
  planMonologue,
  type DialogueVoiceOptions,
} from './dialogueTranscript'
import { getTtsConcurrency, mapPool } from './mapPool'

export interface TtsSynthesizeOptions {
  text: string
  voice?: string
  speed?: number
  lang?: string
  signal?: AbortSignal
}

export interface TtsConfig {
  baseUrl: string
  voice: string
  speed: number
  lang: string
  turnPauseMs: number
  concurrency: number
  /** The pack's voices; they pick the voice of every turn outside German. */
  voices?: DialogueVoiceOptions['voices']
}

export type TtsHealthStatus = 'ok' | 'offline' | 'unsupported'

function voiceOptions(config: TtsConfig): DialogueVoiceOptions {
  return { lang: config.lang, voices: config.voices ?? [] }
}

export function getTtsConfigFromEnv(env: NodeJS.ProcessEnv = process.env): TtsConfig {
  const baseUrl = (env['TTS_BASE_URL'] ?? 'http://127.0.0.1:8881').replace(/\/$/, '')

  return {
    baseUrl,
    voice: env['TTS_VOICE'] ?? 'martin',
    speed: Number(env['TTS_SPEED'] ?? '1.0') || 1.0,
    lang: env['TTS_LANG'] ?? 'de',
    turnPauseMs: Number(env['TTS_TURN_PAUSE_MS'] ?? '350') || 350,
    concurrency: getTtsConcurrency(env),
  }
}

/**
 * POST once, and once more if the request failed before any response arrived.
 *
 * The TTS server closes idle keep-alive sockets, and Node can reuse one at the moment it
 * closes. That surfaces as a bare `TypeError: fetch failed`, and since a dialogue is several
 * requests, one of them regularly lost the race and failed the whole exercise. An HTTP error
 * response is a real answer and is not retried.
 */
async function postOnceRetried(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
    return fetch(url, init)
  }
}

export async function synthesizeSpeech(
  options: TtsSynthesizeOptions,
  config: TtsConfig = getTtsConfigFromEnv()
): Promise<Buffer> {
  const text = options.text.trim()
  if (!text) {
    throw new Error('TTS synthesize requires non-empty text')
  }

  const voice = options.voice ?? config.voice
  const url = `${config.baseUrl}/v1/audio/speech`
  const response = await postOnceRetried(url, {
    method: 'POST',
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(120_000)]) : AbortSignal.timeout(120_000),
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
    throw new Error(
      `TTS request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ''}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function synthesizeListeningTranscript(
  transcript: string,
  config: TtsConfig = getTtsConfigFromEnv(),
  signal?: AbortSignal
): Promise<Buffer> {
  const options = voiceOptions(config)
  const plan = planDialogueVoices(transcript, options)
  if (!plan) {
    const monologue = planMonologue(transcript, options)
    return synthesizeSpeech({ text: monologue.text, voice: monologue.voice, ...(signal ? { signal } : {}) }, config)
  }

  const available = await listAvailableVoices(config)
  const wavParts = await mapPool(plan, config.concurrency, async turn => {
    const voice = fallbackVoiceFor(turn.voice, available, options)
    return synthesizeSpeech({ text: turn.text, voice, ...(signal ? { signal } : {}) }, config)
  })

  return concatWavWithPauses(wavParts, config.turnPauseMs)
}

export function listeningTranscriptHashKey(transcript: string, config?: TtsConfig): string {
  return dialogueAudioPlanKey(transcript, config ? voiceOptions(config) : undefined)
}

const voicesCache = new Map<string, { checkedAt: number; voices: Set<string> }>()
const VOICES_CACHE_TTL_MS = 30_000

async function fetchVoicesFrom(baseUrl: string): Promise<Set<string>> {
  const cached = voicesCache.get(baseUrl)
  if (cached && Date.now() - cached.checkedAt < VOICES_CACHE_TTL_MS) {
    return cached.voices
  }

  try {
    const response = await fetch(`${baseUrl}/v1/audio/voices`, { method: 'GET', signal: AbortSignal.timeout(10000) })
    if (!response.ok) {
      const empty = new Set<string>()
      voicesCache.set(baseUrl, { checkedAt: Date.now(), voices: empty })
      return empty
    }
    const body = (await response.json().catch(() => null)) as { voices?: string[] } | null
    const voices = new Set(
      Array.isArray(body?.voices) ? body.voices.map(v => String(v).toLowerCase()) : []
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
  return fetchVoicesFrom(config.baseUrl)
}

export async function checkTtsHealth(config: TtsConfig): Promise<boolean> {
  return (await ttsHealthStatus(config)) === 'ok'
}

/**
 * Reachable, and serving every voice the pack needs. A server that answers but lacks the
 * pack's voices (for example a German-only install asked for English) is `unsupported`.
 */
export async function ttsHealthStatus(config: TtsConfig): Promise<TtsHealthStatus> {
  try {
    const response = await fetch(`${config.baseUrl}/v1/audio/voices`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return 'offline'
    const needed = (config.voices ?? []).map(voice => voice.id.toLowerCase())
    if (!needed.length) return 'ok'
    const body = (await response.json().catch(() => null)) as { voices?: unknown } | null
    const served = new Set(
      Array.isArray(body?.voices) ? body.voices.map(voice => String(voice).toLowerCase()) : []
    )
    return needed.every(id => served.has(id)) ? 'ok' : 'unsupported'
  } catch {
    return 'offline'
  }
}
