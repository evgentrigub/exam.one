import { rateLimitMultiplier } from '../../../src/core/guards/scaled-throttler.guard'

describe('rateLimitMultiplier', () => {
  it('defaults to 1 so production limits are unchanged', () => {
    expect(rateLimitMultiplier(undefined)).toBe(1)
    expect(rateLimitMultiplier('')).toBe(1)
  })

  it('accepts a whole number of at least 1', () => {
    expect(rateLimitMultiplier('1')).toBe(1)
    expect(rateLimitMultiplier(' 100 ')).toBe(100)
  })

  it('falls back to 1 for invalid values', () => {
    expect(rateLimitMultiplier('0')).toBe(1)
    expect(rateLimitMultiplier('-5')).toBe(1)
    expect(rateLimitMultiplier('2.5')).toBe(1)
    expect(rateLimitMultiplier('lots')).toBe(1)
    expect(rateLimitMultiplier('Infinity')).toBe(1)
  })
})
