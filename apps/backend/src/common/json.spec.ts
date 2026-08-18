import { asJson, payloadId } from './json'

describe('asJson', () => {
  it('returns a plain JSON clone', () => {
    const original = { id: 'a', nested: { n: 1 } }
    const cloned = asJson(original) as { id: string; nested: { n: number } }

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    cloned.nested.n = 2
    expect(original.nested.n).toBe(1)
  })

  it('drops undefined object properties', () => {
    expect(asJson({ id: 'a', skip: undefined })).toEqual({ id: 'a' })
  })
})

describe('payloadId', () => {
  it('returns a non-empty string id', () => {
    expect(payloadId({ id: 'ex-1', title: 'Hi' })).toBe('ex-1')
  })

  it('rejects missing, empty, non-string, array, and null payloads', () => {
    expect(payloadId(null)).toBeNull()
    expect(payloadId(undefined)).toBeNull()
    expect(payloadId(['id'])).toBeNull()
    expect(payloadId({ title: 'no id' })).toBeNull()
    expect(payloadId({ id: '' })).toBeNull()
    expect(payloadId({ id: 12 })).toBeNull()
  })
})
