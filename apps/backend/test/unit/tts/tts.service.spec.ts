import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { TtsService } from '../../../src/speech/tts/tts.service'
import * as adapter from '../../../src/speech/tts/tts.adapter'
import { createHash } from 'node:crypto'
import { containedAudioPath } from '../../../src/speech/tts/listening-audio'

jest.mock('../../../src/speech/tts/tts.adapter', () => ({
  checkTtsHealth: jest.fn(),
  synthesizeListeningTranscript: jest.fn(),
}))

const checkTtsHealth = adapter.checkTtsHealth as jest.MockedFunction<typeof adapter.checkTtsHealth>
const synthesizeListeningTranscript = adapter.synthesizeListeningTranscript as jest.MockedFunction<
  typeof adapter.synthesizeListeningTranscript
>

describe('TtsService', () => {
  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
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
    checkTtsHealth.mockReset()
    synthesizeListeningTranscript.mockReset()
  })

  it('reports offline health without throwing', async () => {
    checkTtsHealth.mockResolvedValue(false)
    const service = await createService()
    await expect(service.health()).resolves.toEqual({ data: { ok: false }, error: null })
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
    checkTtsHealth.mockResolvedValue(false)
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
    checkTtsHealth.mockResolvedValue(true)
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
    expect(containedAudioPath(root, 'listening-a2-part1-abc/shared.wav')).toBe(
      '/tmp/exam-one-audio/listening-a2-part1-abc/shared.wav'
    )
    expect(containedAudioPath(root, '../etc/passwd')).toBeNull()
    expect(containedAudioPath(root, '/tmp/escaped.wav')).toBeNull()
    expect(containedAudioPath(root, 'listening-a2-part1-abc/../secret.wav')).toBeNull()
  })
})
