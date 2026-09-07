import { Test, type TestingModule } from '@nestjs/testing'
import { LlmController } from '../../../src/llm/llm.controller'
import { LlmService } from '../../../src/llm/llm.service'

describe('LlmController', () => {
  it('delegates health to LlmService', async () => {
    const health = jest.fn().mockResolvedValue({
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured.',
      },
      error: null,
    })
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [{ provide: LlmService, useValue: { health } }],
    }).compile()

    const controller = module.get(LlmController)
    await expect(controller.health()).resolves.toEqual({
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured.',
      },
      error: null,
    })
    expect(health).toHaveBeenCalledTimes(1)
  })
})
