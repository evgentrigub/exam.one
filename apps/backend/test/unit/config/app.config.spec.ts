import { requireJwtSecret } from '../../../src/config/app.config'

describe('requireJwtSecret', () => {
  it('rejects a missing secret', () => {
    expect(() => requireJwtSecret(undefined)).toThrow(/JWT_SECRET is not set/)
    expect(() => requireJwtSecret('   ')).toThrow(/JWT_SECRET is not set/)
  })

  it('rejects a secret shorter than 32 characters', () => {
    expect(() => requireJwtSecret('short-dev-secret')).toThrow(/at least 32/)
  })

  it('rejects the documented placeholder', () => {
    expect(() => requireJwtSecret('change-me-in-production')).toThrow(/placeholder/)
  })

  it('accepts a long random secret', () => {
    expect(requireJwtSecret('a-sufficiently-long-jwt-secret-ok')).toBe(
      'a-sufficiently-long-jwt-secret-ok'
    )
  })
})
