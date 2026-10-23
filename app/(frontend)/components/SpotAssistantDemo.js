'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './SpotAssistantDemo.module.css'

// An interactive copy of the Spot Assistant window. The layout, the row types, the wording of the
// "Understood" line and the footer, and the flow (suggestions, quick edits, a confirmation before big
// batches, downloads with qualities in the Actions menu) follow src/renderer/src/command-bar in the app.
// Nothing here touches a file: every size and time is made up for the demo, and the page says so.

const ICONS = {
  video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  spinner: <path d="M21 12a9 9 0 1 1-6.2-8.55" />,
  paperclip: <path d="m21 11.5-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9" />,
  pin: <path d="M12 17v5M9 9V4h6v5l2 4H7zM3 3l18 18" />,
  workflow: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M10 6.5h4a3 3 0 0 1 3 3V14" /></>,
  sparkle: <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  shrink: <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  convert: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  mute: <path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6" />,
  captions: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 11h4M13 11h4M7 15h2M12 15h5" /></>,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  play: <path d="M8 5v14l11-7z" />
}

function Icon({ name, size = 16, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

// What each quick edit does to a file, so the demo can show a believable "before → after".
const EDITS = {
  vertical: { title: 'Make it vertical (9:16)', short: 'Vertical 9:16', hint: 'Follows the speaker, saves a new copy', icon: 'phone', factor: 0.46, slug: 'vertical', verb: 'Reframing' },
  compress: { title: 'Compress for sharing', short: 'Compress', hint: 'A much smaller file, easy to send', icon: 'shrink', factor: 0.13, slug: 'compressed', verb: 'Compressing' },
  discord: { title: 'Under 25 MB (Discord)', short: 'Under 25 MB', hint: 'Fits the limit, and the result is checked', icon: 'shrink', target: 24.2, slug: 'under-25mb', verb: 'Fitting 25 MB' },
  email: { title: 'Under 20 MB (email)', short: 'Under 20 MB', hint: 'Fits most mail limits, and the result is checked', icon: 'shrink', target: 19.4, slug: 'under-20mb', verb: 'Fitting 20 MB' },
  mp4: { title: 'Convert to MP4', short: 'MP4', hint: 'Plays everywhere, saves a new copy', icon: 'convert', factor: 0.85, slug: 'mp4', verb: 'Converting' },
  mute: { title: 'Remove the audio', short: 'Remove the audio', hint: 'A silent copy of the video', icon: 'mute', factor: 0.98, slug: 'muted', verb: 'Removing the audio' },
  captions: { title: 'Add captions', short: 'Add captions', hint: 'Burned in from what is said', icon: 'captions', factor: 1.04, slug: 'captioned', verb: 'Adding captions' },
  webp: { title: 'Convert to WebP', short: 'WebP', hint: 'Smaller than PNG or JPG', icon: 'convert', factor: 0.23, slug: 'webp', verb: 'Converting' },
  smaller: { title: 'Make smaller', short: 'Make smaller', hint: 'Same size on screen, smaller file', icon: 'shrink', factor: 0.38, slug: 'smaller', verb: 'Compressing' },
  resize: { title: 'Resize to 1080 px wide', short: 'Resize to 1080 px', hint: 'Keeps the shape, saves a new copy', icon: 'shrink', factor: 0.31, slug: 'resized', verb: 'Resizing' },
  jpg: { title: 'Convert to JPG', short: 'JPG', hint: 'Plays everywhere, saves a new copy', icon: 'convert', factor: 0.74, slug: 'jpg', verb: 'Converting' }
}

const PRESETS = { video: ['vertical', 'compress', 'discord', 'email', 'mp4', 'mute', 'captions'], image: ['webp', 'smaller', 'resize', 'jpg'] }
const LINK_EDITS = ['compress', 'vertical', 'discord']

const QUALITIES = [
  { value: '1080', label: '1080p', mb: 212 },
  { value: 'best', label: 'Best available', mb: 540 },
  { value: '720', label: '720p', mb: 118 },
  { value: '480', label: '480p', mb: 64 }
]

// Plain wording the quick-edit rules understand, the way the app reads typed requests.
const RULES = [
  { id: 'discord', kinds: ['video'], re: /25 ?mb|discord/i },
  { id: 'email', kinds: ['video'], re: /20 ?mb|e-?mail/i },
  { id: 'compress', kinds: ['video'], re: /compress|shrink|smaller|reduce/i },
  { id: 'smaller', kinds: ['image'], re: /compress|shrink|smaller|reduce/i },
  { id: 'vertical', kinds: ['video'], re: /vertical|9:16|reel|tiktok|shorts|portrait/i },
  { id: 'mp4', kinds: ['video'], re: /\bmp4\b/i },
  { id: 'mute', kinds: ['video'], re: /\bmute\b|remove (the )?audio|no audio|silent/i },
  { id: 'captions', kinds: ['video'], re: /captions?|subtitles?/i },
  { id: 'webp', kinds: ['image'], re: /webp/i },
  { id: 'jpg', kinds: ['image'], re: /\bjpe?g\b/i },
  { id: 'resize', kinds: ['image'], re: /resize|1080/i }
]
const FILLER = new Set('and to it the a my please make convert add under for this file video videos clip clips then also with in as into me them these photo photos image images of'.split(' '))

const understand = (text, kind) => {
  let rest = ` ${text} `
  const found = []
  for (const rule of RULES) {
    const match = rule.kinds.includes(kind) ? rest.match(rule.re) : null
    if (!match) continue
    found.push({ id: rule.id, index: match.index })
    rest = rest.replace(new RegExp(rule.re.source, 'gi'), ' ')
  }
  // Steps run in the order the person said them.
  let steps = found.sort((a, b) => a.index - b.index).map((entry) => entry.id)
  // A size limit already shrinks the file, so a separate "compress" would say the same thing twice.
  if (steps.includes('discord') || steps.includes('email')) steps = steps.filter((id) => id !== 'compress')
  const leftover = rest.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word && !FILLER.has(word))
  return steps.length && !leftover.length ? { kind: 'rules', steps } : { kind: 'plan', steps: [] }
}

const SCENARIOS = [
  { id: 'finder', tab: 'A video in Finder', kind: 'video', count: 1, baseMB: 48, stem: 'interview-raw', chip: { icon: 'video', label: 'interview-raw.mov' } },
  { id: 'link', tab: 'A link in your browser', kind: 'video', count: 1, link: { host: 'video.example.com', url: 'video.example.com/watch?v=Qk82', title: 'Q3 keynote highlights', stem: 'q3-keynote-highlights' }, chip: { icon: 'link', label: 'video.example.com' } },
  { id: 'folder', tab: 'A folder of photos', kind: 'image', count: 120, baseMB: 1800, stem: 'wedding-photos', chip: { icon: 'image', label: 'Wedding photos · 120' } }
]

const INTRO_TEXT = 'compress under 25 MB'
const EXAMPLES = ['compress under 25 MB', 'make it vertical', 'mute and convert to MP4', 'add captions']
const TILES = [['#4a5f8f', '#2b3350'], ['#8f6a4a', '#503a2b'], ['#5f8f6a', '#2b5038'], ['#8f4a6a', '#502b3a'], ['#4a8f8a', '#2b5050'], ['#8a8f4a', '#4e502b']]

const formatMB = (mb) => (mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : mb >= 100 ? `${Math.round(mb)} MB` : `${+mb.toFixed(1)} MB`)

const sizeSummary = (before, after) => {
  const saved = Math.round((1 - after / before) * 100)
  return `${formatMB(before)} → ${formatMB(after)}${saved >= 5 ? ` · ${saved}% smaller` : ''}`
}

const sizeAfter = (before, steps) => steps.reduce((size, id) => {
  const edit = EDITS[id]
  return edit.target ? Math.min(size, edit.target) : size * edit.factor
}, before)

const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1)

