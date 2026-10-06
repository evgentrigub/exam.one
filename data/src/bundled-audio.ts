import type { ExamPack } from './types'

/** Every listening WAV URL starts here; the backend and the CLI resolve paths below it. */
export const LISTENING_AUDIO_URL_ROOT = '/audio/listening'

/** One bundled seed WAV: a single URL with the transcript it is synthesised from. */
export interface BundledAudioSegment {
  packId: string
  exerciseId: string
  /** Set for per-item recordings; absent for an exercise's single `shared.wav`. */
  itemId?: string
  url: string
  /** `url` relative to {@link LISTENING_AUDIO_URL_ROOT}, e.g. `cambridge-en-a2/<id>/shared.wav`. */
  path: string
  transcript: string
}

/** The word a pack's language uses for an exam part: Teil 1, Part 1, Część 1, Tarea 1. */
const PART_WORDS: Readonly<Record<string, string>> = {
  de: 'Teil',
  en: 'Part',
  pl: 'Część',
  es: 'Tarea',
}

/** "Part 1: ", "Zadanie III: ", also after a "Mock Set 1 · " lead-in. */
const PART_PREFIX = /(^|·\s*)(?:Teil|Part|Część|Zadanie|Tarea)\s*(?:\d+|[IVX]+)\s*[:—–-]\s*/

function audioMapOf(
  exercise: Record<string, unknown>
): { shared?: unknown; items?: Record<string, unknown> } | null {
  const audio = exercise['audio']
  return audio && typeof audio === 'object'
    ? (audio as { shared?: unknown; items?: Record<string, unknown> })
    : null
}

function itemTranscript(exercise: Record<string, unknown>, itemId: string): unknown {
  const items = Array.isArray(exercise['items'])
    ? (exercise['items'] as Record<string, unknown>[])
    : []
  return items.find(item => item['id'] === itemId)?.['transcript']
}

/**
 * The bundled seed WAVs of one pack: listening seeds whose explicit `audio` map points under
 * the pack's `speech.audioPathPrefix` (Goethe A2: every seed; the others: mock Set 1).
 * Seeds without such a map generate their audio on demand instead. Deduplicated by URL.
 */
export function bundledAudioSegments(pack: ExamPack): BundledAudioSegment[] {
  const prefix = pack.speech.audioPathPrefix.replace(/\/$/, '') + '/'
  const root = LISTENING_AUDIO_URL_ROOT + '/'
  const segments = new Map<string, BundledAudioSegment>()

  for (const exercise of pack.seedExercises?.listening ?? []) {
    const audio = audioMapOf(exercise)
    const exerciseId = exercise['id']
    if (!audio || typeof exerciseId !== 'string') continue
    const add = (url: unknown, transcript: unknown, itemId?: string): void => {
      if (typeof url !== 'string' || !url.startsWith(prefix) || !url.startsWith(root)) return
      if (typeof transcript !== 'string' || !transcript.trim() || segments.has(url)) return
      segments.set(url, {
        packId: pack.packId,
        exerciseId,
        ...(itemId ? { itemId } : {}),
        url,
        path: url.slice(root.length),
        transcript,
      })
    }
    add(audio.shared, exercise['transcript'])
    for (const [itemId, url] of Object.entries(audio.items ?? {}))
      add(url, itemTranscript(exercise, itemId), itemId)
  }

  return [...segments.values()]
}

/** The pack's bundled seed folder relative to {@link LISTENING_AUDIO_URL_ROOT}, e.g. `cambridge-en-a2`. */
export function bundledAudioDir(pack: ExamPack): string {
  return pack.speech.audioPathPrefix.replace(/\/$/, '').slice(LISTENING_AUDIO_URL_ROOT.length + 1)
}

/** "Teil 2", "Part 3": the part label of a listening exercise in its pack's language. */
export function listeningPartLabel(pack: ExamPack, part: unknown): string | null {
  if (typeof part !== 'number' || !Number.isFinite(part)) return null
  return `${PART_WORDS[pack.language] ?? 'Part'} ${part}`
}

/** An exercise title without its "Part 1:" label, so the part can be shown on its own. */
export function listeningDisplayTitle(title: unknown, fallback: string): string {
  if (typeof title !== 'string' || !title.trim()) return fallback
  return title.replace(PART_PREFIX, '$1').trim() || title.trim()
}
