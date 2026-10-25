import { decryptSecret, encryptSecret } from '../../../../src/common/crypto/secret-box'

const KEY = Buffer.alloc(32, 1).toString('base64')
const OTHER_KEY = Buffer.alloc(32, 2).toString('base64')

describe('secret-box', () => {
  it('round-trips a secret', () => {
    const sealed = encryptSecret('sk-or-v1-secret-value', KEY)
    expect(decryptSecret(sealed, KEY)).toBe('sk-or-v1-secret-value')
  })

  it('binds the value to its context, so it cannot be moved to another row', () => {
    const sealed = encryptSecret('sk-secret', KEY, 'user-1:openai')
    expect(decryptSecret(sealed, KEY, 'user-1:openai')).toBe('sk-secret')
    expect(() => decryptSecret(sealed, KEY, 'user-2:openai')).toThrow()
  })

  it('rejects a truncated auth tag', () => {
    const [version, iv, tag, data] = encryptSecret('sk-secret', KEY).split(':')
    const shortTag = Buffer.from(tag ?? '', 'base64')
      .subarray(0, 4)
      .toString('base64')
    expect(() => decryptSecret([version, iv, shortTag, data].join(':'), KEY)).toThrow(/format/)
  })

  it('never stores the plaintext and uses a fresh IV each time', () => {
    const first = encryptSecret('sk-secret', KEY)
    const second = encryptSecret('sk-secret', KEY)
    expect(first).toMatch(/^v1:/)
    expect(first).not.toContain('sk-secret')
    expect(first).not.toBe(second)
  })

  it('fails on a tampered ciphertext', () => {
    const [version, iv, tag, data] = encryptSecret('sk-secret', KEY).split(':')
    const flipped = Buffer.from(data ?? '', 'base64')
    flipped[0] = (flipped[0] ?? 0) ^ 0xff
    expect(() =>
      decryptSecret([version, iv, tag, flipped.toString('base64')].join(':'), KEY)
    ).toThrow()
  })

  it('fails with the wrong key', () => {
    expect(() => decryptSecret(encryptSecret('sk-secret', KEY), OTHER_KEY)).toThrow()
  })

  it('rejects an unknown format', () => {
    expect(() => decryptSecret('plain-text', KEY)).toThrow(/format/)
  })
})
