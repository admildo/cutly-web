import Image from 'next/image'

const features = [
  {
    label: 'MEDIA ASSISTANT',
    description: 'Describe an edit for selected files. Review the proposed steps, adjust them, then run or save the plan.',
    visual: 'assistant',
    layout: 'col-span-7 max-[900px]:col-span-1'
  },
  {
    label: 'VIDEO WORKFLOWS',
    description: 'Find moments automatically, search by description, or choose the cut yourself. Refine transcripts, style captions, reframe clips, and export.',
    image: '/app-shots/cutly-generator.png',
    layout: 'col-span-4 max-[900px]:col-span-1'
  },
  {
    label: 'AUDIO + IMAGES',
    description: 'Transcribe, clean, normalize, or convert audio. Batch-convert images and remove backgrounds locally.',
    visual: 'media-tools',
    layout: 'col-span-4 max-[900px]:col-span-1'
  },
  {
    label: 'DOCUMENTS',
    description: 'Merge or split PDFs, extract pages, and convert selectable PDF text to DOCX.',
    visual: 'documents',
    layout: 'col-span-7 max-[900px]:col-span-1'
  }
]

function CardVisual({ feature }) {
  if (feature.image) {
    return <Image src={feature.image} alt="" fill sizes="(max-width: 900px) 100vw, 60vw" className="object-contain object-bottom px-5 pt-2 opacity-90" />
  }

  if (feature.visual === 'assistant') {
    return (
      <div className="absolute inset-x-7 bottom-0 top-3 flex items-end pb-3 text-[12px] text-[#c3c8d3] max-[600px]:inset-x-5">
        <div className="w-full rounded-t-xl border border-white/[.08] bg-[#111216]/95 p-5 shadow-[0_18px_55px_rgb(0_0_0/.35)] max-[600px]:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[.08] pb-3">
            <span className="font-medium text-[#e4e4e0]">Media Assistant</span>
            <span className="rounded-full border border-white/[.08] bg-white/[.04] px-2.5 py-1 text-[10px] text-[#aeb8cf]">Plan ready to review</span>
          </div>
          <p className="mb-3 mt-4 text-[11px] text-[#9298a5]">For 3 selected files</p>
          <ol className="mb-0 mt-0 grid list-none gap-2.5 p-0">
            {['Compress video', 'Normalize audio', 'Remove metadata'].map((step, index) => (
              <li className="flex items-center gap-3 rounded-lg border border-white/[.06] bg-white/[.025] px-3 py-2.5" key={step}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#aab8dc]/10 text-[10px] text-[#c8d2ea]">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center justify-between text-[10px] text-[#92928d]">
            <span>Edit steps before running</span>
            <span className="rounded-full bg-[#d9e4ff] px-3 py-1.5 font-medium text-[#17191e]">Run plan</span>
          </div>
        </div>
      </div>
    )
  }

  if (feature.visual === 'media-tools') {
    return (
      <div className="absolute inset-x-7 bottom-0 top-3 flex items-end pb-3 max-[600px]:inset-x-5">
        <div className="grid w-full grid-cols-2 gap-3 max-[600px]:gap-2">
          {[
            { title: 'Audio', tools: ['Transcribe', 'Clean', 'Normalize', 'Convert'] },
            { title: 'Images', tools: ['Batch convert', 'Compress', 'Remove background', 'Review result'] }
          ].map((group) => (
            <div className="rounded-t-xl border border-white/[.08] bg-[#111216]/95 p-4 shadow-[0_18px_55px_rgb(0_0_0/.35)] max-[600px]:p-3" key={group.title}>
              <h3 className="mb-3 mt-0 text-[13px] font-medium text-[#e4e4e0]">{group.title}</h3>
              <ul className="mb-0 mt-0 grid list-none gap-2 p-0">
                {group.tools.map((tool) => <li className="rounded-md border border-white/[.06] bg-white/[.025] px-2.5 py-2 text-[10px] text-[#b8bdc9] max-[600px]:px-2" key={tool}>{tool}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-x-7 bottom-0 top-3 flex items-end pb-3 max-[600px]:inset-x-5">
      <div className="w-full rounded-t-xl border border-white/[.08] bg-[#111216]/95 p-5 shadow-[0_18px_55px_rgb(0_0_0/.35)] max-[600px]:p-4">
        <div className="mb-3 flex items-center justify-between border-b border-white/[.08] pb-3">
          <span className="text-[12px] font-medium text-[#e4e4e0]">Document tools</span>
          <span className="text-[10px] text-[#92928d]">PDF · DOCX</span>
        </div>
        <ul className="mb-0 mt-0 grid list-none gap-2 p-0">
          {[
            ['Merge PDFs', 'Combine files into one document'],
            ['Extract pages', 'Choose the pages to keep'],
            ['PDF to DOCX', 'Convert selectable text']
          ].map(([title, description], index) => (
            <li className="flex items-center gap-3 rounded-lg border border-white/[.06] bg-white/[.025] px-3 py-2.5" key={title}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#aab8dc]/10 text-[10px] text-[#c8d2ea]">{index + 1}</span>
              <span className="min-w-0"><span className="block text-[11px] text-[#d6d8df]">{title}</span><span className="mt-0.5 block text-[9px] text-[#9298a5]">{description}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function FeatureBento() {
  return (
    <section className="bg-[#080808] px-[clamp(28px,6vw,100px)] py-[clamp(88px,8vw,112px)] max-[700px]:py-[clamp(64px,10vw,72px)] max-[600px]:px-5" aria-labelledby="feature-bento-title">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-10 max-w-[680px] max-[600px]:mb-7">
          <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#9297a4]">One workspace for the work around your media</span>
          <h2 id="feature-bento-title" className="mb-0 mt-4 font-serif text-[clamp(46px,5.2vw,66px)] font-normal leading-[.98] tracking-[-.06em] text-[#f0efe9] max-[600px]:text-[42px]">From a request to<br className="max-[600px]:hidden" /> a finished edit.</h2>
        </header>

        <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-12 gap-x-9 gap-y-8 max-[1100px]:gap-x-7 max-[900px]:grid-cols-1 max-[900px]:gap-5 max-[600px]:gap-4">
          {features.map((feature) => (
            <article className={`group relative isolate min-h-[560px] overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#111216,#0c0d11_62%,#090a0d)] p-9 shadow-[0_28px_80px_-36px_rgb(0_0_0/.95),0_0_42px_-24px_rgb(166_184_221/.22),inset_0_1px_0_rgb(255_255_255/.045)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_34px_94px_-34px_rgb(0_0_0/.98),0_0_54px_-22px_rgb(166_184_221/.3),inset_0_1px_0_rgb(255_255_255/.065)] motion-reduce:transform-none motion-reduce:transition-none max-[1100px]:min-h-[500px] max-[900px]:min-h-[500px] max-[600px]:min-h-[470px] max-[600px]:rounded-[17px] max-[600px]:p-6 ${feature.layout}`} key={feature.label}>
              <span className="relative z-10 inline-flex rounded-full border border-white/[.08] bg-white/[.06] px-3.5 py-2 text-[11px] font-medium tracking-[.08em] text-[#b6b6b0]">{feature.label}</span>
              <p className="relative z-10 mb-0 mt-7 max-w-[700px] text-[clamp(18px,1.55vw,24px)] leading-[1.45] tracking-[-.025em] text-[#d5d5d0] max-[600px]:mt-5 max-[600px]:text-[18px]">{feature.description}</p>
              <div className="absolute inset-x-0 bottom-0 top-[38%] max-[600px]:top-[44%]">
                <CardVisual feature={feature} />
                {feature.image ? <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-b from-transparent via-[#0b0c10]/55 to-[#0b0c10]" /> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
