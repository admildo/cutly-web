'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const FAQ_ITEMS = [
  {
    category: 'Product',
    question: 'What is Deyn Studio?',
    answer: 'Deyn Studio is a desktop app for turning long videos into clips. Find moments, edit captions and framing, then export. It also includes tools for audio, images, and documents.'
  },
  {
    category: 'Product',
    question: 'How does Media Assistant work?',
    answer: 'Choose files and describe the job. Media Assistant lays out steps you can review, adjust, or remove before they run. Save useful plans and reuse them with compatible files.'
  },
  {
    category: 'AI & Privacy',
    question: 'Does Deyn analyze my files automatically?',
    answer: 'No. Media Assistant only plans the task you ask for. Features such as transcription and clip finding analyze media when you run them.'
  },
  {
    category: 'AI & Privacy',
    question: 'Where is my media processed?',
    answer: 'Whisper transcription and background removal run on your computer. Cloud AI and transcription send the data needed for that task to OpenRouter, which may charge for usage.'
  },
  {
    category: 'AI & Privacy',
    question: 'What does the AI trial include?',
    answer: 'Eligible accounts get limited sponsored uses for clip suggestions, Smart Clean, caption translation, and Media Assistant planning. Deyn shows your remaining uses in the app.'
  },
  {
    category: 'Pricing & License',
    question: 'Are AI costs included in the license?',
    answer: 'The license includes Deyn Studio and future desktop updates. After the AI trial, add your OpenRouter API key and choose a model. OpenRouter bills that usage separately.'
  },
  {
    category: 'Pricing & License',
    question: 'What does Deyn Studio cost?',
    answer: 'The launch license costs €39 once. It includes lifetime access, future desktop updates, and use on up to two devices.'
  },
  {
    category: 'Compatibility',
    question: 'Which computers can run Deyn Studio?',
    answer: 'Deyn Studio supports macOS, Windows, and Linux.'
  },
  {
    category: 'AI & Privacy',
    question: 'Can I transcribe without a cloud service?',
    answer: 'Yes. Deyn includes Whisper transcription that runs on your computer. No OpenRouter key or per-use fee is needed.'
  }
]

const CATEGORIES = ['All', ...new Set(FAQ_ITEMS.map(({ category }) => category))]

