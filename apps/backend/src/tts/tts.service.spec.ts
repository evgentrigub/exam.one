import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { TtsService } from './tts.service'
import * as adapter from './tts.adapter'

jest.mock('./tts.adapter', () => ({
  checkTtsHealth: jest.fn(),
  synthesizeListeningTranscript: jest.fn(),
}))

const checkTtsHealth = adapter.checkTtsHealth as jest.MockedFunction<typeof adapter.checkTtsHealth>

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
  })

  it('reports offline health without throwing', async () => {
    checkTtsHealth.mockResolvedValue(false)
    const service = await createService()
    await expect(service.health()).resolves.toEqual({ data: { ok: false }, error: null })
  })

  it('ignores invalid ids when deleting generated audio', async () => {
    const service = await createService()
    await expect(service.deleteListeningAudio(['../etc/passwd', 'not-an-id'])).resolves.toEqual({
      data: { deleted: 0 },
      error: null,
    })
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
        items: [],
      })
    ).resolves.toEqual({
      data: null,
      error: 'TTS is offline. Start it with `pnpm tts:up`, then try Generate audio again.',
    })
  })
})
