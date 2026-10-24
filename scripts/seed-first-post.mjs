// Creates the "Why Deyn Studio" launch post in the CMS database the environment points at.
// Run: NODE_ENV=production node --env-file=.env.local scripts/seed-first-post.mjs [--draft]
// Writes to the remote CMS in .env.local; skips if the slug already exists.
import { getPayload } from 'payload'
import config from '../payload.config.js'

const text = (value, format = 0) => ({ type: 'text', version: 1, text: value, format, detail: 0, mode: 'normal', style: '' })
const bold = (value) => text(value, 1)
const link = (value, url) => ({
  type: 'link', version: 3, direction: 'ltr', format: '', indent: 0,
  fields: { linkType: 'custom', newTab: false, url },
  children: [text(value)]
})
const block = (type, children, extra = {}) => ({ type, version: 1, direction: 'ltr', format: '', indent: 0, children, ...extra })
const p = (...children) => block('paragraph', children.map((c) => (typeof c === 'string' ? text(c) : c)))
const h2 = (value) => block('heading', [text(value)], { tag: 'h2' })
const list = (items) => block('list', items.map((children, i) => block('listitem', children.map((c) => (typeof c === 'string' ? text(c) : c)), { value: i + 1 })), { listType: 'bullet', tag: 'ul', start: 1 })

const content = { root: block('root', [
  p('Most of what people want to share from a long video is a few minutes buried inside an hour. Finding those minutes is the slow part: scrubbing a timeline, re-listening to a sentence you half remember, guessing where a thought starts and ends. The editing that follows is usually quick by comparison.'),
  p('Deyn Studio exists to take the searching off your plate. It is a desktop app that reads a long recording, suggests the moments worth keeping, and then helps you finish each one as a clip you can post.'),
  h2('Start from the moment, not the timeline'),
  p('You bring in a video, or paste a link to a supported public one. Deyn transcribes it, then asks AI to find the strong moments: the answer that stands on its own, the story with a clear start and end, the line worth quoting. You review what it found, keep what you like, and ignore the rest.'),
  p('The point is that you are choosing between candidates instead of hunting for them. You still make every editorial call. The software just stops you from watching two hours of footage to make it.'),
  h2('Finish the clip in the same place'),
  p('A suggestion is only useful if it becomes something you can publish. For each clip you can edit captions, reframe the picture for vertical or square formats, and export. There is no round trip through three other tools.'),
  p('We keep the cuts honest. Deyn uses hard cuts and puts its effort into where a cut lands, so a clip begins and ends where the speaker does, rather than hiding rough edges behind transitions.'),
  h2('Your computer does the heavy lifting'),
  p('Deyn is a desktop app because video is heavy and often private. Transcription with Whisper and background removal both run on your device. When you use cloud AI to find moments or transcribe, only the data needed for that task is sent to OpenRouter. We spell out exactly what goes where in the ', link('Privacy Policy', '/privacy'), '.'),
  h2('Small tools for the rest of the job'),
  p('Real projects need more than one trick, so Deyn also covers the jobs around the edit:'),
  list([
    ['Transcribing speech to text'],
    ['Cleaning up audio'],
    ['Removing backgrounds'],
    ['Converting video between formats']
  ]),
  h2('Who it is for'),
  p('Podcasters, interviewers, educators, streamers, and anyone with a library of long recordings and not enough hours. If your raw material is talk, Deyn is built for you.'),
  p('Use it with media you own or have permission to use. Deyn does not bypass DRM, sign-in walls, or other access controls, and you are responsible for what you process and publish.'),
  h2('What comes next'),
  p('This journal is where we will share how Deyn works, what we are changing, and practical advice for turning long recordings into short ones. If that sounds useful, ', link('download Deyn Studio', '/download'), ' and tell us what you would like to see covered, or follow along through the ', link('RSS feed', '/blog/rss.xml'), '.')
]) }

const payload = await getPayload({ config })
const slug = 'why-deyn-studio'
const existing = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
if (existing.docs[0]) {
  console.log('Post already exists, nothing changed.')
} else {
  await payload.create({
    collection: 'posts',
    data: {
      title: 'Why Deyn Studio',
      slug,
      excerpt: 'Long recordings hide their best minutes. Deyn Studio finds them, then helps you turn each one into a finished clip, all on your desktop.',
      publishedAt: new Date().toISOString(),
      content,
      _status: process.argv.includes('--draft') ? 'draft' : 'published'
    }
  })
  console.log('Created "Why Deyn Studio".')
}
process.exit(0)