const ETA_TICK_SECONDS = 0.14

const remainingSeconds = (job) => {
  let ticks = 0
  job.stages.forEach((stage, index) => {
    if (index < job.stage) return
    ticks += (100 - (index === job.stage ? job.percent : 0)) / stage.rate
  })
  return ticks * ETA_TICK_SECONDS
}

const overallPercent = (job) => (job.stage * 100 + job.percent) / job.stages.length

const jobSubtitle = (job) => {
  const scenarioCount = job.total
  if (job.status === 'confirm') return `${scenarioCount} files · ${formatMB(job.before)} → about ${formatMB(job.after)} · 12 GB free`
  if (job.status === 'done') {
    if (job.kind === 'download') return job.fileName
    const summary = sizeSummary(job.before, job.after)
    return scenarioCount > 1 ? `${scenarioCount} files · ${summary}` : `${job.fileName} · ${summary}`
  }
  const stage = job.stages[job.stage]
  const seconds = remainingSeconds(job)
  const eta = (job.total > 1 || stage.showPercent) && seconds >= 2 ? ` · about ${Math.ceil(seconds)} s left` : ''
  return `${stage.label}${stage.showPercent ? ` ${Math.round(job.percent)}%` : '…'}${eta}`
}

function Kbd({ children }) {
  return <span className={styles.kbd}>{children}</span>
}

