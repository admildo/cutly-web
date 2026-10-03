import Image from 'next/image'

const features = [
  {
    label: 'WORKSPACE',
    description: 'Keep original recordings and return to saved clips and sets in your local desktop workspace.',
    image: '/app-shots/usage.png',
    layout: 'col-span-7 max-[900px]:col-span-1'
  },
  {
    label: 'TRANSCRIPTION',
    description: 'Use bundled Whisper on your device, or choose OpenRouter when a cloud workflow suits you.',
    image: '/langs.png',
    layout: 'col-span-4 max-[900px]:col-span-1'
  },
   {
    label: 'LIFETIME LICENSE',
    description: 'Pay once and keep getting future desktop updates.',
    image: '/lock.png',
    layout: 'col-span-4 max-[900px]:col-span-1'
  },
  {
    label: 'CAPTIONS & FORMATS',
    description: 'Prepare captioned clips in formats made for social platforms.',
    image: '/app-shots/tools.png',
    layout: 'col-span-7 max-[900px]:col-span-1'
  }
]

function CardVisual({ feature }) {
  if (feature.image) {
    return <Image src={feature.image} alt="" fill sizes="(max-width: 900px) 100vw, 60vw" className="object-contain object-bottom px-5 pt-2 opacity-90" />
  }

  if (feature.visual === 'transcription') {
    return (
      <div className="absolute inset-x-7 bottom-0 top-3 flex flex-col justify-end gap-3 pb-3 text-[12px] text-[#c3c8d3] max-[600px]:inset-x-5">
        <div className="flex items-center gap-3 rounded-t-xl border border-white/[.08] bg-[#161616]/90 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-[#aab8dc] shadow-[0_0_14px_rgb(170_184_220/.45)]" />
          <span className="text-[#e4e4e0]">Whisper · running locally</span>
          <span className="ml-auto text-[#92928d]">00:18</span>
        </div>
        <div className="space-y-2.5 rounded-xl border border-white/[.07] bg-[#111111]/90 p-4">
          <p className="m-0 leading-relaxed">“The best ideas are usually hiding between the planned moments...”</p>
          <div className="h-px bg-white/[.07]" />
          <p className="m-0 leading-relaxed text-[#90908c]">“...so I like to review the full conversation first.”</p>
          <span className="inline-flex rounded-full border border-white/[.08] bg-white/[.04] px-2.5 py-1 text-[10px] text-[#b9c4df]">OpenRouter · optional</span>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-x-7 bottom-0 top-3 flex items-end pb-3 max-[600px]:inset-x-5">
      <div className="flex w-full items-center justify-between rounded-t-xl border border-white/[.08] bg-[#151515]/95 px-5 py-4">
        <div>
          <span className="block text-[11px] uppercase tracking-[.12em] text-[#96968f]">Cutly desktop</span>
          <span className="mt-1 block text-[15px] font-medium text-[#e5e5e0]">One payment. Yours to keep.</span>
        </div>
        <span className="rounded-full bg-[#aab8dc]/10 px-3 py-1.5 text-[11px] text-[#c4cde1]">Updates included</span>
      </div>
    </div>
  )
}

export function FeatureBento() {
  return (
    <section className="bg-[#080808] px-[clamp(28px,6vw,100px)] py-[78px] max-[900px]:py-[66px] max-[600px]:px-5 max-[600px]:py-[52px]" aria-labelledby="feature-bento-title">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-10 max-w-[680px] max-[600px]:mb-7">
          <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#9297a4]">Cutly, from first import to finished clip</span>
          <h2 id="feature-bento-title" className="mb-0 mt-4 font-serif text-[clamp(46px,5.2vw,66px)] font-normal leading-[.98] tracking-[-.06em] text-[#f0efe9] max-[600px]:text-[42px]">Built for how you<br className="max-[600px]:hidden" /> actually create.</h2>
        </header>

        <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-12 gap-x-9 gap-y-8 max-[1100px]:gap-x-7 max-[900px]:grid-cols-1 max-[900px]:gap-5 max-[600px]:gap-3">
          {features.map((feature) => (
            <article className={`group relative isolate min-h-[560px] overflow-hidden rounded-[20px] border border-white/[.11] bg-[#0d0d0d] p-9 max-[1100px]:min-h-[500px] max-[900px]:min-h-[500px] max-[600px]:min-h-[470px] max-[600px]:rounded-[17px] max-[600px]:p-6 ${feature.layout}`} key={feature.label}>
              <span className="relative z-10 inline-flex rounded-full border border-white/[.08] bg-white/[.06] px-3.5 py-2 text-[11px] font-medium tracking-[.08em] text-[#b6b6b0]">{feature.label}</span>
              <p className="relative z-10 mb-0 mt-7 max-w-[700px] text-[clamp(18px,1.55vw,24px)] leading-[1.45] tracking-[-.025em] text-[#d5d5d0] max-[600px]:mt-5 max-[600px]:text-[18px]">{feature.description}</p>
              <div className="absolute inset-x-0 bottom-0 top-[38%] max-[600px]:top-[44%]">
                <CardVisual feature={feature} />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-b from-transparent via-[#0d0d0d]/55 to-[#0d0d0d]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
