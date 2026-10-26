import Link from 'next/link'
import { DownloadSimple, House, Key, SlidersHorizontal, UserCircle } from '@phosphor-icons/react/ssr'

const sections = [
  { href: '/dashboard', label: 'Overview', key: 'overview', Icon: House },
  { href: '/account', label: 'Account settings', key: 'settings', Icon: UserCircle }
]

export function AccountNavigation({ active, showTrialControls = false }) {
  const items = showTrialControls
    ? [
        ...sections,
        { href: '/account/trial-settings', label: 'Trial controls', key: 'trial', Icon: SlidersHorizontal },
        { href: '/account/licenses', label: 'Grant licenses', key: 'licenses', Icon: Key },
        { href: '/account/downloads', label: 'Downloads', key: 'downloads', Icon: DownloadSimple }
      ]
    : sections

  return (
    <nav aria-label="Account navigation" className="mt-5 overflow-x-auto rounded-2xl bg-[#111216] p-1.5 shadow-[0_10px_28px_rgb(0_0_0/.16)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex min-w-max list-none gap-1 p-0">
        {items.map(({ href, label, key, Icon }) => {
          const selected = active === key
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={selected ? 'page' : undefined}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selected ? 'bg-[#222328] text-[#f2f2ee] shadow-[0_4px_14px_rgb(0_0_0/.2)]' : 'text-[#929399] hover:bg-white/[.04] hover:text-[#e3e3e5]'}`}
              >
                <Icon aria-hidden="true" className="h-[17px] w-[17px]" weight={selected ? 'fill' : 'regular'} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