function FrontApp({ scenario }) {
  if (scenario.id === 'link') {
    return (
      <div className={styles.front}>
        <div className={styles.titleBar}><i /><i /><i /><span className={styles.address}>{scenario.link.url}</span></div>
        <div className={styles.page}>
          <div className={styles.thumb}><Icon name="play" size={34} /></div>
          <p className={styles.pageTitle}>{scenario.link.title}</p>
        </div>
      </div>
    )
  }
  if (scenario.id === 'folder') {
    return (
      <div className={styles.front}>
        <div className={styles.titleBar}><i /><i /><i /><span className={styles.titleText}>Wedding photos</span></div>
        <div className={styles.grid}>
          {Array.from({ length: 12 }, (_, index) => {
            const [a, b] = TILES[index % TILES.length]
            return <span className={styles.tile} style={{ '--a': a, '--b': b }} key={index} />
          })}
        </div>
        <p className={styles.gridCaption}>120 items selected</p>
      </div>
    )
  }
  return (
    <div className={styles.front}>
      <div className={styles.titleBar}><i /><i /><i /><span className={styles.titleText}>Interviews</span></div>
      <div className={styles.fileList}>
        {[['interview-raw.mov', '48 MB', 'video', true], ['broll-harbour.mp4', '131 MB', 'video', false], ['script-notes.pdf', '240 KB', 'file', false]].map(([name, size, icon, selected]) => (
          <div className={styles.file} data-selected={selected} key={name}><Icon name={icon} size={15} /><span>{name}</span><span>{size}</span></div>
        ))}
      </div>
    </div>
  )
}

