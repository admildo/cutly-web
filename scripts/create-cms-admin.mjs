// Creates the first CMS editor in the CMS database the environment points at (the remote one in .env.local).
// The generated password goes to .data/cms-admin-credentials.txt (gitignored), never to the terminal.
//   NODE_ENV=production node --env-file=.env.local scripts/create-cms-admin.mjs you@example.com
import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const email = process.argv[2]
if (!email) throw new Error('Pass the editor email as the first argument.')

const payload = await getPayload({ config })
const { totalDocs } = await payload.count({ collection: 'users' })
if (totalDocs > 0) {
  console.log('A CMS user already exists; nothing changed.')
} else {
  const password = randomBytes(18).toString('base64url')
  await payload.create({ collection: 'users', data: { email, password } })
  mkdirSync('.data', { recursive: true })
  writeFileSync('.data/cms-admin-credentials.txt', `email: ${email}\npassword: ${password}\n`, { mode: 0o600 })
  console.log('Created the CMS editor. Credentials saved to .data/cms-admin-credentials.txt')
}
process.exit(0)
