import { Eraser, FilmStrip, Images, Microphone, Toolbox, WaveformSlash } from '@phosphor-icons/react/ssr'

const tools = [
  {
    title: 'Remove image backgrounds offline',
    description: 'Cut out subjects locally, without sending your images to a cloud service.',
    Icon: Eraser
  },
  {
    title: 'Compress and convert videos',
    description: 'Reduce file sizes or convert videos to another format.',
    Icon: FilmStrip
  },
  {
    title: 'Bulk image compression and conversion',
    description: 'Process batches of image files in one pass.',
    Icon: Images
  },
  {
    title: 'Smart audio censoring',
    description: 'Find sensitive speech and censor it in the audio.',
    Icon: WaveformSlash
  },
  {
    title: 'Local Whisper transcription',
    description: 'Transcribe recordings on your device with bundled Whisper.',
    Icon: Microphone
  },
  {
    title: 'A growing set of tools',
    description: 'More focused utilities keep joining the Deyn Studio desktop workspace.',
    Icon: Toolbox
  }
]

export function BuiltForWork() {
  return (
    <section className="w-full bg-[#0d0d0d] px-[clamp(24px,5vw,84px)] py-[clamp(88px,8vw,112px)] max-[700px]:py-[clamp(64px,10vw,72px)] max-[600px]:px-5">
      <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] gap-[clamp(64px,9vw,140px)] max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[600px]:gap-9">
        <header className="max-w-[440px]">
          <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#9297a4]">The Deyn Studio toolkit</span>
          <h2 className="mb-0 mt-5 font-serif text-[clamp(48px,5.5vw,68px)] font-normal leading-[.98] tracking-[-.06em] text-[#f0efe9] max-[600px]:text-[46px]">Many more<br />features.</h2>
          <p className="mb-0 mt-6 max-w-[390px] text-[16px] leading-[1.7] text-[#969aa5]">A growing set of practical tools for the work around every video.</p>
        </header>

        <div className="border-t border-[#292b32]">
          {tools.map(({ title, description, Icon }) => (
            <article className="group grid grid-cols-[38px_minmax(190px,.9fr)_minmax(0,1.1fr)] items-center gap-x-6 border-b border-[#292b32] py-[23px] transition-colors duration-200 hover:bg-white/[0.015] max-[900px]:grid-cols-[38px_minmax(200px,.9fr)_minmax(0,1.1fr)] max-[600px]:grid-cols-[30px_minmax(0,1fr)] max-[600px]:gap-x-4 max-[600px]:py-5" key={title}>
              <Icon className="h-[25px] w-[25px] text-[#a6b4d6] transition-colors group-hover:text-[#d0d9ef] max-[600px]:h-[22px] max-[600px]:w-[22px]" weight="regular" aria-hidden="true" />
              <h3 className="mb-0 text-[15px] font-medium leading-[1.4] tracking-[-.015em] text-[#e8e9ee] max-[600px]:text-[14px]">{title}</h3>
              <p className="mb-0 text-[13px] leading-[1.55] text-[#9196a2] max-[600px]:col-start-2 max-[600px]:mt-1.5">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
