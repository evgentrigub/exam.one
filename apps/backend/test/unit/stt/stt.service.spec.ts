import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { SttService } from '../../../src/stt/stt.service'

describe('SttService', () => {
  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SttService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.STT_PROVIDER') return 'local'
              if (key === 'app.STT_BASE_URL') return 'http://127.0.0.1:8882'
              return ''
            }),
          },
        },
      ],
    }).compile()
    return module.get(SttService)
  }

  it('returns a business error when no audio file is uploaded', async () => {
    const service = await createService()
    await expect(service.transcribe(undefined)).resolves.toEqual({
      data: null,
      error: 'No audio recording was provided.',
    })
  })

  it('returns a business error when the recording is empty', async () => {
    const service = await createService()
    await expect(
      service.transcribe({ buffer: Buffer.alloc(0), size: 0, originalname: 'speaking.webm' })
    ).resolves.toEqual({
      data: null,
      error: 'No audio recording was provided.',
    })
  })

  it('returns a business error for a disallowed MIME type', async () => {
    const service = await createService()
    await expect(
      service.transcribe({
        buffer: Buffer.from('not-audio'),
        size: 9,
        originalname: 'payload.exe',
        mimetype: 'application/octet-stream',
      })
    ).resolves.toEqual({
      data: null,
      error: 'Unsupported audio type. Use webm, wav, mp3, ogg, or m4a.',
    })
  })
})
