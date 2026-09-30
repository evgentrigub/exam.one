/**
 * Parse speaker-labeled listening transcripts into dialogue turns and map
 * speakers to Kokoro voices (2 male + 2 female).
 *
 * Expected label shape (Goethe-style seeds / generator prompts):
 *   "Mann: … Frau: …" | "Verkäuferin: …" | "Frau Müller: …" | "Moderatorin: …"
 * English packs label turns with one word: "Man: …", "Assistant: …", "Katie: …".
 *
 * German keeps its fixed four-voice roster and rules, so its voice plan — and every cached
 * German WAV keyed by it — never changes. Other languages draw their pools from the pack's
 * own voices.
 */

export type DialogueVoiceId = 'martin' | 'bernd' | 'victoria' | 'eva'
export type SpeakerGender = 'male' | 'female' | 'unknown'

/** The pack's language and voices, for any language other than the German default. */
export interface DialogueVoiceOptions {
  lang: string
  voices: ReadonlyArray<{ id: string; gender: 'male' | 'female' }>
}

export interface DialogueTurn {
  speaker: string
  text: string
}

export interface VoicedDialogueTurn extends DialogueTurn {
  voice: string
  gender: SpeakerGender
}

/**
 * Speaker label: 1–3 capitalized words ending with a colon. The letter classes list German
 * and Polish letters explicitly, so German and English plans (and their audio keys) are
 * unchanged.
 */
const SPEAKER_LABEL_RE =
  /(?:^|(?<=\s))([A-ZÄÖÜĄĆĘŁŃÓŚŹŻ][A-Za-zÄÖÜäöüßĄĆĘŁŃÓŚŹŻąćęłńóśźż]*(?:\s+[A-ZÄÖÜĄĆĘŁŃÓŚŹŻ][A-Za-zÄÖÜäöüßĄĆĘŁŃÓŚŹŻąćęłńóśźż]*){0,2}):\s*/g

export const MALE_VOICE_POOL: readonly DialogueVoiceId[] = ['martin', 'bernd']
export const FEMALE_VOICE_POOL: readonly DialogueVoiceId[] = ['victoria', 'eva']
export const ALL_VOICE_POOL: readonly DialogueVoiceId[] = ['martin', 'victoria', 'bernd', 'eva']

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

const ENGLISH_FEMALE_ROLES = new Set([
  'woman',
  'girl',
  'mum',
  'mother',
  'grandma',
  'grandmother',
  'aunt',
  'sister',
  'daughter',
  'wife',
  'lady',
  'waitress',
])

const ENGLISH_MALE_ROLES = new Set([
  'man',
  'boy',
  'dad',
  'father',
  'grandad',
  'grandfather',
  'uncle',
  'brother',
  'son',
  'husband',
  'waiter',
])

const ENGLISH_FEMALE_NAMES = new Set([
  'alice',
  'amy',
  'anna',
  'chloe',
  'claire',
  'ella',
  'emma',
  'grace',
  'hana',
  'hannah',
  'helen',
  'holly',
  'isabella',
  'jane',
  'jenny',
  'jessica',
  'julia',
  'kate',
  'katie',
  'laura',
  'lily',
  'lisa',
  'lucia',
  'lucy',
  'maria',
  'mary',
  'megan',
  'mia',
  'nina',
  'olivia',
  'rachel',
  'sarah',
  'sofia',
  'sophie',
  'susan',
  'zoe',
])

const ENGLISH_MALE_NAMES = new Set([
  'adam',
  'andy',
  'ben',
  'dan',
  'daniel',
  'david',
  'george',
  'harry',
  'jack',
  'james',
  'joe',
  'john',
  'leo',
  'luke',
  'marco',
  'mark',
  'martin',
  'matt',
  'max',
  'michael',
  'mike',
  'nick',
  'oliver',
  'paul',
  'peter',
  'rob',
  'ryan',
  'sam',
  'simon',
  'steve',
  'tim',
  'tom',
  'tony',
])

const POLISH_FEMALE_ROLES = new Set([
  'kobieta',
  'dziewczyna',
  'dziewczynka',
  'mama',
  'matka',
  'babcia',
  'ciocia',
  'siostra',
  'córka',
  'żona',
  'narzeczona',
  'koleżanka',
  'przyjaciółka',
  'sąsiadka',
  'sprzedawczyni',
  'kelnerka',
  'lekarka',
  'nauczycielka',
  'recepcjonistka',
  'klientka',
  'pasażerka',
  'studentka',
  'dziennikarka',
  'prezenterka',
  'spikerka',
  'pielęgniarka',
  'kasjerka',
  'urzędniczka',
  'farmaceutka',
  'turystka',
])

