export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
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

export function extractJsonObject(rawText: string): unknown | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1
  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      try {
        return JSON.parse(candidate) as unknown
      } catch {
        // fall through
      }
    }
  }

  const firstBrace = rawText.indexOf('{')
  if (firstBrace < 0) return null
  for (let j = rawText.length - 1; j > firstBrace; j--) {
    if (rawText[j] !== '}') continue
    try {
      return JSON.parse(rawText.slice(firstBrace, j + 1)) as unknown
    } catch {
      // try a shorter candidate
    }
  }
  return null
}
