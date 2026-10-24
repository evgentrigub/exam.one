import { requireJwtSecret, requireSecretsKey } from '../../../src/config/app.config'

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

describe('requireSecretsKey', () => {
  const validKey = Buffer.alloc(32, 7).toString('base64')

  it('rejects a missing key', () => {
    expect(() => requireSecretsKey(undefined)).toThrow(/SECRETS_ENCRYPTION_KEY is not set/)
    expect(() => requireSecretsKey('  ')).toThrow(/SECRETS_ENCRYPTION_KEY is not set/)
  })

  it('rejects a key that does not decode to 32 bytes', () => {
    expect(() => requireSecretsKey(Buffer.alloc(16).toString('base64'))).toThrow(/32 bytes/)
    expect(() => requireSecretsKey('not base64 at all!')).toThrow(/32 bytes/)
  })

  it('accepts a base64 key of 32 bytes', () => {
    expect(requireSecretsKey(` ${validKey} `)).toBe(validKey)
  })
})
