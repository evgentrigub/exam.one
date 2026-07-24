/**
 * Parse speaker-labeled listening transcripts into dialogue turns and map
 * speakers to Kokoro voices (2 male + 2 female).
 *
 * Expected label shape (Goethe-style seeds / generator prompts):
 *   "Mann: … Frau: …" | "Verkäuferin: …" | "Frau Müller: …" | "Moderatorin: …"
 */

export type DialogueVoiceId = 'martin' | 'bernd' | 'victoria' | 'eva'
export type SpeakerGender = 'male' | 'female' | 'unknown'

export interface DialogueTurn {
  speaker: string
  text: string
}

export interface VoicedDialogueTurn extends DialogueTurn {
  voice: DialogueVoiceId
  gender: SpeakerGender
}

/** Speaker label: 1–3 capitalized words ending with a colon. */
const SPEAKER_LABEL_RE =
  /(?:^|(?<=\s))([A-ZÄÖÜ][A-Za-zÄÖÜäöüß]*(?:\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß]*){0,2}):\s*/g

export const MALE_VOICE_POOL: readonly DialogueVoiceId[] = ['martin', 'bernd']
export const FEMALE_VOICE_POOL: readonly DialogueVoiceId[] = ['victoria', 'eva']
export const ALL_VOICE_POOL: readonly DialogueVoiceId[] = [
  'martin',
  'victoria',
  'bernd',
  'eva',
]

const FEMALE_ROLES = new Set([
  'frau',
  'moderatorin',
  'verkäuferin',
  'kellnerin',
  'ärztin',
  'lehrerin',
  'kundin',
  'nachbarin',
  'chefin',
  'kollegin',
])

const MALE_ROLES = new Set([
  'mann',
  'herr',
  'moderator',
  'kellner',
  'techniker',
  'arzt',
  'lehrer',
  'kunde',
  'nachbar',
  'chef',
  'kollege',
  'verkäufer',
])

const FEMALE_NAMES = new Set([
  'anna',
  'clara',
  'eva',
  'mareike',
  'frauke',
  'victoria',
  'julia',
  'sarah',
  'lisa',
  'maria',
  'petra',
  'sabine',
  'monika',
])

const MALE_NAMES = new Set([
  'bernd',
  'david',
  'andreas',
  'ralf',
  'manfred',
  'thomas',
  'peter',
  'hans',
  'stefan',
  'markus',
  'martin',
])

/**
 * Split a labeled dialogue transcript into turns.
 * Returns null when fewer than two speaker turns are found (treat as monologue).
 */
export function parseDialogueTurns(transcript: string): DialogueTurn[] | null {
  const source = transcript.trim()
  if (!source) return null

  const matches = [...source.matchAll(SPEAKER_LABEL_RE)]
  if (matches.length < 2) return null

  const turns: DialogueTurn[] = []

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]
    if (!match || match.index === undefined) continue

    const speaker = (match[1] ?? '').trim()
    if (!speaker) continue

    const textStart = match.index + match[0].length
    const textEnd = i + 1 < matches.length ? matches[i + 1]?.index ?? source.length : source.length
    const text = source.slice(textStart, textEnd).trim()
    if (!text) continue

    turns.push({ speaker, text })
  }

  return turns.length >= 2 ? turns : null
}

export function inferSpeakerGender(speaker: string): SpeakerGender {
  const normalized = speaker.trim().replace(/\s+/g, ' ')
  if (!normalized) return 'unknown'

  const lower = normalized.toLowerCase()
  const parts = lower.split(' ')
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? first

  if (first === 'frau' || FEMALE_ROLES.has(first) || FEMALE_ROLES.has(lower)) {
    return 'female'
  }
  if (first === 'herr' || MALE_ROLES.has(first) || MALE_ROLES.has(lower)) {
    return 'male'
  }

  // Feminine occupational forms often end in -in (Moderatorin, Verkäuferin).
  if (first.length > 3 && first.endsWith('in') && !first.endsWith('ein')) {
    return 'female'
  }

  if (FEMALE_NAMES.has(first) || FEMALE_NAMES.has(last)) return 'female'
  if (MALE_NAMES.has(first) || MALE_NAMES.has(last)) return 'male'

  return 'unknown'
}

function pickFromPool(
  pool: readonly DialogueVoiceId[],
  index: number,
): DialogueVoiceId {
  const voice = pool[index % pool.length]
  return voice ?? pool[0] ?? 'martin'
}

/**
 * Map a speaker to a voice using per-gender pools (order of first appearance).
 * Unknown genders rotate through the full 4-voice roster.
 */
export function resolveDialogueVoice(
  speaker: string,
  genderIndex: number,
): DialogueVoiceId {
  const gender = inferSpeakerGender(speaker)
  if (gender === 'female') return pickFromPool(FEMALE_VOICE_POOL, genderIndex)
  if (gender === 'male') return pickFromPool(MALE_VOICE_POOL, genderIndex)
  return pickFromPool(ALL_VOICE_POOL, genderIndex)
}

/**
 * Same-gender fallback when a preferred voice is offline.
 * e.g. eva → victoria → martin; bernd → martin
 */
export function fallbackVoiceFor(
  preferred: DialogueVoiceId,
  available: ReadonlySet<string>,
): DialogueVoiceId {
  if (available.has(preferred)) return preferred

  const maleFallbacks: DialogueVoiceId[] = ['martin', 'bernd']
  const femaleFallbacks: DialogueVoiceId[] = ['victoria', 'eva', 'martin']

  const pool = MALE_VOICE_POOL.includes(preferred) ? maleFallbacks : femaleFallbacks
  for (const candidate of pool) {
    if (available.has(candidate)) return candidate
  }
  return 'martin'
}

/**
 * Parse transcript and attach voices. Returns null for monologues / unlabeled text.
 */
export function planDialogueVoices(transcript: string): VoicedDialogueTurn[] | null {
  const turns = parseDialogueTurns(transcript)
  if (!turns) return null

  const speakerVoice = new Map<string, DialogueVoiceId>()
  let maleIndex = 0
  let femaleIndex = 0
  let unknownIndex = 0
  const voiced: VoicedDialogueTurn[] = []

  for (const turn of turns) {
    const key = turn.speaker.toLowerCase()
    let voice = speakerVoice.get(key)
    if (!voice) {
      const gender = inferSpeakerGender(turn.speaker)
      if (gender === 'male') {
        voice = resolveDialogueVoice(turn.speaker, maleIndex)
        maleIndex += 1
      } else if (gender === 'female') {
        voice = resolveDialogueVoice(turn.speaker, femaleIndex)
        femaleIndex += 1
      } else {
        voice = resolveDialogueVoice(turn.speaker, unknownIndex)
        unknownIndex += 1
      }
      speakerVoice.set(key, voice)
    }

    voiced.push({
      ...turn,
      voice,
      gender: inferSpeakerGender(turn.speaker),
    })
  }

  return voiced
}

/** Stable string for transcript hash sidecars (includes voice assignment). */
export function dialogueAudioPlanKey(transcript: string): string {
  const plan = planDialogueVoices(transcript)
  if (!plan) return `mono:${transcript.trim()}`
  return plan.map((turn) => `${turn.voice}|${turn.speaker}|${turn.text}`).join('\n')
}
