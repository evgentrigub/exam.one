import { Test, type TestingModule } from '@nestjs/testing'
import { LlmController } from '../../../src/ai/llm.controller'
import { LlmService } from '../../../src/ai/llm.service'
import { makeUser } from '../../../src/testing/fixtures'

describe('LlmController', () => {
  it("delegates health to LlmService for the current user", async () => {
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
    const user = makeUser({ id: 'user-42' })
    await expect(controller.health(user)).resolves.toEqual({
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured.',
      },
      error: null,
    })
    expect(health).toHaveBeenCalledWith('user-42')
  })
})