export function SpotAssistantDemo() {
  const [scenarioId, setScenarioId] = useState('finder')
  const [open, setOpen] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [jobs, setJobs] = useState([])
  const [notice, setNotice] = useState({ text: '', tone: '' })
  const [actionsOpen, setActionsOpen] = useState(false)
  const [actionIndex, setActionIndex] = useState(0)

  const stageRef = useRef(null)
  const inputRef = useRef(null)
  const timersRef = useRef([])
  const typingRef = useRef(null)
  const jobIdRef = useRef(0)
  const focusOnOpenRef = useRef(false)
  const autoOpenedRef = useRef(false)
  const introWantedRef = useRef(false)
  const introActiveRef = useRef(false)
  const introCancelledRef = useRef(false)
  const doneSeenRef = useRef(new Set())

  const scenario = SCENARIOS.find((item) => item.id === scenarioId)
  const busy = jobs.some((job) => job.status === 'running')

  const schedule = useCallback((fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    clearInterval(typingRef.current)
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const pressShortcut = useCallback((focus) => {
    focusOnOpenRef.current = focus
    setPressed(true)
    schedule(() => {
      setPressed(false)
      setOpen(true)
    }, 220)
  }, [schedule])

  useEffect(() => {
    if (open && focusOnOpenRef.current) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  // Open once, when the demo first scrolls into view, so it is never an empty box. The first time it
  // opens by itself it also types a request and runs it (see the intro effect below), then hands over.
  useEffect(() => {
    const node = stageRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || autoOpenedRef.current) return
      autoOpenedRef.current = true
      introWantedRef.current = !introCancelledRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      schedule(() => pressShortcut(false), 500)
    }, { threshold: 0.45 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [pressShortcut, schedule])

  // Move running jobs along.
  useEffect(() => {
    if (!busy) return undefined
    const timer = setInterval(() => {
      setJobs((current) => current.map((job) => {
        if (job.status !== 'running') return job
        const percent = job.percent + job.stages[job.stage].rate
        if (percent < 100) return { ...job, percent }
        if (job.stage < job.stages.length - 1) return { ...job, stage: job.stage + 1, percent: 0 }
        return { ...job, status: 'done', percent: 100 }
      }))
    }, ETA_TICK_SECONDS * 1000)
    return () => clearInterval(timer)
  }, [busy])

  useEffect(() => {
    for (const job of jobs) {
      if (job.status !== 'done' || doneSeenRef.current.has(job.id)) continue
      doneSeenRef.current.add(job.id)
      setNotice({ text: job.kind === 'download' ? 'Download finished.' : job.total > 1 ? 'Done. Your originals are untouched.' : 'Done. Your original is untouched.', tone: 'ok' })
    }
  }, [jobs])

  const reset = (id) => {
    clearTimers()
    setScenarioId(id)
    setOpen(false)
    setPressed(false)
    setQuery('')
    setSelected(0)
    setJobs([])
    setNotice({ text: '', tone: '' })
    setActionsOpen(false)
    autoOpenedRef.current = true
  }

  const chooseScenario = (id) => {
    if (id === scenarioId && open) return
    reset(id)
    schedule(() => pressShortcut(false), 450)
  }

  // Any touch or key press from the visitor ends the intro at once, and clears what it had typed.
  const stopIntro = () => {
    introCancelledRef.current = true
    introWantedRef.current = false
    if (!introActiveRef.current) return
    introActiveRef.current = false
    clearTimers()
    setQuery('')
  }

  const onTabKeyDown = (event) => {
    const index = SCENARIOS.findIndex((item) => item.id === scenarioId)
    const last = SCENARIOS.length - 1
    const target = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key]
    if (target === undefined) return
    event.preventDefault()
    chooseScenario(SCENARIOS[target].id)
    document.getElementById(`spot-tab-${SCENARIOS[target].id}`)?.focus()
  }

  const typeInto = (text) => {
    clearInterval(typingRef.current)
    let length = 0
    typingRef.current = setInterval(() => {
      length += 1
      setQuery(text.slice(0, length))
      setSelected(0)
      if (length >= text.length) clearInterval(typingRef.current)
    }, 42)
  }

  const tryExample = (text) => {
    if (scenarioId !== 'finder') {
      reset('finder')
      schedule(() => pressShortcut(true), 450)
      schedule(() => typeInto(text), 1000)
      return
    }
    setActionsOpen(false)
    if (!open) {
      pressShortcut(true)
      schedule(() => typeInto(text), 650)
      return
    }
    setQuery('')
    inputRef.current?.focus({ preventScroll: true })
    typeInto(text)
  }

  const text = query.trim()
  const understood = useMemo(() => (text ? understand(text, scenario.kind) : null), [text, scenario.kind])

  const rows = useMemo(() => {
    const list = []
    const before = scenario.link ? QUALITIES[0].mb : scenario.baseMB
    const matches = (row) => {
      if (!text) return true
      const haystack = `${row.title} ${row.keywords || ''}`.toLowerCase()
      return text.toLowerCase().split(/\s+/).every((word) => haystack.includes(word))
    }

    if (understood?.kind === 'rules') {
      const names = understood.steps.map((id) => EDITS[id].short)
      list.push({ id: 'typed', icon: EDITS[understood.steps[0]].icon, title: names.join(' · '), sub: scenario.link ? 'Downloads the video, edits it, saves a new copy' : 'Starts at once', action: { type: 'edit', steps: understood.steps, viaLink: Boolean(scenario.link) } })
    } else if (understood?.kind === 'plan') {
      list.push({ id: 'typed', icon: 'sparkle', title: text, sub: 'Deyn plans it first (uses AI)', action: { type: 'edit', steps: [], planned: true, viaLink: Boolean(scenario.link), title: text } })
    }

    if (scenario.link) {
      list.push({ id: 'download', icon: 'download', title: 'Download video', sub: 'Saves a 1080p copy of a public video link', keywords: 'download save grab fetch video link url', action: { type: 'download', quality: QUALITIES[0] } })
      for (const id of LINK_EDITS) {
        list.push({ id: `link:${id}`, icon: EDITS[id].icon, title: `Download, then ${lowerFirst(EDITS[id].title)}`, sub: 'Downloads the video, edits it, saves a new copy', keywords: `${EDITS[id].title} ${EDITS[id].short}`, action: { type: 'edit', steps: [id], viaLink: true } })
      }
      list.push({ id: 'workflows', icon: 'workflow', title: 'Open in Workflows', sub: 'Attach these in Deyn and describe the edit there', keywords: 'open workflows edit deyn attach', action: { type: 'workflows' } })
    } else {
      for (const id of PRESETS[scenario.kind]) {
        const edit = EDITS[id]
        const after = sizeAfter(before, [id])
        const sub = after < before * 0.95 ? `${edit.hint} · ${formatMB(before)} → about ${formatMB(after)}` : edit.hint
        list.push({ id: `quick:${id}`, icon: edit.icon, title: edit.title, sub, keywords: `${edit.short} ${edit.hint}`, action: { type: 'edit', steps: [id] } })
      }
    }
    return list.filter((row) => row.id === 'typed' || matches(row))
  }, [scenario, text, understood])

  const items = useMemo(
    () => [...jobs.map((job) => ({ kind: 'job', id: job.id, job })), ...rows.map((row) => ({ kind: 'row', id: row.id, row }))],
    [jobs, rows]
  )
  const safeSelected = Math.min(selected, Math.max(items.length - 1, 0))
  const selectedItem = items[safeSelected]
  const canActions = selectedItem?.kind === 'row' && selectedItem.row.action.type === 'download'

  const sectionOf = (item) => {
    if (item.kind === 'row') return 'Suggested'
    return { done: 'Results', confirm: 'Needs you' }[item.job.status] || 'Activity'
  }

  const addJob = (job) => {
    jobIdRef.current += 1
    setJobs((current) => [{ ...job, id: `job-${jobIdRef.current}`, stage: 0, percent: 0 }, ...current])
    setQuery('')
    setSelected(0)
    setActionsOpen(false)
  }

  const startDownload = (quality) => {
    addJob({
      kind: 'download',
      status: 'running',
      title: scenario.link.host,
      total: 1,
      before: quality.mb,
      after: quality.mb,
      fileName: `${scenario.link.title}.mp4`,
      stages: [{ label: 'Downloading', rate: quality.value === 'best' ? 2 : 3.4, showPercent: true }]
    })
    setNotice({ text: 'Download started. Progress shows below.', tone: '' })
  }

  const startEdit = ({ steps, planned, viaLink, title: typedTitle }) => {
    const before = viaLink ? QUALITIES[0].mb : scenario.baseMB
    const after = planned ? before * 0.5 : sizeAfter(before, steps)
    const stem = viaLink ? scenario.link.stem : scenario.stem
    const slug = planned || steps.length > 1 ? 'edited' : EDITS[steps[0]].slug
    const batch = scenario.count > 1
    const stages = []
    if (viaLink) stages.push({ label: 'Downloading', rate: 3.4, showPercent: true })
    if (planned) stages.push({ label: 'Planning (uses AI)', rate: 7 })
    stages.push({ label: planned ? 'Running the plan' : steps.length > 1 ? 'Editing' : EDITS[steps[0]].verb, rate: batch ? 1.5 : 4 })
    const base = planned ? typedTitle : steps.length === 1 ? EDITS[steps[0]].title : steps.map((id) => EDITS[id].short).join(' · ')
    addJob({
      kind: 'edit',
      status: batch ? 'confirm' : 'running',
      title: viaLink ? `Download, then ${lowerFirst(base)}` : base,
      total: scenario.count,
      before,
      after,
      fileName: `${stem}-${slug}.mp4`,
      stages
    })
    setNotice({ text: batch ? 'A big batch waits for your go-ahead.' : '', tone: '' })
  }

  const runItem = (item) => {
    if (!item) return
    setActionsOpen(false)
    if (item.kind === 'job') {
      const { job } = item
      if (job.status === 'confirm') {
        setJobs((current) => current.map((entry) => (entry.id === job.id ? { ...entry, status: 'running' } : entry)))
        setNotice({ text: '', tone: '' })
      } else if (job.status === 'done') {
        setNotice({ text: 'In the app, this shows the file in Finder.', tone: '' })
      }
      return
    }
    const { action } = item.row
    if (action.type === 'download') startDownload(action.quality)
    else if (action.type === 'edit') startEdit(action)
    else setNotice({ text: 'In the app, this opens the main window with the files attached.', tone: '' })
  }

  const undo = (job) => {
    setJobs((current) => current.filter((entry) => entry.id !== job.id))
    setNotice({ text: `Moved ${job.total} new files to the Trash. The originals were never touched.`, tone: '' })
  }

  useEffect(() => {
    if (!open || !introWantedRef.current) return
    introWantedRef.current = false
    introActiveRef.current = true
    schedule(() => typeInto(INTRO_TEXT), 700)
    schedule(() => {
      introActiveRef.current = false
      startEdit({ steps: ['discord'] })
    }, 700 + INTRO_TEXT.length * 42 + 900)
    // The intro runs once, the moment the bar first opens; the functions it calls are re-made every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onKeyDown = (event) => {
    const count = items.length
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (canActions) {
        setActionsOpen((value) => !value)
        setActionIndex(0)
      }
      return
    }
    if (actionsOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setActionIndex((value) => (value + (event.key === 'ArrowDown' ? 1 : -1) + QUALITIES.length) % QUALITIES.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        startDownload(QUALITIES[actionIndex])
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setActionsOpen(false)
      }
      return
    }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && count) {
      event.preventDefault()
      setSelected((safeSelected + (event.key === 'ArrowDown' ? 1 : -1) + count) % count)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runItem(selectedItem)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (query) setQuery('')
      else setOpen(false)
    }
  }

  const primary = !selectedItem ? '' : selectedItem.kind === 'job'
    ? { done: 'Show in Finder', confirm: 'Start' }[selectedItem.job.status] || ''
    : selectedItem.row.action.type === 'download' ? 'Download' : 'Run'

  let previousSection = null

  return (
    <div className={styles.demo} onPointerDownCapture={stopIntro} onKeyDownCapture={stopIntro}>
      <div className={styles.tryRow}>
        <span className={styles.tryLabel}>Try typing</span>
        {EXAMPLES.map((example) => (
          <button type="button" className={styles.tryChip} onClick={() => tryExample(example)} key={example}>“{example}”</button>
        ))}
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Choose what is selected" onKeyDown={onTabKeyDown}>
        {SCENARIOS.map((item) => (
          <button type="button" role="tab" id={`spot-tab-${item.id}`} tabIndex={item.id === scenarioId ? 0 : -1} aria-selected={item.id === scenarioId} className={styles.tab} onClick={() => chooseScenario(item.id)} key={item.id}>{item.tab}</button>
        ))}
      </div>

      <div className={styles.stage} data-open={open} ref={stageRef} role="group" aria-label="Interactive Spot Assistant demo">
        <FrontApp scenario={scenario} />

        <div className={styles.keyRow}>
          <button type="button" className={styles.key} data-pressed={pressed} onClick={() => pressShortcut(true)}>
            <span aria-hidden="true">⌥</span> Space
          </button>
          <span className={styles.keyHint}>Press to open Spot Assistant</span>
        </div>

        {open ? (
          <div className={styles.bar} onKeyDown={onKeyDown} onMouseDown={(event) => { if (event.target.tagName !== 'INPUT') event.preventDefault() }}>
            <div className={styles.inputRow}>
              <span className={styles.chip}><Icon name={scenario.chip.icon} size={14} /><span>{scenario.chip.label}</span></span>
              <input
                ref={inputRef}
                className={styles.input}
                value={query}
                placeholder="Type a command, paste a link, or drop files"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls="spot-demo-list"
                aria-activedescendant={selectedItem ? `spot-demo-option-${safeSelected}` : undefined}
                aria-label="Spot Assistant demo"
                onChange={(event) => {
                  clearInterval(typingRef.current)
                  setNotice({ text: '', tone: '' })
                  setQuery(event.target.value)
                  setSelected(0)
                }}
              />
              <span className={styles.iconButton} aria-hidden="true"><Icon name="paperclip" /></span>
              <span className={styles.iconButton} aria-hidden="true"><Icon name="pin" /></span>
            </div>

            {understood ? (
              <div className={styles.understood} data-kind={understood.kind}>
                {understood.kind === 'rules'
                  ? `Understood: ${understood.steps.map((id) => EDITS[id].short).join(' · ')}. Starts at once.`
                  : 'Not a one-step edit. Deyn plans it first (uses AI).'}
              </div>
            ) : null}

            <div className={styles.list} id="spot-demo-list" role="listbox">
              {items.map((item, index) => {
                const section = sectionOf(item)
                const heading = section !== previousSection ? section : null
                previousSection = section
                const isSelected = index === safeSelected
                const job = item.job
                const row = item.row
                return (
                  <div key={item.id}>
                    {heading ? <div className={styles.section}>{heading}</div> : null}
                    <div
                      id={`spot-demo-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={styles.row}
                      data-selected={isSelected}
                      onMouseMove={() => setSelected(index)}
                      onClick={() => runItem(item)}
                    >
                      {job ? (
                        <>
                          <span className={styles.rowIcon} data-tone={job.status === 'done' ? 'ok' : ''}>
                            <Icon name={job.status === 'done' ? 'check' : job.status === 'running' ? 'spinner' : 'file'} className={job.status === 'running' ? styles.spin : undefined} />
                          </span>
                          <span className={styles.rowText}>
                            <span className={styles.rowTitle}>{job.total > 1 && job.kind === 'edit' ? `${job.title} · ${job.total} files` : job.title}</span>
                            <span className={styles.rowSub}>{jobSubtitle(job)}</span>
                            {job.status === 'running' ? <span className={styles.progress}><span style={{ width: `${overallPercent(job)}%` }} /></span> : null}
                          </span>
                          <span className={styles.rowEnd}>
                            {job.status === 'running' && job.total > 1 ? `${Math.floor((job.total * overallPercent(job)) / 100)}/${job.total}` : null}
                            {job.status === 'done' && job.total > 1 ? (
                              <button type="button" className={styles.textButton} onClick={(event) => { event.stopPropagation(); undo(job) }}>Undo</button>
                            ) : null}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.rowIcon}><Icon name={row.icon} /></span>
                          <span className={styles.rowText}>
                            <span className={styles.rowTitle}>{row.title}</span>
                            <span className={styles.rowSub}>{row.sub}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {actionsOpen ? (
              <div className={styles.actions} role="menu" aria-label="Actions">
                {QUALITIES.map((quality, index) => (
                  <div className={styles.row} role="menuitem" data-selected={index === actionIndex} onMouseMove={() => setActionIndex(index)} onClick={() => startDownload(quality)} key={quality.value}>
                    <span className={styles.rowIcon}><Icon name="download" /></span>
                    <span className={styles.rowText}><span className={styles.rowTitle}>Download {quality.label}</span></span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.footer}>
              <span className={styles.note} data-tone={notice.tone} role="status">{notice.text}</span>
              {primary ? <span className={styles.hint}><Kbd>↵</Kbd> {primary}</span> : null}
              {canActions ? <span className={`${styles.hint} ${styles.hintOptional}`}><Kbd>⌘</Kbd><Kbd>K</Kbd> Actions</span> : null}
              <span className={`${styles.hint} ${styles.hintOptional}`}><Kbd>Esc</Kbd> {query ? 'Clear' : 'Close'}</span>
            </div>
          </div>
        ) : null}
      </div>

      <p className={styles.caption}>Interactive demo with sample files. Sizes and times are examples, and real results depend on your video. Only download videos you have permission to use.</p>
    </div>
  )
}