export function FAQSection() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedItems, setExpandedItems] = useState(() => new Set())

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return FAQ_ITEMS.filter(({ category, question, answer }) => {
      const matchesCategory = activeCategory === 'All' || category === activeCategory
      const matchesQuery = !normalizedQuery || `${question} ${answer} ${category}`.toLocaleLowerCase().includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query])

  const hasActiveFilters = Boolean(query.trim()) || activeCategory !== 'All'

  const clearFilters = () => {
    setQuery('')
    setActiveCategory('All')
  }

  const toggleItem = (question) => {
    setExpandedItems((current) => {
      const next = new Set(current)
      if (next.has(question)) next.delete(question)
      else next.add(question)
      return next
    })
  }

  return (
    <section className="scroll-mt-[24px] w-full bg-[#0d0d0e] px-6 py-[clamp(104px,9vw,132px)] text-[#f2f2f2] max-[700px]:py-[clamp(76px,11vw,88px)] max-[600px]:px-5" id="faq">
      <div className="mx-auto max-w-[680px] text-center">
        <h2 className="mb-0 text-[clamp(36px,4vw,48px)] font-medium leading-[1.02] tracking-[-.06em] text-[#f2f2f2] max-[600px]:text-[32px]">Before you download</h2>
        <p className="mx-auto mb-0 mt-4 max-w-[480px] text-[15px] leading-[1.7] text-[#a0a0a0]">What it does, what AI costs, and where your files are processed.</p>

        <div className="relative mx-auto mt-9 max-w-[520px] max-[600px]:mt-7">
          <svg aria-hidden="true" className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#999999]" viewBox="0 0 20 20" fill="none">
            <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <label className="sr-only" htmlFor="faq-search">Search questions</label>
          <input
            className="h-12 w-full rounded-[12px] bg-[#171717] pl-[46px] pr-4 text-[14px] max-[767px]:text-[16px] text-[#f2f2f2] outline-none transition-shadow placeholder:text-[#777777] focus-visible:shadow-[0_0_0_3px_rgb(255_255_255/.28)]"
            id="faq-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an answer…"
            type="search"
            value={query}
          />
        </div>

        <div aria-label="Filter questions by category" className="mt-4 flex flex-wrap justify-center gap-2 pb-1 max-[600px]:justify-center" role="group">
          {CATEGORIES.map((category) => {
            const selected = activeCategory === category
            return (
              <button
                aria-pressed={selected}
                className={`shrink-0 rounded-full max-[767px]:min-h-11 px-3.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eeeeee] ${selected ? 'bg-[#f2f2f2] text-[#111111]' : 'bg-[#171717] text-[#aaaaaa] hover:bg-[#242424] hover:text-[#f2f2f2]'}`}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {visibleItems.length} {visibleItems.length === 1 ? 'question' : 'questions'} shown
      </p>
      {hasActiveFilters ? (
        <div className="mx-auto mt-4 flex max-w-[760px] justify-end">
          <button aria-label="Clear search and category filters" className="rounded-sm text-[12px] font-medium text-[#dddddd] underline decoration-[#777777] underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#eeeeee]" onClick={clearFilters} type="button">
            Clear filters
          </button>
        </div>
      ) : null}

      <div className="mx-auto mt-7 grid max-w-[760px] gap-3 max-[600px]:mt-6 max-[600px]:gap-2.5">
        {visibleItems.length ? visibleItems.map(({ category, question, answer }, index) => {
          const expanded = expandedItems.has(question)
          const itemId = FAQ_ITEMS.findIndex((item) => item.question === question)
          const questionId = `faq-question-${itemId}`
          const answerId = `faq-answer-${itemId}`

          return (
            <article className={`overflow-hidden rounded-[16px] bg-[#151515] transition-[background-color,box-shadow] duration-200 ${expanded ? 'bg-[#1c1c1c] shadow-[0_12px_34px_rgb(0_0_0/.26),inset_0_1px_0_rgb(255_255_255/.05)]' : 'hover:bg-[#191919] hover:shadow-[0_6px_22px_rgb(0_0_0/.16)]'}`} key={question}>
              <h3 className="m-0">
                <button
                  aria-controls={answerId}
                  aria-expanded={expanded}
                  className="flex min-h-[68px] w-full items-center gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgb(255_255_255/.75)] max-[600px]:min-h-[62px] max-[600px]:gap-3 max-[600px]:px-4 max-[600px]:py-3"
                  id={questionId}
                  onClick={() => toggleItem(question)}
                  type="button"
                >
                  <span aria-hidden="true" className={`w-7 shrink-0 font-mono text-[12px] tabular-nums transition-colors ${expanded ? 'text-[#f2f2f2]' : 'text-[#777777]'}`}>{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-[15px] font-medium leading-[1.45] text-[#f2f2f2] max-[600px]:text-[14px]">{question}</span>
                  <span className="shrink-0 text-[11px] text-[#858585] max-[600px]:hidden">{category}</span>
                  <span aria-hidden="true" className={`relative h-[17px] w-[17px] shrink-0 text-[#cccccc] transition-transform duration-200 ${expanded ? 'rotate-45' : ''}`}>
                    <svg className="h-full w-full" viewBox="0 0 20 20" fill="none"><path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                </button>
              </h3>
              <div aria-hidden={!expanded} aria-labelledby={questionId} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} id={answerId} role="region">
                <div className="min-h-0 overflow-hidden">
                  <div className="grid grid-cols-[28px_1fr] gap-4 px-5 pb-5 max-[600px]:grid-cols-[24px_1fr] max-[600px]:gap-3 max-[600px]:px-4 max-[600px]:pb-4">
                    <span aria-hidden="true" />
                    <p className="m-0 max-w-[660px] pr-8 text-[14px] leading-[1.75] text-[#a0a0a0] max-[600px]:pr-1 max-[600px]:text-[13px]">{answer}</p>
                  </div>
                </div>
              </div>
            </article>
          )
        }) : (
          <div className="rounded-[16px] bg-[#151515] px-5 py-9 text-center">
            <p className="m-0 text-[15px] font-medium text-[#f2f2f2]">No matching questions</p>
            <p className="mb-0 mt-2 text-[14px] text-[#a0a0a0]">Try a different search or category, or clear your filters.</p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 flex max-w-[760px] flex-wrap items-center justify-between gap-5 rounded-[16px] bg-[#151515] px-6 py-5 max-[600px]:mt-6 max-[600px]:px-4 max-[600px]:py-4">
        <div>
          <p className="m-0 text-[15px] font-medium text-[#f2f2f2]">Still have questions?</p>
          <p className="mb-0 mt-1.5 text-[14px] text-[#a0a0a0]">We’re here to help.</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#f2f2f2] px-5 text-[13px] font-semibold text-[#111111] no-underline transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eeeeee]" href="/support">Contact support</Link>
      </div>
    </section>
  )
}
