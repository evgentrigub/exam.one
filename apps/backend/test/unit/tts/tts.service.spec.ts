import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { TtsService } from '../../../src/speech/tts/tts.service'
import * as adapter from '../../../src/speech/tts/tts.adapter'
import { createHash } from 'node:crypto'
import { containedAudioPath } from '../../../src/speech/tts/listening-audio'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

jest.mock('../../../src/speech/tts/tts.adapter', () => ({
  ttsHealthStatus: jest.fn(),
  synthesizeListeningTranscript: jest.fn(),
}))

const ttsHealthStatus = adapter.ttsHealthStatus as jest.MockedFunction<typeof adapter.ttsHealthStatus>
const synthesizeListeningTranscript = adapter.synthesizeListeningTranscript as jest.MockedFunction<
  typeof adapter.synthesizeListeningTranscript
>

describe('TtsService', () => {
  async function createService(env: Record<string, string> = {}) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key.slice(4) in env) return env[key.slice(4)]
              if (key === 'app.TTS_VOICE') return 'martin'
              if (key === 'app.TTS_SPEED') return 1
              if (key === 'app.TTS_LANG') return 'de'
              if (key === 'app.TTS_TURN_PAUSE_MS') return 350
              if (key === 'app.TTS_CONCURRENCY') return 3
              return undefined
            }),
            getOrThrow: jest.fn((key: string) => {
              if (key === 'app.TTS_BASE_URL') return 'http://127.0.0.1:8881'
              if (key === 'app.GENERATED_LISTENING_AUDIO_DIR') return '/tmp/exam-one-audio'
              throw new Error(key)
            }),
          },
        },
      ],
    }).compile()
    return module.get(TtsService)
  }

  beforeEach(() => {
    ttsHealthStatus.mockReset()
    synthesizeListeningTranscript.mockReset()
  })

  it('reports offline health without throwing', async () => {
    ttsHealthStatus.mockResolvedValue('offline')
    const service = await createService()
    await expect(service.health()).resolves.toEqual({
      data: { ok: false, reason: 'offline' },
      error: null,
    })
  })

  it('reports an English pack as unsupported on a German-only instance', async () => {
    ttsHealthStatus.mockResolvedValue('ok')
    const service = await createService()
    const health = await packContext.run({ packId: 'cambridge-en-a2' }, () => service.health())
    expect(health.data).toEqual({ ok: false, reason: 'unsupported' })
    expect(ttsHealthStatus).not.toHaveBeenCalled()
  })

  it('serves an English pack when the instance lists English and its voices', async () => {
    ttsHealthStatus.mockResolvedValue('ok')
    const service = await createService({
      TTS_LANGUAGES: 'de,en',
      TTS_VOICES: 'martin,bernd,victoria,eva,bf_emma,bm_george,bf_isabella,bm_fable',
    })
    const health = await packContext.run({ packId: 'cambridge-en-a2' }, () => service.health())
    expect(health).toEqual({ data: { ok: true }, error: null })
    const config = ttsHealthStatus.mock.calls[0]![0]
    expect(config).toMatchObject({ lang: 'en', voice: 'bf_emma' })
    expect(config.voices?.map(voice => voice.id)).toEqual(['bf_emma', 'bm_george', 'bf_isabella', 'bm_fable'])
  })

  it('reports a server without the pack voices as unsupported', async () => {
    ttsHealthStatus.mockResolvedValue('unsupported')
    const service = await createService({ TTS_LANGUAGES: 'de,en', TTS_VOICES: 'bf_emma,bm_george,bf_isabella,bm_fable' })
    const health = await packContext.run({ packId: 'cambridge-en-a2' }, () => service.health())
    expect(health.data).toEqual({ ok: false, reason: 'unsupported' })
    expect(health.error).toContain('voices')
  })

  it('skips empty ids and cannot delete outside the audio root', async () => {
    const service = await createService()
    await expect(service.deleteListeningAudio(['', '   '.trim()])).resolves.toEqual({
      data: { deleted: 0 },
      error: null,
    })
    // A traversal id is neutralised by hashing rather than rejected by pattern: whatever it
    // resolves to still lives inside the configured root.
    const digest = createHash('sha256')
      .update(JSON.stringify(['goethe-de-a2', undefined, '../../etc/passwd']))
      .digest('hex')
    expect(containedAudioPath('/tmp/exam-one-audio', digest)).toContain('/tmp/exam-one-audio/')
  })

  it('returns a business error when TTS is offline', async () => {
    ttsHealthStatus.mockResolvedValue('offline')
    const service = await createService()
    await expect(
      service.generateListeningAudio({
        id: 'listening-a2-part1-abc',
        title: 'Teil 1',
        testingPart: 1,
        difficulty: 'A2',
        items: Array.from({ length: 5 }, (_, index) => ({
          id: `listening-a2-part1-abc-i${index + 1}`,
          context: 'c',
          transcript: 'Hallo',
          question: 'Q',
          options: ['a', 'b', 'c'],
          correctAnswer: 0,
          explanation: 'e',
        })),
      })
    ).resolves.toEqual({
      data: null,
      error: 'TTS is offline. Start it with `pnpm tts:up`, then try Generate audio again.',
    })
  })

  it('never lets an exercise id reach the audio path', async () => {
    ttsHealthStatus.mockResolvedValue('ok')
    synthesizeListeningTranscript.mockResolvedValue(Buffer.from('RIFF'))
    const service = await createService()
    const response = await service.generateListeningAudio({
      id: '../../tmp/x',
      title: 'Teil 1',
      testingPart: 1,
      difficulty: 'A2',
      items: Array.from({ length: 5 }, (_, index) => ({
        id: `i${index + 1}`,
        context: 'c',
        transcript: 'Hallo',
        question: 'Q',
        options: ['a', 'b', 'c'],
        correctAnswer: 0,
        explanation: 'e',
      })),
    })
    // The id is hashed into the directory name, so traversal is impossible by construction
    // rather than rejected by pattern: no emitted url may contain the raw id.
    const urls = Object.values(response.data?.audio.items ?? {})
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url).not.toContain('..')
      expect(url).toMatch(/^\/audio\/listening\/generated\/[0-9a-f]{64}\/item-\d+\.wav$/)
    }
  })

  it('keeps generated audio paths inside the configured root', () => {
    const root = '/tmp/exam-one-audio'
    // The shape the service actually writes: a sha256 directory, then a positional file.
    const digest = 'a'.repeat(64)
    expect(containedAudioPath(root, `${digest}/item-0.wav`)).toBe(
      `/tmp/exam-one-audio/${digest}/item-0.wav`
    )
    expect(containedAudioPath(root, `${digest}/shared.wav`)).toBe(
      `/tmp/exam-one-audio/${digest}/shared.wav`
    )
    expect(containedAudioPath(root, '../etc/passwd')).toBeNull()
    expect(containedAudioPath(root, '/tmp/escaped.wav')).toBeNull()
    expect(containedAudioPath(root, `${digest}/../secret.wav`)).toBeNull()
  })
})
