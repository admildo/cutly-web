export function AccountAvatar({ firstName = '', lastName = '', email = '', className = 'size-9 text-xs' }) {
  const first = Array.from(String(firstName).trim())[0] || ''
  const last = Array.from(String(lastName).trim())[0] || ''
  const emailName = String(email).split('@')[0].trim()
  const emailInitials = Array.from(emailName.replace(/[._+-]+/g, '') || emailName).slice(0, 2).join('')
  const initials = (first && last ? `${first}${last}` : first ? `${first}${Array.from(String(firstName).trim())[1] || ''}` : emailInitials || 'U').toLocaleUpperCase()

  return (
    <span
      role="img"
      aria-label={email ? `Account avatar for ${email}` : `Account avatar ${initials}`}
      className={`grid shrink-0 place-items-center rounded-full border border-app-line bg-app-raised font-semibold text-app-ink ${className}`}
    >
      {initials}
    </span>
  )
}
