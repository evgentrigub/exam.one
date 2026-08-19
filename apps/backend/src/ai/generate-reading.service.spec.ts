import { Test, type TestingModule } from '@nestjs/testing'
import { GenerateReadingService } from './generate-reading.service'
import { LlmService } from '../llm/llm.service'

describe('GenerateReadingService', () => {
  it('returns a business error when no LLM key is configured', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReadingService,
        {
          provide: LlmService,
          useValue: {
            getConfig: () => null,
            missingKeyError: () =>
              'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.',
          },
        },
      ],
    }).compile()

    const service = module.get(GenerateReadingService)
    await expect(
      service.generate({ difficulty: 'A2', prompts: [{ part: 1, prompt: 'Write a text' }] })
    ).resolves.toEqual({
      data: null,
      error:
        'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.',
    })
  })

  it('returns a parse error when the model output is not a reading exercise array', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReadingService,
        {
          provide: LlmService,
          useValue: {
            getConfig: () => ({ provider: 'openrouter', apiKey: 'sk', model: 'test' }),
            missingKeyError: () => 'missing',
            complete: jest.fn().mockResolvedValue('not json'),
          },
        },
      ],
    }).compile()

    const service = module.get(GenerateReadingService)
    await expect(
      service.generate({ difficulty: 'A2', prompts: [{ part: 1, prompt: 'Write a text' }] })
    ).resolves.toEqual({
      data: null,
      error: 'Failed to parse reading exercises from AI response. Please try again.',
    })
  })
})
