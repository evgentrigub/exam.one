/**
 * Parse speaker-labeled listening transcripts into dialogue turns and map
 * speakers to Kokoro voices (martin = male, victoria = female).
 *
 * Expected label shape (Goethe-style seeds / generator prompts):
 *   "Mann: … Frau: …" | "Verkäuferin: …" | "Frau Müller: …" | "Moderatorin: …"
 */

export type DialogueVoiceId = 'martin' | 'victoria'
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

/**
 * Map a speaker label to martin (male) or victoria (female).
 * Unknown genders alternate by first appearance so dialogues stay distinct.
 */
export function resolveDialogueVoice(
  speaker: string,
  unknownVoiceIndex: number,
): DialogueVoiceId {
  const gender = inferSpeakerGender(speaker)
  if (gender === 'female') return 'victoria'
  if (gender === 'male') return 'martin'
  return unknownVoiceIndex % 2 === 0 ? 'martin' : 'victoria'
}

/**
 * Parse transcript and attach voices. Returns null for monologues / unlabeled text.
 */
export function planDialogueVoices(transcript: string): VoicedDialogueTurn[] | null {
  const turns = parseDialogueTurns(transcript)
  if (!turns) return null

  const speakerVoice = new Map<string, DialogueVoiceId>()
  let unknownIndex = 0
  const voiced: VoicedDialogueTurn[] = []

  for (const turn of turns) {
    const key = turn.speaker.toLowerCase()
    let voice = speakerVoice.get(key)
    if (!voice) {
      const gender = inferSpeakerGender(turn.speaker)
      voice = resolveDialogueVoice(turn.speaker, unknownIndex)
      if (gender === 'unknown') unknownIndex += 1
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
