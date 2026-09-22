import { getPack } from '@exam-one/exam-packs'

const missingKey =
  'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.'

describe('pack reading generation', () => {
  const runner = getPack('goethe-de-a2')!.compatibilityAi!

  it('returns a business error when no LLM key is configured', async () => {
    await expect(
      runner.generateReading({ difficulty: 'A2', prompts: [{ part: 1, prompt: 'Write a text' }] }, async () => {
        throw new Error(missingKey)
      })
    ).resolves.toEqual({ data: null, error: missingKey })
  })

  it('returns a parse error when the model output is not a reading exercise array', async () => {
    await expect(
      runner.generateReading({ difficulty: 'A2', prompts: [{ part: 1, prompt: 'Write a text' }] }, async () => 'not json')
    ).resolves.toEqual({
      data: null,
      error: 'Failed to parse reading exercises from AI response. Please try again.',
    })
  })
})
