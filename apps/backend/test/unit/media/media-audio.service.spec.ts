import { mkdtemp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { ConfigService } from '@nestjs/config'
import type { PrismaService } from '@exam-one/nestjs-libraries'
import { bundledAudioSegments, getPack } from '@exam-one/exam-packs'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'
import { MediaAudioService, parseMediaAudioId } from '../../../src/media/media-audio.service'
import { TtsService } from '../../../src/speech/tts/tts.service'
import { makeUser } from '../../../src/testing/fixtures'

const PACK_ID = 'cambridge-en-a2'
const BYTE_RATE = 48_000 // 24 kHz, 16-bit mono

/** A minimal PCM WAV of `seconds` seconds. */
function wav(seconds: number): Buffer {
  const dataBytes = Math.round(BYTE_RATE * seconds)
  const header = Buffer.alloc(44)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(36 + dataBytes, 4)
  header.write('WAVE', 8, 'ascii')
  header.write('fmt ', 12, 'ascii')
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(24_000, 24)
  header.writeUInt32LE(BYTE_RATE, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36, 'ascii')
  header.writeUInt32LE(dataBytes, 40)
  return Buffer.concat([header, Buffer.alloc(dataBytes)])
}

async function put(file: string, seconds: number): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, wav(seconds))
}