/** Masculine roles, several ending in -a (kolega, sprzedawca), looked up before the -a rule. */
const POLISH_MALE_ROLES = new Set([
  'mężczyzna',
  'chłopak',
  'chłopiec',
  'tata',
  'ojciec',
  'dziadek',
  'wujek',
  'brat',
  'syn',
  'mąż',
  'narzeczony',
  'kolega',
  'przyjaciel',
  'sąsiad',
  'sprzedawca',
  'kelner',
  'lekarz',
  'nauczyciel',
  'recepcjonista',
  'klient',
  'pasażer',
  'student',
  'dziennikarz',
  'prezenter',
  'spiker',
  'kasjer',
  'urzędnik',
  'farmaceuta',
  'turysta',
  'kierowca',
  'policjant',
  'konduktor',
])

const POLISH_FEMALE_NAMES = new Set([
  'anna',
  'ania',
  'maria',
  'katarzyna',
  'kasia',
  'agnieszka',
  'magda',
  'magdalena',
  'ewa',
  'joanna',
  'asia',
  'małgorzata',
  'małgosia',
  'zofia',
  'zosia',
  'aleksandra',
  'ola',
  'monika',
  'marta',
  'barbara',
  'basia',
  'łucja',
  'julia',
  'natalia',
  'karolina',
  'justyna',
  'beata',
  'dorota',
  'iwona',
  'elżbieta',
  'ela',
  'krystyna',
  'hanna',
  'hania',
  'weronika',
  'paulina',
  'żaneta',
])

/** Masculine first names, including the few that end in -a. */
const POLISH_MALE_NAMES = new Set([
  'piotr',
  'paweł',
  'tomasz',
  'tomek',
  'marek',
  'jan',
  'janek',
  'krzysztof',
  'michał',
  'adam',
  'andrzej',
  'jakub',
  'kuba',
  'bartek',
  'bartosz',
  'łukasz',
  'maciej',
  'wojtek',
  'wojciech',
  'kamil',
  'marcin',
  'mateusz',
  'grzegorz',
  'jerzy',
  'józef',
  'stanisław',
  'rafał',
  'darek',
  'szymon',
  'filip',
  'barnaba',
  'kosma',
])

/**
 * A Polish label is Pani/Pan with a name, a role or a first name. Unlisted feminine roles
 * end in -ka or -yni, and unlisted feminine first names in -a.
 */
function inferPolishGender(speaker: string): SpeakerGender {
  const parts = speaker.trim().toLowerCase().split(/\s+/)
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? first
  if (first === 'pani') return 'female'
  if (first === 'pan') return 'male'
  if (POLISH_FEMALE_ROLES.has(first) || POLISH_FEMALE_NAMES.has(first)) return 'female'
  if (POLISH_MALE_ROLES.has(first) || POLISH_MALE_NAMES.has(first)) return 'male'
  if (POLISH_FEMALE_NAMES.has(last)) return 'female'
  if (POLISH_MALE_NAMES.has(last)) return 'male'
  if (first.length > 3 && (first.endsWith('ka') || first.endsWith('yni'))) return 'female'
  if (parts.length === 1 && first.length > 2 && first.endsWith('a')) return 'female'
  return 'unknown'
}

/** The gender of a speaker in a pack language other than German. */
function inferPackGender(speaker: string, options: DialogueVoiceOptions): SpeakerGender {
  return options.lang === 'pl' ? inferPolishGender(speaker) : inferEnglishGender(speaker)
}

function isGerman(options?: DialogueVoiceOptions): boolean {
  return !options || options.lang === 'de'
}

/** An English label is a role or a first name; a name is looked up before anything else. */
function inferEnglishGender(speaker: string): SpeakerGender {
  const parts = speaker.trim().toLowerCase().split(/\s+/)
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? first
  if (first === 'mrs' || first === 'ms' || first === 'miss') return 'female'
  if (first === 'mr') return 'male'
  if (ENGLISH_FEMALE_NAMES.has(first) || ENGLISH_FEMALE_ROLES.has(last)) return 'female'
  if (ENGLISH_MALE_NAMES.has(first) || ENGLISH_MALE_ROLES.has(last)) return 'male'
  return 'unknown'
}

/** Per-gender pools in the pack's voice order, and every voice in that order. */
function packPools(options: DialogueVoiceOptions): Record<SpeakerGender, string[]> {
  const ids = (gender?: 'male' | 'female') =>
    options.voices.filter(voice => !gender || voice.gender === gender).map(voice => voice.id)
  return { male: ids('male'), female: ids('female'), unknown: ids() }
}

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
    const textEnd =
      i + 1 < matches.length ? (matches[i + 1]?.index ?? source.length) : source.length
    const text = source.slice(textStart, textEnd).trim()
    if (!text) continue

    turns.push({ speaker, text })
  }

  return turns.length >= 2 ? turns : null
}

