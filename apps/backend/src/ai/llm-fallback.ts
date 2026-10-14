// 402: OpenRouter credits ran out, so a configured free model can still answer.
const RETRYABLE_STATUS = new Set([402, 404, 408, 409, 429])
const CONNECTION_ERROR_NAMES = new Set(['APIConnectionError', 'APIConnectionTimeoutError', 'AbortError', 'TimeoutError'])

function statusOf(error: unknown): number | undefined {
  const status = (error as { status?: unknown } | null)?.status
  return typeof status === 'number' ? status : undefined
}

/** Rate limits, unknown or unavailable models, server errors and network failures are worth another model. */
export function isRetryableLlmError(error: unknown): boolean {
  const status = statusOf(error)
  if (status !== undefined) return RETRYABLE_STATUS.has(status) || status >= 500
  // The openai SDK leaves `name` as 'Error' on its connection errors; its class name tells them apart.
  return error instanceof Error && (CONNECTION_ERROR_NAMES.has(error.name) || CONNECTION_ERROR_NAMES.has(error.constructor.name))
}

/** Tries each model in order; moves on only for errors another model could avoid. */
export async function runWithFallback<T>(
  models: string[],
  attempt: (model: string) => Promise<T>,
  onSwitch?: (from: string, to: string, error: unknown) => void
): Promise<T> {
  let lastError: unknown = new Error('No model configured.')
  for (const [index, model] of models.entries()) {
    try {
      return await attempt(model)
    } catch (error: unknown) {
      lastError = error
      const next = models[index + 1]
      if (!next || !isRetryableLlmError(error)) throw error
      onSwitch?.(model, next, error)
    }
  }
  throw lastError
}
