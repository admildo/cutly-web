import Image from 'next/image'
import Link from 'next/link'

export function AuthLayout({ children }) {
  return (
    <main className="grid min-h-dvh [color-scheme:dark] bg-[#171716] text-[#f2f0ef] lg:grid-cols-[minmax(380px,0.92fr)_minmax(360px,1.08fr)]">
      <section className="flex min-h-dvh flex-col px-6 py-6 sm:px-10 sm:py-8 xl:px-[clamp(48px,7vw,112px)]">
        <header className="flex items-center justify-between gap-5">
          <Link href="/" aria-label="Cutly home" className="text-[19px] font-bold tracking-[0.2em] text-[#f2f0ef] no-underline">
            CUTLY
          </Link>
          <Link href="/support" className="text-[13px] font-medium text-[#a6a4a4] underline-offset-4 transition-colors hover:text-[#f2f0ef] hover:underline">
            Need help?
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-12 lg:py-8">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>

        <p className="mx-auto mb-0 max-w-[360px] text-center text-[12px] leading-5 text-[#807e7e]">
          By continuing, you agree to Cutly’s{' '}
          <Link className="font-medium text-[#cccbca] underline decoration-[#807e7e] underline-offset-2 hover:text-[#f2f0ef] hover:decoration-[#f2f0ef]" href="/terms">Terms</Link>
          {' '}and{' '}
          <Link className="font-medium text-[#cccbca] underline decoration-[#807e7e] underline-offset-2 hover:text-[#f2f0ef] hover:decoration-[#f2f0ef]" href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <aside aria-label="Cutly desktop editor preview" className="relative hidden min-h-dvh overflow-hidden bg-[#171716] lg:block">
        <Image
          src="/app-shots/cutly-dashboard.png"
          alt="Cutly desktop editor"
          fill
          priority
          sizes="(min-width: 1280px) 52vw, 48vw"
          className="object-cover"
        />
      </aside>
    </main>
  )
}
