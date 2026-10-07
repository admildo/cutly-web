import { OAuthCallback } from '../components/OAuthCallback'
import { normalizeInternalReturnPath } from '@/lib/auth-redirect'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Connecting your account', robots: { index: false, follow: false } }

export default async function OAuthCallbackPage({ searchParams }) {
  const params = await searchParams
  const returnTo = normalizeInternalReturnPath(params?.returnTo || '/dashboard')
  return <OAuthCallback returnTo={returnTo} />
}
