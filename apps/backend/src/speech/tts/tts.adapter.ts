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
  /** Background listening tracks can be much longer than a read-aloud utterance. */
  timeoutMs?: number
}

export interface TtsConfig {
  maxChunkCharacters?: number
  baseUrl: string
  voice: string
  speed: number
  lang: string
  turnPauseMs: number
  concurrency: number
  /** The pack's voices; they pick the voice of every turn outside German. */
  voices?: DialogueVoiceOptions['voices']
  /** The user's default voice for a German pack: it narrates monologues instead of martin. */
  narrator?: string
}

export type TtsHealthStatus = 'ok' | 'offline' | 'unsupported'

function voiceOptions(config: TtsConfig): DialogueVoiceOptions {
  return {
    lang: config.lang,
    voices: config.voices ?? [],
    ...(config.narrator ? { narrator: config.narrator } : {}),
  }
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
  const deadline = AbortSignal.timeout(options.timeoutMs ?? 120_000)
  const url = `${config.baseUrl}/v1/audio/speech`
  const response = await postOnceRetried(url, {
    method: 'POST',
    signal: options.signal ? AbortSignal.any([options.signal, deadline]) : deadline,
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

/** Prefer complete sentences; split unusually long sentences at word boundaries. */
export function splitSpeechText(text: string, maxCharacters: number): string[] {
  if (!Number.isInteger(maxCharacters) || maxCharacters < 1)
    throw new Error('Invalid speech chunk limit')
  const chunks: string[] = []
  let current = ''
  for (const sentence of text.trim().split(/(?<=[.!?])\s+/u)) {
    for (const word of sentence.split(/\s+/u)) {
      if (current && current.length + word.length + 1 > maxCharacters) {
        chunks.push(current)
        current = ''
      }
      current += (current ? ' ' : '') + word
    }
    if (current && current.length >= maxCharacters * 0.6) {
      chunks.push(current)
      current = ''
    }
  }
  if (current) chunks.push(current)
  return chunks
}

async function synthesizeListeningTurn(
  text: string,
  voice: string,
  config: TtsConfig,
  signal?: AbortSignal
): Promise<Buffer> {
  const chunks = config.maxChunkCharacters
    ? splitSpeechText(text, config.maxChunkCharacters)
    : [text]
  const parts: Buffer[] = []
  for (const chunk of chunks) {
    signal?.throwIfAborted()
    parts.push(
      await synthesizeSpeech(
        { text: chunk, voice, timeoutMs: 600_000, ...(signal ? { signal } : {}) },
        config
      )
    )
  }
  return parts.length === 1 ? parts[0]! : concatWavWithPauses(parts, 80)
}

export async function synthesizeListeningTranscript(
  transcript: string,
  config: TtsConfig = getTtsConfigFromEnv(),
  signal?: AbortSignal
): Promise<Buffer> {
  const options = voiceOptions(config)
  const plan = planDialogueVoices(transcript, options)
  const available = await listAvailableVoices(config)
  if (!plan) {
    const monologue = planMonologue(transcript, options)
    // A language needs only one installed voice: a missing narrator falls back like a turn.
    const voice = fallbackVoiceFor(monologue.voice, available, options)
    return synthesizeListeningTurn(monologue.text, voice, config, signal)
  }

  const wavParts = await mapPool(plan, config.concurrency, async turn => {
    const voice = fallbackVoiceFor(turn.voice, available, options)
    return synthesizeListeningTurn(turn.text, voice, config, signal)
  })

  return concatWavWithPauses(wavParts, config.turnPauseMs)
}

export function listeningTranscriptHashKey(transcript: string, config?: TtsConfig): string {
  const plan = dialogueAudioPlanKey(transcript, config ? voiceOptions(config) : undefined)
  return config?.maxChunkCharacters
    ? JSON.stringify([plan, 'bounded-v1', config.maxChunkCharacters])
    : plan
}

const voicesCache = new Map<string, { checkedAt: number; voices: Set<string> }>()
const VOICES_CACHE_TTL_MS = 30_000

/** Forget the served-voice list, after a voice was installed or removed. */
export function clearTtsVoicesCache(): void {
  voicesCache.clear()
}

async function fetchVoicesFrom(baseUrl: string): Promise<Set<string>> {
  const cached = voicesCache.get(baseUrl)
  if (cached && Date.now() - cached.checkedAt < VOICES_CACHE_TTL_MS) {
    return cached.voices
  }

  try {
    const response = await fetch(`${baseUrl}/v1/audio/voices`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })
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
 * Reachable, and serving at least one of the pack's voices (the others fall back to it). A
 * server that answers but has none of them, such as an English-only install asked for
 * Polish, is `unsupported`.
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
    return needed.some(id => served.has(id)) ? 'ok' : 'unsupported'
  } catch {
    return 'offline'
  }
}
