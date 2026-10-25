import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const FORMAT_VERSION = 'v1'
const IV_BYTES = 12
const TAG_BYTES = 16

function keyBuffer(base64Key: string): Buffer {
  return Buffer.from(base64Key, 'base64')
}

/**
 * Seals a secret as `v1:<iv>:<tag>:<ciphertext>` (base64 parts) with AES-256-GCM. `context`
 * (for example `userId:provider`) is authenticated but not stored, so a sealed value only opens
 * for the row it was written for.
 */
export function encryptSecret(plaintext: string, base64Key: string, context = ''): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, keyBuffer(base64Key), iv, { authTagLength: TAG_BYTES })
  cipher.setAAD(Buffer.from(context, 'utf8'))
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    FORMAT_VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    data.toString('base64'),
  ].join(':')
}

/** Opens a value from `encryptSecret`; throws when the key is wrong or the value was altered. */
export function decryptSecret(sealed: string, base64Key: string, context = ''): string {
  const [version, ivPart, tagPart, data] = sealed.split(':')
  const iv = Buffer.from(ivPart ?? '', 'base64')
  const tag = Buffer.from(tagPart ?? '', 'base64')
  if (version !== FORMAT_VERSION || iv.length !== IV_BYTES || tag.length !== TAG_BYTES || !data) {
    throw new Error('Unsupported secret format.')
  }
  const decipher = createDecipheriv(ALGORITHM, keyBuffer(base64Key), iv, {
    authTagLength: TAG_BYTES,
  })
  decipher.setAAD(Buffer.from(context, 'utf8'))
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString(
    'utf8'
  )
}
