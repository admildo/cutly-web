import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'

// Creator keys are stored encrypted. The encryption key is derived from the desktop auth signing secret,
// as trial device claims are, so the deployment needs no extra secret.
const cipherKey = () => {
  const secret = process.env.DESKTOP_AUTH_SIGNING_KEY
  if (!secret) throw new Error('DESKTOP_AUTH_SIGNING_KEY is required to protect creator keys.')
  return createHmac('sha256', secret).update('cutly-creator-key-encryption:v1').digest()
}

export const encryptCreatorKey = (plaintext) => {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', cipherKey(), iv)
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url')
}

export const decryptCreatorKey = (ciphertext) => {
  const data = Buffer.from(ciphertext, 'base64url')
  const decipher = createDecipheriv('aes-256-gcm', cipherKey(), data.subarray(0, 12))
  decipher.setAuthTag(data.subarray(12, 28))
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8')
}
