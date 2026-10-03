'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const stories = [
  {
    number: '01',
    title: 'Start with the whole recording',
    description: 'Bring in a video or link, then choose Auto shorts, search for a moment, or set the cut yourself.',
    image: '/app-shots/cutly-home-video.png',
    width: 2940,
    height: 1846,
    alt: 'Cutly home screen with a video ready and saved clip sets'
  },
  {
    number: '02',
    title: 'See every strong moment at once',
    description: 'Cutly turns the recording into a visual set of clips, with timing and titles ready for the next pass.',
    image: '/app-shots/cutly-clips-grid.png',
    width: 2936,
    height: 1836,
    alt: 'A grid of clips generated from a video in Cutly'
  },
  {
    number: '03',
    title: 'Finish the clip in one workspace',
    description: 'Edit the transcript, frame the subject, style captions, and export without rebuilding the work elsewhere.',
    image: '/app-shots/cutly-editor.png',
    width: 2940,
    height: 1844,
    alt: 'Cutly editor with transcript, portrait preview, and caption controls'
  }
]

export function ProductStory() {
  const [active, setActive] = useState(0)
  const panelRefs = useRef([])
  const mobilePanelRefs = useRef([])

  useEffect(() => {
    let frame
    const updateActiveStory = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const focusY = window.innerHeight / 2
        let nearestIndex = 0
        let nearestDistance = Infinity

        const panels = window.innerWidth <= 700 ? mobilePanelRefs.current : panelRefs.current
        panels.forEach((node, index) => {
          if (!node) return
          const rect = node.getBoundingClientRect()
          const distance = Math.abs(rect.top + rect.height / 2 - focusY)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = index
          }
        })

        setActive(nearestIndex)
      })
    }

    updateActiveStory()
    window.addEventListener('scroll', updateActiveStory, { passive: true })
    window.addEventListener('resize', updateActiveStory)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateActiveStory)
      window.removeEventListener('resize', updateActiveStory)
    }
  }, [])

  const showStory = (index) => {
    setActive(index)
    const panels = window.innerWidth <= 700 ? mobilePanelRefs.current : panelRefs.current
    panels[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section className="relative scroll-mt-[24px] overflow-visible bg-[#080808] px-[clamp(24px,3.2vw,64px)] pt-[78px] pb-[78px] max-[900px]:px-6 max-[900px]:pt-[68px] max-[900px]:pb-[72px] max-[600px]:px-3 max-[600px]:pt-[52px] max-[600px]:pb-[58px]" id="features">
      <h2 className="mx-auto mb-[54px] max-w-[760px] text-center font-serif text-[52px] font-normal leading-[.98] tracking-[-.055em] text-[#f0efe9] max-[900px]:mb-[58px] max-[900px]:text-[clamp(40px,4.05vw,60px)] max-[600px]:mb-[38px] max-[600px]:text-[clamp(36px,8vw,46px)] max-[600px]:tracking-[-.05em]">
        Cutly reads between<br />the frames
      </h2>
      <div className="mx-auto grid w-full max-w-[1840px] grid-cols-[30%_70%] items-start max-[700px]:hidden max-[900px]:grid-cols-1 max-[900px]:gap-7">
        <nav aria-label="Product features" className="sticky top-[15vh] flex flex-col justify-center gap-8 px-8 max-[900px]:static max-[900px]:gap-2 max-[900px]:px-3">
          {stories.map((item, index) => (
            <button
              data-story={index}
              type="button"
              aria-pressed={active === index}
              aria-controls={`cutly-story-panel-${index}`}
              data-active={active === index}
              className="group relative grid w-full shrink-0 grid-cols-[38px_minmax(0,1fr)] gap-x-2 rounded-sm py-4 text-left text-[#8c93a2] transition-colors duration-500 ease-[cubic-bezier(.2,.75,.25,1)] before:absolute before:left-[-1px] before:top-1/2 before:h-9 before:w-px before:-translate-y-1/2 before:origin-center before:scale-y-0 before:bg-[#f0efe9] before:transition-transform before:duration-500 before:ease-[cubic-bezier(.2,.75,.25,1)] before:content-[''] data-[active=true]:text-[#f0efe9] data-[active=true]:before:scale-y-100 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0efe9] max-[900px]:grid-cols-[28px_minmax(0,1fr)] max-[900px]:py-3 max-[900px]:before:left-0 max-[900px]:before:h-7 max-[600px]:gap-x-2"
              key={item.number}
              onClick={() => showStory(index)}
            >
              <span className="row-span-2 pt-1.5 text-[11px] tracking-[.1em]">{item.number}</span>
              <strong className="max-w-[440px] font-sans text-[clamp(20px,1.6vw,27px)] font-medium leading-[1.15] tracking-[-.035em] max-[900px]:text-lg max-[600px]:text-[17px]">{item.title}</strong>
              <span className="col-start-2 grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out group-data-[active=true]:mt-2 group-data-[active=true]:opacity-100">
                <span className="max-h-0 max-w-[430px] overflow-hidden text-sm leading-[1.65] text-[#a2a2a0] opacity-0 transition-[max-height,opacity] duration-500 ease-in-out group-data-[active=true]:max-h-[100px] group-data-[active=true]:opacity-100">{item.description}</span>
              </span>
            </button>
          ))}
        </nav>

        <div
          className="relative flex flex-col gap-10 max-[900px]:gap-5"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
          }}
        >
          {stories.map((item, index) => (
            <div ref={(node) => { panelRefs.current[index] = node }} id={`cutly-story-panel-${index}`} data-active={active === index} className="group relative h-[60svh] min-h-[400px] max-h-[620px] scroll-mt-[17vh] overflow-hidden max-[900px]:h-[min(48svh,420px)] max-[900px]:min-h-[280px] max-[600px]:h-[min(46svh,380px)] max-[600px]:min-h-[250px]" aria-label={item.alt} key={item.number}>
              <Image className="h-full w-full object-contain" src={item.image} width={item.width} height={item.height} alt={item.alt} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto hidden w-full max-w-[620px] grid-cols-1 max-[700px]:grid">
        <div className="sticky top-20 z-10 col-start-1 row-start-1 flex h-[calc(100svh-112px)] min-h-[480px] flex-col self-start">
          <div className="shrink-0 pb-5 pt-2">
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] tracking-[.12em] text-[#8d98ad]">{stories[active].number}</span>
              <h3 className="m-0 text-[22px] font-medium leading-[1.12] tracking-[-.04em] text-[#f0efe9]">{stories[active].title}</h3>
            </div>
            <p className="mb-0 ml-7 mt-3 max-w-[540px] text-[14px] leading-[1.65] text-[#a2a2a0]">{stories[active].description}</p>
          </div>

          <div className="relative min-h-0 flex-1">
            {stories.map((item, index) => (
              <div
                className={`absolute inset-0 grid place-items-center transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${active === index ? 'translate-y-0 scale-100 opacity-100 blur-0' : 'translate-y-4 scale-[.98] opacity-0 blur-sm'}`}
                aria-hidden={active !== index}
                key={item.number}
              >
                <Image className="max-h-full max-w-full object-contain" src={item.image} width={item.width} height={item.height} alt={active === index ? item.alt : ''} priority={index === 0} />
              </div>
            ))}
          </div>

          <nav aria-label="Choose a product feature" className="mt-5 grid shrink-0 grid-cols-3 gap-3 pb-2">
            {stories.map((item, index) => (
              <button
                type="button"
                aria-label={`Show feature ${item.number}: ${item.title}`}
                aria-pressed={active === index}
                onClick={() => showStory(index)}
                className="group flex min-h-10 flex-col justify-center gap-2 rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0efe9]"
                key={item.number}
              >
                <span className={`h-[2px] w-full rounded-full transition-colors duration-300 ${active === index ? 'bg-[#f0efe9]' : 'bg-white/40 group-hover:bg-white/60'}`} />
                <span className={`text-[10px] tracking-[.12em] transition-colors duration-300 ${active === index ? 'text-[#f0efe9]' : 'text-[#9ba2b0]'}`}>{item.number}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="col-start-1 row-start-1 grid grid-rows-[repeat(3,75svh)]" aria-hidden="true">
          {stories.map((item, index) => (
            <div ref={(node) => { mobilePanelRefs.current[index] = node }} key={item.number} />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-b from-transparent via-[#0d0d0d]/65 to-[#0d0d0d] max-[600px]:h-[80px]" aria-hidden="true" />
    </section>
  )
}
