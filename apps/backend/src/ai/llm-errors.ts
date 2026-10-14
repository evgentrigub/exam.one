const REDACTED = '[redacted]'
// sk-… (OpenAI, Anthropic, OpenRouter), xai-…, and Google AIza… key shapes.
const KEY_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{6,}|xai-[A-Za-z0-9_-]{6,}|AIza[A-Za-z0-9_-]{10,})/g

/** Removes the user's key, and anything shaped like a provider key, from provider error text. */
export function redactSecrets(text: string, apiKey: string): string {
  const withoutKey = apiKey ? text.split(apiKey).join(REDACTED) : text
  return withoutKey.replace(KEY_PATTERN, REDACTED)
}

/** Same error with a redacted message; keeps `status` and `name`, which fallback decisions read. */
export function redactLlmError(error: unknown, apiKey: string): Error {
  if (!(error instanceof Error)) return new Error('Unknown LLM error')
  const redacted = new Error(redactSecrets(error.message, apiKey))
  // SDK error classes do not set `name`; keep the class name so fallback can still classify it.
  redacted.name = error.name === 'Error' ? error.constructor.name : error.name
  const status = (error as { status?: unknown }).status
  return typeof status === 'number' ? Object.assign(redacted, { status }) : redacted
}