export function inferSpeakerGender(speaker: string, options?: DialogueVoiceOptions): SpeakerGender {
  if (!isGerman(options)) return inferPackGender(speaker, options!)
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

function pickFromPool(pool: readonly DialogueVoiceId[], index: number): DialogueVoiceId {
  const voice = pool[index % pool.length]
  return voice ?? pool[0] ?? 'martin'
}

/**
 * Map a speaker to a voice using per-gender pools (order of first appearance).
 * Unknown genders rotate through the full 4-voice roster.
 */
export function resolveDialogueVoice(speaker: string, genderIndex: number): DialogueVoiceId {
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
  preferred: string,
  available: ReadonlySet<string>,
  options?: DialogueVoiceOptions
): string {
  if (available.has(preferred)) return preferred
  if (!isGerman(options)) {
    // Another voice of the pack, same gender first; never a voice of another language.
    const pools = packPools(options!)
    const gender = options!.voices.find(voice => voice.id === preferred)?.gender ?? 'unknown'
    const candidate = [...pools[gender], ...pools.unknown].find(id => available.has(id))
    return candidate ?? preferred
  }

  const maleFallbacks: DialogueVoiceId[] = ['martin', 'bernd']
  const femaleFallbacks: DialogueVoiceId[] = ['victoria', 'eva', 'martin']

  const pool = MALE_VOICE_POOL.includes(preferred as DialogueVoiceId) ? maleFallbacks : femaleFallbacks
  for (const candidate of pool) {
    if (available.has(candidate)) return candidate
  }
  return 'martin'
}

/**
 * Parse transcript and attach voices. Returns null for monologues / unlabeled text.
 */
export function planDialogueVoices(
  transcript: string,
  options?: DialogueVoiceOptions
): VoicedDialogueTurn[] | null {
  if (!isGerman(options)) return planPackVoices(transcript, options!)
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

/** Speakers take the next voice of their gender, in order of first appearance. */
function planPackVoices(transcript: string, options: DialogueVoiceOptions): VoicedDialogueTurn[] | null {
  const turns = parseDialogueTurns(transcript)
  if (!turns) return null
  const pools = packPools(options)
  const next: Record<SpeakerGender, number> = { male: 0, female: 0, unknown: 0 }
  const speakerVoice = new Map<string, string>()
  return turns.map(turn => {
    const gender = inferPackGender(turn.speaker, options)
    const key = turn.speaker.toLowerCase()
    let voice = speakerVoice.get(key)
    if (!voice) {
      const pool = pools[gender].length ? pools[gender] : pools.unknown
      voice = pool[next[gender] % Math.max(pool.length, 1)] ?? options.voices[0]?.id ?? ''
      next[gender] += 1
      speakerVoice.set(key, voice)
    }
    return { ...turn, voice, gender }
  })
}

/**
 * The voice and text of a monologue. German keeps its fixed narrator and speaks the text as
 * written. Elsewhere a single leading label ("Paul: …") picks a voice of that speaker's
 * gender and is not read aloud; unlabeled text takes the pack's first voice.
 */
export function planMonologue(
  transcript: string,
  options?: DialogueVoiceOptions
): { voice: string; text: string } {
  if (isGerman(options)) return { voice: 'martin', text: transcript }
  const match = /^([A-ZĄĆĘŁŃÓŚŹŻ][A-Za-z'ĄĆĘŁŃÓŚŹŻąćęłńóśźż]{1,20}):\s*/.exec(transcript.trim())
  const pools = packPools(options!)
  const gender = match ? inferPackGender(match[1]!, options!) : 'unknown'
  const voice = (pools[gender].length ? pools[gender] : pools.unknown)[0] ?? ''
  return { voice, text: match ? transcript.trim().slice(match[0].length) : transcript }
}

/** Stable string for transcript hash sidecars (includes voice assignment). */
export function dialogueAudioPlanKey(transcript: string, options?: DialogueVoiceOptions): string {
  const plan = planDialogueVoices(transcript, options)
  if (!plan) {
    if (isGerman(options)) return `mono:${transcript.trim()}`
    const monologue = planMonologue(transcript, options)
    return `mono:${monologue.voice}|${monologue.text.trim()}`
  }
  return plan.map(turn => `${turn.voice}|${turn.speaker}|${turn.text}`).join('\n')
}
