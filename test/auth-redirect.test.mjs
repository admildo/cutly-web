import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeInternalReturnPath } from '../lib/auth-redirect.js'

test('keeps the purchase intent through sign-in', () => {
  assert.equal(normalizeInternalReturnPath('/dashboard?buy=1'), '/dashboard?buy=1')
  assert.equal(normalizeInternalReturnPath('/dashboard?checkout=success'), '/dashboard?checkout=success')
})

test('rejects external and auth-loop destinations', () => {
  assert.equal(normalizeInternalReturnPath('//evil.example'), '/')
  assert.equal(normalizeInternalReturnPath('https://evil.example'), '/')
  assert.equal(normalizeInternalReturnPath('/\\evil.example'), '/')
  assert.equal(normalizeInternalReturnPath('/sign-in?returnTo=/dashboard'), '/')
})
