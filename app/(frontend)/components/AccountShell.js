import Link from 'next/link'
import { AccountAvatar } from './AccountAvatar'
import { AccountMenu } from './AccountMenu'
import { AccountNavigation } from './AccountNavigation'

export const accountProfile = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  email: user?.primaryEmailAddress?.emailAddress || ''
})

const displayName = ({ firstName, lastName, email }) => [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0] || 'Your account'

function Brand() {
  return <Link href="/" className="text-[13px] font-semibold tracking-[0.2em] text-app-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80">DEYN STUDIO</Link>
}

// Sidebar on large screens, a compact top bar with tabs on small ones.
export function AccountShell({ active, profile, isAdmin = false, title, description, width = 'max-w-3xl', children }) {
  const name = displayName(profile)

  return (
    <div className="min-h-screen bg-app-bg text-app-ink [color-scheme:dark] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-app-line bg-app-side lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-4 lg:px-5 lg:pb-8 lg:pt-6">
          <Brand />
          <div className="flex items-center gap-1 lg:hidden">
            <AccountMenu />
            <AccountAvatar firstName={profile.firstName} lastName={profile.lastName} email={profile.email} className="size-8 text-[11px]" />
          </div>
        </div>
        <AccountNavigation active={active} showTrialControls={isAdmin} />
        <div className="mt-auto hidden border-t border-app-line p-3 lg:block">
          <div className="flex items-center gap-3 px-2 py-2">
            <AccountAvatar firstName={profile.firstName} lastName={profile.lastName} email={profile.email} />
            <div className="min-w-0">
              <p className="m-0 truncate text-[13px] font-medium text-app-ink">{name}</p>
              {profile.email ? <p className="m-0 truncate text-xs text-app-faint">{profile.email}</p> : null}
            </div>
          </div>
          <AccountMenu className="w-full !justify-start" />
        </div>
      </aside>

      <div className="min-w-0 px-5 py-8 sm:px-10 lg:px-12 lg:py-12">
        <div className={width}>
          <header className="mb-8">
            <h1 className="m-0 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-app-ink">{title}</h1>
            {description ? <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-app-mute">{description}</p> : null}
          </header>
          <main>{children}</main>
          <footer className="mt-16 flex flex-wrap gap-x-5 gap-y-2 border-t border-app-line pt-6 text-xs text-app-faint">
            <span>© {new Date().getFullYear()} Deyn Studio</span>
            <Link href="/support" className="hover:text-app-ink">Support</Link>
            <Link href="/privacy" className="hover:text-app-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-app-ink">Terms</Link>
          </footer>
        </div>
      </div>
    </div>
  )
}