describe('MediaAudioService', () => {
  const user = makeUser({ id: 'user-1' })
  const pack = getPack(PACK_ID)!
  const seedSegments = bundledAudioSegments(pack)
  const seedExerciseId = seedSegments[0]!.exerciseId
  const seedFiles = seedSegments.filter(segment => segment.exerciseId === seedExerciseId)
  const practiceId = 'listening-key-part1-001'

  let root: string
  let generatedRoot: string
  let service: MediaAudioService
  let tts: TtsService
  const prisma = {
    exercise: { findMany: jest.fn() },
    mockExamSet: { findMany: jest.fn() },
    mockExamAttempt: { findMany: jest.fn() },
    attempt: { findMany: jest.fn() },
    setting: { findUnique: jest.fn() },
  }

  const generatedDir = (userId: string, exerciseId: string): string =>
    packContext.run({ packId: PACK_ID, userId }, () => tts.audioDirectoryFor(exerciseId))

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'exam-one-media-'))
    generatedRoot = path.join(root, 'generated')
    const values: Record<string, string> = {
      'app.SEED_LISTENING_AUDIO_DIR': root,
      'app.GENERATED_LISTENING_AUDIO_DIR': generatedRoot,
      'app.AUDIO_HOST_DISPLAY_ROOT': 'apps/frontend/public/audio/listening',
      'app.TTS_BASE_URL': 'http://tts.test',
    }
    const config = {
      get: jest.fn((key: string) => values[key]),
      getOrThrow: jest.fn((key: string) => {
        if (!(key in values)) throw new Error(key)
        return values[key]
      }),
    } as unknown as ConfigService
    tts = new TtsService(config, prisma as unknown as PrismaService)
    service = new MediaAudioService(config, prisma as unknown as PrismaService, tts)

    prisma.exercise.findMany.mockResolvedValue([
      {
        packId: PACK_ID,
        externalId: practiceId,
        payload: { id: practiceId, title: 'Part 1: Short conversations', testingPart: 1 },
      },
    ])
    prisma.mockExamSet.findMany.mockResolvedValue([
      {
        id: 'set-1',
        packId: PACK_ID,
        content: { listening: [{ id: seedExerciseId, title: 'Part 2: Notes', testingPart: 2 }] },
      },
    ])
    prisma.mockExamAttempt.findMany.mockResolvedValue([
      { setId: 'set-1', state: { finishedAt: '2026-10-01T10:00:00.000Z' } },
    ])
    prisma.attempt.findMany.mockResolvedValue([
      { packId: PACK_ID, exercise: { externalId: practiceId } },
    ])

    for (const segment of seedFiles) await put(path.join(root, segment.path), 1)
    await put(path.join(generatedRoot, generatedDir('user-1', practiceId), 'item-1.wav'), 2)
    await put(path.join(generatedRoot, generatedDir('user-1', practiceId), 'item-0.wav'), 1.5)
    // Another user's copy of the same exercise must never show up.
    await put(path.join(generatedRoot, generatedDir('user-2', practiceId), 'item-0.wav'), 3)
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('lists shared seed audio and the user own generated audio, one row per exercise', async () => {
    const rows = await service.list(user)
    expect(rows).toHaveLength(2)

    const seed = rows.find(row => row.kind === 'seed')!
    expect(seed).toMatchObject({
      id: `seed:${PACK_ID}:${seedExerciseId}`,
      packId: PACK_ID,
      lang: 'en',
      level: 'A2',
      origin: 'mock',
      completed: true,
      fileCount: seedFiles.length,
      durationSec: seedFiles.length,
      urls: seedFiles.map(segment => segment.url),
    })
    expect(seed.hostPath).toBe(
      `apps/frontend/public/audio/listening/${path.posix.dirname(seedFiles[0]!.path)}`
    )

    const generated = rows.find(row => row.kind === 'generated')!
    expect(generated).toMatchObject({
      id: `generated:${PACK_ID}:${practiceId}`,
      title: 'Short conversations',
      part: 'Part 1',
      origin: 'practice',
      completed: true,
      fileCount: 2,
      durationSec: 4,
    })
    expect(generated.urls.map(url => url.split('/').pop())).toEqual(['item-0.wav', 'item-1.wav'])
    expect(generated.bytes).toBe(wav(1.5).length + wav(2).length)
  })

  it('marks exercises without a submitted attempt or finished mock as not completed', async () => {
    prisma.mockExamAttempt.findMany.mockResolvedValue([
      { setId: 'set-1', state: { finishedAt: null } },
    ])
    prisma.attempt.findMany.mockResolvedValue([])
    const rows = await service.list(user)
    expect(rows.every(row => !row.completed)).toBe(true)
  })

  it('sums the bytes of every listed row', async () => {
    const rows = await service.list(user)
    await expect(service.totalBytes(user)).resolves.toBe(
      rows.reduce((sum, row) => sum + row.bytes, 0)
    )
  })

  it('deletes the user generated copy and leaves other users alone', async () => {
    const result = await service.delete(user, [`generated:${PACK_ID}:${practiceId}`])
    expect(result).toEqual({
      deletedRows: 1,
      deletedFiles: 2,
      freedBytes: wav(1.5).length + wav(2).length,
    })
    await expect(
      stat(path.join(generatedRoot, generatedDir('user-1', practiceId)))
    ).rejects.toThrow()
    await expect(
      stat(path.join(generatedRoot, generatedDir('user-2', practiceId), 'item-0.wav'))
    ).resolves.toBeTruthy()
  })

  it('deletes shared seed WAVs and their hash sidecars but keeps the folder', async () => {
    const first = path.join(root, seedFiles[0]!.path)
    await writeFile(`${first}.hash`, 'abc')
    const result = await service.delete(user, [`seed:${PACK_ID}:${seedExerciseId}`])
    expect(result.deletedRows).toBe(1)
    expect(result.deletedFiles).toBe(seedFiles.length)
    await expect(readdir(path.dirname(first))).resolves.toEqual([])
  })

  it('ignores forged and foreign ids', async () => {
    const result = await service.delete(user, [
      `generated:${PACK_ID}:../../etc/passwd`,
      `seed:${PACK_ID}:not-a-seed`,
      'generated:unknown-pack:x',
      'garbage',
    ])
    expect(result).toEqual({ deletedRows: 0, deletedFiles: 0, freedBytes: 0 })
    expect(await service.list(user)).toHaveLength(2)
  })

  it('parses row ids whose exercise id contains colons', () => {
    expect(parseMediaAudioId('generated:p:a:b')).toEqual({
      kind: 'generated',
      packId: 'p',
      exerciseId: 'a:b',
    })
    expect(parseMediaAudioId('seed:p')).toBeNull()
  })
})
