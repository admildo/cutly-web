// Shared building blocks for the signed-in account pages. Flat panels, hairline borders, one type scale.

export const card = 'rounded-xl border border-app-line bg-app-panel'

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80'
const buttonBase = `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium no-underline transition-colors disabled:cursor-wait disabled:opacity-50 ${focus}`

export const button = {
  primary: `${buttonBase} h-10 bg-app-ink px-4 text-[#0c0c0e] hover:bg-white`,
  secondary: `${buttonBase} h-10 border border-app-line bg-app-raised px-4 text-app-ink hover:border-[#38383e] hover:bg-[#212125]`,
  small: `${buttonBase} h-8 border border-app-line bg-app-raised px-3 text-[13px] text-app-ink hover:border-[#38383e] hover:bg-[#212125]`,
  quiet: `${buttonBase} h-8 px-2.5 text-[13px] text-app-mute hover:bg-white/[.06] hover:text-app-ink`
}

export const field = 'h-10 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm text-app-ink outline-none transition-colors placeholder:text-app-faint hover:border-[#38383e] focus-visible:border-app-mute focus-visible:ring-2 focus-visible:ring-white/15'
export const textarea = 'w-full resize-y rounded-lg border border-app-line bg-app-bg px-3 py-2.5 text-sm leading-6 text-app-ink outline-none transition-colors placeholder:text-app-faint hover:border-[#38383e] focus-visible:border-app-mute focus-visible:ring-2 focus-visible:ring-white/15'
export const fieldLabel = 'grid gap-1.5 text-[13px] font-medium text-app-ink'

const dots = { ok: 'bg-app-ok', warn: 'bg-app-warn', danger: 'bg-app-danger', neutral: 'bg-app-faint' }

export function Status({ tone = 'neutral', children }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-app-ink">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[tone] || dots.neutral}`} />
      {children}
    </span>
  )
}

export function CardHeader({ id, title, description, status, action }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pt-5 sm:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id={id} className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-app-ink">{title}</h2>
          {status}
        </div>
        {description ? <p className="m-0 mt-1.5 max-w-xl text-sm leading-6 text-app-mute">{description}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function Rows({ children, className = '' }) {
  return <dl className={`m-0 divide-y divide-app-line ${className}`}>{children}</dl>
}

export function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 text-sm">
      <dt className="text-app-mute">{label}</dt>
      <dd className="m-0 min-w-0 text-right font-medium text-app-ink">{children}</dd>
    </div>
  )
}

export function Note({ title, children }) {
  return (
    <div className="border-t border-app-line px-5 py-4 sm:px-6">
      {title ? <p className="m-0 text-[13px] font-medium text-app-ink">{title}</p> : null}
      <p className={`m-0 text-[13px] leading-5 text-app-mute ${title ? 'mt-1' : ''}`}>{children}</p>
    </div>
  )
}
