'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const FAQ_ITEMS = [
  {
    category: 'Product',
    question: 'What is Deyn Studio?',
    answer: 'Deyn Studio is a desktop media editing and automation workspace. It includes assistant-guided editing, video workflows, audio and image tools, and document utilities.'
  },
  {
    category: 'Product',
    question: 'How does Media Assistant work?',
    answer: 'Describe an editing task for selected files. Media Assistant proposes supported steps for you to review, adjust, remove, and run. You can save plans and reuse compatible operations across multiple files.'
  },
  {
    category: 'AI & Processing',
    question: 'Does the assistant watch or listen to my media automatically?',
    answer: 'No. It plans supported edits from your request and selected files. Content analysis happens in specific workflows, such as transcription and clip discovery.'
  },
  {
    category: 'AI & Processing',
    question: 'Is processing local or cloud-based?',
    answer: 'It depends on the feature. Bundled Whisper transcription runs locally on your device. Cloud transcription and supported AI features can use OpenRouter and incur provider usage charges. Background removal is processed locally, with a review step.'
  },
  {
    category: 'AI & Processing',
    question: 'What does the AI trial include?',
    answer: 'The app provides a limited sponsored trial for features such as clip generation, Smart Clean, and caption translation. Trial uses are metered in the app; availability and remaining uses can vary.'
  },
  {
    category: 'Pricing & License',
    question: 'Are AI provider costs included in the lifetime license?',
    answer: 'No. The one-time license covers Deyn Studio and future desktop updates. After the sponsored trial, supported AI features can use your own OpenRouter API key and selected model. The provider bills that usage separately.'
  },
  {
    category: 'Pricing & License',
    question: 'What does the lifetime license include?',
    answer: 'The current launch offer is €39 as a one-time payment for a lifetime license, future desktop updates, and use on up to two devices.'
  },
  {
    category: 'Compatibility',
    question: 'Which computers can run Deyn Studio?',
    answer: 'Deyn Studio supports macOS, Windows, and Linux.'
  },
  {
    category: 'AI & Processing',
    question: 'Can I use it without cloud transcription?',
    answer: 'Yes. Bundled Whisper transcription runs on your device without a per-use provider fee. Cloud transcription through OpenRouter is optional.'
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

  const toggleItem = (question) => {
    setExpandedItems((current) => {
      const next = new Set(current)
      if (next.has(question)) next.delete(question)
      else next.add(question)
      return next
    })
  }

  return (
    <section className="scroll-mt-[24px] w-full border-y border-[#807e7e]/20 bg-transparent px-6 py-[clamp(88px,8vw,112px)] text-[#f2f0ef] max-[700px]:py-[clamp(64px,10vw,72px)] max-[600px]:px-3" id="faq">
      <div className="mx-auto max-w-[660px] text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#807e7e]/30 bg-[#242322] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#cccbca]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#a6a4a4]" />
          FAQ
        </span>
        <h2 className="mb-0 mt-4 text-[clamp(30px,3.4vw,40px)] font-medium leading-[1.02] tracking-[-.06em] text-[#f2f0ef] max-[600px]:text-[28px]">Frequently asked questions</h2>
        <p className="mx-auto mb-0 mt-3 max-w-[480px] text-[13px] leading-[1.6] text-[#a6a4a4]">Everything you need to know about Deyn Studio.</p>

        <div className="relative mx-auto mt-6 max-w-[480px]">
          <svg aria-hidden="true" className="pointer-events-none absolute left-[17px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#a6a4a4]" viewBox="0 0 20 20" fill="none">
            <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <label className="sr-only" htmlFor="faq-search">Search questions</label>
          <input
            className="h-10 w-full rounded-[10px] border border-[#807e7e]/35 bg-[#171716] pl-[40px] pr-3 text-[12px] text-[#f2f0ef] outline-none transition-[border-color,box-shadow] placeholder:text-[#807e7e] hover:border-[#a6a4a4] focus:border-[#807e7e]/35 focus:shadow-[0_0_0_3px_rgb(204_203_202/.12)]"
            id="faq-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions…"
            type="search"
            value={query}
          />
        </div>

        <div aria-label="Filter questions by category" className="mt-3.5 flex justify-center gap-1.5 overflow-x-auto pb-1 max-[600px]:justify-start" role="group">
          {CATEGORIES.map((category) => {
            const selected = activeCategory === category
            return (
              <button
                aria-pressed={selected}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cccbca] ${selected ? 'border-[#f2f0ef] bg-[#f2f0ef] text-[#171716]' : 'border-[#807e7e]/35 bg-[#171716] text-[#a6a4a4] hover:border-[#cccbca] hover:text-[#f2f0ef]'}`}
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

      <p aria-atomic="true" aria-live="polite" className="sr-only">{visibleItems.length} {visibleItems.length === 1 ? 'question' : 'questions'} found.</p>
      <div className="mx-auto mt-6 grid max-w-[680px] gap-2 max-[600px]:mt-5">
        {visibleItems.length ? visibleItems.map(({ question, answer }, index) => {
          const expanded = expandedItems.has(question)
          const itemId = FAQ_ITEMS.findIndex((item) => item.question === question)
          const questionId = `faq-question-${itemId}`
          const answerId = `faq-answer-${itemId}`

          return (
            <article className={`overflow-hidden rounded-[12px] border border-[#807e7e]/25 bg-[#171716] transition-[background-color,box-shadow] duration-200 ${expanded ? 'bg-[#242322] shadow-[0_10px_30px_rgb(0_0_0/.3),inset_0_1px_0_rgb(242_240_239/.06)]' : 'hover:bg-[#1d1d1b] hover:shadow-[0_4px_18px_rgb(0_0_0/.16)]'}`} key={question}>
              <h3 className="m-0">
                <button
                  aria-controls={answerId}
                  aria-expanded={expanded}
                  className="flex min-h-[46px] w-full items-center gap-2.5 px-3.5 py-2 text-left focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgb(204_203_202/.8)] max-[600px]:min-h-[44px] max-[600px]:gap-2 max-[600px]:px-3 max-[600px]:py-1.5"
                  id={questionId}
                  onClick={() => toggleItem(question)}
                  type="button"
                >
                  <span aria-hidden="true" className={`w-6 shrink-0 font-mono text-[11px] tabular-nums transition-colors ${expanded ? 'text-[#cccbca]' : 'text-[#807e7e]'}`}>{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-[13px] font-medium leading-[1.4] text-[#f2f0ef] max-[600px]:text-[12px]">{question}</span>
                  <span aria-hidden="true" className={`relative h-[15px] w-[15px] shrink-0 text-[#cccbca] transition-transform duration-200 ${expanded ? 'rotate-45' : ''}`}>
                    <svg className="h-full w-full" viewBox="0 0 20 20" fill="none"><path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                </button>
              </h3>
              <div aria-hidden={!expanded} aria-labelledby={questionId} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} id={answerId} role="region">
                <div className="min-h-0 overflow-hidden">
                  <div className="grid grid-cols-[20px_1fr] gap-2.5 px-3.5 pb-3 max-[600px]:grid-cols-[18px_1fr] max-[600px]:gap-2 max-[600px]:px-3 max-[600px]:pb-2.5">
                    <span aria-hidden="true" />
                    <p className="m-0 max-w-[620px] pr-6 text-[12px] leading-[1.6] text-[#a6a4a4] max-[600px]:pr-2 max-[600px]:text-[11px]">{answer}</p>
                  </div>
                </div>
              </div>
            </article>
          )
        }) : (
          <div className="rounded-[12px] border border-dashed border-[#807e7e]/40 bg-[#171716] px-4 py-7 text-center">
            <p className="m-0 text-[13px] font-medium text-[#f2f0ef]">No matching questions</p>
            <p className="mb-0 mt-2 text-[12px] text-[#a6a4a4]">Try another search or choose a different category.</p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 flex max-w-[680px] flex-wrap items-center justify-between gap-3 rounded-[11px] border border-[#807e7e]/35 bg-[#242322] px-3.5 py-2.5 max-[600px]:mt-5 max-[600px]:px-3">
        <div>
          <p className="m-0 text-[13px] font-medium text-[#f2f0ef]">Still have questions?</p>
          <p className="mb-0 mt-1 text-[12px] text-[#a6a4a4]">We’re here to help.</p>
        </div>
        <Link className="inline-flex min-h-9 items-center justify-center rounded-[8px] border border-[#807e7e]/45 bg-[#171716] px-3.5 text-[12px] font-medium text-[#f2f0ef] no-underline transition-colors hover:border-[#a6a4a4] hover:bg-[#242322] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cccbca]" href="/support">Contact Support <span aria-hidden="true" className="ml-1.5">→</span></Link>
      </div>
    </section>
  )
}
