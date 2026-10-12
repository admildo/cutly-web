export function AccountAvatar({ firstName = '', lastName = '', email = '' }) {
  const first = Array.from(String(firstName).trim())[0] || ''
  const last = Array.from(String(lastName).trim())[0] || ''
  const emailName = String(email).split('@')[0].trim()
  const emailInitials = Array.from(emailName.replace(/[._+-]+/g, '') || emailName).slice(0, 2).join('')
  const initials = (first && last ? `${first}${last}` : first ? `${first}${Array.from(String(firstName).trim())[1] || ''}` : emailInitials || 'U').toLocaleUpperCase()

  return (
    <span
      role="img"
      aria-label={email ? `Account avatar for ${email}` : `Account avatar ${initials}`}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25262b] text-xs font-semibold tracking-[0.02em] text-[#f2f2ee] shadow-[0_5px_16px_rgb(0_0_0/.22),inset_0_1px_0_rgb(255_255_255/.06)]"
    >
      {initials}
    </span>
  )
}
