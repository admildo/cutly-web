import { SpotAssistantDemo } from './SpotAssistantDemo'
import { Reveal } from './ScrollReveal'
import styles from './SpotAssistant.module.css'

const ICONS = {
  shrink: <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
}

function MiniIcon({ name, tone }) {
  return (
    <span className={styles.miniIcon} data-tone={tone}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
    </span>
  )
}

// The pieces of the real window shown in each panel are drawn for illustration. Their numbers are the
// same sample figures the demo uses, not measurements.
function InstantVisual() {
  return (
    <div className={styles.mini}>
      <div className={styles.miniNote}>Understood: Under 25 MB. Starts at once.</div>
      <div className={styles.miniRow}>
        <MiniIcon name="check" tone="ok" />
        <span className={styles.miniText}>
          <span className={styles.miniTitle}>Under 25 MB (Discord)</span>
          <span className={styles.miniSub}>interview-raw-under-25mb.mp4 · 48 MB → 24.2 MB · 50% smaller</span>
        </span>
      </div>
    </div>
  )
}

function DownloadVisual() {
  return (
    <div className={styles.mini}>
      <div className={styles.miniRow}>
        <MiniIcon name="download" />
        <span className={styles.miniText}>
          <span className={styles.miniTitle}>video.example.com</span>
          <span className={styles.miniSub}>Downloading 1080p</span>
          <span className={styles.progress}><span /></span>
        </span>
      </div>
      <div className={styles.qualities}>
        {['1080p', 'Best available', '720p', '480p'].map((quality, index) => <span className={styles.quality} data-active={index === 0} key={quality}>{quality}</span>)}
      </div>
    </div>
  )
}

function BatchVisual() {
  return (
    <div className={styles.mini}>
      <div className={styles.miniRow}>
        <MiniIcon name="check" tone="ok" />
        <span className={styles.miniText}>
          <span className={styles.miniTitle}>WebP · 120 files</span>
          <span className={styles.miniSub}>118 done · 2 couldn’t be read</span>
        </span>
        <span className={styles.miniButton}>Retry 2</span>
      </div>
    </div>
  )
}

function OriginalsVisual() {
  return (
    <div className={styles.mini}>
      <div className={styles.miniRow}>
        <MiniIcon name="video" />
        <span className={styles.miniText}><span className={styles.miniTitle}>talk.mov</span></span>
        <span className={styles.miniTag}>Untouched</span>
      </div>
      <div className={styles.miniRow}>
        <MiniIcon name="shrink" tone="ok" />
        <span className={styles.miniText}><span className={styles.miniTitle}>talk-small.mp4</span></span>
        <span className={styles.miniTag} data-tone="ok">New copy</span>
      </div>
    </div>
  )
}

function WatchVisual() {
  return (
    <div className={styles.mini}>
      <div className={styles.miniRow}>
        <MiniIcon name="folder" />
        <span className={styles.miniText}>
          <span className={styles.miniTitle}>Screen recordings</span>
          <span className={styles.miniSub}>Compress for sharing</span>
        </span>
        <span className={styles.switch} aria-hidden="true" />
      </div>
    </div>
  )
}

const panels = [
  {
    key: 'instant',
    span: styles.span3,
    title: 'Common edits start instantly.',
    // DECISION: "opens in a blink" rests on the measured ~25 ms to visible on an Apple-silicon Mac
    // (pnpm measure:command-bar in the app). Slower Macs will be slower; the claim stays loose on purpose.
    text: 'It opens in a blink. Compress, convert, mute, go vertical, or fit under 25 MB for Discord start straight away on your Mac, with no AI wait and no credits.',
    visual: <InstantVisual />
  },
  {
    key: 'download',
    span: styles.span3,
    title: 'Paste a link. Get the file.',
    text: 'Download a supported public video link at 1080p, 720p or the best quality available. Or download and compress in one step.',
    visual: <DownloadVisual />
  },
  {
    key: 'batch',
    span: styles.span3,
    title: 'Whole folders, handled.',
    text: 'A bad file only costs itself. Retry just the failures, or undo the whole batch.',
    visual: <BatchVisual />
  },
  {
    key: 'originals',
    span: styles.span3,
    title: 'Your originals stay put.',
    text: 'Every edit saves a new copy beside the original, so there is nothing to lose by trying.',
    visual: <OriginalsVisual />
  },
  {
    key: 'watch',
    span: styles.span6,
    wide: true,
    // DECISION: watch folders are real (src/main/command-bar/watch-folders.js) but need a saved recipe first,
    // handle videos and images only, skip files already in the folder, and only run while Deyn is running in
    // the background. The copy says so instead of promising "forget it".
    title: 'Let a folder do the work.',
    text: 'Pair a folder with a saved edit. New videos and images that land in it are edited for you while Deyn runs in the background.',
    visual: <WatchVisual />
  }
]

export function SpotAssistant() {
  return (
    <section id="spot-assistant" className="relative overflow-hidden bg-[#08090c] px-6 section-pad text-[#f0efe9] max-[767px]:px-5" aria-labelledby="spot-assistant-title">
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-[420px] w-[min(820px,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(157_139_103/.12),transparent_68%)] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1040px]">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="mb-4 text-[12px] font-medium uppercase tracking-[.2em] text-[#aab7d7]">Spot Assistant</p>
          <h2 id="spot-assistant-title" className="m-0 section-title text-[#f0f2f8]">Select files. Press&nbsp;⌥&nbsp;D. Done.</h2>
          <p className="mx-auto mb-0 mt-6 max-w-[600px] text-[16px] leading-[1.7] text-[#a6a8ae]">Select files in Finder, or open a video in your browser. Press the shortcut, say what you want, and keep working.</p>
        </div>

        <div className="mt-10 max-[600px]:mt-8">
          <SpotAssistantDemo />
        </div>

        <div className={`${styles.bento} mt-[clamp(72px,9vw,120px)]`}>
          {panels.map((panel, index) => (
            <Reveal className={panel.span} delay={(index % 3) * 90} key={panel.key}>
              <article className={`${styles.panel} ${panel.wide ? styles.panelWide : ''}`}>
                <div>
                  <h3 className={styles.panelTitle}>{panel.title}</h3>
                  <p className={styles.panelText}>{panel.text}</p>
                </div>
                <div className={styles.visual} aria-hidden="true">{panel.visual}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
