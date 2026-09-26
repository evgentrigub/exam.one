export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function extractJsonArray(rawText: string): unknown[] | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1

  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      try {
        const parsed: unknown = JSON.parse(candidate)
        if (Array.isArray(parsed)) return parsed
      } catch {
        // fall through to bracket scan
      }
    }
  }

  const firstBracket = rawText.indexOf('[')
  if (firstBracket < 0) return null

  for (let j = rawText.length - 1; j > firstBracket; j--) {
    if (rawText[j] !== ']') continue
    const candidate = rawText.slice(firstBracket, j + 1)
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // continue trying shorter tails
    }
  }

  return null
}

/**
 * Pull a single JSON object out of a model response.
 *
 * Models wrap JSON in prose or a ``` fence often enough that a bare `JSON.parse` is not
 * safe. Mirrors `extractJsonArray`: prefer a fenced block, then scan inward from the first
 * `{` for the longest tail that parses.
 */
export function extractJsonObject(rawText: string): Record<string, unknown> | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1

  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      try {
        const parsed: unknown = JSON.parse(rawText.slice(fenceStart, fenceEnd).trim())
        if (isRecord(parsed)) return parsed
      } catch {
        // fall through to brace scan
      }
    }
  }

  const firstBrace = rawText.indexOf('{')
  if (firstBrace < 0) return null

  for (let j = rawText.length - 1; j > firstBrace; j--) {
    if (rawText[j] !== '}') continue
    try {
      const parsed: unknown = JSON.parse(rawText.slice(firstBrace, j + 1))
      if (isRecord(parsed)) return parsed
    } catch {
      // continue trying shorter tails
    }
  }

  return null
}
