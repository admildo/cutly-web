import Link from 'next/link'

export function SiteHeader({ children, dashboard = false }) {
  return (
    <header className={`flex flex-wrap items-center justify-between gap-4 ${dashboard ? 'pb-2' : 'border-b border-black/10 pb-5'}`}>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em]">CUTLY</Link>
        {dashboard ? <span className="text-sm text-black/40">Account</span> : (
          <nav className="flex gap-4 text-sm text-black/55" aria-label="Primary navigation">
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/support">Support</Link>
          </nav>
        )}
      </div>
      {children}
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/10 py-7 text-sm text-black/55">
      <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
        <Link href="/about">About</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/acceptable-use">Acceptable use</Link>
        <Link href="/open-source">Open source</Link>
        <Link href="/support">Support</Link>
      </nav>
      <p className="mt-4">© {new Date().getFullYear()} Cutly. All rights reserved.</p>
    </footer>
  )
}
