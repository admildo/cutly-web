import Link from 'next/link'

export function AuthLayout({ children }) {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center [color-scheme:dark] bg-black text-[#f2f0ef]">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-5 px-6 py-6 sm:px-10 sm:py-8 xl:px-[clamp(48px,7vw,112px)]">
        <Link href="/" aria-label="Deyn Studio home" className="text-[19px] font-bold tracking-[0.2em] text-[#f2f0ef] no-underline">
          Deyn Studio
        </Link>
        <Link href="/support" className="text-[13px] font-medium text-[#a6a4a4] underline-offset-4 transition-colors hover:text-[#f2f0ef] hover:underline">
          Need help?
        </Link>
      </header>

      <div className="w-[min(440px,calc(100%_-_48px))] py-28">{children}</div>

      <p className="absolute inset-x-6 bottom-6 mx-auto mb-0 max-w-[360px] text-center text-[12px] leading-5 text-[#807e7e]">
        By continuing, you agree to Deyn Studio’s{' '}
        <Link className="font-medium text-[#cccbca] underline decoration-[#807e7e] underline-offset-2 hover:text-[#f2f0ef] hover:decoration-[#f2f0ef]" href="/terms">Terms</Link>
        {' '}and{' '}
        <Link className="font-medium text-[#cccbca] underline decoration-[#807e7e] underline-offset-2 hover:text-[#f2f0ef] hover:decoration-[#f2f0ef]" href="/privacy">Privacy Policy</Link>.
      </p>
    </main>
  )
}
