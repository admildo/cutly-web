import Link from 'next/link'

export function SiteHeader({ children, dashboard = false, dark = dashboard }) {
  return (
    <header className={`flex flex-wrap items-center justify-between gap-4 ${dashboard ? 'pb-2' : dark ? 'border-b border-white/10 pb-5' : 'border-b border-black/10 pb-5'}`}>
      <div className="flex items-center gap-6">
        <Link href="/" className={`text-sm font-semibold tracking-[0.22em] ${dark ? 'text-[#f2f2ee]' : 'text-[#171716]'}`}>DEYN STUDIO</Link>
        {dashboard ? <span className="text-sm text-[#85858b]">Account</span> : (
          <nav className={`flex gap-4 text-sm ${dark ? 'text-[#a5a6ab]' : 'text-black/55'}`} aria-label="Primary navigation">
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

export function SiteFooter({ dark = false }) {
  return (
    <footer className={`mt-16 flex flex-col gap-4 py-7 text-xs sm:flex-row sm:items-center sm:justify-between ${dark ? 'text-[#a5a6ab]' : 'text-black/55'}`}>
      <p className="m-0">© {new Date().getFullYear()} Deyn Studio</p>
      <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
        <Link href="/about">About</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/acceptable-use">Acceptable use</Link>
        <Link href="/open-source">Open source</Link>
        <Link href="/support">Support</Link>
      </nav>
    </footer>
  )
}
