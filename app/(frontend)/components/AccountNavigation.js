import Link from 'next/link'
import { DownloadSimple, House, Key, SlidersHorizontal, UserCircle, UsersThree } from '@phosphor-icons/react/ssr'

const account = [
  { href: '/dashboard', label: 'Overview', key: 'overview', Icon: House },
  { href: '/account', label: 'Settings', key: 'settings', Icon: UserCircle }
]

const admin = [
  { href: '/account/trial-settings', label: 'Trial controls', key: 'trial', Icon: SlidersHorizontal },
  { href: '/account/licenses', label: 'Licenses', key: 'licenses', Icon: Key },
  { href: '/account/creators', label: 'Creators', key: 'creators', Icon: UsersThree },
  { href: '/account/downloads', label: 'Downloads', key: 'downloads', Icon: DownloadSimple }
]

function NavLink({ href, label, Icon, selected }) {
  return (
    <Link
      href={href}
      aria-current={selected ? 'page' : undefined}
      className={`flex h-9 items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${selected ? 'bg-white/[.07] text-app-ink' : 'text-app-mute hover:bg-white/[.04] hover:text-app-ink'}`}
    >
      <Icon aria-hidden="true" className="size-[18px]" weight={selected ? 'fill' : 'regular'} />
      {label}
    </Link>
  )
}

// One list, laid out as a sidebar on large screens and a scrolling tab strip on small ones.
export function AccountNavigation({ active, showTrialControls = false }) {
  const groups = showTrialControls ? [{ items: account }, { label: 'Admin', items: admin }] : [{ items: account }]

  return (
    <nav aria-label="Account navigation" className="overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:overflow-visible lg:px-3 lg:pb-0 [&::-webkit-scrollbar]:hidden">
      <ul className="m-0 flex list-none items-center gap-1 p-0 lg:flex-col lg:items-stretch lg:gap-0.5">
        {groups.map(({ label, items }, index) => (
          <li key={label || 'account'} className={`contents ${index ? 'lg:mt-6 lg:block' : ''}`}>
            {label ? <p className="m-0 hidden px-2.5 pb-1.5 text-xs font-medium text-app-faint lg:block">{label}</p> : null}
            <ul className="m-0 flex list-none gap-1 p-0 lg:flex-col lg:gap-0.5">
              {items.map(({ key, ...item }) => (
                <li key={key}><NavLink {...item} selected={active === key} /></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
