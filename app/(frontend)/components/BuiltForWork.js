import { Eraser, FilmStrip, Images, Microphone, Toolbox, WaveformSlash } from '@phosphor-icons/react/ssr'

const tools = [
  {
    title: 'Remove image backgrounds',
    description: 'Cut out a subject on your device; your image stays local.',
    Icon: Eraser
  },
  {
    title: 'Convert or compress video',
    description: 'Change formats or shrink files for easier sharing.',
    Icon: FilmStrip
  },
  {
    title: 'Batch process images',
    description: 'Compress or convert a folder of images in one pass.',
    Icon: Images
  },
  {
    title: 'Clean up spoken audio',
    description: 'Find selected words in a recording and beep or mute them.',
    Icon: WaveformSlash
  },
  {
    title: 'Transcribe on your device',
    description: 'Deyn includes Whisper, so local transcription needs no provider key.',
    Icon: Microphone
  },
  {
    title: 'Tools for more media jobs',
    description: 'Handle common video, audio, image, and document tasks in Deyn Studio.',
    Icon: Toolbox
  }
]

export function BuiltForWork() {
  return (
    <section className="w-full bg-[#0d0d0d] px-[clamp(24px,5vw,84px)] py-[clamp(88px,8vw,112px)] max-[700px]:py-[clamp(64px,10vw,72px)] max-[600px]:px-5">
      <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] gap-[clamp(64px,9vw,140px)] max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[600px]:gap-9">
        <header className="max-w-[440px]">
          <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#9297a4]">More than clip editing</span>
          <h2 className="mb-0 mt-5 font-serif text-[clamp(48px,5.5vw,68px)] font-normal leading-[.98] tracking-[-.06em] text-[#f0efe9] max-[600px]:text-[46px]">The rest of<br />your media work.</h2>
          <p className="mb-0 mt-6 max-w-[390px] text-[16px] leading-[1.7] text-[#969aa5]">Handle audio, images, and documents without leaving Deyn Studio.</p>
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
