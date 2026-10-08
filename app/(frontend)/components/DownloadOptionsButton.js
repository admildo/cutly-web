'use client'

import { useEffect, useId, useRef, useState } from 'react'

const platforms = [
  { name: 'Windows', detail: 'Coming soon' },
  { name: 'Linux', detail: 'Coming soon' }
]

export function DownloadOptionsButton({ intelUrl, siliconUrl, className, children, onClick, onDismiss, tabIndex }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArchitecture, setSelectedArchitecture] = useState('silicon')
  const dialogRef = useRef(null)
  const dialogId = useId()
  const selectedUrl = selectedArchitecture === 'silicon' ? siliconUrl : intelUrl
  const selectedLabel = selectedArchitecture === 'silicon' ? 'Apple silicon' : 'Intel Mac'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const closeDialog = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        className={className}
        tabIndex={tabIndex}
        onClick={(event) => {
          onClick?.(event)
          setIsOpen(true)
        }}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-description`}
        className="m-auto w-[min(540px,calc(100vw-32px))] max-w-none overflow-hidden rounded-[28px] border border-white/10 bg-[#101114] p-0 text-[#f5f5f6] shadow-[0_40px_120px_rgb(0_0_0/.72)] backdrop:bg-black/80 backdrop:backdrop-blur-md"
        onClose={() => {
          closeDialog()
          onDismiss?.()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog()
        }}
      >
        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            aria-label="Close download options"
            onClick={closeDialog}
            className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.04] text-white/65 transition hover:bg-white/[.1] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.7]"><path strokeLinecap="round" d="m4 4 12 12M16 4 4 16" /></svg>
          </button>
          <p className="relative mb-0 text-[11px] font-semibold uppercase tracking-[.18em] text-[#c7c7cb]">Deyn Studio Desktop</p>
          <h2 id={`${dialogId}-title`} className="relative mb-0 mt-3 pr-10 text-[32px] font-medium leading-[1.05] tracking-[-.055em]">Choose your Mac</h2>
          <p id={`${dialogId}-description`} className="relative mb-0 mt-3 max-w-[390px] text-[14px] leading-6 text-[#a5a6ab]">Select the version that matches your Mac. Windows and Linux versions are coming soon.</p>

          <div aria-label="Choose Mac processor" className="relative mt-7 grid gap-3" role="group">
            <DownloadOption selected={selectedArchitecture === 'silicon'} onSelect={() => setSelectedArchitecture('silicon')} title="Mac with Apple silicon" subtitle="M1, M2, M3, M4 and newer" badge="Most newer Macs" icon="silicon" />
            <DownloadOption selected={selectedArchitecture === 'intel'} onSelect={() => setSelectedArchitecture('intel')} title="Mac with Intel" subtitle="For Macs with an Intel processor" icon="intel" />
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3">
            {platforms.map(({ name, detail }) => (
              <div key={name} className="flex min-h-[62px] items-center justify-between gap-2 rounded-[14px] border border-white/[.07] bg-[#17181c] px-4">
                <span className="text-[13px] font-medium text-[#c5c5ca]/75">{name}</span>
                <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[10px] font-medium text-[#a5a6ab]">{detail}</span>
              </div>
            ))}
          </div>
          {selectedUrl ? (
            <div className="relative mt-6">
              <a href={selectedUrl} className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#f2f2ee] px-5 text-[14px] font-semibold text-[#111216] no-underline shadow-[0_8px_24px_rgb(0_0_0/.22)] transition-[transform,background-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[#faf9f6] hover:shadow-[0_12px_30px_rgb(0_0_0/.3)] active:translate-y-0 active:scale-[.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
                Download for {selectedLabel}
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.7]"><path strokeLinecap="round" strokeLinejoin="round" d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 14.5v2h12v-2" /></svg>
              </a>
            </div>
          ) : null}
          <p className="relative mb-0 mt-5 text-center text-[11px] text-[#a5a6ab]">Not sure which one to choose? Open the Apple menu  and select <span className="text-[#e0e0e3]">About This Mac</span>.</p>
        </div>
      </dialog>
    </>
  )
}

function DownloadOption({ selected, onSelect, title, subtitle, badge, icon }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group flex min-h-[78px] w-full cursor-pointer items-center gap-3 rounded-[17px] border bg-[#f2f2ee] px-4 py-3 text-left shadow-[0_8px_24px_rgb(0_0_0/.16)] transition-[transform,background-color,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[#74757a] hover:bg-[#faf9f6] hover:shadow-[0_12px_30px_rgb(0_0_0/.24)] active:translate-y-0 active:scale-[.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white ${selected ? 'border-[#25262a] ring-1 ring-[#25262a]' : 'border-[#f2f2ee]'}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#e7e6e1] text-[#111216] transition-colors group-hover:bg-[#dfded8]">
        {icon === 'silicon' ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M16.7 12.5c0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2-1.4-2.4-1.4-1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6-1.1 0-2.2.7-2.7 1.7-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.4-.8 1.9-1.6.6-.9.9-1.8.9-1.8s-1.8-.7-1.8-2.9ZM15.1 7.4c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.9.9-.4.5-.7 1.1-.7 1.8.7.1 1.5-.3 2-.8Z" /></svg>
        ) : <span aria-hidden="true" className="text-[13px] font-semibold tracking-[-.08em]">Intel</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-semibold text-[#111318]">{title}</span>
          {badge ? <span className="rounded-full bg-[#e7e6e1] px-2 py-0.5 text-[9px] font-semibold text-[#55565b]">{badge}</span> : null}
        </span>
        <span className="mt-1 block text-[11px] text-[#62636a]">{subtitle}</span>
      </span>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${selected ? 'bg-[#17181c] text-white' : 'text-transparent group-hover:bg-[#f0f0f1]'}`}>
        {selected ? <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]"><path strokeLinecap="round" strokeLinejoin="round" d="m4 10 4 4 8-8" /></svg> : <span aria-hidden="true" className="h-[16px] w-[16px] rounded-full border border-[#b7b8bc] group-hover:border-[#77787e]" />}
      </span>
    </button>
  )
}
