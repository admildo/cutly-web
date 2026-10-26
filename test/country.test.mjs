import assert from 'node:assert/strict'
import test from 'node:test'
import { countryFromRequest, countryName, flagEmoji } from '../lib/country.js'

const request = (country) => new Request('https://deynstudio.com/api/desktop/access', {
  headers: country === undefined ? {} : { 'x-vercel-ip-country': country }
})

test('the country comes from Vercel\'s header and nothing else', () => {
  assert.equal(countryFromRequest(request('PT')), 'PT')
  assert.equal(countryFromRequest(request(' br ')), 'BR')
  assert.equal(countryFromRequest(request(undefined)), null)
  assert.equal(countryFromRequest(request('XX')), null)
  assert.equal(countryFromRequest(request('T1')), null)
  assert.equal(countryFromRequest(request('12')), null)
})

test('a country code becomes its flag and a readable name', () => {
  assert.equal(flagEmoji('PT'), '🇵🇹')
  assert.equal(flagEmoji('BR'), '🇧🇷')
  assert.equal(flagEmoji(null), null)
  assert.equal(flagEmoji('XX'), null)
  assert.equal(countryName('PT'), 'Portugal')
})
