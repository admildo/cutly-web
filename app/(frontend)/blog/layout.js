import { Newsreader } from 'next/font/google'
import Link from 'next/link'
import { SiteFooter } from '../components/SiteChrome'
import './blog.css'

const newsreader = Newsreader({
  variable: '--font-blog-serif',
  subsets: ['latin'],
  display: 'swap'
})

export default function BlogLayout({ children }) {
  return (
    <div className={`blog-shell ${newsreader.variable}`}>
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 pt-7 sm:px-10">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em] text-[var(--blog-text)] no-underline">DEYN STUDIO</Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--blog-muted)] sm:gap-7" aria-label="Primary navigation">
          <Link href="/about" className="no-underline hover:text-[var(--blog-text)]">About</Link>
          <Link href="/blog" className="text-[var(--blog-text)] no-underline" aria-current="page">Journal</Link>
          <Link href="/support" className="no-underline hover:text-[var(--blog-text)]">Support</Link>
          <Link href="/download" className="rounded-full bg-[var(--blog-text)] px-4 py-1.5 font-medium text-[var(--blog-bg)] no-underline transition-opacity hover:opacity-85">Download</Link>
        </nav>
      </header>
      {children}
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SiteFooter dark />
      </div>
    </div>
  )
}
