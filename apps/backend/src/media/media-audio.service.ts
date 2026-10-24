import { readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type {
  MediaAudioDeleteResultDto,
  MediaAudioOrigin,
  MediaAudioRowDto,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import {
  bundledAudioSegments,
  listeningDisplayTitle,
  listeningPartLabel,
  listLivePacks,
  LISTENING_AUDIO_URL_ROOT,
  type BundledAudioSegment,
  type ExamPack,
} from '@exam-one/exam-packs'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { packContext } from '../core/interceptors/pack-context.interceptor'
import { mockSetListeningExercises } from '../mock-exam/mock-set-listening'
import { containedAudioPath } from '../speech/tts/listening-audio'
import { mapPool } from '../speech/tts/mapPool'
import { TtsService } from '../speech/tts/tts.service'
import { wavDurationSec } from './wav-duration'

const STAT_CONCURRENCY = 16
const GENERATED_URL_ROOT = `${LISTENING_AUDIO_URL_ROOT}/generated`

/** What the user did with an exercise, keyed `packId:exerciseId`. */
interface Usage {
  payloads: Map<string, Record<string, unknown>>
  mockIds: Set<string>
  completed: Set<string>
}

interface AudioFile {
  url: string
  absolute: string
  bytes: number
  mtimeMs: number
  durationSec: number
}

const keyOf = (packId: string, exerciseId: string): string => `${packId}:${exerciseId}`

/** `shared.wav` first, then items in numeric order (`item-2` before `item-10`). */
function playbackOrder(a: string, b: string): number {
  if (a.startsWith('shared') !== b.startsWith('shared')) return a.startsWith('shared') ? -1 : 1
  return a.localeCompare(b, undefined, { numeric: true })
}

/** Parse `kind:packId:exerciseId`; the exercise id may itself contain colons. */
export function parseMediaAudioId(
  id: string
): { kind: string; packId: string; exerciseId: string } | null {
  const [kind, packId, ...rest] = id.split(':')
  const exerciseId = rest.join(':')
  return kind && packId && exerciseId ? { kind, packId, exerciseId } : null
}

@Injectable()
export class MediaAudioService {
  private readonly logger = new Logger(MediaAudioService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tts: TtsService
  ) {}

  private seedRoot(): string {
    return this.config.getOrThrow<string>('app.SEED_LISTENING_AUDIO_DIR')
  }

  private displayRoot(): string {
    return (
      this.config.get<string>('app.AUDIO_HOST_DISPLAY_ROOT') ??
      'apps/frontend/public/audio/listening'
    ).replace(/\/+$/, '')
  }

  /** Every listening exercise the user can reach per pack, which of them sit in mock sets, and
   *  which are done: a submitted practice attempt or a finished mock exam. */
  private async usage(user: User, packs: readonly ExamPack[]): Promise<Usage> {
    const packIds = packs.map(pack => pack.packId)
    const owned = { packId: { in: packIds }, OR: [{ userId: null }, { userId: user.id }] }
    const [exercises, sets, mockAttempts, attempts] = await Promise.all([
      this.prisma.exercise.findMany({
        where: { ...owned, skill: 'LISTENING' },
        select: { packId: true, externalId: true, payload: true },
      }),
      this.prisma.mockExamSet.findMany({
        where: owned,
        select: { id: true, packId: true, content: true },
      }),
      this.prisma.mockExamAttempt.findMany({
        where: { userId: user.id },
        select: { setId: true, state: true },
      }),
      this.prisma.attempt.findMany({
        where: { userId: user.id, skill: 'LISTENING', packId: { in: packIds } },
        select: { packId: true, exercise: { select: { externalId: true } } },
      }),
    ])
    const payloads = new Map<string, Record<string, unknown>>()
    // Bundled payloads first, so exercises that exist only in a pack (not in the DB) have a title.
    for (const pack of packs)
      for (const exercise of pack.seedExercises?.listening ?? [])
        if (typeof exercise['id'] === 'string')
          payloads.set(keyOf(pack.packId, exercise['id']), exercise)
    for (const row of exercises)
      payloads.set(
        keyOf(row.packId, row.externalId),
        (row.payload ?? {}) as Record<string, unknown>
      )

    const finished = new Set(
      mockAttempts
        .filter(row => Boolean((row.state as { finishedAt?: unknown } | null)?.finishedAt))
        .map(row => row.setId)
    )
    const mockIds = new Set<string>()
    const completed = new Set<string>()
    for (const set of sets) {
      for (const item of mockSetListeningExercises(set.content)) {
        const key = keyOf(set.packId, item.id)
        mockIds.add(key)
        if (!payloads.has(key)) payloads.set(key, item)
        if (finished.has(set.id)) completed.add(key)
      }
    }
    for (const attempt of attempts)
      if (attempt.exercise) completed.add(keyOf(attempt.packId, attempt.exercise.externalId))
    return { payloads, mockIds, completed }
  }

  private async readFile(absolute: string, url: string): Promise<AudioFile | null> {
    try {
      const info = await stat(absolute)
      if (!info.isFile()) return null
      return {
        url,
        absolute,
        bytes: info.size,
        mtimeMs: info.mtimeMs,
        durationSec: await wavDurationSec(absolute, info.size),
      }
    } catch {
      return null
    }
  }

  private row(
    pack: ExamPack,
    kind: 'seed' | 'generated',
    exerciseId: string,
    files: AudioFile[],
    hostPath: string,
    usage: Usage
  ): MediaAudioRowDto {
    const key = keyOf(pack.packId, exerciseId)
    const payload = usage.payloads.get(key) ?? {}
    const origin: MediaAudioOrigin = usage.mockIds.has(key) ? 'mock' : 'practice'
    return {
      id: `${kind}:${pack.packId}:${exerciseId}`,
      kind,
      packId: pack.packId,
      lang: pack.speech.ttsLang,
      level: pack.cefr,
      title: listeningDisplayTitle(payload['title'], exerciseId),
      part: listeningPartLabel(pack, payload['testingPart']),
      durationSec: Math.round(files.reduce((sum, file) => sum + file.durationSec, 0)),
      bytes: files.reduce((sum, file) => sum + file.bytes, 0),
      fileCount: files.length,
      modifiedAt: new Date(Math.max(...files.map(file => file.mtimeMs))).toISOString(),
      origin,
      completed: usage.completed.has(key),
      urls: files.map(file => file.url),
      hostPath,
    }
  }

  private async seedRows(pack: ExamPack, usage: Usage): Promise<MediaAudioRowDto[]> {
    const byExercise = new Map<string, BundledAudioSegment[]>()
    for (const segment of bundledAudioSegments(pack))
      byExercise.set(segment.exerciseId, [...(byExercise.get(segment.exerciseId) ?? []), segment])

    const rows = await mapPool(
      [...byExercise.entries()],
      STAT_CONCURRENCY,
      async ([exerciseId, segments]) => {
        const found = await Promise.all(
          segments.map(segment => {
            const absolute = containedAudioPath(this.seedRoot(), segment.path)
            return absolute ? this.readFile(absolute, segment.url) : Promise.resolve(null)
          })
        )
        const files = found.filter((file): file is AudioFile => file !== null)
        if (!files.length) return null
        const hostPath = `${this.displayRoot()}/${path.posix.dirname(segments[0]!.path)}`
        return this.row(pack, 'seed', exerciseId, files, hostPath, usage)
      }
    )
    return rows.filter((row): row is MediaAudioRowDto => row !== null)
  }

  private async generatedRows(
    user: User,
    pack: ExamPack,
    usage: Usage
  ): Promise<MediaAudioRowDto[]> {
    const prefix = `${pack.packId}:`
    const exerciseIds = [...usage.payloads.keys()]
      .filter(key => key.startsWith(prefix))
      .map(key => key.slice(prefix.length))
    const root = this.tts.audioRoot()
    const rows = await mapPool(exerciseIds, STAT_CONCURRENCY, async exerciseId => {
      const directory = packContext.run({ packId: pack.packId, userId: user.id }, () =>
        this.tts.audioDirectoryFor(exerciseId)
      )
      const absolute = containedAudioPath(root, directory)
      if (!absolute) return null
      const names = await readdir(absolute).catch(() => [] as string[])
      const wavs = names.filter(name => name.endsWith('.wav')).sort(playbackOrder)
      const found = await Promise.all(
        wavs.map(name =>
          this.readFile(path.join(absolute, name), `${GENERATED_URL_ROOT}/${directory}/${name}`)
        )
      )
      const files = found.filter((file): file is AudioFile => file !== null)
      if (!files.length) return null
      return this.row(
        pack,
        'generated',
        exerciseId,
        files,
        `${this.displayRoot()}/generated/${directory}`,
        usage
      )
    })
    return rows.filter((row): row is MediaAudioRowDto => row !== null)
  }

  /** Seed and generated listening audio across every live pack, newest first. */
  async list(user: User): Promise<MediaAudioRowDto[]> {
    const packs = listLivePacks()
    const usage = await this.usage(user, packs)
    const perPack = await Promise.all(
      packs.map(async pack => [
        ...(await this.seedRows(pack, usage)),
        ...(await this.generatedRows(user, pack, usage)),
      ])
    )
    return perPack
      .flat()
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt) || a.title.localeCompare(b.title))
  }

  async totalBytes(user: User): Promise<number> {
    return (await this.list(user)).reduce((sum, row) => sum + row.bytes, 0)
  }

  /**
   * Delete rows by id. Ids are matched against the user's own inventory, so a foreign or
   * forged id deletes nothing. Seed rows remove the pack's shared WAVs (and hash sidecars)
   * for everyone on this instance; generated rows only the user's copy.
   */
  async delete(user: User, ids: readonly string[]): Promise<MediaAudioDeleteResultDto> {
    const wanted = new Set(ids)
    const rows = (await this.list(user)).filter(row => wanted.has(row.id))
    let deletedRows = 0
    let deletedFiles = 0
    let freedBytes = 0

    for (const row of rows.filter(entry => entry.kind === 'seed')) {
      for (const url of row.urls) {
        const absolute = containedAudioPath(
          this.seedRoot(),
          url.slice(LISTENING_AUDIO_URL_ROOT.length + 1)
        )
        if (!absolute) continue
        await rm(absolute, { force: true })
        await rm(`${absolute}.hash`, { force: true })
      }
      deletedRows += 1
      deletedFiles += row.fileCount
      freedBytes += row.bytes
    }

    const generated = rows.filter(entry => entry.kind === 'generated')
    for (const packId of new Set(generated.map(row => row.packId))) {
      const packRows = generated.filter(row => row.packId === packId)
      const exerciseIds = packRows.map(row => parseMediaAudioId(row.id)!.exerciseId)
      const result = await packContext.run({ packId, userId: user.id }, () =>
        this.tts.deleteListeningAudio(exerciseIds)
      )
      if (result.error) {
        this.logger.warn(`Generated audio delete failed for ${packId}: ${result.error}`)
        continue
      }
      deletedRows += packRows.length
      deletedFiles += packRows.reduce((sum, row) => sum + row.fileCount, 0)
      freedBytes += packRows.reduce((sum, row) => sum + row.bytes, 0)
    }

    return { deletedRows, deletedFiles, freedBytes }
  }
}
