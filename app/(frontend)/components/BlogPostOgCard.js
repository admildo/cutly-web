import { formatShortDate, getReadingMinutes } from '@/lib/blog'

// Satori (the engine behind ImageResponse) takes a subset of CSS: flexbox, px sizes and plain colors only.
// This card is rendered as a 1200x630 PNG for posts that have no cover image, in the same style as public/og.

// Cuts at a word boundary so long titles and excerpts stop cleanly inside the card.
const clamp = (value, max) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const end = cut.lastIndexOf(' ')
  return `${(end > 0 ? cut.slice(0, end) : cut).trimEnd()}…`
}

const titleSize = (title) => (title.length > 72 ? 64 : title.length > 46 ? 74 : 84)

export function BlogPostOgCard({ post, logo }) {
  const title = clamp(post.title, 90)
  const excerpt = clamp(post.excerpt, 150)
  const minutes = getReadingMinutes(post)

  return (
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', background: '#08090c', color: '#f7f8fb', fontFamily: 'Manrope' }}>
      <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle at 92% 0%, rgba(96, 124, 214, 0.3), rgba(96, 124, 214, 0) 62%)' }} />
      <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle at 0% 100%, rgba(203, 214, 242, 0.1), rgba(203, 214, 242, 0) 60%)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', height: '100%', padding: '64px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 25, fontWeight: 800, letterSpacing: -0.3 }}>
          <img src={logo} alt="" width={42} height={42} style={{ borderRadius: 11, marginRight: 14 }} />
          Deyn Studio
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 800, letterSpacing: 3.4, color: '#cbd6f2' }}>
            <div style={{ display: 'flex', width: 9, height: 9, borderRadius: 5, background: '#9bb8ff', marginRight: 12 }} />
            {`JOURNAL · ${minutes} MIN READ`}
          </div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: titleSize(title), fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            {title}
          </div>
          {excerpt ? (
            <div style={{ display: 'flex', marginTop: 26, fontSize: 26, fontWeight: 500, lineHeight: 1.42, color: '#b8bfcf' }}>
              {excerpt}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 19, fontWeight: 500, color: '#7f8699' }}>
          <div style={{ display: 'flex' }}>deynstudio.com</div>
          <div style={{ display: 'flex' }}>{formatShortDate(post.publishedAt)}</div>
        </div>
      </div>
    </div>
  )
}
