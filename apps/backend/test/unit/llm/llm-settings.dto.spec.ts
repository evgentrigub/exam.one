import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  LlmProviderParamDto,
  SaveLlmKeyDto,
  UpdateLlmSettingsDto,
} from '../../../src/ai/dto/llm-settings.dto'

async function errorsOf<T extends object>(cls: new () => T, body: object): Promise<string[]> {
  const errors = await validate(plainToInstance(cls, body))
  return errors.map(error => error.property)
}

describe('LLM settings DTOs', () => {
  it('accepts only the five supported providers', async () => {
    await expect(errorsOf(LlmProviderParamDto, { provider: 'xai' })).resolves.toEqual([])
    await expect(errorsOf(LlmProviderParamDto, { provider: 'deepseek' })).resolves.toEqual([
      'provider',
    ])
  })

  it('rejects short keys and keys with inner spaces', async () => {
    await expect(errorsOf(SaveLlmKeyDto, { apiKey: 'sk-or-v1-abcdef' })).resolves.toEqual([])
    await expect(errorsOf(SaveLlmKeyDto, { apiKey: 'short' })).resolves.toEqual(['apiKey'])
    await expect(errorsOf(SaveLlmKeyDto, { apiKey: 'sk-or v1-abcdef' })).resolves.toEqual([
      'apiKey',
    ])
    await expect(errorsOf(SaveLlmKeyDto, { apiKey: 'sk-or-v1-ключ-abc' })).resolves.toEqual([
      'apiKey',
    ])
    await expect(errorsOf(SaveLlmKeyDto, { apiKey: '  sk-or-v1-abcdef  ' })).resolves.toEqual([])
  })

  it('limits fallbacks to three and checks the effort value', async () => {
    const base = { provider: 'openai', model: 'gpt-x' }
    await expect(
      errorsOf(UpdateLlmSettingsDto, {
        ...base,
        fallbackModels: ['a', 'b', 'c'],
        reasoningEffort: 'low',
      })
    ).resolves.toEqual([])
    await expect(
      errorsOf(UpdateLlmSettingsDto, { ...base, fallbackModels: ['a', 'b', 'c', 'd'] })
    ).resolves.toEqual(['fallbackModels'])
    await expect(
      errorsOf(UpdateLlmSettingsDto, { ...base, reasoningEffort: 'extreme' })
    ).resolves.toEqual(['reasoningEffort'])
    await expect(
      errorsOf(UpdateLlmSettingsDto, { provider: 'openai', model: '' })
    ).resolves.toEqual(['model'])
    await expect(
      errorsOf(UpdateLlmSettingsDto, { provider: 'openai', model: '   ' })
    ).resolves.toEqual(['model'])
    await expect(
      errorsOf(UpdateLlmSettingsDto, { ...base, fallbackModels: ['ok', '  '] })
    ).resolves.toEqual(['fallbackModels'])
  })
})
