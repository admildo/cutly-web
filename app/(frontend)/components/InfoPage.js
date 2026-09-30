import { SiteFooter, SiteHeader } from './SiteChrome'

export function InfoPage({ eyebrow, title, intro, children }) {
  return (
    <main className="min-h-screen [color-scheme:dark] bg-[#171716] px-5 py-6 text-[#f2f0ef] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <SiteHeader dark />
        <article className="py-12 sm:py-16 [&_a]:font-medium [&_a]:text-[#cccbca] [&_a]:underline [&_a]:underline-offset-[3px] [&_a:hover]:text-[#f2f0ef] [&_ul]:list-disc [&_ul]:pl-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#a6a4a4]">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{title}</h1>
          {intro ? <p className="mt-5 max-w-2xl text-base leading-7 text-[#a6a4a4]">{intro}</p> : null}
          <div className="mt-10 space-y-9">{children}</div>
        </article>
        <SiteFooter dark />
      </div>
    </main>
  )
}

export function Section({ title, children }) {
  return <section><h2 className="text-xl font-medium tracking-[-0.025em] text-[#f2f0ef]">{title}</h2><div className="mt-3 space-y-4 text-sm leading-7 text-[#a6a4a4]">{children}</div></section>
}
