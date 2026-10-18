/** Settings → Generated files: listening audio on disk and the installed TTS voice models. */

export type MediaAudioKind = 'seed' | 'generated'
export type MediaAudioOrigin = 'practice' | 'mock'

/** One exercise's listening audio: shared seed WAVs of a pack, or the user's generated copy. */
export interface MediaAudioRowDto {
  /** Opaque `kind:packId:exerciseId`, passed back to delete the row. */
  id: string
  kind: MediaAudioKind
  packId: string
  /** TTS language of the pack (`en`, `de`, `pl`, `es`). */
  lang: string
  level: string
  title: string
  /** "Part 1", "Teil 2"… in the pack's language, when the exercise names its part. */
  part: string | null
  durationSec: number
  bytes: number
  fileCount: number
  modifiedAt: string
  origin: MediaAudioOrigin
  /** A submitted practice attempt, or a finished mock exam containing the exercise. */
  completed: boolean
  /** Playable URLs, in playback order. */
  urls: string[]
  /** The folder on the host, for display. */
  hostPath: string
}

export interface MediaAudioListDto {
  rows: MediaAudioRowDto[]
}

export interface MediaAudioDeleteResultDto {
  deletedRows: number
  deletedFiles: number
  freedBytes: number
}

export interface MediaSummaryDto {
  voiceBytes: number
  audioBytes: number
  sttBytes: number
}

export interface SttModelDto {
  id: string
  name: string
  engine: string
  languages: string[]
  /** Curated Settings languages; capabilities above may include additional languages. */
  recommendedLanguages?: string[]
  /** False for retained legacy assets: inference/removal only, no new downloads or selections. */
  downloadable?: boolean
  license: string
  installed: boolean
  downloadBytes: number
  installedBytes: number
  selectedLanguages: string[]
  progress: VoiceDownloadProgressDto | null
}

export interface SttModelsDto {
  online: boolean
  manageable: boolean
  installedBytes: number
  models: SttModelDto[]
}

export type VoiceQuality = 'low' | 'medium' | 'high'

export interface VoiceDownloadProgressDto {
  state: 'downloading' | 'failed'
  receivedBytes: number
  totalBytes: number
  percent: number
  error?: string
}

export interface VoiceModelDto {
  id: string
  lang: string
  name: string
  gender: 'male' | 'female'
  /** "UK", "Spain"; null when the voice has no regional accent label. */
  accent: string | null
  quality: VoiceQuality
  installed: boolean
  /** Bytes on disk when installed (shared model files split between voices), else download size. */
  sizeBytes: number
  isDefault: boolean
  progress: VoiceDownloadProgressDto | null
}

export interface VoiceModelsDto {
  /** False when the TTS service is unreachable; voices are then empty. */
  online: boolean
  installedBytes: number
  voices: VoiceModelDto[]
}
